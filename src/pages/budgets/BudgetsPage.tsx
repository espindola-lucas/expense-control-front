import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Edit2, Plus, Target, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Card, Input, Modal, Select } from '../../components/ui';
import { Budget, Category } from '../../types';
import { createBudget, deleteBudget, fetchBudgets, updateBudget } from '../../api/budgets';
import { fetchCategories } from '../../api/categories';

function firstOfMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

const LEVEL_STYLES: Record<Budget['level'], { bar: string; text: string }> = {
  ok: { bar: 'bg-white', text: 'text-white' },
  notice: { bar: 'bg-yellow-400', text: 'text-yellow-400' },
  warning: { bar: 'bg-orange-500', text: 'text-orange-500' },
  over: { bar: 'bg-expense', text: 'text-expense' },
};

export function BudgetsPage() {
  const { language, t } = useLanguage();

  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const selectedMonth = firstOfMonth(monthDate);
  const monthLabel = monthDate.toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      setBudgets(await fetchBudgets(selectedMonth));
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  useEffect(() => {
    fetchCategories()
      .then((all) => setCategories(all.filter((c) => c.type === 'expense')))
      .catch(() => {
        /* ignore */
      });
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      category_id: Number(formData.get('category_id')),
      month: selectedMonth,
      amount: parseFloat(formData.get('amount') as string),
    };

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, payload);
      } else {
        await createBudget(payload);
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      await loadBudgets();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch {
      /* ignore */
    }
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.budgets}</h2>
          <p className="text-neutral-500 font-medium">{t.budgetsSubtitle}</p>
        </div>

        <Button onClick={() => { setEditingBudget(null); setIsModalOpen(true); }} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newBudget}
        </Button>
      </header>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          aria-label={t.previousMonth}
          className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-serif italic capitalize min-w-[10rem] text-center">{monthLabel}</span>
        <button
          onClick={() => setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          aria-label={t.nextMonth}
          className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <p className="text-neutral-500 font-medium animate-pulse">{t.loadingEntries}</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-[32px]">
          <p className="text-neutral-500 font-medium">{t.noBudgets}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const styles = LEVEL_STYLES[budget.level];
            const width = Math.min(budget.percentageUsed, 100);

            return (
              <Card key={budget.id} className="group space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white shrink-0">
                      <Target size={18} />
                    </div>
                    <span className="font-medium text-lg">{budget.category_name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(budget)}
                      className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                    {t.budgetSpent} ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                  </p>
                  <span className={`text-xl font-serif italic ${styles.text}`}>{budget.percentageUsed}%</span>
                </div>
                <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${styles.bar}`}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBudget(null); }}
        title={editingBudget ? t.editBudget : t.newBudgetTitle}
      >
        <form key={editingBudget?.id ?? 'new'} onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.budgetCategory}</label>
            <Select name="category_id" defaultValue={editingBudget?.category_id ?? ''} required>
              <option value="" disabled>{t.selectCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.budgetMonth}</label>
            <Input value={monthLabel} disabled className="capitalize opacity-70" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.budgetAmount}</label>
            <Input name="amount" type="number" step="0.01" defaultValue={editingBudget?.amount} placeholder="0.00" required />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingBudget(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingBudget ? t.saveChanges : t.newBudget}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
