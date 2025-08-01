import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dilemma, DilemmaOption, CategoryIcons, CategoryLabels } from '@/types/simulation';
import { cn, shuffleArray } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import { useMemo } from 'react';

interface DilemmaCardProps {
  dilemma: Dilemma;
  onSelectOption: (option: DilemmaOption) => void;
  className?: string;
}

export const DilemmaCard = ({ dilemma, onSelectOption, className }: DilemmaCardProps) => {
  const { playSound } = useSound();
  const categoryIcon = CategoryIcons[dilemma.category];
  const categoryLabel = CategoryLabels[dilemma.category];
  
  // Randomizar ordem das opções para cada novo participante
  const shuffledOptions = useMemo(() => shuffleArray(dilemma.options), [dilemma.id]);

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-inci-yellow/20 text-inci-blue border-inci-yellow/30';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getRiskLabel = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'Baixo Risco';
      case 'medium': return 'Médio Risco';
      case 'high': return 'Alto Risco';
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto animate-bounce-in", className)}>
      <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl md:text-4xl">{categoryIcon}</span>
          <Badge variant="secondary" className="text-xs sm:text-sm font-medium">
            {categoryLabel}
          </Badge>
        </div>
        
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-inci-blue leading-tight px-2">
          {dilemma.title}
        </CardTitle>
        
        <CardDescription className="text-sm sm:text-base md:text-lg text-foreground px-2">
          {dilemma.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border-l-4 border-inci-blue">
          <h4 className="font-semibold text-inci-blue mb-2 text-sm sm:text-base">Cenário:</h4>
          <p className="text-foreground text-sm sm:text-base leading-relaxed">{dilemma.scenario}</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-base sm:text-lg text-inci-blue">
            Qual sua decisão?
          </h4>
          
          <div className="grid gap-3 sm:gap-4 md:gap-6">
            {shuffledOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "h-auto p-4 sm:p-5 md:p-6 text-left hover:bg-inci-blue/5 hover:border-inci-blue",
                  "transition-all duration-300 hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02]",
                  "border-2 border-border"
                )}
                onClick={() => {
                  playSound('decision');
                  onSelectOption(option);
                }}
              >
                <p className="text-sm sm:text-base md:text-lg font-medium text-foreground text-left leading-relaxed">
                  {option.text}
                </p>
              </Button>
            ))}
          </div>
        </div>

        <div className="text-center text-xs sm:text-sm text-muted-foreground px-2">
          <p>💡 Dica: Se o tempo esgotar, a opção mais conservadora será selecionada automaticamente</p>
        </div>
      </CardContent>
    </Card>
  );
};