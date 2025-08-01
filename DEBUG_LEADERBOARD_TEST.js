// Script para debug do leaderboard no console do navegador
// Execute este código no console (F12) para verificar o que está acontecendo

window.debugLeaderboard = async () => {
  console.log('=== DEBUG LEADERBOARD ===');
  
  try {
    // Importar função getLeaderboard dinamicamente
    const { getLeaderboard } = await import('/src/utils/simulation.ts');
    
    console.log('1. Buscando dados do leaderboard...');
    const entries = await getLeaderboard();
    
    console.log('2. Total de entradas:', entries.length);
    
    if (entries.length === 0) {
      console.log('3. Nenhuma entrada encontrada!');
      return;
    }
    
    console.log('3. Primeiras 5 entradas:');
    entries.slice(0, 5).forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.name} - ${entry.score} pts`);
      console.log(`      ID: ${entry.id}`);
      console.log(`      ProfileType: ${entry.profileType}`);
      console.log(`      Badges: ${entry.badges?.length || 0}`);
      console.log(`      Timestamp: ${entry.timestamp}`);
    });
    
    // Verificar estrutura dos dados
    console.log('4. Verificando estrutura dos dados:');
    const structureCheck = entries.map(entry => ({
      valid: entry && 
             typeof entry.id === 'string' && 
             typeof entry.name === 'string' && 
             typeof entry.score === 'number',
      hasBadges: Array.isArray(entry.badges),
      hasTimestamp: entry.timestamp !== undefined,
      entryType: typeof entry
    }));
    
    console.table(structureCheck);
    
  } catch (error) {
    console.error('Erro no debug:', error);
  }
};

window.checkSupabaseData = async () => {
  console.log('=== CHECK SUPABASE DATA ===');
  
  try {
    // Verificar diretamente no Supabase
    const supabase = window.supabase || (await import('/src/integrations/supabase/client')).supabase;
    
    console.log('1. Verificando simulation_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      return;
    }
    
    console.log(`2. Encontrados ${profiles?.length || 0} perfis`);
    
    if (profiles && profiles.length > 0) {
      console.log('3. Perfis recentes:');
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name} - ${profile.email}`);
        console.log(`      Score: ${profile.total_score}`);
        console.log(`      Completed: ${profile.completed_at}`);
        console.log(`      Profile Type: ${profile.profile_type}`);
      });
    }
    
    console.log('4. Verificando simulation_decisions...');
    const { data: decisions, error: decisionsError } = await supabase
      .from('simulation_decisions')
      .select('*')
      .limit(5);
    
    if (decisionsError) {
      console.error('Erro ao buscar decisions:', decisionsError);
    } else {
      console.log(`5. Encontradas ${decisions?.length || 0} decisões`);
    }
    
  } catch (error) {
    console.error('Erro ao verificar Supabase:', error);
  }
};

console.log('Funções de debug carregadas!');
console.log('Use: debugLeaderboard() ou checkSupabaseData()');