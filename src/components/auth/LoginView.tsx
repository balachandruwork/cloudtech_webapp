import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CloudTechLogo } from '../common/CloudTechLogo';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { login, settings } = useApp();

  const [email, setEmail] = useState('admin@cloudtech.in');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpNote, setShowHelpNote] = useState(false);

  const quickRoles: Array<{
    role: UserRole;
    shortLabel: string;
    email: string;
    password: string;
    icon: React.ElementType;
  }> = [
    {
      role: 'Admin',
      shortLabel: 'Admin',
      email: 'admin@cloudtech.in',
      password: 'admin123',
      icon: Shield,
    },
    {
      role: 'Operations Manager',
      shortLabel: 'Operations',
      email: 'ops@cloudtech.in',
      password: 'ops123',
      icon: Briefcase,
    },
    {
      role: 'Service Technician',
      shortLabel: 'Technician',
      email: 'tech@cloudtech.in',
      password: 'tech123',
      icon: Wrench,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email address and password.');
      return;
    }

    const result = login(email.trim(), password, rememberMe);
    if (!result.success) {
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  const handleSelectRole = (accEmail: string, accPassword: string) => {
    setEmail(accEmail);
    setPassword(accPassword);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between overflow-hidden">
      {/* Top Brand Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#073DBB] via-[#087BEF] to-[#00D5E8] shrink-0" />

      {/* Subtle Ambient Background Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[340px] rounded-full bg-gradient-to-r from-[#073DBB]/8 via-[#087BEF]/10 to-[#00D5E8]/10 blur-3xl"
      />

      {/* Centered Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[430px] space-y-6">
          {/* Clean Brand Lockup */}
          <div className="flex justify-center">
            <CloudTechLogo variant="full" size="md" />
          </div>

          {/* Neat Elevated Login Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-lg shadow-slate-200/60 p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Sign In
              </h1>
              <p className="text-xs text-slate-500">
                Enter your credentials to access your CloudTech workspace
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="name@cloudtech.in"
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#087BEF] focus:ring-2 focus:ring-[#087BEF]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#087BEF] focus:ring-2 focus:ring-[#087BEF]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password Row */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#073DBB] focus:ring-[#087BEF]"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowHelpNote((prev) => !prev)}
                  className="text-xs font-semibold text-[#073DBB] hover:text-[#087BEF] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {showHelpNote && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  Contact your CloudTech Administrator at{' '}
                  <span className="font-mono font-semibold">{settings.email}</span> to reset your account credentials.
                </div>
              )}

              {/* Primary Sign In CTA */}
              <button
                type="submit"
                className="w-full min-h-[46px] px-4 py-2.5 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Compact Role Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 text-center">
                Quick Fill Role Credentials
              </div>
              <div className="grid grid-cols-3 gap-2">
                {quickRoles.map((item) => {
                  const Icon = item.icon;
                  const active = email.toLowerCase() === item.email.toLowerCase();

                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleSelectRole(item.email, item.password)}
                      className={`min-h-[40px] px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-blue-50 border-[#087BEF] text-[#073DBB]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-[11px] text-slate-400">
        {settings.companyName} · {settings.brandTagline}
      </footer>
    </div>
  );
};
