import { Users, Ship } from 'lucide-react';

interface NavigationProps {
  activeTab: 'members' | 'riverrace';
  onTabChange: (tab: 'members' | 'riverrace') => void;
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
    </nav>
  );
}
