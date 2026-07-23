import { createServerFn } from "@tanstack/react-start";
import { senhaValida, extrairJson } from "./analisarNicho";

// Entrada do formulário guiado da aba "System".
// Só projeto/publico/promessa/transformacao são obrigatórios; o resto a IA
// preenche/refina se vier vazio.
export type SistemaInput = {
  senha: string;
  // Obrigatório
  projeto: string; // o que é o projeto/produto
  publico: string; // para quem
  promessa: string; // promessa principal (o que a pessoa ganha)
  transformacao: string; // antes -> depois
  // Opcional (a IA completa o que faltar)
  problema?: string;
  solucao?: string;
  beneficios?: string;
  funcionalidades?: string;
  provas?: string; // números, métricas, casos
  diferenciais?: string;
  casos_uso?: string;
  oferta?: string; // oferta / bônus
  garantia?: string;
  preco?: string;
  cta?: string;
  marca_nome?: string;
  marca_cor?: string; // hex de acento (opcional)
};

export type SistemaSecao = {
  n: string; // "1".."22"
  titulo: string;
  chave?: string; // rótulo curto (ex: "orientação")
  proposito?: string;
  tipo?:
    | "lista"
    | "chips"
    | "ruins"
    | "bons"
    | "passos"
    | "faq"
    | "hero"
    | "comparativo"
    | "antes_depois";
  itens?: string[];
  hero?: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    bullets: string[];
    cta_primario: string;
    cta_secundario: string;
  };
  comparativo?: { de: string; para: string }[];
  antes_depois?: { antes: string; depois: string }[];
  destaque?: boolean;
};

export type SistemaPergunta = { pergunta: string; resposta: string };
export type SistemaMelhoria = { titulo: string; descricao: string };
export type SistemaFormula = { etapa: string; destaque?: boolean };

export type Sistema = {
  eyebrow?: string;
  titulo?: string;
  resumo?: string;
  tags?: string[];
  identidade?: {
    resumo?: string;
    cor_acento?: string;
    tipografia?: string;
    principio?: string;
  };
  intro?: SistemaPergunta[];
  secoes?: SistemaSecao[];
  formula?: SistemaFormula[];
  melhorias?: SistemaMelhoria[];
  bloco_final?: string;
  erro?: boolean;
  mensagem?: string;
};

// Sonnet 4.6: ótimo custo-benefício. Troque para "claude-opus-4-8" para o máximo.
const MODELO = "claude-sonnet-4-6";

const SYSTEM = `Você é um especialista sênior em estrutura e copywriting de PÁGINAS DE \
VENDAS de alta conversão (na linha de Alex Hormozi, Eugene Schwartz e Russell \
Brunson), atuando no mercado brasileiro. A partir das respostas de um formulário \
sobre um projeto/produto, você monta o "SYSTEM" — a ESTRUTURA COMPLETA da página \
de vendas daquele projeto, seção por seção, pronta para virar a página real.

Baseie-se RIGOROSAMENTE nesta estrutura de 22 seções (aplique CADA UMA ao projeto \
informado, com conteúdo concreto e específico — nada genérico):

1. Barra superior (Navigation) — logo + menu simples + 1 CTA destacado. tipo "chips".
2. Announcement Bar (opcional) — pequena barra com aviso/oferta. tipo "lista" (1-2 exemplos).
3. Hero Section (A MAIS IMPORTANTE) — tipo "hero": eyebrow (frase acima da headline), \
headline (a promessa — benefício + transformação + simplicidade), subheadline (o COMO), \
bullets de benefícios (3-5), cta_primario, cta_secundario. Em "itens" coloque uma nota \
sobre a imagem principal ideal (dashboard/mockup/vídeo/produto funcionando). destaque=true.
4. Social Proof imediato — números de impacto. tipo "bons" (chips com números). destaque=true.
5. O Problema (a dor) — o que a pessoa paga/sofre hoje separado. tipo "ruins" (chips com ❌).
6. A Solução — apresenta a marca resolvendo. tipo "lista" (proposito + headline da solução).
7. Benefícios (não funcionalidades) — traduza recurso -> ganho. tipo "antes_depois" \
(antes = recurso técnico, depois = o que a pessoa ganha). destaque=true.
8. Demonstração Visual — formas de mostrar (GIF, vídeo, dashboard, prints, antes/depois). tipo "chips".
9. Funcionalidades — cada uma ícone+título+descrição curta. tipo "chips".
10. Como funciona — 3 passos. tipo "passos" (exatamente 3 itens curtos).
11. Diferenciais — comparativo Mercado × Projeto. tipo "comparativo" (de=mercado, para=projeto).
12. Casos de uso (para quem serve). tipo "chips".
13. Resultados (reforço) — retoma números perto da decisão. tipo "bons". destaque=true.
14. Provas (depoimentos) — modelo foto+nome+empresa+cargo+resultado. tipo "lista" (1-2 modelos + o formato). destaque=true.
15. Logos (quem utiliza). tipo "chips".
16. Integrações. tipo "chips".
17. Segurança (muito ignorado) — LGPD, criptografia, SSL, backups, uptime. tipo "chips".
18. Preços — plano + o que inclui, sem esconder. tipo "lista". destaque=true.
19. Oferta (se houver) — bônus/condição especial. tipo "bons" ou "chips". destaque=true.
20. CTA Forte — headline de fechamento + botão. tipo "hero" (só headline + cta_primario, subheadline curta ou vazia). destaque=true.
21. FAQ (remover objeções) — 5-6 perguntas reais do público. tipo "faq".
22. Rodapé — empresa, contato, políticas, redes, CNPJ, endereço. tipo "chips".

REGRAS:
- Escreva a headline e a promessa fortes, específicas, com números quando fizer sentido, \
em português do Brasil. A boa headline responde "o que eu ganho?".
- CAMPOS VAZIOS: o usuário pode ter deixado campos em branco — GERE o conteúdo que faltar \
(problema, benefícios, provas, funcionalidades, FAQ, oferta). O que ele preencheu, refine \
sem descaracterizar. Não invente números falsos: quando não houver dados, use provas em \
formato de gancho ("+X clientes", "resultado médio de…") deixando claro que é um placeholder a preencher.
- Em nichos sensíveis (saúde, finanças, jurídico) nunca prometa cura/ganho garantido; foque \
em resultado de negócio, ousado mas defensável.
- "identidade.cor_acento" = use a cor de acento informada (hex) se houver; senão sugira uma.

Ao final responda APENAS com UM objeto JSON válido (sem texto/crase/markdown) exatamente \
neste formato:
{
  "eyebrow": "frase curta acima do título (ex: 'Material · Página de Vendas')",
  "titulo": "título do documento: nome do projeto + 'Página de Vendas'",
  "resumo": "1-2 frases resumindo o que a página de vendas deve entregar para este projeto",
  "tags": ["3 tags curtas de contexto"],
  "identidade": {
    "resumo": "1-2 frases sobre a base visual/branding recomendada",
    "cor_acento": "#hex",
    "tipografia": "recomendação de fonte/estilo",
    "principio": "o princípio visual (ex: consistência gera confiança antes da leitura)"
  },
  "intro": [
    {"pergunta": "O que eu ganho?", "resposta": "como o topo entrega isso neste projeto"},
    {"pergunta": "Isso é pra mim e funciona?", "resposta": "como o meio sustenta a promessa"},
    {"pergunta": "Por que agir agora?", "resposta": "como o fim quebra objeções e cria urgência"}
  ],
  "secoes": [
    {"n":"1","titulo":"...","chave":"...","proposito":"...","tipo":"chips","itens":["..."],"destaque":false},
    {"n":"3","titulo":"Hero Section","chave":"a mais importante","proposito":"...","tipo":"hero","hero":{"eyebrow":"...","headline":"...","subheadline":"...","bullets":["✔ ...","✔ ..."],"cta_primario":"...","cta_secundario":"..."},"itens":["nota sobre a imagem principal"],"destaque":true},
    {"n":"7","titulo":"Benefícios","tipo":"antes_depois","antes_depois":[{"antes":"recurso técnico","depois":"ganho real"}],"destaque":true},
    {"n":"10","titulo":"Como funciona","tipo":"passos","itens":["Passo 1: ...","Passo 2: ...","Passo 3: ..."]},
    {"n":"11","titulo":"Diferenciais","tipo":"comparativo","comparativo":[{"de":"jeito do mercado","para":"jeito do projeto"}]},
    {"n":"21","titulo":"FAQ","tipo":"faq","itens":["Pergunta 1?","Pergunta 2?"]}
  ],
  "formula": [
    {"etapa":"Headline","destaque":true},{"etapa":"Subheadline"},{"etapa":"CTA","destaque":true},
    {"etapa":"Prova social"},{"etapa":"Problema"},{"etapa":"Solução"},{"etapa":"Benefícios"},
    {"etapa":"Como funciona"},{"etapa":"Funcionalidades"},{"etapa":"Resultados"},{"etapa":"Depoimentos"},
    {"etapa":"Integrações"},{"etapa":"Segurança"},{"etapa":"Preço"},{"etapa":"Oferta","destaque":true},
    {"etapa":"CTA","destaque":true},{"etapa":"FAQ"},{"etapa":"Footer"}
  ],
  "melhorias": [{"titulo":"emoji + título curto","descricao":"o que adicionar e por que converte mais neste projeto"}],
  "bloco_final": "uma frase emocional de fechamento para este projeto (a transformação em 1 linha)"
}

O array "secoes" DEVE conter AS 22 SEÇÕES, na ordem de 1 a 22, cada uma preenchida para \
ESTE projeto (o exemplo acima só mostra o formato de alguns tipos). Seja específico, use o \
vocabulário do nicho, e escreva tudo em português do Brasil.`;

// Monta o pedido do usuário a partir do formulário, só incluindo o que foi preenchido.
function montarPedido(d: SistemaInput): string {
  const linhas: string[] = [];
  const add = (rotulo: string, valor?: string) => {
    const v = (valor ?? "").trim();
    if (v) linhas.push(`- ${rotulo}: ${v}`);
  };
  add("O que é o projeto/produto", d.projeto);
  add("Público-alvo (para quem)", d.publico);
  add("Promessa principal (o que a pessoa ganha)", d.promessa);
  add("Transformação (antes → depois)", d.transformacao);
  add("Problema / dores atuais", d.problema);
  add("Como a solução resolve", d.solucao);
  add("Principais benefícios", d.beneficios);
  add("Funcionalidades / módulos", d.funcionalidades);
  add("Provas / números / casos", d.provas);
  add("Diferenciais vs. concorrentes", d.diferenciais);
  add("Casos de uso (pra quem serve)", d.casos_uso);
  add("Oferta / bônus", d.oferta);
  add("Garantia", d.garantia);
  add("Preço / ticket", d.preco);
  add("CTA desejado", d.cta);
  add("Nome da marca", d.marca_nome);
  add("Cor de acento da marca (hex)", d.marca_cor);
  return `Monte o SYSTEM completo da página de vendas a partir destes dados:\n${linhas.join("\n")}`;
}

export const sistemaVendas = createServerFn({ method: "POST" })
  .inputValidator((p: SistemaInput) => p)
  .handler(async ({ data }): Promise<Sistema> => {
    const falha = (mensagem: string): Sistema => ({ erro: true, mensagem });

    if (!senhaValida(data.senha)) return falha("Senha incorreta.");
    if (
      !data.projeto?.trim() ||
      !data.publico?.trim() ||
      !data.promessa?.trim() ||
      !data.transformacao?.trim()
    ) {
      return falha("Preencha ao menos: o projeto, para quem, a promessa e a transformação.");
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
      // (não pesquisa a web), então é rápida comparada à análise de nicho.
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODELO,
          max_tokens: 16000,
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
        return JSON.parse(jsonStr) as Sistema;
      } catch {
        return falha("A resposta veio longa demais e ficou incompleta. Tente de novo.");
      }
    } catch (e: any) {
      return falha(`Falha no servidor: ${e?.message ?? String(e)}`);
    }
  });
