-- Expandir tipos de perfil permitidos na tabela simulation_profiles
-- Adicionar novos tipos: visionary, operational, sales, conservative

-- Remover a constraint existente
ALTER TABLE public.simulation_profiles 
DROP CONSTRAINT IF EXISTS simulation_profiles_profile_type_check;

-- Adicionar nova constraint com tipos expandidos
ALTER TABLE public.simulation_profiles 
ADD CONSTRAINT simulation_profiles_profile_type_check 
CHECK (profile_type IN ('innovator', 'strategist', 'balanced', 'visionary', 'operational', 'sales', 'conservative'));