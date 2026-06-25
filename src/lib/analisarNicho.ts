import { createServerFn } from "@tanstack/react-start";

// Tipos do resultado estruturado da análise.
export type SubNicho = { nome: string; descricao: string };
export type Dor = { problema: string; custo: string };
export type Concorrente = { nome: string; preco: string; obs: string };
export type DadosDemograficos = {
  tamanho_mercado: string;
  numero_de_empresas: string;
  crescimento: string;
  regioes: string;
  perfil_clientes: string;
  ticket_medio: string;
};
export type Persona = {
  nome_ficticio: string;
  perfil: string;
  idade: string;
  dia_a_dia: string;
  dores_principais: string[];
  objecoes: string[];
  gatilhos_de_compra: string[];
  canais: string[];
  disposicao_a_pagar: string;
};
export type IdeiaSaaS = {
  nome: string;
  descricao: string;
  problema_que_resolve: string;
  resultado: string;
  publico: string;
  modelo_cobranca: string;
  diferencial: string;
  mvp: string[];
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
  dados_demograficos?: DadosDemograficos;
  publico_alvo?: string;
  sub_nichos?: SubNicho[];
  dores?: Dor[];
  concorrentes?: Concorrente[];
  brecha?: string;
  personas?: Persona[];
  ideias_saas?: IdeiaSaaS[];
  validacao?: string[];
  notas?: Notas;
  veredito?: string;
  fontes?: Fonte[];
  erro?: boolean;
  mensagem?: string;
};

const MODELO = "claude-opus-4-8";

const SYSTEM = `Você é analista sênior de oportunidades de Micro SaaS no mercado \
brasileiro, ajudando um empreendedor NÃO-TÉCNICO que vende B2B para pequenas \
empresas e busca escala. Faça uma análise PROFUNDA e detalhada. Use a busca na \
web para fundamentar com dados atuais e NÚMEROS (tamanho de mercado, nº de \
empresas, crescimento, preços de concorrentes, demografia dos clientes). Foque \
em dores que doem no bolso; descreva resultados em dinheiro/tempo. Considere \
WhatsApp, Pix, iFood e regulação quando relevante.

Ao final responda APENAS com UM objeto JSON válido (sem texto/crase/markdown) \
exatamente neste formato:
{
  "nicho": "string",
  "visao_geral": "3-5 frases sobre o nicho e sua relevância no Brasil",
  "dados_demograficos": {
    "tamanho_mercado": "faturamento/tamanho do mercado no Brasil, com número",
    "numero_de_empresas": "quantos negócios desse tipo existem (estimativa com número)",
    "crescimento": "tendência de crescimento, de preferência %/ano",
    "regioes": "onde esses negócios se concentram no Brasil",
    "perfil_clientes": "demografia dos CLIENTES FINAIS do negócio (idade, renda, comportamento)",
    "ticket_medio": "ticket médio do negócio"
  },
  "publico_alvo": "quem é o COMPRADOR do SaaS (o dono do negócio): porte, perfil, maturidade digital, o que valoriza",
  "sub_nichos": [{"nome":"string","descricao":"1 linha"}],
  "dores": [{"problema":"string","custo":"quanto custa em R$ ou tempo"}],
  "concorrentes": [{"nome":"string","preco":"faixa ou 'grátis'","obs":"1 linha"}],
  "brecha": "onde há espaço/diferenciação real (1-2 frases)",
  "personas": [
    {
      "nome_ficticio":"ex: 'Carla, dona de pet shop'",
      "perfil":"cargo, tipo de negócio, contexto",
      "idade":"faixa etária",
      "dia_a_dia":"rotina e onde perde tempo/dinheiro",
      "dores_principais":["...","..."],
      "objecoes":["...","..."],
      "gatilhos_de_compra":["...","..."],
      "canais":["onde encontrá-la / como alcançá-la"],
      "disposicao_a_pagar":"faixa de mensalidade em R$"
    }
  ],
  "ideias_saas": [
    {
      "nome":"nome curto do produto",
      "descricao":"o que faz, em 1-2 frases",
      "problema_que_resolve":"a dor específica",
      "resultado":"o ganho em R$ ou tempo",
      "publico":"para quem dentro do nicho",
      "modelo_cobranca":"ex: R$ X/mês por unidade",
      "diferencial":"por que ganha dos concorrentes",
      "mvp":["primeira feature essencial","segunda feature"]
    }
  ],
  "validacao": ["passo 1 sem código","passo 2","meta de pagantes"],
  "notas": {"disposicao_pagar":0,"baixa_concorrencia":0,"facilidade_venda":0,"potencial_escala":0},
  "veredito": "recomendação final 2-3 frases",
  "fontes": [{"titulo":"string","url":"string"}]
}

Regras: traga DUAS personas distintas em "personas"; traga de 3 a 4 ideias de \
micro SaaS em "ideias_saas". As notas vão de 0 a 10. Seja honesto, específico e \
use números sempre que possível.`;

// Senha de acesso. Pode ser sobrescrita pelo secret APP_PASSWORD na Lovable.
function senhaValida(s: string): boolean {
  return s === (process.env.APP_PASSWORD ?? "Mandarrari");
}

// Verifica a senha de acesso ao app (usada na tela de login).
export const verificarSenha = createServerFn({ method: "POST" })
  .inputValidator((senha: string) => senha)
  .handler(async ({ data: senha }): Promise<{ ok: boolean }> => ({
    ok: senhaValida(senha),
  }));

// Server function: roda no servidor, onde a ANTHROPIC_API_KEY fica segura.
export const analisarNicho = createServerFn({ method: "POST" })
  .inputValidator((p: { nicho: string; senha: string }) => p)
  .handler(async ({ data }): Promise<Analise> => {
    const { nicho, senha } = data;
    const falha = (mensagem: string): Analise => ({ nicho, erro: true, mensagem });

    if (!senhaValida(senha)) return falha("Senha incorreta.");

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return falha(
        "ANTHROPIC_API_KEY não encontrada no servidor. Adicione-a nos Secrets do projeto na Lovable.",
      );
    }

    const messages: Array<{ role: string; content: unknown }> = [
      {
        role: "user",
        content: `Analise o nicho: '${nicho}'. Pesquise na web antes de responder.`,
      },
    ];

    try {
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
            max_tokens: 12000,
            thinking: { type: "adaptive" },
            system: SYSTEM,
            tools: [{ type: "web_search_20260209", name: "web_search" }],
            messages,
          }),
        });

        if (!resp.ok) {
          const corpo = await resp.text().catch(() => "");
          return falha(`API retornou ${resp.status}: ${corpo.slice(0, 300)}`);
        }

        const json: any = await resp.json();
        if (json?.type === "error") {
          return falha(`Erro da API: ${json?.error?.message ?? "desconhecido"}`);
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
        if (ini === -1 || fim === -1) {
          return falha(`Resposta sem JSON. Início: ${texto.slice(0, 200)}`);
        }
        const dados = JSON.parse(texto.slice(ini, fim + 1)) as Analise;
        if (!dados.nicho) dados.nicho = nicho;
        return dados;
      }
      return falha("A análise não foi concluída (muitas pausas).");
    } catch (e: any) {
      return falha(`Falha no servidor: ${e?.message ?? String(e)}`);
    }
  });
