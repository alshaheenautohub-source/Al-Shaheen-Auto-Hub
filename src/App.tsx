import React, { useState, useEffect, useMemo } from 'react';
import { InspectionReport, VehicleDetails, DefectPoint, ChecklistItem, InspectionPhoto } from './types/inspection';
import {
  initStorageWithSampleIfEmpty,
  saveReport,
  getAllReports,
  deleteReport,
} from './services/storage';
import { INITIAL_CHECKLIST_TEMPLATE } from './data/defaultChecklist';
import { SAMPLE_MAZDA_REPORT } from './data/sampleReport';
import { calculateInspectionScores } from './utils/scoreCalculator';

import { BrandHeader } from './components/branding/BrandHeader';
import { BrandFooter } from './components/branding/BrandFooter';
import { OfflineSyncBanner } from './components/sync/OfflineSyncBanner';
import { VehicleDetailsForm } from './components/vehicle/VehicleDetailsForm';
import { CarBodyDiagram } from './components/diagram/CarBodyDiagram';
import { InspectionChecklistSection } from './components/checklist/InspectionChecklistSection';
import { PhotoCaptureGrid } from './components/photos/PhotoCaptureGrid';
import { ReportSummaryCard } from './components/summary/ReportSummaryCard';
import { PdfExportModal } from './components/pdf/PdfExportModal';
import { ReportHistoryList } from './components/history/ReportHistoryList';

import {
  Car,
  FileText,
  Camera,
  CheckSquare,
  Activity,
  FileDown,
  Plus,
  Save,
  Clock,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<InspectionReport[]>([SAMPLE_MAZDA_REPORT]);
  const [activeReportId, setActiveReportId] = useState<string>(SAMPLE_MAZDA_REPORT.id);
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'diagram' | 'checklist' | 'photos'>('summary');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  // Load persistent records on mount
  useEffect(() => {
    async function loadData() {
      const loaded = await initStorageWithSampleIfEmpty();
      setReports(loaded);
      if (loaded.length > 0) {
        setActiveReportId(loaded[0].id);
      }
    }
    loadData();
  }, []);

  const activeReport = useMemo(() => {
    return reports.find((r) => r.id === activeReportId) || reports[0] || SAMPLE_MAZDA_REPORT;
  }, [reports, activeReportId]);

  // Update active report handler
  const handleUpdateReport = async (updatedFields: Partial<InspectionReport>) => {
    if (!activeReport) return;

    let updated = { ...activeReport, ...updatedFields };

    // If checklist or defect points changed, recalculate scores
    if (updatedFields.checklist || updatedFields.defectPoints) {
      const calc = calculateInspectionScores(
        updated.checklist,
        updated.defectPoints
      );
      updated.overallRating = calc.overallRating;
      updated.scores = calc.scores;
    }

    // Save to IndexedDB / local storage
    const saved = await saveReport(updated);

    setReports((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));

    setSaveIndicator('Saved locally');
    setTimeout(() => setSaveIndicator(null), 2500);
  };

  // Start brand new inspection
  const handleCreateNewReport = async () => {
    const newId = `rep-${Date.now()}`;
    const newReportNo = `ASH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newVehicleDetails: VehicleDetails = {
      customerName: '',
      customerPhone: '',
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      engineCapacity: '',
      mileage: '',
      transmissionType: 'Automatic',
      inspectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      chassisNo: '',
      engineNo: '',
      registrationNo: '',
      fuelType: 'Petrol',
      color: '',
      location: 'Lahore',
      registeredCity: 'Punjab',
      inspectorName: 'Muhammad Haris',
      testDriveDoneBy: 'Inspector',
    };

    // Deep copy default checklist
    const freshChecklist = INITIAL_CHECKLIST_TEMPLATE.map((item) => ({ ...item }));

    const calc = calculateInspectionScores(freshChecklist, []);

    const newReport: InspectionReport = {
      id: newId,
      reportNumber: newReportNo,
      vehicleDetails: newVehicleDetails,
      defectPoints: [],
      checklist: freshChecklist,
      photos: [],
      overallRating: calc.overallRating,
      scores: calc.scores,
      inspectorVerdict: 'Vehicle inspection initialized by Al Shaheen Auto Hub certified evaluator.',
      disclaimer: SAMPLE_MAZDA_REPORT.disclaimer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: navigator.onLine ? 'synced' : 'pending',
    };

    const saved = await saveReport(newReport);
    setReports((prev) => [saved, ...prev]);
    setActiveReportId(saved.id);
    setActiveTab('details'); // take user straight to vehicle details setup
    setIsHistoryDrawerOpen(false);
  };

  const handleDeleteReport = async (id: string) => {
    await deleteReport(id);
    const updated = await getAllReports();
    setReports(updated);
    if (updated.length > 0) {
      setActiveReportId(updated[0].id);
    }
  };

  interface NavTabItem {
    id: 'summary' | 'details' | 'diagram' | 'checklist' | 'photos';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const tabs: NavTabItem[] = [
    { id: 'summary', label: 'Report Overview', icon: Activity },
    { id: 'details', label: '1. Vehicle Details', icon: Car },
    { id: 'diagram', label: '2. 2D Body Diagram', icon: CheckSquare, badge: activeReport.defectPoints.length },
    { id: 'checklist', label: '3. Multi-Point Check', icon: FileText },
    { id: 'photos', label: '4. Evidence Photos', icon: Camera, badge: activeReport.photos.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Offline Connectivity & Cloud Sync Banner */}
      <OfflineSyncBanner onDataChanged={async () => setReports(await getAllReports())} />

      {/* Main Al Shaheen Auto Hub Brand Header */}
      <header className="bg-white shadow-xs sticky top-0 z-30">
        <BrandHeader
          reportNumber={activeReport.reportNumber}
          inspectionDate={activeReport.vehicleDetails.inspectionDate}
        />

        {/* Action Toolbar & Navigation Tabs */}
        <div className="px-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 py-2 border-t border-slate-800">
          {/* Active vehicle identifier */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Records</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px]">
                {reports.length}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white font-['Chakra_Petch'] truncate max-w-[200px] sm:max-w-xs">
                {activeReport.vehicleDetails.make || 'Untitled'} {activeReport.vehicleDetails.model}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-red-600 text-white font-bold">
                {activeReport.vehicleDetails.registrationNo || 'NO REG'}
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {saveIndicator && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveIndicator}</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleCreateNewReport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">New Inspection</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="px-4 sm:px-6 bg-white border-b border-slate-200 flex gap-1 sm:gap-4 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 border-b-2 ${
                  isCurrent
                    ? 'border-red-600 text-red-600 bg-red-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isCurrent ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: Summary Overview Card (Bento Grid) */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <ReportSummaryCard
              report={activeReport}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: Vehicle Details Form */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <VehicleDetailsForm
              details={activeReport.vehicleDetails}
              onChange={(details) => handleUpdateReport({ vehicleDetails: details })}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <span>Save &amp; Continue to 2D Body Diagram</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: 2D Body Diagram */}
        {activeTab === 'diagram' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <CarBodyDiagram
              defectPoints={activeReport.defectPoints}
              onChange={(points) => handleUpdateReport({ defectPoints: points })}
            />
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                &larr; Back to Vehicle Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <span>Continue to Multi-Point Checklist</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Multi-Point Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <InspectionChecklistSection
              checklist={activeReport.checklist}
              scores={activeReport.scores}
              onChange={(checklist) => handleUpdateReport({ checklist })}
            />
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                &larr; Back to 2D Diagram
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <span>Continue to Photo Capture</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Photos & Evidence */}
        {activeTab === 'photos' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <PhotoCaptureGrid
              photos={activeReport.photos}
              onChange={(photos) => handleUpdateReport({ photos })}
            />
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                &larr; Back to Checklist
              </button>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <FileDown className="w-4 h-4" />
                <span>Finish &amp; Download PDF Report</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Al Shaheen Auto Hub Main Brand Footer */}
      <BrandFooter />

      {/* PDF Export Modal */}
      <PdfExportModal
        report={activeReport}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* History Drawer / Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-start animate-in fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">Saved Inspections</span>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ReportHistoryList
                reports={reports}
                activeReportId={activeReportId}
                onSelectReport={(id) => {
                  setActiveReportId(id);
                  setIsHistoryDrawerOpen(false);
                }}
                onNewReport={handleCreateNewReport}
                onDeleteReport={handleDeleteReport}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
