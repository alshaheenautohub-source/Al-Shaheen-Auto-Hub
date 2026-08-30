import React, { useState } from 'react';
import { ChecklistItem, ItemStatus } from '../../types/inspection';
import { CATEGORY_DEFINITIONS } from '../../data/defaultChecklist';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Info,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';

interface InspectionChecklistSectionProps {
  checklist: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  scores: Record<string, number>;
  readOnly?: boolean;
}

const COMMON_STATUS_OPTIONS: { label: string; statusType: ChecklistItem['statusType'] }[] = [
  { label: 'Ok', statusType: 'good' },
  { label: 'Working', statusType: 'good' },
  { label: 'Working Properly', statusType: 'good' },
  { label: 'No Leakage', statusType: 'good' },
  { label: 'Present', statusType: 'good' },
  { label: 'Not Present', statusType: 'good' },
  { label: 'Repaired', statusType: 'warning' },
  { label: 'Need Repair', statusType: 'danger' },
  { label: 'Need Replacement', statusType: 'danger' },
  { label: 'Leakage', statusType: 'danger' },
  { label: 'Abnormal Noise', statusType: 'danger' },
  { label: 'Error', statusType: 'danger' },
  { label: 'Not Working', statusType: 'danger' },
  { label: 'Not Working Properly', statusType: 'danger' },
  { label: 'Scratches', statusType: 'warning' },
  { label: 'Chip', statusType: 'warning' },
  { label: 'Dirty', statusType: 'warning' },
  { label: 'Rusted', statusType: 'warning' },
  { label: 'Play', statusType: 'warning' },
  { label: 'Unsatisfactory', statusType: 'danger' },
  { label: 'Excellent', statusType: 'good' },
  { label: 'Moderate or Not Working', statusType: 'danger' },
];

export const InspectionChecklistSection: React.FC<InspectionChecklistSectionProps> = ({
  checklist,
  onChange,
  scores,
  readOnly = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'issues_only' | 'good_only'>('all');

  const handleUpdateItem = (id: string, value: string, statusType: ChecklistItem['statusType']) => {
    const updated = checklist.map((item) => {
      if (item.id === id) {
        return { ...item, value, statusType };
      }
      return item;
    });
    onChange(updated);
  };

  const handleSetAllCategoryToOk = (categoryKey: string) => {
    const updated = checklist.map((item) => {
      if (item.category === categoryKey) {
        let val = 'Ok';
        if (item.name.includes('Leakage')) val = 'No Leakage';
        else if (item.name.includes('Working') || item.name.includes('Lever')) val = 'Working';
        else if (item.name.includes('Warning Light')) val = 'Not Present';
        else if (item.name.includes('Blower')) val = 'Excellent Air Throw';
        return { ...item, value: val, statusType: 'good' as const };
      }
      return item;
    });
    onChange(updated);
  };

  // Filter items
  const filteredItems = checklist.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;

    if (filterMode === 'issues_only' && item.statusType === 'good') return false;
    if (filterMode === 'good_only' && item.statusType !== 'good') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Group by category and subcategory
  const groupedCategories = CATEGORY_DEFINITIONS.filter(
    (cat) => activeCategory === 'all' || cat.id === activeCategory
  );

  const getStatusBadge = (item: ChecklistItem) => {
    if (item.statusType === 'good') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{item.value}</span>
        </span>
      );
    }
    if (item.statusType === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{item.value}</span>
        </span>
      );
    }
    if (item.statusType === 'danger') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-300 text-xs font-bold">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>{item.value}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>{item.value}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Bar with Scores */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Inspection Categories &amp; Multi-Point Checkup</span>
          </h3>
          <span className="text-xs text-slate-500">{checklist.length} Total Parameters</span>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORY_DEFINITIONS.map((cat) => {
            const score = scores[cat.id];
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.name}</span>
                {score !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {score}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search parameter (e.g. radiator, oil leakage, shock, airbag)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('issues_only')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterMode === 'issues_only'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 hover:text-red-600'
              }`}
            >
              Issues &amp; Defects
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('good_only')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterMode === 'good_only'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              All Passed
            </button>
          </div>
        </div>
      </div>

      {/* Render Categorized Tables */}
      <div className="space-y-6">
        {groupedCategories.map((catDef) => {
          const categoryItems = filteredItems.filter((i) => i.category === catDef.id);
          if (categoryItems.length === 0) return null;

          const catScore = scores[catDef.id];

          // Subgroup by subCategory
          const subCategories: Record<string, ChecklistItem[]> = {};
          categoryItems.forEach((item) => {
            const sub = item.subCategory || 'General Parameters';
            if (!subCategories[sub]) subCategories[sub] = [];
            subCategories[sub].push(item);
          });

          return (
            <div
              key={catDef.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Category Header Banner matching official report */}
              <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm uppercase tracking-wider font-['Chakra_Petch']">
                    {catDef.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleSetAllCategoryToOk(catDef.id)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors"
                      title="Set all items in this section to Ok/Pass"
                    >
                      Quick Pass All
                    </button>
                  )}
                  {catScore !== undefined && (
                    <div className="flex items-center gap-1.5 font-bold text-sm bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-700">
                      <span>Score:</span>
                      <span
                        className={
                          catScore >= 80
                            ? 'text-emerald-400 font-black'
                            : catScore >= 50
                            ? 'text-amber-400 font-black'
                            : 'text-red-400 font-black'
                        }
                      >
                        {catScore}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subcategories Grid */}
              <div className="p-4 space-y-4">
                {Object.entries(subCategories).map(([subTitle, items]) => (
                  <div key={subTitle} className="space-y-2">
                    {subTitle !== 'General Parameters' && (
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-100 pb-1">
                        {subTitle}
                      </h4>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {item.name}
                            </span>
                            {item.hasInfoIcon && (
                              <span
                                className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-serif shrink-0 cursor-help"
                                title="Inspection criteria checked with sensor / visual verification"
                              >
                                i
                              </span>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {readOnly ? (
                              getStatusBadge(item)
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={item.value}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const opt = COMMON_STATUS_OPTIONS.find((o) => o.label === val);
                                    const statusType = opt ? opt.statusType : 'neutral';
                                    handleUpdateItem(item.id, val, statusType);
                                  }}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-red-500 ${
                                    item.statusType === 'good'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : item.statusType === 'warning'
                                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                                      : item.statusType === 'danger'
                                      ? 'bg-red-50 text-red-800 border-red-300'
                                      : 'bg-white text-slate-800 border-slate-300'
                                  }`}
                                >
                                  <option value="Ok">Ok</option>
                                  <option value="No Leakage">No Leakage</option>
                                  <option value="Working">Working</option>
                                  <option value="Working Properly">Working Properly</option>
                                  <option value="Not Present">Not Present</option>
                                  <option value="Repaired">Repaired</option>
                                  <option value="Need Repair">Need Repair</option>
                                  <option value="Need Replacement">Need Replacement</option>
                                  <option value="Leakage">Leakage</option>
                                  <option value="Abnormal Noise">Abnormal Noise</option>
                                  <option value="Error">Error</option>
                                  <option value="Not Working">Not Working</option>
                                  <option value="Not Working Properly">Not Working Properly</option>
                                  <option value="Present">Present</option>
                                  <option value="Play">Play</option>
                                  <option value="Scratches">Scratches</option>
                                  <option value="Chip">Chip</option>
                                  <option value="Dirty">Dirty</option>
                                  <option value="Rusted">Rusted</option>
                                  <option value="Black">Black</option>
                                  <option value="Unsatisfactory">Unsatisfactory</option>
                                  <option value="Moderate or Not Working">Moderate or Not Working</option>
                                  <option value="Excellent">Excellent</option>
                                  <option value="Excellent Air Throw">Excellent Air Throw</option>
                                  <option value="Smooth">Smooth</option>
                                  <option value="Centered">Centered</option>
                                  <option value="Timely Response">Timely Response</option>
                                  <option value="No Noise">No Noise</option>
                                  <option value="Seller">Seller</option>
                                  <option value="Inspector">Inspector</option>
                                  <option value="Not Checked (Cover)">Not Checked (Cover)</option>
                                  <option value={item.value}>{item.value}</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
