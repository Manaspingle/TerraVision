import React, { useState } from 'react';
import { X, ShieldAlert, User, Mail, Lock, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { registerUserApi, sendWelcomeEmailApi } from '../api';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole: 'student' | 'admin' | 'master_admin';
  initialMode: 'login' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  initialMode,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<'student' | 'admin' | 'master_admin'>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. MASTER DEV GATEWAY VALIDATIONS
      if (role === 'master_admin') {
        if (mode === 'signup') {
          setError("Sign up is not allowed for Master Developer role. Please use Student or Admin sign up.");
          setLoading(false);
          return;
        }
        if (cleanEmail !== 'manaspingle.dev@gmail.com') {
          setError("Access Denied: Only Master Developer (manaspingle.dev@gmail.com) can log in through the Master Dev portal.");
          setLoading(false);
          return;
        }
        if (password !== 'luffy100@mnsA111Mx') {
          setError("Invalid Master Admin password. Access Denied.");
          setLoading(false);
          return;
        }
        // Valid Master Admin Login
        const masterUser: UserProfile = {
          uid: 'master-dev-manas',
          email: 'manaspingle.dev@gmail.com',
          displayName: 'Manas Pingle (Master Admin)',
          role: 'master_admin',
          status: 'active',
          isPro: true
        };
        onLoginSuccess(masterUser);
        onClose();
        return;
      }

      // 2. MASTER DEV EMAIL PROTECTION ON STUDENT/ADMIN TABS
      if (cleanEmail === 'manaspingle.dev@gmail.com') {
        setError("Access Denied: Master Developer account must sign in using the Master Dev portal.");
        setLoading(false);
        return;
      }

      // 3. SIGNUP FLOW FOR STUDENT / ADMIN
      if (mode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const name = displayName || email.split('@')[0];
        
        const res = await registerUserApi({
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          displayName: name,
          role: role
        });

        // Check if user already existed under a different role
        if (res.status === 'exists' && res.user && res.user.role !== role) {
          const portalName = res.user.role === 'admin' ? 'Admin' : 'Student';
          setError(`Access Denied: Account already exists as a ${res.user.role}. Please sign in using the ${portalName} portal.`);
          setLoading(false);
          return;
        }

        await sendWelcomeEmailApi(email, name);

        if (role === 'admin') {
          setInfo("⚡ Admin registration request submitted! Account status is pending developer approval. Developer has been notified.");
          setLoading(false);
          return;
        }

        const userProfile: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          displayName: name,
          role: 'student',
          status: 'active'
        };
        onLoginSuccess(userProfile);
        onClose();

      } else {
        // 4. LOGIN FLOW FOR STUDENT / ADMIN
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        
        const res = await registerUserApi({
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          displayName: displayName || userCred.user.email?.split('@')[0] || 'User',
          role: role
        });

        const actualRole = res.user?.role;

        // STRICT ROLE MISMATCH CHECK
        if (actualRole && actualRole !== role) {
          if (actualRole === 'student' && role === 'admin') {
            setError("Access Denied: Your account is registered as a Student. You cannot log in through the Admin portal. Please use the Student portal.");
          } else if (actualRole === 'admin' && role === 'student') {
            setError("Access Denied: Your account is registered as an Admin. You cannot log in through the Student portal. Please use the Admin portal.");
          } else if (actualRole === 'master_admin') {
            setError("Access Denied: Master Developer account must sign in using the Master Dev portal.");
          } else {
            setError(`Access Denied: Account role mismatch. You are registered as a ${actualRole}.`);
          }
          setLoading(false);
          return;
        }

        // ACCOUNT STATUS CHECKS
        if (res.user?.status === 'disabled') {
          setError("Due to unusual activities your account has been disabled by admin.");
          setLoading(false);
          return;
        }

        if (role === 'admin' && res.user?.status === 'pending_admin_approval') {
          setError("Your admin registration is pending developer approval. Please wait for developer authorization.");
          setLoading(false);
          return;
        }

        if (res.user?.status === 'rejected') {
          setError("Your admin registration request was disapproved by developer. Access denied.");
          setLoading(false);
          return;
        }

        const userProfile: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          displayName: res.user?.displayName || userCred.user.email?.split('@')[0] || 'User',
          role: (res.user?.role as 'student' | 'admin' | 'master_admin') || role,
          status: res.user?.status || 'active'
        };
        onLoginSuccess(userProfile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const userEmail = (userCred.user.email || '').trim().toLowerCase();
      const name = userCred.user.displayName || userEmail.split('@')[0];

      // MASTER DEV GOOGLE AUTH CHECK
      if (userEmail === 'manaspingle.dev@gmail.com') {
        if (role !== 'master_admin') {
          setError("Access Denied: Master Developer account must sign in using the Master Dev portal.");
          setLoading(false);
          return;
        }
        const masterUser: UserProfile = {
          uid: userCred.user.uid,
          email: 'manaspingle.dev@gmail.com',
          displayName: 'Manas Pingle (Master Admin)',
          role: 'master_admin',
          status: 'active',
          isPro: true
        };
        onLoginSuccess(masterUser);
        onClose();
        return;
      } else if (role === 'master_admin') {
        setError("Access Denied: Only Master Developer (manaspingle.dev@gmail.com) can log in through the Master Dev portal.");
        setLoading(false);
        return;
      }

      const res = await registerUserApi({
        uid: userCred.user.uid,
        email: userEmail,
        displayName: name,
        role: role
      });

      const actualRole = res.user?.role;

      // STRICT ROLE MISMATCH CHECK FOR GOOGLE SIGN IN
      if (actualRole && actualRole !== role) {
        if (actualRole === 'student' && role === 'admin') {
          setError("Access Denied: Your Google account is registered as a Student. You cannot log in through the Admin portal. Please use the Student portal.");
        } else if (actualRole === 'admin' && role === 'student') {
          setError("Access Denied: Your Google account is registered as an Admin. You cannot log in through the Student portal. Please use the Admin portal.");
        } else {
          setError(`Access Denied: Account role mismatch. You are registered as a ${actualRole}.`);
        }
        setLoading(false);
        return;
      }

      await sendWelcomeEmailApi(userEmail, name);

      if (res.user?.status === 'disabled') {
        setError("Due to unusual activities your account has been disabled by admin.");
        setLoading(false);
        return;
      }

      if (role === 'admin' && res.user?.status === 'pending_admin_approval') {
        setInfo("Google Admin registration recorded. Account status is pending developer approval.");
        setLoading(false);
        return;
      }

      if (res.user?.status === 'rejected') {
        setError("Your admin registration request was disapproved by developer. Access denied.");
        setLoading(false);
        return;
      }

      const userProfile: UserProfile = {
        uid: userCred.user.uid,
        email: userEmail,
        displayName: name,
        role: (res.user?.role as 'student' | 'admin' | 'master_admin') || role,
        status: res.user?.status || 'active'
      };

      onLoginSuccess(userProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel p-5 sm:p-8 border-slate-800 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Role Switcher Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-5 sm:mb-6 border border-slate-800 text-[11px]">
          <button
            onClick={() => { setRole('student'); setMode('login'); }}
            className={`flex-1 py-2 font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              role === 'student' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Student
          </button>

          <button
            onClick={() => { setRole('admin'); setMode('login'); }}
            className={`flex-1 py-2 font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              role === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin
          </button>

          <button
            onClick={() => { setRole('master_admin'); setMode('login'); }}
            className={`flex-1 py-2 font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              role === 'master_admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Master Dev
          </button>
        </div>

        <div className="text-center space-y-1.5 mb-5 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {role === 'master_admin' ? 'Master Developer Gateway' : role === 'admin' ? 'Admin Portal' : 'Student Portal'}
          </h3>
          <p className="text-xs text-slate-400">
            {role === 'master_admin'
              ? 'Authenticate with Master Developer credentials'
              : mode === 'login' ? 'Sign in to access TerraVision' : 'Create an account to begin satellite analysis'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-3.5 sm:space-y-4">
          {mode === 'signup' && role !== 'master_admin' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Manas Pingle"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-lg ${
              role === 'master_admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                : role === 'admin'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
            }`}
          >
            {loading ? 'Authenticating...' : role === 'master_admin' ? 'Sign In as Master Developer' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {role !== 'master_admin' && (
          <>
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Or continue with
              </span>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-center gap-3 text-xs font-semibold text-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="mt-5 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
