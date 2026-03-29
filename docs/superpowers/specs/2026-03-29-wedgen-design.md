# wedgen — 모바일 청첩장 생성기 설계서

## 1. Context

개발자 및 바이브 코더 커플이 로컬에서 구동하여 본인만의 모바일 청첩장을 생성할 수 있는 **무상태(Stateless) GUI 콘솔**. 생성된 정적 리소스(ZIP)는 GitHub Pages, Netlify Drop 등에 바로 배포 가능하다. 프로젝트 오너는 완성 후 템플릿 추가 정도의 유지보수만 수행한다.

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| UI | React + Tailwind CSS + shadcn/ui |
| 이미지 처리 | sharp (WebP 최적화) |
| 빌드 최적화 | terser, html-minifier-terser, clean-css |
| ZIP 아카이빙 | archiver (스트리밍) |
| 언어 | TypeScript |
| 런타임 | Node.js |

## 3. 아키텍처

### 3.1 시스템 구조

```
┌──────────────────────────────────────────────────┐
│              Next.js App (localhost:3000)         │
├──────────────────┬───────────────────────────────┤
│   Console UI     │         API Routes            │
│   (App Router)   │                               │
│                  │  GET  /api/templates           │
│   ● 템플릿 선택   │  POST /api/generate            │
│   ● 동적 폼      │  POST /api/preview             │
│   ● 실시간 미리보기│  POST /api/validate            │
│   ● 빌드 옵션    │                               │
│   ● ZIP 다운로드  │       Build Pipeline           │
│                  │  config주입→sharp→분기→archiver │
├──────────────────┴───────────────────────────────┤
│  /templates/  (순수 HTML/CSS/JS 청첩장 템플릿)    │
│   ├── elegant-classic/                            │
│   ├── modern-minimal/                             │
│   ├── romantic-floral/                            │
│   ├── magazine-style/                             │
│   └── cinematic-scroll/                           │
└──────────────────────────────────────────────────┘
         ↓
   wedding-invitation.zip → 정적 호스팅 배포
```

### 3.2 핵심 데이터 흐름

1. 사용자가 콘솔에서 템플릿 선택 → 동적 폼 입력
2. 입력값이 `window.__WEDGEN_CONFIG__`로 iframe에 실시간 주입 → 미리보기
3. "생성" 클릭 → `/api/generate`에 config + 이미지 전송
4. 서버에서 이미지 변환 → config 주입 → 빌드 모드 분기 → ZIP 스트리밍 다운로드

## 4. 콘솔 UI

### 4.1 페이지 구조

| 경로 | 역할 |
|------|------|
| `/` | 템플릿 갤러리 — 카드 그리드로 템플릿 선택 |
| `/editor/[templateId]` | 편집 워크스페이스 — 2패널 레이아웃 |

### 4.2 편집 워크스페이스 레이아웃

- **좌측 패널 (420px)**: 탭 기반 설정 (기본 정보 / 갤러리 / 예식 정보 / 방명록&RSVP / 스타일) + 섹션 순서 드래그
- **우측 패널 (flex)**: 모바일 디바이스 프레임 내 iframe 실시간 미리보기
- **하단 바**: Tweak/Optimized 빌드 모드 라디오 + ZIP 생성 버튼

### 4.3 동적 폼 렌더링

콘솔 UI는 `schema.json`의 `fields`를 읽어 `FieldRenderer`가 타입별 위젯을 자동 매핑한다:

| 필드 타입 | 위젯 |
|----------|------|
| `text` | 텍스트 입력 |
| `textarea` | 멀티라인 텍스트 |
| `datetime` | 날짜/시간 선택기 |
| `image` | 이미지 업로드 + 미리보기 |
| `image[]` | 다중 이미지 업로드 (드래그 정렬) |
| `select` | 드롭다운 / 라디오 |
| `select[]` | 멀티 체크박스 |
| `url` | URL 입력 + ping 검증 버튼 |
| `latlng` | 위도/경도 입력 (주소 검색 연동 가능) |
| `file` | 파일 업로드 (음악 등) |

## 5. 템플릿 시스템

### 5.1 디렉토리 구조

```
templates/{template-id}/
├── schema.json      ← 커스터마이징 옵션 선언
├── index.html       ← window.__WEDGEN_CONFIG__ 바인딩
├── style.css
├── script.js
├── thumbnail.png    ← 콘솔 갤러리 미리보기용
└── i18n/
    └── ko.json      ← 한국어 UI 텍스트
```

### 5.2 schema.json 구조

```json
{
  "id": "elegant-classic",
  "name": "Elegant Classic",
  "description": "클래식한 세로 스크롤 청첩장",
  "version": "1.0.0",
  "thumbnail": "thumbnail.png",
  "interaction": "scroll",

  "sections": {
    "available": ["hero","greeting","gallery","info","guestbook","rsvp"],
    "defaultOrder": ["hero","greeting","gallery","info","guestbook","rsvp"],
    "required": ["hero","info"]
  },

  "fields": {
    "기본 정보": {
      "groomName":   { "type": "text",     "label": "신랑 이름", "required": true },
      "brideName":   { "type": "text",     "label": "신부 이름", "required": true },
      "weddingDate": { "type": "datetime", "label": "예식 일시", "required": true },
      "greeting":    { "type": "textarea", "label": "인사말", "maxLength": 500 },
      "heroImage":   { "type": "image",    "label": "대표 사진",
                       "accept": ["jpg","png","webp"], "maxSize": "10MB" },
      "couplePhoto": { "type": "image",    "label": "커플 사진 (선택)" }
    },
    "갤러리": {
      "photos": { "type": "image[]", "label": "갤러리 사진", "min": 0, "max": 20 }
    },
    "예식 정보": {
      "venue":     { "type": "text",   "label": "예식장 이름" },
      "address":   { "type": "text",   "label": "주소" },
      "mapType":   { "type": "select", "label": "지도 유형",
                     "options": [
                       { "value": "kakao", "label": "카카오맵" },
                       { "value": "naver", "label": "네이버지도" },
                       { "value": "none",  "label": "지도 없음" }
                     ]},
      "mapCoords": { "type": "latlng",   "label": "좌표" },
      "transport": { "type": "textarea", "label": "교통 안내" },
      "parking":   { "type": "text",     "label": "주차 안내" }
    },
    "방명록 & RSVP": {
      "guestbookUrl": { "type": "url", "label": "방명록 GAS URL", "validate": "ping" },
      "rsvpUrl":      { "type": "url", "label": "RSVP GAS URL",   "validate": "ping" },
      "rsvpFields":   { "type": "select[]", "label": "RSVP 수집 항목",
                        "options": [
                          { "value": "name",     "label": "이름" },
                          { "value": "attending", "label": "참석 여부" },
                          { "value": "guests",    "label": "동행 인원" },
                          { "value": "meal",      "label": "식사 여부" },
                          { "value": "message",   "label": "한마디" }
                        ]}
    },
    "스타일": {
      "colorScheme": { "type": "select", "label": "색상 테마",
                       "optionsFrom": "style.colorSchemes" },
      "fontPair":    { "type": "select", "label": "폰트 조합",
                       "optionsFrom": "style.fonts" },
      "animation":   { "type": "select", "label": "애니메이션 스타일",
                       "options": [
                         { "value": "fade",  "label": "페이드 인" },
                         { "value": "slide", "label": "슬라이드 업" },
                         { "value": "none",  "label": "없음" }
                       ]},
      "bgMusic":     { "type": "file", "label": "배경음악 (선택)",
                       "accept": ["mp3","ogg"], "maxSize": "5MB" }
    }
  },

  "style": {
    "colorSchemes": [
      { "value": "warm-blush", "label": "웜 블러시", "primary": "#d4a373", "bg": "#fefae0" },
      { "value": "classic-navy", "label": "클래식 네이비", "primary": "#1d3557", "bg": "#f1faee" }
    ],
    "fonts": [
      { "value": "pretendard-nanum", "label": "프리텐다드 + 나눔명조" },
      { "value": "wanted-sans-serif", "label": "원티드산스 + 세리프" }
    ],
    "animations": [
      { "value": "fade", "label": "페이드 인" },
      { "value": "slide", "label": "슬라이드 업" },
      { "value": "none", "label": "없음" }
    ]
  },

  "i18n": {
    "defaultLocale": "ko",
    "supported": ["ko"]
  }
}
```

### 5.3 런타임 바인딩 (`window.__WEDGEN_CONFIG__`)

생성된 청첩장의 `index.html` `<head>`에 주입되는 설정 객체:

```json
{
  "template": "elegant-classic",
  "locale": "ko",
  "sectionOrder": ["hero","greeting","gallery","info","rsvp","guestbook"],
  "data": {
    "groomName": "김민수",
    "brideName": "이수진",
    "weddingDate": "2026-05-15T14:00:00+09:00",
    "greeting": "서로 다른 길을 걸어온 두 사람이...",
    "venue": "그랜드볼룸",
    "address": "서울 강남구 ...",
    "mapType": "kakao",
    "mapCoords": { "lat": 37.5012, "lng": 127.0396 },
    "guestbookUrl": "https://script.google.com/macros/s/...",
    "rsvpUrl": "https://script.google.com/macros/s/..."
  },
  "style": {
    "colorScheme": "warm-blush",
    "fontPair": "pretendard-nanum",
    "animation": "fade"
  },
  "assets": {
    "heroImage": "assets/hero.webp",
    "photos": ["assets/gallery-1.webp", "assets/gallery-2.webp"]
  }
}
```

### 5.4 템플릿 인터랙션 유형

각 템플릿은 고유한 인터랙션 패턴을 가질 수 있다:

| 유형 | 설명 | 예시 템플릿 |
|------|------|------------|
| `scroll` | 세로 스크롤 + 스크롤 위치 기반 애니메이션 | Elegant Classic, Romantic Floral |
| `page` | 섹션별 페이지 전환 (swipe/slide) | Modern Minimal |
| `parallax` | 패럴랙스 스크롤 효과 | Cinematic Scroll |

### 5.5 초기 템플릿 5종

| ID | 이름 | 스타일 | 인터랙션 |
|----|------|--------|---------|
| `elegant-classic` | Elegant Classic | 클래식, 따뜻한 톤, 세리프 폰트 | scroll + fade |
| `modern-minimal` | Modern Minimal | 미니멀 타이포, 흑백 베이스 | page + slide |
| `romantic-floral` | Romantic Floral | 플로럴 일러스트, 파스텔 | scroll + fade |
| `magazine-style` | Magazine Style | 매거진 레이아웃, 볼드 타이포 | scroll + reveal |
| `cinematic-scroll` | Cinematic Scroll | 다크 시네마틱, 풀스크린 이미지 | parallax |

## 6. API Routes

### 6.1 GET /api/templates

`/templates` 디렉토리를 스캔하여 모든 템플릿의 메타데이터 목록 반환.

**Response:**
```json
[
  {
    "id": "elegant-classic",
    "name": "Elegant Classic",
    "description": "클래식한 세로 스크롤 청첩장",
    "thumbnail": "/api/templates/elegant-classic/thumbnail",
    "interaction": "scroll"
  }
]
```

### 6.2 POST /api/generate

ZIP 빌드 및 스트리밍 다운로드.

**Request:** `multipart/form-data`
- `config`: JSON string (폼 데이터)
- `buildMode`: `"tweak"` | `"optimized"`
- `templateId`: string
- `images[]`: File[]

**Pipeline:**
1. 입력 검증 (templateId 존재, config vs schema 유효성, 이미지 크기/형식)
2. 이미지 처리: sharp → WebP 변환 (hero: 1200x1600 q85, gallery: 800x800 q80)
3. 설정 주입: `index.html` `<head>`에 `<script>window.__WEDGEN_CONFIG__=...</script>` 삽입
4. 빌드 분기:
   - **Tweak**: HTML/CSS/JS 원본 유지
   - **Optimized**: html-minifier-terser + terser (compress+mangle) + clean-css (level 2)
5. archiver로 ZIP 스트리밍 응답

**Response:** `application/zip` (Content-Disposition: attachment)

### 6.3 POST /api/preview

iframe 미리보기용 데이터 반환. 이미지는 Data URL로 변환하여 포함.

### 6.4 POST /api/validate

GAS URL ping 검증. URL에 GET 요청을 보내 응답 확인.

## 7. 프로젝트 디렉토리 구조

```
wedgen/
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       ← 템플릿 갤러리
│   │   ├── editor/[templateId]/page.tsx   ← 편집 워크스페이스
│   │   └── api/
│   │       ├── templates/route.ts
│   │       ├── generate/route.ts
│   │       ├── preview/route.ts
│   │       └── validate/route.ts
│   ├── components/
│   │   ├── template-gallery/
│   │   │   ├── TemplateCard.tsx
│   │   │   └── TemplateGrid.tsx
│   │   ├── editor/
│   │   │   ├── EditorLayout.tsx
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── PreviewFrame.tsx
│   │   │   ├── SectionOrderer.tsx
│   │   │   ├── BuildBar.tsx
│   │   │   └── fields/
│   │   │       ├── TextField.tsx
│   │   │       ├── TextareaField.tsx
│   │   │       ├── DateTimeField.tsx
│   │   │       ├── ImageField.tsx
│   │   │       ├── ImageArrayField.tsx
│   │   │       ├── SelectField.tsx
│   │   │       ├── UrlField.tsx
│   │   │       ├── LatLngField.tsx
│   │   │       ├── FileField.tsx
│   │   │       └── FieldRenderer.tsx
│   │   └── ui/                            ← shadcn/ui 공통 컴포넌트
│   ├── lib/
│   │   ├── template-scanner.ts
│   │   ├── schema-parser.ts
│   │   ├── config-injector.ts
│   │   ├── image-processor.ts
│   │   ├── build-pipeline.ts
│   │   ├── optimizers.ts
│   │   └── gas-validator.ts
│   └── types/
│       ├── schema.d.ts
│       ├── config.d.ts
│       └── template.d.ts
├── templates/
│   ├── elegant-classic/
│   ├── modern-minimal/
│   ├── romantic-floral/
│   ├── magazine-style/
│   └── cinematic-scroll/
└── public/
```

## 8. 방명록 & RSVP (BYOD)

### 8.1 방명록

- 구글 시트(GAS) 웹 앱 URL을 콘솔에서 입력
- 콘솔에서 URL ping 검증 (`/api/validate`)
- 생성된 청첩장이 해당 URL로 POST 요청 (이름 + 메시지)
- 읽기도 동일 URL로 GET 요청하여 목록 표시

### 8.2 RSVP

- 별도 GAS 웹 앱 URL 입력
- 수집 항목을 스키마에서 선택 (이름, 참석여부, 동행인원, 식사여부, 한마디)
- 생성된 청첩장이 해당 URL로 POST 요청

## 9. i18n

- 초기 버전은 한국어(`ko`)만 지원
- 각 템플릿의 `i18n/` 디렉토리에 로케일별 JSON 파일 배치
- 콘솔 UI 텍스트는 별도의 i18n 시스템 (Next.js 내장 또는 next-intl)
- 확장 시 `i18n/en.json` 추가 + `schema.json`의 `i18n.supported`에 `"en"` 추가

## 10. 빌드 모드

| 모드 | 설명 | 용도 |
|------|------|------|
| **Tweak** | 원본 코드 그대로 (주석, 들여쓰기 유지) | 생성 후 직접 코드 수정하려는 경우 |
| **Optimized** | HTML/CSS/JS 압축 + 난독화 | 바로 배포하려는 경우 |

## 11. 검증 방법

1. **콘솔 UI**: `npm run dev` → `localhost:3000` 접속 → 템플릿 선택 → 폼 입력 → 미리보기 확인
2. **ZIP 생성**: Tweak/Optimized 각각으로 ZIP 다운로드 → 압축 해제 → `index.html` 브라우저에서 열기
3. **이미지 최적화**: ZIP 내 assets 폴더의 이미지가 WebP 형식이고 적절한 크기인지 확인
4. **방명록/RSVP**: GAS URL 연동 → 작성/조회 동작 확인
5. **빌드 모드 분기**: Tweak 모드 ZIP의 코드가 읽기 가능하고, Optimized 모드 ZIP의 코드가 압축/난독화되었는지 확인
6. **반응형**: 생성된 청첩장을 모바일 뷰포트(375px)에서 확인
