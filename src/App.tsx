import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Calendar,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Wallet,
  X,
  Edit2
} from 'lucide-react';
import { AuthUser, DashboardSummary, Expense, PersonalConfiguration, View } from './types';

const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3101/api';

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  type = 'button' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const base = "px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer";
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    outline: "border border-neutral-700 text-white hover:bg-neutral-800",
    ghost: "text-neutral-400 hover:text-white hover:bg-neutral-800",
    danger: "text-red-400 hover:bg-red-500/10"
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-brand-surface border border-brand-border rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
  />
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium font-serif italic">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Main App ---

export default function App() {
  // State
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    monthly_balance: null,
    percentageUsed: null,
    hasConfiguration: false,
  });
  const [isSpentsLoading, setIsSpentsLoading] = useState(false);
  const [configurations, setConfigurations] = useState<PersonalConfiguration[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PersonalConfiguration | null>(null);
  const [filter, setFilter] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (localStorage.getItem('auth_token') && storedUser) {
      setUser(JSON.parse(storedUser));
      setView('dashboard');
    }
  }, []);

  const fetchSpents = async () => {
    setIsSpentsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/spents`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        setExpenses(json.spents);
        setDashboardSummary({
          monthly_balance:  json.monthly_balance,
          percentageUsed:   json.percentageUsed,
          hasConfiguration: json.hasConfiguration,
        });
      }
    } catch { /* ignore network errors */ } finally {
      setIsSpentsLoading(false);
    }
  };

  // Fetch spents from API whenever the user is set
  useEffect(() => {
    if (!user) return;
    fetchSpents();
  }, [user]);

  // Fetch personal configurations from API whenever the user is set
  useEffect(() => {
    if (!user) return;
    fetchConfigurations();
  }, [user]);

  const fetchConfigurations = async () => {
    setIsConfigLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/personal-configurations`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        setConfigurations(json);
      }
    } catch { /* ignore */ } finally {
      setIsConfigLoading(false);
    }
  };

  // Calculations
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

  const filteredExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handlers
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message ?? 'Authentication failed.');
        return;
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
      setView('dashboard');
    } catch {
      setAuthError('Could not reach the server. Check your connection.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
      } catch { /* ignore network errors on logout */ }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setView('login');
  };

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name:   formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      date:   formData.get('date') as string,
    };

    const token  = localStorage.getItem('auth_token');
    const url    = editingExpense ? `${API_URL}/spents/${editingExpense.id}` : `${API_URL}/spents`;
    const method = editingExpense ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      await fetchSpents();
    }
  };

  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('auth_token');
    const payload = {
      start_counting:           formData.get('start_counting'),
      end_counting:             formData.get('end_counting'),
      available_money:          parseFloat(formData.get('available_money') as string),
      month_available_money:    formData.get('month_available_money'),
      expense_percentage_limit: parseFloat(formData.get('expense_percentage_limit') as string),
    };

    const url    = editingConfig ? `${API_URL}/personal-configurations/${editingConfig.id}` : `${API_URL}/personal-configurations`;
    const method = editingConfig ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchConfigurations();
        setIsConfigModalOpen(false);
        setEditingConfig(null);
      }
    } catch { /* ignore */ }
  };

  const handleDeleteConfig = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/personal-configurations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (res.ok) {
        setConfigurations(prev => prev.filter(c => c.id !== id));
      }
    } catch { /* ignore */ }
  };

  const openEditConfig = (config: PersonalConfiguration) => {
    setEditingConfig(config);
    setIsConfigModalOpen(true);
  };

  const deleteExpense = async (id: string) => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_URL}/spents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    if (res.ok) {
      await fetchSpents();
    }
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  // --- View Rendering ---

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-white/5 blur-[80px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md border border-brand-border bg-brand-surface rounded-[40px] p-10 relative z-10 shadow-2xl"
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-serif italic mb-2 tracking-tight">Expense Control</h1>
            <p className="text-neutral-500 font-medium tracking-wider text-xs uppercase">
              {view === 'login' ? 'Monthly Expense Engine' : 'Join the Collective'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold ml-1">Identity</label>
              <Input name="email" type="email" placeholder="Email contact" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold ml-1">Encryption</label>
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>

            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}

            <Button type="submit" className="w-full py-4 text-base mt-4" onClick={undefined}>
              {isAuthLoading ? 'Authenticating…' : view === 'login' ? 'Enter System' : 'Create Access'}
            </Button>
          </form>

          <p className="mt-8 text-center text-neutral-500 text-sm">
            {view === 'login' ? "New member?" : "Already verified?"}
            <button
              onClick={() => { setView(view === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="ml-2 text-white hover:underline font-medium cursor-pointer"
            >
              {view === 'login' ? 'Secure Registration' : 'Return to Login'}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* Top navbar */}
      <nav className="sticky top-0 z-40 h-16 border-b border-brand-border bg-brand-surface px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
            <BarChart3 size={18} />
          </div>
          <span className="text-lg font-serif italic font-semibold">Eclipse</span>
        </div>
        <button
          onClick={() => setIsMenuOpen(v => !v)}
          className="p-2 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Hamburger dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
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
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold shrink-0">
                    {user?.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setView('dashboard'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${view === 'dashboard' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                >
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => { setView('settings'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${view === 'settings' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                >
                  <Settings size={20} />
                  <span className="font-medium">Monthly Settings</span>
                </button>

                <div className="pt-2 border-t border-brand-border mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Terminate Session</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Welcome back, {user?.name}
            </p>
            <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">
              {view === 'dashboard' ? 'Overview' : 'Infrastructure'}
            </h2>
            <p className="text-neutral-500 font-medium">
              {view === 'dashboard' ? 'Real-time financial synthesis' : 'Configure monthly operational budgets'}
            </p>
          </div>
          
          {view === 'dashboard' ? (
            <Button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="px-6 py-4 rounded-3xl">
              <Plus size={20} />
              New Expense
            </Button>
          ) : (
            <Button onClick={() => { setEditingConfig(null); setIsConfigModalOpen(true); }} className="px-6 py-4 rounded-3xl">
              <Plus size={20} />
              New Period
            </Button>
          )}
        </header>

        {view === 'dashboard' ? (
          <div className="space-y-10">
            {/* Financial Status Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full gap-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold font-sans">Current Liquidity</p>
                      <h3 className="text-5xl md:text-6xl font-serif italic">
                        ${dashboardSummary.monthly_balance?.restMoney ?? '—'}
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Wallet size={24} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Planned Available</p>
                      <p className="text-lg font-medium">
                        ${dashboardSummary.monthly_balance?.avalaibleMoney ?? '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Total Burn</p>
                      <p className="text-lg font-medium text-red-400">
                        ${dashboardSummary.monthly_balance?.totalPrice ?? '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Entries</p>
                      <p className="text-lg font-medium">
                        {dashboardSummary.monthly_balance?.countSpent ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Visual accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="bg-neutral-900/40 border border-brand-border rounded-[32px] p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Spending Threshold</p>
                    <span className="text-2xl font-serif italic">
                      {dashboardSummary.percentageUsed?.percentageUser ?? 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dashboardSummary.percentageUsed?.percentageUser ?? 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        dashboardSummary.percentageUsed?.color === 'red' ? 'bg-red-500' : 'bg-white'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500">Relative to current period configuration</p>
                </div>
                
                <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-orange-400">
                    <History size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Last Entry</p>
                    <p className="text-sm font-medium">{currentMonthExpenses.length > 0 ? (currentMonthExpenses[currentMonthExpenses.length - 1].name) : 'No activity recorded'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Grid */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-serif italic">Operational Log</h3>
                <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Search by keyword..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {isSpentsLoading ? (
                <div className="py-20 text-center">
                  <p className="text-neutral-500 font-medium animate-pulse">Loading entries…</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredExpenses.map((expense) => (
                      <motion.div
                        layout
                        key={expense.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-neutral-900/50 border border-brand-border hover:border-neutral-700 rounded-2xl p-5 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-neutral-800 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                            <Calendar size={12} />
                            {expense.date}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditExpense(expense)}
                              className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium text-neutral-200 truncate">{expense.name}</h4>
                          <p className="text-2xl font-serif italic text-white">${expense.amount.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredExpenses.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-neutral-800 rounded-[32px]">
                      <p className="text-neutral-500 font-medium">No system entries detected for this query.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Settings View */
          <div className="space-y-6">
            <Card className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl font-serif italic shrink-0">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">Active identity</p>
                <p className="text-xl font-medium truncate">{user?.name}</p>
                <p className="text-sm text-neutral-400 truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-brand-border text-[10px] uppercase tracking-widest text-neutral-500 font-bold shrink-0">
                <User size={12} />
                ID #{user?.id}
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                {isConfigLoading ? (
                  <p className="px-8 py-20 text-center text-neutral-500 font-medium animate-pulse">Loading periods…</p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-white/[0.02]">
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">Month</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">Period</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">Budget</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">Alert</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configurations.map((config) => (
                        <tr key={config.id} className="border-b border-brand-border last:border-0 hover:bg-white/[0.01] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                                <Calendar size={18} />
                              </div>
                              <span className="font-medium text-lg">{config.month_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-neutral-400">
                            {config.start_counting} → {config.end_counting}
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-serif italic text-2xl">${config.available_money.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-sm font-semibold ${config.expense_percentage_limit >= 80 ? 'text-red-400' : 'text-neutral-300'}`}>
                              {config.expense_percentage_limit}%
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditConfig(config)}
                                className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteConfig(config.id)}
                                className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {configurations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-neutral-500 font-medium italic">
                            No period configuration has been initialized.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      <Modal 
        isOpen={isExpenseModalOpen} 
        onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} 
        title={editingExpense ? "Modify Entry" : "New Log Entry"}
      >
        <form onSubmit={handleAddExpense} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Entity Label</label>
            <Input name="name" defaultValue={editingExpense?.name} placeholder="Expense name..." required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Volume</label>
              <Input name="amount" type="number" step="0.01" defaultValue={editingExpense?.amount} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Temporal Node</label>
              <Input name="date" type="date" defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]} required />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingExpense ? "Update Data" : "Log Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => { setIsConfigModalOpen(false); setEditingConfig(null); }}
        title={editingConfig ? 'Edit Period' : 'New Period'}
      >
        <form key={editingConfig?.id ?? 'new'} onSubmit={handleSaveConfig} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Month</label>
            <select
              name="month_available_money"
              defaultValue={editingConfig?.month_available_money ?? ''}
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="" disabled>Select a month…</option>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Start date</label>
              <Input name="start_counting" type="date" defaultValue={editingConfig?.start_counting} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">End date</label>
              <Input name="end_counting" type="date" defaultValue={editingConfig?.end_counting} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Budget</label>
              <Input name="available_money" type="number" step="0.01" defaultValue={editingConfig?.available_money} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Alert threshold %</label>
              <Input name="expense_percentage_limit" type="number" min="0" max="100" defaultValue={editingConfig?.expense_percentage_limit} placeholder="80" required />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsConfigModalOpen(false); setEditingConfig(null); }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingConfig ? 'Save Changes' : 'Create Period'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
