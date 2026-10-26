import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditEvent } from '../../types';
import { ShieldCheck, Search, Filter, Clock, User, AlertCircle } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, roleFilter]);

  const loadAuditLogs = async () => {
    try {
      const data = await api.admin.getAuditLogs({
        action: actionFilter || undefined,
        role: roleFilter || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const details = (log.details || '').toLowerCase();
    const email = (log.userEmail || '').toLowerCase();
    return details.includes(term) || email.includes(term);
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'SIGN_OFF':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AI_REVIEW':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOGIN':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Compliance & Security
        </span>
        <h1 className="text-2xl font-black text-hospital-navy mt-0.5">Audit Trail & Forensic Logs</h1>
        <p className="text-xs text-slate-500">
          Immutable event log tracking record views, clinical document signing, AI assessment reviews, and authentication.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit details or user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full md:w-44 py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
          >
            <option value="">All Actions</option>
            <option value="SIGN_OFF">SIGN_OFF (Doctor/Lab)</option>
            <option value="AI_REVIEW">AI_REVIEW (Clinician)</option>
            <option value="CREATE">CREATE</option>
            <option value="VIEW">VIEW (Clinical Access)</option>
            <option value="LOGIN">LOGIN</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-44 py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
          >
            <option value="">All User Roles</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="NURSE">NURSE</option>
            <option value="LAB_STAFF">LAB_STAFF</option>
            <option value="PATIENT">PATIENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit events match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">
                      {log.userEmail || 'System'} ({log.userRole || 'ANON'})
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
