function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(arrayBuffer).toString("base64");
  }

  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export function appendFiles(existing: File[], incoming: File[]): File[] {
  return [...existing, ...incoming];
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function removeItem<T>(items: T[], index: number): T[] {
  if (index < 0 || index >= items.length) {
    return items;
  }

  return items.filter((_, currentIndex) => currentIndex !== index);
}

export async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const mimeType = file.type || "application/octet-stream";
  return `data:${mimeType};base64,${base64}`;
}

export async function filesToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => fileToDataUrl(file)));
}
