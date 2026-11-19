#!/usr/bin/env python3
"""One-time static social card: derive soft background from original Canva media thumbnail.
The project serves the resulting first-party 1200x630 JPEG, not the expiring Canva URL.
"""
import io
import os
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

target=Path("v2/assets/og-twoja-sprawa-votum-odszkodowania-2026.jpg")
if target.exists():
    raise SystemExit("OG image already exists: refusing to overwrite")
thumbnail_url=os.environ["CANVA_THUMBNAIL_URL"]
request=urllib.request.Request(thumbnail_url,headers={"User-Agent":"TwojaSprawa-asset-build/1.0"})
with urllib.request.urlopen(request,timeout=20) as response:
    data=response.read(2_000_000)
thumb=Image.open(io.BytesIO(data)).convert("RGB")
if thumb.width<180 or thumb.height<95:
    raise ValueError(f"Unexpected Canva image {thumb.size}")
im=thumb.resize((1200,630),Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
overlay=Image.new("RGBA",im.size,(0,0,0,0))
draw=ImageDraw.Draw(overlay)
# Redraw lettering sharply over a dark panel so the original low-res title never
# appears as a duplicate. The house and trademark-neutral motifs remain visible.
draw.rectangle((70,195,1120,385),fill=(12,16,22,251))
draw.polygon([(162,394),(1045,394),(1007,510),(128,510)],fill=(174,4,19,255))
draw.arc((245,350,940,380),180,360,fill=(204,7,24,230),width=6)
font_file="/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf"
if not Path(font_file).exists():
    font_file="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
for line,size,y in [("Twoja Sprawa",112,186),("Votum Odszkodowania",72,401)]:
    font=ImageFont.truetype(font_file,size)
    width=draw.textbbox((0,0),line,font=font)[2]
    draw.text(((1200-width)/2,y),line,font=font,fill=(253,253,252,255))
output=Image.alpha_composite(im.convert("RGBA"),overlay).convert("RGB")
target.parent.mkdir(parents=True,exist_ok=True)
output.save(target,"JPEG",quality=88,optimize=True,progressive=True)
with Image.open(target) as check:
    if check.size!=(1200,630):raise ValueError("Wrong OG dimensions")
if not 15000<=target.stat().st_size<=600000:raise ValueError("Unexpected OG file size")
print("OG_IMAGE_CREATED",target,target.stat().st_size,output.size)
