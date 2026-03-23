import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';
interface Props {
    agent: AgentGetResponse;
    conversationalAgent: ConversationalAgent;
    onBack: () => void;
    onSwitchAgent: (agent: AgentGetResponse) => void;
}
export default function ChatView({ agent, conversationalAgent, onBack, onSwitchAgent }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ChatView.d.ts.map