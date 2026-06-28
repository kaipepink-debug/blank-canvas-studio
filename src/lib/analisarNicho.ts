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

// Extrai um objeto JSON do texto. Se a resposta veio truncada (cortada no meio),
// fecha as aspas/colchetes/chaves que ficaram abertos (best-effort).
export function extrairJson(texto: string): string | null {
  const start = texto.indexOf("{");
  if (start === -1) return null;
  let inStr = false;
  let esc = false;
  const stack: string[] = [];
  for (let i = start; i < texto.length; i++) {
    const ch = texto[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") {
      stack.pop();
      if (stack.length === 0) return texto.slice(start, i + 1);
    }
  }
  // Truncado: fecha o que ficou aberto.
  let json = texto.slice(start);
  if (inStr) json += '"';
  json = json.replace(/[\s,]+$/, "");
  for (let i = stack.length - 1; i >= 0; i--) {
    json += stack[i] === "{" ? "}" : "]";
  }
  return json;
}

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

// Senhas de acesso. Você pode adicionar mais via secret APP_PASSWORD na Lovable
// (separadas por vírgula).
export function senhaValida(s: string): boolean {
  const fixas = ["Mandarrari", "Pedro2606", "Fabio2706"];
  const extra = (process.env.APP_PASSWORD ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return [...fixas, ...extra].includes(s);
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
      // Streaming evita o timeout 524 da Anthropic em requisições longas:
      // a resposta vai chegando aos poucos e a conexão não expira.
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODELO,
          max_tokens: 9000,
          stream: true,
          thinking: { type: "adaptive" },
          system: SYSTEM,
          tools: [{ type: "web_search_20260209", name: "web_search" }],
          messages,
        }),
      });

      if (!resp.ok || !resp.body) {
        const corpo = await resp.text().catch(() => "");
        return falha(`API retornou ${resp.status}: ${corpo.slice(0, 300)}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let texto = "";
      let stopReason = "";
      let apiErro = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          let ev: any;
          try {
            ev = JSON.parse(payload);
          } catch {
            continue;
          }
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            texto += ev.delta.text;
          } else if (ev.type === "message_delta" && ev.delta?.stop_reason) {
            stopReason = ev.delta.stop_reason;
          } else if (ev.type === "error") {
            apiErro = ev.error?.message ?? "erro no stream";
          }
        }
      }

      if (apiErro) return falha(`Erro da API: ${apiErro}`);
      if (stopReason === "refusal") {
        return falha("A IA recusou a análise deste nicho.");
      }

      const jsonStr = extrairJson(texto);
      if (!jsonStr) {
        return falha(`Resposta incompleta — tente de novo. Início: ${texto.slice(0, 150)}`);
      }
      let dados: Analise;
      try {
        dados = JSON.parse(jsonStr) as Analise;
      } catch {
        return falha("A resposta veio longa demais e ficou incompleta. Tente de novo.");
      }
      if (!dados.nicho) dados.nicho = nicho;
      return dados;
    } catch (e: any) {
      return falha(`Falha no servidor: ${e?.message ?? String(e)}`);
    }
  });
