import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiverRaceClan, SortDirection } from '@/types/clan';
import { SortArrow } from './SortArrow';
import { FilterInput } from './FilterInput';
import { RiverRaceParticipantsTable } from './RiverRaceParticipantsTable';
import { ChevronDown, ChevronRight, Ship } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RiverRaceTableProps {
  clans: RiverRaceClan[];
}

interface RiverRaceSortConfig {
  key: keyof RiverRaceClan | null;
  direction: SortDirection;
}

interface RiverRaceFilterConfig {
  name: string;
  fame: string;
  repairPoints: string;
}

const initialFilters: RiverRaceFilterConfig = {
  name: '',
  fame: '',
  repairPoints: '',
};

export function RiverRaceTable({ clans }: RiverRaceTableProps) {
  const [sortConfig, setSortConfig] = useState<RiverRaceSortConfig>({ key: 'fame', direction: 'desc' });
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
  }, [clans]);

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
    let result = [...clans];

    // Apply filters
    if (filters.name) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.fame) {
      const minFame = parseInt(filters.fame, 10);
      if (!isNaN(minFame)) {
        result = result.filter((c) => c.fame >= minFame);
      }
    }
    if (filters.repairPoints) {
      const minRepair = parseInt(filters.repairPoints, 10);
      if (!isNaN(minRepair)) {
        result = result.filter((c) => c.repairPoints >= minRepair);
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
  }, [clans, filters, sortConfig]);

  const columns: { key: keyof RiverRaceClan; label: string; type: 'text' | 'number' }[] = [
    { key: 'name', label: 'Clan', type: 'text' },
    { key: 'fame', label: 'Fame', type: 'number' },
    { key: 'repairPoints', label: 'Repair', type: 'number' },
  ];

  if (clans.length === 0) {
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
      <table className="data-table w-auto">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="!w-6 !px-1"></th>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="whitespace-nowrap !px-2"
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
            <th className="!px-2">Participants</th>
          </tr>
          <tr className="bg-card">
            <th className="!py-1 !px-1 !cursor-default"></th>
            <th className="!py-1 !px-2 !cursor-default">
              <FilterInput
                value={filters.name}
                onChange={(value) => updateFilter('name', value)}
                placeholder="Filter..."
                type="text"
              />
            </th>
            <th className="!py-1 !px-2 !cursor-default">
              <FilterInput
                value={filters.fame}
                onChange={(value) => updateFilter('fame', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !px-2 !cursor-default">
              <FilterInput
                value={filters.repairPoints}
                onChange={(value) => updateFilter('repairPoints', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !px-2 !cursor-default"></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {filteredAndSortedClans.map((clan) => (
              <Fragment key={clan.tag}>
                <motion.tr
                  layout
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="cursor-pointer hover:bg-secondary/50"
                  onClick={() => toggleExpand(clan.tag)}
                  style={{ position: 'relative' }}
                >
                  <td className="!px-1">
                    {expandedClan === clan.tag ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="font-medium !px-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{clan.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{clan.tag}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="text-right tabular-nums !px-2">{clan.fame.toLocaleString()}</td>
                  <td className="text-right tabular-nums !px-2">{clan.repairPoints.toLocaleString()}</td>
                  <td className="text-center text-muted-foreground !px-2">{clan.participants.length}</td>
                </motion.tr>
                {expandedClan === clan.tag && (
                  <motion.tr
                    key={`${clan.tag}-participants`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <td colSpan={5} className="!p-0 bg-secondary/20">
                      <RiverRaceParticipantsTable participants={clan.participants} />
                    </td>
                  </motion.tr>
                )}
              </Fragment>
            ))}
          </AnimatePresence>
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
