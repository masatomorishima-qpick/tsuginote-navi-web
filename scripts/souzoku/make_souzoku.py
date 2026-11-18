"""相続の配布物（ワード・エクセル・PDF）を作る。2026-11-05 新設。

数字と文言の元：lib/souzoku/haifu-data.json（ページと同じ1つのファイル）。
  python3 scripts/souzoku/make_souzoku.py
出力：public/downloads/
  souzoku-isan-bunkatsu-kyogisho.docx / .pdf   遺産分割協議書のひな形（法務局の記載例の形）
  souzoku-kankei-setsumeizu.xlsx / .pdf        相続関係説明図のひな形
  souzoku-zaisan-mokuroku.xlsx / .pdf          財産目録（裁判所の遺産目録の欄）＋相続税の基礎控除の判定
  souzoku-akiya-tokurei-check.xlsx / .pdf      相続した実家（空き家）の3,000万円控除のチェック表
  souzoku-tetsuzuki-checklist.xlsx / .pdf      相続の手続きチェックリスト（期限の自動計算つき。2026-11-10）
  souzoku-shinkoku-shorui.xlsx / .pdf         相続税の申告の必要書類チェックリスト（状況に ○ で要る書類が出る。2026-11-11）
  souzoku-hokenkin-hikazei.xlsx / .pdf        死亡保険金の非課税の計算表（受取人ごとの按分つき。2026-11-11）
  souzoku-houtei-souzokubun.xlsx / .pdf       法定相続分の計算表（人数を入れると割合と金額・遺留分。2026-11-12）
  souzoku-touki-shorui.xlsx / .pdf            相続登記の必要書類チェックリスト（期限と登録免許税の計算つき。2026-11-12）
  souzoku-junkakutei-shorui.xlsx / .pdf       準確定申告の必要書類チェックリスト（期限の計算つき。2026-11-12）
  souzoku-zaisan-shirabekata.xlsx / .pdf      相続財産の調べ方チェックリスト（窓口・手数料・期限の計算つき。2026-11-13）
  souzoku-koseki-atsumekata.xlsx / .pdf       相続の戸籍の集め方チェックリスト（相続人ごとの戸籍・手数料の計算つき。2026-11-13）
  souzoku-shinkoku-jibun.xlsx / .pdf          相続税の申告を自分でする手順チェックリスト（期限・目安の日・作る表。2026-11-14）
  souzoku-souzokunin-shinkoku-touki.xlsx / .pdf  相続人申告登記のチェックリスト（続柄ごとの戸籍・期限・申出書の下書き。2026-11-14）
  souzoku-seizen-zouyo-kasan.xlsx / .pdf      生前贈与加算の計算表（亡くなった日で期間を決め、贈与を振り分け。2026-11-15）
  souzoku-shokibo-takuchi-shorui.xlsx / .pdf  小規模宅地等の特例の必要書類チェックリスト（○で要る書類・減る額の計算。2026-11-15）
  souzoku-miseinen-shougaisha-kojo.xlsx / .pdf  未成年者控除・障害者控除の計算表（生年月日から年数と額。2026-11-15）
  souzoku-souji-souzoku-kojo.xlsx / .pdf      相次相続控除の計算表（日付と金額から年数・割合・控除の額。2026-11-16）
  souzoku-niwari-kasan.xlsx / .pdf            2割加算の計算表（続柄で判定・相続税の総額から各人の税額と加算額。2026-11-17）
  souzoku-shibou-taishokukin-hikazei.xlsx / .pdf  死亡退職金の非課税の計算表（受け取った人ごとの按分・弔慰金の多すぎる分。2026-11-17）
  souzoku-zero-en-shinkoku.xlsx / .pdf        相続税の0円申告のチェックリスト（判定・期限・作る表と書類。2026-11-17）
  souzoku-shinkoku-okure.xlsx / .pdf          延滞税と無申告加算税の計算表（年ごとの割合・期限後の納期限。2026-11-17）
  python3 scripts/souzoku/make_souzoku.py tetsuzuki  で、このファイルだけ作り直す（shinkoku・hikazei・houtei・touki・junkakutei・shirabe・koseki・jibun・shinkokuTouki・seizen・shokibo・miseinen・souji・niwari・taishoku・zero・okure も同じ）
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


# ---------- 相続の手続きチェックリスト（2026-11-10） ----------
def make_tetsuzuki_xlsx():
    T = DATA["tetsuzuki"]
    ck = T["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "手続きチェック"
    widths(ws, [5, 30, 34, 14, 16, 40, 8])
    put(ws, 1, 1, "相続の手続きチェックリスト（期限つき）", H, border=False)
    put(ws, 2, 1, "亡くなった日を入れると、月・年で決まる期限の目安が出ます。終わったら「済」を選びます。", S, border=False)
    put(ws, 4, 2, "亡くなった日（例：2026/1/6）", B)
    d = put(ws, 4, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    r = 6
    for i, t in enumerate(["", "手続き", "期限", "期限の目安（自動）", "出す所", "メモ", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, it in enumerate(T["items"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, it["h"], B)
        put(ws, rr, 3, it["kigen"], N)
        if it["unit"] == "m":
            # 2026-11-13 直し：翌日から数えて応当日の前の日（応当日がない月は月末）。EDATE だけだと月末に亡くなった場合に1〜3日早く出ていた
            f = f'=IF({d}="","",IF(DAY(EDATE({d}+1,{it["n"]}))<DAY({d}+1),EDATE({d}+1,{it["n"]}),EDATE({d}+1,{it["n"]})-1))'
        elif it["unit"] == "y":
            f = f'=IF({d}="","",IF(DAY(EDATE({d}+1,{it["n"] * 12}))<DAY({d}+1),EDATE({d}+1,{it["n"] * 12}),EDATE({d}+1,{it["n"] * 12})-1))'
        else:
            f = "日数の期限は出す先で確認" if it["unit"] == "d" else "－"
        put(ws, rr, 4, f, B, OK_FILL, fmt="yyyy/m/d")
        put(ws, rr, 5, it["saki"], N)
        put(ws, rr, 6, it["memo"], N)
        c = put(ws, rr, 7, None, B, IN_FILL)
        dv.add(c)
        ws.row_dimensions[rr].height = 36
    r = r + 1 + len(T["items"]) + 1
    put(ws, r, 1, "期限の前にしておくこと", B, border=False)
    for k, j in enumerate(T["junbi"], 1):
        put(ws, r + k, 1, f"☐ {j['h']}" + (f"（ひな形：{SITE}{j['href']}）" if j["href"] else ""), N, border=False)
    r += len(T["junbi"]) + 2
    put(ws, r, 1, T["keisanNote"], S, border=False)
    keys = sorted({it["src"] for it in T["items"]})
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/tetsuzuki-checklist　期限は目安です。くわしくは各窓口で確かめてください。", S, border=False)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-tetsuzuki-checklist.xlsx")


def tetsuzuki_html():
    T = DATA["tetsuzuki"]
    rows = "".join(f"<tr><td>☐</td><td><b>{esc(it['h'])}</b></td><td>{esc(it['kigen'])}</td><td class='w'></td><td>{esc(it['saki'])}</td><td>{esc(it['memo'])}</td></tr>" for it in T["items"])
    junbi = "".join(f"<li>☐ {esc(j['h'])}</li>" for j in T["junbi"])
    keys = sorted({it["src"] for it in T["items"]})
    ck = T["checkedAt"].replace("-", "/")
    body = f"""<p>亡くなった日：<span class="line"></span></p>
<table><tr><th style="width:5mm"></th><th style="width:34mm">手続き</th><th style="width:38mm">期限</th><th style="width:22mm">期限の日</th><th style="width:26mm">出す所</th><th>メモ</th></tr>{rows}</table>
<div class="box"><b>期限の前にしておくこと</b><ul style="margin:1mm 0 0;padding-left:2mm;list-style:none">{junbi}</ul></div>
<p class="note">{esc(T['keisanNote'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    return page("相続の手続きチェックリスト", "期限のある手続きを、早い順に並べました。終わったら☐に印を付けます。", body)


def make_tetsuzuki_pdf():
    from playwright.sync_api import sync_playwright
    url = f"{SITE}/guide/souzoku/tetsuzuki-checklist"
    ck = DATA["tetsuzuki"]["checkedAt"].replace("-", "/")
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(tetsuzuki_html(), wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / "souzoku-tetsuzuki-checklist.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


# ---------- 相続税の申告の必要書類チェックリスト（2026-11-11） ----------
def _pdf(html_doc, name, path, ck):
    from playwright.sync_api import sync_playwright
    url = f"{SITE}{path}"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(html_doc, wait_until="load")
        ft = (f"<div style=\"font-family:'Noto Sans CJK JP';font-size:7px;color:#94a3b8;width:100%;padding:0 14mm;display:flex;justify-content:space-between\">"
              f"<span>つぎの手ナビ　{esc(url)}　（{ck} 確認）</span><span><span class='pageNumber'></span> / <span class='totalPages'></span></span></div>")
        pg.pdf(path=str(OUT / name), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>", footer_template=ft)
        b.close()


def make_shinkoku_xlsx():
    D = DATA["shorui"]
    ck = D["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "必要書類"
    widths(ws, [6, 44, 46, 10])
    dv = DataValidation(type="list", formula1='"○"', allow_blank=True)
    dv2 = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    ws.add_data_validation(dv2)
    put(ws, 1, 1, "相続税の申告の必要書類チェックリスト", H, border=False)
    put(ws, 2, 1, "① 当てはまる所に ○ を付けます。② 要る書類の「要る」が自動で出ます。そろえたら「済」を選びます。", S, border=False)
    r = 4
    for i, t in enumerate(["当てはまる", "状況", "", ""], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    cell_of = {}
    jo = [{"key": "yoshi", "h": "亡くなった人に養子がいる"}] + D["jokyo"]
    for k, j in enumerate(jo):
        rr = r + 1 + k
        c = put(ws, rr, 1, None, B, IN_FILL)
        dv.add(c)
        cell_of[j["key"]] = c.coordinate
        put(ws, rr, 2, j["h"], N)
        ws.merge_cells(start_row=rr, start_column=2, end_row=rr, end_column=4)
    r = r + len(jo) + 2
    for i, t in enumerate(["要る", "書類", "メモ", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    r += 1
    put(ws, r, 1, "誰でも出す書類", B, border=False)
    r += 1
    first = r
    for k in D["kyotsu"]:
        f = f'=IF({cell_of["yoshi"]}="○","要る","－")' if k["key"] == "yoshi" else "要る"
        put(ws, r, 1, f, B, OK_FILL)
        put(ws, r, 2, k["h"], B)
        put(ws, r, 3, k["d"], N)
        dv2.add(put(ws, r, 4, None, B, IN_FILL))
        ws.row_dimensions[r].height = 42
        r += 1
    for j in D["jokyo"]:
        put(ws, r, 1, "特例：" + j["h"].replace("└ ", "（自宅の土地の特例のうち）"), B, border=False)
        r += 1
        cond = f'{cell_of[j["key"]]}="○"'
        if j.get("sub"):
            cond = f'AND({cell_of["shokibo"]}="○",{cell_of[j["key"]]}="○")'
        for it in j["items"]:
            put(ws, r, 1, f'=IF({cond},"要る","－")', B, OK_FILL)
            put(ws, r, 2, it["h"], B)
            put(ws, r, 3, it["d"], N)
            dv2.add(put(ws, r, 4, None, B, IN_FILL))
            ws.row_dimensions[r].height = 32
            r += 1
    last = r - 1
    put(ws, r, 2, "要る書類の数", B)
    put(ws, r, 3, f'=COUNTIF(A{first}:A{last},"要る")&"点（済 "&COUNTIF(D{first}:D{last},"済")&"点）"', B, OK_FILL)
    r += 2
    put(ws, r, 1, "財産ごとに書く申告書の表", B, border=False)
    r += 1
    for i, t in enumerate(["", "財産・特例", "書く表", ""], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    for h in D["hyo"]:
        r += 1
        put(ws, r, 1, "")
        put(ws, r, 2, h["zaisan"], B)
        put(ws, r, 3, f'{h["hyo"]}　{h["name"]}', N)
        put(ws, r, 4, "")
    r += 2
    put(ws, r, 1, "金額を書くときに手元に置くもの（例）：" + "・".join(D["tegoto"]), N, border=False)
    put(ws, r + 1, 1, "申告の期限：" + DATA["zei"]["kigen"], B, border=False)
    put(ws, r + 2, 1, D["note"], S, border=False)
    put(ws, r + 3, 1, src_text(["ntaShoruiIchiran", "ntaYoshikiR08", "nta4205"]).replace(CHECKED, ck), S, border=False)
    put(ws, r + 4, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/shinkoku-shorui-checklist　くわしくは税務署か税理士に確かめてください。", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-shinkoku-shorui.xlsx")


def make_shinkoku_pdf():
    D = DATA["shorui"]
    ck = D["checkedAt"].replace("-", "/")
    ky = "".join(f"<tr><td>☐</td><td><b>{esc(k['h'])}</b><br><small>{esc(k['d'])}</small></td></tr>" for k in D["kyotsu"])
    jo = ""
    for j in D["jokyo"]:
        items = "".join(f"<tr><td>☐</td><td><b>{esc(it['h'])}</b>{('<br><small>' + esc(it['d']) + '</small>') if it['d'] else ''}</td></tr>" for it in j["items"])
        jo += f"<tr><th colspan='2'>{'　' if j.get('sub') else ''}{esc(j['h'].replace('└ ', '自宅の土地の特例のうち：'))}</th></tr>{items}"
    hy = "".join(f"<tr><td>{esc(h['zaisan'])}</td><td><b>{esc(h['hyo'])}</b>　<small>{esc(h['name'])}</small></td></tr>" for h in D["hyo"])
    # 2026-11-18：検索から PDF に直接来る人が多い（直近7日 表示99、「相続税申告 必要書類」4.6位）ため、ページへの道を最初に置く。
    url = f"{SITE}/guide/souzoku/shinkoku-shorui-checklist"
    body = f"""<style>td:first-child{{width:6mm;text-align:center}} small{{color:#64748b;font-size:8pt}} th{{font-size:9.5pt}} .go{{border:1.5px solid #0369a1;border-radius:3mm;padding:2.5mm 3.5mm;margin:0 0 3mm;font-size:10pt}} .go a{{color:#0369a1;font-weight:bold}}</style>
<div class="go">状況を選ぶだけで、要る書類だけが出るチェック表（無料）は、つぎの手ナビのページで使えます。<br><a href="{esc(url)}">{esc(url)}</a></div>
<h2>誰でも出す書類</h2><table>{ky}</table>
<h2>特例を使うときに足す書類（当てはまる所だけ）</h2><table>{jo}</table>
<h2>財産ごとに書く申告書の表</h2><table><tr><th style="width:40mm">財産・特例</th><th>書く表</th></tr>{hy}</table>
<div class="box"><b>申告の期限</b>：{esc(DATA['zei']['kigen'])}<br>金額を書くときに手元に置くもの（例）：{esc('・'.join(D['tegoto']))}</div>
<p class="note">{esc(D['note'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['ntaShoruiIchiran', 'ntaYoshikiR08', 'nta4205']))}（{ck} 確認）</p>"""
    doc = page("相続税の申告の必要書類チェックリスト", "そろえたら☐に印を付けます。特例を使わないなら、上の表だけで足ります。", body)
    _pdf(doc, "souzoku-shinkoku-shorui.pdf", "/guide/souzoku/shinkoku-shorui-checklist", ck)


# ---------- 死亡保険金の非課税の計算表（2026-11-11） ----------
def make_hikazei_xlsx():
    Hk = DATA["hikazei"]
    ck = Hk["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "非課税の計算"
    widths(ws, [22, 18, 18, 18, 18])
    put(ws, 1, 1, "死亡保険金の相続税の非課税の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、受取人ごとの非課税の額と相続税の対象になる額が出ます。", S, border=False)
    put(ws, 4, 1, "① 法定相続人", B, HEAD_FILL)
    put(ws, 4, 2, "人数", B, HEAD_FILL)
    labels = [("配偶者（0か1）", 1), ("実の子（子がいなければ親か兄弟姉妹）", 2), ("養子", 0)]
    for k, (t, v) in enumerate(labels):
        put(ws, 5 + k, 1, t, N)
        put(ws, 5 + k, 2, v, B, IN_FILL)
    put(ws, 8, 1, "数える人数（自動）", B)
    put(ws, 8, 2, "=B5+B6+MIN(B7,IF(B6>0,1,2))", B, OK_FILL)
    put(ws, 9, 1, "非課税の限度額（自動）", B)
    put(ws, 9, 2, f"={Hk['per']}*B8", B, OK_FILL, fmt="#,##0\"円\"")
    r = 11
    for i, t in enumerate(["② 受取人", "受け取った額（円）", "相続人か（はい／いいえ）", "非課税（自動）", "相続税の対象（自動）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"はい,いいえ"', allow_blank=True)
    ws.add_data_validation(dv)
    rows = range(r + 1, r + 7)
    sample = {r + 1: ("配偶者", 30000000, "はい"), r + 2: ("子", 10000000, "はい")}
    a, b = r + 1, r + 6
    total = f'SUMIF($C${a}:$C${b},"はい",$B${a}:$B${b})'
    for rr in rows:
        nm, km, so = sample.get(rr, (None, None, "はい"))
        put(ws, rr, 1, nm, N, IN_FILL)
        put(ws, rr, 2, km, N, IN_FILL, fmt="#,##0")
        c = put(ws, rr, 3, so, N, IN_FILL)
        dv.add(c)
        put(ws, rr, 4, f'=IF(B{rr}="","",IF(C{rr}<>"はい",0,IF({total}>$B$9,ROUNDDOWN($B$9*B{rr}/{total},0),B{rr})))', B, OK_FILL, fmt="#,##0")
        put(ws, rr, 5, f'=IF(B{rr}="","",B{rr}-D{rr})', B, OK_FILL, fmt="#,##0")
    put(ws, b + 1, 1, "合計", B)
    put(ws, b + 1, 2, f"=SUM(B{a}:B{b})", B, OK_FILL, fmt="#,##0")
    put(ws, b + 1, 4, f"=SUM(D{a}:D{b})", B, OK_FILL, fmt="#,##0")
    put(ws, b + 1, 5, f"=SUM(E{a}:E{b})", B, OK_FILL, fmt="#,##0")
    r = b + 3
    put(ws, r, 1, "きまり", B, border=False)
    for k, x in enumerate(Hk["rules"], 1):
        put(ws, r + k, 1, f"・{x['h']}：{x['d']}", N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=5)
    r += len(Hk["rules"]) + 1
    put(ws, r, 1, "・" + Hk["anbun"], N, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
    ws.row_dimensions[r].height = 30
    put(ws, r + 1, 1, "・" + Hk["shinkoku"] + "。1円未満は切り捨てて表示します。", N, border=False)
    put(ws, r + 2, 1, "入っている例：" + Hk["rei"]["note"], S, border=False)
    put(ws, r + 3, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4114", "nta1750"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 4, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/shibou-hokenkin-hikazei", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-hokenkin-hikazei.xlsx")


def make_hikazei_pdf():
    Hk = DATA["hikazei"]
    ck = Hk["checkedAt"].replace("-", "/")
    rules = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Hk["rules"])
    blank = "".join("<tr><td class='w'></td><td></td><td>はい・いいえ</td><td></td><td></td></tr>" for _ in range(4))
    zm = "".join(f"<tr><td>{esc(z['hihoken'])}</td><td>{esc(z['futan'])}</td><td>{esc(z['uketori'])}</td><td><b>{esc(z['zei'])}</b></td></tr>" for z in Hk["zeimoku"])
    body = f"""<h2>① 非課税の限度額</h2>
<p>500万円 × 法定相続人の数（<span class="line" style="min-width:14mm"></span>人）＝ <span class="line"></span>円</p>
<h2>② 受取人ごとの非課税</h2>
<table><tr><th>受取人</th><th>受け取った額</th><th>相続人か</th><th>非課税</th><th>相続税の対象</th></tr>{blank}</table>
<p class="note">{esc(Hk['anbun'])}</p>
<div class="box"><b>きまり</b><ul style="margin:1mm 0 0;padding-left:5mm">{rules}</ul></div>
<h2>相続税になる保険金の見分け方</h2>
<table><tr><th>亡くなった人</th><th>保険料を払った人</th><th>受取人</th><th>税</th></tr>{zm}</table>
<p class="note">例：{esc(Hk['rei']['note'])} → 非課税 1,125万円・375万円、相続税の対象 1,875万円・625万円。</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4114', 'nta1750']))}（{ck} 確認）</p>"""
    doc = page("死亡保険金の非課税の確認表", "相続人の人数と、受取人ごとの金額を書き込みます。", body)
    _pdf(doc, "souzoku-hokenkin-hikazei.pdf", "/guide/souzoku/shibou-hokenkin-hikazei", ck)


def kigen_f(d, n):
    """「知った日（の翌日）から n か月以内」の最後の日の式。翌日から数えて応当日の前の日、応当日がない月は末日、月末に知ったら n か月後の月末。"""
    return f'IF(DAY({d}+1)=1,EOMONTH({d},{n}),MIN(DATE(YEAR({d}+1),MONTH({d}+1)+{n},DAY({d}+1)-1),EOMONTH({d}+1,{n})))'


# ---------- 法定相続分の計算表（2026-11-12） ----------
def make_houtei_xlsx():
    Ho = DATA["houtei"]
    ck = Ho["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "法定相続分"
    widths(ws, [34, 16, 18, 16])
    put(ws, 1, 1, "法定相続分の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に人数と遺産の額を入れると、1人あたりの法定相続分・金額・遺留分の割合が出ます。相続放棄した人は入れません。", S, border=False)
    put(ws, 4, 1, "① 家族（亡くなった人から見て）", B, HEAD_FILL)
    put(ws, 4, 2, "入れる", B, HEAD_FILL)
    ins = [("配偶者（いれば1、いなければ0）", 1), ("子の数", 2), ("親（父母）の数　※子がいれば計算に入りません", 0),
           ("兄弟姉妹（父母とも同じ）の数　※子か親がいれば計算に入りません", 0), ("兄弟姉妹（父母の片方だけ同じ）の数　※子か親がいれば計算に入りません", 0), ("遺産の額（円）", 100000000)]
    for k, (t, v) in enumerate(ins):
        put(ws, 5 + k, 1, t, N)
        put(ws, 5 + k, 2, v, B, IN_FILL, fmt="#,##0" if k == 5 else None)
    hai = "IF(B5=0,0,IF(B6>0,1/2,IF(B7>0,2/3,IF(B8+B9>0,3/4,1))))"
    oth = "IF(B6+B7+B8+B9=0,0,1-" + hai + ")"
    r = 12
    for i, t in enumerate(["② 結果（自動）", "1人あたりの割合", "1人あたりの金額", "遺留分（1人あたり）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    sotai = "IF(AND(B5=0,B6=0,B7>0),1/3,1/2)"
    rows = [
        ("配偶者", f"={hai}", True),
        ("子（1人あたり）", f"=IF(B6>0,({oth})/B6,0)", True),
        ("親（1人あたり）", f"=IF(AND(B6=0,B7>0),({oth})/B7,0)", True),
        ("兄弟姉妹・父母とも同じ（1人あたり）", f"=IF(AND(B6=0,B7=0,B8+B9>0),({oth})*2/(2*B8+B9),0)", False),
        ("兄弟姉妹・父母の片方だけ同じ（1人あたり）", f"=IF(AND(B6=0,B7=0,B8+B9>0),({oth})/(2*B8+B9),0)", False),
    ]
    for k, (t, fml, iryu) in enumerate(rows):
        rr = r + 1 + k
        put(ws, rr, 1, t, B)
        put(ws, rr, 2, fml, B, OK_FILL, fmt="# ?/???")
        put(ws, rr, 3, f"=ROUNDDOWN(B{rr}*$B$10,0)", B, OK_FILL, fmt="#,##0")
        # 配偶者と兄弟姉妹のときは、遺留分を持つのが配偶者だけなので配偶者に2分の1
        fi = f"=IF(AND(B5=1,B6=0,B7=0,B8+B9>0),1/2,{sotai}*B{rr})" if k == 0 else f"={sotai}*B{rr}"
        put(ws, rr, 4, fi if iryu else 0, N, OK_FILL, fmt="# ?/???")
    r = r + len(rows) + 2
    notes = ["・" + Ho["kotae"], "・" + Ho["iryu"]] + [f"・{t['h']}：{t['d']}" for t in Ho["tsumazuki"]] + [
        "・先に亡くなった子の分を孫が受ける形（代襲）や、先に亡くなった兄弟姉妹の子（おい・めい）がいる形は、ページの計算の道具で出せます。",
        "・金額は1円未満を切り捨てて表示します。入っている例：" + Ho["rei"]["note"] + "。"]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=4)
        ws.row_dimensions[r + k].height = 30
    r += len(notes)
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4132", "minpo900", "minpo1042"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/houtei-souzokubun", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-houtei-souzokubun.xlsx")


def make_houtei_pdf():
    Ho = DATA["houtei"]
    ck = Ho["checkedAt"].replace("-", "/")
    pt = "".join(f"<tr><td><b>{esc(p['h'])}</b></td><td>{esc(p['haigusha'])}</td><td>{esc(p['hoka'])}</td><td>{esc(p['iryu'])}</td></tr>" for p in Ho["pattern"])
    jn = "".join(f"<li><b>{esc(j['h'])}</b>：{esc(j['d'])}</li>" for j in Ho["junni"])
    tz = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in Ho["tsumazuki"])
    blank = "".join("<tr><td class='w'></td><td></td><td></td><td></td></tr>" for _ in range(6))
    body = f"""<h2>法定相続分と遺留分の早見表</h2>
<table><tr><th>相続人</th><th>配偶者</th><th>ほかの相続人</th><th>遺留分</th></tr>{pt}</table>
<p class="note">{esc(Ho['iryu'])}</p>
<h2>相続人の順位</h2><ul style="margin:1mm 0;padding-left:5mm">{jn}</ul>
<h2>うちの場合の書き込み欄</h2>
<p>遺産の額：<span class="line"></span>円</p>
<table><tr><th>相続人（続柄・名前）</th><th>法定相続分</th><th>金額</th><th>遺留分</th></tr>{blank}</table>
<div class="box"><b>間違えやすい所</b><ul style="margin:1mm 0 0;padding-left:5mm">{tz}</ul></div>
<p class="note">例：{esc(Ho['rei']['note'])}。</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4132', 'minpo900', 'minpo1042']))}（{ck} 確認）</p>"""
    doc = page("法定相続分の早見表と書き込み欄", "家族の形の行を見て、相続人ごとの割合と金額を書き込みます。", body)
    _pdf(doc, "souzoku-houtei-souzokubun.pdf", "/guide/souzoku/houtei-souzokubun", ck)


# ---------- 相続登記の必要書類チェックリスト（2026-11-12） ----------
CASE_LABEL = {"bunkatsu": "遺産分割", "houtei": "法定相続分", "yuigon": "遺言"}


def make_touki_xlsx():
    Tk = DATA["touki"]
    ck = Tk["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "相続登記の書類"
    widths(ws, [4, 36, 26, 10, 10, 10, 7])
    put(ws, 1, 1, "相続登記の必要書類チェックリスト", H, border=False)
    put(ws, 2, 1, "自分の分け方の列で ○ の書類をそろえ、そろったら「済」を選びます。下で期限と登録免許税も計算できます。", S, border=False)
    r = 4
    for i, t in enumerate(["", "書類", "取る所・作る人", "遺産分割", "法定相続分", "遺言", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, it in enumerate(Tk["items"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, it["h"] + ("\n" + it["d"] if it["d"] else ""), N)
        put(ws, rr, 3, it["saki"], N)
        for c, key in enumerate(["bunkatsu", "houtei", "yuigon"]):
            put(ws, rr, 4 + c, "○" if key in it["cases"] else "－", B)
        c = put(ws, rr, 7, None, B, IN_FILL)
        dv.add(c)
        ws.row_dimensions[rr].height = 42
    r = r + len(Tk["items"]) + 2
    put(ws, r, 2, "期限の計算", B, border=False)
    put(ws, r + 1, 2, "不動産を相続で取得したと知った日", N)
    d = put(ws, r + 1, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    put(ws, r + 2, 2, "登記の期限（目安・自動）", B)
    put(ws, r + 2, 3, f'=IF({d}="","",IF({d}<DATE(2024,4,1),DATE(2027,3,31),' + kigen_f(d, 36) + '))', B, OK_FILL, fmt="yyyy/m/d")
    r += 4
    put(ws, r, 2, "登録免許税の計算（固定資産の課税明細書の「価格」を円で）", B, border=False)
    cells = []
    for k, t in enumerate(["土地 1", "土地 2", "土地 3", "建物（合計）"]):
        put(ws, r + 1 + k, 2, t, N)
        cells.append(put(ws, r + 1 + k, 3, None, B, IN_FILL, fmt="#,##0").coordinate)
    lim = Tk["menzei"]
    land = "+".join(f"IF({c}>{lim},{c},0)" for c in cells[:3])
    tot = f"({land}+N({cells[3]}))"
    put(ws, r + 5, 2, "課税価格（自動）", B)
    kk = put(ws, r + 5, 3, f"=IF({tot}=0,0,MAX(1000,ROUNDDOWN({tot},-3)))", B, OK_FILL, fmt="#,##0").coordinate
    put(ws, r + 6, 2, "登録免許税（自動）", B)
    put(ws, r + 6, 3, f"=IF({kk}=0,0,MAX(1000,ROUNDDOWN({kk}*{Tk['zeiritsu']},-2)))", B, OK_FILL, fmt="#,##0")
    r += 8
    notes = ["・" + Tk["shoruiNote"], "・期限：" + Tk["kigen"] + "。" + Tk["kigenOldNote"] + "。" + Tk["karyo"] + "。",
             "・税率は1,000分の4（相続）。" + Tk["hasu"] + "。", "・" + Tk["menzeiNote"] + "（この表では100万円以下の土地を0円にしています）。",
             "・価格は" + Tk["kakaku"] + "。"]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=7)
        ws.row_dimensions[r + k].height = 30
    r += len(notes)
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["houmuToukiShorui", "mojTouki", "nta7191", "houmuToumenzei"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/touki-shorui", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-touki-shorui.xlsx")


def make_touki_pdf():
    Tk = DATA["touki"]
    ck = Tk["checkedAt"].replace("-", "/")
    rows = "".join(
        f"<tr><td>☐</td><td><b>{esc(it['h'])}</b>" + (f"<br><small>{esc(it['d'])}</small>" if it["d"] else "") + f"</td><td>{esc(it['saki'])}</td>"
        + "".join(f"<td style='text-align:center'>{'○' if k in it['cases'] else '－'}</td>" for k in ["bunkatsu", "houtei", "yuigon"]) + "</tr>"
        for it in Tk["items"])
    body = f"""<style>small{{color:#64748b;font-size:8pt}}</style>
<table><tr><th style="width:5mm"></th><th>書類</th><th style="width:38mm">取る所・作る人</th><th style="width:15mm">遺産分割</th><th style="width:15mm">法定相続分</th><th style="width:12mm">遺言</th></tr>{rows}</table>
<p class="note">{esc(Tk['shoruiNote'])}</p>
<div class="box"><b>期限</b>：{esc(Tk['kigen'])}（知った日 <span class="line" style="min-width:30mm"></span> → 期限 <span class="line" style="min-width:30mm"></span>）<br>{esc(Tk['kigenOldNote'])}。{esc(Tk['karyo'])}。</div>
<div class="box"><b>登録免許税</b>：課税価格 <span class="line" style="min-width:30mm"></span>円 × 1,000分の4 ＝ <span class="line" style="min-width:25mm"></span>円<br><small>{esc(Tk['hasu'])}。{esc(Tk['menzeiNote'])}。価格は{esc(Tk['kakaku'])}。</small></div>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['houmuToukiShorui', 'mojTouki', 'nta7191', 'houmuToumenzei']))}（{ck} 確認）</p>"""
    doc = page("相続登記の必要書類チェックリスト", "自分の分け方の列で ○ の書類をそろえ、☐に印を付けます。", body)
    _pdf(doc, "souzoku-touki-shorui.pdf", "/guide/souzoku/touki-shorui", ck)


# ---------- 準確定申告の必要書類チェックリスト（2026-11-12） ----------
def make_junkakutei_xlsx():
    Jk = DATA["junkakutei"]
    ck = Jk["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "準確定申告の書類"
    widths(ws, [4, 34, 44, 12, 7])
    put(ws, 1, 1, "準確定申告の必要書類チェックリスト", H, border=False)
    put(ws, 2, 1, "亡くなったことを知った日を入れると期限の目安が出ます。当てはまる行に「○」、そろったら「済」を選びます。", S, border=False)
    put(ws, 4, 2, "亡くなったことを知った日（例：2026/1/6）", B)
    d = put(ws, 4, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    put(ws, 5, 2, "申告と納税の期限（目安・自動）", B)
    put(ws, 5, 3, f'=IF({d}="","",' + kigen_f(d, Jk["kigenN"]) + ')', B, OK_FILL, fmt="yyyy/m/d")
    r = 7
    for i, t in enumerate(["", "書類", "メモ", "当てはまる", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    dv2 = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv)
    ws.add_data_validation(dv2)
    rr = r
    for k in Jk["kihon"]:
        rr += 1
        put(ws, rr, 1, rr - r)
        put(ws, rr, 2, k["h"], B)
        put(ws, rr, 3, k["d"], N)
        put(ws, rr, 4, "全員", B)
        dv.add(put(ws, rr, 5, None, B, IN_FILL))
        ws.row_dimensions[rr].height = 36
    for j in Jk["jokyo"]:
        for it in j["items"]:
            rr += 1
            put(ws, rr, 1, rr - r)
            put(ws, rr, 2, it["h"], B)
            put(ws, rr, 3, f"{j['h']}とき。{it['d']}", N)
            dv2.add(put(ws, rr, 4, None, B, IN_FILL))
            dv.add(put(ws, rr, 5, None, B, IN_FILL))
            ws.row_dimensions[rr].height = 36
    r = rr + 2
    notes = ["・" + Jk["kotae"], "・" + Jk["fukusu"], "・" + Jk["gensen"], "・" + Jk["sakusei"],
             "・書くときに手元に置くもの（例）：" + "・".join(Jk["tegoto"]),
             "・期限は知った日の翌日から数えた目安です（月末に知ったら4か月後の月末）。土日・祝日なら翌日になることがあります。"]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=5)
        ws.row_dimensions[r + k].height = 30
    r += len(notes)
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta2022", "ntaTenpu", "ntaJunkakuEtax", "ntaGensenFuyo"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/junkakutei-checklist", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-junkakutei-shorui.xlsx")


def make_junkakutei_pdf():
    Jk = DATA["junkakutei"]
    ck = Jk["checkedAt"].replace("-", "/")
    kh = "".join(f"<tr><td>☐</td><td><b>{esc(k['h'])}</b><br><small>{esc(k['d'])}</small></td></tr>" for k in Jk["kihon"])
    jo = "".join(f"<tr><td>☐</td><td>{esc(j['h'])}</td><td>" + "<br>".join(f"<b>{esc(it['h'])}</b> <small>{esc(it['d'])}</small>" for it in j["items"]) + "</td></tr>" for j in Jk["jokyo"])
    body = f"""<style>small{{color:#64748b;font-size:8pt}} td:first-child{{width:6mm;text-align:center}}</style>
<p>亡くなったことを知った日：<span class="line"></span>　→　期限（4か月）：<span class="line"></span></p>
<h2>誰でも出す書類</h2><table>{kh}</table>
<h2>当てはまるときに足す書類</h2><table><tr><th></th><th style="width:60mm">当てはまるとき</th><th>足す書類</th></tr>{jo}</table>
<div class="box"><b>書くときに手元に置くもの（例）</b>：{esc('・'.join(Jk['tegoto']))}<br>{esc(Jk['gensen'])}{esc(Jk['sakusei'])}</div>
<p class="note">{esc(Jk['fukusu'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta2022', 'ntaTenpu', 'ntaJunkakuEtax', 'ntaGensenFuyo']))}（{ck} 確認）</p>"""
    doc = page("準確定申告の必要書類チェックリスト", "相続を知った日の翌日から4か月以内。そろえたら☐に印を付けます。", body)
    _pdf(doc, "souzoku-junkakutei-shorui.pdf", "/guide/souzoku/junkakutei-checklist", ck)


# ---------- 相続財産の調べ方チェックリスト（2026-11-13） ----------
def make_shirabe_xlsx():
    Z = DATA["shirabe"]
    ck = Z["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "相続財産の調べ方"
    widths(ws, [4, 12, 22, 30, 24, 30, 7, 10, 6])
    put(ws, 1, 1, "相続財産の調べ方チェックリスト", H, border=False)
    put(ws, 2, 1, "調べる行の「調べる」に ○ を選ぶと、手数料の合計が出ます。手数料の欄は、公式で金額が確かめられたものだけ入れてあります（ほかは分かったら書き込む）。済んだら「済」を選びます。", S, border=False)
    put(ws, 4, 2, "亡くなった日（あとから知ったときは、知った日）", B)
    ws.merge_cells(start_row=4, start_column=2, end_row=4, end_column=3)
    d = put(ws, 4, 4, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    for k, kg in enumerate(Z["kigen"]):
        put(ws, 5 + k, 2, f"{kg['h']}の期限（目安・自動）", B)
        ws.merge_cells(start_row=5 + k, start_column=2, end_row=5 + k, end_column=3)
        put(ws, 5 + k, 4, f'=IF({d}="","",' + kigen_f(d, kg["n"]) + ')', B, OK_FILL, fmt="yyyy/m/d")
        put(ws, 5 + k, 5, f"{kg['n']}か月以内。{kg['d']}", N, border=False)
    r = 8
    for i, t in enumerate(["", "財産", "窓口", "取る証明・分かること", "費用", "主に要るもの・注意", "調べる", "手数料（円）", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    dv2 = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv)
    ws.add_data_validation(dv2)
    rr = r
    for it in Z["items"]:
        for j, row in enumerate(it["rows"]):
            rr += 1
            put(ws, rr, 1, rr - r)
            put(ws, rr, 2, it["h"] + ("\n手がかり：" + it["tegakari"] if j == 0 else ""), B if j == 0 else N)
            put(ws, rr, 3, row["saki"], N)
            put(ws, rr, 4, row["shomei"], N)
            put(ws, rr, 5, row["hiyou"], N)
            put(ws, rr, 6, row["motsu"], N)
            dv2.add(put(ws, rr, 7, None, B, IN_FILL))
            put(ws, rr, 8, row["yen"] if row["yen"] else None, N, IN_FILL, fmt="#,##0")
            dv.add(put(ws, rr, 9, None, B, IN_FILL))
            ws.row_dimensions[rr].height = 58
    put(ws, rr + 1, 6, "「調べる」に ○ の行の手数料の合計（自動）", B)
    put(ws, rr + 1, 8, f'=SUMIF(G{r + 1}:G{rr},"○",H{r + 1}:H{rr})', B, OK_FILL, fmt="#,##0")
    r = rr + 3
    notes = ["・" + Z["kotae"], "・" + Z["shoyuNote"], "・" + Z["nayoseNote"], "・" + Z["hofuriNote"],
             "・ほふりは法定相続情報一覧図があれば6,050円です（手数料の欄を書き換える）。" + Z["hiyouNote"],
             "・期限は知った日の翌日から数えた目安です（月末に知ったら、その月数後の月末）。土日・祝日なら翌日になることがあります。"]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=9)
        ws.row_dimensions[r + k].height = 30
    r += len(notes)
    keys = list(dict.fromkeys(k for it in Z["items"] for row in it["rows"] for k in row["src"])) + ["courtHouki", "nta4205"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=9)
    ws.row_dimensions[r].height = 42
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/zaisan-shirabekata", S, border=False)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-zaisan-shirabekata.xlsx")


def make_shirabe_pdf():
    Z = DATA["shirabe"]
    ck = Z["checkedAt"].replace("-", "/")
    rows = ""
    for it in Z["items"]:
        for j, row in enumerate(it["rows"]):
            head = f"<td rowspan='{len(it['rows'])}'><b>{esc(it['h'])}</b><br><small>{esc(it['tegakari'])}</small></td>" if j == 0 else ""
            rows += (f"<tr><td>☐</td>{head}<td><b>{esc(row['saki'])}</b><br>{esc(row['shomei'])}</td>"
                     f"<td>{esc(row['hiyou'])}</td><td><small>{esc(row['motsu'])}</small></td></tr>")
    keys = list(dict.fromkeys(k for it in Z["items"] for row in it["rows"] for k in row["src"])) + ["courtHouki", "nta4205"]
    body = f"""<style>small{{color:#64748b;font-size:8pt}} td:first-child{{width:5mm;text-align:center}}</style>
<p>亡くなった日（あとから知ったときは、知った日）：<span class="line"></span><br>相続放棄の期限（3か月）：<span class="line"></span><br>相続税の申告の期限（10か月）：<span class="line"></span></p>
<table><tr><th></th><th style="width:26mm">財産</th><th>窓口と分かること</th><th style="width:38mm">費用</th><th style="width:46mm">主に要るもの・注意</th></tr>{rows}</table>
<div class="box">{esc(Z['shoyuNote'])}{esc(Z['nayoseNote'])}<br>{esc(Z['hofuriNote'])}</div>
<p class="note">{esc(Z['hiyouNote'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    doc = page("相続財産の調べ方チェックリスト", "手がかりのある財産の窓口に請求し、済んだら☐に印を付けます。", body)
    _pdf(doc, "souzoku-zaisan-shirabekata.pdf", "/guide/souzoku/zaisan-shirabekata", ck)


# ---------- 相続の戸籍の集め方チェックリスト（2026-11-13） ----------
def _koseki_need(when, p):
    if when == "all":
        return True
    if p == "ko":
        return when == "ko+shibouko"
    if p == "oya":
        return when in ("oyakyoudai+shibouko", "oya+shibouoya")
    return when not in ("ko+shibouko", "oya+shibouoya")


def make_koseki_xlsx():
    Kd = DATA["koseki"]
    ck = Kd["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "相続の戸籍"
    widths(ws, [4, 36, 9, 9, 9, 8, 8, 6])
    put(ws, 1, 1, "相続の戸籍の集め方チェックリスト", H, border=False)
    put(ws, 2, 1, "相続人の列で ○ の戸籍を集めます。取った通数を書くと手数料が出ます。そろったら「済」を選びます。", S, border=False)
    r = 4
    for i, t in enumerate(["", "戸籍", "子", "親・祖父母", "兄弟姉妹", "今の戸籍（通）", "除籍・改製原戸籍（通）", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    ws.row_dimensions[r].height = 30
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, it in enumerate(Kd["items"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, it["h"] + "\n" + it["d"], N)
        for c, pk in enumerate(["ko", "oya", "kyoudai"]):
            put(ws, rr, 3 + c, "○" if _koseki_need(it["when"], pk) else "－", B)
        put(ws, rr, 6, None, N, IN_FILL, fmt="0")
        put(ws, rr, 7, None, N, IN_FILL, fmt="0")
        dv.add(put(ws, rr, 8, None, B, IN_FILL))
        ws.row_dimensions[rr].height = 42
    last = r + len(Kd["items"])
    tk, tj = Kd["tesuryo"]["koseki"], Kd["tesuryo"]["joseki"]
    put(ws, last + 1, 2, f"手数料の合計（自動。今の戸籍{tk}円・除籍と改製原戸籍{tj}円で計算）", B)
    ws.merge_cells(start_row=last + 1, start_column=2, end_row=last + 1, end_column=5)
    put(ws, last + 1, 6, f"=SUM(F{r + 1}:F{last})*{tk}+SUM(G{r + 1}:G{last})*{tj}", B, OK_FILL, fmt="#,##0")
    ws.merge_cells(start_row=last + 1, start_column=6, end_row=last + 1, end_column=7)
    r = last + 3
    notes = ["・" + Kd["kotae"], "・広域交付で請求できるのは" + Kd["kouikiWho"] + "。" + "。".join(Kd["kouikiRules"]) + "。",
             "・" + Kd["tesuryo"]["note"] + "。", "・" + "。".join(Kd["ichiranzu"]) + "。", "・" + Kd["chuui"]]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=8)
        ws.row_dimensions[r + k].height = 44
    r += len(notes)
    keys = ["zenginSouzoku", "courtHouki", "houmuToukiShorui", "mojKouiki", "yokohamaKouiki", "yokohamaYuso", "houmuJouhou", "houmuJouhouTetsuzuki"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=8)
    ws.row_dimensions[r].height = 42
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/koseki-atsumekata", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-koseki-atsumekata.xlsx")


def make_koseki_pdf():
    Kd = DATA["koseki"]
    ck = Kd["checkedAt"].replace("-", "/")
    rows = "".join(
        f"<tr><td>☐</td><td><b>{esc(it['h'])}</b><br><small>{esc(it['d'])}</small></td>"
        + "".join(f"<td style='text-align:center'>{'○' if _koseki_need(it['when'], pk) else '－'}</td>" for pk in ["ko", "oya", "kyoudai"])
        + "<td></td></tr>" for it in Kd["items"])
    keys = ["zenginSouzoku", "courtHouki", "houmuToukiShorui", "mojKouiki", "yokohamaKouiki", "yokohamaYuso", "houmuJouhou", "houmuJouhouTetsuzuki"]
    tk, tj = Kd["tesuryo"]["koseki"], Kd["tesuryo"]["joseki"]
    body = f"""<style>small{{color:#64748b;font-size:8pt}}</style>
<table><tr><th style="width:5mm"></th><th>戸籍</th><th style="width:12mm">子</th><th style="width:16mm">親・祖父母</th><th style="width:16mm">兄弟姉妹</th><th style="width:22mm">通数</th></tr>{rows}</table>
<p class="note">{esc(Kd['chuui'])}</p>
<div class="box"><b>手数料</b>：今の戸籍 <span class="line" style="min-width:12mm"></span>通 × {tk}円 ＋ 除籍・改製原戸籍 <span class="line" style="min-width:12mm"></span>通 × {tj}円 ＝ <span class="line" style="min-width:25mm"></span>円<br><small>{esc(Kd['tesuryo']['note'])}。</small></div>
<div class="box"><b>広域交付</b>：{esc(Kd['kouikiWho'])}は、最寄りの市区町村の窓口で請求できる。<br><small>{esc('。'.join(Kd['kouikiRules']))}。</small></div>
<div class="box"><b>法定相続情報一覧図</b><br><small>{esc('。'.join(Kd['ichiranzu']))}。</small></div>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    doc = page("相続の戸籍の集め方チェックリスト", "相続人の列で ○ の戸籍を集め、☐に印を付けます。", body)
    _pdf(doc, "souzoku-koseki-atsumekata.pdf", "/guide/souzoku/koseki-atsumekata", ck)


# ---------- 相続税の申告を自分でする手順（2026-11-14） ----------
def make_jibun_xlsx():
    Jd = DATA["jibun"]
    ck = Jd["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "申告の手順"
    widths(ws, [4, 34, 44, 14, 7])
    put(ws, 1, 1, "相続税の申告を自分でする手順チェックリスト", H, border=False)
    put(ws, 2, 1, "亡くなったことを知った日を入れると、期限と手順ごとの目安の日付が出ます。済んだら「済」を選びます。", S, border=False)
    put(ws, 4, 2, "亡くなったことを知った日（例：2026/1/6）", B)
    d = put(ws, 4, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    put(ws, 5, 2, "申告と納税の期限（自動）", B)
    k5 = put(ws, 5, 3, f'=IF({d}="","",' + kigen_f(d, Jd["kigenN"]) + ')', B, OK_FILL, fmt="yyyy/m/d").coordinate
    put(ws, 6, 2, "土日・年末年始に当たるときの期限（自動。祝日は入っていない）", B)
    put(ws, 6, 3, f'=IF({k5}="","",WORKDAY(IF(AND(MONTH({k5})=12,DAY({k5})>=29),DATE(YEAR({k5})+1,1,4),IF(AND(MONTH({k5})=1,DAY({k5})<=3),DATE(YEAR({k5}),1,4),{k5}))-1,1))', B, OK_FILL, fmt="yyyy/m/d")
    r = 8
    for i, t in enumerate(["", "手順", "すること", "目安の日（自動）", "済"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for k, st in enumerate(Jd["steps"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, st["h"], B)
        put(ws, rr, 3, st["d"], N)
        put(ws, rr, 4, f'=IF({d}="","",' + kigen_f(d, st["ato"]) + ')', B, OK_FILL, fmt="yyyy/m/d")
        dv.add(put(ws, rr, 5, None, B, IN_FILL))
        ws.row_dimensions[rr].height = 44
    r = r + len(Jd["steps"]) + 1
    put(ws, r, 1, "・" + Jd["atoNote"], S, border=False)
    r += 2
    put(ws, r, 2, "作る申告書の表（当てはまる行に「○」を選ぶと、作る表に「作る」が出ます。上から順に作ります）", B, border=False)
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
    r += 1
    for i, t in enumerate(["順", "表", "作るとき", "当てはまる", "作る"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv2 = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv2)
    when = {k["key"]: k["h"] for k in Jd["jokyo"]}
    for k, h in enumerate(Jd["hyo"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, h["no"] + "\n" + h["h"], N)
        if h["when"] == "always":
            put(ws, rr, 3, "必ず作る", B)
            put(ws, rr, 4, "－", N)
            put(ws, rr, 5, "作る", B, OK_FILL)
        else:
            put(ws, rr, 3, when[h["when"]], N)
            c = put(ws, rr, 4, None, B, IN_FILL)
            dv2.add(c)
            put(ws, rr, 5, f'=IF({c.coordinate}="○","作る","－")', B, OK_FILL)
        ws.row_dimensions[rr].height = 36
    r = r + len(Jd["hyo"]) + 2
    notes = ["・" + Jd["kyujitsu"], "・" + Jd["hyoNote"], "・" + Jd["kasanNote"], "・" + Jd["yoshiki"],
             "・出し方：" + "。".join(t["h"] + "：" + t["d"] for t in Jd["dashikata"]) + "。",
             "・納め方：" + "。".join(t["h"] + "：" + t["d"] for t in Jd["nofu"]) + "。", "・" + Jd["madoguchi"]]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=5)
        ws.row_dimensions[r + k].height = 58
    r += len(notes)
    keys = ["nta4202", "nta4205r8", "ntaShikataKisai", "ntaShikataNofu", "ntaYoshikiR08", "nta4157", "etaxSouzokuSakusei", "etaxSouzokuFuka", "ntaSouzokuTetsuzuki"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
    ws.row_dimensions[r].height = 70
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/shinkoku-jibun", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-shinkoku-jibun.xlsx")


def make_jibun_pdf():
    Jd = DATA["jibun"]
    ck = Jd["checkedAt"].replace("-", "/")
    when = {k["key"]: k["h"] for k in Jd["jokyo"]}
    st = "".join(f"<tr><td>☐</td><td><b>{k + 1}. {esc(s_['h'])}</b><br><small>{esc(s_['d'])}</small></td><td></td></tr>" for k, s_ in enumerate(Jd["steps"]))
    hy = "".join(f"<tr><td>☐</td><td>{k + 1}</td><td><b>{esc(h['no'])}</b> <small>{esc(h['h'])}</small></td><td>{'必ず作る' if h['when'] == 'always' else esc(when[h['when']])}</td></tr>" for k, h in enumerate(Jd["hyo"]))
    da = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in Jd["dashikata"])
    no = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in Jd["nofu"])
    keys = ["nta4202", "nta4205r8", "ntaShikataKisai", "ntaShikataNofu", "ntaYoshikiR08", "nta4157", "etaxSouzokuSakusei", "etaxSouzokuFuka"]
    body = f"""<style>small{{color:#64748b;font-size:8pt}} ul{{margin:1mm 0 0;padding-left:5mm}} li{{font-size:9pt}}</style>
<div class="box"><b>期限</b>：{esc(Jd['kigen'])}（知った日 <span class="line" style="min-width:30mm"></span> → 期限 <span class="line" style="min-width:30mm"></span>）<br><small>{esc(Jd['kyujitsu'])}</small></div>
<h2>手順</h2>
<table><tr><th style="width:5mm"></th><th>すること</th><th style="width:30mm">目安の日</th></tr>{st}</table>
<p class="note">{esc(Jd['atoNote'])}</p>
<h2>作る申告書の表（上から順に）</h2>
<table><tr><th style="width:5mm"></th><th style="width:6mm">順</th><th>表</th><th style="width:58mm">作るとき</th></tr>{hy}</table>
<p class="note">{esc(Jd['hyoNote'])}{esc(Jd['kasanNote'])}</p>
<div class="box"><b>出し方</b><ul>{da}</ul></div>
<div class="box"><b>納め方</b><ul>{no}</ul></div>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    doc = page("相続税の申告を自分でする手順チェックリスト", "済んだ手順と、作り終えた表の☐に印を付けます。", body)
    _pdf(doc, "souzoku-shinkoku-jibun.pdf", "/guide/souzoku/shinkoku-jibun", ck)


# ---------- 相続人申告登記の必要書類（2026-11-14） ----------
def make_shinkokuTouki_xlsx():
    Td = DATA["shinkokuTouki"]
    ck = Td["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "相続人申告登記"
    widths(ws, [4, 46, 26, 7])
    put(ws, 1, 1, "相続人申告登記のチェックリスト", H, border=False)
    put(ws, 2, 1, "申し出る人の続柄の戸籍と、共通の書類をそろえます。そろったら「済」を選びます。日付を入れると期限が出ます。", S, border=False)
    r = 4
    dv = DataValidation(type="list", formula1='"済"', allow_blank=True)
    ws.add_data_validation(dv)
    for z in Td["zokugara"]:
        put(ws, r, 2, f"戸籍（申し出る人が{z['h']}）", B, HEAD_FILL)
        put(ws, r, 3, "取る所", B, HEAD_FILL)
        put(ws, r, 4, "済", B, HEAD_FILL)
        for k in z["koseki"]:
            r += 1
            put(ws, r, 2, k, N)
            put(ws, r, 3, "本籍地の市区町村", N)
            dv.add(put(ws, r, 4, None, B, IN_FILL))
            ws.row_dimensions[r].height = 30
        r += 2
    put(ws, r, 2, "共通の書類（当てはまるものだけ）", B, HEAD_FILL)
    put(ws, r, 3, "取る所・作る人", B, HEAD_FILL)
    put(ws, r, 4, "済", B, HEAD_FILL)
    for c in Td["common"]:
        r += 1
        put(ws, r, 2, c["h"] + "\n" + c["d"], N)
        put(ws, r, 3, c["saki"], N)
        dv.add(put(ws, r, 4, None, B, IN_FILL))
        ws.row_dimensions[r].height = 42
    r += 2
    put(ws, r, 2, "不動産を相続で取得したと知った日", N)
    d = put(ws, r, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    put(ws, r + 1, 2, "申し出の期限（目安・自動）", B)
    put(ws, r + 1, 3, f'=IF({d}="","",IF({d}<=DATE(2024,4,1),DATE(2027,3,31),' + kigen_f(d, 36) + '))', B, OK_FILL, fmt="yyyy/m/d")
    put(ws, r + 2, 2, "相続人申告登記をした後に、遺産分割がまとまった日", N)
    b = put(ws, r + 2, 3, None, B, IN_FILL, fmt="yyyy/m/d").coordinate
    put(ws, r + 3, 2, "相続登記の期限（目安・自動）", B)
    put(ws, r + 3, 3, f'=IF({b}="","",' + kigen_f(b, 36) + ')', B, OK_FILL, fmt="yyyy/m/d")
    r += 5
    notes = ["・" + Td["kosekiNote"] + Td["kawari"], "・" + Td["kigen"] + "。" + Td["kigenOldNote"] + "。",
             "・" + Td["bunkatsu"] + "。" + Td["karyo"] + "。", "・登録免許税はかかりません。" + Td["kiroku"],
             "・出し方：" + "。".join(t["h"] + "（" + t["d"] + "）" for t in Td["dashikata"]) + "。"]
    for k, t in enumerate(notes):
        put(ws, r + k, 1, t, N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=4)
        ws.row_dimensions[r + k].height = 44
    r += len(notes)
    keys = ["mojShinkoku", "mojShinkokuAnnai", "mojShinkokuKisai", "mojGimuQA", "mojTouki"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
    ws.row_dimensions[r].height = 42
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/souzokunin-shinkoku-touki", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    # 2枚目：申出書に書く項目の下書き
    w2 = wb.create_sheet("申出書の下書き")
    widths(w2, [24, 40, 40])
    put(w2, 1, 1, "申出書に書く項目の下書き", H, border=False)
    put(w2, 2, 1, "法務省の様式に書き写す前の下書きです。右の欄に書き込みます。", S, border=False)
    for i, t in enumerate(["項目", "書き方", "書く内容"], 1):
        put(w2, 4, i, t, B, HEAD_FILL)
    for k, it in enumerate(Td["kisai"]):
        put(w2, 5 + k, 1, it["h"], B)
        put(w2, 5 + k, 2, it["d"], N)
        put(w2, 5 + k, 3, None, N, IN_FILL)
        w2.row_dimensions[5 + k].height = 36
    put(w2, 6 + len(Td["kisai"]), 1, "出典：" + SRC["mojShinkokuKisai"]["name"] + f"（{ck} 確認）", S, border=False)
    wb.save(OUT / "souzoku-souzokunin-shinkoku-touki.xlsx")


def make_shinkokuTouki_pdf():
    Td = DATA["shinkokuTouki"]
    ck = Td["checkedAt"].replace("-", "/")
    zk = "".join(f"<tr><th style='width:34mm'>{esc(z['h'])}</th><td>" + "<br>".join("☐ " + esc(k) for k in z["koseki"]) + "</td></tr>" for z in Td["zokugara"])
    cm = "".join(f"<tr><td>☐</td><td><b>{esc(c['h'])}</b><br><small>{esc(c['d'])}</small></td><td>{esc(c['saki'])}</td></tr>" for c in Td["common"])
    ks = "".join(f"<tr><th style='width:34mm'>{esc(k['h'])}<br><small>{esc(k['d'])}</small></th><td></td></tr>" for k in Td["kisai"])
    keys = ["mojShinkoku", "mojShinkokuAnnai", "mojShinkokuKisai", "mojGimuQA", "mojTouki"]
    body = f"""<style>small{{color:#64748b;font-size:8pt;font-weight:normal}}</style>
<h2>申し出る人の続柄ごとの戸籍</h2><table>{zk}</table>
<p class="note">{esc(Td['kosekiNote'])}{esc(Td['kawari'])}</p>
<h2>共通の書類（当てはまるものだけ）</h2>
<table><tr><th style="width:5mm"></th><th>書類</th><th style="width:44mm">取る所・作る人</th></tr>{cm}</table>
<div class="box"><b>期限</b>：{esc(Td['kigen'])}（知った日 <span class="line" style="min-width:28mm"></span> → 期限 <span class="line" style="min-width:28mm"></span>）<br><small>{esc(Td['kigenOldNote'])}。{esc(Td['bunkatsu'])}。{esc(Td['karyo'])}。登録免許税はかかりません。</small></div>
<h2>申出書に書く項目の下書き</h2><table>{ks}</table>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    doc = page("相続人申告登記のチェックリスト", "そろえた書類の☐に印を付け、申出書に書く内容を下書きします。", body)
    _pdf(doc, "souzoku-souzokunin-shinkoku-touki.pdf", "/guide/souzoku/souzokunin-shinkoku-touki", ck)




# ---------- 生前贈与加算の計算表（2026-11-15） ----------
def make_seizen_xlsx():
    Se = DATA["seizen"]
    ck = Se["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "生前贈与加算"
    widths(ws, [16, 16, 30, 16])
    put(ws, 1, 1, "生前贈与加算（3年→7年）の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に、亡くなった日と、1人が亡くなった人から受けた暦年課税の贈与（日付と額）を入れると、足し戻す額が出ます。100万円の控除は受け取った人ごとなので、1人ずつ1枚で計算します。", S, border=False)
    put(ws, 4, 1, "亡くなった日", B, HEAD_FILL)
    put(ws, 4, 2, "2031-06-30", B, IN_FILL)
    from datetime import date
    ws.cell(row=4, column=2).value = date(2031, 6, 30)
    ws.cell(row=4, column=2).number_format = "yyyy/m/d"
    put(ws, 5, 1, "足す期間の始まり（自動）", B)
    put(ws, 5, 2, '=IF(B4="","",IF(B4<=DATE(2026,12,31),EDATE(B4,-36),IF(B4<=DATE(2030,12,31),DATE(2024,1,1),EDATE(B4,-84))))', B, OK_FILL, fmt="yyyy/m/d")
    put(ws, 6, 1, "3年以内の始まり（自動）", B)
    put(ws, 6, 2, '=IF(B4="","",EDATE(B4,-36))', B, OK_FILL, fmt="yyyy/m/d")
    put(ws, 7, 1, "100万円の控除（自動）", B)
    put(ws, 7, 2, '=IF(B4="","",IF(B4>=DATE(2027,1,2),"あり","なし"))', B, OK_FILL)
    r = 9
    for i, t in enumerate(["贈与の日", "贈与の額（円）", "区分（自動）", "払った贈与税（円）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    sample = [(date(2025, 7, 1), 3000000), (date(2027, 7, 1), 2000000), (date(2029, 7, 1), 2000000), (date(2030, 7, 1), 1000000)]
    a, b = r + 1, r + 12
    for k, rr in enumerate(range(a, b + 1)):
        dt, km = sample[k] if k < len(sample) else (None, None)
        put(ws, rr, 1, dt, N, IN_FILL, fmt="yyyy/m/d")
        put(ws, rr, 2, km, N, IN_FILL, fmt="#,##0")
        put(ws, rr, 3, f'=IF(OR(A{rr}="",B{rr}=""),"",IF(OR(A{rr}<$B$5,A{rr}>$B$4),"期間の外（足さない）",IF(A{rr}>=$B$6,"3年以内","3年より前")))', B, OK_FILL)
        put(ws, rr, 4, None, N, IN_FILL, fmt="#,##0")
    r = b + 2
    put(ws, r, 1, "3年以内の合計", B)
    put(ws, r, 2, f'=SUMIF(C{a}:C{b},"3年以内",B{a}:B{b})', B, OK_FILL, fmt="#,##0")
    put(ws, r + 1, 1, "3年より前の合計", B)
    put(ws, r + 1, 2, f'=SUMIF(C{a}:C{b},"3年より前",B{a}:B{b})', B, OK_FILL, fmt="#,##0")
    put(ws, r + 2, 1, "引く額（総額100万円まで）", B)
    put(ws, r + 2, 2, f'=IF($B$7="あり",MIN(B{r + 1},1000000),0)', B, OK_FILL, fmt="#,##0")
    put(ws, r + 3, 1, "足し戻す額", B)
    put(ws, r + 3, 2, f"=B{r}+B{r + 1}-B{r + 2}", B, OK_FILL, fmt="#,##0")
    put(ws, r + 4, 1, "足した贈与の贈与税（目安）", B)
    put(ws, r + 4, 2, f'=SUMIF(C{a}:C{b},"3年以内",D{a}:D{b})+SUMIF(C{a}:C{b},"3年より前",D{a}:D{b})', B, OK_FILL, fmt="#,##0")
    put(ws, r + 4, 3, "相続税から引ける額の目安。その年の贈与の一部だけ足すときは割合で計算", S, border=False)
    r += 6
    put(ws, r, 1, "きまり", B, border=False)
    for k, x in enumerate(Se["rules"], 1):
        put(ws, r + k, 1, f"・{x['h']}：{x['d']}", N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=4)
        ws.row_dimensions[r + k].height = 30
    r += len(Se["rules"]) + 1
    for t in [Se["hyaku"], Se["seisan"], "払った贈与税は、足した贈与にかかった分をその人の相続税から引けます（その年の一部だけ足すときは割合で計算）。", Se["kazoe"]]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 30
        r += 1
    put(ws, r, 1, "入っている例：" + Se["reiGifts"] + "。2031年6月30日に亡くなった場合は700万円。", S, border=False)
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4161", "nta4103"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/seizen-zouyo-kasan", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-seizen-zouyo-kasan.xlsx")


def make_seizen_pdf():
    Se = DATA["seizen"]
    ck = Se["checkedAt"].replace("-", "/")
    kk = "".join(f"<tr><td><b>{esc(k['h'])}</b></td><td>{esc(k['kikan'])}</td><td>{esc(k['hyaku'])}</td></tr>" for k in Se["kikan"])
    rl = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Se["rules"])
    blank = "".join("<tr><td class='w'></td><td></td><td>3年以内・3年より前・外</td><td></td></tr>" for _ in range(8))
    body = f"""<h2>亡くなった日ごとの加算の期間</h2>
<table><tr><th>亡くなった日</th><th>足す贈与の期間</th><th>100万円の控除</th></tr>{kk}</table>
<p class="note">{esc(Se['hyaku'])}。</p>
<h2>書き込み欄</h2>
<p>亡くなった日：<span class="line"></span>　足す期間の始まり：<span class="line"></span>　3年以内の始まり：<span class="line"></span></p>
<table><tr><th>贈与の日</th><th>贈与の額</th><th>区分</th><th>払った贈与税</th></tr>{blank}</table>
<p>3年以内の合計 <span class="line"></span>円 ＋ 3年より前の合計 <span class="line"></span>円 − 100万円まで <span class="line"></span>円 ＝ 足し戻す額 <span class="line"></span>円</p>
<div class="box"><b>きまり</b><ul style="margin:1mm 0 0;padding-left:5mm">{rl}</ul></div>
<p class="note">足した贈与にかかった贈与税（目安）：<span class="line"></span>円　100万円の控除は受け取った人ごとなので、1人ずつ書きます。</p>
<p class="note">{esc(Se['seisan'])}。{esc(Se['kazoe'])}。</p>
<p class="note">例：{esc(Se['reiGifts'])} → 2026年6月30日に亡くなったら300万円、2028年6月30日なら400万円、2031年6月30日なら700万円。</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4161', 'nta4103']))}（{ck} 確認）</p>"""
    doc = page("生前贈与加算（3年→7年）の確認表", "亡くなった日から足す期間を決め、贈与を1つずつ振り分けます。", body)
    _pdf(doc, "souzoku-seizen-zouyo-kasan.pdf", "/guide/souzoku/seizen-zouyo-kasan", ck)


# ---------- 小規模宅地等の特例のチェックリスト（2026-11-15） ----------
def make_shokibo_xlsx():
    Sh = DATA["shokibo"]
    ck = Sh["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "必要書類"
    widths(ws, [8, 46, 40])
    put(ws, 1, 1, "小規模宅地等の特例の必要書類チェックリスト", H, border=False)
    put(ws, 2, 1, "当てはまる形の「選ぶ」に ○ を付けると、その形で足す書類の行に「要る」と出ます（老人ホームは、受け継ぐ人の形と一緒に ○）。どの形でも出す書類は最初から「要る」です。", S, border=False)
    r = 4
    for i, t in enumerate(["選ぶ", "当てはまる形", "条件"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv)
    rowof = {}
    for j in Sh["jokyo"]:
        r += 1
        c = put(ws, r, 1, None, B, IN_FILL)
        dv.add(c)
        put(ws, r, 2, j["h"], N)
        put(ws, r, 3, j["yoken"], N)
        ws.row_dimensions[r].height = 42
        rowof[j["key"]] = r
    r += 2
    for i, t in enumerate(["要るか", "書類", "メモ"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    for k in Sh["kyotsu"]:
        r += 1
        put(ws, r, 1, "場合による" if k.get("baai") else "要る", B, OK_FILL)
        put(ws, r, 2, k["h"], N)
        put(ws, r, 3, k["d"] or "", N)
        ws.row_dimensions[r].height = 30
    for j in Sh["jokyo"]:
        for it in j["items"]:
            r += 1
            put(ws, r, 1, f'=IF(A{rowof[j["key"]]}="○","要る","")', B, OK_FILL)
            put(ws, r, 2, f"{it['h']}（{j['h']}）", N)
            put(ws, r, 3, it["d"] or "", N)
            ws.row_dimensions[r].height = 30
    r += 2
    put(ws, r, 1, "減る額の計算（1つの区分だけ使うとき）", B, border=False)
    r += 1
    for i, t in enumerate(["", "土地の使い方", "限度面積・割合"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv2 = DataValidation(type="list", formula1='"' + ",".join(k["h"] for k in Sh["kubun"]) + '"', allow_blank=False)
    ws.add_data_validation(dv2)
    kr = r + 1
    c = put(ws, kr, 2, Sh["kubun"][0]["h"], N, IN_FILL)
    dv2.add(c)
    names = ",".join(f'"{k["h"]}"' for k in Sh["kubun"])
    lim = ",".join(str(k["menseki"]) for k in Sh["kubun"])
    wari = ",".join(str(k["wari"]) for k in Sh["kubun"])
    put(ws, kr, 1, "区分", B)
    put(ws, kr + 1, 1, "限度面積", B)
    put(ws, kr + 1, 2, f'=INDEX({{{lim}}},MATCH(B{kr},{{{names}}},0))', B, OK_FILL, fmt='0"㎡"')
    put(ws, kr + 2, 1, "割合", B)
    put(ws, kr + 2, 2, f'=INDEX({{{wari}}},MATCH(B{kr},{{{names}}},0))/100', B, OK_FILL, fmt="0%")
    put(ws, kr + 3, 1, "面積（㎡）", B)
    put(ws, kr + 3, 2, Sh["rei"]["menseki"], B, IN_FILL)
    put(ws, kr + 4, 1, "評価額（円）", B)
    put(ws, kr + 4, 2, Sh["rei"]["kagaku"], B, IN_FILL, fmt="#,##0")
    put(ws, kr + 5, 1, "減る額", B)
    put(ws, kr + 5, 2, f'=IF(OR(B{kr + 3}<=0,B{kr + 4}<=0),0,ROUNDDOWN(B{kr + 4}*MIN(B{kr + 3},B{kr + 1})/B{kr + 3}*B{kr + 2},0))', B, OK_FILL, fmt="#,##0")
    put(ws, kr + 6, 1, "特例の後", B)
    put(ws, kr + 6, 2, f"=B{kr + 4}-B{kr + 5}", B, OK_FILL, fmt="#,##0")
    r = kr + 8
    for t in Sh["heiyou"] + [x["h"] + "：" + x["d"] for x in Sh["tsumazuki"]]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
        ws.row_dimensions[r].height = 30
        r += 1
    put(ws, r, 1, "入っている例：" + Sh["rei"]["note"], S, border=False)
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4124", "ntaShoruiIchiran", "nta4208qa"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/shokibo-takuchi-shorui", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-shokibo-takuchi-shorui.xlsx")


def make_shokibo_pdf():
    Sh = DATA["shokibo"]
    ck = Sh["checkedAt"].replace("-", "/")
    kb = "".join(f"<tr><td>{esc(k['h'])}</td><td>{k['menseki']}㎡</td><td>{k['wari']}%</td></tr>" for k in Sh["kubun"])
    ky = "".join(f"<tr><td>□</td><td><b>{esc(k['h'])}</b>{('<br><span class=note>' + esc(k['d']) + '</span>') if k['d'] else ''}</td></tr>" for k in Sh["kyotsu"])
    jk = ""
    for j in Sh["jokyo"]:
        its = "".join(f"<tr><td>□</td><td><b>{esc(it['h'])}</b>{('<br><span class=note>' + esc(it['d']) + '</span>') if it['d'] else ''}</td></tr>" for it in j["items"]) or "<tr><td></td><td>足す書類はなし</td></tr>"
        jk += f"<h3 style='font-size:10.5pt;margin:3mm 0 1mm'>{esc(j['h'])}</h3><p class='note'>条件：{esc(j['yoken'])}</p><table>{its}</table>"
    tz = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in Sh["tsumazuki"])
    body = f"""<h2>限度面積と減らす割合</h2>
<table><tr><th>土地の使い方</th><th>限度面積</th><th>割合</th></tr>{kb}</table>
<p class="note">{esc(Sh['rei']['note'])}。{esc(' ／ '.join(Sh['heiyou']))}。</p>
<h2>どの形でも出す書類</h2><table>{ky}</table>
<h2>形ごとに足す書類</h2>{jk}
<div class="box"><b>使えなくなる落とし穴</b><ul style="margin:1mm 0 0;padding-left:5mm">{tz}</ul></div>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4124', 'ntaShoruiIchiran', 'nta4208qa']))}（{ck} 確認）</p>"""
    doc = page("小規模宅地等の特例の必要書類チェックリスト", "当てはまる形の書類に印を付けながら集めます。", body)
    _pdf(doc, "souzoku-shokibo-takuchi-shorui.pdf", "/guide/souzoku/shokibo-takuchi-shorui", ck)


# ---------- 未成年者控除・障害者控除の計算表（2026-11-15） ----------
def make_miseinen_xlsx():
    Mi = DATA["miseinen"]
    ck = Mi["checkedAt"].replace("-", "/")
    from datetime import date
    wb = Workbook()
    ws = wb.active
    ws.title = "控除の計算"
    widths(ws, [16, 14, 14, 18, 14, 14, 16, 16])
    put(ws, 1, 1, "相続税の未成年者控除・障害者控除の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、満年齢・年数・控除の額と、本人で引き切れず扶養義務者から引く額が出ます。", S, border=False)
    put(ws, 4, 1, "亡くなった日", B, HEAD_FILL)
    put(ws, 4, 2, date(2026, 11, 14), B, IN_FILL, fmt="yyyy/m/d")
    r = 6
    hd = ["名前", "生年月日", "種類", "満年齢（自動）", "年数（自動）", "控除の額（自動）", "本人の相続税（控除の前・円）", "扶養義務者から引く額（自動）"]
    for i, t in enumerate(hd, 1):
        put(ws, r, i, t, B, HEAD_FILL)
    kinds = [x["h"] for x in Mi["shurui"]]
    dv = DataValidation(type="list", formula1='"' + ",".join(kinds) + '"', allow_blank=True)
    ws.add_data_validation(dv)
    sample = [("長男", date(2011, 2, 14), kinds[0], 200000), ("長女", date(2016, 11, 15), kinds[0], None), ("妻", date(1960, 1, 1), kinds[2], None)]
    made = "IF(C{r}=\"" + kinds[0] + "\",18,85)"
    per = "IF(C{r}=\"" + kinds[2] + "\",200000,100000)"
    for k in range(8):
        rr = r + 1 + k
        nm, bd, kd, zz = sample[k] if k < len(sample) else (None, None, None, None)
        put(ws, rr, 1, nm, N, IN_FILL)
        put(ws, rr, 2, bd, N, IN_FILL, fmt="yyyy/m/d")
        c = put(ws, rr, 3, kd, N, IN_FILL)
        dv.add(c)
        put(ws, rr, 4, f'=IF(OR(B{rr}="",$B$4=""),"",DATEDIF(B{rr},$B$4,"y"))', B, OK_FILL)
        m = made.format(r=rr)
        p = per.format(r=rr)
        put(ws, rr, 5, f'=IF(OR(D{rr}="",C{rr}=""),"",MAX(0,{m}-D{rr}))', B, OK_FILL)
        put(ws, rr, 6, f'=IF(E{rr}="","",E{rr}*{p})', B, OK_FILL, fmt="#,##0")
        put(ws, rr, 7, zz, N, IN_FILL, fmt="#,##0")
        put(ws, rr, 8, f'=IF(OR(F{rr}="",G{rr}=""),"",MAX(0,F{rr}-G{rr}))', B, OK_FILL, fmt="#,##0")
    r = r + 10
    for t in [Mi["kotae"], Mi["fuyou"] + "。", Mi["zenkai"] + "。", "満年齢は誕生日で1つ上がるものとして数えています。亡くなった日が誕生日の前日のときは、税務署か税理士に確かめてください。"] + [x["h"] + "：" + x["d"] for x in Mi["yoken"]]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=8)
        ws.row_dimensions[r].height = 30
        r += 1
    put(ws, r, 1, "例：" + Mi["rei"]["note"], S, border=False)
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4164", "nta4167"]) + f"（{ck} 確認）", S, border=False)
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/miseinen-shougaisha-kojo", S, border=False)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-miseinen-shougaisha-kojo.xlsx")


def make_miseinen_pdf():
    Mi = DATA["miseinen"]
    ck = Mi["checkedAt"].replace("-", "/")
    hy = "".join(f"<tr><td>{a}歳</td><td>{18 - a}年</td><td><b>{(18 - a) * 10}万円</b></td></tr>" for a in Mi["hayami"])
    sh = "".join(f"<tr><td>{esc(x['h'])}</td><td>{x['made']}歳になるまでの年数</td><td>1年 {x['per'] // 10000}万円</td></tr>" for x in Mi["shurui"])
    yk = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Mi["yoken"])
    blank = "".join("<tr><td class='w'></td><td></td><td></td><td></td><td></td><td></td></tr>" for _ in range(5))
    body = f"""<h2>控除の額の決まり</h2>
<table><tr><th>控除</th><th>年数</th><th>1年あたり</th></tr>{sh}</table>
<p class="note">年数に1年未満の端数があるときは切り上げて1年にします（＝18か85から満年齢を引いた数）。{esc(Mi['rei']['note'])}。</p>
<h2>未成年者控除の早見表</h2>
<table><tr><th>満年齢</th><th>18歳までの年数</th><th>控除の額</th></tr>{hy}</table>
<h2>書き込み欄</h2>
<table><tr><th>名前</th><th>満年齢</th><th>年数</th><th>控除の額</th><th>本人の相続税</th><th>扶養義務者から引く額</th></tr>{blank}</table>
<div class="box"><b>使える人</b><ul style="margin:1mm 0 0;padding-left:5mm">{yk}</ul><p class="note">{esc(Mi['fuyou'])}。{esc(Mi['zenkai'])}。</p></div>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4164', 'nta4167']))}（{ck} 確認）</p>"""
    doc = page("相続税の未成年者控除・障害者控除の確認表", "亡くなった日の満年齢から、年数と控除の額を書き込みます。", body)
    _pdf(doc, "souzoku-miseinen-shougaisha-kojo.pdf", "/guide/souzoku/miseinen-shougaisha-kojo", ck)


# ---------- 相次相続控除の計算表（2026-11-16） ----------
def make_souji_xlsx():
    Sj = DATA["souji"]
    ck = Sj["checkedAt"].replace("-", "/")
    from datetime import date
    wb = Workbook()
    ws = wb.active
    ws.title = "相次相続控除"
    widths(ws, [30, 18, 16, 16, 16, 18])
    put(ws, 1, 1, "相次相続控除の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、年数・割合と、相続人ごとの控除の額が出ます（例は国税庁 No.4168 の質疑応答の数字。きょうだいの行は仮の数字）。", S, border=False)
    rows = [
        ("前の相続の日", date(2022, 5, 1), "yyyy/m/d"),
        ("今回の相続の日", date(2026, 11, 1), "yyyy/m/d"),
        ("A 前の相続で、今回亡くなった人が課せられた相続税（円）", Sj["rei"]["A"], "#,##0"),
        ("B 前の相続で、今回亡くなった人が受け取った純資産（円）", Sj["rei"]["B"], "#,##0"),
        ("C 今回の相続で財産を受け取った全員の純資産の合計（円）", Sj["rei"]["C"], "#,##0"),
    ]
    for k, (h, v, f) in enumerate(rows):
        put(ws, 4 + k, 1, h, B, HEAD_FILL)
        put(ws, 4 + k, 2, v, B, IN_FILL, fmt=f)
        ws.row_dimensions[4 + k].height = 30
    put(ws, 10, 1, "E 年数（自動。1年未満は切り捨て）", B, HEAD_FILL)
    put(ws, 10, 2, '=IF(OR(B4="",B5=""),"",DATEDIF(B4,B5,"y"))', B, OK_FILL)
    put(ws, 11, 1, "C÷(B−A)（自動。1を超えたら1）", B, HEAD_FILL)
    put(ws, 11, 2, '=IF(OR(B6="",B7="",B8=""),"",IF(B7-B6<=0,1,MIN(1,B8/(B7-B6))))', B, OK_FILL, fmt="0.0%")
    put(ws, 12, 1, "(10−E)÷10（自動）", B, HEAD_FILL)
    put(ws, 12, 2, '=IF(B10="","",IF(B10>=10,0,(10-B10)/10))', B, OK_FILL, fmt="0%")
    r = 14
    for i, t in enumerate(["相続人", "D その人の純資産（円）", "D÷C（自動）", "控除の額（自動）", "その人の相続税（控除の前・円）", "控除のあとの相続税（自動）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    sample = [("あなた", Sj["rei"]["D"], 9500000), ("きょうだい", 90000000, None)]
    for k in range(6):
        rr = r + 1 + k
        nm, dd, zz = sample[k] if k < len(sample) else (None, None, None)
        put(ws, rr, 1, nm, N, IN_FILL)
        put(ws, rr, 2, dd, N, IN_FILL, fmt="#,##0")
        put(ws, rr, 3, f'=IF(OR(B{rr}="",$B$8="",$B$8=0),"",B{rr}/$B$8)', B, OK_FILL, fmt="0.0%")
        put(ws, rr, 4, f'=IF(OR(C{rr}="",$B$11="",$B$12="",$B$6=""),"",IF($B$6=0,0,ROUNDDOWN($B$6*$B$11*C{rr}*$B$12,0)))', B, OK_FILL, fmt="#,##0")
        put(ws, rr, 5, zz, N, IN_FILL, fmt="#,##0")
        put(ws, rr, 6, f'=IF(OR(D{rr}="",E{rr}=""),"",MAX(0,E{rr}-D{rr}))', B, OK_FILL, fmt="#,##0")
    r = r + 8
    for t in [Sj["kotae"]] + [x["h"] + "：" + x["d"] for x in Sj["yoken"]] + [x["h"] + "：" + x["d"] for x in Sj["tsumazuki"]] + [Sj["keisanNote"], "円未満は切り捨てて表示しています。"]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
        ws.row_dimensions[r].height = 30
        r += 1
    put(ws, r, 1, "例：" + Sj["rei"]["note"], S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
    ws.row_dimensions[r].height = 44
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4168", "nta4168qa", "ntaYoshikiR08"]) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r + 1, start_column=1, end_row=r + 1, end_column=6)
    ws.row_dimensions[r + 1].height = 44
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/souji-souzoku-kojo", S, border=False)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-souji-souzoku-kojo.xlsx")


def make_souji_pdf():
    Sj = DATA["souji"]
    ck = Sj["checkedAt"].replace("-", "/")
    kg = "".join(f"<tr><td><b>{esc(x['k'])}</b></td><td>{esc(x['h'])}<br><span class='note'>{esc(x['d'])}</span></td><td class='w'></td></tr>" for x in Sj["kigou"])
    hy = "".join(f"<td>{'1年未満' if e == 0 else str(e) + '年'}<br><b>{(10 - e) * 10}%</b></td>" for e in Sj["hayami"])
    yk = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Sj["yoken"])
    tz = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Sj["tsumazuki"])
    blank = "".join("<tr><td class='w'></td><td></td><td></td><td></td></tr>" for _ in range(4))
    body = f"""<h2>計算式</h2>
<p style="font-size:12pt;text-align:center;margin:1mm 0"><b>A × C÷(B−A) × D÷C × (10−E)÷10</b></p>
<p class="note">C÷(B−A) が1（100/100）を超えるときは1にします。Eは1年未満を切り捨てます。</p>
<table><tr><th>記号</th><th>中身</th><th>金額・年数を書く</th></tr>{kg}</table>
<h2>年数ごとの残る割合</h2>
<table><tr>{hy}</tr></table>
<h2>相続人ごとの書き込み欄</h2>
<table><tr><th>相続人</th><th>D その人の純資産</th><th>D÷C</th><th>控除の額</th></tr>{blank}</table>
<p class="note">例：{esc(Sj['rei']['note'])}。</p>
<div class="box"><b>使える人</b><ul style="margin:1mm 0 0;padding-left:5mm">{yk}</ul></div>
<h2>間違えやすい所</h2><ul style="margin:0;padding-left:5mm">{tz}</ul>
<p class="note">{esc(Sj['keisanNote'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4168', 'nta4168qa', 'ntaYoshikiR08']))}（{ck} 確認）</p>"""
    doc = page("相次相続控除の計算表", "前の相続の申告書を見ながら、AからEを書き込みます。", body)
    _pdf(doc, "souzoku-souji-souzoku-kojo.pdf", "/guide/souzoku/souji-souzoku-kojo", ck)


def make_niwari_xlsx():
    Nw = DATA["niwari"]
    Z = DATA["zei"]
    ck = Nw["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "2割加算"
    widths(ws, [30, 20, 18, 18, 18, 18])
    put(ws, 1, 1, "相続税の2割加算の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、相続税の総額と、受け取る人ごとの相続税額・2割加算の額が出ます（例は配偶者と兄、正味の遺産額1億円）。", S, border=False)
    ws.merge_cells("A2:F2")
    ws.row_dimensions[2].height = 30
    dv_h = DataValidation(type="list", formula1='"いる,いない"', allow_blank=False)
    dv_k = DataValidation(type="list", formula1='"子,親,兄弟姉妹,いない"', allow_blank=False)
    ws.add_data_validation(dv_h)
    ws.add_data_validation(dv_k)
    rows = [("正味の遺産額（円。債務・葬式費用・特例を引いた後）", Nw["rei"]["isan"], "#,##0"), ("配偶者", "いる", None), ("ほかの相続人（子・親・兄弟姉妹・いない）", "兄弟姉妹", None), ("ほかの相続人の人数", 1, None)]
    for k, (h, v, f) in enumerate(rows):
        put(ws, 4 + k, 1, h, B, HEAD_FILL)
        c = put(ws, 4 + k, 2, v, B, IN_FILL, fmt=f)
        if k == 1:
            dv_h.add(c)
        if k == 2:
            dv_k.add(c)
        ws.row_dimensions[4 + k].height = 30
    put(ws, 8, 1, "法定相続人の数（自動）", B, HEAD_FILL)
    put(ws, 8, 2, '=IF(B5="いる",1,0)+IF(B6="いない",0,B7)', B, OK_FILL)
    put(ws, 9, 1, "基礎控除（自動）", B, HEAD_FILL)
    put(ws, 9, 2, f"={Z['kiso']['base']}+{Z['kiso']['per']}*B8", B, OK_FILL, fmt="#,##0")
    put(ws, 10, 1, "課税遺産総額（自動。千円未満切り捨て）", B, HEAD_FILL)
    put(ws, 10, 2, "=MAX(0,ROUNDDOWN((B4-B9)/1000,0)*1000)", B, OK_FILL, fmt="#,##0")
    put(ws, 11, 1, "配偶者の法定相続分（自動）", B, HEAD_FILL)
    put(ws, 11, 2, '=IF(B5<>"いる",0,IF(B6="子",1/2,IF(B6="親",2/3,IF(B6="兄弟姉妹",3/4,1))))', B, OK_FILL, fmt="0.0%")
    put(ws, 12, 1, "配偶者の分の税額（自動）", B, HEAD_FILL)
    put(ws, 12, 2, "=IF(B11=0,0,ROUNDDOWN(B10*B11/1000,0)*1000*VLOOKUP(ROUNDDOWN(B10*B11/1000,0)*1000,$H$5:$J$12,2)-VLOOKUP(ROUNDDOWN(B10*B11/1000,0)*1000,$H$5:$J$12,3))", B, OK_FILL, fmt="#,##0")
    put(ws, 13, 1, "ほかの相続人1人の分の税額（自動）", B, HEAD_FILL)
    put(ws, 13, 2, '=IF(OR(B6="いない",B7<=0),0,ROUNDDOWN(B10*(1-B11)/B7/1000,0)*1000*VLOOKUP(ROUNDDOWN(B10*(1-B11)/B7/1000,0)*1000,$H$5:$J$12,2)-VLOOKUP(ROUNDDOWN(B10*(1-B11)/B7/1000,0)*1000,$H$5:$J$12,3))', B, OK_FILL, fmt="#,##0")
    put(ws, 14, 1, "相続税の総額（自動）", B, HEAD_FILL)
    put(ws, 14, 2, '=B12+IF(B6="いない",0,B13*B7)', B, OK_FILL, fmt="#,##0")
    # 速算表（下限で引く）
    put(ws, 4, 8, "速算表（下限）", B, HEAD_FILL)
    put(ws, 4, 9, "税率", B, HEAD_FILL)
    put(ws, 4, 10, "控除額", B, HEAD_FILL)
    lo = 0
    for k, x in enumerate(Z["hayami"]):
        put(ws, 5 + k, 8, lo, N, fmt="#,##0")
        put(ws, 5 + k, 9, x["rate"], N, fmt="0%")
        put(ws, 5 + k, 10, x["kojo"], N, fmt="#,##0")
        lo = (x["upto"] or 0) + 1
    ws.column_dimensions["H"].width = 14
    ws.column_dimensions["I"].width = 8
    ws.column_dimensions["J"].width = 14
    # 続柄の判定表
    put(ws, 15, 8, "続柄", B, HEAD_FILL)
    put(ws, 15, 9, "2割加算", B, HEAD_FILL)
    for k, x in enumerate(Nw["hantei"]):
        put(ws, 16 + k, 8, x["h"], N)
        put(ws, 16 + k, 9, "足す" if x["kasan"] else "足さない", N)
    ws.column_dimensions["H"].width = 30
    hl = 16 + len(Nw["hantei"]) - 1
    dv_z = DataValidation(type="list", formula1=f"=$H$16:$H${hl}", allow_blank=True)
    ws.add_data_validation(dv_z)
    r = 16
    for i, t in enumerate(["受け取る人", "続柄", "受け取る額（円）", "その人の相続税額（自動）", "2割加算（自動）", "加算の後（自動）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    sample = [("兄", "兄弟姉妹", Nw["rei"]["kyodaiShutoku"]), ("配偶者", "配偶者", Nw["rei"]["isan"] - Nw["rei"]["kyodaiShutoku"])]
    for k in range(6):
        rr = r + 1 + k
        nm, zk, am = sample[k] if k < len(sample) else (None, None, None)
        put(ws, rr, 1, nm, N, IN_FILL)
        dv_z.add(put(ws, rr, 2, zk, N, IN_FILL))
        put(ws, rr, 3, am, N, IN_FILL, fmt="#,##0")
        put(ws, rr, 4, f'=IF(OR(C{rr}="",$B$4<=0),"",ROUNDDOWN($B$14*MIN(C{rr},$B$4)/$B$4,0))', B, OK_FILL, fmt="#,##0")
        put(ws, rr, 5, f'=IF(D{rr}="","",IF(IFERROR(VLOOKUP(B{rr},$H$16:$I${hl},2,FALSE),"")="足す",ROUNDDOWN(D{rr}*0.2,0),0))', B, OK_FILL, fmt="#,##0")
        put(ws, rr, 6, f'=IF(D{rr}="","",D{rr}+E{rr})', B, OK_FILL, fmt="#,##0")
    r = r + 8
    notes = [Nw["kotae"], "計算の順：" + " ".join(Nw["junban"]), "配偶者は、このあと配偶者の税額の軽減を受けられます。"] + [x["h"] + "：" + x["d"] for x in Nw["tsumazuki"]] + [Nw["keisanNote"]]
    for t in notes:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
        ws.row_dimensions[r].height = 32
        r += 1
    put(ws, r, 1, "例：" + Nw["rei"]["note"], S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
    ws.row_dimensions[r].height = 30
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4157", "nta4157qa", "nta4152r8", "nta4155", "ntaAyamari1", "ntaAyamari3"]) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r + 1, start_column=1, end_row=r + 1, end_column=6)
    ws.row_dimensions[r + 1].height = 58
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/niwari-kasan", S, border=False)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-niwari-kasan.xlsx")


def make_niwari_pdf():
    Nw = DATA["niwari"]
    ck = Nw["checkedAt"].replace("-", "/")
    ht = "".join(f"<tr><td>{esc(x['h'])}</td><td><b>{'足す' if x['kasan'] else '足さない'}</b></td><td class='note'>{esc(x['d'])}</td></tr>" for x in Nw["hantei"])
    jb = " ".join(esc(t) for t in Nw["junban"])
    tz = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Nw["tsumazuki"])
    blank = "".join("<tr><td class='w'></td><td></td><td></td><td></td><td></td></tr>" for _ in range(4))
    body = f"""<h2>2割加算の対象か（続柄の早見表）</h2>
<table><tr><th>受け取る人</th><th style="width:20mm">2割加算</th><th>補足</th></tr>{ht}</table>
<h2>計算式と順番</h2>
<p style="font-size:11pt;text-align:center;margin:1mm 0"><b>加算額 ＝ {esc(Nw['shiki'])}</b></p>
<p class="note">{jb}</p>
<h2>受け取る人ごとの書き込み欄</h2>
<table><tr><th>受け取る人・続柄</th><th>受け取る額</th><th>その人の相続税額（総額×受け取る額÷遺産額）</th><th>2割加算</th><th>加算の後</th></tr>{blank}</table>
<p class="note">例：{esc(Nw['rei']['note'])}。</p>
<h2>間違えやすい所</h2><ul style="margin:0;padding-left:5mm">{tz}</ul>
<p class="note">{esc(Nw['keisanNote'])}</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4157', 'nta4157qa', 'nta4152r8', 'nta4155', 'ntaAyamari1', 'ntaAyamari3']))}（{ck} 確認）</p>"""
    doc = page("相続税の2割加算の計算表", "続柄で対象かを確かめ、相続税の総額から受け取る人ごとの税額と加算額を書き込みます。", body)
    _pdf(doc, "souzoku-niwari-kasan.pdf", "/guide/souzoku/niwari-kasan", ck)


def make_taishoku_xlsx():
    Tk = DATA["taishoku"]
    ck = Tk["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "非課税の計算"
    widths(ws, [24, 18, 18, 18, 18])
    put(ws, 1, 1, "死亡退職金の相続税の非課税の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、受け取った人ごとの非課税の額と相続税の対象になる額が出ます（例は国税庁 No.4117 の数字）。", S, border=False)
    put(ws, 4, 1, "① 法定相続人", B, HEAD_FILL)
    put(ws, 4, 2, "人数", B, HEAD_FILL)
    labels = [("配偶者（0か1）", 1), ("実の子（子がいなければ親か兄弟姉妹）", 2), ("養子", 0)]
    for k, (t, v) in enumerate(labels):
        put(ws, 5 + k, 1, t, N)
        put(ws, 5 + k, 2, v, B, IN_FILL)
    put(ws, 8, 1, "数える人数（自動。放棄した人も数える）", B)
    put(ws, 8, 2, "=B5+B6+MIN(B7,IF(B6>0,1,2))", B, OK_FILL)
    put(ws, 9, 1, "非課税の限度額（自動）", B)
    put(ws, 9, 2, f"={Tk['per']}*B8", B, OK_FILL, fmt="#,##0\"円\"")
    r = 11
    for i, t in enumerate(["② 受け取った人", "死亡退職金（円）", "相続人で、放棄していない（はい／いいえ）", "非課税（自動）", "相続税の対象（自動）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    dv = DataValidation(type="list", formula1='"はい,いいえ"', allow_blank=True)
    ws.add_data_validation(dv)
    a, b = r + 1, r + 6
    total = f'SUMIF($C${a}:$C${b},"はい",$B${a}:$B${b})'
    sample = {a: (Tk["rei"]["rows"][0][0], Tk["rei"]["rows"][0][1], "はい"), a + 1: (Tk["rei"]["rows"][1][0], Tk["rei"]["rows"][1][1], "はい"), a + 2: (Tk["rei"]["rows"][2][0], Tk["rei"]["rows"][2][1], "いいえ")}
    for rr in range(a, b + 1):
        nm, km, so = sample.get(rr, (None, None, "はい"))
        put(ws, rr, 1, nm, N, IN_FILL)
        put(ws, rr, 2, km, N, IN_FILL, fmt="#,##0")
        dv.add(put(ws, rr, 3, so, N, IN_FILL))
        put(ws, rr, 4, f'=IF(B{rr}="","",IF(C{rr}<>"はい",0,IF({total}>$B$9,ROUNDDOWN($B$9*B{rr}/{total},0),B{rr})))', B, OK_FILL, fmt="#,##0")
        put(ws, rr, 5, f'=IF(B{rr}="","",B{rr}-D{rr})', B, OK_FILL, fmt="#,##0")
    put(ws, b + 1, 1, "合計", B)
    put(ws, b + 1, 2, f"=SUM(B{a}:B{b})", B, OK_FILL, fmt="#,##0")
    put(ws, b + 1, 4, f"=SUM(D{a}:D{b})", B, OK_FILL, fmt="#,##0")
    put(ws, b + 1, 5, f"=SUM(E{a}:E{b})", B, OK_FILL, fmt="#,##0")
    r = b + 3
    put(ws, r, 1, "③ 会社から弔慰金も受け取ったとき", B, HEAD_FILL)
    dv2 = DataValidation(type="list", formula1='"はい,いいえ"', allow_blank=False)
    ws.add_data_validation(dv2)
    put(ws, r + 1, 1, "弔慰金（円）", N)
    put(ws, r + 1, 2, None, N, IN_FILL, fmt="#,##0")
    put(ws, r + 2, 1, "亡くなったときの月の普通給与（円）", N)
    put(ws, r + 2, 2, None, N, IN_FILL, fmt="#,##0")
    put(ws, r + 3, 1, "仕事中の死亡（業務上）か", N)
    dv2.add(put(ws, r + 3, 2, "いいえ", N, IN_FILL))
    put(ws, r + 4, 1, "弔慰金として非課税の上限（自動）", B)
    put(ws, r + 4, 2, f'=IF(B{r + 2}="","",B{r + 2}*IF(B{r + 3}="はい",{Tk["choui"][0]["months"]},{Tk["choui"][1]["months"]}))', B, OK_FILL, fmt="#,##0")
    put(ws, r + 5, 1, "退職金に足す額（自動。受け取った人の②に足す）", B)
    put(ws, r + 5, 2, f'=IF(OR(B{r + 1}="",B{r + 4}=""),"",MAX(0,B{r + 1}-B{r + 4}))', B, OK_FILL, fmt="#,##0")
    for k in range(6):
        ws.row_dimensions[r + k].height = 26
    r += 7
    put(ws, r, 1, "きまり", B, border=False)
    for k, x in enumerate(Tk["rules"] + Tk["tsumazuki"], 1):
        put(ws, r + k, 1, f"・{x['h']}：{x['d']}", N, border=False)
        ws.merge_cells(start_row=r + k, start_column=1, end_row=r + k, end_column=5)
        ws.row_dimensions[r + k].height = 30
    r += len(Tk["rules"]) + len(Tk["tsumazuki"]) + 1
    for t in [Tk["anbun"], Tk["chouiNote"], Tk["shinkoku"] + "。1円未満は切り捨てて表示します。"]:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
        ws.row_dimensions[r].height = 44
        r += 1
    put(ws, r, 1, "入っている例：" + Tk["rei"]["note"], S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
    ws.row_dimensions[r].height = 44
    put(ws, r + 1, 1, "出典：" + "／".join(SRC[k]["name"] for k in ["nta4117", "nta4120", "nta4108", "ntaShitsugiShibouTaishoku", "jiliShibouTaishoku"]) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r + 1, start_column=1, end_row=r + 1, end_column=5)
    ws.row_dimensions[r + 1].height = 58
    put(ws, r + 2, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/shibou-taishokukin-hikazei", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    wb.save(OUT / "souzoku-shibou-taishokukin-hikazei.xlsx")


def make_taishoku_pdf():
    Tk = DATA["taishoku"]
    ck = Tk["checkedAt"].replace("-", "/")
    rl = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Tk["rules"])
    tz = "".join(f"<li><b>{esc(x['h'])}</b>：{esc(x['d'])}</li>" for x in Tk["tsumazuki"])
    rei = "".join(f"<tr><td>{esc(n)}</td><td>{k:,}円</td><td>{h:,}円</td><td>{z:,}円</td></tr>" for n, k, h, z in Tk["rei"]["rows"])
    blank = "".join("<tr><td class='w'></td><td></td><td></td><td></td><td></td></tr>" for _ in range(5))
    ch = "".join(f"<tr><td>{esc(x['h'])}</td><td>{esc(x['d'])}</td></tr>" for x in Tk["choui"])
    body = f"""<h2>① 非課税の限度額</h2>
<p style="font-size:11pt;margin:1mm 0"><b>500万円 × 法定相続人の数（　　人）＝ 　　　　　　円</b></p>
<p class="note">相続を放棄した人も数えます。養子は、実子がいれば1人、いなければ2人まで。死亡保険金の非課税とは別の枠です。</p>
<h2>② 受け取った人ごとの書き込み欄</h2>
<table><tr><th>受け取った人</th><th>死亡退職金</th><th>相続人か</th><th>非課税（限度額×その人の額÷相続人の合計）</th><th>相続税の対象</th></tr>{blank}</table>
<h2>国税庁の例</h2>
<table><tr><th>受け取った人</th><th>死亡退職金</th><th>非課税</th><th>相続税の対象</th></tr>{rei}</table>
<p class="note">{esc(Tk['rei']['note'])}。</p>
<h2>③ 弔慰金の非課税の範囲</h2>
<table>{ch}</table>
<p class="note">{esc(Tk['chouiNote'])}</p>
<div class="box"><b>決まり</b><ul style="margin:1mm 0 0;padding-left:5mm">{rl}</ul></div>
<h2>間違えやすい所</h2><ul style="margin:0;padding-left:5mm">{tz}</ul>
<p class="note">{esc(Tk['shinkoku'])}。</p>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in ['nta4117', 'nta4120', 'nta4108', 'ntaShitsugiShibouTaishoku', 'jiliShibouTaishoku']))}（{ck} 確認）</p>"""
    doc = page("死亡退職金の非課税の計算表", "会社からの支払いの通知を見ながら、受け取った人ごとに書き込みます。", body)
    _pdf(doc, "souzoku-shibou-taishokukin-hikazei.pdf", "/guide/souzoku/shibou-taishokukin-hikazei", ck)


# ---------- 相続税の0円申告（2026-11-17） ----------
YASUMI_F = 'WORKDAY({k}-1,1,休み!$A$2:$A$200)'


def add_yasumi_sheet(wb):
    """期限の繰り下げに使う休みの日の表（12/29〜1/3 と、内閣府の表にある祝日）。WORKDAY の3つ目の引数に渡す。"""
    import datetime as _dt
    ws = wb.create_sheet("休み")
    days = set()
    for y in range(2019, 2032):
        for d in (29, 30, 31):
            days.add(_dt.date(y, 12, d))
        for d in (1, 2, 3):
            days.add(_dt.date(y, 1, d))
    for t in DATA["shukujitsu"]["days"]:
        days.add(_dt.date.fromisoformat(t))
    ws.cell(row=1, column=1, value="休みの日（12/29〜1/3 と祝日。" + DATA["shukujitsu"]["note"] + "）").font = B
    for i, d in enumerate(sorted(days)):
        c = ws.cell(row=2 + i, column=1, value=d)
        c.number_format = "yyyy/m/d"
    ws.column_dimensions["A"].width = 60
    ws.sheet_state = "hidden"


def make_zero_xlsx():
    Zd = DATA["zero"]
    Z = DATA["zei"]
    ck = Zd["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "0円申告"
    widths(ws, [4, 44, 40, 12])
    put(ws, 1, 1, "相続税の0円申告のチェックリスト", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、申告が要るかの判定と期限が出ます。当てはまる行に「○」を選ぶと、作る表と付ける書類に「要る」が出ます。", S, border=False)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 30
    dv = DataValidation(type="list", formula1='"○"', allow_blank=True)
    ws.add_data_validation(dv)
    rows = [("正味の遺産額（円。特例を使う前。借金・葬式費用は引く）", 80000000, "#,##0"), ("法定相続人の数（人）", 2, None), ("亡くなったことを知った日（例：2026/1/6）", None, "yyyy/m/d")]
    for k, (h, v, f) in enumerate(rows):
        put(ws, 4 + k, 2, h, B, HEAD_FILL)
        put(ws, 4 + k, 3, v, B, IN_FILL, fmt=f)
    opts = [("haigusha", "配偶者の税額の軽減を使う", "○"), ("takuchi", "小規模宅地等の特例を使う", None), ("saimu", "借金や葬式費用を差し引く", None), ("mibunkatsu", "期限までに分け方が決まりそうにない", None)]
    cell = {}
    for k, (key, h, v) in enumerate(opts):
        put(ws, 7 + k, 2, h, B, HEAD_FILL)
        c = put(ws, 7 + k, 3, v, B, IN_FILL)
        dv.add(c)
        cell[key] = c.coordinate
    put(ws, 12, 2, "基礎控除（自動）", B, HEAD_FILL)
    put(ws, 12, 3, f"={Z['kiso']['base']}+{Z['kiso']['per']}*C5", B, OK_FILL, fmt="#,##0")
    put(ws, 13, 2, "判定（自動）", B, HEAD_FILL)
    put(ws, 13, 3, f'=IF(C4="","",IF(C4<=C12,"申告は要らない",IF(OR({cell["haigusha"]}="○",{cell["takuchi"]}="○"),"0円申告が要る（特例は申告書に書いて出すのが条件）","申告して納める")))', B, OK_FILL)
    put(ws, 14, 2, "申告の期限（自動）", B, HEAD_FILL)
    put(ws, 14, 3, '=IF(C6="","",' + kigen_f("C6", Zd["kigenN"]) + ')', B, OK_FILL, fmt="yyyy/m/d")
    put(ws, 15, 2, "土日・祝日・年末年始に当たるときの期限（自動。祝日は2026・2027年の分）", B, HEAD_FILL)
    put(ws, 15, 3, '=IF(C14="","",' + YASUMI_F.format(k="C14") + ')', B, OK_FILL, fmt="yyyy/m/d")
    for r in range(4, 16):
        ws.row_dimensions[r].height = 30
    r = 17
    for i, t in enumerate(["順", "作る表", "作るとき", "要るか"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    label = {"always": "必ず", "takuchi": "小規模宅地等の特例", "haigusha": "配偶者の税額の軽減", "saimu": "借金・葬式費用", "mibunkatsu": "分け方が決まらない"}
    for k, x in enumerate(Zd["hyo"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, x["no"] + "\n" + x["h"], N)
        put(ws, rr, 3, label[x["when"]], N)
        put(ws, rr, 4, "要る" if x["when"] == "always" else f'=IF({cell[x["when"]]}="○","要る","－")', B, OK_FILL)
        ws.row_dimensions[rr].height = 32
    r = r + len(Zd["hyo"]) + 2
    for i, t in enumerate(["", "付ける書類", "メモ", "要るか"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    for k, x in enumerate(Zd["shorui"]):
        rr = r + 1 + k
        put(ws, rr, 1, k + 1)
        put(ws, rr, 2, x["h"], N)
        put(ws, rr, 3, x["d"], N)
        put(ws, rr, 4, "要る" if x["when"] == "always" else f'=IF({cell[x["when"]]}="○","要る","－")', B, OK_FILL)
        ws.row_dimensions[rr].height = 40
    r = r + len(Zd["shorui"]) + 2
    notes = [Zd["kotae"], Zd["hyoNote"]] + [t["h"] + "：" + t["d"] for t in Zd["tsumazuki"]] + ["特例を使った後に税額が本当に0円になるかは、この表では計算しません。"]
    for t in notes:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 44
        r += 1
    keys = ["nta4102r8", "nta4205r8", "nta4124", "nta4158r8", "ntaShoruiIchiran", "ntaShikataKisai", "ntaYohiShinkoku"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
    ws.row_dimensions[r].height = 70
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/zero-en-shinkoku", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    add_yasumi_sheet(wb)
    wb.save(OUT / "souzoku-zero-en-shinkoku.xlsx")


def make_zero_pdf():
    Zd = DATA["zero"]
    ck = Zd["checkedAt"].replace("-", "/")
    label = {"always": "必ず", "takuchi": "小規模宅地等の特例", "haigusha": "配偶者の税額の軽減", "saimu": "借金・葬式費用", "mibunkatsu": "分け方が決まらない"}
    ht = "".join(f"<tr><td>{esc(x['d'])}</td><td><b>{esc(x['h'])}</b></td></tr>" for x in Zd["hantei"])
    hy = "".join(f"<tr><td>☐</td><td>{k + 1}</td><td><b>{esc(x['no'])}</b> <small>{esc(x['h'])}</small></td><td>{esc(label[x['when']])}</td></tr>" for k, x in enumerate(Zd["hyo"]))
    sh = "".join(f"<tr><td>☐</td><td><b>{esc(x['h'])}</b><br><small>{esc(x['d'])}</small></td><td>{esc(label[x['when']])}</td></tr>" for x in Zd["shorui"])
    tz = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in Zd["tsumazuki"])
    keys = ["nta4102r8", "nta4205r8", "nta4124", "nta4158r8", "ntaShoruiIchiran", "ntaShikataKisai", "ntaYohiShinkoku"]
    body = f"""<style>small{{color:#64748b;font-size:8pt}}</style>
<div class="box"><b>判定</b>：特例を使う前の遺産 <span class="line" style="min-width:28mm"></span>円　基礎控除 3,000万円＋600万円×<span class="line" style="min-width:8mm"></span>人＝<span class="line" style="min-width:28mm"></span>円<br>
<b>期限</b>：知った日 <span class="line" style="min-width:28mm"></span> の翌日から10か月 → <span class="line" style="min-width:28mm"></span>（土日・祝日・年末年始なら翌日）</div>
<h2>申告が要るか</h2><table><tr><th>特例を使う前の遺産の額</th><th style="width:40mm">申告</th></tr>{ht}</table>
<h2>作る表（上から順に）</h2><table><tr><th style="width:5mm"></th><th style="width:6mm">順</th><th>表</th><th style="width:40mm">作るとき</th></tr>{hy}</table>
<p class="note">{esc(Zd['hyoNote'])}</p>
<h2>付ける書類</h2><table><tr><th style="width:5mm"></th><th>書類</th><th style="width:40mm">要るとき</th></tr>{sh}</table>
<h2>間違えやすい所</h2><ul style="margin:0;padding-left:5mm">{tz}</ul>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    doc = page("相続税の0円申告のチェックリスト", "特例で税額が0円でも、基礎控除を超えるなら申告が要ります。作り終えた表とそろえた書類の☐に印を付けます。", body)
    _pdf(doc, "souzoku-zero-en-shinkoku.pdf", "/guide/souzoku/zero-en-shinkoku", ck)


# ---------- 相続税の申告期限を過ぎたときの延滞税・無申告加算税（2026-11-17） ----------
def make_okure_xlsx():
    Od = DATA["okure"]
    ck = Od["checkedAt"].replace("-", "/")
    wb = Workbook()
    ws = wb.active
    ws.title = "延滞税と加算税"
    widths(ws, [44, 18, 14, 12, 12, 14])
    put(ws, 1, 1, "相続税の延滞税と無申告加算税の計算表", H, border=False)
    put(ws, 2, 1, "オレンジの欄に入れると、延滞税（年ごとの割合）と無申告加算税が出ます。例は「1,000万円を90日遅れて納めた（期限内に申告、令和3年）」。", S, border=False)
    ws.merge_cells("A2:F2")
    ws.row_dimensions[2].height = 30
    dv_k = DataValidation(type="list", formula1='"期限後,期限内"', allow_blank=False)
    dv_c = DataValidation(type="list", formula1='"通知の前,通知の後,指摘の後"', allow_blank=False)
    ws.add_data_validation(dv_k)
    ws.add_data_validation(dv_c)
    import datetime as _dt
    rei = Od["rei"]
    rows = [("亡くなったことを知った日", _dt.date.fromisoformat(rei["shitta"]), "yyyy/m/d"),
            ("申告して納める日", _dt.date.fromisoformat(rei["pay"]), "yyyy/m/d"),
            ("納める相続税（円）", rei["tax"], "#,##0"),
            ("申告は（期限後・期限内＝納めるのだけ遅れた）", "期限内", None),
            ("税務署の調査は（通知の前・通知の後・指摘の後）", "通知の前", None)]
    for k, (h, v, f) in enumerate(rows):
        put(ws, 4 + k, 1, h, B, HEAD_FILL)
        c = put(ws, 4 + k, 2, v, B, IN_FILL, fmt=f)
        if k == 3:
            dv_k.add(c)
        if k == 4:
            dv_c.add(c)
    calc = [("申告の期限（知った日の翌日から10か月）", "=" + kigen_f("B4", Od["kigenN"]), "yyyy/m/d"),
            ("休みに当たるときの期限（土日・祝日・年末年始。祝日は2026・2027年の分）", "=" + YASUMI_F.format(k="B10"), "yyyy/m/d"),
            ("納期限（期限後の申告は申告した日）", '=IF(B7="期限後",B5,B11)', "yyyy/m/d"),
            ("低い割合の最後の日（納期限の翌日から2か月）", "=" + kigen_f("B12", 2), "yyyy/m/d"),
            ("もとの税額（1万円未満切り捨て）", "=ROUNDDOWN(B6,-4)", "#,##0"),
            ("遅れた日数", "=MAX(0,B5-B11)", "0")]
    for k, (h, f, fm) in enumerate(calc):
        put(ws, 10 + k, 1, h, B, HEAD_FILL)
        put(ws, 10 + k, 2, f, B, OK_FILL, fmt=fm)
    for r in range(4, 16):
        ws.row_dimensions[r].height = 28
    r = 17
    for i, t in enumerate(["年", "2か月まで（年%）", "2か月の後（年%）", "2か月までの日数", "2か月の後の日数", "延滞税（1円未満切り捨て）"], 1):
        put(ws, r, i, t, B, HEAD_FILL)
    years = [(w["y"], w["lo"], w["hi"], False) for w in Od["wariai"]]
    last = Od["wariai"][-1]
    years.append((last["y"] + 1, last["lo"], last["hi"], True))
    for k, (y, lo, hi, kari) in enumerate(years):
        rr = r + 1 + k
        ys = f"MAX($B$11+1,DATE({y},1,1))"
        ye = f"MIN($B$5,DATE({y},12,31))"
        put(ws, rr, 1, f"{y}年" + ("（未公表。前の年の割合で仮に）" if kari else ""), N)
        put(ws, rr, 2, lo, B, IN_FILL if kari else None)
        put(ws, rr, 3, hi, B, IN_FILL if kari else None)
        put(ws, rr, 4, f"=MAX(0,MIN({ye},$B$13)-{ys}+1)", N, OK_FILL)
        put(ws, rr, 5, f"=MAX(0,{ye}-MAX({ys},$B$13+1)+1)", N, OK_FILL)
        put(ws, rr, 6, f"=ROUNDDOWN(ROUND($B$14*B{rr}*D{rr}/36500,6),0)+ROUNDDOWN(ROUND($B$14*C{rr}*E{rr}/36500,6),0)", N, OK_FILL, fmt="#,##0")
    end = r + len(years)
    r = end + 2
    put(ws, r, 1, "延滞税（100円未満切り捨て、1,000円未満は0）", B, HEAD_FILL)
    fy = Od["wariai"][0]["y"]
    put(ws, r, 2, f'=IF(YEAR($B$11)<{fy},"{fy}年より前は計算しません",IF(ROUNDDOWN(SUM(F{18}:F{end}),-2)<1000,0,ROUNDDOWN(SUM(F{18}:F{end}),-2)))', B, OK_FILL, fmt="#,##0")
    shin = "$B$11>=DATE(2024,1,1)"
    b = "$B$14"
    t2 = f"MIN({b},500000)*0.1+MAX(0,MIN({b},IF({shin},3000000,10^15))-500000)*0.15+IF({shin},MAX(0,{b}-3000000)*0.25,0)"
    t3 = f"MIN({b},500000)*0.15+MAX(0,MIN({b},IF({shin},3000000,10^15))-500000)*0.2+IF({shin},MAX(0,{b}-3000000)*0.3,0)"
    raw = f'IF(OR($B$7<>"期限後",$B$15=0),0,IF($B$8="通知の前",{b}*0.05,IF($B$8="通知の後",{t2},{t3})))'
    put(ws, r + 1, 1, "無申告加算税（100円未満切り捨て、5,000円未満は0）", B, HEAD_FILL)
    put(ws, r + 1, 2, f"=IF(ROUNDDOWN({raw},-2)<5000,0,ROUNDDOWN({raw},-2))", B, OK_FILL, fmt="#,##0")
    put(ws, r + 2, 1, "相続税に足して納める額", B, HEAD_FILL)
    put(ws, r + 2, 2, f"=IFERROR(B{r}+B{r + 1},\"\")", B, OK_FILL, fmt="#,##0")
    for k in range(3):
        ws.row_dimensions[r + k].height = 28
    r += 4
    notes = [Od["kotae"], "延滞税＝もとの税額×割合×日数÷365。" + Od["nissu"], Od["hasu"], Od["wariaiNote"], Od["kasanNote"], Od["menjo"]["h"] + "：" + Od["menjo"]["d"], DATA["shukujitsu"]["note"]] + [t["h"] + "：" + t["d"] for t in Od["tsumazuki"]] + ["期限後の申告は、申告した日に納める前提で計算します。重加算税は入れていません。"]
    for t in notes:
        put(ws, r, 1, "・" + t, N, border=False)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
        ws.row_dimensions[r].height = 44
        r += 1
    keys = ["nta9205", "ntaEntaiWariai", "ntaEntaiKeisan", "nta2024", "tsusokuHo", "nta4205r8", "ntaKasanSouzoku"]
    put(ws, r, 1, "出典：" + "／".join(SRC[k]["name"] for k in keys) + f"（{ck} 確認）", S, border=False)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
    ws.row_dimensions[r].height = 70
    put(ws, r + 1, 1, f"つぎの手ナビ　{SITE}/guide/souzoku/shinkoku-okure", S, border=False)
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    add_yasumi_sheet(wb)
    wb.save(OUT / "souzoku-shinkoku-okure.xlsx")


def make_okure_pdf():
    Od = DATA["okure"]
    ck = Od["checkedAt"].replace("-", "/")
    wr = "".join(f"<tr><td>{w['y']}年（令和{w['y'] - 2018}年）</td><td>年{w['lo']}%</td><td>年{w['hi']}%</td></tr>" for w in reversed(Od["wariai"]))
    ks = ""
    for k in Od["kasan"]:
        if len(k["rates"]) == 1:
            ks += f"<tr><td>{esc(k['h'])}</td><td colspan='3' style='text-align:center'><b>{k['rates'][0]['r']}%</b></td></tr>"
        else:
            ks += f"<tr><td>{esc(k['h'])}</td>" + "".join(f"<td><b>{x['r']}%</b></td>" for x in k["rates"]) + "</tr>"
    tz = "".join(f"<li><b>{esc(t['h'])}</b>：{esc(t['d'])}</li>" for t in Od["tsumazuki"])
    rei = Od["rei"]
    keys = ["nta9205", "ntaEntaiWariai", "ntaEntaiKeisan", "nta2024", "tsusokuHo", "nta4205r8", "ntaKasanSouzoku"]
    body = f"""<div class="box"><b>書き込み欄</b>：期限 <span class="line" style="min-width:26mm"></span>　納める日 <span class="line" style="min-width:26mm"></span>　遅れ <span class="line" style="min-width:12mm"></span>日　もとの税額（1万円未満切り捨て）<span class="line" style="min-width:26mm"></span>円</div>
<h2>延滞税の割合</h2><table><tr><th>年</th><th>納期限の翌日から2か月まで</th><th>2か月の後</th></tr>{wr}</table>
<p class="note">{esc(Od['wariaiNote'])}期限後の申告は、申告書を出した日が納期限です。</p>
<h2>計算の式</h2>
<p style="font-size:11pt;text-align:center;margin:1mm 0"><b>延滞税 ＝ もとの税額 × 割合 × 日数 ÷ 365</b></p>
<p class="note">{esc(Od['nissu'])}{esc(Od['hasu'])}</p>
<p class="note">例：{esc(rei['h'])}。期限 2021年3月15日。2.5%×61日＝{rei['lo']:,}円、8.8%×29日＝{rei['hi']:,}円、合計の100円未満を切り捨てて {rei['total']:,}円。</p>
<h2>無申告加算税の割合</h2><table><tr><th>申告した時</th><th>50万円まで</th><th>300万円まで</th><th>300万円超</th></tr>{ks}</table>
<p class="note">{esc(Od['kasanNote'])}</p>
<div class="box"><b>{esc(Od['menjo']['h'])}</b><br>{esc(Od['menjo']['d'])}</div>
<h2>損をしやすい所</h2><ul style="margin:0;padding-left:5mm">{tz}</ul>
<p class="note">出典：{esc('／'.join(SRC[k]['name'] for k in keys))}（{ck} 確認）</p>"""
    doc = page("相続税の延滞税と無申告加算税の計算表", "申告の期限を過ぎたときに足して納める額を、年ごとの割合で計算します。", body)
    _pdf(doc, "souzoku-shinkoku-okure.pdf", "/guide/souzoku/shinkoku-okure", ck)



if __name__ == "__main__":
    import sys
    if sys.argv[1:] == ["shinkoku"]:
        make_shinkoku_xlsx()
        make_shinkoku_pdf()
        sys.exit(0)
    if sys.argv[1:] == ["hikazei"]:
        make_hikazei_xlsx()
        make_hikazei_pdf()
        sys.exit(0)
    if sys.argv[1:] and sys.argv[1] in ("houtei", "touki", "junkakutei", "shirabe", "koseki", "jibun", "shinkokuTouki", "seizen", "shokibo", "miseinen", "souji", "niwari", "taishoku", "zero", "okure"):
        for name in sys.argv[1:]:
            globals()[f"make_{name}_xlsx"]()
            globals()[f"make_{name}_pdf"]()
        sys.exit(0)
    if sys.argv[1:] == ["tetsuzuki"]:
        make_tetsuzuki_xlsx()
        make_tetsuzuki_pdf()
        sys.exit(0)
    make_kyogisho_docx()
    make_setsumeizu_xlsx()
    make_mokuroku_xlsx()
    make_akiya_xlsx()
    make_tetsuzuki_xlsx()
    make_pdfs()
    make_tetsuzuki_pdf()
    for f in sorted(OUT.glob("souzoku-*")):
        print(f.name, f.stat().st_size)
