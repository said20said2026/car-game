import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Search, X } from 'lucide-react';
import { LANGUAGES, Language, getSavedLanguage, saveLanguage, applyGlobalTranslation, getTranslation } from '../utils/i18n';

interface LanguageSelectorProps {
  theme?: 'dark' | 'light';
  currentLang: string;
  onLanguageChange: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  theme = 'dark',
  currentLang,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[1]; // default English
  const t = getTranslation(currentLang);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input on open
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredLanguages = LANGUAGES.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (lang: Language) => {
    applyGlobalTranslation(lang.code);
    onLanguageChange(lang.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          try {
            (window as unknown as { loadGoogleTranslateImmediately?: () => void }).loadGoogleTranslateImmediately?.();
          } catch {}
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => {
          try {
            (window as unknown as { loadGoogleTranslateImmediately?: () => void }).loadGoogleTranslateImmediately?.();
          } catch {}
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-amber-500/50'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 hover:border-amber-500/50'
        }`}
        title={t.selectLanguage}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none select-none">{currentLangObj.flag}</span>
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-mono text-xs uppercase font-extrabold text-amber-400">
          {currentLangObj.code}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${
            isDark
              ? 'bg-slate-900/95 border-amber-500/30 text-slate-100 shadow-black/60'
              : 'bg-white/95 border-amber-500/40 text-slate-900 shadow-slate-400/40'
          }`}
          role="listbox"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold font-game text-white tracking-wide">
                {t.selectLanguage}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold border border-amber-500/30">
              {LANGUAGES.length} Languages
            </span>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchLanguage}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching languages found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer group text-left ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : isDark
                        ? 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                        : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none select-none">{lang.flag}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate text-[13px]">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-300">
                          {lang.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {lang.code}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="p-2 text-center text-[10px] text-slate-500 border-t border-slate-800 bg-slate-950/60">
            36 Global Languages Supported • Instant Dynamic Translation &amp; RTL
          </div>
        </div>
      )}
    </div>
  );
};
