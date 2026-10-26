import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  Activity,
  Calendar,
  Building2,
  TestTube,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getSystemHealth(),
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading operations center...</div>;
  }

  const overview = stats?.overview || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-hospital-navy via-hospital-blue to-hospital-navy rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Hospital Operations Command Center
            </span>
            <span className="text-[10px] text-slate-300">
              City Hospital Pune • ISO / NABH Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrative & Clinical Oversight
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Monitor real-time patient admissions, clinical queue loads, diagnostic lab turnaround, staff rosters, and statutory DPDP compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-all"
          >
            Manage Staff
          </Link>
          <Link
            to="/admin/audit"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Registered Patients
          </span>
          <span className="text-2xl font-black text-slate-900">{overview.totalPatients || 0}</span>
          <p className="text-[11px] text-slate-500">Unique ABHA health profiles</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">
            Doctors on Duty
          </span>
          <span className="text-2xl font-black text-hospital-teal">{overview.totalDoctors || 0}</span>
          <p className="text-[11px] text-slate-500">Across 6 departments</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Pending Lab Orders
          </span>
          <span className="text-2xl font-black text-amber-600">{overview.pendingLabs || 0}</span>
          <p className="text-[11px] text-slate-500">Specimens in processing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Verified Lab Reports
          </span>
          <span className="text-2xl font-black text-emerald-600">{overview.verifiedLabs || 0}</span>
          <p className="text-[11px] text-slate-500">Signed diagnostic documents</p>
        </div>
      </div>

      {/* System Health & DPDP Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              DPDP Act 2023 & ABDM India Compliance
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ACTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Statutory Framework:</span>
              <strong className="text-slate-900">{health?.dataProtection?.framework}</strong>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Recorded Patient Consents:</span>
              <strong className="text-emerald-700 font-bold">
                {health?.dataProtection?.totalConsentsRecorded} Verified Consents
              </strong>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Audit Trail Events Logged:</span>
              <strong className="text-hospital-navy font-mono">
                {overview.recentAuditCount || 0} Events
              </strong>
            </div>
          </div>
        </div>

        {/* AI Decision Support Engine Status */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-hospital-teal" />
              AI Decision Support Engine Health
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Safety Screening Rules:</span>
              <strong className="text-slate-900">{health?.aiEngine?.safetyProtocols}</strong>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Adapter Mode:</span>
              <span className="text-slate-700 font-medium">{health?.aiEngine?.adapterMode}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Clinical Governance:</span>
              <strong className="text-hospital-navy font-semibold">Clinician Sign-off Enforced</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Departmental Workload Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
            <Building2 className="w-4 h-4 text-hospital-teal" />
            Clinical Department Roster & Distribution
          </h2>
          <Link to="/analytics" className="text-xs font-bold text-hospital-teal hover:underline flex items-center gap-1">
            View Analytics Charts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats?.departments?.map((dept: any) => (
            <div key={dept.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900 font-bold">{dept.name}</strong>
                <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {dept.code}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{dept.floor}</p>
              <div className="flex justify-between pt-2 border-t border-slate-200/60 text-slate-700">
                <span>Clinicians: <strong>{dept.doctorCount}</strong></span>
                <span>Appointments: <strong>{dept.appointmentCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
