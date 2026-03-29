"use client";

import * as React from "react";

/**
 * 예식 일정 섹션 - 개선된 디자인
 * 카운트다운 한글 표시, 날짜/시간/장소 명확히 구분
 */

interface ScheduleSectionProps {
  scheduleTitle?: string;
  scheduleNote?: string;
  weddingDate: string;
  venue: string;
  hallDetail?: string;
  countdownLabel?: string;
}

export function ScheduleSection({
  scheduleTitle = "예식 일정",
  scheduleNote = "예식 종료 후 같은 층 연회장에서 식사가 이어집니다.",
  weddingDate,
  venue,
  hallDetail,
  countdownLabel = "저희의 결혼식이",
}: ScheduleSectionProps) {
  const [countdown, setCountdown] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const eventDate = React.useMemo(() => new Date(weddingDate), [weddingDate]);

  React.useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setCountdown(calculateCountdown());

    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate]);

  const formatDate = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = days[date.getDay()];

    return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <section className="schedule-section">
      <div className="schedule-header">
        <span className="schedule-kicker">Schedule</span>
        <h2 className="schedule-title">{scheduleTitle}</h2>
        <p className="schedule-note">{scheduleNote}</p>
      </div>

      <div className="schedule-content">
        {/* 날짜/시간/장소 카드 */}
        <div className="datetime-card">
          <div className="info-row">
            <span className="info-label">날짜</span>
            <span className="info-value date">{formatDate(eventDate)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">시간</span>
            <span className="info-value time">{formatTime(eventDate)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">장소</span>
            <div className="info-value venue">
              <span className="venue-name">{venue}</span>
              {hallDetail && <span className="hall-detail">{hallDetail}</span>}
            </div>
          </div>
        </div>

        {/* 카운트다운 섹션 */}
        <div className="countdown-section">
          <p className="countdown-text">
            {countdownLabel} <strong>{countdown.days}일</strong> 남았습니다
          </p>

          <div className="countdown-grid">
            <div className="countdown-item">
              <span className="countdown-number">{countdown.days}</span>
              <span className="countdown-unit">일</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">
                {String(countdown.hours).padStart(2, "0")}
              </span>
              <span className="countdown-unit">시간</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">
                {String(countdown.minutes).padStart(2, "0")}
              </span>
              <span className="countdown-unit">분</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">
                {String(countdown.seconds).padStart(2, "0")}
              </span>
              <span className="countdown-unit">초</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .schedule-section {
          padding: 32px 24px;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9));
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .schedule-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .schedule-kicker {
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.4);
          margin-bottom: 8px;
          display: block;
        }

        .schedule-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: inherit;
        }

        .schedule-note {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(0,0,0,0.6);
          margin: 0;
        }

        .schedule-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .datetime-card {
          background: rgba(255,255,255,0.8);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(0,0,0,0.5);
          min-width: 40px;
          letter-spacing: 0.1em;
        }

        .info-value {
          flex: 1;
          font-size: 15px;
          color: inherit;
        }

        .info-value.date {
          font-weight: 600;
          font-size: 16px;
        }

        .info-value.time {
          color: rgba(0,0,0,0.8);
        }

        .info-value.venue {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .venue-name {
          font-weight: 600;
        }

        .hall-detail {
          font-size: 13px;
          color: rgba(0,0,0,0.5);
        }

        .countdown-section {
          text-align: center;
        }

        .countdown-text {
          font-size: 15px;
          color: rgba(0,0,0,0.7);
          margin: 0 0 16px 0;
        }

        .countdown-text strong {
          color: #d4a574;
          font-weight: 600;
        }

        .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 280px;
          margin: 0 auto;
        }

        .countdown-item {
          background: linear-gradient(135deg, #faf8f5, #f5f0e8);
          border-radius: 12px;
          padding: 16px 8px;
          text-align: center;
          border: 1px solid rgba(212, 165, 116, 0.2);
        }

        .countdown-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #2d1f1a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .countdown-unit {
          display: block;
          font-size: 12px;
          color: rgba(0,0,0,0.5);
          font-weight: 500;
        }

        @media (max-width: 360px) {
          .schedule-section {
            padding: 24px 16px;
          }

          .countdown-grid {
            gap: 8px;
          }

          .countdown-item {
            padding: 12px 4px;
          }

          .countdown-number {
            font-size: 20px;
          }

          .countdown-unit {
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  );
}
