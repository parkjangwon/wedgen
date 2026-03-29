# wedgen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first mobile wedding invitation generator that outputs static ZIP files deployable to GitHub Pages / Netlify.

**Architecture:** Next.js App Router serves a console UI (template gallery + editor with live preview) and API routes for ZIP generation. Templates are pure HTML/CSS/JS directories with a JSON schema that drives dynamic form generation. The build pipeline reads templates, injects config via `window.__WEDGEN_CONFIG__`, optimizes images with sharp, and streams a ZIP archive.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, sharp, archiver, terser, html-minifier-terser, clean-css

**Spec:** `docs/superpowers/specs/2026-03-29-wedgen-design.md`

---

## File Structure

### Types (`src/types/`)
| File | Responsibility |
|------|---------------|
| `schema.ts` | `TemplateSchema`, `FieldDefinition`, `SectionConfig`, `StyleConfig` types |
| `config.ts` | `WedgenConfig` — the runtime config injected into templates |
| `template.ts` | `TemplateMeta` — lightweight metadata for gallery listing |

### Core Library (`src/lib/`)
| File | Responsibility |
|------|---------------|
| `template-scanner.ts` | Reads `/templates` directory, returns `TemplateMeta[]` |
| `schema-parser.ts` | Parses + validates `schema.json`, resolves `optionsFrom` refs |
| `config-injector.ts` | Injects `__WEDGEN_CONFIG__` script tag into template HTML |
| `image-processor.ts` | sharp-based WebP conversion with size presets |
| `optimizers.ts` | terser / html-minifier-terser / clean-css wrappers |
| `build-pipeline.ts` | Orchestrates generate flow: validate → images → inject → optimize → zip |
| `gas-validator.ts` | Pings a GAS URL to verify reachability |

### API Routes (`src/app/api/`)
| File | Responsibility |
|------|---------------|
| `templates/route.ts` | `GET` — list all templates |
| `templates/[id]/thumbnail/route.ts` | `GET` — serve template thumbnail image |
| `generate/route.ts` | `POST` — build + stream ZIP |
| `validate/route.ts` | `POST` — ping GAS URL |

### Console UI Components (`src/components/`)
| File | Responsibility |
|------|---------------|
| `template-gallery/TemplateCard.tsx` | Single template preview card |
| `template-gallery/TemplateGrid.tsx` | Grid of template cards |
| `editor/EditorLayout.tsx` | 2-panel layout (config + preview + build bar) |
| `editor/ConfigPanel.tsx` | Tabbed form panels, renders fields per tab |
| `editor/PreviewFrame.tsx` | Mobile device frame with iframe |
| `editor/SectionOrderer.tsx` | Drag-to-reorder section list |
| `editor/BuildBar.tsx` | Tweak/Optimized toggle + generate button |
| `editor/fields/FieldRenderer.tsx` | Maps field type → widget component |
| `editor/fields/TextField.tsx` | `text` field widget |
| `editor/fields/TextareaField.tsx` | `textarea` field widget |
| `editor/fields/DateTimeField.tsx` | `datetime` field widget |
| `editor/fields/ImageField.tsx` | Single `image` upload widget |
| `editor/fields/ImageArrayField.tsx` | Multi-`image[]` upload widget |
| `editor/fields/SelectField.tsx` | `select` dropdown widget |
| `editor/fields/MultiSelectField.tsx` | `select[]` checkbox group widget |
| `editor/fields/UrlField.tsx` | `url` input + validate button widget |
| `editor/fields/LatLngField.tsx` | `latlng` coordinate input widget |
| `editor/fields/FileField.tsx` | `file` upload widget |

### Pages (`src/app/`)
| File | Responsibility |
|------|---------------|
| `layout.tsx` | Root layout with global styles |
| `page.tsx` | Home — template gallery |
| `editor/[templateId]/page.tsx` | Editor workspace |

### Templates (`templates/`)
Each template is a self-contained directory with `schema.json`, `index.html`, `style.css`, `script.js`, `thumbnail.png`, `i18n/ko.json`.

---

## Phase 1: Project Foundation

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/pjw/dev/project/wedgen
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Expected: Project scaffolded with `src/app/` directory structure, `package.json`, etc.

- [ ] **Step 2: Install core dependencies**

Run:
```bash
npm install sharp archiver terser html-minifier-terser clean-css
npm install -D @types/archiver @types/clean-css
```

- [ ] **Step 3: Install shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```

Select defaults (New York style, Zinc, CSS variables). This creates `components.json` and `src/lib/utils.ts`.

- [ ] **Step 4: Add shadcn/ui components we'll need**

Run:
```bash
npx shadcn@latest add button input label tabs card select checkbox radio-group textarea badge separator
```

- [ ] **Step 5: Add .gitignore entries**

Append to `.gitignore`:
```
.superpowers/
```

- [ ] **Step 6: Verify dev server runs**

Run:
```bash
npm run dev
```

Expected: Server starts on `localhost:3000` without errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, and core deps"
```

---

### Task 2: Define TypeScript Types

**Files:**
- Create: `src/types/schema.ts`
- Create: `src/types/config.ts`
- Create: `src/types/template.ts`

- [ ] **Step 1: Create schema types**

Create `src/types/schema.ts`:

```typescript
export type FieldType =
  | "text"
  | "textarea"
  | "datetime"
  | "image"
  | "image[]"
  | "select"
  | "select[]"
  | "url"
  | "latlng"
  | "file";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ColorSchemeOption extends SelectOption {
  primary: string;
  bg: string;
}

export interface FieldDefinition {
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  accept?: string[];
  maxSize?: string;
  min?: number;
  max?: number;
  options?: SelectOption[];
  optionsFrom?: string;
  validate?: "ping";
  description?: string;
}

export interface SectionConfig {
  available: string[];
  defaultOrder: string[];
  required: string[];
}

export interface StyleConfig {
  colorSchemes: ColorSchemeOption[];
  fonts: SelectOption[];
  animations: SelectOption[];
}

export interface I18nConfig {
  defaultLocale: string;
  supported: string[];
}

export type InteractionType = "scroll" | "page" | "parallax";

export interface TemplateSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  thumbnail: string;
  interaction: InteractionType;
  sections: SectionConfig;
  fields: Record<string, Record<string, FieldDefinition>>;
  style: StyleConfig;
  i18n: I18nConfig;
}
```

- [ ] **Step 2: Create config types**

Create `src/types/config.ts`:

```typescript
export interface LatLng {
  lat: number;
  lng: number;
}

export interface WedgenConfigData {
  groomName: string;
  brideName: string;
  weddingDate: string;
  greeting?: string;
  venue?: string;
  address?: string;
  mapType?: "kakao" | "naver" | "none";
  mapCoords?: LatLng;
  transport?: string;
  parking?: string;
  guestbookUrl?: string;
  rsvpUrl?: string;
  rsvpFields?: string[];
  [key: string]: unknown;
}

export interface WedgenConfigStyle {
  colorScheme: string;
  fontPair: string;
  animation: string;
}

export interface WedgenConfigAssets {
  heroImage?: string;
  couplePhoto?: string;
  photos?: string[];
  bgMusic?: string;
  [key: string]: unknown;
}

export interface WedgenConfig {
  template: string;
  locale: string;
  sectionOrder: string[];
  data: WedgenConfigData;
  style: WedgenConfigStyle;
  assets: WedgenConfigAssets;
}
```

- [ ] **Step 3: Create template metadata type**

Create `src/types/template.ts`:

```typescript
import type { InteractionType } from "./schema";

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  interaction: InteractionType;
}
```

- [ ] **Step 4: Create barrel export**

Create `src/types/index.ts`:

```typescript
export * from "./schema";
export * from "./config";
export * from "./template";
```

- [ ] **Step 5: Verify types compile**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions for schema, config, and template"
```

---

## Phase 2: Template System & First Template

### Task 3: Template Scanner

**Files:**
- Create: `src/lib/template-scanner.ts`
- Create: `src/lib/__tests__/template-scanner.test.ts`

- [ ] **Step 1: Install test framework**

Run:
```bash
npm install -D vitest @vitejs/plugin-react
```

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/__tests__/template-scanner.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { scanTemplates } from "../template-scanner";
import path from "path";

describe("scanTemplates", () => {
  it("returns metadata for all templates in the directory", async () => {
    const templatesDir = path.resolve(process.cwd(), "templates");
    const templates = await scanTemplates(templatesDir);

    expect(templates.length).toBeGreaterThan(0);

    const first = templates[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("description");
    expect(first).toHaveProperty("thumbnail");
    expect(first).toHaveProperty("interaction");
  });

  it("returns empty array for non-existent directory", async () => {
    const templates = await scanTemplates("/nonexistent/path");
    expect(templates).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-scanner.test.ts`
Expected: FAIL — `scanTemplates` not found.

- [ ] **Step 4: Write template scanner implementation**

Create `src/lib/template-scanner.ts`:

```typescript
import fs from "fs/promises";
import path from "path";
import type { TemplateMeta } from "@/types";

export async function scanTemplates(
  templatesDir: string
): Promise<TemplateMeta[]> {
  let entries: string[];
  try {
    const dirEntries = await fs.readdir(templatesDir, { withFileTypes: true });
    entries = dirEntries
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }

  const templates: TemplateMeta[] = [];

  for (const dir of entries) {
    const schemaPath = path.join(templatesDir, dir, "schema.json");
    try {
      const raw = await fs.readFile(schemaPath, "utf-8");
      const schema = JSON.parse(raw);
      templates.push({
        id: schema.id,
        name: schema.name,
        description: schema.description,
        thumbnail: schema.thumbnail,
        interaction: schema.interaction,
      });
    } catch {
      // skip directories without valid schema.json
    }
  }

  return templates;
}
```

- [ ] **Step 5: Create minimal test template for scanner test**

Create `templates/elegant-classic/schema.json` (full schema — this is the real schema for this template):

```json
{
  "id": "elegant-classic",
  "name": "Elegant Classic",
  "description": "클래식한 ���로 스크롤 청첩장",
  "version": "1.0.0",
  "thumbnail": "thumbnail.png",
  "interaction": "scroll",
  "sections": {
    "available": ["hero", "greeting", "gallery", "info", "guestbook", "rsvp"],
    "defaultOrder": ["hero", "greeting", "gallery", "info", "guestbook", "rsvp"],
    "required": ["hero", "info"]
  },
  "fields": {
    "기본 정보": {
      "groomName": { "type": "text", "label": "신랑 이름", "required": true },
      "brideName": { "type": "text", "label": "신부 이름", "required": true },
      "weddingDate": { "type": "datetime", "label": "예식 일시", "required": true },
      "greeting": { "type": "textarea", "label": "인사말", "maxLength": 500, "placeholder": "두 사람의 이야기를 적어주세요..." },
      "heroImage": { "type": "image", "label": "대표 사진", "accept": ["jpg", "png", "webp"], "maxSize": "10MB" },
      "couplePhoto": { "type": "image", "label": "커플 사진 (선택)" }
    },
    "갤러리": {
      "photos": { "type": "image[]", "label": "갤러리 사진", "min": 0, "max": 20, "description": "최대 20장, 각 10MB 이하" }
    },
    "예식 정보": {
      "venue": { "type": "text", "label": "예식장 이름" },
      "address": { "type": "text", "label": "주소" },
      "mapType": {
        "type": "select",
        "label": "지도 유형",
        "options": [
          { "value": "kakao", "label": "카카오맵" },
          { "value": "naver", "label": "네이버지도" },
          { "value": "none", "label": "지도 없음" }
        ]
      },
      "mapCoords": { "type": "latlng", "label": "좌표" },
      "transport": { "type": "textarea", "label": "교통 안내" },
      "parking": { "type": "text", "label": "주차 안내" }
    },
    "방명록 & RSVP": {
      "guestbookUrl": { "type": "url", "label": "방명록 GAS URL", "validate": "ping", "description": "구글 시트 �� 앱 URL" },
      "rsvpUrl": { "type": "url", "label": "RSVP GAS URL", "validate": "ping" },
      "rsvpFields": {
        "type": "select[]",
        "label": "RSVP 수집 항목",
        "options": [
          { "value": "name", "label": "이름" },
          { "value": "attending", "label": "참석 여부" },
          { "value": "guests", "label": "동행 인원" },
          { "value": "meal", "label": "식사 여부" },
          { "value": "message", "label": "한마디" }
        ]
      }
    },
    "스타일": {
      "colorScheme": { "type": "select", "label": "색상 테마", "optionsFrom": "style.colorSchemes" },
      "fontPair": { "type": "select", "label": "폰트 조합", "optionsFrom": "style.fonts" },
      "animation": {
        "type": "select",
        "label": "애니메이션 스타일",
        "options": [
          { "value": "fade", "label": "페이드 인" },
          { "value": "slide", "label": "슬라이드 업" },
          { "value": "none", "label": "없음" }
        ]
      },
      "bgMusic": { "type": "file", "label": "배경음악 (선택)", "accept": ["mp3", "ogg"], "maxSize": "5MB" }
    }
  },
  "style": {
    "colorSchemes": [
      { "value": "warm-blush", "label": "웜 블러시", "primary": "#d4a373", "bg": "#fefae0" },
      { "value": "classic-navy", "label": "클래식 네이비", "primary": "#1d3557", "bg": "#f1faee" },
      { "value": "sage-green", "label": "세이지 그린", "primary": "#606c38", "bg": "#fefae0" }
    ],
    "fonts": [
      { "value": "pretendard-nanum", "label": "프리텐다드 + 나눔명조" },
      { "value": "wanted-sans-serif", "label": "원티드산스 + 세리프" },
      { "value": "noto-serif", "label": "Noto Serif KR" }
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

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-scanner.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/lib/ templates/elegant-classic/schema.json package.json package-lock.json
git commit -m "feat: add template scanner with tests and elegant-classic schema"
```

---

### Task 4: Schema Parser

**Files:**
- Create: `src/lib/schema-parser.ts`
- Create: `src/lib/__tests__/schema-parser.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/schema-parser.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseSchema, resolveFieldOptions } from "../schema-parser";
import path from "path";

describe("parseSchema", () => {
  it("parses a valid schema.json file", async () => {
    const schemaPath = path.resolve(
      process.cwd(),
      "templates/elegant-classic/schema.json"
    );
    const schema = await parseSchema(schemaPath);

    expect(schema.id).toBe("elegant-classic");
    expect(schema.name).toBe("Elegant Classic");
    expect(schema.sections.available).toContain("hero");
    expect(schema.fields["기본 정보"]).toBeDefined();
    expect(schema.fields["기본 정보"].groomName.type).toBe("text");
  });

  it("throws for invalid path", async () => {
    await expect(parseSchema("/nonexistent/schema.json")).rejects.toThrow();
  });
});

describe("resolveFieldOptions", () => {
  it("resolves optionsFrom references to style config", async () => {
    const schemaPath = path.resolve(
      process.cwd(),
      "templates/elegant-classic/schema.json"
    );
    const schema = await parseSchema(schemaPath);
    const resolved = resolveFieldOptions(schema);

    const colorField = resolved.fields["스타일"].colorScheme;
    expect(colorField.options).toBeDefined();
    expect(colorField.options!.length).toBeGreaterThan(0);
    expect(colorField.options![0].value).toBe("warm-blush");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/schema-parser.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write schema parser implementation**

Create `src/lib/schema-parser.ts`:

```typescript
import fs from "fs/promises";
import type { TemplateSchema, FieldDefinition, SelectOption } from "@/types";

export async function parseSchema(schemaPath: string): Promise<TemplateSchema> {
  const raw = await fs.readFile(schemaPath, "utf-8");
  const schema: TemplateSchema = JSON.parse(raw);
  return schema;
}

export function resolveFieldOptions(schema: TemplateSchema): TemplateSchema {
  const resolved = structuredClone(schema);

  for (const tabName of Object.keys(resolved.fields)) {
    for (const fieldName of Object.keys(resolved.fields[tabName])) {
      const field = resolved.fields[tabName][fieldName];
      if (field.optionsFrom) {
        field.options = getNestedValue(resolved, field.optionsFrom) as SelectOption[];
        delete field.optionsFrom;
      }
    }
  }

  return resolved;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/schema-parser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema-parser.ts src/lib/__tests__/schema-parser.test.ts
git commit -m "feat: add schema parser with optionsFrom resolution"
```

---

### Task 5: Elegant Classic Template Prototype

**Files:**
- Create: `templates/elegant-classic/index.html`
- Create: `templates/elegant-classic/style.css`
- Create: `templates/elegant-classic/script.js`
- Create: `templates/elegant-classic/i18n/ko.json`

- [ ] **Step 1: Create i18n file**

Create `templates/elegant-classic/i18n/ko.json`:

```json
{
  "greeting_default": "서로 다른 길을 걸어온 두 사람이\n이제 하나의 길을 함께 걸어가려 합니다.",
  "section_greeting": "인사말",
  "section_gallery": "갤러리",
  "section_info": "오시는 길",
  "section_guestbook": "방명록",
  "section_rsvp": "참석 여부",
  "rsvp_name": "이름",
  "rsvp_attending": "참석 여부",
  "rsvp_attending_yes": "참석합니다",
  "rsvp_attending_no": "불참합니다",
  "rsvp_guests": "동행 인원",
  "rsvp_meal": "식사 여부",
  "rsvp_meal_yes": "식사합니다",
  "rsvp_meal_no": "식사 안 합니다",
  "rsvp_message": "한마디",
  "rsvp_submit": "전송",
  "guestbook_name": "이름",
  "guestbook_message": "메시지",
  "guestbook_submit": "작성",
  "guestbook_empty": "첫 번째 축하 메시지를 남겨주세요!",
  "calendar_add": "캘린더에 추가",
  "map_navigate": "길찾기",
  "dday_days": "일",
  "dday_hours": "시간",
  "dday_minutes": "분",
  "dday_seconds": "초"
}
```

- [ ] **Step 2: Create template CSS**

Create `templates/elegant-classic/style.css`:

```css
/* Elegant Classic — 클래식 세로 스크롤 청첩장 */

:root {
  --primary: #d4a373;
  --bg: #fefae0;
  --text: #333;
  --text-light: #666;
  --accent: #bc6c25;
  --white: #fff;
  --font-heading: "Nanum Myeongjo", serif;
  --font-body: "Pretendard", sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.invitation {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Hero Section */
.section-hero {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: var(--white);
  padding: 0 24px;
}

.hero-label {
  font-size: 0.75rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 16px;
}

.hero-names {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.4;
  margin-bottom: 16px;
}

.hero-names .ampersand {
  display: block;
  font-size: 1.2rem;
  margin: 4px 0;
  opacity: 0.7;
}

.hero-date {
  font-size: 0.875rem;
  opacity: 0.9;
  letter-spacing: 1px;
}

.hero-venue {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
}

.hero-scroll {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: var(--white);
  opacity: 0.6;
  font-size: 0.7rem;
  letter-spacing: 2px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

/* Section base */
.section {
  padding: 64px 24px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  text-align: center;
  margin-bottom: 32px;
  color: var(--primary);
  letter-spacing: 2px;
}

.section-divider {
  width: 40px;
  height: 1px;
  background: var(--primary);
  margin: 0 auto 32px;
}

/* Greeting Section */
.section-greeting {
  text-align: center;
  background: var(--white);
}

.greeting-text {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  line-height: 2;
  color: var(--text);
  white-space: pre-line;
}

.couple-photo {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin: 24px auto 0;
  display: block;
  border: 3px solid var(--primary);
}

/* Gallery Section */
.section-gallery {
  background: var(--bg);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.gallery-grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-grid img:hover {
  transform: scale(1.02);
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
}

.lightbox.active {
  display: flex;
}

.lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  background: none;
  border: none;
  line-height: 1;
}

/* Info Section */
.section-info {
  background: var(--white);
  text-align: center;
}

.info-venue {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.info-address {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 24px;
}

.info-map {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 24px;
}

.info-transport {
  text-align: left;
  font-size: 0.85rem;
  line-height: 1.8;
  color: var(--text-light);
  white-space: pre-line;
}

.info-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.info-actions a {
  padding: 10px 20px;
  border: 1px solid var(--primary);
  border-radius: 24px;
  color: var(--primary);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.info-actions a:hover {
  background: var(--primary);
  color: var(--white);
}

/* Guestbook Section */
.section-guestbook {
  background: var(--bg);
}

.guestbook-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.guestbook-form input,
.guestbook-form textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: var(--font-body);
  background: var(--white);
}

.guestbook-form textarea {
  height: 80px;
  resize: vertical;
}

.guestbook-form button {
  padding: 12px;
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.3s;
}

.guestbook-form button:hover {
  opacity: 0.9;
}

.guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guestbook-entry {
  background: var(--white);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.guestbook-entry-name {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.guestbook-entry-message {
  font-size: 0.8rem;
  color: var(--text-light);
  line-height: 1.6;
}

.guestbook-entry-date {
  font-size: 0.7rem;
  color: #aaa;
  margin-top: 8px;
}

/* RSVP Section */
.section-rsvp {
  background: var(--white);
}

.rsvp-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rsvp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rsvp-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.rsvp-field input,
.rsvp-field select,
.rsvp-field textarea {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: var(--font-body);
}

.rsvp-form button {
  padding: 14px;
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.rsvp-form button:hover {
  opacity: 0.9;
}

.rsvp-success {
  text-align: center;
  padding: 24px;
  color: var(--primary);
  font-size: 0.9rem;
  display: none;
}

/* D-Day Counter */
.dday-counter {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.dday-item {
  text-align: center;
}

.dday-number {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--primary);
}

.dday-label {
  font-size: 0.7rem;
  color: var(--text-light);
  margin-top: 4px;
}

/* Footer */
.footer {
  text-align: center;
  padding: 32px 24px;
  font-size: 0.7rem;
  color: #ccc;
}

/* Google Fonts import */
@import url("https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&family=Pretendard:wght@300;400;500;600;700&display=swap");
```

- [ ] **Step 3: Create template JavaScript**

Create `templates/elegant-classic/script.js`:

```javascript
(function () {
  "use strict";

  const CONFIG = window.__WEDGEN_CONFIG__;
  if (!CONFIG) {
    console.warn("wedgen: No config found. Running in preview mode.");
    return;
  }

  const { data, style, assets, sectionOrder, locale } = CONFIG;

  // --- i18n ---
  let i18n = {};
  async function loadI18n() {
    try {
      const res = await fetch(`i18n/${locale || "ko"}.json`);
      i18n = await res.json();
    } catch {
      // fallback: use inline defaults
    }
  }

  function t(key, fallback) {
    return i18n[key] || fallback || key;
  }

  // --- Apply color scheme ---
  function applyStyle() {
    if (style.colorScheme) {
      // Color schemes are embedded in the template's color mapping
      const schemes = {
        "warm-blush": { primary: "#d4a373", bg: "#fefae0" },
        "classic-navy": { primary: "#1d3557", bg: "#f1faee" },
        "sage-green": { primary: "#606c38", bg: "#fefae0" },
      };
      const scheme = schemes[style.colorScheme];
      if (scheme) {
        document.documentElement.style.setProperty("--primary", scheme.primary);
        document.documentElement.style.setProperty("--bg", scheme.bg);
      }
    }
    if (style.fontPair) {
      const fonts = {
        "pretendard-nanum": {
          heading: '"Nanum Myeongjo", serif',
          body: '"Pretendard", sans-serif',
        },
        "wanted-sans-serif": {
          heading: '"Wanted Sans", sans-serif',
          body: '"Wanted Sans", sans-serif',
        },
        "noto-serif": {
          heading: '"Noto Serif KR", serif',
          body: '"Noto Serif KR", serif',
        },
      };
      const pair = fonts[style.fontPair];
      if (pair) {
        document.documentElement.style.setProperty("--font-heading", pair.heading);
        document.documentElement.style.setProperty("--font-body", pair.body);
      }
    }
  }

  // --- Render sections ---
  function renderHero() {
    const el = document.querySelector(".section-hero");
    if (!el) return;

    const heroImg = el.querySelector(".hero-image");
    if (heroImg && assets.heroImage) {
      heroImg.src = assets.heroImage;
    }

    const names = el.querySelector(".hero-names");
    if (names) {
      names.innerHTML = `${data.groomName}<span class="ampersand">♥</span>${data.brideName}`;
    }

    const dateEl = el.querySelector(".hero-date");
    if (dateEl && data.weddingDate) {
      const d = new Date(data.weddingDate);
      const opts = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
      dateEl.textContent = d.toLocaleDateString("ko-KR", opts);
    }

    const timeEl = el.querySelector(".hero-time");
    if (timeEl && data.weddingDate) {
      const d = new Date(data.weddingDate);
      timeEl.textContent = d.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
    }

    const venueEl = el.querySelector(".hero-venue");
    if (venueEl) {
      venueEl.textContent = data.venue || "";
    }
  }

  function renderGreeting() {
    const el = document.querySelector(".section-greeting");
    if (!el) return;

    const text = el.querySelector(".greeting-text");
    if (text) {
      text.textContent = data.greeting || t("greeting_default");
    }

    const photo = el.querySelector(".couple-photo");
    if (photo && assets.couplePhoto) {
      photo.src = assets.couplePhoto;
      photo.style.display = "block";
    } else if (photo) {
      photo.style.display = "none";
    }
  }

  function renderGallery() {
    const el = document.querySelector(".section-gallery");
    if (!el) return;

    const grid = el.querySelector(".gallery-grid");
    if (!grid || !assets.photos || assets.photos.length === 0) return;

    grid.innerHTML = "";
    assets.photos.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Gallery ${i + 1}`;
      img.loading = "lazy";
      img.addEventListener("click", () => openLightbox(src));
      grid.appendChild(img);
    });
  }

  function renderInfo() {
    const el = document.querySelector(".section-info");
    if (!el) return;

    const venue = el.querySelector(".info-venue");
    if (venue) venue.textContent = data.venue || "";

    const address = el.querySelector(".info-address");
    if (address) address.textContent = data.address || "";

    const transport = el.querySelector(".info-transport");
    if (transport) transport.textContent = data.transport || "";

    // Map
    if (data.mapType && data.mapType !== "none" && data.mapCoords) {
      initMap(el, data.mapType, data.mapCoords);
    }
  }

  function initMap(container, type, coords) {
    const mapDiv = container.querySelector(".info-map");
    if (!mapDiv) return;

    if (type === "kakao") {
      mapDiv.innerHTML = `<iframe src="https://map.kakao.com/link/map/${coords.lat},${coords.lng}" style="width:100%;height:100%;border:none;border-radius:8px;" loading="lazy"></iframe>`;
    } else if (type === "naver") {
      mapDiv.innerHTML = `<iframe src="https://map.naver.com/p/entry/place?c=${coords.lng},${coords.lat}" style="width:100%;height:100%;border:none;border-radius:8px;" loading="lazy"></iframe>`;
    }

    const navLink = container.querySelector(".map-navigate");
    if (navLink) {
      if (type === "kakao") {
        navLink.href = `https://map.kakao.com/link/to/${data.venue},${coords.lat},${coords.lng}`;
      } else if (type === "naver") {
        navLink.href = `https://map.naver.com/p/directions/-/-/${coords.lng},${coords.lat}`;
      }
    }
  }

  // --- Guestbook ---
  function initGuestbook() {
    const el = document.querySelector(".section-guestbook");
    if (!el || !data.guestbookUrl) return;

    const form = el.querySelector(".guestbook-form");
    const list = el.querySelector(".guestbook-list");

    // Load existing entries
    loadGuestbookEntries(list);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('input[name="name"]');
      const msgInput = form.querySelector('textarea[name="message"]');

      const payload = { name: nameInput.value, message: msgInput.value };

      try {
        await fetch(data.guestbookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors",
        });
        nameInput.value = "";
        msgInput.value = "";
        loadGuestbookEntries(list);
      } catch (err) {
        console.error("Guestbook submit error:", err);
      }
    });
  }

  async function loadGuestbookEntries(listEl) {
    if (!listEl || !data.guestbookUrl) return;
    try {
      const res = await fetch(data.guestbookUrl);
      const entries = await res.json();
      listEl.innerHTML = "";
      if (entries.length === 0) {
        listEl.innerHTML = `<p style="text-align:center;color:#aaa;font-size:0.85rem;">${t("guestbook_empty")}</p>`;
        return;
      }
      entries.forEach((entry) => {
        const div = document.createElement("div");
        div.className = "guestbook-entry";
        div.innerHTML = `
          <div class="guestbook-entry-name">${escapeHtml(entry.name)}</div>
          <div class="guestbook-entry-message">${escapeHtml(entry.message)}</div>
          <div class="guestbook-entry-date">${entry.date || ""}</div>
        `;
        listEl.appendChild(div);
      });
    } catch {
      // silent fail
    }
  }

  // --- RSVP ---
  function initRsvp() {
    const el = document.querySelector(".section-rsvp");
    if (!el || !data.rsvpUrl) return;

    const form = el.querySelector(".rsvp-form");
    const success = el.querySelector(".rsvp-success");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        await fetch(data.rsvpUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors",
        });
        form.style.display = "none";
        success.style.display = "block";
      } catch (err) {
        console.error("RSVP submit error:", err);
      }
    });
  }

  // --- D-Day Counter ---
  function initDdayCounter() {
    const counter = document.querySelector(".dday-counter");
    if (!counter || !data.weddingDate) return;

    function update() {
      const now = new Date();
      const target = new Date(data.weddingDate);
      const diff = target - now;

      if (diff <= 0) {
        counter.innerHTML = '<div style="text-align:center;color:var(--primary);">오늘이 그 날입니다 💐</div>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      counter.innerHTML = `
        <div class="dday-item"><div class="dday-number">${days}</div><div class="dday-label">${t("dday_days", "일")}</div></div>
        <div class="dday-item"><div class="dday-number">${hours}</div><div class="dday-label">${t("dday_hours", "시간")}</div></div>
        <div class="dday-item"><div class="dday-number">${minutes}</div><div class="dday-label">${t("dday_minutes", "분")}</div></div>
        <div class="dday-item"><div class="dday-number">${seconds}</div><div class="dday-label">${t("dday_seconds", "초")}</div></div>
      `;
    }

    update();
    setInterval(update, 1000);
  }

  // --- Lightbox ---
  function openLightbox(src) {
    const lb = document.querySelector(".lightbox");
    if (!lb) return;
    lb.querySelector("img").src = src;
    lb.classList.add("active");
  }

  function initLightbox() {
    const lb = document.querySelector(".lightbox");
    if (!lb) return;
    lb.addEventListener("click", () => lb.classList.remove("active"));
  }

  // --- Scroll animation ---
  function initScrollAnimation() {
    const sections = document.querySelectorAll(".section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  // --- Section ordering ---
  function reorderSections() {
    if (!sectionOrder || sectionOrder.length === 0) return;

    const container = document.querySelector(".invitation");
    if (!container) return;

    const sectionMap = {};
    container.querySelectorAll("[data-section]").forEach((el) => {
      sectionMap[el.dataset.section] = el;
    });

    sectionOrder.forEach((id) => {
      if (sectionMap[id]) {
        container.appendChild(sectionMap[id]);
      }
    });
  }

  // --- Utilities ---
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Init ---
  async function init() {
    await loadI18n();
    applyStyle();
    reorderSections();
    renderHero();
    renderGreeting();
    renderGallery();
    renderInfo();
    initGuestbook();
    initRsvp();
    initDdayCounter();
    initLightbox();
    initScrollAnimation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 4: Create template HTML**

Create `templates/elegant-classic/index.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Wedding Invitation</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="invitation">

    <!-- Hero -->
    <div class="section-hero" data-section="hero">
      <img class="hero-image" src="" alt="Hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-label">WEDDING INVITATION</div>
        <div class="hero-names"></div>
        <div class="hero-date"></div>
        <div class="hero-time"></div>
        <div class="hero-venue"></div>
      </div>
      <div class="hero-scroll">↓ SCROLL</div>
    </div>

    <!-- Greeting -->
    <div class="section section-greeting" data-section="greeting">
      <h2 class="section-title">인사말</h2>
      <div class="section-divider"></div>
      <p class="greeting-text"></p>
      <img class="couple-photo" src="" alt="Couple" style="display:none;">
      <div class="dday-counter"></div>
    </div>

    <!-- Gallery -->
    <div class="section section-gallery" data-section="gallery">
      <h2 class="section-title">갤러리</h2>
      <div class="section-divider"></div>
      <div class="gallery-grid"></div>
    </div>

    <!-- Info & Map -->
    <div class="section section-info" data-section="info">
      <h2 class="section-title">오시는 길</h2>
      <div class="section-divider"></div>
      <div class="info-venue"></div>
      <div class="info-address"></div>
      <div class="info-map"></div>
      <div class="info-transport"></div>
      <div class="info-actions">
        <a class="map-navigate" href="#" target="_blank">길찾기</a>
      </div>
    </div>

    <!-- Guestbook -->
    <div class="section section-guestbook" data-section="guestbook">
      <h2 class="section-title">방명록</h2>
      <div class="section-divider"></div>
      <form class="guestbook-form">
        <input type="text" name="name" placeholder="이름" required>
        <textarea name="message" placeholder="축하 메시지를 남겨주세요" required></textarea>
        <button type="submit">작성</button>
      </form>
      <div class="guestbook-list"></div>
    </div>

    <!-- RSVP -->
    <div class="section section-rsvp" data-section="rsvp">
      <h2 class="section-title">참석 여부</h2>
      <div class="section-divider"></div>
      <form class="rsvp-form">
        <div class="rsvp-field">
          <label>이름</label>
          <input type="text" name="name" required>
        </div>
        <div class="rsvp-field">
          <label>참석 여부</label>
          <select name="attending">
            <option value="yes">참석합니다</option>
            <option value="no">불참합니다</option>
          </select>
        </div>
        <div class="rsvp-field">
          <label>동행 인원</label>
          <select name="guests">
            <option value="0">본인만</option>
            <option value="1">+1</option>
            <option value="2">+2</option>
            <option value="3">+3</option>
          </select>
        </div>
        <div class="rsvp-field">
          <label>식사 여부</label>
          <select name="meal">
            <option value="yes">식사합니다</option>
            <option value="no">식사 안 합니다</option>
          </select>
        </div>
        <div class="rsvp-field">
          <label>한마디</label>
          <textarea name="message" rows="2"></textarea>
        </div>
        <button type="submit">전송</button>
      </form>
      <div class="rsvp-success">감사합니다! 참석 여부가 전달되었습니다. 💐</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      Made with 💍 wedgen
    </div>
  </div>

  <!-- Lightbox -->
  <div class="lightbox">
    <button class="lightbox-close">&times;</button>
    <img src="" alt="Gallery">
  </div>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create placeholder thumbnail**

Create a simple SVG thumbnail at `templates/elegant-classic/thumbnail.png`. Since we can't generate a PNG here, create a placeholder SVG that will be served:

Actually, for now create a 1x1 placeholder. A real thumbnail will be designed later. Run:
```bash
echo "placeholder" > templates/elegant-classic/thumbnail.png
```

- [ ] **Step 6: Verify template files exist**

Run:
```bash
ls -la templates/elegant-classic/
```

Expected: `schema.json`, `index.html`, `style.css`, `script.js`, `thumbnail.png`, `i18n/ko.json`

- [ ] **Step 7: Commit**

```bash
git add templates/elegant-classic/
git commit -m "feat: add elegant-classic template prototype with full HTML/CSS/JS"
```

---

## Phase 3: Build Pipeline

### Task 6: Config Injector

**Files:**
- Create: `src/lib/config-injector.ts`
- Create: `src/lib/__tests__/config-injector.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/config-injector.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { injectConfig } from "../config-injector";
import type { WedgenConfig } from "@/types";

const sampleConfig: WedgenConfig = {
  template: "elegant-classic",
  locale: "ko",
  sectionOrder: ["hero", "greeting"],
  data: {
    groomName: "김민수",
    brideName: "이수진",
    weddingDate: "2026-05-15T14:00:00+09:00",
  },
  style: { colorScheme: "warm-blush", fontPair: "pretendard-nanum", animation: "fade" },
  assets: { heroImage: "assets/hero.webp" },
};

describe("injectConfig", () => {
  it("injects config script into <head>", () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Test</title></head><body></body></html>`;
    const result = injectConfig(html, sampleConfig);

    expect(result).toContain("window.__WEDGEN_CONFIG__");
    expect(result).toContain('"groomName":"김민수"');
    expect(result).toContain("</script>");
    // Script should be before </head>
    const scriptIdx = result.indexOf("__WEDGEN_CONFIG__");
    const headCloseIdx = result.indexOf("</head>");
    expect(scriptIdx).toBeLessThan(headCloseIdx);
  });

  it("escapes </script> in config values", () => {
    const xssConfig = {
      ...sampleConfig,
      data: { ...sampleConfig.data, greeting: '</script><script>alert("xss")</script>' },
    };
    const html = `<html><head></head><body></body></html>`;
    const result = injectConfig(html, xssConfig);

    expect(result).not.toContain("</script><script>");
    expect(result).toContain("<\\/script>");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/config-injector.test.ts`
Expected: FAIL

- [ ] **Step 3: Write config injector**

Create `src/lib/config-injector.ts`:

```typescript
import type { WedgenConfig } from "@/types";

export function injectConfig(html: string, config: WedgenConfig): string {
  const json = JSON.stringify(config).replace(/<\//g, "<\\/");
  const scriptTag = `<script>window.__WEDGEN_CONFIG__=${json};</script>`;

  const headCloseIdx = html.indexOf("</head>");
  if (headCloseIdx === -1) {
    // No </head>, prepend to <body> or start of document
    const bodyIdx = html.indexOf("<body");
    if (bodyIdx !== -1) {
      return html.slice(0, bodyIdx) + scriptTag + html.slice(bodyIdx);
    }
    return scriptTag + html;
  }

  return html.slice(0, headCloseIdx) + scriptTag + html.slice(headCloseIdx);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/config-injector.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/config-injector.ts src/lib/__tests__/config-injector.test.ts
git commit -m "feat: add config injector with XSS-safe script injection"
```

---

### Task 7: Image Processor

**Files:**
- Create: `src/lib/image-processor.ts`
- Create: `src/lib/__tests__/image-processor.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/image-processor.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { processImage, ImagePreset } from "../image-processor";
import sharp from "sharp";

describe("processImage", () => {
  it("converts a PNG buffer to WebP", async () => {
    // Create a test image: 100x100 red square
    const input = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();

    const output = await processImage(input, "hero");

    // Verify it's a valid WebP by checking magic bytes
    expect(output[0]).toBe(0x52); // 'R'
    expect(output[1]).toBe(0x49); // 'I'
    expect(output[2]).toBe(0x46); // 'F'
    expect(output[3]).toBe(0x46); // 'F'
  });

  it("respects hero preset dimensions", async () => {
    const input = await sharp({
      create: { width: 2000, height: 3000, channels: 3, background: { r: 0, g: 0, b: 255 } },
    })
      .png()
      .toBuffer();

    const output = await processImage(input, "hero");
    const meta = await sharp(output).metadata();

    expect(meta.width).toBeLessThanOrEqual(1200);
    expect(meta.height).toBeLessThanOrEqual(1600);
    expect(meta.format).toBe("webp");
  });

  it("respects gallery preset dimensions", async () => {
    const input = await sharp({
      create: { width: 2000, height: 2000, channels: 3, background: { r: 0, g: 255, b: 0 } },
    })
      .png()
      .toBuffer();

    const output = await processImage(input, "gallery");
    const meta = await sharp(output).metadata();

    expect(meta.width).toBeLessThanOrEqual(800);
    expect(meta.height).toBeLessThanOrEqual(800);
    expect(meta.format).toBe("webp");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/image-processor.test.ts`
Expected: FAIL

- [ ] **Step 3: Write image processor**

Create `src/lib/image-processor.ts`:

```typescript
import sharp from "sharp";

export type ImagePreset = "hero" | "gallery" | "thumbnail";

interface PresetConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const PRESETS: Record<ImagePreset, PresetConfig> = {
  hero: { maxWidth: 1200, maxHeight: 1600, quality: 85 },
  gallery: { maxWidth: 800, maxHeight: 800, quality: 80 },
  thumbnail: { maxWidth: 400, maxHeight: 400, quality: 75 },
};

export async function processImage(
  input: Buffer,
  preset: ImagePreset
): Promise<Buffer> {
  const config = PRESETS[preset];

  return sharp(input)
    .resize(config.maxWidth, config.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: config.quality })
    .toBuffer();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/image-processor.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/image-processor.ts src/lib/__tests__/image-processor.test.ts
git commit -m "feat: add image processor with sharp WebP conversion and presets"
```

---

### Task 8: Optimizers

**Files:**
- Create: `src/lib/optimizers.ts`
- Create: `src/lib/__tests__/optimizers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/optimizers.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { optimizeHtml, optimizeJs, optimizeCss } from "../optimizers";

describe("optimizeJs", () => {
  it("minifies JavaScript", async () => {
    const input = `function hello() {\n  const greeting = "Hello";\n  console.log(greeting);\n}`;
    const output = await optimizeJs(input);
    expect(output.length).toBeLessThan(input.length);
    expect(output).not.toContain("\n  ");
  });
});

describe("optimizeCss", () => {
  it("minifies CSS", () => {
    const input = `.class {\n  color: red;\n  margin: 0px;\n}`;
    const output = optimizeCss(input);
    expect(output.length).toBeLessThan(input.length);
    expect(output).not.toContain("\n");
  });
});

describe("optimizeHtml", () => {
  it("minifies HTML", async () => {
    const input = `<!DOCTYPE html>\n<html>\n<head>\n  <title>Test</title>\n</head>\n<body>\n  <!-- comment -->\n  <div>Hello</div>\n</body>\n</html>`;
    const output = await optimizeHtml(input);
    expect(output.length).toBeLessThan(input.length);
    expect(output).not.toContain("<!-- comment -->");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/optimizers.test.ts`
Expected: FAIL

- [ ] **Step 3: Write optimizers**

Create `src/lib/optimizers.ts`:

```typescript
import { minify as terserMinify } from "terser";
import { minify as htmlMinify } from "html-minifier-terser";
import CleanCSS from "clean-css";

export async function optimizeJs(code: string): Promise<string> {
  const result = await terserMinify(code, {
    compress: true,
    mangle: true,
  });
  return result.code || code;
}

export function optimizeCss(code: string): string {
  const result = new CleanCSS({ level: 2 }).minify(code);
  return result.styles;
}

export async function optimizeHtml(code: string): Promise<string> {
  return htmlMinify(code, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/optimizers.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/optimizers.ts src/lib/__tests__/optimizers.test.ts
git commit -m "feat: add HTML/JS/CSS optimizers for Optimized build mode"
```

---

### Task 9: GAS Validator

**Files:**
- Create: `src/lib/gas-validator.ts`
- Create: `src/lib/__tests__/gas-validator.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/gas-validator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validateGasUrl } from "../gas-validator";

describe("validateGasUrl", () => {
  it("rejects non-URL strings", async () => {
    const result = await validateGasUrl("not-a-url");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects non-HTTPS URLs", async () => {
    const result = await validateGasUrl("http://example.com");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("HTTPS");
  });

  it("accepts valid Google Apps Script URL format", async () => {
    // We only validate format here, not reachability
    const result = await validateGasUrl(
      "https://script.google.com/macros/s/abc123/exec",
      { skipPing: true }
    );
    expect(result.valid).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/gas-validator.test.ts`
Expected: FAIL

- [ ] **Step 3: Write GAS validator**

Create `src/lib/gas-validator.ts`:

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateGasUrl(
  url: string,
  options: { skipPing?: boolean; timeout?: number } = {}
): Promise<ValidationResult> {
  // Basic URL format check
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "유효한 URL 형식이 아닙니다." };
  }

  // Require HTTPS
  if (parsed.protocol !== "https:") {
    return { valid: false, error: "HTTPS URL만 허용됩니다." };
  }

  if (options.skipPing) {
    return { valid: true };
  }

  // Ping the URL
  const timeout = options.timeout || 10000;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timer);

    if (response.ok || response.status === 302) {
      return { valid: true };
    }

    return {
      valid: false,
      error: `서버 응답 오류: ${response.status} ${response.statusText}`,
    };
  } catch (err) {
    return {
      valid: false,
      error: `연결 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/gas-validator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/gas-validator.ts src/lib/__tests__/gas-validator.test.ts
git commit -m "feat: add GAS URL validator with format check and ping"
```

---

### Task 10: Build Pipeline

**Files:**
- Create: `src/lib/build-pipeline.ts`
- Create: `src/lib/__tests__/build-pipeline.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/build-pipeline.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildZip } from "../build-pipeline";
import type { WedgenConfig } from "@/types";
import sharp from "sharp";
import JSZip from "jszip";

// We'll need jszip for test verification
// Run: npm install -D jszip @types/jszip

const testConfig: WedgenConfig = {
  template: "elegant-classic",
  locale: "ko",
  sectionOrder: ["hero", "greeting", "gallery", "info", "guestbook", "rsvp"],
  data: {
    groomName: "김민수",
    brideName: "이수진",
    weddingDate: "2026-05-15T14:00:00+09:00",
  },
  style: { colorScheme: "warm-blush", fontPair: "pretendard-nanum", animation: "fade" },
  assets: {},
};

describe("buildZip", () => {
  it("produces a valid ZIP with index.html containing config", async () => {
    const result = await buildZip({
      templateId: "elegant-classic",
      config: testConfig,
      buildMode: "tweak",
      images: {},
    });

    expect(result).toBeInstanceOf(Buffer);

    const zip = await JSZip.loadAsync(result);
    const indexHtml = await zip.file("index.html")?.async("string");

    expect(indexHtml).toBeDefined();
    expect(indexHtml).toContain("__WEDGEN_CONFIG__");
    expect(indexHtml).toContain("김민수");
  });

  it("includes style.css and script.js", async () => {
    const result = await buildZip({
      templateId: "elegant-classic",
      config: testConfig,
      buildMode: "tweak",
      images: {},
    });

    const zip = await JSZip.loadAsync(result);
    expect(zip.file("style.css")).not.toBeNull();
    expect(zip.file("script.js")).not.toBeNull();
  });

  it("processes images into WebP in assets/", async () => {
    const testImage = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();

    const configWithAssets = {
      ...testConfig,
      assets: { heroImage: "assets/hero.webp" },
    };

    const result = await buildZip({
      templateId: "elegant-classic",
      config: configWithAssets,
      buildMode: "tweak",
      images: { heroImage: testImage },
    });

    const zip = await JSZip.loadAsync(result);
    const heroFile = zip.file("assets/hero.webp");
    expect(heroFile).not.toBeNull();

    const heroBuffer = await heroFile!.async("nodebuffer");
    const meta = await sharp(heroBuffer).metadata();
    expect(meta.format).toBe("webp");
  });

  it("minifies code in optimized mode", async () => {
    const tweakResult = await buildZip({
      templateId: "elegant-classic",
      config: testConfig,
      buildMode: "tweak",
      images: {},
    });

    const optimizedResult = await buildZip({
      templateId: "elegant-classic",
      config: testConfig,
      buildMode: "optimized",
      images: {},
    });

    const tweakZip = await JSZip.loadAsync(tweakResult);
    const optZip = await JSZip.loadAsync(optimizedResult);

    const tweakJs = await tweakZip.file("script.js")?.async("string");
    const optJs = await optZip.file("script.js")?.async("string");

    expect(optJs!.length).toBeLessThan(tweakJs!.length);
  });
});
```

- [ ] **Step 2: Install test dependency and run test to verify it fails**

Run:
```bash
npm install -D jszip @types/jszip
npx vitest run src/lib/__tests__/build-pipeline.test.ts
```

Expected: FAIL — `buildZip` not found.

- [ ] **Step 3: Write build pipeline**

Create `src/lib/build-pipeline.ts`:

```typescript
import fs from "fs/promises";
import path from "path";
import archiver from "archiver";
import { injectConfig } from "./config-injector";
import { processImage, type ImagePreset } from "./image-processor";
import { optimizeHtml, optimizeJs, optimizeCss } from "./optimizers";
import type { WedgenConfig } from "@/types";

export type BuildMode = "tweak" | "optimized";

export interface BuildOptions {
  templateId: string;
  config: WedgenConfig;
  buildMode: BuildMode;
  images: Record<string, Buffer>;
}

export async function buildZip(options: BuildOptions): Promise<Buffer> {
  const { templateId, config, buildMode, images } = options;

  const templateDir = path.resolve(process.cwd(), "templates", templateId);

  // 1. Read template files
  let html = await fs.readFile(path.join(templateDir, "index.html"), "utf-8");
  let css = await fs.readFile(path.join(templateDir, "style.css"), "utf-8");
  let js = await fs.readFile(path.join(templateDir, "script.js"), "utf-8");

  // 2. Inject config into HTML
  html = injectConfig(html, config);

  // 3. Process images
  const processedImages: Record<string, Buffer> = {};
  for (const [key, buffer] of Object.entries(images)) {
    const preset: ImagePreset = key === "heroImage" ? "hero" : "gallery";
    processedImages[key] = await processImage(buffer, preset);
  }

  // 4. Build mode branch
  if (buildMode === "optimized") {
    html = await optimizeHtml(html);
    js = await optimizeJs(js);
    css = optimizeCss(css);
  }

  // 5. Create ZIP archive
  return new Promise<Buffer>((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    // Add main files
    archive.append(html, { name: "index.html" });
    archive.append(css, { name: "style.css" });
    archive.append(js, { name: "script.js" });

    // Add i18n files
    const i18nDir = path.join(templateDir, "i18n");
    archive.directory(i18nDir, "i18n");

    // Add processed images
    for (const [key, buffer] of Object.entries(processedImages)) {
      const assetPath = config.assets[key];
      if (typeof assetPath === "string") {
        archive.append(buffer, { name: assetPath });
      }
    }

    // Handle gallery photos array
    if (images.photos && Array.isArray(config.assets.photos)) {
      // photos comes as separate keys: photos_0, photos_1, etc.
    }
    for (const [key, buffer] of Object.entries(processedImages)) {
      if (key.startsWith("photos_") && Array.isArray(config.assets.photos)) {
        const idx = parseInt(key.split("_")[1], 10);
        const assetPath = config.assets.photos[idx];
        if (assetPath) {
          archive.append(buffer, { name: assetPath });
        }
      }
    }

    // Add bgMusic if present
    if (images.bgMusic) {
      const musicPath = config.assets.bgMusic;
      if (typeof musicPath === "string") {
        archive.append(images.bgMusic, { name: musicPath });
      }
    }

    archive.finalize();
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/build-pipeline.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-pipeline.ts src/lib/__tests__/build-pipeline.test.ts package.json package-lock.json
git commit -m "feat: add build pipeline with Tweak/Optimized modes and ZIP streaming"
```

---

## Phase 4: API Routes

### Task 11: Templates API Route

**Files:**
- Create: `src/app/api/templates/route.ts`
- Create: `src/app/api/templates/[id]/thumbnail/route.ts`

- [ ] **Step 1: Create templates list endpoint**

Create `src/app/api/templates/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { scanTemplates } from "@/lib/template-scanner";
import path from "path";

export async function GET() {
  const templatesDir = path.resolve(process.cwd(), "templates");
  const templates = await scanTemplates(templatesDir);

  const withThumbnails = templates.map((t) => ({
    ...t,
    thumbnail: `/api/templates/${t.id}/thumbnail`,
  }));

  return NextResponse.json(withThumbnails);
}
```

- [ ] **Step 2: Create thumbnail endpoint**

Create `src/app/api/templates/[id]/thumbnail/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const thumbnailPath = path.resolve(
    process.cwd(),
    "templates",
    id,
    "thumbnail.png"
  );

  try {
    const buffer = await fs.readFile(thumbnailPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/templates/
git commit -m "feat: add GET /api/templates and thumbnail endpoints"
```

---

### Task 12: Generate API Route

**Files:**
- Create: `src/app/api/generate/route.ts`

- [ ] **Step 1: Create generate endpoint**

Create `src/app/api/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { buildZip, type BuildMode } from "@/lib/build-pipeline";
import type { WedgenConfig } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const configStr = formData.get("config") as string;
    const buildMode = (formData.get("buildMode") as BuildMode) || "tweak";
    const templateId = formData.get("templateId") as string;

    if (!configStr || !templateId) {
      return NextResponse.json(
        { error: "Missing required fields: config, templateId" },
        { status: 400 }
      );
    }

    let config: WedgenConfig;
    try {
      config = JSON.parse(configStr);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in config field" },
        { status: 400 }
      );
    }

    // Collect images from form data
    const images: Record<string, Buffer> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key !== "config" && key !== "buildMode" && key !== "templateId") {
        const arrayBuffer = await value.arrayBuffer();
        images[key] = Buffer.from(arrayBuffer);
      }
    }

    const zipBuffer = await buildZip({
      templateId,
      config,
      buildMode,
      images,
    });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="wedding-invitation.zip"',
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "feat: add POST /api/generate endpoint for ZIP build and download"
```

---

### Task 13: Validate API Route

**Files:**
- Create: `src/app/api/validate/route.ts`

- [ ] **Step 1: Create validate endpoint**

Create `src/app/api/validate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { validateGasUrl } from "@/lib/gas-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { valid: false, error: "URL이 필요합니다." },
        { status: 400 }
      );
    }

    const result = await validateGasUrl(url, { timeout: 10000 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/validate/route.ts
git commit -m "feat: add POST /api/validate endpoint for GAS URL verification"
```

---

## Phase 5: Console UI

### Task 14: Field Components

**Files:**
- Create all files under `src/components/editor/fields/`

- [ ] **Step 1: Create FieldRenderer (type → widget mapper)**

Create `src/components/editor/fields/FieldRenderer.tsx`:

```tsx
"use client";

import type { FieldDefinition } from "@/types";
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";
import { DateTimeField } from "./DateTimeField";
import { ImageField } from "./ImageField";
import { ImageArrayField } from "./ImageArrayField";
import { SelectField } from "./SelectField";
import { MultiSelectField } from "./MultiSelectField";
import { UrlField } from "./UrlField";
import { LatLngField } from "./LatLngField";
import { FileField } from "./FileField";

interface FieldRendererProps {
  name: string;
  field: FieldDefinition;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

const FIELD_MAP: Record<string, React.ComponentType<FieldRendererProps>> = {
  text: TextField,
  textarea: TextareaField,
  datetime: DateTimeField,
  image: ImageField,
  "image[]": ImageArrayField,
  select: SelectField,
  "select[]": MultiSelectField,
  url: UrlField,
  latlng: LatLngField,
  file: FileField,
};

export function FieldRenderer({ name, field, value, onChange }: FieldRendererProps) {
  const Component = FIELD_MAP[field.type];
  if (!Component) {
    return <div className="text-sm text-red-500">Unknown field type: {field.type}</div>;
  }
  return <Component name={name} field={field} value={value} onChange={onChange} />;
}

export type { FieldRendererProps };
```

- [ ] **Step 2: Create TextField**

Create `src/components/editor/fields/TextField.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function TextField({ name, field, value, onChange }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        value={(value as string) || ""}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        onChange={(e) => onChange(name, e.target.value)}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create TextareaField**

Create `src/components/editor/fields/TextareaField.tsx`:

```tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function TextareaField({ name, field, value, onChange }: FieldRendererProps) {
  const text = (value as string) || "";
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        value={text}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        onChange={(e) => onChange(name, e.target.value)}
        rows={4}
      />
      {field.maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {text.length}/{field.maxLength}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create DateTimeField**

Create `src/components/editor/fields/DateTimeField.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function DateTimeField({ name, field, value, onChange }: FieldRendererProps) {
  const dateValue = value ? new Date(value as string).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="datetime-local"
        value={dateValue}
        onChange={(e) => {
          const date = new Date(e.target.value);
          onChange(name, date.toISOString());
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Create ImageField**

Create `src/components/editor/fields/ImageField.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function ImageField({ name, field, value, onChange }: FieldRendererProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(name, file);
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={field.accept?.map((a) => `.${a}`).join(",") || "image/*"}
        onChange={handleFile}
        className="hidden"
      />
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt={field.label}
            className="w-full h-40 object-cover rounded-lg border"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              setPreview(null);
              onChange(name, null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            삭제
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <p className="text-sm text-muted-foreground">클릭하여 업로드</p>
          {field.maxSize && (
            <p className="text-xs text-muted-foreground mt-1">최대 {field.maxSize}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create ImageArrayField**

Create `src/components/editor/fields/ImageArrayField.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

interface ImageItem {
  file: File;
  preview: string;
}

export function ImageArrayField({ name, field, value, onChange }: FieldRendererProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const max = field.max || 20;

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newItems = files
      .slice(0, max - items.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    const updated = [...items, ...newItems];
    setItems(updated);
    onChange(name, updated.map((i) => i.file));
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(name, updated.map((i) => i.file));
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        <span className="text-xs text-muted-foreground ml-2">
          ({items.length}/{max})
        </span>
      </Label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <div key={i} className="relative aspect-square">
            <img
              src={item.preview}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            <button
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center"
              onClick={() => removeItem(i)}
            >
              x
            </button>
          </div>
        ))}
        {items.length < max && (
          <div
            className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <span className="text-2xl text-muted-foreground">+</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create SelectField**

Create `src/components/editor/fields/SelectField.tsx`:

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function SelectField({ name, field, value, onChange }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <Select
        value={(value as string) || ""}
        onValueChange={(val) => onChange(name, val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {(field.options || []).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 8: Create MultiSelectField**

Create `src/components/editor/fields/MultiSelectField.tsx`:

```tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function MultiSelectField({ name, field, value, onChange }: FieldRendererProps) {
  const selected = (value as string[]) || [];

  function toggle(optValue: string) {
    const updated = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(name, updated);
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <div className="space-y-2">
        {(field.options || []).map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={`${name}-${opt.value}`}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <label
              htmlFor={`${name}-${opt.value}`}
              className="text-sm cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create UrlField**

Create `src/components/editor/fields/UrlField.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FieldRendererProps } from "./FieldRenderer";

export function UrlField({ name, field, value, onChange }: FieldRendererProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [error, setError] = useState("");

  async function validate() {
    const url = value as string;
    if (!url) return;

    setStatus("checking");
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.valid) {
        setStatus("valid");
        setError("");
      } else {
        setStatus("invalid");
        setError(result.error || "검증 실패");
      }
    } catch {
      setStatus("invalid");
      setError("검증 중 오류 발생");
    }
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <div className="flex gap-2">
        <Input
          value={(value as string) || ""}
          placeholder="https://script.google.com/macros/s/.../exec"
          onChange={(e) => {
            onChange(name, e.target.value);
            setStatus("idle");
          }}
          className="flex-1"
        />
        {field.validate === "ping" && (
          <Button
            variant="outline"
            size="sm"
            onClick={validate}
            disabled={!value || status === "checking"}
          >
            {status === "checking" ? "검증중..." : "검증"}
          </Button>
        )}
      </div>
      {status === "valid" && <Badge variant="default" className="bg-green-500">연결 성공</Badge>}
      {status === "invalid" && <Badge variant="destructive">{error}</Badge>}
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 10: Create LatLngField**

Create `src/components/editor/fields/LatLngField.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";
import type { LatLng } from "@/types/config";

export function LatLngField({ name, field, value, onChange }: FieldRendererProps) {
  const coords = (value as LatLng) || { lat: 0, lng: 0 };

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          placeholder="위도 (lat)"
          value={coords.lat || ""}
          onChange={(e) =>
            onChange(name, { ...coords, lat: parseFloat(e.target.value) || 0 })
          }
        />
        <Input
          type="number"
          step="any"
          placeholder="경도 (lng)"
          value={coords.lng || ""}
          onChange={(e) =>
            onChange(name, { ...coords, lng: parseFloat(e.target.value) || 0 })
          }
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Create FileField**

Create `src/components/editor/fields/FileField.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FieldRendererProps } from "./FieldRenderer";

export function FileField({ name, field, value, onChange }: FieldRendererProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onChange(name, file);
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={field.accept?.map((a) => `.${a}`).join(",")}
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          파일 선택
        </Button>
        {fileName && (
          <>
            <span className="text-sm text-muted-foreground truncate">{fileName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFileName(null);
                onChange(name, null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              삭제
            </Button>
          </>
        )}
      </div>
      {field.maxSize && (
        <p className="text-xs text-muted-foreground">최대 {field.maxSize}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 12: Verify build compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors (or only non-blocking warnings from generated shadcn components).

- [ ] **Step 13: Commit**

```bash
git add src/components/editor/fields/
git commit -m "feat: add all field widget components for dynamic form rendering"
```

---

### Task 15: Editor Layout Components

**Files:**
- Create: `src/components/editor/EditorLayout.tsx`
- Create: `src/components/editor/ConfigPanel.tsx`
- Create: `src/components/editor/PreviewFrame.tsx`
- Create: `src/components/editor/SectionOrderer.tsx`
- Create: `src/components/editor/BuildBar.tsx`

- [ ] **Step 1: Create ConfigPanel**

Create `src/components/editor/ConfigPanel.tsx`:

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldRenderer } from "./fields/FieldRenderer";
import { SectionOrderer } from "./SectionOrderer";
import type { TemplateSchema, FieldDefinition } from "@/types";

interface ConfigPanelProps {
  schema: TemplateSchema;
  formData: Record<string, unknown>;
  sectionOrder: string[];
  onFieldChange: (name: string, value: unknown) => void;
  onSectionOrderChange: (order: string[]) => void;
}

export function ConfigPanel({
  schema,
  formData,
  sectionOrder,
  onFieldChange,
  onSectionOrderChange,
}: ConfigPanelProps) {
  const tabNames = Object.keys(schema.fields);

  return (
    <div className="h-full overflow-y-auto p-5">
      <Tabs defaultValue={tabNames[0]} className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1 mb-6">
          {tabNames.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabNames.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {Object.entries(schema.fields[tab]).map(
              ([fieldName, fieldDef]: [string, FieldDefinition]) => (
                <FieldRenderer
                  key={fieldName}
                  name={fieldName}
                  field={fieldDef}
                  value={formData[fieldName]}
                  onChange={onFieldChange}
                />
              )
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 border-t pt-6">
        <SectionOrderer
          sections={schema.sections}
          order={sectionOrder}
          onChange={onSectionOrderChange}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SectionOrderer**

Create `src/components/editor/SectionOrderer.tsx`:

```tsx
"use client";

import { Label } from "@/components/ui/label";
import type { SectionConfig } from "@/types";

interface SectionOrdererProps {
  sections: SectionConfig;
  order: string[];
  onChange: (order: string[]) => void;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "메인 (히어로)",
  greeting: "인사말",
  gallery: "갤러리",
  info: "예식 정보 & 지도",
  guestbook: "방명록",
  rsvp: "참석 여부 (RSVP)",
};

export function SectionOrderer({ sections, order, onChange }: SectionOrdererProps) {
  function moveUp(index: number) {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onChange(newOrder);
  }

  function moveDown(index: number) {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onChange(newOrder);
  }

  function toggleSection(sectionId: string) {
    if (sections.required.includes(sectionId)) return;

    if (order.includes(sectionId)) {
      onChange(order.filter((id) => id !== sectionId));
    } else {
      onChange([...order, sectionId]);
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">섹션 순서</Label>
      <p className="text-xs text-muted-foreground">위/아래 버튼으로 순서 변경, 클���으로 표시/숨김</p>
      <div className="space-y-1.5">
        {order.map((id, i) => (
          <div
            key={id}
            className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <button
                className="text-xs px-1 hover:bg-muted rounded disabled:opacity-30"
                onClick={() => moveUp(i)}
                disabled={i === 0}
              >
                ▲
              </button>
              <button
                className="text-xs px-1 hover:bg-muted rounded disabled:opacity-30"
                onClick={() => moveDown(i)}
                disabled={i === order.length - 1}
              >
                ▼
              </button>
            </div>
            <span className="flex-1">{SECTION_LABELS[id] || id}</span>
            {sections.required.includes(id) ? (
              <span className="text-xs text-muted-foreground">필수</span>
            ) : (
              <button
                className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                onClick={() => toggleSection(id)}
              >
                숨김
              </button>
            )}
          </div>
        ))}
        {/* Show hidden sections */}
        {sections.available
          .filter((id) => !order.includes(id))
          .map((id) => (
            <div
              key={id}
              className="flex items-center gap-2 p-2 bg-muted/20 rounded-md text-sm opacity-50"
            >
              <span className="flex-1 ml-8">{SECTION_LABELS[id] || id}</span>
              <button
                className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
                onClick={() => toggleSection(id)}
              >
                표시
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create PreviewFrame**

Create `src/components/editor/PreviewFrame.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { WedgenConfig } from "@/types";

interface PreviewFrameProps {
  templateId: string;
  config: WedgenConfig;
}

export function PreviewFrame({ templateId, config }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Build preview HTML by injecting config into the template
    // We use srcdoc approach: fetch template, inject config, render in iframe
    async function loadPreview() {
      try {
        const [htmlRes, cssRes, jsRes] = await Promise.all([
          fetch(`/templates/${templateId}/index.html`),
          fetch(`/templates/${templateId}/style.css`),
          fetch(`/templates/${templateId}/script.js`),
        ]);

        let html = await htmlRes.text();
        const css = await cssRes.text();
        const js = await jsRes.text();

        // Inject config
        const configScript = `<script>window.__WEDGEN_CONFIG__=${JSON.stringify(config).replace(/<\//g, "<\\/")};</script>`;
        html = html.replace("</head>", `${configScript}</head>`);

        // Inline CSS (replace link tag)
        html = html.replace(
          '<link rel="stylesheet" href="style.css">',
          `<style>${css}</style>`
        );

        // Inline JS (replace script tag)
        html = html.replace(
          '<script src="script.js"></script>',
          `<script>${js}</script>`
        );

        if (iframe) {
          iframe.srcdoc = html;
        }
      } catch (err) {
        console.error("Preview load error:", err);
      }
    }

    loadPreview();
  }, [templateId, config]);

  return (
    <div className="flex items-center justify-center h-full bg-muted/30 p-6">
      <div className="relative w-[375px] h-[667px] bg-white rounded-[2rem] shadow-xl overflow-hidden border-[8px] border-gray-800">
        {/* Device notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10" />
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create BuildBar**

Create `src/components/editor/BuildBar.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { BuildMode } from "@/lib/build-pipeline";

interface BuildBarProps {
  buildMode: BuildMode;
  onBuildModeChange: (mode: BuildMode) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function BuildBar({
  buildMode,
  onBuildModeChange,
  onGenerate,
  isGenerating,
}: BuildBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">빌드 모드:</span>
        <RadioGroup
          value={buildMode}
          onValueChange={(v) => onBuildModeChange(v as BuildMode)}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="tweak" id="mode-tweak" />
            <Label htmlFor="mode-tweak" className="text-sm cursor-pointer">
              Tweak (수정 가능)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="optimized" id="mode-optimized" />
            <Label htmlFor="mode-optimized" className="text-sm cursor-pointer">
              Optimized (배포용)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button onClick={onGenerate} disabled={isGenerating} size="lg">
        {isGenerating ? "생성 중..." : "청첩장 생성 (ZIP)"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Create EditorLayout**

Create `src/components/editor/EditorLayout.tsx`:

```tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { ConfigPanel } from "./ConfigPanel";
import { PreviewFrame } from "./PreviewFrame";
import { BuildBar } from "./BuildBar";
import type { TemplateSchema, WedgenConfig } from "@/types";
import type { BuildMode } from "@/lib/build-pipeline";

interface EditorLayoutProps {
  schema: TemplateSchema;
  templateId: string;
}

export function EditorLayout({ schema, templateId }: EditorLayoutProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    schema.sections.defaultOrder
  );
  const [buildMode, setBuildMode] = useState<BuildMode>("tweak");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Build the preview config from current form state
  const previewConfig: WedgenConfig = useMemo(() => {
    const dataFields: Record<string, unknown> = {};
    const assetFields: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(formData)) {
      if (val instanceof File) {
        assetFields[key] = URL.createObjectURL(val);
      } else if (Array.isArray(val) && val.length > 0 && val[0] instanceof File) {
        assetFields[key] = val.map((f: File) => URL.createObjectURL(f));
      } else {
        dataFields[key] = val;
      }
    }

    return {
      template: templateId,
      locale: schema.i18n.defaultLocale,
      sectionOrder,
      data: dataFields as WedgenConfig["data"],
      style: {
        colorScheme: (formData.colorScheme as string) || schema.style.colorSchemes[0]?.value || "",
        fontPair: (formData.fontPair as string) || schema.style.fonts[0]?.value || "",
        animation: (formData.animation as string) || schema.style.animations[0]?.value || "",
      },
      assets: assetFields as WedgenConfig["assets"],
    };
  }, [formData, sectionOrder, templateId, schema]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const fd = new FormData();
      fd.append("templateId", templateId);
      fd.append("buildMode", buildMode);

      // Separate files from data for the config
      const configData = { ...previewConfig };
      // Replace blob URLs with asset paths for the actual config
      const assets: Record<string, string | string[]> = {};
      const imageKeys: string[] = [];

      for (const [key, val] of Object.entries(formData)) {
        if (val instanceof File) {
          assets[key] = `assets/${key}.webp`;
          fd.append(key, val);
          imageKeys.push(key);
        } else if (Array.isArray(val) && val.length > 0 && val[0] instanceof File) {
          assets[key] = val.map((_: File, i: number) => `assets/${key}-${i + 1}.webp`);
          val.forEach((f: File, i: number) => fd.append(`${key}_${i}`, f));
        }
      }

      configData.assets = assets as WedgenConfig["assets"];
      fd.append("config", JSON.stringify(configData));

      const response = await fetch("/api/generate", { method: "POST", body: fd });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      // Download ZIP
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wedding-invitation.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Generate error:", err);
      alert(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Config Panel */}
        <div className="w-[420px] border-r flex-shrink-0">
          <ConfigPanel
            schema={schema}
            formData={formData}
            sectionOrder={sectionOrder}
            onFieldChange={handleFieldChange}
            onSectionOrderChange={setSectionOrder}
          />
        </div>
        {/* Right: Preview */}
        <div className="flex-1">
          <PreviewFrame templateId={templateId} config={previewConfig} />
        </div>
      </div>
      {/* Bottom: Build Bar */}
      <BuildBar
        buildMode={buildMode}
        onBuildModeChange={setBuildMode}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/editor/
git commit -m "feat: add editor layout with config panel, preview frame, section orderer, and build bar"
```

---

### Task 16: Template Gallery Components

**Files:**
- Create: `src/components/template-gallery/TemplateCard.tsx`
- Create: `src/components/template-gallery/TemplateGrid.tsx`

- [ ] **Step 1: Create TemplateCard**

Create `src/components/template-gallery/TemplateCard.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TemplateMeta } from "@/types";

interface TemplateCardProps {
  template: TemplateMeta;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link href={`/editor/${template.id}`}>
      <Card className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
        <div className="relative h-48 bg-muted">
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            {template.interaction}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create TemplateGrid**

Create `src/components/template-gallery/TemplateGrid.tsx`:

```tsx
import { TemplateCard } from "./TemplateCard";
import type { TemplateMeta } from "@/types";

interface TemplateGridProps {
  templates: TemplateMeta[];
}

export function TemplateGrid({ templates }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">템플릿이 없습니다</p>
        <p className="text-sm mt-2">/templates 디렉토리에 템플릿을 추가하세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/template-gallery/
git commit -m "feat: add template gallery card and grid components"
```

---

### Task 17: Pages (Home + Editor)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/editor/[templateId]/page.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "wedgen — 모바일 청첩장 생성기",
  description: "나만의 모바일 청첩장을 만들어보세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Create home page (template gallery)**

Replace `src/app/page.tsx`:

```tsx
import { scanTemplates } from "@/lib/template-scanner";
import { TemplateGrid } from "@/components/template-gallery/TemplateGrid";
import path from "path";

export default async function HomePage() {
  const templatesDir = path.resolve(process.cwd(), "templates");
  const templates = await scanTemplates(templatesDir);

  const withThumbnails = templates.map((t) => ({
    ...t,
    thumbnail: `/api/templates/${t.id}/thumbnail`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">wedgen</h1>
        <span className="text-xs text-muted-foreground">v1.0.0</span>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">템플릿을 선택하세요</h2>
          <p className="text-sm text-muted-foreground mt-1">
            마음에 드는 스타일을 골라 나만의 청첩장을 만들어보세요
          </p>
        </div>
        <TemplateGrid templates={withThumbnails} />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create editor page**

Create `src/app/editor/[templateId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { parseSchema, resolveFieldOptions } from "@/lib/schema-parser";
import { EditorLayout } from "@/components/editor/EditorLayout";
import Link from "next/link";
import path from "path";
import fs from "fs/promises";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { templateId } = await params;

  const schemaPath = path.resolve(
    process.cwd(),
    "templates",
    templateId,
    "schema.json"
  );

  try {
    await fs.access(schemaPath);
  } catch {
    notFound();
  }

  const rawSchema = await parseSchema(schemaPath);
  const schema = resolveFieldOptions(rawSchema);

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; 템플릿 변경
        </Link>
        <h1 className="text-sm font-bold">wedgen</h1>
        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">
          {schema.name}
        </span>
      </header>
      <div className="flex-1 overflow-hidden">
        <EditorLayout schema={schema} templateId={templateId} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Configure Next.js to serve template static files**

Update `next.config.ts` to add rewrites for template files served from `/templates/`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/templates/:path*",
        destination: "/api/templates/static/:path*",
      },
    ];
  },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
```

Create `src/app/api/templates/static/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.resolve(process.cwd(), "templates", ...segments);

  // Security: prevent directory traversal
  const templatesRoot = path.resolve(process.cwd(), "templates");
  if (!filePath.startsWith(templatesRoot)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
```

- [ ] **Step 5: Verify the app compiles and runs**

Run:
```bash
npm run build
```

Expected: Build completes without errors. If there are errors, fix them.

- [ ] **Step 6: Commit**

```bash
git add src/app/ next.config.ts
git commit -m "feat: add home page (gallery) and editor page with live preview"
```

---

## Phase 6: Remaining Templates

### Task 18: Modern Minimal Template

**Files:**
- Create: `templates/modern-minimal/schema.json`
- Create: `templates/modern-minimal/index.html`
- Create: `templates/modern-minimal/style.css`
- Create: `templates/modern-minimal/script.js`
- Create: `templates/modern-minimal/i18n/ko.json`

- [ ] **Step 1: Create schema.json**

Create `templates/modern-minimal/schema.json` — same structure as elegant-classic but with different metadata and style options:

```json
{
  "id": "modern-minimal",
  "name": "Modern Minimal",
  "description": "미니멀 타이포그래피 기반 페이지 전환 청첩장",
  "version": "1.0.0",
  "thumbnail": "thumbnail.png",
  "interaction": "page",
  "sections": {
    "available": ["hero", "greeting", "gallery", "info", "guestbook", "rsvp"],
    "defaultOrder": ["hero", "greeting", "gallery", "info", "guestbook", "rsvp"],
    "required": ["hero", "info"]
  },
  "fields": {
    "기본 정보": {
      "groomName": { "type": "text", "label": "신랑 이름", "required": true },
      "brideName": { "type": "text", "label": "신부 이름", "required": true },
      "weddingDate": { "type": "datetime", "label": "���식 일시", "required": true },
      "greeting": { "type": "textarea", "label": "인사말", "maxLength": 500 },
      "heroImage": { "type": "image", "label": "대표 사진", "accept": ["jpg", "png", "webp"], "maxSize": "10MB" },
      "couplePhoto": { "type": "image", "label": "커플 사진 (선택)" }
    },
    "갤러리": {
      "photos": { "type": "image[]", "label": "갤러리 사진", "min": 0, "max": 20 }
    },
    "예식 정보": {
      "venue": { "type": "text", "label": "예식장 이름" },
      "address": { "type": "text", "label": "주소" },
      "mapType": { "type": "select", "label": "지도 유��", "options": [{"value":"kakao","label":"카카오맵"},{"value":"naver","label":"네이버지도"},{"value":"none","label":"지도 없음"}] },
      "mapCoords": { "type": "latlng", "label": "좌표" },
      "transport": { "type": "textarea", "label": "교통 안내" },
      "parking": { "type": "text", "label": "주차 안내" }
    },
    "방명록 & RSVP": {
      "guestbookUrl": { "type": "url", "label": "방명록 GAS URL", "validate": "ping" },
      "rsvpUrl": { "type": "url", "label": "RSVP GAS URL", "validate": "ping" },
      "rsvpFields": { "type": "select[]", "label": "RSVP 수집 항목", "options": [{"value":"name","label":"이름"},{"value":"attending","label":"참석 여부"},{"value":"guests","label":"동행 인원"},{"value":"meal","label":"식사 여부"},{"value":"message","label":"한마디"}] }
    },
    "스타일": {
      "colorScheme": { "type": "select", "label": "색상 테마", "optionsFrom": "style.colorSchemes" },
      "fontPair": { "type": "select", "label": "폰트 조합", "optionsFrom": "style.fonts" },
      "animation": { "type": "select", "label": "전환 효과", "options": [{"value":"slide","label":"슬라이드"},{"value":"fade","label":"페이드"},{"value":"none","label":"없음"}] },
      "bgMusic": { "type": "file", "label": "배경음악 (선택)", "accept": ["mp3", "ogg"], "maxSize": "5MB" }
    }
  },
  "style": {
    "colorSchemes": [
      { "value": "mono-black", "label": "모노 블랙", "primary": "#111", "bg": "#fafafa" },
      { "value": "soft-gray", "label": "소프트 그레이", "primary": "#555", "bg": "#f5f5f5" },
      { "value": "warm-beige", "label": "웜 베이지", "primary": "#8b7355", "bg": "#faf6f0" }
    ],
    "fonts": [
      { "value": "wanted-sans", "label": "Wanted Sans" },
      { "value": "pretendard", "label": "Pretendard" },
      { "value": "noto-sans", "label": "Noto Sans KR" }
    ],
    "animations": [
      { "value": "slide", "label": "슬라이드" },
      { "value": "fade", "label": "페이드" },
      { "value": "none", "label": "없음" }
    ]
  },
  "i18n": { "defaultLocale": "ko", "supported": ["ko"] }
}
```

- [ ] **Step 2: Create HTML, CSS, JS, i18n**

These follow the same pattern as elegant-classic but with page-based navigation (swipe between sections), minimal black/white design, bold typography. The implementation agent should:
- Create `index.html` with the same section structure (`data-section` attributes) but add page-based navigation wrapper
- Create `style.css` with minimalist design, full-screen pages, large typography
- Create `script.js` based on the elegant-classic script but replacing scroll animation with page transition (touch swipe / arrow key navigation)
- Copy `i18n/ko.json` from elegant-classic (same strings)
- Create placeholder `thumbnail.png`

The JS should implement a page controller:
- Each `data-section` becomes a full-viewport page
- Swipe up/down or click arrows to transition
- CSS transition for slide or fade based on `style.animation`

- [ ] **Step 3: Commit**

```bash
git add templates/modern-minimal/
git commit -m "feat: add modern-minimal template with page-based navigation"
```

---

### Task 19: Romantic Floral Template

**Files:**
- Create: `templates/romantic-floral/` (all files)

- [ ] **Step 1: Create all template files**

`schema.json`: Same field structure. Unique style options:
```json
{
  "id": "romantic-floral",
  "name": "Romantic Floral",
  "description": "플로럴 일러스트와 파스텔 톤의 로맨틱 청첩장",
  "version": "1.0.0",
  "thumbnail": "thumbnail.png",
  "interaction": "scroll",
  "style": {
    "colorSchemes": [
      { "value": "blush-pink", "label": "블러시 핑크", "primary": "#e8a0bf", "bg": "#fff5f7" },
      { "value": "lavender", "label": "라벤더", "primary": "#967bb6", "bg": "#f8f5ff" },
      { "value": "peach", "label": "피치", "primary": "#ffb07c", "bg": "#fff8f0" }
    ],
    "fonts": [
      { "value": "nanum-gothic-nanum-myeongjo", "label": "나눔고딕 + 나눔명조" },
      { "value": "gowun-batang", "label": "고운바탕" }
    ],
    "animations": [
      { "value": "fade", "label": "페이드 인" },
      { "value": "slide", "label": "슬라이드 업" },
      { "value": "none", "label": "없음" }
    ]
  }
}
```

CSS: Pastel backgrounds, floral decorative borders (CSS pseudo-elements for floral frames), rounded serif fonts, soft shadows.

JS: Same as elegant-classic (scroll-based animation).

- [ ] **Step 2: Commit**

```bash
git add templates/romantic-floral/
git commit -m "feat: add romantic-floral template with pastel floral design"
```

---

### Task 20: Magazine Style Template

**Files:**
- Create: `templates/magazine-style/` (all files)

- [ ] **Step 1: Create all template files**

`schema.json`: Same field structure. Unique:
```json
{
  "id": "magazine-style",
  "name": "Magazine Style",
  "description": "매거진 레이아웃과 볼드 타이포그래피 청첩장",
  "version": "1.0.0",
  "thumbnail": "thumbnail.png",
  "interaction": "scroll",
  "style": {
    "colorSchemes": [
      { "value": "editorial-bw", "label": "에디토리얼 B&W", "primary": "#000", "bg": "#fff" },
      { "value": "gold-accent", "label": "골드 악센트", "primary": "#c9a96e", "bg": "#1a1a1a" },
      { "value": "terracotta", "label": "테라코타", "primary": "#c2703e", "bg": "#f5ebe0" }
    ],
    "fonts": [
      { "value": "montserrat-playfair", "label": "Montserrat + Playfair" },
      { "value": "inter-dm-serif", "label": "Inter + DM Serif Display" }
    ],
    "animations": [
      { "value": "reveal", "label": "리빌 (clip)" },
      { "value": "fade", "label": "페이드 인" },
      { "value": "none", "label": "없음" }
    ]
  }
}
```

CSS: Bold asymmetric layout, large display typography, full-bleed images, editorial grid.

JS: Scroll-based with "reveal" animation (CSS clip-path).

- [ ] **Step 2: Commit**

```bash
git add templates/magazine-style/
git commit -m "feat: add magazine-style template with editorial layout"
```

---

### Task 21: Cinematic Scroll Template

**Files:**
- Create: `templates/cinematic-scroll/` (all files)

- [ ] **Step 1: Create all template files**

`schema.json`: Same field structure. Unique:
```json
{
  "id": "cinematic-scroll",
  "name": "Cinematic Scroll",
  "description": "시네마틱 패럴랙스 효과의 풀스크린 청첩장",
  "version": "1.0.0",
  "thumbnail": "thumbnail.png",
  "interaction": "parallax",
  "style": {
    "colorSchemes": [
      { "value": "dark-cinema", "label": "다크 시네마", "primary": "#e0c097", "bg": "#0a0a0a" },
      { "value": "midnight-blue", "label": "미드나잇 블루", "primary": "#a8c8e8", "bg": "#0d1b2a" },
      { "value": "forest-night", "label": "포레스트 나이트", "primary": "#90b77d", "bg": "#1a1a1a" }
    ],
    "fonts": [
      { "value": "cormorant-inter", "label": "Cormorant Garamond + Inter" },
      { "value": "playfair-lato", "label": "Playfair Display + Lato" }
    ],
    "animations": [
      { "value": "parallax", "label": "패럴랙스" },
      { "value": "fade", "label": "페이드 인" },
      { "value": "none", "label": "없음" }
    ]
  }
}
```

CSS: Dark theme, full-viewport sections, parallax background images, cinematic vignette overlays, light-on-dark text.

JS: Parallax scroll controller — background images scroll at different speed than content. `requestAnimationFrame` based.

- [ ] **Step 2: Commit**

```bash
git add templates/cinematic-scroll/
git commit -m "feat: add cinematic-scroll template with parallax effects"
```

---

## Phase 7: Integration & Verification

### Task 22: End-to-End Verification

- [ ] **Step 1: Run all unit tests**

Run:
```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Start dev server and verify template gallery**

Run:
```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- All 5 templates appear as cards in the grid
- Each card shows name, description, interaction badge
- Clicking a card navigates to `/editor/{templateId}`

- [ ] **Step 3: Verify editor workflow**

Navigate to `/editor/elegant-classic`. Verify:
- Left panel shows tabbed form (기본 정보, 갤러리, 예식 정보, 방명록 & RSVP, 스타일)
- Fields render correctly per type (text, textarea, datetime, image, select, etc.)
- Right panel shows mobile preview frame with iframe
- Typing in fields updates the preview in real-time
- Section orderer allows reordering and toggling sections
- Build mode radio buttons work (Tweak / Optimized)

- [ ] **Step 4: Verify ZIP generation (Tweak mode)**

Fill in basic fields (names, date, venue). Click "청첩장 생성 (ZIP)" with Tweak mode.
- ZIP downloads
- Unzip and open `index.html` in browser
- Code is readable (not minified)
- Config data is injected correctly
- Wedding invitation renders with the entered data

- [ ] **Step 5: Verify ZIP generation (Optimized mode)**

Switch to Optimized mode and generate again.
- ZIP downloads
- Unzip: `index.html`, `style.css`, `script.js` are minified
- Opening `index.html` still works correctly

- [ ] **Step 6: Verify image processing**

Upload a hero image and gallery photos. Generate ZIP.
- `assets/` folder contains WebP files
- Hero image is <= 1200x1600
- Gallery images are <= 800x800

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: finalize wedgen v1.0.0 — all templates, UI, and build pipeline complete"
```
