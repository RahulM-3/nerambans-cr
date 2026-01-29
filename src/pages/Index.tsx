import { useState } from 'react';
import { useClanData } from '@/hooks/useClanData';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Navigation } from '@/components/Navigation';
import { MembersTable } from '@/components/MembersTable';
import { WarLogTable } from '@/components/WarLogTable';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'warlog'>('members');
  const { members, warLog, previousMembers, changedFields, isLoading, error, lastUpdated } = useClanData();

  const topTrophies = members.length > 0 ? Math.max(...members.map(m => m.trophies)) : 0;

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
        memberCount={members.length}
        topTrophies={topTrophies}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
      />
      
      <div className="px-4 md:px-6 py-4">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-4">
          {activeTab === 'members' ? (
            <MembersTable
              members={members}
              previousMembers={previousMembers}
              changedFields={changedFields}
            />
          ) : (
            <WarLogTable warLog={warLog} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
