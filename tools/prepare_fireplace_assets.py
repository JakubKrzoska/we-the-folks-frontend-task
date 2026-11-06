"""Builds the fireplace backgrounds and product layers from the supplied assets.

Why this exists:
- bg.jpg (pre-cut) matches design/layout.png but its seams visibly don't line up.
- bg-big.jpg is one continuous photo, but its packs differ from the layout.
- Neither has the product as a separate layer, which the slide-in animation needs.

So the moss comes from bg-big.jpg and the packs come from the pre-cut files:
1. Slice bg-big.jpg into the three parts (they sit 8px apart at 2x, a 4 CSS px gap),
   with extra photo on the inner edges for the zoom to reveal.
2. Hide the baked-in packs by cloning real moss from elsewhere in the same photo.
3. Cut each pack out of its pre-cut file into a transparent PNG.

Run from the repository root:  python tools/prepare_fireplace_assets.py
Needs: pillow, numpy, opencv-python. Only the outputs ship in the ad.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

SOURCE = Path('../variant-b-fireplace/assets')
OUTPUT = Path('fireplace/assets')
JPEG_QUALITY = 82
PRODUCT_WEBP_QUALITY = 90

# Each creative's area in bg-big.jpg.
CREATIVES = {
    'left': (0, 0, 640, 1950),
    'top': (648, 0, 2712, 500),
    'right': (2720, 0, 3360, 1950),
}

# Extra pixels past the creative's edge: left, right, bottom. All parts zoom around the centre of
# the whole fireplace, which pulls their inner edges away from it, so at the intro's 1.08 scale
# the photo has to carry on behind the crop: 77px sideways and 36px down at 2x, rounded up.
BLEED = {'left': (0, 80, 0), 'top': (0, 0, 40), 'right': (80, 0, 0)}

# Outlines of the packs baked into bg-big.jpg, relative to the creative, slightly generous.
BAKED_PACKS = {
    'left': [(104, 618), (250, 568), (424, 548), (548, 1306), (232, 1378), (108, 760)],
    'right': [(80, 590), (340, 590), (340, 574), (488, 574), (488, 1146), (80, 1146)],
}

# Moss to clone over each baked pack: top-left corner in bg-big.jpg, same size as the hole.
# Chosen by searching the photo for even-toned areas matching the light around each hole.
CLONE_FROM = {'left': (1440, 560), 'right': (1632, 1344)}

# Pack outlines in the pre-cut files, which are the layout's size and position.
PACKS = {
    'left': [(114, 620), (413, 559), (530, 1286), (237, 1352)],
    'right': [(90, 622), (344, 622), (344, 610), (434, 610), (434, 1096), (90, 1096)],
}


def polygon_mask(size, points, supersample=4):
    """Anti-aliased polygon as a 0-255 array."""
    width, height = size
    canvas = Image.new('L', (width * supersample, height * supersample), 0)
    ImageDraw.Draw(canvas).polygon([(x * supersample, y * supersample) for x, y in points], fill=255)
    return canvas.resize(size, Image.LANCZOS)


def remove_baked_pack(slice_image, big, part):
    bleed_left = BLEED[part][0]
    points = [(x + bleed_left, y) for x, y in BAKED_PACKS[part]]
    xs, ys = zip(*points)
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)

    hole = np.asarray(polygon_mask(slice_image.size, points))[y0:y1, x0:x1]
    source_x, source_y = CLONE_FROM[part]
    source = big.crop((source_x, source_y, source_x + x1 - x0, source_y + y1 - y0))

    target = cv2.cvtColor(np.asarray(slice_image), cv2.COLOR_RGB2BGR)
    # Poisson blending keeps the source's texture but takes its light from the hole's edge.
    blended = cv2.seamlessClone(
        cv2.cvtColor(np.asarray(source), cv2.COLOR_RGB2BGR),
        target,
        (hole > 127).astype('uint8') * 255,
        ((x0 + x1) // 2, (y0 + y1) // 2),
        cv2.NORMAL_CLONE,
    )
    return Image.fromarray(cv2.cvtColor(blended, cv2.COLOR_BGR2RGB))


def main():
    big = Image.open(SOURCE / 'bg-big.jpg').convert('RGB')

    for part, (x0, y0, x1, y1) in CREATIVES.items():
        left, right, bottom = BLEED[part]
        moss = big.crop((x0 - left, y0, x1 + right, y1 + bottom))
        if part in BAKED_PACKS:
            moss = remove_baked_pack(moss, big, part)
        moss.save(OUTPUT / part / 'bg.jpg', quality=JPEG_QUALITY, optimize=True, progressive=True)

    for part, points in PACKS.items():
        pre_cut = Image.open(SOURCE / part / 'bg.jpg').convert('RGBA')
        pre_cut.putalpha(polygon_mask(pre_cut.size, points))
        bounds = pre_cut.getchannel('A').getbbox()
        pre_cut.crop(bounds).save(OUTPUT / part / 'product.webp', quality=PRODUCT_WEBP_QUALITY, method=6)
        print(part, 'product at', bounds[:2], 'size', (bounds[2] - bounds[0], bounds[3] - bounds[1]))


if __name__ == '__main__':
    main()
