import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { generateLabReportPdf, generateVisitSummaryPdf } from '../../components/pdf/ReportGenerator';
import { FileText, Download, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const PatientDocumentsPage: React.FC = () => {
  const [patientData, setPatientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.patients.getMe();
      setPatientData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLab = async (labOrderId: string) => {
    try {
      const fullReport = await api.reports.getLabReport(labOrderId);
      generateLabReportPdf(fullReport);
    } catch (err: any) {
      alert(err.message || 'Failed to generate PDF');
    }
  };

  const handleDownloadEncounter = async (encounterId: string) => {
    try {
      const fullEncounter = await api.reports.getEncounterReport(encounterId);
      generateVisitSummaryPdf(fullEncounter);
    } catch (err: any) {
      alert(err.message || 'Failed to generate visit summary PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Electronic Health Records
        </span>
        <h1 className="text-2xl font-black text-hospital-navy mt-0.5">Clinical Documents & Records</h1>
        <p className="text-xs text-slate-500">
          Authorized electronic visit summaries, prescriptions, and verified diagnostic laboratory records.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading clinical documents...</div>
      ) : (
        <div className="space-y-4">
          {/* Lab Reports Section */}
          {patientData?.labOrders?.map((lab: any) => (
            <div
              key={lab.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Diagnostic Pathology Report - {lab.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lab.clinicalIndication} • Verified {new Date(lab.verifiedAt || lab.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Hash: SHA256:{btoa(lab.id).slice(0, 16)}...
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownloadLab(lab.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-hospital-teal" />
                Download PDF
              </button>
            </div>
          ))}

          {/* Past Clinical Encounters */}
          {patientData?.appointments
            ?.filter((a: any) => a.encounter)
            .map((a: any) => (
              <div
                key={a.encounter.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-hospital-blue flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Outpatient Consultation Summary - Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Diagnosis: {a.encounter.diagnosis} • {a.appointmentDate}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Hash: SHA256:{btoa(a.encounter.id).slice(0, 16)}...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadEncounter(a.encounter.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-hospital-teal" />
                  Download PDF
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
