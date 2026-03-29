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
    <div className="space-y-3 rounded-[1.15rem] border border-black/5 bg-white/76 p-3.5 shadow-[0_10px_24px_rgba(88,47,33,0.04)]">
      <div className="space-y-1.5">
        <Label htmlFor={fieldKey} className="text-[13px] font-medium leading-none text-foreground">
          {field.label}
          {field.required ? <span className="ml-1 text-primary">*</span> : null}
        </Label>
        {field.description ? (
          <p className="text-[12px] leading-5 text-muted-foreground">{field.description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
