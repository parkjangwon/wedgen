# wedgen

로컬에서 실행해 모바일 청첩장 정적 ZIP을 생성하는 GUI 콘솔입니다.  
템플릿 선택, 동적 폼 입력, 실시간 미리보기, 이미지 최적화, ZIP 빌드까지 한 흐름으로 처리하며, 결과물은 GitHub Pages나 Netlify Drop 같은 정적 호스팅에 바로 배포할 수 있습니다.

## 주요 기능

- 5개 청첩장 템플릿 제공
  - `우아한 클래식`
  - `모던 미니멀`
  - `로맨틱 플로럴`
  - `매거진 스타일`
  - `시네마틱 스크롤`
- 템플릿 `schema.json` 기반 동적 폼 렌더링
- 모바일 프레임 iframe 실시간 미리보기
- `Tweak` / `Optimized` 빌드 모드 지원
- `sharp` 기반 이미지 WebP 변환
- `archiver` 기반 ZIP 생성
- GAS URL 검증 API 제공

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- sharp
- archiver
- terser
- html-minifier-terser
- clean-css
- Vitest

## 실행 방법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열면 템플릿 갤러리가 표시됩니다.  
포트가 이미 사용 중이면 Next.js가 다른 포트로 자동 실행합니다.

### 3. 운영 빌드

```bash
pnpm build
pnpm start
```

## 개발 명령어

```bash
pnpm dev
pnpm lint
pnpm test
pnpm test:watch
pnpm build
```

## 사용 흐름

1. 홈 화면에서 템플릿을 선택합니다.
2. 에디터에서 이름, 일정, 인사말, 장소, RSVP, 스타일, 이미지 등을 입력합니다.
3. 오른쪽 미리보기 프레임에서 결과를 실시간으로 확인합니다.
4. `Tweak` 또는 `Optimized` 모드를 선택합니다.
5. `ZIP 생성` 버튼으로 정적 산출물을 다운로드합니다.

## 빌드 모드

### `Tweak`

- HTML/CSS/JS를 사람이 수정하기 쉬운 형태로 유지합니다.
- 생성 후 직접 코드 수정을 염두에 둔 모드입니다.

### `Optimized`

- HTML/CSS/JS를 압축합니다.
- 바로 배포 가능한 결과물을 만들 때 적합합니다.

## 템플릿 시스템

각 템플릿은 `templates/{template-id}/` 디렉토리에 독립적으로 존재합니다.

```text
templates/{template-id}/
├── schema.json
├── index.html
├── style.css
├── script.js
├── thumbnail.svg
└── i18n/
    └── ko.json
```

런타임 설정은 생성된 HTML에 `window.__WEDGEN_CONFIG__` 형태로 주입됩니다.

## API 개요

- `GET /api/templates`
  - 템플릿 메타데이터 목록 반환
- `GET /api/templates/[id]/thumbnail`
  - 템플릿 썸네일 반환
- `POST /api/preview`
  - 미리보기용 HTML 생성
- `POST /api/validate`
  - GAS URL 접근 가능 여부 검증
- `POST /api/generate`
  - 정적 ZIP 생성 후 다운로드 응답

## 프로젝트 구조

```text
src/
├── app/
│   ├── api/
│   ├── editor/[templateId]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── editor/
│   ├── template-gallery/
│   └── ui/
├── lib/
│   ├── build-pipeline.ts
│   ├── config-injector.ts
│   ├── gas-validator.ts
│   ├── image-processor.ts
│   ├── optimizers.ts
│   ├── schema-parser.ts
│   ├── template-scanner.ts
│   └── __tests__/
└── types/
```

## 참고 문서

- 설계서: [docs/superpowers/specs/2026-03-29-wedgen-design.md](/Users/pjw/dev/project/wedgen/docs/superpowers/specs/2026-03-29-wedgen-design.md)
- 구현 계획: [docs/superpowers/plans/2026-03-29-wedgen-implementation.md](/Users/pjw/dev/project/wedgen/docs/superpowers/plans/2026-03-29-wedgen-implementation.md)

## 현재 구현 상태

- 프로젝트 스캐폴딩 완료
- 템플릿 스캐너/스키마 파서 구현 완료
- 이미지 처리 및 ZIP 빌드 파이프라인 구현 완료
- 템플릿 API 및 검증 API 구현 완료
- 홈 갤러리 및 에디터 UI 구현 완료
- 5개 기본 템플릿 구성 완료
- `lint`, `test`, `build` 통과

## 검증

아래 명령으로 기본 검증을 수행할 수 있습니다.

```bash
pnpm lint
pnpm test
pnpm build
```
