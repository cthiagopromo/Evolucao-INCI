import { useEffect, useState } from 'react';
import { LeaderboardDisplay } from './LeaderboardDisplay';
import { getLeaderboard } from '@/utils/simulation';
import { LeaderboardEntry } from '@/types/simulation';

interface SupabaseLeaderboardProps {
  onBack: () => void;
  onViewProfile?: (entry: LeaderboardEntry) => void;
  showAdminControls?: boolean;
  onClearRanking?: () => void;
  onDownloadCSV?: () => void;
}

export const SupabaseLeaderboard = ({ 
  onBack, 
  onViewProfile, 
  showAdminControls, 
  onClearRanking, 
  onDownloadCSV 
}: SupabaseLeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error('Erro ao carregar leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-inci-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <LeaderboardDisplay
      entries={entries}
      onBack={onBack}
      onViewProfile={onViewProfile}
      showAdminControls={showAdminControls}
      onClearRanking={onClearRanking}
      onDownloadCSV={onDownloadCSV}
    />
  );
};