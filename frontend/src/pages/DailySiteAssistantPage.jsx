import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  HardHat,
  User,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

export const DailySiteAssistantPage = () => {
  const { addToast } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am BuildMind's **Daily Site Assistant**. I can help you draft daily site logs, review ACI concrete placement protocols, coordinate trade workflows, or check OSHA 1926 safety requirements. How can I assist your site operations today?",
      mode: 'demo',
      suggested_actions: ['Toolbox Safety Brief', 'Concrete Pour Checklist', 'Check Wind Limits'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'What are the mandatory checks before a 400m³ foundation pour?',
    'Draft a 10-minute morning toolbox talk on scaffolding fall arrest.',
    'What is the rebar lap length formula for Grade 60 bars under ACI 318?',
    'What should we do if tower crane anemometer reads sustained 40 km/h winds?',
    'How do I calculate cement storage bag stack limits in damp conditions?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.chatAssistant({
        message: text,
        conversation_history: history,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          mode: res.mode,
          suggested_actions: res.suggested_actions || [],
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      addToast('Error communicating with assistant. Displaying local advisory.', 'warning');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "**Offline Site Assistant:** Standard protocol verified. Ensure all ground personnel possess OSHA-10 cards, inspect excavation shoring depth daily, and confirm testing laboratory cylinder collection.",
          mode: 'demo',
          suggested_actions: ['Verify Safety', 'Daily Log'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Conversation cleared. Ready for your next site engineering inquiry.",
        mode: 'demo',
        suggested_actions: ['Toolbox Safety Brief', 'Concrete Pour Checklist'],
      },
    ]);
    addToast('Chat session reset.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-navy-50 border border-navy-200 text-navy-800 text-xs font-semibold mb-1">
            <Bot className="w-3.5 h-3.5 text-safety-600" />
            <span>AI Site Superintendent & Field Copilot</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daily Site Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time advisory for material planning, concrete pour hold points, trade sequencing, and OSHA briefings.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
          <Lightbulb className="w-4 h-4 text-safety-500" />
          <span>Quick Construction Inquiries (Click to Ask):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-left text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-safety-300 text-slate-700 hover:text-safety-700 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser ? 'bg-safety-600 text-white' : 'bg-navy-950 text-safety-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-safety-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200/90 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{m.content}</div>

                  {!isUser && m.suggested_actions && m.suggested_actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {m.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(`Proceed with: ${act}`)}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-safety-600 hover:border-safety-300 transition"
                        >
                          {act} &rarr;
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-navy-950 text-safety-400 flex items-center justify-center text-xs">
                <HardHat className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-safety-600" />
                <span>Superintendent AI consulting technical standards...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ACI standards, concrete curing, OSHA 1926 fall protection, or rebar specs..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-safety-600 hover:bg-safety-500 text-white shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <DemoDisclaimer
        compact={true}
        text="Assistant advice reflects construction standards and rule heuristics. Consult project Structural Engineer of Record before critical pours or load changes."
      />
    </div>
  );
};
