"use client";

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";
import { fieldSuggestions, validateFieldValue } from "./field-intel";

export function TextField({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const suggestions = fieldSuggestions[fieldKey] ?? [];
  const error = validateFieldValue(fieldKey, value, field.required);

  return (
    <FieldShell
      fieldKey={fieldKey}
      field={field}
      hint={
        error ?? (value ? "입력이 완료되었습니다." : field.required ? "필수 입력 항목입니다." : "선택 입력 항목입니다.")
      }
      hintTone={error ? "error" : value ? "success" : "default"}
      action={
        suggestions.length ? (
          <div className="flex flex-wrap justify-end gap-1">
            {suggestions.slice(0, 2).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange(suggestion)}
                className="rounded-full bg-[#fff3e8] px-2.5 py-1 text-[11px] text-primary transition hover:bg-[#ffe6d2]"
              >
                추천
              </button>
            ))}
          </div>
        ) : null
      }
    >
      <Input
        id={fieldKey}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}
