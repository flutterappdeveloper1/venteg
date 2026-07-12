import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('অনুগ্রহ করে সব তথ্য প্রদান করুন।');
      setLoading(false);
      return;
    }

    if (isSignUp && !name) {
      setError('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      setLoading(false);
      return;
    }

    const lowerEmail = email.toLowerCase().trim();

    if (lowerEmail === 'ventegksy@gmail.com') {
      if (isSignUp) {
        setError('দুঃখিত, এই ইমেইলটি শুধুমাত্র অ্যাডমিনের জন্য সংরক্ষিত এবং এতে সাইন-আপ করা যাবে না!');
        setLoading(false);
        return;
      }
      if (password !== '@Venteg$ksy321@') {
        setError('অ্যাডমিন পাসওয়ার্ডটি সঠিক নয়!');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } else {
        // Log In
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let errorMsg = '';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'এই ইমেইলটি ইতিপূর্বে ব্যবহার করা হয়েছে!';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়!';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে!';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'সঠিক ইমেইল এড্রেস প্রদান করুন!';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'আপনার ফায়ারবেস কনসোলে ইমেইল ও পাসওয়ার্ড সাইন-ইন পদ্ধতি নিষ্ক্রিয় (Disabled) রয়েছে। অনুগ্রহ করে Firebase Console-এ গিয়ে Build > Authentication > Sign-in method থেকে Email/Password চালু (Enable) করুন।';
      } else {
        errorMsg = `একটি সমস্যা হয়েছে (Error: ${err.code || err.message || 'unknown'})। অনুগ্রহ করে আবার চেষ্টা করুন বা কনসোল চেক করুন।`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs" id="auth-modal-overlay">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden"
        id="auth-modal-content"
      >
        {/* Modal Header */}
        <div className="relative p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between" id="auth-modal-header">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 text-white rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {isSignUp ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">venteg ও প্যানেল অ্যাক্সেস</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4" id="auth-form">
          {error && (
            <div className="flex gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold" id="auth-error-box">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">আপনার নাম <span className="text-rose-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="যেমন: শরিফ আহমেদ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-500 font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">ইমেইল এড্রেস <span className="text-rose-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">পাসওয়ার্ড <span className="text-rose-500">*</span></label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="কমপক্ষে ৬টি অক্ষর"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5" id="admin-credentials-hint">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700">🔐 অ্যাডমিন লগইন তথ্য:</span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setEmail('ventegksy@gmail.com');
                  setPassword('@Venteg$ksy321@');
                }}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 cursor-pointer bg-indigo-50 px-1.5 py-0.5 rounded transition-colors"
              >
                অটো-ফিল করুন
              </button>
            </div>
            <div className="text-[9px] text-slate-500 font-medium space-y-0.5 leading-normal">
              <p><strong>ইমেইল:</strong> ventegksy@gmail.com</p>
              <p><strong>পাসওয়ার্ড:</strong> @Venteg$ksy321@</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold py-2 px-4 rounded-lg text-xs transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                অ্যাকাউন্ট তৈরি করুন
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                লগইন করুন
              </>
            )}
          </button>

          {/* Toggle Link */}
          <div className="text-center pt-2 border-t border-slate-100" id="auth-toggle-link">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {isSignUp ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করতে চান? সাইন আপ করুন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
