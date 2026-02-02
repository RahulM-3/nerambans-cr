import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Trophy, Swords, Users, Crown, Target, ChevronDown, ArrowUpDown, Star, Flame, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

interface PlayerInfoPanelProps {
  playerTag: string | null;
  playerName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerData {
  requestedTag: string;
  fetchedAt: number;
  player: {
    tag: string;
    name: string;
    expLevel: number;
    trophies: number;
    bestTrophies: number;
    wins: number;
    losses: number;
    battleCount: number;
    threeCrownWins: number;
    challengeCardsWon: number;
    challengeMaxWins: number;
    tournamentCardsWon: number;
    tournamentBattleCount: number;
    role: string;
    donations: number;
    donationsReceived: number;
    totalDonations: number;
    warDayWins: number;
    clanCardsCollected: number;
    clan?: {
      tag: string;
      name: string;
      badgeId: number;
    };
    arena: {
      id: number;
      name: string;
    };
    leagueStatistics?: {
      currentSeason?: { trophies: number; bestTrophies: number };
      previousSeason?: { id: string; trophies: number; bestTrophies: number };
      bestSeason?: { id: string; trophies: number };
    };
    badges: Array<{
      name: string;
      level: number;
      maxLevel: number;
      progress: number;
      target?: number;
      iconUrls: { large: string };
    }>;
    achievements: Array<{
      name: string;
      stars: number;
      value: number;
      target: number;
      info: string;
    }>;
    cards: Array<{
      name: string;
      level: number;
      maxLevel: number;
      rarity: string;
      count?: number;
      elixirCost?: number;
      iconUrls: { medium: string };
    }>;
    currentDeck: Array<{
      name: string;
      level: number;
      maxLevel: number;
      rarity: string;
      elixirCost?: number;
      iconUrls: { medium: string };
    }>;
    currentFavouriteCard?: {
      name: string;
      iconUrls: { medium: string };
    };
  };
  battlelog?: Array<{
    type: string;
    battleTime: string;
    arena: { name: string };
    gameMode: { name: string };
    team: Array<{ crowns: number; startingTrophies?: number; trophyChange?: number }>;
    opponent: Array<{ crowns: number; name: string }>;
  }>;
}

const API_BASE = 'https://linux-server-api-default-rtdb.firebaseio.com/nerambans';
const POLL_INTERVAL = 500;
const POLL_TIMEOUT = 60000;

const rarityColors: Record<string, string> = {
  common: 'bg-gray-500',
  rare: 'bg-orange-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
  champion: 'bg-pink-500',
};

function StatCard({ icon: Icon, label, value, subValue }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  subValue?: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="font-semibold text-sm">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  count,
  defaultOpen = false, 
  children 
}: { 
  title: React.ReactNode; 
  count?: number;
  defaultOpen?: boolean; 
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
        <span className="font-medium text-sm flex items-center gap-2">
          {title}
          {count !== undefined && (
            <Badge variant="secondary" className="text-xs">{count}</Badge>
          )}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CardDisplay({ card }: { card: { name: string; level: number; maxLevel: number; rarity: string; iconUrls: { medium: string }; elixirCost?: number } }) {
  return (
    <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded">
      <img 
        src={card.iconUrls.medium} 
        alt={card.name} 
        className="w-8 h-8 object-contain"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{card.name}</p>
        <div className="flex items-center gap-1">
          <span className={cn("w-2 h-2 rounded-full", rarityColors[card.rarity] || 'bg-gray-400')} />
          <span className="text-[10px] text-muted-foreground">Lv.{card.level}/{card.maxLevel}</span>
          {card.elixirCost && (
            <span className="text-[10px] text-purple-400 ml-1">⚡{card.elixirCost}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgeDisplay({ badge }: { badge: PlayerData['player']['badges'][0] }) {
  const progressPercent = badge.target ? (badge.progress / badge.target) * 100 : 100;
  
  return (
    <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded">
      <img 
        src={badge.iconUrls.large} 
        alt={badge.name} 
        className="w-8 h-8 object-contain"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{badge.name.replace(/([A-Z])/g, ' $1').trim()}</p>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Lv.{badge.level}/{badge.maxLevel}</span>
          {badge.target && (
            <Progress value={progressPercent} className="h-1 flex-1 max-w-16" />
          )}
        </div>
      </div>
    </div>
  );
}

function BattleLogEntry({ battle }: { battle: PlayerData['battlelog'][0] }) {
  const teamCrowns = battle.team[0]?.crowns || 0;
  const opponentCrowns = battle.opponent[0]?.crowns || 0;
  const isWin = teamCrowns > opponentCrowns;
  const opponentName = battle.opponent[0]?.name || 'Unknown';
  const trophyChange = battle.team[0]?.trophyChange;
  
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded text-xs",
      isWin ? "bg-primary/10 border-l-2 border-primary" : "bg-destructive/10 border-l-2 border-destructive"
    )}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">vs {opponentName}</p>
          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded shrink-0">{battle.type}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">{battle.gameMode.name} • {battle.arena.name}</p>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className={cn("font-bold", isWin ? "text-primary" : "text-destructive")}>
          {teamCrowns} - {opponentCrowns}
        </p>
        <div className="flex items-center justify-end gap-1">
          <span className="text-[10px] text-muted-foreground">{isWin ? 'Victory' : 'Defeat'}</span>
          {trophyChange !== undefined && trophyChange !== 0 && (
            <span className={cn(
              "text-[10px] font-medium",
              trophyChange > 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {trophyChange > 0 ? '+' : ''}{trophyChange}🏆
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlayerInfoPanel({ playerTag, playerName, isOpen, onClose }: PlayerInfoPanelProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Batch loading states
  const [badgesShown, setBadgesShown] = useState(30);
  const [cardsShown, setCardsShown] = useState(40);
  const [battlesShown, setBattlesShown] = useState(10);
  
  // Battle log filters
  const [battleTypeFilter, setBattleTypeFilter] = useState<string>('all');
  const [battleResultFilter, setBattleResultFilter] = useState<string>('all');

  // Helper to parse stringified JSON from Firebase (player and battlelog are stored as JSON strings)
  const parsePlayerData = (rawData: Record<string, unknown>): PlayerData | null => {
    try {
      let player = rawData.player;
      let battlelog = rawData.battlelog;
      
      // Parse if stored as JSON strings
      if (typeof player === 'string') {
        player = JSON.parse(player);
      }
      if (typeof battlelog === 'string') {
        battlelog = JSON.parse(battlelog);
      }
      
      return {
        requestedTag: rawData.requestedTag as string,
        fetchedAt: rawData.fetchedAt as number,
        player: player as PlayerData['player'],
        battlelog: battlelog as PlayerData['battlelog'],
      };
    } catch (e) {
      console.error('Failed to parse player data:', e);
      return null;
    }
  };

  const requestPlayerInfo = useCallback(async (tag: string) => {
    setIsLoading(true);
    setError(null);
    setPlayerData(null);

    try {
      const requestTimestamp = Date.now();
      const startTime = Date.now();
      
      // First check if player info already exists
      const existingRes = await fetch(`${API_BASE}/players/info.json`);
      if (existingRes.ok) {
        const rawData = await existingRes.json();
        if (rawData?.requestedTag === tag && rawData?.fetchedAt >= requestTimestamp - 60000) {
          const parsed = parsePlayerData(rawData);
          if (parsed?.player) {
            setPlayerData(parsed);
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Request player data by writing to players/request
      await fetch(`${API_BASE}/players/request.json`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, timestamp: requestTimestamp })
      });
      
      console.log('Requested player info for tag:', tag);
      
      const pollForResponse = async (): Promise<void> => {
        if (Date.now() - startTime > POLL_TIMEOUT) {
          setError('Request timed out. Please try again.');
          setIsLoading(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/players/info.json?t=${Date.now()}`);
          if (res.ok) {
            const rawData = await res.json();
            // Verify the data is for the requested player
            if (rawData?.requestedTag === tag && rawData?.fetchedAt >= requestTimestamp - 60000) {
              const parsed = parsePlayerData(rawData);
              if (parsed?.player) {
                setPlayerData(parsed);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch {
          // Continue polling
        }

        setTimeout(pollForResponse, POLL_INTERVAL);
      };

      pollForResponse();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request player info');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && playerTag) {
      requestPlayerInfo(playerTag);
      // Reset batch counts when opening
      setBadgesShown(30);
      setCardsShown(40);
      setBattlesShown(10);
    } else {
      setPlayerData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, playerTag, requestPlayerInfo]);

  const player = playerData?.player;
  const battlelog = playerData?.battlelog;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            {player?.currentFavouriteCard && (
              <img 
                src={player.currentFavouriteCard.iconUrls.medium} 
                alt="" 
                className="w-8 h-8 object-contain"
              />
            )}
            {player?.name || playerName || 'Player Info'}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">{playerTag}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading player info...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {!isLoading && !error && player && (
            <div className="space-y-4">
              {/* Header Stats with Trophy Chart */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{player.expLevel ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{(player.trophies ?? 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">(Best: {(player.bestTrophies ?? 0).toLocaleString()})</span>
                    </div>
                    {player.clan && (
                      <p className="text-sm text-muted-foreground truncate">
                        {player.clan.name} • {player.arena?.name ?? 'Unknown Arena'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trophy Progression Chart from Battlelog - PvP only */}
                {(() => {
                  if (!battlelog || battlelog.length === 0) return null;
                  
                  // Helper to parse ISO-8601 battleTime (format: "20260126T095506.000Z")
                  const parseBattleTime = (bt: string): Date => {
                    const year = bt.slice(0, 4);
                    const month = bt.slice(4, 6);
                    const day = bt.slice(6, 8);
                    const hour = bt.slice(9, 11);
                    const min = bt.slice(11, 13);
                    const sec = bt.slice(13, 15);
                    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`);
                  };

                  // Short label for X-axis (just day/month)
                  const formatShortDate = (date: Date): string => {
                    return date.toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: 'short',
                    });
                  };

                  // Full label for tooltip
                  const formatFullTime = (date: Date): string => {
                    return date.toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });
                  };

                  // PvP battle types
                  const pvpTypes = ['PvP', 'pathOfLegend', 'ranked'];
                  
                  // Filter to only PvP battles with trophy data
                  const pvpBattles = battlelog.filter(b => 
                    pvpTypes.includes(b.type) && 
                    b.team?.[0]?.startingTrophies !== undefined && 
                    b.battleTime
                  );

                  if (pvpBattles.length === 0) {
                    return (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Trophy Progression</p>
                        <div className="h-24 flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
                          <p className="text-xs text-muted-foreground">No PvP battles available</p>
                        </div>
                      </div>
                    );
                  }

                  // Build trophy progression from PvP battlelog (most recent first, so reverse for chart)
                  const trophyData = pvpBattles
                    .map((b) => {
                      const startTrophies = b.team[0].startingTrophies ?? 0;
                      const change = b.team[0].trophyChange ?? 0;
                      const teamCrowns = b.team[0]?.crowns ?? 0;
                      const opponentCrowns = b.opponent?.[0]?.crowns ?? 0;
                      const opponentName = b.opponent?.[0]?.name ?? 'Unknown';
                      const date = parseBattleTime(b.battleTime);
                      const isWin = teamCrowns > opponentCrowns;
                      return {
                        time: date.getTime(),
                        shortLabel: formatShortDate(date),
                        timeLabel: formatFullTime(date),
                        trophies: startTrophies + change,
                        trophyChange: change,
                        opponent: opponentName,
                        result: isWin ? 'Victory' : 'Defeat',
                        crowns: `${teamCrowns} - ${opponentCrowns}`,
                        gameMode: b.gameMode?.name ?? b.type,
                        arena: b.arena?.name ?? 'Unknown',
                      };
                    })
                    .reverse();

                  const chartConfig = {
                    trophies: { label: 'Trophies', color: 'hsl(43 96% 56%)' }
                  };

                  // Custom tooltip for rich battle info
                  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof trophyData[0] }> }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    const isWin = data.result === 'Victory';
                    return (
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs min-w-[140px]">
                        <p className="font-medium text-foreground mb-1">{data.timeLabel}</p>
                        <div className="space-y-0.5">
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Trophies:</span>
                            <span className="font-semibold">{data.trophies.toLocaleString()}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Change:</span>
                            <span className={isWin ? 'text-emerald-500' : 'text-red-500'}>
                              {data.trophyChange > 0 ? '+' : ''}{data.trophyChange}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Opponent:</span>
                            <span className="truncate max-w-[80px]">{data.opponent}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Score:</span>
                            <span>{data.crowns}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Result:</span>
                            <span className={isWin ? 'text-primary font-medium' : 'text-destructive font-medium'}>{data.result}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Mode:</span>
                            <span className="truncate max-w-[80px]">{data.gameMode}</span>
                          </p>
                        </div>
                      </div>
                    );
                  };

                  // Calculate PvP win/loss streak
                  let pvpStreak = 0;
                  let pvpStreakType: 'win' | 'loss' | null = null;
                  for (const battle of pvpBattles) {
                    const teamCrowns = battle.team?.[0]?.crowns ?? 0;
                    const opponentCrowns = battle.opponent?.[0]?.crowns ?? 0;
                    const isWin = teamCrowns > opponentCrowns;
                    
                    if (pvpStreakType === null) {
                      pvpStreakType = isWin ? 'win' : 'loss';
                      pvpStreak = 1;
                    } else if ((isWin && pvpStreakType === 'win') || (!isWin && pvpStreakType === 'loss')) {
                      pvpStreak++;
                    } else {
                      break;
                    }
                  }

                  return (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Trophy Progression (PvP Battles)</p>
                        {/* PvP Win/Loss Streak */}
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-lg">
                          <Flame className={cn("w-4 h-4", pvpStreakType === 'win' ? 'text-primary' : pvpStreakType === 'loss' ? 'text-destructive' : 'text-muted-foreground')} />
                          <div className="text-xs">
                            <span className={cn("font-semibold", pvpStreakType === 'win' ? 'text-primary' : pvpStreakType === 'loss' ? 'text-destructive' : '')}>
                              {pvpStreak} {pvpStreakType === 'win' ? 'Win' : pvpStreakType === 'loss' ? 'Loss' : ''} Streak
                            </span>
                            <span className="text-muted-foreground ml-1">(PvP)</span>
                          </div>
                        </div>
                      </div>
                      <ChartContainer config={chartConfig} className="h-32 w-full">
                        <LineChart data={trophyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="shortLabel" 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            domain={['dataMin - 20', 'dataMax + 20']}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="trophies" 
                            stroke="hsl(43 96% 56%)" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(43 96% 56%)', strokeWidth: 1, r: 2 }}
                            activeDot={{ r: 4, fill: 'hsl(43 96% 56%)' }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  );
                })()}
              </div>

              {/* Quick Stats Grid */}
              {(() => {
                const wins = player.wins ?? 0;
                const losses = player.losses ?? 0;
                const total = wins + losses;
                const winPct = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
                const lossPct = total > 0 ? ((losses / total) * 100).toFixed(1) : '0.0';
                
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatCard icon={Swords} label="Battles" value={player.battleCount ?? 0} subValue={`${wins}W (${winPct}%) / ${losses}L (${lossPct}%)`} />
                    <StatCard icon={Crown} label="3-Crown Wins" value={player.threeCrownWins ?? 0} />
                    <StatCard icon={ArrowUpDown} label="Cards Donated" value={player.donations ?? 0} subValue={`Total: ${(player.totalDonations ?? 0).toLocaleString()}`} />
                    <StatCard icon={ArrowUpDown} label="Cards Received" value={player.donationsReceived ?? 0} />
                    <StatCard icon={Users} label="War Day Wins" value={player.warDayWins ?? 0} />
                    <StatCard icon={Target} label="Challenge Wins" value={player.challengeCardsWon ?? 0} subValue={`Max: ${player.challengeMaxWins ?? 0}`} />
                  </div>
                );
              })()}

              {/* Current Deck */}
              {player.currentDeck && player.currentDeck.length > 0 && (
                <CollapsibleSection title="Current Deck" count={player.currentDeck.length} defaultOpen>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {player.currentDeck.map((card, i) => (
                      <CardDisplay key={i} card={card} />
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Badges */}
              {player.badges && player.badges.length > 0 && (
                <CollapsibleSection title="Badges" count={player.badges.length}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {player.badges.slice(0, badgesShown).map((badge, i) => (
                      <BadgeDisplay key={i} badge={badge} />
                    ))}
                  </div>
                  {player.badges.length > badgesShown && (
                    <button 
                      onClick={() => setBadgesShown(prev => Math.min(prev + 30, player.badges.length))}
                      className="text-xs text-primary hover:underline text-center mt-2 w-full cursor-pointer"
                    >
                      +{player.badges.length - badgesShown} more badges (click to load more)
                    </button>
                  )}
                </CollapsibleSection>
              )}

              {/* Achievements */}
              {player.achievements && player.achievements.length > 0 && (
                <CollapsibleSection title="Achievements" count={player.achievements.length}>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {player.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{achievement.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{achievement.info}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {[...Array(3)].map((_, s) => (
                            <Star 
                              key={s} 
                              className={cn(
                                "w-3 h-3",
                                s < achievement.stars ? "text-yellow-500 fill-yellow-500" : "text-muted"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Battle Log */}
              {battlelog && battlelog.length > 0 && (() => {
                // Get unique battle types from battlelog
                const battleTypes = [...new Set(battlelog.map(b => b.type))];
                
                // Filter battles based on current filters
                const filteredBattles = battlelog.filter(battle => {
                  const teamCrowns = battle.team?.[0]?.crowns ?? 0;
                  const opponentCrowns = battle.opponent?.[0]?.crowns ?? 0;
                  const isWin = teamCrowns > opponentCrowns;
                  
                  const typeMatch = battleTypeFilter === 'all' || battle.type === battleTypeFilter;
                  const resultMatch = battleResultFilter === 'all' || 
                    (battleResultFilter === 'win' && isWin) || 
                    (battleResultFilter === 'loss' && !isWin);
                  
                  return typeMatch && resultMatch;
                });

                // Calculate general win/loss streak from all battles
                let generalStreak = 0;
                let generalStreakType: 'win' | 'loss' | null = null;
                for (const battle of battlelog) {
                  const teamCrowns = battle.team?.[0]?.crowns ?? 0;
                  const opponentCrowns = battle.opponent?.[0]?.crowns ?? 0;
                  const isWin = teamCrowns > opponentCrowns;
                  
                  if (generalStreakType === null) {
                    generalStreakType = isWin ? 'win' : 'loss';
                    generalStreak = 1;
                  } else if ((isWin && generalStreakType === 'win') || (!isWin && generalStreakType === 'loss')) {
                    generalStreak++;
                  } else {
                    break;
                  }
                }
                
                return (
                  <CollapsibleSection 
                    title={
                      <div className="flex items-center gap-3">
                        <span>Recent Battles</span>
                        {generalStreakType && (
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                            generalStreakType === 'win' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                          )}>
                            <Flame className="w-3 h-3" />
                            <span className="font-semibold">{generalStreak} {generalStreakType === 'win' ? 'Win' : 'Loss'} Streak</span>
                          </div>
                        )}
                      </div>
                    } 
                    count={filteredBattles.length}
                  >
                    {/* Filter controls */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Filter className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Filters:</span>
                      </div>
                      <Select value={battleTypeFilter} onValueChange={setBattleTypeFilter}>
                        <SelectTrigger className="h-7 text-xs w-[120px] bg-background">
                          <SelectValue placeholder="Battle Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">All Types</SelectItem>
                          {battleTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={battleResultFilter} onValueChange={setBattleResultFilter}>
                        <SelectTrigger className="h-7 text-xs w-[100px] bg-background">
                          <SelectValue placeholder="Result" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">All Results</SelectItem>
                          <SelectItem value="win">Victories</SelectItem>
                          <SelectItem value="loss">Defeats</SelectItem>
                        </SelectContent>
                      </Select>
                      {(battleTypeFilter !== 'all' || battleResultFilter !== 'all') && (
                        <button 
                          onClick={() => { setBattleTypeFilter('all'); setBattleResultFilter('all'); }}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                    
                    {filteredBattles.length === 0 ? (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No battles match the selected filters
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {filteredBattles.slice(0, battlesShown).map((battle, i) => (
                            <BattleLogEntry key={i} battle={battle} />
                          ))}
                        </div>
                        {filteredBattles.length > battlesShown && (
                          <button 
                            onClick={() => setBattlesShown(prev => Math.min(prev + 10, filteredBattles.length))}
                            className="text-xs text-primary hover:underline text-center mt-2 w-full cursor-pointer"
                          >
                            +{filteredBattles.length - battlesShown} more battles (click to load more)
                          </button>
                        )}
                      </>
                    )}
                  </CollapsibleSection>
                );
              })()}

              {/* Cards Collection */}
              {player.cards && player.cards.length > 0 && (
                <CollapsibleSection title="Card Collection" count={player.cards.length}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {player.cards.slice(0, cardsShown).map((card, i) => (
                      <CardDisplay key={i} card={card} />
                    ))}
                  </div>
                  {player.cards.length > cardsShown && (
                    <button 
                      onClick={() => setCardsShown(prev => Math.min(prev + 40, player.cards.length))}
                      className="text-xs text-primary hover:underline text-center mt-2 w-full cursor-pointer"
                    >
                      +{player.cards.length - cardsShown} more cards (click to load more)
                    </button>
                  )}
                </CollapsibleSection>
              )}

              {/* League Statistics */}
              {player.leagueStatistics && (
                <CollapsibleSection title="League Statistics">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {player.leagueStatistics.currentSeason && (
                      <div className="p-2 bg-muted/30 rounded text-xs">
                        <p className="font-medium">Current Season</p>
                        <p className="text-muted-foreground">
                          Trophies: {player.leagueStatistics.currentSeason.trophies} 
                          (Best: {player.leagueStatistics.currentSeason.bestTrophies})
                        </p>
                      </div>
                    )}
                    {player.leagueStatistics.previousSeason && (
                      <div className="p-2 bg-muted/30 rounded text-xs">
                        <p className="font-medium">Previous Season</p>
                        <p className="text-muted-foreground">
                          {player.leagueStatistics.previousSeason.id}: {player.leagueStatistics.previousSeason.trophies}
                        </p>
                      </div>
                    )}
                    {player.leagueStatistics.bestSeason && (
                      <div className="p-2 bg-muted/30 rounded text-xs">
                        <p className="font-medium">Best Season</p>
                        <p className="text-muted-foreground">
                          {player.leagueStatistics.bestSeason.id}: {player.leagueStatistics.bestSeason.trophies}
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          )}

          {!isLoading && !error && !playerData && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Waiting for player data...</p>
              <p className="text-xs mt-2">
                Put player info in <code className="bg-muted px-1 py-0.5 rounded">public/data/player_info.json</code>
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
