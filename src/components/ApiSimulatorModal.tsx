import React, { useState } from 'react';
import {
  X,
  Server,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code2,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { getApiConfig, setApiConfig, ApiConfig } from '../services/apiClient';

interface ApiSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSimulatorModal: React.FC<ApiSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfigState] = useState<ApiConfig>(getApiConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLatencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setConfigState((prev) => ({ ...prev, simulatedLatencyMs: val }));
  };

  const handleErrorModeChange = (mode: 'none' | 'network_timeout' | 'server_500') => {
    setConfigState((prev) => ({ ...prev, simulatedErrorMode: mode }));
  };

  const handleSave = () => {
    setApiConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    const def = {
      simulatedLatencyMs: 650,
      simulatedErrorMode: 'none' as const,
      apiUrl: '/api/v1',
    };
    setConfigState(def);
    setApiConfig(def);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Service Layer & Django Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Decoupled API Client & Error Resilience Inspector
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Architecture Callout */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4" /> Architectural Design
            </div>
            <p className="text-slate-300 leading-relaxed">
              All UI components strictly consume <code>src/services/apiClient.ts</code> and <code>src/services/mechanicAiService.ts</code>. No UI component makes raw HTTP requests directly.
            </p>
            <p className="text-slate-400">
              When ready to deploy with Django REST Framework, simply point <code>apiUrl</code> to your Django host (e.g. <code>http://localhost:8000/api/v1</code>). All models and payload schemas mirror Django Ninja / DRF serializers.
            </p>
          </div>

          {/* DRF Endpoints Contract */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-amber-400" /> Django REST Framework Endpoint Contracts
            </span>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400">GET /api/v1/sessions/</span>
                <span className="text-slate-500">List all diagnostic chats</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">POST /api/v1/sessions/</span>
                <span className="text-slate-500">Initialize new session</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">POST /api/v1/sessions/{'{id}'}/messages/</span>
                <span className="text-slate-500">Send text/media & get diagnosis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400">POST /api/v1/upload/</span>
                <span className="text-slate-500">Multipart image/audio/video</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400">POST /api/v1/bookings/</span>
                <span className="text-slate-500">Create appointment work order</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Interactive Simulation Controls
            </span>

            {/* Simulated Latency */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>Simulated Network Latency</span>
                <span className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-sm border border-cyan-800/60">
                  {config.simulatedLatencyMs} ms
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={config.simulatedLatencyMs}
                onChange={handleLatencyChange}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>100ms (Instant)</span>
                <span>650ms (Normal 4G/LTE)</span>
                <span>2500ms (Slow 3G)</span>
              </div>
            </div>

            {/* Error Injection Modes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Test UI Resilience with Simulated Error Injection:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleErrorModeChange('none')}
                  className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                    config.simulatedErrorMode === 'none'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>Healthy (200 OK)</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-500">Normal operations</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleErrorModeChange('network_timeout')}
                  className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                    config.simulatedErrorMode === 'network_timeout'
                      ? 'bg-red-500/10 border-red-500 text-red-300 font-semibold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>Network Timeout (408)</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-[10px] text-slate-500">Tests retry button</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleErrorModeChange('server_500')}
                  className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                    config.simulatedErrorMode === 'server_500'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-300 font-semibold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>Server Error (500)</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="text-[10px] text-slate-500">Internal failure state</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" /> Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Settings Applied
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg transition"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
