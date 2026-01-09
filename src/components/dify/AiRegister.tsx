// src/components/dify/AiRegister.tsx

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RegistrationData {
  name: string;
  email: string;
}

interface AiRegisterProps {
  onRegistrationSuccess?: (message: string) => void;
}

/**
 * AiRegister 組件
 * 包含自動生成高強度密碼與通知父組件的功能
 */
export default function AiRegister({ onRegistrationSuccess }: AiRegisterProps) {
  const [messages, setMessages] = useState<any[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I am your AI registration assistant. 😊 I can help you quickly complete the membership registration and automatically generate a high-strength secure password for you. What is your name?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<RegistrationData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, pendingData]);

  /**
   * 生成 16 位隨機高強度密碼
   */
  const generateSecurePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const parseMessage = (text: string) => {
    const regex = /\[REGISTRATION_DATA\]([\s\S]*?)\[\/REGISTRATION_DATA\]/;
    const match = text.match(regex);
    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1].trim());
        setPendingData(data);
        return text.replace(regex, "").trim();
      } catch (e) {
        console.error("Failed to parse JSON data", e);
      }
    }
    return text;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    setPendingData(null);

    try {
      const res = await fetch('/api/dify/ai-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, conversationId }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        const cleanText = parseMessage(data.text);
        setMessages(prev => [...prev, { role: 'assistant', content: cleanText }]);
        if (data.conversationId) setConversationId(data.conversationId);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '🚫 connection error' }]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 最終執行註冊流程
   */
  const confirmRegistration = async () => {
    if (!pendingData) return;
    setIsRegistering(true);

    // 1. 自動生成密碼
    const generatedPassword = generateSecurePassword();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pendingData,
          password: generatedPassword 
        }),
      });

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: "✅ Registration successful! I've generated a high-strength password for you, which you can use to log in anytime." }]);
        setPendingData(null);
        
        // 2. 觸發父組件顯示成功訊息
        if (onRegistrationSuccess) {
          onRegistrationSuccess("Your registration request is received and being processed.");
        }
      } else {
        const errorData = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ Registration failed: ${errorData.error || "Please try again later"}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ System error' }]);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 md:w-96 h-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center shadow-md">
        <span>AI Registration Assistant</span>
        <button onClick={() => { setMessages([]); setConversationId(null); setPendingData(null); }} className="text-[10px] bg-indigo-500 px-2 py-1 rounded">重設</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {pendingData && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-inner space-y-3">
            <h4 className="text-xs font-bold text-indigo-700 uppercase">Confirm Registration Information</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Name:</span> <span className="font-semibold text-gray-900">{pendingData.name}</span></div>
              <div className="flex justify-between"><span>Email:</span> <span className="font-semibold text-gray-900">{pendingData.email}</span></div>
              <div className="flex justify-between"><span>Password:</span> <span className="font-italic text-gray-400">will be auto-generated</span></div>
            </div>
            <button 
              onClick={confirmRegistration}
              disabled={isRegistering}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isRegistering ? "Processing..." : "Confirm and Register Account"}
            </button>
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
            placeholder="Please enter a message..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}