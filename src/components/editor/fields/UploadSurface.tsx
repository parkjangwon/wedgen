"use client";

import { UploadCloud } from "lucide-react";

export function UploadSurface({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid justify-items-center gap-2 rounded-[1.1rem] border border-dashed border-primary/22 bg-[linear-gradient(180deg,#fff9f4_0%,#fffdfb_100%)] px-4 py-5 text-center transition hover:border-primary/35 hover:bg-[#fff7f0]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="text-[12px] leading-5 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
