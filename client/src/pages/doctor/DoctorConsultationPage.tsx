import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  Pill,
  TestTube,
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RxItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const DoctorConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [labCatalog, setLabCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Assessment Review State
  const [aiReviewStatus, setAiReviewStatus] = useState<'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED'>('PENDING');
  const [clinicianAiNotes, setClinicianAiNotes] = useState<string>('');
  const [aiReviewedSaved, setAiReviewedSaved] = useState<boolean>(false);

  // Clinical SOAP Notes
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [hpi, setHpi] = useState<string>('');
  const [examinationNotes, setExaminationNotes] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [icdCode, setIcdCode] = useState<string>('I10');
  const [treatmentPlan, setTreatmentPlan] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<RxItem[]>([
    { medicationName: 'Telmisartan Tablets IP', dosage: '40 mg', frequency: 'Once daily morning after food', duration: '30 days', instructions: 'Monitor BP weekly' },
  ]);

  // Lab Orders
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadConsultationData();
  }, [appointmentId]);

  const loadConsultationData = async () => {
    try {
      const [appts, catalog] = await Promise.all([
        api.appointments.getAll(),
        api.laboratory.getCatalog(),
      ]);

      const targetAppt = appts.find((a: any) => a.id === appointmentId);
      if (targetAppt) {
        setAppointment(targetAppt);
        setChiefComplaint(targetAppt.reason || '');

        // Fetch detailed patient clinical records
        const pData = await api.patients.getById(targetAppt.patientId);
        setPatient(pData);

        // Pre-fill existing encounter if already signed
        if (targetAppt.encounter) {
          setChiefComplaint(targetAppt.encounter.chiefComplaint || targetAppt.reason);
          setHpi(targetAppt.encounter.historyOfPresentIllness || '');
          setExaminationNotes(targetAppt.encounter.examinationNotes || '');
          setDiagnosis(targetAppt.encounter.diagnosis || '');
          setIcdCode(targetAppt.encounter.icdCode || '');
          setTreatmentPlan(targetAppt.encounter.treatmentPlan || '');
          setFollowUpDate(targetAppt.encounter.followUpDate || '');
        }

        // Check if patient has AI assessment
        const assessment = pData.assessments?.[0];
        if (assessment) {
          setAiReviewStatus(assessment.clinicianReviewStatus || 'PENDING');
          setClinicianAiNotes(assessment.clinicianNotes || '');
        }
      }
      setLabCatalog(catalog);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRx = () => {
    setPrescriptions([
      ...prescriptions,
      { medicationName: '', dosage: '500 mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' },
    ]);
  };

  const removeRx = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updateRx = (index: number, field: keyof RxItem, val: string) => {
    const updated = [...prescriptions];
    updated[index][field] = val;
    setPrescriptions(updated);
  };

  const handleReviewAiAssessment = async (status: 'ACCEPTED' | 'MODIFIED' | 'REJECTED') => {
    const assessment = patient?.assessments?.[0];
    if (!assessment) return;

    try {
      await api.doctors.reviewAssessment(assessment.id, {
        status,
        clinicianNotes: clinicianAiNotes,
      });
      setAiReviewStatus(status);
      setAiReviewedSaved(true);
      alert(`AI decision support status updated to: ${status}. Clinician action logged.`);
    } catch (err: any) {
      alert(err.message || 'Failed to review AI assessment');
    }
  };

  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis || !treatmentPlan) {
      alert('Please enter a clinical diagnosis and treatment plan before signing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.doctors.createEncounter({
        appointmentId,
        patientId: patient.id,
        chiefComplaint,
        historyOfPresentIllness: hpi,
        examinationNotes,
        diagnosis,
        icdCode,
        treatmentPlan,
        followUpDate,
        prescriptions: prescriptions.filter((r) => r.medicationName.trim().length > 0),
        labOrderTests: selectedLabTestIds,
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      alert('Clinical encounter finalized, signed, and encrypted into patient health record.');
      navigate('/doctor');
    } catch (err: any) {
      alert(err.message || 'Failed to finalize encounter');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading clinical consultation suite...</div>;
  }

  if (!appointment || !patient) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">Appointment or Patient record not found</p>
        <Link to="/doctor" className="mt-3 inline-block text-xs font-bold text-hospital-teal">
          Return to Queue
        </Link>
      </div>
    );
  }

  const latestVital = patient.vitals?.[0];
  const assessment = patient.assessments?.[0];
  const isEncounterSigned = appointment.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/doctor"
          className="text-xs font-semibold text-slate-500 hover:text-hospital-navy flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to OPD Queue
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold">
            Slot: {appointment.timeSlot} • Room: {appointment.doctor?.roomNumber}
          </span>
          {isEncounterSigned && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ENCOUNTER SIGNED
            </span>
          )}
        </div>
      </div>

      {/* 1. Patient Clinical Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-hospital-navy text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              {patient.user?.firstName?.[0]}
              {patient.user?.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">
                  {patient.user?.firstName} {patient.user?.lastName}
                </h1>
                <span className="text-xs font-mono font-semibold text-hospital-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {patient.patientId}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {patient.gender} • {patient.dateOfBirth} • Blood Group:{' '}
                  <strong className="text-red-600">{patient.bloodGroup}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ABHA ID: <strong className="font-mono text-slate-700">{patient.abhaId || 'Not linked'}</strong> • Phone: {patient.user?.phone}
              </p>
            </div>
          </div>

          {/* Vitals Quick Pill */}
          {latestVital && (
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Vitals (Triage)</span>
                <strong className="text-slate-900">
                  BP {latestVital.systolicBp}/{latestVital.diastolicBp} mmHg
                </strong>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-400 block font-medium">Pulse & SpO2</span>
                <strong className="text-slate-900">
                  {latestVital.heartRate} bpm • {latestVital.oxygenSaturation}%
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Prominent Allergy Banner */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Documented Patient Allergies:</strong>{' '}
                {patient.allergies.map((a: any) => `${a.allergen} (${a.reaction})`).join('; ')}
              </span>
            </div>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-red-600 text-white shrink-0">
              PRESCRIBING CAUTION
            </span>
          </div>
        )}
      </div>

      {/* 2. AI-Assisted Symptom Assessment Review (Clinician Governance) */}
      {assessment && (
        <div className="bg-gradient-to-r from-teal-50/70 via-hospital-slate to-white rounded-3xl p-6 sm:p-7 border border-hospital-teal/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-hospital-teal" />
              <h2 className="font-extrabold text-sm text-hospital-navy">
                Patient AI-Assisted Preliminary Symptom Summary ({assessment.sessionNumber})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Clinician Decision:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  aiReviewStatus === 'ACCEPTED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : aiReviewStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : aiReviewStatus === 'MODIFIED'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {aiReviewStatus}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              <strong>Reported Chief Complaint:</strong> {assessment.chiefComplaint}
            </p>
            <p>
              <strong>AI Algorithmic Evaluation:</strong> {assessment.aiSummary}
            </p>
          </div>

          {/* Clinician Review Actions (AI NEVER overwrites doctor without consent) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Independent Physician Review & Decision:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAiAssessment('ACCEPTED')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept Summary
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAiAssessment('MODIFIED')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-sm flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modify & Sign
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAiAssessment('REJECTED')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject AI Output
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={clinicianAiNotes}
              onChange={(e) => setClinicianAiNotes(e.target.value)}
              placeholder="Physician notes regarding AI suggestions (e.g. 'GERD confirmed on history; ECG normal sinus rhythm; troponin test not required')..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
            />
          </div>
        </div>
      )}

      {/* 3. SOAP Clinical Consultation Notes Form */}
      <form onSubmit={handleFinalizeConsultation} className="space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-hospital-navy flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-hospital-teal" />
              Physician Consultation Documentation (SOAP Framework)
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Form 102-OPD</span>
          </div>

          {/* S: Subjective */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              S — Subjective (History of Present Illness)
            </label>
            <textarea
              rows={3}
              value={hpi}
              onChange={(e) => setHpi(e.target.value)}
              placeholder="Detailed chronological history provided by patient (timing, triggers, relieving factors, current medication adherence)..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
            />
          </div>

          {/* O: Objective */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              O — Objective (Physical Examination & Systemic Findings)
            </label>
            <textarea
              rows={3}
              value={examinationNotes}
              onChange={(e) => setExaminationNotes(e.target.value)}
              placeholder="Clinical examination findings (CVS S1 S2 normal, Chest clear bilaterally, Abdomen soft, No pedal edema)..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
            />
          </div>

          {/* A: Assessment & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                A — Assessment (Clinical Diagnosis) *
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension, well-controlled; Gastroesophageal Reflux Disease"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                ICD-10 Code
              </label>
              <input
                type="text"
                value={icdCode}
                onChange={(e) => setIcdCode(e.target.value)}
                placeholder="e.g. I10, K21.9"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>
          </div>

          {/* P: Plan */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              P — Treatment Plan & Lifestyle Recommendations *
            </label>
            <textarea
              rows={3}
              required
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="1. Continue antihypertensive regimen. 2. Dietary sodium reduction (<2g/day). 3. Avoid lying down within 2 hours of heavy meals. 4. Return for follow up if symptoms persist."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Recommended Follow-Up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>
          </div>
        </div>

        {/* 4. Electronic Prescription Builder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-hospital-navy flex items-center gap-2">
              <Pill className="w-4 h-4 text-hospital-teal" />
              Electronic Prescriptions (Rx)
            </h3>
            <button
              type="button"
              onClick={addRx}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-hospital-teal bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Drug
            </button>
          </div>

          <div className="space-y-3">
            {prescriptions.map((rx, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Drug #{idx + 1}</span>
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRx(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Medication Name & Formulation
                    </label>
                    <input
                      type="text"
                      value={rx.medicationName}
                      onChange={(e) => updateRx(idx, 'medicationName', e.target.value)}
                      placeholder="e.g. Tab Pantoprazole 40mg"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={rx.dosage}
                      onChange={(e) => updateRx(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 40 mg"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={rx.duration}
                      onChange={(e) => updateRx(idx, 'duration', e.target.value)}
                      placeholder="e.g. 14 days"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={rx.frequency}
                      onChange={(e) => updateRx(idx, 'frequency', e.target.value)}
                      placeholder="e.g. Once daily in the morning before food"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={rx.instructions}
                      onChange={(e) => updateRx(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Take 30 mins before breakfast with water"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Diagnostic Laboratory Order Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-hospital-navy flex items-center gap-2">
              <TestTube className="w-4 h-4 text-purple-600" />
              Order Diagnostic Laboratory Investigations
            </h3>
            <p className="text-xs text-slate-500">
              Select verified laboratory panels to automatically route orders to the central pathology laboratory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {labCatalog.map((cat) => {
              const isChecked = selectedLabTestIds.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-purple-50/70 border-purple-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLabTestIds([...selectedLabTestIds, cat.id]);
                      } else {
                        setSelectedLabTestIds(selectedLabTestIds.filter((id) => id !== cat.id));
                      }
                    }}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-600"
                  />
                  <div>
                    <strong className="text-slate-900 block leading-tight">{cat.testName}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {cat.department} • {cat.sampleType} (₹{cat.standardFee})
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Final Sign & Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Signing finalizes this encounter into the ABDM clinical record and notifies the patient.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isEncounterSigned}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-xl shadow-hospital-teal/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            {isEncounterSigned ? 'Encounter Already Signed' : isSubmitting ? 'Signing Encounter...' : 'Digitally Sign & Complete Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
};
