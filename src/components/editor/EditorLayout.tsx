"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BuildBar } from "@/components/editor/BuildBar";
import { ConfigPanel } from "@/components/editor/ConfigPanel";
import { PreviewFrame } from "@/components/editor/PreviewFrame";
import {
  appendFiles,
  fileToDataUrl,
  filesToDataUrls,
  moveItem,
  removeItem,
} from "@/lib/gallery-assets";
import type { BuildMode } from "@/lib/optimizers";
import type {
  TemplateMeta,
  TemplateSchema,
  WedgenConfigAssets,
  WedgenConfigData,
  WedgenConfigStyle,
  WedgenDraftInput,
} from "@/types";

type EditorDraft = WedgenDraftInput & {
  files: Record<string, File | File[] | undefined>;
};

const sampleValues: Record<string, unknown> = {
  groomName: "김민수",
  brideName: "이수진",
  weddingDate: "2026-05-15T14:00",
  greeting: "서로 다른 시간과 취향으로 살아온 두 사람이 같은 방향을 바라보게 되었습니다. 따뜻한 축복으로 함께해 주세요.",
  venue: "그랜드볼룸",
  address: "서울 강남구 테헤란로 1",
  transport: "2호선 역삼역 4번 출구 도보 5분",
  parking: "예식장 지하주차장 2시간 무료",
  mapType: "kakao",
  mapCoords: { lat: "37.5012", lng: "127.0396" },
  rsvpFields: ["name", "attending", "guests"],
  guestbookUrl: "",
  rsvpUrl: "",
};

function createInitialDraft(schema: TemplateSchema): EditorDraft {
  const data = {} as WedgenConfigData;
  const style = {} as WedgenConfigStyle;

  for (const [tabName, fields] of Object.entries(schema.fields)) {
    const isStyleTab = tabName === "스타일";
    for (const [fieldKey, field] of Object.entries(fields)) {
      if (isStyleTab) {
        style[fieldKey] = field.options?.[0]?.value ?? "";
        continue;
      }

      if (field.type === "select") {
        data[fieldKey] = sampleValues[fieldKey] ?? field.options?.[0]?.value ?? "";
      } else if (field.type === "select[]") {
        data[fieldKey] = Array.isArray(sampleValues[fieldKey])
          ? sampleValues[fieldKey]
          : [];
      } else if (field.type === "latlng") {
        data[fieldKey] =
          (sampleValues[fieldKey] as { lat: string; lng: string } | undefined) ?? {
            lat: "",
            lng: "",
          };
      } else {
        data[fieldKey] = sampleValues[fieldKey] ?? "";
      }
    }
  }

  return {
    locale: schema.i18n.defaultLocale,
    sectionOrder: schema.sections.defaultOrder,
    data,
    style,
    assets: {} as WedgenConfigAssets,
    files: {},
  };
}

function revokeAsset(asset: string | string[] | undefined) {
  if (!asset) {
    return;
  }

  if (Array.isArray(asset)) {
    asset.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    return;
  }

  if (asset.startsWith("blob:")) {
    URL.revokeObjectURL(asset);
  }
}

export function EditorLayout({
  meta,
  schema,
}: {
  meta: TemplateMeta;
  schema: TemplateSchema;
}) {
  const [draft, setDraft] = useState<EditorDraft>(() => createInitialDraft(schema));
  const draftRef = useRef(draft);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState<BuildMode>("optimized");
  const [buildPending, setBuildPending] = useState(false);
  const [buildMessage, setBuildMessage] = useState<string | null>(null);
  const deferredDraft = useDeferredValue(draft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const controller = new AbortController();

    async function requestPreview() {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            templateId: meta.id,
            config: {
              locale: deferredDraft.locale,
              sectionOrder: deferredDraft.sectionOrder,
              data: deferredDraft.data,
              style: deferredDraft.style,
              assets: deferredDraft.assets,
            },
          }),
        });

        const payload = (await response.json()) as { html?: string; error?: string };
        if (!response.ok || !payload.html) {
          throw new Error(payload.error || "미리보기를 불러오지 못했습니다.");
        }

        setPreviewHtml(payload.html);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPreviewError(error instanceof Error ? error.message : "미리보기 오류");
        }
      } finally {
        if (!controller.signal.aborted) {
          setPreviewLoading(false);
        }
      }
    }

    void requestPreview();
    return () => controller.abort();
  }, [deferredDraft, meta.id]);

  useEffect(() => {
    return () => {
      Object.values(draft.assets ?? {}).forEach((asset) => revokeAsset(asset));
    };
  }, [draft.assets]);

  async function generateZip() {
    setBuildPending(true);
    setBuildMessage(null);

    try {
      const formData = new FormData();
      formData.set("templateId", meta.id);
      formData.set("buildMode", buildMode);
      formData.set(
        "config",
        JSON.stringify({
          locale: draft.locale,
          sectionOrder: draft.sectionOrder,
          data: draft.data,
          style: draft.style,
        } satisfies WedgenDraftInput),
      );

      for (const [fieldKey, fileValue] of Object.entries(draft.files)) {
        if (!fileValue) {
          continue;
        }

        if (Array.isArray(fileValue)) {
          fileValue.forEach((file) => formData.append(`asset:${fieldKey}`, file));
          continue;
        }

        formData.append(`asset:${fieldKey}`, fileValue);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "ZIP 생성에 실패했습니다.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${meta.id}-${buildMode}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setBuildMessage("정적 ZIP이 생성되었습니다.");
    } catch (error) {
      setBuildMessage(error instanceof Error ? error.message : "생성 오류");
    } finally {
      setBuildPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-5 py-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            템플릿 갤러리로
          </Link>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-primary/70">
              편집 워크스페이스
            </p>
            <h1 className="mt-1 text-4xl tracking-[-0.04em]">{meta.name}</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{meta.description}</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-black/5 bg-white/68 p-4 shadow-[0_28px_80px_rgba(92,55,38,0.1)] backdrop-blur">
          <ConfigPanel
            schema={schema}
            values={{
              data: draft.data,
              style: draft.style,
              sectionOrder: draft.sectionOrder,
            }}
            assets={draft.assets ?? {}}
            onValueChange={(fieldKey, nextValue, tabName) => {
              startTransition(() => {
                setDraft((current) => ({
                  ...current,
                  [tabName === "스타일" ? "style" : "data"]: {
                    ...(tabName === "스타일" ? current.style : current.data),
                    [fieldKey]: nextValue,
                  },
                }));
              });
            }}
            onFileChange={(fieldKey, nextValue) => {
              void (async () => {
                if (Array.isArray(nextValue)) {
                  const currentFiles = draftRef.current.files[fieldKey];
                  const existingFiles = Array.isArray(currentFiles)
                    ? currentFiles
                    : [];
                  const mergedFiles = appendFiles(existingFiles, nextValue);

                  const previewUrls = await filesToDataUrls(mergedFiles);
                  startTransition(() => {
                    setDraft((current) => ({
                      ...current,
                      assets: {
                        ...(current.assets ?? {}),
                        [fieldKey]: previewUrls,
                      },
                      files: {
                        ...current.files,
                        [fieldKey]: mergedFiles,
                      },
                    }));
                  });
                  return;
                }

                if (!nextValue) {
                  startTransition(() => {
                    setDraft((current) => {
                      revokeAsset(current.assets?.[fieldKey]);
                      const nextAssets = { ...(current.assets ?? {}) };
                      const nextFiles = { ...current.files };
                      delete nextAssets[fieldKey];
                      delete nextFiles[fieldKey];
                      return { ...current, assets: nextAssets, files: nextFiles };
                    });
                  });
                  return;
                }

                const previewUrl = await fileToDataUrl(nextValue);
                startTransition(() => {
                  setDraft((current) => ({
                    ...current,
                    assets: {
                      ...(current.assets ?? {}),
                      [fieldKey]: previewUrl,
                    },
                    files: {
                      ...current.files,
                      [fieldKey]: nextValue,
                    },
                  }));
                });
              })();
            }}
            onArrayMove={(fieldKey, fromIndex, toIndex) => {
              startTransition(() => {
                setDraft((current) => {
                  const existingFiles = Array.isArray(current.files[fieldKey])
                    ? (current.files[fieldKey] as File[])
                    : [];
                  const existingAssets = Array.isArray(current.assets?.[fieldKey])
                    ? (current.assets?.[fieldKey] as string[])
                    : [];

                  return {
                    ...current,
                    files: {
                      ...current.files,
                      [fieldKey]: moveItem(existingFiles, fromIndex, toIndex),
                    },
                    assets: {
                      ...(current.assets ?? {}),
                      [fieldKey]: moveItem(existingAssets, fromIndex, toIndex),
                    },
                  };
                });
              });
            }}
            onArrayRemove={(fieldKey, index) => {
              startTransition(() => {
                setDraft((current) => {
                  const existingFiles = Array.isArray(current.files[fieldKey])
                    ? (current.files[fieldKey] as File[])
                    : [];
                  const existingAssets = Array.isArray(current.assets?.[fieldKey])
                    ? (current.assets?.[fieldKey] as string[])
                    : [];

                  return {
                    ...current,
                    files: {
                      ...current.files,
                      [fieldKey]: removeItem(existingFiles, index),
                    },
                    assets: {
                      ...(current.assets ?? {}),
                      [fieldKey]: removeItem(existingAssets, index),
                    },
                  };
                });
              });
            }}
            onSectionOrderChange={(nextOrder) =>
              setDraft((current) => ({ ...current, sectionOrder: nextOrder }))
            }
          />
        </aside>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-black/5 bg-white/55 p-6 shadow-[0_28px_80px_rgba(92,55,38,0.08)] backdrop-blur">
            <PreviewFrame
              html={previewHtml}
              loading={previewLoading}
              error={previewError}
              templateName={meta.name}
            />
          </div>
          <BuildBar
            buildMode={buildMode}
            onBuildModeChange={setBuildMode}
            onGenerate={generateZip}
            pending={buildPending}
            message={buildMessage}
          />
        </section>
      </section>
    </main>
  );
}
