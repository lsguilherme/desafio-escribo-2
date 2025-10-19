import { createClient } from "npm:@supabase/supabase-js";
import { GoogleGenAI } from "npm:@google/genai";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PROMPT_BASE = `
Você é um IA especialista em Didática e Pedagogia, focado na criação de planos de aula alinhados à Base Nacional Comum Curricular (BNCC). Seu objetivo é gerar um plano de aula completo, criativo e estruturado.

**REGRA DE SAÍDA CRÍTICA:**
1. A saída deve ser ESTRITAMENTE um objeto JSON VÁLIDO. Nenhum comentário, explicação ou marcador de código externo é permitido.
2. Preencha todos os campos do ESQUEMA JSON OBRIGATÓRIO abaixo com dados relevantes e educativos.

**DADOS DE ENTRADA DO USUÁRIO:**
* Tema: {TEMA_INPUT}
* Público/Ano Escolar: {PUBLICO_INPUT}
* Duração Estimada: {DURACAO_INPUT}
* Materiais Disponíveis: {MATERIAIS_INPUT}

**ESQUEMA JSON OBRIGATÓRIO (PARA SAÍDA):**
{
  "titulo_plano": "Sugestão de título envolvente e educativo para o plano de aula",
  "tema_principal": "{TEMA_INPUT}",
  "publico_alvo": "{PUBLICO_INPUT}",
  "duracao_estimada": "{DURACAO_INPUT}",
  "introducao_ludica": {
    "titulo": "Título criativo da dinâmica de abertura (Ex: 'A Caixa Misteriosa')",
    "descricao": "Uma forma criativa e engajadora de apresentar o tema, capturando a atenção dos alunos. Deve ser uma atividade curta e divertida. Mínimo de 3 frases."
  },
  "objetivo_bncc": {
    "codigo": "Sugestão do Código BNCC mais relevante e específico (Ex: EF05GE01, EM13LGG101)",
    "descricao": "Descrição do Objetivo de Aprendizagem da BNCC alinhado ao Tema e ao Público alvo."
  },
  "passos_da_atividade": [
    {
      "passo": 1,
      "titulo": "Passo 1: Aquecimento e Exploração Inicial",
      "duracao_sugerida": "10-15 minutos",
      "detalhamento": "Roteiro detalhado de o que a professora deve fazer e como os alunos devem interagir para iniciar a aula."
    },
    {
      "passo": 2,
      "titulo": "Passo 2: Desenvolvimento (Mão na Massa)",
      "duracao_sugerida": "Duração principal da aula",
      "detalhamento": "Roteiro detalhado da atividade central (experimento, debate, produção de texto, etc.), explicando o papel do aluno e do professor."
    },
    {
      "passo": 3,
      "titulo": "Passo 3: Conclusão e Sistematização",
      "duracao_sugerida": "10 minutos",
      "detalhamento": "Roteiro para o encerramento, incluindo a correção, debate final e síntese do aprendizado que conecta ao objetivo da BNCC."
    }
  ],
  "rubrica_avaliacao": {
    "foco_da_avaliacao": "O aspecto central que será avaliado no aluno (Ex: Compreensão do Conceito, Participação e Colaboração)",
    "criterios": [
      {
        "nivel": "Nível 3: Excelente",
        "descricao": "Critério para o aluno que demonstra domínio completo do objetivo, participação ativa e criatividade."
      },
      {
        "nivel": "Nível 2: Satisfatório",
        "descricao": "Critério para o aluno que demonstra compreensão clara do objetivo, mas com pouca profundidade ou criatividade."
      },
      {
        "nivel": "Nível 1: Em Desenvolvimento",
        "descricao": "Critério para o aluno que demonstra dificuldade em aplicar o conceito ou pouca participação, necessitando de suporte."
      }
    ]
  },
  "materiais_necessarios": "Lista de materiais sugeridos com base nos {MATERIAIS_INPUT} fornecidos, ou sugestão de substituição se necessário."
}
`;
Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  const token = req.headers.get("Authorization")?.split("Bearer ")[1];
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Método não permitido.",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(
      JSON.stringify({
        error: "Erro de configuração. Variáveis de ambiente faltando.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
  if (!token) {
    return new Response(
      JSON.stringify({
        error:
          "Não autorizado. Apenas usuários autenticados podem gerar e salvar planos.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
      },
    });
    let tema, publico_alvo, duracao, materiais_disponiveis;
    try {
      const text = await req.text();
      if (!text || text.trim() === "") {
        return new Response(
          JSON.stringify({
            error: "Body da requisição está vazio.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      const body = JSON.parse(text);
      ({ tema, publico_alvo, duracao, materiais_disponiveis } = body);
    } catch (jsonError) {
      return new Response(
        JSON.stringify({
          error: "JSON inválido: " + jsonError.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    if (!tema || !publico_alvo) {
      return new Response(
        JSON.stringify({
          error: "Tema e Público Alvo são obrigatórios.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    const duracaoKey = duracao || "Indefinida";
    const materiaisKey = materiais_disponiveis || "Não informado";
    const { data: cacheData, error: cacheError } = await supabase
      .from("lesson_plan_cache")
      .select("generated_plan_json")
      .eq("tema", tema)
      .eq("publico_alvo", publico_alvo)
      .eq("duracao", duracaoKey)
      .eq("materiais_disponiveis", materiaisKey)
      .single();
    if (cacheData) {
      console.log("CACHE HIT: Plano encontrado no banco de dados.");
      const { data: userData, error: authError } = await supabase.auth.getUser(
        token
      );
      if (authError || !userData.user) {
        return new Response(
          JSON.stringify({
            error: "Token de autenticação inválido ou expirado.",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      const userId = userData.user.id;
      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
        },
      });

      const { data: planosGerados, error: dbError } = await supabaseAuth
        .from("planos_de_aula")
        .insert({
          tema: tema,
          publico_alvo: publico_alvo,
          duracao: duracao,
          materiais_disponiveis: materiais_disponiveis,
          plano_json: cacheData.generated_plan_json,
          user_id: userId,
        })
        .select()
        .single();
      if (dbError) {
        console.error("Erro ao salvar plano do cache:", dbError);
        return new Response(
          JSON.stringify({
            error: `Erro ao salvar o plano: ${dbError.message}`,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      return new Response(JSON.stringify(planosGerados), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache-Status": "HIT",
          ...corsHeaders,
        },
      });
    }
    const { data: userData, error: authError } = await supabase.auth.getUser(
      token
    );
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({
          error: "Token de autenticação inválido ou expirado.",
        }),
        {
          status: 401,
        }
      );
    }
    const userId = userData.user.id;
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      global: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
    const promptFinal = PROMPT_BASE.replace("{TEMA_INPUT}", tema)
      .replace("{PUBLICO_INPUT}", publico_alvo)
      .replace("{DURACAO_INPUT}", duracaoKey)
      .replace("{MATERIAIS_INPUT}", materiaisKey);
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: promptFinal,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });
    let planoJSON;
    try {
      const jsonText = response.text.trim().replace(/```json|```/g, "");
      planoJSON = JSON.parse(jsonText);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA:", e);
      return new Response(
        JSON.stringify({
          error: "A IA gerou um formato inválido. Tente novamente.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    supabase
      .from("lesson_plan_cache")
      .insert({
        tema: tema,
        publico_alvo: publico_alvo,
        duracao: duracaoKey,
        materiais_disponiveis: materiaisKey,
        generated_plan_json: planoJSON,
      })
      .then(({ error }) => {
        if (error) console.error("Falha ao escrever no cache:", error);
      });
    const { data: planosGerados, error: dbError } = await supabaseAuth
      .from("planos_de_aula")
      .insert({
        tema: tema,
        publico_alvo: publico_alvo,
        duracao: duracao,
        materiais_disponiveis: materiais_disponiveis,
        plano_json: planoJSON,
        user_id: userId,
      })
      .select()
      .single();
    if (dbError) {
      console.error("Erro no Supabase:", dbError);
      return new Response(
        JSON.stringify({
          error: `Erro ao salvar o plano no banco de dados: ${dbError.message}`,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    return new Response(JSON.stringify(planosGerados), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Erro inesperado:", error);
    return new Response(
      JSON.stringify({
        error: `Erro interno no servidor: ${error.message}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
