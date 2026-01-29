import { useState, useEffect, useRef, useCallback } from 'react';
import { ClanMember, RiverRaceClan, RiverRaceDelta, UpdatesFile } from '@/types/clan';

const POLL_INTERVAL = 3000; // Check updates.json every 3 seconds

interface UseClanDataReturn {
  members: ClanMember[];
  riverRace: RiverRaceClan[];
  riverRaceDeltas: Map<string, RiverRaceDelta>;
  previousMembers: Map<string, ClanMember>;
  changedFields: Map<string, Set<keyof ClanMember>>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useClanData(): UseClanDataReturn {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [riverRace, setRiverRace] = useState<RiverRaceClan[]>([]);
  const [riverRaceDeltas, setRiverRaceDeltas] = useState<Map<string, RiverRaceDelta>>(new Map());
  const [previousMembers, setPreviousMembers] = useState<Map<string, ClanMember>>(new Map());
  const [changedFields, setChangedFields] = useState<Map<string, Set<keyof ClanMember>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const prevMembersRef = useRef<Map<string, ClanMember>>(new Map());
  const lastProcessedTimestamp = useRef<number>(0);
  const isFirstLoad = useRef(true);

  const fetchMembers = useCallback(async () => {
    const res = await fetch('/data/clan_members.json');
    if (!res.ok) throw new Error('Failed to fetch clan members');
    const data: ClanMember[] = await res.json();
    
    // Track changes only after first load
    if (!isFirstLoad.current) {
      const newChangedFields = new Map<string, Set<keyof ClanMember>>();
      
      data.forEach((member) => {
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
    }

    // Update previous members ref for next comparison
    const newPrevMap = new Map<string, ClanMember>();
    data.forEach((member) => {
      newPrevMap.set(member.tag, { ...member });
    });
    prevMembersRef.current = newPrevMap;

    setMembers(data);
  }, []);

  const fetchRiverRace = useCallback(async () => {
    const res = await fetch('/data/river_race_members.json');
    if (!res.ok) throw new Error('Failed to fetch river race data');
    const data: RiverRaceClan[] = await res.json();
    setRiverRace(data);
  }, []);

  const fetchRiverRaceDeltas = useCallback(async () => {
    const res = await fetch('/data/river_race_deltas.json');
    if (!res.ok) throw new Error('Failed to fetch river race deltas');
    const data: RiverRaceDelta[] = await res.json();
    const deltaMap = new Map<string, RiverRaceDelta>();
    data.forEach(delta => deltaMap.set(delta.tag, delta));
    setRiverRaceDeltas(deltaMap);
  }, []);

  const clearUpdatesFile = useCallback(async () => {
    // In a real scenario, you'd have a backend endpoint to clear this
    // For now, we'll just track that we've processed the update
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch('/data/updates.json');
      if (!res.ok) {
        // updates.json might not exist yet, that's okay
        return;
      }
      
      const updates: UpdatesFile = await res.json();
      
      // Check if there's a new update we haven't processed
      if (updates.updated && updates.timestamp > lastProcessedTimestamp.current) {
        const filesToUpdate = updates.files;
        
        const fetchPromises: Promise<void>[] = [];
        
        if (filesToUpdate.includes('clan_members.json')) {
          fetchPromises.push(fetchMembers());
        }
        if (filesToUpdate.includes('river_race_members.json')) {
          fetchPromises.push(fetchRiverRace());
        }
        if (filesToUpdate.includes('river_race_deltas.json')) {
          fetchPromises.push(fetchRiverRaceDeltas());
        }
        
        if (fetchPromises.length > 0) {
          await Promise.all(fetchPromises);
          setLastUpdated(new Date(updates.timestamp));
        }
        
        lastProcessedTimestamp.current = updates.timestamp;
        isFirstLoad.current = false;
        
        // Clear the updates file (in practice, backend handles this)
        clearUpdatesFile();
      }
    } catch (err) {
      // Silent fail for update checks - initial data is already loaded
      console.log('Update check failed:', err);
    }
  }, [fetchMembers, fetchRiverRace, fetchRiverRaceDeltas, clearUpdatesFile]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchMembers(),
          fetchRiverRace(),
          fetchRiverRaceDeltas(),
        ]);
        setLastUpdated(new Date());
        setError(null);
        isFirstLoad.current = false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [fetchMembers, fetchRiverRace, fetchRiverRaceDeltas]);

  // Poll updates.json for changes
  useEffect(() => {
    const interval = setInterval(checkForUpdates, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return {
    members,
    riverRace,
    riverRaceDeltas,
    previousMembers,
    changedFields,
    isLoading,
    error,
    lastUpdated,
  };
}
