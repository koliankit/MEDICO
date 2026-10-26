import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { generateLabReportPdf } from '../../components/pdf/ReportGenerator';
import { LabOrder, LabCatalogItem } from '../../types';
import {
  TestTube,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LaboratoryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [catalog, setCatalog] = useState<LabCatalogItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Active Order for Result Entry / Verification Modal
  const [activeOrder, setActiveOrder] = useState<LabOrder | null>(null);
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [techNotes, setTechNotes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      const [orderList, catList] = await Promise.all([
        api.laboratory.getOrders(),
        api.laboratory.getCatalog(),
      ]);
      setOrders(orderList);
      setCatalog(catList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEntry = (order: LabOrder) => {
    setActiveOrder(order);
    const initialVals: Record<string, string> = {};
    const initialNotes: Record<string, string> = {};
    order.results?.forEach((r) => {
      initialVals[r.id] = r.value !== 'Specimen Pending' && r.value !== 'Pending Specimen Collection' ? r.value : '';
      initialNotes[r.id] = r.technicianNotes || '';
    });
    setResultValues(initialVals);
    setTechNotes(initialNotes);
  };

  const handleStatusTransition = async (orderId: string, status: any) => {
    try {
      await api.laboratory.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status as LabOrder['status'] } : o)));
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setIsSaving(true);
    try {
      const resultsPayload = activeOrder.results.map((r) => ({
        resultId: r.id,
        value: resultValues[r.id] || 'Not tested',
        technicianNotes: techNotes[r.id] || '',
      }));

      await api.laboratory.enterResults(activeOrder.id, resultsPayload);
      alert('Results recorded and evaluated against reference intervals.');
      setActiveOrder(null);
      loadLabData();
    } catch (err: any) {
      alert(err.message || 'Failed to save results');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyReport = async (orderId: string) => {
    if (!confirm('Digitally sign and verify this laboratory report for official clinical distribution?')) return;
    try {
      await api.laboratory.verify(orderId);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      alert('Diagnostic report verified and released to patient EHR!');
      setActiveOrder(null);
      loadLabData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify lab report');
    }
  };

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === selectedStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-hospital-navy via-hospital-blue to-hospital-navy rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Department of Clinical Pathology
            </span>
            <span className="text-[10px] text-slate-300">
              NABL Quality Assured Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Diagnostic Laboratory Management Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Track incoming specimen orders, perform automated biological reference range checks, enter technician notes, and sign verified diagnostic reports.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/20 text-xs text-teal-300 font-semibold shrink-0">
          <TestTube className="w-5 h-5 text-hospital-teal" />
          <span>{orders.length} Active Orders in Pipeline</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'ORDERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'VERIFIED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === st
                ? 'bg-hospital-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-hospital-navy flex items-center gap-2">
          <Clock className="w-4 h-4 text-hospital-teal" />
          Diagnostic Worklist
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading lab orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No laboratory orders in this status category.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const isVerified = order.status === 'VERIFIED';
              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-sm font-mono">
                        {order.orderNumber}
                      </strong>
                      <span className="text-xs font-bold text-slate-700">
                        • Patient: {order.patient?.user?.firstName} {order.patient?.user?.lastName} ({order.patient?.patientId})
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Tests:</strong> {order.results?.map((r) => r.testName).join(', ')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Doctor: Dr. {order.doctor?.user?.firstName} {order.doctor?.user?.lastName} ({order.doctor?.department?.name}) • Indication: {order.clinicalIndication}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {order.status === 'ORDERED' && (
                      <button
                        onClick={() => handleStatusTransition(order.id, 'SAMPLE_COLLECTED')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                      >
                        Collect Specimen
                      </button>
                    )}

                    {order.status === 'SAMPLE_COLLECTED' && (
                      <button
                        onClick={() => handleStatusTransition(order.id, 'PROCESSING')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors"
                      >
                        Start Processing
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEntry(order)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <TestTube className="w-3.5 h-3.5" />
                      {isVerified ? 'View Results' : 'Enter / Edit Results'}
                    </button>

                    {isVerified && (
                      <button
                        onClick={async () => {
                          const fullReport = await api.reports.getLabReport(order.id);
                          generateLabReportPdf(fullReport);
                        }}
                        className="p-1.5 rounded-xl text-hospital-navy bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Entry & Verification Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-teal">
                  Pathology Diagnostic Entry
                </span>
                <h3 className="font-extrabold text-base text-hospital-navy font-mono">
                  Order {activeOrder.orderNumber} • {activeOrder.patient?.user?.firstName} {activeOrder.patient?.user?.lastName}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResults} className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Test Name</th>
                      <th className="py-2.5 px-3">Result Value</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3">Technician Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrder.results?.map((res) => (
                      <tr key={res.id}>
                        <td className="py-3 px-3 font-semibold text-slate-900">{res.testName}</td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            required
                            disabled={activeOrder.status === 'VERIFIED'}
                            value={resultValues[res.id] || ''}
                            onChange={(e) =>
                              setResultValues({ ...resultValues, [res.id]: e.target.value })
                            }
                            placeholder="e.g. 142.5"
                            className="w-28 p-1.5 rounded-lg border border-slate-200 font-bold text-xs"
                          />
                        </td>
                        <td className="py-3 px-3 text-slate-500">{res.unit}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{res.referenceRange}</td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            disabled={activeOrder.status === 'VERIFIED'}
                            value={techNotes[res.id] || ''}
                            onChange={(e) =>
                              setTechNotes({ ...techNotes, [res.id]: e.target.value })
                            }
                            placeholder="Optional notes"
                            className="w-36 p-1.5 rounded-lg border border-slate-200 text-[11px]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {activeOrder.status !== 'VERIFIED' && (
                    <>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-sm transition-colors"
                      >
                        {isSaving ? 'Saving Results...' : 'Save Results'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVerifyReport(activeOrder.id)}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-colors"
                      >
                        <FileCheck className="w-4 h-4" />
                        Verify & Sign Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
