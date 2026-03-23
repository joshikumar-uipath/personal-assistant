import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';
interface Props {
    conversationalAgent: ConversationalAgent;
    onSelectAgent: (agent: AgentGetResponse) => void;
    onLogout: () => void;
}
export default function AgentGrid({ conversationalAgent, onSelectAgent, onLogout }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AgentGrid.d.ts.map