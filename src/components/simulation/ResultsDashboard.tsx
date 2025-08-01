import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserProfile, Badge as BadgeType, CategoryIcons, CategoryLabels, UserDecision } from '@/types/simulation';
import { cn } from '@/lib/utils';
import { Trophy, Star, TrendingUp, RotateCcw } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { dilemmas } from '@/data/dilemmas';

interface ResultsDashboardProps {
  profile: UserProfile;
  onRestart?: () => void;
  onViewRanking: () => void;
  onBack?: () => void;
  className?: string;
}

export const ResultsDashboard = ({ profile, onRestart, onViewRanking, onBack, className }: ResultsDashboardProps) => {
  const { playSound } = useSound();
  const getProfileIcon = (profileType: string) => {
    switch (profileType) {
      case 'innovator': return '🚀';
      case 'strategist': return '🎯';
      case 'operational': return '⚙️';
      case 'sales': return '💼';
      case 'visionary': return '🌟';
      case 'conservative': return '🛡️';
      default: return '👔';
    }
  };

  const getProfileTitle = (profileType: string) => {
    switch (profileType) {
      case 'innovator': return 'Inovador';
      case 'strategist': return 'Estrategista';
      case 'operational': return 'Operacional';
      case 'sales': return 'Vendedor';
      case 'visionary': return 'Visionário';
      case 'conservative': return 'Conservador';
      default: return 'Tomador de Decisões';
    }
  };

  const getProfileDescription = (profileType: string) => {
    switch (profileType) {
      case 'innovator': 
        return 'Você transforma ideias em oportunidades de negócio';
      case 'strategist': 
        return 'Você tem visão macro e foco em resultados de longo prazo';
      case 'operational': 
        return 'Você executa com excelência e busca eficiência máxima';
      case 'sales': 
        return 'Você converte relacionamentos em resultados comerciais';
      case 'visionary': 
        return 'Você enxerga o futuro e inspira transformações';
      case 'conservative': 
        return 'Você prioriza segurança e resultados comprovados';
      default: 
        return 'Você demonstra habilidades de tomada de decisão em cenários empresariais.';
    }
  };

  const categoryStats = (profile.decisions || []).reduce((acc, decision) => {
    const dilemma = dilemmas.find(d => d.id === decision.dilemmaId);
    if (dilemma) {
      acc[dilemma.category] = (acc[dilemma.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);



  return (
    <div className={cn("min-h-screen bg-background py-8", className)}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="mx-auto w-20 h-20 bg-inci-blue rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-inci-blue mb-2">
            Simulação Concluída!
          </h1>
          <p className="text-lg text-muted-foreground">
            Parabéns, {profile.name}! Veja seu perfil de decisão.
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-6 border-2 border-inci-blue/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">{getProfileIcon(profile.profileType)}</span>
              <div>
                <CardTitle className="text-2xl text-inci-blue">
                  {getProfileTitle(profile.profileType)}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {getProfileDescription(profile.profileType)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-inci-blue mb-2">
                {profile.totalScore}
              </div>
              <div className="text-lg text-muted-foreground">
                Pontuação Total
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(CategoryIcons).map(([category, icon]) => (
                <div key={category} className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm text-muted-foreground">
                    {CategoryLabels[category]}
                  </div>
                  <Progress 
                    value={(categoryStats[category] || 0) * 10} 
                    className="h-2 mt-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-inci-blue">
              <Star className="w-5 h-5" />
              Conquistas Desbloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(profile.badges || []).length > 0 ? (
                profile.badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-inci-blue/20"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h4 className="font-semibold text-inci-blue">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>Nenhuma conquista desbloqueada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-inci-blue">
              <TrendingUp className="w-5 h-5" />
              Recomendações INCI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-inci-blue/10 p-4 rounded-lg border border-inci-blue/20">
              <h4 className="font-semibold text-inci-blue mb-2">
                💡 Baseado no seu perfil, recomendamos:
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                {(profile.recommendations || []).length > 0 ? (
                  profile.recommendations.map((recommendation, index) => (
                    <li key={index}>• {recommendation}</li>
                  ))
                ) : (
                  <li>Sem recomendações disponíveis para este perfil</li>
                )}
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Quer saber mais sobre como a INCI pode ajudar sua empresa?
              </p>
              <Button 
                variant="inciYellow"
                size="lg"
                onClick={() => window.open('https://wa.me/5588988893564', '_blank')}
              >
                🤝 Falar com Especialista INCI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Section - Destaque */}
        <Card className="mb-6 border-2 border-inci-blue/30 shadow-lg bg-gradient-to-r from-inci-blue/5 to-inci-yellow/5">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-inci-blue/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-inci-blue" />
              </div>
              <h3 className="text-xl font-bold text-inci-blue">
                Compare seu Desempenho
              </h3>
              <p className="text-muted-foreground mb-6">
                Veja como você se posiciona em relação aos outros participantes do evento
              </p>
              <Button 
                onClick={() => {
                  playSound('success');
                  onViewRanking();
                }}
                variant="inci"
                size="lg"
                className="min-w-[200px]"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ver Ranking do Evento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {onBack && (
            <Button 
              onClick={() => {
                playSound('button');
                onBack();
              }}
              variant="inciOutline"
              size="lg"
            >
              Voltar ao Ranking
            </Button>
          )}
          {onRestart && (
            <Button 
              onClick={() => {
                playSound('button');
                onRestart();
              }}
              variant="inciOutline"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};