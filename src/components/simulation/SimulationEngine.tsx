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
  generateRecommendations,
  saveToLeaderboard, 
  getLeaderboard,
  shuffleArray,
  testSupabaseConnection
} from '@/utils/simulation';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import { useToast } from '@/hooks/use-toast';

type SimulationState = 'registration' | 'simulation' | 'feedback' | 'results' | 'leaderboard' | 'profile-view' | 'loading';

export const SimulationEngine = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
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
      recommendations: [], // Será preenchido a seguir
      completedAt: new Date()
    };

    profile.badges = assignBadges(profile);
    profile.recommendations = generateRecommendations(profile);
    setUserProfile(profile);
    
    // Testar conexão com Supabase antes de salvar
    try {
      console.log('Testando conexão com Supabase...');
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao Supabase');
      }
      console.log('Conexão com Supabase estabelecida com sucesso');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
    }

    // Salvar no leaderboard (apenas Supabase)
    try {
      console.log('Salvando perfil no leaderboard...');
      const updatedLeaderboard = await saveToLeaderboard(profile);
      console.log('Perfil salvo com sucesso! Total de participantes:', updatedLeaderboard.length);
      
      toast({
        title: "✅ Resultados salvos!",
        description: `Seu perfil foi adicionado ao ranking com ${profile.totalScore} pontos.`,
        duration: 3000,
      });
      
      // Agora sim, mudar para loading e depois para results
      setState('loading');
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
      
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar seus resultados. Verifique sua conexão.",
        duration: 5000,
      });
      
      // Mesmo com erro, mostrar os resultados localmente
      setState('loading');
    }
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

  const handleViewRanking = async () => {
    playSound('transition');
    setState('loading');
    setShowLoading(true);
    try {
      console.log('Carregando ranking...');
      const data = await getLeaderboard();
      console.log('Dados do ranking carregados:', data);
      
      if (!data) {
        throw new Error('Dados do ranking não retornados');
      }
      
      setLeaderboardData(data);
      setState('leaderboard');
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      toast({
        title: "⚠️ Erro ao carregar ranking",
        description: "Não foi possível carregar o ranking completo. Tente novamente mais tarde.",
        duration: 5000,
      });
      setState('results');
    } finally {
      setShowLoading(false);
    }
  };

  const handleBackFromRanking = () => {
    playSound('transition');
    setState('results');
  };

  const handleViewProfile = (entry: LeaderboardEntry) => {
    console.log('Abrindo perfil do participante:', entry);
    playSound('transition');
    
    // Verificar se entry.decisions existe e é um array
    if (!entry.decisions) {
      console.warn('Decisões não encontradas para o participante:', entry.name);
    }
    
    // Converter LeaderboardEntry para UserProfile
    const profile: UserProfile = {
      id: entry.id,
      name: entry.name,
      email: entry.email || '',
      whatsapp: entry.whatsapp || '',
      decisions: entry.decisions || [],
      totalScore: entry.score,
      profileType: entry.profileType,
      badges: entry.badges || [],
      recommendations: [], // Gerar recomendações dinamicamente
      completedAt: entry.timestamp ? new Date(entry.timestamp) : new Date()
    };
    
    // Gerar recomendações baseadas no perfil
    profile.recommendations = generateRecommendations(profile);
    
    console.log('Perfil convertido:', profile);
    setViewingProfile(profile);
    setState('profile-view');
  };

  const handleBackFromProfile = () => {
    playSound('transition');
    setViewingProfile(null);
    // Retorna para o estado anterior (leaderboard ou results)
    setState(state === 'profile-view' ? 'leaderboard' : 'results');
  };

  // Refresh leaderboard data when viewing ranking
  useEffect(() => {
    if (state === 'leaderboard') {
      const loadData = async () => {
        setShowLoading(true);
        try {
          const data = await getLeaderboard();
          if (!data) {
            throw new Error('Dados do ranking não retornados');
          }
          setLeaderboardData(data);
        } catch (error) {
          console.error('Erro ao carregar ranking:', error);
          toast({
            title: "⚠️ Erro ao carregar ranking",
            description: "Não foi possível carregar o ranking completo. Tente novamente mais tarde.",
            duration: 5000,
          });
          setState('results');
        } finally {
          setShowLoading(false);
        }
      };
      loadData();
    }
  }, [state, toast]);

  

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

  if (state === 'loading' || showLoading) {
    return (
      <LoadingAnimation
        isVisible={true}
        onComplete={handleLoadingComplete}
      />
    );
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
        showAdminControls={false}
      />
    );
  }

  if (state === 'profile-view' && viewingProfile) {
    return (
      <ResultsDashboard
        profile={viewingProfile}
        onBack={handleBackFromProfile}
        onViewRanking={handleViewRanking}
        className="animate-fade-in"
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