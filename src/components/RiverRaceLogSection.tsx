import { useState } from 'react';
import { RiverRaceLogFile } from '@/types/clan';
import { formatRaceDate } from '@/utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ClanExpandableCard } from './ClanExpandableCard';

interface RiverRaceLogSectionProps {
  log: RiverRaceLogFile;
}

const OUR_CLAN_TAG = '#RG2VL88G';

export function RiverRaceLogSection({ log }: RiverRaceLogSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (log.items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <h3 className="text-xl font-semibold mb-2">No Race History</h3>
        <p className="text-sm">Race history will appear here after completing races.</p>
      </div>
    );
  }

  const currentEntry = log.items[selectedIndex];

  // Sort standings by fame (descending)
  const sortedStandings = [...currentEntry.standings].sort((a, b) => b.clan.fame - a.clan.fame);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4">
        <button
          onClick={() => setSelectedIndex(prev => Math.min(prev + 1, log.items.length - 1))}
          disabled={selectedIndex >= log.items.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Older
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold">
            Season {currentEntry.seasonId} - Week {currentEntry.sectionIndex + 1}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatRaceDate(currentEntry.createdDate)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {selectedIndex + 1} of {log.items.length}
          </div>
        </div>
        
        <button
          onClick={() => setSelectedIndex(prev => Math.max(prev - 1, 0))}
          disabled={selectedIndex <= 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Newer
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Clans List - Expandable */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Final Standings</h2>
        {sortedStandings.map((standing) => (
          <ClanExpandableCard
            key={standing.clan.tag}
            clan={standing.clan}
            rank={standing.rank}
            isOurClan={standing.clan.tag === OUR_CLAN_TAG}
            trophyChange={standing.trophyChange}
            showDecksToday={false}
          />
        ))}
      </div>
    </div>
  );
}
