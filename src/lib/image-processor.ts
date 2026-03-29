import path from "node:path";
import sharp from "sharp";
import type { WedgenConfigAssets } from "@/types";

export interface ProcessAssetResult {
  configAssets: WedgenConfigAssets;
  outputFiles: Map<string, Buffer>;
}

type FileLike = File | File[] | undefined;

function sanitizeBaseName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function convertImage(
  file: File,
  fieldName: string,
  index = 0,
): Promise<{ outputPath: string; buffer: Buffer }> {
  const input = Buffer.from(await file.arrayBuffer());
  const transformer = sharp(input).rotate();

  if (fieldName === "heroImage") {
    transformer.resize(1200, 1600, { fit: "cover" });
  } else if (fieldName === "photos") {
    transformer.resize(800, 800, { fit: "cover" });
  } else {
    transformer.resize(1200, 1200, { fit: "inside", withoutEnlargement: true });
  }

  const fileName =
    fieldName === "heroImage"
      ? "hero"
      : fieldName === "couplePhoto"
        ? "couple-photo"
        : fieldName === "photos"
          ? `gallery-${index + 1}`
          : `${sanitizeBaseName(file.name) || fieldName}-${index + 1}`;

  return {
    outputPath: `assets/${fileName}.webp`,
    buffer: await transformer.webp({
      quality: fieldName === "photos" ? 80 : 85,
    }).toBuffer(),
  };
}

async function keepOriginalFile(file: File): Promise<{ outputPath: string; buffer: Buffer }> {
  const extension = path.extname(file.name) || ".bin";
  const baseName = sanitizeBaseName(file.name) || "asset";

  return {
    outputPath: `assets/${baseName}${extension}`,
    buffer: Buffer.from(await file.arrayBuffer()),
  };
}

export async function processImageAssets(files: Record<string, FileLike>): Promise<ProcessAssetResult> {
  const outputFiles = new Map<string, Buffer>();
  const configAssets: WedgenConfigAssets = {};

  for (const [fieldName, input] of Object.entries(files)) {
    if (!input) {
      continue;
    }

    if (Array.isArray(input)) {
      const outputPaths: string[] = [];
      for (const [index, file] of input.entries()) {
        const processed = file.type.startsWith("image/")
          ? await convertImage(file, fieldName, index)
          : await keepOriginalFile(file);

        outputFiles.set(processed.outputPath, processed.buffer);
        outputPaths.push(processed.outputPath);
      }

      configAssets[fieldName] = outputPaths;
      continue;
    }

    const processed = input.type.startsWith("image/")
      ? await convertImage(input, fieldName)
      : await keepOriginalFile(input);

    outputFiles.set(processed.outputPath, processed.buffer);
    configAssets[fieldName] = processed.outputPath;
  }

  return {
    configAssets,
    outputFiles,
  };
}
