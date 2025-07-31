import { useState, useEffect } from 'react';
import { UserRegistration } from './UserRegistration';
import { DilemmaCard } from './DilemmaCard';
import { Timer } from './Timer';
import { FeedbackModal } from './FeedbackModal';
import { ResultsDashboard } from './ResultsDashboard';
import { LeaderboardDisplay } from './LeaderboardDisplay';
import { LoadingAnimation } from './LoadingAnimation';
import { Progress } from '@/components/ui/progress';
import { dilemmas } from '@/data/dilemmas';
import { UserProfile, UserDecision, DilemmaOption, Dilemma, LeaderboardEntry } from '@/types/simulation';
import { 
  calculateScore, 
  determineProfileType, 
  assignBadges, 
  saveToLeaderboard, 
  getLeaderboard,
  shuffleArray 
} from '@/utils/simulation';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';

type SimulationState = 'registration' | 'simulation' | 'feedback' | 'results' | 'leaderboard' | 'profile-view' | 'loading';

export const SimulationEngine = () => {
  const { playSound } = useSound();
  const [state, setState] = useState<SimulationState>('registration');
  const [userData, setUserData] = useState<{ name: string; email: string; whatsapp: string } | null>(null);
  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [decisions, setDecisions] = useState<UserDecision[]>([]);
  const [currentDecision, setCurrentDecision] = useState<{ option: DilemmaOption; wasAutomatic: boolean } | null>(null);
  const [shuffledDilemmas, setShuffledDilemmas] = useState<Dilemma[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [showLoading, setShowLoading] = useState(false);

  // Embaralhar dilemas na inicialização
  useEffect(() => {
    console.log('Initializing dilemmas:', dilemmas.length);
    const shuffled = shuffleArray(dilemmas);
    console.log('Shuffled dilemmas:', shuffled.length);
    setShuffledDilemmas(shuffled);
  }, []);

  const currentDilemma = shuffledDilemmas[currentDilemmaIndex];
  const progress = ((currentDilemmaIndex + 1) / shuffledDilemmas.length) * 100;

  const handleStartSimulation = (data: { name: string; email: string; whatsapp: string }) => {
    setUserData(data);
    playSound('transition');
    setState('simulation');
    setStartTime(Date.now());
  };

  const handleSelectOption = (option: DilemmaOption) => {
    if (!currentDilemma) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const decision: UserDecision = {
      dilemmaId: currentDilemma.id,
      optionId: option.id,
      timeSpent,
      wasAutomatic: false
    };

    setDecisions(prev => [...prev, decision]);
    setCurrentDecision({ option, wasAutomatic: false });
    setState('feedback');
    playSound('transition');
  };

  const handleTimeout = () => {
    if (!currentDilemma) return;
    
    // Select a random option instead of the default
    const randomIndex = Math.floor(Math.random() * currentDilemma.options.length);
    const randomOption = currentDilemma.options[randomIndex];
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const decision: UserDecision = {
      dilemmaId: currentDilemma.id,
      optionId: randomOption.id,
      timeSpent,
      wasAutomatic: true
    };

    setDecisions(prev => [...prev, decision]);
    setCurrentDecision(null);
    handleContinue();
  };

  const handleContinue = () => {
    if (currentDilemmaIndex < shuffledDilemmas.length - 1) {
      setCurrentDilemmaIndex(prev => prev + 1);
      playSound('transition');
      setState('simulation');
      setStartTime(Date.now());
      setCurrentDecision(null);
    } else {
    setState('loading');
    finishSimulation();
  }
  };

  const finishSimulation = async () => {
    if (!userData) {
      return;
    }

    const totalScore = calculateScore(decisions);
    const profileType = determineProfileType(decisions);
    
    const profile: UserProfile = {
      id: userData.email,
      name: userData.name,
      email: userData.email,
      whatsapp: userData.whatsapp,
      decisions,
      totalScore,
      profileType,
      badges: [], // Será preenchido a seguir
      completedAt: new Date()
    };

    profile.badges = assignBadges(profile);
    setUserProfile(profile);
    
    // Salvar no leaderboard (agora assíncrono)
    try {
      await saveToLeaderboard(profile);
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
    
    // Transition handled by state
  };

  const handleLoadingComplete = () => {
  playSound('transition');
  setState('results');
};

  const handleRestart = () => {
    playSound('transition');
    setState('registration');
    setUserData(null);
    setCurrentDilemmaIndex(0);
    setDecisions([]);
    setCurrentDecision(null);
    setUserProfile(null);
    setShuffledDilemmas(shuffleArray(dilemmas));
  };

  const handleViewRanking = () => {
    playSound('transition');
    setState('leaderboard');
  };

  const handleBackFromRanking = () => {
    playSound('transition');
    setState('results');
  };

  const handleViewProfile = (entry: any) => {
    // Converter LeaderboardEntry para UserProfile
    const profile: UserProfile = {
      id: entry.id,
      name: entry.name,
      email: entry.email || '',
      whatsapp: entry.whatsapp || '',
      decisions: [], // Poderia ser expandido para incluir decisões se armazenadas
      totalScore: entry.score,
      profileType: entry.profileType,
      badges: entry.badges,
      completedAt: new Date(entry.timestamp)
    };
    
    setViewingProfile(profile);
    playSound('transition');
    setState('profile-view');
  };

  const handleBackFromProfile = () => {
    playSound('transition');
    setState('leaderboard');
    setViewingProfile(null);
  };

  // Refresh leaderboard data when viewing ranking
  useEffect(() => {
    if (state === 'leaderboard') {
      getLeaderboard().then((data) => setLeaderboardData(data));
    }
  }, [state]);

  // Initialize leaderboard data on mount
  useEffect(() => {
    getLeaderboard().then((data) => setLeaderboardData(data));
  }, []);

  

  if (state === 'registration') {
    return <UserRegistration onStart={handleStartSimulation} />;
  }

  if (state === 'simulation' && currentDilemma) {
    return (
      <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          {/* Progress Header */}
          <div className="mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Dilema {currentDilemmaIndex + 1} de {shuffledDilemmas.length}</span>
              <span className="truncate ml-2 max-w-[120px] sm:max-w-none">{userData?.name}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Timer */}
          <div className="mb-4 sm:mb-6">
            <Timer
              key={`timer-${currentDilemma.id}`}
              duration={currentDilemma.timeLimit}
              onTimeout={handleTimeout}
              isActive={state === 'simulation'}
            />
          </div>

          {/* Dilemma Card */}
          <DilemmaCard
            dilemma={currentDilemma}
            onSelectOption={handleSelectOption}
          />
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return <LoadingAnimation isVisible={true} onComplete={handleLoadingComplete} />;
  }

  if (state === 'feedback' && currentDecision) {
    return (
      <FeedbackModal
        isOpen={true}
        option={currentDecision.option}
        onContinue={handleContinue}
        wasAutomatic={currentDecision.wasAutomatic}
      />
    );
  }

  if (state === 'results' && userProfile) {
    return (
      <ResultsDashboard
        profile={userProfile}
        onRestart={handleRestart}
        onViewRanking={handleViewRanking}
      />
    );
  }

  if (state === 'leaderboard') {
    return (
      <LeaderboardDisplay
        entries={leaderboardData}
        onBack={handleBackFromRanking}
        onViewProfile={handleViewProfile}
      />
    );
  }

  if (state === 'profile-view' && viewingProfile) {
    return (
      <ResultsDashboard
        profile={viewingProfile}
        onRestart={handleRestart}
        onViewRanking={() => {
          playSound('transition');
          setState('leaderboard');
        }}
        onBack={handleBackFromProfile}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-inci-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando simulação...</p>
      </div>
    </div>
  );
};