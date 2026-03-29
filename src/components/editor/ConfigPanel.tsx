"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import { SectionOrderer } from "@/components/editor/SectionOrderer";
import type { TemplateSchema } from "@/types";

export function ConfigPanel({
  schema,
  values,
  assets,
  onValueChange,
  onFileChange,
  onSectionOrderChange,
}: {
  schema: TemplateSchema;
  values: {
    data: Record<string, unknown>;
    style: Record<string, string>;
    sectionOrder: string[];
  };
  assets: Record<string, string | string[] | undefined>;
  onValueChange: (fieldKey: string, nextValue: unknown, tabName: string) => void;
  onFileChange: (fieldKey: string, nextValue: File | File[] | undefined) => void;
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
