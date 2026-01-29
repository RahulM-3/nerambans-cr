// Clan Member Types
export interface Arena {
  id: number;
  name: string;
  rawName: string;
}

export interface ClanMember {
  tag: string;
  name: string;
  role: 'leader' | 'coLeader' | 'elder' | 'member';
  clanChestPoints: number;
  arena: Arena;
  lastSeenEpoch: number;
  expLevel: number;
  trophies: number;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
}

export interface ClanMemberDelta {
  tag: string;
  name: string;
  trophiesDelta: number;
  donationsDelta: number;
  donationsReceivedDelta: number;
}

export interface ClanMemberDeltasFile {
  _meta: {
    lastReset: string;
  };
  deltas: ClanMemberDelta[];
}

// River Race Types
export interface RiverRaceParticipant {
  tag: string;
  name: string;
  fame: number;
  repairPoints: number;
  boatAttacks: number;
  decksUsed: number;
  decksUsedToday: number;
}

export interface RiverRaceClan {
  tag: string;
  name: string;
  badgeId: number;
  fame: number;
  repairPoints: number;
  participants: RiverRaceParticipant[];
  periodPoints?: number;
  clanScore?: number;
  finishTime?: string | null;
}

export interface RiverRaceData {
  raceId: string;
  state: string;
  sectionIndex: number;
  periodIndex: number;
  periodType: string;
  collectionEndTime: string | null;
  warEndTime: string | null;
  clan: RiverRaceClan;
  allClans: RiverRaceClan[];
}

// River Race Delta Types
export interface RiverRaceParticipantDelta {
  tag: string;
  name: string;
  fameDelta: number;
  repairPointsDelta: number;
  boatAttacksDelta: number;
  decksUsedDelta: number;
  decksUsedTodayDelta: number;
}

export interface RiverRaceDeltasFile {
  _meta: {
    raceId: string;
  };
  deltas: RiverRaceParticipantDelta[];
}

// River Race Log Types
export interface RiverRaceLogClan {
  tag: string;
  name: string;
  badgeId: number;
  fame: number;
  repairPoints: number;
  finishTime?: string;
  participants: RiverRaceParticipant[];
  periodPoints?: number;
  clanScore?: number;
}

export interface RiverRaceLogStanding {
  rank: number;
  trophyChange: number;
  clan: RiverRaceLogClan;
}

export interface RiverRaceLogEntry {
  seasonId: number;
  sectionIndex: number;
  createdDate: string;
  standings: RiverRaceLogStanding[];
}

export interface RiverRaceLogFile {
  items: RiverRaceLogEntry[];
}

// Updates file type
export interface UpdatesFile {
  updatedFiles: string[];
  timestamp: number;
}

// Sort and Filter types
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: keyof ClanMember | null;
  direction: SortDirection;
}

export interface FilterConfig {
  name: string;
  role: string;
  trophies: string;
  donations: string;
  donationsReceived: string;
  arena: string;
}

export const ROLE_HIERARCHY: Record<string, number> = {
  leader: 4,
  coLeader: 3,
  elder: 2,
  member: 1,
};

export const ROLE_DISPLAY: Record<string, string> = {
  leader: 'Leader',
  coLeader: 'Co-Leader',
  elder: 'Elder',
  member: 'Member',
};
