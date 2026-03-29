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

export interface FontOption extends SelectOption {
  provider: "google";
  importUrl: string;
  family: string;
  previewText?: string;
}

export interface FieldVisibilityRule {
  field: string;
  equals: string | string[];
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
  visibleWhen?: FieldVisibilityRule;
}

export interface SectionConfig {
  available: string[];
  defaultOrder: string[];
  required: string[];
}

export interface StyleConfig {
  colorSchemes: ColorSchemeOption[];
  headingFonts: FontOption[];
  bodyFonts: FontOption[];
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
