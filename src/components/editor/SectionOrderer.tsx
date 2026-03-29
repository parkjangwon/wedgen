"use client";

import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sectionLabels: Record<string, string> = {
  hero: "첫 화면",
  greeting: "인사말",
  family: "혼주 정보",
  gallery: "갤러리",
  schedule: "일정 안내",
  location: "오시는 길",
  account: "마음 전하실 곳",
  guestbook: "방명록",
  ending: "마무리",
  info: "예식 정보",
  rsvp: "참석 의사",
};

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
    <div className="space-y-3 rounded-[1.5rem] border border-black/5 bg-white/92 p-4 shadow-[0_16px_40px_rgba(88,47,33,0.05)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
            섹션 구성
          </p>
          <h3 className="mt-1 text-lg tracking-[-0.03em]">섹션 순서</h3>
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
            className="flex items-center justify-between rounded-[1rem] border border-black/5 bg-[#fffaf5] px-3 py-3 text-[13px] shadow-[0_8px_20px_rgba(88,47,33,0.04)]"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span>{sectionLabels[section] ?? section}</span>
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
