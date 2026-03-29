"use client";

import { useEditor } from "./EditorContext";
import { ConfigPanel } from "./ConfigPanel";
import { ManualComposerPanel } from "./ManualComposerPanel";
import { TemplateModePanel } from "./TemplateModePanel";
import type { TemplateSchema, WedgenConfigAssets } from "@/types";

interface EditorPanelProps {
  schema: TemplateSchema;
  assets: WedgenConfigAssets;
  editorMode: "manual" | "structured";
  onEditorModeChange: (mode: "manual" | "structured") => void;
  statusMap: Record<string, "done" | "draft" | "empty">;
}

export function EditorPanel({
  schema,
  assets,
  editorMode,
  onEditorModeChange,
  statusMap,
}: EditorPanelProps) {
  const { state, updateData, updateStyle, updateSectionOrder } = useEditor();

  return (
    <aside className="rounded-[1.9rem] border border-black/5 bg-[#fbfaf8] p-4 shadow-[0_28px_80px_rgba(92,55,38,0.1)] backdrop-blur xl:min-h-0 xl:overflow-hidden">
      <div className="grid gap-4 xl:h-full xl:overflow-y-auto xl:pr-1">
        <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-black/5 bg-white/92 p-2 shadow-[0_12px_28px_rgba(88,47,33,0.05)]">
          <button
            type="button"
            onClick={() => onEditorModeChange("manual")}
            className={[
              "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition",
              editorMode === "manual"
                ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(157,94,67,0.18)]"
                : "bg-[#fff7f0] text-[#6b5346]",
            ].join(" ")}
          >
            수동 제작
          </button>
          <button
            type="button"
            onClick={() => onEditorModeChange("structured")}
            className={[
              "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition",
              editorMode === "structured"
                ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(157,94,67,0.18)]"
                : "bg-[#fff7f0] text-[#6b5346]",
            ].join(" ")}
          >
            구성 편집
          </button>
        </div>

        {editorMode === "structured" ? (
          <ConfigPanel
            schema={schema}
            values={{
              data: state.draft.data,
              style: state.draft.style,
              sectionOrder: state.draft.sectionOrder,
            }}
            assets={assets}
            onValueChange={(fieldKey, nextValue, tabName) => {
              if (tabName === "스타일") {
                updateStyle(fieldKey, String(nextValue));
              } else {
                updateData(fieldKey, nextValue);
              }
            }}
            onFileChange={() => {}}
            onArrayMove={() => {}}
            onArrayRemove={() => {}}
            onSectionOrderChange={updateSectionOrder}
            statusMap={statusMap}
          />
        ) : (
          <ManualComposerPanel
            values={state.draft.data}
            onChange={updateData}
          />
        )}

        <TemplateModePanel meta={{ id: "", name: "", description: "", thumbnail: "", interaction: "scroll" }} />
      </div>
    </aside>
  );
}
