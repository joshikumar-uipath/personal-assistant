import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';
interface Props {
    conversationalAgent: ConversationalAgent;
    selectedAgent: AgentGetResponse | null;
    onSelectAgent: (agent: AgentGetResponse) => void;
    onStartChat: (agent: AgentGetResponse) => void;
    onLogout: () => void;
    userName?: string;
}
export default function HomeTab({ conversationalAgent, selectedAgent, onSelectAgent, onStartChat, onLogout, userName }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HomeTab.d.ts.map