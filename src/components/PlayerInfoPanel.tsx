import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Trophy, Swords, Users, Gift, Crown, Star, Target, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
    team: Array<{ crowns: number }>;
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
  title: string; 
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
  
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded text-xs",
      isWin ? "bg-primary/10 border-l-2 border-primary" : "bg-destructive/10 border-l-2 border-destructive"
    )}>
      <div className="min-w-0">
        <p className="font-medium truncate">vs {opponentName}</p>
        <p className="text-[10px] text-muted-foreground">{battle.gameMode.name} • {battle.arena.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("font-bold", isWin ? "text-primary" : "text-destructive")}>
          {teamCrowns} - {opponentCrowns}
        </p>
        <p className="text-[10px] text-muted-foreground">{isWin ? 'Victory' : 'Defeat'}</p>
      </div>
    </div>
  );
}

export function PlayerInfoPanel({ playerTag, playerName, isOpen, onClose }: PlayerInfoPanelProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPlayerInfo = useCallback(async (tag: string) => {
    setIsLoading(true);
    setError(null);
    setPlayerData(null);

    try {
      const requestTimestamp = Date.now();
      const startTime = Date.now();
      
      // Encode tag for Firebase key (replace special chars)
      const encodedTag = encodeURIComponent(tag);
      
      // First check if player info already exists
      const existingRes = await fetch(`${API_BASE}/players/info.json`);
      if (existingRes.ok) {
        const existingData = await existingRes.json();
        if (existingData?.requestedTag === tag && existingData?.player && existingData?.fetchedAt >= requestTimestamp - 60000) {
          setPlayerData(existingData);
          setIsLoading(false);
          return;
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
            const data = await res.json();
            // Verify the data is for the requested player
            if (data?.requestedTag === tag && data?.player && data?.fetchedAt >= requestTimestamp - 60000) {
              setPlayerData(data);
              setIsLoading(false);
              return;
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
              {/* Header Stats */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
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

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatCard icon={Swords} label="Battles" value={player.battleCount ?? 0} subValue={`${player.wins ?? 0}W / ${player.losses ?? 0}L`} />
                <StatCard icon={Crown} label="3-Crown Wins" value={player.threeCrownWins ?? 0} />
                <StatCard icon={Gift} label="Donations" value={player.donations ?? 0} subValue={`Total: ${(player.totalDonations ?? 0).toLocaleString()}`} />
                <StatCard icon={Users} label="War Day Wins" value={player.warDayWins ?? 0} />
                <StatCard icon={Target} label="Challenge Wins" value={player.challengeCardsWon ?? 0} subValue={`Max: ${player.challengeMaxWins ?? 0}`} />
                <StatCard icon={Star} label="Star Points" value={(player as unknown as { starPoints?: number }).starPoints ?? 0} />
              </div>

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
                    {player.badges.slice(0, 30).map((badge, i) => (
                      <BadgeDisplay key={i} badge={badge} />
                    ))}
                  </div>
                  {player.badges.length > 30 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      +{player.badges.length - 30} more badges
                    </p>
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
              {battlelog && battlelog.length > 0 && (
                <CollapsibleSection title="Recent Battles" count={battlelog.length}>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {battlelog.slice(0, 10).map((battle, i) => (
                      <BattleLogEntry key={i} battle={battle} />
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Cards Collection */}
              {player.cards && player.cards.length > 0 && (
                <CollapsibleSection title="Card Collection" count={player.cards.length}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {player.cards.slice(0, 40).map((card, i) => (
                      <CardDisplay key={i} card={card} />
                    ))}
                  </div>
                  {player.cards.length > 40 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      +{player.cards.length - 40} more cards
                    </p>
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
