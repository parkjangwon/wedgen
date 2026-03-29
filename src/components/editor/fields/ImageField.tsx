"use client";
/* eslint-disable @next/next/no-img-element */

import { UploadSurface } from "./UploadSurface";
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
    <FieldShell
      fieldKey={fieldKey}
      field={field}
      hint={previewUrl ? "이미지가 연결되었습니다." : "권장 비율 4:5"}
    >
      <label className="block cursor-pointer">
        <input
          id={fieldKey}
          type="file"
          className="sr-only"
          accept={(field.accept ?? []).map((ext) => `.${ext}`).join(",")}
          onChange={(event) => onChange(event.target.files?.[0])}
        />
        <UploadSurface
          title="대표 이미지 업로드"
          subtitle="클릭해서 사진을 선택하세요. 큰 세로 비율 사진이 가장 잘 어울립니다."
        />
      </label>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`${field.label} 미리보기`}
          className="mt-3 aspect-[4/5] w-full rounded-[1.1rem] object-cover shadow-[0_12px_30px_rgba(88,47,33,0.12)]"
        />
      ) : null}
    </FieldShell>
  );
}
