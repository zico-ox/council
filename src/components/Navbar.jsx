import React from 'react';
import { UserPlus, Image as ImageIcon, Lock } from 'lucide-react';
import { EVENT_DETAILS } from '../data/constants';

export default function Navbar({ activeTab, setActiveTab, onOpenDesk }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('register')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 text-xs sm:text-sm tracking-wider">
                  SSF
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-950"></div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-cyan-400 uppercase">
                  {EVENT_DETAILS.sector}
                </span>
                <span className="text-[9px] sm:text-[10px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                  2026
                </span>
              </div>
              <h1 className="text-sm sm:text-lg font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors truncate max-w-[220px] sm:max-w-none">
                {EVENT_DETAILS.title}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/70 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>

            <button
              onClick={() => setActiveTab('poster')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === 'poster'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Event Info</span>
            </button>

            <button
              onClick={onOpenDesk}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === 'admin'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Council Desk</span>
            </button>
          </nav>

        </div>
      </div>

      {/* Mobile Sub-Header Navigation Tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-cyan-500/15 bg-slate-950/95 px-2 py-1.5">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${activeTab === 'register'
            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <UserPlus className="w-3.5 h-3.5 shrink-0" />
          <span>Register</span>
        </button>

        <button
          onClick={() => setActiveTab('poster')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${activeTab === 'poster'
            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Info</span>
        </button>

        <button
          onClick={onOpenDesk}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${activeTab === 'admin'
            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span>Desk</span>
        </button>
      </div>
    </header>
  );
}