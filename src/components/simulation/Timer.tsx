import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isActive: boolean;
  className?: string;
}

export const Timer = ({ duration, onTimeout, isActive, className }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      setIsWarning(false);
      return;
    }

    setTimeLeft(duration);
    setIsWarning(false);

    const playTickSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 2) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        
        if (prev <= 4 && !isWarning) {
          setIsWarning(true);
        }
        
        // Play tick sound during entire countdown
        playTickSound();
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, isActive, onTimeout]);

  const progressValue = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 4;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Tempo restante
        </span>
        <span 
          className={cn(
            "text-lg font-bold transition-colors",
            isUrgent ? "text-destructive animate-timer-warning" : "text-foreground"
          )}
        >
          {timeLeft}s
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progressValue}
          className={cn(
            "h-3 transition-all duration-1000",
            isUrgent && "animate-pulse-glow"
          )}
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
            isUrgent ? "bg-destructive" : "bg-inci-blue"
          )}
          style={{ width: `${progressValue}%` }}
        />
      </div>
      
      {isUrgent && (
        <div className="text-center">
          <span className="text-sm font-medium text-destructive animate-bounce">
            ⚠️ Últimos segundos!
          </span>
        </div>
      )}
    </div>
  );
};