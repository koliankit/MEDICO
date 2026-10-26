import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, User, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [address, setAddress] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.patients.getMe();
      setProfile(data);
      setPhone(data.user?.phone || '');
      setEmergencyName(data.emergencyContactName || '');
      setEmergencyPhone(data.emergencyContactPhone || '');
      setAddress(data.address || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMsg(null);
    try {
      await api.patients.updateMe({
        phone,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        address,
      });
      setStatusMsg('Contact and emergency details updated successfully.');
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading patient profile...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Account & Privacy
        </span>
        <h1 className="text-2xl font-black text-hospital-navy mt-0.5">Patient Profile & Consent</h1>
        <p className="text-xs text-slate-500">
          Manage your verified demographic record, emergency contacts, and statutory data processing consents under DPDP Act 2023.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Demographic Overview Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verified Patient ID
            </span>
            <h2 className="text-xl font-extrabold text-hospital-navy font-mono">
              {profile?.patientId}
            </h2>
          </div>
          {profile?.abhaId && (
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ABHA ID
              </span>
              <p className="text-xs font-mono font-bold text-hospital-teal">{profile.abhaId}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Full Name</span>
            <strong className="text-slate-900">{profile?.user?.firstName} {profile?.user?.lastName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Date of Birth</span>
            <strong className="text-slate-900">{profile?.dateOfBirth}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Gender</span>
            <strong className="text-slate-900">{profile?.gender}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Blood Group</span>
            <strong className="text-slate-900 font-bold text-red-600">{profile?.bloodGroup}</strong>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-hospital-teal">
            Update Permissible Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm transition-colors"
          >
            {isUpdating ? 'Saving...' : 'Save Contact Updates'}
          </button>
        </form>
      </div>

      {/* DPDP Act 2023 Consent Records */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-hospital-navy font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Statutory Consent Ledger (DPDP Act 2023 / ABDM India)</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The Digital Personal Data Protection Act requires purpose-specific consent for every category of personal health data processing.
        </p>

        <div className="divide-y divide-slate-100 text-xs">
          {profile?.consentRecords?.map((c: any) => (
            <div key={c.id} className="py-3 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block">{c.consentType}</strong>
                <span className="text-[10px] text-slate-400">
                  Granted: {new Date(c.grantedAt).toLocaleString()}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE CONSENT
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
