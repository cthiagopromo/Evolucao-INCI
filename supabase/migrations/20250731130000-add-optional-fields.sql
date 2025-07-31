-- Adicionar campos opcionais CNPJ, Empresa e Cargo à tabela simulation_profiles
-- Esta migração adiciona três novas colunas opcionais para informações adicionais do usuário

ALTER TABLE public.simulation_profiles 
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT;

-- Atualizar políticas RLS para incluir os novos campos (se necessário)
-- Os campos são opcionais, então não precisam ser adicionados às políticas existentes