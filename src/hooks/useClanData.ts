import { useState, useEffect, useRef, useCallback } from 'react';
import { ClanMember, WarLogEntry } from '@/types/clan';

const POLL_INTERVAL = 5000; // 5 seconds

interface UseClanDataReturn {
  members: ClanMember[];
  warLog: WarLogEntry[];
  previousMembers: Map<string, ClanMember>;
  changedFields: Map<string, Set<keyof ClanMember>>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useClanData(): UseClanDataReturn {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [previousMembers, setPreviousMembers] = useState<Map<string, ClanMember>>(new Map());
  const [changedFields, setChangedFields] = useState<Map<string, Set<keyof ClanMember>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const prevMembersRef = useRef<Map<string, ClanMember>>(new Map());
  const isFirstLoad = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, warLogRes] = await Promise.all([
        fetch('/data/clan_members.json'),
        fetch('/data/war_log.json'),
      ]);

      if (!membersRes.ok || !warLogRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const membersData: ClanMember[] = await membersRes.json();
      const warLogData: WarLogEntry[] = await warLogRes.json();

      // Track changes only after first load
      if (!isFirstLoad.current) {
        const newChangedFields = new Map<string, Set<keyof ClanMember>>();
        
        membersData.forEach((member) => {
          const prev = prevMembersRef.current.get(member.tag);
          if (prev) {
            const changes = new Set<keyof ClanMember>();
            const fieldsToTrack: (keyof ClanMember)[] = [
              'trophies', 'donations', 'donationsReceived', 'clanChestPoints', 'clanRank'
            ];
            
            fieldsToTrack.forEach((field) => {
              if (prev[field] !== member[field]) {
                changes.add(field);
              }
            });
            
            if (changes.size > 0) {
              newChangedFields.set(member.tag, changes);
            }
          }
        });
        
        setChangedFields(newChangedFields);
        setPreviousMembers(new Map(prevMembersRef.current));
        
        // Clear changes after animation duration
        if (newChangedFields.size > 0) {
          setTimeout(() => {
            setChangedFields(new Map());
          }, 800);
        }
      } else {
        isFirstLoad.current = false;
      }

      // Update previous members ref for next comparison
      const newPrevMap = new Map<string, ClanMember>();
      membersData.forEach((member) => {
        newPrevMap.set(member.tag, { ...member });
      });
      prevMembersRef.current = newPrevMap;

      setMembers(membersData);
      setWarLog(warLogData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    members,
    warLog,
    previousMembers,
    changedFields,
    isLoading,
    error,
    lastUpdated,
  };
}
