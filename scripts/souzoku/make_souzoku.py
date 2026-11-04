"""相続の配布物（ワード・エクセル・PDF）を作る。2026-11-05 新設。

数字と文言の元：lib/souzoku/haifu-data.json（ページと同じ1つのファイル）。
  python3 scripts/souzoku/make_souzoku.py
出力：public/downloads/
  souzoku-isan-bunkatsu-kyogisho.docx / .pdf   遺産分割協議書のひな形（法務局の記載例の形）
  souzoku-kankei-setsumeizu.xlsx / .pdf        相続関係説明図のひな形
  souzoku-zaisan-mokuroku.xlsx / .pdf          財産目録（裁判所の遺産目録の欄）＋相続税の基礎控除の判定
  souzoku-akiya-tokurei-check.xlsx / .pdf      相続した実家（空き家）の3,000万円控除のチェック表
PDF は Playwright（Chromium）で HTML を印刷して作る。書体は Noto Sans CJK JP。
"""
import json
import pathlib
import html

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Pt, Mm
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / "lib/souzoku/haifu-data.json").read_text(encoding="utf-8"))
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
OK_FILL = PatternFill("solid", fgColor="DCFCE7")
thin = Side(style="thin", color="94A3B8")
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


def widths(ws, ws_widths):
    for i, w in enumerate(ws_widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


def src_text(keys):
    return "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{CHECKED} 確認）"


def foot(ws, r, keys, url):
    put(ws, r, 1, src_text(keys), S, border=False)
    put(ws, r + 1, 1, f"つぎの手ナビ　{url}　このひな形は記載例をもとにした参考の形です。実際の内容に合わせて直してください。", S, border=False)


# ---------- 遺産分割協議書（ワード） ----------
def make_kyogisho_docx():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    for side in ("left_margin", "right_margin"):
        setattr(sec, side, Mm(22))
    sec.top_margin, sec.bottom_margin = Mm(20), Mm(18)
    st = doc.styles["Normal"]
    st.font.name = "MS Mincho"
    st.element.rPr.rFonts.set(qn("w:eastAsia"), "ＭＳ 明朝")
    st.font.size = Pt(11)

    def para(t, bold=False, size=None, align=None, space=6):
        p = doc.add_paragraph()
        run = p.add_run(t)
        run.bold = bold
        if size:
            run.font.size = Pt(size)
        if align:
            p.alignment = align
        p.paragraph_format.space_after = Pt(space)
        return p

    para("遺産分割協議書", True, 16, WD_ALIGN_PARAGRAPH.CENTER, 14)
    para("令和　　年　　月　　日、（住所）　　　　　　　　　　　　　　　　　　　　　（氏名）　　　　　　　　　の死亡によって開始した相続の共同相続人である　　　　　　　　、　　　　　　　　、　　　　　　　　は、その相続財産について、次のとおり遺産分割の協議を行った。")
    para("１　相続財産のうち、下記の不動産は、　　　　　　　　が相続する。")
    para("２　相続財産のうち、下記の預貯金は、　　　　　　　　が相続する。")
    para("　　（金融機関・支店　　　　　　　　　　　　　種類　　　　　　口座番号　　　　　　　　　　）")
    para("３　この協議書に書いていない財産が後から見つかったときは、　　　　　　　　が相続する。")
    para("この協議の成立を証するため、本協議書を　　通作成して、それぞれに署名、押印し、各自1通を保有するものとする。", space=12)
    para("令和　　年　　月　　日", align=WD_ALIGN_PARAGRAPH.LEFT, space=12)
    for _ in range(3):
        para("住所　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　", space=2)
        para("氏名　　　　　　　　　　　　　　　　　　　　　　　　　　　　　実印", space=12)
    para("記", True, align=WD_ALIGN_PARAGRAPH.CENTER, space=8)
    para("不動産", True)
    para("　土地　所在　　　　　　　　　　　　　　　地番　　　　　　地目　　　　　　地積　　　　　　平方メートル")
    para("　建物　所在　　　　　　　　　　　　　　　家屋番号　　　　種類　　　　　　構造　　　　　　　　")
    para("　　　　床面積　　１階　　　　平方メートル　　２階　　　　平方メートル", space=14)
    note = doc.add_paragraph()
    r = note.add_run("書き方：不動産は登記事項証明書のとおりに書きます。相続人全員が住所と氏名を自分で書き、実印を押します。印鑑証明書を相続人ごとに1通付けます。"
                     + src_text(["houmuKisai"]) + f"　つぎの手ナビ {SITE}/guide/souzoku/isan-bunkatsu-kyogisho")
    r.font.size = Pt(8)
    doc.save(OUT / "souzoku-isan-bunkatsu-kyogisho.docx")


# ---------- 相続関係説明図（エクセル） ----------
def make_setsumeizu_xlsx():
    wb = Workbook()
    ws = wb.active
    ws.title = "相続関係説明図"
    widths(ws, [2, 26, 6, 26, 6, 26])
    put(ws, 1, 2, "相続関係説明図", H, border=False)
    put(ws, 2, 2, "被相続人（亡くなった人）の欄と、相続人の欄に書き込みます。線は、亡くなった人と相続人のつながりです。", S, border=False)

    def box(r, c, title, lines):
        put(ws, r, c, title, B, HEAD_FILL)
        for i, t in enumerate(lines, 1):
            put(ws, r + i, c, t, N, IN_FILL)

    box(4, 2, "被相続人", ["氏名：", "最後の住所：", "死亡：　　年　　月　　日"])
    box(4, 4, "相続人（配偶者）", ["氏名：", "住所：", "出生：　　年　　月　　日"])
    put(ws, 5, 3, "＝", B, border=False).alignment = Alignment(horizontal="center", vertical="center")
    for k, r in enumerate([10, 15, 20]):
        box(r, 4, f"相続人（子　{k + 1}）", ["氏名：", "住所：", "出生：　　年　　月　　日"])
        put(ws, r + 1, 3, "―", B, border=False).alignment = Alignment(horizontal="center", vertical="center")
    for r in range(8, 22):
        ws.cell(row=r, column=3).border = Border(left=Side(style="medium", color="334155"))
    put(ws, 25, 2, "不動産を受け継がない相続人は、名前の横に「（分割）」と書きます。", N, border=False)
    put(ws, 26, 2, "相続人が多いときは、行をコピーして足してください。", N, border=False)
    foot(ws, 28, ["houmuKisai"], f"{SITE}/guide/souzoku/souzoku-kankei-setsumeizu")
    ws.print_area = "A1:F29"
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-kankei-setsumeizu.xlsx")


# ---------- 財産目録（エクセル） ----------
def make_mokuroku_xlsx():
    M = DATA["mokuroku"]
    wb = Workbook()
    ws = wb.active
    ws.title = "財産目録"
    widths(ws, [6, 30, 18, 18, 16, 14, 18, 22])
    put(ws, 1, 1, "財産目録", H, border=False)
    put(ws, 2, 1, "色の付いた欄に書き込みます。金額は自動で合計します。", S, border=False)
    r = 4
    sections = [("不動産（土地・建物）", M["fudosan"], 5, 7), ("預貯金・現金など", M["yokin"], 8, 4), ("株式など", M["kabu"], 5, 5)]
    total_cells = []
    for title, cols, n, sumcol in sections:
        put(ws, r, 1, title, B, border=False)
        r += 1
        for i, t in enumerate(cols, 1):
            put(ws, r, i, t, B, HEAD_FILL)
        start = r + 1
        for k in range(n):
            put(ws, start + k, 1, k + 1)
            for c in range(2, len(cols) + 1):
                put(ws, start + k, c, None, N, IN_FILL, fmt="#,##0" if c == sumcol or (title.startswith("預貯金") and c == 3) else None)
        end = start + n - 1
        r = end + 1
        put(ws, r, sumcol - 1, "小計", B)
        cell = put(ws, r, sumcol, f"=SUM({get_column_letter(sumcol)}{start}:{get_column_letter(sumcol)}{end})", B, fmt="#,##0")
        total_cells.append(cell.coordinate)
        r += 2
    put(ws, r, 1, "借金・未払い（別に書き出す）", B, border=False)
    r += 1
    for i, t in enumerate(["番号", "借りた先・内容", "残っている額（円）", "備考"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    ds = r + 1
    for k in range(4):
        put(ws, ds + k, 1, k + 1)
        for c in range(2, 5):
            put(ws, ds + k, c, None, N, IN_FILL, fmt="#,##0" if c == 3 else None)
    de = ds + 3
    r = de + 1
    put(ws, r, 2, "小計", B)
    debt = put(ws, r, 3, f"=SUM(C{ds}:C{de})", B, fmt="#,##0").coordinate
    r += 2
    put(ws, r, 1, "相続税の申告が要るか（目安）", H, border=False)
    r += 1
    put(ws, r, 2, "財産の合計（不動産は固定資産税評価額で仮に計算）", B)
    tot = put(ws, r, 3, "=" + "+".join(total_cells), B, fmt="#,##0").coordinate
    r += 1
    put(ws, r, 2, "借金・未払いの合計", B)
    put(ws, r, 3, f"={debt}", B, fmt="#,##0")
    r += 1
    put(ws, r, 2, "法定相続人の数（人）", B)
    heirs = put(ws, r, 3, 2, B, IN_FILL).coordinate
    r += 1
    put(ws, r, 2, "基礎控除＝3,000万円＋600万円×人数", B)
    kiso = put(ws, r, 3, f"={M['kiso']['base']}+{M['kiso']['per']}*{heirs}", B, fmt="#,##0").coordinate
    r += 1
    put(ws, r, 2, "判定", B)
    put(ws, r, 3, f'=IF({tot}-{debt}>{kiso},"基礎控除を超える：申告が要る見込み","基礎控除以下：申告は要らない見込み")', B, OK_FILL)
    r += 1
    put(ws, r, 2, "申告の期限：亡くなったことを知った日の翌日から10か月", N, border=False)
    r += 1
    put(ws, r, 2, "目安です。土地は路線価などで評価し直すので、固定資産税評価額とは違います。特例を使って基礎控除以下になる場合も、申告が要ることがあります。", S, border=False)
    r += 2
    for t in M["notes"]:
        put(ws, r, 1, "・" + t, N, border=False)
        r += 1
    foot(ws, r + 1, ["courtMokuroku", "ntaShikata"], f"{SITE}/guide/souzoku/zaisan-mokuroku")
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-zaisan-mokuroku.xlsx")


# ---------- 空き家の3,000万円控除のチェック表（エクセル） ----------
def make_akiya_xlsx():
    A = DATA["akiya"]
    wb = Workbook()
    ws = wb.active
    ws.title = "チェック表"
    widths(ws, [5, 46, 52, 12])
    put(ws, 1, 1, "相続した実家を売るとき　3,000万円控除のチェック表", H, border=False)
    put(ws, 2, 1, "8つすべてが「はい」なら、使える見込みがあります。右の欄で「はい」「いいえ」を選びます。", S, border=False)
    put(ws, 4, 2, "相続した日（例：2024/6/1）", B)
    d = put(ws, 4, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    put(ws, 5, 2, "この日までに売る（自動）", B)
    put(ws, 5, 3, f'=IF({d}="","",MIN(DATE(YEAR(EDATE({d},36)),12,31),DATE(2027,12,31)))', B, OK_FILL, fmt="yyyy/m/d")
    put(ws, 6, 2, "相続した日から3年たつ年の12月31日と、特例の期限（2027年12月31日）の早いほう", S, border=False)
    r = 8
    for i, t in enumerate(["", "条件", "確かめ方", "はい／いいえ"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"はい,いいえ"', allow_blank=True)
    ws.add_data_validation(dv)
    first = r + 1
    for k, c in enumerate(A["check"]):
        rr = first + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, c["h"], B)
        put(ws, rr, 3, c["d"], N)
        cell = put(ws, rr, 4, None, B, IN_FILL)
        dv.add(cell)
        ws.row_dimensions[rr].height = 34
    last = first + len(A["check"]) - 1
    r = last + 1
    put(ws, r, 2, "判定", B)
    put(ws, r, 3, f'=IF(COUNTIF(D{first}:D{last},"はい")={len(A["check"])},"使える見込み（下の手続きへ）",IF(COUNTIF(D{first}:D{last},"いいえ")>0,"当てはまらない条件あり","まだ全部に答えていません"))', B, OK_FILL)
    r += 1
    put(ws, r, 2, "控除の額", B)
    put(ws, r, 3, A["kojo"], N)
    r += 2
    put(ws, r, 1, "使えそうなら", B, border=False)
    for k, t in enumerate(A["steps"], 1):
        put(ws, r + k, 1, f"{k}．{t}", N, border=False)
    r += len(A["steps"]) + 2
    foot(ws, r, ["ntaAkiya", "hiroshima", "toyama"], f"{SITE}/guide/souzoku/jikka-akiya-tokurei")
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-akiya-tokurei-check.xlsx")


# ---------- PDF ----------
CSS = """
@page { size: A4; margin: 14mm 14mm 16mm; }
body { font-family: 'Noto Sans CJK JP', sans-serif; color: #0f172a; font-size: 10.5pt; line-height: 1.6; }
h1 { font-size: 17pt; margin: 0 0 1mm; }
.sub { color: #475569; margin: 0 0 5mm; font-size: 9.5pt; }
h2 { font-size: 12pt; margin: 6mm 0 2mm; border-left: 4px solid #0369a1; padding-left: 2.5mm; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
th, td { border: 1px solid #94a3b8; padding: 2mm 2mm; vertical-align: top; }
th { background: #e0f2fe; text-align: left; }
td.w { height: 9mm; }
.note { color: #64748b; font-size: 8pt; margin: 1.5mm 0 0; }
.box { border: 1.5px solid #fdba74; background: #fff7ed; border-radius: 3mm; padding: 3mm 4mm; margin-top: 4mm; }
.mincho { font-family: 'Noto Serif CJK JP', 'Noto Sans CJK JP', serif; font-size: 11pt; line-height: 2.1; }
.line { border-bottom: 1px solid #334155; display: inline-block; min-width: 40mm; }
.tree { display: grid; grid-template-columns: 62mm 14mm 62mm; row-gap: 6mm; align-items: center; margin-top: 4mm; }
.person { border: 1.5px solid #334155; border-radius: 2mm; padding: 2mm 3mm; font-size: 9.5pt; line-height: 2; }
.person b { display: block; border-bottom: 1px solid #cbd5e1; margin-bottom: 1mm; }
.conn { text-align: center; font-size: 14pt; color: #334155; }
"""


def esc(s):
    return html.escape(str(s))


def page(title, sub, body):
    return f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<h1>{esc(title)}</h1><p class="sub">{esc(sub)}</p>{body}</body></html>"""


def kyogisho_html():
    signs = "".join('<p>住所 <span class="line" style="min-width:120mm"></span><br>氏名 <span class="line" style="min-width:95mm"></span>　実印</p>' for _ in range(3))
    body = f"""<div class="mincho">
<p>令和　　年　　月　　日、（住所）<span class="line" style="min-width:70mm"></span>（氏名）<span class="line"></span>の死亡によって開始した相続の共同相続人である<span class="line"></span>、<span class="line"></span>、<span class="line"></span>は、その相続財産について、次のとおり遺産分割の協議を行った。</p>
<p>１　相続財産のうち、下記の不動産は、<span class="line"></span>が相続する。</p>
<p>２　相続財産のうち、下記の預貯金は、<span class="line"></span>が相続する。<br>　（金融機関・支店<span class="line"></span> 種類<span class="line" style="min-width:20mm"></span> 口座番号<span class="line"></span>）</p>
<p>３　この協議書に書いていない財産が後から見つかったときは、<span class="line"></span>が相続する。</p>
<p>この協議の成立を証するため、本協議書を　　通作成して、それぞれに署名、押印し、各自1通を保有するものとする。</p>
<p>令和　　年　　月　　日</p>{signs}
<p style="text-align:center">記</p>
<p>土地　所在<span class="line" style="min-width:60mm"></span> 地番<span class="line" style="min-width:20mm"></span> 地目<span class="line" style="min-width:15mm"></span> 地積<span class="line" style="min-width:18mm"></span>㎡<br>
建物　所在<span class="line" style="min-width:60mm"></span> 家屋番号<span class="line" style="min-width:20mm"></span><br>
　　　種類<span class="line" style="min-width:20mm"></span> 構造<span class="line" style="min-width:40mm"></span> 床面積 1階<span class="line" style="min-width:15mm"></span>㎡ 2階<span class="line" style="min-width:15mm"></span>㎡</p></div>
<p class="note">書き方：不動産は登記事項証明書のとおりに書く。相続人全員が住所と氏名を自分で書き、実印を押す。印鑑証明書を相続人ごとに1通付ける。{esc(src_text(['houmuKisai']))}</p>"""
    return page("遺産分割協議書", "相続人全員で話し合った内容を書き、全員が署名して実印を押します（ひな形）。", body)


def setsumeizu_html():
    def person(t):
        return f'<div class="person"><b>{t}</b>氏名：<br>住所：<br>{"死亡" if t=="被相続人" else "出生"}：　　年　　月　　日</div>'
    tree = (person("被相続人") + '<div class="conn">＝</div>' + person("相続人（配偶者）")
            + '<div></div><div class="conn">┣</div>' + person("相続人（子 1）")
            + '<div></div><div class="conn">┣</div>' + person("相続人（子 2）")
            + '<div></div><div class="conn">┗</div>' + person("相続人（子 3）"))
    pts = "".join(f"<li><b>{esc(p['h'])}</b>：{esc(p['d'])}</li>" for p in DATA["setsumeizu"]["points"])
    body = f"""<div class="tree">{tree}</div>
<div class="box"><b>書き方</b><ul style="margin:1mm 0 0;padding-left:5mm">{pts}</ul></div>
<p class="note">{esc(src_text(['houmuKisai']))}</p>"""
    return page("相続関係説明図", "亡くなった人と相続人のつながりを1枚にまとめます（ひな形）。", body)


def mokuroku_html():
    M = DATA["mokuroku"]

    def tbl(cols, n):
        head = "".join(f"<th>{esc(c)}</th>" for c in cols)
        rows = "".join("<tr>" + "".join(f"<td class='w'>{k+1 if i==0 else ''}</td>" for i in range(len(cols))) + "</tr>" for k in range(n))
        return f"<table><tr>{head}</tr>{rows}</table>"
    body = f"""<h2>不動産（土地・建物）</h2>{tbl(M['fudosan'], 4)}
<h2>預貯金・現金など</h2>{tbl(M['yokin'], 5)}
<h2>株式など</h2>{tbl(M['kabu'], 3)}
<h2>借金・未払い</h2>{tbl(['番号','借りた先・内容','残っている額（円）','備考'], 3)}
<div class="box"><b>相続税の申告が要るか（目安）</b><br>財産の合計 − 借金 が「3,000万円＋600万円×法定相続人の数」を超えたら、申告が要る見込みです。期限は、亡くなったことを知った日の翌日から10か月。
<p class="note">{esc(src_text(['courtMokuroku','ntaShikata']))}</p></div>"""
    return page("財産目録", "亡くなった人の財産を1か所に書き出します。裁判所の遺産目録と同じ欄です（ひな形）。", body)


def akiya_html():
    A = DATA["akiya"]
    rows = "".join(f"<tr><td>☐</td><td><b>{esc(c['h'])}</b></td><td>{esc(c['d'])}</td></tr>" for c in A["check"])
    steps = "".join(f"<li>{esc(s)}</li>" for s in A["steps"])
    body = f"""<p>相続した日：<span class="line"></span>　→　この日までに売る：<span class="line"></span>（相続した日から3年たつ年の12月31日と、2027年12月31日の早いほう）</p>
<table><tr><th></th><th>条件</th><th>確かめ方</th></tr>{rows}</table>
<div class="box"><b>8つすべてに当てはまれば</b>　控除の額：{esc(A['kojo'])}<ol style="margin:1mm 0 0;padding-left:5mm">{steps}</ol></div>
<p class="note">{esc(src_text(['ntaAkiya','hiroshima','toyama']))}</p>"""
    return page("相続した実家を売るとき　3,000万円控除のチェック表", "亡くなった親が一人で住んでいた家を売るときの、税金の特例の条件です。", body)


def make_pdfs():
    from playwright.sync_api import sync_playwright
    items = [
        ("souzoku-isan-bunkatsu-kyogisho", kyogisho_html(), f"{SITE}/guide/souzoku/isan-bunkatsu-kyogisho"),
        ("souzoku-kankei-setsumeizu", setsumeizu_html(), f"{SITE}/guide/souzoku/souzoku-kankei-setsumeizu"),
        ("souzoku-zaisan-mokuroku", mokuroku_html(), f"{SITE}/guide/souzoku/zaisan-mokuroku"),
        ("souzoku-akiya-tokurei-check", akiya_html(), f"{SITE}/guide/souzoku/jikka-akiya-tokurei"),
    ]
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        for name, doc, url in items:
            pg.set_content(doc, wait_until="load")
            ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
                  f"<span>つぎの手ナビ　{esc(url)}　（{CHECKED} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
            pg.pdf(path=str(OUT / f"{name}.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
                   display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


if __name__ == "__main__":
    make_kyogisho_docx()
    make_setsumeizu_xlsx()
    make_mokuroku_xlsx()
    make_akiya_xlsx()
    make_pdfs()
    for f in sorted(OUT.glob("souzoku-*")):
        print(f.name, f.stat().st_size)
