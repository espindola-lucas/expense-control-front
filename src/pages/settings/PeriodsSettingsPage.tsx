import React, { useEffect, useState } from 'react';
import { Calendar, Edit2, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Card, Input, Modal, Select } from '../../components/ui';
import { PersonalConfiguration } from '../../types';
import {
  createPersonalConfiguration,
  deletePersonalConfiguration,
  fetchPersonalConfigurations,
  updatePersonalConfiguration,
} from '../../api/personalConfigurations';

export function PeriodsSettingsPage() {
  const { user } = useAuth();
  const { t, months } = useLanguage();

  const [configurations, setConfigurations] = useState<PersonalConfiguration[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PersonalConfiguration | null>(null);

  const loadConfigurations = async () => {
    setIsConfigLoading(true);
    try {
      const data = await fetchPersonalConfigurations();
      setConfigurations(data);
    } catch {
      /* ignore */
    } finally {
      setIsConfigLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      start_counting: formData.get('start_counting') as string,
      end_counting: formData.get('end_counting') as string,
      available_money: parseFloat(formData.get('available_money') as string),
      month_available_money: formData.get('month_available_money') as string,
      expense_percentage_limit: parseFloat(formData.get('expense_percentage_limit') as string),
    };

    try {
      if (editingConfig) {
        await updatePersonalConfiguration(editingConfig.id, payload);
      } else {
        await createPersonalConfiguration(payload);
      }
      await loadConfigurations();
      setIsConfigModalOpen(false);
      setEditingConfig(null);
    } catch {
      /* ignore */
    }
  };

  const handleDeleteConfig = async (id: number) => {
    try {
      await deletePersonalConfiguration(id);
      setConfigurations((prev) => prev.filter((c) => c.id !== id));
    } catch {
      /* ignore */
    }
  };

  const openEditConfig = (config: PersonalConfiguration) => {
    setEditingConfig(config);
    setIsConfigModalOpen(true);
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            {t.welcomeBack} {user?.name}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.infrastructure}</h2>
          <p className="text-neutral-500 font-medium">{t.settingsSubtitle}</p>
        </div>

        <Button onClick={() => { setEditingConfig(null); setIsConfigModalOpen(true); }} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newPeriod}
        </Button>
      </header>

      <div className="space-y-6">
        <Card className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl font-serif italic shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">{t.activeIdentity}</p>
            <p className="text-xl font-medium truncate">{user?.name}</p>
            <p className="text-sm text-neutral-400 truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-brand-border text-[10px] uppercase tracking-widest text-neutral-500 font-bold shrink-0">
            <UserIcon size={12} />
            {t.idLabel}{user?.id}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {isConfigLoading ? (
              <p className="px-8 py-20 text-center text-neutral-500 font-medium animate-pulse">{t.loadingPeriods}</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border bg-white/[0.02]">
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.monthHeader}</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.periodHeader}</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.budgetHeader}</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold">{t.alertHeader}</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-neutral-500 font-bold text-right">{t.actionsHeader}</th>
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
                        {t.noPeriods}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => { setIsConfigModalOpen(false); setEditingConfig(null); }}
        title={editingConfig ? t.editPeriod : t.newPeriodTitle}
      >
        <form key={editingConfig?.id ?? 'new'} onSubmit={handleSaveConfig} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.monthLabel}</label>
            <Select name="month_available_money" defaultValue={editingConfig?.month_available_money ?? ''} required>
              <option value="" disabled>{t.selectMonth}</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.startDate}</label>
              <Input name="start_counting" type="date" defaultValue={editingConfig?.start_counting} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.endDate}</label>
              <Input name="end_counting" type="date" defaultValue={editingConfig?.end_counting} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.budgetLabel}</label>
              <Input name="available_money" type="number" step="0.01" defaultValue={editingConfig?.available_money} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.alertThreshold}</label>
              <Input name="expense_percentage_limit" type="number" min="0" max="100" defaultValue={editingConfig?.expense_percentage_limit} placeholder="80" required />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsConfigModalOpen(false); setEditingConfig(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingConfig ? t.saveChanges : t.createPeriod}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
