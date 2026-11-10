"""保険の配布物（エクセル・PDF）を作る。2026-11-10 新設。

数字と文言の元：lib/hoken/haifu-data.json（ページと同じ1つのファイル）。
  python3 scripts/hoken/make_hoken.py
出力：public/downloads/
  hoken-hikaku.xlsx / .pdf   保険の比較表（いまの保険と見直し案を並べる。払う総額は自動計算）
  hoken-minaoshi-checklist.xlsx / .pdf   生命保険の見直しチェックリスト（節目・証券の6項目・次の更新の年は自動）
  python3 scripts/hoken/make_hoken.py minaoshi   … 見直しチェックリストだけ作り直す
PDF は Playwright（Chromium）で HTML を印刷して作る。書体は Noto Sans CJK JP。
"""
import html
import json
import pathlib

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / "lib/hoken/haifu-data.json").read_text(encoding="utf-8"))
OUT = ROOT / "public/downloads"
SITE = "https://www.tsuginotenavi.jp"
SRC = DATA["sources"]
FONT = "Noto Sans CJK JP"
H = Font(name=FONT, bold=True, size=14)
B = Font(name=FONT, bold=True, size=11)
N = Font(name=FONT, size=10)
S = Font(name=FONT, size=9, color="64748B")
HEAD = PatternFill("solid", fgColor="E0F2FE")
IN = PatternFill("solid", fgColor="FFF7ED")
OK = PatternFill("solid", fgColor="DCFCE7")
thin = Side(style="thin", color="94A3B8")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="center")


def put(ws, r, c, v, font=N, fill=None, border=True, fmt=None):
    cell = ws.cell(row=r, column=c, value=v)
    cell.font, cell.alignment = font, WRAP
    if fill:
        cell.fill = fill
    if border:
        cell.border = BOX
    if fmt:
        cell.number_format = fmt
    return cell


def make_hikaku_xlsx():
    K = DATA["hikaku"]
    ck = K["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "比較表"
    for i, w in enumerate([34, 22, 22, 22], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "保険の比較表（いまの保険と見直し案）", H, border=False)
    put(ws, 2, 1, "オレンジの欄に書き写します。払う総額は自動で出ます。", S, border=False)
    r = 4
    for i, t in enumerate(["", "いまの保険", "見直し案 A", "見直し案 B"], 1):
        put(ws, r, i, t, B, HEAD)
    pos = {}
    for k, row in enumerate(K["rows"]):
        rr = r + 1 + k
        if "id" in row:
            pos[row["id"]] = rr
        put(ws, rr, 1, row["h"], B)
        ws.row_dimensions[rr].height = 26
    for k, row in enumerate(K["rows"]):
        rr = r + 1 + k
        for c in range(2, 5):
            col = get_column_letter(c)
            if row["kind"] == "calc":
                g, n = pos["getsu"], pos["nen"]
                put(ws, rr, c, f'=IF(OR({col}{g}="",{col}{n}=""),"",{col}{g}*12*{col}{n})', B, OK, fmt='#,##0"円"')
            elif row["kind"] == "num":
                put(ws, rr, c, None, N, IN, fmt="#,##0")
            else:
                put(ws, rr, c, None, N, IN)
    last = r + len(K["rows"])
    tot = r + 1 + [i for i, x in enumerate(K["rows"]) if x["kind"] == "calc"][0]
    put(ws, last + 1, 1, "いまの保険との差（払う総額）", B)
    for c in (3, 4):
        col = get_column_letter(c)
        put(ws, last + 1, c, f'=IF(OR(B{tot}="",{col}{tot}=""),"",{col}{tot}-B{tot})', B, OK, fmt='+#,##0"円";-#,##0"円";0"円"')
    put(ws, last + 1, 2, "－", N)
    rr = last + 3
    put(ws, rr, 1, "比べる3つの点", B, border=False)
    for k, p in enumerate(K["points"], 1):
        put(ws, rr + k, 1, f"{k}．{p['h']}：{p['d']}", N, border=False)
    rr += len(K["points"]) + 2
    put(ws, rr, 1, "乗り換える前に", B, border=False)
    for k, t in enumerate(K["norikae"], 1):
        put(ws, rr + k, 1, f"・{t}", N, border=False)
    rr += len(K["norikae"]) + 2
    put(ws, rr, 1, f"出典：{SRC['jiliMinaoshi']['name']}（{ck} 確認）", S, border=False)
    put(ws, rr + 1, 1, f"つぎの手ナビ　{SITE}/guide/shisan-kanri/hoken-hikaku-excel", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "hoken-hikaku.xlsx")


def esc(s):
    return html.escape(str(s))


def make_hikaku_pdf():
    from playwright.sync_api import sync_playwright
    K = DATA["hikaku"]
    ck = K["checkedAt"].replace("-", "/")
    rows = "".join(f"<tr><th>{esc(r['h'].replace('（自動）', ''))}</th><td></td><td></td><td></td></tr>" for r in K["rows"])
    pts = "".join(f"<li><b>{esc(p['h'])}</b>：{esc(p['d'])}</li>" for p in K["points"])
    nk = "".join(f"<li>{esc(t)}</li>" for t in K["norikae"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 14mm 14mm 16mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 10pt; line-height: 1.55; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }} .sub {{ color: #475569; margin: 0 0 4mm; font-size: 9.5pt; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9.5pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 2mm; height: 6.5mm; }} th {{ background: #e0f2fe; text-align: left; width: 58mm; }}
thead th {{ text-align: center; }}
.box {{ border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 2.5mm 4mm; margin-top: 3mm; }}
.note {{ color: #64748b; font-size: 8pt; margin: 1.5mm 0 0; }} ul {{ margin: 1mm 0 0; padding-left: 5mm; }}
</style></head><body><h1>保険の比較表</h1><p class="sub">いまの保険と見直し案を並べて書き写します。払う総額＝月の保険料×12×払い込む年数。</p>
<table><thead><tr><th></th><th>いまの保険</th><th>見直し案 A</th><th>見直し案 B</th></tr></thead>{rows}</table>
<div class="box"><b>比べる3つの点</b><ul>{pts}</ul></div>
<div class="box"><b>乗り換える前に</b><ul>{nk}</ul></div>
<p class="note">出典：{esc(SRC['jiliMinaoshi']['name'])}（{ck} 確認）</p></body></html>"""
    url = f"{SITE}/guide/shisan-kanri/hoken-hikaku-excel"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "hoken-hikaku.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


def make_minaoshi_xlsx():
    from openpyxl.worksheet.datavalidation import DataValidation
    M = DATA["minaoshi"]
    ck = M["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "見直しチェック"
    for i, w in enumerate([30, 26, 16, 16, 16], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    dv = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv)
    put(ws, 1, 1, "生命保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "オレンジの欄に ○ や書き写した内容を入れます。数と更新の年は自動で出ます。", S, border=False)
    r = 4
    put(ws, r, 1, "① 最後に見直してからあった節目", B, HEAD)
    put(ws, r, 2, "あれば ○", B, HEAD)
    f0 = r + 1
    for k, f in enumerate(M["fushime"]):
        put(ws, f0 + k, 1, f["h"])
        c = put(ws, f0 + k, 2, None, N, IN)
        dv.add(c)
    f1 = f0 + len(M["fushime"]) - 1
    put(ws, f1 + 1, 1, "節目の数", B)
    put(ws, f1 + 1, 2, f'=COUNTIF(B{f0}:B{f1},"○")&"つ"&IF(COUNTIF(B{f0}:B{f1},"○")>0,"。見直しどき","")', B, OK)
    r = f1 + 3
    for i, t in enumerate(["② 保険証券で確かめる", "見る所", "保険 1", "保険 2", "保険 3"], 1):
        put(ws, r, i, t, B, HEAD)
    for k, s_ in enumerate(M["shoken"]):
        rr = r + 1 + k
        put(ws, rr, 1, s_["h"], B)
        put(ws, rr, 2, s_["d"], S)
        for c in range(3, 6):
            put(ws, rr, c, None, N, IN)
        ws.row_dimensions[rr].height = 28
    r = r + len(M["shoken"]) + 2
    for i, t in enumerate(["③ 次の更新の目安（保険の名前）", "契約した日", "保険期間（年）", "次の更新（自動）", "あと（か月）"], 1):
        put(ws, r, i, t, B, HEAD)
    for k in range(3):
        rr = r + 1 + k
        put(ws, rr, 1, None, N, IN)
        put(ws, rr, 2, None, N, IN, fmt="yyyy/m/d")
        put(ws, rr, 3, None, N, IN)
        put(ws, rr, 4, f'=IF(OR(B{rr}="",C{rr}=""),"",EDATE(B{rr},C{rr}*12*(INT(DATEDIF(B{rr},TODAY(),"m")/(C{rr}*12))+1)))', B, OK, fmt="yyyy/m/d")
        put(ws, rr, 5, f'=IF(D{rr}="","",DATEDIF(TODAY(),D{rr},"m"))', B, OK)
    rr = r + 5
    put(ws, rr, 1, M["keisanNote"], S, border=False)
    rr += 2
    put(ws, rr, 1, "④ 見直す前の注意", B, border=False)
    for k, t in enumerate(M["maeni"], 1):
        put(ws, rr + k, 1, f"・{t['h']}：{t['d']}", N, border=False)
        ws.merge_cells(start_row=rr + k, start_column=1, end_row=rr + k, end_column=5)
        ws.row_dimensions[rr + k].height = 30
    rr += len(M["maeni"]) + 2
    put(ws, rr, 1, "先に確かめる公的な保障", B, border=False)
    for k, t in enumerate(M["kouteki"], 1):
        put(ws, rr + k, 1, f"・{t['h']}：{t['d']}", N, border=False)
        ws.merge_cells(start_row=rr + k, start_column=1, end_row=rr + k, end_column=5)
        ws.row_dimensions[rr + k].height = 30
    rr += len(M["kouteki"]) + 2
    keys = list(dict.fromkeys([t["src"] for t in M["maeni"]] + [t["src"] for t in M["kouteki"]]))
    for k, key in enumerate(keys):
        put(ws, rr + k, 1, f"出典：{SRC[key]['name']}（{ck} 確認）", S, border=False)
    put(ws, rr + len(keys), 1, f"つぎの手ナビ　{SITE}/guide/shisan-kanri/hoken-minaoshi-checklist", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "hoken-minaoshi-checklist.xlsx")


def make_minaoshi_pdf():
    from playwright.sync_api import sync_playwright
    M = DATA["minaoshi"]
    ck = M["checkedAt"].replace("-", "/")
    fu = "".join(f"<li>□ {esc(f['h'])}</li>" for f in M["fushime"])
    sh = "".join(f"<tr><th>□ {esc(s_['h'])}<br><small>{esc(s_['d'])}</small></th><td></td><td></td><td></td></tr>" for s_ in M["shoken"])
    ko = "".join("<tr><td></td><td></td><td></td><td></td></tr>" for _ in range(3))
    mae = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in M["maeni"])
    kt = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in M["kouteki"])
    srcs = "生命保険文化センター（契約にあたっての手引 その3・その4）・厚生労働省（高額療養費制度）・日本年金機構（遺族年金）"
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 11mm 14mm 14mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 9.5pt; line-height: 1.5; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }} h2 {{ font-size: 11pt; margin: 3.5mm 0 1.5mm; }} .sub {{ color: #475569; margin: 0 0 2mm; font-size: 9pt; }}
ul.fu {{ list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1mm 4mm; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 1.2mm 2mm; height: 6mm; }} th {{ background: #e0f2fe; text-align: left; width: 52mm; }}
thead th {{ text-align: center; }} small {{ color: #64748b; font-weight: normal; font-size: 7.5pt; }}
.box {{ border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 1.8mm 4mm; margin-top: 2.5mm; }}
.box ul {{ margin: 1mm 0 0; padding-left: 5mm; }} .note {{ color: #64748b; font-size: 7.5pt; margin: 1.5mm 0 0; }}
</style></head><body><h1>生命保険の見直しチェックリスト</h1><p class="sub">当てはまるものに印を付け、保険証券から書き写します。</p>
<h2>① 最後に見直してからあった節目</h2><ul class="fu">{fu}</ul>
<h2>② 保険証券で確かめる</h2>
<table><thead><tr><th></th><th>保険 1</th><th>保険 2</th><th>保険 3</th></tr></thead>{sh}</table>
<h2>③ 次の更新</h2>
<table><thead><tr><th>保険の名前</th><th>契約した日</th><th>保険期間</th><th>次の更新</th></tr></thead>{ko}</table>
<p class="note">{esc(M['keisanNote'])}</p>
<div class="box"><b>見直す前の注意</b><ul>{mae}</ul></div>
<div class="box"><b>先に確かめる公的な保障</b><ul>{kt}</ul></div>
<p class="note">出典：{srcs}（{ck} 確認）</p></body></html>"""
    url = f"{SITE}/guide/shisan-kanri/hoken-minaoshi-checklist"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "hoken-minaoshi-checklist.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


if __name__ == "__main__":
    import sys
    only = sys.argv[1] if len(sys.argv) > 1 else ""
    if only in ("", "hikaku"):
        make_hikaku_xlsx()
        make_hikaku_pdf()
    if only in ("", "minaoshi"):
        make_minaoshi_xlsx()
        make_minaoshi_pdf()
    for f in sorted(OUT.glob("hoken-*")):
        print(f.name, f.stat().st_size)
