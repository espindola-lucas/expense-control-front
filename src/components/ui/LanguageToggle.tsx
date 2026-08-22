import { Globe } from 'lucide-react';
import { Language } from '../../translations';

export const LanguageToggle = ({ language, onChange, className = '' }: { language: Language; onChange: (lang: Language) => void; className?: string }) => (
  <div className={`flex items-center gap-1 rounded-full border border-brand-border bg-neutral-900 p-1 ${className}`}>
    <Globe size={14} className="text-neutral-500 ml-1.5 mr-0.5" />
    {(['en', 'es'] as Language[]).map((lang) => (
      <button
        key={lang}
        type="button"
        onClick={() => onChange(lang)}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
          language === lang ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
        }`}
      >
        {lang}
      </button>
    ))}
  </div>
);
