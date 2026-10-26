import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { Calendar, Clock, Stethoscope, AlertCircle, XCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api.appointments.getAll();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.appointments.updateStatus(id, 'CANCELLED', 'Cancelled by patient');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_CONSULTATION':
        return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl font-black text-hospital-navy mt-0.5">My Appointments</h1>
          <p className="text-xs text-slate-500">
            View scheduled, ongoing, and past clinical consultations at City Hospital Pune.
          </p>
        </div>
        <Link
          to="/book"
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md shadow-hospital-teal/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" /> Book New Appointment
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No appointments scheduled</p>
          <Link
            to="/book"
            className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold text-hospital-teal bg-teal-50 hover:bg-teal-100"
          >
            Schedule a Consultation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {appt.type} Consultation
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-hospital-navy text-white font-bold flex items-center justify-center text-xs shrink-0">
                    Dr.
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                    </h3>
                    <p className="text-xs text-hospital-teal font-medium">
                      {appt.doctor?.department?.name || 'Specialist'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Room: {appt.doctor?.roomNumber || 'OPD Desk'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800">Reason for Visit:</strong> {appt.reason}
                </div>
              </div>

              {/* Schedule Info & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {appt.appointmentDate}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{appt.timeSlot}</span>
                </div>

                {appt.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    Cancel Slot
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
