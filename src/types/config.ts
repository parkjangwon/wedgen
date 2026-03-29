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
  [key: string]: string;
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
