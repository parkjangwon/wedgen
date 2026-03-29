import path from "node:path";
import { TemplateGrid } from "@/components/template-gallery/TemplateGrid";
import { scanTemplates } from "@/lib/template-scanner";

export default async function Home() {
  const templates = await scanTemplates(path.resolve(process.cwd(), "templates"));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-6 py-10 lg:px-10">
      <section className="grid gap-8 rounded-[2rem] border border-black/5 bg-white/70 p-8 shadow-[0_30px_120px_rgba(88,47,33,0.12)] backdrop-blur xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-primary/70">
            로컬 청첩장 퍼블리싱 콘솔
          </p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl leading-[0.95] tracking-[-0.04em] text-foreground md:text-7xl">
              두 사람의 분위기를 그대로 담아
              <br />
              모바일 청첩장을 ZIP으로 완성하세요.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              `wedgen`은 템플릿 선택, 실시간 미리보기, 이미지 최적화, 정적 ZIP
              생성까지 한 번에 처리하는 로컬 퍼블리싱 콘솔입니다.
            </p>
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border border-primary/10 bg-[#1f1714] p-5 text-[#f7ede2] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between rounded-full border border-white/10 px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/48">
              제작 흐름
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">ZIP</span>
          </div>
          <div className="grid gap-3 text-sm text-white/72">
            <p>1. 템플릿 고르기</p>
            <p>2. 정보/사진 입력</p>
            <p>3. 실시간 모바일 미리보기</p>
            <p>4. Tweak 또는 Optimized 빌드</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.36em] text-primary/70">
              템플릿 모음
            </p>
            <h2 className="mt-2 text-3xl tracking-[-0.03em]">첫 화면에서 바로 분위기를 고르세요</h2>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            현재 {templates.length}개의 템플릿이 준비되어 있습니다.
          </p>
        </div>
        <TemplateGrid templates={templates} />
      </section>
    </main>
  );
}
