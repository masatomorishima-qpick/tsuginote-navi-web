"""冬の暖房費の動画を作る（縦1080x1920・音声なし。声は TikTok の読み上げで付ける）。
使い方: python3 make_video.py <台本のjson> <出力のmp4>
"""
import json, subprocess, sys, tempfile, os
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
BG = (16, 24, 44)
FG = (245, 247, 250)
SUB = (170, 180, 200)
ACC = (255, 204, 0)
BLUE = (90, 170, 255)
RED = (255, 110, 100)
GREEN = (110, 220, 150)
COLORS = {"acc": ACC, "blue": BLUE, "red": RED, "green": GREEN, "sub": SUB, "fg": FG}
BLACK = "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
REG = "/usr/share/fonts/opentype/noto/NotoSansCJK-Medium.ttc"
_fc = {}
def font(size, bold=True):
    k = (size, bold)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(BLACK if bold else REG, size, index=0)
    return _fc[k]

# 画面の安全域（TikTok の文字・ボタンに隠れない所）
TOP, BOTTOM, LEFT, RIGHT = 430, 1500, 80, 960

def ease(t):
    t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3

def center_text(d, y, text, size, color, bold=True):
    f = font(size, bold)
    w = d.textlength(text, font=f)
    d.text(((W - w) / 2, y), text, font=f, fill=color)
    return y + size * 1.25

def fit_size(d, text, size, maxw, bold=True):
    while size > 30 and d.textlength(text, font=font(size, bold)) > maxw:
        size -= 4
    return size

def draw_lines(d, lines, y, p):
    for i, ln in enumerate(lines):
        a = ease((p - i * 0.12) / 0.4)
        if a <= 0:
            y += ln.get("size", 64) * 1.25 + ln.get("gap", 0); continue
        col = COLORS.get(ln.get("color", "fg"), FG)
        col = tuple(int(BG[j] + (col[j] - BG[j]) * a) for j in range(3))
        size = fit_size(d, ln["t"], ln.get("size", 64), RIGHT - LEFT, ln.get("bold", True))
        y = center_text(d, y + (1 - a) * 30, ln["t"], size, col, ln.get("bold", True)) - (1 - a) * 30 + ln.get("gap", 0)
    return y

def scene_frame(sc, p):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    y = TOP + sc.get("y", 0)
    if sc.get("lines"):
        y = draw_lines(d, sc["lines"], y, p)
    if sc.get("bars"):
        bars = sc["bars"]; mx = max(b["v"] for b in bars)
        y += 40
        bw = RIGHT - LEFT
        for i, b in enumerate(bars):
            g = ease((p - 0.15 - i * 0.12) / 0.5)
            col = COLORS.get(b.get("color", "blue"))
            d.text((LEFT, y), b["label"], font=font(46, False), fill=FG)
            y += 66
            ln = int(bw * 0.72 * (b["v"] / mx) * g)
            d.rounded_rectangle((LEFT, y, LEFT + max(ln, 6), y + 70), radius=14, fill=col)
            val = b["fmt"].format(b["v"] * g) if g < 1 else b["fmt"].format(b["v"])
            d.text((LEFT + max(ln, 6) + 20, y + 2), val, font=font(54), fill=col)
            y += 120
        if sc.get("after"):
            draw_lines(d, sc["after"], y + 20, p - 0.5)
    if sc.get("foot"):
        fy = BOTTOM - 40 * len(sc["foot"])
        for t in sc["foot"]:
            center_text(d, fy, t, 34, SUB, False); fy += 44
    return img

def render(spec, out):
    tmp = tempfile.mkdtemp()
    n = 0
    for sc in spec["scenes"]:
        frames = int(sc["sec"] * FPS)
        for k in range(frames):
            p = k / max(frames - 1, 1) * (sc["sec"] / 1.6)  # 動きは最初の1.6秒で終える
            scene_frame(sc, p).save(f"{tmp}/{n:05d}.png"); n += 1
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{tmp}/%05d.png",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", out], check=True)
    # 確認用の静止画（各場面の最後の絵）
    base = os.path.splitext(out)[0]
    for i, sc in enumerate(spec["scenes"]):
        scene_frame(sc, 9).save(f"{base}_場面{i+1}.png")
    print(out, n / FPS, "秒")

if __name__ == "__main__":
    render(json.load(open(sys.argv[1])), sys.argv[2])
