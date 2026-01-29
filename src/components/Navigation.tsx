import { Users, Swords } from 'lucide-react';

interface NavigationProps {
  activeTab: 'members' | 'warlog';
  onTabChange: (tab: 'members' | 'warlog') => void;
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
        onClick={() => onTabChange('warlog')}
        className={`nav-tab flex items-center gap-2 ${activeTab === 'warlog' ? 'active' : ''}`}
      >
        <Swords className="w-4 h-4" />
        War Logs
      </button>
    </nav>
  );
}
