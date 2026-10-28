import React, { useState, useEffect } from 'react';
import {
  SearchCheck,
  Building2,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  RefreshCw,
  Clock,
  Ruler,
  Layers,
  History,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { ImageUploadZone } from '../components/ImageUploadZone';
import { StatusBadge } from '../components/StatusBadge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { PrintableReportModal } from '../components/PrintableReportModal';

export const StructuralInspectionPage = () => {
  const { addToast } = useApp();

  const [projectName, setProjectName] = useState('Skyline Heights Tower C');
  const [structureType, setStructureType] = useState('Reinforced Concrete Transfer Beam');
  const [locationElement, setLocationElement] = useState('Level 4 Parking Ramp Column B-7 Support');
  const [inspectorNotes, setInspectorNotes] = useState('Observed 45-degree diagonal shear fissure post-shores removal. Monitoring dynamic crack displacement.');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const structureTypes = [
    'Reinforced Concrete Transfer Beam',
    'Cast-in-Place Column Core',
    'Basement Retaining Wall',
    'Suspended Slab Midspan',
    'Masonry Infill Wall',
    'Bridge Abutment / Pier'
  ];

  const fetchHistory = async () => {
    try {
      const data = await api.getStructuralInspections();
      setHistory(data);
    } catch (e) {
      console.warn('Could not load structural history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSampleSelected = (sample) => {
    setSelectedFile(null);
    setPreviewUrl(sample.url);
    if (sample.structure) setStructureType(sample.structure);
    if (sample.element) setLocationElement(sample.element);
    if (sample.suggestedNotes) setInspectorNotes(sample.suggestedNotes);
    addToast(`Loaded structural sample: ${sample.name}`, 'info');
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      addToast('Please enter project name.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('project_name', projectName);
      formData.append('structure_type', structureType);
      formData.append('location_element', locationElement);
      formData.append('inspector_notes', inspectorNotes);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await api.analyzeStructural(formData);
      setResult(res);
      addToast(`Structural assessment complete: ${res.severity.toUpperCase()} severity detected.`, 'success');
      fetchHistory();
    } catch (err) {
      console.error('Structural scan error:', err);
      addToast(err.message || 'Error executing structural inspection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
            <SearchCheck className="w-3.5 h-3.5" />
            <span>Forensic Computer Vision & Concrete Durability</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Crack Detection & Structural Inspection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify shear vs flexural cracking patterns, gauge estimated fissure widths, and generate PE testing protocols.
          </p>
        </div>

        {result && (
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Export PE Assessment</span>
          </button>
        )}
      </div>

      {/* Main Grid: Form (5) + Output (7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Structural Scan Parameters</h2>
            <p className="text-xs text-slate-500">Provide element structural context and fissure photo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Concrete Surface / Fissure Photograph
              </label>
              <ImageUploadZone
                onImageSelected={handleImageSelected}
                onSampleSelected={handleSampleSelected}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onClear={handleClearImage}
                sampleCategory="structural"
              />
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Structure Element Type
              </label>
              <select
                value={structureType}
                onChange={(e) => setStructureType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              >
                {structureTypes.map((st, i) => (
                  <option key={i} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Grid Coordinate
              </label>
              <input
                type="text"
                value={locationElement}
                onChange={(e) => setLocationElement(e.target.value)}
                placeholder="e.g. Grid D-5, Elevation +14.2m"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Structural Observations & History
              </label>
              <textarea
                rows={3}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Describe crack propagation, concrete age, exposure to moisture..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Crack Morphometry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Structural AI Scan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6 animate-in fade-in duration-200">
              {/* Header Status & Severity */}
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
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{result.structure_type}</h3>
                  <p className="text-xs text-slate-500">{result.location_element} ({result.project_name})</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">Estimated Severity:</span>
                  <StatusBadge status={result.severity} size="md" />
                </div>
              </div>

              {/* Engineering Disclaimers Banner */}
              <DemoDisclaimer
                mode={result.mode}
                title="Forensic Engineering Visual Disclaimer"
                text={result.disclaimer}
              />

              {/* Morphometry Metrics: Crack Type & Estimated Width */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mb-1">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Identified Crack Classification</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{result.crack_type}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Based on orientation and stress trajectory</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mb-1">
                    <Ruler className="w-4 h-4 text-safety-600" />
                    <span>Estimated Crack Aperture Width</span>
                  </div>
                  <div className="text-sm font-extrabold text-navy-950">
                    {result.estimated_width_mm} mm
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      ({result.estimated_width_mm > 0.3 ? 'Exceeds ACI 224R Limit' : 'Within Durability Limit'})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Permissible exterior limit: 0.30mm</p>
                </div>
              </div>

              {/* Observations List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Forensic Visual Observations ({result.observations.length})
                </h4>
                <div className="space-y-2.5">
                  {result.observations.map((obs, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">{obs.title}</span>
                        <StatusBadge status={obs.severity} size="xs" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{obs.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recommended Engineering Protocols (Licensed PE)
                </h4>
                <div className="space-y-2">
                  {result.suggested_next_steps.map((st, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-800 bg-blue-50/60 border border-blue-100 p-3 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Official Structural Assessment Documentation</span>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Preview & Print PE Report &rarr;</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <SearchCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Awaiting Structural Inspection</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Upload a concrete element photo or pick a sample above to diagnose shear cracks, plastic shrinkage, and structural load risks.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Past Inspection History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-base font-bold text-slate-900">Historical Structural Scans</h3>
          </div>
          <span className="text-xs text-slate-500">{history.length} elements logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                <th className="pb-3">Scan ID</th>
                <th className="pb-3">Project</th>
                <th className="pb-3">Structure Element</th>
                <th className="pb-3">Crack Classification</th>
                <th className="pb-3">Est. Width</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-medium text-slate-700">{row.id}</td>
                  <td className="py-3 font-medium text-slate-900">{row.project_name}</td>
                  <td className="py-3 text-slate-600">{row.structure_type}</td>
                  <td className="py-3 text-slate-700 font-medium">{row.crack_type || 'Surface Crack'}</td>
                  <td className="py-3 font-semibold text-slate-900">{row.estimated_width_mm || 0.5} mm</td>
                  <td className="py-3">
                    <StatusBadge status={row.severity} size="xs" />
                  </td>
                  <td className="py-3 text-slate-500">{row.created_at ? row.created_at.slice(0, 10) : '2026-10-28'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <PrintableReportModal
        report={result}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
