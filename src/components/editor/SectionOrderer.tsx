"use client";

import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SectionOrderer({
  order,
  required,
  onChange,
}: {
  order: string[];
  required: string[];
  onChange: (order: string[]) => void;
}) {
  return (
    <div className="space-y-3 rounded-[1.5rem] border border-black/5 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary/70">
            Section Order
          </p>
          <h3 className="mt-1 text-xl tracking-[-0.03em]">섹션 순서</h3>
        </div>
      </div>
      <div className="grid gap-2">
        {order.map((section) => (
          <div
            key={section}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", section);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const dragged = event.dataTransfer.getData("text/plain");
              const current = [...order];
              const from = current.indexOf(dragged);
              const to = current.indexOf(section);
              if (from < 0 || to < 0 || from === to) {
                return;
              }
              current.splice(from, 1);
              current.splice(to, 0, dragged);
              onChange(current);
            }}
            className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#fffaf5] px-3 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span>{section}</span>
            </div>
            {required.includes(section) ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                필수
              </Badge>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
