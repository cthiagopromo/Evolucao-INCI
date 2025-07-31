import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const LoadingAnimation = ({ isVisible, onComplete }: LoadingAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, 2000); // 2 seconds animation duration

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inci-blue">
      <div className="relative">
        {/* Background fill animation */}
        <div 
          className={cn(
            "absolute inset-0 bg-inci-blue transition-all duration-2000 ease-in-out",
            isAnimating ? "scale-150 opacity-100" : "scale-0 opacity-0"
          )}
        />
        
        {/* Logo container */}
        <div 
          className={cn(
            "relative z-10 transition-all duration-2000 ease-in-out",
            isAnimating ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        >
          <img 
            src="/icon-logo.svg" 
            alt="INCI Logo" 
            width="120" 
            height="128" 
            className="drop-shadow-lg filter brightness-0 invert"
          />
        </div>
        
        {/* Loading text */}
        <div 
          className={cn(
            "absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium transition-opacity duration-1000",
            isAnimating ? "opacity-100" : "opacity-0"
          )}
        >
          Processando resultados...
        </div>
      </div>
    </div>
  );
};