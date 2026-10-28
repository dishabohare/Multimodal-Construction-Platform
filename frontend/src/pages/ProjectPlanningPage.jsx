import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  DollarSign,
  Layers,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  X,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

export const ProjectPlanningPage = () => {
  const { addToast } = useApp();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Project Modal State
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState(25000000);
  const [newProjectStartDate, setNewProjectStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newProjectEndDate, setNewProjectEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );

  // New Task Modal State
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPhase, setTaskPhase] = useState('Superstructure');
  const [taskPriority, setTaskPriority] = useState('high');
  const [taskDuration, setTaskDuration] = useState(14);
  const [taskTrade, setTaskTrade] = useState('Concrete Works');

  // AI Plan Generator Modal State
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiProjectType, setAiProjectType] = useState('Commercial High-Rise');
  const [aiFloors, setAiFloors] = useState(18);
  const [aiDurationMonths, setAiDurationMonths] = useState(14);
  const [aiBudget, setAiBudget] = useState(38000000);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedPlan, setAiGeneratedPlan] = useState(null);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      } else if (selectedProject) {
        const updated = data.find((p) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProjectName,
        location: newProjectLocation,
        budget: Number(newProjectBudget),
        spent: 0,
        start_date: newProjectStartDate,
        target_completion_date: newProjectEndDate,
        status: 'in_progress',
        progress_pct: 0,
        notes: 'Newly initialized construction project.',
      };
      const created = await api.createProject(payload);
      addToast(`Project created: ${created.name}`, 'success');
      setIsNewProjectOpen(false);
      setNewProjectName('');
      setNewProjectLocation('');
      await fetchProjects();
      setSelectedProject(created);
    } catch (err) {
      addToast(err.message || 'Error creating project', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const payload = {
        title: taskTitle,
        phase: taskPhase,
        priority: taskPriority,
        duration_days: Number(taskDuration),
        progress_pct: 0,
        start_offset_days: 0,
        assigned_trade: taskTrade,
        status: 'pending',
      };
      await api.addTask(selectedProject.id, payload);
      addToast(`Task added to ${selectedProject.name}`, 'success');
      setIsNewTaskOpen(false);
      setTaskTitle('');
      await fetchProjects();
    } catch (err) {
      addToast(err.message || 'Error creating task', 'error');
    }
  };

  const handleUpdateTaskProgress = async (taskId, newPct) => {
    try {
      await api.updateTaskProgress(taskId, newPct);
      addToast(`Task progress updated to ${newPct}%`, 'info');
      await fetchProjects();
    } catch (err) {
      addToast('Error updating progress', 'error');
    }
  };

  const handleGenerateAIPlan = async (e) => {
    e.preventDefault();
    setAiGenerating(true);
    setAiGeneratedPlan(null);
    try {
      const res = await api.generatePlan({
        project_name: selectedProject ? selectedProject.name : 'Master Construction Project',
        project_type: aiProjectType,
        location: selectedProject ? selectedProject.location : 'Metro City Hub',
        budget: Number(aiBudget),
        duration_months: Number(aiDurationMonths),
        floors: Number(aiFloors),
        start_date: new Date().toISOString().slice(0, 10),
      });
      setAiGeneratedPlan(res);
      addToast('AI Master WBS and CPM plan synthesized!', 'success');
    } catch (err) {
      addToast('Failed to generate AI plan', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const tasks = selectedProject?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-1">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>CPM Scheduling & Gantt Timeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Construction Project Planning
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Orchestrate work breakdown structures (WBS), track trade dependencies, and detect spatial scheduling conflicts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Schedule Synthesizer</span>
          </button>
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {projects.map((p) => {
          const isSelected = selectedProject?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className={`p-3 rounded-xl border text-left shrink-0 transition-all ${
                isSelected
                  ? 'bg-navy-950 text-white border-navy-950 shadow-md ring-2 ring-safety-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold truncate max-w-[200px]">{p.name}</div>
              <div className="flex items-center space-x-2 mt-1 text-[11px] opacity-80">
                <span>{p.progress_pct}% Done</span>
                <span>&bull;</span>
                <span>${(p.budget / 1000000).toFixed(1)}M</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedProject && (
        <>
          {/* Active Project Overview Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Project Site</span>
              <div className="font-bold text-slate-900 text-sm">{selectedProject.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{selectedProject.location}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Budget Tracking</span>
              <div className="font-bold text-slate-900 text-sm">
                ${selectedProject.spent.toLocaleString()} / ${selectedProject.budget.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                {Math.round((selectedProject.spent / selectedProject.budget) * 100)}% budget utilized
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Schedule Window</span>
              <div className="font-bold text-slate-900 text-sm">
                {selectedProject.start_date} &rarr; {selectedProject.target_completion_date}
              </div>
              <div className="text-[11px] text-slate-500">Target milestone deadline</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Project Progress</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-safety-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${selectedProject.progress_pct}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900">{selectedProject.progress_pct}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Gantt / Timeline Visualizer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Interactive Gantt Timeline</h3>
                <p className="text-xs text-slate-500">Visual critical path and duration offsets across phases</p>
              </div>
              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Plus className="w-3.5 h-3.5 text-safety-600" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Gantt Bar Visualization Container */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-4 space-y-3">
              {/* Timeline Header Ruler */}
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-slate-400 border-b border-slate-200 pb-2 text-center uppercase tracking-wider">
                <div className="col-span-4 text-left">Task & Trade</div>
                <div className="col-span-2">Phase 1 (W1-4)</div>
                <div className="col-span-2">Phase 2 (W5-8)</div>
                <div className="col-span-2">Phase 3 (W9-12)</div>
                <div className="col-span-2">Phase 4 (W13-16)</div>
              </div>

              {/* Tasks Gantt Bars */}
              {tasks.length > 0 ? (
                tasks.map((t, idx) => {
                  const leftPct = Math.min(Math.max((t.start_offset_days / 90) * 100, 0), 85);
                  const widthPct = Math.min(Math.max((t.duration_days / 90) * 100, 10), 100 - leftPct);

                  return (
                    <div key={t.id || idx} className="grid grid-cols-12 gap-1 items-center py-1">
                      <div className="col-span-4 pr-2">
                        <div className="text-xs font-bold text-slate-800 truncate">{t.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {t.assigned_trade} &bull; {t.duration_days} days
                        </div>
                      </div>

                      <div className="col-span-8 relative h-7 bg-white rounded-lg border border-slate-200/80 overflow-hidden">
                        <div
                          className="absolute top-1 bottom-1 rounded-md flex items-center justify-between px-2 text-[10px] font-bold text-white shadow-sm transition-all"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            backgroundColor:
                              t.priority === 'critical'
                                ? '#EF4444'
                                : t.priority === 'high'
                                ? '#F97316'
                                : '#3B82F6',
                          }}
                        >
                          <span className="truncate">{t.phase}</span>
                          <span>{t.progress_pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active tasks defined for this project yet. Click &quot;Add Task&quot; or run the &quot;AI Schedule Synthesizer&quot;.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Task Management Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-slate-900">Task Register & Progress Updates</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Task Name</th>
                    <th className="pb-3">Phase</th>
                    <th className="pb-3">Trade</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Completion %</th>
                    <th className="pb-3 text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-semibold text-slate-900">{t.title}</td>
                      <td className="py-3 text-slate-600">{t.phase}</td>
                      <td className="py-3 text-slate-500">{t.assigned_trade}</td>
                      <td className="py-3">
                        <StatusBadge status={t.priority} size="xs" />
                      </td>
                      <td className="py-3 text-slate-600">{t.duration_days}d</td>
                      <td className="py-3 font-bold text-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="w-8">{t.progress_pct}%</span>
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-safety-500 h-2 rounded-full"
                              style={{ width: `${t.progress_pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right space-x-1">
                        {[0, 50, 100].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleUpdateTaskProgress(t.id, val)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                              t.progress_pct === val
                                ? 'bg-navy-900 text-white border-navy-900'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* AI Master Schedule Synthesizer Modal */}
      {isAIGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">AI Master Schedule Synthesizer</h3>
              </div>
              <button
                onClick={() => setIsAIGeneratorOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAIPlan} className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Typology</label>
                <select
                  value={aiProjectType}
                  onChange={(e) => setAiProjectType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Commercial High-Rise">Commercial High-Rise</option>
                  <option value="Mixed-Use Residential">Mixed-Use Residential</option>
                  <option value="Industrial Logistics Park">Industrial Logistics Park</option>
                  <option value="Civic & Institutional">Civic & Institutional</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Storeys</label>
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={aiFloors}
                  onChange={(e) => setAiFloors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Months)</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={aiDurationMonths}
                  onChange={(e) => setAiDurationMonths(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  step="500000"
                  value={aiBudget}
                  onChange={(e) => setAiBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                  {aiGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing CPM Critical Path...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate WBS & Conflict Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {aiGeneratedPlan && (
              <div className="space-y-4 pt-3 border-t border-slate-100 max-h-96 overflow-y-auto">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                  <span className="font-bold block mb-1">Plan Overview:</span>
                  {aiGeneratedPlan.project_summary}
                </div>

                {/* Spatial Conflict Alerts */}
                {aiGeneratedPlan.potential_conflicts && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Identified Scheduling Conflicts & Bottlenecks:</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {aiGeneratedPlan.potential_conflicts.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Phases Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    WBS Execution Phases:
                  </span>
                  {aiGeneratedPlan.phases.map((ph, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                      <div className="font-bold text-slate-800">{ph.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Duration: {ph.duration_weeks} weeks &bull; {ph.tasks.length} sub-tasks scheduled
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isNewProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Create Construction Project</h3>
              <button onClick={() => setIsNewProjectOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Apex Central Plaza"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  placeholder="e.g. 500 Park Avenue"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Budget ($)</label>
                <input
                  type="number"
                  step="100000"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-navy-900 text-white font-semibold shadow transition hover:bg-navy-800"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Add Schedule Task</h3>
              <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Raft Foundation Concrete Pour"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phase</label>
                  <input
                    type="text"
                    value={taskPhase}
                    onChange={(e) => setTaskPhase(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Trade</label>
                  <input
                    type="text"
                    value={taskTrade}
                    onChange={(e) => setTaskTrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-navy-900 text-white font-semibold shadow transition hover:bg-navy-800"
              >
                Save Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
