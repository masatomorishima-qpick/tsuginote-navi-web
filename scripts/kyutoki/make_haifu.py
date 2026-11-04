"""給湯器の配布物（エクセル・PDF）を作る。

数字の元：lib/kyutoki/haifu-data.json（ページと同じ1つのファイル）。数字を直すときは JSON だけを直し、
このスクリプトを流し直す。
  python3 scripts/kyutoki/make_haifu.py
出力：public/downloads/
  kyutoki-hiyou-meyasu.xlsx / .pdf   費用の目安表
  kyutoki-mitsumori-check.xlsx / .pdf 見積もりの見方チェック表
  kyutoki-gosu.pdf                   号数の選び方の表
PDF は Playwright（Chromium）で HTML を印刷して作る。日本語の書体は Noto Sans CJK JP。
"""
import json
import pathlib
import html

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / "lib/kyutoki/haifu-data.json").read_text(encoding="utf-8"))
OUT = ROOT / "public/downloads"
OUT.mkdir(parents=True, exist_ok=True)
SITE = "https://www.tsuginotenavi.jp"
CHECKED = DATA["checkedAt"].replace("-", "/")
SRC = DATA["sources"]

FONT = "Noto Sans CJK JP"
H = Font(name=FONT, bold=True, size=14)
B = Font(name=FONT, bold=True, size=11)
N = Font(name=FONT, size=10)
S = Font(name=FONT, size=9, color="64748B")
HEAD_FILL = PatternFill("solid", fgColor="E0F2FE")
IN_FILL = PatternFill("solid", fgColor="FFF7ED")
thin = Side(style="thin", color="CBD5E1")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="center")


def put(ws, r, c, v, font=N, fill=None, border=True, fmt=None):
    cell = ws.cell(row=r, column=c, value=v)
    cell.font = font
    cell.alignment = WRAP
    if fill:
        cell.fill = fill
    if border:
        cell.border = BOX
    if fmt:
        cell.number_format = fmt
    return cell


def header(ws, r, cols):
    for i, t in enumerate(cols, 1):
        put(ws, r, i, t, B, HEAD_FILL)


def widths(ws, ws_widths):
    for i, w in enumerate(ws_widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


# ---------------------------------------------------------------- 費用の目安表（エクセル）
def make_hiyou_xlsx():
    wb = Workbook()
    ws = wb.active
    ws.title = "費用の目安"
    widths(ws, [24, 10, 14, 14, 12, 24, 16])
    r = 1
    put(ws, r, 1, "ガス給湯器の交換費用の目安表", H, border=False); r += 1
    put(ws, r, 1, f"工事費込み・税込。{CHECKED} に各社の公式サイトで確認。つぎの手ナビ {SITE}/kyutoki/kokan-hiyou", S, border=False); r += 2

    put(ws, r, 1, "1. 種類別の相場（東京ガス）", B, border=False); r += 1
    header(ws, r, ["種類", "相場", "例（東京ガスの販売価格）"]); r += 1
    for s in DATA["souba"]:
        put(ws, r, 1, f"{s['kind']}（{s['note']}）"); put(ws, r, 2, s["label"]); put(ws, r, 3, s["ex"])
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=6); r += 1
    r += 1

    put(ws, r, 1, "2. 工事費込みの販売価格（東京ガス）", B, border=False); r += 1
    header(ws, r, ["種類", "号数", "効率", "置き場所", "メーカー", "型番", "総額（税込）"]); r += 1
    first = r
    for p in DATA["prices"]:
        for i, k in enumerate(["kind", "gosu", "eff", "place", "maker", "model"], 1):
            put(ws, r, i, p[k])
        put(ws, r, 7, p["yen"], fmt='#,##0"円"'); r += 1
    last = r - 1
    r += 1

    put(ws, r, 1, "3. 自分の見積もりと比べる", B, border=False); r += 1
    put(ws, r, 1, "あなたの見積もりの総額（税込）"); put(ws, r, 2, None, fill=IN_FILL, fmt='#,##0"円"')
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
    put(ws, r, 4, "← 黄色の欄に入力", S, border=False); mine = r; r += 1
    put(ws, r, 1, "比べる型の番号（上の表の行番号）"); put(ws, r, 2, first, fill=IN_FILL)
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
    put(ws, r, 4, f"← {first}〜{last} の数字。種類・号数・置き場所が同じ型を選ぶ", S, border=False); pick = r; r += 1
    put(ws, r, 1, "その型の東京ガスの総額")
    put(ws, r, 2, f'=IF(AND(B{pick}>={first},B{pick}<={last}),INDEX(G{first}:G{last},B{pick}-{first}+1),"")', fmt='#,##0"円"')
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3); ref = r; r += 1
    put(ws, r, 1, "差（見積もり − 東京ガス）")
    put(ws, r, 2, f'=IF(OR(B{mine}="",B{ref}=""),"",B{mine}-B{ref})', B, fmt='+#,##0"円";-#,##0"円";0"円"')
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3); r += 1
    put(ws, r, 1, "差が大きいときは、見積もりの見方チェック表で、追加の工事・リモコン・出張費が入っていないかを確かめてください。", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7); r += 2

    put(ws, r, 1, "4. 基本工事費（東京ガス）", B, border=False); r += 1
    header(ws, r, ["種類", "効率", "基本工事費（税込）"]); r += 1
    for k in DATA["kojiBase"]:
        put(ws, r, 1, k["kind"]); put(ws, r, 2, k["eff"]); put(ws, r, 3, k["yen"], fmt='#,##0"円"'); r += 1
    put(ws, r, 1, "含まれるもの：" + "／".join(DATA["kojiIncluded"]), S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7); r += 1
    put(ws, r, 1, "別料金になる例：" + "／".join(DATA["kojiExtra"]), S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7); ws.row_dimensions[r].height = 30; r += 2

    put(ws, r, 1, "5. 号数と機能で変わる本体の定価（リンナイ RUF-E シリーズ、メーカー希望小売価格・税込）", B, border=False); r += 1
    header(ws, r, ["号数", "機能", "型番", "定価（税込）"]); r += 1
    for t in DATA["teika"]:
        put(ws, r, 1, t["gosu"]); put(ws, r, 2, t["func"]); put(ws, r, 3, t["model"]); put(ws, r, 4, t["yen"], fmt='#,##0"円"'); r += 1
    put(ws, r, 1, "定価どうしの差です。実際の販売価格は値引きがあり、店ごとに違います。リモコンは別売り。", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7); r += 2

    put(ws, r, 1, "出典", B, border=False); r += 1
    for key in ["tgHowto", "tgRinnai", "tgNoritz", "tgKoji", "rinnaiRufe"]:
        put(ws, r, 1, f"{SRC[key]['name']}  {SRC[key]['url']}", S, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7); r += 1
    put(ws, r, 1, "金額は設置の状況で変わります。最終的な金額は見積書で確かめてください。", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)
    ws.sheet_view.showGridLines = False
    ws.print_options.horizontalCentered = True
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "kyutoki-hiyou-meyasu.xlsx")


# ---------------------------------------------------------------- チェック表（エクセル）
def make_check_xlsx():
    wb = Workbook()
    ws = wb.active
    ws.title = "見積もりの見方"
    widths(ws, [5, 18, 46, 14, 16, 16])
    r = 1
    put(ws, r, 1, "給湯器の見積もりの見方チェック表", H, border=False); r += 1
    put(ws, r, 1, f"見積書を横に置いて、上から順に確かめます。2社目の見積もりと並べて使えます。つぎの手ナビ {SITE}/kyutoki/mitsumori-mikata", S, border=False); r += 2
    header(ws, r, ["", "見るところ", "確かめること", "書いてある？", "1社目（円・年など）", "2社目（円・年など）"]); r += 1
    for c in DATA["check"]:
        put(ws, r, 1, "☐", B); put(ws, r, 2, c["h"], B); put(ws, r, 3, c["d"])
        put(ws, r, 4, None, fill=IN_FILL); put(ws, r, 5, None, fill=IN_FILL); put(ws, r, 6, None, fill=IN_FILL)
        ws.row_dimensions[r].height = 34; r += 1
    r += 1
    put(ws, r, 2, "「点検します」の電話や訪問に注意", B, border=False); r += 1
    for t in DATA["tenken"]:
        put(ws, r, 2, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6); r += 1
    r += 1
    put(ws, r, 2, f"出典：{SRC['tgKoji']['name']} {SRC['tgKoji']['url']}／{SRC['kokusen']['name']} {SRC['kokusen']['url']}（{CHECKED} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6); ws.row_dimensions[r].height = 30
    ws.sheet_view.showGridLines = False
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "kyutoki-mitsumori-check.xlsx")


# ---------------------------------------------------------------- PDF（HTML を印刷）
CSS = """
@page { size: A4; margin: 14mm 14mm 16mm; }
* { box-sizing: border-box; }
body { font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 10.5pt; line-height: 1.6; margin: 0; }
h1 { font-size: 20pt; margin: 0 0 2mm; letter-spacing: .02em; }
.sub { color: #64748b; font-size: 9pt; margin: 0 0 7mm; }
h2 { font-size: 12.5pt; margin: 7mm 0 2.5mm; padding-left: 3mm; border-left: 4px solid #f97316; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #cbd5e1; padding: 1.6mm 2.4mm; text-align: left; vertical-align: middle; }
th { background: #e0f2fe; font-weight: 700; font-size: 9.5pt; }
td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.note { color: #64748b; font-size: 8.5pt; margin: 1.5mm 0 0; }
.box { border: 1px solid #fed7aa; background: #fff7ed; border-radius: 3mm; padding: 3mm 4mm; margin-top: 4mm; }
.cards { display: flex; gap: 3mm; }
.card { flex: 1; border: 1px solid #cbd5e1; border-radius: 3mm; padding: 3.5mm; text-align: center; }
.card b { display: block; font-size: 18pt; color: #ea580c; }
.card span { display: block; font-size: 9pt; color: #475569; }
.chk td:first-child { width: 8mm; font-size: 13pt; text-align: center; }
.chk td.w { width: 30mm; }
"""


def esc(s):
    return html.escape(str(s))


def yen(v):
    return f"{v:,}円"


def page(title, sub, body, url):
    return f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<h1>{esc(title)}</h1><p class="sub">{esc(sub)}</p>{body}
</body></html>"""


def src_line(keys):
    return "出典：" + "／".join(f"{esc(SRC[k]['name'])}" for k in keys)


def hiyou_html():
    cards = "".join(f'<div class="card"><span>{esc(s["kind"])}</span><b>{esc(s["label"])}</b><span>{esc(s["ex"])}</span></div>' for s in DATA["souba"])
    rows = "".join(
        f"<tr><td>{esc(p['kind'])}</td><td>{esc(p['gosu'])}</td><td>{esc(p['eff'])}</td><td>{esc(p['place'])}</td><td>{esc(p['maker'])}</td><td class='num'>{yen(p['yen'])}</td></tr>"
        for p in DATA["prices"])
    koji = "".join(f"<tr><td>{esc(k['kind'])}</td><td>{esc(k['eff'])}</td><td class='num'>{yen(k['yen'])}</td></tr>" for k in DATA["kojiBase"])
    teika = "".join(f"<tr><td>{esc(t['gosu'])}</td><td>{esc(t['func'])}</td><td>{esc(t['model'])}</td><td class='num'>{yen(t['yen'])}</td></tr>" for t in DATA["teika"])
    body = f"""
<h2>種類別の相場</h2><div class="cards">{cards}</div>
<p class="note">{src_line(['tgHowto'])}。本体＋工事＋税込の総額。</p>
<h2>工事費込みの販売価格（東京ガス）</h2>
<table><tr><th>種類</th><th>号数</th><th>効率</th><th>置き場所</th><th>メーカー</th><th>総額（税込）</th></tr>{rows}</table>
<p class="note">{src_line(['tgRinnai','tgNoritz'])}。型番はエクセル版に載せています。</p>
<h2>基本工事費（東京ガス）</h2>
<table><tr><th>種類</th><th>効率</th><th>基本工事費（税込）</th></tr>{koji}</table>
<p class="note">含まれるもの：{esc('／'.join(DATA['kojiIncluded']))}<br>別料金になる例：{esc('／'.join(DATA['kojiExtra']))}<br>{src_line(['tgKoji'])}</p>
<h2>号数と機能で変わる本体の定価</h2>
<table><tr><th>号数</th><th>機能</th><th>型番（リンナイ）</th><th>定価（税込）</th></tr>{teika}</table>
<p class="note">メーカー希望小売価格どうしの差です。実際の販売価格は値引きがあり、店ごとに違います。{src_line(['rinnaiRufe'])}</p>
<div class="box">見積もりの総額が大きく違うときは、「見積もりの見方チェック表」で、追加の工事・リモコン・出張費が入っていないかを確かめてください。金額は設置の状況で変わります。</div>
"""
    return page("ガス給湯器の交換費用の目安表", "工事費込み・税込。同じ号数・同じ置き場所で替える場合の目安です。", body, f"{SITE}/kyutoki/kokan-hiyou")


def check_html():
    rows = "".join(f"<tr><td>☐</td><td><b>{esc(c['h'])}</b></td><td>{esc(c['d'])}</td><td class='w'></td><td class='w'></td></tr>" for c in DATA["check"])
    ten = "".join(f"<li>{esc(t)}</li>" for t in DATA["tenken"])
    body = f"""
<table class="chk"><tr><th></th><th>見るところ</th><th>確かめること</th><th>1社目</th><th>2社目</th></tr>{rows}</table>
<p class="note">基本工事費に含まれるもの・別料金になるものは、{src_line(['tgKoji'])}の記載をもとにしています。</p>
<div class="box"><b>「点検します」の電話や訪問に注意</b><ul style="margin:1.5mm 0 0;padding-left:5mm">{ten}</ul>
<p class="note">{src_line(['kokusen'])}</p></div>
"""
    return page("給湯器の見積もりの見方チェック表", "見積書を横に置いて、上から順に確かめます。2社目の見積もりと並べて使えます。", body, f"{SITE}/kyutoki/mitsumori-mikata")


def gosu_html():
    cards = "".join(
        f'<div class="card"><b>{esc(g["gosu"])}</b><span>{esc(g["people"])}・同時に{esc(g["places"])}</span><span>{esc(g["use"])}</span></div>'
        for g in DATA["gosu"])
    notes = "".join(f"<li>{esc(n)}</li>" for n in DATA["gosuNotes"])
    teika = "".join(f"<tr><td>{esc(t['gosu'])}</td><td>{esc(t['func'])}</td><td class='num'>{yen(t['yen'])}</td></tr>" for t in DATA["teika"])
    body = f"""
<h2>人数と、同時に使う場所の数で選ぶ</h2><div class="cards">{cards}</div>
<p class="note">冬（水温5℃）に、シャワー40℃・毎分12リットル、台所40℃・毎分5リットルで使う場合の目安。{src_line(['rinnaiGosu'])}</p>
<h2>選ぶ前に知っておくこと</h2><ul style="padding-left:5mm;margin:0">{notes}</ul>
<p class="note">{src_line(['rinnaiGosu','tgHowto'])}</p>
<h2>号数で変わる本体の定価（参考）</h2>
<table><tr><th>号数</th><th>機能</th><th>定価（税込・リンナイ RUF-E）</th></tr>{teika}</table>
<p class="note">メーカー希望小売価格どうしの差です。実際の販売価格は値引きがあり、店ごとに違います。{src_line(['rinnaiRufe'])}</p>
"""
    return page("給湯器の号数の選び方の表", "号数は「一度に出せるお湯の量」。家族の人数と、同時に使う場所の数で選びます。", body, f"{SITE}/kyutoki/gosu-erabikata")


def make_pdfs():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        for name, doc, url in [
            ("kyutoki-hiyou-meyasu", hiyou_html(), f"{SITE}/kyutoki/kokan-hiyou"),
            ("kyutoki-mitsumori-check", check_html(), f"{SITE}/kyutoki/mitsumori-mikata"),
            ("kyutoki-gosu", gosu_html(), f"{SITE}/kyutoki/gosu-erabikata"),
        ]:
            pg.set_content(doc, wait_until="load")
            foot = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
                    f"<span>つぎの手ナビ　{esc(url)}　（{CHECKED} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
            pg.pdf(path=str(OUT / f"{name}.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
                   display_header_footer=True, header_template="<div></div>", footer_template=foot)
        b.close()


if __name__ == "__main__":
    make_hiyou_xlsx()
    make_check_xlsx()
    make_pdfs()
    for f in sorted(OUT.glob("kyutoki-*")):
        print(f.name, f.stat().st_size)
