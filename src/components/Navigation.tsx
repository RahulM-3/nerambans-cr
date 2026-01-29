import { Users, Ship, History } from 'lucide-react';

interface NavigationProps {
  activeTab: 'members' | 'riverrace' | 'history';
  onTabChange: (tab: 'members' | 'riverrace' | 'history') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex border-b border-border">
      <button
        onClick={() => onTabChange('members')}
        className={`nav-tab flex items-center gap-2 ${activeTab === 'members' ? 'active' : ''}`}
      >
        <Users className="w-4 h-4" />
        Clan Members
      </button>
      <button
        onClick={() => onTabChange('riverrace')}
        className={`nav-tab flex items-center gap-2 ${activeTab === 'riverrace' ? 'active' : ''}`}
      >
        <Ship className="w-4 h-4" />
        River Race
      </button>
      <button
        onClick={() => onTabChange('history')}
        className={`nav-tab flex items-center gap-2 ${activeTab === 'history' ? 'active' : ''}`}
      >
        <History className="w-4 h-4" />
        Race History
      </button>
    </nav>
  );
}
