"""計算係の動画を組み立てる：Gemini の動き（縦の動画）の上半分に文字を重ねてつなぐ。
使い方: python3 compose.py <台本のjson> <出力のmp4>
台本の各場面: {"clip": 動画のパス, "start": 開始秒, "sec": 長さ, "lines": [{"t":..,"size":..,"color":..}]}
"""
import json, subprocess, sys, tempfile, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FG = (245, 247, 250); SUB = (170, 180, 200); ACC = (255, 204, 0); GREEN = (110, 220, 150); RED = (255, 110, 100); BLUE = (90, 170, 255)
COL = {"fg": FG, "sub": SUB, "acc": ACC, "green": GREEN, "red": RED, "blue": BLUE}
BLACK = "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
TOP = 300  # TikTok の上の表示を避ける

def overlay(lines, path):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    y = TOP
    for ln in lines:
        size = ln.get("size", 72)
        f = ImageFont.truetype(BLACK, size, index=0)
        while d.textlength(ln["t"], font=f) > W - 140 and size > 30:
            size -= 4; f = ImageFont.truetype(BLACK, size, index=0)
        w = d.textlength(ln["t"], font=f)
        x = (W - w) / 2
        d.text((x, y), ln["t"], font=f, fill=COL.get(ln.get("color", "fg")), stroke_width=max(3, size // 14), stroke_fill=(10, 16, 32))
        y += size * 1.3 + ln.get("gap", 0)
    img.save(path)

def main(spec_path, out):
    spec = json.load(open(spec_path)); tmp = tempfile.mkdtemp(); parts = []
    for i, sc in enumerate(spec["scenes"]):
        ov = f"{tmp}/ov{i}.png"; overlay(sc["lines"], ov)
        part = f"{tmp}/p{i}.mp4"
        if sc["clip"].endswith((".png", ".jpg", ".jpeg")):
            src = ["-loop", "1", "-t", str(sc["sec"]), "-i", sc["clip"]]
        else:
            src = ["-ss", str(sc.get("start", 0)), "-t", str(sc["sec"]), "-i", sc["clip"]]
        subprocess.run(["ffmpeg", "-v", "error", "-y", *src, "-i", ov,
            "-filter_complex", f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30,setsar=1[b];[b][1:v]overlay=0:0,format=yuv420p[v]",
            "-map", "[v]", "-map", "0:a?", "-c:a", "aac", "-b:a", "128k", "-c:v", "libx264", "-crf", "18", "-t", str(sc["sec"]), part], check=True)
        parts.append(part)
    lst = f"{tmp}/list.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
    base = os.path.splitext(out)[0]
    for i, sc in enumerate(spec["scenes"]):
        t = sum(s["sec"] for s in spec["scenes"][:i]) + sc["sec"] * 0.7
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", out, "-frames:v", "1", "-vf", "scale=360:-1", f"{base}_場面{i+1}.png"], check=True)
    print(out)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
