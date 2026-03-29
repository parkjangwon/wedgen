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

export interface ResolvedFontPreset {
  mode: "preset" | "custom";
  provider: "google";
  importUrl: string;
  headingFamily: string;
  bodyFamily: string;
  headingValue?: string;
  bodyValue?: string;
}

export interface WedgenConfigStyle {
  colorScheme: string;
  fontSourceMode: string;
  headingFont: string;
  bodyFont: string;
  googleFontUrl?: string;
  customHeadingFamily?: string;
  customBodyFamily?: string;
  animation: string;
  fontPreset?: ResolvedFontPreset;
  [key: string]: string | ResolvedFontPreset | undefined;
}

export interface WedgenConfigAssets {
  heroImage?: string;
  couplePhoto?: string;
  photos?: string[];
  bgMusic?: string;
  [key: string]: string | string[] | undefined;
}

export interface WedgenConfig {
  template: string;
  locale: string;
  sectionOrder: string[];
  data: WedgenConfigData;
  style: WedgenConfigStyle;
  assets: WedgenConfigAssets;
}

export interface WedgenDraftInput {
  locale: string;
  sectionOrder: string[];
  data: WedgenConfigData;
  style: WedgenConfigStyle;
  assets?: WedgenConfigAssets;
}
