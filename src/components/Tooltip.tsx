import React, { useState, useRef, useEffect } from 'react';

/* =============================================================
   InfoTooltip — Komponen tooltip penjelasan fitur
   Menampilkan ikon '?' yang memunculkan popup penjelasan
   saat di-hover (desktop) atau di-klik (mobile).
   ============================================================= */

interface InfoTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  maxWidth?: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  text,
  position = 'top',
  icon = '?',
  maxWidth = 280,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click (mobile)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isVisible]);

  return (
    <span className="info-tooltip-wrapper">
      <button
        ref={triggerRef}
        className="info-tooltip-trigger"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="Info"
        type="button"
      >
        {icon}
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`info-tooltip-popup info-tooltip-${position}`}
          style={{ maxWidth }}
        >
          <div className="info-tooltip-arrow" />
          <div className="info-tooltip-content">{text}</div>
        </div>
      )}
    </span>
  );
};

/* =============================================================
   FeatureBadge — Label badge kecil untuk menjelaskan fitur
   ============================================================= */

interface FeatureBadgeProps {
  label: string;
  color?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose';
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  label,
  color = 'cyan',
}) => {
  return <span className={`feature-badge feature-badge-${color}`}>{label}</span>;
};

export default InfoTooltip;
