import React from 'react';
import { PhoneCall, AlertTriangle, HeartPulse, Brain, Clock, ShieldAlert, MapPin, CheckCircle } from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Red Alert Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-red-600/25">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>National Emergency Protocol • India</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Medical Emergency & Acute Trauma Care
          </h1>
          <p className="text-red-100 text-sm sm:text-base leading-relaxed">
            If a patient is experiencing life-threatening warning signs, <strong>never delay medical care for an online tool or routine appointment</strong>. Immediate stabilization within the first "Golden Hour" saves lives.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="tel:112"
              className="px-6 py-3.5 rounded-xl font-black text-sm bg-white text-red-700 hover:bg-red-50 shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <PhoneCall className="w-5 h-5" />
              Dial 112 (Unified Emergency India)
            </a>
            <a
              href="tel:+912025678900"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-red-950/60 hover:bg-red-950/80 text-white border border-red-400/40 flex items-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Hospital Emergency Desk: +91 20 2567 8900
            </a>
          </div>
        </div>
      </div>

      {/* Two Critical Red Flag Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stroke / FAST */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Suspected Acute Stroke (FAST Signs)</h2>
              <p className="text-xs text-slate-500">Every minute brain tissue is saved by rapid thrombolysis</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Use the clinically-validated <strong>FAST</strong> screening criteria immediately if someone displays sudden neurological symptoms:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                F
              </span>
              <div>
                <strong className="text-slate-800">Face Drooping:</strong>
                <p className="text-slate-600">Does one side of the face droop or is it numb? Ask the person to smile.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                A
              </span>
              <div>
                <strong className="text-slate-800">Arm Weakness:</strong>
                <p className="text-slate-600">Is one arm weak or numb? Ask the person to raise both arms. Does one drift downward?</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                S
              </span>
              <div>
                <strong className="text-slate-800">Speech Difficulty:</strong>
                <p className="text-slate-600">Is speech slurred, unable to speak, or hard to understand? Ask them to repeat a simple sentence.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                T
              </span>
              <div>
                <strong className="text-red-900">Time to Call 112:</strong>
                <p className="text-red-800">If anyone shows any of these signs, call 112 immediately. Note the exact time symptoms began.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cardiac / Heart Attack */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Suspected Heart Attack (Acute Ischemia)</h2>
              <p className="text-xs text-slate-500">Coronary blood flow must be restored urgently</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Classic warning signs of acute coronary syndrome requiring immediate emergency dispatch:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Chest Discomfort or Pressure:</strong>
                <p className="text-slate-600">Uncomfortable pressure, fullness, squeezing, or pain in the center of the chest lasting more than a few minutes.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Radiation of Discomfort:</strong>
                <p className="text-slate-600">Pain radiating to the left arm, shoulder, neck, jaw, back, or epigastrium.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Shortness of Breath:</strong>
                <p className="text-slate-600">Often accompanies chest discomfort or may occur beforehand.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Autonomic Symptoms:</strong>
                <p className="text-slate-600">Cold sweats, unexplained lightheadedness, nausea, or impending sense of doom.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical What NOT To Do Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="font-extrabold text-base text-amber-400 uppercase tracking-wider text-xs">
          Critical Emergency Precautions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <strong className="text-white block">DO NOT drive yourself</strong>
            <p className="text-slate-300">
              Never attempt to drive a car or two-wheeler if you suspect a cardiac or neurological event. Dial 112 for ambulance transport.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <strong className="text-white block">DO NOT take medications unadvised</strong>
            <p className="text-slate-300">
              Do not take unverified blood thinners or nitroglycerin unless explicitly directed by an attending emergency physician or paramedic.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <strong className="text-white block">DO NOT delay care</strong>
            <p className="text-slate-300">
              Never wait "to see if symptoms pass" or spend critical hours filling out online forms. Every minute counts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
