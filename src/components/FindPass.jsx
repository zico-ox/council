import React, { useState } from 'react';
import { Search, Phone, ShieldCheck, ArrowRight, AlertCircle, Building, Award, QrCode, UserPlus, Loader2 } from 'lucide-react';
import { getStoredRegistrations, fetchRegistrationsFromFirebase } from '../utils/storage';

export default function FindPass({ onSelectDelegate, onGoToRegister }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;

    setIsSearching(true);
    try {
      let all = getStoredRegistrations();
      if (!all.length) {
        all = await fetchRegistrationsFromFirebase();
      }
      const match = all.find(item => 
        item.mobile.includes(query) || 
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
      );

      setResult(match || null);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-1 sm:px-0">
      <div className="backdrop-blur-xl bg-slate-900/85 border border-cyan-500/30 rounded-3xl shadow-2xl p-5 sm:p-8">

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Find Your Digital Pass
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Enter your registered 10-digit mobile number or Pass ID to retrieve your official pass.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                inputMode="tel"
                placeholder="Enter mobile or pass ID (e.g. 9847...)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHasSearched(false);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-base"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search Pass</span>
            </button>
          </div>
        </form>

        {/* Search Result */}
        {hasSearched && (
          <div>
            {result ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/30">
                    {result.id}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Delegate
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white">{result.name}</h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      {result.unit}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      {result.designation}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      +91 {result.mobile}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDelegate(result)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95"
                >
                  <span>Open Digital Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-rose-300">
                    No Registration Found
                  </h4>
                  <p className="text-xs text-rose-200/80 mt-1 max-w-sm mx-auto">
                    We could not find any delegate matching this mobile number or ID.
                  </p>
                </div>
                {onGoToRegister && (
                  <button
                    type="button"
                    onClick={onGoToRegister}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Now</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}