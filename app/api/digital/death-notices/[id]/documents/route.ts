/**
 * POST /api/digital/death-notices/[id]/documents
 *
 * 死亡通知に紐づける書類（死亡診断書 等）をアップロードする API。
 *
 * 入力：multipart/form-data
 *   - file: 画像 / PDF（最大 10MB）
 *
 * 処理：
 *   1. ログイン確認
 *   2. 通知が存在し、ログインユーザーが通報者本人 or 連携相手 であることを確認
 *      （RLS でも担保しているが、二重防御）
 *   3. ファイル種別・サイズチェック
 *   4. Supabase Storage バケット `death-documents` に保存
 *      パス：`death-documents/{notice_id}/{uuid}_{filename}`
 *   5. digital_death_documents にメタ情報を INSERT
 *
 * セキュリティ：
 *   - アップロードしたファイルは運営のみ閲覧可（バケットの SELECT ポリシー無し）
 *   - 認証ユーザーすら自分でアップロードしたファイルを再閲覧できない設計
 *     （誤送信時の二次被害を防止）
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'application/pdf',
]);
const ALLOWED_DOCUMENT_TYPES = new Set([
  'death_certificate',     // 死亡を証明する書類（死亡診断書・住民票・戸籍謄本など）
  'identity_certificate',  // 申請者の身分証（運転免許証・マイナンバーカードなど）
]);
const STORAGE_BUCKET = 'death-documents';

function safeFileName(name: string): string {
  // 制御文字とパス区切りを除去。最大 100 文字
  return name
    .replace(/[\\/]/g, '_')
    .replace(/[ --]/g, '')
    .slice(0, 100);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noticeId } = await params;

    // ① 認証
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

    // ② 通知の存在と権限確認
    const admin = createAdminSupabaseClient();
    const { data: notice, error: getErr } = await admin
      .from('digital_death_notices')
      .select('id, owner_user_id, notifier_user_id, status')
      .eq('id', noticeId)
      .maybeSingle();
    if (getErr) {
      return NextResponse.json(
        { ok: false, error: 'unexpected', detail: getErr.message },
        { status: 500 }
      );
    }
    if (!notice) {
      return NextResponse.json(
        { ok: false, error: 'not_found' },
        { status: 404 }
      );
    }

    // ログインユーザーが通報者本人か、active な連携者であるか確認
    const isNotifier = notice.notifier_user_id === user.id;
    let isActiveLinkedRecipient = false;
    if (!isNotifier) {
      const { data: link } = await admin
        .from('digital_family_links')
        .select('id')
        .eq('owner_user_id', notice.owner_user_id)
        .eq('recipient_user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      isActiveLinkedRecipient = !!link;
    }
    if (!isNotifier && !isActiveLinkedRecipient) {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden',
          detail: 'この通知に対する書類のアップロード権限がありません。',
        },
        { status: 403 }
      );
    }

    // 受付可能なステータスかチェック（disclosed / rejected は受付不可）
    if (notice.status !== 'pending' && notice.status !== 'awaiting_objection_period') {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_status',
          detail: `現在のステータス（${notice.status}）では書類を追加できません。`,
        },
        { status: 409 }
      );
    }

    // ③ ファイル取得
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'form_parse_error';
      return NextResponse.json(
        { ok: false, error: 'invalid_form_data', detail },
        { status: 400 }
      );
    }
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'no_file', detail: 'file フィールドが見つかりません。' },
        { status: 400 }
      );
    }

    // document_type を取得（必須）
    const documentTypeRaw = formData.get('document_type');
    if (
      typeof documentTypeRaw !== 'string' ||
      !ALLOWED_DOCUMENT_TYPES.has(documentTypeRaw)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_document_type',
          detail:
            'document_type は death_certificate（死亡証明書）または identity_certificate（身分証）を指定してください。',
        },
        { status: 400 }
      );
    }
    const documentType = documentTypeRaw;

    // ④ サイズ・種別チェック
    if (file.size === 0) {
      return NextResponse.json(
        { ok: false, error: 'empty_file' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: 'file_too_large',
          detail: `ファイルサイズは ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB までです。`,
        },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_mime_type',
          detail: `ファイル種別 ${file.type} は対応していません。JPEG / PNG / HEIC / HEIF / PDF のいずれかをご利用ください。`,
        },
        { status: 400 }
      );
    }

    // ⑤ Supabase Storage に保存
    const cleanFileName = safeFileName(file.name || 'document');
    const storagePath = `${noticeId}/${randomUUID()}_${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: uploadErr } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error('[death-documents POST] storage upload failed', uploadErr);
      return NextResponse.json(
        {
          ok: false,
          error: 'storage_upload_failed',
          detail:
            uploadErr.message ??
            'ファイル保存に失敗しました。バケット設定をご確認ください。',
        },
        { status: 500 }
      );
    }

    // ⑥ メタ情報を DB に保存
    const { data: docRow, error: insErr } = await admin
      .from('digital_death_documents')
      .insert({
        death_notice_id: noticeId,
        storage_path: `${STORAGE_BUCKET}/${storagePath}`,
        file_name: cleanFileName,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
        uploaded_by: user.id,
      })
      .select('id, file_name, file_size, mime_type, document_type, created_at')
      .single();

    if (insErr) {
      console.error('[death-documents POST] db insert failed', insErr);
      // Storage のファイルは残ってしまうが、運営側で目視時に拾える設計なので致命的ではない
      return NextResponse.json(
        { ok: false, error: 'metadata_save_failed', detail: insErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      document: docRow,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[death-documents POST] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
