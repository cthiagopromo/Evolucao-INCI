# Guia de Debug - Erro 400 ao Salvar no Supabase

## 🚨 Problema Identificado
Erro 400 (Bad Request) ao tentar salvar novo perfil no Supabase, com código de erro específico.

## 📊 Análise dos Logs
- Email: `cthiagopromo@gmail.com`
- Profile Type: `sales` ✓ (válido)
- Score: 285 ✓
- Erro: 400 Bad Request

## 🔍 Códigos de Erro PostgreSQL

### Códigos Comuns:
- **23514**: CHECK constraint violation (profile_type inválido)
- **23505**: UNIQUE constraint violation (email duplicado)
- **23502**: NOT NULL constraint violation (campo obrigatório faltando)
- **23503**: FOREIGN KEY constraint violation

## 🛠️ Solução Passo a Passo

### 1. Verificar Estrutura da Tabela
Execute este SQL no Supabase para verificar a estrutura exata:

```sql
-- Verificar estrutura da tabela simulation_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'simulation_profiles'
ORDER BY ordinal_position;

-- Verificar todas as constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'simulation_profiles';

-- Verificar valores válidos de profile_type
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'simulation_profiles'::regclass
AND contype = 'c';
```

### 2. Testar Inserção Manual
Execute este SQL para testar a inserção manual:

```sql
-- Testar inserção com dados do log
INSERT INTO public.simulation_profiles (
    name,
    email,
    whatsapp,
    total_score,
    profile_type,
    badges,
    completed_at
) VALUES (
    'Teste Debug',
    'cthiagopromo@gmail.com',
    '',
    285,
    'sales',
    '[]'::jsonb,
    NOW()
);

-- Verificar se há registros existentes com este email
SELECT * FROM public.simulation_profiles 
WHERE email = 'cthiagopromo@gmail.com';

-- Verificar todos os profile_type válidos
SELECT unnest(enum_range(NULL::enum_profile_type));
```

### 3. Verificar Valores de Profile_type

```sql
-- Verificar se 'sales' é um valor válido
SELECT 'sales' IN ('innovator', 'strategist', 'balanced', 'visionary', 'operational', 'sales', 'conservative') as is_valid;

-- Se usar ENUM, verificar:
SELECT typname, enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE typname LIKE '%profile%';
```

### 4. Debug no Código

Adicione este código temporário para debug:

```typescript
// Adicionar ao arquivo simulation.ts para debug imediato
export const debugDatabase = async () => {
  try {
    // 1. Verificar estrutura
    const { data: structure, error: structError } = await supabase
      .from('simulation_profiles')
      .select('*')
      .limit(1);
    
    console.log('Estrutura exemplo:', structure?.[0]);
    
    // 2. Tentar inserção simples
    const testData = {
      name: 'Teste Debug',
      email: `debug-${Date.now()}@test.com`,
      whatsapp: '11999999999',
      total_score: 100,
      profile_type: 'sales',
      badges: [],
      completed_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('simulation_profiles')
      .insert(testData)
      .select();
    
    console.log('Teste resultado:', { data, error });
    
  } catch (e) {
    console.error('Erro no debug:', e);
  }
};
```

### 5. Verificar Constraints Específicas

```sql
-- Verificar constraints CHECK
SELECT 
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'simulation_profiles'::regclass;

-- Verificar triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.tr