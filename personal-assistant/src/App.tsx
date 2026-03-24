import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';
import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';
import HomeTab from './components/HomeTab';
import ExploreTab from './components/ExploreTab';
import ChatHistoryTab from './components/ChatHistoryTab';
import ChatView from './components/ChatView';
import ProfileTab from './components/ProfileTab';
import AlertsTab from './components/AlertsTab';
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
    <div className="flex items-center justify-center h-full" style={{ background: '#000' }}>
      <video src="./orb.mp4" autoPlay loop muted playsInline style={{ width: 56, height: 56, objectFit: 'contain' }} />
    </div>
  );
}

function parseToken(token: string | undefined): { firstName: string; email: string } {
  if (!token) return { firstName: '', email: '' };
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const email = p.email || p.upn || '';
    const raw = p.FirstName || p.first_name || p.given_name || p.name?.split(' ')[0] || email.split('@')[0] || '';
    const firstName = raw.includes('@') ? raw.split('@')[0] : raw;
    return { firstName, email };
  } catch {
    return { firstName: '', email: '' };
  }
}

function MainApp() {
  const { sdk, isLoading, isAuthenticated, login, logout, error } = useAuth();
  const { isRtl } = useTheme();
  const { firstName: userName, email: userEmail } = isAuthenticated ? parseToken(sdk.getToken()) : { firstName: '', email: '' };
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedAgent, setSelectedAgent] = useState<AgentGetResponse | null>(null);
  const [chatAgent, setChatAgent] = useState<AgentGetResponse | null>(null);
  const [chatConversationId, setChatConversationId] = useState<string | undefined>(undefined);

  const conversationalAgent = useMemo(() => new ConversationalAgent(sdk), [sdk]);

  if (isLoading) return <LoadingOrb />;

  // ── Login screen ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-6 gap-6"
        style={{ background: '#000' }}
      >
        {/* Video orb + title stacked tight */}
        <div className="flex flex-col items-center" style={{ gap: 4 }}>
          <video
            src="./orb.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: 520, objectFit: 'contain' }}
          />
          <h1 className="font-bold text-white text-center" style={{ fontSize: 52, lineHeight: 1.1, letterSpacing: -1 }}>Aura</h1>
          <p className="text-sm text-center" style={{ color: 'rgba(147,197,253,0.65)' }}>
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
        key={chatAgent.id + (chatConversationId ?? '')}
        agent={chatAgent}
        conversationalAgent={conversationalAgent}
        onBack={() => { setChatAgent(null); setChatConversationId(undefined); }}
        onSwitchAgent={(a) => { setChatAgent(a); setChatConversationId(undefined); }}
        conversationId={chatConversationId}
      />
    );
  }

  // ── Tabbed app ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'} style={{ background: '#000' }}>
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
          <ChatHistoryTab
            onExplore={() => setActiveTab('explore')}
            conversationalAgent={conversationalAgent}
            onOpenChat={(agent, conversationId) => {
              setChatAgent(agent);
              setChatConversationId(conversationId);
            }}
          />
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
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'profile' && (
          <ProfileTab userName={userName} userEmail={userEmail} onLogout={logout} />
        )}
      </div>
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === activeTab && tab !== 'home') setActiveTab('home');
          else setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider config={authConfig}>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
