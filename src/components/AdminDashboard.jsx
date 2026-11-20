import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Building, Award, Search, 
  Download, Phone, MessageCircle, Eye, Edit2, Trash2, 
  X, MoreVertical, Layers, MapPin
} from 'lucide-react';
import { UNITS, DESIGNATIONS, CPB_BLOCKS } from '../data/constants';
import { 
  getStoredRegistrations, 
  fetchRegistrationsFromFirebase,
  subscribeToRegistrations,
  deleteRegistration, 
  updateRegistration, 
  exportToPDF
} from '../utils/storage';

export default function AdminDashboard({ eventConfig, onOpenBadge, onLock }) {
  const isCpb = eventConfig?.hasBlocks;
  const eventKey = eventConfig?.id || 'vlm';

  const [registrations, setRegistrations] = useState(() => getStoredRegistrations(eventKey));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedDesignation, setSelectedDesignation] = useState('ALL');
  const [selectedBlock, setSelectedBlock] = useState('ALL');

  // Breakdown toggle mode for VLM ('units' or 'roles')
  const [breakdownMode, setBreakdownMode] = useState('units');

  // Edit Modal State
  const [editingDelegate, setEditingDelegate] = useState(null);

  // 3-dot dropdown active state (tracks delegate ID)
  const [openMenuId, setOpenMenuId] = useState(null);

  // Real-time synchronization with Firebase Database for current event
  useEffect(() => {
    fetchRegistrationsFromFirebase(eventKey).then(setRegistrations);
    const unsubscribe = subscribeToRegistrations((data) => {
      setRegistrations(data);
    }, eventKey);
    return unsubscribe;
  }, [eventKey]);

  const totalCount = registrations.length;

  // CPB: Block statistics for Qadisiyya, Khalidiyya, Maqdoomiyya
  const blockStats = useMemo(() => {
    return CPB_BLOCKS.map(b => {
      const count = registrations.filter(r => r.block === b.name || r.block === b.id).length;
      return {
        id: b.id,
        name: b.name,
        code: b.code,
        subtext: b.subtext,
        badgeColor: b.badgeColor,
        count
      };
    });
  }, [registrations]);

  // CPB: Top Block
  const topBlock = useMemo(() => {
    let best = { name: 'None', subtext: '', count: 0 };
    blockStats.forEach(b => {
      if (b.count > best.count) {
        best = b;
      }
    });
    return best;
  }, [blockStats]);

  // VLM: Unit statistics for 10 units
  const unitStats = useMemo(() => {
    return UNITS.map(u => {
      const count = registrations.filter(r => r.unit === u.name).length;
      return {
        id: u.id,
        name: u.name,
        code: u.code,
        count
      };
    });
  }, [registrations]);

  const activeUnitsCount = useMemo(() => {
    return unitStats.filter(u => u.count > 0).length;
  }, [unitStats]);

  // VLM: Designation statistics for 6 roles
  const designationStats = useMemo(() => {
    return DESIGNATIONS.map(d => {
      const count = registrations.filter(r => r.designation === d.name).length;
      return {
        id: d.id,
        name: d.name,
        badgeColor: d.badgeColor,
        count
      };
    });
  }, [registrations]);

  // VLM: Top Unit
  const topUnit = useMemo(() => {
    let best = { name: 'None', count: 0 };
    unitStats.forEach(u => {
      if (u.count > best.count) {
        best = u;
      }
    });
    return best;
  }, [unitStats]);

  // Filtered List
  const filteredList = useMemo(() => {
    return registrations.filter(item => {
      const matchesSearch = 
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mobile.includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (isCpb) {
        const matchesBlock = selectedBlock === 'ALL' || item.block === selectedBlock;
        return matchesSearch && matchesBlock;
      } else {
        const matchesUnit = selectedUnit === 'ALL' || item.unit === selectedUnit;
        const matchesDes = selectedDesignation === 'ALL' || item.designation === selectedDesignation;
        return matchesSearch && matchesUnit && matchesDes;
      }
    });
  }, [registrations, searchTerm, isCpb, selectedBlock, selectedUnit, selectedDesignation]);

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name} (${id})?`)) {
      const updated = await deleteRegistration(id, eventKey);
      setRegistrations(updated);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDelegate) return;
    const updated = await updateRegistration(editingDelegate.id, editingDelegate, eventKey);
    setRegistrations(updated);
    setEditingDelegate(null);
  };

  const accentColor = isCpb ? 'text-emerald-400' : 'text-cyan-400';
  const accentBorder = isCpb ? 'border-emerald-500/30' : 'border-cyan-500/30';
  const accentBadge = isCpb ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5 px-1 sm:px-0">
      
      {/* Top Header Card */}
      <div className={`backdrop-blur-xl bg-slate-900/90 border ${accentBorder} rounded-2xl p-4 sm:p-5 shadow-2xl`}>
        <div className="flex items-center justify-between gap-3">
          
          {/* Title and Count */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Council Desk
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full ${accentBadge} font-mono text-xs font-bold border`}>
                {totalCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {eventConfig?.organization} {isCpb ? '• 3 Blocks' : `• ${activeUnitsCount}/10 Units Active`}
            </p>
          </div>

          {/* Action Buttons: PDF Export & Lock */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPDF(registrations, isCpb ? blockStats : unitStats, eventKey)}
              title="Export as PDF"
              aria-label="Export as PDF"
              className="w-10 h-10 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-600/20 transition active:scale-95 shrink-0 cursor-pointer"
            >
              <Download className="w-5 h-5" />
            </button>
            {onLock && (
              <button
                onClick={onLock}
                title="Lock Desk"
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Dashboard Metric Cards */}
      {isCpb ? (
        /* CPB Metrics: Total, Block distribution */
        <div className="space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Card: TOTAL */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalCount}</div>
              <p className="text-xs text-emerald-300/80 mt-1 font-medium">Council delegates</p>
            </div>

            {/* Block cards */}
            {blockStats.map(b => {
              const pct = totalCount > 0 ? Math.round((b.count / totalCount) * 100) : 0;
              return (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBlock(selectedBlock === b.name ? 'ALL' : b.name)}
                  className={`bg-slate-900/90 border rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md cursor-pointer transition active:scale-95 flex flex-col justify-between ${
                    selectedBlock === b.name 
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/40' 
                      : 'border-slate-800 hover:border-emerald-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{b.name}</span>
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <Layers className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                    <div className="text-[10px] text-emerald-400/90 font-semibold truncate flex items-center gap-1 mb-2">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span>{b.subtext}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">{b.count}</div>
                    <p className="text-xs text-emerald-300/80 mt-0.5 font-medium">{pct}% delegates</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Block Banner */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">LEADING BLOCK</span>
                  {topBlock.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                      Highest Registration
                    </span>
                  )}
                </div>
                <div className="text-base sm:text-lg font-bold text-white truncate">
                  {topBlock.count > 0 ? `${topBlock.name} (${topBlock.subtext})` : 'No registrations yet'}
                </div>
                <p className="text-xs text-emerald-300/80 mt-0.5 font-mono font-medium">
                  {topBlock.count > 0 ? `${topBlock.count} delegates registered` : 'Registrations will appear once delegates submit the form'}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VLM Metrics: Total & Active units */
        <div className="space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between text-cyan-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TOTAL</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalCount}</div>
              <p className="text-xs text-cyan-300/80 mt-1 font-medium">Council delegates</p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ACTIVE UNITS</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {activeUnitsCount}<span className="text-sm sm:text-base text-slate-400 font-normal">/10</span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-1 font-medium">
                {Math.round((activeUnitsCount / 10) * 100)}% coverage
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TOP UNIT</span>
                  {topUnit.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                      Leading
                    </span>
                  )}
                </div>
                <div className="text-base sm:text-lg font-bold text-white truncate" title={topUnit.name}>
                  {topUnit.count > 0 ? topUnit.name : 'No registrations yet'}
                </div>
                <p className="text-xs text-amber-300/80 mt-0.5 font-mono font-medium">
                  {topUnit.count > 0 ? `${topUnit.count} delegates registered` : 'Registrations will appear once submitted'}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Section */}
      {isCpb ? (
        /* CPB Breakdown: Block Selection Tabs */
        <div className="backdrop-blur-xl bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2.5 mb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Block Distribution</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                  3 Blocks
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tap a block to filter the delegates below
              </p>
            </div>

            {selectedBlock !== 'ALL' && (
              <button
                onClick={() => setSelectedBlock('ALL')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition active:scale-95 cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {blockStats.map(b => {
              const isSelected = selectedBlock === b.name;
              const maxCount = Math.max(...blockStats.map(s => s.count), 1);
              const percent = Math.round((b.count / maxCount) * 100);

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBlock(isSelected ? 'ALL' : b.name)}
                  className={`p-3 rounded-xl border text-left transition relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div 
                    className={`absolute bottom-0 left-0 top-0 opacity-15 pointer-events-none transition-all ${
                      isSelected ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative z-10 flex items-start justify-between gap-1">
                    <div>
                      <div className="font-bold text-xs text-white">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span>{b.subtext}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold shrink-0 ${
                      b.count > 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-slate-800/60 text-slate-500'
                    }`}>
                      {b.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* VLM Breakdown: Units & Designations Toggle */
        <div className="backdrop-blur-xl bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>{breakdownMode === 'units' ? 'Unit Registration Count' : 'Designation Count'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {breakdownMode === 'units' ? '10 Units' : '6 Roles'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {breakdownMode === 'units' ? 'Tap any unit to filter delegates below' : 'Tap any designation to filter delegates below'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {((breakdownMode === 'units' && selectedUnit !== 'ALL') || (breakdownMode === 'roles' && selectedDesignation !== 'ALL')) && (
                <button
                  onClick={() => {
                    if (breakdownMode === 'units') setSelectedUnit('ALL');
                    else setSelectedDesignation('ALL');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition active:scale-95 cursor-pointer"
                >
                  Show All
                </button>
              )}

              <div className="flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBreakdownMode('units')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    breakdownMode === 'units'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Units
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownMode('roles')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    breakdownMode === 'roles'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Designation
                </button>
              </div>
            </div>
          </div>

          {/* View 1: 10 Units Grid */}
          {breakdownMode === 'units' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {unitStats.map((u) => {
                const isSelected = selectedUnit === u.name;
                const maxCount = topUnit.count > 0 ? topUnit.count : 1;
                const percent = Math.round((u.count / maxCount) * 100);

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnit(isSelected ? 'ALL' : u.name)}
                    className={`p-2.5 rounded-xl border text-left transition relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div 
                      className={`absolute bottom-0 left-0 top-0 opacity-15 pointer-events-none transition-all ${
                        isSelected ? 'bg-cyan-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative z-10 flex items-start justify-between gap-1">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">
                        #{u.id}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                        u.count > 0 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                          : 'bg-slate-800/60 text-slate-500'
                      }`}>
                        {u.count}
                      </span>
                    </div>

                    <div className="relative z-10 mt-1 font-semibold text-xs text-white truncate" title={u.name}>
                      {u.name}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* View 2: 6 Designations Grid */}
          {breakdownMode === 'roles' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {designationStats.map((d) => {
                const isSelected = selectedDesignation === d.name;
                const maxCount = Math.max(...designationStats.map(s => s.count), 1);
                const percent = Math.round((d.count / maxCount) * 100);

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDesignation(isSelected ? 'ALL' : d.name)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div 
                      className={`absolute bottom-0 left-0 top-0 opacity-15 pointer-events-none transition-all ${
                        isSelected ? 'bg-cyan-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white truncate" title={d.name}>
                        {d.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold shrink-0 ${
                        d.count > 0 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                          : 'bg-slate-800/60 text-slate-500'
                      }`}>
                        {d.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className={`backdrop-blur-xl bg-slate-900/90 border ${accentBorder} rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-2.5`}>
        <div className="relative">
          <Search className={`w-4 h-4 ${accentColor} absolute left-3.5 top-3`} />
          <input
            type="text"
            placeholder="Search by name, mobile, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
          />
        </div>

        {/* Filters */}
        {isCpb ? (
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="ALL">All Blocks (3)</option>
              {CPB_BLOCKS.map(b => (
                <option key={b.id} value={b.name}>{b.name} ({b.subtext})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400 truncate"
            >
              <option value="ALL">All Units (10)</option>
              {UNITS.map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>

            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400 truncate"
            >
              <option value="ALL">All Roles (6)</option>
              {DESIGNATIONS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Active filters clear link */}
        {(searchTerm || (isCpb ? selectedBlock !== 'ALL' : (selectedUnit !== 'ALL' || selectedDesignation !== 'ALL'))) && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-0.5">
            <span>Showing {filteredList.length} of {totalCount}</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBlock('ALL');
                setSelectedUnit('ALL');
                setSelectedDesignation('ALL');
              }}
              className={`${accentColor} hover:underline font-bold cursor-pointer`}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Delegate Cards List */}
      <div className="space-y-2.5">
        {filteredList.map((delegate) => {
          const isMenuOpen = openMenuId === delegate.id;
          const blockInfo = isCpb ? CPB_BLOCKS.find(b => b.name === delegate.block || b.id === delegate.block) : null;
          const des = !isCpb ? DESIGNATIONS.find(d => d.name === delegate.designation) : null;

          return (
            <div 
              key={delegate.id} 
              className={`p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow hover:${accentBorder} transition space-y-2 relative`}
            >
              {/* Card Top: ID and Role / Block */}
              <div className="flex items-center justify-between gap-2">
                <span className={`font-mono font-bold ${accentColor} text-xs px-2.5 py-0.5 rounded-lg ${accentBadge} border`}>
                  {delegate.id}
                </span>

                {isCpb ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${blockInfo?.badgeColor || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                    {delegate.block || 'Block Qadisiyya'}
                  </span>
                ) : (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${des?.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'} truncate max-w-[200px]`}>
                    {delegate.designation}
                  </span>
                )}
              </div>

              {/* Delegate Info Row with 3-dot Action Menu */}
              <div className="flex items-start justify-between gap-2 pt-0.5">
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-white tracking-tight truncate">
                    {delegate.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                    <span className="text-slate-300 font-medium">{isCpb ? (blockInfo?.subtext || 'Cheriyaparamb Unit') : delegate.unit}</span>
                    <span>•</span>
                    <span className={`font-mono ${accentColor} font-semibold`}>+91 {delegate.mobile}</span>
                  </div>
                </div>

                {/* 3-Dot Action Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(isMenuOpen ? null : delegate.id)}
                    title="Delegate Options"
                    aria-label="Delegate Options"
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition active:scale-95 cursor-pointer ${
                      isMenuOpen 
                        ? `${accentBadge}` 
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/80'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* 3-Dot Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setOpenMenuId(null)} 
                      />

                      <div className="absolute right-0 top-10 z-40 w-44 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl py-1.5 backdrop-blur-xl divide-y divide-slate-800/80">
                        {/* Chat & Call */}
                        <div className="py-1">
                          <a
                            href={`https://wa.me/91${delegate.mobile}?text=${encodeURIComponent(`Salam ${delegate.name}, updates regarding ${eventConfig?.organization} Students Council 2026.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 transition"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>WhatsApp Chat</span>
                          </a>

                          <a
                            href={`tel:+91${delegate.mobile}`}
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Phone className={`w-4 h-4 ${accentColor} shrink-0`} />
                            <span>Call</span>
                          </a>
                        </div>

                        {/* View & Edit */}
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onOpenBadge(delegate);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition text-left cursor-pointer"
                          >
                            <Eye className={`w-4 h-4 ${accentColor} shrink-0`} />
                            <span>View Pass</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setEditingDelegate(delegate);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition text-left cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Delete */}
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleDelete(delegate.id, delegate.name);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition text-left cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}

        {/* Empty state */}
        {filteredList.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400">
            <p className="font-bold text-sm">
              {registrations.length === 0 ? 'No delegates registered yet' : 'No delegates found'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {registrations.length === 0 
                ? 'New registrations submitted via the portal will appear here in real-time.' 
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-sm bg-slate-900 border ${accentBorder} rounded-3xl p-5 sm:p-6 shadow-2xl text-white`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold">Edit: {editingDelegate.id}</h3>
              <button 
                onClick={() => setEditingDelegate(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingDelegate.name}
                  onChange={(e) => setEditingDelegate({ ...editingDelegate, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  inputMode="tel"
                  maxLength={10}
                  value={editingDelegate.mobile}
                  onChange={(e) => setEditingDelegate({ ...editingDelegate, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono"
                  required
                />
              </div>

              {isCpb ? (
                /* CPB Edit: Block selector */
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Block</label>
                  <select
                    value={editingDelegate.block || 'Block Qadisiyya'}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, block: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  >
                    {CPB_BLOCKS.map(b => (
                      <option key={b.id} value={b.name}>{b.name} ({b.subtext})</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* VLM Edit: Unit and Designation */
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Unit</label>
                    <select
                      value={editingDelegate.unit}
                      onChange={(e) => setEditingDelegate({ ...editingDelegate, unit: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    >
                      {UNITS.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Designation</label>
                    <select
                      value={editingDelegate.designation}
                      onChange={(e) => setEditingDelegate({ ...editingDelegate, designation: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    >
                      {DESIGNATIONS.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDelegate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl ${
                    isCpb 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  } text-white text-xs font-bold cursor-pointer`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
