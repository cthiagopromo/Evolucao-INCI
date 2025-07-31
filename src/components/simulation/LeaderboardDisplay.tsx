import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry } from '@/types/simulation';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Crown, ArrowLeft, RefreshCw, Download, Trash2 } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
  onViewProfile?: (entry: LeaderboardEntry) => void;
  className?: string;
  showAdminControls?: boolean;
  onClearRanking?: () => void;
  onDownloadCSV?: () => void;
  maxEntries?: number;
}

export const LeaderboardDisplay = ({ 
  entries, 
  onBack, 
  onViewProfile,
  className, 
  showAdminControls = false, 
  onClearRanking, 
  onDownloadCSV, 
  maxEntries 
}: LeaderboardDisplayProps) => {
  const { playSound } = useSound();
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1: return "bg-inci-yellow text-inci-blue border-0";
      case 2: return "bg-gray-400 text-white border-0";
      case 3: return "bg-amber-500 text-white border-0";
      default: return "bg-inci-blue/10 text-inci-blue border-inci-blue/20";
    }
  };

  const getProfileEmoji = (profileType: string) => {
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

  const sortedEntries = [...entries].sort((a, b) => b.score - a.score).slice(0, maxEntries || entries.length);

  return (
    <div className={cn("min-h-screen bg-background py-8", className)}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="mx-auto w-20 h-20 bg-inci-blue rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-inci-blue mb-2">
            🏆 Ranking do Evento
          </h1>
          <p className="text-lg text-muted-foreground">
            {maxEntries ? `Top ${Math.min(maxEntries, entries.length)}` : 'Todos os'} Tomadores de Decisão ({entries.length} participantes)
          </p>
        </div>

        {/* Podium - Top 3 */}
              {sortedEntries.length >= 3 && (
                <div className="mb-8">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    💡 Clique em qualquer participante para ver o resumo do empreendedor
                  </p>
                  <div className="grid grid-cols-3 gap-4 items-end mb-6">
              {/* 2nd Place */}
              <Card 
                className="border-2 border-gray-300 shadow-lg cursor-pointer hover:bg-inci-blue/5"
                onClick={() => onViewProfile?.(sortedEntries[1])}
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2">{getRankIcon(2)}</div>
                  <div className="font-bold text-lg text-gray-600">#2</div>
                  <div className="font-semibold text-inci-blue truncate">
                    {sortedEntries[1].name}
                  </div>
                  <div className="text-2xl font-bold text-gray-600">
                    {sortedEntries[1].score}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getProfileEmoji(sortedEntries[1].profileType)}
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card 
                className="border-2 border-inci-yellow shadow-xl transform scale-105 cursor-pointer hover:bg-inci-blue/5"
                onClick={() => onViewProfile?.(sortedEntries[0])}
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2">{getRankIcon(1)}</div>
                  <div className="font-bold text-xl text-inci-blue">#1</div>
                  <div className="font-bold text-inci-blue truncate">
                    {sortedEntries[0].name}
                  </div>
                  <div className="text-3xl font-bold text-inci-blue">
                    {sortedEntries[0].score}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getProfileEmoji(sortedEntries[0].profileType)}
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card 
                className="border-2 border-amber-400 shadow-lg cursor-pointer hover:bg-inci-blue/5"
                onClick={() => onViewProfile?.(sortedEntries[2])}
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2">{getRankIcon(3)}</div>
                  <div className="font-bold text-lg text-amber-600">#3</div>
                  <div className="font-semibold text-inci-blue truncate">
                    {sortedEntries[2].name}
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {sortedEntries[2].score}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getProfileEmoji(sortedEntries[2].profileType)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Full Ranking */}
        <Card className="mb-8 border-2 border-inci-blue/20 shadow-lg">
          <CardHeader className="bg-inci-blue/10">
            <CardTitle className="flex items-center justify-between text-inci-blue">
              <span>Classificação Completa</span>
              <RefreshCw className="w-5 h-5 animate-spin" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {sortedEntries.map((entry, index) => {
                const position = index + 1;
                const isTopThree = position <= 3;
                
                return (
                  <div
                    key={entry.id}
                    onClick={() => onViewProfile?.(entry)}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-all hover:bg-muted/50 cursor-pointer hover:shadow-md rounded-lg",
                      isTopThree && "bg-inci-blue/5",
                      onViewProfile && "hover:border hover:border-inci-blue/30"
                    )}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      <Badge className={cn("w-8 h-8 flex items-center justify-center rounded-full", getRankBadge(position))}>
                        {position}
                      </Badge>
                    </div>

                    {/* Icon */}
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(position)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-semibold truncate",
                        isTopThree ? "text-inci-blue" : "text-foreground"
                      )}>
                        {entry.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getProfileEmoji(entry.profileType)} {
                          entry.profileType === 'innovator' ? 'Inovador' :
                          entry.profileType === 'strategist' ? 'Estrategista' :
                          entry.profileType === 'operational' ? 'Operacional' :
                          entry.profileType === 'sales' ? 'Vendedor' :
                          entry.profileType === 'visionary' ? 'Visionário' :
                          entry.profileType === 'conservative' ? 'Conservador' :
                          'Equilibrado'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString('pt-BR')} às {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={cn(
                        "text-xl font-bold",
                        isTopThree ? "text-inci-blue" : "text-foreground"
                      )}>
                        {entry.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        pontos
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1">
                      {entry.badges.slice(0, 2).map((badge) => (
                        <span key={badge.id} className="text-lg" title={badge.name}>
                          {badge.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-inci-blue">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Participantes</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-inci-blue">
              {Math.round(entries.reduce((acc, e) => acc + e.score, 0) / entries.length) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Média</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-inci-blue">
              {Math.max(...entries.map(e => e.score), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Maior Score</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-inci-blue">
              {entries.filter(e => e.profileType === 'innovator').length}
            </div>
            <div className="text-sm text-muted-foreground">Inovadores</div>
          </Card>
        </div>

        {/* Footer with Back and Admin Controls */}
        <div className="space-y-4">
          {/* Admin Controls */}
          {showAdminControls && (
            <div className="flex justify-center gap-4">
              <Button 
                onClick={onDownloadCSV}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar CSV
              </Button>
              
              <Button 
                onClick={onClearRanking}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Ranking
              </Button>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center">
            <Button 
              onClick={() => {
                playSound('button');
                onBack();
              }}
              variant="inciOutline"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Simulador
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};