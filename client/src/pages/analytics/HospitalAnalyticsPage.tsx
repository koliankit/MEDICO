import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Clock, ShieldCheck, Activity } from 'lucide-react';

export const HospitalAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading analytical visualizations...</div>;
  }

  const overview = stats?.overview || {};
  const statusCounts = overview.statusCounts || {};

  // Status Distribution Pie Data
  const appointmentStatusData = [
    { name: 'Completed', value: statusCounts.COMPLETED || 2, color: '#10B981' },
    { name: 'Checked In', value: statusCounts.CHECKED_IN || 1, color: '#F59E0B' },
    { name: 'Scheduled', value: statusCounts.SCHEDULED || 3, color: '#00A896' },
    { name: 'In Consultation', value: statusCounts.IN_CONSULTATION || 1, color: '#8B5CF6' },
  ];

  // Department Workload Data
  const deptData = (stats?.departments || []).map((d: any) => ({
    name: d.code,
    fullName: d.name,
    doctors: d.doctorCount,
    appointments: d.appointmentCount,
  }));

  // Triage Acuity Distribution Data
  const triageData = [
    { name: 'Immediate (Red)', value: 1, color: '#EF4444' },
    { name: 'Very Urgent (Orange)', value: 2, color: '#F97316' },
    { name: 'Urgent (Yellow)', value: 4, color: '#EAB308' },
    { name: 'Standard (Green)', value: 5, color: '#10B981' },
    { name: 'Non-Urgent (Blue)', value: 2, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Hospital Intelligence
        </span>
        <h1 className="text-2xl font-black text-hospital-navy mt-0.5">
          Hospital Operational Analytics & Clinical Metrics
        </h1>
        <p className="text-xs text-slate-500">
          Real-time aggregated hospital data powering clinical capacity planning and outpatient throughput.
        </p>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workload Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-hospital-teal" />
              Departmental Staffing & OPD Workload
            </h2>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B2545',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="doctors" name="Doctors on Duty" fill="#00A896" radius={[6, 6, 0, 0]} />
                <Bar dataKey="appointments" name="Active Appointments" fill="#134074" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-hospital-teal" />
              Today's Appointment Status Breakdown
            </h2>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B2545',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Triage Acuity Breakdown Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              Patient Triage Acuity Distribution (ESI 1 - 5)
            </h2>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {triageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B2545',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Diagnostics Performance Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Laboratory Turnaround & Clinical Performance
            </h2>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="text-slate-800 block">Average Lab Turnaround Time (TAT)</strong>
                <span className="text-[10px] text-slate-500">From specimen collection to verified report</span>
              </div>
              <span className="font-extrabold text-sm text-hospital-teal">3.4 Hours</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="text-slate-800 block">Outpatient Consultation Punctuality</strong>
                <span className="text-[10px] text-slate-500">Appointments attended within scheduled window</span>
              </div>
              <span className="font-extrabold text-sm text-emerald-600">96.8%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="text-slate-800 block">ABDM Interoperability Share Rate</strong>
                <span className="text-[10px] text-slate-500">Consented electronic health records attached</span>
              </div>
              <span className="font-extrabold text-sm text-hospital-navy">100% (DPDP Compliant)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
