"use client";

import { Textarea } from "@/components/ui/textarea";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";
import { fieldSuggestions, validateFieldValue } from "./field-intel";

export function TextareaField({
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
      hint={error ?? `${value.length}${field.maxLength ? ` / ${field.maxLength}` : ""}자`}
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
      <Textarea
        id={fieldKey}
        value={value}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        className="min-h-28"
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}
