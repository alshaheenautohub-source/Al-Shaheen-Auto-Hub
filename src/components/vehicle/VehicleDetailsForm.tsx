import React from 'react';
import { VehicleDetails, FuelType, TransmissionType } from '../../types/inspection';
import { Car, User, Calendar, MapPin, Gauge, Hash, Fuel, Cog, Shield } from 'lucide-react';

interface VehicleDetailsFormProps {
  details: VehicleDetails;
  onChange: (details: VehicleDetails) => void;
  readOnly?: boolean;
}

const COMMON_MAKES = [
  'Toyota',
  'Honda',
  'Suzuki',
  'Mazda',
  'Hyundai',
  'KIA',
  'Nissan',
  'Daihatsu',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'MG',
  'Changan',
  'Haval',
  'Proton',
  'Other',
];

const FUEL_TYPES: FuelType[] = ['Petrol', 'Hybrid', 'Diesel', 'Electric', 'CNG', 'LPG'];
const TRANSMISSION_TYPES: TransmissionType[] = ['Automatic', 'Manual', 'CVT', 'DCT', 'Tiptronic'];

export const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({
  details,
  onChange,
  readOnly = false,
}) => {
  const handleChange = (field: keyof VehicleDetails, value: any) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight">Vehicle &amp; Customer Information</h3>
            <p className="text-xs text-slate-400">Initial vehicle registration and inspection setup</p>
          </div>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Make */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-red-600" />
            <span>Make / Brand</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.make || '-'}
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                list="car-makes-list"
                placeholder="e.g. Mazda"
                value={details.make}
                onChange={(e) => handleChange('make', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              <datalist id="car-makes-list">
                {COMMON_MAKES.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        {/* Model */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Model Name</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.model || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. Flair / Corolla / Civic"
              value={details.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Year */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Model Year</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.year || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. 2017"
              value={details.year}
              onChange={(e) => handleChange('year', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Registration No */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
            <span>Registration No</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-mono font-bold text-slate-900 border border-slate-200">
              {details.registrationNo || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. LEB-20-4512"
              value={details.registrationNo}
              onChange={(e) => handleChange('registrationNo', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Mileage */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-600" />
            <span>Mileage</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.mileage || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. 136846 km"
              value={details.mileage}
              onChange={(e) => handleChange('mileage', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Engine Capacity */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Engine Capacity</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.engineCapacity || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. 660 cc / 1800 cc"
              value={details.engineCapacity}
              onChange={(e) => handleChange('engineCapacity', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Transmission */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Cog className="w-3.5 h-3.5 text-slate-600" />
            <span>Transmission</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.transmissionType}
            </div>
          ) : (
            <select
              value={details.transmissionType}
              onChange={(e) => handleChange('transmissionType', e.target.value as TransmissionType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              {TRANSMISSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Fuel Type */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fuel Type</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.fuelType}
            </div>
          ) : (
            <select
              value={details.fuelType}
              onChange={(e) => handleChange('fuelType', e.target.value as FuelType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Color */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Exterior Color</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.color || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. Bluish Black Pearl / Pearl White"
              value={details.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Chassis No */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Chassis No (VIN)</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-mono text-slate-900 border border-slate-200">
              {details.chassisNo || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. MJ55S-512940"
              value={details.chassisNo}
              onChange={(e) => handleChange('chassisNo', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-mono font-semibold uppercase focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Engine No */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Engine No</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-mono text-slate-900 border border-slate-200">
              {details.engineNo || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. R06A-459201"
              value={details.engineNo}
              onChange={(e) => handleChange('engineNo', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-mono font-semibold uppercase focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Inspection Date */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Inspection Date</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.inspectionDate || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. 28 Jul 2026"
              value={details.inspectionDate}
              onChange={(e) => handleChange('inspectionDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Customer / Dealer Name */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Customer / Dealer</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.customerName || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. PakWheels Lahore / Client Name"
              value={details.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Inspection Location */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>Inspection Location</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.location || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. Lahore (DHA Phase 6)"
              value={details.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Registered City */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Registered City / Province</label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.registeredCity || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. Sindh / Punjab / ICT"
              value={details.registeredCity}
              onChange={(e) => handleChange('registeredCity', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Inspector Name */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Al Shaheen Certified Inspector</span>
          </label>
          {readOnly ? (
            <div className="p-2.5 bg-slate-50 rounded-lg font-semibold text-slate-900 border border-slate-200">
              {details.inspectorName || '-'}
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. Muhammad Haris"
              value={details.inspectorName}
              onChange={(e) => handleChange('inspectorName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
};
