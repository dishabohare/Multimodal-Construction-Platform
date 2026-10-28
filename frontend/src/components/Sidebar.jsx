import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCheck,
  Building2,
  CalendarDays,
  Bot,
  CloudSun,
  BookOpen,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Sparkles,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { backendStatus } = useApp();

  const navItems = [
    { to: '/', label: 'Landing Page', icon: Home, exact: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/safety', label: 'Safety Monitoring', icon: ShieldAlert, badge: 'Vision' },
    { to: '/structural', label: 'Crack & Structural', icon: SearchCheck, badge: 'AI' },
    { to: '/valuation', label: 'Property Valuation', icon: Building2 },
    { to: '/planning', label: 'Project Planning', icon: CalendarDays, badge: 'Gantt' },
    { to: '/assistant', label: 'Daily Site Assistant', icon: Bot, badge: 'Chat' },
    { to: '/weather', label: 'Weather Advisory', icon: CloudSun },
    { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/reports', label: 'Reports & Analysis', icon: FileBarChart },
    { to: '/settings', label: 'Settings & About', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-navy-950 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-navy-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-850/80 bg-navy-900/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-safety-600 to-safety-500 text-white font-extrabold flex items-center justify-center shrink-0 shadow-lg shadow-safety-600/20">
              <HardHat className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-bold text-white text-base tracking-tight flex items-center space-x-1">
                  <span>BuildMind</span>
                  <span className="text-safety-500 font-extrabold">AI</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate">
                  Construction Intel
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group relative ${
                    isActive
                      ? 'bg-safety-600 text-white shadow-md shadow-safety-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-navy-850'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-navy-800 text-safety-400 group-hover:bg-navy-900 group-hover:text-white transition">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer System Status Banner */}
        <div className="p-3 border-t border-navy-850 bg-navy-900/50">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">System State</span>
                <span className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-[10px] font-bold text-slate-300">
                    {backendStatus.connected ? 'ONLINE' : 'DEMO MODE'}
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                AI: <span className="text-safety-400 font-medium">{backendStatus.provider}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`AI Provider: ${backendStatus.provider}`}>
              <span className={`w-3 h-3 rounded-full ${backendStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
