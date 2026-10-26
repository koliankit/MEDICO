import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { AlertCircle, Users, CheckCircle, ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, demoLogin, isLoading } = useAuth();

  const roles: { role: UserRole; label: string; name: string }[] = [
    { role: 'PATIENT', label: 'Patient', name: 'Rahul Sharma' },
    { role: 'DOCTOR', label: 'Doctor', name: 'Dr. Anita Joshi' },
    { role: 'NURSE', label: 'Nurse', name: 'Nurse Sneha' },
    { role: 'LAB_STAFF', label: 'Lab Tech', name: 'Amit Shinde' },
    { role: 'RECEPTIONIST', label: 'Reception', name: 'Pooja K.' },
    { role: 'ADMIN', label: 'Admin', name: 'Vikram S.' },
  ];

  return (
    <div className="bg-hospital-navy text-white text-xs py-1.5 px-4 border-b border-hospital-blue/40 flex flex-wrap items-center justify-between gap-2 shadow-sm z-50">
      <div className="flex items-center gap-2">
        <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/40 uppercase tracking-wider flex items-center gap-1 text-[10px]">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Demonstration Environment
        </span>
        <span className="hidden md:inline text-slate-300">
          Simulated clinical data for City Hospital Pune. For medical emergencies in India, dial{' '}
          <strong className="text-white bg-red-600/80 px-1.5 py-0.2 rounded font-bold">112</strong>.
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="text-slate-400 font-medium hidden sm:inline mr-1 flex items-center gap-1">
          <Users className="w-3 h-3" /> Quick Switch:
        </span>
        {roles.map((r) => {
          const isActive = user?.role === r.role;
          return (
            <button
              key={r.role}
              disabled={isLoading}
              onClick={() => demoLogin(r.role)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all duration-150 flex items-center gap-1 ${
                isActive
                  ? 'bg-hospital-teal text-white shadow-sm ring-1 ring-white/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title={`Switch to demo ${r.label} account (${r.name})`}
            >
              {isActive && <CheckCircle className="w-2.5 h-2.5" />}
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
