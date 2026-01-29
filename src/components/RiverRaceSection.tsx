import { useMemo } from 'react';
import { RiverRaceData } from '@/types/clan';
import { ClanExpandableCard } from './ClanExpandableCard';
import { Card, CardContent } from '@/components/ui/card';
import { formatRaceDate } from '@/utils/dateUtils';

interface RiverRaceSectionProps {
  riverRace: RiverRaceData;
  ourClanTag: string;
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

  return (
    <div className="space-y-6">
      {/* Race Info Header */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Collection Ends</div>
              <div className="text-sm font-semibold">
                {riverRace.collectionEndTime ? formatRaceDate(riverRace.collectionEndTime) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">War Ends</div>
              <div className="text-sm font-semibold">
                {riverRace.warEndTime ? formatRaceDate(riverRace.warEndTime) : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clans List - Expandable */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Clan Standings ({sortedClans.length} clans)</h2>
        {sortedClans.map((clan, index) => (
          <ClanExpandableCard
            key={clan.tag}
            clan={clan}
            rank={index + 1}
            isOurClan={isOurClan(clan.tag)}
            showDecksToday={true}
            showCollectiveStats={true}
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
