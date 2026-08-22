import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Input, LanguageToggle } from '../../components/ui';
import { ApiError } from '../../api/client';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, isAuthLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message || t.authFailed : t.networkError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-white/5 blur-[80px]" />
      </div>

      <LanguageToggle language={language} onChange={setLanguage} className="absolute top-6 right-6 z-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-brand-border bg-brand-surface rounded-[40px] p-10 relative z-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif italic mb-2 tracking-tight">{t.appName}</h1>
          <p className="text-neutral-500 font-medium tracking-wider text-xs uppercase">
            {mode === 'login' ? t.loginSubtitle : t.registerSubtitle}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold ml-1">{t.identityLabel}</label>
            <Input name="email" type="email" placeholder={t.emailPlaceholder} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold ml-1">{t.encryptionLabel}</label>
            <Input name="password" type="password" placeholder="••••••••" required />
          </div>

          {authError && (
            <p className="text-red-400 text-sm text-center">{authError}</p>
          )}

          <Button type="submit" className="w-full py-4 text-base mt-4">
            {isAuthLoading ? t.authenticating : mode === 'login' ? t.enterSystem : t.createAccess}
          </Button>
        </form>

        <p className="mt-8 text-center text-neutral-500 text-sm">
          {mode === 'login' ? t.newMember : t.alreadyVerified}
          <Link
            to={mode === 'login' ? '/register' : '/login'}
            className="ml-2 text-white hover:underline font-medium cursor-pointer"
          >
            {mode === 'login' ? t.secureRegistration : t.returnToLogin}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
