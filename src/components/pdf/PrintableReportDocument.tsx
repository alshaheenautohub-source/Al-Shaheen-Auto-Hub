import React from 'react';
import { InspectionReport } from '../../types/inspection';
import { BrandHeader } from '../branding/BrandHeader';
import { BrandFooter } from '../branding/BrandFooter';
import { DEFECT_LEGEND } from '../../data/defaultChecklist';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface PrintableReportDocumentProps {
  report: InspectionReport;
}

export const PrintableReportDocument: React.FC<PrintableReportDocumentProps> = ({ report }) => {
  const { vehicleDetails, defectPoints, checklist, photos, overallRating, scores } = report;

  const frontPhoto =
    photos.find((p) => p.category === 'front_view')?.dataUrl ||
    photos[0]?.dataUrl ||
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';

  // Helper for checklist items
  const getItemsForCategory = (cat: string) => checklist.filter((i) => i.category === cat);

  // Group photos into pages of 6 photos per page for high resolution
  const photoPages: (typeof photos)[] = [];
  for (let i = 0; i < photos.length; i += 6) {
    photoPages.push(photos.slice(i, i + 6));
  }

  // Summary categories
  const summaryBars = [
    { label: 'ENGINE / TRANSMISSION / CLUTCH', score: scores.engine ?? 82, sub: 'BRAKES', subScore: scores.brakes ?? 100 },
    { label: 'SUSPENSION/STEERING', score: scores.suspension ?? 75, sub: 'INTERIOR', subScore: scores.interior ?? 72 },
    { label: 'AC/HEATER', score: scores.ac_heater ?? 31, sub: 'ELECTRICAL & ELECTRONICS', subScore: scores.electrical ?? 43 },
    { label: 'EXTERIOR & BODY', score: scores.exterior ?? 18, sub: 'TYRES', subScore: scores.tyres ?? 25 },
  ];

  const renderTableRows = (items: typeof checklist) => {
    // split into 2 columns for compact table
    const half = Math.ceil(items.length / 2);
    const leftCol = items.slice(0, half);
    const rightCol = items.slice(half);

    const maxLen = Math.max(leftCol.length, rightCol.length);

    return Array.from({ length: maxLen }).map((_, idx) => {
      const leftItem = leftCol[idx];
      const rightItem = rightCol[idx];

      const getBg = (statusType: string) => {
        if (statusType === 'danger') return 'bg-red-50 text-red-700 font-bold';
        if (statusType === 'warning') return 'bg-amber-50 text-amber-800 font-bold';
        if (statusType === 'good') return 'bg-slate-50 text-slate-800';
        return 'bg-slate-50 text-slate-600';
      };

      return (
        <tr key={idx} className="border-b border-slate-200 text-[10px]">
          {/* Left item */}
          <td className="p-1.5 font-medium text-slate-700 border-r border-slate-200 w-[30%] truncate">
            {leftItem?.name || ''}
          </td>
          <td className={`p-1.5 border-r border-slate-300 w-[20%] text-center ${leftItem ? getBg(leftItem.statusType) : ''}`}>
            {leftItem?.value || ''}
          </td>

          {/* Right item */}
          <td className="p-1.5 font-medium text-slate-700 border-r border-slate-200 w-[30%] truncate">
            {rightItem?.name || ''}
          </td>
          <td className={`p-1.5 w-[20%] text-center ${rightItem ? getBg(rightItem.statusType) : ''}`}>
            {rightItem?.value || ''}
          </td>
        </tr>
      );
    });
  };

  return (
    <div id="printable-alshaheen-report" className="bg-slate-200 space-y-8 p-4 font-sans text-slate-900">
      {/* ================= PAGE 1: COVER & OVERALL SUMMARY ================= */}
      <div className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden">
        <div>
          <BrandHeader reportNumber={report.reportNumber} inspectionDate={vehicleDetails.inspectionDate} />

          {/* Page 1 Title */}
          <div className="text-center my-3">
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase font-['Chakra_Petch']">
              Car Inspection Report
            </h1>
            <p className="text-[11px] text-slate-500">Certified by Al Shaheen Auto Hub Technical Evaluation Team</p>
          </div>

          {/* Vehicle Hero + Overall Rating */}
          <div className="grid grid-cols-12 gap-6 items-center my-4">
            {/* Front Photo */}
            <div className="col-span-5 aspect-[4/3] rounded-lg overflow-hidden border border-slate-300">
              <img src={frontPhoto} alt="Car Front" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            {/* Vehicle Title & Circular Score */}
            <div className="col-span-7 flex flex-col items-center justify-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 font-['Chakra_Petch']">
                {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.year}
              </h2>

              {/* Score circle */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#2563eb"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - overallRating / 10)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Overall Rating</span>
                  <span className="text-2xl font-black text-slate-900 leading-none font-['Chakra_Petch']">
                    {overallRating.toFixed(1)} /10
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Car Details Grid */}
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Car Details
            </h3>

            <div className="grid grid-cols-4 gap-2 text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Customer/Dealer Name</span>
                <span className="font-bold text-slate-900">{vehicleDetails.customerName || 'PakWheels Lahore'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Engine Capacity</span>
                <span className="font-bold text-slate-900">{vehicleDetails.engineCapacity || '660 cc'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Mileage</span>
                <span className="font-bold text-slate-900">{vehicleDetails.mileage || '136846 km'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Transmission Type</span>
                <span className="font-bold text-slate-900">{vehicleDetails.transmissionType || 'Automatic'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Inspection Date</span>
                <span className="font-bold text-slate-900">{vehicleDetails.inspectionDate || '28 Jul 2026'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Chassis No</span>
                <span className="font-mono font-bold text-slate-900">{vehicleDetails.chassisNo || 'MJ5******513'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Engine No</span>
                <span className="font-mono font-bold text-slate-900">{vehicleDetails.engineNo || 'R0*******45'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Registration No</span>
                <span className="font-mono font-bold text-slate-900">{vehicleDetails.registrationNo || 'B*****5'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Fuel Type</span>
                <span className="font-bold text-slate-900">{vehicleDetails.fuelType || 'Hybrid'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Color</span>
                <span className="font-bold text-slate-900">{vehicleDetails.color || 'Bluish Black Pearl'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Location</span>
                <span className="font-bold text-slate-900">{vehicleDetails.location || 'Lahore'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Registered City</span>
                <span className="font-bold text-slate-900">{vehicleDetails.registeredCity || 'Sindh'}</span>
              </div>
            </div>
          </div>

          {/* Summary Progress Section */}
          <div className="mt-5 border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Summary</h3>
              <span className="text-xs font-bold text-slate-700">
                Overall Rating: <strong className="text-blue-600 font-black">{overallRating.toFixed(1)}/10</strong>
              </span>
            </div>

            <div className="space-y-3 text-[10px]">
              {summaryBars.map((bar, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-6">
                  {/* Left item */}
                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-800">
                      <span>{bar.label}</span>
                      <span className="font-mono">{bar.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${bar.score}%` }} />
                    </div>
                  </div>

                  {/* Right item */}
                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-800">
                      <span>{bar.sub}</span>
                      <span className="font-mono">{bar.subScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${bar.subScore}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BrandFooter />
      </div>

      {/* ================= PAGE 2: EXTERIOR CONDITION DIAGRAM & ACCIDENT CHECKLIST ================= */}
      <div className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden">
        <div>
          <BrandHeader compact reportNumber={report.reportNumber} />

          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider my-2 border-b border-slate-200 pb-1">
            Exterior Condition
          </h2>

          {/* 2D Car Diagram Layout + Plotted Defects */}
          <div className="grid grid-cols-12 gap-4 items-center my-2">
            <div className="col-span-7 flex justify-center">
              <div className="relative w-[340px] h-[380px] bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-2">
                <svg viewBox="0 0 460 620" className="w-full h-full pointer-events-none" fill="none">
                  {/* Outer & Center panels */}
                  <path d="M 140 30 C 180 15, 280 15, 320 30 C 335 38, 335 55, 320 62 C 280 52, 180 52, 140 62 Z" stroke="#334155" strokeWidth="2.5" fill="#f8fafc" />
                  <path d="M 145 68 C 175 62, 285 62, 315 68 L 325 155 C 290 162, 170 162, 135 155 Z" stroke="#334155" strokeWidth="2.5" fill="#ffffff" />
                  <path d="M 140 162 C 180 168, 280 168, 320 162 L 310 215 C 275 220, 185 220, 150 215 Z" stroke="#475569" strokeWidth="2" fill="#f1f5f9" />
                  <path d="M 152 222 C 185 226, 275 226, 308 222 L 305 380 C 275 384, 185 384, 155 380 Z" stroke="#334155" strokeWidth="2.5" fill="#ffffff" />
                  <path d="M 156 388 C 185 392, 275 392, 304 388 L 315 440 C 280 445, 180 445, 145 440 Z" stroke="#475569" strokeWidth="2" fill="#f1f5f9" />
                  <path d="M 144 446 C 180 452, 280 452, 316 446 L 318 510 C 280 518, 180 518, 142 510 Z" stroke="#334155" strokeWidth="2.5" fill="#ffffff" />
                  <path d="M 138 518 C 180 528, 280 528, 322 518 C 335 526, 335 545, 322 552 C 280 545, 180 545, 138 552 Z" stroke="#334155" strokeWidth="2.5" fill="#f8fafc" />
                  {/* Left & Right side exploded panels */}
                  <path d="M 75 75 C 95 70, 125 80, 125 150 C 105 155, 80 145, 65 125 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 60 160 C 90 155, 128 155, 128 260 C 95 262, 58 260, 52 250 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 52 270 C 90 270, 128 268, 128 375 C 90 375, 52 370, 48 355 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 48 385 C 85 385, 125 385, 125 470 C 100 480, 70 475, 55 455 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 385 75 C 365 70, 335 80, 335 150 C 355 155, 380 145, 395 125 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 400 160 C 370 155, 332 155, 332 260 C 365 262, 402 260, 408 250 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 408 270 C 370 270, 332 268, 332 375 C 370 375, 408 370, 412 355 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                  <path d="M 412 385 C 375 385, 335 385, 335 470 C 360 480, 390 475, 405 455 Z" stroke="#334155" strokeWidth="2" fill="#ffffff" />
                </svg>

                {/* Defect Markers */}
                {defectPoints.map((pt) => (
                  <div
                    key={pt.id}
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-black px-1 rounded-sm bg-white border border-slate-800 shadow-xs leading-tight"
                  >
                    {pt.code}
                  </div>
                ))}
              </div>
            </div>

            {/* Defect Legend Table */}
            <div className="col-span-5 space-y-2 text-[9px]">
              <h3 className="font-bold text-slate-800 uppercase border-b border-slate-200 pb-0.5">Legend</h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {DEFECT_LEGEND.map((l) => (
                  <div key={l.code} className="flex items-center gap-1">
                    <span className="font-bold w-5">{l.code}:</span>
                    <span className="text-slate-600 truncate">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body Frame Accident Checklist Table */}
          <div className="mt-4 border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>BODY FRAME ACCIDENT CHECKLIST</span>
              <span>{scores.body_frame ?? 81}%</span>
            </div>

            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('body_frame'))}</tbody>
            </table>
          </div>
        </div>

        <BrandFooter />
      </div>

      {/* ================= PAGE 3: ENGINE, BRAKES & SUSPENSION ================= */}
      <div className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden">
        <div className="space-y-4">
          <BrandHeader compact reportNumber={report.reportNumber} />

          {/* Engine / Transmission / Clutch */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>ENGINE / TRANSMISSION / CLUTCH</span>
              <span>{scores.engine ?? 82}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('engine'))}</tbody>
            </table>
          </div>

          {/* Brakes */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>BRAKES</span>
              <span>{scores.brakes ?? 100}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('brakes'))}</tbody>
            </table>
          </div>

          {/* Suspension / Steering */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>SUSPENSION / STEERING</span>
              <span>{scores.suspension ?? 75}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('suspension'))}</tbody>
            </table>
          </div>
        </div>

        <BrandFooter />
      </div>

      {/* ================= PAGE 4: INTERIOR & AC / HEATER ================= */}
      <div className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden">
        <div className="space-y-4">
          <BrandHeader compact reportNumber={report.reportNumber} />

          {/* Interior */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>INTERIOR</span>
              <span>{scores.interior ?? 72}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('interior'))}</tbody>
            </table>
          </div>

          {/* AC / Heater */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>AC / HEATER</span>
              <span>{scores.ac_heater ?? 31}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('ac_heater'))}</tbody>
            </table>
          </div>
        </div>

        <BrandFooter />
      </div>

      {/* ================= PAGE 5: ELECTRICAL, EXTERIOR & TYRES ================= */}
      <div className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden">
        <div className="space-y-4">
          <BrandHeader compact reportNumber={report.reportNumber} />

          {/* Electrical & Electronics */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>ELECTRICAL &amp; ELECTRONICS</span>
              <span>{scores.electrical ?? 43}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('electrical'))}</tbody>
            </table>
          </div>

          {/* Exterior & Body */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>EXTERIOR &amp; BODY</span>
              <span>{scores.exterior ?? 22}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('exterior'))}</tbody>
            </table>
          </div>

          {/* Tyres */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>TYRES</span>
              <span>{scores.tyres ?? 25}%</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('tyres'))}</tbody>
            </table>
          </div>
        </div>

        <BrandFooter />
      </div>

      {/* ================= PAGE 6: TEST DRIVE, VERDICT & DISCLAIMER ================= */}
      <div className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden">
        <div className="space-y-4">
          <BrandHeader compact reportNumber={report.reportNumber} />

          {/* Test Drive */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold font-['Chakra_Petch']">
              <span>TEST DRIVE EVALUATION</span>
              <span>100% Verified</span>
            </div>
            <table className="w-full border-collapse">
              <tbody>{renderTableRows(getItemsForCategory('test_drive'))}</tbody>
            </table>
          </div>

          {/* Certified Inspector Verdict */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Inspector Conclusion &amp; Recommendation:</span>
            </div>
            <p className="text-slate-700 leading-relaxed italic">
              {report.inspectorVerdict || 'Vehicle has undergone a comprehensive multi-point diagnostic evaluation by Al Shaheen Auto Hub.'}
            </p>
            <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px]">Certified Inspector:</span>
                <span className="font-bold text-slate-800">{vehicleDetails.inspectorName || 'Muhammad Haris'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[9px]">Inspection Stamp:</span>
                <span className="font-black text-red-600 uppercase tracking-widest font-['Chakra_Petch']">
                  AL SHAHEEN CERTIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Official Disclaimer matching the sample report */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-[9px] text-slate-500 leading-relaxed space-y-1">
            <strong className="text-slate-700 block uppercase">Disclaimer:</strong>
            <p>
              In case of any query or concern regarding inspection please call 0344 1411123 or 042-35732222. This report is based on the condition of the vehicle on the date of certification and provides an approximate expert estimate. Except where indicated, parts were in working condition - this report does not take into account parts not visible or not inspected without disassembly. Al Shaheen Auto Hub has relied on the odometer reading as seen at the time of inspection and is not liable for tampering prior to inspection.
            </p>
            <p>
              Unless mentioned by the dealer or seller, vehicles with repainted panels are measured using digital coating thickness gauge. All reports are subjective professional assessments.
            </p>
          </div>
        </div>

        <BrandFooter />
      </div>

      {/* ================= PAGES 7+: HIGH-RES PHOTO GALLERY GRID ================= */}
      {photoPages.map((pagePhotos, pageIdx) => (
        <div
          key={pageIdx}
          className="pdf-page w-[794px] min-h-[1123px] max-h-[1123px] bg-white mx-auto p-6 flex flex-col justify-between shadow-lg relative box-border overflow-hidden"
        >
          <div>
            <BrandHeader compact reportNumber={report.reportNumber} />

            <div className="flex justify-between items-center my-2 border-b border-slate-200 pb-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Chakra_Petch']">
                Inspection Photo Evidence &bull; Page {pageIdx + 1} of {photoPages.length}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {vehicleDetails.make} {vehicleDetails.model} - {vehicleDetails.registrationNo}
              </span>
            </div>

            {/* 6 Photo Grid matching the PakWheels / Al Shaheen 2-column x 3-row grid layout */}
            <div className="grid grid-cols-2 gap-4 my-3">
              {pagePhotos.map((photo) => (
                <div key={photo.id} className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between">
                  <div className="aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-1.5 bg-white border-t border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-800 block truncate">{photo.title}</span>
                    {photo.gaugeReading && (
                      <span className="text-[9px] font-mono font-bold text-red-600">{photo.gaugeReading}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BrandFooter />
        </div>
      ))}
    </div>
  );
};
