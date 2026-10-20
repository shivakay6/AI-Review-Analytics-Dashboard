import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PageHeader } from './components/PageHeader';
import { TabBar } from './components/TabBar';
import { OverviewTab } from './components/OverviewTab';
import { FunnelDropoffsTab } from './components/FunnelDropoffsTab';
import { PositiveReviewsTab } from './components/PositiveReviewsTab';
import { NegativeFeedbackTab } from './components/NegativeFeedbackTab';
import { StorePerformanceTab } from './components/StorePerformanceTab';
import { ManagerPerformanceTab } from './components/ManagerPerformanceTab';
import { ResponsesDrawer } from './components/ResponsesDrawer';
import { ALL_VISITS, STORES } from './mockData';
import { computeMetrics } from './metrics';
import { exportVisitsToExcel } from './utils/excelExport';
import {
  DateRangePreset,
  ComparisonMode,
  TabType,
  Visit,
} from './types';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isResponsesOpen, setIsResponsesOpen] = useState(false);

  // Store Selection: Default all 37 stores
  const [selectedStores, setSelectedStores] = useState<string[]>(() =>
    STORES.map(s => s.name)
  );

  // Date Range: Default 01/10/2026 – 31/10/2026
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  // Comparison Mode: Default 'MoM'
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('MoM');

  // Loading skeleton state (300ms on filter changes)
  const [isLoading, setIsLoading] = useState(false);

  // Trigger loading skeleton on filter change
  const triggerLoading = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleSelectDatePreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    triggerLoading();

    if (preset === 'this_month') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'last_month') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (preset === 'last_7_days') {
      setStartDate('2026-10-25');
      setEndDate('2026-10-31');
    } else if (preset === 'last_30_days') {
      setStartDate('2026-10-02');
      setEndDate('2026-10-31');
    } else if (preset === 'last_90_days') {
      setStartDate('2026-08-03');
      setEndDate('2026-10-31');
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setDatePreset('custom');
    setStartDate(start);
    setEndDate(end);
    triggerLoading();
  };

  const handleSelectStores = (stores: string[]) => {
    setSelectedStores(stores);
    triggerLoading();
  };

  const handleToggleComparisonMode = (mode: ComparisonMode) => {
    setComparisonMode(mode);
    triggerLoading();
  };

  // Helper date parsing (start at 00:00:00, end at 23:59:59)
  const parseRange = (s: string, e: string) => {
    const [sy, sm, sd] = s.split('-').map(Number);
    const [ey, em, ed] = e.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
    return { start, end };
  };

  // Current Filtered Visits
  const currentVisits = useMemo(() => {
    const { start, end } = parseRange(startDate, endDate);
    return ALL_VISITS.filter(v => {
      const matchStore = selectedStores.includes(v.storeName);
      const matchDate = v.scannedAt >= start && v.scannedAt <= end;
      return matchStore && matchDate;
    });
  }, [startDate, endDate, selectedStores]);

  // Comparison Visits
  const prevVisits = useMemo(() => {
    const { start, end } = parseRange(startDate, endDate);

    if (comparisonMode === 'YoY') {
      // 1 year prior (2025)
      const prevStart = new Date(start.getFullYear() - 1, start.getMonth(), start.getDate(), 0, 0, 0);
      const prevEnd = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate(), 23, 59, 59);

      const visits = ALL_VISITS.filter(v => {
        const matchStore = selectedStores.includes(v.storeName);
        const matchDate = v.scannedAt >= prevStart && v.scannedAt <= prevEnd;
        return matchStore && matchDate;
      });
      // As specified in prompt: show "—" chips when there is no data for last year
      return visits;
    } else {
      // MoM: same duration period immediately preceding start date
      const durationMs = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - durationMs);

      return ALL_VISITS.filter(v => {
        const matchStore = selectedStores.includes(v.storeName);
        const matchDate = v.scannedAt >= prevStart && v.scannedAt <= prevEnd;
        return matchStore && matchDate;
      });
    }
  }, [startDate, endDate, selectedStores, comparisonMode]);

  // Compute Metrics
  const currentMetrics = useMemo(() => computeMetrics(currentVisits), [currentVisits]);
  const prevMetrics = useMemo(() => {
    if (comparisonMode === 'YoY' && prevVisits.length === 0) {
      return null;
    }
    return computeMetrics(prevVisits);
  }, [prevVisits, comparisonMode]);

  // Store scan counts for the active date range (for store filter checklist display)
  const storeScanCounts = useMemo(() => {
    const { start, end } = parseRange(startDate, endDate);
    const map: Record<string, number> = {};
    STORES.forEach(s => {
      map[s.name] = 0;
    });
    ALL_VISITS.forEach(v => {
      if (v.scannedAt >= start && v.scannedAt <= end) {
        map[v.storeName] = (map[v.storeName] || 0) + 1;
      }
    });
    return map;
  }, [startDate, endDate]);

  // Active stores count in current visits
  const activeOutletsCount = useMemo(() => {
    const set = new Set(currentVisits.map(v => v.storeName));
    return set.size;
  }, [currentVisits]);

  // Store filter label
  const storeFilterLabel = useMemo(() => {
    if (selectedStores.length === STORES.length) return 'all-outlets';
    if (selectedStores.length === 1) return selectedStores[0];
    return `${selectedStores.length}-outlets`;
  }, [selectedStores]);

  // Excel Download Action
  const handleDownload = () => {
    const [sy, sm, sd] = startDate.split('-');
    const [ey, em, ed] = endDate.split('-');
    const sStr = `${sd}-${sm}-${sy}`;
    const eStr = `${ed}-${em}-${ey}`;
    exportVisitsToExcel(currentVisits, storeFilterLabel, sStr, eStr);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex text-slate-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar />

        {/* Page Body */}
        <main className="p-8 max-w-[1540px] w-full mx-auto">
          {/* Header */}
          <PageHeader
            totalOutletsCount={STORES.length}
            stores={STORES}
            selectedStores={selectedStores}
            onSelectStores={handleSelectStores}
            storeScanCounts={storeScanCounts}
            datePreset={datePreset}
            onSelectDatePreset={handleSelectDatePreset}
            startDate={startDate}
            endDate={endDate}
            onCustomDateChange={handleCustomDateChange}
            comparisonMode={comparisonMode}
            onToggleComparisonMode={handleToggleComparisonMode}
            onDownload={handleDownload}
          />

          {/* Tab Bar */}
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenResponses={() => setIsResponsesOpen(true)}
            totalScans={currentVisits.length}
          />

          {/* Content Loading Skeleton or Active Tab Content */}
          {isLoading ? (
            <div className="py-12 space-y-6 animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-32 bg-slate-200/70 rounded-xl" />
                ))}
              </div>
              <div className="h-96 bg-slate-200/70 rounded-xl" />
            </div>
          ) : currentVisits.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl shadow-xs mt-6 text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No data for this period
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                There are no recorded visits or QR scans for the selected outlets and date range. Please try selecting a different period or more outlets.
              </p>
              <button
                onClick={() => {
                  setSelectedStores(STORES.map(s => s.name));
                  handleSelectDatePreset('this_month');
                }}
                className="mt-4 px-4 py-2 bg-[#14B8C4] text-white text-xs font-bold rounded-lg hover:bg-[#0fa3ae] transition-colors"
              >
                Reset Filters to October 2026
              </button>
            </div>
          ) : (
            <div>
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <OverviewTab
                  currentMetrics={currentMetrics}
                  prevMetrics={prevMetrics}
                  comparisonMode={comparisonMode}
                  activeOutletsCount={activeOutletsCount}
                  currentVisits={currentVisits}
                  prevVisits={prevVisits}
                />
              )}

              {/* Tab 2: Funnel & Drop-offs */}
              {activeTab === 'dropoffs' && (
                <FunnelDropoffsTab
                  metrics={currentMetrics}
                  visits={currentVisits}
                />
              )}

              {/* Tab 3: Positive Reviews */}
              {activeTab === 'positive' && (
                <PositiveReviewsTab
                  metrics={currentMetrics}
                  prevMetrics={prevMetrics}
                  comparisonMode={comparisonMode}
                  visits={currentVisits}
                />
              )}

              {/* Tab 4: Negative Feedback */}
              {activeTab === 'negative' && (
                <NegativeFeedbackTab
                  metrics={currentMetrics}
                  prevMetrics={prevMetrics}
                  comparisonMode={comparisonMode}
                  visits={currentVisits}
                />
              )}

              {/* Tab 5: Store Performance */}
              {activeTab === 'stores' && (
                <StorePerformanceTab
                  stores={STORES}
                  currentVisits={currentVisits}
                  prevVisits={prevVisits}
                  comparisonMode={comparisonMode}
                />
              )}

              {/* Tab 6: Manager Performance */}
              {activeTab === 'managers' && (
                <ManagerPerformanceTab
                  stores={STORES}
                  currentVisits={currentVisits}
                  prevVisits={prevVisits}
                  comparisonMode={comparisonMode}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Responses Drawer */}
      <ResponsesDrawer
        isOpen={isResponsesOpen}
        onClose={() => setIsResponsesOpen(false)}
        visits={currentVisits}
        storeLabel={storeFilterLabel}
        dateRangeLabel={`${startDate} to ${endDate}`}
        onDownload={handleDownload}
      />
    </div>
  );
}
