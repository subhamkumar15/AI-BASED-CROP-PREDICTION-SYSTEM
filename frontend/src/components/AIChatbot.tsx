import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, RefreshCw, ChevronDown } from 'lucide-react';
import { chatApi } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AIChatbot: React.FC<{ activeCropContext?: any }> = ({ activeCropContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am **AGRISENSE AI**, your precision agricultural intelligence assistant. Ask me anything about crop selection, NPK balancing, soil pH amendments, pest outbreaks, or climate risk mitigation.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "What is the best fertilizer for low Nitrogen?",
        "How to prepare soil for Kharif season?",
        "What are the symptoms of Tomato Late Blight?"
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const resp = await chatApi.sendMessage(userMsg.text, activeCropContext);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: resp.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: resp.suggested_questions
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I'm temporarily having trouble connecting to the agronomic knowledge server. Please verify backend connectivity on port 8000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-brand-700 via-emerald-600 to-teal-500 text-white p-3.5 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group border border-emerald-400/40"
          aria-label="Open AI Agronomist"
        >
          <div className="relative">
            <Bot size={24} className="animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-emerald-800" />
          </div>
          <span className="hidden sm:inline-block font-bold text-xs pr-1">Ask AI Agronomist</span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-scale-up">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">AGRISENSE AI</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded-full">
                    Grounded
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ICAR & FAO Knowledge Engine
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Context Banner */}
          {activeCropContext?.crop && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-1.5 text-[11px] text-emerald-800 flex items-center justify-between font-medium">
              <span>Farm Context: <b>{activeCropContext.display_name || activeCropContext.crop}</b></span>
              <span className="text-emerald-600 font-bold">{activeCropContext.suitability_score}% Match</span>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return <div key={idx} className="my-0.5 pl-2">{line}</div>;
                      }
                      return <p key={idx} className="my-0.5">{line}</p>;
                    })}
                  </div>
                  <div className={`text-[9px] mt-1.5 font-medium ${msg.sender === 'user' ? 'text-brand-100 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg px-2.5 py-1 text-left font-medium transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                  <RefreshCw size={12} className="animate-spin text-emerald-600" />
                  <span>Synthesizing agronomic advisory...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about crops, soil NPK, pests, fertilizer..."
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-brand-500/20 flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
