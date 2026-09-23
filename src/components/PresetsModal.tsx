import React from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Mic,
  Camera,
  Car,
  Tag,
} from 'lucide-react';
import { SAMPLE_PRESETS, DiagnosticPreset } from '../data/samplePresets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DiagnosticPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Interactive Diagnostic Demo Scenarios
              </h3>
              <p className="text-xs text-slate-400">
                Pre-configured vehicle symptoms, real automotive media, and edge cases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Presets */}
        <div className="p-6 overflow-y-auto space-y-3">
          {SAMPLE_PRESETS.map((preset) => {
            const hasMedia = preset.sampleMedia && preset.sampleMedia.length > 0;
            const isOffTopic = preset.category === 'Off-Topic Test';

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isOffTopic
                    ? 'bg-red-950/20 border-red-900/40 hover:border-red-500/50 hover:bg-red-950/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                        isOffTopic
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {preset.category}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {preset.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300">{preset.shortDescription}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      {preset.vehicle.year} {preset.vehicle.make} {preset.vehicle.model}
                    </span>

                    {hasMedia && (
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        {preset.sampleMedia?.some((m) => m.type === 'audio') && (
                          <Mic className="w-3 h-3" />
                        )}
                        {preset.sampleMedia?.some((m) => m.type === 'image') && (
                          <Camera className="w-3 h-3" />
                        )}
                        Includes {preset.sampleMedia?.length} Vehicle Media Asset(s)
                      </span>
                    )}

                    {isOffTopic && (
                      <span className="flex items-center gap-1 text-red-400 font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" /> Demonstrates Guardrail Polite Rejection
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition duration-200">
                    Load Scenario <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
