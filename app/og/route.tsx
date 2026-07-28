import { ImageResponse } from 'next/og';

/**
 * OGP画像の動的生成（2026-07-28 新設）
 *
 * 使い方：/og?title=<記事タイトル> で 1200×630 のPNGを返す。
 * 呼び出しは components/loan/LoanArticle.tsx の ogImageUrl() 経由で、
 * 記事ごとに手作業で指定する必要はない。
 *
 * 置き場所について（重要）：
 *   app/robots.ts が /api/ を全クローラーに Disallow しているため、
 *   /api/og に置くと Google が画像を取得できず、リッチリザルトテストの
 *   「項目 image がありません」が消えない。だから /og に置いている。
 *
 * 日本語フォントについて：
 *   next/og に同梱されているのは Geist（英字のみ）で、日本語は豆腐になる。
 *   Google Fonts の css2 API は text= を渡すと「その文字だけ」のサブセットを
 *   返すので数十KBで済む。リポジトリにフォントのバイナリを持たない方針。
 *
 *   注意：satori が読めるのは ttf / otf / woff で、woff2 は読めない。
 *   css2 API は UA によって返す形式を変えるため、ttf が返る UA から順に試す。
 *
 *   取得に失敗した場合は fonts を「渡さない」（空配列を渡すと
 *   "No fonts are loaded" で例外になり、ストリーム送出中に接続が切れる）。
 *   渡さなければ next/og 同梱の Geist が使われ、少なくとも 200 は返る。
 *
 * 動作確認：/og?debug=1 で、どのフォントが使われたかを JSON で返す。
 */

export const runtime = 'nodejs';

const SIZE = { width: 1200, height: 630 };

/** サイトの配色（Tailwind emerald と同じ値。/shisan の緑カードに合わせている） */
const EMERALD_700 = '#047857';
const EMERALD_600 = '#059669';
const EMERALD_100 = '#D1FAE5';

const SITE_NAME = 'つぎの手ナビ';
const FALLBACK_TITLE = '住宅ローンの判断に迷ったら';

/** css2 API が ttf を返す UA から順に試す（最後は UA 指定なし） */
const USER_AGENTS: (string | null)[] = [
  // 古いブラウザ＝woff2 非対応とみなされ、truetype が返る
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36',
  'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)',
  null,
];

interface FontResult {
  data: ArrayBuffer | null;
  /** どこから取れたか（デバッグ用） */
  source: string;
  /** css2 API が提示した形式の一覧（デバッグ用） */
  formats: string[];
}

/** 表示に使う文字だけのサブセットを Google Fonts から取得する */
async function loadJapaneseFont(text: string): Promise<FontResult> {
  const cssUrl =
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700' +
    `&text=${encodeURIComponent(text)}`;
  const formats: string[] = [];

  for (const ua of USER_AGENTS) {
    try {
      const cssRes = await fetch(cssUrl, ua ? { headers: { 'User-Agent': ua } } : undefined);
      if (!cssRes.ok) continue;

      const css = await cssRes.text();
      for (const m of css.matchAll(/format\('([^']+)'\)/g)) {
        if (!formats.includes(m[1])) formats.push(m[1]);
      }

      // satori が読める形式だけを拾う（woff2 は不可）
      const hit = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/);
      if (!hit) continue;

      const fontRes = await fetch(hit[1]);
      if (!fontRes.ok) continue;

      return { data: await fontRes.arrayBuffer(), source: ua ? `google(${ua.slice(0, 24)}…)` : 'google(UA指定なし)', formats };
    } catch {
      // 次の UA を試す
    }
  }
  return { data: null, source: 'なし（同梱フォントで代替）', formats };
}

/** 文字数に応じて字を小さくする（長いタイトルでも枠からはみ出さないようにする） */
function titleFontSize(length: number): number {
  if (length <= 24) return 68;
  if (length <= 34) return 58;
  if (length <= 44) return 50;
  return 44;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || FALLBACK_TITLE).slice(0, 70);

  const font = await loadJapaneseFont(`${title}${SITE_NAME}`);

  if (searchParams.get('debug')) {
    return Response.json({
      title,
      fontSource: font.source,
      fontBytes: font.data ? font.data.byteLength : 0,
      formatsOfferedByGoogle: font.formats,
      japaneseOk: Boolean(font.data),
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: EMERALD_700,
          padding: '72px 80px',
          fontFamily: font.data ? 'Noto Sans JP' : 'sans-serif',
        }}
      >
        {/* サイト名 */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, color: EMERALD_100 }}>
          {SITE_NAME}
        </div>

        {/* 記事タイトル */}
        <div
          style={{
            display: 'flex',
            fontSize: titleFontSize(title.length),
            lineHeight: 1.35,
            color: '#FFFFFF',
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        {/* 下端のアクセント */}
        <div style={{ display: 'flex', width: 200, height: 10, backgroundColor: EMERALD_600 }} />
      </div>
    ),
    {
      ...SIZE,
      // 空配列を渡すと例外になるため、取れなかったときは渡さない（同梱の Geist が使われる）
      fonts: font.data
        ? [{ name: 'Noto Sans JP', data: font.data, weight: 700 as const, style: 'normal' as const }]
        : undefined,
      headers: {
        // 生成結果はタイトルごとに不変。CDN に長めに持たせて外部取得の回数を減らす。
        'Cache-Control': 'public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400',
      },
    },
  );
}
