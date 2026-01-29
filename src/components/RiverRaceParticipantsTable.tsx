import { useState, useMemo } from 'react';
import { RiverRaceParticipant } from '@/types/clan';
import { SortArrow } from './SortArrow';
import { FilterInput } from './FilterInput';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RiverRaceParticipantsTableProps {
  participants: RiverRaceParticipant[];
}

type ParticipantSortKey = keyof RiverRaceParticipant;

interface ParticipantSortConfig {
  key: ParticipantSortKey | null;
  direction: 'asc' | 'desc' | null;
}

interface ParticipantFilterConfig {
  name: string;
  fame: string;
  decksUsed: string;
  boatAttacks: string;
}

const initialFilters: ParticipantFilterConfig = {
  name: '',
  fame: '',
  decksUsed: '',
  boatAttacks: '',
};

export function RiverRaceParticipantsTable({ participants }: RiverRaceParticipantsTableProps) {
  const [sortConfig, setSortConfig] = useState<ParticipantSortConfig>({ key: 'fame', direction: 'desc' });
  const [filters, setFilters] = useState<ParticipantFilterConfig>(initialFilters);

  const handleSort = (key: ParticipantSortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const updateFilter = (key: keyof ParticipantFilterConfig, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...participants];

    // Apply filters
    if (filters.name) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.fame) {
      const minFame = parseInt(filters.fame, 10);
      if (!isNaN(minFame)) {
        result = result.filter((p) => p.fame >= minFame);
      }
    }
    if (filters.decksUsed) {
      const minDecks = parseInt(filters.decksUsed, 10);
      if (!isNaN(minDecks)) {
        result = result.filter((p) => p.decksUsed >= minDecks);
      }
    }
    if (filters.boatAttacks) {
      const minAttacks = parseInt(filters.boatAttacks, 10);
      if (!isNaN(minAttacks)) {
        result = result.filter((p) => p.boatAttacks >= minAttacks);
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
  }, [participants, filters, sortConfig]);

  const columns: { key: ParticipantSortKey; label: string; type: 'text' | 'number' }[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'fame', label: 'Fame', type: 'number' },
    { key: 'repairPoints', label: 'Repair Pts', type: 'number' },
    { key: 'boatAttacks', label: 'Boat Attacks', type: 'number' },
    { key: 'decksUsed', label: 'Decks Used', type: 'number' },
    { key: 'decksUsedToday', label: 'Today', type: 'number' },
  ];

  return (
    <div className="max-h-64 overflow-auto border-t border-border">
      <table className="data-table">
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="whitespace-nowrap !text-xs"
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
          </tr>
          <tr className="bg-card">
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
                value={filters.fame}
                onChange={(value) => updateFilter('fame', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default"></th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.boatAttacks}
                onChange={(value) => updateFilter('boatAttacks', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.decksUsed}
                onChange={(value) => updateFilter('decksUsed', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default"></th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSorted.map((p) => (
            <tr key={p.tag} className="text-sm">
              <td className="font-medium">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{p.name}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-mono text-xs">{p.tag}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
              <td className="text-right tabular-nums">{p.fame.toLocaleString()}</td>
              <td className="text-right tabular-nums">{p.repairPoints}</td>
              <td className="text-right tabular-nums">{p.boatAttacks}</td>
              <td className="text-right tabular-nums">{p.decksUsed}</td>
              <td className="text-right tabular-nums text-muted-foreground">{p.decksUsedToday}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAndSorted.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No participants match the filters
        </div>
      )}
    </div>
  );
}
