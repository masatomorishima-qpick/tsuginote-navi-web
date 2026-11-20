"""保険の配布物（エクセル・PDF）を作る。2026-11-10 新設。

数字と文言の元：lib/hoken/haifu-data.json（ページと同じ1つのファイル）。
  python3 scripts/hoken/make_hoken.py
出力：public/downloads/
  hoken-hikaku.xlsx / .pdf   保険の比較表（いまの保険と見直し案を並べる。払う総額は自動計算）
  hoken-minaoshi-checklist.xlsx / .pdf   生命保険の見直しチェックリスト（節目・証券の6項目・次の更新の年は自動）
  hoken-shoken-kakiutsushi.xlsx / .pdf   保険証券の書き写し表（死亡保険金の税の種類と保険料の合計は自動。2026-11-11）
  hoken-minaoshi-shussan.xlsx / .pdf   子どもが生まれたときの見直しチェックリスト（遺族基礎年金の目安は自動。2026-11-14）
  hoken-minaoshi-kekkon.xlsx / .pdf   結婚したときの見直しチェックリスト（子のない夫婦の遺族年金の表・2人の保険の一覧。2026-11-16）
  hoken-minaoshi-teinen.xlsx / .pdf   定年退職のときの見直しチェックリスト（退職日から健康保険の期限は自動・健康保険3つの表。2026-11-17）
  hoken-minaoshi-danshin.xlsx / .pdf   住宅ローンの団信と見直しのチェックリスト（減らせる死亡保障の目安は自動。2026-11-19）
  hoken-minaoshi-dokuritsu.xlsx / .pdf   子どもが独立したときの見直しチェックリスト（遺族基礎年金が終わる日は自動・減らす方法の表。2026-11-19）
  hoken-minaoshi-rikon.xlsx / .pdf   離婚したときの見直しチェックリスト（必要な死亡保障の目安は自動。いまの決まりでは子に生計を同じくする父母がいると遺族基礎年金は0、2028年4月の見直し後も並べる。2026-11-20）
  hoken-minaoshi-gan.xlsx / .pdf   がん保険の見直しチェックリスト（新しい契約の契約日から待ち期間の終わりの目安は自動・先進医療の技術料の表。2026-11-21）
  python3 scripts/hoken/make_hoken.py minaoshi   … 見直しチェックリストだけ作り直す（shoken・shussan・kekkon・teinen も同じ。kekkon・teinen・danshin・dokuritsu・rikon・gan は名前を付けたときだけ作る）
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


# ---------- 結婚したときの保険の見直しチェックリスト（2026-11-16） ----------
IZOKU_KEKKON = [
    ("妻 30歳未満", "出ない", "5年間だけ"),
    ("妻 30〜39歳", "出ない", "受け取れる"),
    ("妻 40〜64歳", "出ない", "受け取れる＋中高齢寡婦加算"),
    ("夫 55歳未満", "出ない", "出ない"),
    ("夫 55〜59歳", "出ない", "60歳から"),
    ("夫 60歳以上", "出ない", "受け取れる"),
]
KEKKON_KEYS = ["jiliShohenkou", "jiliHitsuyo", "jiliMinaoshi", "mhlwKougaku", "nenkinIzokuKousei", "nenkinIzokuKiso", "nenkinIzokuGuide", "mhlwIzokuMinaoshi"]


def make_kekkon_xlsx():
    from openpyxl.worksheet.datavalidation import DataValidation
    P = DATA["kekkon"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "見直しチェック"
    for i, w in enumerate([4, 40, 52, 7], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "結婚したら 保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "確かめたら「済」を選びます。2枚目のシートに2人の保険を書き出すと、保険料の合計が出ます。3枚目は子のない夫婦の遺族年金の表です。", S, border=False)
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
    for k, t in enumerate([P["hitsuyo"], P["kaisei"]] + P["izokuNote"]):
        put(ws, r + k, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=4)
        ws.row_dimensions[r + k].height = 32
    r += len(P["izokuNote"]) + 3
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in KEKKON_KEYS) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
    ws.row_dimensions[r].height = 58
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/shisan-kanri/hoken-minaoshi-kekkon", S, border=False)
    ws.page_setup.fitToWidth = 1

    w2 = wb.create_sheet("2人の保険")
    hd = ["保険の名前・会社", "種類", "被保険者", "受取人", "死亡保障（万円）", "保険料（月・円）", "保障の終わり（年）", "メモ"]
    for i, w in enumerate([24, 12, 10, 10, 14, 14, 14, 24], 1):
        w2.column_dimensions[get_column_letter(i)].width = w
    put(w2, 1, 1, "2人の保険の一覧", H, border=False)
    put(w2, 2, 1, "保険証券を見ながら書き出します。重なりと、受取人が今の家族に合うかを見ます。", S, border=False)
    for i, t in enumerate(hd, 1):
        put(w2, 4, i, t, B, HEAD)
    for k in range(12):
        for i in range(1, 9):
            put(w2, 5 + k, i, None, N, IN, fmt="#,##0" if i in (5, 6) else None)
    put(w2, 18, 4, "合計（自動）", B)
    put(w2, 18, 5, "=SUM(E5:E16)", B, OK, fmt="#,##0")
    put(w2, 18, 6, "=SUM(F5:F16)", B, OK, fmt="#,##0")
    put(w2, 19, 4, "保険料（年・自動）", B)
    put(w2, 19, 6, "=F18*12", B, OK, fmt="#,##0")
    w2.page_setup.orientation = "landscape"
    w2.page_setup.fitToWidth = 1
    w3 = wb.create_sheet("遺族年金（子のない夫婦）")
    for i, w in enumerate([16, 14, 44], 1):
        w3.column_dimensions[get_column_letter(i)].width = w
    put(w3, 1, 1, "子のない夫婦の遺族年金（残る人ごと）", H, border=False)
    for i, t in enumerate(["残る人", "遺族基礎年金", "遺族厚生年金（厚生年金に入っている間に亡くなったときなど）"], 1):
        put(w3, 3, i, t, B, HEAD)
    for k, row in enumerate(IZOKU_KEKKON):
        for i, t in enumerate(row, 1):
            put(w3, 4 + k, i, t, N)
    put(w3, 5 + len(IZOKU_KEKKON), 1, P["keisanNote"], S, border=False)
    w3.merge_cells(start_row=5 + len(IZOKU_KEKKON), start_column=1, end_row=5 + len(IZOKU_KEKKON), end_column=3)
    w3.row_dimensions[5 + len(IZOKU_KEKKON)].height = 44
    wb.save(OUT / "hoken-minaoshi-kekkon.xlsx")


def make_kekkon_pdf():
    from playwright.sync_api import sync_playwright
    P = DATA["kekkon"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    iz = "".join(f"<tr><td>{esc(a)}</td><td>{esc(b)}</td><td><b>{esc(c)}</b></td></tr>" for a, b, c in IZOKU_KEKKON)
    notes = "".join(f"<li>{esc(t)}</li>" for t in P["izokuNote"])
    blank = "".join("<tr><td style='height:7mm'></td><td></td><td></td><td></td><td></td></tr>" for _ in range(5))
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 11mm 14mm 14mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 9.5pt; line-height: 1.5; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }} h2 {{ font-size: 11pt; margin: 3.5mm 0 1.5mm; }} .sub {{ color: #475569; margin: 0 0 2mm; font-size: 9pt; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 1.2mm 2mm; }} th {{ background: #e0f2fe; text-align: left; }}
small {{ color: #64748b; font-weight: normal; font-size: 7.5pt; }}
.box {{ border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 1.8mm 4mm; margin-top: 2.5mm; }}
.box ul {{ margin: 1mm 0 0; padding-left: 5mm; }} .note {{ color: #64748b; font-size: 7.5pt; margin: 1.5mm 0 0; }}
</style></head><body><h1>結婚したら 保険の見直しチェックリスト</h1><p class="sub">確かめたら□に印を付け、右の欄にメモします。</p>
<h2>① 確かめる8つの点</h2><table><tr><th style="width:5mm"></th><th>確かめること</th><th style="width:40mm">メモ</th></tr>{ch}</table>
<p class="note">{esc(P['hitsuyo'])}</p>
<h2>② 子のない夫婦の遺族年金（残る人ごと）</h2>
<table><tr><th>残る人</th><th>遺族基礎年金</th><th>遺族厚生年金（厚生年金に入っている間に亡くなったときなど）</th></tr>{iz}</table>
<div class="box"><b>受け取れる人と条件</b><ul>{notes}</ul><small>{esc(P['kaisei'])}</small></div>
<h2>③ 2人の保険の書き出し</h2>
<table><tr><th>保険の名前・会社</th><th>被保険者</th><th>受取人</th><th>死亡保障</th><th>保険料（月）</th></tr>{blank}</table>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in KEKKON_KEYS))}（{ck} 確認）</p></body></html>"""
    url = f"{SITE}/guide/shisan-kanri/hoken-minaoshi-kekkon"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "hoken-minaoshi-kekkon.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


TEINEN_KEYS = ["kyoukaiNinkei", "kyoukaiNinkeiFaq", "kyoukaiNinkeiFaq3", "nagoyaKokuho", "kobeKokuho", "jiliHitsuyo", "jiliShikumi", "jiliView", "mhlwKougaku", "jiliMinaoshi"]


def make_teinen_xlsx():
    from datetime import date
    from openpyxl.worksheet.datavalidation import DataValidation
    P = DATA["teinen"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "見直しチェック"
    for i, w in enumerate([4, 40, 52, 7], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "定年退職の 保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "オレンジの欄に退職日を入れると、健康保険の手続きの期限が出ます（例の日付は入れ替えてください）。確かめたら「済」を選びます。", S, border=False)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 30
    put(ws, 4, 2, "退職日（会社に籍がある最後の日。有給休暇の消化中も含む）", B, HEAD)
    put(ws, 4, 3, date(2027, 3, 31), B, IN, fmt="yyyy/m/d(aaa)")
    rows = [
        ("健康保険の資格がなくなる日（この日を1日目に数える）", "=IF(C4=\"\",\"\",C4+1)", "yyyy/m/d(aaa)"),
        ("任意継続の申し出の期限（必着。土日・祝日なら次の営業日）", "=IF(C4=\"\",\"\",C4+20)", "yyyy/m/d(aaa)"),
        ("国民健康保険の届け出の期限（市区町村で確かめる）", "=IF(C4=\"\",\"\",C4+14)", "yyyy/m/d(aaa)"),
        ("任意継続の終わり（最長2年・目安）", "=IF(C4=\"\",\"\",EDATE(C4+1,24)-1)", "yyyy/m/d(aaa)"),
    ]
    for k, (h, f, fm) in enumerate(rows):
        put(ws, 5 + k, 2, h, B)
        put(ws, 5 + k, 3, f, B, OK, fmt=fm)
        ws.row_dimensions[5 + k].height = 28
    r = 10
    for i, t in enumerate(["", "確かめること", "見るところ", "済"], 1):
        put(ws, r, i, t, B, HEAD)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, c in enumerate(P["check"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, f"【{c['g']}】{c['h']}", B)
        put(ws, rr, 3, c["d"], N)
        dv.add(put(ws, rr, 4, None, B, IN))
        ws.row_dimensions[rr].height = 44
    r = r + 2 + len(P["check"])
    for k, t in enumerate(P["ninkeiNote"]):
        put(ws, r + k, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=4)
        ws.row_dimensions[r + k].height = 30
    r += len(P["ninkeiNote"]) + 1
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in TEINEN_KEYS) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
    ws.row_dimensions[r].height = 70
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/shisan-kanri/hoken-minaoshi-teinen", S, border=False)
    ws.page_setup.fitToWidth = 1

    w2 = wb.create_sheet("退職後の健康保険")
    for i, w in enumerate([22, 30, 34, 26, 44], 1):
        w2.column_dimensions[get_column_letter(i)].width = w
    put(w2, 1, 1, "定年退職後の健康保険3つ", H, border=False)
    for i, t in enumerate(["加入先", "入れる人", "期限", "期間", "保険料"], 1):
        put(w2, 3, i, t, B, HEAD)
    for k, x in enumerate(P["kenpo"]):
        for i, t in enumerate([x["h"], x["jouken"], x["kigen"], x["kikan"], x["hokenryo"]], 1):
            put(w2, 4 + k, i, t, B if i == 1 else N)
        w2.row_dimensions[4 + k].height = 62
    put(w2, 8, 1, "保険料の見込み（月・円）を書いて並べる", B, border=False)
    for k, x in enumerate(P["kenpo"]):
        put(w2, 9 + k, 1, x["h"], N)
        put(w2, 9 + k, 2, None, N, IN, fmt="#,##0")
    w2.page_setup.orientation = "landscape"
    w2.page_setup.fitToWidth = 1

    w3 = wb.create_sheet("夫婦の保険")
    hd = ["保険の名前・会社", "種類", "被保険者", "死亡保障（万円）", "保険料（月・円）", "払い込む年齢まで", "次の更新（年）", "メモ"]
    for i, w in enumerate([24, 12, 10, 14, 14, 14, 14, 24], 1):
        w3.column_dimensions[get_column_letter(i)].width = w
    put(w3, 1, 1, "夫婦の保険の一覧", H, border=False)
    put(w3, 2, 1, "保険証券を見ながら書き出します。年金で暮らす間も払う保険料と、更新で上がる保険を見ます。", S, border=False)
    for i, t in enumerate(hd, 1):
        put(w3, 4, i, t, B, HEAD)
    for k in range(12):
        for i in range(1, 9):
            put(w3, 5 + k, i, None, N, IN, fmt="#,##0" if i in (4, 5) else None)
    put(w3, 18, 3, "合計（自動）", B)
    put(w3, 18, 4, "=SUM(D5:D16)", B, OK, fmt="#,##0")
    put(w3, 18, 5, "=SUM(E5:E16)", B, OK, fmt="#,##0")
    put(w3, 19, 3, "保険料（年・自動）", B)
    put(w3, 19, 5, "=E18*12", B, OK, fmt="#,##0")
    w3.page_setup.orientation = "landscape"
    w3.page_setup.fitToWidth = 1
    wb.save(OUT / "hoken-minaoshi-teinen.xlsx")


def make_teinen_pdf():
    from playwright.sync_api import sync_playwright
    P = DATA["teinen"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    kp = "".join(f"<tr><td><b>{esc(x['h'])}</b></td><td>{esc(x['jouken'])}</td><td>{esc(x['kigen'])}</td><td>{esc(x['kikan'])}</td><td>{esc(x['hokenryo'])}</td></tr>" for x in P["kenpo"])
    notes = "".join(f"<li>{esc(t)}</li>" for t in P["ninkeiNote"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 11mm 14mm 14mm; }}
body {{ font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 9.5pt; line-height: 1.5; }}
h1 {{ font-size: 17pt; margin: 0 0 1mm; }} h2 {{ font-size: 11pt; margin: 3.5mm 0 1.5mm; }} .sub {{ color: #475569; margin: 0 0 2mm; font-size: 9pt; }}
table {{ width: 100%; border-collapse: collapse; font-size: 8.5pt; }}
th, td {{ border: 1px solid #94a3b8; padding: 1.2mm 2mm; vertical-align: top; }} th {{ background: #e0f2fe; text-align: left; }}
small {{ color: #64748b; font-weight: normal; font-size: 7.5pt; }}
.box {{ border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 1.8mm 4mm; margin-top: 2.5mm; }}
.box ul {{ margin: 1mm 0 0; padding-left: 5mm; }} .note {{ color: #64748b; font-size: 7.5pt; margin: 1.5mm 0 0; }}
.w {{ height: 7mm; }}
</style></head><body><h1>定年退職の 保険の見直しチェックリスト</h1><p class="sub">退職日を書き、期限を数えて書き込みます。確かめたら□に印を付けます。</p>
<h2>① 健康保険の期限（退職日の翌日を1日目に数える）</h2>
<table><tr><th style="width:45%">項目</th><th>日付を書く</th></tr>
<tr><td>退職日（会社に籍がある最後の日）</td><td class="w"></td></tr>
<tr><td>任意継続の申し出の期限（翌日から20日目。必着。土日・祝日なら次の営業日）</td><td class="w"></td></tr>
<tr><td>国民健康保険の届け出の期限（14日以内。市区町村で確かめる）</td><td class="w"></td></tr>
<tr><td>任意継続の終わり（最長2年）</td><td class="w"></td></tr></table>
<p class="note">例：3月31日に退職 → 4月1日が1日目 → 任意継続は4月20日まで、国民健康保険は4月14日まで。</p>
<h2>② 退職後の健康保険3つ</h2>
<table><tr><th>加入先</th><th>入れる人</th><th>期限</th><th>期間</th><th>保険料</th></tr>{kp}</table>
<div class="box"><b>知っておくこと</b><ul>{notes}</ul></div>
<h2>③ 確かめる8つの点</h2><table><tr><th style="width:5mm"></th><th>確かめること</th><th style="width:40mm">メモ</th></tr>{ch}</table>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in TEINEN_KEYS))}（{ck} 確認）</p></body></html>"""
    url = f"{SITE}/guide/shisan-kanri/hoken-minaoshi-teinen"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "hoken-minaoshi-teinen.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


def _check_sheet(ws, r, P):
    from openpyxl.worksheet.datavalidation import DataValidation
    for i, t in enumerate(["", "確かめること", "見るところ", "済"], 1):
        put(ws, r, i, t, B, HEAD)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, c in enumerate(P["check"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, f"【{c['g']}】{c['h']}", B)
        put(ws, rr, 3, c["d"], N)
        dv.add(put(ws, rr, 4, None, B, IN))
        ws.row_dimensions[rr].height = 48
    return r + 2 + len(P["check"])


def _foot(ws, r, keys, ck, path, cols=4):
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=cols)
    ws.row_dimensions[r].height = 70
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}{path}", S, border=False)
    ws.page_setup.fitToWidth = 1


def _pdf_out(doc, name, path, ck):
    from playwright.sync_api import sync_playwright
    url = f"{SITE}{path}"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / name), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


PDF_CSS = """@page { size: A4; margin: 11mm 14mm 14mm; }
body { font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 9.5pt; line-height: 1.5; }
h1 { font-size: 17pt; margin: 0 0 1mm; } h2 { font-size: 11pt; margin: 3.5mm 0 1.5mm; } .sub { color: #475569; margin: 0 0 2mm; font-size: 9pt; }
table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
th, td { border: 1px solid #94a3b8; padding: 1.2mm 2mm; vertical-align: top; } th { background: #e0f2fe; text-align: left; }
small { color: #64748b; font-weight: normal; font-size: 7.5pt; }
.box { border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 1.8mm 4mm; margin-top: 2.5mm; }
.box ul { margin: 1mm 0 0; padding-left: 5mm; } .note { color: #64748b; font-size: 7.5pt; margin: 1.5mm 0 0; } .w { height: 7mm; }"""


# ---------- 住宅ローンの団信と保険の見直し（2026-11-19） ----------
DANSHIN_KEYS = ["jhfShinDanshin", "jhfHonnin", "jhfDanshinMenu", "jiliHitsuyo", "jiliView", "mhlwKougaku", "jiliMinaoshi"]


def make_danshin_xlsx():
    P = DATA["danshin"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "団信と見直し"
    for i, w in enumerate([4, 46, 46, 8], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "住宅ローンの団信と 生命保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、団信で減らせる死亡保障の目安が出ます（例の数字は入れ替えてください）。確かめたら「済」を選びます。", S, border=False)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 30
    rows = [("死亡保障で見込んでいた住居費（月・円。家賃なら家賃＋共益費）", 100000), ("見込んでいた年数（年。配偶者が住み続ける年数など）", 25),
            ("ローンのあとも残る住まいのお金（月・円。管理費・修繕積立金・固定資産税÷12 など）", 25000), ("今の死亡保障の合計（円。分かれば）", 30000000)]
    for k, (h, v) in enumerate(rows):
        put(ws, 4 + k, 2, h, B, HEAD)
        put(ws, 4 + k, 3, v, B, IN, fmt="#,##0")
        ws.row_dimensions[4 + k].height = 32
    put(ws, 8, 2, "死亡保障から減らせる目安（自動）＝（住居費−残るお金）×12×年数", B, HEAD)
    put(ws, 8, 3, "=MAX(0,C4-C6)*12*C5", B, OK, fmt="#,##0")
    put(ws, 9, 2, "見直し後の死亡保障の目安（自動）", B, HEAD)
    put(ws, 9, 3, '=IF(C7="","",MAX(0,C7-C8))', B, OK, fmt="#,##0")
    for r in (8, 9):
        ws.row_dimensions[r].height = 32
    put(ws, 10, 1, P["keisanNote"], S, border=False)
    ws.merge_cells("A10:D10")
    ws.row_dimensions[10].height = 30
    r = _check_sheet(ws, 12, P)
    for t in [x["h"] + "：" + x["d"] for x in P["shikumi"]] + [P["shikumiNote"]]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 44
        r += 1
    _foot(ws, r + 1, DANSHIN_KEYS, ck, "/guide/shisan-kanri/hoken-minaoshi-danshin")
    wb.save(OUT / "hoken-minaoshi-danshin.xlsx")


def make_danshin_pdf():
    P = DATA["danshin"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    sk = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in P["shikumi"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{PDF_CSS}</style></head><body>
<h1>住宅ローンの団信と 生命保険の見直しチェックリスト</h1><p class="sub">数字を書いて減らせる額の目安を出し、確かめたら□に印を付けます。</p>
<h2>① 団信で減らせる死亡保障の目安</h2>
<table><tr><th style="width:55%">項目</th><th>書く</th></tr>
<tr><td>死亡保障で見込んでいた住居費（月）　A</td><td class="w"></td></tr>
<tr><td>見込んでいた年数　B</td><td class="w"></td></tr>
<tr><td>ローンのあとも残る住まいのお金（月）　C</td><td class="w"></td></tr>
<tr><td><b>減らせる目安 ＝（A − C）× 12 × B</b></td><td class="w"></td></tr></table>
<p class="note">例：月10万円を25年見込んでいた、残るお金が月2.5万円 →（10万円−2.5万円）×12×25年＝2,250万円。{esc(P['keisanNote'])}</p>
<div class="box"><b>団信の決まり（住宅金融支援機構）</b><ul>{sk}</ul></div>
<h2>② 確かめる8つの点</h2><table><tr><th style="width:5mm"></th><th>確かめること</th><th style="width:40mm">メモ</th></tr>{ch}</table>
<p class="note">{esc(P['shikumiNote'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in DANSHIN_KEYS))}（{ck} 確認）</p></body></html>"""
    _pdf_out(doc, "hoken-minaoshi-danshin.pdf", "/guide/shisan-kanri/hoken-minaoshi-danshin", ck)


# ---------- 子どもが独立したときの保険の見直し（2026-11-19） ----------
DOKURITSU_KEYS = ["nenkinIzokuKisoR8", "nenkinIzoku", "mhlwIzokuMinaoshi", "jiliHitsuyo", "jiliShohenkou", "jiliShikumi", "jiliView", "mhlwKougaku", "jiliMinaoshi", "jiliKeizoku", "jiliKonnan"]


def make_dokuritsu_xlsx():
    from datetime import date
    P = DATA["dokuritsu"]
    Z = P["izoku"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "見直しチェック"
    for i, w in enumerate([4, 46, 46, 8], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "子どもが独立したときの 保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "オレンジの欄に末の子の生年月日を入れると、遺族基礎年金が終わる日（18歳になった年度の3月31日）が出ます（例の日付は入れ替えてください）。", S, border=False)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 30
    put(ws, 4, 2, "末の子の生年月日", B, HEAD)
    put(ws, 4, 3, date(2008, 4, 2), B, IN, fmt="yyyy/m/d")
    put(ws, 5, 2, "独立する年齢（歳。その年度の3月31日）", B, HEAD)
    put(ws, 5, 3, 22, B, IN)
    put(ws, 6, 2, "遺族基礎年金が終わる日（自動）", B, HEAD)
    put(ws, 6, 3, '=IF(C4="","",DATE(YEAR(EDATE(C4,216)-1)+IF(MONTH(EDATE(C4,216)-1)>=4,1,0),3,31))', B, OK, fmt="yyyy/m/d")
    put(ws, 7, 2, "独立する日（自動）", B, HEAD)
    put(ws, 7, 3, '=IF(C4="","",DATE(YEAR(EDATE(C4,C5*12)-1)+IF(MONTH(EDATE(C4,C5*12)-1)>=4,1,0),3,31))', B, OK, fmt="yyyy/m/d")
    put(ws, 8, 2, "遺族基礎年金のない期間（年・自動）", B, HEAD)
    put(ws, 8, 3, '=IF(C4="","",MAX(0,YEAR(C7)-YEAR(C6)))', B, OK)
    put(ws, 9, 2, f"子1人のときの遺族基礎年金（年額・{Z['nendo']}）", B, HEAD)
    put(ws, 9, 3, Z["base"] + Z["add12"], B, OK, fmt="#,##0")
    for r in range(4, 10):
        ws.row_dimensions[r].height = 30
    put(ws, 10, 1, "18歳になるのは誕生日の前の日です（4月1日生まれは、18歳の誕生日の前の日の3月31日が最後）。" + P["keisanNote"], S, border=False)
    ws.merge_cells("A10:D10")
    ws.row_dimensions[10].height = 44
    r = _check_sheet(ws, 12, P)
    for t in P["izokuNote"]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 32
        r += 1
    _foot(ws, r + 1, DOKURITSU_KEYS, ck, "/guide/shisan-kanri/hoken-minaoshi-dokuritsu")

    w2 = wb.create_sheet("見直す方法")
    for i, w in enumerate([18, 50, 40], 1):
        w2.column_dimensions[get_column_letter(i)].width = w
    put(w2, 1, 1, "死亡保障と保険料を見直す方法", H, border=False)
    for i, t in enumerate(["方法", "中身", "気をつけること"], 1):
        put(w2, 3, i, t, B, HEAD)
    for k, x in enumerate(P["hoho"]):
        for i, t in enumerate([x["h"], x["d"], x["chui"]], 1):
            put(w2, 4 + k, i, t, B if i == 1 else N)
        w2.row_dimensions[4 + k].height = 48
    w2.page_setup.fitToWidth = 1
    wb.save(OUT / "hoken-minaoshi-dokuritsu.xlsx")


def make_dokuritsu_pdf():
    P = DATA["dokuritsu"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    hh = "".join(f"<tr><td><b>{esc(x['h'])}</b></td><td>{esc(x['d'])}</td><td>{esc(x['chui'])}</td></tr>" for x in P["hoho"])
    notes = "".join(f"<li>{esc(t)}</li>" for t in P["izokuNote"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{PDF_CSS}</style></head><body>
<h1>子どもが独立したときの 保険の見直しチェックリスト</h1><p class="sub">日付を書き、確かめたら□に印を付けます。</p>
<h2>① 遺族基礎年金が終わる日</h2>
<table><tr><th style="width:55%">項目</th><th>書く</th></tr>
<tr><td>末の子の生年月日</td><td class="w"></td></tr>
<tr><td>18歳になった年度の3月31日（遺族基礎年金が終わる）</td><td class="w"></td></tr>
<tr><td>独立する年度の3月31日</td><td class="w"></td></tr></table>
<p class="note">例：2008年4月2日生まれ → 18歳になるのは2026年4月1日 → 2027年3月31日まで。2008年4月1日生まれ → 2026年3月31日まで。</p>
<div class="box"><b>遺族年金で知っておくこと</b><ul>{notes}</ul></div>
<h2>② 確かめる8つの点</h2><table><tr><th style="width:5mm"></th><th>確かめること</th><th style="width:40mm">メモ</th></tr>{ch}</table>
<h2>③ 死亡保障と保険料を見直す方法</h2><table><tr><th style="width:24mm">方法</th><th>中身</th><th style="width:48mm">気をつけること</th></tr>{hh}</table>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in DOKURITSU_KEYS))}（{ck} 確認）</p></body></html>"""
    _pdf_out(doc, "hoken-minaoshi-dokuritsu.pdf", "/guide/shisan-kanri/hoken-minaoshi-dokuritsu", ck)


# ---------- 離婚したときの保険の見直し（2026-11-20） ----------
RIKON_KEYS = ["jiliShohenkou", "nenkinIzokuKisoR8", "mhlwKaiseiGaiyo", "jiliIzokuMinaoshi", "jiliHitsuyo", "jiliView", "jiliMinaoshi", "mhlwKougaku", "nenkinBunkatsu", "nenkinBunkatsuKigen"]


def make_rikon_xlsx():
    from datetime import date
    from openpyxl.worksheet.datavalidation import DataValidation
    P = DATA["rikon"]
    Z = P["izoku"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "見直しチェック"
    for i, w in enumerate([4, 46, 46, 8], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "離婚したときの 生命保険の見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "オレンジの欄に子の生年月日と生活費などを入れると、自分が亡くなったときに必要な死亡保障の目安が出ます（例の数字は入れ替えてください）。", S, border=False)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 30
    END = 'IF(C{r}="","",DATE(YEAR(EDATE(C{r},216)-1)+IF(MONTH(EDATE(C{r},216)-1)>=4,1,0),3,31))'
    rows = [
        (4, "子1人目の生年月日", date(2018, 6, 15), "yyyy/m/d"),
        (5, "子2人目の生年月日（いなければ空欄）", date(2015, 9, 1), "yyyy/m/d"),
        (6, "子3人目の生年月日（いなければ空欄）", None, "yyyy/m/d"),
        (7, "自分が亡くなったら子を育てるのは", "元配偶者", None),
        (8, "自分の保険で残したい子の生活費（月・万円）", 15, None),
        (9, "末の子が独立する年齢（歳。その年度の3月31日）", 22, None),
        (10, "教育費・葬儀などのまとまったお金（万円）", 300, None),
        (11, "預貯金・勤務先の死亡退職金など（万円）", 0, None),
        (12, "計算する日（ふつうは今日）", "=TODAY()", "yyyy/m/d"),
    ]
    for r, label, v, fmt in rows:
        put(ws, r, 2, label, B, HEAD)
        put(ws, r, 3, v, B, IN, fmt=fmt)
    dv = DataValidation(type="list", formula1='"元配偶者,祖父母など"', allow_blank=False)
    ws.add_data_validation(dv)
    dv.add(ws["C7"])
    out = [
        (13, "末の子が独立する日（自動）", '=IF(MAX(C4:C6)=0,"",DATE(YEAR(EDATE(MAX(C4:C6),C9*12)-1)+IF(MONTH(EDATE(MAX(C4:C6),C9*12)-1)>=4,1,0),3,31))', "yyyy/m/d"),
        (14, "独立までの月数（来月から・自動）", '=IF(C13="","",MAX(0,(YEAR(C13)-YEAR(C12))*12+MONTH(C13)-MONTH(C12)))', None),
        (15, "支出の見込み（円・自動）", '=IF(C14="","",C8*10000*C14+C10*10000)', "#,##0"),
        (16, f"子の遺族基礎年金の合計（円・{Z['nendo']}の額・いまの決まり・自動）", "=IF(C7=\"元配偶者\",0,'遺族基礎年金の計算'!F34)", "#,##0"),
        (17, "必要な死亡保障の目安（円・いまの決まり・自動）", '=IF(C15="","",MAX(0,C15-C16-C11*10000))', "#,##0"),
        (18, "見直し後（2028年4月から予定）の決まりで数えた目安（円・自動）", "=IF(C15=\"\",\"\",MAX(0,C15-'遺族基礎年金の計算'!F34-C11*10000))", "#,##0"),
    ]
    for r, label, f, fmt in out:
        put(ws, r, 2, label, B, HEAD)
        put(ws, r, 3, f, B, OK, fmt=fmt)
    for r in range(4, 19):
        ws.row_dimensions[r].height = 28
    put(ws, 19, 1, "いまの決まりでは、子に生計を同じくする父または母がいる間は、子に遺族基礎年金は支給されません。元配偶者が引き取って一緒に暮らすときは0円で数えます。2028年4月からは、父または母と一緒に暮らしていても子が受け取れるように見直される予定です（厚生労働省）。" + P["keisanNote"], S, border=False)
    ws.merge_cells("A19:D19")
    ws.row_dimensions[19].height = 70
    r = _check_sheet(ws, 21, P)
    for t in P["izokuNote"]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 32
        r += 1
    _foot(ws, r + 1, RIKON_KEYS, ck, "/guide/shisan-kanri/hoken-minaoshi-rikon")

    w2 = wb.create_sheet("遺族基礎年金の計算")
    for i, w in enumerate([14, 14, 10, 10, 14, 16], 1):
        w2.column_dimensions[get_column_letter(i)].width = w
    put(w2, 1, 1, "子が受け取る遺族基礎年金（年度ごと・自動。祖父母などが育てるとき）", B, border=False)
    for i, t in enumerate(["年度の始め", "年度の終わり", "対象の子", "月数", "年額", "その年度の額"], 1):
        put(w2, 3, i, t, B, HEAD)
    base, add2, add3 = Z["base"], Z["add2"], Z["add3"]
    for k in range(30):
        rr = 4 + k
        a = "=DATE(YEAR('見直しチェック'!C12),MONTH('見直しチェック'!C12)+1,1)" if k == 0 else f"=B{rr - 1}+1"
        put(w2, rr, 1, a, N, fmt="yyyy/m/d")
        put(w2, rr, 2, f"=DATE(YEAR(A{rr})+IF(MONTH(A{rr})>=4,1,0),3,31)", N, fmt="yyyy/m/d")
        ends = "+".join(f"IF('見直しチェック'!C{c}=\"\",0,IF({END.format(r=c).replace('C' + str(c), chr(39) + '見直しチェック' + chr(39) + '!C' + str(c))}>=B{rr},1,0))" for c in (4, 5, 6))
        put(w2, rr, 3, "=" + ends, N)
        put(w2, rr, 4, f"=(YEAR(B{rr})-YEAR(A{rr}))*12+MONTH(B{rr})-MONTH(A{rr})+1", N)
        put(w2, rr, 5, f"=IF(C{rr}=0,0,{base}+IF(C{rr}>=2,{add2},0)+{add3}*MAX(0,C{rr}-2))", N, fmt="#,##0")
        put(w2, rr, 6, f"=ROUND(E{rr}*D{rr}/12,0)", N, fmt="#,##0")
    put(w2, 34, 5, "合計", B, HEAD)
    put(w2, 34, 6, "=SUM(F4:F33)", B, OK, fmt="#,##0")
    w2.page_setup.fitToWidth = 1
    wb.save(OUT / "hoken-minaoshi-rikon.xlsx")


def make_rikon_pdf():
    P = DATA["rikon"]
    Z = P["izoku"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    notes = "".join(f"<li>{esc(t)}</li>" for t in P["izokuNote"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{PDF_CSS}</style></head><body>
<h1>離婚したときの 生命保険の見直しチェックリスト</h1><p class="sub">書き込んで、確かめたら□に印を付けます。</p>
<h2>① 必要な死亡保障の目安</h2><p class="note">{esc(P["hitsuyo"])}</p>
<table><tr><th style="width:55%">項目</th><th>書く</th></tr>
<tr><td>自分が亡くなったら子を育てるのは（元配偶者／祖父母など）</td><td class="w"></td></tr>
<tr><td>A 残したい子の生活費（月の額 × 来月から末の子が独立する年度の3月までの月数）</td><td class="w"></td></tr>
<tr><td>B 教育費・葬儀などのまとまったお金</td><td class="w"></td></tr>
<tr><td>C 子の遺族基礎年金（年額 × 子が18歳になった年度の3月までの年数。子の数が減る年に注意。いまの決まりでは、元配偶者が引き取って一緒に暮らすなら0）</td><td class="w"></td></tr>
<tr><td>D 預貯金・勤務先の死亡退職金など</td><td class="w"></td></tr>
<tr><td><b>必要な死亡保障の目安 ＝ A ＋ B − C − D</b></td><td class="w"></td></tr></table>
<p class="note">子が受け取る遺族基礎年金（{esc(Z['nendo'])}）：子1人 年{Z['base']:,}円、2人 年{Z['base'] + Z['add2']:,}円、3人 年{Z['base'] + Z['add2'] + Z['add3']:,}円を子の数で分ける。子は18歳になった年度の3月31日まで。</p>
<div class="box"><b>離婚後の子の遺族年金で知っておくこと</b><ul>{notes}</ul></div>
<h2>② 確かめる8つの点</h2><table><tr><th style="width:5mm"></th><th>確かめること</th><th style="width:40mm">メモ</th></tr>{ch}</table>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in RIKON_KEYS))}（{ck} 確認）</p></body></html>"""
    _pdf_out(doc, "hoken-minaoshi-rikon.pdf", "/guide/shisan-kanri/hoken-minaoshi-rikon", ck)


# ---------- がん保険の見直し（2026-11-21） ----------
GAN_KEYS = ["jiliGan", "jiliSenshin", "mhlwSenshin", "mhlwKanjaHeikin", "jiliShikumi", "mhlwKougaku", "jiliMinaoshi"]


def make_gan_xlsx():
    from datetime import date
    P = DATA["gan"]
    ck = P["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "がん保険の見直し"
    for i, w in enumerate([4, 46, 46, 8], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    put(ws, 1, 1, "がん保険の 見直しチェックリスト", H, border=False)
    put(ws, 2, 1, "保険証券と約款を見ながら、確かめたら「済」を選びます。乗り換えるなら、オレンジの欄に新しい契約の契約日を入れると、待ち期間の終わりの目安が出ます（例の日付は入れ替えてください）。", S, border=False)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 30
    put(ws, 4, 2, "新しいがん保険の契約日", B, HEAD)
    put(ws, 4, 3, date(2026, 12, 1), B, IN, fmt="yyyy/m/d")
    put(ws, 5, 2, f"待ち期間（{P['machi']}日）の終わりの目安（自動）＝契約日の{P['machi']}日後", B, HEAD)
    put(ws, 5, 3, f'=IF(C4="","",C4+{P["machi"]})', B, OK, fmt="yyyy/m/d")
    for r in (4, 5):
        ws.row_dimensions[r].height = 32
    put(ws, 6, 1, P["keisanNote"] + "古い契約の解約は、新しい契約の保障が始まる日を過ぎてからにします。", S, border=False)
    ws.merge_cells("A6:D6")
    ws.row_dimensions[6].height = 30
    r = _check_sheet(ws, 8, P)
    put(ws, r, 2, "先進医療", B, HEAD)
    put(ws, r, 3, "技術料の平均（平均入院日数）", B, HEAD)
    for k, x in enumerate(P["senshin"]):
        put(ws, r + 1 + k, 2, x["h"])
        put(ws, r + 1 + k, 3, f"{x['yen']:,}円（{x['days']:.1f}日）")
    r += 1 + len(P["senshin"])
    for t in [P["senshinNote"] + "。技術料は全額自己負担", f"がんの平均在院日数 {P['zaiin']['days']}日：{P['zaiin']['note']}"]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 32
        r += 1
    _foot(ws, r + 1, GAN_KEYS, ck, "/guide/shisan-kanri/hoken-minaoshi-gan")
    wb.save(OUT / "hoken-minaoshi-gan.xlsx")


def make_gan_pdf():
    P = DATA["gan"]
    ck = P["checkedAt"].replace("-", "/")
    ch = "".join(f"<tr><td style='width:5mm'>□</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['g'])}｜{esc(c['d'])}</small></td><td style='width:40mm'></td></tr>" for c in P["check"])
    sn = "".join(f"<tr><td>{esc(x['h'])}</td><td>{x['yen']:,}円</td><td>{x['days']:.1f}日</td></tr>" for x in P["senshin"])
    doc = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{PDF_CSS}</style></head><body>
<h1>がん保険の 見直しチェックリスト</h1><p class="sub">保険証券と約款を見ながら、確かめたら□に印を付けます。</p>
<h2>① 確かめる10の点</h2><table><tr><th style="width:5mm"></th><th>確かめること</th><th style="width:40mm">証券に書いてあること</th></tr>{ch}</table>
<h2>② 乗り換えるとき</h2>
<table><tr><th style="width:55%">項目</th><th>書く</th></tr>
<tr><td>新しいがん保険の契約日　A</td><td class="w"></td></tr>
<tr><td>待ち期間（{P['machi']}日）の終わりの目安 ＝ A の{P['machi']}日後</td><td class="w"></td></tr>
<tr><td>新しい契約の保障が始まる日（証券で確かめる）</td><td class="w"></td></tr>
<tr><td><b>古い契約を解約する日（保障が始まる日より後）</b></td><td class="w"></td></tr></table>
<p class="note">{esc(P['keisanNote'])}</p>
<div class="box" style="break-inside:avoid"><b>先進医療の技術料は全額自己負担</b>
<table style="margin-top:1mm"><tr><th>先進医療</th><th>技術料の平均</th><th>平均入院</th></tr>{sn}</table>
<p class="note">{esc(P['senshinNote'])}。がんの平均在院日数 {P['zaiin']['days']}日（{esc(P['zaiin']['note'])}）。</p></div>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in GAN_KEYS))}（{ck} 確認）</p></body></html>"""
    _pdf_out(doc, "hoken-minaoshi-gan.pdf", "/guide/shisan-kanri/hoken-minaoshi-gan", ck)


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
    if only == "kekkon":
        make_kekkon_xlsx()
        make_kekkon_pdf()
    if only == "teinen":
        make_teinen_xlsx()
        make_teinen_pdf()
    if only == "danshin":
        make_danshin_xlsx()
        make_danshin_pdf()
    if only == "dokuritsu":
        make_dokuritsu_xlsx()
        make_dokuritsu_pdf()
    if only == "rikon":
        make_rikon_xlsx()
        make_rikon_pdf()
    if only == "gan":
        make_gan_xlsx()
        make_gan_pdf()
    for f in sorted(OUT.glob("hoken-*")):
        print(f.name, f.stat().st_size)
