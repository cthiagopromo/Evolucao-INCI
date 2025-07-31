import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserProfile, Badge as BadgeType, CategoryIcons } from '@/types/simulation';
import { cn } from '@/lib/utils';
import { Trophy, Star, Target, TrendingUp, RotateCcw } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface ResultsDashboardProps {
  profile: UserProfile;
  onRestart: () => void;
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
        return 'Você tende a tomar decisões ousadas e inovadoras, buscando alto impacto e crescimento acelerado.';
      case 'strategist': 
        return 'Você prefere decisões seguras e bem fundamentadas, priorizando estabilidade e redução de riscos.';
      case 'operational': 
        return 'Você encontra o equilíbrio ideal entre inovação e cautela, adaptando-se ao contexto.';
      case 'sales': 
        return 'Você tende a tomar decisões orientadas a resultados e vendas, com foco em crescimento comercial.';
      case 'visionary': 
        return 'Você tem uma visão audaciosa e está disposto a assumir grandes riscos para alcançar grandes conquistas.';
      case 'conservative': 
        return 'Você prioriza a segurança e o ROI garantido, tomando decisões cautelosas e bem calculadas.';
      default: 
        return 'Você demonstra habilidades de tomada de decisão em cenários empresariais.';
    }
  };

  const categoryStats = profile.decisions.reduce((acc, decision) => {
    // Esta lógica seria expandida com dados reais dos dilemas
    acc.financial = acc.financial || 0;
    acc.marketing = acc.marketing || 0;
    acc.hr = acc.hr || 0;
    acc.strategy = acc.strategy || 0;
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
                    {category === 'financial' ? 'Finanças' :
                     category === 'marketing' ? 'Marketing' :
                     category === 'hr' ? 'RH' : 'Estratégia'}
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
              {profile.badges.map((badge) => (
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
              ))}
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
                {profile.profileType === 'innovator' ? (
                  <>
                    <li>• Plataforma White Label para monetizar seu conhecimento</li>
                    <li>• Zamply Produções para criar conteúdo educacional</li>
                    <li>• Recurso de IA para vendas automatizadas</li>
                  </>
                ) : profile.profileType === 'strategist' ? (
                  <>
                    <li>• Plataforma INCI de Educação Corporativa para capacitar líderes</li>
                    <li>• Locação de Sala de Reunião Sede para encontros estratégicos</li>
                    <li>• Zamply Eventos para lançamentos corporativos</li>
                  </>
                ) : profile.profileType === 'operational' ? (
                  <>
                    <li>• Plataforma INCI de Educação Corporativa para treinar equipes</li>
                    <li>• Sala Comercial Pátio para operações do dia a dia</li>
                    <li>• Zamply Produções para materiais de treinamento</li>
                  </>
                ) : profile.profileType === 'sales' ? (
                  <>
                    <li>• Recurso de IA para vendas para qualificar leads</li>
                    <li>• Plataforma White Label para cursos de vendas</li>
                    <li>• Zamply Eventos para eventos comerciais</li>
                  </>
                ) : profile.profileType === 'visionary' ? (
                  <>
                    <li>• Zamply Eventos para grandes lançamentos</li>
                    <li>• Plataforma White Label para escalar conhecimento</li>
                    <li>• Locação de Sala de Reunião Sede para apresentações</li>
                  </>
                ) : profile.profileType === 'conservative' ? (
                  <>
                    <li>• Plataforma INCI de Educação Corporativa (baixo risco)</li>
                    <li>• Sala Comercial Pátio para testes de mercado</li>
                    <li>• Recurso de IA para vendas (ROI garantido)</li>
                  </>
                ) : (
                  <>
                    <li>• Programa Completo de Liderança Empresarial</li>
                    <li>• Consultoria Personalizada Multi-área</li>
                    <li>• Workshop de Tomada de Decisão Estratégica</li>
                  </>
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
        </div>
      </div>
    </div>
  );
};