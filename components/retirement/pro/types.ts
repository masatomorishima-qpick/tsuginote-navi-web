/**
 * components/retirement/pro/types.ts
 *
 * 無料版（画面1〜5-6）で扱う入力の型。**5項目だけ**です（実装指示書 v4 §5-1）。
 * **増やさないでください。**追加入力を求める段は反応が1/3になる実測があります。
 *
 * 単位は画面の単位そのままで持ちます（万円・年・歳）。
 * エンジンに渡すときに円へ直します（`toEngineInput()`）。
 * **画面の値と保持する値の単位をそろえておかないと、100倍・1万倍の事故が起きます。**
 */

/** 画面1の5項目。①〜⑤は指示書・入力対応表の番号と一致させています */
export type FreeInput = {
  /** ① あなたの退職金の見込額（万円） */
  taishokukinMan: number;
  /** ② あなたの勤続年数（年） */
  kinzokuNensu: number;
  /** ③ あなたのiDeCo等の残高（万円） */
  idecoMan: number;
  /** ④ あなたが③に加入していた期間（年） */
  kanyuNensu: number;
  /** ⑤ あなたが退職金を受け取る予定の年齢（歳） */
  taishokuAge: number;
};

export type FieldNo = 1 | 2 | 3 | 4 | 5;

/** 入力欄の定義。ラベル・単位・範囲を1か所にまとめる（画面と検証がずれないように） */
export const FIELDS: ReadonlyArray<{
  no: FieldNo;
  key: keyof FreeInput;
  label: string;
  note?: string;
  unit: string;
  min: number;
  max: number;
  placeholder: string;
}> = [
  { no: 1, key: 'taishokukinMan', label: '① あなたの退職金の見込額',
    unit: '万円', min: 0, max: 20_000, placeholder: '2,000' },
  { no: 2, key: 'kinzokuNensu', label: '② あなたの勤続年数',
    unit: '年', min: 1, max: 60, placeholder: '38' },
  { no: 3, key: 'idecoMan', label: '③ あなたのiDeCo等の残高',
    note: 'iDeCo・企業型DC・小規模企業共済', unit: '万円', min: 0, max: 20_000, placeholder: '500' },
  { no: 4, key: 'kanyuNensu', label: '④ あなたが③に加入していた期間',
    unit: '年', min: 1, max: 60, placeholder: '20' },
  { no: 5, key: 'taishokuAge', label: '⑤ あなたが退職金を受け取る予定の年齢',
    unit: '歳', min: 50, max: 75, placeholder: '60' },
] as const;

/** 万円 → 円。**整数のまま**扱う（§2の4） */
export const manToYen = (man: number): number => Math.trunc(man) * 10_000;
