"use client";

import type { FieldDefinition } from "@/types";
import { DateTimeField } from "./DateTimeField";
import { FileField } from "./FileField";
import { ImageArrayField } from "./ImageArrayField";
import { ImageField } from "./ImageField";
import { LatLngField } from "./LatLngField";
import { MultiSelectField } from "./MultiSelectField";
import { SelectField } from "./SelectField";
import { TextareaField } from "./TextareaField";
import { TextField } from "./TextField";
import { UrlField } from "./UrlField";

export function FieldRenderer({
  fieldKey,
  field,
  value,
  assetPreview,
  onValueChange,
  onFileChange,
  onArrayMove,
  onArrayRemove,
}: {
  fieldKey: string;
  field: FieldDefinition;
  value: unknown;
  assetPreview?: string | string[];
  onValueChange: (value: unknown) => void;
  onFileChange: (value: File | File[] | undefined) => void;
  onArrayMove?: (fromIndex: number, toIndex: number) => void;
  onArrayRemove?: (index: number) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <TextField
          fieldKey={fieldKey}
          field={field}
          value={String(value ?? "")}
          onChange={onValueChange}
        />
      );
    case "textarea":
      return (
        <TextareaField
          fieldKey={fieldKey}
          field={field}
          value={String(value ?? "")}
          onChange={onValueChange}
        />
      );
    case "datetime":
      return (
        <DateTimeField
          fieldKey={fieldKey}
          field={field}
          value={String(value ?? "")}
          onChange={onValueChange}
        />
      );
    case "select":
      return (
        <SelectField
          fieldKey={fieldKey}
          field={field}
          value={String(value ?? "")}
          onChange={onValueChange}
        />
      );
    case "select[]":
      return (
        <MultiSelectField
          fieldKey={fieldKey}
          field={field}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onValueChange}
        />
      );
    case "url":
      return (
        <UrlField
          fieldKey={fieldKey}
          field={field}
          value={String(value ?? "")}
          onChange={onValueChange}
        />
      );
    case "latlng":
      return (
        <LatLngField
          fieldKey={fieldKey}
          field={field}
          value={
            value && typeof value === "object"
              ? (value as { lat: string; lng: string })
              : { lat: "", lng: "" }
          }
          onChange={onValueChange}
        />
      );
    case "image":
      return (
        <ImageField
          fieldKey={fieldKey}
          field={field}
          previewUrl={typeof assetPreview === "string" ? assetPreview : undefined}
          onChange={onFileChange}
        />
      );
    case "image[]":
      return (
        <ImageArrayField
          fieldKey={fieldKey}
          field={field}
          previewUrls={Array.isArray(assetPreview) ? assetPreview : []}
          onAdd={(files) => onFileChange(files)}
          onMove={(fromIndex, toIndex) => onArrayMove?.(fromIndex, toIndex)}
          onRemove={(index) => onArrayRemove?.(index)}
        />
      );
    case "file":
      return (
        <FileField
          fieldKey={fieldKey}
          field={field}
          fileName={typeof assetPreview === "string" ? assetPreview.split("/").pop() : undefined}
          onChange={onFileChange}
        />
      );
    default:
      return null;
  }
}
