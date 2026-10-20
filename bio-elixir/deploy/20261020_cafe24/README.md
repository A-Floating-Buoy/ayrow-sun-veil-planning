# BIO Elixir 상세페이지 — 카페24 등록 (2026-10-20, D안 기준)

이 폴더는 등록용 사본입니다. 원본은 `bio-elixir/prototypes/build.py`로 만들고, CSS·JS는 스킨 레포(`ayrow-cafe24-skin-2026`)에 있습니다.
수정이 필요하면 원본에서 고친 뒤 이 폴더를 다시 만드세요.

## 등록 순서

1. **이미지** → 관리자 파일 업로드 `/web/src/bio-elixir/`
   - `03_images/web/src/bio-elixir/` 안의 30개 파일 전부 (같은 이름은 덮어쓰기)
   - 이번에 새로 생긴 파일 — 빠지면 화면이 깨집니다
     - `hero-bg-desktop.jpg`, `hero-bg-mobile.jpg` (히어로)
     - `botanical-bottle-water-creme.svg` (Botanical 병 속 정제수)
     - `plant-origin-field-desktop.jpg`, `plant-origin-field-mobile.jpg` (STECHA 들판)
2. **CSS · JS** → 스킨 파일 같은 경로에 업로드
   - `02_skin/css/module/product/` → `/css/module/product/`
   - `02_skin/js/module/product/` → `/js/module/product/`
3. **상품 상세 HTML** → 상품 관리 > 상세 설명(HTML)
   - `01_html/bio-elixir-pdp.html` 내용 전체를 붙여 넣기
4. 저장 후 PC · 모바일에서 확인 (아래 체크리스트)

## 파일 버전 (HTML의 `?ver=` 값)

| 파일 | 버전 | 이번에 변경 |
| --- | --- | --- |
| `pdp.css` | 20261013000024 | — |
| `pdp-elixir.css` | 20261020000070 | ✓ |
| `pdp-elixir-proto.css` | 20261020000077 | ✓ |
| `pdp.js` | 스킨이 불러옴 | — |
| `pdp-elixir.js` | 스킨이 불러옴 | ✓ |
| `pdp-elixir-proto.js` | 스킨이 불러옴 | ✓ |

`pdp.css` · `pdp.js`는 바뀌지 않았지만 함께 쓰이므로 같이 넣어 두었습니다.
CSS를 다시 고치면 HTML의 `?ver=` 값도 올려야 브라우저 캐시가 갱신됩니다.

### JS는 상세 HTML이 아니라 스킨이 불러옵니다
- 스킨 `product/detail.html`이 `<!--@js(/js/module/product/pdp.js)-->` 등 3개를 이미 불러옵니다.
- 상세 HTML 안에 `<script src="/js/...">`를 넣으면 카페24가 이미지 CDN 주소(`ecimg.cafe24img.com/.../js/...`)로 바꿔 **403**이 나므로, 상세 HTML에는 넣지 않습니다.
- JS 파일만 스킨 경로에 올리면 됩니다(2번). 스킨 JS 묶음이 갱신되지 않으면 스킨 편집기에서 한 번 저장해 주세요.

### 상세 영역 폭
실제 상세는 왼쪽 사이드바(240px) 옆 열이라, 화면 폭보다 240px 좁습니다(1440px 화면 → 1200px).
D안 CSS는 화면 폭(vw) 대신 섹션 폭(cqw) 기준으로 계산해 이 폭에 맞춥니다.

## 이미지 경로 규칙

- HTML에는 CDN 절대경로(`https://ecimg.cafe24img.com/pg2475b11771033004/ayrow/web/src/bio-elixir/...`)로 적혀 있습니다.
  상대경로(`/web/...`)로 바꾸면 모바일에서 SVG가 404가 됩니다.
- Botanical 병의 액체 모양 마스크는 CDN이 CORS를 막아 HTML 안에 data URI로 들어 있습니다(별도 파일 없음).

## 등록 후 확인

- [ ] 히어로: PC · 모바일 각각 다른 이미지가 뜨고, 문구가 병 캡 위에 놓임 · 스크롤 시 사진이 느리게 따라옴
- [ ] 임상 섹션: NOW → 24H → 4 WEEKS 자동 재생, 선택 칸 진행 바 · 탭 hover(PC)
- [ ] 4 WEEKS 카드 4개 수치 · 차트 줄 맞춤, VIEW THE STUDY 시점별 표
- [ ] Botanical: 병 애니메이션(크림 정제수 → oscar 추출물 → 금빛), 74% · 4% 박스와 연결선
- [ ] STECHA 들판 패럴렉스, Harmony 구체 팝업
- [ ] 모바일 탭: 상단 고정, 다음 탭이 오른쪽에 걸쳐 보임
