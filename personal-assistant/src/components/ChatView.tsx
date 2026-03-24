import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';
import { CHIP_TRANSLATIONS } from '../i18n/translations';
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
  conversationId?: string;
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

type Chip = { label: string; icon: React.ReactNode };

const CHIP_ICONS = {
  search:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  list:     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  alert:    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  chart:    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  person:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  money:    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  box:      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  chat:     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  doc:      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

const CATEGORY_ICONS: Record<string, React.ReactNode[]> = {
  default:  [CHIP_ICONS.chat,  CHIP_ICONS.list,  CHIP_ICONS.doc,    CHIP_ICONS.search, CHIP_ICONS.chart,  CHIP_ICONS.alert],
  invoice:  [CHIP_ICONS.list,  CHIP_ICONS.alert, CHIP_ICONS.chart,  CHIP_ICONS.search, CHIP_ICONS.money,  CHIP_ICONS.alert],
  claim:    [CHIP_ICONS.list,  CHIP_ICONS.alert, CHIP_ICONS.chart,  CHIP_ICONS.search, CHIP_ICONS.doc,    CHIP_ICONS.alert],
  hr:       [CHIP_ICONS.list,  CHIP_ICONS.person,CHIP_ICONS.doc,    CHIP_ICONS.chart,  CHIP_ICONS.search, CHIP_ICONS.list],
  supply:   [CHIP_ICONS.alert, CHIP_ICONS.box,   CHIP_ICONS.search, CHIP_ICONS.chart,  CHIP_ICONS.alert,  CHIP_ICONS.list],
  kcb:      [CHIP_ICONS.list,  CHIP_ICONS.alert, CHIP_ICONS.chat,   CHIP_ICONS.money,  CHIP_ICONS.search, CHIP_ICONS.person],
  customer: [CHIP_ICONS.list,  CHIP_ICONS.alert, CHIP_ICONS.chart,  CHIP_ICONS.search, CHIP_ICONS.doc,    CHIP_ICONS.chat],
};

function buildChips(lang: string, category: string): Chip[] {
  const labels = (CHIP_TRANSLATIONS[lang] ?? CHIP_TRANSLATIONS['en'])[category as keyof typeof CHIP_TRANSLATIONS['en']];
  const icons = CATEGORY_ICONS[category];
  return labels.map((label, i) => ({ label, icon: icons[i] }));
}

function getAgentChips(agent: AgentGetResponse, lang: string): Chip[] {
  const key = (agent.name + ' ' + (agent.processKey ?? '')).toLowerCase();
  if (key.includes('invoice') || key.includes('finance') || key.includes('payment')) return buildChips(lang, 'invoice');
  if (key.includes('claim') || key.includes('adjuster') || key.includes('insurance')) return buildChips(lang, 'claim');
  if (key.includes('hr') || key.includes('talent') || key.includes('recruit') || key.includes('onboard')) return buildChips(lang, 'hr');
  if (key.includes('supply') || key.includes('inventory') || key.includes('warehouse') || key.includes('logistics')) return buildChips(lang, 'supply');
  if (key.includes('kcb') || key.includes('bank') || key.includes('loan') || key.includes('transaction')) return buildChips(lang, 'kcb');
  if (key.includes('customer') || key.includes('support') || key.includes('ticket') || key.includes('service')) return buildChips(lang, 'customer');
  return buildChips(lang, 'default');
}

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

export default function ChatView({ agent, conversationalAgent, onBack, onSwitchAgent, conversationId: existingConversationId }: Props) {
  const { t, tr, lang } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allAgents, setAllAgents] = useState<AgentGetResponse[]>([]);

  // Agents permanently hidden from all views
  const BLOCKED_PROCESS_KEYS = new Set([
    'KCB.Conversational.Agent.agent.Agent',
    'ConversationalAgent_Prj.Agent.HR_ConvAgent',
    'Solution.53.agent.Agent',
    'Claims.Adjuster.Agent.agent.Agent',
  ]);

  // Fetch & deduplicate agents for the switcher
  useEffect(() => {
    conversationalAgent.getAll().then((all) => {
      const byKey = new Map<string, AgentGetResponse>();
      for (const a of all) {
        if (BLOCKED_PROCESS_KEYS.has(a.processKey)) continue;
        const existing = byKey.get(a.processKey);
        if (!existing) { byKey.set(a.processKey, a); continue; }
        const t1 = existing.createdTime ? new Date(existing.createdTime).getTime() : 0;
        const t2 = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        if (t2 > t1) byKey.set(a.processKey, a);
      }
      setAllAgents(Array.from(byKey.values()));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationalAgent]);

  const convRef = useRef<ConversationGetResponse | null>(null);
  const sessionRef = useRef<SessionStream | null>(null);
  const exchangeAssistantIdRef = useRef<Map<string, string>>(new Map());
  const exchangeTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const hasSavedHistoryRef = useRef(false);
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
        const agentName = agent.name.replace(/_/g, ' ');

        // Either resume an existing conversation or create a new one
        let conv: ConversationGetResponse;
        if (existingConversationId) {
          conv = await conversationalAgent.conversations.getById(existingConversationId);
        } else {
          conv = await agent.conversations.create({ label: `Chat with ${agentName}` });
        }
        if (!mounted) return;

        // Load existing message history from exchanges
        if (existingConversationId) {
          try {
            const exchangesResult = await conv.exchanges.getAll();
            const loaded: ChatMessage[] = [];
            for (const exchange of exchangesResult.items) {
              for (const message of exchange.messages) {
                const parts = message.contentParts ?? [];
                let content = '';
                for (const part of parts) {
                  try {
                    const data = await part.getData();
                    if (typeof data === 'string') {
                      content += data;
                    } else {
                      content += await (data as Response).text();
                    }
                  } catch { /* skip unreadable part */ }
                }
                if (content.trim()) {
                  loaded.push({
                    id: message.id,
                    role: message.role === MessageRole.User ? 'user' : 'assistant',
                    content,
                  });
                }
              }
            }
            if (mounted && loaded.length > 0) setMessages(loaded);
          } catch { /* ignore history load errors */ }
        }

        convRef.current = conv;
        const session = conv.startSession({ echo: true });
        sessionRef.current = session;

        const agentNameForHistory = agent.name.replace(/_/g, ' ');
        const clearExchange = (exchangeId: string, assistantId: string, errorMsg?: string) => {
          clearTimeout(exchangeTimeoutRef.current.get(exchangeId));
          exchangeTimeoutRef.current.delete(exchangeId);
          exchangeAssistantIdRef.current.delete(exchangeId);
          setMessages((prev) => prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false, ...(errorMsg && !m.content ? { content: errorMsg } : {}) }
              : m
          ));
          setIsStreaming(false);
          // Save to history only on first successful exchange (no error, has a conv ID)
          if (!errorMsg && !hasSavedHistoryRef.current && convRef.current && !existingConversationId) {
            hasSavedHistoryRef.current = true;
            try {
              const history = JSON.parse(localStorage.getItem('pa_chat_history') || '[]');
              const todayStr = new Date().toDateString();
              const existingIdx = history.findIndex(
                (h: { agentName: string; timestamp: number }) =>
                  h.agentName === agentNameForHistory && new Date(h.timestamp).toDateString() === todayStr
              );
              if (existingIdx >= 0) {
                history[existingIdx].timestamp = Date.now();
                history[existingIdx].conversationId = convRef.current.id;
              } else {
                history.push({ id: `chat-${Date.now()}`, agentId: String(agent.id), agentName: agentNameForHistory, title: `Chat with ${agentNameForHistory}`, timestamp: Date.now(), conversationId: convRef.current.id });
              }
              localStorage.setItem('pa_chat_history', JSON.stringify(history.slice(-50)));
            } catch { /* ignore */ }
          }
        };

        session.onAnyErrorStart((err) => {
          const errMsg = err.message || 'The agent encountered an error. Please try again.';
          exchangeAssistantIdRef.current.forEach((assistantId, exchangeId) => {
            clearExchange(exchangeId, assistantId, errMsg);
          });
          setError(errMsg);
        });

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
          exchange.onExchangeEnd(() => clearExchange(exchange.exchangeId, assistantId));
          exchange.onErrorStart((err) => clearExchange(exchange.exchangeId, assistantId, err.message || 'Agent error'));
        });

        if (mounted) setIsInitializing(false);
      } catch {
        if (mounted) { setError(tr.failedToConnect); setIsInitializing(false); }
      }
    };
    setup();
    return () => { mounted = false; convRef.current?.endSession(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, existingConversationId]);

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

    const timeout = setTimeout(() => {
      if (!exchangeAssistantIdRef.current.has(exchangeId)) return;
      exchangeTimeoutRef.current.delete(exchangeId);
      exchangeAssistantIdRef.current.delete(exchangeId);
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId ? { ...m, isStreaming: false, content: 'Agent is not responding. Please try again.' } : m
      ));
      setIsStreaming(false);
    }, 40000);
    exchangeTimeoutRef.current.set(exchangeId, timeout);

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
      style={{ background: t.bgPage }}>

      {/* Header — back | centered title dropdown | menu */}
      <div className="flex-shrink-0 relative" style={{ borderBottom: `1px solid ${t.headerBorder}` }}>
        <div className="flex items-center px-4 pt-14 pb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: t.backBtnBg }}
          >
            <svg className="w-5 h-5" style={{ color: t.backBtnIcon }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Clickable agent name */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-1"
            >
              <span className="font-semibold text-sm" style={{ color: t.headerName }}>{getDisplayName(agent)}</span>
              <svg
                className="w-3.5 h-3.5 transition-transform"
                style={{ color: t.headerChevron, transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
              background: t.dropdownBg,
              border: `1px solid ${t.borderStrong}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
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
                  <p className="text-sm font-medium truncate" style={{ color: t.textPrimary }}>{getDisplayName(a)}</p>
                  {a.processKey && (
                    <p className="text-xs truncate" style={{ color: t.textSecondary }}>{a.processKey}</p>
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
              {getAgentChips(agent, lang).map((chip) => (
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
                    ? { background: 'linear-gradient(135deg,#4facfe 0%,#00c6ff 100%)', color: '#fff' }
                    : { background: t.aiBubbleBg, border: `1px solid ${t.aiBubbleBorder}`, color: t.aiBubbleText }
                }
              >
                {msg.isStreaming && !msg.content ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'rgba(255,255,255,0.4)', animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                ) : msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <p className="font-bold text-base mb-1 text-white">{children}</p>,
                        h2: ({ children }) => <p className="font-bold text-sm mb-1 mt-2" style={{ color: 'rgba(147,197,253,0.9)' }}>{children}</p>,
                        h3: ({ children }) => <p className="font-semibold text-sm mb-1 mt-1.5" style={{ color: 'rgba(147,197,253,0.75)' }}>{children}</p>,
                        p: ({ children }) => <p className="mb-1.5 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic" style={{ color: 'rgba(200,220,255,0.8)' }}>{children}</em>,
                        ul: ({ children }) => <ul className="mb-2 space-y-1 pl-1">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 space-y-1 pl-1">{children}</ol>,
                        li: ({ children }) => (
                          <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#4facfe' }} />
                            <span>{children}</span>
                          </li>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <table className="w-full text-xs border-collapse">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead style={{ background: 'rgba(79,172,254,0.12)' }}>{children}</thead>,
                        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold" style={{ color: 'rgba(147,197,253,0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(210,225,252,0.85)' }}>{children}</td>,
                        code: ({ children }) => <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.1)', color: '#93c5fd' }}>{children}</code>,
                        blockquote: ({ children }) => <blockquote className="pl-3 my-1.5 italic" style={{ borderLeft: '2px solid rgba(79,172,254,0.5)', color: 'rgba(200,220,255,0.7)' }}>{children}</blockquote>,
                        hr: () => <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
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
                style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
                <svg className="w-3.5 h-3.5" style={{ color: t.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        style={{ borderTop: `1px solid ${t.headerBorder}` }}>
        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-2xl px-4 pt-3.5 pb-3" style={{
            background: t.bgInput,
            border: `1px solid ${t.border}`,
            backdropFilter: 'blur(12px)',
          }}>
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isListening ? tr.listening : tr.askAnything}
              className="w-full bg-transparent text-sm outline-none resize-none"
              style={{ color: t.textBody, caretColor: '#4facfe' }}
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
