import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Building, Award, Search, 
  Download, Phone, MessageCircle, Eye, Edit2, Trash2, 
  X, MoreVertical
} from 'lucide-react';
import { UNITS, DESIGNATIONS } from '../data/constants';
import { 
  getStoredRegistrations, 
  fetchRegistrationsFromFirebase,
  subscribeToRegistrations,
  deleteRegistration, 
  updateRegistration, 
  exportToPDF
} from '../utils/storage';

export default function AdminDashboard({ onOpenBadge }) {
  const [registrations, setRegistrations] = useState(() => getStoredRegistrations());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedDesignation, setSelectedDesignation] = useState('ALL');

  // Breakdown toggle mode ('units' or 'roles')
  const [breakdownMode, setBreakdownMode] = useState('units');

  // Edit Modal State
  const [editingDelegate, setEditingDelegate] = useState(null);

  // 3-dot dropdown active state (tracks delegate ID)
  const [openMenuId, setOpenMenuId] = useState(null);

  // Real-time synchronization with Firebase Database
  useEffect(() => {
    fetchRegistrationsFromFirebase().then(setRegistrations);
    const unsubscribe = subscribeToRegistrations((data) => {
      setRegistrations(data);
    });
    return unsubscribe;
  }, []);

  const totalCount = registrations.length;

  // Calculate unit statistics for all 10 units
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

  // Active units count
  const activeUnitsCount = useMemo(() => {
    return unitStats.filter(u => u.count > 0).length;
  }, [unitStats]);

  // Calculate designation statistics for all 6 roles
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

  // Top Unit
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

      const matchesUnit = selectedUnit === 'ALL' || item.unit === selectedUnit;
      const matchesDes = selectedDesignation === 'ALL' || item.designation === selectedDesignation;

      return matchesSearch && matchesUnit && matchesDes;
    });
  }, [registrations, searchTerm, selectedUnit, selectedDesignation]);

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name} (${id})?`)) {
      const updated = await deleteRegistration(id);
      setRegistrations(updated);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDelegate) return;
    const updated = await updateRegistration(editingDelegate.id, editingDelegate);
    setRegistrations(updated);
    setEditingDelegate(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5 px-1 sm:px-0">
      
      {/* Top Header Card - Simple, Clean & Mobile First with ONLY EXPORT ICON */}
      <div className="backdrop-blur-xl bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          
          {/* Title and Count */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Council Desk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                {totalCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              SSF Velimukku Sector • {activeUnitsCount}/10 Units Active
            </p>
          </div>

          {/* Action Button - ONLY EXPORT ICON (PDF) */}
          <div>
            <button
              onClick={() => exportToPDF(registrations, unitStats)}
              title="Export as PDF"
              aria-label="Export as PDF"
              className="w-10 h-10 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-600/20 transition active:scale-95 shrink-0"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Dashboard Metric Cards */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* Row 1: TOTAL & ACTIVE UNITS */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Card 1: TOTAL */}
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

          {/* Card 2: Active Units */}
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

        {/* Row 2: TOP UNIT (Full width card) */}
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

      {/* Unit & Designation Breakdown Card with Toggle */}
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
            {/* Show All reset button if filtered */}
            {((breakdownMode === 'units' && selectedUnit !== 'ALL') || (breakdownMode === 'roles' && selectedDesignation !== 'ALL')) && (
              <button
                onClick={() => {
                  if (breakdownMode === 'units') setSelectedUnit('ALL');
                  else setSelectedDesignation('ALL');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition active:scale-95"
              >
                Show All
              </button>
            )}

            {/* Segmented Toggle Switch */}
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
                  {/* Progress bar fill in background */}
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
                  {/* Progress bar fill in background */}
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

      {/* Search & Filter Bar */}
      <div className="backdrop-blur-xl bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, mobile, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
          />
        </div>

        {/* Quick Filters: Unit & Role side by side */}
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

        {/* Active filters clear link */}
        {(searchTerm || selectedUnit !== 'ALL' || selectedDesignation !== 'ALL') && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-0.5">
            <span>Showing {filteredList.length} of {totalCount}</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedUnit('ALL');
                setSelectedDesignation('ALL');
              }}
              className="text-cyan-400 hover:underline font-bold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Delegate Cards List */}
      <div className="space-y-2.5">
        {filteredList.map((delegate) => {
          const des = DESIGNATIONS.find(d => d.name === delegate.designation);
          const isMenuOpen = openMenuId === delegate.id;

          return (
            <div 
              key={delegate.id} 
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow hover:border-cyan-500/30 transition space-y-2 relative"
            >
              {/* Card Top: ID and Role */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-cyan-400 text-xs px-2.5 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30">
                  {delegate.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${des?.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'} truncate max-w-[200px]`}>
                  {delegate.designation}
                </span>
              </div>

              {/* Delegate Info Row with 3-dot Action Menu at right side of name */}
              <div className="flex items-start justify-between gap-2 pt-0.5">
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-white tracking-tight truncate">
                    {delegate.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-slate-300 font-medium">{delegate.unit}</span>
                    <span>•</span>
                    <span className="font-mono text-cyan-300 font-semibold">+91 {delegate.mobile}</span>
                  </div>
                </div>

                {/* 3-Dot Action Button at Right Side of Name */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(isMenuOpen ? null : delegate.id)}
                    title="Delegate Options"
                    aria-label="Delegate Options"
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition active:scale-95 ${
                      isMenuOpen 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/80'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* 3-Dot Dropdown Menu containing all actions */}
                  {isMenuOpen && (
                    <>
                      {/* Invisible backdrop to dismiss on tap outside */}
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setOpenMenuId(null)} 
                      />

                      <div className="absolute right-0 top-10 z-40 w-44 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl py-1.5 backdrop-blur-xl divide-y divide-slate-800/80">
                        {/* Chat & Call */}
                        <div className="py-1">
                          <a
                            href={`https://wa.me/91${delegate.mobile}?text=${encodeURIComponent(`Salam ${delegate.name}, updates regarding SSF Velimukku Sector Students Council 2026.`)}`}
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
                            <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
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
                            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
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
          <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold">Edit: {editingDelegate.id}</h3>
              <button 
                onClick={() => setEditingDelegate(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400"
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDelegate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold"
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