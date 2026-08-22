import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Plus, Search, Trash2, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Card, Input, Modal } from '../../components/ui';
import { DashboardSummary, Expense } from '../../types';
import { createSpent, deleteSpent, fetchSpents, updateSpent } from '../../api/spents';

function formatExpenseDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    monthly_balance: null,
    percentageUsed: null,
    hasConfiguration: false,
  });
  const [isSpentsLoading, setIsSpentsLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadSpents = async (search: string = filter) => {
    setIsSpentsLoading(true);
    try {
      const data = await fetchSpents(search);
      setExpenses(data.spents);
      setDashboardSummary({
        monthly_balance: data.monthly_balance,
        percentageUsed: data.percentageUsed,
        hasConfiguration: data.hasConfiguration,
      });
    } catch {
      /* ignore network errors */
    } finally {
      setIsSpentsLoading(false);
    }
  };

  // Re-fetch (debounced) whenever the search filter changes.
  // The backend scopes results to the last configured period by default, or searches across every period when a filter is present.
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadSpents(filter);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // expenses already reflects the server's answer: the last configured period by default,
  // or every matching row across all periods when a search filter is active.
  const filteredExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
    };

    try {
      if (editingExpense) {
        await updateSpent(editingExpense.id, payload);
      } else {
        await createSpent(payload);
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      await loadSpents();
    } catch {
      /* ignore */
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteSpent(id);
      await loadSpents();
    } catch {
      /* ignore */
    }
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            {t.welcomeBack} {user?.name}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.overview}</h2>
          <p className="text-neutral-500 font-medium">{t.dashboardSubtitle}</p>
        </div>

        <Button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newExpense}
        </Button>
      </header>

      <div className="space-y-10">
        {/* Financial Status Summary */}
        <div className="w-full">
          <div className="w-full glass rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full gap-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold font-sans">{t.currentLiquidity}</p>
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
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{t.plannedAvailable}</p>
                  <p className="text-lg font-medium">
                    ${dashboardSummary.monthly_balance?.avalaibleMoney ?? '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{t.totalBurn}</p>
                  <p className="text-lg font-medium text-expense">
                    ${dashboardSummary.monthly_balance?.totalPrice ?? '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{t.entries}</p>
                  <p className="text-lg font-medium">
                    {dashboardSummary.monthly_balance?.countSpent ?? '—'}
                  </p>
                </div>
              </div>
              <div className="bg-neutral-900/40 border border-brand-border rounded-[32px] p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">{t.spendingThreshold}</p>
                    <span className="text-2xl font-serif italic">
                      {dashboardSummary.percentageUsed?.percentageUser ?? 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dashboardSummary.percentageUsed?.percentageUser ?? 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        dashboardSummary.percentageUsed?.color === 'red' ? 'bg-expense' : 'bg-white'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500">{t.relativeToPeriod}</p>
                </div>
              </div>
            </div>
            {/* Visual accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Expenses Grid */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-2xl font-serif italic">{t.operationalLog}</h3>
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            {isSpentsLoading ? (
              <p className="px-8 py-20 text-center text-neutral-500 font-medium animate-pulse">{t.loadingEntries}</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="px-8 py-20 text-center text-neutral-500 font-medium italic">{t.noEntries}</p>
            ) : (
              <>
                {/* Mobile: stacked rows, no horizontal scroll */}
                <div className="md:hidden divide-y divide-brand-border">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <span className="font-medium text-lg truncate">{expense.name}</span>
                        <span className="font-serif italic text-xl text-expense shrink-0">${expense.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">{formatExpenseDate(expense.date)}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditExpense(expense)}
                            className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-white/[0.02]">
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.entityLabel}</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.volume}</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.temporalNode}</th>
                        <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold text-right">{t.actionsHeader}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-brand-border last:border-0 hover:bg-white/[0.01] transition-colors group">
                          <td className="px-8 py-6">
                            <span className="font-medium text-lg">{expense.name}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-serif italic text-2xl text-expense">${expense.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6 text-sm text-neutral-400">{formatExpenseDate(expense.date)}</td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditExpense(expense)}
                                className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </section>
      </div>

      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}
        title={editingExpense ? t.modifyEntry : t.newLogEntry}
      >
        <form onSubmit={handleAddExpense} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.entityLabel}</label>
            <Input name="name" defaultValue={editingExpense?.name} placeholder={t.expenseNamePlaceholder} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.volume}</label>
              <Input name="amount" type="number" step="0.01" defaultValue={editingExpense?.amount} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.temporalNode}</label>
              <Input name="date" type="date" defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]} required />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingExpense ? t.updateData : t.logExpense}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
