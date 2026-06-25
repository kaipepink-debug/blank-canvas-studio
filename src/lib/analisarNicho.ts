import { createServerFn } from "@tanstack/react-start";

// Tipos do resultado estruturado da análise.
export type SubNicho = { nome: string; descricao: string };
export type Dor = { problema: string; custo: string };
export type Solucao = { dor: string; ideia: string; resultado: string };
export type Concorrente = { nome: string; preco: string; obs: string };
export type Persona = {
  nome_ficticio: string;
  perfil: string;
  dia_a_dia: string;
  dores_principais: string[];
  objecoes: string[];
  gatilhos_de_compra: string[];
  onde_encontrar: string[];
  disposicao_a_pagar: string;
};
export type Notas = {
  disposicao_pagar: number;
  baixa_concorrencia: number;
  facilidade_venda: number;
  potencial_escala: number;
};
export type Fonte = { titulo: string; url: string };
export type Analise = {
  nicho: string;
  visao_geral?: string;
  sub_nichos?: SubNicho[];
  dores?: Dor[];
  solucoes?: Solucao[];
  concorrentes?: Concorrente[];
  brecha?: string;
  validacao?: string[];
  persona?: Persona;
  notas?: Notas;
  veredito?: string;
  fontes?: Fonte[];
  erro?: boolean;
};

const MODELO = "claude-opus-4-8";

const SYSTEM = `Você é analista sênior de oportunidades de Micro SaaS no mercado \
brasileiro, ajudando um empreendedor NÃO-TÉCNICO que vende B2B para pequenas \
empresas e busca escala. Use a busca na web para fundamentar com dados atuais \
(concorrentes, preços, tamanho de mercado, tendências do Brasil). Foque em dores \
que doem no bolso; para cada solução, descreva o RESULTADO em dinheiro/tempo.

Ao final responda APENAS com UM objeto JSON válido (sem texto/crase/markdown) \
exatamente neste formato:
{
  "nicho": "string",
  "visao_geral": "2-4 frases sobre o nicho e tamanho no Brasil",
  "sub_nichos": [{"nome":"string","descricao":"1 linha"}],
  "dores": [{"problema":"string","custo":"quanto custa em R$ ou tempo"}],
  "solucoes": [{"dor":"qual dor","ideia":"ideia de SaaS","resultado":"o ganho"}],
  "concorrentes": [{"nome":"string","preco":"faixa ou 'grátis'","obs":"1 linha"}],
  "brecha": "onde há espaço/diferenciação (1-2 frases)",
  "validacao": ["passo 1 sem código","passo 2","meta de pagantes"],
  "persona": {
    "nome_ficticio":"ex: 'Carla, dona de pet shop'",
    "perfil":"cargo, idade, tipo de negócio, contexto",
    "dia_a_dia":"rotina e onde perde tempo/dinheiro",
    "dores_principais":["...","..."],
    "objecoes":["...","..."],
    "gatilhos_de_compra":["...","..."],
    "onde_encontrar":["...","..."],
    "disposicao_a_pagar":"faixa de mensalidade em R$"
  },
  "notas": {"disposicao_pagar":0,"baixa_concorrencia":0,"facilidade_venda":0,"potencial_escala":0},
  "veredito": "recomendação final 2-3 frases",
  "fontes": [{"titulo":"string","url":"string"}]
}
As notas vão de 0 a 10. Seja honesto e específico.`;

// Server function: roda no servidor, onde a ANTHROPIC_API_KEY fica segura.
export const analisarNicho = createServerFn({ method: "POST" })
  .inputValidator((nicho: string) => nicho)
  .handler(async ({ data: nicho }): Promise<Analise> => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY não configurada. Adicione-a nos Secrets do projeto.",
      );
    }

    const messages: Array<{ role: string; content: unknown }> = [
      {
        role: "user",
        content: `Analise o nicho: '${nicho}'. Pesquise na web antes de responder.`,
      },
    ];

    // Loop para lidar com pause_turn (a busca server-side pode pausar e continuar).
    for (let i = 0; i < 8; i++) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODELO,
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          system: SYSTEM,
          tools: [{ type: "web_search_20260209", name: "web_search" }],
          messages,
        }),
      });

      const json: any = await resp.json();
      if (json?.type === "error") {
        throw new Error(json?.error?.message ?? "Erro na API da Anthropic");
      }

      if (json?.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: json.content });
        continue;
      }

      const texto: string = (json?.content ?? [])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");
      const ini = texto.indexOf("{");
      const fim = texto.lastIndexOf("}");
      const dados = JSON.parse(texto.slice(ini, fim + 1)) as Analise;
      if (!dados.nicho) dados.nicho = nicho;
      return dados;
    }

    throw new Error("A análise não foi concluída (muitas pausas).");
  });
