# BIO Elixir 상세페이지 — 카페24 등록 (2026-10-20 D안 · 2026-10-26 CSS · JS 한 쌍으로 정리)

이 폴더는 등록용 사본입니다. 원본 HTML은 `bio-elixir/cafe24-admin/bio-elixir-pdp.html`(직접 수정), CSS·JS는 스킨 레포(`ayrow-cafe24-skin-2026`)에 있습니다.
수정이 필요하면 원본에서 고친 뒤 이 폴더로 다시 복사하세요. 로컬 미리보기: `python3 bio-elixir/prototypes/build.py` → `prototypes/preview.html`.

> **2026-10-26 정리:** 테스트안 파일 `pdp-elixir-proto.css` · `pdp-elixir-proto.js`를 `pdp-elixir.css` · `pdp-elixir.js`로 합쳤습니다(A–C 테스트안 · 원본 전용 코드 삭제). 상세 HTML도 proto 링크 · `pdp--proto-d` 클래스가 빠졌으므로 **스킨 파일을 먼저 올리고 → 상세 HTML을 붙여 넣으세요.** 순서가 바뀌면(새 HTML + 예전 스킨) 화면이 깨집니다. 예전 HTML + 새 스킨은 정상입니다.

## 등록 순서

1. **이미지** → 관리자 파일 업로드 `/web/src/bio-elixir/`
   - `03_images/web/src/bio-elixir/` 안의 37개 파일 전부 (같은 이름은 덮어쓰기)
   - 2026-10-26 새 파일: `concentrate-0500.jpg`(Concentrate 사진) · `ritual-morning-0405.jpg` · `ritual-work-0420.jpg` · `ritual-active-0435.jpg` · `ritual-travel-0398.jpg`(Ritual 장면 4개) · `hero-loop-poster.jpg`(히어로 포스터 = loop 영상 첫 프레임 — **빠지면 히어로가 빈 화면**)
   - 이번에 새로 생긴 파일 — 빠지면 화면이 깨집니다
     - `hero-bg-desktop.jpg`, `hero-bg-mobile.jpg` (히어로)
     - `botanical-bottle-water-creme.svg` (Botanical 병 속 정제수)
     - `plant-origin-field-desktop.jpg`, `plant-origin-field-mobile.jpg` (STECHA 들판)
     - `botanical-bottle-water-full.svg` (Botanical 병 정제수 — 2026-10-21 액체 높이 확장)
2. **CSS · JS** → 스킨 파일 같은 경로에 업로드
   - `02_skin/css/module/product/` → `/css/module/product/`
   - `02_skin/js/module/product/` → `/js/module/product/`
   - `02_skin/product/detail.html` → `/product/` (proto JS 로드 줄 삭제)
   - `02_skin/sections/hero-slider.html` → `/sections/` (메인 슬라이더 사진에 `?ver=20261026` — 덮어쓴 사진 캐시 갱신) · `02_skin/src/hero/` → `/src/hero/`
   - 스킨에 남아 있는 `pdp-elixir-proto.css` · `pdp-elixir-proto.js`는 새 HTML을 붙여 넣은 뒤 삭제해도 됩니다(더 이상 불러오지 않음)
   - 상단 띠(헤더) — 2026-10-21 수정안: `Bio Elixir` ™ 삭제 · NEW 배지를 제품명 앞으로 · 배지 색 크렘+블루
     - `02_skin/snippets/header-nav-main.html` · `header-mobile-drawer.html` → `/snippets/`
     - `02_skin/css/layout/header.css` → `/css/layout/` · `02_skin/css/components/nav-mobile.css` → `/css/components/`
3. **상품 상세 HTML** → 상품 관리 > 상세 설명(HTML)
   - `01_html/bio-elixir-pdp.html` 내용 전체를 붙여 넣기
4. 저장 후 PC · 모바일에서 확인 (아래 체크리스트)

## 2026-10-24 수정안 반영 (Dropbox `docs/2026-10-24_엘릭서 상세페이지 수정안`)

| # | 내용 | 반영 |
| --- | --- | --- |
| 1 | 히어로 BIO ELIXIR™ 색 | 한 톤 밝게만: 앤티크 골드 #7d6033 → #8f7040 (`pdp-elixir.css` `--pdp-champagne-gold`) |
| 2 | A NEW WAY TO CONCENTRATE 사진 교체 | 2026-10-26 보정본 `26-10-01_AYROW_0500` → `concentrate-0500.jpg` (1300×1950) |
| 3 | NOW 쿨링 카드 | 수치를 옆 카드 수치와 같은 줄에 · 그래프 윗선 = 사진 윗선 · X축 라벨–주석 간격 = 4 WEEKS 카드 |
| 4 | 통계 주석 시작점 | 모든 그래프(NOW · 24H · 4 WEEKS)에서 Y축 숫자 왼쪽 끝에 맞춤 (`pdp-elixir.js` `alignSig`) |
| 5 | 24H 구분선 | 제목 아래선 = 80 눈금선, 24시간 후 개선율 아래선 = 60 눈금선 (데스크톱 2열, `alignHydration`) |
| 6 | Botanical 병 | 금빛을 한 단계 밝게 · 음영 옅게 · 색이 차오르는 시간 약 8초 → 5초 |
| 7 | 메인 왼쪽 하단 사진 | 크기만 키움(패널 폭 48% · 최대 360px, `css/components/hero-slider.css` → `/css/components/`). 사진은 2026-10-26 보정본 `26-09-30_AYROW_0276_02` → `hero-elixir-bottle-600.jpg/.webp` (`?ver=2026102603` · 0500 → 0276 → 0276_02로 교체) (`02_skin/src/hero/` → 스킨 `/src/hero/`, 덮어쓰기) |
| — | 메인 선반 슬라이드 · MORNING 장면 | 2026-10-26 보정본: `26-09-30_AYROW_0387` → `hero-elixir-shelf-2560.jpg/.webp` (스킨 `/src/hero/`) · `26-09-30_AYROW_0405` → `ritual-morning-0405.jpg` (확대는 1.28배 → 1.06배 · 가운데 기준, `pdp-elixir.css`). `26-09-30_AYROW_0276`은 사용하지 않음 |
| — | Ritual WORK · ACTIVE · TRAVEL · 메인 플랫레이 | 2026-10-26 보정본 2차: `0420` → `ritual-work-0420.jpg` · `hero-elixir-flatlay-1440.jpg/.webp`, `0435` → `ritual-active-0435.jpg`, `0398` → `ritual-travel-0398.jpg` (0500 · 0387 · 0405도 새 보정본으로 다시 만듦) |

## 파일 버전 (HTML의 `?ver=` 값)

| 파일 | 버전 | 이번에 변경 |
| --- | --- | --- |
| `pdp.css` | 20261013000024 | — |
| `pdp-elixir.css` | 20261026000004 | ✓ (proto 합침 · 히어로 loop + 첫 프레임 포스터 · 24H 주석 간격 · 골드 #9c9484 · 주석 삭제) |
| `pdp.js` | 스킨이 불러옴 | — |
| `pdp-elixir.js` | 스킨이 불러옴 | ✓ (proto 합침) |
| `components/hero-slider.css` (메인) | 스킨이 불러옴 | ✓ |

`pdp.css` · `pdp.js`는 바뀌지 않았지만 함께 쓰이므로 같이 넣어 두었습니다.
CSS를 다시 고치면 HTML의 `?ver=` 값도 올려야 브라우저 캐시가 갱신됩니다.

### JS는 상세 HTML이 아니라 스킨이 불러옵니다
- 스킨 `product/detail.html`이 `<!--@js(/js/module/product/pdp.js)-->` · `pdp-elixir.js` 2개를 불러옵니다.
- 상세 HTML 안에 `<script src="/js/...">`를 넣으면 카페24가 이미지 CDN 주소(`ecimg.cafe24img.com/.../js/...`)로 바꿔 **403**이 나므로, 상세 HTML에는 넣지 않습니다.
- JS 파일만 스킨 경로에 올리면 됩니다(2번). 스킨 JS 묶음이 갱신되지 않으면 스킨 편집기에서 한 번 저장해 주세요.

### 상세 영역 폭
실제 상세는 왼쪽 사이드바(240px) 옆 열이라, 화면 폭보다 240px 좁습니다(1440px 화면 → 1200px).
CSS는 화면 폭(vw) 대신 섹션 폭(cqw) 기준으로 계산해 이 폭에 맞춥니다.

## 이미지 경로 규칙

- HTML에는 CDN 절대경로(`https://ecimg.cafe24img.com/pg2475b11771033004/ayrow/web/src/bio-elixir/...`)로 적혀 있습니다.
  상대경로(`/web/...`)로 바꾸면 모바일에서 SVG가 404가 됩니다.
- Botanical 병의 액체 모양 마스크는 CDN이 CORS를 막아 HTML 안에 data URI로 들어 있습니다(별도 파일 없음).

## 히어로 영상 테스트 (URL 파라미터)

상세 URL 뒤에 `hero` 값을 붙이면 히어로 사진 대신 영상이 재생됩니다(파라미터가 없으면 기존 사진 그대로).
상품 URL에 이미 `?`가 있으면 `&hero=...`로 붙입니다.

| 값 | 영상 | 재생 |
| --- | --- | --- |
| `?hero=loop` | `BIO-ELIXIR_hero_loop_4k.mp4` | 무한 반복 |
| `?hero=greenery` | `BIO-ELIXIR_hero_reveal_greenery_4k.mp4` | 한 번 재생 후 마지막 장면 유지 |
| `?hero=sand` | `BIO-ELIXIR_hero_reveal_sand_4k.mp4` | 한 번 재생 후 마지막 장면 유지 |

- 영상 주소: `https://smvt.b-cdn.net/` (BunnyCDN) · 처리: `pdp-elixir.js` `initHeroVideo` · 스타일: `pdp-elixir.css`
- 영상이 재생되기 시작할 때까지는 기존 사진이 보이고, 재생되면 사진에서 영상으로 페이드됩니다.
- 문구 등장: `loop`는 사진 버전과 같이 바로. `greenery`·`sand`는 문구 전체가 영상 25% 지점에서 사진 버전과 같은 순서로 페이드업(영상을 못 띄우면 늦어도 8초 뒤 표시).
- 문구 순서(영상 3종): 리드 문구 → 0.8초 뒤 eyebrow + BIO ELIXIR™ 함께. 버튼은 `greenery`·`sand`에서 영상 후반부(75% 지점)에 따로 등장, `loop`는 0.8초 뒤 바로(영상을 못 띄우면 늦어도 8초 뒤).
- 문구 색: 영상일 때는 링크(블루)까지 모두 흰색. BIO ELIXIR™는 `greenery`·`sand`에서 흰색, `loop`에서는 샴페인 골드. `loop` 버튼은 사진 버전처럼 흰 유리면 + 블루 글자. 링크 pill은 흰 테두리 + 옅은 흰 유리면.
- 문구 위치: 영상일 때는 캡과의 간격을 화면 폭에 비례해 더 벌려 사진 버전보다 위(1920px 화면 약 +67px · 최대 +96px · 모바일 +16px). 1440px 이하 화면은 문구가 이미 상단 여백에 닿아 거의 그대로.
- `loop` 영상 위치: 용기가 문구와 겹치지 않도록 영상을 높이의 8% 아래로 내림(위쪽 빈 띠는 같은 하늘색 그라디언트로 채움).
- 영상은 모든 폭에서 히어로를 꽉 채웁니다(하단 기준 cover) — 모바일(2:3)에서는 좌우가 잘립니다.

## 등록 후 확인

- [ ] 상단 띠: `NEW` 배지 → `Bio Elixir` 순서 (PC 메뉴 · 모바일 드로어)
- [ ] 히어로: PC · 모바일 각각 다른 이미지가 뜨고, 문구가 병 캡 위에 놓임 · 스크롤 시 사진이 느리게 따라옴 · BIO ELIXIR™ 골드(#8f7040) · heading-xl(PC 28px) · ™ 작은 윗첨자
- [ ] Concentrate: CONCENTRATE 멀롯색, 이전보다 빨리 선명해짐 · 라벨(Layerable…) PC 16px
- [ ] 히어로 BIO ELIXIR™: 이전보다 한 톤 밝은 골드(#8f7040)
- [ ] 임상 섹션: NOW → 24H → 4 WEEKS 자동 재생(선택 칸 진행 바 없음) · 탭 hover(PC) · 수치의 %가 숫자와 같은 굵기로 작게 · 통계 주석(Ŧ · ** · * · #)이 Y축 숫자 왼쪽 끝에서 시작
- [ ] NOW(PC): -5.376°C가 30.686% · 91.195%와 같은 줄 · 쿨링 그래프 윗선이 BEFORE/AFTER 사진 윗선과 같음
- [ ] 24H(PC): 왼쪽 구분선 두 개가 그래프 80 · 60 눈금선과 같은 높이
- [ ] 메인: 왼쪽 아래 사진이 이전보다 큼
- [ ] BEFORE/AFTER: 끝까지 끌어도 흰 여백 · 뒤쪽 사진이 안 보이고 경계선이 BEFORE/AFTER 라벨 앞에서 멈춤
- [ ] 민감성 피부 테스트 박스: 제목(왼쪽) · 체크 아이콘(오른쪽 위) · 판정 문구(아래), 모바일은 가운데 정렬
- [ ] 4 WEEKS 카드 4개 수치 · 차트 줄 맞춤, VIEW THE STUDY 시점별 표
- [ ] Botanical: 병 애니메이션(크림 정제수 → oscar 추출물 → 밝은 금빛, 약 5초), 74% · 4% 박스와 연결선
- [ ] STECHA 들판 패럴렉스, Harmony 구체 팝업
- [ ] 모바일 탭: 상단 고정, 다음 탭이 오른쪽에 걸쳐 보임
