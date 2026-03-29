"use client";

import { BuildBar } from "./BuildBar";
import { PreviewFrame } from "./PreviewFrame";
import { useEditor } from "./EditorContext";
import type { BuildMode } from "@/lib/optimizers";
import type {
  PreviewBackdrop,
  PreviewDevice,
} from "./preview-utils";

interface PreviewPanelProps {
  previewHtml: string;
  previewLoading: boolean;
  previewError: string | null;
  templateName: string;
  previewDevice: PreviewDevice;
  previewBackdrop: PreviewBackdrop;
  previewZoom: number;
  buildMode: BuildMode;
  buildPending: boolean;
  buildMessage: string | null;
  onDeviceChange: (device: PreviewDevice) => void;
  onBackdropChange: (backdrop: PreviewBackdrop) => void;
  onZoomChange: (zoom: number) => void;
  onBuildModeChange: (mode: BuildMode) => void;
  onGenerate: () => void;
  onSave: () => void;
  onRestore: () => void;
  onReset: () => void;
}

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

export function PreviewPanel({
  previewHtml,
  previewLoading,
  previewError,
  templateName,
  previewDevice,
  previewBackdrop,
  previewZoom,
  buildMode,
  buildPending,
  buildMessage,
  onDeviceChange,
  onBackdropChange,
  onZoomChange,
  onBuildModeChange,
  onGenerate,
  onSave,
  onRestore,
  onReset,
}: PreviewPanelProps) {
  const { state, setStorageSlot, setSlotName } = useEditor();

  return (
    <section className="grid content-start gap-4 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
      <BuildBar
        buildMode={buildMode}
        onBuildModeChange={onBuildModeChange}
        storageSlot={state.storageSlot}
        storageSlotName={state.slotNames[state.storageSlot]}
        onStorageSlotChange={setStorageSlot}
        onStorageSlotNameChange={(name) => setSlotName(state.storageSlot, name)}
        onGenerate={onGenerate}
        onSave={onSave}
        onRestore={onRestore}
        onReset={onReset}
        pending={buildPending}
        message={buildMessage}
        storageStatus={state.isDirty ? "변경사항 있음" : "저장됨"}
      />
      <div className="rounded-[1.9rem] border border-black/5 bg-white/64 p-4 shadow-[0_28px_80px_rgba(92,55,38,0.08)] backdrop-blur lg:p-6">
        <PreviewFrame
          html={previewHtml}
          loading={previewLoading}
          error={previewError}
          templateName={templateName}
          device={previewDevice}
          backdrop={previewBackdrop}
          zoom={previewZoom}
          onZoomChange={onZoomChange}
          onDeviceChange={onDeviceChange}
          onBackdropChange={onBackdropChange}
          sections={previewSections}
        />
      </div>
    </section>
  );
}
