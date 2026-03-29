"use client";

import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

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
  return (
    <FieldShell fieldKey={fieldKey} field={field}>
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
