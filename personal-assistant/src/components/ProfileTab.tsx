import { useState } from 'react';
import { useTheme, LANGUAGES } from '../contexts/ThemeContext';

interface Props {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function ProfileTab({ userName, userEmail, onLogout }: Props) {
  const { theme, t, tr, toggleTheme, lang, setLang, currentLanguage } = useTheme();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const initials = userName ? userName.slice(0, 2).toUpperCase() : '?';

  return (
    <div className="flex flex-col h-full relative" style={{ background: t.bgPrimary }}>

      {/* Language picker overlay */}
      {showLangPicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-t-3xl overflow-hidden" style={{ background: t.bgPrimary, border: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="font-bold text-base" style={{ color: t.textPrimary }}>{tr.selectLanguage}</p>
              <button onClick={() => setShowLangPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: t.bgCard }}>
                <svg className="w-4 h-4" style={{ color: t.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto pb-8" style={{ maxHeight: 420 }}>
              {LANGUAGES.map((lng, idx) => (
                <button
                  key={lng.code}
                  onClick={() => { setLang(lng.code); setShowLangPicker(false); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 transition-colors active:opacity-70"
                  style={{ borderTop: idx > 0 ? `1px solid ${t.divider}` : 'none' }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>{lng.nativeName}</span>
                    <span className="text-xs" style={{ color: t.textMuted }}>{lng.name}</span>
                  </div>
                  {lang === lng.code && (
                    <svg className="w-5 h-5" style={{ color: '#4facfe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 30% at 50% 20%, rgba(20,90,140,0.15) 0%, transparent 70%)',
      }} />

      <div className="flex flex-col h-full no-scrollbar overflow-y-auto relative z-10">
        {/* Header */}
        <div className="pt-14 pb-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #2563a8 50%, #1e4d8c 100%)', border: '2px solid rgba(79,172,254,0.3)', boxShadow: '0 0 24px rgba(79,172,254,0.25)' }}>
              {initials}
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2" style={{ background: '#22c55e', borderColor: t.bgPrimary }} />
          </div>
          <h2 className="font-bold text-xl" style={{ color: t.textPrimary }}>{userName || 'User'}</h2>
          <p className="text-sm mt-0.5" style={{ color: t.textSecondary }}>{userEmail}</p>
          <div className="mt-3 px-3 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(79,172,254,0.1)', border: '1px solid rgba(79,172,254,0.2)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#4facfe' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(147,197,253,0.8)' }}>{tr.uipathAccount}</span>
          </div>
        </div>

        {/* Settings */}
        <div className="px-4 flex flex-col gap-5 pb-6">

          {/* Preferences */}
          <div>
            <p className="text-xs font-semibold tracking-widest mb-2 px-1" style={{ color: t.textLabel }}>{tr.sectionPreferences}</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>

              {/* Notifications */}
              <div className="w-full flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${t.divider}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bgIconBox }}>
                  <svg className="w-4 h-4" style={{ color: '#4facfe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="flex-1 text-sm" style={{ color: t.textBody }}>{tr.notifications}</span>
                <span className="text-xs" style={{ color: t.textMuted }}>{tr.notifOn}</span>
              </div>

              {/* Appearance toggle */}
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:opacity-70" style={{ borderBottom: `1px solid ${t.divider}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bgIconBox }}>
                  <svg className="w-4 h-4" style={{ color: '#4facfe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <span className="flex-1 text-sm text-left" style={{ color: t.textBody }}>{tr.appearance}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: t.textMuted }}>{theme === 'dark' ? tr.dark : tr.light}</span>
                  <div className="relative rounded-full transition-all duration-300" style={{ width: 44, height: 26, background: theme === 'light' ? 'linear-gradient(135deg,#4facfe,#00c6ff)' : 'rgba(255,255,255,0.15)' }}>
                    <div className="absolute top-1 rounded-full bg-white transition-all duration-300" style={{ width: 18, height: 18, left: theme === 'light' ? 22 : 4, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              </button>

              {/* Language picker */}
              <button onClick={() => setShowLangPicker(true)} className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:opacity-70">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bgIconBox }}>
                  <svg className="w-4 h-4" style={{ color: '#4facfe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <span className="flex-1 text-sm text-left" style={{ color: t.textBody }}>{tr.language}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: t.textMuted }}>{currentLanguage.nativeName}</span>
                  <svg className="w-4 h-4" style={{ color: t.chevron }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* About */}
          <div>
            <p className="text-xs font-semibold tracking-widest mb-2 px-1" style={{ color: t.textLabel }}>{tr.sectionAbout}</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
              {[
                { label: tr.privacyPolicy, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', value: '' },
                { label: tr.termsOfService, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', value: '' },
                { label: tr.appVersion, icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', value: '1.0.0' },
              ].map((item, idx, arr) => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${t.divider}` : 'none' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bgIconBox }}>
                    <svg className="w-4 h-4" style={{ color: '#4facfe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                    </svg>
                  </div>
                  <span className="flex-1 text-sm" style={{ color: t.textBody }}>{item.label}</span>
                  {item.value ? (
                    <span className="text-xs" style={{ color: t.textMuted }}>{item.value}</span>
                  ) : (
                    <svg className="w-4 h-4" style={{ color: t.chevron }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-colors active:opacity-80" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <svg className="w-4 h-4" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-medium text-left" style={{ color: '#f87171' }}>{tr.signOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
