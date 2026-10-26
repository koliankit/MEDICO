import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { VitalSign } from '../../types';
import {
  Heart,
  Activity,
  HeartPulse,
  Clock,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const PatientVitalsPage: React.FC = () => {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVitals();
  }, []);

  const loadVitals = async () => {
    try {
      const data = await api.patients.getMe();
      setVitals(data.vitals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data chronologically (oldest to newest)
  const chartData = [...vitals]
    .reverse()
    .map((v) => ({
      date: new Date(v.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      systolic: v.systolicBp,
      diastolic: v.diastolicBp,
      heartRate: v.heartRate,
      spo2: v.oxygenSaturation,
    }));

  return (
    <div className="space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Physiological Monitoring
        </span>
        <h1 className="text-2xl font-black text-hospital-navy mt-0.5">Vitals Timeline & Trends</h1>
        <p className="text-xs text-slate-500">
          Chronological physiological tracking recorded during outpatient check-ins and clinical consultations.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading vitals history...</div>
      ) : vitals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No recorded vital signs yet</p>
          <p className="text-xs text-slate-400 mt-1">Your vitals will appear here after your first nursing intake</p>
        </div>
      ) : (
        <>
          {/* Recharts Graphical Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Pressure Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
                  <Activity className="w-4 h-4 text-hospital-teal" />
                  Blood Pressure Trend (mmHg)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Target: &lt; 130/80</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[60, 160]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B2545',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic (mmHg)"
                      stroke="#00A896"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic (mmHg)"
                      stroke="#134074"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heart Rate & SpO2 Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-hospital-navy flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-red-500" />
                  Heart Rate (bpm) & SpO2 (%)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Resting Norms</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[50, 110]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B2545',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      name="Heart Rate (bpm)"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="spo2"
                      name="Oxygen SpO2 (%)"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vitals History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-hospital-navy">Clinical Observation History</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Blood Pressure</th>
                    <th className="py-3 px-4">Heart Rate</th>
                    <th className="py-3 px-4">SpO2</th>
                    <th className="py-3 px-4">Temp (°F)</th>
                    <th className="py-3 px-4">Pain Score</th>
                    <th className="py-3 px-4">Observations / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitals.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {new Date(v.recordedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {v.systolicBp}/{v.diastolicBp} mmHg
                      </td>
                      <td className="py-3 px-4">{v.heartRate} bpm</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">{v.oxygenSaturation}%</td>
                      <td className="py-3 px-4">{v.temperatureF} °F</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.painScore > 4 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {v.painScore} / 10
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {v.notes || 'Routine check'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
