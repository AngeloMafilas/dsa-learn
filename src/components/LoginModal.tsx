import React, { useState } from 'react';
import { X, Mail, ShieldAlert, KeyRound, User, Github, Monitor, Compass } from 'lucide-react';
import { dbService } from '../lib/db';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  showCloseButton?: boolean;
  onDemoLogin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  showCloseButton = true,
  onDemoLogin
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (isRegister && !displayName.trim()) {
      setError('Please specify a display name.');
      return;
    }

    setLoading(true);
    
    const runAuth = async () => {
      try {
        let profile;
        if (isRegister) {
          profile = await dbService.registerWithEmailAndPassword(email.trim(), password, displayName.trim());
        } else {
          profile = await dbService.loginWithEmailAndPassword(email.trim(), password);
        }
        onLoginSuccess(profile);
        onClose();
        
        // Reset state
        setEmail('');
        setDisplayName('');
        setPassword('');
      } catch (err: any) {
        console.error("Authentication action failed: ", err);
        if (err?.code === 'auth/invalid-credential' || err?.message?.includes('invalid-credential') || err?.message?.includes('INVALID_LOGIN_CREDENTIALS')) {
          setError('Invalid login credentials. Please verify your email and password.');
        } else if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('email-already-in-use') || err?.message?.includes('EMAIL_EXISTS')) {
          setError('This email is already in use by another developer.');
        } else if (err?.message?.includes('WEAK_PASSWORD')) {
          setError('Password is too weak. Please use at least 6 characters.');
        } else {
          setError(err?.message || 'Authentication failed. Please verify popup connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    runAuth();
  };

  const handleOAuthLogin = async (provider: string) => {
    setLoading(true);
    setError('');
    
    if (provider === 'Google') {
      try {
        const profile = await dbService.loginWithGoogle();
        onLoginSuccess(profile);
        onClose();
      } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError(`Google sign-in failed: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        const simulatedName = 'CodeMaster';
        const simulatedEmail = 'codemaster@github.com';
        const avatar = 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=150&h=150&q=80';

        const profile = dbService.loginUser(simulatedEmail, simulatedName, avatar);
        onLoginSuccess(profile);
        onClose();
        setLoading(false);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-850 bg-neutral-950 p-8 shadow-2xl transition-all duration-300"
        id="login-modal-card"
      >
        {/* Decorative background gradients */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white rounded-lg p-1.5 hover:bg-neutral-900 transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2.5">
            <KeyRound className="h-5.5 w-5.5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isRegister ? 'Join AlgoCode' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-[280px] mx-auto">
            {isRegister 
              ? 'Create a unified algorithm progress profile linked to local database storage.' 
              : 'Sign in to sync your submission metrics and active streak records.'
            }
          </p>
        </div>

        {/* Form Error alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 mb-4 animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 block">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500 pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none rounded-xl text-sm text-white transition placeholder-neutral-600 block"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500 pointer-events-none">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="alex.rivera@algocode.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none rounded-xl text-sm text-white transition placeholder-neutral-600 block"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-400 block">Password</label>
              {!isRegister && (
                <span className="text-[10px] text-amber-500 cursor-pointer hover:underline font-medium">Forgot password?</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500 pointer-events-none">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none rounded-xl text-sm text-white transition placeholder-neutral-600 block"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded-xl text-sm shadow-lg hover:shadow-amber-500/5 transition duration-150 disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider lines */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-neutral-850"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono font-bold tracking-wider text-neutral-500 uppercase">Or connect via</span>
          <div className="flex-grow border-t border-neutral-850"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3" id="login-oauth-grid">
          <button
            onClick={() => handleOAuthLogin('Google')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold select-none transition duration-150 active:scale-95"
          >
            <Compass className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Google</span>
          </button>
          
          <button
            onClick={() => handleOAuthLogin('GitHub')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold select-none transition duration-150 active:scale-95"
          >
            <Github className="h-4 w-4 shrink-0 text-amber-500" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Toggle between Register/Login */}
        <div className="text-center mt-6 text-xs text-neutral-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-amber-500 hover:text-amber-400 hover:underline font-bold transition focus:outline-none"
          >
            {isRegister ? 'Sign In Instead' : 'Create Free Account'}
          </button>
        </div>

        {onDemoLogin && (
          <div className="mt-5 pt-4 border-t border-neutral-900 flex flex-col items-center">
            <button
              onClick={onDemoLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-500 hover:text-amber-400 rounded-xl text-xs font-bold transition duration-150 active:scale-95 cursor-pointer"
            >
              <Monitor className="h-4 w-4" />
              <span>Explore as Demo Guest</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
