import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { HeartPulse, Lock, Mail, Users, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/patient';

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setError(null);
    try {
      await demoLogin(role);
      let targetPath = '/patient';
      if (role === 'DOCTOR') targetPath = '/doctor';
      else if (role === 'NURSE') targetPath = '/nurse';
      else if (role === 'LAB_STAFF') targetPath = '/laboratory';
      else if (role === 'ADMIN' || role === 'RECEPTIONIST') targetPath = '/admin';
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    }
  };

  const demoAccounts: { role: UserRole; title: string; email: string; desc: string }[] = [
    { role: 'PATIENT', title: 'Patient Portal', email: 'rahul.sharma@demo.com', desc: 'Rahul Sharma (CHP-2026-0041) • Vitals, Meds, Labs' },
    { role: 'DOCTOR', title: 'Cardiologist', email: 'dr.anita@cityhospitalpune.org', desc: 'Dr. Anita Joshi, DM • OPD Queue, Notes, Rx, AI Review' },
    { role: 'DOCTOR', title: 'General Physician', email: 'dr.rajesh@cityhospitalpune.org', desc: 'Dr. Rajesh Kulkarni, MD • Internal Medicine' },
    { role: 'NURSE', title: 'Triage & Nurse', email: 'nurse.sneha@cityhospitalpune.org', desc: 'Sneha Gaikwad • Check-In Queue, Vitals, ESI Acuity' },
    { role: 'LAB_STAFF', title: 'Laboratory Tech', email: 'lab.technician@cityhospitalpune.org', desc: 'Amit Shinde • Diagnostic Orders, Results, PDF Verification' },
    { role: 'ADMIN', title: 'Hospital Admin', email: 'admin@cityhospitalpune.org', desc: 'Vikram S. • System Analytics, Staff, DPDP Compliance & Audits' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Standard Login */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hospital-navy to-hospital-teal text-white flex items-center justify-center shadow-md mb-3">
              <HeartPulse className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-hospital-navy tracking-tight">Sign In to City Hospital</h1>
            <p className="text-xs text-slate-500">
              Access your authorized medical workspace or personal patient health record.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@demo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-hospital-teal font-medium">Demo password: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-hospital-navy hover:bg-hospital-navyDark text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In with Secure Credentials'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need a patient account?</span>
            <Link to="/register" className="font-bold text-hospital-teal hover:underline">
              Register as New Patient
            </Link>
          </div>
        </div>

        {/* Right Column: Instant 1-Click Role Switcher */}
        <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-hospital-teal" />
              <h2 className="font-extrabold text-sm text-hospital-navy">Instant 1-Click Demo Accounts</h2>
            </div>
            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
              Evaluation
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Test the entire platform across all 6 specialized user workspaces immediately without typing credentials:
          </p>

          <div className="space-y-2.5">
            {demoAccounts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoSwitch(item.role)}
                className="w-full p-3 rounded-2xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-hospital-teal/40 shadow-sm text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-hospital-teal transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({item.email})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-hospital-teal group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>DPDP Act 2023 Audit Logging & Role Isolation Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
