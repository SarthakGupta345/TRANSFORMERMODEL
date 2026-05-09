'use client'

import React from 'react'
import { Plus, MessageSquare, PanelLeft, MoreHorizontal, User } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AppSidebar = () => {
  const recentChats = [
    'Premium UI Design',
    'Next.js Integration',
    'Refactoring Sidebar',
    'ChatGPT Clone Project',
    'Marketplace Strategy'
  ]

  return (
    <aside className="w-[260px] bg-sidebar-bg flex flex-col h-full border-r border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between">
        <button className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-sidebar-hover transition-colors text-sm font-medium group">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
             <Plus size={14} className="text-black" strokeWidth={3} />
          </div>
          New Chat
        </button>
        <button className="p-2.5 rounded-xl hover:bg-sidebar-hover text-gray-500 ml-1">
          <PanelLeft size={18} />
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 mt-2 custom-scrollbar">
        <div className="text-[11px] font-semibold text-gray-500 px-3 py-4 uppercase tracking-widest">
          Recent
        </div>
        <div className="space-y-0.5">
          {recentChats.map((chat, i) => (
            <button key={i} className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-sidebar-hover transition-all group relative",
              i === 0 && "bg-sidebar-hover text-foreground font-medium"
            )}>
              <span className="truncate flex-1 text-left">{chat}</span>
              <MoreHorizontal size={16} className="opacity-0 group-hover:opacity-100 text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 mt-auto">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-hover transition-all group">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
            JD
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-medium truncate">John Doe</p>
          </div>
        </button>
      </div>
    </aside>
  )
}

export default AppSidebar
