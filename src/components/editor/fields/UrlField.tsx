"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types";
import { FieldShell } from "./FieldShell";

export function UrlField({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <FieldShell
      fieldKey={fieldKey}
      field={field}
      hint={result ? result.message : "GAS URL은 검증 버튼으로 즉시 확인할 수 있습니다."}
    >
      <div className="flex gap-2">
        <Input
          id={fieldKey}
          value={value}
          placeholder="https://script.google.com/macros/s/..."
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={pending || !value}
          onClick={async () => {
            setPending(true);
            try {
              const response = await fetch("/api/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: value }),
              });
              setResult(await response.json());
            } finally {
              setPending(false);
            }
          }}
        >
          {pending ? "검증 중" : "검증"}
        </Button>
      </div>
    </FieldShell>
  );
}
