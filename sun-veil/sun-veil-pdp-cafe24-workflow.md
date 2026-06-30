# Sun Veil PDP Cafe24 Implementation Workflow

이 문서는 Reverse AG Code™ Sun Veil 제품 상세 페이지를 Cafe24 skin에 구현할 때의 작업 지침이다.

## 구현 목표

- `product/detail.html` 전체 상세 경험은 Figma `475:1588`의 디자인과 내용만 기준으로 전환한다.
- 상단 상품 이미지는 기존 Cafe24 상품 이미지 모듈을 사용한다.
- `product-actions`는 화면 상단 sticky bar로 유지한다.
- `product-actions`에는 제품 구매하기 버튼만 남긴다.
- 제품 구매하기 클릭 시 기존 `product-detail__info`를 구매 드로어로 열고, 이 안에서 옵션 선택 및 구매 절차를 진행한다. 구매 드로어는 cart drawer와 같은 overlay, 420px 우측 패널, `.cart-drawer.is-active` 슬라이드 모션을 따른다.
- 상세 페이지 본문은 Cafe24 관리자 상품 상세설명에 넣는 HTML을 `{$product_detail}`로 불러온다.
- 상세 본문 섹션 메뉴는 `product/detail.html`에 sidebar 영역만 만들어 두고, 관리자 상세설명 내 `data-sv-pdp-section` 기반으로 JS에서 동적 생성한다.
- 좌측 sidebar는 상세 문서 전체의 기본 레이아웃이다. `product-detail__upper`, `product-actions`, `product-detail__lower`는 모두 sidebar 우측 content 컬럼에서 시작한다.

## 파일 구조

- `product/detail.html`
  - CSS/JS 로드 지시문 추가
  - 최상위 `section.product-detail`에 desktop sidebar + content grid 레이아웃 적용
  - 공용 `sidebar-nav`와 모바일 `toc-bar` 영역을 `product-detail__upper`보다 먼저 배치
  - sticky `product-actions` 추가
  - `product-detail__lower`에 `{$product_detail}` 렌더링 영역 추가
  - `product-detail__info`를 구매 드로어 마크업으로 감싼다
- `css/module/product/product-detail.css`
  - product-actions sticky bar
  - 구매 드로어
  - 전체 PDP sidebar/content layout
- `css/module/product/sun-veil-pdp.css`
  - Figma에서 확인된 Sun Veil 상세 컨텐츠 섹션 스타일
- `js/module/product/product-detail.js`
  - 구매 드로어 open/close
  - 하단 sticky CTA footer/surface 상태 관리
- `js/module/product/product-story.js`
  - 상세 섹션 navigation 자동 생성
  - 공용 `SidebarNav` / `TocBar` 재초기화
  - 스토리형 상세 컨텐츠에 필요한 swiper, reveal, count, scroll/highlight, video, FAQ 인터랙션 적용
- `planning/sun-veil/cafe24-admin/sun-veil-pdp-figma-sequence.html`
  - Cafe24 관리자 상품 상세설명에 복사 붙여넣을 HTML 조각
  - CSS/JS inline 금지

## 관리자 상세설명 마크업 규칙

- 최상위는 `<div class="sv-pdp" data-sv-pdp>`로 시작한다.
- 각 섹션은 반드시 아래 속성을 가진다.
  - `class="sv-pdp-section"`
  - `data-sv-pdp-section="섹션-키"`
  - `data-sv-pdp-nav-title="사이드바 표시명"`
- 섹션 ID는 직접 지정해도 되고, 없으면 JS가 자동 생성한다.
- 섹션 레이아웃은 두 타입만 사용한다.
  - Full bleed: `class="sv-pdp-section sv-pdp-section--full"` + `data-sv-pdp-layout="full"`
  - 기본 본문: `class="sv-pdp-section sv-pdp-section--contained"` + `data-sv-pdp-layout="container"` + 내부 `<div class="container container--md">`
- 이미지는 Figma asset 경로가 Cafe24에 업로드되기 전까지 `.sv-pdp-placeholder`로 처리한다.
- Cafe24 관리자 입력 HTML에는 `<style>` 또는 `<script>`를 넣지 않는다.
- 관리자 입력 HTML 문구와 섹션은 Figma에서 확인된 내용만 사용한다. 이전 기획안, 로컬 prototype 문구, 임시 카피는 섞지 않는다.

## 현재 구현 범위

- Figma `475:1588` 화면 표시 순서 기준으로 관리자 입력 HTML을 구성한다.
- 01 Hero
- 02 Opening Visual
- 03 At a Glance
- 04 Why This Zone
- 05 When
- 06 Film vs Membrane
- 07 Usage Guide

시안 확정 전 이미지/비디오는 `.sv-pdp-placeholder`로 유지하고, 실제 asset 경로가 확정되면 해당 섹션 내부만 교체한다. 이후 섹션은 Figma에서 화면과 카피가 확인되는 순서대로만 추가한다.

## 디자인 원칙

- 기존 AYROW v3 token contract를 우선 사용한다.
- BLEU는 브랜드/기술 신뢰, CRÈME은 햇빛/피부 온기, CIEL은 통기/멤브레인 맥락에 쓴다.
- 카드 사용은 정보 단위가 명확할 때만 사용한다.
- 스펙 나열은 피하고, 대표 메시지와 핵심 수치가 먼저 읽히도록 구성한다.
- 상세 본문은 full-bleed 섹션과 `container--md` 기본 섹션을 섞어 구성한다.
- 상세 본문 기본 텍스트 컬러는 heading 요소를 포함해 BLEU(`--primitive-bleu`)를 사용한다.
- 반응형은 desktop sidebar + content / mobile toc-bar + 1-column을 기본으로 한다.
- 데스크톱 sidebar 사용 경험은 `/reverse-ag-code/index.html`의 `sidebar-nav sidebar-nav--sticky` 패턴과 동일하게 유지한다.
- 모바일 목차는 공용 `toc-bar`가 desktop sidebar 메뉴를 복제해 표시한다.

## 검증 체크리스트

- `product/detail.html`의 Cafe24 지시문이 보존되어 있는지 확인한다.
- `{$product_detail}`은 `product-detail__lower`에서 렌더링되는지 확인한다.
- `제품 구매하기` 클릭 시 구매 드로어가 열리는지 확인한다.
- 드로어 안에서 옵션 선택, 장바구니, 구매하기 버튼이 표시되는지 확인한다.
- `data-sv-pdp-section` 섹션이 sidebar에 자동 생성되는지 확인한다.
- desktop sidebar 접기/펼치기와 scroll-spy가 `/reverse-ag-code/index.html`과 같은 방식으로 동작하는지 확인한다.
- 모바일에서 `toc-bar` 드롭다운 목차가 자동 생성되는지 확인한다.
- Figma에서 확인되지 않은 기획안/prototype 문구가 관리자 상세설명 HTML에 남아 있지 않은지 확인한다.
