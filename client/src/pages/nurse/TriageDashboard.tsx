import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import {
  Activity,
  HeartPulse,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TriageDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Triage Modal state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [triageCategory, setTriageCategory] = useState<'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE'>('YELLOW');
  const [painScale, setPainScale] = useState<number>(2);
  const [mobilityStatus, setMobilityStatus] = useState<string>('Ambulatory');
  const [systolicBp, setSystolicBp] = useState<string>('126');
  const [diastolicBp, setDiastolicBp] = useState<string>('82');
  const [heartRate, setHeartRate] = useState<string>('74');
  const [respiratoryRate, setRespiratoryRate] = useState<string>('16');
  const [oxygenSaturation, setOxygenSaturation] = useState<string>('98.8');
  const [temperatureF, setTemperatureF] = useState<string>('98.5');
  const [nurseNotes, setNurseNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTriageQueue();
  }, []);

  const loadTriageQueue = async () => {
    try {
      const data = await api.triage.getQueue();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTriage = (appt: Appointment) => {
    setSelectedAppt(appt);
    setNurseNotes(`Patient checked in for ${appt.reason}. Alert and oriented.`);
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setIsSubmitting(true);
    try {
      await api.triage.record({
        patientId: selectedAppt.patientId,
        appointmentId: selectedAppt.id,
        triageCategory,
        painScale,
        mobilityStatus,
        systolicBp,
        diastolicBp,
        heartRate,
        respiratoryRate,
        oxygenSaturation,
        temperatureF,
        nurseNotes,
        escalatedToDoctorId: selectedAppt.doctorId,
      });

      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      alert(`Triage recorded: Category ${triageCategory}. Patient checked in.`);
      setSelectedAppt(null);
      loadTriageQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to save triage assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-hospital-navy via-hospital-blue to-hospital-navy rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Emergency & Outpatient Nursing Triage
            </span>
            <span className="text-[10px] text-slate-300">
              Manchester / ESI Triage Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Patient Intake & Triage Station
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Evaluate presenting patients, measure baseline physiological parameters, assign clinical acuity levels, and escalate to attending physicians.
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-[10px] text-teal-300 font-bold uppercase block">Waiting Intake</span>
          <span className="text-2xl font-black text-white">{queue.length}</span>
          <span className="text-[10px] text-slate-300 block">Today's Queue</span>
        </div>
      </div>

      {/* Triage Queue Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
          <Clock className="w-4 h-4 text-hospital-teal" />
          Pending Patient Triage Queue
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading triage queue...</div>
        ) : queue.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            All outpatient arrivals triaged. No patients currently waiting intake.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((appt) => {
              const triage = appt.triageRecord;
              return (
                <div
                  key={appt.id}
                  className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-sm">
                        {appt.patient?.user?.firstName} {appt.patient?.user?.lastName}
                      </strong>
                      <span className="text-xs font-mono text-slate-400">({appt.patient?.patientId})</span>
                      <span className="text-xs text-slate-500 font-medium">
                        • Slot: {appt.timeSlot}
                      </span>
                      {triage && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Triaged: {triage.triageCategory}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Consulting:</strong> Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName} ({appt.doctor?.department?.name})
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Complaint:</strong> {appt.reason}
                    </p>
                    {appt.patient?.allergies && appt.patient.allergies.length > 0 && (
                      <p className="text-[11px] text-red-600 font-semibold">
                        Allergies: {appt.patient.allergies.map((a: any) => a.allergen).join(', ')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenTriage(appt)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {triage ? 'Re-Triage / Update' : 'Start Triage Intake'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Triage Assessment Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-teal">
                  Clinical Intake
                </span>
                <h3 className="font-extrabold text-base text-hospital-navy">
                  Triage Intake: {selectedAppt.patient?.user?.firstName} {selectedAppt.patient?.user?.lastName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTriage} className="space-y-6">
              {/* Acuity Level Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. Clinical Triage Urgency Category (ESI Level)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTriageCategory('RED')}
                    className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                      triageCategory === 'RED'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-400'
                        : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    RED
                    <span className="text-[9px] block font-normal">Immediate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriageCategory('ORANGE')}
                    className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                      triageCategory === 'ORANGE'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-400'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    ORANGE
                    <span className="text-[9px] block font-normal">Very Urgent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriageCategory('YELLOW')}
                    className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                      triageCategory === 'YELLOW'
                        ? 'bg-yellow-500 text-slate-900 border-yellow-600 shadow-sm ring-2 ring-yellow-400'
                        : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    YELLOW
                    <span className="text-[9px] block font-normal">Urgent (1 hr)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriageCategory('GREEN')}
                    className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                      triageCategory === 'GREEN'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    GREEN
                    <span className="text-[9px] block font-normal">Standard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriageCategory('BLUE')}
                    className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                      triageCategory === 'BLUE'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-400'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    BLUE
                    <span className="text-[9px] block font-normal">Non-Urgent</span>
                  </button>
                </div>
              </div>

              {/* Vitals Input Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  2. Baseline Physiological Parameters (Vitals)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      required
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Oxygen Saturation (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Body Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={temperatureF}
                      onChange={(e) => setTemperatureF(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Respiratory Rate (/min)</label>
                    <input
                      type="number"
                      required
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Pain Scale & Mobility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Pain Scale (0 - 10)</label>
                    <span className="text-xs font-extrabold text-hospital-teal">{painScale} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painScale}
                    onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
                    className="w-full accent-hospital-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Mobility Status</label>
                  <select
                    value={mobilityStatus}
                    onChange={(e) => setMobilityStatus(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    <option value="Ambulatory">Ambulatory (Walking unassisted)</option>
                    <option value="Wheelchair">Wheelchair Assisted</option>
                    <option value="Stretcher">Stretcher / Gurney</option>
                  </select>
                </div>
              </div>

              {/* Nurse Observations */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nurse Handover Notes & Clinical Observations
                </label>
                <textarea
                  rows={2}
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  placeholder="Record patient state, mobility, acute findings, or doctor escalation notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Confirm & Check In Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
