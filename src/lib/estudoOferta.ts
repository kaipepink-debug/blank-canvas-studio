import { createServerFn } from "@tanstack/react-start";
import { senhaValida, extrairJson } from "./analisarNicho";

// Entrada do formulário guiado. Só produto/publico/resultado são obrigatórios;
// o resto a IA preenche/refina se vier vazio.
export type OfertaInput = {
  senha: string;
  // Seção 1 (obrigatório)
  produto: string;
  publico: string;
  resultado: string;
  // Calibragem (clique)
  consciencia?: string; // nível de consciência do público
  canal?: string; // onde a oferta vai ser usada
  ticket?: string; // faixa de preço
  // Seção 2 (opcional)
  beneficio?: string;
  porque_agora?: string;
  promessa?: string;
  mecanismo?: string;
  tempo?: string;
  dor?: string;
  diferencial?: string;
  // Seção 3 e 4 (opcional)
  prova?: string;
  oferta_stack?: string;
  garantia?: string;
};

export type PromessaNiveis = {
  conservadora: string;
  ousada: string;
  absurda: string;
};
export type MecanismoUnico = { nomes: string[]; explicacao: string };
export type Objecao = { objecao: string; resposta: string };
export type QuatroPerguntas = {
  e_pra_mim: string;
  resolve: string;
  por_que_funciona: string;
  por_que_agora: string;
};
export type ScoreOferta = {
  promessa: number;
  mecanismo: number;
  prova: number;
  urgencia: number;
  total: number;
  como_fortalecer: string[];
};
export type Oferta = {
  promessa?: PromessaNiveis;
  puv?: string;
  mecanismo_unico?: MecanismoUnico;
  fator_tempo?: string;
  urgencia?: string;
  provas?: string[];
  diferenciais?: string[];
  objecoes?: Objecao[];
  oferta?: string[];
  garantia?: string;
  cta?: string[];
  formato_canal?: string;
  angulos?: string[];
  quatro_perguntas?: QuatroPerguntas;
  score?: ScoreOferta;
  erro?: boolean;
  mensagem?: string;
};

// Sonnet 4.6: ótimo custo-benefício. Troque para "claude-opus-4-8" para o máximo.
const MODELO = "claude-sonnet-4-6";

const SYSTEM = `Você é um especialista sênior em copywriting de resposta direta e \
criação de ofertas de alta conversão (na linha de Alex Hormozi, Eugene Schwartz e \
Russell Brunson), atuando no mercado brasileiro. A partir das respostas de um \
formulário, monte uma OFERTA COMPLETA, pronta para virar página de vendas, anúncio \
ou script.

FUNDAMENTO — Equação de Valor: valor = (resultado dos sonhos × probabilidade de \
dar certo) ÷ (tempo × esforço). Toda a oferta deve MAXIMIZAR resultado e \
credibilidade e MINIMIZAR tempo e esforço percebidos.

REGRAS DA PROMESSA:
- Escreva a promessa em 3ª PESSOA DECLARATIVA (mostrando que já está acontecendo), \
NUNCA em 1ª pessoa. Ex.: "Pequenas clínicas médicas estão lotando a agenda em menos \
de 20 dias, usando o sistema X — sem gastar com tráfego pago."
- Gere a promessa em 3 NÍVEIS de ousadia: "conservadora" (crível e segura), \
"ousada" (chama atenção, ainda ancorada) e "absurda" (magnitude máxima). Em TODAS, \
combine: número específico (prefira números quebrados) + tempo + mecanismo + a dor \
evitada. Absurdo não é mentira: a magnitude vem amarrada ao mecanismo e à prova.

MECANISMO ÚNICO: dê um NOME próprio ao método (sugira 3 a 5 nomes) e explique por \
que ele funciona — o "como" proprietário que justifica a promessa. Se o usuário já \
informou um mecanismo, refine-o e inclua-o entre os nomes.

CALIBRAGEM:
- Ajuste o tom conforme o NÍVEL DE CONSCIÊNCIA do público informado (inconsciente → \
educar; consciente do problema → agitar a dor; consciente da solução → mecanismo + \
promessa forte; consciente do produto/já te conhece → oferta e urgência).
- Adapte o campo "formato_canal": entregue a oferta JÁ FORMATADA para o CANAL \
informado (anúncio, landing page, e-mail, WhatsApp, VSL etc.) — no tom e tamanho \
certos daquele canal.
- Ajuste prova e reversão de risco à faixa de PREÇO informada (ticket alto exige \
mais prova e garantia).

CAMPOS VAZIOS: o usuário pode ter deixado campos em branco — GERE o conteúdo que \
faltar (mecanismo, benefício, objeções, CTA, garantia). O que ele preencheu, refine \
sem descaracterizar.

LIMITES LEGAIS: em nichos sensíveis (saúde, finanças, jurídico), NUNCA gere \
promessa de cura, ganho garantido ou afirmação enganosa. Foque em resultado de \
NEGÓCIO (agendamentos, faturamento, tempo economizado). Mantenha ousado, mas \
defensável.

Ao final responda APENAS com UM objeto JSON válido (sem texto/crase/markdown) \
exatamente neste formato:
{
  "promessa": {
    "conservadora": "headline em 3ª pessoa, nível conservador",
    "ousada": "headline em 3ª pessoa, nível ousado",
    "absurda": "headline em 3ª pessoa, nível absurdo (mas ancorado)"
  },
  "puv": "posicionamento em 1 frase: [público] + [problema] + [benefício] + [diferencial]",
  "mecanismo_unico": {
    "nomes": ["Nome do Método 1", "Nome 2", "Nome 3"],
    "explicacao": "por que o método funciona — o 'como' que justifica a promessa (2-3 frases)"
  },
  "fator_tempo": "o enquadramento de velocidade (ex: 'na primeira semana', 'em 15 minutos')",
  "urgencia": "por que agir AGORA / o custo de não agir (1-2 frases, urgência legítima)",
  "provas": ["gancho de prova ou tipo de prova a usar", "..."],
  "diferenciais": ["o que o concorrente não entrega", "..."],
  "objecoes": [{"objecao": "dúvida do cliente", "resposta": "quebra da objeção"}],
  "oferta": ["item entregue no pacote", "..."],
  "garantia": "reversão de risco (1 frase)",
  "cta": ["chamada para ação clara", "outra opção", "..."],
  "formato_canal": "a oferta montada e formatada pronta para o CANAL informado",
  "angulos": ["ângulo alternativo 1 da mesma oferta", "ângulo 2", "ângulo 3"],
  "quatro_perguntas": {
    "e_pra_mim": "como a oferta responde 'é para mim?'",
    "resolve": "como responde 'resolve meu problema?'",
    "por_que_funciona": "como responde 'por que funciona?'",
    "por_que_agora": "como responde 'por que agir agora?'"
  },
  "score": {
    "promessa": 0,
    "mecanismo": 0,
    "prova": 0,
    "urgencia": 0,
    "total": 0,
    "como_fortalecer": ["ação concreta para deixar a oferta mais forte", "..."]
  }
}

Regras: notas de 0 a 10 (total é a média). "como_fortalecer" com 2 a 4 ações \
concretas. Seja específico, use números, e escreva em português do Brasil.`;

// Monta o pedido do usuário a partir do formulário, só incluindo o que foi preenchido.
function montarPedido(d: OfertaInput): string {
  const linhas: string[] = [];
  const add = (rotulo: string, valor?: string) => {
    const v = (valor ?? "").trim();
    if (v) linhas.push(`- ${rotulo}: ${v}`);
  };
  add("O que vende", d.produto);
  add("Público-alvo", d.publico);
  add("Resultado concreto entregue", d.resultado);
  add("Nível de consciência do público", d.consciencia);
  add("Canal onde a oferta será usada", d.canal);
  add("Faixa de preço / ticket", d.ticket);
  add("Principal benefício sentido", d.beneficio);
  add("Por que não pode deixar de comprar", d.porque_agora);
  add("Promessa que já tem em mente", d.promessa);
  add("Mecanismo único / nome do método", d.mecanismo);
  add("Tempo de entrega da solução", d.tempo);
  add("Maior dor/objeção do cliente", d.dor);
  add("O que o concorrente não entrega", d.diferencial);
  add("Provas disponíveis (números, casos, depoimentos)", d.prova);
  add("O que o cliente recebe (stack)", d.oferta_stack);
  add("Garantia disponível", d.garantia);
  return `Monte a oferta completa a partir destes dados:\n${linhas.join("\n")}`;
}

export const estudoOferta = createServerFn({ method: "POST" })
  .inputValidator((p: OfertaInput) => p)
  .handler(async ({ data }): Promise<Oferta> => {
    const falha = (mensagem: string): Oferta => ({ erro: true, mensagem });

    if (!senhaValida(data.senha)) return falha("Senha incorreta.");
    if (!data.produto?.trim() || !data.publico?.trim() || !data.resultado?.trim()) {
      return falha("Preencha ao menos o que você vende, para quem e o resultado.");
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return falha(
        "ANTHROPIC_API_KEY não encontrada no servidor. Adicione-a nos Secrets do projeto na Lovable.",
      );
    }

    const messages = [{ role: "user", content: montarPedido(data) }];

    try {
      // Streaming evita timeout em respostas longas. Esta função é GERATIVA
      // (não pesquisa a web), então é rápida e barata comparada à análise de nicho.
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
          stream: true,
          thinking: { type: "adaptive" },
          output_config: { effort: "medium" },
          system: SYSTEM,
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
        return falha("A IA recusou este pedido. Tente reformular.");
      }

      const jsonStr = extrairJson(texto);
      if (!jsonStr) {
        return falha(`Resposta incompleta — tente de novo. Início: ${texto.slice(0, 150)}`);
      }
      try {
        return JSON.parse(jsonStr) as Oferta;
      } catch {
        return falha("A resposta veio longa demais e ficou incompleta. Tente de novo.");
      }
    } catch (e: any) {
      return falha(`Falha no servidor: ${e?.message ?? String(e)}`);
    }
  });
