import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Calendar,
} from 'lucide-react';

export default function AskAI() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.name}! I am your AI Payroll Assistant. I can answer plain-English questions regarding company compensation, attendance tallies, and monthly net disbursements. All queries are strictly verified against ${user?.company?.name}'s database.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const suggestionChips = isAdmin
    ? [
        "What is Ramesh's net salary for October?",
        "What was Ramesh's salary in September?",
        "How many LOP days did Ramesh have in October?",
        "What is Priya's net salary for October?",
      ]
    : [
        "What is my net salary for October?",
        "How many LOP days do I have for October?",
        "What was my net salary for September?",
      ];

  const handleSend = async (questionText) => {
    const query = questionText || inputQuestion;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setIsThinking(true);

    try {
      const res = await api.post('/ask', { question: query.trim() });
      if (res.data.success) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: res.data.answer,
          data: res.data.data,
          llmActive: res.data.llmActive,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        isError: true,
        text: err.response?.data?.message || 'Failed to process query. Please ensure you are authorized to view this data.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
              Ask AI Payroll Assistant
            </h1>
            <Badge variant="primary" size="xs">Grounded Tool Calling</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grounded natural-language queries. Zero hallucinations: answers strictly pulled via verified company services.
          </p>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>Tenant Isolated</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <Card noPadding className="flex-1 flex flex-col overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.isError
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                    : 'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl p-4 text-sm space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 rounded-tl-none'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Structured Financial Breakdown Card (if returned with answer) */}
                {msg.data && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 shadow-sm text-slate-800 dark:text-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold">{msg.data.employeeName}</span>
                      <Badge variant="primary" size="xs">{msg.data.month}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400">Earned Gross:</span>
                        <p className="font-mono font-semibold">{formatCurrency(msg.data.grossSalary)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">LOP Days:</span>
                        <p className="font-semibold text-rose-500">{msg.data.lopDays} days</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Deductions (10%):</span>
                        <p className="font-mono text-rose-500">- {formatCurrency(msg.data.deduction)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Disbursable Net:</span>
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {formatCurrency(msg.data.netSalary)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`text-[10px] ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                  {msg.sender === 'bot' && !msg.isError && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Grounded Result
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isThinking && (
            <div className="flex items-center space-x-3 text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-none flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
            Try:
          </span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. What is Ramesh's net salary for October?)..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isThinking}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputQuestion.trim() || isThinking}
              icon={Send}
            >
              Ask
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
