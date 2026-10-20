import React, { useState, useMemo } from 'react';
import { Visit, MetricSummary, ComparisonMode } from '../types';
import {
  formatNumber,
  formatPct,
  formatCountChange,
} from '../metrics';
import { KpiCard } from './KpiCard';
import { NEGATIVE_KEYWORDS } from '../mockData';
import {
  Frown,
  Inbox,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
} from 'lucide-react';

interface NegativeFeedbackTabProps {
  metrics: MetricSummary;
  prevMetrics: MetricSummary | null;
  comparisonMode: ComparisonMode;
  visits: Visit[];
}

export const NegativeFeedbackTab: React.FC<NegativeFeedbackTabProps> = ({
  metrics,
  prevMetrics,
  comparisonMode,
  visits,
}) => {
  const periodLabel = comparisonMode === 'MoM' ? 'M-o-M' : 'Y-o-Y';

  // Filters for Feedback Inbox
  const [keywordFilter, setKeywordFilter] = useState('All');
  const [storeFilter, setStoreFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});

  const togglePhoneReveal = (id: string) => {
    setRevealedPhones(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const maskPhone = (phone: string | null) => {
    if (!phone) return '—';
    if (phone.length < 10) return phone;
    return `${phone.slice(0, 2)}XXXXXX${phone.slice(-2)}`;
  };

  // 1. Top Issues Ranked List
  const topIssues = useMemo(() => {
    const negVisits = visits.filter(v => v.sentiment === 'negative');
    const totalNegFeedback = metrics.fb || 1;

    return NEGATIVE_KEYWORDS.map(kw => {
      const count = negVisits.filter(v => v.keywords.includes(kw)).length;
      const pct = Math.round((count / totalNegFeedback) * 1000) / 10;
      return {
        keyword: kw,
        count,
        pct,
      };
    }).sort((a, b) => b.count - a.count);
  }, [visits, metrics.fb]);

  // 2. Issues by Store (Top 10 Stores with most negative feedback)
  const storeIssuesData = useMemo(() => {
    const storeMap = new Map<string, { storeName: string; totalNeg: number; counts: Record<string, number> }>();

    visits
      .filter(v => v.sentiment === 'negative')
      .forEach(v => {
        if (!storeMap.has(v.storeName)) {
          storeMap.set(v.storeName, {
            storeName: v.storeName,
            totalNeg: 0,
            counts: {
              'Staff Support': 0,
              'Waiting Time': 0,
              'Interest & EMI': 0,
              'Loan Approval': 0,
              'Process / Documentation': 0,
              Others: 0,
            },
          });
        }
        const record = storeMap.get(v.storeName)!;
        record.totalNeg += 1;
        v.keywords.forEach(kw => {
          if (record.counts[kw] !== undefined) {
            record.counts[kw] += 1;
          } else {
            record.counts['Others'] += 1;
          }
        });
      });

    return Array.from(storeMap.values())
      .sort((a, b) => b.totalNeg - a.totalNeg)
      .slice(0, 10);
  }, [visits]);

  // 3. Feedback Inbox List
  const filteredInbox = useMemo(() => {
    let list = visits.filter(
      v => v.sentiment === 'negative' && (v.negativeFeedback !== null || v.keywords.length > 0)
    );

    if (keywordFilter !== 'All') {
      list = list.filter(v => v.keywords.includes(keywordFilter));
    }
    if (storeFilter !== 'All') {
      list = list.filter(v => v.storeName === storeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        v =>
          v.storeName.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.negativeFeedback?.toLowerCase().includes(q) ||
          v.contactName?.toLowerCase().includes(q) ||
          v.phoneNumber?.includes(q)
      );
    }

    return list.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }, [visits, keywordFilter, storeFilter, searchQuery]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredInbox.length / itemsPerPage));
  const paginatedInbox = filteredInbox.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Unique stores for filter dropdown
  const uniqueNegativeStores = useMemo(() => {
    const set = new Set<string>();
    visits.filter(v => v.sentiment === 'negative').forEach(v => set.add(v.storeName));
    return Array.from(set).sort();
  }, [visits]);

  return (
    <div className="space-y-6 pt-6">
      {/* 2 Tiles: Negative Selections & Feedback Received */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Negative Selections (Ng) */}
        <KpiCard
          label="NEGATIVE SELECTIONS"
          value={formatNumber(metrics.ng)}
          changeChip={formatCountChange(
            metrics.ng,
            prevMetrics ? prevMetrics.ng : null,
            periodLabel
          )}
          contextLine={`${formatPct(
            metrics.sel === 0 ? 0 : (metrics.ng / metrics.sel) * 100
          )} of sentiment selections`}
          formulaTooltip="Visits where customer chose Negative sentiment."
          icon={<Frown className="w-4 h-4 text-rose-600" />}
          iconBgColor="bg-rose-100 text-rose-600"
        />

        {/* 2. Feedback Received (Fb) */}
        <KpiCard
          label="FEEDBACK RECEIVED"
          value={formatNumber(metrics.fb)}
          changeChip={formatCountChange(
            metrics.fb,
            prevMetrics ? prevMetrics.fb : null,
            periodLabel
          )}
          contextLine={`Feedback Rate ${formatPct(metrics.feedbackRate)}`}
          formulaTooltip="Negative visits where private customer feedback form was submitted (Fb ÷ Ng)."
          icon={<Inbox className="w-4 h-4 text-indigo-600" />}
          iconBgColor="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* 2-Column: Top Issues Ranked & Matrix by Store */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues Ranked List */}
        <div className="bg-white rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top Negative Issues
              </h3>
              <p className="text-xs text-slate-500">
                Ranked breakdown of complaint categories submitted
              </p>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
              {metrics.fb} submissions
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {topIssues.map(issue => (
              <div key={issue.keyword} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{issue.keyword}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-slate-900">{issue.count}</span>
                    <span className="text-rose-600 font-semibold">({issue.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(3, issue.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues by Store Table (Top 10 Stores Heatmap) */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Issues by Store (Top 10 Outlets)
                </h3>
                <p className="text-xs text-slate-500">
                  Outlets with highest internal private feedback volume
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                    <th className="pb-2">Store</th>
                    <th className="pb-2 text-center">Wait</th>
                    <th className="pb-2 text-center">Staff</th>
                    <th className="pb-2 text-center">Int/EMI</th>
                    <th className="pb-2 text-center">Docs</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {storeIssuesData.map(st => (
                    <tr key={st.storeName} className="hover:bg-slate-50/60">
                      <td className="py-2 font-semibold text-slate-800 max-w-[140px] truncate">
                        {st.storeName}
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            st.counts['Waiting Time'] > 2
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {st.counts['Waiting Time']}
                        </span>
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            st.counts['Staff Support'] > 2
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {st.counts['Staff Support']}
                        </span>
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span className="text-slate-600">{st.counts['Interest & EMI']}</span>
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span className="text-slate-600">{st.counts['Process / Documentation']}</span>
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">
                        {st.totalNeg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 font-medium">
            🔒 All complaints resolved internally before escalating to Google.
          </div>
        </div>
      </div>

      {/* 3. Feedback Inbox List */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Private Feedback Inbox
            </h3>
            <p className="text-xs text-slate-500">
              Direct customer complaints with contact details for service recovery
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Store Filter */}
            <select
              value={storeFilter}
              onChange={e => {
                setStoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Stores</option>
              {uniqueNegativeStores.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Keyword Filter */}
            <select
              value={keywordFilter}
              onChange={e => {
                setKeywordFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Issues</option>
              {NEGATIVE_KEYWORDS.map(kw => (
                <option key={kw} value={kw}>
                  {kw}
                </option>
              ))}
            </select>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search complaint..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#14B8C4]"
              />
            </div>
          </div>
        </div>

        {/* Feedback List Table */}
        <div className="mt-4 divide-y divide-slate-100">
          {paginatedInbox.length > 0 ? (
            paginatedInbox.map(item => {
              const dateStr = new Date(item.scannedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const isRevealed = !!revealedPhones[item.id];

              return (
                <div key={item.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.storeName}
                      </span>
                      <span className="text-[11px] text-slate-400">· {item.city}</span>
                      <span className="text-[11px] text-slate-400">· {dateStr} IST</span>
                    </div>

                    {/* Customer contact pill */}
                    <div className="flex items-center gap-3 text-xs">
                      {item.contactName ? (
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.contactName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Anonymous</span>
                      )}

                      {item.phoneNumber && (
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-800">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>
                            {isRevealed ? item.phoneNumber : maskPhone(item.phoneNumber)}
                          </span>
                          <button
                            onClick={() => togglePhoneReveal(item.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title={isRevealed ? 'Hide phone' : 'Reveal phone'}
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Keywords Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.map(kw => (
                      <span
                        key={kw}
                        className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Complaint Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    {item.negativeFeedback || 'Customer selected negative rating without additional comment.'}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No negative feedback found matching selected filters
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
