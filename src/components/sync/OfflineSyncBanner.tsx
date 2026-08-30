import React, { useState, useEffect } from 'react';
import {
  triggerManualSync,
  getPendingSyncCount,
  exportDatabaseBackup,
  importDatabaseBackup,
} from '../../services/storage';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
} from 'lucide-react';

interface OfflineSyncBannerProps {
  onDataChanged?: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({ onDataChanged }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const refreshPendingCount = async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);
  };

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncMessage('Internet reconnected. Syncing field inspections...');
      setIsSyncing(true);
      const res = await triggerManualSync();
      setIsSyncing(false);
      setSyncMessage(res.message);
      refreshPendingCount();
      onDataChanged?.();
      setTimeout(() => setSyncMessage(null), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage('Offline mode active. All inspections & photos saved safely in device storage.');
      setTimeout(() => setSyncMessage(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please connect to Wi-Fi or mobile data.');
      return;
    }

    setIsSyncing(true);
    const res = await triggerManualSync();
    setIsSyncing(false);
    setSyncMessage(res.message);
    refreshPendingCount();
    onDataChanged?.();
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AlShaheen_Inspections_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const content = evt.target?.result as string;
          const res = await importDatabaseBackup(content);
          alert(`Successfully restored ${res.count} inspection reports into local storage.`);
          refreshPendingCount();
          onDataChanged?.();
        } catch (err: any) {
          alert(`Import error: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
      {/* Left: Online/Offline indicator */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
            isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-amber-950 text-amber-300 border border-amber-700/50'
          }`}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3 h-3" />
              <span>Online Mode</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <WifiOff className="w-3 h-3" />
              <span>Remote Offline Mode</span>
            </>
          )}
        </div>

        {/* Sync message or status */}
        <span className="text-slate-400 hidden sm:inline">
          {syncMessage || (isOnline ? 'Direct Cloud Sync & Local Storage Active' : 'Offline Zero-Loss Field Storage Active')}
        </span>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
            {pendingCount} Pending Sync
          </span>
        )}

        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isSyncing || !isOnline}
          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          title="Synchronize local records with cloud"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        <button
          type="button"
          onClick={handleExportBackup}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Export Database Backup (.json)"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleImportBackup}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Import Database Backup (.json)"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
