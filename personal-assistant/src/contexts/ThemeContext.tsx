import { createContext, useContext, useState } from 'react';
import { TRANSLATIONS, LANGUAGES } from '../i18n/translations';
import type { Translation, Language } from '../i18n/translations';

export type ThemeMode = 'dark' | 'light';

export const DARK = {
  bgPrimary:       '#07090f',
  bgPage:          'linear-gradient(160deg,#070b18 0%,#0d1526 55%,#070b18 100%)',
  bgCard:          'rgba(255,255,255,0.05)',
  bgCardStrong:    'rgba(255,255,255,0.08)',
  bgInput:         'rgba(255,255,255,0.05)',
  bgIconBox:       'rgba(79,172,254,0.12)',
  border:          'rgba(255,255,255,0.08)',
  borderStrong:    'rgba(255,255,255,0.12)',
  divider:         'rgba(255,255,255,0.07)',
  textPrimary:     '#ffffff',
  textBody:        'rgba(255,255,255,0.85)',
  textSecondary:   'rgba(147,197,253,0.6)',
  textMuted:       'rgba(255,255,255,0.35)',
  textLabel:       'rgba(147,197,253,0.38)',
  navBg:           'rgba(6,9,15,0.97)',
  navBorder:       'rgba(255,255,255,0.06)',
  navInactive:     'rgba(255,255,255,0.38)',
  navLabelActive:  'rgba(255,255,255,0.9)',
  navLabelInactive:'rgba(255,255,255,0.35)',
  aiBubbleBg:      'rgba(255,255,255,0.06)',
  aiBubbleBorder:  'rgba(255,255,255,0.08)',
  aiBubbleText:    'rgba(255,255,255,0.92)',
  dropdownBg:      'rgba(15,22,40,0.97)',
  backBtnBg:       'rgba(255,255,255,0.07)',
  backBtnIcon:     'rgba(255,255,255,0.7)',
  chevron:         'rgba(255,255,255,0.2)',
  headerName:      '#ffffff',
  headerChevron:   'rgba(255,255,255,0.4)',
  headerMenu:      'rgba(255,255,255,0.4)',
  headerBorder:    'rgba(255,255,255,0.06)',
  orbBlend:        'screen' as const,
};

export const LIGHT = {
  bgPrimary:       '#f0f4fc',
  bgPage:          'linear-gradient(160deg,#eef2fb 0%,#e6ecf8 55%,#eef2fb 100%)',
  bgCard:          'rgba(255,255,255,0.88)',
  bgCardStrong:    '#ffffff',
  bgInput:         'rgba(0,0,0,0.04)',
  bgIconBox:       'rgba(79,130,220,0.1)',
  border:          'rgba(0,0,0,0.08)',
  borderStrong:    'rgba(0,0,0,0.12)',
  divider:         'rgba(0,0,0,0.06)',
  textPrimary:     '#0d1829',
  textBody:        'rgba(13,24,41,0.85)',
  textSecondary:   'rgba(50,90,180,0.75)',
  textMuted:       'rgba(0,0,0,0.35)',
  textLabel:       'rgba(50,90,180,0.5)',
  navBg:           'rgba(240,244,252,0.97)',
  navBorder:       'rgba(0,0,0,0.07)',
  navInactive:     'rgba(0,0,0,0.38)',
  navLabelActive:  'rgba(0,0,0,0.88)',
  navLabelInactive:'rgba(0,0,0,0.38)',
  aiBubbleBg:      'rgba(255,255,255,0.95)',
  aiBubbleBorder:  'rgba(0,0,0,0.08)',
  aiBubbleText:    '#0d1829',
  dropdownBg:      'rgba(245,248,255,0.98)',
  backBtnBg:       'rgba(0,0,0,0.07)',
  backBtnIcon:     'rgba(0,0,0,0.55)',
  chevron:         'rgba(0,0,0,0.2)',
  headerName:      '#0d1829',
  headerChevron:   'rgba(0,0,0,0.4)',
  headerMenu:      'rgba(0,0,0,0.4)',
  headerBorder:    'rgba(0,0,0,0.07)',
  orbBlend:        'multiply' as const,
};

export type ThemeColors = typeof DARK;

interface ThemeContextValue {
  theme: ThemeMode;
  t: ThemeColors;
  toggleTheme: () => void;
  lang: string;
  setLang: (code: string) => void;
  tr: Translation;
  currentLanguage: Language;
  isRtl: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark', t: DARK, toggleTheme: () => {},
  lang: 'en', setLang: () => {}, tr: TRANSLATIONS.en,
  currentLanguage: LANGUAGES[0], isRtl: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem('aura_theme') as ThemeMode) || 'dark'
  );
  const [lang, setLangState] = useState<string>(
    () => localStorage.getItem('aura_lang') || 'en'
  );

  const toggleTheme = () =>
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aura_theme', next);
      return next;
    });

  const setLang = (code: string) => {
    localStorage.setItem('aura_lang', code);
    setLangState(code);
  };

  const tr = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
  const currentLanguage = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const isRtl = currentLanguage.rtl;

  return (
    <ThemeContext.Provider value={{ theme, t: theme === 'dark' ? DARK : LIGHT, toggleTheme, lang, setLang, tr, currentLanguage, isRtl }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { LANGUAGES };
