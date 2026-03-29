import path from "node:path";
import { TemplateGrid } from "@/components/template-gallery/TemplateGrid";
import { scanTemplates } from "@/lib/template-scanner";

export default async function Home() {
  const templates = await scanTemplates(path.resolve(process.cwd(), "templates"));

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-9 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 overflow-hidden rounded-[2rem] border border-black/5 bg-[linear-gradient(135deg,#fff8f1_0%,#f4e7d6_42%,#eed8c8_100%)] p-6 shadow-[0_30px_120px_rgba(88,47,33,0.12)] xl:grid-cols-[1.2fr_0.8fr] xl:p-8">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-black/5 bg-white/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-primary/70 backdrop-blur">
            Premium Wedding Card Studio
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl leading-[0.96] tracking-[-0.05em] text-foreground md:text-6xl">
              샘플 서비스를 보며 부러웠던
              <br />
              그 수준까지 직접 다듬는
              <br />
              모바일 청첩장 제작실
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#6d5649] md:text-base">
              템플릿 선택, 문구 정리, 사진 편집, 실시간 미리보기, 정적 ZIP 배포까지
              한 번에 이어지는 로컬 청첩장 퍼블리싱 콘솔입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white/72 px-3 py-2 text-[#5f4438]">
              템플릿 {templates.length}종
            </span>
            <span className="rounded-full bg-white/72 px-3 py-2 text-[#5f4438]">
              수동 제작 지원
            </span>
            <span className="rounded-full bg-white/72 px-3 py-2 text-[#5f4438]">
              ZIP 바로 배포
            </span>
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border border-white/35 bg-[#1f1714] p-4 text-[#f7ede2] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/44">
              제작 흐름
            </p>
            <div className="grid gap-2 text-sm text-white/76">
              <p>1. 무드에 맞는 템플릿 선택</p>
              <p>2. 사진/문구/혼주/계좌 정보 입력</p>
              <p>3. 수동 제작 패널로 카피 완성</p>
              <p>4. 실시간 모바일 청첩장 확인</p>
              <p>5. 수정용 또는 배포용 ZIP 생성</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.25rem] bg-white/8 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                Templates
              </p>
              <p className="mt-2 text-2xl">{templates.length}</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/8 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                Output
              </p>
              <p className="mt-2 text-2xl">ZIP</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.36em] text-primary/70">
              Curated Samples
            </p>
            <h2 className="mt-2 text-2xl tracking-[-0.03em] md:text-3xl">
              도시 이름처럼 또렷한 무드로
              <br />
              첫 화면에서 바로 골라보세요
            </h2>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            각 템플릿은 고급 섹션과 수동 제작 패널을 함께 지원합니다.
          </p>
        </div>
        <TemplateGrid templates={templates} />
      </section>
    </main>
  );
}
