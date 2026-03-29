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
            Curated Mobile Invitation Studio
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl leading-[0.96] tracking-[-0.05em] text-foreground md:text-6xl">
              두 사람의 결혼이
              <br />
              가장 아름답게 기억되도록
              <br />
              한 장의 초대장을 완성하세요
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#6d5649] md:text-base">
              분위기 있는 템플릿, 세밀한 문구 편집, 감도 높은 사진 구성,
              실시간 미리보기와 정적 ZIP 배포까지.
              모바일 청첩장을 가장 정제된 형태로 완성하는 로컬 제작 환경입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white/72 px-3 py-2 text-[#5f4438]">
              프리미엄 템플릿 {templates.length}종
            </span>
            <span className="rounded-full bg-white/72 px-3 py-2 text-[#5f4438]">
              문구·구성 직접 편집
            </span>
            <span className="rounded-full bg-white/72 px-3 py-2 text-[#5f4438]">
              ZIP 즉시 배포
            </span>
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border border-white/35 bg-[#1f1714] p-4 text-[#f7ede2] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/44">
              Invitation Flow
            </p>
            <div className="grid gap-2 text-sm text-white/76">
              <p>1. 무드와 레이아웃이 분명한 템플릿 선택</p>
              <p>2. 사진, 문구, 혼주, 계좌 정보를 정리</p>
              <p>3. 수동 제작 패널로 카피와 흐름 완성</p>
              <p>4. 실시간 모바일 청첩장으로 최종 확인</p>
              <p>5. 수정용 또는 배포용 ZIP으로 출력</p>
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
