import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  SearchCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  Filter,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

export const DashboardPage = () => {
  const { selectedProjectId, setSelectedProjectId, addToast, backendStatus } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard(selectedProjectId === 'all' ? null : selectedProjectId);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast('Could not load live dashboard data. Using local demo fallback.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedProjectId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-safety-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Aggregating site telemetry & inspections...</p>
      </div>
    );
  }

  const projects = data?.projects || [];
  const riskChartData = data?.safety_risk_chart || [
    { name: 'Critical', count: 1, color: '#EF4444' },
    { name: 'High', count: 2, color: '#F97316' },
    { name: 'Medium', count: 3, color: '#EAB308' },
    { name: 'Low', count: 4, color: '#10B981' }
  ];

  const progressChartData = data?.project_progress_chart || [];
  const recentInspections = data?.recent_inspections || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Construction Intelligence Command
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time project governance, safety compliance, and structural health telemetry.
          </p>
        </div>

        {/* Interactive Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value="all">All Active Sites (4)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          <Link
            to="/safety"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-safety-600 hover:bg-safety-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Audit</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Active Projects"
          value={data?.total_active_projects || 4}
          subtext="Under active superstructure & MEP"
          icon={Building2}
          color="navy"
        />
        <MetricCard
          title="Safety Inspections"
          value={data?.safety_inspections_count || 12}
          subtext="Total site scans logged"
          icon={ShieldAlert}
          color="orange"
          trend="+18%"
          trendUp={true}
        />
        <MetricCard
          title="High Risk Findings"
          value={data?.high_risk_observations || 3}
          subtext="Requires immediate correction"
          icon={AlertTriangle}
          color="rose"
          trend="Action required"
          trendUp={false}
        />
        <MetricCard
          title="Structural Scans"
          value={data?.structural_inspections_count || 6}
          subtext="Beams, slabs & retaining walls"
          icon={SearchCheck}
          color="emerald"
        />
        <MetricCard
          title="Avg Completion"
          value={`${data?.average_completion_pct || 54.8}%`}
          subtext="Across master project schedules"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Quick Action Launchpad */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Operations Launchpad</span>
          <span className="text-[11px] text-slate-400">1-click direct access</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            to="/safety"
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-orange-50/60 hover:border-orange-300 text-center transition group"
          >
            <ShieldAlert className="w-5 h-5 mx-auto text-safety-600 mb-1.5 transition-transform group-hover:scale-110" />
            <div className="text-xs font-bold text-slate-800">Safety Scan</div>
            <div className="text-[10px] text-slate-500">Hazard Detection</div>
          </Link>

          <Link
            to="/structural"
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-300 text-center transition group"
          >
            <SearchCheck className="w-5 h-5 mx-auto text-blue-600 mb-1.5 transition-transform group-hover:scale-110" />
            <div className="text-xs font-bold text-slate-800">Crack Scan</div>
            <div className="text-[10px] text-slate-500">Forensics & Width</div>
          </Link>

          <Link
            to="/valuation"
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-300 text-center transition group"
          >
            <Building2 className="w-5 h-5 mx-auto text-emerald-600 mb-1.5 transition-transform group-hover:scale-110" />
            <div className="text-xs font-bold text-slate-800">Valuation</div>
            <div className="text-[10px] text-slate-500">Sq.Ft Regression</div>
          </Link>

          <Link
            to="/planning"
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-purple-50/60 hover:border-purple-300 text-center transition group"
          >
            <Calendar className="w-5 h-5 mx-auto text-purple-600 mb-1.5 transition-transform group-hover:scale-110" />
            <div className="text-xs font-bold text-slate-800">Project Gantt</div>
            <div className="text-[10px] text-slate-500">CPM Planner</div>
          </Link>

          <Link
            to="/assistant"
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-navy-50/60 hover:border-navy-300 text-center transition group"
          >
            <Sparkles className="w-5 h-5 mx-auto text-navy-800 mb-1.5 transition-transform group-hover:scale-110" />
            <div className="text-xs font-bold text-slate-800">Site Assistant</div>
            <div className="text-[10px] text-slate-500">Chat Briefing</div>
          </Link>

          <Link
            to="/weather"
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/60 hover:border-amber-300 text-center transition group"
          >
            <Activity className="w-5 h-5 mx-auto text-amber-600 mb-1.5 transition-transform group-hover:scale-110" />
            <div className="text-xs font-bold text-slate-800">Weather Risk</div>
            <div className="text-[10px] text-slate-500">Pour & Lift Alerts</div>
          </Link>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Schedule & Budget Status</h3>
                <p className="text-xs text-slate-500">Completion % vs Budget Utilization across active sites</p>
              </div>
              <Link to="/planning" className="text-xs font-semibold text-safety-600 hover:text-safety-700 flex items-center">
                <span>View Master Gantt</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => val.length > 14 ? `${val.slice(0, 14)}...` : val}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [`${val}%`, '']}
                  />
                  <Bar dataKey="progress" fill="#F97316" radius={[6, 6, 0, 0]} name="Physical Completion %" />
                  <Bar dataKey="budget_spent_pct" fill="#0B132B" radius={[6, 6, 0, 0]} name="Budget Spent %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-safety-500 inline-block" />
              <span>Physical Completion %</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-navy-950 inline-block" />
              <span>Budget Spent %</span>
            </span>
          </div>
        </div>

        {/* Safety Risk Distribution Donut */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Safety Risk Distribution</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                OSHA Matrix
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Breakdown of open observations by severity tier</p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {riskChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-slate-50">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspection Reports Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Inspection Audits</h3>
              <p className="text-xs text-slate-500">Live safety and structural observations</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-safety-600 hover:text-safety-700 flex items-center"
            >
              <span>View All Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Audit ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Project Site</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInspections.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-mono font-medium text-slate-700">{row.id}</td>
                    <td className="py-3 font-semibold text-slate-900">{row.type}</td>
                    <td className="py-3 text-slate-600 truncate max-w-[160px]">{row.project}</td>
                    <td className="py-3">
                      <StatusBadge status={row.risk_level} size="xs" />
                    </td>
                    <td className="py-3 text-slate-500">{row.date}</td>
                    <td className="py-3 text-right">
                      <Link
                        to="/reports"
                        className="text-safety-600 font-semibold hover:underline"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Site Activity Timeline */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-safety-600" />
              <h3 className="text-base font-bold text-slate-900">Site Activity Stream</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Live Feed
            </span>
          </div>

          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((act, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-safety-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{act.title}</div>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed line-clamp-2">{act.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {act.created_at ? act.created_at.slice(0, 10) : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global verification notice */}
      <DemoDisclaimer
        mode={data?.demo_mode ? 'demo' : 'real'}
        title="Simulated Construction Intelligence Demonstration"
        text="All sample projects, crack severity gauges, and safety observations are rendered via verified civil engineering heuristics for educational and client demonstration. Professional field inspection is mandatory for life-safety critical operations."
      />
    </div>
  );
};
