import React from 'react';
import { Phone, Mail, Globe, MapPin, Smartphone } from 'lucide-react';

interface BrandFooterProps {
  className?: string;
  showFullContact?: boolean;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ className = '', showFullContact = true }) => {
  return (
    <footer className={`bg-[#FAF8F5] relative overflow-hidden select-none ${className}`}>
      {/* Upper double gold brand stripes & car graphic accent */}
      <div className="relative pt-4 pb-2">
        {/* Stylized background car outline on right */}
        <div className="absolute right-4 top-0 w-48 sm:w-64 h-8 pointer-events-none opacity-25">
          <svg viewBox="0 0 300 40" className="w-full h-full" fill="none">
            <path
              d="M 10 35 C 50 15, 150 10, 290 35"
              stroke="#D4AF37"
              strokeWidth="2.5"
            />
            <path
              d="M 30 35 C 70 20, 140 18, 260 35"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Double Gold Horizontal Lines */}
        <div className="space-y-1 px-4">
          <div className="h-[2.5px] w-full bg-[#D4AF37]" />
          <div className="h-[2px] w-full bg-[#D4AF37]/80" />
        </div>
      </div>

      {/* Contact Details Content */}
      <div className="px-4 py-3 text-center text-slate-800 text-xs sm:text-[13px] font-medium leading-relaxed">
        {showFullContact ? (
          <div className="max-w-4xl mx-auto space-y-1.5">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="font-semibold text-slate-900">Mobile:</span> 0344 1411123
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-semibold text-slate-900">Phone:</span> 04235732222
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a href="mailto:info@alshaheenautohub.com" className="hover:underline">
                  info@alshaheenautohub.com
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <a href="https://www.alshaheenautohub.com" target="_blank" rel="noreferrer" className="hover:underline font-semibold">
                  www.alshaheenautohub.com
                </a>
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>
                <strong className="text-slate-800">Address:</strong> Main Bedian Rd, Near Askari 11 Sector A DHA Phase 6, Lahore
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-slate-500 max-w-4xl mx-auto">
            <span>Al Shaheen Auto Hub &bull; Certified Inspection</span>
            <span>UAN: 0344 1411123 &bull; www.alshaheenautohub.com</span>
          </div>
        )}
      </div>
    </footer>
  );
};
