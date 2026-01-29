import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ClanMember,
  ClanMemberDelta,
  ClanMemberDeltasFile,
  ClanInfo,
  ClanInfoDelta,
  ClanInfoDeltasFile,
  RiverRaceData,
  RiverRaceLogFile,
  UpdatesFile,
} from '@/types/clan';

const POLL_INTERVAL = 3000; // Check updates.json every 3 seconds

interface UseClanDataReturn {
  members: ClanMember[];
  memberDeltas: Map<string, ClanMemberDelta>;
  clanInfo: ClanInfo | null;
  clanInfoDelta: ClanInfoDelta | null;
  riverRace: RiverRaceData | null;
  riverRaceLog: RiverRaceLogFile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useClanData(): UseClanDataReturn {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [memberDeltas, setMemberDeltas] = useState<Map<string, ClanMemberDelta>>(new Map());
  const [clanInfo, setClanInfo] = useState<ClanInfo | null>(null);
  const [clanInfoDelta, setClanInfoDelta] = useState<ClanInfoDelta | null>(null);
  const [riverRace, setRiverRace] = useState<RiverRaceData | null>(null);
  const [riverRaceLog, setRiverRaceLog] = useState<RiverRaceLogFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const lastProcessedTimestamp = useRef<number>(0);

  const fetchMembers = useCallback(async () => {
    const res = await fetch('/data/clan_members.json');
    if (!res.ok) throw new Error('Failed to fetch clan members');
    const data: ClanMember[] = await res.json();
    setMembers(data);
  }, []);

  const fetchMemberDeltas = useCallback(async () => {
    const res = await fetch('/data/clan_members_deltas.json');
    if (!res.ok) throw new Error('Failed to fetch member deltas');
    const data: ClanMemberDeltasFile = await res.json();
    const deltaMap = new Map<string, ClanMemberDelta>();
    data.deltas.forEach(delta => deltaMap.set(delta.tag, delta));
    setMemberDeltas(deltaMap);
  }, []);

  const fetchClanInfo = useCallback(async () => {
    const res = await fetch('/data/clan_info.json');
    if (!res.ok) throw new Error('Failed to fetch clan info');
    const data: ClanInfo = await res.json();
    setClanInfo(data);
  }, []);

  const fetchClanInfoDeltas = useCallback(async () => {
    const res = await fetch('/data/clan_info_deltas.json');
    if (!res.ok) throw new Error('Failed to fetch clan info deltas');
    const data: ClanInfoDeltasFile = await res.json();
    setClanInfoDelta(data.delta);
  }, []);

  const fetchRiverRace = useCallback(async () => {
    const res = await fetch('/data/river_race.json');
    if (!res.ok) throw new Error('Failed to fetch river race data');
    const data: RiverRaceData = await res.json();
    setRiverRace(data);
  }, []);

  const fetchRiverRaceLog = useCallback(async () => {
    const res = await fetch('/data/river_race_log.json');
    if (!res.ok) throw new Error('Failed to fetch river race log');
    const data: RiverRaceLogFile = await res.json();
    setRiverRaceLog(data);
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch('/data/updates.json');
      if (!res.ok) return;
      
      const updates: UpdatesFile = await res.json();
      
      if (updates.timestamp > lastProcessedTimestamp.current) {
        const filesToUpdate = updates.updatedFiles;
        const fetchPromises: Promise<void>[] = [];
        
        if (filesToUpdate.includes('clan_members.json')) {
          fetchPromises.push(fetchMembers());
        }
        if (filesToUpdate.includes('clan_members_deltas.json')) {
          fetchPromises.push(fetchMemberDeltas());
        }
        if (filesToUpdate.includes('clan_info.json')) {
          fetchPromises.push(fetchClanInfo());
        }
        if (filesToUpdate.includes('clan_info_deltas.json')) {
          fetchPromises.push(fetchClanInfoDeltas());
        }
        if (filesToUpdate.includes('river_race.json')) {
          fetchPromises.push(fetchRiverRace());
        }
        if (filesToUpdate.includes('river_race_log.json')) {
          fetchPromises.push(fetchRiverRaceLog());
        }
        
        if (fetchPromises.length > 0) {
          await Promise.all(fetchPromises);
          setLastUpdated(new Date(updates.timestamp));
        }
        
        lastProcessedTimestamp.current = updates.timestamp;
      }
    } catch (err) {
      console.log('Update check failed:', err);
    }
  }, [fetchMembers, fetchMemberDeltas, fetchClanInfo, fetchClanInfoDeltas, fetchRiverRace, fetchRiverRaceLog]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchMembers(),
          fetchMemberDeltas(),
          fetchClanInfo(),
          fetchClanInfoDeltas(),
          fetchRiverRace(),
          fetchRiverRaceLog(),
        ]);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [fetchMembers, fetchMemberDeltas, fetchClanInfo, fetchClanInfoDeltas, fetchRiverRace, fetchRiverRaceLog]);

  // Poll updates.json for changes
  useEffect(() => {
    const interval = setInterval(checkForUpdates, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return {
    members,
    memberDeltas,
    clanInfo,
    clanInfoDelta,
    riverRace,
    riverRaceLog,
    isLoading,
    error,
    lastUpdated,
  };
}
