# Sun Veil PDP Design Planning

작성일: 2026-05-04

## 1. 기획 목표

`planning/sun-veil` 원문 콘텐츠를 바탕으로 Sun Veil 제품 상세 페이지를 설계한다. 목표는 다음 두 가지다.

- 정보 전달 효율: 첫 화면과 초반 스크롤에서 "무엇이 다른가", "왜 필요한가", "믿을 수 있는가"를 빠르게 이해시킨다.
- 절제된 각인: 과한 모션보다 섹션 전환, 데이터 강조, 레이어 구조 표현처럼 의미가 있는 인터랙션만 사용한다.

브랜드 톤은 AYROW v3 Crème Surface 원칙을 따른다. 따뜻하고 프리미엄하며, 과학성은 실험실 클리셰가 아니라 구조, 정밀한 수치, 얇은 레이어, 정돈된 표로 드러낸다.

## 2. 단계별 기획 절차 및 실행 결과

| 단계 | 목적 | 실행 결과 |
|---|---|---|
| 1. 자료 수집 | 원문, 인증, 현재 PDP 구조 확인 | 완료. Notion export HTML, FITI 자외선/물성 리포트, Dermatest 리포트, 현재 `product/detail.html` 구조 확인 |
| 2. 주장 분류 | 카피로 쓸 수 있는 주장과 검증 필요 주장을 분리 | 완료. UV/물성/피부 적합성 데이터는 확인, 일부 수치/표현은 정정 또는 검수 필요 |
| 3. 메시지 전략 | 초반 이해, 중반 납득, 후반 확신 구조 수립 | 완료. "필름이 아닌 숨 쉬는 멤브레인"을 핵심 기억 문장으로 설정. 단, 고객은 멤브레인을 모를 수 있으므로 필름=막, 멤브레인=얇은 섬유망으로 먼저 번역 |
| 4. 섹션 IA | 상세 페이지 스크롤 흐름 설계 | 완료. Hero -> Reframing -> Quick FAQ -> Problem -> Use Cases -> How It Works -> Confidence -> FAQ/Spec/CTA |
| 5. 인터랙션 원칙 | 과하지 않은 각인 장치 정의 | 완료. scroll reveal, snap carousel, layer split, metric count-up 정도로 제한 |
| 6. 구현 판단 | Cafe24 구조에 맞는 다음 작업 범위 도출 | 완료. 현재 PDP의 WIP scaffold와 product detail 렌더링 제약 확인 |

## 3. 소스 감사 요약

### 원고 해석 원칙

클라이언트 원고에는 실제 노출 카피, 내부 설명, 편집 코멘트, 섹션 얼개가 함께 섞여 있다. 특히 `01 · HERO SECTION`, `02 · CATEGORY REFRAMING`처럼 `h1` 요소로 작성된 제목은 고객에게 그대로 노출할 웹사이트 문구가 아니라 콘텐츠 구조를 표시하기 위한 내부 얼개로 해석한다.

따라서 상세페이지 설계 기준은 원고의 제목 계층이 아니라 사용자 질문이다.

| 내부 얼개 | 사용자 질문 | 웹사이트에서 해야 할 일 |
|---|---|---|
| HERO SECTION | 이 제품이 뭐지? | 한 문장으로 제품을 정의한다 |
| CATEGORY REFRAMING | 기존 선패치와 뭐가 다르지? | 필름과 멤브레인의 작동 방식 차이를 보여준다 |
| WHY SUN VEIL EXISTS | 왜 나에게 필요하지? | 사용 부위와 일상 문제를 공감시킨다 |
| USE CASES | 언제 쓰면 좋지? | 클라이언트가 작성한 생활 장면을 시각화한다 |
| HOW IT WORKS | 어떻게 보호하고 붙지? | 구조와 사용 방식을 쉽게 설명한다 |
| PROOF / EVIDENCE | 믿을 수 있나? | 시험 자료를 직접 보여주지 않고 안심 정보로 번역한다 |
| FULL FAQ | 내 궁금증이 해결되나? | 클라이언트 질문을 읽기 쉬운 FAQ로 정리한다 |

### 콘텐츠 원문

원문은 `선베일 상세페이지 34e3e64d624c803cb051f434354a8df6.html`에 있으며, 전체 흐름은 다음과 같다.

- Hero: "당신이 붙이고 있던 건 필름입니다. Sun Veil은 숨 쉬는 멤브레인입니다."
- Category Reframing: Film vs Membrane 비교
- Why Sun Veil Exists: Quick FAQ, 문제 상황, At a Glance
- Use Cases: Whereable Beauty, 일상 장면 슬라이더
- Ritual Guide: Ready, Set, Go
- How It Works: 보호 레이어, Moisture-Bonding 밀착
- Technology: Reverse AG Code 포뮬러, 에어로플로우 멤브레인
- Key Experience: Invisible, Aero Flow, Seamless Fit, Gentle Removal
- Confidence: 시험 데이터와 피부 적합성 정보를 고객 언어로 요약
- Full FAQ, Product Spec, CTA

### 확인된 증빙

FITI 자외선차단 테스트 리포트:

- 접수번호: H232-25-40870
- 발급일: 2025-09-30
- 시료명: SUN VEIL
- UV-R 차단율: 96.3%
- UV-A 차단율: 95.3%
- UV-B 차단율: 99.9%
- UPF: 50+
- 시험방법: KS K 0850:2023

FITI 물성 테스트 리포트:

- 접수번호: H232-26-12470
- 발급일: 2026-04-03
- 품명: 에이로우 리버스 AG 코드™ 선베일
- 용도: 홍보용
- 질량: 0.3 g/개, 좌우 한 쌍 기준으로 측정
- 투습도: 12,356 g/(m²·24h)
- 공기투과도: 1.0 미만 mm/s
- 평균 기공 크기: 0.7 μm
- 시험방법: KS K 0594:2021, KS K ISO 9237:1995, ASTM F 316-03(2019)

Dermatest 리포트:

- 보고일: 2026-03-04
- 시험기간: 2026년 1월-2월
- 제품명: AYROW Reverse AG Code™ Sun Veil
- 민감 피부 대상 epicutaneous test: 30명
- safety in-use test: 10명, 1주 1일 1회 얼굴 사용
- 결과: 관련 피부 반응 없음, excellently tolerated
- Sensitive Skin Seal 및 Skin-friendly Material Seal 사용 가능 문구 확인

### 검수 필요 항목

- 원문 일부에는 UV-A 96.4%가 있으나 리포트에는 95.3%로 확인된다. 상세 페이지에는 95.3%를 사용한다.
- 원문에는 1 piece 0.05 g, 상품고시에는 1회분 2매 0.1 g, 물성 리포트에는 좌우 한 쌍 0.3 g으로 서로 다르게 보이는 수치가 있다. 최종 패키지 기준 확정 필요.
- "장시간 부착 가능", "밀착 유지력 검증 완료", "투명도 식별 불가"는 현재 리포트에서 직접 확인되지 않았다. 표현을 완화하거나 별도 근거가 필요하다.
- 비건 인증은 가이드라인 캡처와 언급만 확인된다. Vegan Society 인증서 또는 사용 승인 자료 확인 전에는 보조 문구로만 다룬다.
- FITI 성적서에는 "시료 결과이며 전체 제품 품질을 보증하지 않음", "사전 서면 동의 없이 홍보/광고 용도 사용 불가" 문구가 포함되어 있다. 홍보용 리포트라도 최종 노출 문구와 이미지 사용 범위는 확인해야 한다.
- 본 제품은 상품고시에 "화장품 또는 의약품이 아닌 공산품"으로 명시되어 있다. 효능, 주름, 미백, 시술 후 사용 관련 표현은 법무/RA 검수가 필요하다.
- 브랜드 용어는 `Whearable Beauty`로 정리되어 있으나 원문 일부에는 `Whereable Beauty`가 섞여 있다. 최종 상세페이지에서는 한 표기로 통일한다.
- 시험 화면, 시험성적서 원본, PDF 캡처는 고객-facing 상세페이지에 직접 노출하지 않는다. 수치와 의미만 고객이 이해하기 쉬운 카드, 표, 캡션으로 번역한다.

## 4. 핵심 메시지 전략

### 한 문장 포지셔닝

Sun Veil은 피부를 가두는 필름이 아니라, 보이지 않게 얹히는 숨 쉬는 멤브레인 보호 레이어입니다.

### 사용자가 기억해야 할 세 가지

- Not a film: 기존 선패치의 "막힘" 인식을 멤브레인 구조로 전환한다. 이때 멤브레인을 기술 용어로 바로 제시하지 않고, "필름은 하나의 막 / 멤브레인은 얇은 섬유망"이라는 쉬운 정의에서 시작한다.
- Breathable protection: 0.004 mm 초박막, 0.7 μm 기공, 투습도/공기투과도 데이터로 숨 쉬는 구조를 납득시킨다.
- Proven gentle guard: UPF 50+, UVB 99.9%, Dermatest Excellent로 구매 전 불안을 낮춘다.

### 톤 조정

원문의 공격적인 문장인 "완전히 잘못 보고 있던 겁니다"는 AYROW 톤에는 다소 세다. 다음처럼 바꾸는 편이 좋다.

- 기존: 같은 패치로 보였다면, 완전히 잘못 보고 있던 겁니다.
- 제안: 같은 패치처럼 보여도, 피부 위에서 작동하는 방식은 다릅니다.

## 5. 페이지 정보 구조

### 0. Sticky Quick Navigation

목적: 긴 상세페이지의 위치감을 유지하고, 안심 포인트/FAQ/Spec으로 빠르게 이동하게 한다.

- 항목: Overview, Difference, Use, How it Works, Confidence, FAQ, Spec
- 구현: 기존 `toc-bar` 또는 가벼운 anchor nav 활용
- 인터랙션: 현재 섹션 label 업데이트, 모바일에서는 접히는 dropdown

### 1. Hero

사용자 질문: "이 제품이 대체 뭐지?"

핵심 메시지:

- 당신이 붙이던 건 필름에 가까웠습니다.
- Sun Veil은 피부 위에 얹히는 숨 쉬는 멤브레인입니다.
- 0.004 mm, UPF 50+, Dermatest Excellent를 첫 화면 안에서 확인시킨다.

고객-facing 콘텐츠:

- H1: Reverse AG Code™ Sun Veil
- Lead: 필름처럼 가두지 않고, 멤브레인처럼 숨 쉬게 보호합니다.
- Confidence chips: 0.004 mm / UPF 50+ / UVB 99.9% / Dermatest Excellent

디자인:

- CRÈME 배경 + CIEL 계열 얇은 반투명 레이어
- 제품/착용 이미지가 준비되면 첫 화면의 중심 visual로 사용
- 제품 실물이 작게라도 첫 viewport에 들어와야 한다

인터랙션:

- 첫 진입 시 "Film"이 얇은 선으로 사라지고 "Membrane"이 나타나는 짧은 텍스트 전환
- `prefers-reduced-motion`에서는 정적 표시

### 2. Category Reframing: Film vs Membrane

사용자 질문: "기존 선패치와 뭐가 다른가?"

핵심 메시지: 막는 필름과 숨 쉬는 멤브레인은 피부 위 작동 방식이 다르다.

고객 이해 순서:

1. 필름은 하나의 막으로 피부를 덮는 구조다.
2. 멤브레인은 가느다란 섬유가 얇게 얽힌 구조다.
3. 그래서 Sun Veil의 얇음, 덜 보이는 경험, 공기·습기 흐름 고려가 같은 구조에서 이어진다.

콘텐츠:

| 기존 선패치 | Sun Veil |
|---|---|
| 하나의 면으로 피부를 덮는 필름 구조 | 가느다란 섬유가 얽힌 다공성 멤브레인 구조 |
| 공기 흐름 차단 | 공기와 수분 흐름 유지 |
| 열/습기 정체 | 습기 배출 가능 |
| 장시간 답답함 | 답답함을 줄이는 구조 |

인터랙션:

- 스크롤 진입 시 각 row가 한 줄씩 활성화
- 중앙 divider가 얇은 막에서 섬유 mesh line으로 전환
- hover/click은 설명을 펼치는 정도로 제한

### 3. Before-You-Scroll Quick FAQ

사용자 질문: "구매 전에 바로 걸리는 의심은?"

카드 6개:

- 메이크업 위에 사용해도 되나요? Yes. 메이크업 위에서도 자연스럽게 안착하도록 설계되었습니다.
- 일반 필름형 선패치와 다른가요? Yes. 나노 섬유 기반 멤브레인 구조입니다.
- 점착 성분 없이도 붙나요? Yes. Moisture-Bonding 방식으로 안착합니다.
- 투명한데 자외선 차단이 가능한가요? Yes. 원단 기준 UPF 50+ 시험 결과가 있습니다.
- 민감 피부에도 사용할 수 있나요? Yes. Dermatest 민감 피부 시험에서 Excellent 평가를 받았습니다.
- 티가 나나요? 거의 보이지 않는 방향으로 설계된 0.004 mm 초박막 구조입니다.

인터랙션:

- 모바일: horizontal scroll snap
- 데스크탑: 2열 또는 3열 card grid가 더 효율적이다. 기존 wheel hijack은 사용자가 페이지 스크롤을 잃는 느낌이 생길 수 있어 최소화한다.

### 4. Problem + At a Glance

사용자 질문: "왜 이 부위에 필요하지?"

핵심 메시지: 눈가 아래/광대는 선케어가 먼저 무너지고, 덧바르기 부담이 큰 자리다.

콘텐츠 구조:

- Problem intro: 바르는 선케어만으로 충분하지 않은 순간
- Pain moments: 메이크업, 이동/업무, 땀/유분, 햇살 공간, 예민한 피부 상태
- At a Glance: 메이크업 위 부착, 0.004 mm, 무점착, L/R, 야외 환경, 선크림 위 레이어드

인터랙션:

- 얼굴/광대 zone hotspot visual이 있으면 터치 시 해당 pain point가 짧게 표시
- 이미지가 없으면 checklist형 metric strip으로 대체

### 5. Use Cases: Whereable Beauty

사용자 질문: "언제 쓰는 제품이지?"

핵심 메시지: 햇살을 피하지 않고 일상을 이어가는 뷰티 에이전트.

클라이언트 작성 장면은 삭제하지 않고 editorial slider로 유지한다.

- 오후 2시 창가: 빛이 들어오는 자리를 포기하지 않아도 됩니다.
- 러닝 크루: 하루의 흐름을 멈추지 않는 선케어.
- 테라스 브런치: 햇살을 피하지 않는 선 리추얼.
- 기분 좋은 햇살 산책: 햇살을 그대로 즐기는 시간.
- 멀티태스킹: 무의식의 흐름대로 이어지는 지속적인 케어.
- 드라이브 케어: 빛이 오래 머무는 이동 시간에도 이어지는 보호.
- 예민해진 피부 컨디션: 직접 덧바르는 것이 부담스러운 순간을 위한 보호 레이어. 단, 시술 후 문구는 검수 필요.

인터랙션:

- 카드형 editorial slider
- progress bar만 사용하고, 자동재생은 사용하지 않는다.
- 이미지가 핵심이다. 실제 착용/상황 이미지 없이는 이 섹션의 설득력이 크게 떨어진다.

### 6. Ritual / Usage Guide

사용자 질문: "어떻게 붙이나?"

3단계:

- Ready: 파우치를 열고 L/R 방향을 확인합니다.
- Set: 햇살이 먼저 닿는 광대존에 올리고 가볍게 눌러 안착시킵니다.
- Go: 피부와 하나가 된 듯한 피팅감으로 일상을 이어갑니다.

상품고시 기준 사용법 세부:

- 보호 시트 제거
- 눈 아래 부위에 고르게 부착
- 보호 시트를 관자놀이 쪽부터 수평 방향으로 제거
- 선크림과 함께 사용할 경우 선크림 다음 사용

인터랙션:

- stepper 또는 tab으로 단계별 이미지 전환
- 동영상이 있으면 10초 내 silent loop로 사용

### 7. How It Works

사용자 질문: "어떤 원리로 보호하고 붙나?"

구성:

- How It Protects: 초박막 투명 멤브레인 + 약액층
- How It Bonds: 점착제 없이 Moisture-Bonding으로 안착

인터랙션:

- scroll 진입 시 2-layer diagram이 8-12px 정도만 분리되어 구조를 보여준다.
- 사용자가 클릭하면 각 레이어 설명이 열리는 accordion.
- 무거운 3D 모션은 최종 3D asset이 준비된 뒤 적용한다. 그 전에는 정적 exploded view가 더 좋다.

### 8. Technology

사용자 질문: "기술적으로 믿을 만한가?"

권장 처리:

- 상세 성분 스토리는 너무 빨리 길어지면 정보 효율이 떨어진다.
- Reverse AG Code™ 포뮬러는 "피부 컨디션을 고려한 성분 레이어" 정도로 압축하고, 구체 효능 문구는 검수 후 사용한다.
- 에어로플로우 멤브레인™은 0.004 mm, 0.7 μm, 투습도, 공기투과도와 연결해 구조 중심으로 설명한다.

인터랙션:

- Formula와 Membrane을 tab으로 분리
- 복잡한 성분 설명은 default collapsed

### 9. Confidence / Evidence Digest

사용자 질문: "믿고 써도 되나?"

디자인 관점:

- 고객은 시험성적서를 읽고 싶은 것이 아니라, 제품 선택에 필요한 안심 정보를 빠르게 이해하고 싶다.
- 시험 화면, 시험성적서 원본, PDF 캡처는 노출하지 않는다.
- 내부 근거는 디자이너가 고객 언어로 번역한다. 예: "UVB 99.9%"만 크게 두기보다 "자외선 차단 성능"이라는 의미 단위로 묶는다.

권장 metric groups:

- UV Protection: UVB 99.9%, UVA 95.3%, UVR 96.3%, UPF 50+
- Breathable Structure: 투습도 12,356 g/(m²·24h), 공기투과도 1.0 미만 mm/s, 평균 기공 크기 0.7 μm
- Skin Tolerability: Dermatest Excellent, epicutaneous 30명, in-use 10명, 관련 피부 반응 없음

디자인:

- 수치 card를 과하게 크게 쓰기보다, hairline table + key metric badge 조합
- 인증 seal은 v1에서 생략 가능하다. 쓰더라도 보조 요소로 작게만 둔다.
- 리포트 이미지를 보여주는 대신 "무엇이 확인되었는지"를 카드 제목, 숫자, 짧은 캡션으로 정리한다.

인터랙션:

- 숫자는 섹션 진입 시 한 번만 count-up
- 출처와 시험 기준은 caption으로 바로 붙인다.

### 10. Full FAQ + Product Spec + CTA

사용자 질문: "마지막 의심과 구매 전 정보는?"

FAQ:

- 제품 정의
- 투명하지만 차단되는 이유
- 필름형 선패치와 차이
- 점착제 없는 밀착
- 민감 피부 사용
- UPF와 SPF 차이
- 촉감
- 거울 없이 부착
- 재사용 여부
- 왜 선베일인가

Spec:

- 제품명: 에이로우 리버스 AG 코드™ 선베일
- 구성/중량: 최종 확인 필요
- 피부 타입: 모든 피부 타입
- 사용기한: 제조일로부터 30개월, 개봉 후 즉시 사용
- 제조국: 대한민국
- 기획/판매원: ㈜씽크앤플로우
- 주의사항: 공산품 문구 포함

CTA:

- Headline: 햇살을 포기하지 않는 가장 앞선 방식
- CTA: Sun Veil 경험하기 / 구매하기
- 구매 영역의 `.btn--primary`는 유지하고, surface container로 색상 맥락을 조정한다.

## 6. 인터랙션 원칙

### 사용한다

- 섹션 진입 시 opacity/translate 8-16px reveal
- comparison row highlight
- scroll snap carousel
- layer diagram split
- metric count-up once
- FAQ accordion
- sticky anchor nav

### 피한다

- 긴 parallax
- 자동재생 carousel
- wheel hijack 중심 UX
- 페이지 전체를 막는 modal
- 시험성적서 원본이나 시험 화면 캡처를 상세페이지에 직접 전시하는 방식
- 인증 로고를 과하게 키우는 연출
- 실험실/분자/유리병 같은 generic science motif

### 접근성 및 성능

- `prefers-reduced-motion` 대응
- 모든 anchor/accordion/button에 keyboard focus 제공
- 이미지 lazy loading
- 3D asset은 정적 fallback 필수
- 데이터 수치는 HTML text로 제공하고 이미지 안에만 넣지 않는다.

## 7. 현재 Cafe24 구현 구조에서의 판단

현재 `product/detail.html`은 이미 다음 scaffold를 가지고 있다.

- 상단 상품 구매 영역
- `quick-qna` 수평 FAQ 카드
- `qa-inline` 검색/사이드바 기반 Q&A
- 하단 reviews/Q&A 커뮤니티 영역

주의할 점:

- `{$product_detail}`은 현재 `.product-detail__source` 안에 숨겨져 있고, `js/module/product/product-detail.js`가 여기서 이미지/iframe만 추출해 gallery slide로 만든다. 즉, Cafe24 관리자 상세설명에 긴 HTML narrative를 넣으면 현재 구조에서는 텍스트형 상세 페이지로 자연스럽게 노출되지 않을 수 있다.
- `product/detail.html`에 Sun Veil 전용 narrative를 바로 넣으면 다른 상품에도 영향을 줄 수 있다. 제품 코드 조건, Cafe24 전용 상세설명 슬롯, 또는 별도 product story container 전략이 필요하다.
- 현재 `qa-inline.js` 안에는 원문/리포트와 불일치하거나 근거가 약한 문구가 일부 있다. 예: UVA 96.4%, 투명도 식별 불가, 밀착 유지력 검증 완료, duration claim.
- `product/detail.html` 하단에는 `Scroll preview area — remove before production` 임시 영역이 있어 실제 구현 전 제거해야 한다.

## 8. 권장 구현 방향

### Phase 1. 콘텐츠 확정

- UV-A 수치 95.3%로 정정
- 중량/구성 수치 최종 확정
- 비건 인증 사용 가능 범위 확인
- 고객-facing 시험 문구 사용 가능 범위 확인
- 성분/효능성 표현 법무 검수

### Phase 2. 와이어프레임

- Desktop: 구매 영역 이후 narrative content를 900-1120px 중심 폭으로 구성
- Mobile: sticky quick nav + short cards + accordion 중심
- Figma 또는 HTML prototype에서 Hero, Film vs Membrane, Confidence 3개 핵심 섹션 먼저 검증

### Phase 3. Cafe24 구현

- 공통 PDP를 해치지 않는 product-specific rendering 전략 결정
- 필요한 경우 `css/module/product/product-detail-sun-veil.css`와 `js/module/product/product-detail-sun-veil.js`를 추가
- 신규 CSS/JS를 추가한다면 Cafe24 directive와 load order를 보존
- 기존 `quick-qna`와 `qa-inline`은 재사용하되 카피와 데이터 정정

### Phase 4. QA

- Cafe24 preview에서 `{$product_detail}` 렌더링 방식 확인
- 모바일 375/390/430, desktop 1280/1440 확인
- sticky nav와 구매 CTA 겹침 확인
- 고객-facing 수치, 주석, 시험 기준 대조
- motion reduced 환경 확인

## 9. 다음 산출물

1. 섹션별 wire copy v1
2. 상세 페이지 wireframe spec
3. asset shot list: hero, 착용, 광대존, 사용법 3단계, layer diagram, use case images
4. claim/legal review sheet
5. 구현용 HTML/CSS/JS task breakdown

## 10. 편집형 v1 산출물

모든 정보를 사용하지 않고 핵심 정보만 남기는 방향으로 `sun-veil-pdp-wire-copy-v1.md`를 작성했다.

v1 기준:

- 원문 11개 흐름은 삭제/유지/병합 상태를 표기
- Use Case는 클라이언트 작성 내용을 삭제하지 않고 editorial slider로 유지
- FAQ는 클라이언트 작성 내용을 삭제하지 않고 Quick FAQ와 Full FAQ로 역할 분리
- 성분/효능/시술 후/비건 인증은 검수 전 보류
- 시험 화면과 시험성적서 원본은 노출하지 않고, 고객이 이해하기 쉬운 안심 정보로 재편집
- 첫 3개 섹션에서 제품 정의, 차별점, 신뢰 근거를 이해시키는 구조로 재편집
