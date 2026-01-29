import { useState } from 'react';
import { useClanData } from '@/hooks/useClanData';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Navigation } from '@/components/Navigation';
import { MembersTable } from '@/components/MembersTable';
import { RiverRaceSection } from '@/components/RiverRaceSection';
import { RiverRaceLogSection } from '@/components/RiverRaceLogSection';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'riverrace' | 'history'>('members');
  const { 
    members, 
    memberDeltas,
    clanInfo,
    clanInfoDelta,
    riverRace, 
    riverRaceLog, 
    isLoading, 
    error, 
    lastUpdated 
  } = useClanData();

  if (isLoading && members.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-display">Loading clan data...</p>
        </div>
      </div>
    );
  }

  if (error && members.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-destructive mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        clanInfo={clanInfo}
        clanInfoDelta={clanInfoDelta}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        riverRace={riverRace}
      />
      
      <div className="px-4 md:px-6 py-4">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-4">
          {activeTab === 'members' && (
            <MembersTable
              members={members}
              memberDeltas={memberDeltas}
            />
          )}
          {activeTab === 'riverrace' && riverRace && clanInfo && (
            <RiverRaceSection riverRace={riverRace} ourClanTag={clanInfo.tag} />
          )}
          {activeTab === 'history' && riverRaceLog && (
            <RiverRaceLogSection log={riverRaceLog} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
