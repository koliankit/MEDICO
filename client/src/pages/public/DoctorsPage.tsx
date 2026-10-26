import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Doctor, Department } from '../../types';
import { Search, Filter, Stethoscope, Calendar, Clock, MapPin, Award } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>(searchParams.get('department') || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptList, docList] = await Promise.all([
        api.departments.getAll(),
        api.doctors.getAll(selectedDept || undefined),
      ]);
      setDepartments(deptList);
      setDoctors(docList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.user.firstName} ${doc.user.lastName}`.toLowerCase();
    const spec = doc.specialization.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || spec.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Clinical Roster
        </span>
        <h1 className="text-3xl font-extrabold text-hospital-navy mt-1">Verified Doctor Directory</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Consult board-certified medical faculty across all hospital departments. Check OPD schedules and book consultations directly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor name or clinical specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-64 py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-teal/20 focus:border-hospital-teal bg-white"
          >
            <option value="">All Clinical Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading doctor profiles...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No doctors match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the department filter or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            let availabilityList: string[] = [];
            try {
              if (doc.availability) {
                availabilityList = JSON.parse(doc.availability);
              }
            } catch (e) {}

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-hospital-navy text-white font-extrabold flex items-center justify-center text-base shadow-md shrink-0">
                      Dr.
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        Dr. {doc.user.firstName} {doc.user.lastName}
                      </h3>
                      <p className="text-xs font-semibold text-hospital-teal">
                        {doc.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500">{doc.department?.name}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        MCI Reg: {doc.licenseNumber}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs mb-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Award className="w-3.5 h-3.5 text-hospital-teal shrink-0" />
                      <span>{doc.qualifications} ({doc.experienceYears} Years Exp)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-hospital-teal shrink-0" />
                      <span>Consultation Room: {doc.roomNumber}</span>
                    </div>
                    {availabilityList.length > 0 && (
                      <div className="flex items-start gap-2 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-hospital-teal shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-600">
                          OPD: {availabilityList.slice(0, 2).join(' | ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">
                    {doc.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">OPD Consultation</span>
                    <span className="font-extrabold text-slate-900 text-base">₹{doc.consultationFee}</span>
                  </div>
                  <Link
                    to={`/book?doctor=${doc.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book OPD Slot
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
