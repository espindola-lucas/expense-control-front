import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  History, 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  User, 
  Wallet,
  X,
  Edit2
} from 'lucide-react';
import { Expense, MonthlyBudget, View } from './types';

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
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Calculations
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudget = budgets.find(b => b.month === currentMonth)?.availableFunds ?? 0;
  
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = currentBudget - totalSpent;
  const spentPercentage = currentBudget > 0 ? Math.min((totalSpent / currentBudget) * 100, 100) : 0;

  const filteredExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handlers
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ email: 'demo@example.com' });
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;

    if (editingExpense) {
      setExpenses(expenses.map(ex => ex.id === editingExpense.id ? { ...ex, name, amount, date } : ex));
    } else {
      setExpenses([{ id: crypto.randomUUID(), name, amount, date }, ...expenses]);
    }
    
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleAddBudget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const month = formData.get('month') as string;
    const availableFunds = parseFloat(formData.get('funds') as string);

    const existingIndex = budgets.findIndex(b => b.month === month);
    if (existingIndex > -1) {
      const newBudgets = [...budgets];
      newBudgets[existingIndex] = { ...newBudgets[existingIndex], availableFunds };
      setBudgets(newBudgets);
    } else {
      setBudgets([...budgets, { id: crypto.randomUUID(), month, availableFunds }]);
    }
    setIsBudgetModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
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
            <h1 className="text-4xl font-serif italic mb-2 tracking-tight">Eclipse</h1>
            <p className="text-neutral-500 font-medium tracking-wider text-xs uppercase">
              {view === 'login' ? 'Monthly Expense Engine' : 'Join the Collective'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold ml-1">Identity</label>
              <Input type="email" placeholder="Email contact" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold ml-1">Encryption</label>
              <Input type="password" placeholder="••••••••" required />
            </div>

            <Button type="submit" className="w-full py-4 text-base mt-4">
              {view === 'login' ? 'Enter System' : 'Create Access'}
            </Button>
          </form>

          <p className="mt-8 text-center text-neutral-500 text-sm">
            {view === 'login' ? "New member?" : "Already verified?"}
            <button 
              onClick={() => setView(view === 'login' ? 'register' : 'login')}
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
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-20 lg:w-64 border-b md:border-b-0 md:border-r border-brand-border bg-brand-surface p-4 md:p-6 flex flex-col items-center lg:items-stretch gap-8 relative z-30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black">
            <BarChart3 size={24} />
          </div>
          <span className="hidden lg:block text-xl font-serif italic font-semibold">Eclipse</span>
        </div>

        <nav className="flex-1 space-y-2 w-full">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${view === 'dashboard' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden lg:block font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${view === 'settings' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Settings size={20} />
            <span className="hidden lg:block font-medium">Monthly Settings</span>
          </button>
        </nav>

        <div className="mt-auto w-full space-y-4">
          <div className="hidden lg:flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/50 border border-brand-border">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs">A</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate">demo@example.com</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span className="hidden lg:block font-medium">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
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
            <Button onClick={() => setIsBudgetModalOpen(true)} className="px-6 py-4 rounded-3xl">
              <Plus size={20} />
              Set Budget
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
                      <h3 className="text-5xl md:text-6xl font-serif italic">${remaining.toLocaleString()}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Wallet size={24} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Planned Available</p>
                      <p className="text-lg font-medium">${currentBudget.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Total Burn</p>
                      <p className="text-lg font-medium text-red-400">${totalSpent.toLocaleString()}</p>
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
                    <span className="text-2xl font-serif italic">{Math.round(spentPercentage)}%</span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${spentPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 70 ? 'bg-orange-400' : 'bg-white'}`}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500">Relative to current monthly setting</p>
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
            </section>
          </div>
        ) : (
          /* Settings View */
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border bg-white/[0.02]">
                      <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">Reporting Month</th>
                      <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">Planned Liquidity</th>
                      <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold text-right">Identifier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.sort((a,b) => b.month.localeCompare(a.month)).map((budget) => (
                      <tr key={budget.id} className="border-b border-brand-border last:border-0 hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                              <Calendar size={18} />
                            </div>
                            <span className="font-medium text-lg">{budget.month}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-serif italic text-2xl">${budget.availableFunds.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-[10px] font-mono text-neutral-600 group-hover:text-neutral-400 transition-colors">{budget.id.slice(0, 8)}</span>
                        </td>
                      </tr>
                    ))}
                    {budgets.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-neutral-500 font-medium italic">
                          No budget infrastructure has been initialized.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        title="Set Operational Budget"
      >
        <form onSubmit={handleAddBudget} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Reporting Window</label>
            <Input name="month" type="month" defaultValue={new Date().toISOString().slice(0, 7)} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">Planned Liquidity</label>
            <Input name="funds" type="number" step="0.01" placeholder="Total funds for month" required />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsBudgetModalOpen(false)}>
              Discard
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              Establish Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
