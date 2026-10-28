import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Plus,
  CloudSun,
  ShieldCheck,
  ChevronRight,
  User,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopNavbar = ({ onOpenMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeWeather, backendStatus, addToast } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine breadcrumb title
  const pathTitles = {
    '/': 'Platform Overview',
    '/dashboard': 'Intelligence Dashboard',
    '/safety': 'Safety Monitoring & OSHA Compliance',
    '/structural': 'Crack Detection & Structural Health',
    '/valuation': 'Real Estate Parametric Valuation',
    '/planning': 'Project Planning & CPM Scheduling',
    '/assistant': 'Daily Site Assistant',
    '/weather': 'Weather-Aware Operations Advisory',
    '/knowledge': 'Engineering Knowledge Repository',
    '/reports': 'Inspection & Analytics Reports',
    '/settings': 'System Settings & Diagnostics',
  };

  const currentTitle = pathTitles[location.pathname] || 'Dashboard';

  const sampleNotifications = [
    { id: 1, title: 'Scaffold Audit Required', time: '12m ago', unread: true },
    { id: 2, title: 'Weather Alert: Gusts > 35km/h', time: '1h ago', unread: true },
    { id: 3, title: 'Transfer Beam scan finished', time: '3h ago', unread: false },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/knowledge?query=${encodeURIComponent(searchQuery.trim())}`);
      addToast(`Searching knowledge base for: "${searchQuery}"`, 'info');
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link to="/dashboard" className="hover:text-slate-800 transition">BuildMind</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{currentTitle}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials, OSHA rules, inspection IDs..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500 transition"
          />
        </div>
      </form>

      {/* Right: Actions, Weather Pill, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Weather ticker pill */}
        {activeWeather && (
          <Link
            to="/weather"
            className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs text-slate-700 hover:bg-slate-200/80 transition"
          >
            <CloudSun className="w-4 h-4 text-safety-500" />
            <span className="font-semibold">{activeWeather.temperature_c}°C</span>
            <span className="text-slate-500 truncate max-w-[110px]">{activeWeather.location}</span>
          </Link>
        )}

        {/* Quick Action Button */}
        <Link
          to="/safety"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-safety-600 hover:bg-safety-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Inspection</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-safety-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Site Alerts</span>
                <span className="text-[10px] font-semibold bg-safety-50 text-safety-700 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition flex items-start space-x-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${n.unread ? 'bg-safety-500' : 'bg-slate-300'}`} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{n.title}</div>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-slate-100">
                <Link
                  to="/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-safety-600 font-semibold hover:underline"
                >
                  View All Inspection Reports &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-200">
            D
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">Disha M.</div>
            <div className="text-[10px] text-slate-500 font-medium">Site Superintendent</div>
          </div>
        </div>
      </div>
    </header>
  );
};
