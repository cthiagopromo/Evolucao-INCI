// Script para verificar e aplicar as correções das recomendações INCI
// Execute este script no console do navegador

console.log('=== APLICANDO CORREÇÕES DAS RECOMENDAÇÕES INCI ===');

// Função para forçar atualização do leaderboard
async function atualizarLeaderboard() {
  console.log('Atualizando leaderboard...');
  
  try {
    // Forçar reload do leaderboard
    if (window.updateLeaderboard) {
      await window.updateLeaderboard();
      console.log('Leaderboard atualizado');
    } else {
      console.log('Função updateLeaderboard não encontrada, recarregando...');
      
      // Recarregar a página se necessário
      // location.reload();
    }
  } catch (error) {
    console.error('Erro ao atualizar leaderboard:', error);
  }
}

// Função para testar recomendações com o primeiro perfil
async function testarPrimeiroPerfil() {
  console.log('Buscando primeiro perfil...');
  
  try {
    // Buscar perfil com maior score
    const { data: profile } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(1)
      .single();
    
    if (!profile) {
      console.log('Nenhum perfil encontrado');
      return;
    }
    
    console.log('Perfil encontrado:', profile.name, profile.profile_type, profile.total_score);
    
    // Buscar decisões
    const { data: decisions } = await supabase
      .from('simulation_decisions')
      .select('*')
      .eq('profile_id', profile.id);
    
    // Criar objeto para teste
    const testProfile = {
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
    
    console.log('Testando generateRecommendations...');
    const recommendations = generateRecommendations(testProfile);
    console.log('Recomendações geradas:', recommendations);
    
    return { profile, recommendations };
    
  } catch (error) {
    console.error('Erro ao testar perfil:', error);
  }
}

// Função para simular click no ranking com recomendações
async function simularClickComRecomendacoes() {
  console.log('=== SIMULANDO CLICK COM RECOMENDAÇÕES ===');
  
  const resultado = await testarPrimeiroPerfil();
  
  if (!resultado) return;
  
  const { profile, recommendations } = resultado;
  
  // Simular o que acontece no handleViewProfileFromRanking
  console.log('Simulando handleViewProfileFromRanking...');
  
  // Verificar se a função existe no escopo global
  if (typeof handleViewProfileFromRanking === 'function') {
    console.log('handleViewProfileFromRanking encontrada, executando...');
    
    // Criar entrada do leaderboard
    const entry = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      whatsapp: profile.whatsapp,
      score: profile.total_score,
      profileType: profile.profile_type,
      badges: profile.badges || [],
      timestamp: new Date(profile.completed_at || profile.created_at)
    };
    
    handleViewProfileFromRanking(entry);
    console.log('handleViewProfileFromRanking executado com sucesso');
    
  } else {
    console.log('handleViewProfileFromRanking não encontrada, criando manualmente...');
    
    // Simular a criação do perfil com recomendações
    const profileWithRecommendations = {
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      whatsapp: profile.whatsapp || '',
      decisions: resultado.profile.decisions || [],
      totalScore: profile.total_score,
      profileType: profile.profile_type,
      badges: profile.badges || [],
      completedAt: new Date(profile.completed_at || profile.created_at),
      recommendations: recommendations
    };
    
    console.log('Perfil com recomendações:', profileWithRecommendations);
    
    // Verificar se pode setar no estado global
    if (window.setViewingProfile) {
      window.setViewingProfile(profileWithRecommendations);
      console.log('Perfil setado no estado global');
    }
  }
}

// Executar tudo
async function executarVerificacao() {
  console.log('Iniciando verificação completa...');
  
  await testarPrimeiroPerfil();
  await simularClickComRecomendacoes();
  
  console.log('=== VERIFICAÇÃO CONCLUÍDA ===');
  console.log('Agora clique em algum participante no ranking para ver as recomendações INCI');
}

// Comandos disponíveis
console.log('Comandos disponíveis:');
console.log('executarVerificacao() - Executa verificação completa');
console.log('testarPrimeiroPerfil() - Testa recomendações do primeiro perfil');
console.log('simularClickComRecomendacoes() - Simula click no ranking');

// Auto-executar após 1 segundo
setTimeout(() => {
  console.log('Executando verificação automática...');
  executarVerificacao();
}, 1000);