import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  Pill,
  Heart,
  Users,
  TestTube,
  ShieldCheck,
  ClipboardList,
  LogOut,
  Stethoscope,
  BarChart3,
  UserCheck,
  FileCheck2,
  Clock,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, isPatient, isDoctor, isNurse, isLabStaff, isAdmin, isReceptionist } = useAuth();
  const navigate = useNavigate();

  const getLinks = () => {
    if (isPatient) {
      return [
        { to: '/patient', label: 'My Health Overview', icon: LayoutDashboard },
        { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
        { to: '/assessment', label: 'AI Symptom Check', icon: Sparkles, highlight: true },
        { to: '/patient/vitals', label: 'Vitals Timeline', icon: Heart },
        { to: '/patient/medications', label: 'Medications', icon: Pill },
        { to: '/patient/labs', label: 'Laboratory Reports', icon: TestTube },
        { to: '/patient/documents', label: 'Clinical Documents', icon: FileText },
        { to: '/patient/profile', label: 'Profile & DPDP Consent', icon: ShieldCheck },
      ];
    }

    if (isDoctor) {
      return [
        { to: '/doctor', label: 'Doctor Dashboard', icon: LayoutDashboard },
        { to: '/doctor/queue', label: "Today's Patient Queue", icon: Clock },
        { to: '/doctor/patients', label: 'Patient Clinical Search', icon: Users },
        { to: '/laboratory', label: 'Lab Orders & Results', icon: TestTube },
        { to: '/analytics', label: 'Clinical Analytics', icon: BarChart3 },
      ];
    }

    if (isNurse) {
      return [
        { to: '/nurse', label: 'Triage & Check-In Queue', icon: LayoutDashboard },
        { to: '/nurse/patients', label: 'Patient Directory', icon: Users },
        { to: '/assessment', label: 'Symptom Screener', icon: Activity },
      ];
    }

    if (isLabStaff) {
      return [
        { to: '/laboratory', label: 'Diagnostic Lab Worklist', icon: TestTube },
        { to: '/laboratory/catalog', label: 'Test Catalog & Ranges', icon: ClipboardList },
      ];
    }

    if (isAdmin || isReceptionist) {
      return [
        { to: '/admin', label: 'Operations Dashboard', icon: LayoutDashboard },
        { to: '/admin/appointments', label: 'Appointment Roster', icon: Calendar },
        { to: '/admin/users', label: 'Staff & User Management', icon: Users },
        { to: '/admin/audit', label: 'Audit Trail & Compliance', icon: ShieldCheck },
        { to: '/analytics', label: 'Hospital Analytics', icon: BarChart3 },
      ];
    }

    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-hospital-navy text-slate-300 flex flex-col min-h-screen shrink-0 border-r border-hospital-blue/40 shadow-lg">
      {/* Brand header */}
      <div className="p-4 border-b border-hospital-blue/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-hospital-teal flex items-center justify-center text-white font-bold shadow-md">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm tracking-tight leading-none">CITY HOSPITAL</h2>
          <span className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">
            {user?.role} Workspace
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/patient' || link.to === '/doctor' || link.to === '/admin' || link.to === '/nurse' || link.to === '/laboratory'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-hospital-teal text-white shadow-sm font-semibold'
                    : link.highlight
                    ? 'text-teal-300 bg-hospital-teal/15 hover:bg-hospital-teal/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
              {link.highlight && (
                <span className="ml-auto text-[9px] bg-teal-400/20 text-teal-300 px-1.5 py-0.2 rounded uppercase font-bold tracking-wider">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-hospital-blue/40">
          <NavLink
            to="/emergency"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-950/60 border border-red-800/40 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-red-400" />
            <span>Emergency Protocol (112)</span>
          </NavLink>
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-hospital-blue/40 bg-hospital-navyDark/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-hospital-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {user?.hospitalPatientId && (
          <div className="text-[10px] text-teal-300 font-mono bg-hospital-blue/40 px-2 py-0.5 rounded text-center">
            Patient ID: {user.hospitalPatientId}
          </div>
        )}
      </div>
    </aside>
  );
};
