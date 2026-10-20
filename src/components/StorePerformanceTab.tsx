import React, { useState, useMemo } from 'react';
import { Visit, StoreInfo, ComparisonMode } from '../types';
import {
  computeMetrics,
  formatNumber,
  formatPct,
} from '../metrics';
import { StoreDetailDrawer } from './StoreDetailDrawer';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StorePerformanceTabProps {
  stores: StoreInfo[];
  currentVisits: Visit[];
  prevVisits: Visit[];
  comparisonMode: ComparisonMode;
}

type SortField =
  | 'name'
  | 's'
  | 'selectionRate'
  | 'positiveSentimentRate'
  | 'g'
  | 'r'
  | 'conversionRate'
  | 'fb';

export const StorePerformanceTab: React.FC<StorePerformanceTabProps> = ({
  stores,
  currentVisits,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'top' | 'low'>('all');
  const [sortField, setSortField] = useState<SortField>('conversionRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);

  // Compute metrics per store
  const storeRows = useMemo(() => {
    // 1. Group current visits by store
    const currMap = new Map<string, Visit[]>();

    stores.forEach(s => {
      currMap.set(s.name, []);
    });

    currentVisits.forEach(v => {
      if (currMap.has(v.storeName)) {
        currMap.get(v.storeName)!.push(v);
      }
    });

    // 2. Build rows with metrics
    const rows = stores.map(store => {
      const cVis = currMap.get(store.name) || [];
      const currM = computeMetrics(cVis);

      return {
        store,
        name: store.name,
        city: store.city,
        state: store.state,
        s: currM.s,
        sel: currM.sel,
        p: currM.p,
        ng: currM.ng,
        g: currM.g,
        r: currM.r,
        fb: currM.fb,
        selectionRate: currM.selectionRate,
        positiveSentimentRate: currM.positiveSentimentRate,
        proceedRate: currM.proceedRate,
        conversionRate: currM.conversionRate,
      };
    });

    // 3. Determine top 25% and bottom 25% thresholds by conversion
    const sortedByConv = [...rows].sort((a, b) => b.conversionRate - a.conversionRate);
    const topThresholdIndex = Math.floor(rows.length * 0.25);
    const lowThresholdIndex = Math.floor(rows.length * 0.75);

    const topCutoff = sortedByConv[topThresholdIndex]?.conversionRate ?? 60;
    const lowCutoff = sortedByConv[lowThresholdIndex]?.conversionRate ?? 30;

    return rows.map(r => ({
      ...r,
      badge:
        r.conversionRate >= topCutoff
          ? ('TOP' as const)
          : r.conversionRate <= lowCutoff
          ? ('LOW' as const)
          : null,
    }));
  }, [stores, currentVisits]);

  // Filtering
  const filteredRows = useMemo(() => {
    let list = storeRows;

    if (tierFilter === 'top') {
      list = list.filter(r => r.badge === 'TOP');
    } else if (tierFilter === 'low') {
      list = list.filter(r => r.badge === 'LOW');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q)
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = -9999;
      if (valB === null || valB === undefined) valB = -9999;

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [storeRows, tierFilter, searchTerm, sortField, sortDirection]);

  // Pagination (15 rows per page as specified)
  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export Store Performance Table to Excel without avg time and change
  const handleExportTable = () => {
    const dataToExport = filteredRows.map(row => ({
      'Store Name': row.name,
      'City': row.city,
      'State': row.state,
      'Tier Badge': row.badge || 'MID',
      'QR Scans (S)': row.s,
      'Selection Rate': `${row.selectionRate.toFixed(1)}%`,
      'Positive Sentiment': `${row.positiveSentimentRate.toFixed(1)}%`,
      'Proceeded to Google (G)': row.g,
      'Reviews Generated (R)': row.r,
      'Conversion (R ÷ S)': `${row.conversionRate.toFixed(1)}%`,
      'Negative Feedback': row.fb,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Performance');
    XLSX.writeFile(wb, `company_store_performance_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 pt-6">
      {/* Toolbar: Search box, All/Top/Low segmented filter, Download */}
      <div className="bg-white rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Search box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search store name, city, state..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#14B8C4]"
          />
        </div>

        {/* Right: Segmented filter All/Top/Low + Download button */}
        <div className="flex items-center gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold text-slate-600">
            <button
              onClick={() => {
                setTierFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                tierFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({storeRows.length})
            </button>
            <button
              onClick={() => {
                setTierFilter('top');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                tierFilter === 'top'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Top Outlets
            </button>
            <button
              onClick={() => {
                setTierFilter('low');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                tierFilter === 'low'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Needs Attention
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleExportTable}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            title="Download store performance table as Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table</span>
          </button>
        </div>
      </div>

      {/* Full-width Sortable Table */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider text-[11px] uppercase border-b border-slate-200 sticky top-0 z-10 select-none">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Store</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('s')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>QR Scans</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('selectionRate')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selection</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('positiveSentimentRate')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Positive</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('g')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Proceeded</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('r')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Reviews</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('conversionRate')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Conversion (R ÷ S)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fb')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Negative Feedback</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length > 0 ? (
                paginatedRows.map(row => (
                  <tr
                    key={row.name}
                    onClick={() => setSelectedStore(row.store)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Store Name + City + TOP/LOW badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900 max-w-[180px] truncate">
                          {row.name}
                        </div>
                        {row.badge === 'TOP' && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase">
                            TOP
                          </span>
                        )}
                        {row.badge === 'LOW' && (
                          <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded uppercase">
                            LOW
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {row.city}, {row.state}
                      </div>
                    </td>

                    {/* QR Scans (S) */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {formatNumber(row.s)}
                    </td>

                    {/* Selection Rate */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatPct(row.selectionRate)}
                    </td>

                    {/* Positive Sentiment */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatPct(row.positiveSentimentRate)}
                    </td>

                    {/* Proceeded to Google */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatNumber(row.g)}
                    </td>

                    {/* Reviews Generated (R) */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {formatNumber(row.r)}
                    </td>

                    {/* Conversion with inline mini bar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 w-12 text-right">
                          {formatPct(row.conversionRate)}
                        </span>
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.conversionRate >= 60
                                ? 'bg-emerald-500'
                                : row.conversionRate >= 35
                                ? 'bg-[#14B8C4]'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(3, row.conversionRate))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Negative Feedback */}
                    <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                      {formatNumber(row.fb)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No store records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredRows.length)} of{' '}
              {filteredRows.length} outlets
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Store Detail Drawer on row click */}
      {selectedStore && (
        <StoreDetailDrawer
          store={selectedStore}
          visits={currentVisits}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
};
