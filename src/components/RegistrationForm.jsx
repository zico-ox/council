import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, Phone, Building2, Award, AlertCircle, ArrowRight, Sparkles, ShieldCheck, Search } from 'lucide-react';
import { UNITS, DESIGNATIONS } from '../data/constants';
import { saveRegistration, getStoredRegistrations, fetchRegistrationsFromFirebase } from '../utils/storage';

export default function RegistrationForm({ onRegistered, onSelectExisting, onGoToFind }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    unit: '',
    designation: ''
  });

  const [errors, setErrors] = useState({});
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync latest from Firebase on mount
  useEffect(() => {
    fetchRegistrationsFromFirebase();
  }, []);

  // Validate mobile and check for duplicates in real-time
  const handleMobileChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // numbers only
    const trimmedVal = rawVal.slice(0, 10); // max 10 digits
    setFormData(prev => ({ ...prev, mobile: trimmedVal }));

    if (errors.mobile) {
      setErrors(prev => ({ ...prev, mobile: null }));
    }

    if (trimmedVal.length === 10) {
      const existing = getStoredRegistrations();
      const match = existing.find(reg => reg.mobile === trimmedVal);
      setDuplicateMatch(match || null);
    } else {
      setDuplicateMatch(null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters';
    }

    if (!formData.mobile) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      errs.mobile = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!formData.unit) {
      errs.unit = 'Please select your Unit';
    }

    if (!formData.designation) {
      errs.designation = 'Please select your Designation / Role';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (duplicateMatch) {
      onSelectExisting(duplicateMatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const newDelegate = await saveRegistration({
        name: formData.name.trim(),
        mobile: formData.mobile,
        unit: formData.unit,
        designation: formData.designation
      });

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if not supported
      }

      onRegistered(newDelegate);
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Could not complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-0">

      {/* Mobile Top Quick Action: Already Registered */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Already registered for the council?</span>
        </div>
        <button
          type="button"
          onClick={onGoToFind}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30 transition text-xs shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Find My Pass</span>
        </button>
      </div>

      {/* Main Registration Form Card */}
      <div className="relative backdrop-blur-xl bg-slate-900/85 border border-cyan-500/30 rounded-3xl shadow-2xl p-5 sm:p-8 sm:p-10 overflow-hidden">

        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] sm:text-xs font-semibold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Delegate Registration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Students Council Registration
          </h2>
        </div>

        {/* Duplicate Phone Notice */}
        {duplicateMatch && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  This mobile number is already registered!
                </p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Registered as <span className="font-semibold text-white">{duplicateMatch.name}</span> ({duplicateMatch.unit} - {duplicateMatch.designation})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectExisting(duplicateMatch)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition text-center shadow"
            >
              View Pass
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative z-10">

          {/* FIELD 1: FULL NAME */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Name</span>
                <span className="text-rose-400">*</span>
              </span>
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Muhammed Fayis"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
              }}
              className={`w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-950/80 border text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition ${errors.name ? 'border-rose-500' : 'border-cyan-500/30 hover:border-cyan-500/60'
                }`}
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1.5">{errors.name}</p>}
          </div>

          {/* FIELD 2: MOBILE NUMBER */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mobile Number</span>
                <span className="text-rose-400">*</span>
              </span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 sm:left-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400 border-r border-slate-700/80 pr-3 pointer-events-none">
                <span>🇮🇳 +91</span>
              </div>
              <input
                type="tel"
                inputMode="tel"
                placeholder="9876543210"
                maxLength={10}
                value={formData.mobile}
                onChange={handleMobileChange}
                className={`w-full pl-24 sm:pl-28 pr-4 py-3 sm:py-3.5 rounded-2xl bg-slate-950/80 border text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-mono tracking-wider ${errors.mobile ? 'border-rose-500' : 'border-cyan-500/30 hover:border-cyan-500/60'
                  }`}
              />
            </div>
            {errors.mobile && <p className="text-xs text-rose-400 mt-1.5">{errors.mobile}</p>}
          </div>

          {/* FIELD 3: UNIT (10 Official Units) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Unit</span>
                <span className="text-rose-400">*</span>
              </span>
            </label>

            <select
              value={formData.unit}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, unit: e.target.value }));
                if (errors.unit) setErrors(prev => ({ ...prev, unit: null }));
              }}
              className={`w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-950/90 border text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition ${errors.unit ? 'border-rose-500' : 'border-cyan-500/30 hover:border-cyan-500/60'
                }`}
            >
              <option value="" className="bg-slate-950 text-slate-400">
                -- Select Your Unit --
              </option>
              {UNITS.map(unit => (
                <option key={unit.id} value={unit.name} className="bg-slate-950 text-white py-1">
                  {unit.id}. {unit.name}
                </option>
              ))}
            </select>
            {errors.unit && <p className="text-xs text-rose-400 mt-1.5">{errors.unit}</p>}
          </div>

          {/* FIELD 4: DESIGNATION */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>Designation / Role</span>
                <span className="text-rose-400">*</span>
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {DESIGNATIONS.map(item => {
                const isSelected = formData.designation === item.name;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, designation: item.name }));
                      if (errors.designation) setErrors(prev => ({ ...prev, designation: null }));
                    }}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border text-left transition active:scale-[0.99] min-h-[52px] ${isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20 text-white ring-1 ring-cyan-400'
                      : 'bg-slate-950/60 border-slate-800/90 hover:border-cyan-500/30 text-slate-300 hover:text-white'
                      }`}
                  >
                    <div className="pr-2">
                      <div className="text-xs sm:text-sm font-bold text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-cyan-400/90 font-medium">
                        {item.roleDescription}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'
                      }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.designation && <p className="text-xs text-rose-400 mt-1.5">{errors.designation}</p>}
          </div>

          {/* Big Thumb-friendly Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-cyan-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2.5 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering Delegate...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-cyan-200" />
                  <span>Register & Get Digital Pass</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}