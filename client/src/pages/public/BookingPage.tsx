import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Doctor, Department } from '../../types';
import { Calendar, Clock, Stethoscope, AlertCircle, CheckCircle2, User, Phone, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isPatient } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(searchParams.get('department') || '');
  const [selectedDocId, setSelectedDocId] = useState<string>(searchParams.get('doctor') || '');

  // Form states
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 10:30 AM');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookedAppointment, setBookedAppointment] = useState<any | null>(null);

  // Time slots
  const availableSlots = [
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '03:30 PM - 04:00 PM',
  ];

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [selectedDeptId]);

  const loadMetadata = async () => {
    try {
      const depts = await api.departments.getAll();
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
    }
  };

  const loadDoctors = async () => {
    try {
      const docs = await api.doctors.getAll(selectedDeptId || undefined);
      const safeDocs = Array.isArray(docs) ? docs : [];
      setDoctors(safeDocs);
      if (selectedDocId && !safeDocs.some((d) => d.id === selectedDocId)) {
        setSelectedDocId('');
      } else if (!selectedDocId && safeDocs.length > 0) {
        setSelectedDocId(safeDocs[0].id);
      }
    } catch (err) {
      console.error(err);
      setDoctors([]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in as a Patient to finalize your appointment booking.');
      return;
    }

    if (!selectedDocId || !appointmentDate || !selectedSlot || !reason) {
      setError('Please select a doctor, appointment date, time slot, and describe the reason for visit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.appointments.book({
        doctorId: selectedDocId,
        departmentId: selectedDeptId || undefined,
        appointmentDate,
        timeSlot: selectedSlot,
        reason,
      });

      setBookedAppointment(res.appointment);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment. Please check schedule availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDocId);

  // If successfully booked
  if (bookedAppointment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Confirmed Booking
            </span>
            <h1 className="text-2xl font-extrabold text-hospital-navy mt-2">
              Appointment Scheduled Successfully!
            </h1>
            <p className="text-slate-600 text-xs mt-1">
              Your appointment is recorded in the City Hospital Pune clinical roster.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Doctor:</span>
              <strong className="text-slate-900">
                Dr. {bookedAppointment.doctor?.user?.firstName} {bookedAppointment.doctor?.user?.lastName}
              </strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="text-slate-900 font-medium">{bookedAppointment.doctor?.department?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Date & Time:</span>
              <span className="text-slate-900 font-bold">
                {bookedAppointment.appointmentDate} at {bookedAppointment.timeSlot}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Consultation Room:</span>
              <span className="text-slate-900 font-medium">{bookedAppointment.doctor?.roomNumber || 'OPD'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                {bookedAppointment.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/patient/appointments"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-colors"
            >
              View in Patient Portal
            </Link>
            <button
              onClick={() => {
                setBookedAppointment(null);
                setReason('');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Outpatient Care
        </span>
        <h1 className="text-3xl font-extrabold text-hospital-navy mt-1">Book an OPD Appointment</h1>
        <p className="text-slate-600 text-sm mt-1">
          Select your specialty, choose an attending physician, and reserve an available consultation slot with instant conflict detection.
        </p>
      </div>

      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Patient Login Required:</strong> To associate your appointment with an ABHA-linked health record, please{' '}
            <Link to="/login" className="font-bold underline text-hospital-navy">
              Sign In
            </Link>{' '}
            or use the 1-click Demo Role Switcher at the top of the page.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Step 1: Specialty & Doctor */}
          <div>
            <h3 className="font-bold text-sm text-hospital-navy mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-hospital-navy text-white text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              Select Clinical Department & Specialist Doctor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinical Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedDocId('');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal bg-white"
                >
                  <option value="">All Departments</option>
                  {(Array.isArray(departments) ? departments : []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attending Physician
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal bg-white"
                >
                  <option value="">Select Doctor...</option>
                  {(Array.isArray(doctors) ? doctors : []).map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user.firstName} {d.user.lastName} ({d.specialization} - ₹{d.consultationFee})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDoctor && (
              <div className="mt-4 p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    Dr. {selectedDoctor.user.firstName} {selectedDoctor.user.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Room {selectedDoctor.roomNumber} • {selectedDoctor.qualifications}
                  </p>
                </div>
                <span className="font-extrabold text-sm text-hospital-teal">
                  ₹{selectedDoctor.consultationFee}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Step 2: Date & Slot */}
          <div>
            <h3 className="font-bold text-sm text-hospital-navy mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-hospital-navy text-white text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              Select Date and Time Slot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Selected Time Slot
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedSlot}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 font-medium"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Available Slots:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? 'bg-hospital-teal text-white shadow-sm ring-2 ring-hospital-teal/30'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Step 3: Reason for Visit */}
          <div>
            <h3 className="font-bold text-sm text-hospital-navy mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-hospital-navy text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              Reason for Consultation & Clinical Context
            </h3>

            <div>
              <textarea
                rows={3}
                placeholder="Briefly describe your current symptoms or purpose of consultation (e.g. follow-up for hypertension, persistent cough for 4 days, joint stiffness)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/doctors"
            className="text-xs text-slate-500 hover:text-hospital-navy font-medium"
          >
            ← Back to Doctor Directory
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-lg shadow-hospital-teal/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Confirming with Doctor Schedule...' : 'Confirm Appointment Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};
