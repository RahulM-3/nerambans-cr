import { WarLogEntry } from '@/types/clan';
import { Trophy, Swords, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WarLogTableProps {
  warLog: WarLogEntry[];
}

export function WarLogTable({ warLog }: WarLogTableProps) {
  if (warLog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Swords className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="text-xl font-display font-semibold mb-2">No War Logs Available</h3>
        <p className="text-sm">War data will appear here once clan wars are recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {warLog.map((war, idx) => (
        <div key={idx} className="rounded-lg border border-border overflow-hidden">
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">
                Season {war.seasonId}
              </h3>
              <span className="text-sm text-muted-foreground">
                {new Date(war.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Clan</th>
                  <th className="text-center">
                    <Trophy className="w-4 h-4 inline" /> Score
                  </th>
                  <th className="text-center">
                    <Crown className="w-4 h-4 inline" /> Crowns
                  </th>
                  <th className="text-center">
                    <Swords className="w-4 h-4 inline" /> Wins
                  </th>
                  <th className="text-center">Trophy Δ</th>
                </tr>
              </thead>
              <tbody>
                {war.standings.map((standing, sIdx) => (
                  <tr key={sIdx}>
                    <td className="font-medium">{standing.name}</td>
                    <td className="text-center tabular-nums">{standing.clanScore}</td>
                    <td className="text-center tabular-nums">{standing.crowns}</td>
                    <td className="text-center tabular-nums">{standing.wins}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center gap-1 ${
                        standing.trophyChange > 0 
                          ? 'text-stat-increase' 
                          : standing.trophyChange < 0 
                            ? 'text-stat-decrease' 
                            : 'text-muted-foreground'
                      }`}>
                        {standing.trophyChange > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : standing.trophyChange < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        {standing.trophyChange > 0 ? '+' : ''}{standing.trophyChange}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Participants Table */}
          {war.participants.length > 0 && (
            <div className="border-t border-border">
              <div className="bg-secondary/30 px-4 py-2 border-b border-border">
                <h4 className="font-display font-medium text-sm text-muted-foreground">
                  War Participants ({war.participants.length})
                </h4>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="data-table">
                  <thead className="sticky top-0">
                    <tr>
                      <th>Name</th>
                      <th className="text-center">Battles</th>
                      <th className="text-center">Wins</th>
                      <th className="text-center">Cards Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {war.participants.map((p, pIdx) => (
                      <tr key={pIdx}>
                        <td className="font-medium">{p.name}</td>
                        <td className="text-center tabular-nums">{p.battlesPlayed}</td>
                        <td className="text-center tabular-nums">{p.wins}</td>
                        <td className="text-center tabular-nums">{p.cardsEarned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
