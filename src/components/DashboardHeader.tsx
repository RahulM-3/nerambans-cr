import { RefreshCw, Clock, Users, Trophy, Ship, Swords } from 'lucide-react';
import { RiverRaceData } from '@/types/clan';

interface DashboardHeaderProps {
  memberCount: number;
  topTrophies: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  riverRace?: RiverRaceData | null;
}

export function DashboardHeader({ memberCount, topTrophies, lastUpdated, isLoading, riverRace }: DashboardHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient-gold glow-gold">
              NERAMBANS Dashboard
            </h1>
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

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{memberCount} Members</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Top: {topTrophies.toLocaleString()}</span>
          </div>
          {riverRace && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                <Ship className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{riverRace.periodType}</span>
                <span className="text-xs text-muted-foreground">Period {riverRace.periodIndex}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                <Swords className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{riverRace.clan.fame.toLocaleString()} Fame</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
