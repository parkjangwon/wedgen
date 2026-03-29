import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/types";

export function FieldShell({
  fieldKey,
  field,
  hint,
  hintTone,
  action,
  children,
}: {
  fieldKey: string;
  field: FieldDefinition;
  hint?: ReactNode;
  hintTone?: "default" | "error" | "success";
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-[1.15rem] border border-white/10 bg-card/80 p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={fieldKey} className="text-[13px] font-medium leading-none text-foreground">
              {field.label}
              {field.required ? <span className="ml-1 text-primary">*</span> : null}
            </Label>
            {field.description ? (
              <p className="text-[12px] leading-5 text-muted-foreground">{field.description}</p>
            ) : null}
          </div>
          {action}
        </div>
        {hint ? (
          <div
            className={[
              "text-[12px] leading-5",
              hintTone === "error"
                ? "text-destructive"
                : hintTone === "success"
                  ? "text-emerald-400"
                  : "text-muted-foreground",
            ].join(" ")}
          >
            {hint}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
