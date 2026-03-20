import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';
import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';
import HomeTab from './components/HomeTab';
import ExploreTab from './components/ExploreTab';
import ChatHistoryTab from './components/ChatHistoryTab';
import ChatView from './components/ChatView';
import BottomNav, { type Tab } from './components/BottomNav';

const authConfig: UiPathSDKConfig = {
  clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
  orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
  tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
  baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
  redirectUri: (window.location.origin + window.location.pathname).replace(/\/$/, ''),
  scope: import.meta.env.VITE_UIPATH_SCOPES,
};

function LoadingOrb() {
  return (
    <div className="flex items-center justify-center h-full" style={{ background: '#070b18' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 25%,rgba(220,240,255,0.9) 0%,rgba(100,180,255,0.8) 20%,rgba(50,120,220,0.9) 50%,rgba(10,40,120,1) 100%)',
          boxShadow: '0 0 36px rgba(79,172,254,0.65)',
          animation: 'orb-breathe 2s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function getUserFirstName(token: string | undefined): string {
  if (!token) return '';
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Try dedicated name claims first, fall back to email local-part
    const raw = p.FirstName || p.first_name || p.given_name || p.name?.split(' ')[0] || p.email?.split('@')[0] || '';
    // If it still looks like an email address, strip the domain
    return raw.includes('@') ? raw.split('@')[0] : raw;
  } catch {
    return '';
  }
}

function MainApp() {
  const { sdk, isLoading, isAuthenticated, login, logout, error } = useAuth();
  const userName = isAuthenticated ? getUserFirstName(sdk.getToken()) : '';
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedAgent, setSelectedAgent] = useState<AgentGetResponse | null>(null);
  const [chatAgent, setChatAgent] = useState<AgentGetResponse | null>(null);

  const conversationalAgent = useMemo(() => new ConversationalAgent(sdk), [sdk]);

  if (isLoading) return <LoadingOrb />;

  // ── Login screen ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-6 gap-8"
        style={{ background: 'linear-gradient(160deg,#070b18 0%,#0d1526 50%,#070b18 100%)' }}
      >
        {/* Orb */}
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <div
            className="absolute rounded-full"
            style={{
              inset: '-48%',
              background: 'radial-gradient(circle,rgba(79,172,254,0.18) 0%,transparent 65%)',
              animation: 'glow-pulse 3s ease-in-out infinite',
            }}
          />
          <div
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 35% 25%,rgba(230,245,255,0.95) 0%,rgba(140,200,255,0.9) 15%,rgba(70,140,230,0.95) 40%,rgba(20,60,160,1) 70%,rgba(8,25,80,1) 100%)',
              boxShadow: '0 0 60px rgba(79,172,254,0.6),0 0 120px rgba(79,172,254,0.28)',
              animation: 'orb-breathe 4s ease-in-out infinite',
            }}
          >
            <div
              className="absolute"
              style={{
                width: '38%', height: '33%', left: '20%', top: '16%',
                background: 'radial-gradient(ellipse,rgba(255,255,255,0.58) 0%,transparent 70%)',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Personal Assistant</h1>
          <p className="text-sm" style={{ color: 'rgba(147,197,253,0.65)' }}>
            Your UiPath AI agents, at your fingertips
          </p>
        </div>

        {error && (
          <div
            className="w-full max-w-xs rounded-2xl p-3 text-sm text-center"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={login}
          className="w-full max-w-xs py-4 rounded-2xl font-semibold text-white text-base"
          style={{
            background: 'linear-gradient(135deg,#4facfe 0%,#00d4ff 100%)',
            boxShadow: '0 0 30px rgba(79,172,254,0.4)',
          }}
        >
          Sign in with UiPath
        </button>
      </div>
    );
  }

  // ── Chat view (full screen, no bottom nav) ────────────────────────
  if (chatAgent) {
    return (
      <ChatView
        agent={chatAgent}
        conversationalAgent={conversationalAgent}
        onBack={() => setChatAgent(null)}
      />
    );
  }

  // ── Tabbed app ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#000' }}>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && (
          <HomeTab
            conversationalAgent={conversationalAgent}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            onStartChat={setChatAgent}
            onLogout={logout}
            userName={userName}
          />
        )}
        {activeTab === 'chat' && (
          <ChatHistoryTab onExplore={() => setActiveTab('explore')} />
        )}
        {activeTab === 'explore' && (
          <ExploreTab
            conversationalAgent={conversationalAgent}
            onSelectAgent={(agent) => {
              setSelectedAgent(agent);
              setActiveTab('home');
            }}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider config={authConfig}>
      <MainApp />
    </AuthProvider>
  );
}
