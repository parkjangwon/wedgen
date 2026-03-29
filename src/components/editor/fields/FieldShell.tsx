import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/types";

export function FieldShell({
  fieldKey,
  field,
  children,
}: {
  fieldKey: string;
  field: FieldDefinition;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-black/5 bg-white/70 p-4">
      <div className="space-y-1">
        <Label htmlFor={fieldKey} className="text-sm font-medium text-foreground">
          {field.label}
          {field.required ? <span className="ml-1 text-primary">*</span> : null}
        </Label>
        {field.description ? (
          <p className="text-xs leading-5 text-muted-foreground">{field.description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
