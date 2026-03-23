"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatHistoryTab;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// Demo entries shown when history is empty
const DEMO_ENTRIES = [
    { id: 'd1', agentName: 'Claims Adjuster Agent', title: 'Futuristic portrait exploration', timestamp: new Date('2025-12-07T15:00:00').getTime() },
    { id: 'd2', agentName: 'Claims Adjuster Agent', title: 'Voice to text preview for Bubly', timestamp: new Date('2025-12-07T11:00:00').getTime() },
    { id: 'd3', agentName: 'Invoice Insight Agent', title: 'Smooth UI bubble conversation draft', timestamp: new Date('2025-12-07T09:00:00').getTime() },
    { id: 'd4', agentName: 'KCB Agent', title: 'Natural english caption for Dribbble', timestamp: new Date('2025-12-05T14:00:00').getTime() },
    { id: 'd5', agentName: 'Invoice Insight Agent', title: 'Light adjustment note for UI concept', timestamp: new Date('2025-12-05T10:00:00').getTime() },
    { id: 'd6', agentName: 'Claims Adjuster Agent', title: 'Gamification flow ideas', timestamp: new Date('2025-12-04T16:00:00').getTime() },
    { id: 'd7', agentName: 'KCB Agent', title: 'Education brochure tone setup', timestamp: new Date('2025-12-03T13:00:00').getTime() },
    { id: 'd8', agentName: 'Invoice Insight Agent', title: '3D Orb texture prompt', timestamp: new Date('2025-12-03T08:00:00').getTime() },
];
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('pa_chat_history') || '[]');
    }
    catch {
        return [];
    }
}
function formatDateLabel(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
}
function ChatHistoryTab({ onExplore }) {
    const [history, setHistory] = (0, react_1.useState)([]);
    const [search, setSearch] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const stored = getHistory();
        setHistory(stored.length > 0 ? [...stored].reverse() : DEMO_ENTRIES);
    }, []);
    const filtered = search
        ? history.filter(h => h.title.toLowerCase().includes(search.toLowerCase()) ||
            h.agentName.toLowerCase().includes(search.toLowerCase()))
        : history;
    // Group by date label
    const groups = [];
    filtered.forEach((entry) => {
        const label = formatDateLabel(entry.timestamp);
        const last = groups[groups.length - 1];
        if (last && last.label === label)
            last.items.push(entry);
        else
            groups.push({ label, items: [entry] });
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", style: { background: '#07090f' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 pointer-events-none", style: {
                    background: 'radial-gradient(ellipse 70% 40% at 50% 38%, rgba(20,90,140,0.22) 0%, transparent 70%)',
                } }), (0, jsx_runtime_1.jsxs)("div", { className: "px-5 pt-14 pb-5 flex-shrink-0 relative z-10", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-white font-bold mb-5", style: { fontSize: 22 }, children: "Your conversation" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex items-center gap-2.5 px-4 rounded-full", style: {
                                    height: 48,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                }, children: [(0, jsx_runtime_1.jsx)("svg", { style: { width: 16, height: 16, flexShrink: 0, color: 'rgba(147,197,253,0.5)' }, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search...", className: "flex-1 bg-transparent outline-none text-sm", style: { color: 'rgba(255,255,255,0.75)' } })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onExplore, className: "flex items-center justify-center rounded-full flex-shrink-0", style: {
                                    width: 48, height: 48,
                                    background: 'linear-gradient(135deg,#4facfe 0%,#00c6ff 100%)',
                                    boxShadow: '0 0 20px rgba(79,172,254,0.4)',
                                }, children: (0, jsx_runtime_1.jsx)("svg", { style: { width: 20, height: 20 }, className: "text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 4v16m8-8H4" }) }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto px-5 pb-8 relative z-10", children: groups.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-48 text-center gap-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium text-sm", style: { color: 'rgba(255,255,255,0.4)' }, children: "No conversations yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs", style: { color: 'rgba(255,255,255,0.22)' }, children: "Start chatting from Home or Explore" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-col gap-5", children: groups.map((group) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold tracking-widest mb-2.5", style: { color: 'rgba(147,197,253,0.38)' }, children: group.label }), (0, jsx_runtime_1.jsx)("div", { className: "rounded-2xl overflow-hidden", style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }, children: group.items.map((entry, idx) => ((0, jsx_runtime_1.jsx)("button", { className: "w-full flex items-center px-4 py-3.5 text-left active:bg-white/10 transition-colors", style: idx < group.items.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.07)' } : {}, children: (0, jsx_runtime_1.jsx)("p", { className: "text-white text-sm font-medium truncate", children: entry.title }) }, entry.id))) })] }, group.label))) })) })] }));
}
//# sourceMappingURL=ChatHistoryTab.js.map