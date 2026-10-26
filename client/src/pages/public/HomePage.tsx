import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Department, Doctor, HealthArticle } from '../../types';
import {
  HeartPulse,
  Activity,
  Calendar,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Building2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      const [deptData, docData, artData] = await Promise.all([
        api.departments.getAll(),
        api.doctors.getAll(),
        api.education.getArticles(),
      ]);
      setDepartments(deptData);
      setDoctors(docData);
      setArticles(artData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    }
  };

  const faqs = [
    {
      q: 'Does the AI symptom assessment tool replace an attending medical doctor?',
      a: 'No, absolutely not. The AI symptom assessment tool is an intelligent clinical decision-support and triage assistant. It provides preliminary guidance, identifies potential emergency warning signs, and prepares a structured summary for licensed medical professionals. Final diagnoses, prescriptions, and clinical decisions are always made by our physicians.',
    },
    {
      q: 'How does City Hospital Pune safeguard patient health data under the DPDP Act 2023?',
      a: 'In accordance with India’s Digital Personal Data Protection (DPDP) Act 2023 and Ayushman Bharat Digital Mission (ABDM) guidelines, patient data is processed exclusively on the basis of explicit, purpose-specific consent. All records are isolated with strict role-based access control, encryption in transit, and immutable audit logs.',
    },
    {
      q: 'What should I do if I am experiencing sudden severe chest pain or breathlessness?',
      a: 'Do not use online tools or wait for an appointment. Dial 112 immediately for emergency medical dispatch in India, or proceed directly to the 24x7 Emergency & Trauma Resuscitation Suite at City Hospital Pune.',
    },
    {
      q: 'Can I link my Ayushman Bharat Health Account (ABHA ID)?',
      a: 'Yes. City Hospital Pune provides native support for 14-digit ABHA numbers, allowing your verified clinical encounter notes, prescriptions, and laboratory reports to be securely shared across authorized healthcare providers nationwide.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hospital-navy via-hospital-navyDark to-hospital-navy text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-hospital-teal/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-hospital-blue/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-teal-300">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Next-Generation AI-Assisted Clinical Decision Support</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Empowering Patient Care with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-200">
                  Precision Medical AI
                </span>{' '}
                & Expert Clinicians
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                City Hospital Pune seamlessly connects patients, multi-specialty doctors, nurses, and laboratory specialists. Complete our 10-step symptom assessment, manage appointments, and access verified digital health records with ABDM-aligned security.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/book"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-lg shadow-hospital-teal/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4" />
                  Book Doctor Consultation
                </Link>

                <Link
                  to="/assessment"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm flex items-center gap-2 transition-all"
                >
                  <Activity className="w-4 h-4 text-teal-300" />
                  Check Symptoms with AI
                </Link>
              </div>

              {/* Trust Pills */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                  <span>DPDP Act 2023 Consent</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-400" />
                  <span>ABDM Health Account Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-300" />
                  <span>24x7 Emergency OPD (112)</span>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-hospital-teal flex items-center justify-center text-white">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Clinical Triage & Decision Hub</h3>
                      <p className="text-[11px] text-teal-300">Live Hospital Operations</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-slate-200 font-medium">Verified Specialist Doctors</span>
                    </div>
                    <span className="font-bold text-teal-300">6 On Duty</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-300" />
                      <span className="text-slate-200 font-medium">Clinical Departments</span>
                    </div>
                    <span className="font-bold text-teal-300">6 Active OPDs</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="text-slate-200 font-medium">Average Lab Turnaround</span>
                    </div>
                    <span className="font-bold text-cyan-300">3.5 Hours</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-950/60 to-red-900/40 border border-red-500/40 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
                    <div>
                      <p className="font-bold text-red-200 text-xs">Emergency Helpline (India)</p>
                      <p className="text-[10px] text-red-300">Call 112 for acute emergencies</p>
                    </div>
                  </div>
                  <Link
                    to="/emergency"
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
                  >
                    View Protocol
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS - 4 CLINICAL PHASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
            Patient Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-hospital-navy mt-1">
            How City Hospital Pune Operates
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            A transparent clinical workflow that integrates AI safety screening with human physician governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <span className="absolute top-4 right-4 text-2xl font-black text-slate-200">01</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-hospital-teal flex items-center justify-center font-bold mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Share Symptoms or Book</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Describe your chief complaint in natural language or schedule an appointment with a verified specialist.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <span className="absolute top-4 right-4 text-2xl font-black text-slate-200">02</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Safety Red-Flag Check</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Medically-reviewed safety rules screen for emergency indicators (e.g. cardiac pain, stroke signs) before routine analysis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <span className="absolute top-4 right-4 text-2xl font-black text-slate-200">03</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-hospital-blue flex items-center justify-center font-bold mb-4">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Clinician Consultation</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Our doctor independently reviews your vitals, notes, and AI summary, authors SOAP notes, and issues prescriptions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <span className="absolute top-4 right-4 text-2xl font-black text-slate-200">04</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Digital EHR & Reports</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Access verified diagnostic laboratory reports, electronic visit summaries, and DPDP-compliant consent records.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL DEPARTMENTS */}
      <section className="bg-hospital-lightBlue/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
                Specialties
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-hospital-navy mt-1">
                Medical & Surgical Departments
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                State-of-the-art facilities equipped with specialized diagnostic infrastructure.
              </p>
            </div>
            <Link
              to="/departments"
              className="inline-flex items-center gap-1 text-xs font-bold text-hospital-teal hover:text-hospital-tealDark transition-colors"
            >
              View All Departments <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.slice(0, 6).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {dept.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{dept.floor}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{dept.name}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{dept.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {dept.doctors?.length || 1} Specialist Clinicians
                  </span>
                  <Link
                    to={`/book?department=${dept.id}`}
                    className="text-xs font-bold text-hospital-teal hover:underline flex items-center gap-1"
                  >
                    Consult Doctor <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VERIFIED DOCTOR ROSTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
              Clinical Faculty
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-hospital-navy mt-1">
              Verified Attending Doctors
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Meet our board-certified medical specialists across primary, cardiology, neuro, and ortho care.
            </p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1 text-xs font-bold text-hospital-teal hover:text-hospital-tealDark transition-colors"
          >
            Explore Doctor Directory <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-hospital-navy text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                    Dr.
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Dr. {doc.user.firstName} {doc.user.lastName}
                    </h3>
                    <p className="text-[11px] text-hospital-teal font-medium">
                      {doc.department?.name || 'Specialist'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Reg: {doc.licenseNumber}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p>
                    <strong>Qualifications:</strong> {doc.qualifications}
                  </p>
                  <p>
                    <strong>Experience:</strong> {doc.experienceYears} Years
                  </p>
                  <p>
                    <strong>OPD Room:</strong> {doc.roomNumber}
                  </p>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">{doc.bio}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{doc.consultationFee}</span>
                </div>
                <Link
                  to={`/book?doctor=${doc.id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-colors"
                >
                  Book OPD Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HEALTHCARE EDUCATION HIGHLIGHTS (WHO, MoHFW, NHS) */}
      <section className="bg-hospital-slate py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
                Evidence-Based Health Library
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-hospital-navy mt-1">
                Reviewed Patient Health Education
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Curated clinical guidance referencing World Health Organization, MoHFW India, and NHS UK.
              </p>
            </div>
            <Link
              to="/education"
              className="inline-flex items-center gap-1 text-xs font-bold text-hospital-teal hover:text-hospital-tealDark transition-colors"
            >
              Browse Full Library <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-[10px] text-slate-500">
                    <span className="font-bold uppercase text-hospital-teal bg-teal-50 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span>Reviewed: {art.publicationDate}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{art.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">
                    {art.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                    {art.sourceOrganization}
                  </span>
                  <Link
                    to="/education"
                    className="font-bold text-hospital-teal hover:underline text-xs flex items-center gap-1"
                  >
                    Read Guide <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EMERGENCY 112 BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-red-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              Emergency Response Protocol (India)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Suspect a Cardiac Event, Stroke, or Severe Trauma?
            </h2>
            <p className="text-red-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Do not delay critical care for an online assessment. Dial 112 immediately for unified national emergency services or visit the City Hospital Pune 24x7 trauma care resuscitation bay.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="tel:112"
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-white text-red-700 hover:bg-red-50 shadow-md flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              Call 112 Now
            </a>
            <Link
              to="/emergency"
              className="px-5 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition-colors"
            >
              Emergency Warning Signs Guide
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-hospital-navy mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-hospital-teal"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    activeFaq === idx ? 'rotate-90 text-hospital-teal' : 'text-slate-400'
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
