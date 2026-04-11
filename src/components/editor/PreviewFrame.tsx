"use client";

import { useMemo, useRef } from "react";
import { MonitorSmartphone, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  withPreviewBridge,
  type PreviewBackdrop,
  type PreviewDevice,
  previewBackdropMeta,
  previewDeviceMeta,
} from "./preview-utils";

export function PreviewFrame({
  html,
  loading,
  error,
  templateName,
  device,
  backdrop,
  zoom,
  onZoomChange,
  onDeviceChange,
  onBackdropChange,
  sections,
}: {
  html: string;
  loading: boolean;
  error?: string | null;
  templateName: string;
  device: PreviewDevice;
  backdrop: PreviewBackdrop;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onDeviceChange: (device: PreviewDevice) => void;
  onBackdropChange: (backdrop: PreviewBackdrop) => void;
  sections: { id: string; label: string }[];
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const deviceMeta = previewDeviceMeta[device];
  const bridgedHtml = useMemo(() => withPreviewBridge(html), [html]);

  return (
    <div className="relative mx-auto w-full max-w-[620px] rounded-[2rem] border border-black/10 bg-[#171516] p-4 shadow-[0_40px_100px_rgba(25,14,10,0.22)]">
      <div className="mb-3 grid gap-3 px-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/36">
              Live Preview
            </p>
            <p className="mt-1 truncate text-sm text-white/82">{templateName}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/58">
            {deviceMeta.viewport}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 p-1">
            {Object.entries(previewDeviceMeta).map(([deviceKey, meta]) => (
              <button
                key={deviceKey}
                type="button"
                onClick={() => onDeviceChange(deviceKey as PreviewDevice)}
                className={[
                  "rounded-full px-3 py-1.5 text-[11px] transition",
                  device === deviceKey ? "bg-white text-[#181312]" : "text-white/64",
                ].join(" ")}
              >
                {meta.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 p-1">
            {Object.entries(previewBackdropMeta).map(([backdropKey, meta]) => (
              <button
                key={backdropKey}
                type="button"
                onClick={() => onBackdropChange(backdropKey as PreviewBackdrop)}
                className={[
                  "rounded-full px-3 py-1.5 text-[11px] transition",
                  backdrop === backdropKey ? "bg-white text-[#181312]" : "text-white/64",
                ].join(" ")}
              >
                {meta.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 p-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => onZoomChange(Math.max(0.75, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="px-2 text-[11px] text-white/64">{Math.round(zoom * 100)}%</span>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => onZoomChange(Math.min(1.2, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  frameRef.current?.contentWindow?.postMessage(
                    {
                      type: "wedgen-preview",
                      action: "scrollToSection",
                      section: section.id,
                    },
                    "*",
                  );
                }}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/64 transition hover:bg-white/10 hover:text-white"
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f0f10]">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/72 text-sm text-muted-foreground">
            미리보기 갱신 중...
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div
          className={`flex justify-center overflow-auto p-4 ${previewBackdropMeta[backdrop].className}`}
        >
          <div
            className="rounded-[2rem] border border-white/8 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
            style={{
              width: deviceMeta.width,
              height: deviceMeta.height,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            <div className="flex h-9 items-center justify-center border-b border-black/5">
              <div className="flex items-center gap-1.5 rounded-full bg-[#f3f3f3] px-3 py-1 text-[10px] text-[#666]">
                <MonitorSmartphone className="h-3.5 w-3.5" />
                {deviceMeta.label}
              </div>
            </div>
            <iframe
              ref={frameRef}
              title={`${templateName} 미리보기`}
              srcDoc={bridgedHtml}
              sandbox="allow-scripts allow-forms"
              className="h-[calc(100%-36px)] w-full bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
