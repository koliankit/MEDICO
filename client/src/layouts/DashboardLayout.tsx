import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoBanner } from '../components/common/DemoBanner';
import { Sidebar } from '../components/common/Sidebar';
import {
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  HeartPulse,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hospital-slate flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-hospital-navy flex items-center justify-center text-hospital-teal animate-bounce shadow-lg">
          <HeartPulse className="w-7 h-7 animate-pulse text-hospital-teal" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading City Hospital Clinical Workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Generate breadcrumb text
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');

  return (
    <div className="min-h-screen flex flex-col bg-hospital-slate">
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-hospital-navy z-10">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Link to="/" className="hover:text-hospital-teal transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-hospital-navy font-semibold">{breadcrumb || 'Workspace'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-hospital-teal transition-colors font-medium px-2 py-1 rounded-md hover:bg-slate-50"
              >
                Public Website <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-hospital-navy text-white text-xs font-bold flex items-center justify-center">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-bold text-slate-800 leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-hospital-teal font-medium uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
