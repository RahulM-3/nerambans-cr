import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Trophy, Medal, Award, CircleDot, Users, Layers, Ship } from 'lucide-react';
import { RiverRaceClan } from '@/types/clan';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ClanExpandableCardProps {
  clan: RiverRaceClan;
  rank: number;
  isOurClan: boolean;
  trophyChange?: number;
  showDecksToday?: boolean;
  showCollectiveStats?: boolean;
  isTrainingPeriod?: boolean;
}

export function ClanExpandableCard({ 
  clan, 
  rank, 
  isOurClan, 
  trophyChange, 
  showDecksToday = false,
  showCollectiveStats = false,
  isTrainingPeriod = false
}: ClanExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIcon = (r: number) => {
    // During training period, show default icon for all ranks
    if (isTrainingPeriod) {
      return <CircleDot className="w-5 h-5 text-muted-foreground" />;
    }
    if (r === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (r === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (r === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <CircleDot className="w-5 h-5 text-muted-foreground" />;
  };

  const sortedParticipants = [...(clan.participants || [])].sort((a, b) => b.fame - a.fame);

  // Calculate collective stats from participants
  const collectiveStats = useMemo(() => {
    if (!clan.participants) return { attacked: 0, fame: 0, repairPoints: 0, decksUsed: 0, decksUsedToday: 0, boatAttacks: 0 };
    
    const participants = clan.participants;
    // During training, use decksUsedToday to count attacked; otherwise use decksUsed
    const attacked = isTrainingPeriod 
      ? participants.filter(p => p.decksUsedToday > 0).length
      : participants.filter(p => p.decksUsed > 0).length;
    const fame = participants.reduce((sum, p) => sum + p.fame, 0);
    const repairPoints = participants.reduce((sum, p) => sum + p.repairPoints, 0);
    const decksUsed = participants.reduce((sum, p) => sum + p.decksUsed, 0);
    const decksUsedToday = participants.reduce((sum, p) => sum + p.decksUsedToday, 0);
    const boatAttacks = participants.reduce((sum, p) => sum + p.boatAttacks, 0);
    
    return { attacked, fame, repairPoints, decksUsed, decksUsedToday, boatAttacks };
  }, [clan.participants, isTrainingPeriod]);

  return (
    <div 
      className={`bg-card rounded-lg border overflow-hidden transition-all max-w-2xl mx-auto ${
        isOurClan ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      {/* Clan Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
      >
        {/* Top row: Rank, Name, Fame */}
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {getRankIcon(rank)}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-semibold ${isOurClan ? 'text-primary' : ''}`}>
                  {clan.name}
                </span>
                {isOurClan && <span className="text-yellow-500">⭐</span>}
                <span className="text-xs text-muted-foreground font-mono">{clan.tag}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {clan.participants?.length || 0} participants
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums">{clan.fame.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Fame</div>
            </div>
            {clan.clanScore !== undefined && clan.clanScore > 0 && (
              <div className="text-right">
                <div className="font-semibold tabular-nums text-amber-500">
                  {clan.clanScore.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Trophies</div>
              </div>
            )}
            {trophyChange !== undefined && (
              <div className="text-right">
                <div className={`font-semibold tabular-nums ${
                  trophyChange > 0 ? 'text-emerald-500' : trophyChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {trophyChange > 0 && '+'}{trophyChange}
                </div>
                <div className="text-xs text-muted-foreground">Change</div>
              </div>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Collective Stats Row */}
        {showCollectiveStats && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 pt-2.5 border-t border-border/50 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium tabular-nums">{collectiveStats.attacked}</span>
              <span className="text-muted-foreground">Attacked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-purple-500" />
              <span className="font-medium tabular-nums">{collectiveStats.boatAttacks}</span>
              <span className="text-muted-foreground">Boat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span className="font-medium tabular-nums">{collectiveStats.decksUsed}</span>
              <span className="text-muted-foreground">Decks</span>
            </div>
            {showDecksToday && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="font-medium tabular-nums">{collectiveStats.decksUsedToday}</span>
                <span className="text-muted-foreground">Today</span>
              </div>
            )}
          </div>
        )}
      </button>

      {/* Participants Table - Expandable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-card border-b border-border">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Fame</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Boat</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Decks</th>
                      {showDecksToday && (
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">Today</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParticipants.map((p) => (
                      <tr key={p.tag} className="border-b border-border/30 last:border-b-0 hover:bg-secondary/30">
                        <td className="px-3 py-1.5 font-medium">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{p.name}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{p.tag}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="text-right px-3 py-1.5 tabular-nums">{p.fame.toLocaleString()}</td>
                        <td className="text-right px-3 py-1.5 tabular-nums">{p.boatAttacks}</td>
                        <td className="text-right px-3 py-1.5 tabular-nums">{p.decksUsed}</td>
                        {showDecksToday && (
                          <td className="text-right px-3 py-1.5 tabular-nums text-muted-foreground">{p.decksUsedToday}</td>
                        )}
                      </tr>
                    ))}
                    {sortedParticipants.length === 0 && (
                      <tr>
                        <td colSpan={showDecksToday ? 5 : 4} className="text-center text-muted-foreground py-4">
                          No participants
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
