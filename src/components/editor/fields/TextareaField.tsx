"use client";

import { Textarea } from "@/components/ui/textarea";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

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
  return (
    <FieldShell
      fieldKey={fieldKey}
      field={field}
      hint={`${value.length}${field.maxLength ? ` / ${field.maxLength}` : ""}자`}
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
