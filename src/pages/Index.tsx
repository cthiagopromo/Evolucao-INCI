import { useState } from 'react';
import { SimulationEngine } from '@/components/simulation/SimulationEngine';
import { SupabaseLeaderboard } from '@/components/simulation/SupabaseLeaderboard';
import { ResultsDashboard } from '@/components/simulation/ResultsDashboard';
import { Button } from '@/components/ui/button';
import { getLeaderboard, clearLeaderboard, downloadLeaderboardCSV } from '@/utils/simulation';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showRanking, setShowRanking] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const { toast } = useToast();

  const handleClearRanking = async () => {
    if (window.confirm('Tem certeza que deseja limpar o ranking? Esta ação não pode ser desfeita.')) {
      const success = await clearLeaderboard();
      if (success) {
        toast({
          title: "Ranking Limpo",
          description: "Todos os dados do ranking foram removidos com sucesso do Supabase.",
          variant: "default",
        });
      } else {
        toast({
          title: "Atenção",
          description: "Ranking limpo do armazenamento local. Verifique as permissões do Supabase.",
          variant: "destructive",
        });
      }
      
      // Recarregar a página para atualizar o leaderboard
      window.location.reload();
    }
  };

  const handleDownloadCSV = async () => {
    const leaderboard = await getLeaderboard();
    if (leaderboard.length === 0) {
      toast({
        title: "Nenhum dado encontrado",
        description: "Não há participantes para exportar.",
        variant: "destructive"
      });
      return;
    }

    downloadLeaderboardCSV(leaderboard);
    toast({
      title: "Download Iniciado",
      description: `Arquivo CSV com ${leaderboard.length} participantes foi baixado.`,
    });
  };

  const handleViewProfileFromRanking = (entry: any) => {
    console.log('handleViewProfileFromRanking chamado com:', entry);
    
    // Importar generateRecommendations dinamicamente
    import('@/utils/simulation').then(({ generateRecommendations }) => {
      // Converter LeaderboardEntry para UserProfile para visualização
      const profile: any = {
        id: entry.id,
        name: entry.name,
        email: entry.email || '',
        whatsapp: entry.whatsapp || '',
        decisions: entry.decisions || [],
        totalScore: entry.score,
        profileType: entry.profileType,
        badges: entry.badges || [],
        completedAt: new Date(entry.timestamp),
        // Gerar recomendações baseadas no perfil
        recommendations: generateRecommendations({
          name: entry.name,
          totalScore: entry.score,
          profileType: entry.profileType,
          completedAt: new Date(entry.timestamp),
          decisions: entry.decisions || []
        })
      };
      
      // Armazenar o perfil para visualização
      setViewingProfile(profile);
      setShowRanking(false); // Esconder ranking
      setShowProfileView(true); // Mostrar visualização de perfil
    });
  };

  if (showRanking) {
    return (
      <SupabaseLeaderboard
        onBack={() => setShowRanking(false)}
        onViewProfile={handleViewProfileFromRanking}
        showAdminControls={true}
        onClearRanking={handleClearRanking}
        onDownloadCSV={handleDownloadCSV}
      />
    );
  }

  if (showProfileView && viewingProfile) {
    return (
      <div className="ml-60 min-h-screen flex flex-col">
        <div className="flex-1">
          <ResultsDashboard
            profile={viewingProfile}
            onRestart={() => {
              setViewingProfile(null);
              setShowProfileView(false);
            }}
            onViewRanking={() => {
              setViewingProfile(null);
              setShowProfileView(false);
              setShowRanking(true);
            }}
            onBack={() => {
              setViewingProfile(null);
              setShowProfileView(false);
              setShowRanking(true);
            }}
          />
        </div>
        
        <footer className="border-t border-border bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setViewingProfile(null);
                  setShowProfileView(false);
                  setShowRanking(true);
                }}
                variant="secondary"
                size="sm"
                className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Voltar ao Ranking
              </Button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="ml-60 min-h-screen flex flex-col">
      <div className="flex-1">
        <SimulationEngine />
      </div>
      
      {/* Footer com botão de ranking */}
      <footer className="border-t border-border bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowRanking(true)}
              variant="secondary"
              size="sm"
              className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ver Ranking
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
