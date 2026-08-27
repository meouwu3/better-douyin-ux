#!/usr/bin/env python3
"""Resize the Douyin web PWA mark to the PNG sizes Chrome expects."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "icon-source.png"
OUT_DIR = ROOT / "public" / "icon"
SIZES = (16, 32, 48, 96, 128)


def main() -> None:
    source = Image.open(SRC).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        resized = source.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(OUT_DIR / f"{size}.png", optimize=True)
        print(f"wrote {OUT_DIR / f'{size}.png'}")


if __name__ == "__main__":
    main()
