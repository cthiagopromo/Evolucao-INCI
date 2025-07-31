-- Criar tabela para armazenar perfis dos usuários que completaram a simulação
CREATE TABLE public.simulation_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('innovator', 'strategist', 'balanced')),
  badges JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar as decisões individuais
CREATE TABLE public.simulation_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.simulation_profiles(id) ON DELETE CASCADE,
  dilemma_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  time_spent INTEGER NOT NULL DEFAULT 0,
  was_automatic BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.simulation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_decisions ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso público às tabelas (simulação pública)
CREATE POLICY "Allow public read access to simulation profiles" 
ON public.simulation_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to simulation profiles" 
ON public.simulation_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to simulation decisions" 
ON public.simulation_decisions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to simulation decisions" 
ON public.simulation_decisions 
FOR INSERT 
WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX idx_simulation_profiles_email ON public.simulation_profiles(email);
CREATE INDEX idx_simulation_profiles_score ON public.simulation_profiles(total_score DESC);
CREATE INDEX idx_simulation_profiles_completed_at ON public.simulation_profiles(completed_at DESC);
CREATE INDEX idx_simulation_decisions_profile_id ON public.simulation_decisions(profile_id);