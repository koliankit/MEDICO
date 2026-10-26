import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  Activity,
  HeartPulse,
  Bell,
  User as UserIcon,
  LogOut,
  Calendar,
  FileText,
  PhoneCall,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isPatient, isDoctor, isNurse, isLabStaff, isAdmin, isReceptionist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, location.pathname]);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      // Quiet fail if guest
    }
  };

  const handleMarkAsRead = async (id: string, actionUrl?: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (actionUrl) {
        setShowNotifications(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardPath = () => {
    if (isDoctor) return '/doctor';
    if (isNurse) return '/nurse';
    if (isLabStaff) return '/laboratory';
    if (isAdmin) return '/admin';
    if (isReceptionist) return '/admin';
    return '/patient';
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NURSE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LAB_STAFF':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'RECEPTIONIST':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hospital-navy to-hospital-teal flex items-center justify-center text-white shadow-md shadow-hospital-teal/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-hospital-navy tracking-tight">
                  CITY HOSPITAL
                </span>
                <span className="text-hospital-teal font-extrabold text-lg sm:text-xl">PUNE</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase hidden sm:block">
                AI-Assisted Diagnostic & Healthcare Management
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/departments"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/departments'
                  ? 'text-hospital-teal bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-hospital-navy hover:bg-slate-50'
              }`}
            >
              Departments
            </Link>
            <Link
              to="/doctors"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/doctors'
                  ? 'text-hospital-teal bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-hospital-navy hover:bg-slate-50'
              }`}
            >
              Doctor Directory
            </Link>
            <Link
              to="/assessment"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/assessment'
                  ? 'text-hospital-teal bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-hospital-navy hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 text-hospital-teal" />
              AI Symptom Check
            </Link>
            <Link
              to="/education"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/education'
                  ? 'text-hospital-teal bg-teal-50 font-semibold'
                  : 'text-slate-600 hover:text-hospital-navy hover:bg-slate-50'
              }`}
            >
              Health Resources
            </Link>
            <Link
              to="/emergency"
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency 112
            </Link>
          </nav>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Workspace shortcut button */}
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hospital-lightBlue text-hospital-navy hover:bg-teal-50 hover:text-hospital-teal text-xs font-semibold border border-hospital-blue/20 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {isDoctor
                    ? 'Doctor Workspace'
                    : isNurse
                    ? 'Triage Queue'
                    : isLabStaff
                    ? 'Lab Portal'
                    : isAdmin
                    ? 'Admin Suite'
                    : isReceptionist
                    ? 'Reception'
                    : 'My Portal'}
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="p-2 rounded-lg text-slate-600 hover:text-hospital-navy hover:bg-slate-100 relative transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-hospital-teal hover:underline font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkAsRead(n.id, n.actionUrl)}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                                !n.isRead ? 'bg-teal-50/50' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-800">{n.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-hospital-navy text-white font-semibold flex items-center justify-center text-xs shadow-sm">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {user.firstName} {user.lastName}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${getRoleBadgeColor()}`}>
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.hospitalPatientId && (
                          <p className="text-[10px] font-mono text-hospital-teal mt-0.5">
                            ID: {user.hospitalPatientId}
                          </p>
                        )}
                      </div>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-hospital-navy font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        Workspace Dashboard
                      </Link>
                      {isPatient && (
                        <>
                          <Link
                            to="/patient/appointments"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            My Appointments
                          </Link>
                          <Link
                            to="/patient/labs"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            Diagnostic Reports
                          </Link>
                        </>
                      )}
                      {(isAdmin || isDoctor) && (
                        <Link
                          to="/analytics"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          Hospital Analytics
                        </Link>
                      )}
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-hospital-navy hover:text-hospital-teal hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-all shadow-hospital-teal/20"
                >
                  Book Appointment
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Departments
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Doctor Directory
          </Link>
          <Link
            to="/assessment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-hospital-teal font-semibold hover:bg-slate-50"
          >
            AI Symptom Assessment
          </Link>
          <Link
            to="/education"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Health Education & References
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100"
          >
            Emergency Guidance (Call 112)
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-bold text-hospital-navy bg-slate-100"
            >
              Go to Workspace Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
