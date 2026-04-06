/** @fileOverview SEO 유틸리티 - 메타데이터, OpenGraph, structured data 관리 */

import type { Metadata, Viewport } from "next";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  canonical?: string;
  robots?: string;
  og?: OpenGraphData;
  twitter?: TwitterCardData;
  alternates?: AlternateLanguage[];
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  type?: "website" | "article" | "profile" | "book";
  url?: string;
  siteName?: string;
  locale?: string;
  images?: OGImage[];
}

export interface OGImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface TwitterCardData {
  card?: "summary" | "summary_large_image" | "app" | "player";
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface AlternateLanguage {
  hrefLang: string;
  href: string;
}

export interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

// ============================================================================
// Metadata Generators
// ============================================================================

/**
 * 기본 메타데이터 생성
 * @param data SEO 데이터
 * @returns Next.js Metadata 객체
 * 
 * @example
 * export const metadata = createMetadata({
 *   title: "청첩장 만들기",
 *   description: "나만의 특별한 모바일 청첩장을 만들어보세요"
 * });
 */
export function createMetadata(data: SEOMetadata): Metadata {
  const {
    title,
    description,
    keywords,
    author,
    canonical,
    robots = "index, follow",
    og,
    twitter,
    alternates,
  } = data;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    robots,
    alternates: {
      canonical,
      languages: alternates?.reduce(
        (acc, alt) => {
          acc[alt.hrefLang] = alt.href;
          return acc;
        },
        {} as Record<string, string>
      ),
    },
    openGraph: og
      ? {
          title: og.title || title,
          description: og.description || description,
          type: og.type || "website",
          url: og.url,
          siteName: og.siteName || title,
          locale: og.locale || "ko_KR",
          images: og.images,
        }
      : undefined,
    twitter: twitter
      ? {
          card: twitter.card || "summary_large_image",
          site: twitter.site,
          creator: twitter.creator,
          title: twitter.title || title,
          description: twitter.description || description,
          images: twitter.image ? [twitter.image] : undefined,
        }
      : undefined,
  };
}

/**
 * 기본 뷰포트 설정
 */
export const defaultViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// ============================================================================
// Structured Data (JSON-LD)
// ============================================================================

/**
 * Organization structured data 생성
 * @param name 조직 이름
 * @param url 웹사이트 URL
 * @param logo 로고 URL
 */
export function createOrganizationSchema(
  name: string,
  url: string,
  logo?: string
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: logo || `${url}/logo.png`,
  };
}

/**
 * Product structured data 생성
 * @param name 제품 이름
 * @param description 제품 설명
 * @param image 이미지 URL
 * @param offers 가격 정보
 */
export function createProductSchema(
  name: string,
  description: string,
  image: string,
  offers?: {
    price: number;
    priceCurrency: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
  }
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    offers: offers
      ? {
          "@type": "Offer",
          price: offers.price,
          priceCurrency: offers.priceCurrency,
          availability: `https://schema.org/${offers.availability || "InStock"}`,
        }
      : undefined,
  };
}

/**
 * Event structured data 생성 (청첩장용)
 * @param name 이벤트 이름
 * @param startDate 시작 날짜
 * @param location 장소
 * @param description 설명
 */
export function createEventSchema(
  name: string,
  startDate: string,
  location: {
    name: string;
    address: string;
  },
  description?: string
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    startDate,
    description,
    location: {
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.address,
      },
    },
  };
}

/**
 * FAQ structured data 생성
 * @param items FAQ 아이템들
 */
export function createFAQSchema(
  items: Array<{ question: string; answer: string }>
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Breadcrumb structured data 생성
 * @param items 브레드크럼 아이템들
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Structured data를 script 태그로 렌더링
 * @param data Structured data
 * @returns JSON-LD script string
 */
export function renderStructuredData(data: StructuredData): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

// ============================================================================
// URL & Canonical Helpers
// ============================================================================

/**
 * canonical URL 생성
 * @param path 경로
 * @param baseUrl 기본 URL
 */
export function createCanonicalUrl(path: string, baseUrl = "https://wedgen.app"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`.replace(/\/$/, "");
}

/**
 * OG 이미지 URL 생성
 * @param templateId 템플릿 ID
 * @param params 추가 파라미터
 * @param baseUrl 기본 URL
 */
export function createOGImageUrl(
  templateId?: string,
  params?: Record<string, string>,
  baseUrl = "https://wedgen.app"
): string {
  const searchParams = new URLSearchParams();

  if (templateId) {
    searchParams.set("template", templateId);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  const query = searchParams.toString();
  return `${baseUrl}/api/og${query ? `?${query}` : ""}`;
}

// ============================================================================
// SEO Utilities
// ============================================================================

/**
 * 메타 설명 최적화 (최대 160자)
 * @param description 원본 설명
 * @returns 최적화된 설명
 */
export function optimizeDescription(description: string): string {
  const maxLength = 160;
  if (description.length <= maxLength) return description;

  // 문장 단위로 자르기
  const sentences = description.split(/[.!?]/);
  let result = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const potential = result ? `${result}. ${trimmed}` : trimmed;
    if (potential.length > maxLength) break;
    result = potential;
  }

  return result ? `${result}.` : description.slice(0, maxLength - 3) + "...";
}

/**
 * 키워드 밀도 계산
 * @param content 콘텐츠
 * @param keyword 키워드
 */
export function calculateKeywordDensity(content: string, keyword: string): number {
  const words = content.toLowerCase().split(/\s+/);
  const keywordCount = words.filter((word) => word.includes(keyword.toLowerCase())).length;
  return (keywordCount / words.length) * 100;
}

/**
* 페이지 제목 생성
* @param pageTitle 페이지 제목
* @param siteName 사이트 이름
*/
export function createPageTitle(pageTitle: string, siteName: string): string {
 return pageTitle === siteName ? siteName : `${pageTitle} | ${siteName}`;
}

// ============================================================================
// Export
// ============================================================================

const seo = {
  createMetadata,
  defaultViewport,
  createOrganizationSchema,
  createProductSchema,
  createEventSchema,
  createFAQSchema,
  createBreadcrumbSchema,
  renderStructuredData,
  createCanonicalUrl,
  createOGImageUrl,
  optimizeDescription,
  calculateKeywordDensity,
  createPageTitle,
};

export default seo;
