import { useState, useMemo, useEffect, useRef } from 'react';
import { RiverRaceClan, RiverRaceDelta, RiverRaceSortConfig, RiverRaceFilterConfig } from '@/types/clan';
import { SortArrow } from './SortArrow';
import { FilterInput } from './FilterInput';
import { RiverRaceParticipantsTable } from './RiverRaceParticipantsTable';
import { ChevronDown, ChevronRight, Ship, TrendingUp } from 'lucide-react';

interface RiverRaceTableProps {
  riverRace: RiverRaceClan[];
  deltas: Map<string, RiverRaceDelta>;
}

const initialFilters: RiverRaceFilterConfig = {
  name: '',
  clanScore: '',
  wins: '',
  battlesPlayed: '',
  crowns: '',
};

export function RiverRaceTable({ riverRace, deltas }: RiverRaceTableProps) {
  const [sortConfig, setSortConfig] = useState<RiverRaceSortConfig>({ key: 'clanScore', direction: 'desc' });
  const [filters, setFilters] = useState<RiverRaceFilterConfig>(initialFilters);
  const [expandedClan, setExpandedClan] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const handleScroll = () => {
      scrollPositionRef.current = el.scrollTop;
    };
    
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (scrollRef.current && scrollPositionRef.current > 0) {
      scrollRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [riverRace]);

  const handleSort = (key: keyof RiverRaceClan) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const updateFilter = (key: keyof RiverRaceFilterConfig, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (tag: string) => {
    setExpandedClan(prev => prev === tag ? null : tag);
  };

  const filteredAndSortedClans = useMemo(() => {
    let result = [...riverRace];

    // Apply filters
    if (filters.name) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.clanScore) {
      const minScore = parseInt(filters.clanScore, 10);
      if (!isNaN(minScore)) {
        result = result.filter((c) => c.clanScore >= minScore);
      }
    }
    if (filters.wins) {
      const minWins = parseInt(filters.wins, 10);
      if (!isNaN(minWins)) {
        result = result.filter((c) => c.wins >= minWins);
      }
    }
    if (filters.battlesPlayed) {
      const minBattles = parseInt(filters.battlesPlayed, 10);
      if (!isNaN(minBattles)) {
        result = result.filter((c) => c.battlesPlayed >= minBattles);
      }
    }
    if (filters.crowns) {
      const minCrowns = parseInt(filters.crowns, 10);
      if (!isNaN(minCrowns)) {
        result = result.filter((c) => c.crowns >= minCrowns);
      }
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const key = sortConfig.key!;
        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        }
        return bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [riverRace, filters, sortConfig]);

  const columns: { key: keyof RiverRaceClan; label: string; type: 'text' | 'number' }[] = [
    { key: 'name', label: 'Clan', type: 'text' },
    { key: 'clanScore', label: 'Score', type: 'number' },
    { key: 'wins', label: 'Wins', type: 'number' },
    { key: 'battlesPlayed', label: 'Battles', type: 'number' },
    { key: 'crowns', label: 'Crowns', type: 'number' },
  ];

  const getDeltaDisplay = (clan: RiverRaceClan) => {
    const delta = deltas.get(clan.tag);
    if (!delta) return null;
    
    const hasChanges = delta.clanScoreDelta !== 0 || delta.winsDelta !== 0 || delta.battlesPlayedDelta !== 0;
    if (!hasChanges) return null;

    return (
      <div className="flex items-center gap-2 text-xs">
        {delta.clanScoreDelta > 0 && (
          <span className="text-stat-increase flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />+{delta.clanScoreDelta}
          </span>
        )}
        {delta.winsDelta > 0 && (
          <span className="text-stat-increase">+{delta.winsDelta} wins</span>
        )}
        {delta.battlesPlayedDelta > 0 && (
          <span className="text-muted-foreground">+{delta.battlesPlayedDelta} battles</span>
        )}
      </div>
    );
  };

  if (riverRace.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Ship className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="text-xl font-display font-semibold mb-2">No River Race Data</h3>
        <p className="text-sm">River Race data will appear here once available.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="overflow-auto max-h-[calc(100vh-200px)] rounded-lg border border-border">
      <table className="data-table">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="w-8"></th>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  <SortArrow
                    direction={sortConfig.key === col.key ? sortConfig.direction : null}
                    isActive={sortConfig.key === col.key}
                  />
                </div>
              </th>
            ))}
            <th>Participants</th>
            <th>Progress</th>
          </tr>
          <tr className="bg-card">
            <th className="!py-1 !cursor-default"></th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.name}
                onChange={(value) => updateFilter('name', value)}
                placeholder="Filter..."
                type="text"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.clanScore}
                onChange={(value) => updateFilter('clanScore', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.wins}
                onChange={(value) => updateFilter('wins', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.battlesPlayed}
                onChange={(value) => updateFilter('battlesPlayed', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.crowns}
                onChange={(value) => updateFilter('crowns', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default"></th>
            <th className="!py-1 !cursor-default"></th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedClans.map((clan) => (
            <>
              <tr key={clan.tag} className="cursor-pointer hover:bg-secondary/50" onClick={() => toggleExpand(clan.tag)}>
                <td className="!px-2">
                  {expandedClan === clan.tag ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </td>
                <td className="font-medium">{clan.name}</td>
                <td className="text-right tabular-nums">{clan.clanScore.toLocaleString()}</td>
                <td className="text-right tabular-nums">{clan.wins}</td>
                <td className="text-right tabular-nums">{clan.battlesPlayed}</td>
                <td className="text-right tabular-nums">{clan.crowns}</td>
                <td className="text-center text-muted-foreground">{clan.participants.length}</td>
                <td>{getDeltaDisplay(clan)}</td>
              </tr>
              {expandedClan === clan.tag && (
                <tr key={`${clan.tag}-participants`}>
                  <td colSpan={8} className="!p-0 bg-secondary/20">
                    <RiverRaceParticipantsTable participants={clan.participants} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
      {filteredAndSortedClans.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No clans match the current filters
        </div>
      )}
    </div>
  );
}
