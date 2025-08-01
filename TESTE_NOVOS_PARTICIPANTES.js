// Script de teste completo para novos participantes
// Execute este código no console do navegador para verificar se novos participantes aparecem no ranking

window.testarNovosParticipantes = async () => {
  console.log('🧪 TESTANDO NOVOS PARTICIPANTES NO RANKING');
  
  try {
    // 1. Importar funções necessárias
    const { getLeaderboard, saveToLeaderboard } = await import('/src/utils/simulation.ts');
    const supabase = window.supabase || (await import('/src/integrations/supabase/client')).supabase;
    
    // 2. Verificar estado atual
    console.log('📊 Estado atual do banco:');
    const { count: totalCount, error: countError } = await supabase
      .from('simulation_profiles')
      .select('*', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Erro ao contar perfis:', countError);
      return;
    }
    
    console.log(`📈 Total de participantes no banco: ${totalCount?.count || 0}`);
    
    // 3. Buscar leaderboard atual
    console.log('🏆 Buscando leaderboard...');
    const leaderboardAtual = await getLeaderboard();
    console.log(`📋 Entradas no leaderboard: ${leaderboardAtual.length}`);
    
    // 4. Criar participante de teste
    console.log('🎯 Criando participante de teste...');
    const participanteTeste = {
      name: `Teste-${Date.now()}`,
      email: `teste-${Date.now()}@exemplo.com`,
      whatsapp: '11999999999',
      totalScore: 250,
      profileType: 'strategist',
      badges: [{ id: 'teste', name: 'Teste', icon: '🧪' }],
      completedAt: new Date(),
      decisions: [
        { dilemmaId: 'd1', optionId: 'o1', timeSpent: 30, wasAutomatic: false },
        { dilemmaId: 'd2', optionId: 'o2', timeSpent: 45, wasAutomatic: false }
      ]
    };
    
    // 5. Salvar participante
    console.log('💾 Salvando participante...');
    const resultado = await saveToLeaderboard(participanteTeste);
    
    if (resultado.success) {
      console.log('✅ Participante salvo com sucesso!');
      console.log('ID gerado:', resultado.profileId);
    } else {
      console.error('❌ Erro ao salvar:', resultado.error);
      return;
    }
    
    // 6. Aguardar e verificar novo leaderboard
    console.log('⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔄 Verificando novo leaderboard...');
    const novoLeaderboard = await getLeaderboard();
    console.log(`📊 Novo total no leaderboard: ${novoLeaderboard.length}`);
    
    // 7. Verificar se o participante aparece
    const participanteEncontrado = novoLeaderboard.find(p => 
      p.name === participanteTeste.name || p.email === participanteTeste.email
    );
    
    if (participanteEncontrado) {
      console.log('🎉 SUCESSO! Novo participante aparece no ranking:');
      console.log(`   Nome: ${participanteEncontrado.name}`);
      console.log(`   Score: ${participanteEncontrado.score}`);
      console.log(`   Posição: ${novoLeaderboard.indexOf(participanteEncontrado) + 1}`);
    } else {
      console.log('⚠️  Participante não encontrado no ranking');
      
      // 8. Debug adicional
      console.log('🔍 Debug adicional:');
      const { data: perfisRecentes } = await supabase
        .from('simulation_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      console.log('Últimos 5 perfis:', perfisRecentes);
    }
    
    // 9. Limpar cache e recarregar
    console.log('🧹 Limpando cache...');
    localStorage.removeItem('leaderboard_cache');
    
    // 10. Resultado final
    console.log('📋 RESULTADO FINAL:');
    console.log(`   Participantes antes: ${leaderboardAtual.length}`);
    console.log(`   Participantes depois: ${novoLeaderboard.length}`);
    console.log(`   Diferença: ${novoLeaderboard.length - leaderboardAtual.length}`);
    
    return {
      sucesso: !!participanteEncontrado,
      participantesAntes: leaderboardAtual.length,
      participantesDepois: novoLeaderboard.length,
      participanteTeste: participanteTeste.name
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return { sucesso: false, erro: error.message };
  }
};

// Função para verificar RLS
window.verificarRLS = async () => {
  console.log('🔒 Verificando políticas RLS...');
  
  try {
    const supabase = window.supabase || (await import('/src/integrations/supabase/client')).supabase;
    
    // Verificar políticas
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'simulation_profiles');
    
    console.log('Políticas encontradas:', policies);
    
    // Testar SELECT como anon
    const { data: testData, error: testError } = await supabase
      .from('simulation_profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro ao testar SELECT:', testError);
    } else {
      console.log('✅ SELECT funcionando corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar RLS:', error);
  }
};

console.log('🚀 Script de teste carregado!');
console.log('Use: testarNovosParticipantes() ou verificarRLS()');
console.log('Exemplo: await testarNovosParticipantes()');