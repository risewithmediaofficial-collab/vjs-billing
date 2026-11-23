import React, { useState } from 'react';
import { Gem, Eye, EyeOff, AlertCircle, LogIn, User, Lock, ArrowLeft } from 'lucide-react';
import { authApi, setToken } from '../api.js';

export default function LoginScreen({ onLogin, onBackToLanding, redirectReason = null }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await authApi.login(username.trim(), password.trim());
      setToken(result.token);
      onLogin(result.user);
    } catch (err) {
      const msg = err.message || '';
      // Classify the error for the user
      if (msg.includes('Unable to connect') || msg.includes('NetworkError') || msg.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else if (msg.includes('Server error') || msg.includes('500')) {
        setError('Server error. Please try again in a moment.');
      } else if (msg.includes('not found') || msg.includes('404') || msg.includes('No user')) {
        setError('No account found with this username. Please check and try again.');
      } else if (msg.includes('inactive') || msg.includes('disabled')) {
        setError('Your account is inactive. Please contact your administrator.');
      } else if (msg.includes('password') || msg.includes('incorrect') || msg.includes('Invalid') || msg.includes('401') || msg.includes('wrong')) {
        setError('Incorrect password or username. Please try again.');
      } else {
        setError(msg || 'Username or password is incorrect. Please try again.');
      }
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffd6]/40 via-[#fefefe] to-[#cbadab]/30 flex items-center justify-center p-4 relative">
      {/* Soft background luxury glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffffd6] rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#cbadab]/40 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in space-y-4">
        
        {/* Back to Storefront Link */}
        {onBackToLanding && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#551f1f] hover:text-[#421616] bg-white/90 border border-[#cbadab] px-3.5 py-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Storefront Website</span>
            </button>
          </div>
        )}

        {/* Logo / Header with Luxury Palette */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#551f1f] border-2 border-[#dccd88] flex items-center justify-center mx-auto mb-3 shadow-xl gold-pulse">
            <Gem size={34} className="text-[#ffffd6]" />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-[#551f1f] tracking-wider mb-0.5">
            VJS JEWELLERY
          </h1>
          <p className="text-[#a49141] text-xs tracking-widest uppercase font-bold">
            Staff &amp; Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#cbadab]/60 p-7 sm:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-[#ffffd6] border border-[#dccd88] flex items-center justify-center text-[#551f1f]">
              <LogIn size={15} />
            </div>
            <h2 className="text-[#551f1f] font-serif font-bold text-lg">Staff Sign In</h2>
          </div>

          {redirectReason && (
            <div className="mb-4 bg-[#ffffd6] border border-[#dccd88] text-[#551f1f] text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle size={15} className="text-[#a49141] shrink-0" />
              <span>{redirectReason}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs text-gray-700 font-bold uppercase tracking-wider mb-1.5 block">Staff Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. System Admin"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-[#551f1f] focus:ring-2 focus:ring-[#dccd88]/40 transition-all bg-gray-50/50 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-700 font-bold uppercase tracking-wider mb-1.5 block">PIN / Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter staff PIN"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-2.5 text-gray-900 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-[#551f1f] focus:ring-2 focus:ring-[#dccd88]/40 transition-all bg-gray-50/50 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mt-4 animate-fade-in text-xs font-semibold">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Button in Royal Maroon & Gold */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-full bg-[#551f1f] hover:bg-[#421616] text-[#ffffd6] font-bold text-xs uppercase tracking-wider
              transition-all duration-200 shadow-md shadow-[#551f1f]/20
              active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border border-[#dccd88]/40"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-[#ffffd6]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <LogIn size={15} className="text-[#dccd88]" />
            )}
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>

          <p className="text-center text-gray-400 text-[11px] mt-4">
            Default Admin: <strong className="text-gray-700">System Admin</strong> • PIN: <strong className="text-gray-700">0000</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
