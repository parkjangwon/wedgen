"use client";
/* eslint-disable @next/next/no-img-element */

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

export function ImageArrayField({
  fieldKey,
  field,
  previewUrls,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  previewUrls: string[];
  onChange: (value: File[]) => void;
}) {
  return (
    <FieldShell fieldKey={fieldKey} field={field}>
      <Input
        id={fieldKey}
        type="file"
        multiple
        accept={(field.accept ?? ["jpg", "png", "webp"]).map((ext) => `.${ext}`).join(",")}
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
      />
      {previewUrls.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <img
              key={`${url}-${index}`}
              src={url}
              alt={`갤러리 이미지 ${index + 1}`}
              className="aspect-square rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}
    </FieldShell>
  );
}
