// Script para testar as recomendações INCI
// Execute este script no console do navegador (F12 -> Console)

console.log('=== TESTANDO RECOMENDAÇÕES INCI ===');

// Função para testar recomendações com dados reais
async function testarRecomendacoes() {
  console.log('Iniciando teste de recomendações...');
  
  try {
    // Buscar alguns participantes do leaderboard
    const { data: profiles } = await supabase
      .from('simulation_profiles')
      .select('*')
      .limit(5)
      .order('total_score', { ascending: false });
    
    if (!profiles || profiles.length === 0) {
      console.log('Nenhum perfil encontrado');
      return;
    }
    
    console.log(`Encontrados ${profiles.length} perfis para testar`);
    
    // Testar recomendações para cada perfil
    for (const profile of profiles) {
      console.log(`\n=== Testando ${profile.name} (${profile.profile_type}) ===`);
      
      // Buscar decisões do perfil
      const { data: decisions } = await supabase
        .from('simulation_decisions')
        .select('*')
        .eq('profile_id', profile.id);
      
      // Criar objeto compatível com generateRecommendations
      const userProfile = {
        name: profile.name,
        totalScore: profile.total_score,
        profileType: profile.profile_type,
        completedAt: new Date(profile.completed_at || profile.created_at),
        decisions: (decisions || []).map(d => ({
          dilemmaId: d.dilemma_id,
          optionId: d.option_id,
          timeSpent: d.time_spent,
          wasAutomatic: d.was_automatic
        }))
      };
      
      // Gerar recomendações
      const recommendations = generateRecommendations(userProfile);
      console.log(`Recomendações para ${profile.name}:`, recommendations);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Função para simular click no ranking e verificar recomendações
async function simularClickRanking() {
  console.log('=== SIMULANDO CLICK NO RANKING ===');
  
  try {
    // Buscar primeiro participante
    const { data: profiles } = await supabase
      .from('simulation_profiles')
      .select('*')
      .limit(1)
      .order('total_score', { ascending: false });
    
    if (!profiles || profiles.length === 0) {
      console.log('Nenhum perfil encontrado');
      return;
    }
    
    const profile = profiles[0];
    console.log(`Simulando click em: ${profile.name}`);
    
    // Buscar decisões
    const { data: decisions } = await supabase
      .from('simulation_decisions')
      .select('*')
      .eq('profile_id', profile.id);
    
    // Criar entrada do leaderboard
    const entry = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      whatsapp: profile.whatsapp,
      score: profile.total_score,
      profileType: profile.profile_type,
      badges: profile.badges || [],
      timestamp: new Date(profile.completed_at || profile.created_at),
      decisions: (decisions || []).map(d => ({
        dilemmaId: d.dilemma_id,
        optionId: d.option_id,
        timeSpent: d.time_spent,
        wasAutomatic: d.was_automatic
      }))
    };
    
    console.log('Entry do leaderboard:', entry);
    
    // Simular a chamada que será feita no handleViewProfileFromRanking
    const profileView = {
      id: entry.id,
      name: entry.name,
      email: entry.email || '',
      whatsapp: entry.whatsapp || '',
      decisions: entry.decisions || [],
      totalScore: entry.score,
      profileType: entry.profileType,
      badges: entry.badges || [],
      completedAt: new Date(entry.timestamp),
      recommendations: generateRecommendations({
        name: entry.name,
        totalScore: entry.score,
        profileType: entry.profileType,
        completedAt: new Date(entry.timestamp),
        decisions: entry.decisions || []
      })
    };
    
    console.log('Perfil para visualização:', profileView);
    console.log('Recomendações:', profileView.recommendations);
    
  } catch (error) {
    console.error('Erro na simulação:', error);
  }
}

// Função para verificar se a função está disponível
function verificarFuncao() {
  console.log('=== VERIFICANDO FUNÇÃO ===');
  console.log('generateRecommendations disponível:', typeof generateRecommendations);
  
  if (typeof generateRecommendations === 'function') {
    const teste = {
      name: 'Teste',
      totalScore: 150,
      profileType: 'strategist',
      completedAt: new Date(),
      decisions: []
    };
    
    const result = generateRecommendations(teste);
    console.log('Teste simples:', result);
  }
}

// Comandos disponíveis:
console.log('=== COMANDOS DISPONÍVEIS ===');
console.log('testarRecomendacoes() - Testa recomendações com dados reais');
console.log('simularClickRanking() - Simula click no ranking');
console.log('verificarFuncao() - Verifica se generateRecommendations está disponível');

// Executar verificação
verificarFuncao();