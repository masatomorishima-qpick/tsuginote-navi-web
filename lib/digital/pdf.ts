/**
 * 「ご家族への手紙」PDF 生成モジュール
 *
 * pdf-lib + @pdf-lib/fontkit + NotoSansJP で日本語対応 PDF を生成します。
 * Vercel のサーバレス（Node.js ランタイム）で動作します。
 *
 * 🚨 重要：パスワード・ID・口座番号は出力対象外です。
 *    （DB に保存していないため、そもそも出力できません）
 */

import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type {
  DigitalAsset,
  DigitalCategory,
} from '@/types/digital';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DEATH_ACTION_LABELS,
} from '@/types/digital';

// =============================================================================
// 定数
// =============================================================================

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN_X = 50;
const MARGIN_Y = 50;

// 配色（既存サイト emerald-600 ≒ #059669）
const COLOR_TEXT = rgb(0.13, 0.18, 0.27);       // slate-800
const COLOR_MUTED = rgb(0.42, 0.45, 0.5);       // slate-500
const COLOR_LINE = rgb(0.85, 0.87, 0.9);        // slate-200
const COLOR_ACCENT = rgb(0.02, 0.59, 0.41);     // emerald-600
const COLOR_WARN = rgb(0.72, 0.21, 0.31);       // rose-600

// フォント読み込みのキャッシュ（同一プロセス内で再利用）
let cachedFontBytes: Uint8Array | null = null;

async function loadJapaneseFontBytes(): Promise<Uint8Array> {
  if (cachedFontBytes) return cachedFontBytes;

  // app/api/digital/pdf/_fonts/NotoSansJP-Regular.ttf
  // Next.js のファイルトレースで自動的に同梱されます。
  const fontPath = path.join(
    process.cwd(),
    'app',
    'api',
    'digital',
    'pdf',
    '_fonts',
    'NotoSansJP-Regular.ttf'
  );

  try {
    const buf = await fs.readFile(fontPath);
    cachedFontBytes = new Uint8Array(buf);
    return cachedFontBytes;
  } catch (err) {
    throw new Error(
      `日本語フォントファイルが見つかりません: ${fontPath}\n` +
        'SETUP_GUIDE_Week3.md の手順に従い、NotoSansJP-Regular.ttf を配置してください。' +
        ` (内部エラー: ${(err as Error).message})`
    );
  }
}

// =============================================================================
// 入力型
// =============================================================================

export type GeneratePdfInput = {
  /** 表示用のユーザー識別（メール or 任意の名前） */
  ownerLabel: string;
  /** 一覧表示する資産配列 */
  assets: DigitalAsset[];
  /** 生成日時 (省略時は現在時刻) */
  generatedAt?: Date;
};

// =============================================================================
// メイン関数
// =============================================================================

export async function generateFamilyLetterPdf(
  input: GeneratePdfInput
): Promise<Uint8Array> {
  const { ownerLabel, assets } = input;
  const generatedAt = input.generatedAt ?? new Date();

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await loadJapaneseFontBytes();
  // 🚨 subset: false は必須です（subset: true にすると、pdf-lib + fontkit の
  //    CJK サブセッタ不具合で多くのグリフが欠落し、PDF の見た目が大量に
  //    抜け落ちます。テキスト層には正しく入るので抽出はできるのに
  //    描画が崩れる、という症状になります。
  //    全グリフ埋め込みで PDF が約 4.5MB になりますが、「ご家族に渡す
  //    意思メモ」の頻度と重要度を考えれば十分許容範囲です。）
  const jpFont = await pdfDoc.embedFont(fontBytes, { subset: false });
  const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pdfDoc.setTitle('ご家族への手紙｜つぎの手ナビ デジタル資産');
  pdfDoc.setAuthor('つぎの手ナビ');
  pdfDoc.setCreator('つぎの手ナビ デジタル資産整理');
  pdfDoc.setProducer('pdf-lib');
  pdfDoc.setCreationDate(generatedAt);
  pdfDoc.setModificationDate(generatedAt);

  const ctx: RenderCtx = {
    pdfDoc,
    jpFont,
    fallbackFont,
    page: pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]),
    cursorY: A4_HEIGHT - MARGIN_Y,
    pageNumber: 1,
  };

  // ---- 表紙ヘッダ ----
  drawCoverHeader(ctx, ownerLabel, generatedAt);

  // ---- 注意書き ----
  drawSecurityNotice(ctx);

  // ---- 本文：カテゴリ別 ----
  if (assets.length === 0) {
    drawText(ctx, '※ 現時点で登録されたサービスはありません。', {
      size: 11,
      color: COLOR_MUTED,
    });
    moveCursor(ctx, 16);
  } else {
    const grouped = groupByCategory(assets);
    for (const cat of CATEGORY_ORDER) {
      const items = grouped.get(cat);
      if (!items || items.length === 0) continue;
      drawCategorySection(ctx, cat, items);
    }
  }

  // ---- フッタ（全ページ） ----
  drawFooters(ctx, generatedAt);

  return await pdfDoc.save();
}

// =============================================================================
// 内部：レンダリングコンテキスト
// =============================================================================

type RenderCtx = {
  pdfDoc: PDFDocument;
  jpFont: PDFFont;
  fallbackFont: PDFFont;
  page: PDFPage;
  cursorY: number;
  pageNumber: number;
};

function newPage(ctx: RenderCtx) {
  ctx.page = ctx.pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.cursorY = A4_HEIGHT - MARGIN_Y;
  ctx.pageNumber += 1;
}

function moveCursor(ctx: RenderCtx, dy: number) {
  ctx.cursorY -= dy;
}

function ensureSpace(ctx: RenderCtx, needed: number) {
  if (ctx.cursorY - needed < MARGIN_Y + 30 /* footer */) {
    newPage(ctx);
  }
}

// =============================================================================
// 描画ヘルパー
// =============================================================================

type DrawTextOpts = {
  size?: number;
  color?: ReturnType<typeof rgb>;
  x?: number;
  bold?: boolean; // 同フォントなのでスタイル変化なし。意味付け用。
  maxWidth?: number;
  lineHeight?: number;
};

function drawText(ctx: RenderCtx, text: string, opts: DrawTextOpts = {}) {
  const size = opts.size ?? 11;
  const color = opts.color ?? COLOR_TEXT;
  const x = opts.x ?? MARGIN_X;
  const lineHeight = opts.lineHeight ?? size * 1.5;
  const maxWidth = opts.maxWidth ?? A4_WIDTH - MARGIN_X * 2;

  const lines = wrapText(text, ctx.jpFont, size, maxWidth);
  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line, {
      x,
      y: ctx.cursorY - size,
      size,
      font: ctx.jpFont,
      color,
    });
    moveCursor(ctx, lineHeight);
  }
}

/**
 * フォントの文字幅を測りつつ、maxWidth を超えたら折り返す。
 * 日本語は1文字単位、英数は単語単位で改行できるよう簡易処理。
 */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const result: string[] = [];
  const paragraphs = text.split(/\r?\n/);

  for (const para of paragraphs) {
    if (para.length === 0) {
      result.push('');
      continue;
    }
    let current = '';
    for (const ch of para) {
      const tentative = current + ch;
      const width = safeWidth(font, tentative, size);
      if (width > maxWidth && current.length > 0) {
        result.push(current);
        current = ch;
      } else {
        current = tentative;
      }
    }
    if (current) result.push(current);
  }

  return result;
}

function safeWidth(font: PDFFont, text: string, size: number): number {
  try {
    return font.widthOfTextAtSize(text, size);
  } catch {
    // 万一の未対応グリフ対応
    return text.length * size * 0.6;
  }
}

function drawHorizontalLine(ctx: RenderCtx, color = COLOR_LINE) {
  ensureSpace(ctx, 6);
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.cursorY },
    end: { x: A4_WIDTH - MARGIN_X, y: ctx.cursorY },
    thickness: 0.5,
    color,
  });
  moveCursor(ctx, 6);
}

// =============================================================================
// セクション描画
// =============================================================================

function drawCoverHeader(
  ctx: RenderCtx,
  ownerLabel: string,
  generatedAt: Date
) {
  drawText(ctx, 'つぎの手ナビ｜ご家族への手紙', {
    size: 20,
    color: COLOR_ACCENT,
  });
  moveCursor(ctx, 4);
  drawText(ctx, '〜 デジタル資産の意思メモ 〜', {
    size: 11,
    color: COLOR_MUTED,
  });
  moveCursor(ctx, 14);
  drawHorizontalLine(ctx);
  moveCursor(ctx, 6);
  drawText(ctx, `作成者：${ownerLabel}`, { size: 11 });
  drawText(ctx, `作成日：${formatDate(generatedAt)}`, {
    size: 11,
    color: COLOR_MUTED,
  });
  moveCursor(ctx, 12);
}

function drawSecurityNotice(ctx: RenderCtx) {
  ensureSpace(ctx, 90);
  const boxX = MARGIN_X;
  const boxY = ctx.cursorY - 78;
  ctx.page.drawRectangle({
    x: boxX,
    y: boxY,
    width: A4_WIDTH - MARGIN_X * 2,
    height: 76,
    color: rgb(0.97, 0.96, 0.91),    // 淡いウォーム
    borderColor: rgb(0.92, 0.85, 0.62),
    borderWidth: 0.6,
  });
  // 内側にテキスト
  const innerX = boxX + 12;
  const titleY = ctx.cursorY - 18;
  ctx.page.drawText('【ご家族の方へお願い】', {
    x: innerX,
    y: titleY,
    size: 11,
    font: ctx.jpFont,
    color: COLOR_WARN,
  });
  const lines = [
    'この書類はパスワード・ID・口座番号を一切含みません。',
    '本人の希望と、各サービスへの対応方針のみを記しています。',
    '解約や引き継ぎの実務は、各サービスの公式ヘルプをご参照ください。',
  ];
  let y = titleY - 16;
  for (const line of lines) {
    ctx.page.drawText(line, {
      x: innerX,
      y,
      size: 9.5,
      font: ctx.jpFont,
      color: COLOR_TEXT,
    });
    y -= 14;
  }
  moveCursor(ctx, 92);
}

function drawCategorySection(
  ctx: RenderCtx,
  category: DigitalCategory,
  items: DigitalAsset[]
) {
  ensureSpace(ctx, 40);

  // カテゴリ見出し
  drawText(ctx, `■ ${CATEGORY_LABELS[category]}（${items.length}件）`, {
    size: 13,
    color: COLOR_ACCENT,
  });
  drawHorizontalLine(ctx, COLOR_ACCENT);
  moveCursor(ctx, 4);

  for (let i = 0; i < items.length; i += 1) {
    drawAssetItem(ctx, items[i], i + 1);
  }

  moveCursor(ctx, 8);
}

function drawAssetItem(ctx: RenderCtx, asset: DigitalAsset, index: number) {
  ensureSpace(ctx, 60);

  drawText(ctx, `${index}. ${asset.service_name}`, {
    size: 12,
    color: COLOR_TEXT,
  });

  drawLabelValue(ctx, 'ご家族への希望', DEATH_ACTION_LABELS[asset.death_action]);

  if (asset.assignee_name) {
    drawLabelValue(ctx, '担当', asset.assignee_name);
  }
  if (typeof asset.monthly_cost === 'number') {
    drawLabelValue(ctx, '月額費用', `${asset.monthly_cost.toLocaleString('ja-JP')}円`);
  }
  if (asset.official_url) {
    drawLabelValue(ctx, '公式URL', asset.official_url, {
      valueColor: COLOR_ACCENT,
    });
  }
  if (asset.memo) {
    drawLabelValue(ctx, 'メモ', asset.memo);
  }
  drawLabelValue(
    ctx,
    '最終確認',
    asset.is_confirmed
      ? `確認済み（${formatDate(new Date(asset.updated_at))}）`
      : '未確認'
  );

  moveCursor(ctx, 4);
  drawHorizontalLine(ctx);
  moveCursor(ctx, 4);
}

function drawLabelValue(
  ctx: RenderCtx,
  label: string,
  value: string,
  opts: { valueColor?: ReturnType<typeof rgb> } = {}
) {
  const labelText = `  ${label}：`;
  const labelWidth = safeWidth(ctx.jpFont, labelText, 10);

  ensureSpace(ctx, 14);
  ctx.page.drawText(labelText, {
    x: MARGIN_X,
    y: ctx.cursorY - 10,
    size: 10,
    font: ctx.jpFont,
    color: COLOR_MUTED,
  });

  // 値は折り返し対応
  const valueLines = wrapText(
    value,
    ctx.jpFont,
    10,
    A4_WIDTH - MARGIN_X * 2 - labelWidth
  );
  let isFirst = true;
  for (const line of valueLines) {
    ensureSpace(ctx, 14);
    ctx.page.drawText(line, {
      x: isFirst ? MARGIN_X + labelWidth : MARGIN_X + labelWidth,
      y: ctx.cursorY - 10,
      size: 10,
      font: ctx.jpFont,
      color: opts.valueColor ?? COLOR_TEXT,
    });
    moveCursor(ctx, 14);
    isFirst = false;
  }
}

// =============================================================================
// フッタ
// =============================================================================

function drawFooters(ctx: RenderCtx, generatedAt: Date) {
  const totalPages = ctx.pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i += 1) {
    const page = ctx.pdfDoc.getPage(i);
    const text = `つぎの手ナビ デジタル資産整理 ｜ ${formatDate(generatedAt)} ｜ ${
      i + 1
    } / ${totalPages}`;
    page.drawText(text, {
      x: MARGIN_X,
      y: 28,
      size: 9,
      font: ctx.jpFont,
      color: COLOR_MUTED,
    });
  }
}

// =============================================================================
// ユーティリティ
// =============================================================================

function groupByCategory(
  assets: DigitalAsset[]
): Map<DigitalCategory, DigitalAsset[]> {
  const map = new Map<DigitalCategory, DigitalAsset[]>();
  for (const a of assets) {
    const arr = map.get(a.category) ?? [];
    arr.push(a);
    map.set(a.category, arr);
  }
  return map;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}年${m}月${day}日`;
}
