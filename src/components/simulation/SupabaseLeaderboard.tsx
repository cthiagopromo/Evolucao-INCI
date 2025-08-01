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

  const loadLeaderboard = async () => {
    console.log('Carregando leaderboard...');
    try {
      const data = await getLeaderboard();
      console.log('Dados recebidos:', data);
      
      // Validar estrutura dos dados
      if (!data || !Array.isArray(data)) {
        console.warn('Dados inválidos do leaderboard:', data);
        setEntries([]);
        return;
      }
      
      // Validar cada entrada com estrutura completa
      const validEntries = data.filter(entry => {
        const isValid = entry && 
                       typeof entry === 'object' &&
                       typeof entry.id === 'string' && 
                       typeof entry.name === 'string' && 
                       typeof entry.score === 'number' &&
                       Array.isArray(entry.badges) &&
                       entry.timestamp !== null && entry.timestamp !== undefined;
        
        if (!isValid) {
          console.warn('Entrada inválida ignorada:', entry, {
            hasId: typeof entry?.id === 'string',
            hasName: typeof entry?.name === 'string',
            hasScore: typeof entry?.score === 'number',
            hasBadges: Array.isArray(entry?.badges),
            hasTimestamp: entry?.timestamp !== null && entry?.timestamp !== undefined
          });
        }
        return isValid;
      });
      
      console.log(`Entradas válidas: ${validEntries.length}/${data.length}`);
      setEntries(validEntries);
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();

    // Atualiza a cada 30 segundos
    const interval = setInterval(() => {
      console.log('Atualizando leaderboard...');
      loadLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleViewProfile = (entry: LeaderboardEntry) => {
    if (onViewProfile) {
      console.log('Visualizando perfil:', entry);
      onViewProfile(entry);
    }
  };

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
      onViewProfile={handleViewProfile}
      showAdminControls={showAdminControls}
      onClearRanking={onClearRanking}
      onDownloadCSV={onDownloadCSV}
    />
  );
};