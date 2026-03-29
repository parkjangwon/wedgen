"use client";

import { useMemo, useState } from "react";
import {
  BrushCleaning,
  CalendarRange,
  HeartHandshake,
  ImageIcon,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import { SectionOrderer } from "@/components/editor/SectionOrderer";
import type { ResolvedFontPreset, TemplateSchema } from "@/types";

const tabMeta: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; title: string; description: string }
> = {
  "기본 정보": {
    icon: Sparkles,
    title: "기본 정보",
    description: "표지, 인사말, 대표 이미지",
  },
  "갤러리": {
    icon: ImageIcon,
    title: "갤러리",
    description: "사진 추가, 순서 편집, 삭제",
  },
  "예식 정보": {
    icon: MapPinned,
    title: "예식 정보",
    description: "예식장, 일정, 교통, 지도",
  },
  "방명록 & RSVP": {
    icon: HeartHandshake,
    title: "방명록 & RSVP",
    description: "참석 회신과 방명록 연동",
  },
  "스타일": {
    icon: BrushCleaning,
    title: "스타일",
    description: "색상, 폰트, 애니메이션",
  },
};

function isFieldVisible(
  field: TemplateSchema["fields"][string][string],
  values: {
    data: Record<string, unknown>;
    style: Record<string, string | ResolvedFontPreset | undefined>;
  },
) {
  if (!field.visibleWhen) {
    return true;
  }

  const { field: dependencyField, equals } = field.visibleWhen;
  const currentValue =
    values.style[dependencyField] ?? values.data[dependencyField];
  const expectedValues = Array.isArray(equals) ? equals : [equals];

  return expectedValues.includes(String(currentValue ?? ""));
}

export function ConfigPanel({
  schema,
  values,
  assets,
  onValueChange,
  onFileChange,
  onArrayMove,
  onArrayRemove,
  onSectionOrderChange,
}: {
  schema: TemplateSchema;
  values: {
    data: Record<string, unknown>;
    style: Record<string, string | ResolvedFontPreset | undefined>;
    sectionOrder: string[];
  };
  assets: Record<string, string | string[] | undefined>;
  onValueChange: (fieldKey: string, nextValue: unknown, tabName: string) => void;
  onFileChange: (fieldKey: string, nextValue: File | File[] | undefined) => void;
  onArrayMove: (fieldKey: string, fromIndex: number, toIndex: number) => void;
  onArrayRemove: (fieldKey: string, index: number) => void;
  onSectionOrderChange: (nextOrder: string[]) => void;
}) {
  const tabs = useMemo(() => Object.entries(schema.fields), [schema.fields]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.[0] ?? "");
  const activeFields = schema.fields[activeTab] ?? {};
  const activeMeta = tabMeta[activeTab];
  const ActiveIcon = activeMeta?.icon ?? CalendarRange;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 rounded-[1.5rem] border border-black/5 bg-[#fcfbf9] p-3 shadow-[0_18px_44px_rgba(88,47,33,0.06)] xl:grid-cols-[188px_minmax(0,1fr)]">
        <div className="grid gap-2 xl:content-start">
          <div className="rounded-[1.1rem] border border-black/5 bg-white px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
              편집 섹션
            </p>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
              현재 템플릿을 구성하는 핵심 정보 묶음입니다.
            </p>
          </div>
          {tabs.map(([tabName]) => {
            const meta = tabMeta[tabName];
            const Icon = meta?.icon ?? CalendarRange;
            const isActive = activeTab === tabName;

            return (
              <button
                key={tabName}
                type="button"
                onClick={() => setActiveTab(tabName)}
                className={[
                  "grid gap-1 rounded-[1.1rem] border px-3 py-3 text-left transition",
                  isActive
                    ? "border-primary/18 bg-[#fff7f1] shadow-[0_12px_28px_rgba(157,94,67,0.08)]"
                    : "border-black/5 bg-white hover:bg-[#fffaf5]",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      isActive ? "bg-primary text-primary-foreground" : "bg-[#f4efe8] text-[#6a5347]",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[13px] font-semibold leading-none text-foreground">
                    {meta?.title ?? tabName}
                  </span>
                </div>
                <p className="pl-10 text-[12px] leading-5 text-muted-foreground">
                  {meta?.description ?? ""}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-3 rounded-[1.2rem] border border-black/5 bg-white px-4 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
                Active Panel
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3e8] text-primary">
                  <ActiveIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-foreground">
                    {activeMeta?.title ?? activeTab}
                  </h3>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    {activeMeta?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.2rem] border border-black/5 bg-white/92 p-3">
            {Object.entries(activeFields).map(([fieldKey, field]) => {
              const isStyleTab = activeTab === "스타일";
              if (!isFieldVisible(field, values)) {
                return null;
              }

              return (
                <FieldRenderer
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  value={
                    isStyleTab ? values.style[fieldKey] : values.data[fieldKey]
                  }
                  assetPreview={assets[fieldKey]}
                  onValueChange={(nextValue) =>
                    onValueChange(fieldKey, nextValue, activeTab)
                  }
                  onFileChange={(nextValue) => onFileChange(fieldKey, nextValue)}
                  onArrayMove={(fromIndex, toIndex) =>
                    onArrayMove(fieldKey, fromIndex, toIndex)
                  }
                  onArrayRemove={(index) => onArrayRemove(fieldKey, index)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <SectionOrderer
        order={values.sectionOrder}
        required={schema.sections.required}
        onChange={onSectionOrderChange}
      />
    </div>
  );
}
