import React, { useState } from 'react';
import { Gem, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginScreen({ staff, onLogin }) {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleLogin = () => {
    if (!selectedStaff) {
      setError('Please select a staff member');
      return;
    }
    if (selectedStaff.pin === pin) {
      setError('');
      onLogin(selectedStaff);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0718] via-[#0f0c1e] to-[#1a0a2e] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/40 gold-pulse">
            <Gem size={36} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">VJS Jewellery</h1>
          <p className="text-purple-300 text-sm tracking-widest uppercase font-medium">Billing System</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-purple-800/40 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
            <Lock size={18} className="text-amber-400" />
            Staff Login
          </h2>

          {/* Staff Selection */}
          <div className="mb-6">
            <label className="text-purple-300 text-sm font-medium mb-3 block">Select Staff Member</label>
            <div className="grid grid-cols-2 gap-2">
              {staff.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setPin(''); setError(''); }}
                  className={`
                    p-3 rounded-xl border text-left transition-all duration-200
                    ${selectedStaff?.id === s.id
                      ? 'border-amber-400/60 bg-amber-400/10 text-white'
                      : 'border-purple-800/40 bg-white/5 text-purple-300 hover:border-purple-600 hover:bg-purple-900/20'
                    }
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm mb-2">
                    {s.name.charAt(0)}
                  </div>
                  <p className="font-medium text-sm truncate">{s.name}</p>
                  <p className="text-xs opacity-60">{s.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* PIN Input */}
          {selectedStaff && (
            <div className="mb-6 animate-fade-in">
              <label className="text-purple-300 text-sm font-medium mb-3 block">Enter PIN</label>
              <div className="relative mb-4">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your PIN"
                  maxLength={6}
                  className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-3 text-white placeholder-purple-500
                    focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all text-center text-2xl tracking-[0.5em]"
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9,'C',0,'✓'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      if (k === 'C') setPin(p => p.slice(0, -1));
                      else if (k === '✓') handleLogin();
                      else handlePinInput(String(k));
                    }}
                    className={`
                      py-3 rounded-xl font-semibold text-lg transition-all duration-150 active:scale-95
                      ${k === '✓'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                        : k === 'C'
                        ? 'bg-red-900/30 text-red-400 border border-red-800/40 hover:bg-red-900/50'
                        : 'bg-white/5 text-white border border-purple-800/40 hover:bg-purple-900/30 hover:border-purple-600'
                      }
                    `}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3 mb-4 animate-fade-in">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Button */}
          {selectedStaff && (
            <button
              onClick={handleLogin}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold
                hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-purple-900/50
                hover:shadow-purple-900/70 active:scale-[0.98] animate-fade-in"
            >
              Login as {selectedStaff.name}
            </button>
          )}

          <p className="text-center text-purple-500 text-xs mt-4">
            Default PINs: 1234, 5678, 9012, 3456, Admin: 0000
          </p>
        </div>
      </div>
    </div>
  );
}
