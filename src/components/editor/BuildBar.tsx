"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { BuildMode } from "@/lib/optimizers";

export function BuildBar({
  buildMode,
  onBuildModeChange,
  storageSlot,
  onStorageSlotChange,
  onGenerate,
  onSave,
  onRestore,
  onReset,
  pending,
  message,
  storageStatus,
}: {
  buildMode: BuildMode;
  onBuildModeChange: (value: BuildMode) => void;
  storageSlot: 1 | 2 | 3;
  onStorageSlotChange: (slot: 1 | 2 | 3) => void;
  onGenerate: () => void;
  onSave: () => void;
  onRestore: () => void;
  onReset: () => void;
  pending: boolean;
  message: string | null;
  storageStatus: string | null;
}) {
  return (
    <div className="grid gap-4 rounded-[1.6rem] border border-black/5 bg-[#161516] p-4 text-white shadow-[0_22px_60px_rgba(15,12,10,0.25)] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/44">
              Publish
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">
              생성 설정
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/68">
            정적 ZIP 출력
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-white/56">저장 슬롯</span>
          {[1, 2, 3].map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onStorageSlotChange(slot as 1 | 2 | 3)}
              className={[
                "rounded-full px-3 py-1.5 text-[11px] transition",
                storageSlot === slot
                  ? "bg-white text-[#181312]"
                  : "border border-white/10 bg-white/[0.04] text-white/64",
              ].join(" ")}
            >
              슬롯 {slot}
            </button>
          ))}
        </div>
        <RadioGroup
          value={buildMode}
          onValueChange={(value) => onBuildModeChange(value as BuildMode)}
          className="grid gap-2 sm:grid-cols-2"
        >
          <Label
            className={[
              "grid cursor-pointer gap-1 rounded-[1.1rem] border px-4 py-3 text-sm transition",
              buildMode === "tweak"
                ? "border-white/20 bg-white/10"
                : "border-white/8 bg-white/[0.04]",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="tweak" />
              <span className="font-medium text-white">수정용</span>
            </div>
            <span className="pl-6 text-[12px] leading-5 text-white/64">
              HTML/CSS/JS가 읽기 쉬운 상태로 유지됩니다.
            </span>
          </Label>
          <Label
            className={[
              "grid cursor-pointer gap-1 rounded-[1.1rem] border px-4 py-3 text-sm transition",
              buildMode === "optimized"
                ? "border-white/20 bg-white/10"
                : "border-white/8 bg-white/[0.04]",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="optimized" />
              <span className="font-medium text-white">배포용</span>
            </div>
            <span className="pl-6 text-[12px] leading-5 text-white/64">
              압축된 산출물로 바로 업로드할 수 있습니다.
            </span>
          </Label>
        </RadioGroup>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-white/10 bg-white/[0.04] px-4 text-white hover:bg-white/10 hover:text-white"
            onClick={onSave}
          >
            저장
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-white/10 bg-white/[0.04] px-4 text-white hover:bg-white/10 hover:text-white"
            onClick={onRestore}
          >
            복원
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-9 rounded-full px-4 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onReset}
          >
            초기화
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 xl:items-end">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-full bg-white px-6 text-[#181312] shadow-[0_20px_50px_rgba(0,0,0,0.28)] hover:bg-white/92"
          disabled={pending}
          onClick={onGenerate}
        >
          {pending ? "ZIP 생성 중..." : "ZIP 생성"}
        </Button>
        {message ? <p className="text-[12px] text-white/60">{message}</p> : null}
        {storageStatus ? <p className="text-[12px] text-white/42">{storageStatus}</p> : null}
      </div>
    </div>
  );
}
