import React from 'react';
import { InspectionReport } from '../../types/inspection';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Car,
  Gauge,
  Calendar,
  MapPin,
  Camera,
  CheckSquare,
  FileText,
  FileDown,
  Sparkles,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';

interface ReportSummaryCardProps {
  report: InspectionReport;
  onNavigateTab?: (tab: 'summary' | 'details' | 'diagram' | 'checklist' | 'photos') => void;
  onOpenPdfModal?: () => void;
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  report,
  onNavigateTab,
  onOpenPdfModal,
}) => {
  const { vehicleDetails, overallRating, scores, photos, defectPoints, checklist } = report;

  // Front Photo or primary image
  const frontPhoto =
    photos.find((p) => p.category === 'front_view')?.dataUrl ||
    photos[0]?.dataUrl ||
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';

  const categoryScoreItems = [
    { label: 'Engine / Transmission', key: 'engine', score: scores.engine ?? 82 },
    { label: 'Brakes System', key: 'brakes', score: scores.brakes ?? 100 },
    { label: 'Suspension / Steering', key: 'suspension', score: scores.suspension ?? 75 },
    { label: 'Interior Condition', key: 'interior', score: scores.interior ?? 72 },
    { label: 'AC / Heater System', key: 'ac_heater', score: scores.ac_heater ?? 31 },
    { label: 'Electrical & Lighting', key: 'electrical', score: scores.electrical ?? 43 },
    { label: 'Exterior Bodywork', key: 'exterior', score: scores.exterior ?? 18 },
    { label: 'Tyres & Wheels', key: 'tyres', score: scores.tyres ?? 25 },
  ];

  // Rating color helper
  const getRatingColor = (rate: number) => {
    if (rate >= 8.0) return 'text-emerald-500 stroke-emerald-500';
    if (rate >= 6.0) return 'text-blue-500 stroke-blue-500';
    if (rate >= 4.0) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Circular gauge math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallRating / 10) * circumference;

  // Passed items count
  const totalPassed = checklist.filter((item) => item.statusType === 'good').length;
  const totalIssues = checklist.filter((item) => item.statusType === 'danger' || item.statusType === 'warning').length;

  return (
    <div className="space-y-4">
      {/* BENTO ROW 1: Hero Vehicle Tile (7 cols) + Rating Dial Tile (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* TILE 1: Vehicle Showcase Bento Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-red-50/50 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            {/* Top metadata tags */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide font-['Chakra_Petch'] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>Al Shaheen Certified</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-600 text-white shadow-xs">
                  {vehicleDetails.registrationNo || 'UNREGISTERED'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                  {vehicleDetails.year}
                </span>
              </div>
            </div>

            {/* Vehicle Title & Model */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-['Chakra_Petch'] leading-tight">
                {vehicleDetails.make} {vehicleDetails.model}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>
                  Inspected in <strong className="text-slate-800">{vehicleDetails.location || 'Lahore'}</strong> on{' '}
                  <strong className="text-slate-800">{vehicleDetails.inspectionDate || '28 Jul 2026'}</strong>
                </span>
              </p>
            </div>

            {/* Photo & Quick Micro-Stats Horizontal Bento layout */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-6 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group/img">
                <img
                  src={frontPhoto}
                  alt={`${vehicleDetails.make} ${vehicleDetails.model}`}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    Front Evaluation Angle
                  </span>
                </div>
              </div>

              {/* 4-Box Key Specification Micro-Bento */}
              <div className="sm:col-span-6 grid grid-cols-2 gap-2">
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Mileage</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {vehicleDetails.mileage || '136,846 km'}
                  </span>
                </div>
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Capacity</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {vehicleDetails.engineCapacity || '660 cc'}
                  </span>
                </div>
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Transmission</span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {vehicleDetails.transmissionType || 'Automatic'}
                  </span>
                </div>
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Fuel Type</span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {vehicleDetails.fuelType || 'Hybrid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action strip */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Chassis: <span className="font-mono font-semibold text-slate-800">{vehicleDetails.chassisNo || 'MJ55S-***'}</span>
            </span>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('details')}
                className="font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>Edit Specs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TILE 2: Inspection Rating & Condition Meter Bento Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-[#0A1424] text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Gold Gradient Accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 font-['Chakra_Petch']">
                  Certified Evaluation
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">Overall Vehicle Score</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                Grade: {overallRating >= 8.5 ? 'A+' : overallRating >= 7.0 ? 'B+' : overallRating >= 5.0 ? 'C' : 'D'}
              </span>
            </div>

            {/* Circular Gauge Center */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Outer glow track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Progress arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className={`transition-all duration-1000 ease-out ${getRatingColor(overallRating)}`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                {/* Score Number Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-white font-['Chakra_Petch'] leading-none tracking-tight">
                    {overallRating.toFixed(1)}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-400 mt-0.5">OUT OF 10</span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {overallRating >= 7.0
                    ? 'Certified Good Condition'
                    : overallRating >= 4.5
                    ? 'Fair Condition • Minor Fixes'
                    : 'Requires Major Maintenance'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 2-stat summary */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Passed Checks</span>
              <span className="font-extrabold text-emerald-400 font-mono text-sm">{totalPassed} Items</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Flagged Items</span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">{totalIssues} Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* BENTO ROW 2: System Health Bars (7 cols) + 2D Defect & Evidence Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* TILE 3: Component Health Progress Bento Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Diagnostic Breakdown
              </span>
              <h3 className="text-base font-bold text-slate-900">Multi-Point System Health</h3>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('checklist')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>View All Checks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {categoryScoreItems.map((cat) => (
              <div key={cat.key} className="space-y-1.5 bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="truncate pr-1">{cat.label}</span>
                  <span className="font-mono text-slate-900 shrink-0 text-[11px]">{cat.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(cat.score)}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 4: 2D Defect & Bodywork Snapshot Bento Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Body Condition
              </span>
              <h3 className="text-base font-bold text-slate-900">2D Defect Mapping</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-xs border border-red-200">
              {defectPoints.length} Pins Marked
            </span>
          </div>

          {/* Quick defect count & micro breakdown */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scratches</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">
                {defectPoints.filter((p) => p.code.startsWith('A')).length}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dents</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">
                {defectPoints.filter((p) => p.code.startsWith('U')).length}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Paint Gauge</span>
              <span className="font-mono font-extrabold text-blue-600 text-base">
                {defectPoints.filter((p) => p.paintReading).length} pts
              </span>
            </div>
          </div>

          {/* Mini preview card / call to action */}
          <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                {defectPoints.length > 0
                  ? `${defectPoints.length} panel defect markers placed on blueprint`
                  : 'No body defects flagged on vehicle'}
              </span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('diagram')}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-xs shrink-0"
              >
                Open Map
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BENTO ROW 3: Inspector Verdict Tile (8 cols) + Instant Actions Bento Tile (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* TILE 5: Inspector Verdict & Certification Statement */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Inspector Professional Assessment</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              "{report.inspectorVerdict || 'Vehicle inspected under Al Shaheen Auto Hub rigorous certification standards.'}"
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <strong className="text-slate-800">Evaluator:</strong> {vehicleDetails.inspectorName || 'Muhammad Haris'} &bull; DHA Phase 6 Lahore Hub
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              Report Ref: {report.reportNumber}
            </div>
          </div>
        </div>

        {/* TILE 6: Quick Workflow Action Bento Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-['Chakra_Petch']">
              Next Action
            </span>
            <h3 className="text-base font-bold text-white">Generate PDF &amp; Export</h3>
            <p className="text-xs text-slate-300 mt-1">
              Download the multi-page branded certificate with Al Shaheen header, footer, and complete checklists.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onOpenPdfModal}
              className="w-full py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('photos')}
                className="w-full py-2 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload More Photos ({photos.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

