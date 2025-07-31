# Configuração do Supabase - Permissões para Limpar Ranking

## Problema
O botão "Limpar Ranking" não está funcionando devido a falta de permissões DELETE no Supabase.

## Solução

### Opção 1: Adicionar Políticas RLS (Recomendado)

1. Acesse o painel do Supabase em: https://supabase.com/dashboard
2. Vá para o seu projeto
3. Navegue até **Authentication > Policies**
4. Clique em **New Policy** para cada tabela:

#### Para a tabela `simulation_profiles`:
```sql
CREATE POLICY "Allow public delete access to simulation profiles" 
ON public.simulation_profiles 
FOR DELETE 
TO public 
USING (true);
```

#### Para a tabela `simulation_decisions`:
```sql
CREATE POLICY "Allow public delete access to simulation decisions" 
ON public.simulation_decisions 
FOR DELETE 
TO public 
USING (true);
```

### Opção 2: Usar Service Role Key (Mais Seguro)

Se você preferir maior segurança, use a Service Role Key ao invés da Anon Key:

1. Vá para **Settings > API** no painel do Supabase
2. Copie a **Service Role Key** (nunca exponha publicamente)
3. Atualize o arquivo `src/integrations/supabase/client.ts`:

```typescript
// Para uso em produção/administração apenas
const SUPABASE_SERVICE_ROLE_KEY = "sua-service-role-key-aqui";

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

### Opção 3: Executar SQL Diretamente

Você pode executar os comandos SQL diretamente no SQL Editor do Supabase:

1. Vá para **SQL Editor** no painel do Supabase
2. Execute os seguintes comandos:

```sql
-- Habilitar RLS se ainda não estiver habilitado
ALTER TABLE public.simulation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_decisions ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas de DELETE
CREATE POLICY "Allow public delete access to simulation profiles" 
ON public.simulation_profiles 
FOR DELETE 
TO public 
USING (true);

CREATE POLICY "Allow public delete access to simulation decisions" 
ON public.simulation_decisions 
FOR DELETE 
TO public 
USING (true);
```

## Verificação

Após configurar as permissões:

1. Reinicie o servidor de desenvolvimento
2. Teste o botão "Limpar Ranking"
3. Verifique o console do navegador para mensagens de sucesso
4. Verifique se os dados foram removidos no painel do Supabase

## Segurança

- **Políticas públicas**: Permitem qualquer pessoa (anon) deletar dados. Use apenas para eventos/testes.
- **Políticas restritas**: Use autenticação ou roles específicas para maior segurança.
- **Service Role Key**: Use apenas em ambientes seguros (servidor/administração).

## Troubleshooting

Se ainda não funcionar:
1. Verifique se as políticas foram criadas corretamente
2. Confirme se RLS está habilitado nas tabelas
3. Verifique os logs do Supabase no dashboard
4. Teste a conexão usando o SQL Editor do Supabase