import path from "node:path";
import { TemplateGrid } from "@/components/template-gallery/TemplateGrid";
import { scanTemplates } from "@/lib/template-scanner";

export default async function Home() {
  const templates = await scanTemplates(path.resolve(process.cwd(), "templates"));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-6 py-10 lg:px-10">
      <section className="grid gap-8 overflow-hidden rounded-[2.4rem] border border-black/5 bg-[linear-gradient(135deg,#fff8f1_0%,#f4e7d6_42%,#eed8c8_100%)] p-8 shadow-[0_30px_120px_rgba(88,47,33,0.12)] xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-black/5 bg-white/65 px-4 py-2 font-mono text-xs uppercase tracking-[0.35em] text-primary/70 backdrop-blur">
            Premium Wedding Card Studio
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl leading-[0.92] tracking-[-0.05em] text-foreground md:text-7xl">
              샘플 서비스를 보며 부러웠던
              <br />
              그 수준까지 직접 다듬는
              <br />
              모바일 청첩장 제작실
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[#6d5649] md:text-lg">
              `wedgen`은 템플릿 선택, 세밀한 문구 편집, 고급 섹션 구성, 사진 갤러리,
              실시간 미리보기, 정적 ZIP 생성까지 한 번에 연결되는 로컬 청첩장
              퍼블리싱 콘솔입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/70 px-4 py-2 text-[#5f4438]">
              템플릿 {templates.length}종
            </span>
            <span className="rounded-full bg-white/70 px-4 py-2 text-[#5f4438]">
              수동 제작 지원
            </span>
            <span className="rounded-full bg-white/70 px-4 py-2 text-[#5f4438]">
              ZIP 바로 배포
            </span>
          </div>
        </div>
        <div className="grid gap-3 rounded-[2rem] border border-white/35 bg-[#1f1714] p-5 text-[#f7ede2] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/48">
              제작 흐름
            </p>
            <div className="grid gap-3 text-sm text-white/76">
              <p>1. 무드에 맞는 템플릿 선택</p>
              <p>2. 사진/문구/혼주/계좌 정보 입력</p>
              <p>3. 수동 제작 패널로 카피 완성</p>
              <p>4. 실시간 모바일 청첩장 확인</p>
              <p>5. 수정용 또는 배포용 ZIP 생성</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] bg-white/8 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/44">
                Templates
              </p>
              <p className="mt-3 text-3xl">{templates.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/8 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/44">
                Output
              </p>
              <p className="mt-3 text-3xl">ZIP</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.36em] text-primary/70">
              Curated Samples
            </p>
            <h2 className="mt-2 text-3xl tracking-[-0.03em]">
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
