import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  DollarSign,
  Wrench,
  ShieldAlert,
  Calendar,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { DiagnosticReport, UrgencyLevel } from '../types/mechanic';

interface DiagnosticCardProps {
  diagnosis: DiagnosticReport;
  onBookMechanic: (diagnosis: DiagnosticReport) => void;
  isBooked?: boolean;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  diagnosis,
  onBookMechanic,
  isBooked = false,
}) => {
  const getUrgencyConfig = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'Critical':
        return {
          bgColor: 'bg-red-950/70 border-red-500/50 text-red-300',
          badgeColor: 'bg-red-500 text-white',
          glow: 'shadow-red-900/30',
          icon: AlertOctagon,
          title: 'CRITICAL URGENCY - IMMEDIATE ACTION REQUIRED',
        };
      case 'High':
        return {
          bgColor: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
          badgeColor: 'bg-orange-500 text-white',
          glow: 'shadow-orange-900/30',
          icon: AlertTriangle,
          title: 'HIGH URGENCY - SERVICE PROMPTLY',
        };
      case 'Medium':
        return {
          bgColor: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
          badgeColor: 'bg-amber-500 text-slate-950',
          glow: 'shadow-amber-900/30',
          icon: Clock,
          title: 'MODERATE URGENCY - SCHEDULE SERVICE',
        };
      case 'Low':
      default:
        return {
          bgColor: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
          badgeColor: 'bg-emerald-500 text-slate-950',
          glow: 'shadow-emerald-900/30',
          icon: CheckCircle2,
          title: 'LOW URGENCY - MONITOR & ROUTINE SERVICE',
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(diagnosis.urgency);
  const UrgencyIcon = urgencyConfig.icon;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`mt-4 rounded-2xl border bg-slate-900/95 border-slate-700 shadow-2xl overflow-hidden text-slate-100 ${urgencyConfig.glow}`}>
      {/* Top Urgency Header Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${urgencyConfig.bgColor}`}>
        <div className="flex items-center space-x-2">
          <UrgencyIcon className="w-5 h-5 shrink-0" />
          <span className="font-bold tracking-wider text-xs sm:text-sm uppercase">
            {urgencyConfig.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
            ID: {diagnosis.id}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Driving Safety Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            diagnosis.canDriveSafely
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/50 border-red-800/80 text-red-200'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {diagnosis.canDriveSafely ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-bold">
              {diagnosis.canDriveSafely
                ? 'Safe for Short / Local Commuting:'
                : 'DO NOT DRIVE THE VEHICLE:'}
            </span>{' '}
            <span className="text-slate-300">{diagnosis.drivingAdvice}</span>
          </div>
        </div>

        {/* Problem Summary & Most Likely Issue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" /> Problem Summary
            </span>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {diagnosis.problemSummary}
            </p>
          </div>

          <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-600/40 space-y-1.5">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> Most Likely Issue
            </span>
            <p className="text-sm font-bold text-amber-200 leading-relaxed">
              {diagnosis.mostLikelyIssue}
            </p>
          </div>
        </div>

        {/* Possible Causes Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Potential Root Causes ({diagnosis.possibleCauses.length})
            </h4>
            <span className="text-xs text-slate-500">Ranked by diagnostic probability</span>
          </div>

          <div className="space-y-2.5">
            {diagnosis.possibleCauses.map((cause, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    {cause.cause}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                        cause.probability === 'High'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : cause.probability === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cause.probability} Probability
                    </span>
                    <span className="font-mono text-xs text-slate-400 w-10 text-right">
                      {cause.percentage}%
                    </span>
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cause.percentage > 70
                        ? 'bg-red-500'
                        : cause.percentage > 40
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${cause.percentage}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 leading-normal mb-2">
                  {cause.description}
                </p>

                {cause.symptomsMatch && cause.symptomsMatch.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-500">Matching signs:</span>
                    {cause.symptomsMatch.map((sym, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        ✓ {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Repair & Estimated Cost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Wrench className="w-3.5 h-3.5" /> Recommended Repair / Service
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              {diagnosis.recommendedRepair}
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Estimated Cost Range
            </span>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                ${diagnosis.estimatedCost.min} - ${diagnosis.estimatedCost.max}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Parts: ~${diagnosis.estimatedCost.partsEstimate}</span>
                <span>Labor: ~${diagnosis.estimatedCost.laborEstimate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Inspection Disclaimer */}
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>{diagnosis.disclaimer}</p>
        </div>

        {/* Action Buttons: Book Mechanic */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onBookMechanic(diagnosis)}
            disabled={isBooked}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition transform active:scale-98 ${
              isBooked
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {isBooked ? 'Appointment Confirmed (View Work Order)' : 'Book Certified Mechanic Now'}
            {!isBooked && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
            title="Print or export diagnostic summary"
          >
            <Printer className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>
    </div>
  );
};
