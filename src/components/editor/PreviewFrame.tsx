"use client";

export function PreviewFrame({
  html,
  loading,
  error,
  templateName,
}: {
  html: string;
  loading: boolean;
  error?: string | null;
  templateName: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[620px] rounded-[2rem] border border-black/10 bg-[#171516] p-4 shadow-[0_40px_100px_rgba(25,14,10,0.22)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/36">
            Live Preview
          </p>
          <p className="mt-1 truncate text-sm text-white/82">{templateName}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/58">
          375 × 812
        </span>
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
        <iframe
          title={`${templateName} 미리보기`}
          srcDoc={html}
          sandbox="allow-scripts allow-forms"
          className="h-[860px] w-full bg-white"
        />
      </div>
    </div>
  );
}
