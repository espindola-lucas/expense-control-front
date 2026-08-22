import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, Card, Input, Select } from '../../components/ui';
import { UserSettings } from '../../types';
import { fetchUserSettings, updateUserSettings } from '../../api/settings';

export function AdvancedSettingsPage() {
  const { t } = useLanguage();
  const { applyTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    fetchUserSettings()
      .then(setSettings)
      .catch(() => {
        /* ignore */
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: UserSettings = {
      currency: (formData.get('currency') as string).toUpperCase(),
      timezone: formData.get('timezone') as string,
      theme: formData.get('theme') as UserSettings['theme'],
      date_format: formData.get('date_format') as string,
    };

    setIsSaving(true);
    setSavedMessage(false);
    try {
      const updated = await updateUserSettings(payload);
      setSettings(updated);
      applyTheme(updated.theme);
      setSavedMessage(true);
    } catch {
      /* ignore */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header>
        <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.advancedSettings}</h2>
        <p className="text-neutral-500 font-medium">{t.advancedSettingsSubtitle}</p>
      </header>

      <Card className="max-w-xl">
        {isLoading || !settings ? (
          <p className="text-neutral-500 font-medium animate-pulse py-10 text-center">{t.loadingEntries}</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.currency}</label>
              <Input name="currency" defaultValue={settings.currency} maxLength={3} required className="uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.timezone}</label>
              <Input name="timezone" defaultValue={settings.timezone} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.theme}</label>
              <Select
                name="theme"
                defaultValue={settings.theme}
                onChange={(e) => applyTheme(e.target.value as UserSettings['theme'])}
                required
              >
                <option value="light">{t.themeLight}</option>
                <option value="dark">{t.themeDark}</option>
                <option value="system">{t.themeSystem}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.dateFormat}</label>
              <Select name="date_format" defaultValue={settings.date_format} required>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </div>

            {savedMessage && <p className="text-sm text-neutral-400">{t.settingsSaved}</p>}

            <Button type="submit" className="w-full py-4 text-base">
              {isSaving ? t.saving : t.saveChanges}
            </Button>
          </form>
        )}
      </Card>
    </>
  );
}
