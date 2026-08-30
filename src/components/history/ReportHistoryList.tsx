import React, { useState } from 'react';
import { InspectionReport } from '../../types/inspection';
import { Car, Plus, Search, Trash2, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';

interface ReportHistoryListProps {
  reports: InspectionReport[];
  activeReportId: string;
  onSelectReport: (id: string) => void;
  onNewReport: () => void;
  onDeleteReport: (id: string) => void;
}

export const ReportHistoryList: React.FC<ReportHistoryListProps> = ({
  reports,
  activeReportId,
  onSelectReport,
  onNewReport,
  onDeleteReport,
}) => {
  const [search, setSearch] = useState('');

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.vehicleDetails.make.toLowerCase().includes(q) ||
      r.vehicleDetails.model.toLowerCase().includes(q) ||
      r.vehicleDetails.registrationNo.toLowerCase().includes(q) ||
      r.vehicleDetails.customerName.toLowerCase().includes(q) ||
      r.reportNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">Inspection Records</h3>
          <p className="text-[11px] text-slate-400">{reports.length} Reports Saved Locally</p>
        </div>

        <button
          type="button"
          onClick={onNewReport}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Make, Reg # or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Report List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 max-h-[480px]">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No inspection reports found. Click "New Inspection" to start one.
          </div>
        ) : (
          filtered.map((r) => {
            const isActive = r.id === activeReportId;

            return (
              <div
                key={r.id}
                onClick={() => onSelectReport(r.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-red-50/80 border border-red-200 shadow-xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {r.vehicleDetails.make} {r.vehicleDetails.model}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-700 font-bold shrink-0">
                      {r.vehicleDetails.registrationNo || 'NEW'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{r.vehicleDetails.inspectionDate || 'Today'}</span>
                    </span>
                    <span className="font-semibold text-slate-700">
                      Rating: <strong className="text-blue-600">{r.overallRating.toFixed(1)}/10</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {r.syncStatus === 'synced' ? (
                    <span title="Synced with cloud">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  ) : (
                    <span title="Saved locally in device storage">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    </span>
                  )}

                  {reports.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete inspection for ${r.vehicleDetails.make} ${r.vehicleDetails.model}?`)) {
                          onDeleteReport(r.id);
                        }
                      }}
                      className="p-1 rounded-md text-slate-300 hover:text-red-600 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
