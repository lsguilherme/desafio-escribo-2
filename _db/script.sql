CREATE TABLE planos_de_aula ( 
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
	tema text NOT NULL, publico_alvo text NOT NULL, 
	duracao text, 
	materiais_disponiveis text, 
	data_geracao timestamp with time zone DEFAULT now(), 
	plano_json jsonb NOT NULL, 
	user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE planos_de_aula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem criar planos" ON planos_de_aula 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus planos" ON planos_de_aula 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lesson_plan_cache ( 
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
tema text NOT NULL, 
publico_alvo text NOT NULL, 
duracao text NOT NULL, 
materiais_disponiveis text NOT NULL, 
generated_plan_json jsonb NOT NULL, 
created_at timestamp with time zone DEFAULT now() 
); 

CREATE UNIQUE INDEX idx_unique_plan_cache ON public.lesson_plan_cache (tema, publico_alvo, duracao, materiais_disponiveis);