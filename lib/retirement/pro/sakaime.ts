/** sakaime.ts ── 所得の「境目」の判定（engine/sakaime.py の移植）
 *  金額ではなく境目を出す。境目の金額は政令で全国共通のものが多いため。 */
import type { Joukyou } from './engine';

// 令和8年度。毎年改定されるので更新が必要
export const KEIGEN_BASE = 430_000;   // 地方税法314条の2第2項1号の額
export const KEIGEN_5WARI = 310_000;  // 令和7年度は305,000円
export const KEIGEN_2WARI = 570_000;  // 令和7年度は560,000円
export const NENKIN_15MAN = 150_000;  // 65歳以上の公的年金等所得からの控除
export const HIKAZEI: Record<number, number> = { 1: 450_000, 2: 415_000, 3: 380_000 };

// 医療費の窓口負担（高齢者医療確保法施行令7条）
const IRYO3_KAZEI = 1_450_000, IRYO3_SHUNYU_TANSHIN = 3_830_000, IRYO3_SHUNYU_FUKUSU = 5_200_000;
const IRYO3_SOSHOTOKU = 2_100_000;
const IRYO2_KAZEI = 280_000, IRYO2_NENKIN_TANSHIN = 2_000_000, IRYO2_NENKIN_FUKUSU = 3_200_000;
const KOJO_KISO = 430_000;
// 介護保険料の所得段階（介護保険法施行令38条1項）
const KAIGO_1DAN = 826_500, KAIGO_2DAN = 1_200_000;

type V = Partial<Joukyou> & { nenkin_zatsu: number; goukei: number; kazei: number };

/** 軽減判定所得。退職所得は含めない（施行令29条の7第6項の列挙にない）。
 *  15万円を引くのは公的年金等の所得の部分だけ。給与所得はそのまま足す（A-22） */
export function keigenHanteiShotoku(age: number, nenkinZatsu: number, sonotaShotoku = 0): number {
  let n = nenkinZatsu;
  if (age >= 65) n = Math.max(0, n - NENKIN_15MAN);
  return n + sonotaShotoku;
}

/** 「公的年金等の収入金額 ＋（合計所得金額 − 公的年金等に係る雑所得）」 */
export function nenkinShunyuTou(v: V): number {
  return (v.nenkin_shunyu ?? 0) + Math.max(0, v.goukei - v.nenkin_zatsu);
}
/** 高確法施行令7条5項1号の「収入の額」（概算・省令の原文は未確認） */
function shunyuGaku(v: V): number { return (v.nenkin_shunyu ?? 0) + (v.kyuyo_shunyu ?? 0); }

/** 70歳以上の3割負担になるか（高確法施行令7条4項・5項。5項に除外が4つある） */
export function iryo3wari(v: V, hihokensha = 1): boolean {
  if (v.kazei < IRYO3_KAZEI) return false;
  if (v.hikazei) return false;                                        // 5項4号
  const kijun = hihokensha === 1 ? IRYO3_SHUNYU_TANSHIN : IRYO3_SHUNYU_FUKUSU;
  if (shunyuGaku(v) < kijun) return false;                            // 5項1号・2号
  if (Math.max(0, v.goukei - KOJO_KISO) <= IRYO3_SOSHOTOKU) return false;  // 5項3号
  return true;
}
/** 75歳以上の2割負担になるか（高確法施行令7条2項・3項） */
export function iryo2wari(v: V, hihokensha = 1): boolean {
  if (v.kazei < IRYO2_KAZEI) return false;
  if (v.hikazei) return false;                                        // 3項2号
  const kijun = hihokensha === 1 ? IRYO2_NENKIN_TANSHIN : IRYO2_NENKIN_FUKUSU;
  return nenkinShunyuTou(v) >= kijun;                                 // 3項1号
}
/** 介護保険料の所得段階（単身）。課税者は第6段階以降で境目が全国共通でないため null */
export function kaigoDankai(v: V): number | null {
  if (!v.hikazei) return null;
  const t = nenkinShunyuTou(v);
  if (t <= KAIGO_1DAN) return 1;
  if (t <= KAIGO_2DAN) return 2;
  return 3;
}

export interface Sakaime {
  key: string; name: string; shotoku: string; gaku: number;
  age_from: number; age_to: number; kyotsu: boolean; konkyo: string; koka: string;
  hantei?: (v: V, hihokensha: number) => boolean;
}

export function sakaimeList(hihokensha = 1, kyuyoShotokusha = 1, kyuchi = 1): Sakaime[] {
  const base = KEIGEN_BASE + 100_000 * Math.max(0, kyuyoShotokusha - 1);
  return [
    { key: 'keigen7', name: '国民健康保険料などの7割軽減', shotoku: '軽減判定所得',
      gaku: base, age_from: 0, age_to: 200, kyotsu: true,
      konkyo: '国民健康保険法施行令29条の7第6項／高齢者医療確保法施行令18条5項',
      koka: '軽減が7割から5割に下がります' },
    { key: 'keigen5', name: '国民健康保険料などの5割軽減', shotoku: '軽減判定所得',
      gaku: base + KEIGEN_5WARI * hihokensha, age_from: 0, age_to: 200, kyotsu: true,
      konkyo: '同上', koka: '軽減が5割から2割に下がります' },
    { key: 'keigen2', name: '国民健康保険料などの2割軽減', shotoku: '軽減判定所得',
      gaku: base + KEIGEN_2WARI * hihokensha, age_from: 0, age_to: 200, kyotsu: true,
      konkyo: '同上', koka: '軽減がなくなります' },
    { key: 'hikazei', name: '住民税の非課税', shotoku: '合計所得金額',
      gaku: HIKAZEI[kyuchi], age_from: 0, age_to: 200, kyotsu: false,
      konkyo: '地方税法295条3項／同施行令47条の3（お住まいの級地で45万円・41.5万円・38万円）',
      koka: '住民税がかかり始めます。介護保険料の段階や医療費の負担にも連動します' },
    { key: 'kaigo1', name: '介護保険料の段階（第1段階から第2段階へ）', shotoku: '年金収入等',
      gaku: KAIGO_1DAN, age_from: 65, age_to: 200, kyotsu: true,
      hantei: (v) => { const d = kaigoDankai(v); return d !== null && d >= 2; },
      konkyo: '介護保険法施行令38条1項1号ハ（住民税が非課税の方の判定です）',
      koka: '介護保険料の段階が1つ上がります' },
    { key: 'kaigo2', name: '介護保険料の段階（第2段階から第3段階へ）', shotoku: '年金収入等',
      gaku: KAIGO_2DAN, age_from: 65, age_to: 200, kyotsu: true,
      hantei: (v) => { const d = kaigoDankai(v); return d !== null && d >= 3; },
      konkyo: '介護保険法施行令38条1項2号イ（住民税が非課税の方の判定です）',
      koka: '介護保険料の段階が1つ上がります' },
    { key: 'iryo2wari', name: '医療費の2割負担（75歳以上）', shotoku: '課税所得',
      gaku: IRYO2_KAZEI, age_from: 75, age_to: 200, kyotsu: true,
      hantei: (v, h) => iryo2wari(v, h),
      konkyo: '高齢者医療確保法施行令7条2項・3項（課税所得28万円以上、かつ「公的年金等の収入金額＋（合計所得金額−公的年金等の雑所得）」が単身200万円以上・複数世帯320万円以上の場合）',
      koka: '窓口でお支払いになる割合が1割から2割に上がります' },
    { key: 'iryo3wari', name: '医療費の3割負担（70歳以上）', shotoku: '課税所得',
      gaku: IRYO3_KAZEI, age_from: 70, age_to: 200, kyotsu: true,
      hantei: (v, h) => iryo3wari(v, h),
      konkyo: '高齢者医療確保法施行令7条4項・5項（課税所得145万円以上でも、収入が単身383万円・複数世帯520万円に満たない場合、基礎控除後の総所得金額等の合算が210万円以下の場合、住民税が非課税の場合は3割になりません）',
      koka: '窓口でお支払いになる割合が3割に上がります' },
  ];
}

function valOf(s: Sakaime, age: number, v: V): number {
  if (s.shotoku === '軽減判定所得') return keigenHanteiShotoku(age, v.nenkin_zatsu, v.kyuyo ?? 0);
  if (s.shotoku === '合計所得金額') return v.goukei;
  if (s.shotoku === '年金収入等') return nenkinShunyuTou(v);
  return v.kazei ?? 0;
}

/** 軽減判定所得から、受けられる軽減の割合（7・5・2・0） */
export function keigenWariai(shotoku: number, hihokensha = 1, kyuyoShotokusha = 1): number {
  const base = KEIGEN_BASE + 100_000 * Math.max(0, kyuyoShotokusha - 1);
  if (shotoku <= base) return 7;
  if (shotoku <= base + KEIGEN_5WARI * hihokensha) return 5;
  if (shotoku <= base + KEIGEN_2WARI * hihokensha) return 2;
  return 0;
}

const KARA: V = { nenkin_zatsu: 0, kyuyo: 0, goukei: 0, kazei: 0,
                  nenkin_shunyu: 0, kyuyo_shunyu: 0, hikazei: true } as V;

/**
 * 新たに超えた境目1件。**画面8の文は、ここの `shotoku` `shotoku_gaku` `gaku` を使います**
 * （E-27。名前と年齢だけでは「あなたの◯◯◯円／基準◯◯◯円」が書けません）
 */
export type Koeta = Omit<Sakaime, 'hantei' | 'age_from' | 'age_to'> & {
  /** 軽減（`keigen`）の行には入りません。`sakaimeList()` 由来の行にだけ付きます */
  age_from?: number;
  age_to?: number;
  /** 何歳で超えるか */
  age: number;
  /** その方の、その所得の額 */
  shotoku_gaku: number;
  /** 受け取らなかった場合の額 */
  moto: number;
  /** 基準からの超過額 */
  chokka: number;
  /** 軽減の割合（`keigen` のときだけ） */
  mae?: number;
  ato?: number;
};

/** iDeCo等を受け取ることで**新たに**超える境目だけを返す */
export function check(ari: Record<number, V>, nashi: Record<number, V>,
                      hihokensha = 1, kyuyoShotokusha = 1, kyuchi = 1): Koeta[] {
  const out: Koeta[] = [];
  const ages = Object.keys(ari).map(Number).sort((a, b) => a - b);
  // 軽減は7・5・2の3段階だが、伝えるべきは「何割から何割に下がるか」1つだけ
  for (const age of ages) {
    const a = keigenHanteiShotoku(age, ari[age].nenkin_zatsu, ari[age].kyuyo ?? 0);
    const _n = nashi[age] ?? ({ nenkin_zatsu: 0, kyuyo: 0 } as V);
    const n = keigenHanteiShotoku(age, _n.nenkin_zatsu, _n.kyuyo ?? 0);
    const wa = keigenWariai(a, hihokensha, kyuyoShotokusha);
    const wn = keigenWariai(n, hihokensha, kyuyoShotokusha);
    if (wa < wn) {
      const base = KEIGEN_BASE + 100_000 * Math.max(0, kyuyoShotokusha - 1);
      const gaku = wn === 7 ? base : (wn === 5 ? base + KEIGEN_5WARI * hihokensha
                                               : base + KEIGEN_2WARI * hihokensha);
      out.push({ key: 'keigen', name: '国民健康保険料などの軽減', shotoku: '軽減判定所得',
        gaku, age, shotoku_gaku: a, moto: n, chokka: a - gaku, kyotsu: true,
        konkyo: '国民健康保険法施行令29条の7第6項（保険料）／地方税法703条の5・同法附則35条の5（保険税）／高齢者医療確保法施行令18条5項',
        koka: wa === 0 ? `軽減が${wn}割からなくなります` : `軽減が${wn}割から${wa}割に下がります`,
        mae: wn, ato: wa });
      break;
    }
  }
  for (const s of sakaimeList(hihokensha, kyuyoShotokusha, kyuchi)) {
    if (s.key.startsWith('keigen')) continue;
    for (const age of ages) {
      if (!(s.age_from <= age && age <= s.age_to)) continue;
      const va = ari[age], vn = nashi[age] ?? KARA;
      if (s.hantei) {
        if (s.hantei(va, hihokensha) && !s.hantei(vn, hihokensha)) {
          const a = valOf(s, age, va);
          // `hantei` は関数なので戻り値には入れない。**分割代入で捨てると
          //   「使っていない変数」になる**ので、要るものだけ明示で組み立てます
          out.push({
            key: s.key, name: s.name, shotoku: s.shotoku, gaku: s.gaku,
            age_from: s.age_from, age_to: s.age_to, kyotsu: s.kyotsu,
            konkyo: s.konkyo, koka: s.koka,
            age, shotoku_gaku: a, moto: valOf(s, age, vn),
            chokka: Math.max(0, a - s.gaku),
          });
          break;
        }
        continue;
      }
      const a = valOf(s, age, va), n = valOf(s, age, vn);
      if (a > s.gaku && s.gaku >= n) {   // 新たに超える場合だけ
        out.push({ ...s, age, shotoku_gaku: a, moto: n, chokka: a - s.gaku });
        break;
      }
    }
  }
  return out;
}
