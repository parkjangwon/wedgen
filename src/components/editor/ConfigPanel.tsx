"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import { SectionOrderer } from "@/components/editor/SectionOrderer";
import type { ResolvedFontPreset, TemplateSchema } from "@/types";

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
  const tabs = Object.entries(schema.fields);

  return (
    <div className="space-y-4">
      <Tabs defaultValue={tabs[0]?.[0]} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-[1.5rem] bg-white/65 p-2 lg:grid-cols-5">
          {tabs.map(([tabName]) => (
            <TabsTrigger
              key={tabName}
              value={tabName}
              className="rounded-[1rem] px-3 py-2 text-xs md:text-sm"
            >
              {tabName}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(([tabName, fields]) => (
          <TabsContent key={tabName} value={tabName} className="grid gap-3">
            {Object.entries(fields).map(([fieldKey, field]) => {
              const isStyleTab = tabName === "스타일";
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
                    onValueChange(fieldKey, nextValue, tabName)
                  }
                  onFileChange={(nextValue) => onFileChange(fieldKey, nextValue)}
                  onArrayMove={(fromIndex, toIndex) =>
                    onArrayMove(fieldKey, fromIndex, toIndex)
                  }
                  onArrayRemove={(index) => onArrayRemove(fieldKey, index)}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
      <SectionOrderer
        order={values.sectionOrder}
        required={schema.sections.required}
        onChange={onSectionOrderChange}
      />
    </div>
  );
}
