# DB マイグレーション — つぎの手ナビ デジタル資産

本番（および新規）Supabase プロジェクトのスキーマは、このフォルダの SQL を**番号順に**実行して再現する。
（これまでワークスペースの「名称未設定フォルダ」に散在していたものを 2026-06-03 に取り込み。課題 #29 解消）

## 実行順（Supabase ダッシュボード → SQL Editor に順に貼り付けて実行）

```
001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010 → 011 → 012 → 013 → 014
```

- `004` で作成する `digital_share_links` は `013` で drop する。順番どおり流せば整合する。
- `008_per_recipient_billing.sql`（最大）に死亡通知・書類・招待・連携・KEK 等の中核テーブルが含まれる。
- `014_uniq_active_death_notice.sql` は本番化のために新規追加（課題 #26：通知重複の race condition を DB 側で封じる部分 UNIQUE インデックス）。

## ⚠️ マイグレーションに含まれないもの（本番プロジェクトで別途・手動設定）

1. **Storage バケット `death-documents`** … ダッシュボードで作成。**非公開（public off）**、SELECT ポリシーを付けない＝service_role のみ読取（死亡診断書は運営のみ閲覧の設計）。アップロード/削除は API が service_role で実行。
2. **監査ログ 90 日自動削除の pg_cron スケジュール** … `digital_purge_old_audit_logs()` 関数は 001 にあるが、`cron.schedule(...)` はマイグレーションに無い。dev で設定済みか確認し、本番でも設定する（`SETUP_GUIDE_Production.md` 末尾参照）。
3. **認証設定**（Site URL / Redirect URLs / Google OAuth / 認証メール日本語化 / From Name）… `SETUP_GUIDE_Production.md` A-2。
4. **主要 Cron**（disclose-expired / cleanup-death-documents / purge-disclosed-owners / trial-reminders）… アプリ側 `vercel.json` の Vercel Cron。`CRON_SECRET` を本番 env に設定すれば Vercel が自動認証。

## スキーマ整合性の検証（本番適用前に推奨）

これらのマイグレーションは番号管理されており品質も高いが、dev で**ダッシュボード経由の手修正（schema drift）**が混じっていないかは保証されない。本番適用前に、dev の実スキーマと突き合わせて差分が無いか確認することが望ましい（既知の差分は #26 のみで、これは 014 で取り込み済み）。

## _rollback/

各マイグレーションの取り消し SQL。通常の構築では使わない。
