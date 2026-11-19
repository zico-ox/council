import React from 'react';
import { Calendar, MapPin, Mail, Award, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { EVENT_DETAILS, UNITS } from '../data/constants';

export default function EventPosterModal({ onGoToRegister }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 px-1 sm:px-0">

      {/* Hero Poster Grid */}
      <div className="backdrop-blur-xl bg-slate-900/85 border border-cyan-500/30 rounded-3xl p-5 sm:p-8 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">

          {/* Left Column: Poster Image Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 max-w-sm w-full">
              <img
                src={EVENT_DETAILS.posterUrl}
                alt="SSF Velimukku Sector Students Council 2026 Poster"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-cyan-300 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/30">
                <span className="font-bold">Official Council Poster</span>
                <a
                  href={EVENT_DETAILS.posterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1 font-semibold"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{EVENT_DETAILS.sector}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {EVENT_DETAILS.title}
              </h2>

              <p className="text-cyan-300 font-semibold text-sm sm:text-base mt-2">
                Theme: {EVENT_DETAILS.theme}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {EVENT_DETAILS.centenary} • {EVENT_DETAILS.centenaryConference}
              </p>
            </div>

            {/* Event Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Date & Day</span>
                </div>
                <div className="text-sm font-black text-white">
                  {EVENT_DETAILS.date}
                </div>
                <div className="text-xs text-slate-400">
                  {EVENT_DETAILS.day}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Venue</span>
                </div>
                <div className="text-sm font-black text-white">
                  {EVENT_DETAILS.venue}
                </div>
                <div className="text-xs text-slate-400">
                  {EVENT_DETAILS.sector}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4" />
                  <span>Office</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {EVENT_DETAILS.office}
                </div>
                <div className="text-xs text-slate-400">
                  Malappuram Dist, Kerala
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Mail className="w-4 h-4" />
                  <span>Email Support</span>
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300 break-all">
                  {EVENT_DETAILS.email}
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            {onGoToRegister && (
              <div className="pt-2">
                <button
                  onClick={onGoToRegister}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95"
                >
                  <span>Go to Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 10 Participating Units Grid */}
      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            10 Participating Units in Velimukku Sector
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Official Unit Representations at Students Council 2026
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
          {UNITS.map(unit => (
            <div key={unit.id} className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-center hover:border-cyan-400/50 transition">
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                Unit #{unit.id}
              </span>
              <div className="text-xs font-bold text-white mt-1.5">{unit.name}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
