"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("./hooks/useAuth");
const conversational_agent_1 = require("@uipath/uipath-typescript/conversational-agent");
const HomeTab_1 = __importDefault(require("./components/HomeTab"));
const ExploreTab_1 = __importDefault(require("./components/ExploreTab"));
const ChatHistoryTab_1 = __importDefault(require("./components/ChatHistoryTab"));
const ChatView_1 = __importDefault(require("./components/ChatView"));
const ProfileTab_1 = __importDefault(require("./components/ProfileTab"));
const BottomNav_1 = __importDefault(require("./components/BottomNav"));
const authConfig = {
    clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
    orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
    tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
    baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
    redirectUri: (window.location.origin + window.location.pathname).replace(/\/$/, ''),
    scope: import.meta.env.VITE_UIPATH_SCOPES,
};
function LoadingOrb() {
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full", style: { background: '#000' }, children: (0, jsx_runtime_1.jsx)("video", { src: "./orb.mp4", autoPlay: true, loop: true, muted: true, playsInline: true, style: { width: 56, height: 56, objectFit: 'contain' } }) }));
}
function parseToken(token) {
    if (!token)
        return { firstName: '', email: '' };
    try {
        const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const email = p.email || p.upn || '';
        const raw = p.FirstName || p.first_name || p.given_name || p.name?.split(' ')[0] || email.split('@')[0] || '';
        const firstName = raw.includes('@') ? raw.split('@')[0] : raw;
        return { firstName, email };
    }
    catch {
        return { firstName: '', email: '' };
    }
}
function MainApp() {
    const { sdk, isLoading, isAuthenticated, login, logout, error } = (0, useAuth_1.useAuth)();
    const { firstName: userName, email: userEmail } = isAuthenticated ? parseToken(sdk.getToken()) : { firstName: '', email: '' };
    const [activeTab, setActiveTab] = (0, react_1.useState)('home');
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [chatAgent, setChatAgent] = (0, react_1.useState)(null);
    const conversationalAgent = (0, react_1.useMemo)(() => new conversational_agent_1.ConversationalAgent(sdk), [sdk]);
    if (isLoading)
        return (0, jsx_runtime_1.jsx)(LoadingOrb, {});
    // ── Login screen ──────────────────────────────────────────────────
    if (!isAuthenticated) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full px-6 gap-6", style: { background: '#000' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center", style: { gap: 4 }, children: [(0, jsx_runtime_1.jsx)("video", { src: "./orb.mp4", autoPlay: true, loop: true, muted: true, playsInline: true, style: { width: '100%', height: 520, objectFit: 'contain' } }), (0, jsx_runtime_1.jsx)("h1", { className: "font-bold text-white text-center", style: { fontSize: 52, lineHeight: 1.1, letterSpacing: -1 }, children: "Aura" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-center", style: { color: 'rgba(147,197,253,0.65)' }, children: "Your UiPath AI agents, at your fingertips" })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "w-full max-w-xs rounded-2xl p-3 text-sm text-center", style: {
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                    }, children: error })), (0, jsx_runtime_1.jsx)("button", { onClick: login, className: "w-full max-w-xs py-4 rounded-2xl font-semibold text-white text-base", style: {
                        background: 'linear-gradient(135deg,#4facfe 0%,#00d4ff 100%)',
                        boxShadow: '0 0 30px rgba(79,172,254,0.4)',
                    }, children: "Sign in with UiPath" })] }));
    }
    // ── Chat view (full screen, no bottom nav) ────────────────────────
    if (chatAgent) {
        return ((0, jsx_runtime_1.jsx)(ChatView_1.default, { agent: chatAgent, conversationalAgent: conversationalAgent, onBack: () => setChatAgent(null), onSwitchAgent: (a) => setChatAgent(a) }));
    }
    // ── Tabbed app ────────────────────────────────────────────────────
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full overflow-hidden", style: { background: '#000' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-hidden", children: [activeTab === 'home' && ((0, jsx_runtime_1.jsx)(HomeTab_1.default, { conversationalAgent: conversationalAgent, selectedAgent: selectedAgent, onSelectAgent: setSelectedAgent, onStartChat: setChatAgent, onLogout: logout, userName: userName })), activeTab === 'chat' && ((0, jsx_runtime_1.jsx)(ChatHistoryTab_1.default, { onExplore: () => setActiveTab('explore') })), activeTab === 'explore' && ((0, jsx_runtime_1.jsx)(ExploreTab_1.default, { conversationalAgent: conversationalAgent, onSelectAgent: (agent) => {
                            setSelectedAgent(agent);
                            setActiveTab('home');
                        } })), activeTab === 'profile' && ((0, jsx_runtime_1.jsx)(ProfileTab_1.default, { userName: userName, userEmail: userEmail, onLogout: logout }))] }), (0, jsx_runtime_1.jsx)(BottomNav_1.default, { activeTab: activeTab, onTabChange: (tab) => {
                    if (tab === activeTab && tab !== 'home')
                        setActiveTab('home');
                    else
                        setActiveTab(tab);
                } })] }));
}
function App() {
    return ((0, jsx_runtime_1.jsx)(useAuth_1.AuthProvider, { config: authConfig, children: (0, jsx_runtime_1.jsx)(MainApp, {}) }));
}
//# sourceMappingURL=App.js.map