import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mail, Phone, Shield, BookOpen, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';
import '../styles/auth.css';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [identifierValue, setIdentifierValue] = useState('');
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'OTP'
  const [otpArr, setOtpArr] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [timer, setTimer] = useState(300); // 5 mins
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef([]);

  const { sendOtpLogin, verifyOtpLogin } = useAuth();
  const navigate = useNavigate();

  // Handle countdowns
  useEffect(() => {
    let interval;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendOtp = async (event) => {
    if (event) event.preventDefault();
    setError('');

    if (!identifierValue) {
      setError(`Please enter your ${loginMethod === 'email' ? 'Email Address' : 'Phone Number'}`);
      return;
    }

    setLoading(true);
    try {
      const payload = loginMethod === 'email' ? { email: identifierValue } : { phone: identifierValue };
      await sendOtpLogin(payload);
      setStep('OTP');
      setTimer(300);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      if (err.response?.status === 429) {
        setResendCooldown(err.response?.data?.retryAfterSeconds || 30);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const otpString = otpArr.join('');
    if (otpString.length !== 6) {
      setError('Please enter a full 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = Object.assign(
        loginMethod === 'email' ? { email: identifierValue } : { phone: identifierValue },
        { otp: otpString }
      );
      
      await verifyOtpLogin(payload);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      if (err.response?.data?.message === 'Too many attempts. Request a new OTP.') {
          setStep('INPUT'); // Kick back
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpArr];
    newOtp[index] = value;
    setOtpArr(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArr[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-page flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="auth-stage mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        
        {/* Left Visual Stage */}
        <section className="auth-hero rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 flex h-full flex-col gap-8">
            <div className="space-y-6">
              <div className="auth-badge w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Krishna Flow
              </div>

              <div className="max-w-2xl space-y-5">
                <h1 className="text-5xl font-serif font-black uppercase leading-none tracking-tight text-[#f7d77d] sm:text-7xl">
                  Gita Wisdom
                </h1>
                <p className="auth-quote max-w-xl text-lg leading-relaxed sm:text-xl">
                  Enter securely with passwordless authentication. Quick verification using your phone or email.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <Shield className="mb-3 h-5 w-5 text-[#f7d77d]" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">Highly Secure</p>
                  <p className="mt-1 text-xs text-white/70">Using timed OTPs natively secured by hash encryption.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <Heart className="mb-3 h-5 w-5 text-[#f7d77d]" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">Easy Entry</p>
                  <p className="mt-1 text-xs text-white/70">No passwords to remember. One tap access.</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] sm:p-6 mt-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-[#06101e]/90 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.18),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(255,164,54,0.12),transparent_24%)]"></div>
              <img src={heroImage} alt="Krishna theme" className="auth-floating-image relative z-10 w-full rounded-[1.4rem] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.35)]" />
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <section className="auth-card rounded-[2rem] p-6 sm:p-8 flex flex-col justify-center relative">
          <div className="relative z-10">
            
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.32em] text-[#f7d77d]/85">Secure Portal</p>
                <h2 className="mt-2 text-3xl font-serif font-black uppercase tracking-tight text-white">Sign In</h2>
              </div>
              <Link to="/home" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-[#f7d77d]">
                Home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {step === 'INPUT' ? (
                <div className="animate-fade-in-up">
                    {/* Toggle Login Method */}
                    <div className="flex bg-[#0d1520] rounded-xl p-1 mb-6 border border-white/10">
                        <button 
                            onClick={() => { setLoginMethod('email'); setIdentifierValue(''); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${loginMethod === 'email' ? 'bg-[#1a2536] text-[#f7d77d] shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Mail className="w-4 h-4" /> Email
                        </button>
                        <button 
                            onClick={() => { setLoginMethod('phone'); setIdentifierValue(''); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-[#1a2536] text-[#f7d77d] shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Phone className="w-4 h-4" /> Phone
                        </button>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                            </label>
                            <input
                                type={loginMethod === 'email' ? 'email' : 'tel'}
                                required
                                value={identifierValue}
                                onChange={(event) => setIdentifierValue(event.target.value)}
                                onFocus={() => setFocusedField('id')}
                                onBlur={() => setFocusedField(null)}
                                placeholder={loginMethod === 'email' ? "arjuna@example.com" : "+91 9876543210"}
                                className={`auth-input ${focusedField === 'id' ? 'shadow-[0_0_0_4px_rgba(255,215,0,0.12)]' : ''}`}
                            />
                        </div>

                        <button type="submit" disabled={loading || resendCooldown > 0} className="auth-button mt-4 w-full px-5 py-3.5">
                            {loading ? 'Sending OTP...' : (resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Send Verification Code')}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="animate-fade-in-up">
                    <div className="mb-6">
                        <p className="text-white/70 text-sm leading-relaxed mb-4">
                            We've sent a 6-digit verification code to <strong className="text-[#f7d77d]">{identifierValue}</strong>.
                        </p>
                        
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                            <span>Enter OTP</span>
                            <span className={timer < 60 ? 'text-red-400' : 'text-[#f7d77d]'}>
                                {timer > 0 ? formatTime(timer) : 'Code Expired'}
                            </span>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="flex gap-2 justify-between">
                                {otpArr.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (otpInputRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 bg-black/30 border border-white/20 rounded-xl text-center text-2xl font-bold text-white focus:border-[#f7d77d] focus:shadow-[0_0_0_4px_rgba(255,215,0,0.15)] outline-none transition-all"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || timer === 0 || otpArr.join('').length !== 6} 
                                className="auth-button w-full px-5 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Complete Login'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                            <button
                                onClick={handleSendOtp}
                                disabled={resendCooldown > 0 || loading}
                                className="text-xs font-bold uppercase tracking-widest text-[#f7d77d] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                            <button
                                onClick={() => setStep('INPUT')}
                                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                            >
                                Change {loginMethod === 'email' ? 'Email' : 'Phone'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'INPUT' && (
              <div className="mt-8 text-center text-sm text-white/50 border-t border-white/10 pt-6">
                Passwordless authentication is heavily secured and replaces traditional passwords. By continuing, you agree to our spiritual guidelines.
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}
