import React from 'react';

export type Tab = 'home' | 'chat' | 'explore' | 'alerts';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

const TABS: { id: Tab; label: string; Icon: () => React.ReactElement; badge?: number }[] = [
  { id: 'home',    label: 'Home',    Icon: HomeIcon },
  { id: 'chat',    label: 'Chat',    Icon: ChatIcon },
  { id: 'explore', label: 'Explore', Icon: ExploreIcon },
  { id: 'alerts',  label: 'Alerts',  Icon: BellIcon, badge: 1 },
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-around px-6"
      style={{
        background: 'rgba(6,9,15,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'max(env(safe-area-inset-bottom),14px)',
        paddingTop: '10px',
      }}
    >
      {TABS.map(({ id, label, Icon, badge }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-1.5 flex-1"
          >
            {/* Icon — filled blue pill when active, plain when not */}
            <div className="relative">
              <div
                className="flex items-center justify-center rounded-2xl transition-all"
                style={
                  active
                    ? { width: 58, height: 34, background: 'rgba(88,148,218,0.92)', boxShadow: '0 2px 16px rgba(88,148,218,0.4)', color: 'white' }
                    : { width: 58, height: 34, color: 'rgba(255,255,255,0.38)' }
                }
              >
                <Icon />
              </div>
              {badge && !active && (
                <div className="absolute -top-0.5 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ background: '#ef4444', border: '2px solid rgba(6,9,15,0.97)' }}>
                  <span style={{ fontSize: 7, color: 'white', fontWeight: 700 }}>{badge}</span>
                </div>
              )}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
