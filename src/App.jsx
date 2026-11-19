import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import DelegateBadge from './components/DelegateBadge';
import FindPass from './components/FindPass';
import AdminDashboard from './components/AdminDashboard';
import EventPosterModal from './components/EventPosterModal';
import { EVENT_DETAILS } from './data/constants';
import { 
  getStoredRegistrations, 
  fetchRegistrationsFromFirebase, 
  subscribeToRegistrations 
} from './utils/storage';
import { Lock, X, Shield, ArrowRight, KeyRound, MessageCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [activeBadge, setActiveBadge] = useState(null);
  const [registrationCount, setRegistrationCount] = useState(() => getStoredRegistrations().length);

  // Password Protection for Desk (Password: ssfvlm)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const refreshCount = async () => {
    const list = await fetchRegistrationsFromFirebase();
    setRegistrationCount(list.length);
  };

  useEffect(() => {
    refreshCount();
    const unsubscribe = subscribeToRegistrations((data) => {
      setRegistrationCount(data.length);
    });
    return unsubscribe;
  }, []);

  const handleRegistered = (newDelegate) => {
    refreshCount();
    setActiveBadge(newDelegate);
  };

  const handleOpenBadge = (delegate) => {
    setActiveBadge(delegate);
  };

  // Open Desk handler - asks for password if not unlocked
  const handleOpenDesk = () => {
    if (isAdminUnlocked) {
      setActiveTab('admin');
    } else {
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordModal(true);
    }
  };

  // Verify password 'ssfvlm'
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput.trim().toLowerCase() === 'ssfvlm') {
      setIsAdminUnlocked(true);
      setShowPasswordModal(false);
      setPasswordError('');
      setActiveTab('admin');
    } else {
      setPasswordError('Invalid password. Access denied.');
    }
  };

  const handleLockDesk = () => {
    setIsAdminUnlocked(false);
    setActiveTab('register');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden bg-tech-grid">
      
      {/* Background ambient lighting glows mirroring official poster */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed -bottom-40 -left-40 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed -bottom-40 -right-40 w-[400px] h-[400px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenDesk={handleOpenDesk}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10">
        {activeTab === 'register' && (
          <RegistrationForm 
            onRegistered={handleRegistered} 
            onSelectExisting={handleOpenBadge}
            onGoToFind={() => setActiveTab('find')}
          />
        )}

        {activeTab === 'find' && (
          <FindPass 
            onSelectDelegate={handleOpenBadge}
            onGoToRegister={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'poster' && (
          <EventPosterModal 
            onGoToRegister={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'admin' && (
          isAdminUnlocked ? (
            <AdminDashboard 
              onOpenBadge={handleOpenBadge}
              onLock={handleLockDesk}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <Lock className="w-12 h-12 text-cyan-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Council Desk Locked</h3>
              <p className="text-xs text-slate-400">
                Please enter the authorized password to access council delegate records.
              </p>
              <button
                onClick={handleOpenDesk}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25"
              >
                Enter Password
              </button>
            </div>
          )
        )}
      </main>

      {/* Delegate Badge Modal View */}
      {activeBadge && (
        <DelegateBadge 
          delegate={activeBadge} 
          onClose={() => setActiveBadge(null)}
        />
      )}

      {/* Desk Password Authentication Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-white animate-fadeIn">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Council Desk Access</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter authorized desk password to proceed
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border text-white text-base text-center tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition ${
                    passwordError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
                  }`}
                />
                {passwordError && (
                  <p className="text-xs text-rose-400 text-center font-semibold mt-2">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Unlock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Clean Footer with Clickable WhatsApp */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 px-4 text-center text-xs mt-auto">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
          <span>Developed by</span>
          <a
            href="https://wa.me/917034514372"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline inline-flex items-center gap-1.5 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Faaizy.sign</span>
          </a>
        </div>
      </footer>

    </div>
  );
}