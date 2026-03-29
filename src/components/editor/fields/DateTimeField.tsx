"use client";

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

export function DateTimeField({
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
    <FieldShell fieldKey={fieldKey} field={field}>
      <Input
        id={fieldKey}
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}
