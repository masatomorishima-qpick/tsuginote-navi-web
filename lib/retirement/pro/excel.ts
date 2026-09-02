/**
 * lib/retirement/pro/excel.ts — 結果の Excel（4シート）を作る（A-2a-3）
 *
 * ★シートと列は、基準HTMLの画面8「ファイルの中身」の字と、戦術Coworkの決め（senjutsu_20260902y.md 1番・ad.md 3番）のとおり。
 *   1 結果のまとめ　　　画面8と同じ内容（あなたの受け取り方・税金・手取り・保険料が上がる年齢）── `Gamen8`・`Bun8` から
 *   2 受け取り方の一覧　全通り（`D`）。受け取り方／税金／手取り／最初の年に入る額／受け取り終わる年齢／保険料が上がる年齢
 *   3 年ごとの内訳　　　★この便では「結論の案」と「⑳をそろえた一時金の案」の2本だけ（9〜12 の便で「画面に出た受け取り方」に広げる）。
 *                        番号・年・年齢・その年に手元に入る額・その年に納める税金（1歳きざみの通し）
 *   4 計算の内容と根拠　ご入力の28項目（ラベルは `PAID_FIELDS` の字・値は raw）＋ 根拠にした条文（`gamen13.ts`）。★「計算の全ステップ」は 9〜12 の便
 *
 * ★★ここに式はありません。数は全部 `D`・`R`・`Gamen8` から写すだけです。
 * ★保険料の字は画面9の2つ（`保険料は変わりません`／`◯歳から保険料が上がる場合があります`）。金額は出しません。
 * ★シート2に「番号」の列を先頭に足しています（★シート3の「番号」が指す先。仕様の列に無い1列・便に書きます）。
 * ★道具は exceljs（MIT・4.4.0）。★書式なし・共有文字列なし（stream）。この本だけが読み込みます（`server-only`）。
 */

import 'server-only';
import { PassThrough } from 'node:stream';
import ExcelJS from 'exceljs';
import type { Keisan } from './kekka';
import type { PaidInput } from './paidInput';
import type { Row } from './gamen8';
import { PAID_FIELDS } from '@/components/retirement/pro/paidFields';
import { GAMEN13 } from '@/components/retirement/pro/gamen13';
import { hitogotoBun } from '@/components/retirement/pro/gamen13Bun';
import { paidKou, ranWoHiku, type Kou } from './paidRules';

/** 保険料の字（画面9の字・2つ） */
export function hokenNoJi(x: Row): string {
  if (x.h.length === 0) return '保険料は変わりません';
  const age = Math.min(...x.h.map((k) => k.age));
  return `${age}歳から保険料が上がる場合があります`;
}

/** ⑳を結論の案にそろえた「一時金の案」（senjutsu_20260902x.md 2番・y.md 2番）。★無ければ null（400人では0人） */
export function ichijikinNoAn(k: Keisan, idecoName: string): Row | null {
  const ketsuron = k.D.find((x) => x.lab === k.g8.houkou[0]?.lab) ?? null;
  const ketsu20 = ketsuron?.pl.nenkin_kaishi_age ?? k.p.koteki_kaishi_age;
  const kijunNen = k.g8.kijun.kijun_nen;
  const ko = k.D.filter((x) =>
    x.pl.nenkin_gen === null && x.pl.ichiji_wariai === 0
    && x.pl.uketori_nen[idecoName] === kijunNen
    && Object.entries(x.pl.uketori_nen).every(([n, y]) => n === idecoName || y === k.taishokuNen)
    && (x.pl.nenkin_kaishi_age ?? k.p.koteki_kaishi_age) === ketsu20);
  if (!ko.length) return null;
  // ★複数あれば kijunAn() と同じ並び（手取り → ラベル順）
  return ko.reduce((a, b) => (b.tedori - a.tedori || (a.pl.label <= b.pl.label ? -1 : 1)) > 0 ? b : a);
}

/** 28項目の raw を「ラベル｜値」の行に（★値は raw の字のまま。複数の欄は鍵ごとに1行） */
function nyuryokuNoGyou(kou: readonly Kou[], raw: Record<string, string>): [string, string][] {
  const out: [string, string][] = [];
  for (const f of PAID_FIELDS) {
    const k = kou.find((x) => x.no === f.no);
    const kagis = Object.keys(raw).filter((x) => x === f.no || x.startsWith(`${f.no}/`)).sort();
    if (!k || kagis.length === 0) { out.push([f.label, '']); continue; }
    for (const kagi of kagis) {
      const r = ranWoHiku(kou, kagi);
      const v = raw[kagi];
      const ji = r?.sentaku ? (r.sentaku.find((s) => s.kagi === v)?.ji ?? v)
        : r?.shurui === 'hai' ? (v === 'hai' ? 'はい' : 'いいえ')
        : v === 'wakaranai' ? 'わからない'
        : r?.tani ? `${v}${r.tani}` : v;
      out.push([kagi === f.no ? f.label : `${f.label}（${kagi.slice(f.no.length + 1)}）`, ji]);
    }
  }
  return out;
}

/**
 * 4シートの .xlsx を作って bytes で返します。
 */
export async function excelWoTsukuru(k: Keisan, v: PaidInput, raw: Record<string, string>): Promise<Uint8Array> {
  const stream = new PassThrough();
  const chunks: Buffer[] = [];
  stream.on('data', (c: Buffer) => chunks.push(c));
  const owatta = new Promise<void>((resolve, reject) => { stream.on('end', resolve); stream.on('error', reject); });

  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useStyles: false, useSharedStrings: false });
  const { g8, D, R, p } = k;
  const b = k.kekka.bun8;

  // ---- 1 結果のまとめ
  const s1 = wb.addWorksheet('結果のまとめ');
  s1.addRow([b.midashi.join('')]).commit();
  s1.addRow([b.atama.lbl.replace(/\n/g, ''), b.atama.ookii]).commit();
  if (b.atama.sub) s1.addRow([b.atama.sub]).commit();
  s1.addRow([b.judge.hon.replace(/\n/g, '')]).commit();
  if (b.judge.hosoku) s1.addRow([b.judge.hosoku]).commit();
  s1.addRow([]).commit();
  s1.addRow(['あなたの受け取り方', '税金', '手取り', '保険料が上がる年齢', '見方']).commit();
  for (const h of g8.houkou) {
    const row = D.find((x) => x.lab === h.lab);
    s1.addRow([h.lab, h.zei, h.tedori, row ? hokenNoJi(row) : '', h.mikata.join('／')]).commit();
  }
  s1.commit();

  // ---- 2 受け取り方の一覧（全通り）
  const s2 = wb.addWorksheet('受け取り方の一覧');
  s2.addRow(['番号', '受け取り方', '税金', '手取り', '最初の年に入る額', '受け取り終わる年齢', '保険料が上がる年齢']).commit();
  D.forEach((x, i) => { s2.addRow([i + 1, x.lab, x.zei, x.tedori, x.age0, x.owari, hokenNoJi(x)]).commit(); });
  s2.commit();

  // ---- 3 年ごとの内訳（★この便では2本）
  const s3 = wb.addWorksheet('年ごとの内訳');
  s3.addRow(['番号', '年', '年齢', 'その年に手元に入る額', 'その年に納める税金']).commit();
  const ketsuron = D.find((x) => x.lab === g8.houkou[0]?.lab) ?? null;
  const ichiji = ichijikinNoAn(k, 'iDeCo等');
  const an = [ketsuron, ichiji].filter((x): x is Row => x !== null);
  const seen = new Set<Row>();
  for (const x of an) {
    if (seen.has(x)) continue;
    seen.add(x);
    const i = D.indexOf(x);
    const r = R[i][1];
    const ys = [...Object.keys(r.detail).map(Number), ...r.keika.map((kk) => kk.year)];
    const first = Math.min(...ys);
    const last = r.saishu_nen ?? Math.max(...ys);
    for (let y = first; y <= last; y++) {
      const a = p.age(y);
      s3.addRow([i + 1, y, a, r.cash?.[a] ?? 0, r.harau?.[y] ?? 0]).commit();
    }
  }
  s3.commit();

  // ---- 4 計算の内容と根拠
  const s4 = wb.addWorksheet('計算の内容と根拠');
  s4.addRow(['ご入力の内容']).commit();
  for (const [l, val] of nyuryokuNoGyou(paidKou(k.kekka.genzaiNen), raw)) s4.addRow([l, val]).commit();
  s4.addRow([]).commit();
  s4.addRow(['根拠にした条文']).commit();
  for (const blk of GAMEN13) {
    if (blk.kind === 'hyo') {
      for (const g of blk.gyou) {
        if (g.hitogoto) {
          // ★その方によって変わる行：縮めた年がある方だけ（ari:true・画面13と同じ文）。無い方は行ごと出さない
          const bun = hitogotoBun(k.kekka.hitogoto13)[g.hidari];
          if (!bun) continue;
          s4.addRow([g.hidari, bun]).commit();
          continue;
        }
        s4.addRow([g.hidari, g.migi]).commit();
      }
    } else if (blk.kind === 'ret') {
      for (const kk of blk.koumoku) s4.addRow(['', kk]).commit();
    } else {
      s4.addRow([blk.bun]).commit();
    }
  }
  s4.commit();

  void v;
  await wb.commit();
  await owatta;
  return new Uint8Array(Buffer.concat(chunks));
}
