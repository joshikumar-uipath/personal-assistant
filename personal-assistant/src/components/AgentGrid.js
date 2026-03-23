"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AgentGrid;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const conversational_agent_1 = require("@uipath/uipath-typescript/conversational-agent");
const AGENT_COLORS = [
    'bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-rose-500', 'bg-cyan-500', 'bg-amber-500',
];
function getAgentColor(id) {
    return AGENT_COLORS[id % AGENT_COLORS.length];
}
function getAgentInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function AgentGrid({ conversationalAgent, onSelectAgent, onLogout }) {
    const [agents, setAgents] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        conversationalAgent.getAll()
            .then(setAgents)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load agents'))
            .finally(() => setIsLoading(false));
    }, [conversationalAgent]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-screen bg-slate-900", children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-5 pt-14 pb-5 flex items-end justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-white", children: "My Agents" }), !isLoading && ((0, jsx_runtime_1.jsxs)("p", { className: "text-slate-400 text-sm mt-0.5", children: [agents.length, " ", agents.length === 1 ? 'agent' : 'agents', " available"] }))] }), (0, jsx_runtime_1.jsx)("button", { onClick: onLogout, className: "text-slate-400 text-sm hover:text-white transition-colors pb-0.5", children: "Sign out" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto px-5 pb-8", children: isLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center h-48", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" }) })) : error ? ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-900/30 border border-red-800 rounded-2xl p-4 text-red-400 text-sm", children: error })) : agents.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center mt-20 px-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-8 h-8 text-slate-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "font-semibold text-slate-300", children: "No agents found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-slate-500 text-sm mt-1", children: "Create Conversational Agents in UiPath Studio to get started" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3", children: agents.map(agent => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => onSelectAgent(agent), className: "bg-slate-800 rounded-2xl p-4 text-left flex flex-col gap-3 hover:bg-slate-750 active:scale-95 transition-all border border-slate-700/50 hover:border-slate-600", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-12 h-12 rounded-xl ${getAgentColor(agent.id)} flex items-center justify-center shadow-lg`, children: (0, jsx_runtime_1.jsx)("span", { className: "text-white font-bold text-lg", children: getAgentInitials(agent.name) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-white font-semibold text-sm leading-snug truncate", children: agent.name }), agent.description && ((0, jsx_runtime_1.jsx)("div", { className: "text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed", children: agent.description }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-emerald-400 text-xs font-medium", children: "Ready" })] })] }, agent.id))) })) })] }));
}
//# sourceMappingURL=AgentGrid.js.map