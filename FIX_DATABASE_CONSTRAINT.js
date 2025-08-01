// Script para verificar e corrigir a constraint do banco de dados
// Execute este script no console do navegador

console.log('=== VERIFICANDO CONSTRAINT DO BANCO ===');

async function checkDatabaseConstraint() {
  console.log('Verificando constraint da tabela simulation_profiles...');
  
  try {
    // Buscar informações sobre a constraint
    const { data, error } = await supabase
      .from('information_schema')
      .select('check_clause')
      .eq('table_name', 'simulation_profiles')
      .eq('constraint_name', 'simulation_profiles_profile_type_check');
    
    if (error) {
      console.error('Erro ao buscar constraint:', error);
    } else {
      console.log('Constraint encontrada:', data);
    }
    
    // Tentar inserir um perfil com tipo visionary para teste
    const testProfile = {
      name: 'Teste Visionary',
      email: 'teste@visionary.com',
      whatsapp: '',
      total_score: 100,
      profile_type: 'visionary',
      badges: [],
      completed_at: new Date().toISOString()
    };
    
    console.log('Testando inserção com profile_type: visionary');
    const { error: insertError } = await supabase
      .from('simulation_profiles')
      .insert(testProfile);
    
    if (insertError) {
      console.error('Erro ao inserir perfil visionary:', insertError);
      console.log('Mensagem:', insertError.message);
      console.log('Detalhes:', insertError.details);
    } else {
      console.log('✅ Inserção bem-sucedida! O tipo visionary é válido.');
      
      // Limpar perfil de teste
      await supabase
        .from('simulation_profiles')
        .delete()
        .eq('email', 'teste@visionary.com');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

async function getValidProfileTypes() {
  console.log('Buscando tipos de perfil válidos...');
  
  try {
    // Buscar todos os perfis existentes para ver os tipos válidos
    const { data, error } = await supabase
      .from('simulation_profiles')
      .select('profile_type')
      .order('profile_type');
    
    if (error) {
      console.error('Erro ao buscar tipos:', error);
    } else {
      const uniqueTypes = [...new Set(data.map(p => p.profile_type))];
      console.log('Tipos de perfil encontrados no banco:', uniqueTypes);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar verificações
console.log('Executando verificações do banco de dados...');
checkDatabaseConstraint();
getValidProfileTypes();