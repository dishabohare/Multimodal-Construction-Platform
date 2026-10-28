import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  Bookmark,
  Layers,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

export const KnowledgeAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState('kb-1');
  const [loading, setLoading] = useState(false);

  const categories = [
    'All',
    'Concrete & Curing',
    'Site Safety Practices',
    'Construction Materials',
    'Structural Inspection Basics',
    'Project Management',
    'Building Terminology'
  ];

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledge(query, selectedCategory);
      setItems(data);
    } catch (err) {
      console.error('Failed to load knowledge items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlQuery) setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKnowledge();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Standards & Technical Repository</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Construction Knowledge Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated engineering specifications for ACI standards, ASTM field tests, OSHA 1926 regulations, and building terminology.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 max-w-sm w-full">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concrete, rebar, fall arrest..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-safety-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition"
          >
            Find
          </button>
        </form>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.summary}</p>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs leading-relaxed text-slate-700 bg-slate-50/40">
                    <div className="whitespace-pre-line font-normal">{item.content}</div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No standards or articles match the query &quot;{query}&quot;. Try searching for &quot;concrete&quot;, &quot;rebar&quot;, or &quot;curing&quot;.
          </div>
        )}
      </div>

      <DemoDisclaimer
        compact={true}
        text="Knowledge content references verified ACI and OSHA standard codes. Project-specific contract specifications take precedence."
      />
    </div>
  );
};
