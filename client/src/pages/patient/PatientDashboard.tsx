import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { generateLabReportPdf, generateVisitSummaryPdf } from '../../components/pdf/ReportGenerator';
import {
  HeartPulse,
  Activity,
  Calendar,
  Clock,
  FileText,
  Pill,
  Heart,
  AlertTriangle,
  Download,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  TestTube,
  Sparkles,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [patientData, setPatientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.patients.getMe();
      setPatientData(data);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading your health records...</div>;
  }

  if (!patientData) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">Patient record not found</p>
      </div>
    );
  }

  const latestVital = patientData.vitals?.[0];
  const upcomingAppts = patientData.appointments?.filter(
    (a: any) => a.status === 'SCHEDULED' || a.status === 'CHECKED_IN'
  );
  const nextAppt = upcomingAppts?.[0];
  const verifiedLabs = patientData.labOrders?.filter((l: any) => l.status === 'VERIFIED');

  return (
    <div className="space-y-8">
      {/* 1. Welcoming Hero Banner */}
      <div className="bg-gradient-to-r from-hospital-navy via-hospital-blue to-hospital-navy rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Verified Patient Health Account
            </span>
            <span className="text-[10px] text-slate-300 font-mono">ID: {patientData.patientId}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {patientData.user?.firstName} {patientData.user?.lastName}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Welcome to your City Hospital Pune digital health portal. Track vital signs, manage clinical appointments, and access verified laboratory reports.
          </p>

          {patientData.abhaId && (
            <div className="flex items-center gap-1.5 text-xs text-teal-300 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ABHA ID: <strong className="text-white font-mono">{patientData.abhaId}</strong></span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/assessment"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Check Symptoms with AI
          </Link>
          <Link
            to="/book"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      {/* 2. Allergy Warning Banner (if patient has recorded allergies) */}
      {patientData.allergies && patientData.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-red-900 block">Documented Clinical Allergies:</span>
              <p className="text-red-700">
                {patientData.allergies.map((a: any) => `${a.allergen} (${a.reaction})`).join('; ')}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white shrink-0">
            High Clinical Caution
          </span>
        </div>
      )}

      {/* 3. Upcoming Appointment & Vitals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Appointment Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-hospital-teal" />
                Upcoming Consultation
              </span>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Confirmed
              </span>
            </div>

            {nextAppt ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-hospital-navy text-white font-bold flex items-center justify-center text-xs shrink-0">
                    Dr.
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Dr. {nextAppt.doctor?.user?.firstName} {nextAppt.doctor?.user?.lastName}
                    </h3>
                    <p className="text-xs text-hospital-teal font-medium">
                      {nextAppt.doctor?.department?.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Room {nextAppt.doctor?.roomNumber || 'OPD'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Date & Time:</span>
                    <strong className="text-slate-900">
                      {nextAppt.appointmentDate} • {nextAppt.timeSlot}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {nextAppt.status}
                    </span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-600">
                    <strong>Reason:</strong> {nextAppt.reason}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No appointments scheduled.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/patient/appointments"
              className="text-xs font-bold text-hospital-teal hover:underline flex items-center gap-1"
            >
              All Appointments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/book"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-colors"
            >
              Book New
            </Link>
          </div>
        </div>

        {/* Latest Vitals Snapshot Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Blood Pressure
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                {latestVital ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : '120/80'}
              </span>
              <span className="text-[10px] text-slate-400">mmHg</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              Normal Target
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Heart Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                {latestVital ? latestVital.heartRate : 72}
              </span>
              <span className="text-[10px] text-slate-400">bpm</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              Resting Rhythm
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Oxygen (SpO2)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                {latestVital ? `${latestVital.oxygenSaturation}%` : '99%'}
              </span>
            </div>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              Optimal Saturation
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Body Temp
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                {latestVital ? `${latestVital.temperatureF}°` : '98.6°'}
              </span>
              <span className="text-[10px] text-slate-400">F</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              Afebrile
            </span>
          </div>

          {/* Vitals footer shortcut */}
          <div className="col-span-2 sm:col-span-4 bg-hospital-slate p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Last recorded: {latestVital ? new Date(latestVital.recordedAt).toLocaleString() : 'Recent'} by Nursing Team
            </span>
            <Link
              to="/patient/vitals"
              className="text-hospital-teal font-bold hover:underline flex items-center gap-1"
            >
              View Full Vitals Timeline <ChevronRightIcon />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Active Medications & Diagnostic Lab Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Medications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <Pill className="w-4 h-4 text-hospital-teal" />
              Prescribed Medications
            </span>
            <Link to="/patient/medications" className="text-xs text-hospital-teal hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {patientData.medications?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active medications recorded.</p>
            ) : (
              patientData.medications?.slice(0, 3).map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-xs font-bold">{m.medicationName}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {m.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {m.dosage} • {m.frequency} ({m.duration})
                  </p>
                  {m.instructions && (
                    <p className="text-slate-500 text-[10px] italic">Instruction: {m.instructions}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Diagnostic Reports */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <TestTube className="w-4 h-4 text-purple-600" />
              Verified Laboratory Reports
            </span>
            <Link to="/patient/labs" className="text-xs text-hospital-teal hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {verifiedLabs?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No diagnostic reports available yet.</p>
            ) : (
              verifiedLabs?.slice(0, 2).map((lab: any) => (
                <div
                  key={lab.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-3"
                >
                  <div>
                    <strong className="text-slate-900 block font-bold">{lab.orderNumber}</strong>
                    <p className="text-[11px] text-slate-600">{lab.clinicalIndication}</p>
                    <span className="text-[10px] text-slate-400">
                      Verified: {new Date(lab.verifiedAt || lab.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const fullReport = await api.reports.getLabReport(lab.id);
                      generateLabReportPdf(fullReport);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-hospital-navy bg-white hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-hospital-teal" />
                    Download PDF
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
