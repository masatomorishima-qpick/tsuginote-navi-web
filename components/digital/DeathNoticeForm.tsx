'use client';

/**
 * DeathNoticeForm
 *
 * 連携者が死亡通知を作成する入力フォーム。
 *
 * フロー：
 *   1. 続柄・逝去日・経緯を入力
 *   2. 死亡診断書ファイルを選択
 *   3. 確認パネル（5-4）の同意チェック
 *   4. 送信：①通知を作成（POST /api/digital/family/death-notice）
 *           →②作成された notice_id に書類をアップロード（POST /api/digital/death-notices/[id]/documents）
 *
 * 注意：通知作成と書類アップロードは 2 段階。通知作成が成功してから書類を上げる。
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
} from 'lucide-react';

type Props = {
  ownerId: string;
  ownerDisplayName: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.heic,.heif,.pdf';

export default function DeathNoticeForm({ ownerId, ownerDisplayName }: Props) {
  const router = useRouter();

  const [relation, setRelation] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [note, setNote] = useState('');
  const [deathCertFile, setDeathCertFile] = useState<File | null>(null);
  const [idCertFile, setIdCertFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [step, setStep] = useState<'idle' | 'creating' | 'uploading' | 'done'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  function makeFileChangeHandler(
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (f && f.size > MAX_FILE_SIZE) {
        setError('ファイルサイズは 10MB までです。');
        setter(null);
        return;
      }
      setError(null);
      setter(f);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 'creating' || step === 'uploading') return;
    setError(null);

    // バリデーション
    if (!relation.trim()) {
      setError('ご本人とのご関係（続柄）をご入力ください。');
      return;
    }
    if (!deathDate) {
      setError('逝去日をご入力ください。');
      return;
    }
    if (!deathCertFile) {
      setError('死亡を証明する書類をご添付ください。');
      return;
    }
    if (!idCertFile) {
      setError('申請者の身分証をご添付ください。');
      return;
    }
    if (!agreed) {
      setError('注意事項にご同意のうえ送信してください。');
      return;
    }

    try {
      // ① 通知作成
      setStep('creating');
      const createRes = await fetch('/api/digital/family/death-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_user_id: ownerId,
          reported_death_date: deathDate,
          notifier_relation: relation.trim() || undefined,
          notifier_note: note.trim() || undefined,
          agreed: true,
        }),
      });
      const createJson = (await createRes.json()) as {
        ok: boolean;
        notice?: { id: string };
        error?: string;
        detail?: string;
      };

      if (!createRes.ok || !createJson.ok || !createJson.notice) {
        const msg =
          createJson.detail ??
          (createJson.error === 'duplicate_pending'
            ? '既に同じ方についての死亡通知が確認中です。重ねての通知は不要です。'
            : createJson.error === 'not_linked'
              ? 'この方からの連携が確認できませんでした。'
              : '死亡通知の作成に失敗しました。時間をおいて再度お試しください。');
        setError(msg);
        setStep('idle');
        return;
      }

      const noticeId = createJson.notice.id;

      // ② 書類アップロード（2 ファイル順次：死亡証明書 → 身分証）
      setStep('uploading');

      // ②-1：死亡を証明する書類
      const deathCertForm = new FormData();
      deathCertForm.append('file', deathCertFile);
      deathCertForm.append('document_type', 'death_certificate');
      const deathCertRes = await fetch(
        `/api/digital/death-notices/${noticeId}/documents`,
        {
          method: 'POST',
          body: deathCertForm,
        }
      );
      const deathCertJson = (await deathCertRes.json()) as {
        ok: boolean;
        error?: string;
        detail?: string;
      };
      if (!deathCertRes.ok || !deathCertJson.ok) {
        setError(
          `死亡通知は受け付けましたが、死亡を証明する書類のアップロードに失敗しました（${deathCertJson.detail ?? deathCertJson.error}）。お手数ですが support@tsuginotenavi.jp までご連絡ください。`
        );
        setStep('idle');
        return;
      }

      // ②-2：申請者の身分証
      const idCertForm = new FormData();
      idCertForm.append('file', idCertFile);
      idCertForm.append('document_type', 'identity_certificate');
      const idCertRes = await fetch(
        `/api/digital/death-notices/${noticeId}/documents`,
        {
          method: 'POST',
          body: idCertForm,
        }
      );
      const idCertJson = (await idCertRes.json()) as {
        ok: boolean;
        error?: string;
        detail?: string;
      };
      if (!idCertRes.ok || !idCertJson.ok) {
        setError(
          `死亡通知と死亡を証明する書類は受け付けましたが、身分証のアップロードに失敗しました（${idCertJson.detail ?? idCertJson.error}）。お手数ですが support@tsuginotenavi.jp までご連絡ください。`
        );
        setStep('idle');
        return;
      }

      // ③ 完了
      setStep('done');
      router.refresh();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'unexpected_error';
      console.error('[DeathNoticeForm] failed', detail);
      setError(`エラーが発生しました：${detail}`);
      setStep('idle');
    }
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
            <CheckCircle2 className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">
            死亡通知を受け付けました
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
            ご報告ありがとうございます。これから運営にて書類の確認を行います。
            <br />
            確認完了後、ご本人への最終確認期間（14 日間）を経て、
            連携先の皆さまへの情報開示が行われます。
            <br />
            進捗はこのダッシュボードでご確認いただけます。
          </p>
          <Link
            href="/digital"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      {/* 続柄 */}
      <div>
        <label
          htmlFor="relation"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          {ownerDisplayName} さまとのご関係{' '}
          <span className="text-rose-600">*</span>
        </label>
        <input
          id="relation"
          type="text"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          placeholder="例：妻、長男、弟"
          maxLength={30}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* 逝去日 */}
      <div>
        <label
          htmlFor="death-date"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          逝去日 <span className="text-rose-600">*</span>
        </label>
        <input
          id="death-date"
          type="date"
          value={deathDate}
          onChange={(e) => setDeathDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:w-60"
        />
      </div>

      {/* 経緯 */}
      <div>
        <label
          htmlFor="note"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          経緯・補足（任意）
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="運営での確認に役立つ情報があればご記入ください。"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* 書類アップロード ①：死亡を証明する書類 */}
      <div>
        <label
          htmlFor="death-cert"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          死亡を証明する書類 <span className="text-rose-600">*</span>
        </label>
        <p className="mb-2 text-xs text-slate-500">
          死亡診断書／住民票（死亡記載あり）／戸籍謄本 のいずれか。
          <br />
          画像（JPEG / PNG / HEIC）または PDF、10MB まで。
          アップロードした書類は運営のみが確認します。
        </p>
        <label
          htmlFor="death-cert"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 hover:border-emerald-400 hover:bg-emerald-50"
        >
          <FileUp className="h-5 w-5 text-slate-400" aria-hidden="true" />
          {deathCertFile ? deathCertFile.name : 'ファイルを選択'}
        </label>
        <input
          id="death-cert"
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={makeFileChangeHandler(setDeathCertFile)}
          className="sr-only"
        />
      </div>

      {/* 書類アップロード ②：申請者の身分証 */}
      <div>
        <label
          htmlFor="id-cert"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          申請者（あなた）の身分証 <span className="text-rose-600">*</span>
        </label>
        <p className="mb-2 text-xs text-slate-500">
          運転免許証／マイナンバーカード／健康保険証 などの、申請者ご本人の身分を確認できる書類。
          <br />
          画像（JPEG / PNG / HEIC）または PDF、10MB まで。
          アップロードした書類は運営のみが確認します。
        </p>
        <label
          htmlFor="id-cert"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 hover:border-emerald-400 hover:bg-emerald-50"
        >
          <FileUp className="h-5 w-5 text-slate-400" aria-hidden="true" />
          {idCertFile ? idCertFile.name : 'ファイルを選択'}
        </label>
        <input
          id="id-cert"
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={makeFileChangeHandler(setIdCertFile)}
          className="sr-only"
        />
      </div>

      {/* 確認パネル（手続きの流れ） */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
        <p className="font-semibold">
          このボタンを押すと以下が自動的に行われます
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>
            【即時】{ownerDisplayName} さま本人のメールアドレスに「死亡通知を受け取りました」というお知らせが送信されます。ご存命の場合は 14 日以内に異議申立ができます。
          </li>
          <li>
            【即時】{ownerDisplayName} さまと連携している他の方々（あなたを含む）全員に「逝去のご報告があり確認中です」というお知らせが送信されます。
          </li>
          <li>
            【5 営業日以内】運営にて、ご提出の書類を確認します。
          </li>
          <li>
            【14 日経過後】ご本人からの異議申立がなく書類確認も完了した場合、生前に指定された連携先全員に登録情報が開示されます。
          </li>
        </ol>
      </div>

      {/* 虚偽申請に関する警告 */}
      <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs leading-relaxed text-rose-900">
        <p className="font-bold text-rose-800">
          【重要】虚偽申請に関する警告
        </p>
        <p className="mt-2">
          虚偽の内容で死亡通知を行うこと、または偽造・変造された書類を提出することは、
          <b>
            刑法第 159 条（私文書偽造罪）、第 161 条（偽造私文書等行使罪）、第 246 条（詐欺罪）
          </b>
          等に該当する可能性があります。発覚した場合は刑事告訴を行うことがあります。
        </p>
        <p className="mt-2">
          アップロードされた書類と申請内容は、運営にて確認のうえ保管され、不正調査・捜査機関からの照会等に応じる場合があります。
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0"
        />
        <span>上記すべての内容を理解しました。</span>
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Link
          href="/digital"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={step !== 'idle'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {step === 'creating' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              通知を作成中…
            </>
          )}
          {step === 'uploading' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              書類をアップロード中…
            </>
          )}
          {step === 'idle' && '死亡通知を送信する'}
        </button>
      </div>
    </form>
  );
}
