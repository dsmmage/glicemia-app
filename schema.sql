-- ============================================================
-- GlicApp — Schema do banco de dados
-- Execute este script no Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabela de pacientes (uma por usuário no MVP)
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Paciente',
  birth_date DATE,
  notes TEXT,
  alert_threshold_high INTEGER NOT NULL DEFAULT 180,
  alert_threshold_low INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Tabela de medições de glicemia
CREATE TABLE IF NOT EXISTS glucose_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  value_mg_dl INTEGER NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context TEXT NOT NULL DEFAULT 'outro'
    CHECK (context IN ('jejum', 'pre_refeicao', 'pos_refeicao', 'antes_dormir', 'outro')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela de refeições
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  eaten_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  linked_reading_id UUID REFERENCES glucose_readings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_glucose_readings_patient_measured
  ON glucose_readings(patient_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_meals_patient_eaten
  ON meals(patient_id, eaten_at DESC);

-- ============================================================
-- Row-Level Security (RLS) — cada usuário acessa só seus dados
-- ============================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Políticas para patients
CREATE POLICY "Usuário acessa seu próprio paciente"
  ON patients FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para glucose_readings
CREATE POLICY "Usuário acessa medições do seu paciente"
  ON glucose_readings FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Políticas para meals
CREATE POLICY "Usuário acessa refeições do seu paciente"
  ON meals FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );
