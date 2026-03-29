"use client";
/* eslint-disable @next/next/no-img-element */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";
import { UploadSurface } from "./UploadSurface";

export function ImageArrayField({
  fieldKey,
  field,
  previewUrls,
  onAdd,
  onMove,
  onRemove,
}: {
  fieldKey: string;
  field: FieldDefinition;
  previewUrls: string[];
  onAdd: (value: File[]) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <FieldShell fieldKey={fieldKey} field={field}>
      <label className="block cursor-pointer">
        <input
          id={fieldKey}
          type="file"
          multiple
          className="sr-only"
          accept={(field.accept ?? ["jpg", "png", "webp"]).map((ext) => `.${ext}`).join(",")}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            onAdd(files);
            event.currentTarget.value = "";
          }}
        />
        <UploadSurface
          title={previewUrls.length ? "갤러리 사진 더 추가하기" : "갤러리 사진 업로드"}
          subtitle="여러 장을 한 번에 추가하고, 아래 카드에서 순서를 바꾸거나 삭제할 수 있습니다."
        />
      </label>
      {previewUrls.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-3">
          {previewUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="overflow-hidden rounded-[1rem] border border-black/5 bg-white shadow-[0_10px_24px_rgba(88,47,33,0.05)]"
            >
              <img
                src={url}
                alt={`갤러리 이미지 ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              <div className="grid gap-2 border-t border-black/5 px-2.5 py-2.5">
                <span className="text-[11px] font-medium text-muted-foreground">사진 {index + 1}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-full px-3 text-[11px]"
                    disabled={index === 0}
                    onClick={() => onMove(index, index - 1)}
                  >
                    앞으로
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-full px-3 text-[11px]"
                    disabled={index === previewUrls.length - 1}
                    onClick={() => onMove(index, index + 1)}
                  >
                    뒤로
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </FieldShell>
  );
}
