import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, color = 'navy', trend, trendUp = true }) => {
  const colorMap = {
    navy: {
      bg: 'bg-navy-900',
      iconBg: 'bg-navy-800 text-slate-100',
      accent: 'border-l-4 border-l-navy-600',
    },
    orange: {
      bg: 'bg-white',
      iconBg: 'bg-safety-50 text-safety-600 border border-safety-100',
      accent: 'border-l-4 border-l-safety-500',
    },
    rose: {
      bg: 'bg-white',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      accent: 'border-l-4 border-l-rose-500',
    },
    emerald: {
      bg: 'bg-white',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      accent: 'border-l-4 border-l-emerald-500',
    },
    blue: {
      bg: 'bg-white',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      accent: 'border-l-4 border-l-blue-500',
    }
  };

  const style = colorMap[color] || colorMap.orange;

  return (
    <div className={`p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle hover:shadow-card transition-shadow ${style.accent}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{subtext}</p>
      )}
    </div>
  );
};
