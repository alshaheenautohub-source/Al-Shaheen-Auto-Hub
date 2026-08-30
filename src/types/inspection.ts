export type DefectCode =
  | 'P'   // Paint marked
  | 'A1'  // Small Scratch
  | 'A2'  // Scratch
  | 'A3'  // Big Scratch
  | 'U1'  // Small Dent
  | 'U2'  // Dent
  | 'U3'  // Big Dent
  | 'B1'  // Small dent with scratch (thumb size)
  | 'B2'  // Dent with scratch (flat of hand size)
  | 'S1'  // Rust
  | 'H'   // Paint faded
  | 'E1'  // Few Dimples
  | 'DOT'; // Minor Scratches/Dents

export interface DefectLegendItem {
  code: DefectCode;
  label: string;
  color: string;
  bgColor: string;
}

export interface DefectPoint {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  code: DefectCode;
  panelName: string;
  paintReading?: number; // in mils or microns e.g. 3.2, 13.9, 30.5
  note?: string;
}

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'CNG' | 'LPG';
export type TransmissionType = 'Automatic' | 'Manual' | 'CVT' | 'DCT' | 'Tiptronic';

export interface VehicleDetails {
  customerName: string;
  customerPhone: string;
  make: string;
  model: string;
  year: number | string;
  variant?: string;
  engineCapacity: string; // e.g. "660 cc" or "1800 cc"
  mileage: string; // e.g. "136846 km"
  transmissionType: TransmissionType;
  inspectionDate: string; // e.g. "28 Jul 2026"
  chassisNo: string;
  engineNo: string;
  registrationNo: string;
  fuelType: FuelType;
  color: string;
  location: string; // e.g. "Lahore"
  registeredCity: string; // e.g. "Sindh" or "Punjab"
  inspectorName: string;
  testDriveDoneBy: string; // e.g. "Seller" or "Inspector"
}

export type ItemStatus = 
  | 'Ok' 
  | 'Not Ok' 
  | 'Repaired' 
  | 'Need Repair' 
  | 'Need Replacement' 
  | 'Leakage' 
  | 'No Leakage' 
  | 'Working' 
  | 'Not Working' 
  | 'Working Properly' 
  | 'Not Working Properly' 
  | 'Present' 
  | 'Not Present' 
  | 'Error' 
  | 'Chip' 
  | 'Scratches' 
  | 'Foggy' 
  | 'Dirty' 
  | 'Perfect' 
  | 'Black' 
  | 'Rusted' 
  | 'Abnormal Noise' 
  | 'No Noise' 
  | 'Play' 
  | 'Smooth' 
  | 'Centered' 
  | 'Timely Response' 
  | 'Unsatisfactory' 
  | 'Excellent' 
  | 'Moderate or Not Working' 
  | 'Yes' 
  | 'No' 
  | 'Alloy' 
  | 'Steel' 
  | 'Complete' 
  | 'Incomplete'
  | 'Custom';

export interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  value: string; // Can be predefined status or custom string
  statusType: 'good' | 'warning' | 'danger' | 'neutral';
  note?: string;
  hasInfoIcon?: boolean;
}

export interface SectionScore {
  name: string;
  key: string;
  scorePercent: number;
  weight: number;
}

export interface InspectionPhoto {
  id: string;
  category: 
    | 'front_view'
    | 'oblique_front_right'
    | 'oblique_rear_right'
    | 'rear_view'
    | 'oblique_rear_left'
    | 'oblique_front_left'
    | 'odometer'
    | 'engine_compartment'
    | 'front_interior'
    | 'rear_interior'
    | 'toolkit_spare'
    | 'trunk_open'
    | 'paint_gauge'
    | 'defect_detail'
    | 'other';
  title: string;
  dataUrl: string;
  timestamp: string;
  gaugeReading?: string;
  note?: string;
}

export interface InspectionReport {
  id: string;
  reportNumber: string;
  vehicleDetails: VehicleDetails;
  defectPoints: DefectPoint[];
  checklist: ChecklistItem[];
  photos: InspectionPhoto[];
  overallRating: number; // out of 10, e.g. 4.4
  scores: Record<string, number>; // e.g. { engine: 82, brakes: 100, ... }
  inspectorVerdict: string;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'offline_saved';
}

export interface SyncStats {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;
}
