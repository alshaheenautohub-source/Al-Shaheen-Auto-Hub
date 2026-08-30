import React from 'react';

interface BrandHeaderProps {
  className?: string;
  reportNumber?: string;
  inspectionDate?: string;
  compact?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  className = '',
  reportNumber,
  inspectionDate,
  compact = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-[#FAF8F5] via-[#FDFBF7] to-[#F7F4EE] border-b-2 border-[#D4AF37] ${
        compact ? 'p-3' : 'p-4 sm:p-6'
      } ${className}`}
    >
      {/* Subtle Background Decorative Graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 400 120" className="w-full h-full object-cover">
          <path
            d="M 10 110 C 120 40, 260 30, 390 100"
            stroke="#1e293b"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M 80 110 C 180 50, 300 45, 390 90"
            stroke="#D4AF37"
            strokeWidth="6"
            fill="none"
          />
        </svg>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        {/* Left: Hub Identity Text Name Only */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black italic tracking-tight text-[#0F1F38] font-['Chakra_Petch']">
              AL SHAHEEN
            </span>
            <span className="text-xl sm:text-2xl font-black italic tracking-tight text-red-600 font-['Chakra_Petch']">
              AUTO HUB
            </span>
          </div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Certified Vehicle Inspection &amp; Certification
          </p>
        </div>

        {/* Right: 1 STOP SOLUTION Emblem & Meta Badge */}
        <div className="flex items-center gap-4">
          {/* 1 STOP SOLUTION Graphic badge */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-center font-['Chakra_Petch']">
              <div className="text-lg sm:text-xl font-black italic leading-none text-red-600 tracking-tighter">
                1 STOP
              </div>
              <div className="text-[9px] font-extrabold tracking-[0.25em] text-[#0F1F38] leading-tight">
                SOLUTION
              </div>
            </div>
          </div>

          {(reportNumber || inspectionDate) && (
            <div className="hidden md:flex flex-col text-right text-xs">
              {reportNumber && (
                <div className="font-mono font-bold text-slate-900">
                  <span className="text-slate-400 font-normal mr-1">Report #:</span>
                  {reportNumber}
                </div>
              )}
              {inspectionDate && (
                <div className="text-slate-500 text-[11px]">
                  <span>Date: </span>
                  <span className="font-semibold text-slate-700">{inspectionDate}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
