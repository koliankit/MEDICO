import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { generateLabReportPdf } from '../../components/pdf/ReportGenerator';
import { LabOrder } from '../../types';
import { TestTube, Download, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';

export const PatientLabsPage: React.FC = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.laboratory.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (orderId: string) => {
    try {
      const fullReport = await api.reports.getLabReport(orderId);
      generateLabReportPdf(fullReport);
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Diagnostic Medicine
        </span>
        <h1 className="text-2xl font-black text-hospital-navy mt-0.5">Laboratory Diagnostic Reports</h1>
        <p className="text-xs text-slate-500">
          Official pathology and biochemistry reports verified by City Hospital Pune diagnostic specialists.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading lab reports...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <TestTube className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No laboratory investigations ordered</p>
          <p className="text-xs text-slate-400 mt-1">
            Test results will appear here once ordered by your attending physician.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isVerified = order.status === 'VERIFIED';
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Clinical Indication:</strong> {order.clinicalIndication}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ordered by Dr. {order.doctor?.user?.firstName} {order.doctor?.user?.lastName} ({order.doctor?.department?.name}) • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {isVerified && (
                    <button
                      onClick={() => handleDownloadPdf(order.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
                    >
                      <Download className="w-4 h-4 text-hospital-teal" />
                      Download Official PDF Report
                    </button>
                  )}
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Test Parameter</th>
                        <th className="py-2.5 px-4">Observed Value</th>
                        <th className="py-2.5 px-4">Unit</th>
                        <th className="py-2.5 px-4">Reference Interval</th>
                        <th className="py-2.5 px-4">Status Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.results?.map((res) => {
                        const isAbnormal = res.flag === 'HIGH' || res.flag === 'LOW';
                        return (
                          <tr key={res.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-semibold text-slate-900">{res.testName}</td>
                            <td className={`py-3 px-4 font-extrabold ${isAbnormal ? 'text-red-600' : 'text-slate-900'}`}>
                              {res.value}
                            </td>
                            <td className="py-3 px-4 text-slate-500">{res.unit}</td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{res.referenceRange}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  res.flag === 'NORMAL'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {res.flag}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
