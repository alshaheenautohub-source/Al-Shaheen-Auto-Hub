import React, { useState } from 'react';
import { InspectionReport } from '../../types/inspection';
import { generateInspectionPdf, downloadPdfBlob } from '../../utils/pdfGenerator';
import { PrintableReportDocument } from './PrintableReportDocument';
import { FileDown, Printer, Share2, X, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PdfExportModalProps {
  report: InspectionReport;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ report, isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      const blob = await generateInspectionPdf('printable-alshaheen-report', report, {
        onProgress: (p, stage) => {
          setProgress(p);
          setProgressStage(stage);
        },
      });

      const cleanMake = report.vehicleDetails.make.replace(/\s+/g, '_');
      const cleanModel = report.vehicleDetails.model.replace(/\s+/g, '_');
      const reg = (report.vehicleDetails.registrationNo || 'Inspection').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Al_Shaheen_${cleanMake}_${cleanModel}_${reg}_Report.pdf`;

      downloadPdfBlob(blob, fileName);
      setDownloadSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#DC2626', '#1E293B'],
      });
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert(`PDF Generation failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-black text-base flex items-center gap-2 font-['Chakra_Petch']">
              <span>Al Shaheen Auto Hub &bull; PDF Report Center</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-red-600 text-white font-sans font-bold">
                Certified
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {report.vehicleDetails.make} {report.vehicleDetails.model} ({report.vehicleDetails.year}) &bull; {report.reportNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print directly"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF ({progress}%)...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Professional PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress notification bar */}
        {isGenerating && (
          <div className="bg-red-50 p-2.5 border-b border-red-200 text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span className="font-semibold">{progressStage}</span>
            </div>
            <span className="font-mono font-bold">{progress}%</span>
          </div>
        )}

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto bg-slate-200/80 p-4 sm:p-6 flex justify-center">
          <div className="origin-top transform sm:scale-95 transition-transform">
            <PrintableReportDocument report={report} />
          </div>
        </div>
      </div>
    </div>
  );
};
