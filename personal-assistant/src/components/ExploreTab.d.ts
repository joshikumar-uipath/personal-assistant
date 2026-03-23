import { ConversationalAgent } from '@uipath/uipath-typescript/conversational-agent';
import type { AgentGetResponse } from '@uipath/uipath-typescript/conversational-agent';
interface Props {
    conversationalAgent: ConversationalAgent;
    onSelectAgent: (agent: AgentGetResponse) => void;
}
export default function ExploreTab({ conversationalAgent, onSelectAgent }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExploreTab.d.ts.map