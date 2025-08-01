# 🔍 Guia de Debug - Novos Participantes Não Aparecem no Ranking

## 🚨 Problema
Novos participantes não estão aparecendo no ranking/leaderboard após completar a simulação.

## 🔧 Soluções Passo a Passo

### 1. **Teste Imediato no Console**
Abra o console do navegador (F12) e execute:

```javascript
// Testar conexão e buscar todos os perfis
await debugDatabase()

// Verificar leaderboard atualizado
await getLeaderboard()

// Testar busca simples de perfis
await debugLeaderboard()
```

### 2. **Verificar RLS Policies**
Execute este SQL no Supabase:

```sql
-- Verificar se RLS está ativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'simulation_profiles';

-- Verificar políticas RLS existentes
SELECT * FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'simulation_profiles';

-- Verificar permissões de SELECT
SELECT has_table_privilege('public', 'simulation_profiles', 'SELECT');
```

### 3. **Verificar Dados no Banco**
```sql
-- Contar total de perfis
SELECT COUNT(*) FROM public.simulation_profiles;

-- Verificar perfis mais recentes
SELECT id, name, email, total_score, profile_type, completed_at 
FROM public.simulation_profiles 
ORDER BY completed_at DESC 
LIMIT 10;

-- Verificar se há perfis sem decisões
SELECT p.id, p.name, p.total_score, COUNT(d.id) as decision_count
FROM public.simulation_profiles p
LEFT JOIN public.simulation_decisions d ON p.id = d.profile_id
GROUP BY p.id, p.name, p.total_score
ORDER BY p.completed_at DESC;
```

### 4. **Debug de Permissões**
```sql
-- Testar SELECT como usuário anônimo
SET ROLE anon;
SELECT * FROM public.simulation_profiles LIMIT 1;

-- Testar SELECT como usuário autenticado
SET ROLE authenticated;
SELECT * FROM public.simulation_profiles LIMIT 1;
```

### 5. **Corrigir RLS Policies**
Se necessário, execute:

```sql
-- Política para SELECT (leitura)
CREATE POLICY "Permitir leitura para todos" ON public.simulation_profiles
FOR SELECT USING (true);

-- Política para simulation_decisions
CREATE POLICY "Permitir leitura para todos" ON public.simulation_decisions
FOR SELECT USING (true);
```

### 6. **Verificar Código**

#### **Problema Comum 1: Inner Join Filtrando**
O uso de `simulation_decisions!inner(*)` pode estar filtrando perfis sem decisões.

#### **Problema Comum 2: Ordenação**
Verificar se `completed_at` está sendo preenchido corretamente.

### 7. **Testar Manualmente**

```javascript
// Teste completo no console
console.log('=== TESTE COMPLETO ===');

// 1. Criar perfil de teste
const testProfile = {
  name: 'Teste Debug',
  email: `debug-${Date.now()}@test.com`,
  totalScore: 150,
  profileType: 'strategist',
  badges: ['test'],
  completedAt: new Date(),
  decisions: []
};

// 2. Salvar
await saveToLeaderboard(testProfile);

// 3. Verificar leaderboard
const leaderboard = await getLeaderboard();
console.log('Leaderboard após salvar:', leaderboard);
```

## ✅ Verificação Final

1. **Execute no console**: `await debugDatabase()`
2. **Confirme no Supabase**: Execute SQL de verificação
3. **Teste uma simulação completa**: Faça uma simulação do zero
4. **Verifique logs**: Confirme que não há erros no console

## 📋 Checklist

- [ ] RLS policies configuradas corretamente
- [ ] Dados sendo salvos no banco
- [ ] Nenhum erro 23502 ou 23514
- [ ] Leaderboard carregando sem inner join
- [ ] Perfis aparecendo na ordem correta
- [ ] Decisões sendo associadas corretamente