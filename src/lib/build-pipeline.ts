import archiver from "archiver";
import fs from "node:fs/promises";
import path from "node:path";
import { PassThrough } from "node:stream";
import { injectConfigIntoHtml } from "@/lib/config-injector";
import { processImageAssets } from "@/lib/image-processor";
import { optimizeAssets, type BuildMode } from "@/lib/optimizers";
import { loadTemplateBundle } from "@/lib/schema-parser";
import type {
  FontOption,
  ResolvedFontPreset,
  WedgenConfig,
  WedgenDraftInput,
} from "@/types";

type UploadMap = Record<string, File | File[] | undefined>;

export interface BuildInvitationOptions {
  templateId: string;
  buildMode: BuildMode;
  config: WedgenDraftInput;
  files: UploadMap;
  templatesDir?: string;
}

export interface BuildArtifact {
  zipBuffer: Buffer;
  files: Map<string, string | Buffer>;
  runtimeConfig: WedgenConfig;
}

function normalizeSectionOrder(
  requestedOrder: string[],
  available: string[],
  required: string[],
): string[] {
  const deduped = requestedOrder.filter(
    (section, index) =>
      available.includes(section) && requestedOrder.indexOf(section) === index,
  );

  for (const section of required) {
    if (!deduped.includes(section)) {
      deduped.push(section);
    }
  }

  for (const section of available) {
    if (!deduped.includes(section)) {
      deduped.push(section);
    }
  }

  return deduped;
}

function ensureRequiredFields(config: WedgenDraftInput): void {
  const requiredFields = ["groomName", "brideName", "weddingDate"];
  for (const field of requiredFields) {
    if (!config.data[field]) {
      throw new Error(`필수 입력값이 비어 있습니다: ${field}`);
    }
  }
}

function mergeGoogleFontImports(fonts: FontOption[]): string {
  const families = new Set<string>();

  for (const font of fonts) {
    const url = new URL(font.importUrl);
    for (const family of url.searchParams.getAll("family")) {
      families.add(family);
    }
  }

  const params = new URLSearchParams();
  for (const family of families) {
    params.append("family", family);
  }
  params.set("display", "swap");

  return `https://fonts.googleapis.com/css2?${params.toString()}`;
}

function resolveFontChoice(
  availableFonts: FontOption[],
  requestedValue: string,
): FontOption {
  return (
    availableFonts.find((font) => font.value === requestedValue) ?? availableFonts[0]
  );
}

function resolveFontPreset(
  styleConfig: WedgenDraftInput["style"],
  headingFonts: FontOption[],
  bodyFonts: FontOption[],
): ResolvedFontPreset {
  if (
    styleConfig.fontSourceMode === "custom" &&
    styleConfig.googleFontUrl &&
    styleConfig.customHeadingFamily &&
    styleConfig.customBodyFamily
  ) {
    return {
      mode: "custom",
      provider: "google",
      importUrl: styleConfig.googleFontUrl,
      headingFamily: styleConfig.customHeadingFamily,
      bodyFamily: styleConfig.customBodyFamily,
    };
  }

  const headingFont = resolveFontChoice(headingFonts, styleConfig.headingFont);
  const bodyFont = resolveFontChoice(bodyFonts, styleConfig.bodyFont);

  return {
    mode: "preset",
    provider: "google",
    importUrl: mergeGoogleFontImports([headingFont, bodyFont]),
    headingFamily: headingFont.family,
    bodyFamily: bodyFont.family,
    headingValue: headingFont.value,
    bodyValue: bodyFont.value,
  };
}

async function createZipBuffer(files: Map<string, string | Buffer>): Promise<Buffer> {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  const result = new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    archive.on("error", reject);
  });

  archive.pipe(stream);

  for (const [filePath, content] of files) {
    archive.append(content, { name: filePath });
  }

  await archive.finalize();
  return result;
}

function inlineAssetsIntoHtml(html: string, css: string, script: string): string {
  const withCss = html.replace(
    /<link\s+rel="stylesheet"\s+href="style\.css"\s*\/?>/,
    `<style>${css}</style>`,
  );

  return withCss.replace(
    /<script\s+src="script\.js"\s+defer><\/script>/,
    `<script>${script}</script>`,
  );
}

export async function buildPreviewDocument(
  templateId: string,
  config: WedgenDraftInput,
  templatesDir = path.resolve(process.cwd(), "templates"),
): Promise<string> {
  const bundle = await loadTemplateBundle(templateId, templatesDir);
  const runtimeConfig: WedgenConfig = {
    template: templateId,
    locale: config.locale || bundle.schema.i18n.defaultLocale,
    sectionOrder: normalizeSectionOrder(
      config.sectionOrder,
      bundle.schema.sections.available,
      bundle.schema.sections.required,
    ),
    data: config.data,
    style: {
      colorScheme:
        config.style.colorScheme || bundle.schema.style.colorSchemes[0]?.value || "",
      fontSourceMode: config.style.fontSourceMode || "preset",
      headingFont:
        config.style.headingFont || bundle.schema.style.headingFonts[0]?.value || "",
      bodyFont: config.style.bodyFont || bundle.schema.style.bodyFonts[0]?.value || "",
      googleFontUrl: config.style.googleFontUrl,
      customHeadingFamily: config.style.customHeadingFamily,
      customBodyFamily: config.style.customBodyFamily,
      fontPreset: resolveFontPreset(
        config.style,
        bundle.schema.style.headingFonts,
        bundle.schema.style.bodyFonts,
      ),
      animation:
        config.style.animation || bundle.schema.style.animations[0]?.value || "fade",
    },
    assets: config.assets ?? {},
  };

  return inlineAssetsIntoHtml(
    injectConfigIntoHtml(bundle.html, runtimeConfig),
    bundle.css,
    bundle.script,
  );
}

export async function buildInvitationArchive(
  options: BuildInvitationOptions,
): Promise<BuildArtifact> {
  ensureRequiredFields(options.config);

  const templatesDir = options.templatesDir ?? path.resolve(process.cwd(), "templates");
  const bundle = await loadTemplateBundle(options.templateId, templatesDir);
  const processedAssets = await processImageAssets(options.files);

  const runtimeConfig: WedgenConfig = {
    template: bundle.schema.id,
    locale: options.config.locale || bundle.schema.i18n.defaultLocale,
    sectionOrder: normalizeSectionOrder(
      options.config.sectionOrder,
      bundle.schema.sections.available,
      bundle.schema.sections.required,
    ),
    data: options.config.data,
    style: {
      colorScheme:
        options.config.style.colorScheme ||
        bundle.schema.style.colorSchemes[0]?.value ||
        "",
      fontSourceMode: options.config.style.fontSourceMode || "preset",
      headingFont:
        options.config.style.headingFont ||
        bundle.schema.style.headingFonts[0]?.value ||
        "",
      bodyFont:
        options.config.style.bodyFont || bundle.schema.style.bodyFonts[0]?.value || "",
      googleFontUrl: options.config.style.googleFontUrl,
      customHeadingFamily: options.config.style.customHeadingFamily,
      customBodyFamily: options.config.style.customBodyFamily,
      fontPreset: resolveFontPreset(
        options.config.style,
        bundle.schema.style.headingFonts,
        bundle.schema.style.bodyFonts,
      ),
      animation:
        options.config.style.animation ||
        bundle.schema.style.animations[0]?.value ||
        "fade",
    },
    assets: processedAssets.configAssets,
  };

  const optimized = await optimizeAssets(
    {
      html: injectConfigIntoHtml(bundle.html, runtimeConfig),
      css: bundle.css,
      js: bundle.script,
    },
    options.buildMode,
  );

  const files = new Map<string, string | Buffer>();
  files.set("index.html", optimized.html);
  files.set("style.css", optimized.css);
  files.set("script.js", optimized.js);
  files.set("schema.json", JSON.stringify(bundle.schema, null, 2));

  const defaultLocale = bundle.schema.i18n.defaultLocale;
  const localePath = path.join(
    templatesDir,
    bundle.schema.id,
    "i18n",
    `${defaultLocale}.json`,
  );
  files.set(`i18n/${defaultLocale}.json`, await fs.readFile(localePath, "utf-8"));

  for (const [assetPath, content] of processedAssets.outputFiles) {
    files.set(assetPath, content);
  }

  return {
    zipBuffer: await createZipBuffer(files),
    files,
    runtimeConfig,
  };
}
