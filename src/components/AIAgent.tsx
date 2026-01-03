import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Loader2, User } from "lucide-react";

/**
 * AIAgent Component
 * This is the "Frontend" that talks to your /api/chat.ts bridge.
 */
export default function AIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. CALLING THE BACKEND BRIDGE (chat.ts)
      const response = await fetch("/api/chat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. SUCCESS: Show the AI's answer
        setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
      } else {
        // 3. ERROR: Show what went wrong
        setMessages((prev) => [...prev, { role: "ai", text: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Connection failed. Is the Next.js server running?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-transform hover:scale-110 active:scale-95"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* 2. Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-blue-100" />
              <span className="font-bold">Portfolio Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <Bot size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400 italic">Hi! Ask me anything about this person's background or skills.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === "user" ? "bg-blue-100 text-blue-600" : "bg-white border text-slate-400"}`}>
                    {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-lg shadow-blue-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}