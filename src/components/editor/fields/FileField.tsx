"use client";

import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";
import { UploadSurface } from "./UploadSurface";

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
      <label className="block cursor-pointer">
        <input
          id={fieldKey}
          type="file"
          className="sr-only"
          accept={(field.accept ?? []).map((ext) => `.${ext}`).join(",")}
          onChange={(event) => onChange(event.target.files?.[0])}
        />
        <UploadSurface
          title="파일 선택"
          subtitle="배경음악이나 추가 파일을 업로드할 수 있습니다."
        />
      </label>
      {fileName ? <p className="text-[12px] text-muted-foreground">현재 파일: {fileName}</p> : null}
    </FieldShell>
  );
}
