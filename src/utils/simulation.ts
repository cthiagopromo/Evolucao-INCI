import { UserProfile, UserDecision, Badge, LeaderboardEntry } from '@/types/simulation';
import { dilemmas } from '@/data/dilemmas';
import { supabase } from '@/integrations/supabase/client';

export const calculateScore = (decisions: UserDecision[]): number => {
  return decisions.reduce((total, decision) => {
    const dilemma = dilemmas.find(d => d.id === decision.dilemmaId);
    const option = dilemma?.options.find(o => o.id === decision.optionId);
    
    if (!option) return total;
    
    let score = option.impact;
    
    // Bonus por velocidade de decisão
    if (decision.timeSpent < 20) {
      score += 10; // Bonus por decisão rápida
    }
    
    // Penalidade por decisão automática
    if (decision.wasAutomatic) {
      score -= 20;
    }
    
    return total + Math.max(score, -50); // Limita impacto negativo
  }, 0);
};

export const determineProfileType = (decisions: UserDecision[]): 'innovator' | 'strategist' | 'operational' | 'sales' | 'visionary' | 'conservative' => {
  let highRiskCount = 0;
  let lowRiskCount = 0;
  let mediumRiskCount = 0;
  
  decisions.forEach(decision => {
    const dilemma = dilemmas.find(d => d.id === decision.dilemmaId);
    const option = dilemma?.options.find(o => o.id === decision.optionId);
    
    if (option?.riskLevel === 'high') highRiskCount++;
    else if (option?.riskLevel === 'low') lowRiskCount++;
    else mediumRiskCount++;
  });
  
  const totalDecisions = decisions.length;
  const highRiskRatio = highRiskCount / totalDecisions;
  const lowRiskRatio = lowRiskCount / totalDecisions;
  const mediumRiskRatio = mediumRiskCount / totalDecisions;
  
  // Determine profile based on risk patterns and decision patterns
  if (highRiskRatio >= 0.7) return 'visionary'; // Very high risk tolerance
  if (highRiskRatio >= 0.5 && mediumRiskRatio >= 0.3) return 'innovator'; // High risk with balance
  if (mediumRiskRatio >= 0.6 && highRiskRatio >= 0.3) return 'sales'; // Medium-high risk
  if (mediumRiskRatio >= 0.5 && lowRiskRatio >= 0.3) return 'operational'; // Balanced-medium
  if (lowRiskRatio >= 0.7) return 'conservative'; // Very low risk tolerance
  return 'strategist'; // Default to strategist for remaining patterns
};

export const assignBadges = (profile: UserProfile): Badge[] => {
  const badges: Badge[] = [];
  
  // Badge por perfil
  if (profile.profileType === 'innovator') {
    badges.push({
      id: 'innovator',
      name: 'Inovador',
      description: 'Tomou decisões inovadoras e arriscadas',
      icon: '🚀',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'strategist') {
    badges.push({
      id: 'strategist',
      name: 'Estrategista',
      description: 'Priorizou segurança e estabilidade',
      icon: '🎯',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'operational') {
    badges.push({
      id: 'operational',
      name: 'Operacional',
      description: 'Tomou decisões equilibradas e práticas',
      icon: '⚙️',
      color: '#F9C300'
    });
  } else if (profile.profileType === 'sales') {
    badges.push({
      id: 'sales',
      name: 'Vendedor',
      description: 'Tomou decisões orientadas a vendas',
      icon: '💼',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'visionary') {
    badges.push({
      id: 'visionary',
      name: 'Visionário',
      description: 'Tomou decisões ousadas e visionárias',
      icon: '🌟',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'conservative') {
    badges.push({
      id: 'conservative',
      name: 'Conservador',
      description: 'Priorizou segurança e ROI garantido',
      icon: '🛡️',
      color: '#F9C300'
    });
  } else {
    badges.push({
      id: 'balanced',
      name: 'Equilibrista',
      description: 'Encontrou o equilíbrio perfeito',
      icon: '⚖️',
      color: '#F9C300'
    });
  }
  
  // Badge por pontuação
  if (profile.totalScore >= 200) {
    badges.push({
      id: 'high-performer',
      name: 'Alto Desempenho',
      description: 'Alcançou pontuação excepcional',
      icon: '⭐',
      color: '#F9C300'
    });
  }
  
  // Badge por velocidade
  const averageTime = profile.decisions.reduce((acc, d) => acc + d.timeSpent, 0) / profile.decisions.length;
  if (averageTime < 25) {
    badges.push({
      id: 'quick-thinker',
      name: 'Decisão Rápida',
      description: 'Tomou decisões com agilidade',
      icon: '⚡',
      color: '#0051A3'
    });
  }
  
  // Badge por consistência
  const automaticDecisions = profile.decisions.filter(d => d.wasAutomatic).length;
  if (automaticDecisions === 0) {
    badges.push({
      id: 'consistent',
      name: 'Sempre Presente',
      description: 'Tomou todas as decisões no tempo',
      icon: '🎯',
      color: '#F9C300'
    });
  }
  
  return badges;
};

export const saveToLeaderboard = async (profile: UserProfile) => {
  try {
    // Verificar se o email já existe
    const { data: existingProfile } = await supabase
      .from('simulation_profiles')
      .select('id')
      .eq('email', profile.email)
      .single();

    if (existingProfile) {
      // Atualizar o perfil existente
      const profileDataToUpdate: any = {
        name: profile.name,
        whatsapp: profile.whatsapp,
        total_score: profile.totalScore,
        profile_type: profile.profileType,
        badges: JSON.stringify(profile.badges),
        completed_at: profile.completedAt?.toISOString()
      };
      
      // Adicionar campos opcionais se fornecidos
      if (profile.cnpj) profileDataToUpdate.cnpj = profile.cnpj;
      if (profile.empresa) profileDataToUpdate.empresa = profile.empresa;
      if (profile.cargo) profileDataToUpdate.cargo = profile.cargo;

      const { data: profileData, error: updateError } = await supabase
        .from('simulation_profiles')
        .update(profileDataToUpdate)
        .eq('email', profile.email)
        .select()
        .single();

      if (updateError) throw updateError;

      // Remover decisões antigas e inserir novas
      if (profile.decisions.length > 0 && profileData) {
        await supabase
          .from('simulation_decisions')
          .delete()
          .eq('profile_id', profileData.id);

        const decisionsToInsert = profile.decisions.map(decision => ({
          profile_id: profileData.id,
          dilemma_id: decision.dilemmaId,
          option_id: decision.optionId,
          time_spent: decision.timeSpent,
          was_automatic: decision.wasAutomatic
        }));

        const { error: decisionsError } = await supabase
          .from('simulation_decisions')
          .insert(decisionsToInsert);

        if (decisionsError) throw decisionsError;
      }

      return await getLeaderboard();
    }

    // Inserir novo perfil
    const profileDataToInsert: any = {
      name: profile.name,
      email: profile.email,
      whatsapp: profile.whatsapp,
      total_score: profile.totalScore,
      profile_type: profile.profileType,
      badges: JSON.stringify(profile.badges),
      completed_at: profile.completedAt?.toISOString()
    };
    
    // Adicionar campos opcionais se fornecidos
    if (profile.cnpj) profileDataToInsert.cnpj = profile.cnpj;
    if (profile.empresa) profileDataToInsert.empresa = profile.empresa;
    if (profile.cargo) profileDataToInsert.cargo = profile.cargo;

    const { data: profileData, error: profileError } = await supabase
      .from('simulation_profiles')
      .insert(profileDataToInsert)
      .select()
      .single();

    if (profileError) throw profileError;

    // Depois, inserir as decisões
    if (profile.decisions.length > 0 && profileData) {
      const decisionsToInsert = profile.decisions.map(decision => ({
        profile_id: profileData.id,
        dilemma_id: decision.dilemmaId,
        option_id: decision.optionId,
        time_spent: decision.timeSpent,
        was_automatic: decision.wasAutomatic
      }));

      const { error: decisionsError } = await supabase
        .from('simulation_decisions')
        .insert(decisionsToInsert);

      if (decisionsError) throw decisionsError;
    }

    // Retornar o leaderboard atualizado
    return await getLeaderboard();
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
    // Fallback para localStorage em caso de erro
    return saveToLocalStorage(profile);
  }
};

// Função de fallback para localStorage
const saveToLocalStorage = (profile: UserProfile) => {
  const leaderboardKey = 'inci-simulation-leaderboard';
  const existingData = localStorage.getItem(leaderboardKey);
  const leaderboard: LeaderboardEntry[] = existingData ? JSON.parse(existingData) : [];
  
  // Remove entrada anterior do mesmo usuário (por email)
  const filteredLeaderboard = leaderboard.filter(entry => entry.id !== profile.email);
  
  const newEntry: LeaderboardEntry = {
    id: profile.email,
    name: profile.name,
    whatsapp: profile.whatsapp,
    cnpj: profile.cnpj,
    empresa: profile.empresa,
    cargo: profile.cargo,
    score: profile.totalScore,
    profileType: profile.profileType,
    badges: profile.badges,
    timestamp: new Date()
  };
  
  filteredLeaderboard.push(newEntry);
  
  // Manter apenas os 50 melhores
  const sortedLeaderboard = filteredLeaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  
  localStorage.setItem(leaderboardKey, JSON.stringify(sortedLeaderboard));
  
  return sortedLeaderboard;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(50);

    if (error) throw error;

    return profiles?.map(profile => ({
      id: profile.email,
      name: profile.name,
      whatsapp: profile.whatsapp,
      cnpj: profile.cnpj,
      empresa: profile.empresa,
      cargo: profile.cargo,
      score: profile.total_score,
      profileType: profile.profile_type as 'innovator' | 'strategist' | 'balanced',
      badges: typeof profile.badges === 'string' ? JSON.parse(profile.badges) : (profile.badges || []),
      timestamp: new Date(profile.completed_at)
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar leaderboard do Supabase:', error);
    // Fallback para localStorage
    return getLocalStorageLeaderboard();
  }
};

// Função de fallback para localStorage
const getLocalStorageLeaderboard = (): LeaderboardEntry[] => {
  const leaderboardKey = 'inci-simulation-leaderboard';
  const existingData = localStorage.getItem(leaderboardKey);
  
  if (!existingData) return [];
  
  const leaderboard: LeaderboardEntry[] = JSON.parse(existingData);
  return leaderboard.sort((a, b) => b.score - a.score);
};

export const clearLeaderboard = async () => {
  try {
    console.log('Iniciando limpeza do leaderboard...');
    
    // Limpar dados do Supabase
    const { error: profilesError } = await supabase
      .from('simulation_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (profilesError) {
      console.error('Erro ao limpar simulation_profiles:', profilesError);
      throw profilesError;
    }
    
    console.log('Leaderboard limpo do Supabase com sucesso');
    
    // Limpar localStorage como fallback
    const leaderboardKey = 'inci-simulation-leaderboard';
    localStorage.removeItem(leaderboardKey);
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar leaderboard do Supabase:', error);
    
    // Fallback: limpar apenas localStorage se Supabase falhar
    const leaderboardKey = 'inci-simulation-leaderboard';
    localStorage.removeItem(leaderboardKey);
    console.log('Leaderboard limpo do localStorage (fallback)');
    
    return false;
  }
};

export const downloadLeaderboardCSV = (entries: LeaderboardEntry[]) => {
  const headers = [
    'Posição',
    'Nome',
    'Email',
    'WhatsApp',
    'CNPJ',
    'Empresa',
    'Cargo',
    'Pontuação',
    'Tipo de Perfil',
    'Data de Participação',
    'Hora de Participação',
    'Badges'
  ];
  
  const csvData = entries
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => {
      const position = index + 1;
      const date = new Date(entry.timestamp);
      const profileTypeLabel = 
        entry.profileType === 'innovator' ? 'Inovador' :
        entry.profileType === 'strategist' ? 'Estrategista' :
        'Equilibrado';
      
      return [
        position,
        entry.name,
        entry.id, // usando ID como email
        entry.whatsapp,
        entry.cnpj || '',
        entry.empresa || '',
        entry.cargo || '',
        entry.score,
        profileTypeLabel,
        date.toLocaleDateString('pt-BR'),
        date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        entry.badges.map(badge => badge.name).join('; ')
      ];
    });
  
  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ranking_inci_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};