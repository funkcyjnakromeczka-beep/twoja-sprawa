#!/usr/bin/env python3
"""Generate compact, first-party WebP renditions of the approved hero banner.

The original JPEG is unchanged because it is the approved Facebook OG image.
Run only when the original SHA-256 matches the owner's approved artwork.
"""
from pathlib import Path
from hashlib import sha256
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "v2/assets/og-twoja-sprawa-metallic-v1.jpg"
APPROVED_SHA256 = "489f8b499f49f841c6dec3f5777a791f4007ad9d5e8c109ceeed6cc83187798c"
DIMENSIONS = (1536, 803)
WIDTHS = (640, 960, 1536)

raw = SOURCE.read_bytes()
actual_sha256 = sha256(raw).hexdigest()
if actual_sha256 != APPROVED_SHA256:
    raise ValueError("Approved Facebook banner changed: refusing to derive unverified hero artwork")
with Image.open(SOURCE) as image:
    image.load()
    if image.format != "JPEG" or image.size != DIMENSIONS:
        raise ValueError("Hero source dimensions or format changed unexpectedly")
    rgb = image.convert("RGB")
    for width in WIDTHS:
        height = round(DIMENSIONS[1] * width / DIMENSIONS[0])
        variant = rgb if width == DIMENSIONS[0] else rgb.resize((width, height), Image.Resampling.LANCZOS)
        output = SOURCE.with_name(f"hero-twoja-sprawa-{width}.webp")
        variant.save(output, format="WEBP", quality=87, method=6, exact=True)
        with Image.open(output) as verified:
            verified.load()
            if verified.format != "WEBP" or verified.size != (width, height):
                raise ValueError(f"Malformed optimized hero asset: {output}")
        if not (5_000 < output.stat().st_size < len(raw)):
            raise ValueError(f"Optimized hero must be smaller than original: {output}")
        print(f"HERO_WEBP_OK {output.name} {width}x{height} {output.stat().st_size} bytes; original {len(raw)} bytes")
