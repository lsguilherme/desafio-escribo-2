# Gerador de Planos de Aula com IA

Sistema completo para geração automática de planos de aula utilizando Inteligência Artificial, desenvolvido com React, TypeScript, Supabase e Google Gemini AI.

## Escolha do modelo

Foi utilizado o **Google AI Studio** para encontrar o melhor modelo disponível para esse caso de uso. Foi analisado os seguintes critérios:

1. Precisão de entrega
2. Velocidade de entrega
3. Custos de operação (input/output)
4. Geração de um JSON estruturado da maneira que foi solicitado no prompt

Com essa análise e alguns testes, se teve a conclusão final que o modelo **gemini-2.5-flash** é o essencial para esse projeto devido sua velocidade, precisão e custos.

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- API Key do Google Gemini AI
- Git

## 📋 Acesso Remoto - Deploy

https://desafio-escribo-2.vercel.app

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/lsguilherme/desafio-escribo-2.git
cd escribo
```

### 2. Instale as dependências do frontend

```bash
cd frontend
npm install
```

### 3. Configure o Supabase

#### Crie as tabelas necessárias:

**Tabela `planos_de_aula`:**

```sql
CREATE TABLE planos_de_aula (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tema TEXT NOT NULL,
  publico_alvo TEXT NOT NULL,
  duracao TEXT,
  materiais_disponiveis TEXT,
  plano_json JSONB NOT NULL,
  data_geracao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabela `lesson_plan_cache`:**

```sql
CREATE TABLE lesson_plan_cache (
  id BIGSERIAL PRIMARY KEY,
  tema TEXT NOT NULL,
  publico_alvo TEXT NOT NULL,
  duracao TEXT NOT NULL,
  materiais_disponiveis TEXT NOT NULL,
  generated_plan_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Configure RLS (Row Level Security):

```sql
ALTER TABLE planos_de_aula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lessons" ON planos_de_aula
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lessons" ON planos_de_aula
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Deploy da Edge Function

```bash
npm install -g supabase

supabase login

supabase functions deploy super-task --project-ref <seu-project-ref>
```

## ⚙️ Configuração das Variáveis de Ambiente

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Edge Function (Supabase Secrets)

```bash
supabase secrets set GEMINI_API_KEY=sua-gemini-api-key
supabase secrets set SUPABASE_URL=https://seu-projeto.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

## 🚀 Como Executar

### Desenvolvimento

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Produção

```bash
cd frontend
npm run build
npm run preview
```

### **Arquitetura**

```
Frontend (React) → Supabase Edge Function → Google Gemini AI
                ↓
            PostgreSQL (Cache + User Data)
```
