import React, { useState } from 'react';
import {
  ShieldAlert,
  HardHat,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Clock,
  MapPin,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { ImageUploadZone } from '../components/ImageUploadZone';
import { StatusBadge } from '../components/StatusBadge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { PrintableReportModal } from '../components/PrintableReportModal';

export const SafetyMonitoringPage = () => {
  const { addToast } = useApp();

  const [projectName, setProjectName] = useState('Skyline Heights Tower C');
  const [siteLocation, setSiteLocation] = useState('Level 18 Perimeter Scaffold Bay 3');
  const [category, setCategory] = useState('Scaffolding & Working at Heights');
  const [inspectorNotes, setInspectorNotes] = useState('Morning safety walk audit. Verifying guardrail integrity, mid-rail installation, and 100% harness hookup.');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const categories = [
    'Scaffolding & Working at Heights',
    'Excavation & Trenching',
    'PPE Compliance & Worker Visibility',
    'Electrical & Power Distribution',
    'Heavy Machinery & Crane Operations',
    'Housekeeping & Slip/Trip Hazards'
  ];

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSampleSelected = (sample) => {
    setSelectedFile(null); // using sample image URL
    setPreviewUrl(sample.url);
    if (sample.type) setCategory(sample.type);
    if (sample.suggestedNotes) setInspectorNotes(sample.suggestedNotes);
    addToast(`Loaded sample inspection: ${sample.name}`, 'info');
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      addToast('Please enter a project name.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('project_name', projectName);
      formData.append('site_location', siteLocation);
      formData.append('category', category);
      formData.append('inspector_notes', inspectorNotes);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await api.analyzeSafety(formData);
      setResult(res);
      addToast(`Safety audit analyzed: ${res.risk_level.toUpperCase()} risk detected.`, 'success');
    } catch (err) {
      console.error('Safety scan error:', err);
      addToast(err.message || 'Error processing safety audit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Computer Vision & OSHA 1926 Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Construction Safety Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload site imagery to identify hazard precursors, evaluate risk categories, and generate corrective action plans.
          </p>
        </div>

        {result && (
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official Report</span>
          </button>
        )}
      </div>

      {/* Main Grid: Form + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 5 Columns on Desktop */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Inspection Parameters</h2>
            <p className="text-xs text-slate-500">Specify site details and upload inspection photograph</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Site Inspection Photograph
              </label>
              <ImageUploadZone
                onImageSelected={handleImageSelected}
                onSampleSelected={handleSampleSelected}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onClear={handleClearImage}
                sampleCategory="safety"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Skyline Heights Tower C"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              />
            </div>

            {/* Site Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Location / Grid Reference
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  placeholder="e.g. Level 18 East Perimeter, Column B4"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Safety Inspection Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              >
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspector Field Notes
              </label>
              <textarea
                rows={3}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Specific details regarding weather, crew, equipment observed..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-safety-600 hover:bg-safety-500 text-white font-semibold text-xs shadow-md shadow-safety-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Site Hazards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Safety Intelligence Scan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: 7 Columns */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6 animate-in fade-in duration-200">
              {/* Header Status & Risk Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">ID: {result.id}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{result.timestamp.slice(0, 16).replace('T', ' ')} UTC</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{result.category}</h3>
                  <p className="text-xs text-slate-500">{result.site_location} ({result.project_name})</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">Calculated Risk:</span>
                  <StatusBadge status={result.risk_level} size="md" />
                </div>
              </div>

              {/* Mode & Professional Verification Disclaimer Banner */}
              <DemoDisclaimer
                mode={result.mode}
                title={result.mode === 'demo' ? 'Simulated Safety Analysis Result' : 'AI Multimodal Vision Analysis'}
                text={result.disclaimer}
              />

              {/* Observations List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Detected Safety Observations ({result.observations.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">OSHA 1926 Protocol</span>
                </div>

                <div className="space-y-2.5">
                  {result.observations.map((obs, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-slate-900">{obs.title}</div>
                        <StatusBadge status={obs.severity} size="xs" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {obs.description}
                      </p>
                      {obs.location_hint && (
                        <div className="mt-2 text-[11px] font-medium text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Spatial Reference: {obs.location_hint}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hazards Checklist */}
              {result.hazards && result.hazards.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Potential Secondary Hazards
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {result.hazards.map((h, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 bg-rose-50/60 border border-rose-100 p-2.5 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mandatory Corrective Actions
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-slate-800 bg-emerald-50/60 border border-emerald-100 p-3 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested PPE */}
              {result.ppe_required && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <HardHat className="w-4 h-4 text-safety-600" />
                    <span>Mandatory PPE Checklist for Work Area</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.ppe_required.map((ppe, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                      >
                        <Check className="w-3 h-3 text-safety-600" />
                        <span>{ppe}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Print CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need an official site audit copy?</span>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-safety-600 hover:text-safety-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Preview & Print Sign-off Document &rarr;</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-safety-50 text-safety-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Awaiting Safety Inspection Submission</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Fill in the site details on the left, select an inspection category, or try one of the 1-click sample images to generate a comprehensive safety assessment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Modal */}
      <PrintableReportModal
        report={result}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
