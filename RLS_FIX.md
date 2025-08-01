# Solução para Novos Participantes Não Aparecerem no Ranking

## Problema
Novos participantes não estão aparecendo no ranking após completar a simulação.

## Causa Provável
As tabelas do Supabase provavelmente têm RLS (Row Level Security) habilitado, mas sem políticas SELECT adequadas para usuários anônimos.

## Solução Completa

### 1. Verificar e Configurar Políticas RLS para SELECT

Acesse o SQL Editor do Supabase e execute os seguintes comandos:

```sql
-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('simulation_profiles', 'simulation_decisions');

-- Adicionar políticas de SELECT para usuários anônimos (authenticated/anonymous)
CREATE POLICY "Allow public select access to simulation profiles" 
ON public.simulation_profiles 
FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Allow public select access to simulation decisions" 
ON public.simulation_decisions 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- Adicionar políticas de INSERT para usuários anônimos
CREATE POLICY "Allow public insert access to simulation profiles" 
ON public.simulation_profiles 
FOR INSERT 
TO authenticated, anon 
WITH CHECK (true);

CREATE POLICY "Allow public insert access to simulation decisions" 
ON public.simulation_decisions 
FOR INSERT 
TO authenticated, anon 
WITH CHECK (true);

-- Adicionar políticas de UPDATE para usuários anônimos
CREATE POLICY "Allow public update access to simulation profiles" 
ON public.simulation_profiles 
FOR UPDATE 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Adicionar políticas de DELETE (se necessário para limpar ranking)
CREATE POLICY "Allow public delete access to simulation profiles" 
ON public.simulation_profiles 
FOR DELETE 
TO authenticated, anon 
USING (true);

CREATE POLICY "Allow public delete access to simulation decisions" 
ON public.simulation_decisions 
FOR DELETE 
TO authenticated, anon 
USING (true);
```

### 2. Verificar se as Políticas foram Aplicadas

Execute este comando para verificar todas as políticas:

```sql
-- Verificar todas as políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('simulation_profiles', 'simulation_decisions')
ORDER BY tablename, policyname;
```

### 3. Testar a Solução

1. **Reinicie o servidor de desenvolvimento**
2. **Execute uma nova simulação**
3. **Verifique o console do navegador** para mensagens de debug
4. **Verifique o ranking** para ver se o novo participante aparece

### 4. Debug Adicional

Se ainda não funcionar, adicione este código temporário para debug:

```sql
-- Verificar dados existentes
SELECT COUNT(*) as total_profiles FROM public.simulation_profiles;
SELECT COUNT(*) as total_decisions FROM public.simulation_decisions;

-- Verificar últimos registros inseridos
SELECT 
    id, 
    name, 
    email, 
    total_score, 
    profile_type, 
    completed_at 
FROM public.simulation_profiles 
ORDER BY completed_at DESC 
LIMIT 5;
```

### 5. Solução Alternativa: Desabilitar RLS

Se preferir desabilitar completamente o RLS (não recomendado para produção):

```sql
-- Desabilitar RLS (use com cautela)
ALTER TABLE public.simulation_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_decisions DISABLE ROW LEVEL SECURITY;
```

### 6. Verificação Final

Após aplicar as políticas:

1. **Execute uma nova simulação completa**
2. **Verifique se o participante aparece no ranking**
3. **Confirme no console do navegador** que os dados estão sendo carregados

## Notas de Segurança

- **Para produção**: Considere usar políticas mais restritivas baseadas em autenticação
- **Para eventos/testes**: As políticas públicas são aceitáveis
- **Sempre**: Monitore os logs do Supabase para detectar problemas de permissão

## Comandos Úteis para Debug

```sql
-- Verificar logs recentes do Supabase
SELECT 
    id,
    timestamp,
    event_message,
    request_id
FROM auth.audit_log_entries 
ORDER BY timestamp DESC 
LIMIT 10;
```