import React from 'react';
import { AlertTriangle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const DemoDisclaimer = ({ 
  mode = 'demo', 
  title = 'Preliminary Advisory & Verification Notice',
  text = 'All AI observations and simulated outputs are preliminary engineering aids. Professional on-site verification by licensed safety officers or professional structural engineers is mandatory before operational decisions.',
  compact = false
}) => {
  const isDemo = mode === 'demo';

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs ${
        isDemo ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-blue-50/80 border-blue-200 text-blue-900'
      }`}>
        {isDemo ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> : <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />}
        <span className="font-semibold">{isDemo ? 'DEMO SIMULATION' : 'AI-ASSISTED'}</span>
        <span className="text-slate-600 truncate">{text}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isDemo ? 'bg-amber-50/70 border-amber-200/90 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-800'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg shrink-0 ${isDemo ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {isDemo ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
              isDemo ? 'bg-amber-200/80 text-amber-900' : 'bg-blue-200/80 text-blue-900'
            }`}>
              {isDemo ? 'Simulated Output Mode' : 'Verified LLM Pipeline'}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};
