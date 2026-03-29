"use client";

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

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
  return (
    <FieldShell
      fieldKey={fieldKey}
      field={field}
      hint={value ? "입력이 완료되었습니다." : field.required ? "필수 입력 항목입니다." : "선택 입력 항목입니다."}
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
