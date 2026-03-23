export type Tab = 'home' | 'chat' | 'explore' | 'alerts' | 'profile';
interface Props {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}
export default function BottomNav({ activeTab, onTabChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BottomNav.d.ts.map