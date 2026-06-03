-- =============================================================================
-- つぎの手ナビ：digital_service_masters 初期データ投入
-- Version: 1.0.0 / 2026-04-17
--
-- クイック選択UIで表示される日本主要サービス約50件の初期データ。
-- 001_digital_assets_migration.sql の実行後に投入してください。
--
-- 重複実行しても ON CONFLICT DO NOTHING により問題ありません。
-- =============================================================================

INSERT INTO public.digital_service_masters
  (service_name, category, official_url, icon_key, display_order)
VALUES
  -- ============================= サブスク =============================
  ('Netflix',             'subscription', 'https://www.netflix.com/cancelplan',                            'netflix',        10),
  ('Amazon Prime',        'subscription', 'https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=201118010', 'amazon-prime',   20),
  ('Spotify',             'subscription', 'https://www.spotify.com/jp/account/subscription/',              'spotify',        30),
  ('YouTube Premium',     'subscription', 'https://support.google.com/youtube/answer/6308278',             'youtube',        40),
  ('Apple Music',         'subscription', 'https://support.apple.com/ja-jp/HT202039',                      'apple-music',    50),
  ('Disney+',             'subscription', 'https://help.disneyplus.com/ja/article/disneyplus-cancel-subscription', 'disney',         60),
  ('Hulu',                'subscription', 'https://help.hulu.jp/hc/ja/articles/360013666333',              'hulu',           70),
  ('U-NEXT',              'subscription', 'https://help.unext.jp/guide/cancel',                            'unext',          80),
  ('ABEMAプレミアム',     'subscription', 'https://helps.abema.tv/hc/ja/articles/360027335811',            'abema',          90),
  ('dマガジン',           'subscription', 'https://magazine.dmkt-sp.jp/',                                   'dmagazine',     100),
  ('楽天マガジン',        'subscription', 'https://magazine.rakuten.co.jp/',                                'rakuten-mag',   110),
  ('dアニメストア',       'subscription', 'https://anime.dmkt-sp.jp/',                                      'danime',        120),
  ('DAZN',                'subscription', 'https://www.dazn.com/ja-JP/help/articles/cancel-subscription',   'dazn',          130),
  ('Apple Arcade',        'subscription', 'https://support.apple.com/ja-jp/HT210220',                       'apple-arcade',  140),
  ('Microsoft 365',       'subscription', 'https://support.microsoft.com/ja-jp/office/microsoft-365-subscription', 'microsoft-365', 150),
  ('Adobe Creative Cloud','subscription', 'https://helpx.adobe.com/jp/manage-account/using/cancel-subscription.html', 'adobe',         160),

  -- ============================= 金融 =============================
  ('PayPay',              'finance', 'https://paypay.ne.jp/help/c0151/',                'paypay',         10),
  ('楽天Pay',             'finance', 'https://pay.rakuten.co.jp/',                      'rakuten-pay',    20),
  ('LINE Pay',            'finance', 'https://pay-blog.line.me/',                       'line-pay',       30),
  ('auPAY',               'finance', 'https://aupay.wallet.auone.jp/',                  'aupay',          40),
  ('d払い',               'finance', 'https://service.smt.docomo.ne.jp/keitai_payment/', 'dbarai',         50),
  ('メルペイ',            'finance', 'https://www.merpay.com/',                          'merpay',         60),
  ('楽天銀行',            'finance', 'https://www.rakuten-bank.co.jp/',                  'rakuten-bank',   70),
  ('住信SBIネット銀行',   'finance', 'https://www.netbk.co.jp/',                         'sbi-netbank',    80),
  ('PayPay銀行',          'finance', 'https://www.paypay-bank.co.jp/',                   'paypay-bank',    90),
  ('ソニー銀行',          'finance', 'https://moneykit.net/',                             'sony-bank',     100),
  ('SBI証券',             'finance', 'https://www.sbisec.co.jp/',                        'sbi-sec',       110),
  ('楽天証券',            'finance', 'https://www.rakuten-sec.co.jp/',                   'rakuten-sec',   120),
  ('マネックス証券',      'finance', 'https://www.monex.co.jp/',                         'monex',         130),
  ('bitFlyer',            'finance', 'https://bitflyer.com/ja-jp/',                      'bitflyer',      140),
  ('Coincheck',           'finance', 'https://coincheck.com/ja/',                        'coincheck',     150),

  -- ============================= SNS =============================
  ('LINE',                'sns', 'https://guide.line.me/ja/setting/delete-account.html',       'line',        10),
  ('X (Twitter)',         'sns', 'https://help.x.com/ja/managing-your-account/how-to-deactivate-x-account', 'x-twitter',  20),
  ('Instagram',           'sns', 'https://help.instagram.com/370452623149242',                 'instagram',   30),
  ('Facebook',            'sns', 'https://ja-jp.facebook.com/help/1216349518398524',           'facebook',    40),
  ('YouTube',             'sns', 'https://support.google.com/youtube/answer/55759',            'youtube',     50),
  ('TikTok',              'sns', 'https://support.tiktok.com/ja/account-and-privacy',          'tiktok',      60),
  ('Threads',             'sns', 'https://help.instagram.com/769983657850450',                 'threads',     70),

  -- ============================= 写真・データ保管 =============================
  ('iCloud',              'photo_storage', 'https://support.apple.com/ja-jp/HT207019',          'icloud',     10),
  ('Google フォト',       'photo_storage', 'https://photos.google.com/',                         'google-photos', 20),
  ('Amazon Photos',       'photo_storage', 'https://www.amazon.co.jp/photos',                    'amazon-photos', 30),
  ('Dropbox',             'photo_storage', 'https://www.dropbox.com/account',                    'dropbox',    40),
  ('OneDrive',            'photo_storage', 'https://onedrive.live.com/',                         'onedrive',   50),

  -- ============================= ショッピング =============================
  ('Amazon',              'shopping', 'https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=201437160', 'amazon',    10),
  ('楽天市場',            'shopping', 'https://grp01.id.rakuten.co.jp/',                          'rakuten',    20),
  ('Yahoo!ショッピング',  'shopping', 'https://shopping.yahoo.co.jp/',                            'yahoo-shop', 30),
  ('メルカリ',            'shopping', 'https://www.mercari.com/jp/help_center/',                 'mercari',    40),
  ('PayPayフリマ',        'shopping', 'https://paypayfleamarket.yahoo.co.jp/',                    'paypay-fm',  50),
  ('ZOZOTOWN',            'shopping', 'https://zozo.jp/',                                         'zozo',       60),

  -- ============================= 仕事・業務系 =============================
  ('Slack',               'work', 'https://slack.com/help/articles/204067366',                    'slack',      10),
  ('Notion',              'work', 'https://www.notion.so/',                                       'notion',     20),
  ('Zoom',                'work', 'https://zoom.us/account',                                      'zoom',       30),
  ('Google Workspace',    'work', 'https://support.google.com/a/answer/4597069',                  'google-ws',  40),
  ('Dropbox Business',    'work', 'https://www.dropbox.com/business',                             'dropbox-biz',50)

ON CONFLICT (service_name) DO NOTHING;

-- =============================================================================
-- 動作確認クエリ (オプション)
-- =============================================================================
-- SELECT category, COUNT(*) FROM public.digital_service_masters GROUP BY category;
-- → subscription:16 / finance:15 / sns:7 / photo_storage:5 / shopping:6 / work:5
--   合計54件が登録されていればOK
-- =============================================================================
