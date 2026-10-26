import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, ShieldCheck, ExternalLink, MapPin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-hospital-navy text-slate-300 border-t border-hospital-blue/40 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Emergency */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-hospital-teal flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">CITY HOSPITAL PUNE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-assisted clinical decision support and hospital management platform designed for patient safety, clinician governance, and interoperable digital care.
            </p>
            <div className="bg-red-950/50 border border-red-800/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                <PhoneCall className="w-4 h-4" />
                Emergency Hotline: 112
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                24x7 Ambulance & Acute Trauma Resuscitation Desk: +91 20 2567 8900
              </p>
            </div>
          </div>

          {/* Col 2: Clinical Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-teal-400">
              Clinical Workspaces
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/patient" className="hover:text-white transition-colors">
                  Patient Health Records
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-white transition-colors">
                  AI Symptom Assessment
                </Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-white transition-colors">
                  Doctor Clinical Workspace
                </Link>
              </li>
              <li>
                <Link to="/nurse" className="hover:text-white transition-colors">
                  Nurse Triage & Intake
                </Link>
              </li>
              <li>
                <Link to="/laboratory" className="hover:text-white transition-colors">
                  Diagnostic Laboratory Hub
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Operations & Staff Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Healthcare References */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-teal-400">
              Verified Medical Sources
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a
                  href="https://mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  MoHFW Govt. of India <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://abdm.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  Ayushman Bharat Digital Mission (ABDM) <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  World Health Organization (WHO) <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://medlineplus.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  MedlinePlus (NIH) <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nhs.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  NHS UK Health Guidelines <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-teal-400">
              Hospital Campus
            </h4>
            <div className="flex items-start gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-hospital-teal shrink-0 mt-0.5" />
              <span>Ganeshkhind Road, Shivajinagar, Pune, Maharashtra 411005, India</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-hospital-teal shrink-0" />
              <span>contact@cityhospitalpune.org</span>
            </div>
            <div className="pt-2 border-t border-hospital-blue/30 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>DPDP Act 2023 & ABDM Compliant Consent</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 pt-6 border-t border-hospital-blue/30 text-center text-[11px] text-slate-400 space-y-2">
          <p>
            <strong>Project Demonstration Notice:</strong> City Hospital Pune is an AI-assisted healthcare software demonstration system. Fictional patient records and clinical scenarios are used solely for evaluation. AI preliminary assessments are intended for clinical decision support and educational reference, and do not replace the judgment of licensed medical professionals.
          </p>
          <p className="text-slate-500">
            © {new Date().getFullYear()} City Hospital Pune. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
