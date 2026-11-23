import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告期限と、税理士に頼む目安の日の計算（サーバーと画面の両方で使う。2026-11-23）。
 * 期限の数え方は components/souzoku/ZeroShinkokuCheck.tsx・JunkakuteiCheck.tsx の kigenDate と同じ形（国税通則法10条1項）。
 * 休みの繰り下げ：土日・祝日（内閣府の表の2026・2027年）・12/29〜1/3（同10条2項・施行令2条2項）。
 */
const K = DATA.kigenIrai;

/** 「知った日の翌日から n か月以内」の最後の日：翌日から数えて n か月後の応当日の前の日。応当日がない月・月末に知ったときはその月の末日。 */
export function kigenDate(d: Date, n: number) {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const y = next.getFullYear();
  const m = next.getMonth() + n;
  const dd = next.getDate() - 1;
  if (dd === 0) return new Date(y, m, 0);
  return new Date(y, m, Math.min(dd, new Date(y, m + 1, 0).getDate()));
}
const SHUKU = new Set(DATA.shukujitsu.days);
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** 土日・祝日・12/29〜1/3 なら次の日へ。 */
export function yasumiAke(d: Date) {
  const x = new Date(d);
  for (let i = 0; i < 15; i++) {
    const w = x.getDay();
    const mo = x.getMonth() + 1;
    const da = x.getDate();
    if (w === 0 || w === 6 || (mo === 12 && da >= 29) || (mo === 1 && da <= 3) || SHUKU.has(ymd(x))) x.setDate(x.getDate() + 1);
    else break;
  }
  return x;
}
/** 祝日を見られる年か（内閣府の表にある年だけ）。 */
export const shukuKnown = (d: Date) => DATA.shukujitsu.days.some((s) => s.startsWith(`${d.getFullYear()}-`));

/** 知った日から、申告期限（休みの明けた日）と、繰り下げる前の10か月目の日を返す。 */
export function shinkokuKigen(shitta: Date) {
  const raw = kigenDate(shitta, K.kigenN);
  return { raw, kigen: yasumiAke(raw) };
}

/**
 * 知った日から、並べる日付の一覧を返す（古い順）。
 * 準確定申告と相続税の期限は、休みなら明けた日へ（国税通則法10条2項）。頼む目安の日は、つぎの手ナビの目安なので後ろへずらさない。
 * 早めに頼む目安（4か月後）は準確定申告の期限と同じ行にまとめる。
 */
export function iraiList(shitta: Date) {
  const { kigen } = shinkokuKigen(shitta);
  const hayame = K.irai.find((r) => r.key === 'hayame')!;
  return [
    { key: 'houki', h: '相続放棄・限定承認の期限の目安', d: kigenDate(shitta, 3), sub: '家庭裁判所。相続人になったと知った時から3か月（先の順位の人が放棄して相続人になったときは、その時から数えます）。休みの日でもずらしていないので、早めに', kind: 'hoka' as const },
    { key: 'junkakutei', h: '準確定申告の期限（早めに頼む目安）', d: yasumiAke(kigenDate(shitta, 4)), sub: `亡くなった人の所得税（申告が要る場合）。知った日の翌日から4か月。${hayame.d}`, kind: 'irai' as const },
    ...K.irai.filter((r) => r.key !== 'hayame').map((r) => ({ key: r.key, h: r.h, d: kigenDate(shitta, r.ato), sub: r.d, kind: 'irai' as const })),
    { key: 'kigen', h: '相続税の申告と納税の期限', d: kigen, sub: K.teishutsu, kind: 'kigen' as const },
  ];
}

/** 一覧に出す日付の年のうち、祝日のデータがない年。 */
export function shukuNashi(dates: Date[]) {
  return [...new Set(dates.map((d) => d.getFullYear()))].filter((y) => !shukuKnown(new Date(y, 0, 1))).sort();
}

/** 今日が、頼む目安のどこにいるか。 */
export function imaNoIchi(today: Date, shitta: Date) {
  const { kigen } = shinkokuKigen(shitta);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const nokori = Math.round((kigen.getTime() - t.getTime()) / 86400000);
  const at = (n: number) => kigenDate(shitta, n);
  let ichi: string;
  if (nokori < 0) ichi = '期限を過ぎています。できるだけ早く申告して納めます。';
  else if (nokori === 0) ichi = '今日が期限です。今日のうちに申告して納めます。';
  else if (t > at(9)) ichi = '期限まで1か月を切っています。頼むなら、受けてもらえるかをすぐに問い合わせる時期です。';
  else if (t > at(7)) ichi = '期限の3か月前を過ぎています。頼むなら、早めに問い合わせたい時期です。';
  else if (t > at(4)) ichi = '頼むなら、期限の3か月前までに。遺産の一覧と戸籍がそろっていると話が早く進みます。';
  else ichi = 'まだ早めの時期です。準確定申告の期限のころまでに頼むと、評価と分け方に時間を残せます。';
  return { nokori, ichi };
}
