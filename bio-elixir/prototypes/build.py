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
VER = "20261026000001"

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
d = re.sub(r'(class="pdp-timepoints__card-head">)<span>', r'\1<span class="body-l">', d)
d = d.replace('<strong data-proto-metric=', '<strong class="heading-xxxl" data-proto-metric=')
d = d.replace('<strong class="pdp-clinical__metric" data-proto-metric="hydration">',
              '<strong class="pdp-clinical__metric heading-xxxl" data-proto-metric="hydration">')
assert d.count('class="heading-xxxl" data-proto-metric') == 6, "D values"
# D안 시안(2026-10-13): 라벨 문구 · 각주를 섹션 하단(안전성 다음)으로
for old, new in [
    ('<span class="pdp-timepoints__labels heading-m">피부 온도 · 붓기 · 붉은기*</span>',
     '<span class="pdp-timepoints__labels heading-m">피부 온도 · 붓기 · 붉은기 개선</span>'),
    ('<span class="pdp-timepoints__labels heading-m">탄력 · 눈가 주름 · 피부결</span>',
     '<span class="pdp-timepoints__labels heading-m">피부노화지수 완화</span>'),
]:
    assert old in d, old
    d = d.replace(old, new, 1)
# D안: 진행선은 각 탭의 시점 줄(pill · 사용 직후) 오른쪽에 그대로(.pdp-timepoints__rail) —
#   탭 밖 페이지네이션 바는 없앰(2026-10-20). 탭은 nav로 감싸 모바일에서 상단 고정
RAIL = '<span class="pdp-timepoints__rail" aria-hidden="true"><span class="pdp-timepoints__progress"></span></span>'
assert d.count(RAIL) == 3, "D rails"
# 2026-10-21 수정안: 진행선도 삭제 — 노란 면으로 선택 상태가 충분히 구분되고 그래프에도 인터랙션이 있다
d = d.replace(RAIL, "")
d = sub_once(r'(\n {8})(<div class="pdp-timepoints__tabs".*?\n {8}</div>)',
             lambda m: (m.group(1) + '<div class="pdp-timepoints__nav">'
                        + m.group(1) + '  ' + m.group(2).replace("\n", "\n  ")
                        + m.group(1) + '</div>'), d)
qualifier = re.search(r'\n\s*<p class="pdp-timepoints__qualifier body-xs">[^<]+</p>', d).group(0)
d = d.replace(qualifier, "", 1)

# ---- D안 2026-10-20 수정안(노션 「엘릭서 상세페이지 수정안」) ----
PNK = "*P&amp;K 피부임상연구센타㈜"
SIG_T = '<p class="pdp-timepoints__sig body-xs">* : <i>p</i>&lt;0.05 by Paired t-test</p>'
SIG_W = '<p class="pdp-timepoints__sig body-xs"># : <i>p</i>&lt;0.05 by Wilcoxon signed rank test</p>'


def swap(old, new):
    global d
    assert d.count(old) == 1, f"D 수정안: {old}"
    d = d.replace(old, new)


# NOW: 카드 설명 · °C 단위는 Y축 위로(모든 단위 Y축 상단 통일) · 출처 각주
swap('<span class="body-l">열 자극 후 즉각적인(일시적) 피부 온도 감소</span>',
     '<span class="body-l">즉각적인(일시적) 피부 온도 감소(쿨링)</span>')
swap('<span class="body-l">외부 자극으로 손상된 피부의 일시적 붉은기 개선율</span>',
     '<span class="body-l">외부 자극(물리적 자극)으로 손상된 피부의 일시적 붉은기 진정 개선율</span>')
swap('y="279.4" text-anchor="end" dominant-baseline="middle" font-size="16.7">°C',
     'y="17" text-anchor="end" dominant-baseline="middle" font-size="16.7">°C')
swap('<p class="pdp-timepoints__note body-xs">*연구관리번호 PNK-26622-K1R 인체적용시험 결과 (2026.06.22–2026.07.23) · 개인에 따라 차이가 있을 수 있습니다.</p>',
     f'''<ul class="pdp-timepoints__notes body-xs">
              <li>※ 피부 붓기 개선율(%)=│(after-before)│/before*100</li>
              <li>※ 붉은기 진정 개선율(%)=(자극 후-사용 직후)/(자극 후-자극 전)*100</li>
              <li>{PNK} 인체적용시험 결과(2026.06.15~07.09 / 2026.06.22~07.23) · 개인에 따라 차이가 있을 수 있습니다.</li>
            </ul>''')

# 24H: 예시 시안 구성 — 제목 · 24시간 후 개선율(주) · 사용 직후 개선율(보조) · 결론 문구 / A.U.는 Y축 위로
swap(re.search(r'<div class="pdp-clinical__hydration-copy">.*?</h3>\n {14}</div>', d, flags=re.S).group(0),
     '''<div class="pdp-clinical__hydration-copy">
                <div class="pdp-hydration__head">
                  <h3 class="pdp-hydration__title heading-l">24시간 피부 보습 지속력</h3>
                  <p class="pdp-hydration__sub body-m">사용 전 대비 개선율</p>
                </div>
                <dl class="pdp-hydration__stats">
                  <div class="pdp-hydration__stat"><dt class="body-l">24시간 후 개선율</dt><dd><strong class="pdp-clinical__metric heading-xxxl" data-proto-metric="hydration">54.463%</strong></dd></div>
                  <div class="pdp-hydration__stat pdp-hydration__stat--sub"><dt class="body-l">사용 직후 개선율</dt><dd><strong class="heading-xl">90.547%</strong></dd></div>
                </dl>
                <p class="pdp-hydration__claim body-l">1회 사용으로<br>24시간 동안 지속되는<br>피부 보습 효과</p>
              </div>''')
swap('font-size="13">A.U. 80</text>',
     'font-size="13">80</text>\n              <text class="pdp-chart__tick" x="45.5" y="13" text-anchor="end" dominant-baseline="middle" font-size="13">A.U.</text>')
swap('''            </div>
          </div>

          <!-- 4 WEEKS -->''', f'''            </div>
            <ul class="pdp-timepoints__notes body-xs">
              <li>※ 개선율(%)=│(after-before)│/before*100</li>
              <li>{PNK} 인체적용시험 결과(2026.06.15~07.09) · 개인에 따라 차이가 있을 수 있습니다.</li>
            </ul>
          </div>

          <!-- 4 WEEKS -->''')

# 4 WEEKS: 피부노화지수 카드(개선율 + 그래프) · 수치별 유의성 표시(*, #)와 카드 주석 · 개선율 공식 · 출처 각주
SAI_CHART = '''<svg class="pdp-chart" viewBox="0 0 307 198" role="img" aria-labelledby="pdp-chart-sai-title">
              <title id="pdp-chart-sai-title">피부노화지수 51.868에서 42.253으로 18.537% 개선</title>
              <line class="pdp-chart__grid" x1="57.3" y1="35.4" x2="278.4" y2="35.4"/>
              <text class="pdp-chart__tick" x="47.3" y="35.4" text-anchor="end" dominant-baseline="middle" font-size="12.5">60</text>
              <line class="pdp-chart__grid" x1="57.3" y1="74.3" x2="278.4" y2="74.3"/>
              <text class="pdp-chart__tick" x="47.3" y="74.3" text-anchor="end" dominant-baseline="middle" font-size="12.5">50</text>
              <line class="pdp-chart__grid" x1="57.3" y1="113.2" x2="278.4" y2="113.2"/>
              <text class="pdp-chart__tick" x="47.3" y="113.2" text-anchor="end" dominant-baseline="middle" font-size="12.5">40</text>
              <line class="pdp-chart__grid" x1="57.3" y1="152.1" x2="278.4" y2="152.1"/>
              <text class="pdp-chart__tick" x="47.3" y="152.1" text-anchor="end" dominant-baseline="middle" font-size="12.5">30</text>
              <text class="pdp-chart__tick" x="47.3" y="13.9" text-anchor="end" dominant-baseline="middle" font-size="12.5">SAI</text>
              <polyline class="pdp-chart__line" pathLength="1" points="57.3,67 278.4,104.4"/>
              <circle class="pdp-chart__dot pdp-chart__dot--open" cx="57.3" cy="67" r="6"/>
              <text class="pdp-chart__value" x="51.3" y="55" text-anchor="start" font-size="15.6">51.868</text>
              <circle class="pdp-chart__dot" cx="278.4" cy="104.4" r="6"/>
              <text class="pdp-chart__value" x="284.4" y="127.3" text-anchor="end" font-size="15.6">42.253*</text>
              <text class="pdp-chart__label" x="57.3" y="184.1" text-anchor="start" font-size="13.5">사용 전</text>
              <text class="pdp-chart__label" x="278.4" y="184.1" text-anchor="end" font-size="13.5">4주 후</text>
            </svg>'''
swap('''<div class="pdp-timepoints__summary">
              <h3 class="pdp-clinical__summary-title"><strong>피부노화지수(Skin Aging Index) 완화</strong>에 도움</h3>
              <p class="pdp-clinical__summary-note body-m">피부노화지수는 피부 탄력 · 눈가주름 · 피부결 측정 결과를 조합한 지표입니다.</p>
            </div>''', '''<div class="pdp-timepoints__summary">
              <h3 class="pdp-clinical__summary-title"><strong>피부노화지수(Skin Aging Index) 완화</strong>에 도움</h3>
              <p class="pdp-clinical__summary-note body-m">피부노화지수는 피부 탄력 · 눈가주름 · 피부결을 종합적으로 평가한 지표입니다.</p>
            </div>''')
# 피부노화지수도 다른 지표와 같은 카드로 — 카드 줄 맨 앞(데스크톱 4단)
swap('''<div class="pdp-timepoints__row">
              <article class="pdp-timepoints__card" data-proto-visual="elasticity">''', f'''<div class="pdp-timepoints__row pdp-timepoints__row--4">
              <article class="pdp-timepoints__card">
                <h4 class="pdp-timepoints__card-head"><span class="body-l">피부노화지수 완화</span><strong class="heading-xxxl">18.537%</strong></h4>
                <div class="pdp-timepoints__card-body pdp-timepoints__card-body--chart">{SAI_CHART}</div>
                <p class="pdp-timepoints__sig body-xs">※ SAI: Skin Aging Index(피부노화지수)<br>* : <i>p</i>&lt;0.05 by Paired t-test</p>
              </article>
              <article class="pdp-timepoints__card" data-proto-visual="elasticity">''')
for value, sig in [("0.746", SIG_T), ("22.324", SIG_W), ("6.690", SIG_W)]:
    mark = "*" if sig is SIG_T else "#"
    swap(f'font-size="15.6">{value}</text>', f'font-size="15.6">{value}{mark}</text>')
    d = sub_once(rf'(font-size="15.6">{re.escape(value)}{re.escape(mark)}</text>.*?</svg></div>)',
                 rf'\1\n                {sig}', d)
swap('''            </div>
          </div>
        </div>
      </div>''', f'''            </div>
            <ul class="pdp-timepoints__notes body-xs">
              <li>※ 개선율(%)=│(after-before)│/before*100</li>
              <li>{PNK} 인체적용시험 결과(2026.06.22~07.23) · 개인에 따라 차이가 있을 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </div>''')

# ---- D안 2026-10-21 수정안 ----
# NOW 피부 온도: 사용 직후 수치에 Ŧ · 그래프 카드 좌측 하단 통계 주석
swap('font-size="20">30.905</text>', 'font-size="20">30.905Ŧ</text>')
d = sub_once(r'(font-size="20">30\.905Ŧ</text>.*?</svg>\s*</div>)',
             r'\1\n                <p class="pdp-timepoints__sig body-xs">Ŧ : <i>p</i>&lt;0.05 by repeated measures ANOVA</p>', d)
# 24H: 사용 직후 · 24시간 후 수치에 ** · 그래프 좌측 하단 통계 주석
swap('font-size="20">69.365</text>', 'font-size="20">69.365**</text>')
swap('font-size="20">56.229</text>', 'font-size="20">56.229**</text>')
d = sub_once(r'(<div class="pdp-clinical__hydration-chart">.*?</svg>)',
             r'\1\n                <p class="pdp-timepoints__sig body-xs">** : <i>p</i>&lt;0.05 by repeated measures ANOVA, post hoc C.I correction by Bonferroni.</p>', d)

# VIEW THE STUDY: 시점별 시험 개요 · 효능 결과(+ 각 시점 연구 개요) → 민감성 피부 테스트(신뢰 영역) 순서
STUDIES = [
    ("now", "NOW · 사용 직후", [
        ("시험명", "에이로우 바이오 엘릭서의 피부 온도 감소(쿨링), 피부 붓기 및 물리적 자극으로 손상된 피부의 붉은기 진정에 대한 인체적용시험"),
        ("시험기관", "P&amp;K 피부임상연구센타㈜"),
        ("시험기간", "2026.06.15 ~ 07.09 (쿨링·붓기) / 2026.06.22 ~ 07.23 (붉은기 진정)"),
        ("시험대상", "만 35~60세 성인 여성 21명"),
        ("측정항목", "피부 온도 감소(쿨링), 피부 붓기, 물리적 자극으로 손상된 피부의 붉은기 진정"),
    ]),
    ("24h", "24H · 24시간 후", [
        ("시험명", "에이로우 바이오 엘릭서의 24시간 피부 보습 지속력에 대한 인체적용시험"),
        ("시험기관", "P&amp;K 피부임상연구센타㈜"),
        ("시험기간", "2026.06.15 ~ 07.09"),
        ("시험대상", "만 35~60세 성인 여성 21명"),
        ("측정항목", "24시간 피부 보습 지속력"),
    ]),
    ("4w", "4 WEEKS · 4주 사용 후", [
        ("시험명", "에이로우 바이오 엘릭서의 눈가주름, 피부 탄력, 피부결 및 피부노화지수에 대한 인체적용시험"),
        ("시험기관", "P&amp;K 피부임상연구센타㈜"),
        ("시험기간", "2026.06.22 ~ 07.23"),
        ("시험대상", "만 35~60세 성인 여성 21명"),
        ("측정항목", "눈가주름, 피부 탄력, 피부결, 피부노화지수(Skin Aging Index)"),
    ]),
]
# 연구 개요는 시점마다 다르다 — 각 시점 패널 안(출처 각주 아래)에 그 시험의 개요만, 흰 카드로 · 기본 접힘(탭 자동 전환 시 패널 높이 튐 방지)
for key, tag, rows in STUDIES:
    note = re.search(rf'id="pdp-timepoints-panel-{key}".*?(<ul class="pdp-timepoints__notes body-xs">.*?</ul>)', d, flags=re.S).group(1)
    swap(note, note + f'''
            <details class="pdp-disclosure pdp-clinical__study pdp-study-card">
              <summary class="pdp-disclosure__summary sm--body-m body-l">VIEW THE STUDY<span class="pdp-disclosure__icon" aria-hidden="true"></span></summary>
              <div class="pdp-disclosure__body">
                <table class="pdp-study">
                  <caption class="visually-hidden">{tag} 인체적용시험 개요</caption>
                  <tbody>
''' + "".join(f'                    <tr><th scope="row">{th}</th><td>{td}</td></tr>\n' for th, td in rows) + '''                  </tbody>
                </table>
                <p class="pdp-study__disclaimer pdp__note body-xs">인체적용시험 결과가 모든 사용자에게 동일하게 나타나는 것은 아닙니다.</p>
              </div>
            </details>''')
# 2026-10-21 수정안: Vegan 블록처럼 제목 묶음(왼쪽) · 아이콘(오른쪽 위) · 판정 문구(아래 전체 폭) — 배치는 pdp-elixir-proto.css
safety_d = '''<div class="pdp-safety" data-scroll-reveal>
        <img class="pdp-safety__icon" src="https://ecimg.cafe24img.com/pg2475b11771033004/ayrow/web/src/bio-elixir/safety-check.svg" alt="" width="56" height="56" loading="lazy">
        <div class="pdp-safety__copy">
          <p class="pdp__eyebrow">Clinically Tested for Primary Skin Irritation</p>
          <p class="pdp-safety__label body-m">민감성 피부 대상 일차자극 테스트 완료</p>
          <p class="pdp-safety__result heading-xl"><strong>피부자극지수 0.00</strong></p>
        </div>
        <p class="pdp-safety__verdict sm--body-m body-l">비(무)자극성 판정 · 민감성 피부 사용 적합</p>
      </div>
      <p class="pdp-safety__note body-xs">*P&amp;K 피부임상연구센타㈜ 민감성 피부 대상 일차자극 시험 결과(2026.07.08~07.10, 성인 남녀 31명) · 개인에 따라 차이가 있을 수 있습니다.</p>'''
# 섹션 하단 qualifier("인체적용시험 측정 항목 · *사용 직후…")는 NOW 패널 각주로 옮겼다 — 각주는 시점마다 한 블록
swap(f"{study}\n\n      {safety}", safety_d)
# 2026-10-21 수정안: 결과 수치의 % — 숫자 글꼴(Suisse)의 %가 넓어 보여 Pretendard로 · 크기/간격은 CSS(.pdp-metric__unit)
d, n = re.subn(r'(<strong class="(?:pdp-clinical__metric )?heading-x+l"[^>]*>[\d.]+)%(</strong>)',
               r'\1<span class="pdp-metric__unit">%</span>\2', d)
assert n == 8, f"D % units: {n}"  # 붓기 · 붉은기 · 보습 2 · 노화지수 · 탄력 · 주름 · 피부결
page_d = add_proto_assets(src[:start] + d + rest, "D · 텍스트형 + Sun Veil 디자인 시스템")
# D안 페이지 단위 조정용 루트 클래스 (.pdp--proto-d)
assert page_d.count('class="pdp pdp--elixir"') == 1, "D root"
page_d = page_d.replace('class="pdp pdp--elixir"', 'class="pdp pdp--elixir pdp--proto-d"', 1)
# D안(실제 상세): pdp-elixir.css 캐시 버전도 VER로 — 원본 HTML의 ?ver=는 원본 기준이라 D안에서만 올린다
page_d = sub_once(r'(pdp-elixir\.css\?ver=)\d+', rf'\g<1>{VER}', page_d)
# 카페24는 <img src>만 CDN 주소로 바꿔 준다 — style url()·poster는 CDN 절대경로로 적는다 (원본 도메인 /web/src/는 404)
CDN_SRC = "https://ecimg.cafe24img.com/pg2475b11771033004/ayrow/web/src/"
# D안 히어로: 와이드 화면 양옆을 채우는 흐린 배경용 이미지 경로
hero_open = '<section class="pdp__section pdp__section--full pdp-elixir-hero" data-pdp-section="hero">'
assert page_d.count(hero_open) == 1, "D hero"
page_d = page_d.replace(
    hero_open,
    hero_open.replace('data-pdp-section="hero"',
                      f'data-pdp-section="hero" style="--pdp-hero-bg: url(\'{CDN_SRC}bio-elixir/hero-bg.png\');"'),
    1,
)
# D안(실제 상세): <script> 태그 제거 — 카페24가 상세 HTML의 script src를 이미지 CDN(ecimg)으로 바꿔 403이 나고,
#   같은 JS(pdp.js · pdp-elixir.js · pdp-elixir-proto.js)는 스킨 product/detail.html이 <!--@js()-->로 이미 불러온다
page_d, n = re.subn(r'\n<script src="/js/module/product/[^"]+"></script>', "", page_d)
assert n == 3, f"D scripts: {n}"
# D안 히어로(2026-10-20): 새 제품 컷(assets/images/ayrow-bio-elixir-pdp-hero.png)을 가공한
#   hero-bg-desktop.jpg(16:9) · hero-bg-mobile.jpg(2:3, ≤767px)로 교체 — 둘 다 캡 상단이 높이의 39.1%라 문구 배치 기준 그대로.
#   새 컷에 빛 번짐이 있어 겹쳐 두던 glow 이미지는 뺀다
hero_bg = re.search(r'<img class="pdp-elixir-hero__bg"[^>]*>', page_d).group(0)
page_d = page_d.replace(hero_bg, (
    '<picture>\n'
    f'      <source media="(max-width: 767px)" srcset="{CDN_SRC}bio-elixir/hero-bg-mobile.jpg" width="1080" height="1620">\n'
    f'      <img class="pdp-elixir-hero__bg" src="{CDN_SRC}bio-elixir/hero-bg-desktop.jpg" alt="" width="2400" height="1350" loading="eager" fetchpriority="high">\n'
    '    </picture>'), 1)
page_d = sub_once(r'\n\s*<img class="pdp-elixir-hero__glow"[^>]*>', "", page_d)
assert page_d.count("bio-elixir/hero-bg.png") == 1, "D hero bg var"
page_d = page_d.replace("bio-elixir/hero-bg.png", "bio-elixir/hero-bg-desktop.jpg")
# D안 2026-10-23: 제품명 BIO ELIXIR™ 크기 = heading-xl — 10-22의 heading-xxxl(40px)은 너무 커서
#   이전 버전(24px)보다 1–3pt 큰 28px로 · ™는 작은 윗첨자(색 · ™ 크기는 pdp-elixir-proto.css)
page_d = sub_once(r'(<h2 class="pdp-elixir-hero__title) type-display(">BIO ELIXIR)™(</h2>)',
                  r'\1 heading-xl\2<span class="pdp-elixir-hero__tm">™</span>\3', page_d)
# D안: 병 속 정제수 레이어를 크림 틴트 버전으로(브랜드 일관성) — 새 에셋 botanical-bottle-water-creme.svg 업로드 필요
assert page_d.count("bio-elixir/botanical-bottle-water.svg") == 1, "D water"
page_d = page_d.replace("bio-elixir/botanical-bottle-water.svg", "bio-elixir/botanical-bottle-water-creme.svg")
# D안 2026-10-21: 액체를 뚜껑 칼라 바로 아래(빨간선)까지 — 어깨 안쪽까지 포함한 용기 전체 좌표의 정제수 · 액체 마스크로 교체
#   (새 에셋 botanical-bottle-water-full.svg 업로드 필요 · 위치/높이는 pdp-elixir-proto.css의 .pdp--proto-d 블록)
# SVG도 CDN 캐시가 남으므로 ?ver=로 갱신 — 그라디언트를 바꾸면 값을 올린다
WATER_VER = "2026102201"
page_d = page_d.replace("bio-elixir/botanical-bottle-water-creme.svg", f"bio-elixir/botanical-bottle-water-full.svg?ver={WATER_VER}")
page_d = page_d.replace('width="157" height="393" loading="lazy" aria-hidden="true">', 'width="161" height="558" loading="lazy" aria-hidden="true">', 1)
_mask_full = (HERE.parent / "assets" / "botanical-bottle-liquid-mask-full.svg").read_text(encoding="utf-8").strip()
for _a, _b in (('"', "%22"), ("<", "%3C"), (">", "%3E"), ("#", "%23"), ("(", "%28"), (")", "%29")):
    _mask_full = _mask_full.replace(_a, _b)
page_d, _n = re.subn(r"--pdp-liquid-mask: url\('data:image/svg\+xml,[^']*'\)",
                     "--pdp-liquid-mask: url('data:image/svg+xml," + _mask_full + "')", page_d)
assert _n == 1, "D liquid mask"
# (D안 피뿌리풀 들판 영상은 2026-10-20 원본의 패럴렉스 이미지로 대체 — 영상 URL: https://smvt.b-cdn.net/hf_20261012_060423_e13d5c59-94ad-4b97-9dda-793c338bf6cb.mp4)

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
    1: (4, 3, 4, True, "#F7F1A0", "#0077BF"),   # NMN — 브랜드 크렘 (+ 표시는 블루)
    2: (3, 7, 4, True, "#802727", "#fff"),      # Resveratrol — 브랜드 멀롯
    3: (10, 7, 4, True, "#0077BF", "#fff"),     # Pterostilbene — 브랜드 블루
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
# 2026-10-24 수정안: NOW 쿨링 그래프 — 윗선(°C)을 옆 사진 윗선에 붙이고, X축 라벨 ↔ 주석(Ŧ) 간격을 4 WEEKS 카드와 같게
#   viewBox 위(°C 글자 위 빈 곳) · 아래(라벨 아래 여백)를 잘라 낸다
page_d = sub_once(r'viewBox="0 0 502 502"( role="img" aria-labelledby="pdp-chart-now-title")', r'viewBox="0 18 502 468"\1', page_d)
# 24H: 왼쪽 문구 구분선을 80 · 60 눈금선에 맞추려면(proto.js alignHydration) 80 눈금선이 제목 묶음보다 아래여야 한다 —
#   viewBox 위에 빈 곳을 더해 그래프를 조금 내린다
page_d = sub_once(r'viewBox="0 0 515 412"( role="img" aria-labelledby="pdp-chart-24h-title")', r'viewBox="0 -24 515 436"\1', page_d)
# 2026-10-26 사진 보정본: Concentrate 앞 사진 = 26-10-01_AYROW_0500 · MORNING 장면 = 26-09-30_AYROW_0405 (둘 다 1300×1950)
#   CDN 캐시가 남지 않도록 덮어쓰지 않고 새 파일명으로
page_d = sub_once(r'bio-elixir/concentrate-0275\.jpg', "bio-elixir/concentrate-0500.jpg", page_d)
page_d = sub_once(r'bio-elixir/ritual-morning-wide\.png(" alt="[^"]*") width="1411" height="1950"',
                  r'bio-elixir/ritual-morning-0405.jpg\1 width="1300" height="1950"', page_d)

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


# 이미지 경로: cafe24-admin HTML = CDN 절대경로 그대로 / 미리보기 = 이 폴더 기준 상대경로(../assets/)
#   상대경로라 서버 없이 파일로 열어도(file://) 보인다
PREVIEW_ASSETS = "../assets/"


def to_preview(html):
    # D안 HTML은 <script>가 없다(실제 상세는 스킨이 JS를 불러옴) — 미리보기에는 스킨 대신 직접 붙인다
    if "<script src=" not in html:
        html += "".join(f'\n<script src="/js/module/product/{name}.js?ver={VER}"></script>'
                        for name in ("pdp", "pdp-elixir", "pdp-elixir-proto"))
    html = html.replace(f"{CDN_SRC}bio-elixir/", PREVIEW_ASSETS)
    html = html.replace("/web/src/bio-elixir/", PREVIEW_ASSETS)
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
  <script>/* 미리보기 전용: style 속성 CSS 변수 속 상대경로 url()을 문서 기준 절대 URL로 (변수를 쓰는 스타일시트 기준으로 풀리는 것 방지) */
  document.querySelectorAll('[style*="url(\\'{PREVIEW_ASSETS}"]').forEach(function (el) {{
    el.setAttribute('style', el.getAttribute('style').replace(/url\\('([^']+)'\\)/g, function (m, u) {{ return "url('" + new URL(u, location.href).href + "')"; }}));
  }});</script>
</body>
</html>
"""
    (HERE / f"preview-{slug}.html").write_text(page, encoding="utf-8")

print("built:", [p.name for p in OUT.iterdir()], "+ previews")
