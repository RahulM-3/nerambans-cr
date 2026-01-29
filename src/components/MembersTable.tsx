import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClanMember, ClanMemberDelta, SortConfig, FilterConfig, ROLE_HIERARCHY } from '@/types/clan';
import { RoleBadge } from './RoleBadge';
import { SortArrow } from './SortArrow';
import { FilterInput } from './FilterInput';
import { RoleFilter } from './RoleFilter';
import { formatLastSeen, getRelativeTime } from '@/utils/dateUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeltaIndicator } from './DeltaIndicator';

interface MembersTableProps {
  members: ClanMember[];
  memberDeltas: Map<string, ClanMemberDelta>;
}

const initialFilters: FilterConfig = {
  name: '',
  role: '',
  trophies: '',
  donations: '',
  donationsReceived: '',
  arena: '',
};

export function MembersTable({ members, memberDeltas }: MembersTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'clanRank', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>(initialFilters);
  
  // Manual scroll preservation
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  
  // Save scroll position before data changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const handleScroll = () => {
      scrollPositionRef.current = el.scrollTop;
    };
    
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Restore scroll position after data changes
  useEffect(() => {
    if (scrollRef.current && scrollPositionRef.current > 0) {
      scrollRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [members]);

  const handleSort = (key: keyof ClanMember) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const updateFilter = (key: keyof FilterConfig, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    // Apply filters
    if (filters.name) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.role && filters.role !== 'all') {
      result = result.filter((m) => m.role === filters.role);
    }
    if (filters.trophies) {
      const minTrophies = parseInt(filters.trophies, 10);
      if (!isNaN(minTrophies)) {
        result = result.filter((m) => m.trophies >= minTrophies);
      }
    }
    if (filters.donations) {
      const minDonations = parseInt(filters.donations, 10);
      if (!isNaN(minDonations)) {
        result = result.filter((m) => m.donations >= minDonations);
      }
    }
    if (filters.donationsReceived) {
      const minReceived = parseInt(filters.donationsReceived, 10);
      if (!isNaN(minReceived)) {
        result = result.filter((m) => m.donationsReceived >= minReceived);
      }
    }
    if (filters.arena) {
      result = result.filter((m) =>
        m.arena.name.toLowerCase().includes(filters.arena.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const key = sortConfig.key!;
        
        // Special handling for role sorting using hierarchy
        if (key === 'role') {
          const aRank = ROLE_HIERARCHY[a.role] || 0;
          const bRank = ROLE_HIERARCHY[b.role] || 0;
          return sortConfig.direction === 'asc' ? bRank - aRank : aRank - bRank;
        }
        
        // Special handling for lastSeenEpoch
        if (key === 'lastSeenEpoch') {
          return sortConfig.direction === 'asc' 
            ? a.lastSeenEpoch - b.lastSeenEpoch 
            : b.lastSeenEpoch - a.lastSeenEpoch;
        }

        // Special handling for arena
        if (key === 'arena') {
          const aArena = a.arena.name.toLowerCase();
          const bArena = b.arena.name.toLowerCase();
          return sortConfig.direction === 'asc' 
            ? aArena.localeCompare(bArena) 
            : bArena.localeCompare(aArena);
        }

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
  }, [members, filters, sortConfig]);

  const columns: { key: keyof ClanMember; label: string; type: 'text' | 'number' }[] = [
    { key: 'clanRank', label: '#', type: 'number' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'trophies', label: 'Trophies', type: 'number' },
    { key: 'expLevel', label: 'Lvl', type: 'number' },
    { key: 'donations', label: 'Donated', type: 'number' },
    { key: 'donationsReceived', label: 'Received', type: 'number' },
    { key: 'arena', label: 'Arena', type: 'text' },
    { key: 'lastSeenEpoch', label: 'Last Seen', type: 'number' },
  ];

  return (
    <div ref={scrollRef} className="overflow-auto max-h-[calc(100vh-200px)] rounded-lg border border-border">
      <table className="data-table">
        <thead className="sticky top-0 z-10">
          <tr>
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
          </tr>
          <tr className="bg-card">
            <th className="!py-1 !cursor-default">{/* No filter for rank */}</th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.name}
                onChange={(value) => updateFilter('name', value)}
                placeholder="Filter..."
                type="text"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <RoleFilter
                value={filters.role}
                onChange={(value) => updateFilter('role', value)}
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.trophies}
                onChange={(value) => updateFilter('trophies', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">{/* No filter for level */}</th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.donations}
                onChange={(value) => updateFilter('donations', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.donationsReceived}
                onChange={(value) => updateFilter('donationsReceived', value)}
                placeholder="≥"
                type="number"
              />
            </th>
            <th className="!py-1 !cursor-default">
              <FilterInput
                value={filters.arena}
                onChange={(value) => updateFilter('arena', value)}
                placeholder="Filter..."
                type="text"
              />
            </th>
            <th className="!py-1 !cursor-default">{/* No filter for last seen */}</th>
          </tr>
        </thead>
        <AnimatePresence mode="popLayout">
          {filteredAndSortedMembers.map((member) => {
            const delta = memberDeltas.get(member.tag);
            return (
              <motion.tr
                key={member.tag}
                layout
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                style={{ position: 'relative' }}
              >
                <td className="text-center text-muted-foreground">
                  #{member.clanRank}
                </td>
                <td className="font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{member.name}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-mono text-xs">{member.tag}</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td>
                  <RoleBadge role={member.role} />
                </td>
                <td className="text-right tabular-nums">
                  <span>{member.trophies.toLocaleString()}</span>
                  {delta && <DeltaIndicator value={delta.trophiesDelta} />}
                </td>
                <td className="text-center tabular-nums text-muted-foreground">
                  {member.expLevel}
                </td>
                <td className="text-right tabular-nums">
                  <span>{member.donations}</span>
                  {delta && <DeltaIndicator value={delta.donationsDelta} />}
                </td>
                <td className="text-right tabular-nums">
                  <span>{member.donationsReceived}</span>
                  {delta && <DeltaIndicator value={delta.donationsReceivedDelta} />}
                </td>
                <td className="text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help truncate max-w-[120px] inline-block">
                        {member.arena.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{member.arena.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="text-muted-foreground text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{getRelativeTime(member.lastSeenEpoch)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{formatLastSeen(member.lastSeenEpoch)}</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
              </motion.tr>
            );
          })}
        </AnimatePresence>
      </table>
      {filteredAndSortedMembers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No members match the current filters
        </div>
      )}
    </div>
  );
}
