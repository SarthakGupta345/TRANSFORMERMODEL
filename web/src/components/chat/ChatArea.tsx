'use client'

import React, { useState, useRef, useEffect } from 'react'
import MessageItem from './MessageItem'
import ChatInput from './ChatInput'
import { ChevronDown, Search, Sparkles } from 'lucide-react'

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatArea = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const newUserMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content, max_tokens: 150 })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to fetch response');
      }
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: errMsg.includes('Model is not trained')
          ? "⚠️ The model hasn't been trained yet. Upload a PDF using the 📎 button to train the model first!"
          : `⚠️ ${errMsg}. Make sure the FastAPI server is running on port 8000.`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full bg-background overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 px-6 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <button className="text-[15px] font-semibold flex items-center gap-2 hover:bg-sidebar-hover px-3 py-1.5 rounded-xl transition-all">
            Transformer Model
            <span className="text-[11px] bg-sidebar-hover px-2 py-0.5 rounded-full text-gray-500 font-bold">GPT</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Search size={18} />
          </button>
          <button className="text-[13px] font-semibold border border-border-subtle px-4 py-1.5 rounded-xl hover:bg-sidebar-hover transition-all">
            Share
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pb-48 pt-6">
        <div className="w-full">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-gray-500 text-sm max-w-md text-center leading-relaxed">
                Upload a PDF using the 📎 button to train the model, then start chatting!
                The model will learn from your document and generate responses based on it.
              </p>
              <div className="flex gap-3 mt-8">
                <div className="px-4 py-2.5 bg-input-bg border border-border-subtle rounded-2xl text-sm text-gray-400 hover:text-foreground hover:border-gray-500 transition-all cursor-pointer">
                  📄 Upload a PDF first
                </div>
                <div className="px-4 py-2.5 bg-input-bg border border-border-subtle rounded-2xl text-sm text-gray-400 hover:text-foreground hover:border-gray-500 transition-all cursor-pointer">
                  💬 Then ask questions
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageItem key={i} role={msg.role} content={msg.content} />
              ))}
              {isTyping && (
                <MessageItem role="assistant" content="" isTyping />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  )
}

export default ChatArea
