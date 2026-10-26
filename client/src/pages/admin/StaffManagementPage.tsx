import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Plus, ShieldCheck, Mail, Phone, Award, Building2 } from 'lucide-react';

export const StaffManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Add staff modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123',
    role: 'DOCTOR',
    phone: '+91 98220 00000',
    departmentId: '',
    specialization: 'Clinical Specialist',
    qualifications: 'MBBS, MD',
    licenseNumber: `MCI-MH-${Math.floor(10000 + Math.random() * 90000)}`,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      const [userList, deptList] = await Promise.all([
        api.admin.getUsers(roleFilter === 'ALL' ? undefined : roleFilter),
        api.departments.getAll(),
      ]);
      setUsers(userList);
      setDepartments(deptList);
      if (deptList.length > 0 && !newStaff.departmentId) {
        setNewStaff((prev) => ({ ...prev, departmentId: deptList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.admin.createUser(newStaff);
      alert(`Staff user ${newStaff.email} created successfully.`);
      setShowAddModal(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
            Hospital Administration
          </span>
          <h1 className="text-2xl font-black text-hospital-navy mt-0.5">Staff & User Management</h1>
          <p className="text-xs text-slate-500">
            Manage authenticated clinicians, nursing personnel, laboratory technicians, and administrators.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Staff Member
        </button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'DOCTOR', 'NURSE', 'LAB_STAFF', 'RECEPTIONIST', 'ADMIN', 'PATIENT'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              roleFilter === r
                ? 'bg-hospital-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {r === 'ALL' ? 'All Roles' : r}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user roster...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users found for this role.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Clinical Department / ID</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4 text-slate-500">{u.phone || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.doctorProfile?.department?.name || u.patientProfile?.patientId || 'General Staff'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-hospital-navy">Add New Hospital Staff</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.lastName}
                    onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Email *</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="e.g. dr.name@cityhospitalpune.org"
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Role *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="DOCTOR">Doctor (Attending Physician)</option>
                  <option value="NURSE">Nurse (Triage & Ward)</option>
                  <option value="LAB_STAFF">Laboratory Specialist</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="ADMIN">Hospital Administrator</option>
                </select>
              </div>

              {newStaff.role === 'DOCTOR' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Clinical Department</label>
                    <select
                      value={newStaff.departmentId}
                      onChange={(e) => setNewStaff({ ...newStaff, departmentId: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={newStaff.specialization}
                        onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
                      <input
                        type="text"
                        value={newStaff.qualifications}
                        onChange={(e) => setNewStaff({ ...newStaff, qualifications: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Create Staff User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
