'use client';

/**
 * RecipientPinReveal
 *
 * 連携者が、開示されたオーナーの PIN（スマホ・パソコン パスワード）を
 * 自分のパスフレーズで復号して表示するコンポーネント。
 *
 * 復号フロー（すべてブラウザ内で完結、サーバーに平文は出ない）：
 *   1. /api/digital/family/[ownerId]/disclosed-pins から暗号化データ取得
 *   2. パスフレーズで連携者の秘密鍵を解錠（unwrapRecipientPrivateKey）
 *   3. 秘密鍵で KEK を復号（decryptKekAsRecipient）
 *   4. KEK で各 PIN の DEK を復号（decryptDekWithKek）
 *   5. DEK で PIN 平文を復号（decryptDataWithDek）
 *
 * v1 形式の PIN は連携者では復号できない（本人パスフレーズ専用）ため、
 * 「本人のみ閲覧可能」と表示する。
 */

import { useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  unwrapRecipientPrivateKey,
  decryptKekAsRecipient,
  decryptDekWithKek,
  decryptDataWithDek,
} from '@/lib/crypto/envelope';

type Props = {
  ownerId: string;
};

type EncryptedPinRow = {
  device_id: string;
  device_name: string;
  manufacturer: string | null;
  model: string | null;
  algorithm_version: 'v1' | 'v2';
  encrypted_pin: string;
  iv: string;
  encrypted_dek: string | null;
  dek_iv: string | null;
};

type DecryptedPin = {
  device_id: string;
  device_name: string;
  manufacturer: string | null;
  model: string | null;
  // 復号結果。v1 は復号不可
  status: 'decrypted' | 'v1_unavailable' | 'error';
  pin?: string;
  errorDetail?: string;
};

export default function RecipientPinReveal({ ownerId }: Props) {
  const [passphrase, setPassphrase] = useState('');
  const [step, setStep] = useState<'idle' | 'working' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DecryptedPin[]>([]);
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({});

  async function handleReveal(e: React.FormEvent) {
    e.preventDefault();
    if (step === 'working') return;
    setError(null);

    if (!passphrase || passphrase.length < 8) {
      setError('連携の合言葉を入力してください（8 文字以上）。');
      return;
    }

    setStep('working');
    try {
      // ① 暗号化データ取得
      const res = await fetch(
        `/api/digital/family/${encodeURIComponent(ownerId)}/disclosed-pins`
      );
      const json = (await res.json()) as {
        ok: boolean;
        recipient_keypair?: {
          encrypted_private_key: string;
          iv: string;
          salt: string;
        };
        kek_envelope?: { encrypted_kek: string } | null;
        pins?: EncryptedPinRow[];
        error?: string;
        detail?: string;
      };

      if (!res.ok || !json.ok || !json.recipient_keypair) {
        setError(
          json.detail ??
            'データの取得に失敗しました。時間をおいて再度お試しください。'
        );
        setStep('idle');
        return;
      }

      const pins = json.pins ?? [];
      if (pins.length === 0) {
        setResults([]);
        setStep('done');
        return;
      }

      // ② 秘密鍵を解錠
      let privateKey: CryptoKey;
      try {
        privateKey = await unwrapRecipientPrivateKey(
          {
            encryptedPrivateKey: json.recipient_keypair.encrypted_private_key,
            iv: json.recipient_keypair.iv,
            salt: json.recipient_keypair.salt,
          },
          passphrase
        );
      } catch {
        setError(
          '連携の合言葉が正しくありません。連携承認時にご設定いただいた連携の合言葉をご確認ください。'
        );
        setStep('idle');
        return;
      }

      // ③ KEK を復号
      if (!json.kek_envelope) {
        setError(
          'この方の引き継ぎ情報が連携者向けに保管されていません。ご本人がパスワードを新方式で登録していない可能性があります。'
        );
        setStep('idle');
        return;
      }
      let kek: Uint8Array;
      try {
        kek = await decryptKekAsRecipient(
          { encrypted_kek: json.kek_envelope.encrypted_kek, algorithm_version: 'v1' },
          privateKey
        );
      } catch {
        setError('情報の取り出しに失敗しました。サポートまでご連絡ください。');
        setStep('idle');
        return;
      }

      // ④ 各 PIN を復号
      const decrypted: DecryptedPin[] = [];
      for (const row of pins) {
        if (row.algorithm_version !== 'v2' || !row.encrypted_dek || !row.dek_iv) {
          decrypted.push({
            device_id: row.device_id,
            device_name: row.device_name,
            manufacturer: row.manufacturer,
            model: row.model,
            status: 'v1_unavailable',
          });
          continue;
        }
        try {
          const dek = await decryptDekWithKek(
            { encrypted_dek: row.encrypted_dek, iv: row.dek_iv },
            kek
          );
          const pinPlain = await decryptDataWithDek(
            row.encrypted_pin,
            row.iv,
            dek
          );
          decrypted.push({
            device_id: row.device_id,
            device_name: row.device_name,
            manufacturer: row.manufacturer,
            model: row.model,
            status: 'decrypted',
            pin: pinPlain,
          });
        } catch (err) {
          decrypted.push({
            device_id: row.device_id,
            device_name: row.device_name,
            manufacturer: row.manufacturer,
            model: row.model,
            status: 'error',
            errorDetail: err instanceof Error ? err.message : 'decrypt_failed',
          });
        }
      }

      // メモリ上のパスフレーズをクリア
      setPassphrase('');
      setResults(decrypted);
      setStep('done');
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'unexpected_error';
      console.error('[RecipientPinReveal] failed', detail);
      setError(`エラーが発生しました：${detail}`);
      setStep('idle');
    }
  }

  if (step === 'done') {
    return (
      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            登録されているスマホ・パソコン のパスワードはありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {results.map((r) => (
              <li
                key={r.device_id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {r.device_name}
                </p>
                {(r.manufacturer || r.model) && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[r.manufacturer, r.model].filter(Boolean).join(' / ')}
                  </p>
                )}

                {r.status === 'decrypted' && (
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900">
                      {visibleMap[r.device_id]
                        ? r.pin
                        : '•'.repeat(Math.min(r.pin?.length ?? 6, 12))}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleMap((m) => ({
                          ...m,
                          [r.device_id]: !m[r.device_id],
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      {visibleMap[r.device_id] ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {visibleMap[r.device_id] ? '隠す' : '表示'}
                    </button>
                  </div>
                )}
                {r.status === 'v1_unavailable' && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    このパスワードは旧方式で保管されているため、連携者は閲覧できません（ご本人のみ閲覧可能）。
                  </p>
                )}
                {r.status === 'error' && (
                  <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    取り出しに失敗しました。サポートまでご連絡ください。
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500">
          ※ 表示されたパスワードは画面の再読み込みで再び非表示になります。
          スクリーンショットや第三者への共有はお控えください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleReveal} className="space-y-3">
      <p className="text-sm leading-relaxed text-slate-600">
        スマホ・パソコン のパスワードを表示するには、
        連携承認時にご自身で設定された<b>連携の合言葉</b>を入力してください。
      </p>
      <div>
        <label
          htmlFor="reveal-passphrase"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          あなたの連携の合言葉
        </label>
        <input
          id="reveal-passphrase"
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={step === 'working'}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {step === 'working' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            取り出し中…
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            パスワードを表示する
          </>
        )}
      </button>

      <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <Lock
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <span>
          取り出しはすべてご自身のブラウザ内で行われます。連携の合言葉が当社サーバーに送信されることはありません。
        </span>
      </p>
    </form>
  );
}
