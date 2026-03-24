import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type AlertType = 'success' | 'action' | 'warning' | 'info';

import type { Translation } from '../i18n/translations';

interface Alert {
  id: string;
  type: AlertType;
  agent: string;
  titleKey: keyof Translation;
  descKey: keyof Translation;
  timestamp: number;
  read: boolean;
}

const ALERT_SEED: Alert[] = [
  { id: 'a1', type: 'action',  agent: 'Claims Adjuster Agent', titleKey: 'alertAction1Title', descKey: 'alertAction1Desc', timestamp: new Date('2026-03-23T14:32:00').getTime(), read: false },
  { id: 'a2', type: 'success', agent: 'Invoice Insight Agent',  titleKey: 'alertSucc1Title',   descKey: 'alertSucc1Desc',   timestamp: new Date('2026-03-23T11:05:00').getTime(), read: false },
  { id: 'a3', type: 'warning', agent: 'HR Assistant',           titleKey: 'alertWarn1Title',   descKey: 'alertWarn1Desc',   timestamp: new Date('2026-03-23T09:18:00').getTime(), read: true  },
  { id: 'a4', type: 'success', agent: 'Claims Adjuster Agent',  titleKey: 'alertSucc2Title',   descKey: 'alertSucc2Desc',   timestamp: new Date('2026-03-22T17:00:00').getTime(), read: true  },
  { id: 'a5', type: 'info',    agent: 'KCB Digital Banking',    titleKey: 'alertInfo1Title',   descKey: 'alertInfo1Desc',   timestamp: new Date('2026-03-22T13:45:00').getTime(), read: true  },
  { id: 'a6', type: 'action',  agent: 'Invoice Insight Agent',  titleKey: 'alertAction2Title', descKey: 'alertAction2Desc', timestamp: new Date('2026-03-22T10:20:00').getTime(), read: true  },
  { id: 'a7', type: 'success', agent: 'HR Assistant',           titleKey: 'alertSucc3Title',   descKey: 'alertSucc3Desc',   timestamp: new Date('2026-03-21T16:30:00').getTime(), read: true  },
  { id: 'a8', type: 'warning', agent: 'Supply Chain Agent',     titleKey: 'alertWarn2Title',   descKey: 'alertWarn2Desc',   timestamp: new Date('2026-03-21T11:00:00').getTime(), read: true  },
];

const TYPE_CONFIG: Record<AlertType, { bg: string; border: string; dot: string; icon: React.ReactNode }> = {
  success: {
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.2)',
    dot: '#4ade80',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  action: {
    bg: 'rgba(79,172,254,0.08)',
    border: 'rgba(79,172,254,0.22)',
    dot: '#4facfe',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4facfe" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  warning: {
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.2)',
    dot: '#fbbf24',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    dot: '#a78bfa',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateLabel(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'TODAY';
  if (sameDay(d, yesterday)) return 'YESTERDAY';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
}

export default function AlertsTab() {
  const { t, tr } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>(ALERT_SEED);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const markRead = (id: string) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const visible = filter === 'unread' ? alerts.filter((a) => !a.read) : alerts;

  // Group by date
  const groups: { label: string; items: Alert[] }[] = [];
  visible.forEach((alert) => {
    const label = formatDateLabel(alert.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(alert);
    else groups.push({ label, items: [alert] });
  });

  return (
    <div className="flex flex-col h-full" style={{ background: t.bgPrimary }}>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 35% at 50% 30%, rgba(79,100,200,0.14) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-bold" style={{ fontSize: 22, color: t.textPrimary }}>{tr.alerts}</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium" style={{ color: t.textSecondary }}>
              {tr.markAllRead}
            </button>
          )}
        </div>
        <p className="text-xs mb-4" style={{ color: t.textMuted }}>
          {unreadCount > 0 ? tr.unreadCount(unreadCount) : tr.allCaughtUp}
        </p>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={filter === f ? {
                background: 'linear-gradient(135deg,#4facfe,#00c6ff)', color: '#fff',
              } : {
                background: t.bgCard, border: `1px solid ${t.border}`, color: t.textMuted,
              }}
            >
              {f === 'unread' ? (unreadCount > 0 ? `${tr.filterUnread} (${unreadCount})` : tr.filterUnread) : tr.filterAll}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 relative z-10">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={t.textMuted} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm font-medium" style={{ color: t.textMuted }}>{tr.noNotifications}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold tracking-widest mb-2.5" style={{ color: t.textLabel }}>
                  {group.label === 'TODAY' ? tr.today : group.label === 'YESTERDAY' ? tr.yesterday : group.label}
                </p>
                <div className="flex flex-col gap-2">
                  {group.items.map((alert) => {
                    const cfg = TYPE_CONFIG[alert.type];
                    return (
                      <div
                        key={alert.id}
                        className="rounded-2xl p-4 relative"
                        style={{
                          background: alert.read ? t.bgCard : cfg.bg,
                          border: `1px solid ${alert.read ? t.border : cfg.border}`,
                        }}
                        onClick={() => markRead(alert.id)}
                      >
                        {/* Unread dot */}
                        {!alert.read && (
                          <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                            style={{ width: 32, height: 32, background: alert.read ? 'rgba(255,255,255,0.06)' : cfg.bg, border: `1px solid ${cfg.border}` }}>
                            {cfg.icon}
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-semibold" style={{ color: alert.read ? 'rgba(255,255,255,0.35)' : cfg.dot }}>
                                {tr[alert.titleKey] as string}
                              </p>
                            </div>
                            <p className="text-sm font-medium leading-snug mb-1" style={{ color: alert.read ? t.textBody : t.textPrimary }}>
                              {tr[alert.descKey] as string}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs" style={{ color: t.textSecondary }}>{alert.agent}</p>
                              <p className="text-xs" style={{ color: t.textMuted }}>{formatTime(alert.timestamp)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons for action-type alerts */}
                        {alert.type === 'action' && !alert.read && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(alert.id); }}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: 'linear-gradient(135deg,#4facfe,#00c6ff)', color: '#fff' }}
                            >
                              {tr.reviewNow}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                            >
                              {tr.dismiss}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
