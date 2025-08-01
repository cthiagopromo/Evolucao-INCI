// Script de emergência para corrigir o erro de constraint
// Execute este script no console do navegador

console.log('=== CORREÇÃO DE EMERGÊNCIA ===');

// Função para forçar o mapeamento correto de tipos
function forceProfileTypeMapping(profileType) {
  const mapping = {
    'visionary': 'innovator', // Mapear visionary para innovator temporariamente
    'innovator': 'innovator',
    'strategist': 'strategist',
    'balanced': 'balanced',
    'operational': 'operational',
    'conservative': 'conservative',
    'sales': 'strategist' // Mapear sales para strategist
  };
  
  const mapped = mapping[profileType.toLowerCase()] || 'balanced';
  console.log(`Mapeando ${profileType} -> ${mapped}`);
  return mapped;
}

// Função para testar salvamento com mapeamento forçado
async function testSaveWithMapping() {
  console.log('Testando salvamento com mapeamento forçado...');
  
  try {
    // Criar um perfil de teste
    const testProfile = {
      name: 'Teste Emergency',
      email: 'emergency@teste.com',
      whatsapp: '(84) 99999-9999',
      totalScore: 235,
      profileType: forceProfileTypeMapping('visionary'),
      completedAt: new Date(),
      decisions: []
    };
    
    console.log('Perfil com mapeamento:', testProfile);
    
    // Tentar salvar diretamente no Supabase
    const { data, error } = await supabase
      .from('simulation_profiles')
      .insert({
        name: testProfile.name,
        email: testProfile.email,
        whatsapp: testProfile.whatsapp,
        total_score: testProfile.totalScore,
        profile_type: testProfile.profileType,
        badges: [],
        completed_at: testProfile.completedAt.toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Erro ao salvar:', error);
    } else {
      console.log('✅ Salvamento bem-sucedido! ID:', data.id);
      
      // Limpar teste
      await supabase
        .from('simulation_profiles')
        .delete()
        .eq('email', testProfile.email);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Função para aplicar fix temporário no código
function applyEmergencyFix() {
  console.log('Aplicando fix de emergência no código...');
  
  // Sobrescrever a função saveToLeaderboard temporariamente
  if (window.saveToLeaderboard) {
    const originalSave = window.saveToLeaderboard;
    
    window.saveToLeaderboard = async function(profile) {
      console.log('Usando saveToLeaderboard de emergência...');
      
      // Aplicar mapeamento forçado
      const emergencyProfile = {
        ...profile,
        profileType: forceProfileTypeMapping(profile.profileType)
      };
      
      return await originalSave(emergencyProfile);
    };
    
    console.log('✅ Fix de emergência aplicado');
  }
}

// Executar teste
testSaveWithMapping();

// Comandos disponíveis
console.log('Comandos disponíveis:');
console.log('forceProfileTypeMapping("visionary") - Mapeia tipos');
console.log('testSaveWithMapping() - Testa salvamento');
console.log('applyEmergencyFix() - Aplica fix temporário');