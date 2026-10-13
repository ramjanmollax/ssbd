import React, { useState, useEffect } from 'react';
import { Phone, User, X, LogIn, UserPlus, CheckCircle2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; phone: string; email?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg('');
      setError('');
      setPhone('');
      setName('');
      setIsNewUser(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
      return;
    }

    try {
      const usersRaw = localStorage.getItem('seedhaven_users');
      let users = usersRaw ? JSON.parse(usersRaw) : {};

      if (users[cleanPhone]) {
        // User exists -> Log in directly
        const existingUser = users[cleanPhone];
        const currentUser = {
          name: existingUser.name,
          phone: cleanPhone
        };

        localStorage.setItem('seedhaven_current_user', JSON.stringify(currentUser));
        setSuccessMsg(`স্বাগতম ${existingUser.name}! সফলভাবে লগইন হয়েছে।`);

        setTimeout(() => {
          onLoginSuccess(currentUser);
          setSuccessMsg('');
          setPhone('');
          setName('');
          onClose();
        }, 700);
      } else {
        // User does not exist -> If name is not provided yet, ask for it. If provided, register & login.
        if (!isNewUser) {
          setIsNewUser(true);
          setError('এই নম্বরে পূর্বের কোনো অ্যাকাউন্ট পাওয়া যায়নি। আপনার নাম দিয়ে এক ক্লিকেই অ্যাকাউন্ট খুলে নিন।');
          return;
        }

        const cleanName = name.trim() || `গ্রাহক (${cleanPhone.slice(-4)})`;

        users[cleanPhone] = {
          name: cleanName,
          phone: cleanPhone,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('seedhaven_users', JSON.stringify(users));

        const currentUser = {
          name: cleanName,
          phone: cleanPhone
        };

        localStorage.setItem('seedhaven_current_user', JSON.stringify(currentUser));
        setSuccessMsg('অ্যাকাউন্ট তৈরি ও লগইন সফল হয়েছে!');

        setTimeout(() => {
          onLoginSuccess(currentUser);
          setSuccessMsg('');
          setPhone('');
          setName('');
          setIsNewUser(false);
          onClose();
        }, 700);
      }
    } catch (err) {
      setError('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 relative space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#118137] flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900">
            {isNewUser ? 'নতুন অ্যাকাউন্ট রেজিস্ট্রেশন' : 'সিঁড হ্যাভেনে লগইন'}
          </h3>
          <p className="text-xs text-slate-500">
            {isNewUser ? 'আপনার নাম দিয়ে অ্যাকাউন্টটি রেজিস্ট্রার করুন।' : 'আগে রেজিস্টার্ড করা থাকলে শুধু মোবাইল নম্বর দিন।'}
          </p>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#118137] mx-auto animate-bounce" />
            <p className="text-xs font-black text-[#1c3822]">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">মোবাইল নম্বর</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (isNewUser) setIsNewUser(false);
                    }}
                    placeholder="017xxxxxxxx"
                    className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#118137] focus:ring-2 focus:ring-emerald-100 font-medium tracking-wider"
                    required
                  />
                </div>
              </div>

              {isNewUser && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-xs font-bold text-slate-700">আপনার নাম (রেজিস্ট্রেশনের জন্য)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="আপনার পূর্ণ নাম"
                      className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#118137] focus:ring-2 focus:ring-emerald-100 font-medium"
                      required={isNewUser}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#118137] hover:bg-[#0d6b2c] text-white font-extrabold text-xs shadow-md shadow-emerald-800/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn size={16} />
                <span>{isNewUser ? 'রেজিস্ট্রেশন ও লগইন করুন' : 'প্রবেশ করুন'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
