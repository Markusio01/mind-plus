#!/usr/bin/env python3
"""Draws the MIND+ app icons (an open book with a plus) into icons/.

Run from anywhere:  python3 tools/make_icons.py     (needs Pillow)
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons")
SS = 4                                     # supersample, then downscale for smooth edges
GOLD, ORANGE, INK = (248, 207, 82), (255, 147, 64), (22, 16, 6, 255)


def gradient(size):
    n = 64
    im = Image.new("RGB", (n, n))
    px = im.load()
    for y in range(n):
        for x in range(n):
            t = (x + y) / (2 * (n - 1))
            px[x, y] = tuple(round(GOLD[i] + (ORANGE[i] - GOLD[i]) * t) for i in range(3))
    return im.resize((size, size), Image.BICUBIC)


def icon(size, rounded, scale):
    """rounded: transparent rounded corners (desktop/Android). scale: mark size about the centre."""
    w = size * SS
    tile = gradient(w).convert("RGBA")
    if rounded:
        mask = Image.new("L", (w, w), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, w - 1], radius=int(w * 0.225), fill=255)
        tile.putalpha(mask)
    d = ImageDraw.Draw(tile)

    def p(x, y):                           # 512-unit design grid -> pixels
        return ((256 + (x - 256) * scale) * w / 512, (256 + (y - 256) * scale) * w / 512)

    d.polygon([p(112, 226), p(244, 266), p(244, 414), p(112, 374)], fill=INK)   # left page
    d.polygon([p(400, 226), p(268, 266), p(268, 414), p(400, 374)], fill=INK)   # right page
    r = 14 * scale * w / 512
    d.rounded_rectangle([*p(242, 88), *p(270, 196)], radius=r, fill=INK)        # plus, vertical
    d.rounded_rectangle([*p(202, 128), *p(310, 156)], radius=r, fill=INK)       # plus, horizontal
    return tile.resize((size, size), Image.LANCZOS)


os.makedirs(OUT, exist_ok=True)
icon(180, False, 0.9).convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"))   # iOS masks the corners itself
icon(192, True, 0.9).save(os.path.join(OUT, "icon-192.png"))
icon(512, True, 0.9).save(os.path.join(OUT, "icon-512.png"))
icon(512, False, 0.72).convert("RGB").save(os.path.join(OUT, "icon-maskable-512.png"))
print("icons written to", OUT)
