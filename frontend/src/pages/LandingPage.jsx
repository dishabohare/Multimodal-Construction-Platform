import React from 'react';
import { Link } from 'react-router-dom';
import {
  HardHat,
  ShieldAlert,
  SearchCheck,
  Building2,
  CalendarDays,
  Bot,
  CloudSun,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage = () => {
  const { backendStatus } = useApp();

  const coreModules = [
    {
      to: '/dashboard',
      icon: Layers,
      title: 'Command Intelligence Dashboard',
      desc: 'Real-time aggregated KPIs, safety risk distribution, active projects health, and critical observation heatmaps.',
      badge: 'Core'
    },
    {
      to: '/safety',
      icon: ShieldAlert,
      title: 'Multimodal Safety Monitoring',
      desc: 'Computer-vision site hazard detection for scaffolding, deep trenches, PPE compliance, and OSHA standard audits.',
      badge: 'Vision AI'
    },
    {
      to: '/structural',
      icon: SearchCheck,
      title: 'Crack Detection & Structural Health',
      desc: 'Visual crack diagnostics, shear vs flexural fissure categorization, estimated width gauges, and forensic NDT advisories.',
      badge: 'Forensics'
    },
    {
      to: '/valuation',
      icon: Building2,
      title: 'Parametric Real Estate Valuation',
      desc: 'Multi-factor regression model estimating property value, price per sq.ft, depreciation impacts, and market driver sensitivities.',
      badge: 'Analytics'
    },
    {
      to: '/planning',
      icon: CalendarDays,
      title: 'AI CPM Project Planning & Gantt',
      desc: 'Automated Master Work Breakdown Structure generator, duration offsets, trade scheduling, and spatial conflict detection.',
      badge: 'Planning'
    },
    {
      to: '/assistant',
      icon: Bot,
      title: 'Daily Site Assistant',
      desc: 'Conversational superintendent assistant answering concrete slump standards, rebar detailing, and morning safety toolbox briefs.',
      badge: 'LLM Chat'
    },
    {
      to: '/weather',
      icon: CloudSun,
      title: 'Weather-Aware Operations Advisory',
      desc: 'Hyper-local weather impact matrix evaluating suitability for concrete pours, exterior coatings, crane rigging, and roofing.',
      badge: 'Live Data'
    },
    {
      to: '/knowledge',
      icon: BookOpen,
      title: 'Construction Knowledge Repository',
      desc: 'Curated technical reference for ACI concrete standards, ASTM test procedures, OSHA safety rules, and civil engineering terminology.',
      badge: 'Library'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-navy-950 text-white p-8 sm:p-12 lg:p-16 border border-navy-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-safety-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-900 border border-navy-700/80 text-xs font-semibold text-safety-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-safety-500 animate-pulse" />
            <span>AI-Powered Multimodal Construction Platform</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">MVP Release 1.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Next-Generation Intelligence for{' '}
            <span className="bg-gradient-to-r from-safety-500 to-amber-400 bg-clip-text text-transparent">
              Construction Sites
            </span>{' '}
            & Civil Infrastructure
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            An enterprise-grade multimodal platform unifying computer-vision safety monitoring, 
            structural crack analysis, parametric property valuation, and CPM schedule orchestration.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-safety-600 hover:bg-safety-500 text-white font-semibold text-sm shadow-lg shadow-safety-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/safety"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 font-semibold text-sm transition"
            >
              <ShieldAlert className="w-4 h-4 text-safety-500" />
              <span>Run AI Safety Scan</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-navy-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
            <div>
              <div className="text-2xl font-extrabold text-white">4 Active</div>
              <div className="text-xs text-slate-400 mt-0.5">Demo Project Sites</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-safety-400">&lt; 1.2s</div>
              <div className="text-xs text-slate-400 mt-0.5">Multimodal Inference</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">OSHA 1926</div>
              <div className="text-xs text-slate-400 mt-0.5">Standard Rule Engine</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Offline Demo Fallback</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Platform Modules</h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore the full suite of multimodal tools designed for project managers, superintendents, and structural engineers.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-safety-600 hover:text-safety-700 inline-flex items-center space-x-1"
          >
            <span>View Interactive Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                to={mod.to}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-card hover:border-safety-400/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-navy-900 group-hover:bg-safety-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-safety-50 group-hover:text-safety-700 transition-colors">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-safety-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-safety-600">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Architecture & AI Integrity Section */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-safety-400">System Architecture</span>
            <h2 className="text-2xl font-bold text-white">
              Transparent, Deterministic & AI-Assisted Engineering
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              BuildMind AI strictly implements the engineering safety principle: AI outputs are preliminary 
              and assistive. The system differentiates between active multimodal LLM inferences and simulated 
              heuristics, ensuring total transparency during client presentations and academic defense.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FastAPI backend with Pydantic contract validation</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-leakage secret handling via backend .env</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Persistent SQLite storage for all project records</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-click sample inspection image workflows</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 mx-auto flex items-center justify-center text-safety-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-base">Backend Health</div>
              <p className="text-xs text-slate-400 mt-1">
                Status: <span className={backendStatus.connected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {backendStatus.connected ? 'FastAPI Connected' : 'Simulated Client Demo'}
                </span>
              </p>
            </div>
            <Link
              to="/settings"
              className="block w-full py-2 rounded-xl bg-safety-600 hover:bg-safety-500 text-white font-semibold text-xs transition"
            >
              Inspect Diagnostics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
