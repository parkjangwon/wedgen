"use client";

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";
import { validateFieldValue } from "./field-intel";

export function LatLngField({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  value: { lat: string; lng: string };
  onChange: (value: { lat: string; lng: string }) => void;
}) {
  const error = validateFieldValue(fieldKey, value, field.required);
  return (
    <FieldShell
      fieldKey={fieldKey}
      field={field}
      hint={error ?? (value.lat && value.lng ? "좌표가 입력되었습니다." : "위도와 경도를 모두 입력하세요.")}
      hintTone={error ? "error" : value.lat && value.lng ? "success" : "default"}
    >
      <div className="grid grid-cols-2 gap-2">
        <Input
          id={`${fieldKey}-lat`}
          value={value.lat}
          placeholder="37.5012"
          onChange={(event) => onChange({ ...value, lat: event.target.value })}
        />
        <Input
          id={`${fieldKey}-lng`}
          value={value.lng}
          placeholder="127.0396"
          onChange={(event) => onChange({ ...value, lng: event.target.value })}
        />
      </div>
    </FieldShell>
  );
}
