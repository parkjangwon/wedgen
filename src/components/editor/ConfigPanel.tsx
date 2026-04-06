"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BrushCleaning,
  CalendarRange,
  CheckCircle2,
  HeartHandshake,
  ImageIcon,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import { SectionOrderer } from "@/components/editor/SectionOrderer";
import type { TemplateSchema, WedgenConfigStyle } from "@/types";

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
    style: WedgenConfigStyle;
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

function isFieldFilled(
  fieldKey: string,
  tabName: string,
  field: TemplateSchema["fields"][string][string],
  values: {
    data: Record<string, unknown>;
    style: WedgenConfigStyle;
  },
  assets: Record<string, string | string[] | undefined>,
) {
  const source = tabName === "스타일" ? values.style : values.data;
  const currentValue = source[fieldKey];

  if (field.type === "image") {
    return Boolean(assets[fieldKey]);
  }

  if (field.type === "image[]") {
    return Array.isArray(assets[fieldKey]) && assets[fieldKey]!.length > 0;
  }

  if (field.type === "file") {
    return Boolean(assets[fieldKey]);
  }

  if (Array.isArray(currentValue)) {
    return currentValue.length > 0;
  }

  if (currentValue && typeof currentValue === "object") {
    return Object.values(currentValue).some(Boolean);
  }

  return String(currentValue ?? "").trim().length > 0;
}

export function ConfigPanel({
  schema,
  values,
  assets,
  statusMap,
  onValueChange,
  onFileChange,
  onArrayMove,
  onArrayRemove,
  onSectionOrderChange,
}: {
  schema: TemplateSchema;
  values: {
    data: Record<string, unknown>;
    style: WedgenConfigStyle;
    sectionOrder: string[];
  };
  assets: Record<string, string | string[] | undefined>;
  statusMap: Record<string, "done" | "draft" | "empty">;
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

  function getTabStatus(tabName: string) {
    const fields = Object.entries(schema.fields[tabName]).filter(([, field]) =>
      isFieldVisible(field, values),
    );
    const requiredFields = fields.filter(([, field]) => field.required);
    const filledCount = fields.filter(([fieldKey, field]) =>
      isFieldFilled(fieldKey, tabName, field, values, assets),
    ).length;
    const missingRequired = requiredFields.filter(
      ([fieldKey, field]) => !isFieldFilled(fieldKey, tabName, field, values, assets),
    );

    if (missingRequired.length > 0) {
      return { tone: "warning", label: "필수 누락", count: filledCount, total: fields.length };
    }
    if (filledCount === fields.length && fields.length > 0) {
      return { tone: "success", label: "완료", count: filledCount, total: fields.length };
    }
    return { tone: "progress", label: "작성 중", count: filledCount, total: fields.length };
  }

  const activeStatus = getTabStatus(activeTab);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-secondary/30 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.25)] xl:grid-cols-[214px_minmax(0,1fr)]">
        <div className="grid gap-2 xl:content-start">
          <div className="rounded-[1.1rem] border border-white/10 bg-card/50 px-3 py-3">
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
            const status = getTabStatus(tabName);

            return (
              <button
                key={tabName}
                type="button"
                onClick={() => setActiveTab(tabName)}
                className={[
                  "grid gap-1 rounded-[1.1rem] border px-3 py-3 text-left transition",
                  isActive
                    ? "border-primary/30 bg-primary/10 shadow-[0_12px_28px_rgba(212,165,116,0.1)]"
                    : "border-white/10 bg-card/50 hover:bg-secondary/50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
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
                <div className="flex items-center justify-between pl-10">
                  <span
                    className={[
                      "rounded-full px-2 py-1 text-[11px]",
                      status.tone === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : status.tone === "warning"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-secondary text-muted-foreground",
                    ].join(" ")}
                  >
                    {status.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {status.count}/{status.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 rounded-[1.2rem] border border-white/10 bg-card/50 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
                  Active Panel
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
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
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[11px]",
                  activeStatus.tone === "success"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : activeStatus.tone === "warning"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-secondary text-muted-foreground",
                ].join(" ")}
              >
                {activeStatus.label}
              </span>
            </div>

            <div className="grid gap-2 rounded-[1rem] border border-white/10 bg-secondary/30 px-3 py-3 text-[12px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                입력이 충분하면 상태가 자동으로 완료로 바뀝니다.
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                필수 값이 비어 있으면 생성 전 점검이 필요합니다.
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.2rem] border border-white/10 bg-card/60 p-3">
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
        statusMap={statusMap}
        onChange={onSectionOrderChange}
      />
    </div>
  );
}
