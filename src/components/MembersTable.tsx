import { useState, useMemo, useEffect, useRef } from 'react';
import { ClanMember, SortConfig, FilterConfig, ROLE_HIERARCHY } from '@/types/clan';
import { RoleBadge } from './RoleBadge';
import { SortArrow } from './SortArrow';
import { FilterInput } from './FilterInput';
import { formatLastSeen, getLastSeenEpoch } from '@/utils/dateUtils';

interface MembersTableProps {
  members: ClanMember[];
  previousMembers: Map<string, ClanMember>;
  changedFields: Map<string, Set<keyof ClanMember>>;
}

const initialFilters: FilterConfig = {
  name: '',
  role: '',
  trophies: '',
  donations: '',
  donationsReceived: '',
  clanChestPoints: '',
  lastSeen: '',
};

export function MembersTable({ members, previousMembers, changedFields }: MembersTableProps) {
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

  const getCellChangeClass = (member: ClanMember, field: keyof ClanMember): string => {
    const changes = changedFields.get(member.tag);
    if (!changes?.has(field)) return '';
    
    const prev = previousMembers.get(member.tag);
    if (!prev) return '';
    
    const prevValue = prev[field];
    const currentValue = member[field];
    
    if (typeof prevValue === 'number' && typeof currentValue === 'number') {
      if (field === 'clanRank') {
        // Lower rank number is better
        return currentValue < prevValue ? 'flash-increase' : 'flash-decrease';
      }
      return currentValue > prevValue ? 'flash-increase' : 'flash-decrease';
    }
    
    return '';
  };

  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    // Apply filters
    if (filters.name) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.role) {
      result = result.filter((m) =>
        m.role.toLowerCase().includes(filters.role.toLowerCase())
      );
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
    if (filters.clanChestPoints) {
      const minChest = parseInt(filters.clanChestPoints, 10);
      if (!isNaN(minChest)) {
        result = result.filter((m) => m.clanChestPoints >= minChest);
      }
    }
    if (filters.lastSeen) {
      result = result.filter((m) => {
        const formatted = formatLastSeen(m.lastSeen);
        return formatted.toLowerCase().includes(filters.lastSeen.toLowerCase());
      });
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
        
        // Special handling for lastSeen - use epoch for proper sorting
        if (key === 'lastSeen') {
          const aEpoch = getLastSeenEpoch(a.lastSeen);
          const bEpoch = getLastSeenEpoch(b.lastSeen);
          return sortConfig.direction === 'asc' ? aEpoch - bEpoch : bEpoch - aEpoch;
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
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'trophies', label: 'Trophies', type: 'number' },
    { key: 'clanRank', label: 'Rank', type: 'number' },
    { key: 'donations', label: 'Donations', type: 'number' },
    { key: 'donationsReceived', label: 'Received', type: 'number' },
    { key: 'clanChestPoints', label: 'Chest Pts', type: 'number' },
    { key: 'lastSeen', label: 'Last Seen', type: 'text' },
  ];

  const filterKeys: (keyof FilterConfig)[] = [
    'name', 'role', 'trophies', 'donations', 'donationsReceived', 'clanChestPoints', 'lastSeen'
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
          <tr className="bg-secondary/30">
            {columns.map((col, idx) => (
              <th key={`filter-${col.key}`} className="!py-1 !cursor-default !hover:bg-secondary/30">
                <FilterInput
                  value={filters[filterKeys[idx] as keyof FilterConfig] || ''}
                  onChange={(value) => updateFilter(filterKeys[idx] as keyof FilterConfig, value)}
                  placeholder={col.type === 'number' ? '≥' : 'Filter...'}
                  type={col.type === 'number' ? 'number' : 'text'}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedMembers.map((member) => (
            <tr key={member.tag}>
              <td className={`font-medium ${getCellChangeClass(member, 'name')}`}>
                {member.name}
              </td>
              <td className={getCellChangeClass(member, 'role')}>
                <RoleBadge role={member.role} />
              </td>
              <td className={`text-right tabular-nums ${getCellChangeClass(member, 'trophies')}`}>
                {member.trophies.toLocaleString()}
              </td>
              <td className={`text-center ${getCellChangeClass(member, 'clanRank')}`}>
                #{member.clanRank}
              </td>
              <td className={`text-right tabular-nums ${getCellChangeClass(member, 'donations')}`}>
                {member.donations}
              </td>
              <td className={`text-right tabular-nums ${getCellChangeClass(member, 'donationsReceived')}`}>
                {member.donationsReceived}
              </td>
              <td className={`text-right tabular-nums ${getCellChangeClass(member, 'clanChestPoints')}`}>
                {member.clanChestPoints}
              </td>
              <td className={`text-muted-foreground text-sm ${getCellChangeClass(member, 'lastSeen')}`}>
                {formatLastSeen(member.lastSeen)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAndSortedMembers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No members match the current filters
        </div>
      )}
    </div>
  );
}
