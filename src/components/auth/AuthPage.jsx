import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, GraduationCap, AlertTriangle, Mail, Lock, User, Building } from 'lucide-react';

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

  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (!isLogin && val.length > 3) {
      setEmailValid(validateEducationalEmail(val));
    } else {
      setEmailValid(null);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-start/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-end/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-mid/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end mb-4 shadow-lg animate-pulse-glow">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">CampusConnect Hub</h1>
          <p className="text-muted-foreground mt-2">Your unified campus ecosystem</p>
        </div>

        {/* Institutional Accountability Banner */}
        <div className="glass rounded-xl p-4 mb-6 border border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning">Institutional Accountability Notice</p>
              <p className="text-xs text-muted-foreground mt-1">
                This platform is exclusively for verified students of accredited educational institutions. 
                All activity is linked to your institutional identity. Misuse, impersonation, or violation 
                of community guidelines will result in permanent suspension and may be reported to your institution.
              </p>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-6 shadow-xl">
          {/* Tab Toggle */}
          <div className="flex rounded-xl bg-secondary/50 p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); setEmailValid(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                isLogin
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <Input
                    id="auth-fullname"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    College / University
                  </label>
                  <Input
                    id="auth-college"
                    type="text"
                    placeholder="MIT, Stanford, etc."
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </label>
              <div className="relative">
                <Input
                  id="auth-email"
                  type="email"
                  placeholder={isLogin ? 'you@email.com' : 'you@college.edu'}
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={
                    emailValid === false
                      ? 'border-destructive focus:ring-destructive/50'
                      : emailValid === true
                      ? 'border-success focus:ring-success/50'
                      : ''
                  }
                />
                {!isLogin && emailValid === false && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs text-destructive">Must be a .edu institutional email</span>
                  </div>
                )}
                {!isLogin && emailValid === true && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Shield className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs text-success">Valid educational domain</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </label>
              <Input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-sm text-success animate-fade-in">
                {success}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading || (!isLogin && emailValid === false)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By using CampusConnect Hub, you agree to uphold academic integrity and community standards.
        </p>
      </div>
    </div>
  );
}
