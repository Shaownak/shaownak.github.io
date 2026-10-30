#!/usr/bin/env python3
"""
Rebuild every served image from the originals in _src/.

    python tools/build-images.py

Reads _src/images/, writes img/ plus og.jpg and apple-touch-icon.png at the
repo root. Safe to re-run; it overwrites in place. Requires Pillow >= 11.3
(AVIF encoding is built in from that version).

Nothing here is called at page-load time. The site stays a static, dependency-
free set of files; this only regenerates the derivatives when a source photo
changes or a new figure is added.
"""

from PIL import Image, ImageDraw, ImageFilter, ImageOps
import io
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_src", "images")
OUT = os.path.join(ROOT, "img")

# Widths actually needed by the layout: the largest figure renders at 563 CSS px,
# so 1160 covers it at 2x; 400 and 720 cover mobile and the paired press figures.
WIDTHS = (400, 720, 1160)

# source file -> (output stem, crop box or None)
# Crops remove defects in the originals, not content:
#   fig-01  a 4px black strip on the right edge, an artefact of video capture
#   fig-06  a MyGP advertisement banner below the newspaper caption
FIGURES = [
    ("rp6.jpg",                  "fig-01-raptorx-flight",   ("trim_right", 4)),
    ("rp5.jpg",                  "fig-02-raptorx-planview", None),
    ("IMG-20230601-WA0000.jpg",  "fig-03-mongol-tori-urc",  None),
    ("IMG-20230519-WA0004.jpg",  "fig-04-duburi-pool",      None),
    ("IMG-20230506-WA0009.jpg",  "fig-04b-duburi-bay",      None),
    ("portrait.jpg",             "portrait",                None),
    ("rp3.jpg",                  "fig-05-feni-daily-star",  None),
    ("rp1.jpg",                  "fig-06-feni-prothom-alo", ("crop_bottom_to", 1200)),
    ("IMG-20231001-WA0000.jpg",  "fig-07-robosub-podium",   None),
    ("Messenger_creation_CEA33DBB-20DA-4D46-BA5B-66A168D31E20.jpeg",
                                 "fig-08-workshop",         None),
]

OG_SOURCE = "fig-01-raptorx-flight"   # the strongest single frame
SIGNAL = (79, 70, 229)                # --sig
PAPER = (251, 251, 249)               # --bg
SIGNAL_HEX = "#4F46E5"                # the same two, for the SVG favicon
PAPER_HEX = "#FBFBF9"



def targets_for(width, ladder, cap=1600):
    """Widths to emit. Adds the source's own width when it is more than 15%
    larger than the biggest rung that fits — without this a 718px clipping tops
    out at the 400px rung and its text can never be read."""
    fits = [w for w in ladder if w <= width]
    native = min(width, cap)
    if not fits:
        return [native]
    if native > fits[-1] * 1.15:
        fits.append(native)
    return fits


def load(name, crop):
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, name))).convert("RGB")
    if crop:
        kind, n = crop
        if kind == "trim_right":
            im = im.crop((0, 0, im.width - n, im.height))
        elif kind == "crop_bottom_to":
            im = im.crop((0, 0, im.width, n))
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    return im


def derivatives(im, stem):
    made = 0
    for w in targets_for(im.width, WIDTHS):
        r = im if w == im.width else im.resize(
            (w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f"{OUT}/{stem}-{w}.jpg",  "JPEG", quality=80, optimize=True, progressive=True)
        r.save(f"{OUT}/{stem}-{w}.webp", "WEBP", quality=76, method=6)
        r.save(f"{OUT}/{stem}-{w}.avif", "AVIF", quality=52, speed=5)
        made += 3
    return made


def open_graph(im):
    tw, th = 1200, 630
    scale = max(tw / im.width, th / im.height)
    r = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = (r.width - tw) // 2
    top = int((r.height - th) * 0.42)      # bias upward; the aircraft sits high
    r.crop((left, top, left + tw, top + th)).save(
        os.path.join(ROOT, "og.jpg"), "JPEG", quality=84, optimize=True, progressive=True)


def touch_icon():
    """Matches the inline SVG favicon in index.html — keep the two in step."""
    ic = Image.new("RGB", (180, 180), SIGNAL)
    d = ImageDraw.Draw(ic)
    d.line([(90, 26), (90, 154)], fill=PAPER, width=14)
    d.line([(26, 90), (154, 90)], fill=PAPER, width=14)
    ic.save(os.path.join(ROOT, "apple-touch-icon.png"), "PNG", optimize=True)


def favicons():
    """favicon.svg + favicon.ico, drawn from the same mark as the touch icon.

    The page used to declare the favicon as an inline `data:` URI. Browsers
    accept that, but Google will not use a data URI for the favicon it shows
    beside a search result — it needs a URL it can crawl. So the mark is
    written out as real files: SVG for anything modern, ICO at 16/32/48 for
    everything else and for the search result. All three are generated here,
    so the mark is defined in exactly one place.
    """
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
        '<rect width="32" height="32" fill="%s"/>'
        '<path d="M16 5v22M5 16h22" stroke="%s" stroke-width="2.5"/>'
        '</svg>' % (SIGNAL_HEX, PAPER_HEX)
    )
    with io.open(os.path.join(ROOT, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg + "\n")

    # Drawn at 256 and downsampled: a 16px bar drawn directly lands off-centre.
    base = Image.new("RGB", (256, 256), SIGNAL)
    d = ImageDraw.Draw(base)
    d.line([(128, 40), (128, 216)], fill=PAPER, width=20)
    d.line([(40, 128), (216, 128)], fill=PAPER, width=20)
    base.save(
        os.path.join(ROOT, "favicon.ico"),
        "ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )



# ---------------------------------------------------------------------------
# Certificates. Displayed small in a grid and letterboxed with object-fit:
# contain, because a document must be shown whole — never cropped. Each links
# to a full-size JPEG for reading.
# ---------------------------------------------------------------------------
CERT_SRC = os.path.join(ROOT, "_src", "certificates")
CERT_OUT = os.path.join(OUT, "certs")
# 600 exists because two scans (the thesis and Duburi awards) are narrower
# than 800px; upscaling a document scan only makes it blurrier.
CERT_WIDTHS = (400, 600, 800)

CERTIFICATES = [
    ("thesis_certificate.jpg",              "best-thesis-award"),
    ("duburi_robosub.jpg",                  "robosub-2023-award"),
    ("Shaownak_Kibo_certificate.jpg",       "kibo-third-place"),
    ("Shaownak_Robosub_certificate.jpg",    "robosub-2023"),
    ("Shaownak_Urc_certificate.jpg",        "urc-2023"),
    ("Shaownak_IRC_certificate.jpg",        "irc-2023"),
    ("Shaownak_IMechE UAS_certificate.jpg", "imeche-uas-2024"),
    ("Shaownak_roboInst_certificate.jpg",   "bracu-instructor"),
    ("Shaownak_pabna_instructir_certificate.jpg", "pabna-instructor"),
    # Online course certificates. Listed as a compact index in section 05 rather
    # than as plates, so they cannot crowd the competition awards.
    ("course-deep-learning-specialization.jpg",  "course-deep-learning"),
    ("course-hackerrank-software-engineer.png",  "course-hackerrank-swe"),
    ("course-hackerrank-sql-advanced.png",       "course-hackerrank-sql"),
]


def build_certificates():
    os.makedirs(CERT_OUT, exist_ok=True)
    for name, stem in CERTIFICATES:
        im = ImageOps.exif_transpose(
            Image.open(os.path.join(CERT_SRC, name))).convert("RGB")
        full = im if im.width <= 1600 else im.resize(
            (1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        full.save(f"{CERT_OUT}/{stem}-full.jpg", "JPEG",
                  quality=82, optimize=True, progressive=True)
        for w in CERT_WIDTHS:
            if w > im.width:
                continue
            r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            r.save(f"{CERT_OUT}/{stem}-{w}.jpg",  "JPEG", quality=80, optimize=True, progressive=True)
            r.save(f"{CERT_OUT}/{stem}-{w}.webp", "WEBP", quality=76, method=6)
            r.save(f"{CERT_OUT}/{stem}-{w}.avif", "AVIF", quality=52, speed=5)
        print(f"  {stem:24s} {full.width}x{full.height}")



# ---------------------------------------------------------------------------
# Gallery images for the detail sheets. Rendered up to ~640 CSS px inside the
# sheet, so 1400 covers 2x. Screenshots and diagrams keep their full pixel
# detail because a reader will want to read the labels on them.
# ---------------------------------------------------------------------------
GALLERY_SRC = os.path.join(ROOT, "_src", "gallery")
GALLERY_OUT = os.path.join(OUT, "g")
GALLERY_WIDTHS = (400, 800, 1400)



# ---------------------------------------------------------------------------
# Redactions. The Banglalink monitoring screenshot is a real surveillance
# console: it shows identifiable employee faces and one employee's name and
# staff number. Those are other people's personal data and must not be
# published. Applied here rather than by editing the source once, so that a
# rebuild can never quietly restore them.
# Boxes are (left, top, right, bottom) in source pixels.
# ---------------------------------------------------------------------------
REDACT = {
    "banglalink-live": {
        "size": (1600, 893),
        "pixelate": [            # faces on camera feeds 3, 4, 5, 6 and 7
            (1268, 148, 1372, 252),
            (438, 393, 516, 470),
            (828, 408, 906, 486),
            (1183, 423, 1243, 497),
            (388, 638, 462, 706),
        ],
        "blur": [                # recognised-name overlays burned into the video
            (372, 210, 486, 242), (832, 210, 946, 242), (1232, 210, 1390, 242),
            (376, 421, 440, 449), (846, 421, 920, 449), (1284, 421, 1362, 449),
            (371, 632, 452, 662), (836, 632, 917, 662),
        ],
        "fill": [                # "Abul Hossain (S20141)" — name and staff number
            (0, 297, 200, 326),
        ],
    },
}


def redact(im, stem):
    spec = REDACT.get(stem)
    if not spec:
        return im
    if im.size != spec["size"]:
        raise SystemExit(
            f"{stem}: source is {im.size}, redaction boxes were measured against "
            f"{spec['size']}. Re-measure them before building.")
    im = im.copy()
    for box in spec.get("pixelate", []):
        region = im.crop(box)
        w, h = region.size
        small = region.resize((max(1, w // 12), max(1, h // 12)), Image.BILINEAR)
        im.paste(small.resize((w, h), Image.NEAREST), box)
    for box in spec.get("blur", []):
        im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(7)), box)
    for box in spec.get("fill", []):
        im.paste(im.crop((box[0], box[1], box[0] + 4, box[1] + 4))
                 .resize((box[2] - box[0], box[3] - box[1]), Image.NEAREST), box)
    return im


def build_gallery():
    os.makedirs(GALLERY_OUT, exist_ok=True)
    made = 0
    for name in sorted(os.listdir(GALLERY_SRC)):
        stem = os.path.splitext(name)[0]
        im = ImageOps.exif_transpose(
            Image.open(os.path.join(GALLERY_SRC, name))).convert("RGB")
        im = redact(im, stem)
        for w in targets_for(im.width, GALLERY_WIDTHS):
            r = im if w == im.width else im.resize(
                (w, round(im.height * w / im.width)), Image.LANCZOS)
            r.save(f"{GALLERY_OUT}/{stem}-{w}.jpg",  "JPEG", quality=80, optimize=True, progressive=True)
            r.save(f"{GALLERY_OUT}/{stem}-{w}.webp", "WEBP", quality=76, method=6)
            r.save(f"{GALLERY_OUT}/{stem}-{w}.avif", "AVIF", quality=52, speed=6)
            made += 3
        print(f"  {stem:28s} {im.width:>5}x{im.height}")
    return made



# ---------------------------------------------------------------------------
# Organisation logos. Square marks, rendered small (36px) beside position rows
# and platform codes — identification, not a logo wall.
# ---------------------------------------------------------------------------
LOGO_SRC = os.path.join(ROOT, "_src", "logos")
LOGO_OUT = os.path.join(OUT, "logos")


def build_logos():
    if not os.path.isdir(LOGO_SRC):
        return 0
    os.makedirs(LOGO_OUT, exist_ok=True)
    made = 0
    for name in sorted(os.listdir(LOGO_SRC)):
        stem = os.path.splitext(name)[0].lower()
        im = ImageOps.exif_transpose(
            Image.open(os.path.join(LOGO_SRC, name))).convert("RGB")
        for w in (80, 160):
            # Fit inside a square box without distorting: the RaptorX mark is
            # 16:9 and a forced square would stretch it.
            r = im.copy()
            r.thumbnail((w, w), Image.LANCZOS)
            r.save(f"{LOGO_OUT}/{stem}-{w}.jpg",  "JPEG", quality=86, optimize=True)
            r.save(f"{LOGO_OUT}/{stem}-{w}.webp", "WEBP", quality=84, method=6)
            made += 2
        print(f"  {stem:24s} {im.width}x{im.height}")
    return made


def main():
    if not os.path.isdir(SRC):
        sys.exit(f"missing source directory: {SRC}")
    os.makedirs(OUT, exist_ok=True)

    total = 0
    for name, stem, crop in FIGURES:
        im = load(name, crop)
        n = derivatives(im, stem)
        total += n
        print(f"{stem:26s} {im.width:>5}x{im.height:<5} {n} files")
        if stem == OG_SOURCE:
            open_graph(im)

    print("")
    print("logos:")
    total += build_logos()

    print("")
    print("gallery:")
    total += build_gallery()

    print("")
    print("certificates:")
    build_certificates()

    touch_icon()
    favicons()
    print(f"\n{total} derivatives, plus og.jpg and apple-touch-icon.png")


if __name__ == "__main__":
    main()
