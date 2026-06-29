import { createServerFn } from "@tanstack/react-start";
import { senhaValida, extrairJson } from "./analisarNicho";

export type SecaoPersona = {
  titulo: string;
  resposta: string;
  pontos: string[];
};
export type EixoNucleo = { itens: string[]; saas: string };
export type Nucleo = {
  dores: EixoNucleo;
  medos: EixoNucleo;
  desejos: EixoNucleo;
  sintese: string;
};
export type Fonte = { titulo: string; url: string };
export type EstudoPersona = {
  titulo?: string;
  persona_nome?: string;
  resumo?: string;
  confiabilidade?: string;
  secoes?: SecaoPersona[];
  nucleo?: Nucleo;
  conclusao?: string;
  fontes?: Fonte[];
  erro?: boolean;
  mensagem?: string;
};

// Sonnet 4.6: ótimo custo-benefício. Troque para "claude-opus-4-8" para o máximo.
const MODELO = "claude-sonnet-4-6";

const SYSTEM = `Você é um pesquisador de personas e UX, especialista no mercado \
brasileiro. O usuário vai descrever, em linguagem natural, um nicho/produto e o \
que quer descobrir sobre a persona (o público-alvo). Leia a descrição dele com \
ATENÇÃO e ancore TODA a pesquisa no que ele escreveu — produto, região, faixa \
etária/renda, plataforma e o que ele quer descobrir. Se algo for ambíguo, adote \
a interpretação mais provável e siga (não faça perguntas de volta).

Faça uma pesquisa PROFUNDA e use a busca na web de forma agressiva para \
fundamentar com dados reais. Para NÚMEROS e dados de mercado, priorize fontes \
oficiais e confiáveis do Brasil (IBGE, Sebrae, DataSebrae, governo, associações \
do setor, relatórios de consultorias, Reclame Aqui). Para o lado qualitativo \
(dores, desejos, linguagem real), use também fóruns, grupos, Reddit, reviews e \
relatos. Responda de forma DIDÁTICA e empática, como uma conversa — explicando, \
não apenas listando.

REGRA DE HONESTIDADE: todo número ou afirmação factual deve indicar a origem — \
escreva "(fonte: <nome>)" quando vier de uma busca, ou "(estimativa)" quando for \
sua inferência. NUNCA invente estatística com aparência de dado oficial. É melhor \
dizer "não há dado público preciso, estima-se ~X" do que cravar um número falso.

Cubra OBRIGATORIAMENTE estas 12 seções, NESTA ordem, cada uma respondendo às \
perguntas-chave do tema:
1. Quem é (demografia & contexto)
2. Rotina & comportamento
3. Dores & problemas
4. Medos
5. Desejos & objetivos
6. Necessidades (job to be done)
7. Objeções & barreiras
8. Gatilhos & motivações
9. Onde está & quem influencia (canais)
10. Como resolve hoje (alternativas atuais)
11. Dinheiro & decisão
12. Emoções & identidade

Ao final responda APENAS com UM objeto JSON válido (sem texto/crase/markdown):
{
  "titulo": "título do estudo (a persona em foco)",
  "persona_nome": "nome fictício + 1 linha (ex: 'Ana, 38, mãe do Theo, que tem Síndrome de Down')",
  "resumo": "2-4 frases introdutórias e empáticas sobre quem é essa persona",
  "confiabilidade": "1-2 frases: o quanto este estudo se apoia em dados reais encontrados vs. estimativas, e onde os dados são mais frágeis",
  "secoes": [
    {
      "titulo": "Quem é (demografia & contexto)",
      "resposta": "parágrafo didático respondendo ao tema",
      "pontos": ["ponto-chave", "..."]
    }
  ],
  "nucleo": {
    "dores": { "itens": ["dor MAIS aguda atual", "..."], "saas": "como o micro SaaS resolve essa dor" },
    "medos": { "itens": ["medo / problema futuro", "..."], "saas": "como o micro SaaS evita esse medo" },
    "desejos": { "itens": ["o que ela realmente quer — a melhor versão", "..."], "saas": "como o micro SaaS entrega isso" },
    "sintese": "2-3 frases: como construir o micro SaaS sobre essa persona, ligando dores + medos + desejos"
  },
  "conclusao": "o que isso significa para o produto/SaaS: como atender melhor essa persona",
  "fontes": [{"titulo":"string","url":"string"}]
}

Regras: traga as 12 seções na ordem indicada; em cada uma, "resposta" com 2-3 \
frases e de 3 a 4 pontos CURTOS, com as marcações de fonte/estimativa onde houver \
dado. Em "nucleo", 3 itens por eixo, ligando cada um a como o micro SaaS resolve. \
Seja conciso para a resposta caber inteira; humano e fundamentado em dados reais.`;

export const estudoPersona = createServerFn({ method: "POST" })
  .inputValidator((p: { descricao: string; senha: string }) => p)
  .handler(async ({ data }): Promise<EstudoPersona> => {
    const { descricao, senha } = data;
    const falha = (mensagem: string): EstudoPersona => ({ erro: true, mensagem });

    if (!senhaValida(senha)) return falha("Senha incorreta.");

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return falha(
        "ANTHROPIC_API_KEY não encontrada no servidor. Adicione-a nos Secrets do projeto na Lovable.",
      );
    }

    const messages = [
      {
        role: "user",
        content: `Faça o estudo de persona para o seguinte pedido. Pesquise na web antes de responder.\n\n${descricao}`,
      },
    ];

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODELO,
          max_tokens: 14000,
          stream: true,
          thinking: { type: "adaptive" },
          output_config: { effort: "medium" },
          system: SYSTEM,
          tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
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
        return JSON.parse(jsonStr) as EstudoPersona;
      } catch {
        return falha("A resposta veio longa demais e ficou incompleta. Tente um pedido mais específico.");
      }
    } catch (e: any) {
      return falha(`Falha no servidor: ${e?.message ?? String(e)}`);
    }
  });
