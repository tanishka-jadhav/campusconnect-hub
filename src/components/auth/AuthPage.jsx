import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { Shield, GraduationCap, AlertTriangle, Mail, Lock, User, Building } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" strokeWidth="0" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function AuthPage() {
  const { signIn, signUp, validateEducationalEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  // Google SSO Simulation States
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');

  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (!isLogin && val.length > 3) {
      setEmailValid(validateEducationalEmail(val));
    } else {
      setEmailValid(null);
    }
  }

  // Intercept Google SSO redirect, handle via high-fidelity simulation
  function handleGoogleSignIn() {
    setError('');
    setSuccess('');
    setMockName('');
    setMockEmail('');
    setShowGoogleMock(true);
  }

  async function handleMockGoogleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!validateEducationalEmail(mockEmail)) {
      setError('Only institutional educational emails (.edu) are permitted for SSO simulation.');
      setLoading(false);
      return;
    }

    const mockPassword = 'mock-google-sso-pass-9921';
    const emailDomain = mockEmail.split('@')[1];

    try {
      // 1. Attempt dynamic signup
      const { data, error: signupError } = await signUp(mockEmail, mockPassword, mockName, 'University Member');
      
      if (signupError) {
        // 2. If user already exists, authenticate directly with the fallback password
        if (signupError.message.includes('already registered') || signupError.message.includes('User already registered') || signupError.message.includes('already exists')) {
          const { error: signinError } = await signIn(mockEmail, mockPassword);
          if (signinError) {
            setError(signinError.message);
            setLoading(false);
            return;
          }
        } else {
          setError(signupError.message);
          setLoading(false);
          return;
        }
      }
      
      setLoading(false);
      setShowGoogleMock(false);
    } catch (err) {
      setError('SSO Handshake failed. Please check connection and try again.');
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError.message);
        }
      } else {
        if (!validateEducationalEmail(email)) {
          setError('Registration requires a valid educational email address (e.g., you@college.edu).');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const { error: authError } = await signUp(email, password, fullName, college);
        if (authError) {
          setError(authError.message);
        } else {
          setSuccess('Account created! Check your email for a confirmation link.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 lg:p-12 relative overflow-hidden transition-colors duration-200">
      {/* Ambient glassmorphic glowing meshes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 dark:from-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 dark:from-indigo-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 animate-fade-in">
        {/* Left Column: Brand & Security Verification Notice & Google OAuth */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-center">
          {/* Logo & Header */}
          <div className="flex items-center gap-3.5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-550 shadow-lg shadow-cyan-500/20 shrink-0">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">CampusConnect</h1>
              <p className="text-xs text-cyan-550 font-mono tracking-widest uppercase mt-1">Verified Workspace</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
              A premium space designed <span className="gradient-text">strictly for students</span>.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Securely trade campus goods, co-lease local housing, recruit hackathon teammates, and utilize advanced AI summaries.
            </p>
          </div>

          {/* High-Fidelity Accountability notice block */}
          <div className="glass rounded-2xl p-6 border-l-4 border-l-amber-500 border-amber-500/30 shadow-xl shadow-amber-550/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <Shield className="h-20 w-20 text-amber-500" />
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-450 shrink-0 h-10 w-10 flex items-center justify-center border border-amber-500/20">
                <Shield className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-450">Institutional Accountability Notice</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  This workspace is restricted to active students. All interactions require academic authentication (.edu / .ac.uk signature). Misrepresentation or guideline violation will result in suspension and dean-level reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Google OAuth Section */}
          <div className="glass rounded-2xl p-6 border border-border space-y-4 shadow-xl">
            <div>
              <p className="text-xs text-foreground font-bold uppercase tracking-wider">Single Sign-On Authentication</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Use your institutional Google account for instant registration.</p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center h-12 rounded-xl bg-card border border-border hover:border-cyan-500/40 hover:bg-secondary/40 active:scale-[0.98] transition-all duration-150 text-foreground text-sm font-semibold cursor-pointer shadow-md"
            >
              <GoogleIcon />
              Continue with Google Workspace
            </button>
          </div>
        </div>

        {/* Right Column: Credentials Auth Card */}
        <div className="lg:col-span-6">
          <div className="glass-card rounded-3xl p-8 border border-border shadow-2xl relative overflow-hidden">
            {/* Ambient inner card glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Toggle tabs */}
            <div className="flex rounded-xl bg-background/50 p-1 border border-border mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); setEmailValid(null); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isLogin
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  !isLogin
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Register Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Full Name
                    </label>
                    <Input
                      id="auth-fullname"
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-secondary/40 border-border focus:border-cyan-500 focus:ring-cyan-500/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      College / University
                    </label>
                    <Input
                      id="auth-college"
                      type="text"
                      placeholder="MIT, Stanford, etc."
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                      className="bg-secondary/40 border-border focus:border-cyan-500 focus:ring-cyan-500/10"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder={isLogin ? 'you@email.com' : 'you@college.edu'}
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={`bg-secondary/40 border-border focus:border-cyan-500 focus:ring-cyan-500/10 ${
                      emailValid === false
                        ? 'border-red-500/50 focus:ring-red-500/10 focus:border-red-500'
                        : emailValid === true
                        ? 'border-emerald-500/50 focus:ring-emerald-500/10 focus:border-emerald-500'
                        : ''
                    }`}
                  />
                  {!isLogin && emailValid === false && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-550">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[11px] font-medium">Must be a valid institutional domain (.edu)</span>
                    </div>
                  )}
                  {!isLogin && emailValid === true && (
                    <div className="flex items-center gap-1.5 mt-2 text-emerald-600 dark:text-emerald-450">
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[11px] font-medium">Authorized domain signature detected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Secret Password
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-secondary/40 border-border focus:border-cyan-500 focus:ring-cyan-500/10"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-650 dark:text-red-400 animate-fade-in flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-450 animate-fade-in flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full h-11 text-xs font-bold rounded-xl mt-2 select-none shadow-md shadow-cyan-500/10 cursor-pointer"
                disabled={loading || (!isLogin && emailValid === false)}
              >
                {loading ? (
                  <span className="flex items-center gap-2.5 justify-center">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Authenticating Credentials...' : 'Registering Academic Signature...'}
                  </span>
                ) : isLogin ? (
                  'Sign In to Workspace'
                ) : (
                  'Activate Student Profile'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Google Workspace SSO Simulation Modal */}
      {showGoogleMock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-200 animate-fade-in">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-cyan-500/30 bg-slate-900/40 relative overflow-hidden shadow-2xl text-left">
            <div className="absolute top-[-10px] right-[-10px] p-3 opacity-5 pointer-events-none">
              <GraduationCap className="h-28 w-28 text-cyan-400" />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 border border-cyan-500/30 h-10 w-10 flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-foreground">Google Workspace SSO (Simulation)</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Enter an educational email address to simulate the institutional Google single sign-on authentication handshake.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleMockGoogleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Student Name</label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="bg-secondary/40 border-border focus:border-cyan-500 focus:ring-cyan-500/10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Academic Email Address</label>
                <Input
                  type="email"
                  placeholder="you@college.edu"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  className="bg-secondary/40 border-border focus:border-cyan-500 focus:ring-cyan-500/10 text-xs"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 animate-fade-in flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowGoogleMock(false); setMockName(''); setMockEmail(''); setError(''); }}
                  className="h-10 px-4 rounded-xl text-xs font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/80 text-white cursor-pointer"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In with SSO'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
