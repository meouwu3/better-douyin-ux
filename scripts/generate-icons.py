#!/usr/bin/env python3
"""Rasterize the extension icon to the PNG sizes Chrome expects."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "icon"
SIZES = (16, 32, 48, 96, 128)

BG = (18, 20, 28, 255)
LIME = (214, 255, 63, 255)
CREAM = (244, 240, 230, 255)


def star(cx: float, cy: float, outer: float, inner: float, n: int = 4) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for i in range(n * 2):
        r = outer if i % 2 == 0 else inner
        a = -math.pi / 2 + i * math.pi / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def render(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = max(2, round(size * 0.22))
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=BG)

    sx = size * 0.22
    sy = size * 0.22
    draw.polygon(star(sx, sy, size * 0.11, size * 0.04), fill=LIME)

    left = size * 0.40
    top = size * 0.28
    right = size * 0.84
    bottom = size * 0.72
    mid_y = size * 0.50
    draw.polygon(
        [
            (left, top),
            (right, mid_y),
            (left, bottom),
        ],
        fill=CREAM,
    )
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        render(size).save(OUT_DIR / f"{size}.png", optimize=True)
        print(f"wrote {OUT_DIR / f'{size}.png'}")


if __name__ == "__main__":
    main()
