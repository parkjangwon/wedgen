import path from "node:path";
import Link from "next/link";
import { scanTemplates } from "@/lib/template-scanner";
import { TemplateGrid } from "@/components/template-gallery/TemplateGrid";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Shield, Zap, Download, Smartphone } from "lucide-react";

export default async function Home() {
  const templates = await scanTemplates(path.resolve(process.cwd(), "templates"));
  const featuredTemplates = templates.filter((t) => t.id !== "blank-canvas");
  const blankCanvas = templates.find((t) => t.id === "blank-canvas");

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <section className="relative overflow-hidden px-4 pb-16 pt-20 lg:pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5ebe0]/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b97a56]/20 bg-white/80 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#b97a56]" />
            <span className="text-sm text-[#5d4037]">한국 커플을 위한 모바일 청첩장 메이커</span>
          </div>
          <h1 className="mb-6 text-4xl font-medium tracking-tight text-[#2d1f1a] lg:text-6xl">
            우리 손으로 만드는
            <br />
            <span className="text-[#b97a56]">특별한 모바일 청첩장</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#6d5d53]">
            템플릿부터 직접 디자인까지. 로컬에서 안전하게 제작하고
            <br className="hidden sm:block" />
            GitHub Pages나 Netlify로 바로 배포하세요.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={blankCanvas ? `/editor/${blankCanvas.id}` : `/editor/${templates[0]?.id}`}>
              <Button
                size="lg"
                className="h-14 rounded-full bg-[#b97a56] px-8 text-base shadow-lg shadow-[#b97a56]/20 hover:bg-[#a56a46]"
              >
                <Zap className="mr-2 h-5 w-5" />
                지금 바로 제작하기
              </Button>
            </Link>
            <Link href="#templates">
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-[#d4c4b5] px-8 text-base hover:bg-[#f5ebe0]"
              >
                템플릿 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e8e0d8] bg-white/60 px-4 py-8 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 lg:gap-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebe0]">
              <Shield className="h-5 w-5 text-[#b97a56]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#2d1f1a]">로컬 처리</p>
              <p className="text-xs text-[#8d7d73]">사진·정보 외부 전송 없음</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebe0]">
              <Download className="h-5 w-5 text-[#b97a56]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#2d1f1a]">ZIP 생성</p>
              <p className="text-xs text-[#8d7d73]">정적 파일로 완전한 소유권</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebe0]">
              <Smartphone className="h-5 w-5 text-[#b97a56]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#2d1f1a]">모바일 최적화</p>
              <p className="text-xs text-[#8d7d73]">카카오톡 공유 완벽 대응</p>
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className="px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-medium tracking-tight text-[#2d1f1a] lg:text-4xl">
              마음에 드는 템플릿을 선택하세요
            </h2>
            <p className="mx-auto max-w-xl text-[#6d5d53]">
              11가지 다양한 스타일의 템플릿을 제공합니다.
              <br />
              모든 템플릿은 실시간으로 미리보고 수정할 수 있습니다.
            </p>
          </div>
          <TemplateGrid templates={featuredTemplates} />
        </div>
      </section>

      <section className="bg-white px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-medium tracking-tight text-[#2d1f1a] lg:text-4xl">
              완벽한 청첩장을 위한 모든 것
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e8e0d8] bg-[#faf8f5] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b97a56]/10">
                <Heart className="h-6 w-6 text-[#b97a56]" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#2d1f1a]">감성적인 디자인</h3>
              <p className="text-sm leading-relaxed text-[#6d5d53]">
                전문 디자이너가 제작한 템플릿으로 특별한 날을 더욱 빛내세요.
                폰트, 색상, 레이아웃을 자유롭게 조정할 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e0d8] bg-[#faf8f5] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b97a56]/10">
                <Zap className="h-6 w-6 text-[#b97a56]" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#2d1f1a]">실시간 미리보기</h3>
              <p className="text-sm leading-relaxed text-[#6d5d53]">
                수정하는 즉시 모바일 화면으로 확인하세요.
                iPhone, Android, 다양한 디바이스에서의 모습을 미리 볼 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e0d8] bg-[#faf8f5] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b97a56]/10">
                <Download className="h-6 w-6 text-[#b97a56]" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#2d1f1a]">즉시 배포 가능</h3>
              <p className="text-sm leading-relaxed text-[#6d5d53]">
                완성된 청첩장을 ZIP으로 받아 GitHub Pages나 Netlify에 바로 올리세요.
                복잡한 설정 없이 몇 분이면 배포 완료!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[#b97a56] to-[#8b5a3a] p-8 text-center text-white lg:p-16">
          <h2 className="mb-4 text-3xl font-medium tracking-tight lg:text-4xl">
            지금 바로 시작하세요
          </h2>
          <p className="mb-8 text-lg text-white/80">
            로컬에서 안전하게, 당신만의 특별한 청첩장을 만들어보세요.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={blankCanvas ? `/editor/${blankCanvas.id}` : `/editor/${templates[0]?.id}`}>
              <Button
                size="lg"
                className="h-14 rounded-full bg-white px-8 text-base text-[#b97a56] shadow-lg hover:bg-white/90"
              >
                <Zap className="mr-2 h-5 w-5" />
                무료로 제작 시작
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e0d8] px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-[#8d7d73]">
          <p>WedGen - 한국 커플을 위한 모바일 청첩장 메이커</p>
        </div>
      </footer>
    </div>
  );
}
