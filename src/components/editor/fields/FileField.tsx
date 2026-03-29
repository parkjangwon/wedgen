"use client";

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

export function FileField({
  fieldKey,
  field,
  fileName,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  fileName?: string;
  onChange: (value: File | undefined) => void;
}) {
  return (
    <FieldShell fieldKey={fieldKey} field={field}>
      <Input
        id={fieldKey}
        type="file"
        accept={(field.accept ?? []).map((ext) => `.${ext}`).join(",")}
        onChange={(event) => onChange(event.target.files?.[0])}
      />
      {fileName ? <p className="text-xs text-muted-foreground">{fileName}</p> : null}
    </FieldShell>
  );
}
