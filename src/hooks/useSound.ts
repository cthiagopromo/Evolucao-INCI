import { useCallback } from 'react';

type SoundType = 'button' | 'decision' | 'success' | 'start' | 'transition';

export const useSound = () => {
  const playSound = useCallback((soundType: SoundType) => {
    try {
      // Create simple audio using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency based on sound type
      switch (soundType) {
        case 'button':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          break;
        case 'decision':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          break;
        case 'start':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          break;
        case 'transition':
          oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
          break;
        default:
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      }
      
      // Set volume and duration
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if audio is not available
    }
  }, []);

  return { playSound };
};