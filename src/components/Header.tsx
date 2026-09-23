import React from 'react';
import {
  Wrench,
  Car,
  PlusCircle,
  Menu,
  Server,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { ChatSession, VehicleProfile } from '../types/mechanic';

interface HeaderProps {
  currentSession: ChatSession | null;
  onNewSession: () => void;
  onOpenVehicleModal: () => void;
  onOpenApiSimulator: () => void;
  onOpenPresetsModal: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  onNewSession,
  onOpenVehicleModal,
  onOpenApiSimulator,
  onOpenPresetsModal,
  onToggleSidebar,
}) => {
  const vehicle: VehicleProfile = currentSession?.vehicle || {
    year: '2019',
    make: 'Honda',
    model: 'Civic EX',
    mileage: '48,500',
  };

  const isDiagnosed = !!currentSession?.latestDiagnosis;
  const isBooked = !!currentSession?.booking;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 sm:px-6 py-3 transition">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle session history drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                  AI Car Mechanic
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> ASE Master Tech
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Virtual Automobile Diagnostics & Repair
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Vehicle Selector */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onOpenVehicleModal}
            className="group flex items-center gap-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl transition text-left"
            title="Click to change vehicle specifications"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 flex items-center gap-1.5">
                <span>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300">
                  ({vehicle.mileage} mi)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Click to edit car details
              </span>
            </div>
          </button>
        </div>

        {/* Right: Status & Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Diagnostic Status Indicator */}
          <div className="hidden sm:flex items-center">
            {isBooked ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" /> Booked
              </span>
            ) : isDiagnosed ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg">
                <Wrench className="w-3.5 h-3.5" /> Diagnosis Ready
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Triaging
              </span>
            )}
          </div>

          {/* Test Presets Menu */}
          <button
            onClick={onOpenPresetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/80 transition shadow-xs"
            title="Load demo diagnostic scenarios and vehicle media"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Demo Scenarios</span>
          </button>

          {/* API & Backend Architecture Inspector */}
          <button
            onClick={onOpenApiSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition"
            title="Inspect service layer contracts & simulate latency/errors"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">API Config</span>
          </button>

          {/* New Diagnostic Button */}
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">New Diagnostic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
