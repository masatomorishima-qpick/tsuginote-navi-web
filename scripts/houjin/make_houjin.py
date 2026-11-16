"""法人成りの配布物を作る（2026-11-16）。

  houjin-kouza-check.xlsx / .pdf   法人口座の申込前チェック表＋申込先の記録

項目は lib/houjin/kouza-data.ts の CHECKS と同じ並び。片方を直したら、もう片方も直す。
実行：python3 scripts/houjin/make_houjin.py
"""
import pathlib

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public/downloads"
OUT.mkdir(parents=True, exist_ok=True)
URL = "https://www.tsuginotenavi.jp/guide/houjin/kouza-tsukurenai"

CHECKS = [
    ("社名は登記と1文字も違わない", "英字・記号・空白まで、登記事項証明書どおりに"),
    ("本店の住所は登記どおり", "丁目・番地・建物名・部屋番号まで"),
    ("代表者の住所は本人確認書類どおり", "登記の本店と混ぜて入れない"),
    ("事業の説明を用意した", "何を・誰に・どうやって売るか"),
    ("事業が分かるホームページがある", "会社名・所在地・事業内容が載っている"),
    ("銀行からの郵便を受け取れる", "転送では受け取れない郵便もある"),
    ("2〜3行に同時に申し込む", "結果まで約1週間。理由は教えてもらえない"),
]

FONT = "Noto Sans CJK JP"
H = Font(name=FONT, bold=True, size=14)
B = Font(name=FONT, bold=True, size=11)
N = Font(name=FONT, size=10)
S = Font(name=FONT, size=9, color="64748B")
HEAD = PatternFill("solid", fgColor="E0F2FE")
IN = PatternFill("solid", fgColor="FFF7ED")
thin = Side(style="thin", color="94A3B8")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="center")


def put(ws, r, c, v, font=N, fill=None, border=True):
    cell = ws.cell(row=r, column=c, value=v)
    cell.font = font
    cell.alignment = WRAP
    if fill:
        cell.fill = fill
    if border:
        cell.border = BOX
    return cell


def make_xlsx():
    wb = Workbook()
    ws = wb.active
    ws.title = "申込前チェック"
    for col, w in zip("ABCDE", (4, 34, 40, 8, 30)):
        ws.column_dimensions[col].width = w
    put(ws, 1, 1, "法人口座の申込前チェック表", H, border=False)
    put(ws, 2, 1, "申込フォームは、登記事項証明書と本人確認書類を横に置いて入れる。済んだら「済」に ○ を選ぶ。", S, border=False)
    ws.merge_cells("A2:E2")
    r = 4
    for c, t in enumerate(("", "確かめること", "確かめ方", "済", "メモ"), 1):
        put(ws, r, c, t, B, HEAD)
    dv = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv)
    for i, (h, s) in enumerate(CHECKS, 1):
        r += 1
        put(ws, r, 1, i)
        put(ws, r, 2, h, B)
        put(ws, r, 3, s)
        put(ws, r, 4, "", N, IN)
        dv.add(ws.cell(row=r, column=4))
        put(ws, r, 5, "", N, IN)
        ws.row_dimensions[r].height = 30
    r += 1
    put(ws, r, 2, "済んだ数", B)
    put(ws, r, 3, f'=COUNTIF(D5:D{r - 1},"○")&" / {len(CHECKS)}"', B)

    r += 3
    put(ws, r, 1, "申込先の記録", H, border=False)
    r += 1
    for c, t in enumerate(("", "銀行", "申込日", "結果の日", "結果・メモ"), 1):
        put(ws, r, c, t, B, HEAD)
    for i in range(1, 4):
        r += 1
        put(ws, r, 1, i)
        for c in range(2, 6):
            put(ws, r, c, "", N, IN)
        ws.row_dimensions[r].height = 26
    r += 2
    put(ws, r, 1, f"つぎの手ナビ（{URL}）の実例をもとにした点検表です。審査の基準は銀行ごとに違い、通ることを約束するものではありません。", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
    ws.print_area = f"A1:E{r}"
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToHeight = 0
    wb.save(OUT / "houjin-kouza-check.xlsx")


def make_pdf():
    from playwright.sync_api import sync_playwright

    rows = "".join(
        f"<tr><td class='n'>{i}</td><td><b>{h}</b><br><span class='s'>{s}</span></td><td class='box'>□</td></tr>"
        for i, (h, s) in enumerate(CHECKS, 1)
    )
    rec = "".join(f"<tr><td class='n'>{i}</td><td></td><td></td><td></td><td></td></tr>" for i in range(1, 4))
    html = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 14mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 10.5pt; line-height: 1.6; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }}
.sub {{ color: #475569; margin: 0 0 5mm; font-size: 9.5pt; }}
h2 {{ font-size: 12pt; margin: 7mm 0 2mm; border-left: 4px solid #0369a1; padding-left: 2.5mm; }}
table {{ width: 100%; border-collapse: collapse; font-size: 10pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 2mm 2.5mm; vertical-align: middle; }}
th {{ background: #e0f2fe; text-align: left; }}
.n {{ width: 7mm; text-align: center; }}
.box {{ width: 12mm; text-align: center; font-size: 15pt; }}
.s {{ color: #475569; font-size: 9pt; }}
.rec td {{ height: 10mm; }}
.note {{ color: #64748b; font-size: 8pt; margin-top: 6mm; }}
</style></head><body>
<h1>法人口座の申込前チェック表</h1>
<p class="sub">申込フォームは、登記事項証明書と本人確認書類を横に置いて入れる。</p>
<table><tr><th></th><th>確かめること</th><th>済</th></tr>{rows}</table>
<h2>申込先の記録</h2>
<table class="rec"><tr><th></th><th>銀行</th><th>申込日</th><th>結果の日</th><th>結果・メモ</th></tr>{rec}</table>
<p class="note">つぎの手ナビ（{URL}）の実例をもとにした点検表です。審査の基準は銀行ごとに違い、通ることを約束するものではありません。</p>
</body></html>"""
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(html, wait_until="load")
        pg.pdf(path=str(OUT / "houjin-kouza-check.pdf"), format="A4", print_background=True)
        b.close()


if __name__ == "__main__":
    make_xlsx()
    make_pdf()
    print("ok")
