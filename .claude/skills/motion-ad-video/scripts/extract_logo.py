"""Cut a logo out of an image (screenshot, profile picture, flat PNG/JPG) onto transparency.

    python3 extract_logo.py <image> <out-dir> [--box x0,y0,x1,y1] [--name logo] [--scale 2]

- --box limits the search to a region (pixel coords in the source image). Use it when the
  logo sits inside a screenshot: look at the image, estimate a box around the logo with some
  margin, and the script tightens it to the logo's exact bounds.
- The background colour is taken from the border of the search region, so the logo can be
  dark-on-light or light-on-dark.
- Alpha comes from each pixel's distance to that background colour, which keeps
  anti-aliased edges smooth.

Writes <name>-white.png (for dark video backgrounds), <name>-black.png, and
<name>-color.png (original colours), plus <name>-check.png: the white version on a dark
grey plate so you can inspect the edges.
"""
import argparse
import os

import numpy as np
from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("out_dir")
    ap.add_argument("--box", help="x0,y0,x1,y1 search region in source pixels")
    ap.add_argument("--name", default="logo")
    ap.add_argument("--scale", type=float, default=2.0, help="upscale factor for the output")
    ap.add_argument("--pad", type=int, default=6)
    a = ap.parse_args()

    rgb = np.asarray(Image.open(a.image).convert("RGB")).astype(float)
    x0, y0, x1, y1 = (0, 0, rgb.shape[1], rgb.shape[0]) if not a.box else map(int, a.box.split(","))
    region = rgb[y0:y1, x0:x1]

    border = np.concatenate([region[0], region[-1], region[:, 0], region[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((region - bg) ** 2).sum(axis=2))
    # Pixels clearly different from the background belong to the logo, except shapes that
    # touch the edge of the search region (e.g. the screenshot around a round avatar).
    from scipy import ndimage

    mask = dist > 60
    labels, _ = ndimage.label(ndimage.binary_dilation(mask, iterations=2))
    band = 8  # anything within 8 px of the region's edge counts as touching it
    edge = np.unique(np.concatenate([labels[:band].ravel(), labels[-band:].ravel(), labels[:, :band].ravel(), labels[:, -band:].ravel()]))
    keep = mask & ~np.isin(labels, edge[edge > 0])
    if keep.any():
        dist = np.where(np.isin(labels, edge[edge > 0]), 0, dist)
        mask = keep
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise SystemExit("No logo found: the region looks uniform. Pass or adjust --box.")
    p = a.pad
    by0, by1 = max(ys.min() - p, 0), min(ys.max() + p + 1, region.shape[0])
    bx0, bx1 = max(xs.min() - p, 0), min(xs.max() + p + 1, region.shape[1])
    print(f"logo bounds in source: x {x0 + bx0}-{x0 + bx1}, y {y0 + by0}-{y0 + by1}; background rgb {bg.round().tolist()}")

    crop = region[by0:by1, bx0:bx1]
    d = dist[by0:by1, bx0:bx1]
    # Levels: <=15 is background noise, >= 85% of the max distance is solid logo.
    alpha = np.clip((d - 15) / max(1.0, d.max() * 0.85 - 15), 0, 1)

    os.makedirs(a.out_dir, exist_ok=True)
    size = (int(crop.shape[1] * a.scale), int(crop.shape[0] * a.scale))
    outs = {
        "white": np.full(crop.shape, 255.0),
        "black": np.zeros(crop.shape),
        # un-premultiply against the background so colours stay true at the edges
        "color": np.clip((crop - bg * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-3), 0, 255),
    }
    for k, col in outs.items():
        img = np.dstack([col, alpha * 255]).round().astype(np.uint8)
        im = Image.fromarray(img, "RGBA").resize(size, Image.LANCZOS)
        path = os.path.join(a.out_dir, f"{a.name}-{k}.png")
        im.save(path)
        print("wrote", path, im.size)
    white = Image.open(os.path.join(a.out_dir, f"{a.name}-white.png"))
    plate = Image.new("RGBA", white.size, (24, 24, 24, 255))
    plate.alpha_composite(white)
    plate.save(os.path.join(a.out_dir, f"{a.name}-check.png"))
    print(f"source logo is {crop.shape[1]} px wide; if it must appear larger than that on screen, ask for the original vector file.")


if __name__ == "__main__":
    main()
