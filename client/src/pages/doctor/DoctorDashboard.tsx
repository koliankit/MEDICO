import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Activity,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await api.doctors.getQueueToday();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkedInCount = queue.filter((a) => a.status === 'CHECKED_IN').length;
  const inConsultCount = queue.filter((a) => a.status === 'IN_CONSULTATION').length;
  const completedCount = queue.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-hospital-navy to-hospital-blue rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Doctor Command Center
            </span>
            <span className="text-[10px] text-slate-300">
              Today: {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Today's Outpatient Consultation Roster
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Review triaged patients, assess AI symptom summaries with clinician sign-off, author SOAP notes, and issue verified electronic prescriptions.
          </p>
        </div>

        <Link
          to="/doctor/queue"
          className="px-5 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <Clock className="w-4 h-4" />
          View Live Patient Queue
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Today
          </span>
          <span className="text-2xl font-black text-slate-900">{queue.length}</span>
          <p className="text-[11px] text-slate-500">Scheduled OPD appointments</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Waiting in OPD
          </span>
          <span className="text-2xl font-black text-amber-600">{checkedInCount}</span>
          <p className="text-[11px] text-slate-500">Checked-in & triaged by nurse</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
            In Consultation
          </span>
          <span className="text-2xl font-black text-purple-600">{inConsultCount}</span>
          <p className="text-[11px] text-slate-500">Active clinical encounter</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Completed & Signed
          </span>
          <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
          <p className="text-[11px] text-slate-500">Encounter notes finalized</p>
        </div>
      </div>

      {/* Patient Queue List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
            <Clock className="w-4 h-4 text-hospital-teal" />
            Today's Patient Queue
          </h2>
          <span className="text-xs text-slate-400 font-medium">Sorted by Time Slot</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading queue...</div>
        ) : queue.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No patients scheduled for today.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((appt) => {
              const triage = appt.triageRecord;
              const hasAiAssessment = appt.patient?.assessments && appt.patient.assessments.length > 0;
              const isCheckedIn = appt.status === 'CHECKED_IN';
              const isCompleted = appt.status === 'COMPLETED';

              return (
                <div
                  key={appt.id}
                  className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      {appt.timeSlot.split(' ')[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">
                          {appt.patient?.user?.firstName} {appt.patient?.user?.lastName}
                        </strong>
                        <span className="text-xs font-mono text-slate-400">({appt.patient?.patientId})</span>
                        {triage && (
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              triage.triageCategory === 'RED'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : triage.triageCategory === 'YELLOW'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            Triage: {triage.triageCategory}
                          </span>
                        )}
                        {hasAiAssessment && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-hospital-teal" /> AI Summary Available
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Chief Complaint:</strong> {appt.reason}
                      </p>
                      {triage?.nurseNotes && (
                        <p className="text-[11px] text-slate-500 italic">Nurse Notes: {triage.nurseNotes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCheckedIn
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {appt.status}
                    </span>

                    <Link
                      to={`/doctor/consultation/${appt.id}`}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          : 'bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      {isCompleted ? 'View Consultation' : 'Open Consultation'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
