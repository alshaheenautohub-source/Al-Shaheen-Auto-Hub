import React, { useState, useRef } from 'react';
import { InspectionPhoto } from '../../types/inspection';
import { Camera, Upload, Trash2, Eye, Plus, CheckCircle, Image as ImageIcon, X } from 'lucide-react';

interface PhotoCaptureGridProps {
  photos: InspectionPhoto[];
  onChange: (photos: InspectionPhoto[]) => void;
  readOnly?: boolean;
}

const REQUIRED_PHOTO_SLOTS: { category: InspectionPhoto['category']; title: string; hint: string }[] = [
  { category: 'front_view', title: 'Front View', hint: 'Direct front straight shot showing bumper & grille' },
  { category: 'oblique_front_right', title: 'Oblique Front - Right', hint: '45-degree angle showing front & right side' },
  { category: 'oblique_rear_right', title: 'Oblique Rear – Right', hint: '45-degree angle showing right side & trunk' },
  { category: 'rear_view', title: 'Rear View', hint: 'Direct rear view showing trunk & rear bumper' },
  { category: 'oblique_rear_left', title: 'Oblique Rear – Left', hint: '45-degree angle showing left side & trunk' },
  { category: 'oblique_front_left', title: 'Oblique Front – Left', hint: '45-degree angle showing left side & hood' },
  { category: 'odometer', title: 'Odometer', hint: 'Clear snapshot of dashboard showing mileage' },
  { category: 'engine_compartment', title: 'Engine Compartment', hint: 'Under bonnet showing engine, battery, fluids' },
  { category: 'front_interior', title: 'Front Interior', hint: 'Dashboard, steering wheel, seats & console' },
  { category: 'rear_interior', title: 'Rear Interior', hint: 'Back seats, roof upholstery & floor mats' },
  { category: 'toolkit_spare', title: 'Tool kit / Spare tyre', hint: 'Jack, spare wheel & tools compartment' },
  { category: 'trunk_open', title: 'Trunk Open', hint: 'Boot space floor and lock pillar condition' },
];

export const PhotoCaptureGrid: React.FC<PhotoCaptureGridProps> = ({
  photos,
  onChange,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'paint_gauges' | 'all'>('standard');
  const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSlotForCapture, setActiveSlotForCapture] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Compress image before saving to IndexedDB
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, specificCategory?: InspectionPhoto['category'], specificTitle?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newPhotos: InspectionPhoto[] = [...photos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await compressImage(file);

        const category = specificCategory || 'other';
        const title = specificTitle || file.name.replace(/\.[^/.]+$/, '') || 'Inspection Photo';

        // Check if updating an existing slot photo
        const existingIdx = newPhotos.findIndex((p) => p.category === category && specificCategory !== 'other' && specificCategory !== 'paint_gauge');
        if (existingIdx >= 0) {
          newPhotos[existingIdx] = {
            ...newPhotos[existingIdx],
            dataUrl: base64,
            timestamp: new Date().toLocaleString(),
          };
        } else {
          newPhotos.push({
            id: `photo-${Date.now()}-${i}`,
            category,
            title,
            dataUrl: base64,
            timestamp: new Date().toLocaleString(),
          });
        }
      }

      onChange(newPhotos);
    } catch (err) {
      console.error('Error loading photo:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      setActiveSlotForCapture(null);
    }
  };

  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(photos.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  const triggerUploadForSlot = (category: InspectionPhoto['category'], title: string) => {
    setActiveSlotForCapture(category);
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-category', category);
      fileInputRef.current.setAttribute('data-title', title);
      fileInputRef.current.click();
    }
  };

  const triggerCameraForSlot = (category: InspectionPhoto['category'], title: string) => {
    setActiveSlotForCapture(category);
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute('data-category', category);
      cameraInputRef.current.setAttribute('data-title', title);
      cameraInputRef.current.click();
    }
  };

  const standardSlotPhotos = REQUIRED_PHOTO_SLOTS.map((slot) => {
    const existing = photos.find((p) => p.category === slot.category);
    return { ...slot, photo: existing };
  });

  const paintGaugePhotos = photos.filter((p) => p.category === 'paint_gauge');
  const otherPhotos = photos.filter(
    (p) => !REQUIRED_PHOTO_SLOTS.some((s) => s.category === p.category) && p.category !== 'paint_gauge'
  );

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const category = fileInputRef.current?.getAttribute('data-category') as InspectionPhoto['category'] || 'other';
          const title = fileInputRef.current?.getAttribute('data-title') || 'Inspection Photo';
          handleFileSelected(e, category, title);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const category = cameraInputRef.current?.getAttribute('data-category') as InspectionPhoto['category'] || 'other';
          const title = cameraInputRef.current?.getAttribute('data-title') || 'Captured Photo';
          handleFileSelected(e, category, title);
        }}
      />

      {/* Header controls & stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-600" />
            <span>Inspection Photo Records</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {photos.length} Captured
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture essential exterior profiles, odometer, engine bay, interior upholstery, and paint gauge thickness photos.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (cameraInputRef.current) {
                  cameraInputRef.current.removeAttribute('data-category');
                  cameraInputRef.current.removeAttribute('data-title');
                  cameraInputRef.current.click();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Snap</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('data-category');
                  fileInputRef.current.removeAttribute('data-title');
                  fileInputRef.current.click();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Files</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('standard')}
          className={`pb-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'standard'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mandatory Car Angles ({standardSlotPhotos.filter((s) => s.photo).length}/{REQUIRED_PHOTO_SLOTS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paint_gauges')}
          className={`pb-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'paint_gauges'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Paint Gauge Readings ({paintGaugePhotos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'all'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Photo Gallery ({photos.length})
        </button>
      </div>

      {/* Tab 1: Mandatory Angles Grid */}
      {activeTab === 'standard' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {standardSlotPhotos.map((slot) => {
            const hasPhoto = Boolean(slot.photo);

            return (
              <div
                key={slot.category}
                className={`relative group rounded-xl border overflow-hidden flex flex-col justify-between transition-all bg-white ${
                  hasPhoto
                    ? 'border-slate-200 shadow-xs'
                    : 'border-dashed border-slate-300 hover:border-red-400 bg-slate-50/50'
                }`}
              >
                {/* Photo Preview or Empty Placeholder */}
                <div
                  className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (slot.photo) {
                      setSelectedPhoto(slot.photo);
                    } else if (!readOnly) {
                      triggerCameraForSlot(slot.category, slot.title);
                    }
                  }}
                >
                  {slot.photo ? (
                    <>
                      <img
                        src={slot.photo.dataUrl}
                        alt={slot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhoto(slot.photo!);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900"
                          title="View Fullsize"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={(e) => handleRemovePhoto(slot.photo!.id, e)}
                            className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Captured</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                      <ImageIcon className="w-7 h-7 text-slate-300 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-600">{slot.title}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{slot.hint}</span>

                      {!readOnly && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerCameraForSlot(slot.category, slot.title);
                            }}
                            className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Snap</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerUploadForSlot(slot.category, slot.title);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Caption Bar */}
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">{slot.title}</div>
                  {slot.photo?.note && (
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{slot.photo.note}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Paint Gauge Readings */}
      {activeTab === 'paint_gauges' && (
        <div className="space-y-4">
          {!readOnly && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-900">Digital Coating Thickness Gauge Photos</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Upload close-up photos of Uni-T / Elcometer gauge on vehicle panels (Bonnet, Roof, Fenders, Doors) to certify paint thickness.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (cameraInputRef.current) {
                    cameraInputRef.current.setAttribute('data-category', 'paint_gauge');
                    cameraInputRef.current.setAttribute('data-title', 'Paint Thickness Gauge');
                    cameraInputRef.current.click();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shrink-0"
              >
                + Add Gauge Photo
              </button>
            </div>
          )}

          {paintGaugePhotos.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No paint gauge photos added yet. Use the button above to upload meter measurement snapshots.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {paintGaugePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs group"
                >
                  <div
                    className="relative aspect-square cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhoto(photo.id, e)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-2 text-xs">
                    <div className="font-bold text-slate-800 truncate">{photo.title}</div>
                    {photo.gaugeReading && (
                      <div className="text-red-600 font-mono font-bold text-[11px]">{photo.gaugeReading}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Photos */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs group"
            >
              <div
                className="relative aspect-[4/3] cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-1 rounded-md bg-slate-900/80 text-white"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => handleRemovePhoto(photo.id, e)}
                      className="p-1 rounded-md bg-red-600 text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-2 text-xs">
                <div className="font-bold text-slate-900 truncate">{photo.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{photo.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-sm">{selectedPhoto.title}</h3>
                <p className="text-[11px] text-slate-400">{selectedPhoto.timestamp}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-hidden bg-black">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.title}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {selectedPhoto.note && (
              <div className="p-3 bg-slate-800/80 text-xs text-slate-200 border-t border-slate-700">
                <span className="font-semibold text-slate-400">Inspector Note: </span>
                {selectedPhoto.note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
