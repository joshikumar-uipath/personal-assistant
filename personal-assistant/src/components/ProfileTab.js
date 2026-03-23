"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfileTab;
const jsx_runtime_1 = require("react/jsx-runtime");
const SETTINGS = [
    {
        section: 'Preferences',
        items: [
            { label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', value: 'On' },
            { label: 'Appearance', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', value: 'Dark' },
            { label: 'Language', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', value: 'English' },
        ],
    },
    {
        section: 'About',
        items: [
            { label: 'Privacy Policy', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', value: '' },
            { label: 'Terms of Service', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', value: '' },
            { label: 'App Version', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', value: '1.0.0' },
        ],
    },
];
function ProfileTab({ userName, userEmail, onLogout }) {
    const initials = userName ? userName.slice(0, 2).toUpperCase() : '?';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full no-scrollbar overflow-y-auto", style: { background: '#07090f' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 pointer-events-none", style: {
                    background: 'radial-gradient(ellipse 60% 30% at 50% 20%, rgba(20,90,140,0.2) 0%, transparent 70%)',
                } }), (0, jsx_runtime_1.jsxs)("div", { className: "pt-14 pb-6 flex flex-col items-center relative z-10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white", style: {
                                    background: 'linear-gradient(135deg, #1a3a6e 0%, #2563a8 50%, #1e4d8c 100%)',
                                    border: '2px solid rgba(79,172,254,0.3)',
                                    boxShadow: '0 0 24px rgba(79,172,254,0.25)',
                                }, children: initials }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2", style: { background: '#22c55e', borderColor: '#07090f' } })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-white font-bold text-xl", children: userName || 'User' }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-0.5", style: { color: 'rgba(147,197,253,0.55)' }, children: userEmail }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 px-3 py-1 rounded-full flex items-center gap-1.5", style: { background: 'rgba(79,172,254,0.1)', border: '1px solid rgba(79,172,254,0.2)' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 rounded-full", style: { background: '#4facfe' } }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium", style: { color: 'rgba(147,197,253,0.8)' }, children: "UiPath Account" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 flex flex-col gap-5 relative z-10 pb-6", children: [SETTINGS.map((section) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold tracking-widest mb-2 px-1", style: { color: 'rgba(147,197,253,0.38)' }, children: section.section.toUpperCase() }), (0, jsx_runtime_1.jsx)("div", { className: "rounded-2xl overflow-hidden", style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }, children: section.items.map((item, idx) => ((0, jsx_runtime_1.jsxs)("button", { className: "w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/10", style: { borderBottom: idx < section.items.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", style: { background: 'rgba(79,172,254,0.12)' }, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", style: { color: '#4facfe' }, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.8, d: item.icon }) }) }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 text-sm text-left", style: { color: 'rgba(255,255,255,0.85)' }, children: item.label }), item.value ? ((0, jsx_runtime_1.jsx)("span", { className: "text-xs", style: { color: 'rgba(147,197,253,0.45)' }, children: item.value })) : ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", style: { color: 'rgba(255,255,255,0.2)' }, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }))] }, item.label))) })] }, section.section))), (0, jsx_runtime_1.jsxs)("button", { onClick: onLogout, className: "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-colors active:opacity-80", style: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", style: { background: 'rgba(239,68,68,0.15)' }, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", style: { color: '#f87171' }, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.8, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }) }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 text-sm font-medium text-left", style: { color: '#f87171' }, children: "Sign Out" })] })] })] }));
}
//# sourceMappingURL=ProfileTab.js.map