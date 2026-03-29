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
    <div className="flex flex-col gap-4 rounded-[1.75rem] border border-black/5 bg-white/85 p-5 shadow-[0_20px_50px_rgba(92,55,38,0.08)] lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary/70">
          Build Mode
        </p>
        <RadioGroup
          value={buildMode}
          onValueChange={(value) => onBuildModeChange(value as BuildMode)}
          className="flex flex-wrap gap-3"
        >
          <Label className="flex items-center gap-2 rounded-full border border-black/5 bg-[#fffaf5] px-3 py-2">
            <RadioGroupItem value="tweak" />
            Tweak
          </Label>
          <Label className="flex items-center gap-2 rounded-full border border-black/5 bg-[#fffaf5] px-3 py-2">
            <RadioGroupItem value="optimized" />
            Optimized
          </Label>
        </RadioGroup>
      </div>
      <div className="flex flex-col items-start gap-2 lg:items-end">
        <Button
          type="button"
          size="lg"
          className="rounded-full px-6"
          disabled={pending}
          onClick={onGenerate}
        >
          {pending ? "ZIP 생성 중..." : "ZIP 생성"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}
