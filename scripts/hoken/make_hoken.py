"""保険の配布物（エクセル・PDF）を作る。2026-11-10 新設。

数字と文言の元：lib/hoken/haifu-data.json（ページと同じ1つのファイル）。
  python3 scripts/hoken/make_hoken.py
出力：public/downloads/
  hoken-hikaku.xlsx / .pdf   保険の比較表（いまの保険と見直し案を並べる。払う総額は自動計算）
  hoken-minaoshi-checklist.xlsx / .pdf   生命保険の見直しチェックリスト（節目・証券の6項目・次の更新の年は自動）
  hoken-shoken-kakiutsushi.xlsx / .pdf   保険証券の書き写し表（死亡保険金の税の種類と保険料の合計は自動。2026-11-11）
  hoken-minaoshi-shussan.xlsx / .pdf   子どもが生まれたときの見直しチェックリスト（遺族基礎年金の目安は自動。2026-11-14）
  python3 scripts/hoken/make_hoken.py minaoshi   … 見直しチェックリストだけ作り直す（shoken・shussan も同じ）
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


# ---------- 保険証券の書き写し表（2026-11-11） ----------
SHOKEN_ROWS = [
    ("保険会社", ""), ("証券番号", ""), ("保険の種類（主契約）", "終身・定期・医療・がん など"),
    ("契約者", "保険料を払う人"), ("被保険者", "保障の対象の人"), ("死亡保険金の受取人", ""),
    ("死亡保険金の額（円）", ""), ("入院1日あたり（円）", ""), ("特約", "主契約がなくなると特約もなくなる"),
    ("保険期間", "何歳まで・一生"), ("保険料の払込期間", "何歳まで・一生"), ("更新型か全期型か", "更新型・全期型"),
    ("次の更新の日", ""), ("月の保険料（円）", ""),
]


def make_shoken_xlsx():
    from openpyxl.worksheet.datavalidation import DataValidation
    K = DATA["shoken"]
    ck = K["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "証券の書き写し"
    for i, w in enumerate([24, 22, 16, 16, 16, 16, 16], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "保険証券の書き写し表", H, border=False)
    put(ws, 2, 1, "証券1枚を1列に。オレンジの欄に書き写すと、死亡保険金の税の種類と保険料の合計が自動で出ます。", S, border=False)
    r = 4
    for i, t in enumerate(["証券の欄", "メモ", "保険 1", "保険 2", "保険 3", "保険 4", "保険 5"], 1):
        put(ws, r, i, t, B, HEAD)
    dv = DataValidation(type="list", formula1='"更新型,全期型"', allow_blank=True)
    ws.add_data_validation(dv)
    row = {}
    for k, (h, m) in enumerate(SHOKEN_ROWS):
        rr = r + 1 + k
        row[h] = rr
        put(ws, rr, 1, h, B)
        put(ws, rr, 2, m, S)
        for c in range(3, 8):
            fmt = "#,##0" if "円" in h else ("yyyy/m/d" if "日" in h and "1日" not in h else None)
            cell = put(ws, rr, c, None, N, IN, fmt=fmt)
            if h == "更新型か全期型か":
                dv.add(cell)
    rr = r + len(SHOKEN_ROWS) + 1
    put(ws, rr, 1, "死亡保険金の税（自動）", B)
    put(ws, rr, 2, "契約者・被保険者・受取人から", S)
    ke, hi, uk = row["契約者"], row["被保険者"], row["死亡保険金の受取人"]
    for c in range(3, 8):
        L = get_column_letter(c)
        f = (f'=IF(OR({L}{ke}="",{L}{hi}="",{L}{uk}=""),"",IF({L}{uk}={L}{hi},"受取人を確認",'
             f'IF({L}{ke}={L}{hi},"相続税",IF({L}{ke}={L}{uk},"所得税","贈与税"))))')
        put(ws, rr, c, f, B, OK)
    mo = row["月の保険料（円）"]
    put(ws, rr + 1, 1, "月の保険料の合計（自動）", B)
    put(ws, rr + 1, 3, f"=SUM(C{mo}:G{mo})", B, OK, fmt="#,##0")
    put(ws, rr + 1, 4, "1年では", S)
    put(ws, rr + 1, 5, f"=C{rr + 1}*12", B, OK, fmt="#,##0")
    rr += 3
    notes = [K["zeiNote"], K["koshinNote"], "契約者と被保険者が同じ → 相続税、契約者と受取人が同じ → 所得税（住民税も）、3人とも違う → 贈与税。"]
    for k, t in enumerate(notes):
        put(ws, rr + k, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=rr + k, start_column=1, end_row=rr + k, end_column=7)
    rr += len(notes) + 1
    keys = ["jiliYougo", "jiliView", "jiliZei", "nta1750"]
    put(ws, rr, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    put(ws, rr + 1, 1, f"つぎの手ナビ　{SITE}/guide/shisan-kanri/hoken-shoken-mikata　欄の名前は保険会社によって少し違います。", S, border=False)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "hoken-shoken-kakiutsushi.xlsx")


def make_shoken_pdf():
    from playwright.sync_api import sync_playwright
    K = DATA["shoken"]
    ck = K["checkedAt"].replace("-", "/")
    rows = "".join(f"<tr><th>{esc(h)}{('<br><small>' + esc(m) + '</small>') if m else ''}</th><td></td><td></td><td></td></tr>" for h, m in SHOKEN_ROWS)
    ran = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in K["ran"])
    zei = "".join(f"<tr><td>{esc(z['keiyaku'])}</td><td>{esc(z['hihoken'])}</td><td>{esc(z['uketori'])}</td><td><b>{esc(z['zei'])}</b></td></tr>" for z in K["zei"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 11mm 14mm 14mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 9.5pt; line-height: 1.45; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }} h2 {{ font-size: 11pt; margin: 3.5mm 0 1.5mm; }} .sub {{ color: #475569; margin: 0 0 2mm; font-size: 9pt; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 0.8mm 2mm; height: 5.6mm; }} th {{ background: #e0f2fe; text-align: left; width: 48mm; }}
thead th {{ text-align: center; }} small {{ color: #64748b; font-weight: normal; font-size: 7.5pt; }}
.box {{ border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 1.8mm 4mm; margin-top: 2.5mm; }}
.box ul {{ margin: 1mm 0 0; padding-left: 5mm; }} .note {{ color: #64748b; font-size: 7.5pt; margin: 1.5mm 0 0; }}
.z th, .z td {{ width: auto; text-align: center; height: 5mm; }}
</style></head><body><h1>保険証券の書き写し表</h1><p class="sub">証券1枚を1列に書き写します。</p>
<table><thead><tr><th>証券の欄</th><th>保険 1</th><th>保険 2</th><th>保険 3</th></tr></thead>{rows}</table>
<h2>死亡保険金の税の見分け方</h2>
<table class="z"><tr><th>契約者</th><th>被保険者</th><th>受取人</th><th>税</th></tr>{zei}</table>
<p class="note">{esc(K['zeiNote'])}</p>
<div class="box"><b>欄の意味</b><ul>{ran}</ul></div>
<p class="note">出典：生命保険文化センター（保険商品の見方・用語辞典・保険金などを受け取ったときの税金は？）・国税庁 No.1750（{ck} 確認）</p></body></html>"""
    url = f"{SITE}/guide/shisan-kanri/hoken-shoken-mikata"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "hoken-shoken-kakiutsushi.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


# ---------- 子どもが生まれたときの保険の見直し（2026-11-14） ----------
def make_shussan_xlsx():
    from openpyxl.worksheet.datavalidation import DataValidation
    P = DATA["shussan"]
    Z = P["izoku"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "見直しチェック"
    for i, w in enumerate([4, 40, 52, 7], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "子どもが生まれたら 保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "確かめたら「済」を選びます。2枚目のシートで、子の生年月日から遺族基礎年金の目安が出ます。", S, border=False)
    for i, t in enumerate(["", "確かめること", "見るところ", "済"], 1):
        put(ws, 4, i, t, B, HEAD)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, c in enumerate(P["check"]):
        r = 5 + k
        put(ws, r, 1, k + 1)
        put(ws, r, 2, f"【{c['g']}】{c['h']}", B)
        put(ws, r, 3, c["d"], N)
        dv.add(put(ws, r, 4, None, B, IN))
        ws.row_dimensions[r].height = 36
    r = 6 + len(P["check"])
    put(ws, r, 2, "出産と子育ての公的な給付", B, border=False)
    for k, t in enumerate(P["kouteki"]):
        put(ws, r + 1 + k, 2, t["h"] + "：" + t["v"], B)
        put(ws, r + 1 + k, 3, t["d"], N)
        ws.row_dimensions[r + 1 + k].height = 44
    r += len(P["kouteki"]) + 2
    for k, t in enumerate([P["hitsuyo"], P["kaisei"]] + P["izokuNote"]):
        put(ws, r + k, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=4)
        ws.row_dimensions[r + k].height = 32
    r += len(P["izokuNote"]) + 2
    keys = ["jiliHitsuyo", "jiliMinaoshi", "mhlwKougaku", "kyoukaiShussan", "mhlwShussan", "cfaJidou", "nenkinIzokuKiso", "nenkinIzokuGuide", "mhlwIzokuMinaoshi"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
    ws.row_dimensions[r].height = 58
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/shisan-kanri/hoken-minaoshi-shussan", S, border=False)
    ws.page_setup.fitToWidth = 1

    w2 = wb.create_sheet("遺族基礎年金の目安")
    for i, w in enumerate([22, 16, 16, 12, 16], 1):
        w2.column_dimensions[get_column_letter(i)].width = w
    put(w2, 1, 1, f"遺族基礎年金の目安（{Z['nendo']}の額）", H, border=False)
    put(w2, 2, 1, "子のある配偶者が受け取る場合。仮に「基準の日」の月に亡くなったとして、翌月分から年度ごとに数えます。", S, border=False)
    put(w2, 4, 1, "基準の日（ふつうは今日）", B)
    base = put(w2, 4, 2, "=TODAY()", B, IN, fmt="yyyy/m/d").coordinate
    put(w2, 5, 1, "基本の額（年）", N); put(w2, 5, 2, Z["base"], N, fmt="#,##0")
    put(w2, 6, 1, "子の加算 1人目・2人目（各）", N); put(w2, 6, 2, Z["add12"], N, fmt="#,##0")
    put(w2, 7, 1, "子の加算 3人目から（各）", N); put(w2, 7, 2, Z["add3"], N, fmt="#,##0")
    put(w2, 9, 1, "子", B, HEAD); put(w2, 9, 2, "生年月日", B, HEAD); put(w2, 9, 3, "対象の最後の日（自動）", B, HEAD)
    ends = []
    for k in range(5):
        r = 10 + k
        put(w2, r, 1, f"{k + 1}人目", N)
        b = put(w2, r, 2, None, B, IN, fmt="yyyy/m/d").coordinate
        # 18歳になる日＝18回目の誕生日の前の日。その日以後の最初の3月31日まで
        e = put(w2, r, 3, f'=IF({b}="","",DATE(YEAR(EDATE({b},216)-1)+IF(MONTH(EDATE({b},216)-1)>3,1,0),3,31))', B, OK, fmt="yyyy/m/d")
        ends.append(e.coordinate)
    rng = f"$C$10:$C$14"
    m1 = f"DATE(YEAR({base}),MONTH({base})+1,1)"
    put(w2, 16, 1, "年度", B, HEAD); put(w2, 16, 2, "対象の子の数", B, HEAD); put(w2, 16, 3, "月数", B, HEAD); put(w2, 16, 4, "", B, HEAD); put(w2, 16, 5, "額（円）", B, HEAD)
    for k in range(20):
        r = 17 + k
        y = f"(YEAR({m1})-IF(MONTH({m1})<4,1,0)+{k})"
        put(w2, r, 1, f"={y}", N, fmt='0"年度"')
        put(w2, r, 2, f'=COUNTIF({rng},">="&DATE({y}+1,3,31))', N)
        mo = f"(({y}+1-YEAR({m1}))*12+4-MONTH({m1}))" if k == 0 else "12"
        put(w2, r, 3, f"={mo}", N)
        put(w2, r, 4, "", N)
        put(w2, r, 5, f"=IF(B{r}=0,0,ROUND(($B$5+$B$6*MIN(B{r},2)+$B$7*MAX(B{r}-2,0))*C{r}/12,0))", B, OK, fmt="#,##0")
    put(w2, 38, 1, "今の年額（自動）", B)
    put(w2, 38, 5, "=IF(B17=0,0,$B$5+$B$6*MIN(B17,2)+$B$7*MAX(B17-2,0))", B, OK, fmt="#,##0")
    put(w2, 39, 1, "合計の目安（自動）", B)
    put(w2, 39, 5, "=SUM(E17:E36)", B, OK, fmt="#,##0")
    put(w2, 41, 1, P["keisanNote"], S, border=False)
    w2.merge_cells("A41:E41"); w2.row_dimensions[41].height = 44
    put(w2, 42, 1, "出典：" + SRC["nenkinIzokuKiso"]["name"] + "／" + SRC["nenkinIzokuGuide"]["name"] + f"（{ck} 確認）", S, border=False)
    w2.merge_cells("A42:E42"); w2.row_dimensions[42].height = 30
    wb.save(OUT / "hoken-minaoshi-shussan.xlsx")


def make_shussan_pdf():
    from playwright.sync_api import sync_playwright
    P = DATA["shussan"]
    Z = P["izoku"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    ko = "".join(f"<tr><th>{esc(t['h'])}</th><td><b>{esc(t['v'])}</b><br><small>{esc(t['d'])}</small></td></tr>" for t in P["kouteki"])
    def ng(n):
        return Z["base"] + Z["add12"] * min(n, 2) + Z["add3"] * max(n - 2, 0)
    hy = "".join(f"<td>{ng(n):,}円</td>" for n in (1, 2, 3, 4))
    notes = "".join(f"<li>{esc(t)}</li>" for t in P["izokuNote"])
    keys = ["jiliHitsuyo", "jiliMinaoshi", "mhlwKougaku", "kyoukaiShussan", "cfaJidou", "nenkinIzokuKiso", "nenkinIzokuGuide", "mhlwIzokuMinaoshi"]
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 11mm 14mm 14mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 9.5pt; line-height: 1.5; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }} h2 {{ font-size: 11pt; margin: 3.5mm 0 1.5mm; }} .sub {{ color: #475569; margin: 0 0 2mm; font-size: 9pt; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 1.2mm 2mm; }} th {{ background: #e0f2fe; text-align: left; width: 40mm; }}
small {{ color: #64748b; font-weight: normal; font-size: 7.5pt; }}
.box {{ border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 1.8mm 4mm; margin-top: 2.5mm; }}
.box ul {{ margin: 1mm 0 0; padding-left: 5mm; }} .note {{ color: #64748b; font-size: 7.5pt; margin: 1.5mm 0 0; }}
</style></head><body><h1>子どもが生まれたら 保険の見直しチェックリスト</h1><p class="sub">確かめたら□に印を付け、右の欄にメモします。</p>
<h2>① 確かめる8つの点</h2><table><tr><th style="width:5mm"></th><th style="width:auto">確かめること</th><th style="width:40mm">メモ</th></tr>{ch}</table>
<p class="note">{esc(P['hitsuyo'])}</p>
<h2>② 遺族基礎年金の年額（子のある配偶者が受け取るとき・{esc(Z['nendo'])}）</h2>
<table><tr><th>対象の子の数</th><td>1人</td><td>2人</td><td>3人</td><td>4人</td></tr><tr><th>年額</th>{hy}</tr></table>
<div class="box"><b>受け取れる人と条件</b><ul>{notes}</ul><small>{esc(P['kaisei'])}</small></div>
<h2>③ 出産と子育ての公的な給付</h2><table>{ko}</table>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p></body></html>"""
    url = f"{SITE}/guide/shisan-kanri/hoken-minaoshi-shussan"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "hoken-minaoshi-shussan.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


if __name__ == "__main__":
    import sys
    only = sys.argv[1] if len(sys.argv) > 1 else ""
    if only in ("", "hikaku"):
        make_hikaku_xlsx()
        make_hikaku_pdf()
    if only in ("", "shoken"):
        make_shoken_xlsx()
        make_shoken_pdf()
    if only in ("", "minaoshi"):
        make_minaoshi_xlsx()
        make_minaoshi_pdf()
    if only in ("", "shussan"):
        make_shussan_xlsx()
        make_shussan_pdf()
    for f in sorted(OUT.glob("hoken-*")):
        print(f.name, f.stat().st_size)
