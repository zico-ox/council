import React from 'react';
import { Calendar, MapPin, Award, Sparkles, ExternalLink, Clock, Layers } from 'lucide-react';

export default function EventPosterModal({ eventConfig, onGoToRegister }) {
  const isCpb = eventConfig?.hasBlocks;
  const accentColor = isCpb ? 'text-emerald-400' : 'text-cyan-400';
  const accentBorder = isCpb ? 'border-emerald-500/30' : 'border-cyan-500/30';
  const badgeStyle = isCpb ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 px-1 sm:px-0">

      {/* Hero Poster Grid */}
      <div className={`backdrop-blur-xl bg-slate-900/85 border ${accentBorder} rounded-3xl p-5 sm:p-8 sm:p-10 shadow-2xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">

          {/* Left Column: Poster Image Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className={`relative group rounded-2xl overflow-hidden border-2 ${isCpb ? 'border-emerald-500/40 shadow-emerald-500/20' : 'border-cyan-500/40 shadow-cyan-500/20'} shadow-2xl max-w-sm w-full`}>
              <img
                src={eventConfig?.posterUrl}
                alt={`${eventConfig?.organization} Students Council 2026 Poster`}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                <span className="font-bold">Official Council Poster</span>
                <a
                  href={eventConfig?.posterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`hover:underline flex items-center gap-1 font-semibold ${accentColor}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Event Details */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">

            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badgeStyle} text-xs font-bold mb-3 border`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{eventConfig?.organization}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {eventConfig?.title}
              </h2>

              <p className={`${isCpb ? 'text-emerald-300' : 'text-cyan-300'} font-semibold text-sm sm:text-base mt-2`}>
                Theme: {eventConfig?.theme}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {eventConfig?.centenary} • {eventConfig?.centenaryConference}
              </p>
            </div>

            {/* Event Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className={`flex items-center gap-2 ${accentColor} text-xs font-bold uppercase tracking-wider mb-1`}>
                  <Calendar className="w-4 h-4" />
                  <span>Date & Day</span>
                </div>
                <div className="text-sm font-black text-white">
                  {eventConfig?.date}
                </div>
                <div className="text-xs text-slate-400">
                  {eventConfig?.day} {eventConfig?.time ? `• ${eventConfig?.time}` : ''}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className={`flex items-center gap-2 ${accentColor} text-xs font-bold uppercase tracking-wider mb-1`}>
                  <MapPin className="w-4 h-4" />
                  <span>Venue</span>
                </div>
                <div className="text-sm font-black text-white">
                  {eventConfig?.venue}
                </div>
                <div className="text-xs text-slate-400">
                  {eventConfig?.organization}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className={`flex items-center gap-2 ${accentColor} text-xs font-bold uppercase tracking-wider mb-1`}>
                  <Award className="w-4 h-4" />
                  <span>Office</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {eventConfig?.office}
                </div>
                <div className="text-xs text-slate-400">
                  Malappuram Dist, Kerala
                </div>
              </div>

              {isCpb ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className={`flex items-center gap-2 ${accentColor} text-xs font-bold uppercase tracking-wider mb-1`}>
                    <Layers className="w-4 h-4" />
                    <span>Blocks</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Qadisiyya • Khalidiyya • Maqdoomiyya
                  </div>
                  <div className="text-xs text-slate-400">
                    3 Delegate Blocks
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className={`flex items-center gap-2 ${accentColor} text-xs font-bold uppercase tracking-wider mb-1`}>
                    <Clock className="w-4 h-4" />
                    <span>Timing</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Friday Council
                  </div>
                  <div className="text-xs text-slate-400">
                    10 Sector Units
                  </div>
                </div>
              )}
            </div>

            {/* Quick Register CTA */}
            {onGoToRegister && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl ${
                    isCpb 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'
                  } text-white font-extrabold text-sm shadow-xl transition active:scale-95 cursor-pointer`}
                >
                  Proceed to Registration
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
