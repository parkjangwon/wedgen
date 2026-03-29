"use client";
/* eslint-disable @next/next/no-img-element */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

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
      <Input
        id={fieldKey}
        type="file"
        multiple
        accept={(field.accept ?? ["jpg", "png", "webp"]).map((ext) => `.${ext}`).join(",")}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          onAdd(files);
          event.currentTarget.value = "";
        }}
      />
      {previewUrls.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {previewUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white"
            >
              <img
                src={url}
                alt={`갤러리 이미지 ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 border-t border-black/5 px-2 py-2">
                <span className="text-xs text-muted-foreground">사진 {index + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={index === 0}
                    onClick={() => onMove(index, index - 1)}
                  >
                    앞으로
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
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
