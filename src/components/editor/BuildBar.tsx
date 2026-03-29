"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { BuildMode } from "@/lib/optimizers";

export function BuildBar({
  buildMode,
  onBuildModeChange,
  onGenerate,
  pending,
  message,
}: {
  buildMode: BuildMode;
  onBuildModeChange: (value: BuildMode) => void;
  onGenerate: () => void;
  pending: boolean;
  message: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-black/5 bg-white/92 p-4 shadow-[0_16px_40px_rgba(92,55,38,0.08)] xl:flex-row xl:items-center xl:justify-between">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
          빌드 모드
        </p>
        <RadioGroup
          value={buildMode}
          onValueChange={(value) => onBuildModeChange(value as BuildMode)}
          className="flex flex-wrap gap-2"
        >
          <Label className="flex items-center gap-2 rounded-full border border-black/5 bg-[#fffaf5] px-3 py-2 text-sm">
            <RadioGroupItem value="tweak" />
            수정용
          </Label>
          <Label className="flex items-center gap-2 rounded-full border border-black/5 bg-[#fffaf5] px-3 py-2 text-sm">
            <RadioGroupItem value="optimized" />
            배포용
          </Label>
        </RadioGroup>
      </div>
      <div className="flex flex-col items-start gap-2 xl:items-end">
        <Button
          type="button"
          size="lg"
          className="rounded-full px-6 shadow-[0_16px_40px_rgba(157,94,67,0.22)]"
          disabled={pending}
          onClick={onGenerate}
        >
          {pending ? "ZIP 생성 중..." : "ZIP 생성"}
        </Button>
        {message ? <p className="text-[13px] text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}
