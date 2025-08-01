-- Migration: Make whatsapp column optional in simulation_profiles
-- Created: 2025-08-01
-- Purpose: Fix NOT NULL constraint violation for whatsapp field

-- Remove NOT NULL constraint from whatsapp column
ALTER TABLE public.simulation_profiles 
ALTER COLUMN whatsapp DROP NOT NULL;

-- Update existing NULL values to empty string
UPDATE public.simulation_profiles 
SET whatsapp = '' 
WHERE whatsapp IS NULL;

-- Optional: Add default value for future inserts
ALTER TABLE public.simulation_profiles 
ALTER COLUMN whatsapp SET DEFAULT '';