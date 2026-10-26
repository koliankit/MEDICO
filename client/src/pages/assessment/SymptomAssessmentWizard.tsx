import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Calendar,
  Download,
  Stethoscope,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SymptomRow {
  symptom: string;
  location: string;
  duration: string;
  severity: string;
}

export const SymptomAssessmentWizard: React.FC = () => {
  const { user, isPatient } = useAuth();
  const navigate = useNavigate();

  // Step 1 to 9
  const [step, setStep] = useState<number>(1);
  const [consentGranted, setConsentGranted] = useState<boolean>(true);

  // Step 2: Context
  const [ageGroup, setAgeGroup] = useState<string>('Adult (18-64)');
  const [gender, setGender] = useState<string>('Male');

  // Step 3: Chief Complaint
  const [chiefComplaint, setChiefComplaint] = useState<string>('');

  // Step 4: Structured Symptoms
  const [symptoms, setSymptoms] = useState<SymptomRow[]>([
    { symptom: '', location: 'Chest', duration: '2-3 days', severity: 'Mild (3/10)' },
  ]);

  // Step 5: Adaptive Follow-up Responses
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({
    exertionWorsening: 'No, symptoms do not increase with walking or stairs',
    radiation: 'No radiation to left arm or jaw',
    feverPresent: 'No fever or chills',
    relievingFactors: 'Partially relieved after resting or drinking water',
  });

  // Loading & Assessment Results
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [emergencyResult, setEmergencyResult] = useState<any | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Symptom suggestions
  const commonSymptoms = [
    'Chest tightness / pressure',
    'Acid regurgitation / heartburn',
    'Shortness of breath on exertion',
    'Persistent dry cough',
    'Throbbing headache / migraine',
    'Abdominal cramping / pain',
    'Knee or hip joint stiffness',
    'Recurrent fatigue / weakness',
    'Sore throat and nasal congestion',
  ];

  const addSymptomRow = () => {
    setSymptoms([...symptoms, { symptom: '', location: 'General', duration: '1-2 days', severity: 'Mild' }]);
  };

  const removeSymptomRow = (idx: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== idx));
  };

  const updateSymptomRow = (idx: number, field: keyof SymptomRow, val: string) => {
    const updated = [...symptoms];
    updated[idx][field] = val;
    setSymptoms(updated);
  };

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setEmergencyResult(null);

    try {
      const payload = {
        ageGroup,
        gender,
        chiefComplaint: chiefComplaint || symptoms[0]?.symptom || 'General checkup',
        symptoms: symptoms.filter((s) => s.symptom.trim().length > 0),
        followUpResponses: followUpAnswers,
      };

      const res = await api.assessments.evaluate(payload);
      const evalData = res.evaluation;

      if (evalData.safetyAlertTriggered) {
        setEmergencyResult(evalData);
        setStep(6); // Emergency Screen
      } else {
        setAssessmentResult(evalData);
        setStep(8); // Results Screen
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      alert(err.message || 'Evaluation error. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveToRecord = async () => {
    if (!user) {
      alert('Please sign in as a Patient to attach this assessment to your permanent EHR record.');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.assessments.save({
        patientId: user.patientId,
        ageGroup,
        chiefComplaint: chiefComplaint || symptoms[0]?.symptom,
        symptoms: symptoms.filter((s) => s.symptom.trim().length > 0),
        followUpAnswers,
        safetyAlertTriggered: false,
        aiUrgencyLevel: assessmentResult.aiUrgencyLevel,
        aiSummary: assessmentResult.aiSummary,
        aiPossibleExplanations: assessmentResult.possibleExplanations,
        aiQuestionsForDoctor: assessmentResult.questionsForDoctor,
        aiReferences: assessmentResult.references,
      });

      setSavedAssessmentId(res.assessment.sessionNumber);
      alert(`Success: Assessment saved to your medical record as session ${res.assessment.sessionNumber}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to save assessment to record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Step Progress Bar */}
      {step < 6 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Clinical Questionnaire Progress</span>
            <span className="text-hospital-teal">Step {step} of 5</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-hospital-teal h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: INFORMED CONSENT & INTRODUCTION */}
      {/* ========================================================= */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-hospital-teal flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-hospital-teal">
                Step 1 of 5 • Safety & Ethics
              </span>
              <h1 className="text-2xl font-black text-hospital-navy">
                Informed Consent & AI Clinical Boundaries
              </h1>
            </div>
          </div>

          <div className="p-4 bg-hospital-slate rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-hospital-teal shrink-0 mt-0.5" />
              <p>
                <strong>Decision Support Tool, Not a Doctor:</strong> This AI-assisted tool provides preliminary educational guidance and triage structuring. It <strong>never</strong> issues a definitive clinical diagnosis and does <strong>not</strong> prescribe medications.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p>
                <strong>Immediate Emergencies:</strong> If you or anyone in your care is experiencing crushing chest pain, difficulty breathing, facial droop, or sudden weakness, <strong>stop now and call 112</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>DPDP Act 2023 Compliance:</strong> Your health inputs are processed solely to generate this clinical summary. When saved, the summary is shared only with your attending physician at City Hospital Pune.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 bg-teal-50/60 rounded-2xl border border-teal-100 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="mt-0.5 rounded text-hospital-teal focus:ring-hospital-teal"
            />
            <span className="text-xs text-slate-800 font-medium leading-relaxed">
              I understand that this assessment is for educational decision-support, does not replace a licensed medical consultation, and I consent to sharing these symptoms with City Hospital Pune clinicians.
            </span>
          </label>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled={!consentGranted}
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              Continue to Patient Context <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: PATIENT CONTEXT */}
      {/* ========================================================= */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-teal">
              Step 2 of 5 • Demographic Baseline
            </span>
            <h2 className="text-2xl font-black text-hospital-navy mt-1">
              Basic Patient Context
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Age group and biological factors assist in prioritizing age-specific clinical differential considerations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Age Group</label>
              <div className="space-y-2">
                {['Child (0-12)', 'Adolescent (13-17)', 'Young Adult (18-29)', 'Adult (30-59)', 'Senior (60+)'].map((grp) => (
                  <button
                    type="button"
                    key={grp}
                    onClick={() => setAgeGroup(grp)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                      ageGroup === grp
                        ? 'bg-teal-50 border-hospital-teal text-hospital-navy ring-1 ring-hospital-teal'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Biological Sex</label>
              <div className="space-y-2">
                {['Male', 'Female', 'Other / Prefer not to say'].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                      gender === g
                        ? 'bg-teal-50 border-hospital-teal text-hospital-navy ring-1 ring-hospital-teal'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md flex items-center gap-2"
            >
              Next: Chief Complaint <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: CHIEF COMPLAINT (NATURAL LANGUAGE) */}
      {/* ========================================================= */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-teal">
              Step 3 of 5 • Primary Reason
            </span>
            <h2 className="text-2xl font-black text-hospital-navy mt-1">
              What is your Chief Complaint?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Describe in your own words what symptoms or discomfort you are experiencing.
            </p>
          </div>

          <div>
            <textarea
              rows={4}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. For the past 3 days I have had a burning discomfort in the center of my chest after dinner, with a sour taste in my mouth. It does not worsen when I walk..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal"
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">Or select common presentations:</span>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    const separator = chiefComplaint.length > 0 ? ', ' : '';
                    setChiefComplaint(`${chiefComplaint}${separator}${s}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-hospital-teal border border-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={chiefComplaint.trim().length === 0}
              onClick={() => {
                // Prepopulate first structured symptom if empty
                if (!symptoms[0]?.symptom) {
                  symptoms[0].symptom = chiefComplaint.slice(0, 50);
                }
                setStep(4);
              }}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              Next: Structured Symptoms <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: STRUCTURED SYMPTOMS SELECTOR */}
      {/* ========================================================= */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-hospital-teal">
                Step 4 of 5 • Structured Clinical Parameters
              </span>
              <h2 className="text-2xl font-black text-hospital-navy mt-1">
                Symptom Characteristics & Severity
              </h2>
            </div>
            <button
              type="button"
              onClick={addSymptomRow}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-hospital-teal bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Symptom
            </button>
          </div>

          <div className="space-y-4">
            {symptoms.map((row, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Symptom #{idx + 1}</span>
                  {symptoms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSymptomRow(idx)}
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Symptom Name
                    </label>
                    <input
                      type="text"
                      value={row.symptom}
                      onChange={(e) => updateSymptomRow(idx, 'symptom', e.target.value)}
                      placeholder="e.g. Retrosternal burning sensation"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Anatomical Location
                    </label>
                    <select
                      value={row.location}
                      onChange={(e) => updateSymptomRow(idx, 'location', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none"
                    >
                      <option value="Chest">Chest / Thorax</option>
                      <option value="Head/Neck">Head & Neck</option>
                      <option value="Abdomen">Upper Abdomen</option>
                      <option value="Throat">Throat & Pharynx</option>
                      <option value="Back">Spine & Back</option>
                      <option value="Joints">Joints & Limbs</option>
                      <option value="General">Systemic / General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Duration
                    </label>
                    <select
                      value={row.duration}
                      onChange={(e) => updateSymptomRow(idx, 'duration', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none"
                    >
                      <option value="Less than 24 hours">Less than 24 hrs</option>
                      <option value="2-3 days">2 - 3 days</option>
                      <option value="1-2 weeks">1 - 2 weeks</option>
                      <option value="More than a month">More than 1 month</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md flex items-center gap-2"
            >
              Next: Adaptive Safety Questions <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 5: ADAPTIVE FOLLOW-UP QUESTIONS */}
      {/* ========================================================= */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-teal">
              Step 5 of 5 • Adaptive Clarifications
            </span>
            <h2 className="text-2xl font-black text-hospital-navy mt-1">
              Clinical Clarification Questionnaire
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Answering these specific questions allows the safety algorithm to differentiate routine conditions from urgent alerts.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                1. Does the discomfort or shortness of breath increase when you walk briskly or climb stairs?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setFollowUpAnswers({
                      ...followUpAnswers,
                      exertionWorsening: 'Yes, noticeably worse with physical activity or walking',
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border ${
                    followUpAnswers.exertionWorsening.includes('Yes')
                      ? 'bg-teal-50 border-hospital-teal font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Yes, noticeably worse on exertion
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFollowUpAnswers({
                      ...followUpAnswers,
                      exertionWorsening: 'No, does not increase with walking or stairs',
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border ${
                    followUpAnswers.exertionWorsening.includes('No')
                      ? 'bg-teal-50 border-hospital-teal font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  No, unrelated to physical activity
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                2. Is there any pain radiating to your left arm, jaw, throat, or back?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setFollowUpAnswers({
                      ...followUpAnswers,
                      radiation: 'Yes, radiates to left arm or lower jaw',
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border ${
                    followUpAnswers.radiation.includes('Yes')
                      ? 'bg-red-50 border-red-300 text-red-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Yes, spreads to left arm or jaw
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFollowUpAnswers({
                      ...followUpAnswers,
                      radiation: 'No radiation to left arm or jaw',
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border ${
                    followUpAnswers.radiation.includes('No')
                      ? 'bg-teal-50 border-hospital-teal font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  No, localized to one spot
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                3. Are you experiencing cold sweats, unexplained dizziness, or vomiting?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setFollowUpAnswers({
                      ...followUpAnswers,
                      sweats: 'Yes, experiencing profuse cold sweats or faintness',
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border ${
                    followUpAnswers.sweats?.includes('Yes')
                      ? 'bg-red-50 border-red-300 text-red-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Yes, cold sweating / dizziness
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFollowUpAnswers({
                      ...followUpAnswers,
                      sweats: 'None',
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border ${
                    followUpAnswers.sweats === 'None'
                      ? 'bg-teal-50 border-hospital-teal font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  No, feeling hemodynamically normal
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={isEvaluating}
              onClick={runEvaluation}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-lg shadow-hospital-teal/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isEvaluating ? 'Executing Safety Screening...' : 'Generate Clinical Decision Summary'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 6: EMERGENCY WARNING SCREEN (INTERRUPTS ROUTINE FLOW) */}
      {/* ========================================================= */}
      {step === 6 && emergencyResult && (
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black text-xl shadow-lg animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-200 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-400/40">
                CRITICAL WARNING • IMMEDIATE EMERGENCY ACTION REQUIRED
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                Routine Assessment Interrupted
              </h1>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20 space-y-3 text-xs leading-relaxed">
            <p className="text-sm font-bold text-white">
              {emergencyResult.aiSummary}
            </p>
            <p className="text-red-100">
              Your reported symptoms match authoritative emergency criteria ({emergencyResult.emergencyReason}). Waiting for an online questionnaire or non-urgent appointment creates risk of critical care delay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <a
              href="tel:112"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm bg-white text-red-700 hover:bg-red-50 shadow-xl flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
            >
              <PhoneCall className="w-5 h-5 text-red-600" />
              Call 112 (India Emergency Dispatch)
            </a>
            <a
              href="tel:+912025678900"
              className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-xs bg-red-950/60 hover:bg-red-950 text-white border border-red-300/40 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              City Hospital Trauma Desk: +91 20 2567 8900
            </a>
          </div>

          <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-red-200">
            <span>Location: Ganeshkhind Road, Shivajinagar, Pune 411005</span>
            <button
              onClick={() => {
                setEmergencyResult(null);
                setStep(1);
              }}
              className="underline text-white font-medium hover:text-red-100"
            >
              Reset Assessment
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 8: RESULTS & CLINICAL DECISION SUPPORT SUMMARY */}
      {/* ========================================================= */}
      {step === 8 && assessmentResult && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-hospital-teal bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    Decision Support Output
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    PRELIMINARY • NOT A DIAGNOSIS
                  </span>
                </div>
                <h1 className="text-2xl font-black text-hospital-navy">
                  Preliminary Clinical Summary & Triage Guidance
                </h1>
              </div>

              {/* Urgency Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">
                  Suggested Review Urgency
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-xl font-extrabold text-xs uppercase tracking-wider ${
                    assessmentResult.aiUrgencyLevel === 'HIGH'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : assessmentResult.aiUrgencyLevel === 'MODERATE'
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {assessmentResult.aiUrgencyLevel} PRIORITY
                </span>
              </div>
            </div>

            {/* AI Summary Text */}
            <div className="p-4 bg-hospital-slate rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Algorithmic Assessment Summary:</strong>
              {assessmentResult.aiSummary}
            </div>

            {/* Differential Considerations to Discuss */}
            <div>
              <h3 className="font-extrabold text-sm text-hospital-navy mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-hospital-teal" />
                Possible Explanations to Discuss with a Clinician
              </h3>
              <div className="space-y-3">
                {assessmentResult.possibleExplanations?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-xs">{item.condition}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {item.source}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.relevance}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions to Ask Doctor */}
            <div>
              <h3 className="font-extrabold text-sm text-hospital-navy mb-3">
                Questions You May Wish to Ask Your Attending Physician:
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {assessmentResult.questionsForDoctor?.map((q: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-hospital-teal shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Authoritative Citations */}
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Attributed Medical References:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {assessmentResult.references?.map((ref: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{ref.title}</p>
                      <span className="text-[10px] text-slate-500">{ref.organization}</span>
                    </div>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hospital-teal hover:underline text-xs flex items-center gap-1 font-semibold"
                    >
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Medical Safety Disclaimer */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Clinical Governance Notice:</strong> {assessmentResult.disclaimer}
            </div>

            {/* Next Actions (Save / Book) */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Restart Assessment
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving || !!savedAssessmentId}
                  onClick={handleSaveToRecord}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {savedAssessmentId ? `Saved (${savedAssessmentId})` : isSaving ? 'Saving...' : 'Save to My Health Record'}
                </button>

                <Link
                  to="/book"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md shadow-hospital-teal/20 transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Doctor Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
