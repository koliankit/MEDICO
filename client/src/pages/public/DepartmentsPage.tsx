import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Department } from '../../types';
import { Building2, Stethoscope, ArrowRight, HeartPulse, Brain, Bone, Baby, Wind, ShieldAlert } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.departments.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentIcon = (code: string) => {
    switch (code) {
      case 'CARDIO':
        return <HeartPulse className="w-6 h-6 text-red-500" />;
      case 'NEURO':
        return <Brain className="w-6 h-6 text-indigo-500" />;
      case 'ORTHO':
        return <Bone className="w-6 h-6 text-amber-500" />;
      case 'PEDIATRICS':
        return <Baby className="w-6 h-6 text-pink-500" />;
      case 'PULMO':
        return <Wind className="w-6 h-6 text-cyan-500" />;
      default:
        return <Stethoscope className="w-6 h-6 text-hospital-teal" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Clinical Excellence
        </span>
        <h1 className="text-3xl font-extrabold text-hospital-navy mt-1">Medical Departments & Centers</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Comprehensive outpatient and inpatient specialties staffed by board-certified consultants and diagnostic infrastructure.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(departments) ? departments : []).map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getDepartmentIcon(dept.code)}
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                    {dept.floor}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{dept.name}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">{dept.description}</p>

                {dept.doctors && dept.doctors.length > 0 && (
                  <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Attending Doctors
                    </span>
                    {dept.doctors.map((d) => (
                      <p key={d.id} className="text-xs font-medium text-slate-800">
                        • Dr. {d.user.firstName} {d.user.lastName} ({d.specialization})
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {dept.doctors?.length || 1} Clinicians on duty
                </span>
                <Link
                  to={`/book?department=${dept.id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm flex items-center gap-1 transition-colors"
                >
                  Book OPD Slot <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
