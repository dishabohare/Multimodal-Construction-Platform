import React from 'react';
import {
  Settings,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Database,
  Terminal,
  ExternalLink,
  RefreshCw,
  HardHat,
  Code
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsAboutPage = () => {
  const { backendStatus, checkHealth, addToast } = useApp();

  const handleManualPing = async () => {
    addToast('Pinging FastAPI backend...', 'info');
    await checkHealth();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Environment & Deployment Specs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & System Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time backend telemetry, AI provider status, and platform architecture overview.
          </p>
        </div>

        <button
          onClick={handleManualPing}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Backend Health</span>
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend Connectivity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">FastAPI Server</span>
            <Server className="w-4 h-4 text-safety-600" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${backendStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-base font-bold text-slate-900">
              {backendStatus.connected ? 'Operational (Port 8000)' : 'Client Demo Fallback'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {backendStatus.connected
              ? 'Local uvicorn process actively listening for multimodal requests.'
              : 'Backend is offline; app is safely utilizing deterministic browser fallback.'}
          </p>
        </div>

        {/* AI Provider Mode */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Intelligence Core</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-bold text-slate-900">{backendStatus.provider}</div>
          <p className="text-xs text-slate-500">
            {backendStatus.aiConfigured
              ? 'Real Multimodal Vision API key configured in backend .env'
              : 'Running in rich deterministic Demo Mode with clear verification disclaimers.'}
          </p>
        </div>

        {/* Persistence Engine */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Persistence Store</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-bold text-slate-900">SQLite Database</div>
          <p className="text-xs text-slate-500">
            Zero-config local database storing project tasks, inspections, and valuations.
          </p>
        </div>
      </div>

      {/* API Key Configuration Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-safety-600" />
          <h2 className="text-base font-bold text-slate-900">AI Model API Configuration</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          BuildMind AI supports live integration with <strong>Google Gemini Multimodal API</strong>. 
          To enable live vision analysis, configure your API key in the backend environment file. 
          The platform securely calls the model from Python without exposing secrets to client code.
        </p>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
          <div className="text-slate-500"># In backend/.env file:</div>
          <div><span className="text-safety-400">GEMINI_API_KEY</span>=AIzaSy...your_gemini_key</div>
          <div><span className="text-safety-400">OPENAI_API_KEY</span>=sk-...optional_openai_key</div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Transparent Demo Fallback: </span>
            When no API key is specified, the application automatically activates high-fidelity simulated 
            engineering heuristics. Outputs are clearly marked with a <strong>Demo Mode</strong> badge, 
            guaranteeing academic defense integrity.
          </div>
        </div>
      </div>

      {/* College Project & Portfolio Showcase Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2">
          <HardHat className="w-5 h-5 text-navy-950" />
          <h2 className="text-base font-bold text-slate-900">Project Overview & Academic Portfolio</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Key Architectural Highlights</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong>Frontend:</strong> React 19, Vite, Tailwind CSS, Recharts, Lucide Icons.</li>
              <li><strong>Backend:</strong> FastAPI, Pydantic strict schemas, Uvicorn, SQLite.</li>
              <li><strong>AI Engine:</strong> Modular Google Gemini Vision integration with safe fallback.</li>
              <li><strong>OSHA 1926 Rules:</strong> Programmatic safety scoring and fall protection checklists.</li>
              <li><strong>CPM Scheduler:</strong> Dynamic Gantt chart with trade spatial conflict detection.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Deployment & Portability</h3>
            <p className="leading-relaxed">
              Designed as a self-contained full-stack platform. The frontend can be hosted statically 
              on Vercel, Netlify, or GitHub Pages, while the backend deploys effortlessly on Render, 
              Railway, or AWS EC2 with SQLite or PostgreSQL persistence.
            </p>
            <div className="pt-2">
              <span className="font-bold text-slate-900 block">Lead Developer / Author:</span>
              <span className="text-slate-500">Disha M. &bull; Senior Engineering Capstone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
