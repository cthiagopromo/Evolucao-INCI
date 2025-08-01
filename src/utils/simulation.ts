import { UserProfile, UserDecision, Badge, LeaderboardEntry } from '@/types/simulation';
import { dilemmas } from '@/data/dilemmas';
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';

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

export const determineProfileType = (decisions: UserDecision[]): 'innovator' | 'strategist' | 'balanced' | 'visionary' | 'operational' | 'sales' | 'conservative' => {
  let highRiskCount = 0;
  let lowRiskCount = 0;
  let mediumRiskCount = 0;
  let totalTime = 0;
  let automaticDecisions = 0;
  
  decisions.forEach(decision => {
    const dilemma = dilemmas.find(d => d.id === decision.dilemmaId);
    const option = dilemma?.options.find(o => o.id === decision.optionId);
    
    if (option?.riskLevel === 'high') highRiskCount++;
    else if (option?.riskLevel === 'low') lowRiskCount++;
    else mediumRiskCount++;
    
    totalTime += decision.timeSpent;
    if (decision.wasAutomatic) automaticDecisions++;
  });
  
  const totalDecisions = decisions.length;
  const highRiskRatio = highRiskCount / totalDecisions;
  const lowRiskRatio = lowRiskCount / totalDecisions;
  const mediumRiskRatio = mediumRiskCount / totalDecisions;
  const averageTime = totalTime / totalDecisions;
  const automaticRatio = automaticDecisions / totalDecisions;
  
  // Fatores de decisão mais refinados
  const isFastDecision = averageTime < 20;
  const isConsistent = automaticRatio === 0;
  const isRiskAverse = lowRiskRatio > 0.6;
  const isRiskTaker = highRiskRatio > 0.5;
  const isBalanced = mediumRiskRatio >= 0.4 && highRiskRatio <= 0.4 && lowRiskRatio <= 0.4;
  
  // Lógica aprimorada de determinação de perfil - contexto INCI
  if (highRiskRatio >= 0.7 && isConsistent) return 'visionary'; // Visionário ousado - líder INCI
  if (highRiskRatio >= 0.5 && mediumRiskRatio >= 0.3) return 'innovator'; // Inovador - criador de soluções
  if (mediumRiskRatio >= 0.5 && highRiskRatio >= 0.2 && !isRiskAverse) return 'sales'; // Vendedor - foco em crescimento
  if (isBalanced && !isRiskAverse && !isRiskTaker) return 'operational'; // Operacional - execução eficiente
  if (lowRiskRatio >= 0.6 && isConsistent) return 'conservative'; // Conservador - gestão segura
  if (mediumRiskRatio >= 0.4 && lowRiskRatio >= 0.3) return 'strategist'; // Estrategista - planejamento INCI
  
  // Fallback baseado no padrão dominante - contexto INCI
  if (highRiskRatio > mediumRiskRatio && highRiskRatio > lowRiskRatio) return 'innovator';
  if (lowRiskRatio > mediumRiskRatio && lowRiskRatio > highRiskRatio) return 'conservative';
  return 'balanced'; // Equilibrado - perfil padrão INCI
};

export const assignBadges = (profile: UserProfile): Badge[] => {
  const badges: Badge[] = [];
  
  // Badge por perfil - contexto INCI
  if (profile.profileType === 'innovator') {
    badges.push({
      id: 'innovator',
      name: 'Inovador INCI',
      description: 'Criador de soluções disruptivas para transformação digital',
      icon: '🚀',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'strategist') {
    badges.push({
      id: 'strategist',
      name: 'Estrategista INCI',
      description: 'Planejamento estratégico focado em resultados sustentáveis',
      icon: '🎯',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'balanced') {
    badges.push({
      id: 'balanced',
      name: 'Equilibrado INCI',
      description: 'Gestão equilibrada entre inovação e estabilidade operacional',
      icon: '⚖️',
      color: '#F9C300'
    });
  } else if (profile.profileType === 'visionary') {
    badges.push({
      id: 'visionary',
      name: 'Visionário INCI',
      description: 'Líder visionário com capacidade de antecipar tendências',
      icon: '🌟',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'operational') {
    badges.push({
      id: 'operational',
      name: 'Executor INCI',
      description: 'Execução operacional eficiente e orientada a resultados',
      icon: '⚙️',
      color: '#F9C300'
    });
  } else if (profile.profileType === 'sales') {
    badges.push({
      id: 'sales',
      name: 'Growth INCI',
      description: 'Foco em crescimento e expansão de mercado',
      icon: '📈',
      color: '#0051A3'
    });
  } else if (profile.profileType === 'conservative') {
    badges.push({
      id: 'conservative',
      name: 'Conservador INCI',
      description: 'Gestão segura com foco em ROI e mitigação de riscos',
      icon: '🛡️',
      color: '#F9C300'
    });
  }
  
  // Conquistas baseadas em performance
  if (profile.totalScore >= 250) {
    badges.push({
      id: 'top-performer',
      name: 'Top Performer',
      description: 'Alcançou pontuação máxima',
      icon: '🏆',
      color: '#FFD700'
    });
  } else if (profile.totalScore >= 200) {
    badges.push({
      id: 'high-performer',
      name: 'Alto Desempenho',
      description: 'Alcançou pontuação excepcional',
      icon: '⭐',
      color: '#F9C300'
    });
  }
  
  // Conquistas baseadas em velocidade
  const averageTime = profile.decisions.reduce((acc, d) => acc + d.timeSpent, 0) / profile.decisions.length;
  if (averageTime < 15) {
    badges.push({
      id: 'lightning',
      name: 'Raio',
      description: 'Tomou decisões ultra-rápidas',
      icon: '⚡',
      color: '#0051A3'
    });
  } else if (averageTime < 25) {
    badges.push({
      id: 'quick-thinker',
      name: 'Decisão Rápida',
      description: 'Tomou decisões com agilidade',
      icon: '💨',
      color: '#0051A3'
    });
  }
  
  // Conquistas baseadas em consistência
  const automaticDecisions = profile.decisions.filter(d => d.wasAutomatic).length;
  if (automaticDecisions === 0) {
    badges.push({
      id: 'perfect-attendance',
      name: 'Presença Perfeita',
      description: 'Tomou todas as decisões no tempo',
      icon: '🎯',
      color: '#F9C300'
    });
  }
  
  // Conquistas baseadas em padrões de risco
  const highRiskCount = profile.decisions.filter(d => {
    const dilemma = dilemmas.find(di => di.id === d.dilemmaId);
    const option = dilemma?.options.find(o => o.id === d.optionId);
    return option?.riskLevel === 'high';
  }).length;
  
  if (highRiskCount === 0) {
    badges.push({
      id: 'risk-free',
      name: 'Zero Risco',
      description: 'Evitou todas as decisões de alto risco',
      icon: '🛡️',
      color: '#F9C300'
    });
  } else if (highRiskCount >= 5) {
    badges.push({
      id: 'risk-taker',
      name: 'Tomador de Risco',
      description: 'Tomou múltiplas decisões de alto risco',
      icon: '🎲',
      color: '#0051A3'
    });
  }
  
  return badges;
};

export const generateRecommendations = (profile: UserProfile): string[] => {
  const recommendations: string[] = [];
  
  // Log para debug
  console.log('Gerando recomendações para perfil:', profile.profileType, 'Score:', profile.totalScore);
  
  // Recomendações INCI baseadas no perfil
  switch (profile.profileType) {
    case 'strategist':
      recommendations.push(
        'Plataforma INCI de Educação Corporativa - Desenvolva líderes estratégicos em toda organização',
        'Sala de Reunião Sede - Ambiente executivo para decisões estratégicas e reuniões de alta performance',
        'Zamply Eventos - Produza lançamentos e eventos corporativos que marquem posição no mercado'
      );
      break;
    case 'innovator':
      recommendations.push(
        'Plataforma White Label - Monetize seu expertise criando cursos e conteúdos exclusivos',
        'Zamply Produções - Transforme seu conhecimento em materiais educativos de alto impacto',
        'IA para Vendas - Automatize processos e foque na criação de soluções inovadoras'
      );
      break;
    case 'operational':
      recommendations.push(
        'Plataforma INCI de Educação Corporativa - Padronize treinamentos e acelere a capacitação de equipes',
        'Sala Comercial Pátio - Espaço funcional para operações diárias e reuniões operacionais',
        'Zamply Produções - Crie materiais de treinamento consistentes e profissionais'
      );
      break;
    case 'sales':
      recommendations.push(
        'IA para Vendas - Qualifique leads automaticamente e aumente sua taxa de conversão',
        'Plataforma White Label - Desenvolva cursos de vendas e metodologias comerciais próprias',
        'Zamply Eventos - Realize eventos comerciais que geram networking e oportunidades'
      );
      break;
    case 'visionary':
      recommendations.push(
        'Zamply Eventos - Materialize sua visão em eventos memoráveis e transformadores',
        'Plataforma White Label - Escale seu conhecimento e impacte milhares de pessoas',
        'Sala de Reunião Sede - Ambiente inspirador para apresentações que convencem investidores'
      );
      break;
    case 'conservative':
      recommendations.push(
        'Plataforma INCI de Educação Corporativa - Solução consolidada com ROI comprovado',
        'Sala Comercial Pátio - Investimento seguro para testar mercado sem grandes riscos',
        'IA para Vendas - Tecnologia com retorno garantido e resultados mensuráveis'
      );
      break;
    case 'balanced':
      recommendations.push(
        'Plataforma INCI de Educação Corporativa - Desenvolvimento equilibrado para todos os perfis',
        'Zamply Produções - Conteúdo versátil para diferentes abordagens',
        'Sala Comercial Pátio - Espaço adaptável para suas necessidades'
      );
      break;
    default:
      // Fallback para garantir que sempre haja recomendações
      console.warn('Tipo de perfil desconhecido:', profile.profileType);
      recommendations.push(
        'Plataforma INCI de Educação Corporativa - Solução completa para desenvolvimento empresarial',
        'Zamply Produções - Transforme sua expertise em conteúdo de valor',
        'IA para Vendas - Potencialize seus resultados com tecnologia avançada'
      );
      break;
  }
  
  // Recomendações adicionais baseadas no desempenho
  if (profile.totalScore < 100) {
    recommendations.push('Considere revisar sua estratégia de tomada de decisão');
  }
  
  if (profile.decisions.filter(d => d.wasAutomatic).length > 0) {
    recommendations.push('Tente ser mais presente nas decisões futuras');
  }
  
  // Garantir que sempre haja pelo menos uma recomendação
  if (recommendations.length === 0) {
    recommendations.push(
      'Entre em contato com a INCI para uma consultoria personalizada',
      'Explore nossas soluções para maximizar seu potencial empresarial'
    );
  }
  
  console.log('Recomendações geradas:', recommendations);
  return recommendations;
};

export const saveToLeaderboard = async (profile: UserProfile) => {
  console.log('Iniciando salvamento do perfil:', profile);
  console.log('Email do perfil:', profile.email);
  console.log('Total score:', profile.totalScore);
  console.log('Profile type:', profile.profileType);
  console.log('Badges:', profile.badges);
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Supabase client:', supabase);
  
  // Validar dados obrigatórios
  if (!profile.email) {
    throw new Error('Email é obrigatório para salvar no leaderboard');
  }
  if (!profile.name) {
    throw new Error('Nome é obrigatório para salvar no leaderboard');
  }
  
  try {
    // Verificar se o email já existe
    const { data: existingProfiles, error: checkError } = await supabase
      .from('simulation_profiles')
      .select('id')
      .eq('email', profile.email)
      .limit(1);
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar perfil existente:', checkError);
      throw checkError;
    }

    const validProfileTypes = ['innovator', 'strategist', 'balanced', 'operational', 'conservative'];
    const originalProfileType = profile.profileType;
    let sanitizedProfileType = originalProfileType.toLowerCase();
    
    // Mapear tipos para garantir compatibilidade com o banco
    const typeMapping = {
      'visionary': 'innovator', // Mapear visionary para innovator
      'sales': 'strategist',    // Mapear sales para strategist
      'innovator': 'innovator',
      'strategist': 'strategist',
      'balanced': 'balanced',
      'operational': 'operational',
      'conservative': 'conservative'
    };
    
    sanitizedProfileType = typeMapping[sanitizedProfileType] || 'balanced';
    
    if (!validProfileTypes.includes(sanitizedProfileType)) {
      console.warn(`Profile type "${sanitizedProfileType}" inválido, usando "balanced" como padrão`);
      sanitizedProfileType = 'balanced';
    }
    
    console.log('Original profile type:', originalProfileType);
    console.log('Sanitized profile type:', sanitizedProfileType);

    const profileData = {
      name: profile.name,
      email: profile.email,
      whatsapp: profile.whatsapp || '',
      total_score: profile.totalScore,
      profile_type: sanitizedProfileType,
      badges: profile.badges || [],
      completed_at: profile.completedAt ? profile.completedAt.toISOString() : new Date().toISOString()
    };
    
    // Garantir que whatsapp não seja null
    if (profileData.whatsapp === null || profileData.whatsapp === undefined) {
      profileData.whatsapp = '';
    }
    
    // Garantir que é string
    profileData.whatsapp = String(profileData.whatsapp);
    
    // Validar dados antes de enviar
    console.log('Validando dados do perfil:', {
      name: typeof profileData.name,
      email: typeof profileData.email,
      whatsapp: typeof profileData.whatsapp,
      total_score: typeof profileData.total_score,
      profile_type: typeof profileData.profile_type,
      badges: typeof profileData.badges,
      completed_at: typeof profileData.completed_at
    });

    let profileId;

    if (existingProfiles && existingProfiles.length > 0) {
      // Atualizar o perfil existente
      const existingProfile = existingProfiles[0];
      profileId = existingProfile.id;
      
      const { error: updateError } = await supabase
        .from('simulation_profiles')
        .update({
          name: profileData.name,
          whatsapp: profileData.whatsapp,
          total_score: profileData.total_score,
          profile_type: profileData.profile_type,
          badges: profileData.badges,
          completed_at: profileData.completed_at
        })
        .eq('email', profile.email);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw updateError;
      }

      // Atualizar decisões - primeiro limpar as existentes
      const { error: deleteDecisionsError } = await supabase
        .from('simulation_decisions')
        .delete()
        .eq('profile_id', profileId);

      if (deleteDecisionsError) {
        console.error('Erro ao limpar decisões antigas:', deleteDecisionsError);
        throw deleteDecisionsError;
      }
    } else {
      // Criar novo perfil
      console.log('Criando novo perfil com dados:', profileData);
      const { data: newProfile, error: insertError } = await supabase
        .from('simulation_profiles')
        .insert(profileData)
        .select('id')
        .single();

      if (insertError) {
        console.error('Erro ao criar novo perfil:', insertError);
        console.error('Dados do perfil que causaram erro:', profileData);
        
        // Verificar se é erro de constraint único (email duplicado)
        if (insertError.code === '23505') {
          console.warn('Email já existe, tentando atualizar o perfil existente...');
          
          // Atualizar o perfil existente com este email
          const { error: updateError } = await supabase
            .from('simulation_profiles')
            .update({
              name: profileData.name,
              whatsapp: profileData.whatsapp,
              total_score: profileData.total_score,
              profile_type: profileData.profile_type,
              badges: profileData.badges,
              completed_at: profileData.completed_at
            })
            .eq('email', profile.email)
            .select('id')
            .single();

          if (updateError) {
            console.error('Erro ao atualizar perfil existente:', updateError);
            throw updateError;
          }
          
          // Buscar o ID do perfil atualizado
          const { data: existingProfile } = await supabase
            .from('simulation_profiles')
            .select('id')
            .eq('email', profile.email)
            .single();
          
          profileId = existingProfile.id;
        } else {
          throw insertError;
        }
      } else {
        profileId = newProfile.id;
      }
    }

    // Inserir decisões
    if (profile.decisions.length > 0) {
      const decisionsToInsert = profile.decisions.map(decision => ({
        profile_id: profileId,
        dilemma_id: decision.dilemmaId,
        option_id: decision.optionId,
        time_spent: decision.timeSpent,
        was_automatic: decision.wasAutomatic
      }));

      const { error: decisionsError } = await supabase
        .from('simulation_decisions')
        .insert(decisionsToInsert);

      if (decisionsError) {
        console.error('Erro ao salvar decisões:', decisionsError);
        throw decisionsError;
      }
    }

    // Forçar refresh do leaderboard após salvar
    const leaderboard = await getLeaderboard();
    console.log('Leaderboard atualizado após salvar:', leaderboard.length, 'participantes');
    return leaderboard;
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    // Verificar tipos específicos de erro
        if (error.message && error.message.includes('permission denied')) {
          console.warn('Erro de permissão detectado - verifique as políticas RLS no Supabase');
          console.warn('Execute os comandos em RLS_FIX.md para adicionar políticas SELECT/INSERT/UPDATE');
        } else if (error.code === '23514') {
          console.warn('Erro de constraint CHECK - verifique valores de profile_type');
          console.warn('Valor de profile_type enviado:', profileData.profile_type);
        } else if (error.code === '23505') {
          console.warn('Erro de constraint UNIQUE - email já existe');
        } else if (error.code === '23502') {
          console.warn('Erro de NOT NULL - campo obrigatório está faltando');
          console.warn('Verifique se todos os campos obrigatórios estão preenchidos');
        } else if (error.code === '23503') {
          console.warn('Erro de FOREIGN KEY - constraint violada');
        } else {
          console.warn('Erro não identificado:', error.code, error.message);
        }
    
    // Se for erro de "nenhuma linha encontrada" (PGRST116), criar novo perfil
    if ((error as any)?.code === 'PGRST116') {
      console.log('Criando novo perfil no Supabase...');
      
      const validProfileTypes = ['innovator', 'strategist', 'balanced', 'visionary', 'operational', 'sales', 'conservative'];
        const originalProfileType = profile.profileType;
        const sanitizedProfileType = validProfileTypes.includes(originalProfileType.toLowerCase()) 
          ? originalProfileType.toLowerCase() 
          : 'balanced';
        
        console.log('Original profile type (fallback):', originalProfileType);
        console.log('Sanitized profile type (fallback):', sanitizedProfileType);
        
        const profileDataToInsert: any = {
            name: profile.name,
            email: profile.email,
            whatsapp: profile.whatsapp || '',
            total_score: profile.totalScore,
            profile_type: sanitizedProfileType,
            badges: profile.badges || [],
            completed_at: profile.completedAt ? profile.completedAt.toISOString() : new Date().toISOString()
          };
          
          // Garantir que whatsapp não seja null
          if (profileDataToInsert.whatsapp === null || profileDataToInsert.whatsapp === undefined) {
            profileDataToInsert.whatsapp = '';
          }
          profileDataToInsert.whatsapp = String(profileDataToInsert.whatsapp);
          
          console.log('Fallback profile type being sent:', profileDataToInsert.profile_type);

      const { data: newProfile, error: insertError } = await supabase
          .from('simulation_profiles')
          .insert(profileDataToInsert)
          .select()
          .single();

      if (insertError) {
        console.error('Erro ao criar novo perfil:', insertError);
        throw insertError;
      }

      // Inserir decisões
    const decisionsToInsert = profile.decisions.map(decision => ({
      profile_id: newProfile.id,
      dilemma_id: decision.dilemmaId,
      option_id: decision.optionId,
      time_spent: decision.timeSpent,
      was_automatic: decision.wasAutomatic,
      created_at: new Date().toISOString()
    }));

      const { error: decisionsError } = await supabase
        .from('simulation_decisions')
        .insert(decisionsToInsert);

      if (decisionsError) {
        console.error('Erro ao salvar decisões:', decisionsError);
        throw decisionsError;
      }

      return await getLeaderboard();
    }
    
    throw error;
  }
};



// Função para testar conexão com Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('simulation_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erro de conexão com Supabase:', error);
      return false;
    }
    
    console.log('Conexão com Supabase OK:', data);
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  console.log('=== INICIANDO CARREGAMENTO DO LEADERBOARD ===');
  
  try {
    // 1. Verificar se há registros na tabela
    const { count, error: countError } = await supabase
      .from('simulation_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erro ao contar perfis:', countError);
      return [];
    }
    
    console.log(`Total de perfis na base de dados: ${count?.count || 0}`);
    
    // 2. Buscar perfis SEM inner join primeiro (para incluir todos)
    const { data: allProfiles, error: allError } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('total_score', { ascending: false })
      .order('created_at', { ascending: false }) // Usar created_at como fallback quando completed_at não existir
      .limit(1000); // Remover limite para mostrar todos os participantes

    if (allError) {
      console.error('Erro ao carregar perfis:', allError);
      
      // Verificar se é erro de permissão RLS
      if (allError.message && allError.message.includes('permission denied')) {
        console.warn('⚠️ Possível problema com políticas RLS - execute os comandos em RLS_FIX.md');
        console.warn('Erro específico:', allError.message);
      }
      
      return [];
    }

    console.log(`Perfis carregados: ${allProfiles?.length || 0}`);
    
    // 3. Buscar decisões separadamente para cada perfil
    let profiles = allProfiles;
    
    if (allProfiles && allProfiles.length > 0) {
      const profilesWithDecisions = await Promise.all(
        allProfiles.map(async (profile) => {
          const { data: decisions } = await supabase
            .from('simulation_decisions')
            .select('*')
            .eq('profile_id', profile.id);
          
          return {
            ...profile,
            simulation_decisions: decisions || []
          };
        })
      );
      
      profiles = profilesWithDecisions;
    }

    if (!profiles || profiles.length === 0) {
      console.log('Nenhum perfil encontrado no leaderboard');
      return [];
    }

    console.log(`Carregados ${profiles.length} perfis do leaderboard`);
    
    // 3. Verificar perfis recentes
    const { data: recentProfiles } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('Perfis mais recentes:', recentProfiles);
    
    // 4. Processar perfis em entries do leaderboard
    const entries: LeaderboardEntry[] = profiles.map(profile => {
      console.log('Processando perfil:', profile.name, 'email:', profile.email, 'score:', profile.total_score, 'data:', new Date(profile.completed_at).toLocaleString());
      
      // Garantir que todos os campos obrigatórios existem
      const safeProfile = {
        id: profile.id || profile.email || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: profile.name || 'Participante',
        whatsapp: profile.whatsapp || '',
        cnpj: profile.cnpj || undefined,
        empresa: profile.empresa || undefined,
        cargo: profile.cargo || undefined,
        score: Number(profile.total_score) || 0,
        profileType: profile.profile_type || 'balanced',
        badges: (() => {
          try {
            let badges = [];
            if (Array.isArray(profile.badges)) {
              badges = profile.badges;
            } else if (typeof profile.badges === 'string' && profile.badges) {
              badges = JSON.parse(profile.badges);
            } else if (profile.badges) {
              badges = [profile.badges];
            }
            
            // Garantir estrutura válida para cada badge
            return badges.map((badge, index) => ({
              id: badge.id || `badge-${index}`,
              name: badge.name || 'Badge',
              description: badge.description || '',
              icon: badge.icon || '🏆',
              color: badge.color || '#3B82F6'
            }));
          } catch (error) {
            console.warn('Erro ao processar badges:', error, 'Profile:', profile);
            return [];
          }
        })(),
        timestamp: new Date(profile.completed_at || new Date()),
        decisions: profile.simulation_decisions?.map((decision: any) => ({
          dilemmaId: decision.dilemma_id || '',
          optionId: decision.option_id || '',
          timeSpent: Number(decision.time_spent) || 0,
          wasAutomatic: Boolean(decision.was_automatic)
        })) || []
      };
      
      return safeProfile;
    });

    console.log(`Leaderboard final processado: ${entries.length} entradas`);
    entries.forEach((entry, index) => {
      console.log(`#${index + 1}: ${entry.name} - ${entry.score} pts - ${entry.id}`);
    });

    return entries;
  } catch (error) {
    console.error('Erro ao buscar leaderboard:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    // Verificar se é erro de RLS
    if (error.message && error.message.includes('permission denied')) {
      console.warn('Erro de permissão detectado - verifique as políticas RLS no Supabase');
      console.warn('Execute os comandos em RLS_FIX.md para adicionar políticas SELECT');
    }
    
    throw error;
  }
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
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar leaderboard do Supabase:', error);
    throw error;
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

// Função auxiliar para debug do ranking
export const debugLeaderboard = async () => {
  console.log('=== DEBUG DO RANKING ===');
  
  try {
    // Testar conexão
    const connectionOk = await testSupabaseConnection();
    console.log('Conexão OK:', connectionOk);
    
    // Verificar dados
    const { data, error } = await supabase
      .from('simulation_profiles')
      .select('*', { count: 'exact' })
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar dados:', error);
      return { error, data: null };
    }
    
    console.log('Total de registros:', data?.length || 0);
    console.log('Registros encontrados:', data);
    
    return { error: null, data };
  } catch (error) {
    console.error('Erro no debug:', error);
    return { error, data: null };
  }
};

// Função de debug para testar inserção
export const debugDatabase = async () => {
  try {
    console.log('=== DEBUG DATABASE ===');
    
    // 1. Verificar estrutura
    const { data: structure, error: structError } = await supabase
      .from('simulation_profiles')
      .select('*')
      .limit(1);
    
    console.log('Estrutura exemplo:', structure?.[0]);
    console.log('Erro estrutura:', structError);
    
    // 2. Verificar valores válidos de profile_type
    try {
      const { data: profileTypes, error: typeError } = await supabase
        .from('simulation_profiles')
        .select('profile_type')
        .limit(1);
      
      console.log('Tipos de perfil encontrados:', profileTypes);
    } catch (e) {
      console.log('Erro ao verificar tipos:', e);
    }
    
    // 3. Tentar inserção simples com dados válidos
    const testData = {
      name: 'Teste Debug',
      email: `debug-${Date.now()}@test.com`,
      whatsapp: '11999999999',
      total_score: 100,
      profile_type: 'balanced', // Usar valor padrão conhecido
      badges: [],
      completed_at: new Date().toISOString()
    };
    
    console.log('Testando inserção com:', testData);
    
    const { data, error } = await supabase
      .from('simulation_profiles')
      .insert(testData)
      .select();
    
    console.log('Teste resultado:', { data, error });
    
    if (error) {
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    
    return { data, error, testData };
    
  } catch (e) {
    console.error('Erro no debug:', e);
    return { data: null, error: e, testData: null };
  }
};