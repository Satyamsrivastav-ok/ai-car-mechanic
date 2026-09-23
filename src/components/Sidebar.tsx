import React from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Car,
  X,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { ChatSession, VehicleProfile } from '../types/mechanic';
import { SAMPLE_PRESETS, DiagnosticPreset } from '../data/samplePresets';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  currentVehicle: VehicleProfile;
  onOpenVehicleModal: () => void;
  onSelectPreset: (preset: DiagnosticPreset) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  currentVehicle,
  onOpenVehicleModal,
  onSelectPreset,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-slate-200">Diagnostic History</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onNewSession}
              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
              title="Start a new diagnostic session"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Vehicle Card */}
        <div className="p-3 mx-3 my-2 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Car className="w-3 h-3 text-blue-400" /> Active Vehicle
            </span>
            <button
              onClick={onOpenVehicleModal}
              className="text-[10px] text-amber-400 hover:underline font-semibold"
            >
              Change
            </button>
          </div>
          <div className="text-xs font-bold text-slate-100">
            {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
          </div>
          <div className="text-[11px] text-slate-400">
            Odometer: {currentVehicle.mileage} miles
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Past Consultations ({sessions.length})
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No diagnostic sessions yet.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const hasDiag = !!session.latestDiagnosis;
              const hasBook = !!session.booking;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative p-2.5 rounded-xl cursor-pointer transition border text-left flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-slate-900 border-amber-500/50 shadow-md text-white'
                      : 'bg-slate-950/50 border-transparent hover:bg-slate-900/60 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="text-xs font-semibold truncate leading-tight">
                      {session.title || 'Car Diagnostic'}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(session.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      {hasBook ? (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 rounded-xs font-bold">
                          Booked
                        </span>
                      ) : hasDiag ? (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 rounded-xs font-bold">
                          Diagnosed
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Delete button */}
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="absolute right-2 top-2.5 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                      title="Delete this session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Demo Presets Quick Launcher */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Test Scenarios
            </span>
          </div>

          <div className="space-y-1.5">
            {SAMPLE_PRESETS.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-300 transition flex items-center justify-between group"
              >
                <span className="truncate">{preset.title}</span>
                <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded-xs text-slate-400 group-hover:text-amber-400">
                  {preset.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-900 bg-black/40 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Decoupled Service Layer</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Django Ready
          </span>
        </div>
      </aside>
    </>
  );
};
