// Script para debugar participantes no ranking
// Execute este script no console do navegador (F12 -> Console)

console.log('=== DEBUG PARTICIPANTS ===');

// Função para verificar todos os participantes no banco
async function debugAllParticipants() {
  console.log('Buscando todos os participantes...');
  
  try {
    // Buscar todos os perfis sem filtros
    const { data: allProfiles, error: profilesError } = await supabase
      .from('simulation_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`Total de perfis encontrados: ${allProfiles?.length || 0}`);
    
    if (allProfiles && allProfiles.length > 0) {
      console.log('=== TODOS OS PERFIS ===');
      allProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.name} (${profile.email})`);
        console.log(`   Score: ${profile.total_score}`);
        console.log(`   Profile Type: ${profile.profile_type}`);
        console.log(`   Completed At: ${profile.completed_at}`);
        console.log(`   Created At: ${profile.created_at}`);
        console.log(`   ID: ${profile.id}`);
        console.log('---');
      });

      // Verificar se há perfis sem completed_at
      const profilesWithoutCompletedAt = allProfiles.filter(p => !p.completed_at);
      console.log(`Perfis sem completed_at: ${profilesWithoutCompletedAt.length}`);
      
      if (profilesWithoutCompletedAt.length > 0) {
        console.log('=== PERFIS SEM COMPLETED_AT ===');
        profilesWithoutCompletedAt.forEach(profile => {
          console.log(`${profile.name} - ${profile.email} - Score: ${profile.total_score}`);
        });
      }

      // Verificar se há perfis com completed_at no futuro
      const now = new Date();
      const profilesWithFutureCompletedAt = allProfiles.filter(p => 
        p.completed_at && new Date(p.completed_at) > now
      );
      console.log(`Perfis com completed_at no futuro: ${profilesWithFutureCompletedAt.length}`);

      // Buscar decisões para cada perfil
      console.log('=== BUSCANDO DECISÕES ===');
      for (const profile of allProfiles) {
        const { data: decisions } = await supabase
          .from('simulation_decisions')
          .select('*')
          .eq('profile_id', profile.id);
        
        console.log(`${profile.name}: ${decisions?.length || 0} decisões`);
      }
    }

  } catch (error) {
    console.error('Erro no debug:', error);
  }
}

// Função para corrigir participantes sem completed_at
async function fixMissingCompletedAt() {
  console.log('Corrigindo participantes sem completed_at...');
  
  try {
    const { data: profilesWithoutCompletedAt } = await supabase
      .from('simulation_profiles')
      .select('*')
      .is('completed_at', null);

    if (profilesWithoutCompletedAt && profilesWithoutCompletedAt.length > 0) {
      console.log(`Encontrados ${profilesWithoutCompletedAt.length} perfis para corrigir`);
      
      for (const profile of profilesWithoutCompletedAt) {
        // Usar created_at ou data atual como fallback
        const completedAt = profile.created_at || new Date().toISOString();
        
        const { error } = await supabase
          .from('simulation_profiles')
          .update({ completed_at: completedAt })
          .eq('id', profile.id);
          
        if (error) {
          console.error(`Erro ao corrigir ${profile.name}:`, error);
        } else {
          console.log(`Corrigido: ${profile.name} - completed_at: ${completedAt}`);
        }
      }
    }
    
    console.log('Correção concluída!');
  } catch (error) {
    console.error('Erro na correção:', error);
  }
}

// Função para verificar RLS policies
async function checkRLSPolicies() {
  console.log('=== VERIFICANDO RLS POLICIES ===');
  
  try {
    // Testar SELECT
    const { data, error } = await supabase
      .from('simulation_profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Erro de RLS no SELECT:', error);
    } else {
      console.log('RLS SELECT: OK');
    }
    
    // Testar INSERT (com dados de teste)
    const testData = {
      name: 'Teste Debug',
      email: `debug-${Date.now()}@teste.com`,
      total_score: 100,
      profile_type: 'balanced',
      completed_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('simulation_profiles')
      .insert(testData);
      
    if (insertError) {
      console.error('Erro de RLS no INSERT:', insertError);
    } else {
      console.log('RLS INSERT: OK');
      // Limpar dados de teste
      await supabase.from('simulation_profiles').delete().eq('email', testData.email);
    }
    
  } catch (error) {
    console.error('Erro ao verificar RLS:', error);
  }
}

// Função principal de debug
async function runDebug() {
  console.log('Iniciando debug completo...');
  
  await debugAllParticipants();
  await checkRLSPolicies();
  
  console.log('=== ATUALIZANDO LEADERBOARD ===');
  const leaderboard = await getLeaderboard();
  console.log('Leaderboard atual:', leaderboard);
}

// Comandos disponíveis no console:
console.log('Comandos disponíveis:');
console.log('- debugAllParticipants(): Ver todos os participantes');
console.log('- fixMissingCompletedAt(): Corrigir participantes sem completed_at');
console.log('- checkRLSPolicies(): Verificar RLS policies');
console.log('- runDebug(): Executar debug completo');

// Executar automaticamente
setTimeout(runDebug, 1000);