// Script para aplicar a correção do erro de constraint
// Execute este script no console do navegador após a atualização

console.log('=== APLICANDO CORREÇÃO DO ERRO DE CONSTRAINT ===');

// Função para testar se o salvamento agora funciona
async function testSaveAfterFix() {
  console.log('Testando salvamento após correção...');
  
  try {
    // Criar um perfil com tipo visionary (que será mapeado para innovator)
    const testProfile = {
      name: 'Matheus Teste',
      email: 'teste-fix@matheus.com',
      whatsapp: '(84) 84004-8005',
      totalScore: 235,
      profileType: 'visionary', // Será mapeado para 'innovator'
      completedAt: new Date(),
      decisions: [
        {
          dilemmaId: 'dilemma-1',
          optionId: 'option-1',
          timeSpent: 25,
          wasAutomatic: false
        }
      ]
    };
    
    console.log('Perfil de teste:', testProfile);
    
    // Testar o saveToLeaderboard corrigido
    if (typeof saveToLeaderboard === 'function') {
      console.log('Executando saveToLeaderboard...');
      const result = await saveToLeaderboard(testProfile);
      console.log('✅ Salvamento bem-sucedido!', result);
      
      // Limpar teste
      await supabase
        .from('simulation_profiles')
        .delete()
        .eq('email', testProfile.email);
        
    } else {
      console.log('Função saveToLeaderboard não encontrada no escopo global');
    }
    
  } catch (error) {
    console.error('❌ Erro ao salvar:', error);
  }
}

// Função para verificar os tipos válidos no banco
async function checkCurrentValidTypes() {
  console.log('Verificando tipos válidos no banco...');
  
  try {
    // Buscar todos os tipos existentes
    const { data, error } = await supabase
      .from('simulation_profiles')
      .select('profile_type')
      .not('profile_type', 'is', null);
    
    if (error) {
      console.error('Erro:', error);
    } else {
      const types = [...new Set(data.map(p => p.profile_type))];
      console.log('Tipos encontrados no banco:', types);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para forçar refresh do leaderboard
async function refreshLeaderboard() {
  console.log('Atualizando leaderboard...');
  
  try {
    if (typeof getLeaderboard === 'function') {
      const leaderboard = await getLeaderboard();
      console.log('Leaderboard atualizado:', leaderboard.length, 'participantes');
    }
  } catch (error) {
    console.error('Erro ao atualizar leaderboard:', error);
  }
}

// Executar verificações
console.log('Executando verificações após correção...');
checkCurrentValidTypes();
testSaveAfterFix();
refreshLeaderboard();

console.log('=== INSTRUÇÕES ===');
console.log('1. Recarregue a página (F5)');
console.log('2. Execute um novo teste da simulação');
console.log('3. As recomendações INCI devem aparecer corretamente');
console.log('4. Use testSaveAfterFix() para testar novamente');