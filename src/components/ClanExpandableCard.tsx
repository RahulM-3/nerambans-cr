import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Trophy, Medal, Award, CircleDot } from 'lucide-react';
import { RiverRaceClan, RiverRaceParticipant, RiverRaceParticipantDelta } from '@/types/clan';
import { DeltaIndicator } from './DeltaIndicator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ClanExpandableCardProps {
  clan: RiverRaceClan;
  rank: number;
  isOurClan: boolean;
  deltas?: Map<string, RiverRaceParticipantDelta>;
  trophyChange?: number;
}

export function ClanExpandableCard({ clan, rank, isOurClan, deltas, trophyChange }: ClanExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (r === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (r === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <CircleDot className="w-5 h-5 text-muted-foreground" />;
  };

  const sortedParticipants = [...(clan.participants || [])].sort((a, b) => b.fame - a.fame);

  return (
    <div 
      className={`bg-card rounded-lg border overflow-hidden transition-all ${
        isOurClan ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      {/* Clan Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {getRankIcon(rank)}
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isOurClan ? 'text-primary' : ''}`}>
                {clan.name}
              </span>
              {isOurClan && <span className="text-yellow-500">⭐</span>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground cursor-help font-mono">
                    {clan.tag}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clan Tag</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-sm text-muted-foreground">
              {clan.participants?.length || 0} participants
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums">{clan.fame.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Fame</div>
          </div>
          <div className="text-right">
            <div className="font-semibold tabular-nums">{clan.repairPoints}</div>
            <div className="text-xs text-muted-foreground">Repair</div>
          </div>
          {trophyChange !== undefined && (
            <div className="text-right">
              <div className={`font-semibold tabular-nums ${
                trophyChange > 0 ? 'text-emerald-500' : trophyChange < 0 ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {trophyChange > 0 && '+'}{trophyChange}
              </div>
              <div className="text-xs text-muted-foreground">Trophies</div>
            </div>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Participants Table - Expandable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="data-table table-fixed w-full">
                  <thead className="sticky top-0 z-10 bg-card">
                    <tr>
                      <th className="w-[40%] text-left">Name</th>
                      <th className="w-[12%] text-right">Fame</th>
                      <th className="w-[12%] text-right">Repair</th>
                      <th className="w-[12%] text-right">Boat</th>
                      <th className="w-[12%] text-right">Decks</th>
                      <th className="w-[12%] text-right">Today</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParticipants.map((p) => {
                      const delta = isOurClan && deltas ? deltas.get(p.tag) : undefined;
                      return (
                        <tr key={p.tag}>
                          <td className="font-medium text-left truncate">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{p.name}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{p.tag}</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="text-right tabular-nums">
                            <span className="inline-flex items-center justify-end gap-1">
                              {p.fame.toLocaleString()}
                              {delta && <DeltaIndicator value={delta.fameDelta} />}
                            </span>
                          </td>
                          <td className="text-right tabular-nums">
                            <span className="inline-flex items-center justify-end gap-1">
                              {p.repairPoints}
                              {delta && <DeltaIndicator value={delta.repairPointsDelta} />}
                            </span>
                          </td>
                          <td className="text-right tabular-nums">
                            <span className="inline-flex items-center justify-end gap-1">
                              {p.boatAttacks}
                              {delta && <DeltaIndicator value={delta.boatAttacksDelta} />}
                            </span>
                          </td>
                          <td className="text-right tabular-nums">
                            <span className="inline-flex items-center justify-end gap-1">
                              {p.decksUsed}
                              {delta && <DeltaIndicator value={delta.decksUsedDelta} />}
                            </span>
                          </td>
                          <td className="text-right tabular-nums text-muted-foreground">
                            {p.decksUsedToday}
                          </td>
                        </tr>
                      );
                    })}
                    {sortedParticipants.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted-foreground py-4">
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
