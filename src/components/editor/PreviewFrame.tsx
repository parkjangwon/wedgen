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
    <div className="relative mx-auto w-full max-w-[520px] rounded-[2.5rem] border border-black/10 bg-[#1d1715] p-4 shadow-[0_40px_100px_rgba(25,14,10,0.28)]">
      <div className="mb-3 flex items-center justify-between px-2 text-xs text-white/56">
        <span>{templateName}</span>
        <span>375 × 812</span>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-muted-foreground">
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
          className="h-[760px] w-full bg-white"
        />
      </div>
    </div>
  );
}
