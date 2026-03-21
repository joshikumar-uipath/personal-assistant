import { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationalAgent, MessageRole } from '@uipath/uipath-typescript/conversational-agent';
import type {
  AgentGetResponse,
  ConversationGetResponse,
  SessionStream,
} from '@uipath/uipath-typescript/conversational-agent';

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string }; isFinal: boolean }; length: number };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface Props {
  agent: AgentGetResponse;
  conversationalAgent: ConversationalAgent;
  onBack: () => void;
  onSwitchAgent: (agent: AgentGetResponse) => void;
}

const GENERIC = ['agent', 'assistant', 'bot', 'ai'];
function getDisplayName(a: AgentGetResponse): string {
  const raw = a.name.trim();
  if (!GENERIC.includes(raw.toLowerCase()) && raw.length > 0) return raw;
  if (!a.processKey) return raw;
  const parts = a.processKey.split('.');
  const useful = parts.filter(p => !GENERIC.includes(p.toLowerCase()) && p.length > 2);
  if (useful.length === 0) return raw;
  const first = useful[0], last = useful[useful.length - 1];
  return (first === last ? first : `${first} · ${last}`).replace(/_/g, ' ');
}

// Empty-state chips (2-column grid, matches Screen 2 from design)
const EMPTY_CHIPS = [
  { label: 'image edit',       icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { label: 'Generate prompt',  icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  { label: 'Deep research',    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { label: 'Rewrite',          icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
  { label: 'Translate',        icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" /></svg> },
  { label: 'Homework',         icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
];

function MiniOrb({ size = 28 }: { size?: number }) {
  return (
    <video
      src="./chat-orb.mp4"
      autoPlay loop muted playsInline
      className="flex-shrink-0"
      style={{ width: size, height: size, objectFit: 'contain', mixBlendMode: 'screen' }}
    />
  );
}

export default function ChatView({ agent, conversationalAgent, onBack, onSwitchAgent }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allAgents, setAllAgents] = useState<AgentGetResponse[]>([]);

  // Fetch & deduplicate agents for the switcher
  useEffect(() => {
    conversationalAgent.getAll().then((all) => {
      const byKey = new Map<string, AgentGetResponse>();
      for (const a of all) {
        const existing = byKey.get(a.processKey);
        if (!existing) { byKey.set(a.processKey, a); continue; }
        const t1 = existing.createdTime ? new Date(existing.createdTime).getTime() : 0;
        const t2 = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        if (t2 > t1) byKey.set(a.processKey, a);
      }
      setAllAgents(Array.from(byKey.values()));
    }).catch(() => {});
  }, [conversationalAgent]);

  const convRef = useRef<ConversationGetResponse | null>(null);
  const sessionRef = useRef<SessionStream | null>(null);
  const exchangeAssistantIdRef = useRef<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      try {
        const conv = await agent.conversations.create({ label: `Chat with ${agent.name}` });
        if (!mounted) return;
        try {
          const history = JSON.parse(localStorage.getItem('pa_chat_history') || '[]');
          history.push({ id: `chat-${Date.now()}`, agentId: agent.id, agentName: agent.name.replace(/_/g, ' '), title: `Chat with ${agent.name.replace(/_/g, ' ')}`, timestamp: Date.now() });
          localStorage.setItem('pa_chat_history', JSON.stringify(history.slice(-50)));
        } catch { /* ignore */ }

        convRef.current = conv;
        const session = conv.startSession({ echo: true });
        sessionRef.current = session;

        session.onExchangeStart((exchange) => {
          const assistantId = exchangeAssistantIdRef.current.get(exchange.exchangeId);
          if (!assistantId) return;
          setIsStreaming(true);
          exchange.onMessageStart((message) => {
            if (!message.isAssistant) return;
            message.onContentPartStart((contentPart) => {
              if (contentPart.isMarkdown || contentPart.isText) {
                contentPart.onChunk((chunk) => {
                  if (chunk.data) {
                    setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk.data } : m));
                  }
                });
              }
            });
          });
          exchange.onExchangeEnd(() => {
            exchangeAssistantIdRef.current.delete(exchange.exchangeId);
            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m));
            setIsStreaming(false);
          });
        });

        if (mounted) setIsInitializing(false);
      } catch {
        if (mounted) { setError('Failed to connect. Please go back and try again.'); setIsInitializing(false); }
      }
    };
    setup();
    return () => { mounted = false; convRef.current?.endSession(); };
  }, [agent]);

  const sendMessage = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!sessionRef.current || !text || isStreaming) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: text };
    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    const exchangeId = `exchange-${Date.now()}-${crypto.randomUUID().slice(0, 12)}`;
    exchangeAssistantIdRef.current.set(exchangeId, assistantId);

    const exchange = sessionRef.current.startExchange({ exchangeId });
    const message = exchange.startMessage({ role: MessageRole.User });
    await message.sendContentPart({ data: text });
    message.sendMessageEnd();
  }, [input, isStreaming]);

  const toggleVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError('Voice not supported. Try Chrome.'); return; }
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
      if (e.results[e.results.length - 1].isFinal) { sendMessage(t); setTranscript(''); }
      else { setInput(t); }
    };
    rec.start();
  }, [isListening, sendMessage]);

  /* ── Loading ────────────────────────────────────────────────────── */
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3" style={{ background: '#000' }}>
        <video src="./chat-orb.mp4" autoPlay loop muted playsInline style={{ width: 48, height: 48, objectFit: 'contain', mixBlendMode: 'screen' }} />
        <p className="text-sm" style={{ color: 'rgba(147,197,253,0.65)' }}>
          Connecting to {agent.name.replace(/_/g, ' ')}...
        </p>
      </div>
    );
  }

  /* ── Voice mode ─────────────────────────────────────────────────── */
  if (isListening) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'linear-gradient(160deg,#050912 0%,#0a1020 100%)' }}>
        <div className="flex items-center justify-center pt-16 pb-3">
          <div className="px-5 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
            Talking to {agent.name.replace(/_/g, ' ')}
          </div>
        </div>
        <p className="text-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Go ahead, I'm listening...</p>
        <div className="flex-1 flex flex-col items-center justify-center">
          <video src="./chat-orb.mp4" autoPlay loop muted playsInline style={{ width: 230, height: 230, objectFit: 'contain', mixBlendMode: 'screen' }} />
          <div className="flex items-end gap-1.5 mt-8" style={{ height: 52 }}>
            {[0.35, 0.6, 1, 0.8, 0.55, 0.95, 0.7, 0.45, 0.85, 0.6].map((h, i) => (
              <div key={i} className="w-1 rounded-full" style={{
                height: `${h * 52}px`,
                background: 'linear-gradient(to top,#4facfe,#00d4ff)',
                animation: `wave ${0.75 + i * 0.08}s ease-in-out infinite alternate`,
                transformOrigin: 'bottom',
              }} />
            ))}
          </div>
          {transcript && (
            <p className="text-center px-10 mt-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{transcript}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-12 pb-14">
          <button onClick={onBack} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.55)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={toggleVoice} className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#4facfe 0%,#00d4ff 100%)', boxShadow: '0 0 32px rgba(79,172,254,0.65)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.55)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── Chat screen ────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full"
      style={{ background: 'linear-gradient(160deg,#070b18 0%,#0d1526 55%,#070b18 100%)' }}>

      {/* Header — back | centered title dropdown | menu */}
      <div className="flex-shrink-0 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center px-4 pt-14 pb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Clickable agent name */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-1"
            >
              <span className="text-white font-semibold text-sm">{getDisplayName(agent)}</span>
              <svg
                className="w-3.5 h-3.5 transition-transform"
                style={{ color: 'rgba(255,255,255,0.4)', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Agent switcher dropdown */}
        {showDropdown && allAgents.length > 0 && (
          <div
            className="absolute left-4 right-4 z-50 rounded-2xl overflow-hidden"
            style={{
              top: '100%',
              marginTop: 4,
              background: 'rgba(15,22,40,0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {allAgents.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => { setShowDropdown(false); onSwitchAgent(a); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-white/10"
                style={{
                  borderBottom: idx < allAgents.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  background: a.id === agent.id ? 'rgba(79,172,254,0.1)' : 'transparent',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{getDisplayName(a)}</p>
                  {a.processKey && (
                    <p className="text-xs truncate" style={{ color: 'rgba(147,197,253,0.45)' }}>{a.processKey}</p>
                  )}
                </div>
                {a.id === agent.id && (
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#4facfe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 flex-shrink-0 flex items-start gap-2 rounded-xl p-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Empty state — orb + heading + 6-chip grid (Screen 2) */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center mt-0 px-2 text-center">
            <video src="./chat-orb.mp4" autoPlay loop muted playsInline className="mb-2" style={{ width: 340, objectFit: 'contain', mixBlendMode: 'screen' }} />
            <h3 className="text-white font-semibold text-lg mb-1">How can I help you today?</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(147,197,253,0.5)' }}>
              {agent.description ?? `Ask ${agent.name.replace(/_/g, ' ')} anything`}
            </p>
            {/* 2-column chip grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {EMPTY_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => sendMessage(chip.label)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs text-left transition-all active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(210,225,250,0.85)',
                  }}
                >
                  <span style={{ color: 'rgba(130,185,255,0.7)', flexShrink: 0 }}>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        <div className="space-y-3 mt-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && <MiniOrb size={26} />}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                style={
                  msg.role === 'user'
                    ? {
                        background: 'rgba(255,255,255,0.09)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: 'rgba(255,255,255,0.92)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.9)',
                      }
                }
              >
                {msg.isStreaming && !msg.content ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'rgba(255,255,255,0.4)', animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reaction row after last assistant message */}
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].isStreaming && (
          <div className="flex items-center gap-3 mt-2 ml-10">
            {['M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
              'M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5',
              'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
            ].map((d, i) => (
              <button key={i} className="w-7 h-7 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
                </svg>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pb-8 pt-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-2xl px-4 pt-3.5 pb-3" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}>
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
              className="w-full bg-transparent text-sm outline-none resize-none"
              style={{ color: 'rgba(255,255,255,0.9)', caretColor: '#4facfe' }}
              disabled={isStreaming || isListening}
            />
            <div className="flex items-center gap-5 mt-3">
              <button className="flex-shrink-0" style={{ color: 'rgba(140,188,238,0.48)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>
              <button className="flex-shrink-0" style={{ color: 'rgba(140,188,238,0.48)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                </svg>
              </button>
              <button onClick={toggleVoice} className="flex-shrink-0" style={{ color: isListening ? '#ef4444' : 'rgba(140,188,238,0.48)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Send circle */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 52, height: 52,
              background: input.trim() && !isStreaming
                ? 'linear-gradient(135deg,#4facfe 0%,#00c6ff 100%)'
                : 'rgba(79,172,254,0.2)',
              boxShadow: input.trim() && !isStreaming ? '0 0 22px rgba(79,172,254,0.5)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <p className="text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          By using this chat, you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
