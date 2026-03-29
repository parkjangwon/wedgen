"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

export function MultiSelectField({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <FieldShell fieldKey={fieldKey} field={field}>
      <div className="grid gap-3">
        {(field.options ?? []).map((option) => {
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => {
                  if (next) {
                    onChange([...value, option.value]);
                    return;
                  }

                  onChange(value.filter((item) => item !== option.value));
                }}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}
