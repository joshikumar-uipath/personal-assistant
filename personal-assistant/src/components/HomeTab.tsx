import { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';

interface SpeechRecognitionEvent {
  results: { [i: number]: { [i: number]: { transcript: string }; isFinal: boolean }; length: number };
}

interface AgentRunResult {
  id: string;
  agentName: string;
  tag: string;
  tagColor: string;
  summary: string;
  detail: string[];
  timeAgo: string;
  accentColor: string;
}

const AGENT_RUN_RESULTS: AgentRunResult[] = [
  {
    id: '1',
    agentName: 'Claims Adjuster Agent',
    tag: 'Claims',
    tagColor: 'rgba(59,130,246,0.85)',
    summary: '3 new claims reviewed — 2 approved, 1 flagged',
    detail: [
      'Claim #CLM-4821 — Auto collision, $4,200. Approved. All documents verified.',
      'Claim #CLM-4822 — Property damage, $11,500. Approved. Assessor report matched.',
      'Claim #CLM-4823 — Medical, $32,000. ⚠️ Flagged for manual review — missing hospital discharge summary.',
    ],
    timeAgo: '2 min ago',
    accentColor: 'rgba(59,130,246,0.9)',
  },
  {
    id: '2',
    agentName: 'Invoice Insight Agent',
    tag: 'Finance',
    tagColor: 'rgba(234,179,8,0.85)',
    summary: '5 overdue invoices detected — total $12,450',
    detail: [
      'INV-0091 — Acme Corp, $3,200 — 14 days overdue. Follow-up email drafted.',
      'INV-0094 — Beta Solutions, $2,750 — 21 days overdue. Escalation recommended.',
      'INV-0097 — Gamma Ltd, $1,800 — 9 days overdue.',
      'INV-0099 — Delta Inc, $2,900 — 30 days overdue. Legal notice advised.',
      'INV-0103 — Epsilon Co, $1,800 — 7 days overdue.',
    ],
    timeAgo: '15 min ago',
    accentColor: 'rgba(234,179,8,0.9)',
  },
  {
    id: '3',
    agentName: 'KCB Conversational Agent',
    tag: 'Customer',
    tagColor: 'rgba(34,197,94,0.85)',
    summary: 'Customer sentiment analysis complete — 94% positive',
    detail: [
      '128 interactions analysed across web, mobile, and branch channels.',
      'Top praise: "fast service", "helpful staff", "easy app experience".',
      'Top complaint: "long wait times at branch" — 6 mentions.',
      'Recommendation: Increase digital self-service options to reduce branch load.',
    ],
    timeAgo: '1 hr ago',
    accentColor: 'rgba(34,197,94,0.9)',
  },
];

const GENERIC_NAMES = ['agent', 'assistant', 'bot', 'ai'];

function getDisplayName(agent: AgentGetResponse): string {
  const raw = agent.name.trim();
  if (!GENERIC_NAMES.includes(raw.toLowerCase()) && raw.length > 0) return raw;
  if (!agent.processKey) return raw;
  const parts = agent.processKey.split('.');
  const nonGeneric = parts.filter((p) => !GENERIC_NAMES.includes(p.toLowerCase()) && p.length > 2);
  if (nonGeneric.length === 0) return raw;
  const first = nonGeneric[0];
  const last = nonGeneric[nonGeneric.length - 1];
  return (first === last ? first : `${first} · ${last}`).replace(/_/g, ' ');
}


// Photo-simulation card backgrounds via layered CSS gradients
const CARD_STYLES = [
  {
    name: 'Image\nGenerator',
    bg: [
      // Concentric swirl rings (teal woman effect)
      'repeating-radial-gradient(circle at 48% 36%, rgba(0,180,160,0) 0px, rgba(0,180,160,0) 7px, rgba(0,195,175,0.16) 8px, rgba(0,180,160,0) 9px)',
      // Face/head central glow
      'radial-gradient(ellipse 42% 50% at 48% 35%, rgba(80,225,205,0.68) 0%, rgba(0,185,165,0.38) 45%, transparent 70%)',
      // Shoulder sweep
      'radial-gradient(ellipse 85% 32% at 50% 96%, rgba(0,145,130,0.55) 0%, transparent 68%)',
      // Base
      'linear-gradient(160deg, #041a18 0%, #072822 60%, #030f0d 100%)',
    ].join(','),
  },
  {
    name: 'Homework\nSolver',
    bg: [
      // Desk surface line
      'linear-gradient(to bottom, transparent 52%, rgba(50,80,120,0.55) 52%, rgba(50,80,120,0.55) 54%, transparent 54%)',
      // Person silhouette
      'radial-gradient(ellipse 24% 30% at 50% 40%, rgba(78,108,162,0.62) 0%, rgba(52,82,135,0.32) 60%, transparent 82%)',
      // Room ambient light
      'radial-gradient(ellipse 55% 42% at 62% 18%, rgba(72,105,165,0.38) 0%, transparent 72%)',
      // Shelf/background horizontal tones
      'linear-gradient(to bottom, #0a1018 0%, #111c2c 48%, #0a1520 60%, #07101a 100%)',
    ].join(','),
  },
  {
    name: 'Generate\na prompt',
    bg: [
      // Matrix vertical lines
      'repeating-linear-gradient(90deg, rgba(0,210,55,0.055) 0px, rgba(0,210,55,0.055) 1px, transparent 1px, transparent 7px)',
      // Face/head glow (green)
      'radial-gradient(ellipse 38% 48% at 52% 35%, rgba(0,225,68,0.6) 0%, rgba(0,175,52,0.3) 50%, transparent 74%)',
      // Shoulder glow
      'radial-gradient(ellipse 78% 30% at 50% 92%, rgba(0,155,48,0.55) 0%, transparent 68%)',
      // Base
      'linear-gradient(160deg, #04100a 0%, #081510 60%, #030a06 100%)',
    ].join(','),
  },
];


interface Props {
  conversationalAgent: ConversationalAgent;
  selectedAgent: AgentGetResponse | null;
  onSelectAgent: (agent: AgentGetResponse) => void;
  onStartChat: (agent: AgentGetResponse) => void;
  onLogout: () => void;
  userName?: string;
}

export default function HomeTab({ conversationalAgent, selectedAgent, onSelectAgent, onStartChat, onLogout, userName }: Props) {
  const [agents, setAgents] = useState<AgentGetResponse[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedResult, setSelectedResult] = useState<AgentRunResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRef = useRef<any>(null);

  useEffect(() => {
    conversationalAgent.getAll().then((all) => {
      // Deduplicate by processKey, keep latest by createdTime, then sort latest first
      const byKey = new Map<string, AgentGetResponse>();
      for (const agent of all) {
        const existing = byKey.get(agent.processKey);
        if (!existing) { byKey.set(agent.processKey, agent); continue; }
        const existingTime = existing.createdTime ? new Date(existing.createdTime).getTime() : 0;
        const newTime = agent.createdTime ? new Date(agent.createdTime).getTime() : 0;
        if (newTime > existingTime) byKey.set(agent.processKey, agent);
      }
      const sorted = Array.from(byKey.values()).sort((a, b) => {
        const aTime = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        const bTime = b.createdTime ? new Date(b.createdTime).getTime() : 0;
        return bTime - aTime;
      });
      setAgents(sorted);
      if (!selectedAgent && sorted.length > 0) onSelectAgent(sorted[0]);
    });
  }, [conversationalAgent]);

  const activeAgent = selectedAgent ?? agents[0] ?? null;
  const cardAgents = agents.slice(0, 3);

  const toggleVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { speechRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = 'en-US';
    speechRef.current = rec;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join('');
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal && activeAgent) {
        setTranscript(''); setIsListening(false); onStartChat(activeAgent);
      }
    };
    rec.start();
  }, [isListening, activeAgent, onStartChat]);

  /* ── Voice mode ─────────────────────────────────────────────────── */
  if (isListening) {
    return (
      <div className="flex flex-col h-full" style={{ background: '#000' }}>
        <div className="flex justify-center pt-16 pb-3">
          <div className="px-5 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            Talking to {activeAgent?.name.replace(/_/g, ' ').split(' ')[0] ?? 'Agent'}
          </div>
        </div>
        <p className="text-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Go ahead, I'm listening...
        </p>
        <div className="flex-1 flex flex-col items-center justify-center">
          <video
            src="./orb.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: 220, height: 220, objectFit: 'contain' }}
          />
          <div className="flex items-end gap-1.5 mt-8" style={{ height: 50 }}>
            {[0.35, 0.6, 1, 0.8, 0.55, 0.95, 0.7, 0.45, 0.85, 0.6].map((h, i) => (
              <div key={i} className="w-1 rounded-full" style={{
                height: `${h * 50}px`,
                background: 'linear-gradient(to top,#4facfe,#a8e0ff)',
                animation: `wave ${0.75 + i * 0.08}s ease-in-out infinite alternate`,
                transformOrigin: 'bottom',
              }} />
            ))}
          </div>
          {transcript && (
            <p className="text-center px-10 mt-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {transcript}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-12 pb-14">
          <button onClick={onLogout} className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={toggleVoice} className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#4facfe,#00d4ff)', boxShadow: '0 0 32px rgba(79,172,254,0.7)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── Main home screen ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full overflow-y-auto relative" style={{ background: '#000' }}>


      {/* Video — pushed down with marginTop */}
      <div className="relative flex-shrink-0" style={{ marginTop: 30 }}>
        <video
          src="./orb.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', maxHeight: 260, display: 'block', objectFit: 'cover' }}
        />
      </div>

      {/* Greeting — tight under video */}
      <div className="flex flex-col items-center relative z-10 flex-shrink-0" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
        <h2 className="text-white font-bold mb-1.5 tracking-tight" style={{ fontSize: 24 }}>
          Hello, {userName ? userName : 'there'} 👋
        </h2>
        <p className="text-sm" style={{ color: 'rgba(175,200,235,0.6)' }}>How can I help you today?</p>
      </div>

      {/* Input card — single compact row */}
      <div className="px-4 mb-4 relative z-10 flex-shrink-0">
        <div className="rounded-full px-3 flex items-center gap-2" style={{
          background: 'rgba(8,18,38,0.65)',
          border: '1px solid rgba(79,140,230,0.28)',
          backdropFilter: 'blur(20px)',
          height: 68,
        }}>
          {/* Attachment */}
          <button className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg style={{ width: 15, height: 15, color: 'rgba(200,220,255,0.65)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>
          {/* Globe */}
          <button className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg style={{ width: 15, height: 15, color: 'rgba(200,220,255,0.65)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
            </svg>
          </button>
          {/* Mic */}
          <button onClick={toggleVoice} className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg style={{ width: 15, height: 15, color: 'rgba(200,220,255,0.65)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Divider */}
          <div className="flex-shrink-0" style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)' }} />

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim() && activeAgent) { onStartChat(activeAgent); setInput(''); }
            }}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13.5, caretColor: '#4facfe' }}
          />

          {/* Send button */}
          <button
            onClick={() => activeAgent && (input.trim() ? (onStartChat(activeAgent), setInput('')) : onStartChat(activeAgent))}
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{
              background: input.trim() ? 'linear-gradient(135deg,#4facfe 0%,#00c6ff 100%)' : 'rgba(79,172,254,0.25)',
              boxShadow: input.trim() ? '0 0 16px rgba(79,172,254,0.5)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <svg style={{ width: 15, height: 15 }} className="text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>


      {/* Recently Active Agents */}
      <div className="px-4 pb-5 relative z-10 flex-shrink-0">
        <p className="text-white font-bold text-sm mb-3">Recently Active Agents</p>
        <div className="flex gap-3">
          {(cardAgents.length > 0 ? cardAgents : [null, null, null]).map((agent, i) => {
            const style = CARD_STYLES[i];
            const displayName = agent ? getDisplayName(agent) : style.name;
            return (
              <button
                key={agent?.id ?? i}
                onClick={() => agent && onSelectAgent(agent)}
                className="flex-1 rounded-xl overflow-hidden relative active:scale-95 transition-transform"
                style={{ height: 90, background: style.bg }}
              >
                <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 pt-8"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}>
                  <p className="text-white font-semibold text-left leading-snug"
                    style={{ fontSize: 10.5 }}>
                    {displayName}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent Insights — completed run results */}
      <div className="px-4 pb-8 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm">Agent Insights</p>
          <span className="text-xs" style={{ color: 'rgba(147,197,253,0.5)' }}>Tap to view</span>
        </div>
        <div className="flex flex-col gap-3">
          {AGENT_RUN_RESULTS.map((result) => (
            <button
              key={result.id}
              onClick={() => setSelectedResult(result)}
              className="rounded-2xl px-4 py-3.5 text-left active:scale-95 transition-transform"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Top row: agent name + time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Coloured dot */}
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: result.accentColor }} />
                  <span className="text-white font-semibold" style={{ fontSize: 12.5 }}>{result.agentName}</span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(147,197,253,0.4)' }}>{result.timeAgo}</span>
              </div>
              {/* Summary */}
              <p className="leading-snug mb-2.5" style={{ fontSize: 13, color: 'rgba(215,228,252,0.82)' }}>
                {result.summary}
              </p>
              {/* Tag + chevron */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-white font-medium"
                  style={{ fontSize: 10, background: result.tagColor }}>
                  {result.tag}
                </span>
                <svg style={{ width: 14, height: 14, color: 'rgba(147,197,253,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Result detail modal */}
      {selectedResult && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="rounded-t-3xl px-5 pt-5 pb-10 flex flex-col gap-4"
            style={{ background: '#0e1525', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '75%', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full mx-auto mb-1" style={{ background: 'rgba(255,255,255,0.2)' }} />

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, ${selectedResult.accentColor} 70%)` }}>
                <svg style={{ width: 16, height: 16, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.614.261a2.25 2.25 0 001.857 0l.614-.261a2.25 2.25 0 001.357-2.059V3.186" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold" style={{ fontSize: 15 }}>{selectedResult.agentName}</p>
                <p style={{ fontSize: 11, color: 'rgba(147,197,253,0.5)' }}>Completed · {selectedResult.timeAgo}</p>
              </div>
            </div>

            {/* Summary banner */}
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white font-semibold text-sm">{selectedResult.summary}</p>
            </div>

            {/* Detail items */}
            <div className="flex flex-col gap-2.5">
              {selectedResult.detail.map((line, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: selectedResult.accentColor }} />
                  <p style={{ fontSize: 13, color: 'rgba(215,228,252,0.8)', lineHeight: 1.5 }}>{line}</p>
                </div>
              ))}
            </div>

            {/* Action button */}
            <button
              onClick={() => { setSelectedResult(null); if (agents[0]) onStartChat(agents[0]); }}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm mt-1"
              style={{ background: 'linear-gradient(135deg,#4facfe 0%,#00c6ff 100%)' }}
            >
              Discuss with Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
