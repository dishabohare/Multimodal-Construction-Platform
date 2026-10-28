import React from 'react';
import { X, Printer, Download, ShieldCheck, HardHat, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const PrintableReportModal = ({ report, isOpen, onClose }) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.id || 'report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header toolbar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-safety-600" />
            <h3 className="font-semibold text-slate-800">Official Report View</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-800 print-card">
          {/* Document Header */}
          <div className="border-b border-slate-300 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-navy-900 text-safety-500 font-extrabold flex items-center justify-center text-lg">
                    B
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-navy-950 tracking-tight">BUILDMIND AI</h1>
                    <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Multimodal Construction Intelligence</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs uppercase font-semibold text-slate-400">Document Type</span>
                  <h2 className="text-lg font-bold text-slate-900 capitalize">
                    {report.type ? `${report.type} Assessment Report` : (report.analysis_type ? `${report.analysis_type} Report` : 'Property Valuation Summary')}
                  </h2>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                  DOC ID: {report.id}
                </div>
                <div className="text-xs text-slate-500">
                  Date: {report.timestamp ? report.timestamp.slice(0, 10) : (report.created_at ? report.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10))}
                </div>
                <div>
                  <StatusBadge status={report.risk_level || report.severity || report.risk_or_status || 'VERIFIED'} />
                </div>
              </div>
            </div>
          </div>

          {/* Project & Scope Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Project Name</span>
              <div className="font-semibold text-slate-800">{report.project_name || report.location || 'Commercial Tower'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Location / Area</span>
              <div className="font-semibold text-slate-800">{report.site_location || report.location_element || report.location || 'Metro Site'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Category / Element</span>
              <div className="font-semibold text-slate-800">{report.category || report.structure_type || report.property_type || 'General'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Mode</span>
              <div className="font-semibold uppercase tracking-wider text-purple-700">{report.mode || 'Demo'}</div>
            </div>
          </div>

          {/* Observations */}
          {report.observations && report.observations.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Findings & Observations</h4>
              <div className="space-y-2">
                {report.observations.map((obs, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">{obs.title}</span>
                      <StatusBadge status={obs.severity} size="xs" />
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{obs.description}</p>
                    {obs.location_hint && (
                      <span className="mt-1 inline-block text-[11px] text-slate-400">Location: {obs.location_hint}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Hazards & Corrective Actions */}
          {report.hazards && report.hazards.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Identified Hazards</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {report.hazards.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Mandatory Corrective Actions</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="leading-relaxed">{rec}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Structural next steps */}
          {report.suggested_next_steps && report.suggested_next_steps.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Suggested Next Steps (PE Structural)</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {report.suggested_next_steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>
          )}

          {/* PPE required */}
          {report.ppe_required && report.ppe_required.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Mandatory PPE Checklist</h4>
              <div className="flex flex-wrap gap-2">
                {report.ppe_required.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Valuation Details */}
          {report.estimated_avg_price && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Modeled Valuation Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400">Min Estimate</span>
                  <div className="text-base font-bold text-slate-800">${report.estimated_min_price?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border-2 border-safety-500">
                  <span className="text-xs text-safety-600 font-semibold">Average Value</span>
                  <div className="text-lg font-extrabold text-navy-950">${report.estimated_avg_price?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400">Max Estimate</span>
                  <div className="text-base font-bold text-slate-800">${report.estimated_max_price?.toLocaleString()}</div>
                </div>
              </div>
              <p className="text-xs text-slate-600">{report.property_summary}</p>
            </div>
          )}

          {/* Official Sign-off and Legal Disclaimer */}
          <div className="border-t border-slate-300 pt-4 text-xs space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              <span className="font-bold">LEGAL & REGULATORY DISCLAIMER: </span>
              {report.disclaimer || (
                "This document is an AI-assisted preliminary engineering observation. It does not replace certified on-site professional inspections by licensed structural engineers or OSHA safety officials."
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="border-t border-dashed border-slate-400 pt-2 text-slate-500">
                <span>Site Safety Officer / Professional Engineer Signature</span>
              </div>
              <div className="border-t border-dashed border-slate-400 pt-2 text-slate-500">
                <span>Project Superintendent / General Contractor Acceptance</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
