import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HealthArticle } from '../../types';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Search, Filter } from 'lucide-react';

export const EducationPage: React.FC = () => {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await api.education.getArticles();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const safeArticles = Array.isArray(articles) ? articles : [];
  const categories = ['ALL', ...Array.from(new Set(safeArticles.map((a) => a.category)))];

  const filtered = categoryFilter === 'ALL'
    ? safeArticles
    : safeArticles.filter((a) => a.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-hospital-teal font-extrabold text-xs uppercase tracking-wider">
          Evidence-Based Patient Knowledge
        </span>
        <h1 className="text-3xl font-extrabold text-hospital-navy mt-1">
          Health Education & Clinical References
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          Curated medical education grounded in clinical guidance from the World Health Organization (WHO), Ministry of Health and Family Welfare (Govt. of India), Ayushman Bharat Digital Mission (ABDM), MedlinePlus (NIH), and the NHS.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-hospital-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Guides' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading educational library...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-hospital-teal bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{art.reviewStatus}</span>
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {art.title}
                </h2>

                <p className="text-slate-600 text-xs leading-relaxed">{art.summary}</p>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Key Clinical Guidance:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {art.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-hospital-teal shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Source Organization</span>
                  <span className="font-bold text-slate-800 text-xs">{art.sourceOrganization}</span>
                </div>

                <a
                  href={art.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-hospital-teal hover:text-white hover:bg-hospital-teal border border-hospital-teal/30 flex items-center gap-1.5 transition-all"
                >
                  Read Source Publication <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
