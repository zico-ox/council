import React from 'react';
import { UserPlus, Image as ImageIcon, Lock } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenDesk, 
  eventConfig 
}) {
  const isCpb = eventConfig?.hasBlocks;

  const brandGradient = isCpb
    ? 'from-emerald-500 to-teal-700 shadow-emerald-500/20 group-hover:shadow-emerald-400/40'
    : 'from-cyan-500 to-blue-700 shadow-cyan-500/20 group-hover:shadow-cyan-400/40';

  const brandTextGradient = isCpb
    ? 'from-emerald-400 to-teal-300'
    : 'from-cyan-400 to-blue-300';

  const accentColor = isCpb ? 'text-emerald-400' : 'text-cyan-400';
  const headerBorder = isCpb ? 'border-emerald-500/20' : 'border-cyan-500/20';

  const activeTabStyle = isCpb
    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25';

  const mobileActiveStyle = isCpb
    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
    : 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b ${headerBorder}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('register')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${brandGradient} p-0.5 shadow-lg transition-all duration-300 shrink-0`}>
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${brandTextGradient} text-xs sm:text-sm tracking-wider`}>
                  SSF
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-950"></div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] sm:text-xs font-bold tracking-widest ${accentColor} uppercase truncate`}>
                  {eventConfig?.organization}
                </span>
                <span className={`text-[9px] sm:text-[10px] ${isCpb ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30'} px-1.5 py-0.2 rounded border`}>
                  2026
                </span>
              </div>
              <h1 className="text-xs sm:text-base md:text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate">
                {eventConfig?.title}
              </h1>
            </div>
          </div>

          {/* Right Section: Navigation Links (No switcher button as requested) */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/70 p-1.5 rounded-2xl border border-white/5">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'register'
                    ? activeTabStyle
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>

              <button
                onClick={() => setActiveTab('poster')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'poster'
                    ? activeTabStyle
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Event Info</span>
              </button>

              <button
                onClick={onOpenDesk}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'admin'
                    ? activeTabStyle
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Lock className={`w-4 h-4 ${accentColor}`} />
                <span>Council Desk</span>
              </button>
            </nav>

          </div>

        </div>
      </div>

      {/* Mobile Sub-Header Navigation Tabs */}
      <div className={`md:hidden flex items-center justify-around border-t ${headerBorder} bg-slate-950/95 px-2 py-1.5`}>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
            activeTab === 'register'
              ? mobileActiveStyle
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 shrink-0" />
          <span>Register</span>
        </button>

        <button
          onClick={() => setActiveTab('poster')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
            activeTab === 'poster'
              ? mobileActiveStyle
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Info</span>
        </button>

        <button
          onClick={onOpenDesk}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
            activeTab === 'admin'
              ? mobileActiveStyle
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className={`w-3.5 h-3.5 shrink-0 ${accentColor}`} />
          <span>Desk</span>
        </button>
      </div>
    </header>
  );
}
