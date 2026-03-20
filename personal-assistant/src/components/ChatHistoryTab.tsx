import { useState, useEffect } from 'react';

interface ChatHistoryEntry {
  id: string;
  agentName: string;
  title: string;
  timestamp: number;
}

interface Props {
  onExplore: () => void;
}

// Demo entries shown when history is empty
const DEMO_ENTRIES: ChatHistoryEntry[] = [
  { id: 'd1', agentName: 'Claims Adjuster Agent', title: 'Futuristic portrait exploration',           timestamp: new Date('2025-12-07T15:00:00').getTime() },
  { id: 'd2', agentName: 'Claims Adjuster Agent', title: 'Voice to text preview for Bubly',           timestamp: new Date('2025-12-07T11:00:00').getTime() },
  { id: 'd3', agentName: 'Invoice Insight Agent',  title: 'Smooth UI bubble conversation draft',      timestamp: new Date('2025-12-07T09:00:00').getTime() },
  { id: 'd4', agentName: 'KCB Agent',              title: 'Natural english caption for Dribbble',     timestamp: new Date('2025-12-05T14:00:00').getTime() },
  { id: 'd5', agentName: 'Invoice Insight Agent',  title: 'Light adjustment note for UI concept',     timestamp: new Date('2025-12-05T10:00:00').getTime() },
  { id: 'd6', agentName: 'Claims Adjuster Agent',  title: 'Gamification flow ideas',                  timestamp: new Date('2025-12-04T16:00:00').getTime() },
  { id: 'd7', agentName: 'KCB Agent',              title: 'Education brochure tone setup',             timestamp: new Date('2025-12-03T13:00:00').getTime() },
  { id: 'd8', agentName: 'Invoice Insight Agent',  title: '3D Orb texture prompt',                    timestamp: new Date('2025-12-03T08:00:00').getTime() },
];

function getHistory(): ChatHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem('pa_chat_history') || '[]');
  } catch {
    return [];
  }
}

function formatDateLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
}

export default function ChatHistoryTab({ onExplore }: Props) {
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = getHistory();
    setHistory(stored.length > 0 ? [...stored].reverse() : DEMO_ENTRIES);
  }, []);

  const filtered = search
    ? history.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.agentName.toLowerCase().includes(search.toLowerCase())
      )
    : history;

  // Group by date label
  const groups: { label: string; items: ChatHistoryEntry[] }[] = [];
  filtered.forEach((entry) => {
    const label = formatDateLabel(entry.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(entry);
    else groups.push({ label, items: [entry] });
  });

  return (
    <div className="flex flex-col h-full" style={{ background: '#07090f' }}>

      {/* Subtle centre glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% 38%, rgba(20,90,140,0.22) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex-shrink-0 relative z-10">
        <h1 className="text-white font-bold mb-5" style={{ fontSize: 22 }}>Your conversation</h1>

        {/* Search + new button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-4 rounded-full"
            style={{
              height: 48,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
            <svg style={{ width: 16, height: 16, flexShrink: 0, color: 'rgba(147,197,253,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            />
          </div>
          <button
            onClick={onExplore}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg,#4facfe 0%,#00c6ff 100%)',
              boxShadow: '0 0 20px rgba(79,172,254,0.4)',
            }}>
            <svg style={{ width: 20, height: 20 }} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 relative z-10">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
            <p className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No conversations yet</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>Start chatting from Home or Explore</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Date label */}
                <p className="text-xs font-semibold tracking-widest mb-2.5" style={{ color: 'rgba(147,197,253,0.38)' }}>
                  {group.label}
                </p>
                {/* All items in one rounded card, divided by hairlines */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {group.items.map((entry, idx) => (
                    <button
                      key={entry.id}
                      className="w-full flex items-center px-4 py-3.5 text-left active:bg-white/10 transition-colors"
                      style={idx < group.items.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.07)' } : {}}
                    >
                      <p className="text-white text-sm font-medium truncate">{entry.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
