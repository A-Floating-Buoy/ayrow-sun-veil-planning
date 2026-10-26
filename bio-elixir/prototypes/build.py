"""BIO Elixir 상세 — 로컬 미리보기 만들기.

Source: ../cafe24-admin/bio-elixir-pdp.html (카페24 상품 상세 설명에 붙여 넣는 원본 — 직접 수정)
Output: preview.html (GitHub 폴더 루트에서 서버를 띄워 연다: python3 -m http.server → /ayrow-sun-veil-planning/bio-elixir/prototypes/preview.html)

Run:  python3 bio-elixir/prototypes/build.py

2026-10-26: A–D 테스트안 생성기를 정리 — D안이 실제 상세가 되어 원본 HTML로 옮기고, 이 스크립트는 미리보기만 만든다.
(이전 생성 로직은 git 기록의 bio-elixir/prototypes/build.py 참고)
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "cafe24-admin" / "bio-elixir-pdp.html"
SKIN = "../../../ayrow-cafe24-skin-2026"  # preview → skin repo (sibling of planning repo)
CDN_SRC = "https://ecimg.cafe24img.com/pg2475b11771033004/ayrow/web/src/"
# 이미지: 원본 HTML = CDN 절대경로 / 미리보기 = 이 폴더 기준 상대경로(../assets/) — 서버 없이 file://로 열어도 보인다
PREVIEW_ASSETS = "../assets/"
CORE = ["fonts/fonts.css", "css/core/tokens.css", "css/core/tokens-ayrow-v3.css", "css/core/typography.css",
        "css/core/base.css", "css/core/layout.css", "css/core/utilities.css"]

html = SOURCE.read_text(encoding="utf-8")
ver = re.search(r"pdp-elixir\.css\?ver=(\d+)", html).group(1)
# 실제 상세는 스킨 product/detail.html이 JS를 불러온다 — 미리보기에는 직접 붙인다
html += "".join(f'\n<script src="/js/module/product/{name}.js?ver={ver}"></script>' for name in ("pdp", "pdp-elixir"))
html = html.replace(f"{CDN_SRC}bio-elixir/", PREVIEW_ASSETS)
html = html.replace("/web/src/sun-veil/", f"{SKIN}/src/sun-veil/")
html = re.sub(r'(href|src)="/(css|js)/', rf'\1="{SKIN}/\2/', html)
head = "\n".join(f'  <link rel="stylesheet" href="{SKIN}/{p}">' for p in CORE)

page = f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BIO Elixir PDP — 미리보기</title>
{head}
  <style>
    body {{ margin: 0; background: #fff; }}
  </style>
</head>
<body>
{html}
  <script>/* 미리보기 전용: style 속성 CSS 변수 속 상대경로 url()을 문서 기준 절대 URL로 (변수를 쓰는 스타일시트 기준으로 풀리는 것 방지) */
  document.querySelectorAll('[style*="url(\\'{PREVIEW_ASSETS}"]').forEach(function (el) {{
    el.setAttribute('style', el.getAttribute('style').replace(/url\\('([^']+)'\\)/g, function (m, u) {{ return "url('" + new URL(u, location.href).href + "')"; }}));
  }});</script>
</body>
</html>
"""
(HERE / "preview.html").write_text(page, encoding="utf-8")
print("built: preview.html")
