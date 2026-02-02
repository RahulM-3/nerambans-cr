import { useMemo } from 'react';
import { RiverRaceData } from '@/types/clan';
import { ClanExpandableCard } from './ClanExpandableCard';
import { Card, CardContent } from '@/components/ui/card';

interface RiverRaceSectionProps {
  riverRace: RiverRaceData;
  ourClanTag: string;
}

function getHoursRemaining(endTimeStr: string | null): string {
  if (!endTimeStr) return 'N/A';
  
  // Format: "20260126T095506.000Z" -> parse to Date
  const year = endTimeStr.slice(0, 4);
  const month = endTimeStr.slice(4, 6);
  const day = endTimeStr.slice(6, 8);
  const hour = endTimeStr.slice(9, 11);
  const minute = endTimeStr.slice(11, 13);
  
  const endDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Ended';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

export function RiverRaceSection({ riverRace, ourClanTag }: RiverRaceSectionProps) {
  // Sort clans by fame (descending)
  const sortedClans = useMemo(() => {
    if (!riverRace.allClans || !Array.isArray(riverRace.allClans)) return [];
    return [...riverRace.allClans].sort((a, b) => b.fame - a.fame);
  }, [riverRace.allClans]);

  // Format period type for display
  const formatPeriodType = (periodType: string) => {
    return periodType.charAt(0).toUpperCase() + periodType.slice(1);
  };

  const isOurClan = (tag: string) => tag === ourClanTag;
  const isTraining = riverRace.periodType === 'training';
  const endTime = riverRace.endTime || riverRace.warEndTime;

  return (
    <div className="space-y-6">
      {/* Race Info Header */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Race ID</div>
              <div className="text-lg font-bold">{riverRace.raceId}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Period Type</div>
              <div className="text-lg font-bold">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-sm">
                  {formatPeriodType(riverRace.periodType)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {isTraining ? 'Training Day Ends In' : 'Battle Day Ends In'}
              </div>
              <div className="text-sm font-semibold">
                {getHoursRemaining(endTime)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clans List - Expandable */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">Clan Standings ({sortedClans.length} clans)</h2>
        {sortedClans.map((clan, index) => (
          <ClanExpandableCard
            key={clan.tag}
            clan={clan}
            rank={index + 1}
            isOurClan={isOurClan(clan.tag)}
            showDecksToday={true}
            showCollectiveStats={true}
            isTrainingPeriod={isTraining}
          />
        ))}
        {sortedClans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No clan data available
          </div>
        )}
      </div>
    </div>
  );
}
