'use client'

import React from 'react'
import { User, Sparkles } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface MessageItemProps {
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
}

const MessageItem = ({ role, content, isTyping }: MessageItemProps) => {
  const isUser = role === 'user'

  return (
    <div className={cn(
      "w-full py-6 flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "chat-container-max-width flex gap-4 md:gap-5",
        isUser && "flex-row-reverse"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
          isUser ? "bg-gray-700 border-gray-600" : "bg-emerald-600 border-emerald-500"
        )}>
          {isUser ? <User size={16} className="text-gray-300" /> : <Sparkles size={16} className="text-white" />}
        </div>
        
        {/* Content */}
        <div className={cn(
          "flex-1 flex flex-col",
          isUser && "items-end"
        )}>
          <div className={cn(
            "px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed max-w-[85%] animate-fade-in",
            isUser ? "bg-input-bg text-foreground shadow-sm" : "text-foreground bg-transparent"
          )}>
            {isTyping ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{content}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageItem
