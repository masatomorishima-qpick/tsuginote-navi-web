/**
 * components/retirement/pro/Wakachi.tsx ── 画面の字に「ここで改行してよい」の印（<wbr>）を自動で入れる
 *
 * 【なぜ要るか】（戦術Cowork `kaihatsu_ate_20260918h.md` C・`kaihatsu_ate_20260918j.md` D・判断ログ1348・1350）
 *   55〜65歳の方が読む画面で「受／け取ると」「全／国分」のように、単語の途中で改行していました。
 *   1か所ずつ手で直すのをやめ、改行してよい位置を自動で決めます（森嶋さんのお決め）。
 *
 * 【何をするか】
 *   画面の本が返す JSX の中の「字」（文字列）を、BudouX（`lib/retirement/pro/budoux/`・Apache License 2.0・
 *   1バイトも変えずに写したもの）で文節に分け、文節の間に <wbr> をはさみます。
 *   あわせて、画面の一番外の枠に keep-all（単語の途中では改行しない）を付けます。
 *   ・字は1字も変えません（<wbr> は字ではありません。コピーしても字は増えません）
 *   ・React が持っている字をそのまま組み替えるので、計算し直したときも字と数がずれません
 *     （画面の DOM を後から書き替える形にはしていません。数が古いまま残る道を作らないためです）
 *
 * 【当てない所】
 *   ・手で <wbr> を入れた所（keep-all の class を持つ要素・`kz` の付いたカード）…… 決め1343〜1345 のまま残します
 *   ・svg／input／textarea／select／option／style／script の中
 *   ・字以外の属性（className・href・key など）
 *
 * 【数字と単位の途中で切らない】（決め1348 の5）
 *   BudouX の切れ目のうち、次の所は外します（この本の中の決め。BudouX の本は変えていません）。
 *   ・数字（0-9・,・.）の直後で、次が数字・円・万・歳・年・月・日・%・通・か・倍・人・件・回のとき
 *   ・「万」「千」「億」の直後で、次が「円」のとき
 *   ・「か」の直後で、次が「月」のとき
 *   ・英字どうしの間（iDeCo など）
 *   さらに「数字＋単位」（例 21,509,560円・2,352万円・65歳）は `whitespace-nowrap` の span で包み、その中では改行しません。
 *
 * 【当てる範囲】/retirement/pro の無料の画面（Screen1〜Screen56）だけです（2026-09-18 時点）。
 *   /shisan と禁止の本には当てていません。有料の画面は、描いて数えられるようになってから当てます。
 */
import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Parser } from '@/lib/retirement/pro/budoux/parser';
import jaModel from '@/lib/retirement/pro/budoux/ja.json';

/** 単語の途中で改行しない（基準HTML `.kz` と同じ3つ） */
export const KZ = '[word-break:keep-all] [overflow-wrap:anywhere] [line-break:strict]';

const parser = new Parser(jaModel as { [key: string]: { [key: string]: number } });
const kiokuMap = new Map<string, number[]>();

/** 切れ目にしない所（数字と単位・英字どうし） */
function kirenai(mae: string, ato: string): boolean {
  if (/[0-9０-９,，.．]/.test(mae) && /[0-9０-９,，.．円万千億歳年月日%％通か倍人件回]/.test(ato)) return true;
  if (/[万千億]/.test(mae) && ato === '円') return true;
  if (mae === 'か' && ato === '月') return true;
  if (/[A-Za-z]/.test(mae) && /[A-Za-z]/.test(ato)) return true;
  return false;
}

/** 字の、改行してよい位置（0 と末尾は含みません） */
export function kiremeOf(s: string): number[] {
  const hit = kiokuMap.get(s);
  if (hit) return hit;
  const out = parser.parseBoundaries(s).filter((i) => !kirenai(s[i - 1], s[i]));
  if (kiokuMap.size < 2000) kiokuMap.set(s, out);
  return out;
}

/**
 * 金額・年齢などの「数字＋単位」のひとまとまり。この中では、どこでも改行しません（`whitespace-nowrap` の span で包みます）。
 *   keep-all だけだと、表の狭い欄で「21,509,56／0円」のように数字の途中で折れました（2026-09-18 に描いて見つけた）。
 */
const SUJI = /[−＋+\-]?[0-9０-９][0-9０-９,，.．]*(?:万円|千円|億円|円|歳|年|か月|%|％|通り|倍|人|件|回)?/g;

function sujiWoTsutsumu(t: string, key: string): ReactNode {
  if (!/[0-9０-９]/.test(t)) return t;
  const out: ReactNode[] = [];
  let mae = 0, n = 0;
  for (const m of t.matchAll(SUJI)) {
    const i = m.index ?? 0;
    if (i > mae) out.push(t.slice(mae, i));
    out.push(<span key={`${key}-${n++}`} className="whitespace-nowrap">{m[0]}</span>);
    mae = i + m[0].length;
  }
  if (mae < t.length) out.push(t.slice(mae));
  return <>{out}</>;
}

/** 1つの字を、<wbr> をはさんだ並びにする（数字＋単位は、改行しないひとまとまりにする） */
export function wakachiJi(s: string): ReactNode {
  const ks = /[^\x00-\x7F]/.test(s) ? kiremeOf(s) : [];   // 日本語の無い字（数字だけ・英字だけ）は切れ目なし
  if (ks.length === 0) return sujiWoTsutsumu(s, 'a');
  const out: ReactNode[] = [];
  let mae = 0;
  ks.forEach((k, i) => {
    out.push(<Fragment key={i}>{sujiWoTsutsumu(s.slice(mae, k), `s${i}`)}<wbr /></Fragment>);
    mae = k;
  });
  out.push(<Fragment key={ks.length}>{sujiWoTsutsumu(s.slice(mae), `s${ks.length}`)}</Fragment>);
  return <>{out}</>;
}

const TOORANAI = new Set(['svg', 'input', 'textarea', 'select', 'option', 'style', 'script', 'wbr', 'br']);
/** 字として組み替えてよい、自前の部品の値の名前 */
const JI_NO_PROPS = ['children', 'title', 'body', 'label', 'note', 'value', 'valueNote'];
// （2026-09-18）どの名前も、Screen2・Screen3・Screen4・Screen56 の自前の部品（Row・Axis・Card・H3）で、字を出すだけに使っていることを確かめました

type AnyProps = { [key: string]: unknown; className?: unknown; children?: ReactNode; kz?: unknown };

function walk(node: ReactNode): ReactNode {
  if (typeof node === 'string') return wakachiJi(node);
  if (Array.isArray(node)) {
    // となり合う字と数（`{n.toLocaleString()}円` のように JSX で分かれたもの）を、1つの字につなげてから分けます。
    // 画面に出る字は同じです。つなげないと「24,720,342／円」のように、数と単位の間で改行することがありました。
    const tsunagu: ReactNode[] = [];
    for (const c of node.flat(Infinity) as ReactNode[]) {
      const last = tsunagu[tsunagu.length - 1];
      if ((typeof c === 'string' || typeof c === 'number') && (typeof last === 'string')) tsunagu[tsunagu.length - 1] = last + String(c);
      else tsunagu.push(typeof c === 'number' ? String(c) : c);
    }
    return Children.map(tsunagu, (c) => walk(c));
  }
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<AnyProps>;
  const p = el.props;
  if (typeof el.type === 'string') {
    if (TOORANAI.has(el.type)) return el;
    if (typeof p.className === 'string' && p.className.includes('keep-all')) return el;   // 手で <wbr> を入れた所
    if (p.children === undefined) return el;
    return cloneElement(el, undefined, walk(p.children));
  }
  if (p.kz === true) return el;                                                        // 手で <wbr> を入れたカード
  const kae: AnyProps = {};
  let aru = false;
  for (const k of JI_NO_PROPS) {
    if (k in p && p[k] !== undefined && typeof p[k] !== 'function') { kae[k] = walk(p[k] as ReactNode); aru = true; }
  }
  if (!aru) return el;
  const { children, ...hoka } = kae;
  return children !== undefined ? cloneElement(el, hoka, children) : cloneElement(el, hoka);
}

/**
 * 画面の一番外の要素を渡すと、keep-all を付け、中の字に <wbr> を入れて返します。
 *   使い方 …… `return wakachi(<div ref={rootRef}>…</div>);`
 */
export function wakachi(root: ReactElement<AnyProps>): ReactElement {
  const cls = typeof root.props.className === 'string' ? `${root.props.className} ${KZ}` : KZ;
  return cloneElement(root, { className: cls }, walk(root.props.children));
}
