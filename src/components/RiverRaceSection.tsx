import { useMemo } from 'react';
import { RiverRaceData, RiverRaceParticipantDelta } from '@/types/clan';
import { ClanExpandableCard } from './ClanExpandableCard';

interface RiverRaceSectionProps {
  riverRace: RiverRaceData;
  deltas: Map<string, RiverRaceParticipantDelta>;
}

export function RiverRaceSection({ riverRace, deltas }: RiverRaceSectionProps) {
  // Sort clans by fame (our clan first, then by fame)
  const sortedClans = useMemo(() => {
    if (!riverRace.allClans || !Array.isArray(riverRace.allClans)) return [];
    
    const ourClanTag = riverRace.clan?.tag;
    return [...riverRace.allClans].sort((a, b) => {
      // Our clan always first
      if (a.tag === ourClanTag) return -1;
      if (b.tag === ourClanTag) return 1;
      return b.fame - a.fame;
    });
  }, [riverRace.allClans, riverRace.clan?.tag]);

  const isOurClan = (tag: string) => tag === riverRace.clan?.tag;

  return (
    <div className="space-y-6">
      {/* Race Overview */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Current Race: {riverRace.raceId}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{riverRace.clan?.fame?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted-foreground">Clan Fame</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{riverRace.clan?.repairPoints || 0}</div>
            <div className="text-sm text-muted-foreground">Repair Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{riverRace.clan?.participants?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold capitalize">{riverRace.periodType}</div>
            <div className="text-sm text-muted-foreground">Period Type</div>
          </div>
        </div>
      </div>

      {/* Clans List - Expandable */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Clan Standings ({sortedClans.length} clans)</h2>
        {sortedClans.map((clan, index) => {
          const rank = riverRace.allClans
            .slice()
            .sort((a, b) => b.fame - a.fame)
            .findIndex(c => c.tag === clan.tag) + 1;
          
          return (
            <ClanExpandableCard
              key={clan.tag}
              clan={clan}
              rank={rank}
              isOurClan={isOurClan(clan.tag)}
              deltas={isOurClan(clan.tag) ? deltas : undefined}
            />
          );
        })}
        {sortedClans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No clan data available
          </div>
        )}
      </div>
    </div>
  );
}
