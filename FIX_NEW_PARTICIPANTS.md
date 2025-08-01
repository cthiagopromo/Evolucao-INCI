# 🚨 Guia: Novos Participantes Não Aparecem no Ranking

## Problema Identificado
Novos participantes não estão aparecendo no ranking após completarem a simulação.

## Passos para Diagnóstico

### 1. Teste Imediato no Console
Abra o console do navegador (F12) e execute:

```javascript
// Testar conexão e buscar todos os participantes
import { debugDatabase, getLeaderboard } from '@/utils/simulation';

// Testar conexão
await debugDatabase();

// Buscar ranking atual
const ranking = await getLeaderboard();
console.log('Ranking atual:', ranking);
```

### 2. Verificar Dados no Supabase

Execute estes comandos SQL no painel SQL do Supabase:

```sql
-- Verificar todos os participantes
SELECT 
    id, 
    name, 
    email, 
    total_score, 
    profile_type, 
    completed_at,
    created_at,
    whatsapp
FROM simulation_profiles 
ORDER BY created_at DESC;

-- Verificar participantes sem completed_at
SELECT 
    id, 
    name, 
    email, 
    total_score,
    completed_at
FROM simulation_profiles 
WHERE completed_at IS NULL;

-- Verificar quantidade total
SELECT COUNT(*) as total_participantes FROM simulation_profiles;

-- Verificar últimos 5 participantes
SELECT * FROM simulation_profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

### 3. Verificar RLS (Row Level Security)

```sql
-- Verificar políticas ativas
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'simulation_profiles';

-- Verificar se políticas estão permitindo SELECT
SELECT rolname, polname, polcmd FROM pg_policy pol JOIN pg_class pc ON pol.polrelid = pc.oid JOIN pg_roles pr ON pol.polroles @> ARRAY[pr.oid] WHERE pc.relname = 'simulation_profiles';
```

### 4. Fix RLS Policies (se necessário)

Execute estes comandos se houver problemas de permissão:

```sql
-- Permitir SELECT público para simulation_profiles
CREATE POLICY "Permitir leitura pública de participantes" ON simulation_profiles
    FOR SELECT USING (true);

-- Permitir SELECT público para simulation_decisions
CREATE POLICY "Permitir leitura pública de decisões" ON simulation_decisions
    FOR SELECT USING (true);
```

### 5. Verificar Campos Obrigatórios

```sql
-- Verificar campos nulos que podem causar problemas
SELECT 
    'total_score null' as issue,
    COUNT(*) as quantidade
FROM simulation_profiles 
WHERE total_score IS NULL

UNION ALL

SELECT 
    'completed_at null' as issue,
    COUNT(*) as quantidade
FROM simulation_profiles 
WHERE completed_at IS NULL

UNION ALL

SELECT 
    'name null' as issue,
    COUNT(*) as quantidade
FROM simulation_profiles 
WHERE name IS NULL OR name = '';
```

### 6. Testar Inserção Manual

```sql
-- Inserir participante de teste
INSERT INTO simulation_profiles (
    id, 
    name, 
    email, 
    whatsapp, 
    total_score, 
    profile_type, 
    badges,
    completed_at,
    created_at
) VALUES (
    gen_random_uuid(),
    'Teste Participante',
    'teste@example.com',
    '11999999999',
    150,
    'balanced',
    '[{"id": "badge-1", "name": "Iniciante", "icon": "🎯"}]',
    NOW(),
    NOW()
);

-- Verificar se aparece na consulta
SELECT * FROM simulation_profiles WHERE email = 'teste@example.com';
```

### 7. Limpar Cache e Recarregar

No console do navegador:

```javascript
// Limpar cache e recarregar ranking
localStorage.removeItem('leaderboard_cache');
window.location.reload();

// Ou recarregar manualmente
await getLeaderboard();
```

### 8. Verificar Logs do Console

Abra o console (F12) e verifique:
- `Total de perfis na base de dados: X` (deve ser > 0)
- `Perfis carregados: X` (deve ser > 0)
- `Leaderboard final processado: X entradas` (deve ser > 0)
- Erros de JavaScript ou React

### 9. Verificar Tipos de Perfil Válidos

```sql
-- Verificar valores únicos de profile_type
SELECT DISTINCT profile_type, COUNT(*) as quantidade 
FROM simulation_profiles 
GROUP BY profile_type;

-- Corrigir tipos inválidos
UPDATE simulation_profiles 
SET profile_type = 'balanced' 
WHERE profile_type NOT IN ('innovator', 'strategist', 'balanced', 'operational', 'visionary', 'conservative');
```

### 10. Testar com Dados Reais

Execute este script completo no console:

```javascript
// Script de teste completo
console.log('=== TESTE DE NOVOS PARTICIPANTES ===');

// 1. Verificar conexão
const { data: connectionTest } = await supabase.from('simulation_profiles').select('*').limit(1);
console.log('Conexão OK:', !!connectionTest);

// 2. Contar participantes
const { count } = await supabase.from('simulation_profiles').select('*', { count: 'exact' });
console.log('Total de participantes:', count?.count || 0);

// 3. Buscar últimos participantes
const { data: recent } = await supabase
    .from('simulation_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

console.log('Últimos participantes:', recent);

// 4. Testar ranking
const ranking = await getLeaderboard();
console.log('Ranking carregado:', ranking.length, 'participantes');
```

## Solução Rápida

Se os participantes existem no banco mas não aparecem no ranking:

1. **Execute a correção de RLS** (passo 4)
2. **Verifique campos nulos** (passo 5)
3. **Recarregue a página** (F5)
4. **Teste com o participante manual** (passo 6)

## Contato para Suporte

Se o problema persistir após seguir todos os passos:
1. Tire screenshots dos logs do console
2. Execute os comandos SQL e salve os resultados
3. Verifique o arquivo `DEBUG_LEADERBOARD.md` para mais instruções