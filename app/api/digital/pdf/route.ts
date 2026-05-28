/**
 * GET /api/digital/pdf
 *
 * ログイン中ユーザーの全資産から「ご家族への手紙」PDFを生成して返却。
 * ブラウザのダウンロード or インライン表示で開きます。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listAssets } from '@/lib/digital/assets';
import { recordAuditLog } from '@/lib/digital/audit';
import { generateFamilyLetterPdf } from '@/lib/digital/pdf';

// pdf-lib + fontkit + ファイルシステムを使うため、必ず Node.js ランタイム
export const runtime = 'nodejs';
// 毎回最新データで生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'unauthorized' },
        { status: 401 }
      );
    }

    const assets = await listAssets(supabase, user.id);
    const ownerLabel = user.email ?? user.id;

    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await generateFamilyLetterPdf({ ownerLabel, assets });
    } catch (err) {
      console.error('[api/digital/pdf] generation failed', err);
      return NextResponse.json(
        {
          ok: false,
          error: 'pdf_generation_failed',
          detail: (err as Error).message,
        },
        { status: 500 }
      );
    }

    // 監査ログ（fire-and-forget）
    await recordAuditLog(supabase, user.id, {
      action: 'pdf_export',
      metadata: {
        asset_count: assets.length,
      },
    });

    // ダウンロード or インライン
    const inline = request.nextUrl.searchParams.get('inline') === '1';
    const filename = buildFilename(new Date());

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBytes.byteLength),
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(
          filename
        )}`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('[api/digital/pdf] unexpected error', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}

function buildFilename(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `tsuginotenavi_家族への手紙_${y}${m}${day}.pdf`;
}
