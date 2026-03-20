import { useState, useEffect } from 'react';
import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';

/**
 * Derives a meaningful display name from the agent.
 * When agent.name is a generic placeholder like "Agent", falls back to
 * parsing the processKey (e.g. "KCB.Conversational.Agent.SpecificName")
 * to extract the project prefix and the last distinctive segment.
 */
function getDisplayName(agent: AgentGetResponse): string {
  const raw = agent.name.trim();
  const GENERIC = ['agent', 'assistant', 'bot', 'ai'];

  if (!GENERIC.includes(raw.toLowerCase()) && raw.length > 0) {
    return raw; // name is already meaningful
  }

  if (!agent.processKey) return raw;

  // processKey format examples:
  //   "KCB.Conversational.Agent.AgentV2"
  //   "Praj_EmailAssistant.Agent.EmailAgent"
  //   "Neom_Survey_analyzer.Agent_survey_conv"
  const parts = agent.processKey.split('.');
  const nonGenericParts = parts.filter(
    (p) => !GENERIC.includes(p.toLowerCase()) && p.length > 2
  );

  if (nonGenericParts.length === 0) return raw;

  // Project prefix (first non-generic) + distinctive tail (last non-generic)
  const first = nonGenericParts[0];
  const last = nonGenericParts[nonGenericParts.length - 1];
  const label = first === last ? first : `${first} · ${last}`;
  return label.replace(/_/g, ' ');
}

// Card gradient palette — cycles across agents
const CARD_GRADIENTS = [
  'linear-gradient(145deg,#0c1a42 0%,#1a3275 100%)',
  'linear-gradient(145deg,#18094a 0%,#3c1882 100%)',
  'linear-gradient(145deg,#0c2818 0%,#195e32 100%)',
  'linear-gradient(145deg,#2c0c0c 0%,#7a1e1e 100%)',
  'linear-gradient(145deg,#271d09 0%,#64470e 100%)',
  'linear-gradient(145deg,#0c2628 0%,#0f4d5c 100%)',
  'linear-gradient(145deg,#1c0c2c 0%,#471060 100%)',
  'linear-gradient(145deg,#092418 0%,#0f5230 100%)',
];

// Subtle top-right corner glow colours per card
const CARD_GLOWS = [
  'rgba(60,120,240,0.35)',
  'rgba(120,60,240,0.35)',
  'rgba(40,160,80,0.3)',
  'rgba(200,40,40,0.3)',
  'rgba(180,130,20,0.3)',
  'rgba(20,160,200,0.3)',
  'rgba(140,40,200,0.3)',
  'rgba(30,180,90,0.3)',
];

interface Props {
  conversationalAgent: ConversationalAgent;
  onSelectAgent: (agent: AgentGetResponse) => void;
}

function AgentOrb() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      {/* Ambient glow */}
      <div className="absolute rounded-full" style={{
        inset: '-35%',
        background: 'radial-gradient(circle, rgba(79,152,254,0.28) 0%, transparent 70%)',
      }} />
      {/* Glass orb */}
      <div className="w-full h-full rounded-full relative" style={{
        background: 'radial-gradient(circle at 38% 30%, rgba(200,230,255,0.92) 0%, rgba(130,185,255,0.82) 16%, rgba(70,140,245,0.84) 40%, rgba(28,88,220,0.92) 68%, rgba(10,42,155,1) 88%, rgba(5,22,80,1) 100%)',
        boxShadow: '0 0 28px rgba(60,130,240,0.7), 0 0 55px rgba(40,100,220,0.38)',
      }}>
        {/* Primary specular highlight */}
        <div className="absolute" style={{
          width: '36%', height: '30%', left: '18%', top: '12%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.96) 0%, rgba(240,248,255,0.55) 48%, transparent 100%)',
          borderRadius: '50%',
          transform: 'rotate(-22deg)',
        }} />
        {/* Secondary rim */}
        <div className="absolute" style={{
          width: '15%', height: '12%', right: '20%', top: '20%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.62) 0%, transparent 80%)',
          borderRadius: '50%',
        }} />
      </div>
    </div>
  );
}

export default function ExploreTab({ conversationalAgent, onSelectAgent }: Props) {
  const [agents, setAgents] = useState<AgentGetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    conversationalAgent
      .getAll()
      .then((all) => {
        // Deduplicate by processKey, keeping only the latest by createdTime
        const byKey = new Map<string, AgentGetResponse>();
        for (const agent of all) {
          const existing = byKey.get(agent.processKey);
          if (!existing) { byKey.set(agent.processKey, agent); continue; }
          const existingTime = existing.createdTime ? new Date(existing.createdTime).getTime() : 0;
          const newTime = agent.createdTime ? new Date(agent.createdTime).getTime() : 0;
          if (newTime > existingTime) byKey.set(agent.processKey, agent);
        }
        setAgents(Array.from(byKey.values()));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load agents'))
      .finally(() => setIsLoading(false));
  }, [conversationalAgent]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#06090e' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0">
        <h1 className="text-white font-bold" style={{ fontSize: 28 }}>Explore</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(147,197,253,0.55)' }}>
          {isLoading ? 'Loading agents…' : `${agents.length} AI agent${agents.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 h-48">
            <div className="w-11 h-11 rounded-full" style={{
              background: 'radial-gradient(circle at 35% 25%,rgba(200,235,255,0.92) 0%,rgba(70,140,230,0.9) 50%,rgba(10,40,120,1) 100%)',
              boxShadow: '0 0 28px rgba(79,172,254,0.55)',
              animation: 'orb-breathe 2s ease-in-out infinite',
            }} />
            <p className="text-sm" style={{ color: 'rgba(147,197,253,0.5)' }}>Fetching agents from MEA…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl p-4 text-sm" style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5',
          }}>
            {error}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 h-48">
            <p className="text-sm" style={{ color: 'rgba(147,197,253,0.5)' }}>No agents found in this tenant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent, i) => {
              const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
              const glow = CARD_GLOWS[i % CARD_GLOWS.length];
              const displayName = getDisplayName(agent);
              // Always show processKey as namespace context below the name
              const processTag = agent.processKey || null;

              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent)}
                  className="rounded-2xl overflow-hidden text-left active:scale-95 transition-transform relative"
                  style={{
                    background: gradient,
                    border: '1px solid rgba(255,255,255,0.07)',
                    minHeight: 185,
                  }}
                >
                  {/* Corner glow accent */}
                  <div className="absolute top-0 right-0 pointer-events-none" style={{
                    width: '60%', height: '50%',
                    background: `radial-gradient(ellipse at 85% 10%, ${glow} 0%, transparent 70%)`,
                  }} />

                  {/* Orb section */}
                  <div className="flex items-center justify-center pt-5 pb-3 relative z-10">
                    <AgentOrb />
                  </div>

                  {/* Name + status */}
                  <div className="px-3 pb-4 relative z-10">
                    <p className="text-white font-bold text-sm leading-snug mb-0.5" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    }}>
                      {displayName}
                    </p>
                    {processTag && (
                      <p className="text-xs mb-1.5 truncate" style={{ color: 'rgba(147,197,253,0.45)', fontSize: 10 }}>
                        {processTag}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
                      <span className="text-xs font-medium" style={{ color: '#4ade80' }}>Ready</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
