-- Adicionar políticas de DELETE para permitir limpar o ranking
-- Esta migração adiciona políticas necessárias para permitir exclusão de dados

-- Remover políticas existentes antes de recriar (para evitar conflitos)
DROP POLICY IF EXISTS "Allow public delete access to simulation profiles" ON public.simulation_profiles;
DROP POLICY IF EXISTS "Allow public delete access to simulation decisions" ON public.simulation_decisions;

-- Política para permitir DELETE na tabela simulation_profiles
CREATE POLICY "Allow public delete access to simulation profiles" 
ON public.simulation_profiles 
FOR DELETE 
TO public 
USING (true);

-- Política para permitir DELETE na tabela simulation_decisions (referência cascade já configurada)
CREATE POLICY "Allow public delete access to simulation decisions" 
ON public.simulation_decisions 
FOR DELETE 
TO public 
USING (true);

-- Comando alternativo: se preferir restringir apenas para administradores
-- Você pode usar a service role key no lugar da anon key no cliente
-- CREATE POLICY "Allow admin delete access to simulation profiles" 
-- ON public.simulation_profiles 
-- FOR DELETE 
-- TO authenticated 
-- USING (true);