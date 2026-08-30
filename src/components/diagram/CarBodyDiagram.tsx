import React, { useState, useRef } from 'react';
import { DefectPoint, DefectCode } from '../../types/inspection';
import { DEFECT_LEGEND } from '../../data/defaultChecklist';
import { Plus, Trash2, X, AlertTriangle, Gauge, Info } from 'lucide-react';

interface CarBodyDiagramProps {
  defectPoints: DefectPoint[];
  onChange: (points: DefectPoint[]) => void;
  readOnly?: boolean;
}

export const CarBodyDiagram: React.FC<CarBodyDiagramProps> = ({
  defectPoints,
  onChange,
  readOnly = false,
}) => {
  const [selectedCode, setSelectedCode] = useState<DefectCode>('A2');
  const [paintGaugeInput, setPaintGaugeInput] = useState<string>('');
  const [selectedPoint, setSelectedPoint] = useState<DefectPoint | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number; panel: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Panels definition for clicking detection and labeling
  const detectPanelName = (x: number, y: number): string => {
    if (y < 12) return 'Front Bumper / Grille';
    if (y >= 12 && y < 24 && x >= 20 && x <= 80) return 'Bonnet / Hood';
    if (y >= 24 && y < 35 && x >= 20 && x <= 80) return 'Front Windshield & Roof Front';
    if (y >= 35 && y < 65 && x >= 22 && x <= 78) return 'Roof';
    if (y >= 65 && y < 78 && x >= 20 && x <= 80) return 'Rear Windshield & Boot Lid';
    if (y >= 78 && y < 90 && x >= 20 && x <= 80) return 'Trunk / Boot Floor';
    if (y >= 90 && x >= 15 && x <= 85) return 'Rear Bumper';

    // Left side panels (x > 50)
    if (x > 50) {
      if (y < 35) return 'Left Front Fender';
      if (y >= 35 && y < 55) return 'Left Front Door';
      if (y >= 55 && y < 75) return 'Left Rear Door';
      if (y >= 75) return 'Left Rear Fender / Quarter';
    }

    // Right side panels (x <= 50)
    if (x <= 50) {
      if (y < 35) return 'Right Front Fender';
      if (y >= 35 && y < 55) return 'Right Front Door';
      if (y >= 55 && y < 75) return 'Right Rear Door';
      if (y >= 75) return 'Right Rear Fender / Quarter';
    }

    return 'Exterior Body Panel';
  };

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const panel = detectPanelName(x, y);

    setPendingCoords({ x, y, panel });
    setIsAddModalOpen(true);
  };

  const handleAddDefect = () => {
    if (!pendingCoords) return;

    const newPoint: DefectPoint = {
      id: `dp-${Date.now()}`,
      x: pendingCoords.x,
      y: pendingCoords.y,
      code: selectedCode,
      panelName: pendingCoords.panel,
      paintReading: paintGaugeInput ? parseFloat(paintGaugeInput) : undefined,
    };

    onChange([...defectPoints, newPoint]);
    setIsAddModalOpen(false);
    setPendingCoords(null);
    setPaintGaugeInput('');
  };

  const handleRemovePoint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(defectPoints.filter((p) => p.id !== id));
    if (selectedPoint?.id === id) {
      setSelectedPoint(null);
    }
  };

  const getDefectStyle = (code: DefectCode) => {
    const item = DEFECT_LEGEND.find((l) => l.code === code);
    return item || { code, label: 'Custom Defect', description: '', color: '#ef4444', bgColor: '#fee2e2' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions & Defect Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Exterior Condition &amp; Body Mapping</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {defectPoints.length} Defects Marked
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {!readOnly
              ? 'Click or tap anywhere on the vehicle blueprint to place defect markers or paint depth readings.'
              : 'Interactive diagram showing mapped scratches, dents, and paint gauge readings.'}
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Active Code:</span>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value as DefectCode)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              {DEFECT_LEGEND.map((leg) => (
                <option key={leg.code} value={leg.code}>
                  {leg.code}: {leg.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const sampleP = { x: 50, y: 15, panel: 'Bonnet / Hood' };
                setPendingCoords(sampleP);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Marker</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Diagram Canvas Area + Defect Detail Sidebox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: High Resolution 2D Exploded Car Diagram */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            onClick={handleDiagramClick}
            className={`relative w-full max-w-[460px] aspect-[460/620] bg-gradient-to-b from-slate-50/50 to-slate-100/30 rounded-xl border border-slate-200/80 select-none overflow-hidden ${
              !readOnly ? 'cursor-crosshair hover:border-red-300 transition-all' : ''
            }`}
          >
            {/* Detailed Vector Exploded Vehicle Blueprint */}
            <svg
              viewBox="0 0 460 620"
              className="w-full h-full pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* TOP-DOWN CENTER CAR BODY */}
              {/* Front Bumper */}
              <path
                d="M 140 30 C 180 15, 280 15, 320 30 C 335 38, 335 55, 320 62 C 280 52, 180 52, 140 62 C 125 55, 125 38, 140 30 Z"
                stroke="#334155"
                strokeWidth="2.5"
                fill="#f8fafc"
              />
              {/* Bonnet / Hood */}
              <path
                d="M 145 68 C 175 62, 285 62, 315 68 L 325 155 C 290 162, 170 162, 135 155 Z"
                stroke="#334155"
                strokeWidth="2.5"
                fill="#ffffff"
              />
              {/* Front Windshield */}
              <path
                d="M 140 162 C 180 168, 280 168, 320 162 L 310 215 C 275 220, 185 220, 150 215 Z"
                stroke="#475569"
                strokeWidth="2"
                fill="#f1f5f9"
              />
              {/* Roof */}
              <path
                d="M 152 222 C 185 226, 275 226, 308 222 L 305 380 C 275 384, 185 384, 155 380 Z"
                stroke="#334155"
                strokeWidth="2.5"
                fill="#ffffff"
              />
              {/* Rear Windshield */}
              <path
                d="M 156 388 C 185 392, 275 392, 304 388 L 315 440 C 280 445, 180 445, 145 440 Z"
                stroke="#475569"
                strokeWidth="2"
                fill="#f1f5f9"
              />
              {/* Trunk / Boot Lid */}
              <path
                d="M 144 446 C 180 452, 280 452, 316 446 L 318 510 C 280 518, 180 518, 142 510 Z"
                stroke="#334155"
                strokeWidth="2.5"
                fill="#ffffff"
              />
              {/* Rear Bumper */}
              <path
                d="M 138 518 C 180 528, 280 528, 322 518 C 335 526, 335 545, 322 552 C 280 545, 180 545, 138 552 C 125 545, 125 526, 138 518 Z"
                stroke="#334155"
                strokeWidth="2.5"
                fill="#f8fafc"
              />

              {/* Headlights */}
              <path
                d="M 85 45 C 95 35, 120 40, 130 55 C 120 70, 95 72, 85 62 Z"
                stroke="#D4AF37"
                strokeWidth="2"
                fill="#fefce8"
              />
              <path
                d="M 375 45 C 365 35, 340 40, 330 55 C 340 70, 365 72, 375 62 Z"
                stroke="#D4AF37"
                strokeWidth="2"
                fill="#fefce8"
              />

              {/* Taillights */}
              <path
                d="M 135 500 C 125 500, 115 515, 115 530 C 125 535, 135 532, 135 500 Z"
                stroke="#ef4444"
                strokeWidth="2"
                fill="#fee2e2"
              />
              <path
                d="M 325 500 C 335 500, 345 515, 345 530 C 335 535, 325 532, 325 500 Z"
                stroke="#ef4444"
                strokeWidth="2"
                fill="#fee2e2"
              />

              {/* RIGHT SIDE EXPLODED PANELS (Left side on diagram) */}
              {/* Right Front Fender */}
              <path
                d="M 75 75 C 95 70, 125 80, 125 150 C 105 155, 80 145, 65 125 C 60 100, 65 85, 75 75 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Right Front Door */}
              <path
                d="M 60 160 C 90 155, 128 155, 128 260 C 95 262, 58 260, 52 250 C 50 200, 52 175, 60 160 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Right Rear Door */}
              <path
                d="M 52 270 C 90 270, 128 268, 128 375 C 90 375, 52 370, 48 355 C 46 320, 48 285, 52 270 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Right Rear Fender / Quarter */}
              <path
                d="M 48 385 C 85 385, 125 385, 125 470 C 100 480, 70 475, 55 455 C 45 430, 45 400, 48 385 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Right Foot Board / Rocker */}
              <path
                d="M 32 180 L 45 180 L 45 365 L 32 365 Z"
                stroke="#64748b"
                strokeWidth="1.5"
                fill="#f8fafc"
              />

              {/* LEFT SIDE EXPLODED PANELS (Right side on diagram) */}
              {/* Left Front Fender */}
              <path
                d="M 385 75 C 365 70, 335 80, 335 150 C 355 155, 380 145, 395 125 C 400 100, 395 85, 385 75 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Left Front Door */}
              <path
                d="M 400 160 C 370 155, 332 155, 332 260 C 365 262, 402 260, 408 250 C 410 200, 408 175, 400 160 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Left Rear Door */}
              <path
                d="M 408 270 C 370 270, 332 268, 332 375 C 370 375, 408 370, 412 355 C 414 320, 412 285, 408 270 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Left Rear Fender / Quarter */}
              <path
                d="M 412 385 C 375 385, 335 385, 335 470 C 360 480, 390 475, 405 455 C 415 430, 415 400, 412 385 Z"
                stroke="#334155"
                strokeWidth="2"
                fill="#ffffff"
              />
              {/* Left Foot Board / Rocker */}
              <path
                d="M 428 180 L 415 180 L 415 365 L 428 365 Z"
                stroke="#64748b"
                strokeWidth="1.5"
                fill="#f8fafc"
              />

              {/* Side Mirrors */}
              <path
                d="M 120 150 C 110 145, 95 150, 95 160 C 95 170, 115 168, 120 150 Z"
                stroke="#334155"
                strokeWidth="1.5"
                fill="#e2e8f0"
              />
              <path
                d="M 340 150 C 350 145, 365 150, 365 160 C 365 170, 345 168, 340 150 Z"
                stroke="#334155"
                strokeWidth="1.5"
                fill="#e2e8f0"
              />

              {/* Subtle structural panel lines */}
              <line x1="230" y1="65" x2="230" y2="155" stroke="#cbd5e1" strokeDasharray="3 3" />
              <line x1="230" y1="225" x2="230" y2="380" stroke="#cbd5e1" strokeDasharray="3 3" />
              <line x1="230" y1="445" x2="230" y2="510" stroke="#cbd5e1" strokeDasharray="3 3" />
            </svg>

            {/* Placed Defect Markers */}
            {defectPoints.map((point) => {
              const style = getDefectStyle(point.code);
              const isSelected = selectedPoint?.id === point.id;

              return (
                <div
                  key={point.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoint(point);
                  }}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20 group ${
                    isSelected ? 'scale-125 ring-2 ring-red-500 rounded-full' : ''
                  }`}
                >
                  {point.code === 'DOT' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm border border-white" />
                  ) : (
                    <div
                      className="px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-md shadow-xs border flex items-center justify-center leading-none"
                      style={{
                        backgroundColor: style.bgColor,
                        color: style.color,
                        borderColor: style.color,
                      }}
                    >
                      {point.code}
                    </div>
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <span className="font-bold">
                      {point.code}: {style.label}
                    </span>
                    <span className="text-slate-300">{point.panelName}</span>
                    {point.paintReading && (
                      <span className="text-amber-300 font-mono">
                        Gauge: {point.paintReading} mil
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-center text-xs text-slate-400">
            Vehicle Exterior 2D Layout &bull; Al Shaheen Auto Hub Certified Mapping
          </div>
        </div>

        {/* Right Side: Defect Legend & Selected Defect Inspector Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Defect Info Card */}
          {selectedPoint ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="px-2 py-1 rounded-md text-xs font-black"
                    style={{
                      backgroundColor: getDefectStyle(selectedPoint.code).bgColor,
                      color: getDefectStyle(selectedPoint.code).color,
                    }}
                  >
                    {selectedPoint.code}
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {getDefectStyle(selectedPoint.code).label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Panel:</span>
                  <span className="font-semibold text-slate-800">{selectedPoint.panelName}</span>
                </div>
                {selectedPoint.paintReading && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paint Depth:</span>
                    <span className="font-mono font-bold text-red-600">
                      {selectedPoint.paintReading} mil ({Math.round(selectedPoint.paintReading * 25.4)} µm)
                    </span>
                  </div>
                )}
                {selectedPoint.note && (
                  <div className="bg-white p-2 rounded-sm border border-slate-200 mt-1 italic text-slate-700">
                    "{selectedPoint.note}"
                  </div>
                )}
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemovePoint(selectedPoint.id)}
                  className="w-full py-1.5 px-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove This Marker</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              <Info className="w-4 h-4 mx-auto mb-1 text-slate-400" />
              <span>Tap any marker on the diagram to view its specifics or paint thickness readings.</span>
            </div>
          )}

          {/* Official Legend Grid matching PakWheels & Al Shaheen format */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Defect Legend</span>
              <span className="text-[10px] text-slate-400 font-normal">Standard Codes</span>
            </h4>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
              {DEFECT_LEGEND.map((leg) => (
                <div
                  key={leg.code}
                  onClick={() => !readOnly && setSelectedCode(leg.code)}
                  className={`flex items-center gap-1.5 p-1 rounded-md transition-colors ${
                    selectedCode === leg.code && !readOnly
                      ? 'bg-red-50 ring-1 ring-red-400'
                      : 'hover:bg-slate-50'
                  } ${!readOnly ? 'cursor-pointer' : ''}`}
                >
                  <span
                    className="w-6 text-center py-0.5 rounded-sm font-black text-[10px] shrink-0"
                    style={{ backgroundColor: leg.bgColor, color: leg.color }}
                  >
                    {leg.code}
                  </span>
                  <span className="truncate text-slate-700" title={leg.label}>
                    {leg.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding / editing defect point */}
      {isAddModalOpen && pendingCoords && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Add Marker on {pendingCoords.panel}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setPendingCoords(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Defect Code</label>
                <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                  {DEFECT_LEGEND.map((leg) => (
                    <button
                      key={leg.code}
                      type="button"
                      onClick={() => setSelectedCode(leg.code)}
                      className={`p-1.5 rounded-md text-left flex items-center gap-1.5 transition-all ${
                        selectedCode === leg.code
                          ? 'ring-2 ring-red-500 bg-red-50 font-bold'
                          : 'hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span
                        className="px-1.5 py-0.5 rounded-sm font-black text-[10px]"
                        style={{ backgroundColor: leg.bgColor, color: leg.color }}
                      >
                        {leg.code}
                      </span>
                      <span className="truncate text-[10px] text-slate-700">{leg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-600" />
                    <span>Paint Gauge Reading (Optional)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">e.g. 3.2, 13.9, 30.5 mil</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.27"
                  value={paintGaugeInput}
                  onChange={(e) => setPaintGaugeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setPendingCoords(null);
                }}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDefect}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-xs"
              >
                Place Marker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
