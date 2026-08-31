/** hantei.ts ── 無料版の判定（4分岐。engine/hantei.py の移植）
 *  対象外／空ければ解決／金額が小さい／空けられない
 *  **判定もエンジンで計算する。別式を持たせない**（A-11） */
import * as E from './engine';

export const IDECO_KIGEN_AGE = 75;      // 老齢給付金の請求期限
export const SPAN_IDECO_SAKI = 10;      // iDeCo等が先：前年以前9年内 → 10年以上空ければ調整なし
export const SPAN_TAISHOKU_SAKI = 20;   // 退職金が先：前年以前19年内 → 20年以上空ければ調整なし
export const SHIKII = 100_000;          // 「金額が小さい」の境目

function hito(taishokukin: number, kinzokuNensu: number, zandaka: number,
              kanyuNensu: number, uketoriNen: number, seinen: number): E.Jinbutsu {
  const owari = E.ym(uketoriNen, 3);
  return new E.Jinbutsu({ seinen, gens: [
    new E.Gen('退職金', Math.trunc(taishokukin), [owari - Math.trunc(kinzokuNensu) * 12 + 1, owari]),
    new E.Gen('iDeCo等', Math.trunc(zandaka), [owari - Math.trunc(kanyuNensu) * 12 + 1, owari], true),
  ]});
}

/** iDeCo等を先に受け取ったことで、退職金にかかる税額がいくら増えるか */
export function fueruZei(taishokukin: number, kinzokuNensu: number, zandaka: number,
                         kanyuNensu: number, uketoriNen: number,
                         seinen: number): [number, E.KeikaRow | null] {
  const p = hito(taishokukin, kinzokuNensu, zandaka, kanyuNensu, uketoriNen, seinen);
  const nashi = new E.Jinbutsu({ seinen: p.seinen, umare: p.umare, gens: [p.gens[0]],
    koteki_nenkin: p.koteki_nenkin, koteki_kaishi_age: p.koteki_kaishi_age });
  const [t0] = E.taishokuByYear(nashi, new E.Plan({ uketori_nen: { '退職金': uketoriNen } }));
  const [t1, k1] = E.taishokuByYear(p, new E.Plan({
    uketori_nen: { '退職金': uketoriNen, 'iDeCo等': uketoriNen - 1 } }));
  const zei = (shotoku: number) =>
    E.nenkanZei(nashi, uketoriNen, 0, shotoku, false) - E.nenkanZei(nashi, uketoriNen, 0, 0, false);
  const sa = zei(t1[uketoriNen] ?? 0) - zei(t0[uketoriNen] ?? 0);
  const ima = k1.filter(k => k.year === uketoriNen);
  return [sa, ima.length ? ima[0] : null];
}

export interface Hantei {
  branch: '対象外' | '空ければ解決' | '金額が小さい' | '空けられない';
  riyu: string; sa: number; keikoku: string[];
  kaiketsu?: string; saitan?: number; keika?: E.KeikaRow | null;
}

export function hantei(taishokukin: number, kinzokuNensu: number, zandaka: number,
                       kanyuNensu: number, taishokuAge: number,
                       uketoriNen: number, shikii = SHIKII): Hantei {
  const keikoku: string[] = [];
  if (taishokuAge - kinzokuNensu < 18)
    keikoku.push(`入社年齢が${taishokuAge - kinzokuNensu}歳になります。あなたの勤続年数か、受け取る年齢をご確認ください`);
  if (kanyuNensu > kinzokuNensu + 10)
    keikoku.push('あなたのiDeCo等の加入期間が勤続年数を大きく超えています。転職前の期間を含んでいませんか');

  const out = (branch: Hantei['branch'], riyu: string, sa = 0,
               kw: Partial<Hantei> = {}): Hantei =>
    ({ branch, riyu, sa, keikoku, ...kw });

  if (zandaka <= 0 || kanyuNensu <= 0)
    return out('対象外', 'あなたにiDeCo・企業型DC・小規模企業共済がないため、比べる受け取り方がありません');
  if (taishokukin <= 0)
    return out('対象外', 'あなたに退職金がないため、比べる受け取り方がありません');

  const seinen = uketoriNen - Math.trunc(taishokuAge);
  const [sa, keika] = fueruZei(taishokukin, kinzokuNensu, zandaka, kanyuNensu, uketoriNen, seinen);

  if (sa <= 0) {
    const k = keika ? keika.kojo_adj : 0;
    return out('対象外', `調整後の退職所得控除${k.toLocaleString('en-US')}円でも、あなたの退職金${Math.trunc(taishokukin).toLocaleString('en-US')}円が収まるため、税額は変わりません`, 0, { keika });
  }

  // 【A-11】iDeCo等を受け取れる最も早い年齢は60歳固定ではない（確定拠出年金法33条1項）
  const saitan = E.idecoSaitanAge(Math.trunc(kanyuNensu) * 12);   // 【E-14】月で渡す
  if (taishokuAge - saitan >= SPAN_IDECO_SAKI)
    return out('空ければ解決',
      `あなたのiDeCo等を${saitan}歳で先に受け取り、退職金を${taishokuAge}歳で受け取れば${taishokuAge - saitan}年空きます。${SPAN_IDECO_SAKI}年以上空けば調整はかかりません`,
      sa, { kaiketsu: `iDeCo等を${saitan}歳で先に受け取る`, saitan, keika });
  if (IDECO_KIGEN_AGE - taishokuAge >= SPAN_TAISHOKU_SAKI)
    return out('空ければ解決',
      `あなたが退職金を${taishokuAge}歳で受け取り、iDeCo等を${IDECO_KIGEN_AGE}歳まで待てば${IDECO_KIGEN_AGE - taishokuAge}年空きます。${SPAN_TAISHOKU_SAKI}年以上空けば調整はかかりません`,
      sa, { kaiketsu: `iDeCo等を${IDECO_KIGEN_AGE}歳まで待つ`, saitan, keika });

  if (sa < shikii)
    return out('金額が小さい',
      `あなたに増える税額は${sa.toLocaleString('en-US')}円です。有料版の19,800円に見合わない可能性が高いため、おすすめしません`,
      sa, { saitan, keika });

  return out('空けられない',
    `あなたのiDeCo等を受け取れるのは${saitan}歳から${IDECO_KIGEN_AGE}歳です。${taishokuAge}歳で退職金を受け取る場合、iDeCo等が先なら${SPAN_IDECO_SAKI}年、退職金が先なら${SPAN_TAISHOKU_SAKI}年を空ける必要がありますが、どちらも空きません`,
    sa, { saitan, keika });
}
