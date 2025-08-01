// Script para corrigir o leaderboard e garantir que todas as recomendações apareçam
// Execute este script no console do navegador (F12 -> Console)

console.log('=== CORRIGINDO LEADERBOARD E RECOMENDAÇÕES ===');

// Função para verificar e corrigir participantes no leaderboard
async function fixLeaderboard() {
  console.log('Iniciando correção do leaderboard...');
  
  try {
    // 1. Buscar todos os participantes
    const { data: allProfiles, error: profilesError } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('total_score', { ascending: false });

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`Total de perfis encontrados: ${allProfiles?.length || 0}`);
    
    // 2. Verificar e corrigir completed_at
    const profilesToFix = allProfiles.filter(p => !p.completed_at);
    console.log(`Perfis sem completed_at: ${profilesToFix.length}`);
    
    for (const profile of profilesToFix) {
      const fallbackDate = profile.created_at || new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('simulation_profiles')
        .update({ completed_at: fallbackDate })
        .eq('id', profile.id);
        
      if (updateError) {
        console.error(`Erro ao atualizar ${profile.name}:`, updateError);
      } else {
        console.log(`Corrigido completed_at para ${profile.name}: ${fallbackDate}`);
      }
    }

    // 3. Atualizar leaderboard
    console.log('Atualizando leaderboard...');
    const leaderboard = await getLeaderboard();
    console.log(`Leaderboard atualizado com ${leaderboard.length} participantes`);
    
    // 4. Verificar recomendações para cada participante
    console.log('=== VERIFICANDO RECOMENDAÇÕES ===');
    for (const entry of leaderboard.slice(0, 5)) { // Verificar os primeiros 5
      const profile = {
        ...entry,
        totalScore: entry.score,
        profileType: entry.profileType,
        completedAt: entry.timestamp
      };
      
      const recommendations = generateRecommendations(profile);
      console.log(`${entry.name} (${entry.profileType}): ${recommendations.length} recomendações`);
      console.log('Recomendações:', recommendations);
    }

    // 5. Recarregar leaderboard na interface
    console.log('Recarregando leaderboard...');
    window.location.reload();

  } catch (error) {
    console.error('Erro na correção:', error);
  }
}

// Função para testar recomendações individualmente
function testRecommendations() {
  console.log('=== TESTANDO RECOMENDAÇÕES ===');
  
  const testProfiles = [
    { name: 'Teste 1', totalScore: 150, profileType: 'strategist', completedAt: new Date() },
    { name: 'Teste 2', totalScore: 120, profileType: 'innovator', completedAt: new Date() },
    { name: 'Teste 3', totalScore: 100, profileType: 'sales', completedAt: new Date() }
  ];
  
  testProfiles.forEach(profile => {
    const recommendations = generateRecommendations(profile);
    console.log(`${profile.name} (${profile.profileType}):`, recommendations);
  });
}

// Função para debugar visualização de perfil
async function debugProfileView(profileId) {
  console.log(`=== DEBUG VISUALIZAÇÃO PERFIL ${profileId} ===`);
  
  try {
    // Buscar perfil específico
    const { data: profile } = await supabase
      .from('simulation_profiles')
      .select('*')
      .eq('id', profileId)
      .single();
      
    if (profile) {
      console.log('Perfil encontrado:', profile);
      
      // Gerar recomendações
      const userProfile = {
        name: profile.name,
        totalScore: profile.total_score,
        profileType: profile.profile_type,
        completedAt: new Date(profile.completed_at || profile.created_at),
        badges: profile.badges || []
      };
      
      const recommendations = generateRecommendations(userProfile);
      console.log('Recomendações geradas:', recommendations);
      
      // Simular click no perfil
      console.log('Simulando click no perfil...');
      
    } else {
      console.error('Perfil não encontrado');
    }
    
  } catch (error) {
    console.error('Erro no debug:', error);
  }
}

// Comandos disponíveis no console:
console.log('=== COMANDOS DISPONÍVEIS ===');
console.log('fixLeaderboard() - Corrige todos os problemas do leaderboard');
console.log('testRecommendations() - Testa geração de recomendações');
console.log('debugProfileView(id) - Debuga visualização de perfil específico');
console.log('getLeaderboard() - Busca leaderboard atualizado');

// Executar correção automática após 2 segundos
setTimeout(() => {
  console.log('Executando correção automática...');
  fixLeaderboard();
}, 2000);