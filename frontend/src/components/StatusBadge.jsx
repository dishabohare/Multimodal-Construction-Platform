import React from 'react';

export const StatusBadge = ({ status, size = 'sm', variant = 'default' }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();
  
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s === 'critical' || s === 'severe') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10';
  } else if (s === 'high' || s === 'delayed') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/10';
  } else if (s === 'medium' || s === 'moderate' || s === 'in_progress' || s === 'pending') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';
  } else if (s === 'low' || s === 'minor' || s === 'completed' || s === 'favorable' || s === 'planned') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
  } else if (s === 'real') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
  } else if (s === 'demo') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10';
  }

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium capitalize rounded-full border ring-1 ${colorClasses} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
