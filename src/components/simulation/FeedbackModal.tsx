import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DilemmaOption } from '@/types/simulation';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface FeedbackModalProps {
  isOpen: boolean;
  option: DilemmaOption | null;
  onContinue: () => void;
  wasAutomatic?: boolean;
}

export const FeedbackModal = ({ isOpen, option, onContinue, wasAutomatic }: FeedbackModalProps) => {
  const { playSound } = useSound();
  if (!option) return null;

  const getImpactIcon = (impact: number) => {
    if (impact > 30) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (impact < -10) return <XCircle className="w-6 h-6 text-destructive" />;
    return <AlertCircle className="w-6 h-6 text-inci-yellow" />;
  };

  const getImpactLabel = (impact: number) => {
    if (impact > 30) return 'Excelente Decisão!';
    if (impact > 0) return 'Boa Decisão!';
    if (impact > -20) return 'Decisão Questionável';
    return 'Decisão Arriscada';
  };

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-inci-yellow/20 text-inci-blue border-inci-yellow/30';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            {getImpactIcon(option.impact)}
            <DialogTitle className="text-xl font-bold text-inci-blue">
              {getImpactLabel(option.impact)}
            </DialogTitle>
          </div>
          
          {wasAutomatic && (
            <div className="bg-inci-yellow/10 border border-inci-yellow/30 rounded-lg p-3">
              <p className="text-sm font-medium text-inci-blue text-center">
                ⏰ Tempo esgotado! Decisão automática selecionada.
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <DialogDescription className="text-base text-foreground">
              <strong>Sua escolha:</strong> {option.text}
            </DialogDescription>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Badge 
              className={cn(
                "text-sm border px-3 py-1",
                getRiskColor(option.riskLevel)
              )}
            >
              {option.riskLevel === 'low' ? 'Baixo Risco' : 
               option.riskLevel === 'medium' ? 'Médio Risco' : 'Alto Risco'}
            </Badge>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Impacto:</span>
              <span className={cn(
                "text-lg font-bold",
                option.impact > 0 ? "text-inci-blue" : "text-destructive"
              )}>
                {option.impact > 0 ? '+' : ''}{option.impact}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-inci-blue">
            <h4 className="font-semibold text-inci-blue mb-2">Consequências:</h4>
            <p className="text-foreground">{option.consequences}</p>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => {
                playSound('button');
                onContinue();
              }}
              variant="inci"
              size="lg"
            >
              Continuar Simulação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};