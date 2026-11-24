import type { MetadataRoute } from "next";

/**
 * sitemap.xml — Phase 1 ローンチ準備にあわせて刷新
 *
 * 方針:
 *   - 旧サイトマップにあった相続放棄系（/souzoku-houki, /souzoku-tetsuzuki, /shibougo-tetsuzuki）は
 *     301 リダイレクトで "/" に集約済みのため sitemap からは除外する。
 *   - デジタル資産（つぎの手ナビ デジタル資産）の TOP / プライバシー / 利用規約 /
 *     会社情報、および残置中のデジタル遺品ガイド（/guide/ihinseiri/...）を掲載。
 *   - /digital/* は認証必須なので sitemap には含めない。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.tsuginotenavi.jp";

  const digitalLegacyGuideSlugs = [
    "digitalihin-001",
    "digitalihin-002",
    "digitalihin-003",
    "digitalihin-004",
    "digitalihin-005",
    "digitalihin-007",
    "digitalihin-008",
  ];

  const now = new Date();

  return [
    {
      // 2026-07-29：TOP を実体化したので sitemap に載せる（リダイレクト廃止）。
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // 2026-11-04 削除：家計診断・住宅ローン・退職金・ジム・トレンド速攻（売上がなく検索も少ないためページごと削除。docs/site-top.md）。
    // 給湯器の交換費用（記事型、2026-10-31 新設）。2026-11-04 に検索からの集客の親ページとして載せる
    // （docs/kyutoki-seo/plan.md の P1。それまで sitemap に載っていなかった）。
    // 給湯器のページの一覧（2026-11-13 新設）。
    {
      url: `${baseUrl}/kyutoki`,
      lastModified: new Date("2026-11-13T09:00:00+09:00"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kyutoki/kokan-hiyou`,
      lastModified: new Date("2026-11-04T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 給湯器の配布物のページ（2026-11-04 新設、docs/kyutoki-seo/plan.md の P2・P3）。
    {
      url: `${baseUrl}/kyutoki/mitsumori-mikata`,
      lastModified: new Date("2026-11-04T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kyutoki/gosu-erabikata`,
      lastModified: new Date("2026-11-04T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続の配布物のページ（2026-11-05 新設、docs/haifu-plan.md）。
    {
      url: `${baseUrl}/guide/souzoku/isan-bunkatsu-kyogisho`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku/souzoku-kankei-setsumeizu`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続の手続きチェックリスト（2026-11-10 作成、docs/seisaku-queue.md の T1）。
    {
      url: `${baseUrl}/guide/souzoku/tetsuzuki-checklist`,
      lastModified: new Date("2026-11-10T21:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の申告の必要書類チェックリスト（2026-11-11 作成、docs/seisaku-queue.md の T4）。
    {
      url: `${baseUrl}/guide/souzoku/shinkoku-shorui-checklist`,
      lastModified: new Date("2026-11-11T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 死亡保険金の相続税の非課税の計算（2026-11-11 作成、docs/seisaku-queue.md の T7）。
    {
      url: `${baseUrl}/guide/souzoku/shibou-hokenkin-hikazei`,
      lastModified: new Date("2026-11-11T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 法定相続分の計算（2026-11-12 作成、docs/seisaku-queue.md の T8）。
    {
      url: `${baseUrl}/guide/souzoku/houtei-souzokubun`,
      lastModified: new Date("2026-11-12T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続登記の必要書類チェックリスト（2026-11-12 作成、docs/seisaku-queue.md の T11）。
    {
      url: `${baseUrl}/guide/souzoku/touki-shorui`,
      lastModified: new Date("2026-11-12T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の申告を自分でする手順（2026-11-14 作成、docs/seisaku-queue.md の T20）。
    {
      url: `${baseUrl}/guide/souzoku/shinkoku-jibun`,
      lastModified: new Date("2026-11-14T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税申告書の綴じ方と提出の順番（2026-11-19 作成、docs/seisaku-queue.md の T41）。
    {
      url: `${baseUrl}/guide/souzoku/shinkoku-tojikata`,
      lastModified: new Date("2026-11-19T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の0円申告（2026-11-17 作成、docs/seisaku-queue.md の T39）。
    {
      url: `${baseUrl}/guide/souzoku/zero-en-shinkoku`,
      lastModified: new Date("2026-11-17T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の申告期限の計算と、税理士に頼む目安の日（2026-11-23 作成、docs/seisaku-queue.md の T42）。
    {
      url: `${baseUrl}/guide/souzoku/shinkoku-kigen-irai`,
      lastModified: new Date("2026-11-23T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税を税理士に依頼する前の準備（2026-11-24 作成、docs/seisaku-queue.md の T43）。
    {
      url: `${baseUrl}/guide/souzoku/irai-junbi`,
      lastModified: new Date("2026-11-24T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の申告期限を過ぎたときの延滞税・無申告加算税（2026-11-17 作成、docs/seisaku-queue.md の T31）。
    {
      url: `${baseUrl}/guide/souzoku/shinkoku-okure`,
      lastModified: new Date("2026-11-17T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の2割加算の計算（2026-11-17 作成、docs/seisaku-queue.md の T26）。
    {
      url: `${baseUrl}/guide/souzoku/niwari-kasan`,
      lastModified: new Date("2026-11-17T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 死亡退職金の非課税の計算（2026-11-17 作成、docs/seisaku-queue.md の T30）。
    {
      url: `${baseUrl}/guide/souzoku/shibou-taishokukin-hikazei`,
      lastModified: new Date("2026-11-17T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相次相続控除の計算（2026-11-16 作成、docs/seisaku-queue.md の T27）。
    {
      url: `${baseUrl}/guide/souzoku/souji-souzoku-kojo`,
      lastModified: new Date("2026-11-16T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 生前贈与加算の計算（2026-11-15 作成、docs/seisaku-queue.md の T23）。
    {
      url: `${baseUrl}/guide/souzoku/seizen-zouyo-kasan`,
      lastModified: new Date("2026-11-15T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 小規模宅地等の特例の必要書類（2026-11-15 作成、docs/seisaku-queue.md の T24）。
    {
      url: `${baseUrl}/guide/souzoku/shokibo-takuchi-shorui`,
      lastModified: new Date("2026-11-15T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の未成年者控除・障害者控除の計算（2026-11-15 作成、docs/seisaku-queue.md の T25）。
    {
      url: `${baseUrl}/guide/souzoku/miseinen-shougaisha-kojo`,
      lastModified: new Date("2026-11-15T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続人申告登記の必要書類（2026-11-14 作成、docs/seisaku-queue.md の T22）。
    {
      url: `${baseUrl}/guide/souzoku/souzokunin-shinkoku-touki`,
      lastModified: new Date("2026-11-14T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続財産の調べ方チェックリスト（2026-11-13 作成、docs/seisaku-queue.md の T13）。
    {
      url: `${baseUrl}/guide/souzoku/zaisan-shirabekata`,
      lastModified: new Date("2026-11-13T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続の戸籍の集め方チェックリスト（2026-11-13 作成、docs/seisaku-queue.md の T19）。
    {
      url: `${baseUrl}/guide/souzoku/koseki-atsumekata`,
      lastModified: new Date("2026-11-13T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 準確定申告の必要書類チェックリスト（2026-11-12 作成、docs/seisaku-queue.md の T12）。
    {
      url: `${baseUrl}/guide/souzoku/junkakutei-checklist`,
      lastModified: new Date("2026-11-12T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続税の計算（2026-11-10 作成、docs/seisaku-queue.md の S1）。
    {
      url: `${baseUrl}/guide/souzoku/souzokuzei-keisan`,
      lastModified: new Date("2026-11-10T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku/zaisan-mokuroku`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku/jikka-akiya-tokurei`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 給湯器の事情ごとのページ（2026-11-05 公開、docs/kyutoki-seo/schedule.md の P11・P15）。
    {
      url: `${baseUrl}/kyutoki/mitsumori-takai`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/sokujitsu`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/shiharai`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/mansion`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/furo`,
      lastModified: new Date("2026-11-06T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/kodate`,
      lastModified: new Date("2026-11-06T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/nensu`,
      lastModified: new Date("2026-11-07T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/maker`,
      lastModified: new Date("2026-11-07T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の事情ごとのページ（2026-11-08 公開、P9 エコジョーズ・P7 暖房付き）。
    {
      url: `${baseUrl}/kyutoki/ecojozu`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/danbo`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器のエラー番号の早見（2026-11-08 作成、docs/seisaku-queue.md の P17）。
    {
      url: `${baseUrl}/kyutoki/error`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の型番の見方（2026-11-08 作成、docs/seisaku-queue.md の P10）。
    {
      url: `${baseUrl}/kyutoki/kataban`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の相談先（2026-11-08 作成、docs/seisaku-queue.md の P12）。
    {
      url: `${baseUrl}/kyutoki/tanomisaki`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の凍結（2026-11-08 作成、docs/seisaku-queue.md の P18）。
    {
      url: `${baseUrl}/kyutoki/touketsu`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の水漏れ（2026-11-09 作成、docs/seisaku-queue.md の P19）。
    {
      url: `${baseUrl}/kyutoki/mizumore`,
      lastModified: new Date("2026-11-09T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // お湯がぬるい・温度が安定しない（2026-11-09 作成、docs/seisaku-queue.md の P20）。
    {
      url: `${baseUrl}/kyutoki/nurui`,
      lastModified: new Date("2026-11-09T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器「お湯が出ない」診断（2026-10-28 新設）。検索広告の着地ページだが、
    // 本文（目安表・FAQ）はサーバー出力なので自然検索にも載せる。
    {
      url: `${baseUrl}/kyutoki/oyu-ga-denai`,
      lastModified: new Date("2026-10-28T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      // 2026-07-30 追加：中立性ポリシー（広告掲載と運営の方針）。ASP広告の掲載開始前に
      // 公開する静的ページ。記事ではないため、
      // 他の静的ページ（/privacy 等）と同じ扱いにする。
      url: `${baseUrl}/policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // 役立ちガイドTOP（コンテンツのハブ）
    {
      url: `${baseUrl}/guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // デジタル資産ピラー（整理・引き継ぎハブ）
    {
      url: `${baseUrl}/guide/digital-shisan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 調査データ（一次ソース・被引用の核）
    {
      url: `${baseUrl}/guide/research`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/ihinseiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...digitalLegacyGuideSlugs.map((slug) => ({
      url: `${baseUrl}/guide/ihinseiri/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // デジタル整理術（前向き整理の新方針記事。転換導線の主力のため priority 高め）
    {
      url: `${baseUrl}/guide/digital-seiri`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/digital-dansyari`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/account-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/sumaho-kakin-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/sumaho-shashin-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/mail-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/sabusuku-kanri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // パスワード・認証管理
    {
      url: `${baseUrl}/guide/password-kanri`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/password-kanri/sumaho-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 家族間の情報共有（本命ジャンル）
    {
      url: `${baseUrl}/guide/kazoku-kyoyu`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/kazoku-kyoyu/fuufu-joho-kyoyu`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/kazoku-kyoyu/password-account-kyoyu`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/kazoku-kyoyu/joho-kyoyu-hikaku`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 資産・お金の管理
    {
      url: `${baseUrl}/guide/shisan-kanri`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // 保険の比較表（2026-11-10 作成、docs/seisaku-queue.md の T2）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-hikaku-excel`,
      lastModified: new Date("2026-11-10T21:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 保険証券の見方（2026-11-11 作成、docs/seisaku-queue.md の T5）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-shoken-mikata`,
      lastModified: new Date("2026-11-11T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続のページの入口（2026-11-11 作成）。
    // 法人成り（2026-11-16 新設）。運営会社の法人口座の審査の実例。
    {
      url: `${baseUrl}/guide/houjin`,
      lastModified: new Date("2026-11-25T01:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide/houjin/setsuritsu-go-yarukoto`,
      lastModified: new Date("2026-11-25T03:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/kouza-tsukurenai`,
      lastModified: new Date("2026-11-16T18:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/kouza-virtual-office`,
      lastModified: new Date("2026-11-17T19:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/houjin-setsuritsu-todokedesho`,
      lastModified: new Date("2026-11-25T02:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/kouza-hitsuyou-shorui`,
      lastModified: new Date("2026-11-17T10:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/kouza-kaisetsu-kikan`,
      lastModified: new Date("2026-11-17T03:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/raksulbank`,
      lastModified: new Date("2026-11-16T19:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/paypay-houjin-kouza`,
      lastModified: new Date("2026-11-16T19:30:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/aoiro-shinsei-houjin`,
      lastModified: new Date("2026-11-25T02:30:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/houjin/kyuujitai-touki`,
      lastModified: new Date("2026-11-16T20:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/houjin/rireki-jikou-shoumeisho`,
      lastModified: new Date("2026-11-25T04:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku`,
      lastModified: new Date("2026-11-11T14:00:00+09:00"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // 住宅ローンの団信と生命保険の見直し（2026-11-19 作成、docs/seisaku-queue.md の T33）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-danshin`,
      lastModified: new Date("2026-11-19T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 50代の医療保険の見直しチェックリスト（2026-11-22 作成、docs/seisaku-queue.md の T38）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-50dai`,
      lastModified: new Date("2026-11-22T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // がん保険の見直しチェックリスト（2026-11-21 作成、docs/seisaku-queue.md の T37）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-gan`,
      lastModified: new Date("2026-11-21T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 離婚したときの保険の見直し（2026-11-20 作成、docs/seisaku-queue.md の T35）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-rikon`,
      lastModified: new Date("2026-11-20T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 子どもが独立したときの保険の見直し（2026-11-19 作成、docs/seisaku-queue.md の T34）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-dokuritsu`,
      lastModified: new Date("2026-11-19T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 定年退職のときの保険の見直しチェックリスト（2026-11-17 作成、docs/seisaku-queue.md の T29）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-teinen`,
      lastModified: new Date("2026-11-17T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 結婚したときの保険の見直しチェックリスト（2026-11-16 作成、docs/seisaku-queue.md の T28）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-kekkon`,
      lastModified: new Date("2026-11-16T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 子どもが生まれたときの保険の見直しチェックリスト（2026-11-14 作成、docs/seisaku-queue.md の T21）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-shussan`,
      lastModified: new Date("2026-11-14T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 生命保険の見直しチェックリスト（2026-11-10 作成、docs/seisaku-queue.md の T3）。
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-minaoshi-checklist`,
      lastModified: new Date("2026-11-10T23:30:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-ichiran-excel`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/shisan-kanri/toshi-kazoku`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 親・家族のケア
    // もしもの備え
    {
      url: `${baseUrl}/guide/moshimo-sonae`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/moshimo-sonae/kyu-nyuin-sonae`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // コラム（提言型読み物）
    {
      url: `${baseUrl}/guide/column`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/column/okane-kanri-kichinto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
