import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, LayoutDashboard, LayoutList, LineChart, LogOut, Menu, Repeat, Settings, Tag, Target, Wallet, X, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../ui';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

// Nav link shared by the desktop sidebar and the mobile dropdown: same active/hover
// treatment, each gets its own `layoutId` so the animated active pill doesn't try to
// morph between two trees that are mounted at once (one just hidden via CSS at md:).
function NavItemLink({ item, layoutId, onClick }: { item: NavItem; layoutId: string; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors cursor-pointer group ${
          isActive ? 'text-violet-300' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-2xl bg-violet-500/15"
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            />
          )}
          <Icon size={18} className="relative z-10 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="relative z-10 font-medium text-sm truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // "Money views" vs. "management" — roughly mirrors the two nav groups on plata.wtf/panel.
  const primaryNavItems: NavItem[] = [
    { to: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { to: '/accounts', label: t.accounts, icon: Wallet },
    { to: '/reports', label: t.reports, icon: LineChart },
  ];
  const secondaryNavItems: NavItem[] = [
    { to: '/categories', label: t.categories, icon: LayoutList },
    { to: '/tags', label: t.tags, icon: Tag },
    { to: '/budgets', label: t.budgets, icon: Target },
    { to: '/recurring-payments', label: t.recurringPayments, icon: Repeat },
    { to: '/settings/periods', label: t.monthlySettings, icon: Calendar },
    { to: '/settings/advanced', label: t.advancedSettings, icon: Settings },
  ];
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-brand-bg">
      {/* Ambient glows — purely decorative, echoes the login screen's blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[36vw] h-[36vw] rounded-full bg-violet-500/10 blur-[110px]" />
        <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:sticky md:top-0 md:h-screen md:border-r md:border-brand-border md:bg-brand-surface">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-brand-border shrink-0">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white shrink-0">
            <BarChart3 size={18} />
          </div>
          <span className="text-lg font-serif italic font-semibold truncate">{t.brandName}</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {primaryNavItems.map((item) => (
            <NavItemLink key={item.to} item={item} layoutId="sidebar-active-pill" />
          ))}
          <div className="my-3 border-t border-brand-border" />
          {secondaryNavItems.map((item) => (
            <NavItemLink key={item.to} item={item} layoutId="sidebar-active-pill" />
          ))}
        </nav>

        <div className="p-4 space-y-3 shrink-0">
          <div className="border-t border-brand-border pt-3 flex justify-center">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/60 border border-brand-border">
            <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label={t.terminateSession}
              className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Right column: mobile top navbar + dropdown (hidden on md:+, sidebar takes over) and the single shared <main> */}
      <div className="flex-1 flex flex-col min-w-0">
        <nav className="md:hidden sticky top-0 z-40 h-16 border-b border-brand-border bg-brand-surface px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white">
              <BarChart3 size={18} />
            </div>
            <span className="text-lg font-serif italic font-semibold">{t.brandName}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label={t.toggleMenu}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="fixed top-16 left-0 right-0 z-40 bg-brand-surface border-b border-brand-border overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
              >
                <div className="p-4 space-y-1 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 p-3 mb-3 rounded-2xl bg-neutral-900/60 border border-brand-border">
                    <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-sm font-semibold shrink-0">
                      {user?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {allNavItems.map((item) => (
                    <NavItemLink key={item.to} item={item} layoutId="mobile-active-pill" onClick={() => setIsMenuOpen(false)} />
                  ))}

                  <div className="pt-2 border-t border-brand-border mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">{t.terminateSession}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 max-w-4xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
