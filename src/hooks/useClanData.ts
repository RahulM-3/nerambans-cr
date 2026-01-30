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

const API_BASE = 'https://linux-server-api-default-rtdb.firebaseio.com/nerambans';
const POLL_INTERVAL = 3000;

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
    const res = await fetch(`${API_BASE}/members/list.json`);
    if (!res.ok) throw new Error('Failed to fetch clan members');
    const data = await res.json();
    if (data) setMembers(Array.isArray(data) ? data : Object.values(data));
  }, []);

  const fetchMemberDeltas = useCallback(async () => {
    const res = await fetch(`${API_BASE}/members/deltas.json`);
    if (!res.ok) throw new Error('Failed to fetch member deltas');
    const data: ClanMemberDeltasFile = await res.json();
    if (data?.deltas) {
      const deltaMap = new Map<string, ClanMemberDelta>();
      data.deltas.forEach(delta => deltaMap.set(delta.tag, delta));
      setMemberDeltas(deltaMap);
    }
  }, []);

  const fetchClanInfo = useCallback(async () => {
    const res = await fetch(`${API_BASE}/clan/info.json`);
    if (!res.ok) throw new Error('Failed to fetch clan info');
    const data: ClanInfo = await res.json();
    if (data) setClanInfo(data);
  }, []);

  const fetchClanInfoDeltas = useCallback(async () => {
    const res = await fetch(`${API_BASE}/clan/info_deltas.json`);
    if (!res.ok) throw new Error('Failed to fetch clan info deltas');
    const data: ClanInfoDeltasFile = await res.json();
    if (data?.delta) setClanInfoDelta(data.delta);
  }, []);

  const fetchRiverRace = useCallback(async () => {
    const res = await fetch(`${API_BASE}/river/current.json`);
    if (!res.ok) throw new Error('Failed to fetch river race data');
    const data: RiverRaceData = await res.json();
    if (data) setRiverRace(data);
  }, []);

  const fetchRiverRaceLog = useCallback(async () => {
    const res = await fetch(`${API_BASE}/river/log.json`);
    if (!res.ok) throw new Error('Failed to fetch river race log');
    const data: RiverRaceLogFile = await res.json();
    if (data) setRiverRaceLog(data);
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/updates.json`);
      if (!res.ok) return;
      
      const updates: UpdatesFile = await res.json();
      if (!updates) return;
      
      if (updates.timestamp > lastProcessedTimestamp.current) {
        const filesToUpdate = updates.updatedFiles || [];
        const fetchPromises: Promise<void>[] = [];
        
        // API returns underscore-style names like 'clan_info', 'clan_members'
        if (filesToUpdate.includes('clan_members')) {
          fetchPromises.push(fetchMembers());
        }
        if (filesToUpdate.includes('clan_members_deltas')) {
          fetchPromises.push(fetchMemberDeltas());
        }
        if (filesToUpdate.includes('clan_info')) {
          fetchPromises.push(fetchClanInfo());
        }
        if (filesToUpdate.includes('clan_info_deltas')) {
          fetchPromises.push(fetchClanInfoDeltas());
        }
        if (filesToUpdate.includes('river_race')) {
          fetchPromises.push(fetchRiverRace());
        }
        if (filesToUpdate.includes('river_race_log')) {
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

  // Poll updates for changes
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
