import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  ShieldAlert,
  SearchCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PrintableReportModal } from '../components/PrintableReportModal';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

export const ReportsAnalysisPage = () => {
  const { addToast } = useApp();

  const [reports, setReports] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(selectedType === 'all' ? null : selectedType);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      addToast('Error fetching reports repository', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedType]);

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-safety-600" />;
      case 'structural':
        return <SearchCheck className="w-4 h-4 text-blue-600" />;
      case 'valuation':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-1">
            <FileBarChart className="w-3.5 h-3.5 text-safety-600" />
            <span>Inspection Archive & Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reports & Analysis Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized document register for safety audits, forensic crack scans, econometric valuations, and master plans.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or site..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-safety-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-safety-500 font-medium cursor-pointer"
          >
            <option value="all">All Report Types</option>
            <option value="safety">Safety Inspections</option>
            <option value="structural">Structural Forensics</option>
            <option value="valuation">Property Valuations</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Generated Documents ({filteredReports.length})
          </span>
          <span className="text-[11px] text-slate-400">PDF Print & JSON Export Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold bg-slate-50/60">
                <th className="py-3 px-4">Doc ID</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Subject & Scope</th>
                <th className="py-3 px-4">Rating / Status</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {report.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(report.type)}
                        <span className="capitalize font-semibold text-slate-900">{report.type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[280px]">
                        {report.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                        {report.subtitle}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.risk_or_status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {report.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {report.created_at.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewingReport(report.data || report)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DemoDisclaimer
        title="Document Archival Disclosure"
        text="All generated reports are stored persistently in the platform's local SQLite database. Simulated mode flags are explicitly stamped on all printed headers."
      />

      {/* Detail & Print Modal */}
      <PrintableReportModal
        report={viewingReport}
        isOpen={Boolean(viewingReport)}
        onClose={() => setViewingReport(null)}
      />
    </div>
  );
};
