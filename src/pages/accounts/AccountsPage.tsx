import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, Wallet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Card, Input, Modal, Select } from '../../components/ui';
import { Account } from '../../types';
import { createAccount, deleteAccount, fetchAccounts, updateAccount } from '../../api/accounts';

export function AccountsPage() {
  const { t } = useLanguage();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      setAccounts(await fetchAccounts());
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      type: formData.get('type') as Account['type'],
      initial_balance: parseFloat(formData.get('initial_balance') as string) || 0,
    };

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, payload);
      } else {
        await createAccount(payload);
      }
      setIsModalOpen(false);
      setEditingAccount(null);
      await loadAccounts();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      /* ignore */
    }
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const typeLabel = (type: Account['type']) => ({
    cash: t.accountTypeCash,
    bank: t.accountTypeBank,
    other: t.accountTypeOther,
  })[type];

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">{t.totalBalance}</p>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">${totalBalance.toLocaleString()}</h2>
          <p className="text-neutral-500 font-medium">{t.accountsSubtitle}</p>
        </div>

        <Button onClick={() => { setEditingAccount(null); setIsModalOpen(true); }} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newAccount}
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
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.accountName}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.accountType}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.accountBalance}</th>
                  <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold text-right">{t.actionsHeader}</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-brand-border last:border-0 hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                          <Wallet size={18} />
                        </div>
                        <span className="font-medium text-lg">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-neutral-400">{typeLabel(account.type)}</td>
                    <td className="px-8 py-6">
                      <span className={`font-serif italic text-2xl ${account.balance < 0 ? 'text-expense' : 'text-income'}`}>
                        ${account.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(account)}
                          className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-neutral-500 font-medium italic">
                      {t.noAccounts}
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
        onClose={() => { setIsModalOpen(false); setEditingAccount(null); }}
        title={editingAccount ? t.editAccount : t.newAccountTitle}
      >
        <form key={editingAccount?.id ?? 'new'} onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.accountName}</label>
            <Input name="name" defaultValue={editingAccount?.name} placeholder={t.accountNamePlaceholder} required autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.accountType}</label>
            <Select name="type" defaultValue={editingAccount?.type ?? 'cash'} required>
              <option value="cash">{t.accountTypeCash}</option>
              <option value="bank">{t.accountTypeBank}</option>
              <option value="other">{t.accountTypeOther}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.accountInitialBalance}</label>
            <Input name="initial_balance" type="number" step="0.01" defaultValue={editingAccount?.initial_balance ?? 0} placeholder="0.00" />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingAccount(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingAccount ? t.saveChanges : t.newAccount}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
