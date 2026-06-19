/**
 * /digital/settings/help — ヘルプ・よくある質問
 *
 * 静的な FAQ 一覧。アコーディオン（<details>/<summary>）でタップ展開する。
 * 内容は事実ベース。誤った案内が出ないよう、変更時はコードと突き合わせて更新すること。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronDown,
  UserPlus,
  FolderClosed,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

// =============================================================================
// ご利用の流れ（LP と同じ 5 ステップ。ヘルプページ用にコンパクト表示）
// =============================================================================
const USAGE_STEPS = [
  {
    number: '01',
    title: '数十秒で、すぐに始められる。',
    subtitle: 'メール認証 または Google アカウント',
    description:
      '面倒な書類は不要。会員登録すれば、その場でデジタル資産の整理を始められます。',
    icon: UserPlus,
  },
  {
    number: '02',
    title: 'デジタル資産を、丁寧に登録する。',
    subtitle: 'サービス・デバイス・希望',
    description:
      'ご利用中のオンラインサービスや、スマートフォン・PC を登録。「もしも」のときに大切な方にどう引き継いでほしいかも、合わせて記録できます。',
    icon: FolderClosed,
  },
  {
    number: '03',
    title: '信頼できる大切な方を、招待する。',
    subtitle: '最大 10 名まで、月額 ¥110/名',
    description:
      'ご家族・パートナー・親しい友人など、信頼できる方を招待。最初の招待から 30 日間は無料でお試しいただけます。',
    icon: Send,
  },
  {
    number: '04',
    title: 'もしものときに、大切な方へ情報を連携。',
    subtitle: '運営確認と異議申立期間を経たうえで連携',
    description:
      'ご逝去の事実が確認された後、書類確認（5 営業日以内）と異議申立期間（14 日間）を経て、登録された情報をご指定の大切な方へ連携します。',
    icon: ShieldCheck,
  },
  {
    number: '05',
    title: '1 年間お役立ていただいて、完全削除。',
    subtitle: '個人情報を、最後まで守る',
    description:
      '連携から 1 年間、大切な方に必要な情報をご活用いただいた後、すべてのデータを完全に削除します。お預かりした情報を、最後まで責任を持って守ります。',
    icon: Trash2,
  },
];

export const metadata: Metadata = {
  title: 'ヘルプ | つぎの手ナビ デジタル資産',
  description:
    'プラン・パスワード・大切な方に共有・死亡通知などの、よくあるご質問をまとめています。',
  robots: { index: false, follow: false },
};

type HelpItem = {
  q: string;
  a: React.ReactNode;
};

type HelpSection = {
  id: string;
  title: string;
  items: HelpItem[];
};

const SECTIONS: HelpSection[] = [
  {
    id: 'billing',
    title: 'プラン・課金',
    items: [
      {
        q: '料金の仕組みは？',
        a: (
          <>
            <p>
             有料プランは「連携先 1 名あたり月額 ¥110（税込）」の従量課金制です。
              連携先がゼロ人のときは料金は発生しません。
            </p>
            <p className="mt-2">
              はじめてプランを開始した日から 30 日間は無料トライアル期間としてご利用いただけます。
            </p>
          </>
        ),
      },
      {
        q: '解約方法を教えてください',
        a: (
          <>
            <p>
              解約方法は 2 通りあります。
            </p>
            <p className="mt-2">
              いずれの方法でも、現在のご契約期間の終了時に有料プランが終了し、無料プランに切り替わります（期間中はサービスを引き続きご利用いただけます）。
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                <b>連携をすべて解除する</b>：最後の連携先を解除すると、自動的に「期間終了で解約予定」となります。期間中に新しい連携先を追加すれば、自動的に継続できます。
              </li>
              <li>
                <b>Stripe カスタマーポータルから解約する</b>：「設定」→「プラン」内の「お支払い情報を管理する」から手続きできます。期間終了前であれば「解約を取り消す」ことも可能です。
              </li>
            </ul>
          </>
        ),
      },
      {
        q: '連携人数を減らしたとき、料金はどうなりますか？',
        a: (
          <>
            <p>
              月の途中で連携先を減らした場合、Stripe の日割り計算（プロレーション）により次回請求に反映されます。
              たとえば 3 名から 2 名に減らした場合、減った分の料金が次回請求に充当されます。
            </p>
            <p className="mt-2">
              最後の 1 名を解除して連携人数がゼロになった場合は、現在のご契約期間の終了時に有料プランが終了し、無料プランに切り替わります（期間中はサービスを引き続きご利用いただけます）。
              期間中に新しい連携先を追加すれば、自動的に有料プランを継続できます。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: 'passphrase',
    title: 'パスワード・合言葉',
    items: [
      {
        q: 'パスワードとマスターコード・連携の合言葉の違いは？',
        a: (
          <>
            <p>
              本サービスでは用途ごとに言葉を使い分けています。
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                <b>パスワード</b>：スマートフォンや PC のロック解除に使う暗証番号などのことです。
                大切な方にお渡しする「中身」にあたります。
              </li>
              <li>
                <b>マスターコード</b>（ご本人用）：そのパスワードを暗号化してしまっておくための「鍵」となる文字列（8 文字以上）です。
                ご本人だけが知っているもので、ご本人がいつでも使えるよう、紙やパスワード管理アプリなどで安全に保管してください。
              </li>
              <li>
                <b>連携の合言葉</b>（連携先の方用）：連携先の方が、開示されたパスワードを取り出すときに使う合言葉です。
                連携先ご自身で設定し、連携先だけが知っているものとして保管していただきます。
              </li>
            </ul>
            <p className="mt-2">
              ご本人側では「マスターコード」、連携先側では「連携の合言葉」と表記しています。
            </p>
          </>
        ),
      },
      {
        q: 'マスターコードを忘れてしまったときは？',
        a: (
          <>
            <p>
              マスターコードのリセット機能をご利用いただけます。パスワードの入力画面に表示される「マスターコードを忘れた」リンクからリセットしてください。
            </p>
            <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <b>注意：</b>リセットすると、保管済みのパスワードはすべて消去されます（暗号化された状態で保管されており、マスターコードがないと取り出すことができないためです）。
              連携先にお渡しした鍵もすべて破棄されます。新しいマスターコードを設定し直し、各デバイスのパスワードを登録し直してください。
            </p>
          </>
        ),
      },
      {
        q: '端末のパスワードを忘れてしまったときは？',
        a: (
          <p>
            端末（スマホ・パソコン）のパスワードを忘れた場合は、各メーカー・OS の公式リカバリ手順をご利用ください。
            本サービスは「大切な方に引き継ぐためのパスワードを安全に保管する」機能であり、端末のパスワードを発行・復元する機能はありません。
          </p>
        ),
      },
      {
        q: 'マスターコードや連携の合言葉はサポートでも復元できますか？',
        a: (
          <>
            <p>
              <b>復元できません。</b>マスターコードや連携の合言葉はご利用の端末（ブラウザ）内でのみ使われ、サーバーには一切保存されない設計です。
              運営側でも照会・復元はできません。
            </p>
            <p className="mt-2">
              お忘れになった場合は「マスターコードのリセット」をご利用のうえ、パスワードを登録し直してください。
              連携先の方が連携の合言葉を忘れた場合は、ご本人による再招待が必要になります。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: 'devices',
    title: 'デバイス管理',
    items: [
      {
        q: '登録できるデバイスの種類は？',
        a: (
          <p>
            スマートフォン、タブレット、PC などロックがかかるすべての端末を登録できます。
            デバイス名はご自身で自由に設定いただけます（例：「自宅の MacBook」「私の iPhone」など）。
          </p>
        ),
      },
      {
        q: 'パスワード保管はどんな仕組みですか？',
        a: (
          <>
            <p>
              パスワードはご本人のマスターコードで強力な暗号化を行ったうえで保管されます。
              暗号化はお客様のブラウザ内で行われ、運営も内容を見ることができません。
            </p>
            <p className="mt-2">
              連携先の方にお渡しする際は、ご本人のマスターコードで作られた「鍵」を、
              連携先しか取り出せない形でさらに保管します。これにより、ご本人がお亡くなりになった事実が確認された後に、
              連携先がご自身の連携の合言葉で取り出せる仕組みになっています。
            </p>
          </>
        ),
      },
      {
        q: 'デバイスを買い替えたときは？',
        a: (
          <p>
            「デバイス・パスワード」から古いデバイスを削除し、新しいデバイスを登録してください。
            削除すると、そのデバイスに紐づくパスワードと暗号文は完全に消去されます。
          </p>
        ),
      },
      {
        q: '「SIMロック」とは何ですか？',
        a: (
          <>
            <p>
              SIMロックとは、スマートフォンを購入した通信会社（ドコモ・au・ソフトバンクなど）の回線でしか使えないように、端末にかけられた制限のことです。
            </p>
            <p className="mt-2">
              SIMロックがかかっている場合、別の通信会社の SIM カードを差し替えても通信できません。
            </p>
            <p className="mt-2">
              現在販売されている多くのスマートフォンは「SIMロック解除済み」の状態で提供されていますが、契約状況によっては SIMロックの解除番号が必要になる場合があります。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: 'family',
    title: '大切な方に共有',
    items: [
      {
        q: '大切な方に共有とは？',
        a: (
          <p>
            ご本人がお亡くなりになった事実が確認された後、登録されたデジタル資産情報や端末のパスワードを、
            事前に指定した連携先にお渡しするための仕組みです。
            最大 10 名まで連携先を登録できます。
          </p>
        ),
      },
      {
        q: '招待を送るとどうなりますか？',
        a: (
          <>
            <p>
              指定したメールアドレスに招待メールが届きます。相手は専用のアカウントを作成して招待を承認します。
            </p>
            <p className="mt-2">
              承認された時点で大切な方に共有として有効になり、月額料金の対象となります
              （30 日間の無料トライアル期間中は無料です）。
            </p>
          </>
        ),
      },
      {
        q: '連携を解除したいときは？',
        a: (
          <p>
            「設定」→「大切な方に共有」または、ヘッダーの「大切な方に共有」ページから、各連携先の「解除」ボタンで解除できます。
            連携を解除すると、その方に紐づく鍵が破棄され、情報は引き継がれなくなります。
          </p>
        ),
      },
      {
        q: '連携先の方はいつ情報を見られるのですか？',
        a: (
          <>
            <p>
              原則として、ご本人がお亡くなりになった事実が確認された後です。
              連携先は「逝去をご報告」から申請でき、運営による書類確認と 14 日の待機期間を経て情報が開示されます。
            </p>
            <p className="mt-2">
              また、「生前共有 ON」に設定した連携先には、ご本人が生前のうちから情報を閲覧していただけます。
              連携先ごとに ON / OFF を切り替えられます。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: 'death-notice',
    title: '死亡通知・開示',
    items: [
      {
        q: '万一のときの手順を教えてください',
        a: (
          <>
            <p>
              連携先の方は、ダッシュボード上の「逝去をご報告」から申請します。
              申請には死亡を証明する書類（死亡診断書や死亡届の写しなど）のアップロードが必要です。
            </p>
            <p className="mt-2">
              運営による書類確認後、ご本人のメールアドレスに「異議申立期間」のご案内が送られ、
              14 日の待機期間を経過すると連携先に情報が開示されます。
            </p>
          </>
        ),
      },
      {
        q: '異議申立とは？',
        a: (
          <p>
            万一、誤って逝去申請が出された場合（生存中の申請）のための仕組みです。
            申請受付から 14 日以内であれば、ご本人がメール内のリンクから「異議申立」を行うことで、申請を無効化できます。
            異議申立が行われた申請は、情報開示されません。
          </p>
        ),
      },
      {
        q: '14 日の待機期間について',
        a: (
          <p>
            逝去申請の受付から情報開示までに 14 日間の待機期間を設けています。
            これは、ご本人がご存命であるにもかかわらず誤って申請が出された場合に、
            メールで通知を受けて異議申立できるようにするための安全期間です。
            この期間中は連携先に情報は開示されません。
          </p>
        ),
      },
    ],
  },
  {
    id: 'account',
    title: 'アカウント',
    items: [
      {
        q: 'アカウント削除（退会）について',
        a: (
          <>
            <p>
              「設定」→「アカウントを削除（退会）」から、いつでも退会いただけます。
              退会するとすべてのデータ（資産情報・パスワード・連携情報など）が完全に消去され、復元はできません。
            </p>
            <p className="mt-2">
              事前に PDF 出力（「大切な方に共有」→「PDF をダウンロード」）で控えを取っておかれることをおすすめします。
              なお、連携がある状態で退会すると、連携先の方との連携も同時に解除されます。
            </p>
          </>
        ),
      },
    ],
  },
];

export default function DigitalSettingsHelpPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            ヘルプ
          </h1>
        </header>

        <div className="space-y-6">
        {/* ご利用の流れ */}
        <section aria-labelledby="help-usage-flow">
          <h2 id="help-usage-flow" className="px-1 mb-2 text-xs text-gray-500">
            ご利用の流れ
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <ol className="divide-y divide-gray-100">
              {USAGE_STEPS.map((step) => (
                <li key={step.number} className="px-4 py-5">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-lg font-bold tracking-tight text-emerald-600">
                      {step.number}
                    </span>
                    <step.icon
                      className="h-5 w-5 flex-shrink-0 mt-1 text-gray-400"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {step.subtitle}
                      </p>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <p className="px-1 text-xs text-gray-500 leading-relaxed">
          よくあるご質問をまとめています。
          各質問をタップすると回答が表示されます。
        </p>

        {SECTIONS.map((section) => (
          <section key={section.id} aria-labelledby={`help-${section.id}`}>
            <h2
              id={`help-${section.id}`}
              className="px-1 mb-2 text-xs text-gray-500"
            >
              {section.title}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {section.items.map((item, idx) => (
                <details
                  key={idx}
                  className="group border-b border-gray-100 last:border-b-0"
                >
                  <summary className="flex items-center justify-between gap-3 px-4 py-4 cursor-pointer list-none active:opacity-70 min-h-[56px]">
                    <span className="text-sm text-gray-900 leading-relaxed">
                      {item.q}
                    </span>
                    <ChevronDown
                      className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-700 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* 戻るリンク（下部） */}
        <div className="pt-4 text-center">
          <Link
            href="/digital/settings"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
          >
            ← 設定に戻る
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
