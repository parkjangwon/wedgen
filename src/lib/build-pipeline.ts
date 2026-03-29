import archiver from "archiver";
import fs from "node:fs/promises";
import path from "node:path";
import { PassThrough } from "node:stream";
import { injectConfigIntoHtml } from "@/lib/config-injector";
import { processImageAssets } from "@/lib/image-processor";
import { optimizeAssets, type BuildMode } from "@/lib/optimizers";
import { loadTemplateBundle } from "@/lib/schema-parser";
import type { WedgenConfig, WedgenDraftInput } from "@/types";

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
      fontPair: config.style.fontPair || bundle.schema.style.fonts[0]?.value || "",
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
      fontPair: options.config.style.fontPair || bundle.schema.style.fonts[0]?.value || "",
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
