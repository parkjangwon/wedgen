"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateMeta } from "@/types";

interface TemplatePreviewModalProps {
  template: TemplateMeta | null;
  isOpen: boolean;
  onClose: () => void;
}

const sampleConfig = {
  locale: "ko",
  sectionOrder: ["hero", "greeting", "family", "schedule", "location", "account"],
  data: {
    groomName: "김민수",
    brideName: "이수진",
    weddingDate: "2026-05-15T14:00:00+09:00",
    heroEyebrow: "Wedding day",
    heroTagline: "서로의 계절이 된 두 사람이 평생의 약속을 나눕니다.",
    greetingTitle: "소중한 분들을 초대합니다",
    greeting: "저희 두 사람의 작은 만남이 사랑의 결실을 이루어 평생의 첫 장면을 함께하게 되었습니다. 귀한 걸음으로 축복해 주시면 오래도록 소중히 간직하겠습니다.",
    groomFather: "김건호",
    groomMother: "이미자",
    brideFather: "이주명",
    brideMother: "유수지",
    groomContact: "010-1234-5678",
    brideContact: "010-2345-6789",
    familyNote: "양가 부모님과 함께 감사한 마음으로 초대의 말씀을 전합니다.",
    scheduleTitle: "예식 일정",
    scheduleNote: "예식 종료 후 같은 층 연회장에서 식사가 이어집니다.",
    countdownLabel: "저희의 결혼식이",
    venue: "그랜드볼룸",
    hallDetail: "3층 그랜드홀",
    address: "서울 강남구 테헤란로 1",
    venuePhone: "02-1234-5678",
    navigationNote: "아래 버튼으로 길안내를 바로 시작할 수 있습니다.",
    transport: "2호선 역삼역 4번 출구 도보 5분",
    parking: "예식장 지하주차장 2시간 무�료",
    accountTitle: "마음 전하실 곳",
    accountIntro: "참석이 어려우신 분들을 위해 계좌번호를 함께 남깁니다. 따뜻한 마음만 감사히 받겠습니다.",
    groomAccount: "신한은행 110-000-000000 김민수",
    brideAccount: "국민은행 110-000-000000 이수진",
    mapCoords: { lat: "37.5012", lng: "127.0396" },
  },
  style: {
    colorScheme: "warm-blush",
    fontSourceMode: "preset",
    headingFont: "gowun-batang",
    bodyFont: "noto-sans-kr",
    animation: "fade",
  },
  assets: {
    heroImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    couplePhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
};

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
}: TemplatePreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !template) return;

    const currentTemplate = template;

    async function loadPreview() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: currentTemplate.id,
            config: sampleConfig,
          }),
        });

        const data = (await response.json()) as { html?: string; error?: string };

        if (!response.ok || !data.html) {
          throw new Error(data.error || "미리보기를 불러오지 못했습니다.");
        }

        setPreviewHtml(data.html);
      } catch (err) {
        setError(err instanceof Error ? err.message : "미리보기 오류");
      } finally {
        setLoading(false);
      }
    }

    void loadPreview();
  }, [isOpen, template]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/editor/${template.id}`}>
              <Button className="rounded-full bg-[#b97a56] hover:bg-[#a56a46]">
                <ExternalLink className="mr-2 h-4 w-4" />
                이 템플릿으로 시작
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-[#f5f5f5]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#b97a56] border-t-transparent" />
                <p className="text-sm text-gray-500">미리보기 로딩 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="relative h-full max-h-[700px] w-full max-w-[400px] overflow-hidden rounded-[2.5rem] border-8 border-[#2d1f1a] bg-white shadow-2xl">
                <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-[#2d1f1a]" />
                <iframe
                  srcDoc={previewHtml}
                  title={`${template.name} 미리보기`}
                  className="h-full w-full"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-center text-sm text-[#8d7d73]">
            실제 제작 시 사진과 문구를 자유롭게 변경할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
