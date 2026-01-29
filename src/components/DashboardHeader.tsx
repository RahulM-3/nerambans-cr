import { RefreshCw, Clock, Users, Trophy } from 'lucide-react';
import { ClanMember } from '@/types/clan';

interface DashboardHeaderProps {
  memberCount: number;
  topTrophies: number;
  lastUpdated: Date | null;
  isLoading: boolean;
}

export function DashboardHeader({ memberCount, topTrophies, lastUpdated, isLoading }: DashboardHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient-gold glow-gold">
            Clan Dashboard
          </h1>
          <div className="hidden md:flex items-center gap-4 ml-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{memberCount} Members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Top: {topTrophies.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className={`flex items-center gap-2 ${isLoading ? 'animate-pulse' : ''}`}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Auto-refresh</span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="tabular-nums">{formatTime(lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
