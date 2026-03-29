"use client";
/* eslint-disable @next/next/no-img-element */

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

export function ImageField({
  fieldKey,
  field,
  previewUrl,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  previewUrl?: string;
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
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`${field.label} 미리보기`}
          className="mt-3 aspect-[4/5] w-full rounded-2xl object-cover"
        />
      ) : null}
    </FieldShell>
  );
}
