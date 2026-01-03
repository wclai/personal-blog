import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiRegister() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // 呼叫修正後的後端 API
      const res = await fetch('/api/dify/ai-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMsg,
          conversationId: conversationId 
        }),
      });

      const data = await res.json();
      console.log("Frontend received:", data);

      if (res.ok && data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        if (data.conversationId) setConversationId(data.conversationId);
      } else {
        // 顯示具體的錯誤訊息
        const errorMsg = data.error || "未知錯誤";
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ 系統提示: ${errorMsg}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '🚫 連線異常，請確認 Next.js 後端服務是否運作中。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 md:w-96 h-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans z-50">
      <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>AI Registration Assistant</span>
        </div>
        <button 
          onClick={() => { setMessages([]); setConversationId(null); }} 
          className="text-[10px] bg-indigo-500 px-2 py-1 rounded hover:bg-indigo-400 uppercase transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg>
            </div>
            <p className="text-gray-600 text-sm font-medium">Hello! I am AI Registration Assistant</p>
            <p className="text-gray-400 text-xs mt-1">Please tell me "I want to register", and I will guide you through the account creation process.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium italic">Agent 正在思考或執行工具...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="請輸入..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading} 
            className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}