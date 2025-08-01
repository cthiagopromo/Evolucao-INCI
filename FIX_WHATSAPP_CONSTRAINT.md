# 🛠️ Fix: NOT NULL Constraint Error on WhatsApp Field

## 🚨 Problema Identificado
Erro `23502: null value in column "whatsapp"` indica que a coluna `whatsapp` na tabela `simulation_profiles` tem uma constraint NOT NULL que está sendo violada.

## 🔧 Solução Aplicada

### 1. **Migration Criada** (`20250801150000-make-whatsapp-optional.sql`)
- Altera a coluna `whatsapp` para aceitar valores NULL
- Atualiza registros existentes com NULL para string vazia

### 2. **Código Atualizado** (`src/utils/simulation.ts`)
- Garante que `whatsapp` nunca seja null ou undefined
- Converte sempre para string vazia quando necessário

## 📋 Como Aplicar a Solução

### Opção 1: Executar Migration (Recomendado)
1. Execute o SQL abaixo no Supabase:

```sql
-- Tornar whatsapp opcional
ALTER TABLE public.simulation_profiles 
ALTER COLUMN whatsapp DROP NOT NULL;

-- Atualizar valores NULL existentes
UPDATE public.simulation_profiles 
SET whatsapp = '' 
WHERE whatsapp IS NULL;
```

### Opção 2: Verificar Schema Atual
```sql
-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'simulation_profiles';
```

### Opção 3: Testar Inserção Manual
```sql
-- Testar inserção com whatsapp vazio
INSERT INTO public.simulation_profiles (
    name, email, whatsapp, total_score, profile_type, badges, completed_at
) VALUES (
    'Teste Fix', 
    'teste@fix.com', 
    '',  -- whatsapp vazio mas não NULL
    100, 
    'strategist', 
    '[]'::jsonb, 
    NOW()
);
```

## ✅ Verificação

1. **Teste no Console do Navegador**:
   ```javascript
   await debugDatabase()
   ```

2. **Verificar Logs**: Confirme que não há mais erros 23502

3. **Testar Nova Simulação**: Execute uma simulação completa e verifique se o perfil é salvo corretamente

## 📝 Nota Importante

Se você preferir manter a constraint NOT NULL, pode modificar o código para sempre fornecer um valor padrão:

```sql
-- Alternativa: definir valor padrão
ALTER TABLE public.simulation_profiles 
ALTER COLUMN whatsapp SET DEFAULT '';
```

A solução recomendada é tornar o campo opcional, pois é mais flexível para diferentes casos de uso.