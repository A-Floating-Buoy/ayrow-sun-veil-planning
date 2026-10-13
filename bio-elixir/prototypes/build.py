"""Build BIO Elixir clinical-section UX test variants.

Source: ../cafe24-admin/bio-elixir-pdp.html (원본, 수정하지 않음)
Output:
  ../cafe24-admin/test/bio-elixir-pdp-test-a-autorotate.html   테스트 상품 A (원본 + 자동 회전)
  ../cafe24-admin/test/bio-elixir-pdp-test-b-timepoints.html       테스트 상품 B (타임라인 · 수치 노출형)
  ../cafe24-admin/test/bio-elixir-pdp-test-c-labels.html           테스트 상품 C (타임라인 · 텍스트형)
  ../cafe24-admin/test/bio-elixir-pdp-test-d-sunveil.html          테스트 상품 D (C + Sun Veil 디자인 시스템)
  preview-{original,a,b,c,d}.html                                 로컬 미리보기 (GitHub 폴더 루트에서 서버 실행)

Run:  python3 bio-elixir/prototypes/build.py
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ADMIN = HERE.parent / "cafe24-admin"
OUT = ADMIN / "test"
SKIN = "../../../ayrow-cafe24-skin-2026"  # preview → skin repo (sibling of planning repo)
VER = "20261013000044"

src = (ADMIN / "bio-elixir-pdp.html").read_text(encoding="utf-8")
start = src.index("  <!-- 3. Clinical proof")
end = src.index("  <!-- 4. Plant origin")
clinical = src[start:end]


def sub_once(pattern, repl, text):
    new, n = re.subn(pattern, repl, text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"pattern not found: {pattern}")
    return new


def add_proto_assets(html, label):
    html = html.replace(
        "<!-- BIO Elixir PDP — production story content (admin-injected) -->",
        f"<!-- BIO Elixir PDP — UX TEST {label} (테스트 상품 전용 · bio-elixir/prototypes/build.py로 생성, 직접 수정 금지) -->",
    )
    html = sub_once(
        r'(<link rel="stylesheet" href="/css/module/product/pdp-elixir\.css\?ver=\d+">)',
        rf'\1\n<link rel="stylesheet" href="/css/module/product/pdp-elixir-proto.css?ver={VER}">',
        html,
    )
    html = sub_once(
        r'(<script src="/js/module/product/pdp-elixir\.js\?ver=\d+"></script>)',
        rf'\1\n<script src="/js/module/product/pdp-elixir-proto.js?ver={VER}"></script>',
        html,
    )
    return html


# ---- A: original markup + auto-rotate (+ exposure markers) ----
a = clinical
for value, key in [("-5.376°C", "temperature"), ("30.686%", "puffiness"), ("91.195%", "redness"), ("54.463%", "hydration")]:
    a = a.replace(f'<strong class="pdp-clinical__metric">{value}</strong>',
                  f'<strong class="pdp-clinical__metric" data-proto-metric="{key}">{value}</strong>')
for value, key in [("19.551%", "elasticity"), ("12.987%", "wrinkle"), ("10.836%", "texture")]:
    a = a.replace(f"<strong>{value}</strong>", f'<strong data-proto-metric="{key}">{value}</strong>')
for key in ["temperature", "puffiness", "redness"]:
    a = a.replace(f'data-pdp-result-visual="{key}"', f'data-pdp-result-visual="{key}" data-proto-visual="{key}"')
a = a.replace('<div class="pdp-clinical__hydration-chart">', '<div class="pdp-clinical__hydration-chart" data-proto-visual="hydration">')
for key in ["elasticity", "wrinkle", "texture"]:
    a = a.replace('<article class="pdp-clinical__metric-card">', f'<article class="pdp-clinical__metric-card" data-proto-visual="{key}">', 1)
assert a.count("data-proto-metric") == 7 and a.count("data-proto-visual") == 7, "A markers"
page_original = add_proto_assets(src[:start] + a + src[end:], "원본 (미리보기 전용)")  # 노출 배지용 마커만 추가
a = a.replace('aria-label="측정 시점" data-pdp-tabs>', 'aria-label="측정 시점" data-pdp-tabs data-pdp-autorotate="5000">')
page_a = add_proto_assets(src[:start] + a + src[end:], "A · 원본 탭 + 자동 회전")

# ---- B: timepoints (summary strip) ----
svgs = re.findall(r'<svg class="pdp-chart".*?</svg>', clinical, flags=re.S)
study = re.search(r'<details class="pdp-disclosure pdp-clinical__study".*?</details>', clinical, flags=re.S).group(0)
safety = re.search(r'<div class="pdp-safety".*?\n      </div>', clinical, flags=re.S).group(0)
b = (HERE / "_clinical-recommended.html").read_text(encoding="utf-8")
for i, svg in enumerate(svgs):
    b = b.replace("{{svg:%d}}" % i, svg)
b = b.replace("{{study}}", study)  # 연구 개요는 원본처럼 기본 펼침
b = b.replace("{{safety}}", safety)
assert "{{" not in b, "B placeholders left"
rest = src[end:]  # LEARN ABOUT LTVE™도 원본처럼 기본 펼침
page_b = add_proto_assets(src[:start] + b + rest, "B · 타임라인 탭(수치 노출) + 1회 재생")

# ---- C: B와 같은 구조, 탭에는 효과 라벨만 · 수치는 근거 카드에서 ----
LABELS = {  # 탭 수치 블록 → 한 줄 라벨
    "now": "피부 온도 · 붓기 · 붉은기*",
    "24h": "보습 지속",
    "4w": "탄력 · 눈가 주름 · 피부결",
}
CARD_VALUES = {  # data-proto-visual → 카드 머리에 붙일 수치
    "temperature": "-5.376°C", "puffiness": "30.686%", "redness": "91.195%",
    "elasticity": "19.551%", "wrinkle": "12.987%", "texture": "10.836%",
}
c = b.replace("pdp-clinical--timepoints", "pdp-clinical--timepoints pdp-clinical--labels", 1)
c = c.replace("(추천안: 요약 스트립 탭 + 1단계 인터랙션 + 1회 자동 재생)", "(C안: 타임라인 탭은 효과 라벨만, 수치는 근거 카드에서)")
for key, label in LABELS.items():
    c = sub_once(
        rf'(aria-controls="pdp-timepoints-panel-{key}".*?</span></span></span>)\s*<span class="pdp-timepoints__metrics">.*?\n {{12}}</span>',
        rf'\1\n            <span class="pdp-timepoints__labels">{label}</span>',
        c,
    )
for key, value in CARD_VALUES.items():
    c = sub_once(
        rf'(data-proto-visual="{key}">\s*<(?:figcaption|h4) class="pdp-timepoints__card-head">)([^<]+)',
        rf'\1<span>\2</span><strong data-proto-metric="{key}">{value}</strong>',
        c,
    )
c = c.replace(
    '<div class="pdp-clinical__hydration-copy">',
    '<div class="pdp-clinical__hydration-copy">\n                <strong class="pdp-clinical__metric" data-proto-metric="hydration">54.463%</strong>\n'
    '                <p class="pdp-clinical__sublabel body-m">사용 전 대비 24시간 후 개선율</p>',
    1,
)
c = c.replace(
    "*사용 직후 결과는 일시적인 변화입니다.",
    "인체적용시험 측정 항목 · *사용 직후 결과는 일시적인 변화입니다.",
)
assert c.count("data-proto-metric") == 7 and "pdp-timepoints__metrics" not in c, "C markers"
page_c = add_proto_assets(src[:start] + c + rest, "C · 타임라인 탭(효과 라벨) + 1회 재생")

# ---- D: C와 같은 구조 · Sun Veil 디자인 시스템(타입 토큰·container--md·spacing 토큰·서피스) 적용 ----
d = c
# D안만: 안전성(일차자극) 배지를 연구 개요(VIEW THE STUDY) 위로
assert f"{study}\n\n      {safety}" in d, "D study/safety order"
d = d.replace(f"{study}\n\n      {safety}", f"{safety}\n\n      {study}", 1)
for old, new in [
    # 배경 띠(--band)는 원본처럼 유지 — 안쪽 카드 · Safety 박스는 흰색 (pdp-elixir-proto.css)
    ("pdp__section--band pdp-clinical pdp-clinical--timepoints pdp-clinical--labels",
     "pdp__section--band pdp-clinical pdp-clinical--timepoints pdp-clinical--labels pdp-clinical--sv"),
    ('class="pdp-clinical__hydration-title heading-xxl"', 'class="pdp-clinical__hydration-title sm--heading-l heading-xl"'),
    ('class="pdp-timepoints__qualifier body-s"', 'class="pdp-timepoints__qualifier body-xs"'),
    ('<p class="pdp-timepoints__note">', '<p class="pdp-timepoints__note body-xs">'),
    ("(C안: 타임라인 탭은 효과 라벨만, 수치는 근거 카드에서)", "(D안: C안 구조 + Sun Veil 디자인 시스템)"),
]:
    assert old in d, old
    d = d.replace(old, new, 1)
d = d.replace('<span class="pdp-timepoints__labels">', '<span class="pdp-timepoints__labels heading-m">')
d = re.sub(r'(class="pdp-timepoints__card-head">)<span>', r'\1<span class="body-m">', d)
d = d.replace('<strong data-proto-metric=', '<strong class="heading-xxxl" data-proto-metric=')
d = d.replace('<strong class="pdp-clinical__metric" data-proto-metric="hydration">',
              '<strong class="pdp-clinical__metric heading-xxxl" data-proto-metric="hydration">')
assert d.count('class="heading-xxxl" data-proto-metric') == 6, "D values"
# D안 시안(2026-10-13): 라벨 문구 · 각주를 섹션 하단(안전성 다음)으로
for old, new in [
    ('<span class="pdp-timepoints__labels heading-m">피부 온도 · 붓기 · 붉은기*</span>',
     '<span class="pdp-timepoints__labels heading-m">피부 온도 · 붓기 · 붉은기 개선*</span>'),
    ('<span class="pdp-timepoints__labels heading-m">탄력 · 눈가 주름 · 피부결</span>',
     '<span class="pdp-timepoints__labels heading-m">피부노화지수 완화</span>'),
]:
    assert old in d, old
    d = d.replace(old, new, 1)
qualifier = re.search(r'\n\s*<p class="pdp-timepoints__qualifier body-xs">[^<]+</p>', d).group(0)
d = d.replace(qualifier, "", 1)
assert f"{safety}\n\n      {study}" in d, "D safety/study"
d = d.replace(f"{safety}\n\n      {study}", f"{safety}{qualifier}\n\n      {study}", 1)
page_d = add_proto_assets(src[:start] + d + rest, "D · 텍스트형 + Sun Veil 디자인 시스템")
# D안 페이지 단위 조정용 루트 클래스 (.pdp--proto-d)
assert page_d.count('class="pdp pdp--elixir"') == 1, "D root"
page_d = page_d.replace('class="pdp pdp--elixir"', 'class="pdp pdp--elixir pdp--proto-d"', 1)
# D안 히어로: 와이드 화면 양옆을 채우는 흐린 배경용 이미지 경로
hero_open = '<section class="pdp__section pdp__section--full pdp-elixir-hero" data-pdp-section="hero">'
assert page_d.count(hero_open) == 1, "D hero"
page_d = page_d.replace(
    hero_open,
    hero_open.replace('data-pdp-section="hero"',
                      'data-pdp-section="hero" style="--pdp-hero-bg: url(\'/web/src/bio-elixir/hero-bg.png\');"'),
    1,
)
# D안만: 피뿌리풀 들판 이미지 → 영상 (pdp.js in-view video: 화면에 보일 때만 재생, 포스터는 기존 이미지)
FIELD_VIDEO = "https://smvt.b-cdn.net/hf_20261012_060423_e13d5c59-94ad-4b97-9dda-793c338bf6cb.mp4"
for old, new in [
    ('<figure class="pdp-origin__field">', '<figure class="pdp-origin__field" data-pdp-video-section>'),
    ('<img class="pdp-origin__field-image" src="/web/src/bio-elixir/plant-origin-field.png" alt="몽골 초원에 핀 피뿌리풀(Stellera chamaejasme)" width="2720" height="1536" loading="lazy">',
     f'<video class="pdp-origin__field-image" data-pdp-video muted loop playsinline preload="metadata" poster="/web/src/bio-elixir/plant-origin-field.png" aria-label="몽골 초원에 핀 피뿌리풀(Stellera chamaejasme)"><source src="{FIELD_VIDEO}" type="video/mp4"></video>'),
]:
    assert page_d.count(old) == 1, old
    page_d = page_d.replace(old, new, 1)

# D안만: Harmony 섹션 — 사진(harmony-spheres.png)을 모눈 위 칸 채우기로 벡터화.
#   스테이지 전체가 정방형 모눈(단위 --u), 요소는 칸에 딱 맞는 흰 정사각 모듈(모눈을 덮는다).
#   사진 구도 그대로 13×10 정수 좌표(열, 행, 크기 · 1-based). 코어 = 4×4, 서포트 = 2×2, 원은 칸 정중앙
#        1 2 3 4 5 6 7 8 9 10 11 12 13
#    1-2             Q Q
#    3-4       N N N N
#    5-6       N N N N V V K  K
#    7       R R R R . . . P  P  P  P
#    8       R R R R X X X P  P  P  P
#    9-10  L L R R R R X X X P  P  P  P     (X = 투명 크리스털 구체 · 장식)
#   소개 문구도 같은 모눈 위 흰 블록(데스크톱: 이 그리드 왼쪽 7칸, 높이는 칸 단위로 올림 — proto.js)
HARMONY = {  # aria-controls 번호 → (열, 행, 크기, 코어?, 원 색, + 표시 색)
    1: (4, 3, 4, True, "#f3da62", "#5b4b00"),   # NMN — 노랑
    2: (3, 7, 4, True, "#a6372d", "#fff"),      # Resveratrol — 빨강
    3: (10, 7, 4, True, "#2c7bd0", "#fff"),     # Pterostilbene — 파랑
    4: (6, 1, 2, False, "#efa232", "#fff"),     # Quercetin — 주황, 맨 위
    5: (8, 5, 2, False, "#86b547", "#fff"),     # Vegan PRN — 초록 ┐ 사진에선 한 큐브
    6: (10, 5, 2, False, "#f29c7c", "#fff"),    # Kakadu Plum — 살구 ┘
    7: (1, 9, 2, False, "#d38aae", "#fff"),     # Lepidium Seed — 분홍, 왼쪽 아래
}
CRYSTAL = (7, 8, 3)


def harmony_spot(m):
    n = int(m.group(3))
    col, row, size, core, orb, ink = HARMONY[n]
    cls = "pdp-harmony__spot"
    cls += " pdp-harmony__spot--lg" if core else ""
    cls += " pdp-harmony__spot--flip" if col >= 8 else ""   # 오른쪽 큐브는 팝업을 왼쪽으로
    cls += " pdp-harmony__spot--up" if row >= 7 else ""     # 모바일: 아래 줄 큐브는 팝업을 위로
    style = f"--c: {col}; --r: {row}; --s: {size}; --orb: {orb}; --orb-ink: {ink}; --n: {n - 1};"  # --n: 이름 등장 순서(번호순)
    return (f'<li class="{cls}" data-pdp-hotspot style="{style}">{m.group(1)}'
            f'<button class="pdp-harmony__dot" type="button" {m.group(2)}>'
            f'<span class="pdp-harmony__no">{n:02d}</span>'
            f'<span class="pdp-harmony__orb" aria-hidden="true"></span>'
            f'<span class="pdp-harmony__name">{m.group(4).replace("<br>", " ")}</span></button>')


page_d, n = re.subn(
    r'<li class="pdp-harmony__spot[^"]*" data-pdp-hotspot style="[^"]*">(\s*)'
    r'<button class="pdp-harmony__dot[^"]*" type="button" ([^>]*aria-controls="pdp-harmony-pop-(\d)")>(.*?)</button>',
    harmony_spot, page_d, flags=re.S,
)
assert n == 7, f"D harmony spots: {n}"
c_col, c_row, c_size = CRYSTAL
spots_end = page_d.index("</ul>", page_d.index('class="pdp-harmony__spots"'))
page_d = (page_d[:spots_end]
          + f'  <li class="pdp-harmony__crystal" aria-hidden="true" style="--c: {c_col}; --r: {c_row}; --s: {c_size};">'
          + '<span class="pdp-harmony__orb"></span></li>\n          '
          + page_d[spots_end:])
# 경계선: 모눈 전체 대신 박스(성분 · 크리스털) 변이 지나는 그리드 선만, 섹션 끝까지. 박스 면이 자기 안의 선을 가린다.
# 소개 블록의 네 변은 CSS(--intro-l/-t/-r/-b)가 그린다(소개 크기 · 위치가 화면에 따라 달라서)
boxes = [(c, r, s) for c, r, s, *_ in HARMONY.values()] + [CRYSTAL]
xs = sorted({x for c, _, s in boxes for x in (c, c + s)})
ys = sorted({y for _, r, s in boxes for y in (r, r + s)})
# --i = 진입 시 그려지는 순서(proto.js가 .is-drawing → .is-drawn).
# 소개(텍스트) 블록의 네 변이 먼저(위 → 왼 → 아래 → 오른), 이어서 큐브 선을 세로 · 가로 번갈아 — 지연은 CSS
intro = [("h", "t"), ("v", "l"), ("h", "b"), ("v", "r")]
rules = "".join(f'<span class="pdp-harmony__rule pdp-harmony__rule--{d} pdp-harmony__rule--intro-{e}" style="--i: {i};"></span>'
                for i, (d, e) in enumerate(intro))
v_rules = [f'class="pdp-harmony__rule pdp-harmony__rule--v" style="--at: {x};' for x in xs]
h_rules = [f'class="pdp-harmony__rule pdp-harmony__rule--h" style="--at: {y};' for y in ys]
ordered = [r for pair in zip(v_rules, h_rules) for r in pair]
ordered += v_rules[len(h_rules):] + h_rules[len(v_rules):]
rules += "".join(f'<span {r} --i: {i};"></span>' for i, r in enumerate(ordered))
page_d = sub_once(
    r'(<div class="pdp-harmony__stage">)',
    rf'\1\n      <div class="pdp-harmony__rules" aria-hidden="true">{rules}</div>',
    page_d,
)
# D안만: FORMULA SUPPORT의 + 표시 제거(기능 없는 장식 — 눌러야 할 것처럼 보임). 제목의 + · 카드별 + 아이콘
page_d = sub_once(r'(<p class="pdp__eyebrow">FORMULA SUPPORT) \+(</p>)', r"\1\2", page_d)
page_d = sub_once(r'\n\s*<img class="pdp-harmony__photo"[^>]*>', "", page_d)
# D안만: FORMULA SUPPORT는 container--md(886px)
page_d = sub_once(r'<div class="container container--lg">(\s*<div class="pdp-support")',
                  r'<div class="container container--md">\1', page_d)
page_d = sub_once(r'class="(pdp__section pdp__section--full pdp-harmony)"', r'class="\1 pdp-harmony--grid"', page_d)

# D안만: 임상 카드 차트를 정사각(1:1)으로 — 세로 좌표만 W/H배로 늘려 다시 배치한다.
#   글자 크기 · 점 반지름은 그대로(찌그러짐 없음). 수치 라벨은 바로 앞 점과의 간격을 원래대로 유지.
#   24H 차트는 카드가 아니라 수분 블록이라 제외.
SQUARE_CHARTS = ("now",)  # 4 WEEKS 차트(elastic · texture · wrinkle)는 원래 가로형 비율 — 패널을 NOW 높이에 맞추며 남는 높이를 채운다
# 24H 차트(수분 블록)는 NOW 카드 줄 높이에 맞춘 영역을 채우도록 가로:세로 = 1.25:1
CHART_RATIO = {"24h": 1.25}


def square_chart(m):
    w, h, key, body = float(m.group(1)), float(m.group(2)), m.group(3), m.group(4)
    new_h = round(w / CHART_RATIO.get(key, 1))
    k = new_h / h
    fmt = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")
    out, last = [], None  # last = (원래 cy, 새 cy)
    for tag in re.split(r"(<[^>]+>)", body):
        if tag.startswith("<circle"):
            cy = float(re.search(r' cy="([\d.]+)"', tag).group(1))
            last = (cy, cy * k)
            tag = re.sub(r' cy="[\d.]+"', f' cy="{fmt(cy * k)}"', tag)
        elif tag.startswith("<text") and "pdp-chart__value" in tag and last:
            y = float(re.search(r' y="([\d.]+)"', tag).group(1))
            tag = re.sub(r' y="[\d.]+"', f' y="{fmt(last[1] + (y - last[0]))}"', tag)
        elif tag.startswith(("<line", "<text")):
            tag = re.sub(r' (y|y1|y2)="([\d.]+)"', lambda a: f' {a.group(1)}="{fmt(float(a.group(2)) * k)}"', tag)
        elif tag.startswith("<polyline"):
            tag = re.sub(r'points="([^"]+)"', lambda a: 'points="' + " ".join(
                f"{x},{fmt(float(y) * k)}" for x, y in (p.split(",") for p in a.group(1).split())) + '"', tag)
        out.append(tag)
    return (f'<svg class="pdp-chart" viewBox="0 0 {m.group(1)} {new_h}" role="img" '
            f'aria-labelledby="pdp-chart-{key}-title">' + "".join(out) + "</svg>")


page_d, n = re.subn(
    r'<svg class="pdp-chart" viewBox="0 0 ([\d.]+) ([\d.]+)" role="img" aria-labelledby="pdp-chart-(%s)-title">(.*?)</svg>'
    % "|".join(SQUARE_CHARTS + tuple(CHART_RATIO)), square_chart, page_d, flags=re.S)
assert n == len(SQUARE_CHARTS) + len(CHART_RATIO), f"D chart relayout: {n}"

# ---- 원본 전용 변경 — A–D에는 반영하지 않는다 (원본 HTML에서 바뀐 것을 테스트안에서만 되돌림) ----
# (원본 문자열, 테스트안 문자열, 적용할 안)
ORIGINAL_ONLY = [
    # 2026-10-14 STECHA™ heading-xl → heading-l (원본 · A만 — B–D는 heading-xl 유지)
    ('<strong class="heading-l">STECHA™</strong>', '<strong class="heading-xl">STECHA™</strong>', "bcd"),
]


def revert_original_only(html, key):
    for original, variant, targets in ORIGINAL_ONLY:
        if key not in targets:
            continue
        assert html.count(original) == 1, f"original-only ({key}): {original}"
        html = html.replace(original, variant)
    return html


page_a, page_b, page_c, page_d = (revert_original_only(h, k) for h, k in
                                  ((page_a, "a"), (page_b, "b"), (page_c, "c"), (page_d, "d")))

OUT.mkdir(exist_ok=True)
(OUT / "bio-elixir-pdp-test-d-sunveil.html").write_text(page_d, encoding="utf-8")
(OUT / "bio-elixir-pdp-test-a-autorotate.html").write_text(page_a, encoding="utf-8")
(OUT / "bio-elixir-pdp-test-b-timepoints.html").write_text(page_b, encoding="utf-8")
(OUT / "bio-elixir-pdp-test-c-labels.html").write_text(page_c, encoding="utf-8")

# ---- Local previews ----
VARIANTS = [
    ("original", "원본", "탭 3개 × NOW 내부 카드 3개 (2단계)", page_original),
    ("a", "A · 원본 + 자동 회전", "5초마다 무한 회전 · 마우스 올리면 일시정지 · 탭 클릭 시 정지", page_a),
    ("b", "B · 수치 노출형", "타임라인 탭에 7개 수치 상시 노출 · 1단계 · 1회 재생(7초) 후 4주에서 정지", page_b),
    ("c", "C · 텍스트형", "타임라인 탭은 효과 라벨만 · 수치는 근거 카드에서 · 1회 재생(7초) 후 4주에서 정지", page_c),
    ("d", "D · 텍스트형 + Sun Veil", "C안 구조 · Sun Veil 타입 토큰 · container--md(886px) · spacing 토큰 · 흰 배경 + subtle 카드", page_d),
]
CORE = ["fonts/fonts.css", "css/core/tokens.css", "css/core/tokens-ayrow-v3.css", "css/core/typography.css",
        "css/core/base.css", "css/core/layout.css", "css/core/utilities.css"]


def to_preview(html):
    # 루트 기준 절대경로: CSS 변수 속 url()은 스타일시트 기준으로 풀리므로 상대경로면 깨진다
    html = html.replace("/web/src/bio-elixir/", "/ayrow-sun-veil-planning/bio-elixir/assets/")
    html = html.replace("/web/src/sun-veil/", f"{SKIN}/src/sun-veil/")
    html = re.sub(r'(href|src)="/(css|js)/', rf'\1="{SKIN}/\2/', html)
    return html


for slug, title, desc, html in VARIANTS:
    current = ' aria-current="page"'
    nav = "".join(
        f'<a href="preview-{s}.html%7Bq%7D"{current if s == slug else ""}>{t}</a>' for s, t, _, _ in VARIANTS
    )
    head = "\n".join(f'  <link rel="stylesheet" href="{SKIN}/{p}">' for p in CORE)
    page = f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BIO Elixir PDP — {title}</title>
{head}
  <style>
    body {{ margin: 0; background: #fff; }}
    .proto-bar {{ position: sticky; top: 0; z-index: 9998; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 16px; background: #111827; color: #fff; font: 500 13px/1.4 system-ui, sans-serif; }}
    .proto-bar nav {{ display: flex; gap: 4px; }}
    .proto-bar a {{ padding: 4px 10px; border-radius: 999px; color: #cbd5e1; text-decoration: none; }}
    .proto-bar a[aria-current] {{ background: #fff; color: #111827; }}
    .proto-bar p {{ margin: 0; color: #94a3b8; }}
    .proto-bar .proto-jump {{ margin-left: auto; color: #fff; border: 1px solid #475569; }}
  </style>
</head>
<body>
  <div class="proto-bar">
    <nav>{nav}</nav>
    <p>{desc}</p>
    <a class="proto-jump" href="#pdp-elixir-clinical">임상 섹션으로 ↓</a>
  </div>
  <script>document.querySelectorAll('.proto-bar nav a').forEach(function (a) {{ a.href = a.href.replace('%7Bq%7D', location.search); }});</script>
{to_preview(html)}
</body>
</html>
"""
    (HERE / f"preview-{slug}.html").write_text(page, encoding="utf-8")

print("built:", [p.name for p in OUT.iterdir()], "+ previews")
