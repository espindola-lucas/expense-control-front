import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Repeat, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Card, Input, Modal, Select } from '../../components/ui';
import { Account, Category, RecurringPayment } from '../../types';
import {
  createRecurringPayment,
  deleteRecurringPayment,
  fetchRecurringPayments,
  updateRecurringPayment,
} from '../../api/recurringPayments';
import { fetchAccounts } from '../../api/accounts';
import { fetchCategories } from '../../api/categories';

export function RecurringPaymentsPage() {
  const { t } = useLanguage();

  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringPayment | null>(null);
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');

  const loadRecurringPayments = async () => {
    setIsLoading(true);
    try {
      setRecurringPayments(await fetchRecurringPayments());
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecurringPayments();
    fetchAccounts().then(setAccounts).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryId = formData.get('category_id') as string;
    const endDate = formData.get('end_date') as string;
    const payload = {
      account_id: Number(formData.get('account_id')),
      category_id: categoryId ? Number(categoryId) : null,
      name: formData.get('name') as string,
      type: formData.get('type') as 'expense' | 'income',
      amount: parseFloat(formData.get('amount') as string),
      frequency: formData.get('frequency') as RecurringPayment['frequency'],
      start_date: formData.get('start_date') as string,
      end_date: endDate || null,
    };

    try {
      if (editingRule) {
        await updateRecurringPayment(editingRule.id, payload);
      } else {
        await createRecurringPayment(payload);
      }
      setIsModalOpen(false);
      setEditingRule(null);
      await loadRecurringPayments();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRecurringPayment(id);
      setRecurringPayments((prev) => prev.filter((r) => r.id !== id));
    } catch {
      /* ignore */
    }
  };

  const openNew = () => {
    setEditingRule(null);
    setModalType('expense');
    setIsModalOpen(true);
  };

  const openEdit = (rule: RecurringPayment) => {
    setEditingRule(rule);
    setModalType(rule.type);
    setIsModalOpen(true);
  };

  const frequencyLabel = (frequency: RecurringPayment['frequency']) => ({
    weekly: t.frequencyWeekly,
    monthly: t.frequencyMonthly,
    yearly: t.frequencyYearly,
  })[frequency];

  const visibleCategories = categories.filter((c) => c.type === modalType);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.recurringPayments}</h2>
          <p className="text-neutral-500 font-medium">{t.recurringPaymentsSubtitle}</p>
        </div>

        <Button onClick={openNew} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newRecurringPayment}
        </Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="px-8 py-20 text-center text-neutral-500 font-medium animate-pulse">{t.loadingEntries}</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-white/[0.02]">
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.recurringName}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.recurringAccount}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.recurringFrequency}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.recurringAmount}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold text-right">{t.actionsHeader}</th>
                </tr>
              </thead>
              <tbody>
                {recurringPayments.map((rule) => (
                  <tr key={rule.id} className="border-b border-brand-border last:border-0 hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                          <Repeat size={18} />
                        </div>
                        <span className="font-medium text-lg">{rule.name}</span>
                        {!rule.is_active && (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-brand-border text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                            {t.inactive}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-neutral-400">{rule.account_name}</td>
                    <td className="px-8 py-6 text-sm text-neutral-400">{frequencyLabel(rule.frequency)}</td>
                    <td className="px-8 py-6">
                      <span className={`font-serif italic text-2xl ${rule.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        ${rule.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(rule)}
                          className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recurringPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-neutral-500 font-medium italic">
                      {t.noRecurringPayments}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRule(null); }}
        title={editingRule ? t.editRecurringPayment : t.newRecurringPaymentTitle}
      >
        <form key={editingRule?.id ?? 'new'} onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringName}</label>
            <Input name="name" defaultValue={editingRule?.name} placeholder={t.recurringNamePlaceholder} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringType}</label>
              <Select
                name="type"
                value={modalType}
                onChange={(e) => setModalType(e.target.value as 'expense' | 'income')}
                required
              >
                <option value="expense">{t.categoryTypeExpense}</option>
                <option value="income">{t.categoryTypeIncome}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringAmount}</label>
              <Input name="amount" type="number" step="0.01" defaultValue={editingRule?.amount} placeholder="0.00" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringAccount}</label>
            <Select name="account_id" defaultValue={editingRule?.account_id ?? ''} required>
              <option value="" disabled>{t.selectAccount}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringCategory}</label>
            <Select name="category_id" defaultValue={editingRule?.category_id ?? ''}>
              <option value="">—</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringFrequency}</label>
            <Select name="frequency" defaultValue={editingRule?.frequency ?? 'monthly'} required>
              <option value="weekly">{t.frequencyWeekly}</option>
              <option value="monthly">{t.frequencyMonthly}</option>
              <option value="yearly">{t.frequencyYearly}</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringStartDate}</label>
              <Input name="start_date" type="date" defaultValue={editingRule?.start_date} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.recurringEndDate}</label>
              <Input name="end_date" type="date" defaultValue={editingRule?.end_date ?? ''} />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingRule(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingRule ? t.saveChanges : t.newRecurringPayment}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
