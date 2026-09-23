import React, { useState } from 'react';
import { X, Car, Check } from 'lucide-react';
import { VehicleProfile } from '../types/mechanic';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVehicle: VehicleProfile;
  onSaveVehicle: (updated: VehicleProfile) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  currentVehicle,
  onSaveVehicle,
}) => {
  const [year, setYear] = useState(currentVehicle.year || '2019');
  const [make, setMake] = useState(currentVehicle.make || 'Honda');
  const [model, setModel] = useState(currentVehicle.model || 'Civic EX');
  const [mileage, setMileage] = useState(currentVehicle.mileage || '48,500');
  const [engine, setEngine] = useState(currentVehicle.engine || '2.0L 4-Cylinder');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVehicle({
      year,
      make,
      model,
      mileage,
      engine,
    });
    onClose();
  };

  const quickVehiclePicks = [
    { year: '2019', make: 'Honda', model: 'Civic EX', mileage: '48,500', engine: '2.0L 4-Cylinder' },
    { year: '2018', make: 'Toyota', model: 'RAV4 LE', mileage: '72,100', engine: '2.5L 4-Cylinder' },
    { year: '2016', make: 'Ford', model: 'F-150 XLT', mileage: '94,200', engine: '5.0L V8 Coyote' },
    { year: '2021', make: 'Tesla', model: 'Model 3', mileage: '32,000', engine: 'Dual Motor AWD' },
    { year: '2015', make: 'Subaru', model: 'Outback 2.5i', mileage: '112,000', engine: '2.5L Boxer 4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Vehicle Specifications</h3>
              <p className="text-xs text-slate-400">Accurate vehicle data refines diagnostic tolerances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model Year</label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2019"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Make</label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Honda, Ford, Toyota..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model / Trim</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Civic EX, F-150, Camry..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Odometer (km)</label>
              <input
                type="text"
                required
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="68,500"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Engine / Powertrain</label>
            <input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              placeholder="e.g. 2.0L 4-Cylinder Turbo, 3.5L V6, EV"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Garage Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickVehiclePicks.map((pick, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    setYear(pick.year);
                    setMake(pick.make);
                    setModel(pick.model);
                    setMileage(pick.mileage);
                    setEngine(pick.engine);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  {pick.year} {pick.make} {pick.model}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Vehicle Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
