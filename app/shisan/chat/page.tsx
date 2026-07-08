"use client";

/**
 * /shisan/chat：伴走AIチャット（Phase1 要件§4-1）
 * - LINE型の会話UI・スマホ375px基準・免責フッター常時表示
 * - 未ログイン：メール入力→ログインリンク送信の案内
 * - 初回：AIから先に挨拶（守備範囲の明示）
 * - 各応答に「役に立った／立たなかった」フィードバック
 */

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/shisan/track";
import { flowGreeting } from "@/lib/shisan/flow";
import { BUCKET_LABEL, type BucketId } from "@/lib/shisan/calc";
import { LoginPanel } from "../LoginPanel";

interface PlanProposalView { actionId: string; goal: string; nextStep: string; monthlyYen: number | null; }
interface PlanPrevious { goal: string; nextStep: string; monthlyYen: number | null; }
interface ReallocRow { key: string; label: string; beforeYen: string; afterYen: string; changed: boolean; }
interface ReallocView { target: string; targetLabel: string; monthlyYen: number; source: string | null; poolYen: string; rows: ReallocRow[]; }

interface ChatMsg {
  id: string | null;
  role: "user" | "assistant";
  content: string;
  feedback?: string | null;
}

/* AI主導の意思決定フロー（追加要件G） */
interface FlowQuestion { bucket: string; label: string; question: string; choices: string[]; }
interface FlowState {
  total: number;
  remaining: string[];
  next: FlowQuestion | null;
  decided: { id: string; label: string; choice: string }[];
}

const GREETING =
  "こんにちは。あなたの診断結果と決めた一手を把握しています。実行で迷ったこと、何でも聞いてください。\n\n家計の打ち手（固定費・借り換え・繰上げvs投資・教育費・備え・NISA・収入）の実行について相談できます。税務・法律の個別判断は専門家の領域です。";
// フロー系の挨拶（開始宣言・スキップ・再開・全問決定済み）は lib/shisan/flow.ts の flowGreeting で決定論的に生成

/* タスク導線（?topic=）からの決定論イントロ（修正4：リンク先のAIが文脈を受ける） */
const TOPIC_INTRO: Record<string, string> = {
  prepay: "繰り上げ返済と投資の比較ですね。あなたの数字で、それぞれの目安を並べてお見せします。迷っている点があれば教えてください。",
  nisa: "NISAの月額ですね。あなたの余力での目安をお見せします。気になっている点があれば教えてください。",
  liq: "もしもの備えですね。あなたの数字で目安をお見せします。気になる点があれば教えてください。",
  edu: "教育費ですね。あなたの数字で目安をお見せします。気になる点があれば教えてください。",
  refi: "借り換えですね。あなたの数字で試算をお見せします。気になる点があれば教えてください。",
};

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-600";

function ChatInner() {
  const params = useSearchParams();
  const [state, setState] = useState<"loading" | "login" | "chat">("loading");
  const [scenario, setScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [flow, setFlow] = useState<FlowState | null>(null);
  const [greeting, setGreeting] = useState(GREETING);
  const [answering, setAnswering] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null); // 本日の残り相談回数（修正4）
  const [limit, setLimit] = useState(20); // 1日の相談上限（修正6・運営者例外で変わる）
  const [proposal, setProposal] = useState<PlanProposalView | null>(null); // 記録提案（承認必須）
  const [previous, setPrevious] = useState<PlanPrevious | null>(null);     // 上書き提案時の変更前（修正B）
  const [planBusy, setPlanBusy] = useState(false);
  const [realloc, setRealloc] = useState<ReallocView | null>(null); // 配分変更の承認カード（修正1）
  const [reallocBusy, setReallocBusy] = useState(false);
  const chatOpened = useRef(false);
  const flowStarted = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/shisan/me").then((r) => r.json());
        if (!me.authenticated) { setState("login"); return; }
        setScenario(me.scenario ?? null);
        if (!chatOpened.current) {
          track("shisan_chat_open", { scenario: me.scenario ?? "" });
          chatOpened.current = true;
        }
        const [h, f] = await Promise.all([
          fetch("/api/shisan/chat").then((r) => r.json()),
          fetch("/api/shisan/flow").then((r) => r.json()).catch(() => null),
        ]);
        const history: ChatMsg[] = h.ok ? h.messages : [];
        setMessages(history);
        if (typeof h.remaining === "number") setRemaining(h.remaining);
        if (typeof h.limit === "number") setLimit(h.limit);
        if (f?.ok && f.total > 0) {
          // 挨拶は決定論的に出し分け（開始宣言／スキップ／再開／全問決定済み＝伴走モード）
          setGreeting(flowGreeting(f.total, f.remaining.length, history.length > 0));
          if (f.next) {
            setFlow({ total: f.total, remaining: f.remaining, next: f.next, decided: f.decided });
            if (!flowStarted.current) {
              track("shisan_ai_flow_start", { scenario: me.scenario ?? "" });
              flowStarted.current = true;
            }
          }
        }
        setState("chat");
      } catch {
        setState("login");
      }
    })();
  }, []);

  /* ボタン回答（要件G-2/G-4）：decisionsへ保存→AIのひと言→次の質問 */
  const answer = async (choice: string) => {
    if (!flow?.next || answering) return;
    const q = flow.next;
    const seq = flow.total - flow.remaining.length + 1;
    track("shisan_ai_question_answer", { action_id: q.bucket, seq });
    track("shisan_task_execute", { task_id: q.bucket, choice }); // 既存計測と整合（要件G-4）
    setMessages((m) => [...m, { id: null, role: "user", content: `${q.label}：${choice}` }]);
    setAnswering(true); setNotice("");
    try {
      const res = await fetch("/api/shisan/flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: q.bucket, choice }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setMessages((m) => [...m, { id: json.messageId, role: "assistant", content: json.comment }]);
        setFlow({ total: json.total, remaining: json.remaining, next: json.next, decided: json.decided });
        if (typeof json.remainingChats === "number") setRemaining(json.remainingChats);
        // localStorage側のdecisionsも更新（診断画面・マイページとの整合）
        try {
          const s = JSON.parse(localStorage.getItem("shisan_loan_mvp_v2") || "null");
          if (s) { s.decisions = { ...(s.decisions ?? {}), [q.bucket]: { choice } }; localStorage.setItem("shisan_loan_mvp_v2", JSON.stringify(s)); }
        } catch { /* no-op */ }
        if (json.complete) {
          setJustCompleted(true);
          track("shisan_ai_flow_complete", { scenario: scenario ?? "" });
          track("shisan_decision_complete", { buckets: json.total });
        }
      } else if (res.status === 401) {
        setState("login");
      } else {
        setNotice("記録に失敗しました。時間をおいてお試しください。");
        setMessages((m) => m.slice(0, -1)); // 楽観表示を戻す
      }
    } catch {
      setNotice("通信に失敗しました。時間をおいてお試しください。");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setAnswering(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (text.length > 2000) { setNotice("1回の送信は2,000文字までです。"); return; }
    setNotice("");
    setInput("");
    setMessages((m) => [...m, { id: null, role: "user", content: text }]);
    setSending(true);
    track("shisan_chat_message", { scenario: scenario ?? "" });
    try {
      const res = await fetch("/api/shisan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setMessages((m) => [...m, { id: json.messageId, role: "assistant", content: json.reply }]);
        if (typeof json.remaining === "number") setRemaining(json.remaining);
        if (typeof json.limit === "number") setLimit(json.limit);
        if (json.proposal) {
          setProposal(json.proposal);
          setPrevious(json.previous ?? null);
          track("shisan_plan_proposed", { action_id: json.proposal.actionId });
        }
        if (json.realloc) {
          if (json.realloc.error === "over_pool") {
            setNotice(`ご希望の金額は毎月の余力（¥${json.realloc.poolYen}）を超えるため設定できません。`);
          } else if (json.realloc.rows) {
            setRealloc(json.realloc as ReallocView);
            track("shisan_realloc_proposed", { target: json.realloc.target });
          }
        }
      } else if (res.status === 429) {
        setNotice(`本日の相談上限（${limit}往復）に達しました。明日またどうぞ。`);
      } else if (res.status === 401) {
        setState("login");
      } else {
        setNotice("応答に失敗しました。時間をおいてお試しください。");
      }
    } catch {
      setNotice("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setSending(false);
    }
  };

  /* 記録提案の承認／見送り（修正A：AIが勝手に記録することは絶対にない） */
  const savePlan = async () => {
    if (!proposal || planBusy) return;
    setPlanBusy(true);
    try {
      const res = await fetch("/api/shisan/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: proposal.actionId, goal: proposal.goal, nextStep: proposal.nextStep, monthlyYen: proposal.monthlyYen }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        track("shisan_plan_saved", { action_id: proposal.actionId });
        setMessages((m) => [...m, { id: null, role: "assistant", content: previous ? "マイページの方針を更新しました。" : "マイページに記録しました。「決めた一手」の欄からいつでも見返せます。" }]);
        setProposal(null); setPrevious(null);
      } else {
        setNotice("記録に失敗しました。時間をおいてお試しください。");
      }
    } catch {
      setNotice("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setPlanBusy(false);
    }
  };

  /* 配分変更の承認／見送り（修正1：サーバー再計算・複数バケツ保存） */
  const saveRealloc = async () => {
    if (!realloc || reallocBusy) return;
    setReallocBusy(true);
    try {
      const res = await fetch("/api/shisan/realloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: realloc.target, monthlyYen: realloc.monthlyYen, source: realloc.source }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        track("shisan_realloc_saved", { target: realloc.target });
        setMessages((m) => [...m, { id: null, role: "assistant", content: "配分を更新しました。マイページに反映されます。" }]);
        setRealloc(null);
      } else {
        setNotice("更新に失敗しました。時間をおいてお試しください。");
      }
    } catch {
      setNotice("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setReallocBusy(false);
    }
  };

  const giveFeedback = async (msg: ChatMsg, helpful: boolean) => {
    if (!msg.id) return;
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, feedback: helpful ? "helpful" : "not_helpful" } : x)));
    track("shisan_chat_feedback", { helpful });
    try {
      await fetch("/api/shisan/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msg.id, helpful }),
      });
    } catch { /* 表示は楽観更新のまま */ }
  };

  /* ===== 画面 ===== */
  if (state === "loading") {
    return <main className="max-w-2xl mx-auto px-4 pt-10 text-slate-400 text-sm">読み込み中…</main>;
  }

  if (state === "login") {
    return <LoginPanel loginError={params.get("login_error") === "1"} />;
  }

  return (
    <main className="max-w-2xl mx-auto flex flex-col text-slate-800" style={{ height: "calc(100dvh - 56px)" }}>
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="font-extrabold text-[16px]">AIに相談</div>
          <div className="text-[11px] text-slate-400">売り込みは一切ありません</div>
        </div>
        <div className="flex gap-3">
          <Link href="/shisan/mypage" className="text-[12px] text-emerald-700 underline">マイページへ</Link>
          <Link href="/shisan" className="text-[12px] text-emerald-700 underline">診断結果へ</Link>
        </div>
      </div>

      {/* 方針決めモードの進捗（修正2：画面レベルの常時表示） */}
      {flow?.next && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold text-emerald-800">方針決め {flow.total - flow.remaining.length}／{flow.total}</span>
            <span className="text-[10px] text-emerald-700/70">残り{flow.remaining.length}問</span>
          </div>
          <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${((flow.total - flow.remaining.length) / flow.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* メッセージ */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <Bubble role="assistant" content={greeting} />
        {params.get("topic") && TOPIC_INTRO[params.get("topic")!] && (
          <Bubble role="assistant" content={TOPIC_INTRO[params.get("topic")!]} />
        )}
        {messages.map((m, i) => (
          <div key={m.id ?? `i${i}`}>
            <Bubble role={m.role} content={m.content} />
            {m.role === "assistant" && m.id && (
              <div className="flex gap-2 mt-1 ml-1">
                {m.feedback ? (
                  <span className="text-[11px] text-slate-400">{m.feedback === "helpful" ? "役に立った ✓" : "フィードバックを記録しました"}</span>
                ) : (<>
                  <button type="button" className="text-[11px] text-slate-400 underline" onClick={() => giveFeedback(m, true)}>役に立った</button>
                  <button type="button" className="text-[11px] text-slate-400 underline" onClick={() => giveFeedback(m, false)}>立たなかった</button>
                </>)}
              </div>
            )}
          </div>
        ))}
        {sending && <div className="text-[12px] text-slate-400 ml-1">考えています…</div>}
        {answering && <div className="text-[12px] text-slate-400 ml-1">記録しています…</div>}

        {/* 質問進行（要件G）：現在の質問＋選択肢ボタン。自由質問の回答中は一時的に隠す */}
        {flow?.next && !answering && !sending && (
          <div>
            <Bubble role="assistant"
              content={`【質問 ${flow.total - flow.remaining.length + 1}／${flow.total}】${flow.next.label}\n\n${flow.next.question}`} />
            <div className="flex flex-wrap gap-2 mt-2 ml-1">
              {flow.next.choices.map((c) => (
                <button key={c} type="button" onClick={() => answer(c)}
                  className="px-3.5 py-2 rounded-full text-[13px] font-bold border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-600 hover:text-white transition">
                  {c}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 ml-1">ボタンで選べます。迷ったら、そのまま質問してもOKです。</div>
          </div>
        )}

        {/* 記録提案の承認カード（ユーザー承認必須。上書き時は変更前→後プレビュー＝修正B） */}
        {proposal && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5">
            <div className="text-[13px] font-bold text-emerald-900 mb-1.5">
              {previous ? "この方針に更新しますか？" : "この方針をマイページに記録しますか？"}
            </div>
            {previous && (
              <div className="text-[11px] text-slate-500 rounded-lg bg-white/70 px-2.5 py-1.5 mb-1.5 line-through decoration-slate-400">
                変更前｜目標：{previous.goal}／次の一歩：{previous.nextStep}{previous.monthlyYen ? `／毎月¥${previous.monthlyYen.toLocaleString("ja-JP")}` : ""}
              </div>
            )}
            <div className="text-[12px] text-slate-700 rounded-lg bg-white px-2.5 py-2 mb-2">
              <div className="font-bold">{BUCKET_LABEL[proposal.actionId as BucketId] ?? proposal.actionId}{previous ? "（変更後）" : ""}</div>
              <div>目標：{proposal.goal}</div>
              <div>次の一歩：{proposal.nextStep}</div>
              {proposal.monthlyYen != null && <div>毎月：¥{proposal.monthlyYen.toLocaleString("ja-JP")}</div>}
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={planBusy} onClick={savePlan}
                className="px-3.5 py-2 rounded-lg text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                {planBusy ? "記録中…" : "記録する"}
              </button>
              <button type="button" disabled={planBusy} onClick={() => { setProposal(null); setPrevious(null); }}
                className="px-3.5 py-2 rounded-lg text-[13px] font-bold bg-white border border-slate-300 text-slate-600">
                今はしない
              </button>
            </div>
          </div>
        )}

        {/* 配分変更の承認カード（修正1：変更前→変更後の配分表・全変化行・合計＝余力） */}
        {realloc && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5">
            <div className="text-[13px] font-bold text-emerald-900 mb-1.5">この配分に変更しますか？</div>
            <div className="rounded-lg bg-white px-3 py-2.5 mb-2">
              <table className="w-full text-[12px]">
                <tbody>
                  {realloc.rows.filter((r) => r.changed || r.afterYen !== "0").map((r) => (
                    <tr key={r.key} className={r.changed ? "font-bold text-emerald-800" : "text-slate-600"}>
                      <td className="py-0.5">{r.label}</td>
                      <td className="py-0.5 text-right text-slate-400">¥{r.beforeYen}</td>
                      <td className="py-0.5 px-1 text-center text-slate-300">→</td>
                      <td className="py-0.5 text-right">¥{r.afterYen}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 font-bold">
                    <td className="py-1">合計</td>
                    <td></td><td></td>
                    <td className="py-1 text-right text-emerald-800">¥{realloc.poolYen}</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[10px] text-slate-400 mt-1">合計＝毎月の余力。変わった項目を緑で示しています。</div>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={reallocBusy} onClick={saveRealloc}
                className="px-3.5 py-2 rounded-lg text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                {reallocBusy ? "更新中…" : "この配分にする"}
              </button>
              <button type="button" disabled={reallocBusy} onClick={() => setRealloc(null)}
                className="px-3.5 py-2 rounded-lg text-[13px] font-bold bg-white border border-slate-300 text-slate-600">
                やめる
              </button>
            </div>
          </div>
        )}

        {/* 完了直後：マイページ導線（要件G-5） */}
        {justCompleted && (
          <div className="ml-1">
            <Link href="/shisan/mypage"
              className="inline-block mt-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 transition">
              マイページで確認する →
            </Link>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
      <div className="px-4 pt-2 border-t border-slate-100">
        {notice && <p className="text-[12px] text-red-600 mb-1">{notice}</p>}
        {remaining !== null && remaining <= 5 && remaining > 0 && (
          <p className="text-[11px] text-amber-600 mb-1">本日はあと{remaining}回ご相談いただけます。</p>
        )}
        <div className="flex gap-2 items-end">
          <textarea rows={2} className={`${inputCls} resize-none flex-1`} placeholder="実行で迷っていることを入力…"
            value={input} onChange={(e) => setInput(e.target.value)} disabled={sending} maxLength={2000} />
          <button type="button" onClick={send} disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 whitespace-nowrap">
            送信
          </button>
        </div>
        {/* 免責（常時表示・要件§4-1） */}
        <p className="text-[10px] text-slate-400 leading-relaxed py-2">
          1日{limit}回までご相談いただけます。AIの回答には誤りが含まれる場合があります。無料の参考情報です。特定商品の推奨・投資助言は行いません。重要な判断は公式情報・専門家でご確認ください。
        </p>
      </div>
    </main>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap ${
        isUser ? "bg-emerald-600 text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"}`}>
        {content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto px-4 pt-10 text-slate-400 text-sm">読み込み中…</main>}>
      <ChatInner />
    </Suspense>
  );
}
