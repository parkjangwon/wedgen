"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutTemplate, PenSquare, SlidersHorizontal } from "lucide-react";
import { BuildBar } from "@/components/editor/BuildBar";
import { ConfigPanel } from "@/components/editor/ConfigPanel";
import { ManualComposerPanel } from "@/components/editor/ManualComposerPanel";
import { PreviewFrame } from "@/components/editor/PreviewFrame";
import { TemplateModePanel } from "@/components/editor/TemplateModePanel";
import {
  type PreviewBackdrop,
  type PreviewDevice,
} from "@/components/editor/preview-utils";
import {
  appendFiles,
  dataUrlToFile,
  fileToDataUrl,
  filesToDataUrls,
  moveItem,
  removeItem,
} from "@/lib/gallery-assets";
import type { BuildMode } from "@/lib/optimizers";
import { mergeSectionOrder } from "@/lib/sections";
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
  heroEyebrow: "Wedding day",
  heroTagline: "서로의 계절이 된 두 사람이 평생의 약속을 나눕니다.",
  greeting: "서로 다른 시간과 취향으로 살아온 두 사람이 같은 방향을 바라보게 되었습니다. 따뜻한 축복으로 함께해 주세요.",
  greetingTitle: "소중한 분들을 초대합니다",
  groomFather: "김건호",
  groomMother: "이미자",
  brideFather: "이주명",
  brideMother: "유수지",
  groomContact: "010-1234-5678",
  brideContact: "010-2345-6789",
  familyNote: "양가 부모님과 함께 감사한 마음으로 초대의 말씀을 전합니다.",
  venue: "그랜드볼룸",
  hallDetail: "3층 그랜드홀",
  address: "서울 강남구 테헤란로 1",
  venuePhone: "02-1234-5678",
  transport: "2호선 역삼역 4번 출구 도보 5분",
  parking: "예식장 지하주차장 2시간 무료",
  scheduleTitle: "예식 일정",
  scheduleNote: "예식 종료 후 같은 층 연회장에서 식사가 이어집니다.",
  countdownLabel: "저희의 결혼식이",
  locationTitle: "오시는 길",
  navigationNote: "익숙한 내비 앱으로 바로 길안내를 시작해 보세요.",
  accountTitle: "마음 전하실 곳",
  accountIntro:
    "참석이 어려우신 분들을 위해 계좌번호를 함께 남깁니다. 따뜻한 마음만 감사히 받겠습니다.",
  groomAccount: "신한은행 110-000-000000 김민수",
  groomFamilyAccount: "하나은행 110-000-000000 김건호",
  brideAccount: "국민은행 110-000-000000 이수진",
  brideFamilyAccount: "농협 110-000-000000 유수지",
  guestbookTitle: "축복의 한마디",
  guestbookLead: "멀리서 전해주시는 축하도 오래도록 소중히 간직하겠습니다.",
  endingTitle: "저희의 첫 장면을 함께해 주세요",
  endingQuote:
    "서로의 오늘을 가장 다정한 내일로 이어가겠습니다. 함께해 주시는 마음 오래도록 기억하겠습니다.",
  mapType: "kakao",
  mapCoords: { lat: "37.5012", lng: "127.0396" },
  rsvpFields: ["name", "attending", "guests"],
  guestbookUrl: "",
  rsvpUrl: "",
};

function createInitialDraft(
  templateId: string,
  schema: TemplateSchema,
): EditorDraft {
  const data = {} as WedgenConfigData;
  const style = {} as WedgenConfigStyle;
  const sampleSource = templateId === "blank-canvas" ? {} : sampleValues;

  for (const [tabName, fields] of Object.entries(schema.fields)) {
    const isStyleTab = tabName === "스타일";
    for (const [fieldKey, field] of Object.entries(fields)) {
      if (isStyleTab) {
        style[fieldKey] = field.options?.[0]?.value ?? "";
        continue;
      }

      if (field.type === "select") {
        data[fieldKey] = sampleSource[fieldKey] ?? field.options?.[0]?.value ?? "";
      } else if (field.type === "select[]") {
        data[fieldKey] = Array.isArray(sampleSource[fieldKey])
          ? sampleSource[fieldKey]
          : [];
      } else if (field.type === "latlng") {
        data[fieldKey] =
          (sampleSource[fieldKey] as { lat: string; lng: string } | undefined) ?? {
            lat: "",
            lng: "",
          };
      } else {
        data[fieldKey] = sampleSource[fieldKey] ?? "";
      }
    }
  }

  return {
    locale: schema.i18n.defaultLocale,
    sectionOrder: mergeSectionOrder(schema.sections.defaultOrder),
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

function serializeDraft(draft: EditorDraft) {
  return JSON.stringify({
    locale: draft.locale,
    sectionOrder: draft.sectionOrder,
    data: draft.data,
    style: draft.style,
    assets: draft.assets ?? {},
  });
}

async function restoreFilesFromAssets(
  assets: Record<string, string | string[] | undefined>,
) {
  const restoredEntries: Array<[string, File | File[]]> = [];

  for (const [key, value] of Object.entries(assets)) {
    if (Array.isArray(value)) {
      const files = await Promise.all(
        value.map((dataUrl, index) => dataUrlToFile(dataUrl, `${key}-${index + 1}`)),
      );
      restoredEntries.push([key, files]);
      continue;
    }

    if (typeof value === "string" && value.startsWith("data:")) {
      const file = await dataUrlToFile(value, key);
      restoredEntries.push([key, file]);
    }
  }

  return Object.fromEntries(restoredEntries) as Record<string, File | File[]>;
}

export function EditorLayout({
  meta,
  schema,
  templates,
}: {
  meta: TemplateMeta;
  schema: TemplateSchema;
  templates: TemplateMeta[];
}) {
  const router = useRouter();
  const initialDraft = createInitialDraft(meta.id, schema);
  const [draft, setDraft] = useState<EditorDraft>(() => initialDraft);
  const [storageSlot, setStorageSlot] = useState<1 | 2 | 3>(1);
  const storageKey = `wedgen:draft:${meta.id}`;
  const autosaveKey = `${storageKey}:autosave`;
  const slotStorageKey = `${storageKey}:slot:${storageSlot}`;
  const draftRef = useRef(draft);
  const [editorMode, setEditorMode] = useState<"manual" | "structured">("manual");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("iphone");
  const [previewBackdrop, setPreviewBackdrop] = useState<PreviewBackdrop>("studio");
  const [previewZoom, setPreviewZoom] = useState(1);
  const [buildMode, setBuildMode] = useState<BuildMode>("optimized");
  const [buildPending, setBuildPending] = useState(false);
  const [buildMessage, setBuildMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const deferredDraft = useDeferredValue(draft);
  const isDirty = serializeDraft(draft) !== serializeDraft(initialDraft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    setDraft(createInitialDraft(meta.id, schema));
  }, [meta.id, schema]);

  useEffect(() => {
    void (async () => {
      const raw = window.localStorage.getItem(autosaveKey);
      if (!raw) {
        return;
      }

      try {
        const savedDraft = JSON.parse(raw) as EditorDraft;
        const restoredFiles = await restoreFilesFromAssets(savedDraft.assets ?? {});

        setDraft((current) => ({
          ...current,
          ...savedDraft,
          files: restoredFiles,
        }));
        setSaveMessage("임시 저장본을 불러왔습니다.");
      } catch {
        window.localStorage.removeItem(autosaveKey);
      }
    })();
  }, [autosaveKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const serializableDraft = {
        ...draft,
        files: {},
      };
      window.localStorage.setItem(autosaveKey, JSON.stringify(serializableDraft));
      setSaveMessage("브라우저에 임시 저장되었습니다.");
    }, 700);

    return () => window.clearTimeout(timer);
  }, [draft, autosaveKey]);

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

  const sectionStatusMap = {
    hero: draft.data.groomName && draft.data.brideName && draft.data.weddingDate ? "done" : "draft",
    greeting: draft.data.greeting ? "done" : "draft",
    family: draft.data.groomFather || draft.data.brideFather ? "done" : "empty",
    gallery:
      Array.isArray(draft.assets?.photos) && draft.assets.photos.length ? "done" : "empty",
    schedule: draft.data.venue && draft.data.weddingDate ? "done" : "draft",
    location: draft.data.address ? "done" : "draft",
    account: draft.data.groomAccount || draft.data.brideAccount ? "done" : "empty",
    guestbook: draft.data.guestbookUrl || draft.data.rsvpUrl ? "done" : "draft",
    ending: draft.data.endingQuote ? "done" : "draft",
  } as const;

  const previewSections = [
    { id: "hero", label: "첫 화면" },
    { id: "greeting", label: "인사말" },
    { id: "family", label: "혼주" },
    { id: "gallery", label: "갤러리" },
    { id: "schedule", label: "일정" },
    { id: "location", label: "오시는 길" },
    { id: "account", label: "계좌" },
    { id: "guestbook", label: "방명록" },
    { id: "ending", label: "마무리" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1780px] flex-1 flex-col gap-5 px-4 py-4 lg:px-6 xl:h-screen xl:overflow-hidden xl:px-8">
      <div className="flex flex-col gap-3 rounded-[1.7rem] border border-black/5 bg-white/76 px-5 py-4 shadow-[0_18px_44px_rgba(88,47,33,0.06)] lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            템플릿 갤러리로
          </Link>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
              편집 워크스페이스
            </p>
            <h1 className="mt-1 text-3xl tracking-[-0.04em] lg:text-4xl">{meta.name}</h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted-foreground lg:text-sm lg:leading-7">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="grid gap-2 lg:min-w-[340px]">
          <label className="grid gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
              템플릿 불러오기
            </span>
          <div className="flex items-center gap-2 rounded-[1rem] border border-black/5 bg-[#fffaf5] px-3 py-2">
            <LayoutTemplate className="h-4 w-4 text-[#7b655b]" />
              <select
                value={meta.id}
                className="h-9 flex-1 bg-transparent text-[13px] text-foreground outline-none"
                onChange={(event) => {
                  const nextTemplate = event.target.value;
                  if (!isDirty) {
                    router.push(`/editor/${nextTemplate}`);
                    return;
                  }

                  const shouldMove = window.confirm(
                    "현재 편집 중인 내용이 있습니다. 이동하기 전에 임시 저장해 두었고, 다른 템플릿으로 전환할까요?",
                  );

                  if (!shouldMove) {
                    event.currentTarget.value = meta.id;
                    return;
                  }

                  const serializableDraft = {
                    ...draftRef.current,
                    files: {},
                  };
                  window.localStorage.setItem(autosaveKey, JSON.stringify(serializableDraft));
                  router.push(`/editor/${nextTemplate}`);
                }}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
          {saveMessage ? <p className="text-[12px] leading-5 text-muted-foreground">{saveMessage}</p> : null}
        </div>
      </div>

      <section className="grid gap-4 xl:min-h-0 xl:grid-cols-[680px_minmax(0,1fr)]">
        <aside className="rounded-[1.9rem] border border-black/5 bg-[#fbfaf8] p-4 shadow-[0_28px_80px_rgba(92,55,38,0.1)] backdrop-blur xl:min-h-0 xl:overflow-hidden">
          <div className="grid gap-4 xl:h-full xl:overflow-y-auto xl:pr-1">
            <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-black/5 bg-white/92 p-2 shadow-[0_12px_28px_rgba(88,47,33,0.05)]">
              <button
                type="button"
                onClick={() => setEditorMode("manual")}
                className={[
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition",
                  editorMode === "manual"
                    ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(157,94,67,0.18)]"
                    : "bg-[#fff7f0] text-[#6b5346]",
                ].join(" ")}
              >
                <PenSquare className="h-4 w-4" />
                수동 제작
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("structured")}
                className={[
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition",
                  editorMode === "structured"
                    ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(157,94,67,0.18)]"
                    : "bg-[#fff7f0] text-[#6b5346]",
                ].join(" ")}
              >
                <SlidersHorizontal className="h-4 w-4" />
                구성 편집
              </button>
            </div>
            {editorMode === "structured" ? (
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
                statusMap={sectionStatusMap}
              />
            ) : null}
            {editorMode === "manual" ? (
              <ManualComposerPanel
                values={draft.data}
                onChange={(key, value) =>
                  setDraft((current) => ({
                    ...current,
                    data: {
                      ...current.data,
                      [key]: value,
                    },
                  }))
                }
              />
            ) : null}
            <TemplateModePanel meta={meta} />
          </div>
        </aside>

        <section className="grid content-start gap-4 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
          <BuildBar
            buildMode={buildMode}
            onBuildModeChange={setBuildMode}
            storageSlot={storageSlot}
            onStorageSlotChange={setStorageSlot}
            onGenerate={generateZip}
            onSave={() => {
              const serializableDraft = {
                ...draftRef.current,
                files: {},
              };
              window.localStorage.setItem(slotStorageKey, JSON.stringify(serializableDraft));
              setSaveMessage(`슬롯 ${storageSlot}에 저장했습니다.`);
            }}
            onRestore={async () => {
              const raw =
                window.localStorage.getItem(slotStorageKey) ??
                window.localStorage.getItem(autosaveKey);
              if (!raw) {
                setSaveMessage("복원할 저장본이 없습니다.");
                return;
              }
              try {
                const savedDraft = JSON.parse(raw) as EditorDraft;
                const restoredFiles = await restoreFilesFromAssets(savedDraft.assets ?? {});

                setDraft((current) => ({
                  ...current,
                  ...savedDraft,
                  files: restoredFiles,
                }));
                setSaveMessage(`슬롯 ${storageSlot} 또는 자동 저장본을 복원했습니다.`);
              } catch {
                setSaveMessage("복원할 저장본이 없습니다.");
              }
            }}
            onReset={() => {
              window.localStorage.removeItem(slotStorageKey);
              window.localStorage.removeItem(autosaveKey);
              setDraft(createInitialDraft(meta.id, schema));
              setSaveMessage("초기 상태로 되돌렸습니다.");
            }}
            pending={buildPending}
            message={buildMessage}
            storageStatus={saveMessage}
          />
          <div className="rounded-[1.9rem] border border-black/5 bg-white/64 p-4 shadow-[0_28px_80px_rgba(92,55,38,0.08)] backdrop-blur lg:p-6">
            <PreviewFrame
              html={previewHtml}
              loading={previewLoading}
              error={previewError}
              templateName={meta.name}
              device={previewDevice}
              backdrop={previewBackdrop}
              zoom={previewZoom}
              onZoomChange={setPreviewZoom}
              onDeviceChange={setPreviewDevice}
              onBackdropChange={setPreviewBackdrop}
              sections={previewSections}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
