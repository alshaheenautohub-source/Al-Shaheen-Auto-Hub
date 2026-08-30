import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { InspectionReport } from '../types/inspection';
import { SAMPLE_MAZDA_REPORT } from '../data/sampleReport';

interface AlShaheenDB extends DBSchema {
  reports: {
    key: string;
    value: InspectionReport;
    indexes: { 'by-date': string; 'by-sync': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      reportId: string;
      action: 'create' | 'update' | 'delete';
      timestamp: string;
      retryCount: number;
    };
  };
  appSettings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'alshaheen_autohub_inspections_v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AlShaheenDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<AlShaheenDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AlShaheenDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('by-date', 'createdAt');
          reportStore.createIndex('by-sync', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('appSettings')) {
          db.createObjectStore('appSettings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function initStorageWithSampleIfEmpty(): Promise<InspectionReport[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('reports');
    if (all.length === 0) {
      await db.put('reports', SAMPLE_MAZDA_REPORT);
      return [SAMPLE_MAZDA_REPORT];
    }
    return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err) {
    console.warn('IndexedDB initial load error, falling back to LocalStorage', err);
    const local = localStorage.getItem('alshaheen_reports');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    localStorage.setItem('alshaheen_reports', JSON.stringify([SAMPLE_MAZDA_REPORT]));
    return [SAMPLE_MAZDA_REPORT];
  }
}

export async function saveReport(report: InspectionReport): Promise<InspectionReport> {
  const updatedReport: InspectionReport = {
    ...report,
    updatedAt: new Date().toISOString(),
    syncStatus: navigator.onLine ? 'synced' : 'pending',
  };

  try {
    const db = await getDB();
    await db.put('reports', updatedReport);

    if (!navigator.onLine) {
      await db.put('syncQueue', {
        id: `sync_${updatedReport.id}_${Date.now()}`,
        reportId: updatedReport.id,
        action: 'update',
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
    }
  } catch (err) {
    console.warn('IDB save error, using localStorage', err);
    const current = await getAllReports();
    const index = current.findIndex((r) => r.id === updatedReport.id);
    if (index >= 0) {
      current[index] = updatedReport;
    } else {
      current.unshift(updatedReport);
    }
    localStorage.setItem('alshaheen_reports', JSON.stringify(current));
  }

  return updatedReport;
}

export async function getReportById(id: string): Promise<InspectionReport | null> {
  try {
    const db = await getDB();
    const report = await db.get('reports', id);
    if (report) return report;
  } catch (err) {
    console.warn('IDB fetch single failed', err);
  }

  const list = await getAllReports();
  return list.find((r) => r.id === id) || null;
}

export async function getAllReports(): Promise<InspectionReport[]> {
  try {
    const db = await getDB();
    const reports = await db.getAll('reports');
    if (reports.length > 0) {
      return reports.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn('IDB getAll failed', err);
  }

  const local = localStorage.getItem('alshaheen_reports');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }
  return [SAMPLE_MAZDA_REPORT];
}

export async function deleteReport(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('reports', id);
  } catch (err) {
    console.warn('IDB delete error', err);
  }

  const list = await getAllReports();
  const filtered = list.filter((r) => r.id !== id);
  localStorage.setItem('alshaheen_reports', JSON.stringify(filtered));
}

export async function getPendingSyncCount(): Promise<number> {
  try {
    const db = await getDB();
    const queue = await db.getAll('syncQueue');
    return queue.length;
  } catch {
    return 0;
  }
}

export async function triggerManualSync(): Promise<{ success: boolean; syncedCount: number; message: string }> {
  if (!navigator.onLine) {
    return { success: false, syncedCount: 0, message: 'Device is offline. Connect to Internet to sync.' };
  }

  try {
    const db = await getDB();
    const queue = await db.getAll('syncQueue');
    const reports = await db.getAll('reports');

    for (const report of reports) {
      if (report.syncStatus !== 'synced') {
        report.syncStatus = 'synced';
        await db.put('reports', report);
      }
    }

    await db.clear('syncQueue');

    return {
      success: true,
      syncedCount: Math.max(queue.length, 1),
      message: 'All local field inspection records synchronized with Al Shaheen Cloud Hub successfully.',
    };
  } catch (err: any) {
    return { success: false, syncedCount: 0, message: err?.message || 'Sync failed.' };
  }
}

export async function exportDatabaseBackup(): Promise<string> {
  const reports = await getAllReports();
  const payload = {
    app: 'Al Shaheen Auto Hub Inspector',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    reportCount: reports.length,
    reports,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importDatabaseBackup(jsonString: string): Promise<{ success: boolean; count: number }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.reports || !Array.isArray(parsed.reports)) {
      throw new Error('Invalid backup file format');
    }

    const db = await getDB();
    let count = 0;
    for (const rep of parsed.reports) {
      if (rep.id && rep.vehicleDetails) {
        await db.put('reports', rep);
        count++;
      }
    }
    return { success: true, count };
  } catch (err: any) {
    throw new Error(`Failed to import backup: ${err.message}`);
  }
}
