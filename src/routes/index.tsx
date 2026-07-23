import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRight,
  BarChart3,
  UserRound,
  Users,
  Lightbulb,
  Loader2,
  RotateCcw,
  ExternalLink,
  Target,
  CircleCheck,
  Telescope,
  Lock,
  Boxes,
  ShieldCheck,
  Sparkles,
  Zap,
  Gauge,
  Megaphone,
  Quote,
  Download,
  LayoutList,
} from "lucide-react";
import { analisarNicho, verificarSenha, type Analise } from "@/lib/analisarNicho";
import { estudoPersona, type EstudoPersona } from "@/lib/estudoPersona";
import { estudoOferta, type Oferta } from "@/lib/estudoOferta";
import { sistemaVendas, type Sistema } from "@/lib/sistemaVendas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent SaaS Skill — Pesquisa de Micro SaaS" },
      {
        name: "description",
        content:
          "Pesquise oportunidades de micro SaaS e faça estudos de persona com IA e dados da web.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap",
      },
    ],
  }),
  component: Index,
});

const DISPLAY = '"Space Grotesk", system-ui, sans-serif';
const BODY = '"DM Sans", system-ui, sans-serif';

type Modo = "nicho" | "persona" | "oferta" | "system";

const NICHO_PADRAO = "pet shop";
const CHIPS = [
  "pet shop",
  "estética e salão",
  "odontologia",
  "academia",
  "pequenos restaurantes",
  "advocacia",
  "imobiliária",
  "contabilidade",
];
const EXEMPLO_PERSONA =
  "Ex.: Quero criar um micro SaaS para alfabetização de crianças com Síndrome de Down. Quais problemas os pais dessas crianças vivem? Faça o estudo de persona dos pais.";

type OfertaForm = {
  produto: string;
  publico: string;
  resultado: string;
  consciencia: string;
  canal: string;
  ticket: string;
  beneficio: string;
  porque_agora: string;
  promessa: string;
  mecanismo: string;
  tempo: string;
  dor: string;
  diferencial: string;
  prova: string;
  oferta_stack: string;
  garantia: string;
};
const OFERTA_FORM_INICIAL: OfertaForm = {
  produto: "",
  publico: "",
  resultado: "",
  consciencia: "",
  canal: "",
  ticket: "",
  beneficio: "",
  porque_agora: "",
  promessa: "",
  mecanismo: "",
  tempo: "",
  dor: "",
  diferencial: "",
  prova: "",
  oferta_stack: "",
  garantia: "",
};
const CONSCIENCIA_OPCOES = [
  "Não sabe que tem o problema",
  "Sabe do problema, não da solução",
  "Conhece soluções, não a minha",
  "Já me conhece",
];
const CANAL_OPCOES = [
  "Anúncio",
  "Landing page",
  "E-mail",
  "WhatsApp",
  "VSL / vídeo",
  "Página de vendas",
];
const TICKET_OPCOES = ["Baixo (até R$97)", "Médio (R$97–997)", "Alto (R$997+)"];

type SistemaForm = {
  projeto: string;
  publico: string;
  promessa: string;
  transformacao: string;
  problema: string;
  solucao: string;
  beneficios: string;
  funcionalidades: string;
  provas: string;
  diferenciais: string;
  casos_uso: string;
  oferta: string;
  garantia: string;
  preco: string;
  cta: string;
  marca_nome: string;
  marca_cor: string;
};
const SISTEMA_FORM_INICIAL: SistemaForm = {
  projeto: "",
  publico: "",
  promessa: "",
  transformacao: "",
  problema: "",
  solucao: "",
  beneficios: "",
  funcionalidades: "",
  provas: "",
  diferenciais: "",
  casos_uso: "",
  oferta: "",
  garantia: "",
  preco: "",
  cta: "",
  marca_nome: "",
  marca_cor: "",
};

function soma(n?: Analise["notas"]): number {
  if (!n) return 0;
  return (
    (n.disposicao_pagar ?? 0) +
    (n.baixa_concorrencia ?? 0) +
    (n.facilidade_venda ?? 0) +
    (n.potencial_escala ?? 0)
  );
}

/* ------------------------------------------------------------------ Brand */
function Brand({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative grid h-10 w-10 place-items-center rounded-xl"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 0 0 1px rgba(255,255,255,.10), 0 8px 26px rgba(99,102,241,.55)",
        }}
      >
        <Telescope size={20} color="#fff" strokeWidth={2} />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 blur-md"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
        />
      </div>
      <div style={{ fontFamily: DISPLAY }} className="text-lg font-semibold tracking-tight">
        Agent SaaS Skill
        {subtitle && <span className="font-medium text-[#9a9ab4]"> · pesquisa de micro SaaS</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Index */
function Index() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<Modo>("nicho");

  // Modo nicho
  const [input, setInput] = useState(NICHO_PADRAO);
  const [results, setResults] = useState<Analise[] | null>(null);

  // Modo persona
  const [pInput, setPInput] = useState("");
  const [personaResult, setPersonaResult] = useState<EstudoPersona | null>(null);

  // Modo oferta
  const [oForm, setOForm] = useState<OfertaForm>(OFERTA_FORM_INICIAL);
  const [ofertaResult, setOfertaResult] = useState<Oferta | null>(null);

  // Modo system (estrutura da página de vendas)
  const [sForm, setSForm] = useState<SistemaForm>(SISTEMA_FORM_INICIAL);
  const [sistemaResult, setSistemaResult] = useState<Sistema | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const s = sessionStorage.getItem("ass_senha");
    if (s) {
      setSenha(s);
      setAutenticado(true);
    }
  }, []);

  function aoEntrar(s: string) {
    sessionStorage.setItem("ass_senha", s);
    setSenha(s);
    setAutenticado(true);
  }

  async function onNicho(e: React.FormEvent) {
    e.preventDefault();
    const nicho = input.split(",")[0]?.trim();
    if (!nicho) return;
    setLoading(true);
    setResults(null);
    setStatus(`Pesquisando "${nicho}"…`);
    let r: Analise;
    try {
      r = await analisarNicho({ data: { nicho, senha } });
    } catch (err: any) {
      r = {
        nicho,
        erro: true,
        mensagem: `Falha ao chamar o servidor: ${err?.message ?? String(err)}`,
      };
    }
    setResults([r]);
    setLoading(false);
  }

  async function onPersona(e: React.FormEvent) {
    e.preventDefault();
    const descricao = pInput.trim();
    if (!descricao) return;
    setLoading(true);
    setPersonaResult(null);
    setStatus("Pesquisando a persona…");
    let r: EstudoPersona;
    try {
      r = await estudoPersona({ data: { descricao, senha } });
    } catch (err: any) {
      r = {
        erro: true,
        mensagem: `Falha ao chamar o servidor: ${err?.message ?? String(err)}`,
      };
    }
    setPersonaResult(r);
    setLoading(false);
  }

  async function onOferta(e: React.FormEvent) {
    e.preventDefault();
    if (!oForm.produto.trim() || !oForm.publico.trim() || !oForm.resultado.trim()) return;
    setLoading(true);
    setOfertaResult(null);
    setStatus("Montando sua oferta…");
    let r: Oferta;
    try {
      r = await estudoOferta({ data: { ...oForm, senha } });
    } catch (err: any) {
      r = {
        erro: true,
        mensagem: `Falha ao chamar o servidor: ${err?.message ?? String(err)}`,
      };
    }
    setOfertaResult(r);
    setLoading(false);
  }

  async function onSystem(e: React.FormEvent) {
    e.preventDefault();
    if (
      !sForm.projeto.trim() ||
      !sForm.publico.trim() ||
      !sForm.promessa.trim() ||
      !sForm.transformacao.trim()
    )
      return;
    setLoading(true);
    setSistemaResult(null);
    setStatus("Montando a estrutura da sua página de vendas…");
    let r: Sistema;
    try {
      r = await sistemaVendas({ data: { ...sForm, senha } });
    } catch (err: any) {
      r = {
        erro: true,
        mensagem: `Falha ao chamar o servidor: ${err?.message ?? String(err)}`,
      };
    }
    setSistemaResult(r);
    setLoading(false);
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden px-5 py-10 text-[#ECECF4]"
      style={{ fontFamily: BODY, background: "#07070c" }}
    >
      {/* Grade futurista sutil */}
      <div
        aria-hidden
        className="no-print pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          opacity: 0.04,
          maskImage: "radial-gradient(ellipse at 50% 0%, #000 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 35%, transparent 78%)",
        }}
      />
      <div
        aria-hidden
        className="no-print pointer-events-none fixed -left-32 -top-40 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "#4338ca" }}
      />
      <div
        aria-hidden
        className="no-print pointer-events-none fixed -bottom-44 -right-36 h-[480px] w-[480px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "#7c3aed" }}
      />

      {!autenticado ? (
        <LoginGate onOk={aoEntrar} />
      ) : (
        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <TopBar modo={modo} setModo={setModo} />
          {modo === "nicho" ? (
            !results ? (
              <SearchView
                input={input}
                setInput={setInput}
                onSubmit={onNicho}
                addChip={(v) => setInput(v)}
                loading={loading}
              />
            ) : (
              <ResultsView results={results} onReset={() => setResults(null)} />
            )
          ) : modo === "persona" ? (
            !personaResult ? (
              <PersonaView
                input={pInput}
                setInput={setPInput}
                onSubmit={onPersona}
                loading={loading}
              />
            ) : (
              <PersonaResult dados={personaResult} onReset={() => setPersonaResult(null)} />
            )
          ) : modo === "oferta" ? (
            !ofertaResult ? (
              <OfertaView form={oForm} setForm={setOForm} onSubmit={onOferta} loading={loading} />
            ) : (
              <OfertaResult dados={ofertaResult} onReset={() => setOfertaResult(null)} />
            )
          ) : !sistemaResult ? (
            <SistemaView form={sForm} setForm={setSForm} onSubmit={onSystem} loading={loading} />
          ) : (
            <SistemaDoc dados={sistemaResult} onReset={() => setSistemaResult(null)} />
          )}
        </div>
      )}

      {loading && (
        <Overlay
          status={status}
          steps={modo === "system" ? SISTEMA_STEPS : undefined}
          dur={modo === "system" ? 70000 : 100000}
        />
      )}
    </main>
  );
}

/* ----------------------------------------------------------------- TopBar */
function TopBar({ modo, setModo }: { modo: Modo; setModo: (m: Modo) => void }) {
  const tab = (m: Modo, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setModo(m)}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm transition ${
        modo === m ? "bg-[#8b5cf6] text-white" : "text-[#9a9ab4] hover:text-[#ECECF4]"
      }`}
    >
      {icon} {label}
    </button>
  );
  return (
    <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-4">
      <Brand subtitle={false} />
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
        {tab("nicho", "Pesquisa de nichos", <Search size={15} />)}
        {tab("persona", "Estudo de persona", <Users size={15} />)}
        {tab("oferta", "PUV", <Sparkles size={15} />)}
        {tab("system", "System", <LayoutList size={15} />)}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Login */
function LoginGate({ onOk }: { onOk: (senha: string) => void }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [verificando, setVerificando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setVerificando(true);
    try {
      const r = await verificarSenha({ data: senha });
      if (r.ok) onOk(senha);
      else setErro("Senha incorreta.");
    } catch {
      setErro("Não consegui verificar agora. Tente de novo.");
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-sm flex-col items-center justify-center">
      <div className="mb-8">
        <Brand subtitle={false} />
      </div>
      <form
        onSubmit={entrar}
        className="w-full rounded-[22px] border border-white/10 p-6 backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,.045)",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,.6)",
        }}
      >
        <div className="mb-4 flex items-center gap-2 text-[#c4b5fd]">
          <Lock size={16} />
          <span style={{ fontFamily: DISPLAY }} className="text-[15px] font-semibold">
            Acesso restrito
          </span>
        </div>
        <label htmlFor="senha" className="text-sm text-[#9a9ab4]">
          Digite a senha para usar a ferramenta
        </label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoFocus
          placeholder="••••••••"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-base text-[#ECECF4] outline-none transition placeholder:text-[#6b6b86] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/40"
        />
        {erro && <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-200">{erro}</p>}
        <button
          type="submit"
          disabled={verificando}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          style={{
            fontFamily: BODY,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 12px 30px -8px rgba(99,102,241,.6)",
          }}
        >
          {verificando ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowRight size={18} strokeWidth={2.4} />
          )}
          Entrar
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------- Hero/Form UI */
function Hero({
  eyebrow,
  titulo,
  destaque,
  sub,
}: {
  eyebrow: string;
  titulo: string;
  destaque: string;
  sub: string;
}) {
  return (
    <div className="text-center">
      <span className="mb-5 inline-block rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] text-[#9a9ab4]">
        {eyebrow}
      </span>
      <h1
        style={{ fontFamily: DISPLAY, letterSpacing: "-0.03em" }}
        className="mx-auto max-w-2xl text-[clamp(28px,5vw,44px)] font-bold leading-[1.08]"
      >
        {titulo}{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(120deg,#a5b4fc,#c4b5fd 55%,#f0abfc)" }}
        >
          {destaque}
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#9a9ab4]">{sub}</p>
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,.045)",
  boxShadow: "0 24px 60px -20px rgba(0,0,0,.6)",
};

/* ---------------------------------------------------------------- Nicho */
function SearchView({
  input,
  setInput,
  onSubmit,
  addChip,
  loading,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  addChip: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Hero
        eyebrow="Pesquisa de oportunidades com IA + dados da web"
        titulo="Descubra o seu próximo"
        destaque="micro SaaS"
        sub="Informe um nicho. A IA pesquisa o mercado e devolve dados demográficos, dores, personas e ideias de micro SaaS — num relatório só."
      />
      <form
        onSubmit={onSubmit}
        className="mt-9 rounded-[22px] border border-white/10 p-5 backdrop-blur-xl"
        style={CARD_STYLE}
      >
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-[#9a9ab4]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex.: pet shop"
            className="w-full rounded-2xl border border-white/10 bg-black/25 py-3.5 pl-12 pr-4 text-base text-[#ECECF4] outline-none transition placeholder:text-[#6b6b86] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/40"
          />
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => addChip(c)}
              className="cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-[#9a9ab4] transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10 hover:text-[#ECECF4]"
            >
              + {c}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          style={{
            fontFamily: BODY,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 12px 30px -8px rgba(99,102,241,.6)",
          }}
        >
          Analisar nicho
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
        <p className="mt-3.5 text-center text-[13px] text-[#9a9ab4]">
          Uma pesquisa por vez · leva ~1–2 min
        </p>
      </form>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-3">
        <Feature icon={<BarChart3 size={20} />} titulo="Mercado">
          Dados demográficos, tamanho e crescimento do nicho.
        </Feature>
        <Feature icon={<UserRound size={20} />} titulo="Personas">
          Estudo de personas: dores, objeções e gatilhos.
        </Feature>
        <Feature icon={<Lightbulb size={20} />} titulo="Ideias">
          Várias ideias de micro SaaS com cobrança e MVP.
        </Feature>
      </div>
    </div>
  );
}

function Feature({
  icon,
  titulo,
  children,
}: {
  icon: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-[18px] text-center transition hover:border-[#8b5cf6]/40">
      <div className="mx-auto mb-2.5 grid h-10 w-10 place-items-center rounded-xl bg-[#8b5cf6]/15 text-[#c4b5fd]">
        {icon}
      </div>
      <h3 style={{ fontFamily: DISPLAY }} className="mb-1 text-[15px] font-semibold">
        {titulo}
      </h3>
      <p className="text-[13px] leading-snug text-[#9a9ab4]">{children}</p>
    </div>
  );
}

/* --------------------------------------------------------------- Persona */
function PersonaView({
  input,
  setInput,
  onSubmit,
  loading,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Hero
        eyebrow="Estudo de persona com IA + dados da web"
        titulo="Entenda quem é o seu"
        destaque="público-alvo"
        sub="Descreva o nicho/produto e o que quer descobrir. A IA pesquisa e responde as 12 áreas da persona: quem é, dores, medos, desejos, objeções e mais."
      />
      <form
        onSubmit={onSubmit}
        className="mt-9 rounded-[22px] border border-white/10 p-5 backdrop-blur-xl"
        style={CARD_STYLE}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={EXEMPLO_PERSONA}
          className="min-h-[140px] w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-4 text-base leading-relaxed text-[#ECECF4] outline-none transition placeholder:text-[#6b6b86] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          style={{
            fontFamily: BODY,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 12px 30px -8px rgba(99,102,241,.6)",
          }}
        >
          Fazer estudo de persona
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
        <p className="mt-3.5 text-center text-[13px] text-[#9a9ab4]">
          Pesquisa em tempo real na web · leva ~1–2 min
        </p>
      </form>
    </div>
  );
}

function PersonaResult({ dados, onReset }: { dados: EstudoPersona; onReset: () => void }) {
  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-end gap-2">
        <ExportarBtn />
        <button
          onClick={onReset}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#ECECF4] transition hover:bg-white/[0.08]"
        >
          <RotateCcw size={15} /> Novo estudo
        </button>
      </div>

      {dados.erro ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h3 style={{ fontFamily: DISPLAY }} className="text-xl font-bold">
            Não foi possível concluir o estudo.
          </h3>
          {dados.mensagem && (
            <p className="mt-2 break-words rounded-lg bg-red-500/10 p-3 text-xs text-red-200">
              {dados.mensagem}
            </p>
          )}
        </section>
      ) : (
        <>
          {dados.titulo && (
            <h2
              style={{ fontFamily: DISPLAY, letterSpacing: "-0.02em" }}
              className="text-2xl font-bold"
            >
              {dados.titulo}
            </h2>
          )}
          {dados.persona_nome && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1.5 text-sm text-amber-200">
              <UserRound size={15} /> {dados.persona_nome}
            </div>
          )}
          {dados.resumo && (
            <p className="mt-4 text-[15px] leading-relaxed text-[#cfcfe0]">{dados.resumo}</p>
          )}

          {dados.confiabilidade && (
            <div className="mt-4 flex gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-[13px] leading-relaxed text-amber-100/90">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-300" />
              <span>
                <b>Confiabilidade dos dados:</b> {dados.confiabilidade}
              </span>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {(dados.secoes ?? []).map((s, i) => (
              <section key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3
                  style={{ fontFamily: DISPLAY }}
                  className="mb-2 text-[17px] font-semibold text-[#ECECF4]"
                >
                  {s.titulo}
                </h3>
                {s.resposta && (
                  <p className="text-sm leading-relaxed text-[#cfcfe0]">{s.resposta}</p>
                )}
                {s.pontos?.length ? (
                  <ul className="ml-4 mt-2 list-disc space-y-1 text-sm text-[#cfcfe0]">
                    {s.pontos.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {dados.conclusao && (
            <div className="mt-6 flex gap-2 rounded-xl bg-indigo-500/10 p-4 text-sm text-[#ECECF4]">
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-indigo-300" />
              <span>
                <b>O que isso significa pro seu produto:</b> {dados.conclusao}
              </span>
            </div>
          )}

          {dados.nucleo && <Persona4D nucleo={dados.nucleo} nome={dados.persona_nome} />}

          {dados.fontes?.length ? (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#9a9ab4]">
              {dados.fontes.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#c4b5fd]"
                >
                  <ExternalLink size={12} /> {f.titulo}
                </a>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Oferta */
const INPUT_CLS =
  "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-[15px] text-[#ECECF4] outline-none transition placeholder:text-[#6b6b86] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/40";

function Campo({
  label,
  hint,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#cfcfe0]">
        {label}
        {hint && <span className="ml-1 text-[12px] font-normal text-[#9a9ab4]">· {hint}</span>}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${INPUT_CLS} min-h-[76px] resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={INPUT_CLS}
        />
      )}
    </label>
  );
}

function ChipSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-[#cfcfe0]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            onClick={() => onChange(value === o ? "" : o)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] transition ${
              value === o
                ? "border-[#8b5cf6] bg-[#8b5cf6]/20 text-white"
                : "border-white/10 bg-white/[0.03] text-[#9a9ab4] hover:text-[#ECECF4]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function OfertaView({
  form,
  setForm,
  onSubmit,
  loading,
}: {
  form: OfertaForm;
  setForm: (f: OfertaForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  const [mais, setMais] = useState(false);
  const set = (k: keyof OfertaForm) => (v: string) => setForm({ ...form, [k]: v });
  const pronto =
    form.produto.trim() !== "" && form.publico.trim() !== "" && form.resultado.trim() !== "";
  return (
    <div className="mx-auto max-w-2xl">
      <Hero
        eyebrow="Construtor de oferta com IA"
        titulo="Monte sua"
        destaque="proposta única de vendas"
        sub="Responda o essencial e a IA monta a oferta completa: promessa em 3 níveis, mecanismo único, provas, quebra de objeções e CTA — pronta pro seu canal."
      />
      <form
        onSubmit={onSubmit}
        className="mt-9 space-y-5 rounded-[22px] border border-white/10 p-5 backdrop-blur-xl"
        style={CARD_STYLE}
      >
        <div className="space-y-4">
          <Campo
            label="O que você vende?"
            value={form.produto}
            onChange={set("produto")}
            placeholder="Ex.: sistema de captação de pacientes para clínicas"
          />
          <Campo
            label="Para quem, exatamente?"
            hint="público + localização"
            value={form.publico}
            onChange={set("publico")}
            placeholder="Ex.: pequenas clínicas médicas em Guarulhos"
          />
          <Campo
            label="Qual resultado concreto você entrega?"
            value={form.resultado}
            onChange={set("resultado")}
            placeholder="Ex.: agenda lotada de novos pacientes"
          />
        </div>

        <ChipSelect
          label="Nível de consciência do público"
          options={CONSCIENCIA_OPCOES}
          value={form.consciencia}
          onChange={set("consciencia")}
        />
        <ChipSelect
          label="Onde a oferta vai ser usada?"
          options={CANAL_OPCOES}
          value={form.canal}
          onChange={set("canal")}
        />
        <ChipSelect
          label="Faixa de preço (ticket)"
          options={TICKET_OPCOES}
          value={form.ticket}
          onChange={set("ticket")}
        />

        <button
          type="button"
          onClick={() => setMais(!mais)}
          className="cursor-pointer text-sm text-[#c4b5fd] hover:underline"
        >
          {mais
            ? "− Ocultar detalhes"
            : "+ Adicionar detalhes (opcional — deixa a oferta mais afiada)"}
        </button>

        {mais && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <Campo
              label="Principal benefício sentido"
              hint="o 'e daí?' do resultado"
              value={form.beneficio}
              onChange={set("beneficio")}
              placeholder="Ex.: para de ter medo do fim do mês"
            />
            <Campo
              label="Por que ele não pode deixar de comprar?"
              value={form.porque_agora}
              onChange={set("porque_agora")}
              placeholder="Ex.: cada semana parada é paciente indo pra concorrência"
            />
            <Campo
              label="Promessa que já tem em mente"
              hint="a IA cria se vazio"
              value={form.promessa}
              onChange={set("promessa")}
            />
            <Campo
              label="Mecanismo único / nome do método"
              hint="a IA sugere se vazio"
              value={form.mecanismo}
              onChange={set("mecanismo")}
            />
            <Campo
              label="Tempo de entrega da solução"
              value={form.tempo}
              onChange={set("tempo")}
              placeholder="Ex.: em 20 dias"
            />
            <Campo
              label="Maior dor/objeção do cliente"
              value={form.dor}
              onChange={set("dor")}
              textarea
            />
            <Campo
              label="O que o concorrente NÃO entrega"
              value={form.diferencial}
              onChange={set("diferencial")}
              textarea
            />
            <Campo
              label="Provas que você já tem"
              hint="números, casos, depoimentos"
              value={form.prova}
              onChange={set("prova")}
              textarea
            />
            <Campo
              label="O que o cliente recebe (o pacote)"
              value={form.oferta_stack}
              onChange={set("oferta_stack")}
              textarea
            />
            <Campo label="Garantia disponível" value={form.garantia} onChange={set("garantia")} />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !pronto}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            fontFamily: BODY,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 12px 30px -8px rgba(99,102,241,.6)",
          }}
        >
          Gerar minha oferta
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
        <p className="text-center text-[13px] text-[#9a9ab4]">Gera em ~20–40s · sem tráfego pago</p>
      </form>
    </div>
  );
}

function BarraScore({ label, valor }: { label: string; valor: number }) {
  const pct = Math.max(0, Math.min(100, (valor / 10) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px] text-[#9a9ab4]">
        <span>{label}</span>
        <span className="text-[#ECECF4]">{valor}/10</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
        />
      </div>
    </div>
  );
}

function Bloco({
  icon,
  titulo,
  children,
}: {
  icon: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3
        style={{ fontFamily: DISPLAY }}
        className="mb-3 flex items-center gap-2 text-[16px] font-semibold text-[#ECECF4]"
      >
        {icon} {titulo}
      </h3>
      {children}
    </section>
  );
}

// Botão de exportar: usa a impressão nativa do navegador (Salvar como PDF),
// mantendo o visual da tela. É "no-print" para não aparecer no próprio PDF.
function ExportarBtn() {
  return (
    <button
      onClick={() => window.print()}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-sm text-[#c4b5fd] transition hover:bg-[#8b5cf6]/20"
    >
      <Download size={15} /> Exportar Pesquisa
    </button>
  );
}

function OfertaResult({ dados, onReset }: { dados: Oferta; onReset: () => void }) {
  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-end gap-2">
        <ExportarBtn />
        <button
          onClick={onReset}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#ECECF4] transition hover:bg-white/[0.08]"
        >
          <RotateCcw size={15} /> Nova oferta
        </button>
      </div>

      {dados.erro ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h3 style={{ fontFamily: DISPLAY }} className="text-xl font-bold">
            Não foi possível montar a oferta.
          </h3>
          {dados.mensagem && (
            <p className="mt-2 break-words rounded-lg bg-red-500/10 p-3 text-xs text-red-200">
              {dados.mensagem}
            </p>
          )}
        </section>
      ) : (
        <div className="space-y-4">
          {dados.score && (
            <section className="rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/[0.07] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3
                  style={{ fontFamily: DISPLAY }}
                  className="flex items-center gap-2 text-[16px] font-semibold"
                >
                  <Gauge size={18} className="text-[#c4b5fd]" /> Força da oferta
                </h3>
                <div className="text-2xl font-bold text-[#c4b5fd]">
                  {dados.score.total}
                  <span className="text-sm text-[#9a9ab4]">/10</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <BarraScore label="Promessa" valor={dados.score.promessa} />
                <BarraScore label="Mecanismo" valor={dados.score.mecanismo} />
                <BarraScore label="Prova" valor={dados.score.prova} />
                <BarraScore label="Urgência" valor={dados.score.urgencia} />
              </div>
              {dados.score.como_fortalecer?.length ? (
                <div className="mt-4">
                  <p className="mb-1.5 text-sm font-medium text-[#cfcfe0]">Como fortalecer:</p>
                  <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
                    {dados.score.como_fortalecer.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}

          {dados.promessa && (
            <Bloco
              icon={<Sparkles size={18} className="text-amber-300" />}
              titulo="Promessa (3 níveis)"
            >
              <div className="space-y-3">
                {[
                  { r: "Conservadora", t: dados.promessa.conservadora, c: "#7dd3fc" },
                  { r: "Ousada", t: dados.promessa.ousada, c: "#c4b5fd" },
                  { r: "Absurda", t: dados.promessa.absurda, c: "#fbbf24" },
                ].map((n) => (
                  <div key={n.r} className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <span
                      className="mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ background: `${n.c}22`, color: n.c }}
                    >
                      {n.r}
                    </span>
                    <p className="text-[15px] leading-relaxed text-[#ECECF4]">{n.t}</p>
                  </div>
                ))}
              </div>
            </Bloco>
          )}

          {dados.puv && (
            <Bloco
              icon={<Target size={17} className="text-indigo-300" />}
              titulo="PUV — Proposta Única de Vendas"
            >
              <p className="text-[15px] leading-relaxed text-[#cfcfe0]">{dados.puv}</p>
            </Bloco>
          )}

          {dados.mecanismo_unico && (
            <Bloco icon={<Zap size={17} className="text-violet-300" />} titulo="Mecanismo único">
              {dados.mecanismo_unico.nomes?.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {dados.mecanismo_unico.nomes.map((n, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 text-[13px] text-[#c4b5fd]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : null}
              {dados.mecanismo_unico.explicacao && (
                <p className="text-sm leading-relaxed text-[#cfcfe0]">
                  {dados.mecanismo_unico.explicacao}
                </p>
              )}
            </Bloco>
          )}

          {(dados.fator_tempo || dados.urgencia) && (
            <Bloco icon={<Zap size={17} className="text-emerald-300" />} titulo="Tempo & urgência">
              {dados.fator_tempo && (
                <p className="text-sm leading-relaxed text-[#cfcfe0]">
                  <b className="text-[#ECECF4]">Fator tempo:</b> {dados.fator_tempo}
                </p>
              )}
              {dados.urgencia && (
                <p className="mt-2 text-sm leading-relaxed text-[#cfcfe0]">
                  <b className="text-[#ECECF4]">Por que agir agora:</b> {dados.urgencia}
                </p>
              )}
            </Bloco>
          )}

          {dados.provas?.length ? (
            <Bloco icon={<CircleCheck size={17} className="text-emerald-300" />} titulo="Provas">
              <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
                {dados.provas.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {dados.diferenciais?.length ? (
            <Bloco icon={<Target size={17} className="text-indigo-300" />} titulo="Diferenciais">
              <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
                {dados.diferenciais.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {dados.objecoes?.length ? (
            <Bloco
              icon={<Quote size={17} className="text-amber-300" />}
              titulo="Quebra de objeções"
            >
              <div className="space-y-3">
                {dados.objecoes.map((o, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-[#ECECF4]">“{o.objecao}”</p>
                    <p className="text-sm leading-relaxed text-[#cfcfe0]">{o.resposta}</p>
                  </div>
                ))}
              </div>
            </Bloco>
          ) : null}

          {dados.oferta?.length ? (
            <Bloco
              icon={<Boxes size={17} className="text-violet-300" />}
              titulo="A oferta (o que recebe)"
            >
              <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
                {dados.oferta.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {dados.garantia && (
            <Bloco icon={<ShieldCheck size={17} className="text-emerald-300" />} titulo="Garantia">
              <p className="text-sm leading-relaxed text-[#cfcfe0]">{dados.garantia}</p>
            </Bloco>
          )}

          {dados.cta?.length ? (
            <Bloco
              icon={<ArrowRight size={17} className="text-indigo-300" />}
              titulo="CTA (chamadas para ação)"
            >
              <div className="flex flex-wrap gap-2">
                {dados.cta.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] text-[#ECECF4]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Bloco>
          ) : null}

          {dados.formato_canal && (
            <Bloco
              icon={<Megaphone size={17} className="text-amber-300" />}
              titulo="Pronto pro seu canal"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#ECECF4]">
                {dados.formato_canal}
              </p>
            </Bloco>
          )}

          {dados.angulos?.length ? (
            <Bloco
              icon={<Sparkles size={17} className="text-violet-300" />}
              titulo="Ângulos alternativos"
            >
              <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
                {dados.angulos.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {dados.quatro_perguntas && (
            <Bloco
              icon={<CircleCheck size={17} className="text-indigo-300" />}
              titulo="O teste das 4 perguntas"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[13px] font-semibold text-[#c4b5fd]">É pra mim?</p>
                  <p className="text-sm text-[#cfcfe0]">{dados.quatro_perguntas.e_pra_mim}</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#c4b5fd]">Resolve meu problema?</p>
                  <p className="text-sm text-[#cfcfe0]">{dados.quatro_perguntas.resolve}</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#c4b5fd]">Por que funciona?</p>
                  <p className="text-sm text-[#cfcfe0]">
                    {dados.quatro_perguntas.por_que_funciona}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#c4b5fd]">Por que agir agora?</p>
                  <p className="text-sm text-[#cfcfe0]">{dados.quatro_perguntas.por_que_agora}</p>
                </div>
              </div>
            </Bloco>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Persona 4D */
const EIXOS_4D = [
  { key: "dores" as const, label: "Dores", sub: "problemas atuais", color: "#f87171" },
  { key: "medos" as const, label: "Medos", sub: "problemas futuros", color: "#a78bfa" },
  { key: "desejos" as const, label: "Desejos", sub: "a melhor versão", color: "#34d399" },
];

function Persona4D({
  nucleo,
  nome,
}: {
  nucleo: NonNullable<EstudoPersona["nucleo"]>;
  nome?: string;
}) {
  const [rx, setRx] = useState(-14);
  const [ry, setRy] = useState(0);
  const [sel, setSel] = useState<"dores" | "medos" | "desejos">("dores");
  const drag = useRef({ on: false, x: 0, y: 0 });

  const SIZE = 340;
  const C = SIZE / 2;
  const R = 120;
  const pos = [-90, 30, 150].map((a) => {
    const rad = (a * Math.PI) / 180;
    return { x: C + R * Math.cos(rad), y: C + R * Math.sin(rad) };
  });

  function down(e: React.PointerEvent) {
    drag.current = { on: true, x: e.clientX, y: e.clientY };
  }
  function move(e: React.PointerEvent) {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    setRy((v) => v + dx * 0.45);
    setRx((v) => Math.max(-45, Math.min(45, v - dy * 0.45)));
  }
  function up() {
    drag.current.on = false;
  }

  const ini = (nome?.trim()?.[0] ?? "P").toUpperCase();
  const eixo = EIXOS_4D.find((e) => e.key === sel)!;
  const dados = nucleo[sel];

  return (
    <div className="mt-8">
      <h3
        style={{ fontFamily: DISPLAY }}
        className="mb-1 flex items-center gap-2 text-xl font-bold"
      >
        <Boxes size={20} className="text-[#c4b5fd]" /> Persona em 4D
      </h3>
      <p className="mb-4 text-sm text-[#9a9ab4]">
        Arraste para girar. Clique em um eixo para expandir os pontos mais agudos e como o micro
        SaaS resolve.
      </p>

      <div className="grid items-center gap-6 md:grid-cols-2">
        {/* Palco 3D */}
        <div
          className="relative mx-auto touch-none select-none"
          style={{ width: SIZE, height: SIZE, perspective: 1000, cursor: "grab" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        >
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
            }}
          >
            <svg width={SIZE} height={SIZE} className="pointer-events-none absolute inset-0">
              {EIXOS_4D.map((e, i) => (
                <line
                  key={e.key}
                  x1={C}
                  y1={C}
                  x2={pos[i].x}
                  y2={pos[i].y}
                  stroke={e.color}
                  strokeWidth={sel === e.key ? 3 : 1.5}
                  strokeOpacity={sel === e.key ? 0.9 : 0.4}
                />
              ))}
            </svg>

            {/* Núcleo (persona) */}
            <div
              className="absolute grid place-items-center rounded-full"
              style={{
                left: C,
                top: C,
                width: 96,
                height: 96,
                transform: "translate(-50%,-50%)",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow: "0 0 40px rgba(139,92,246,.6), inset 0 0 20px rgba(255,255,255,.15)",
              }}
            >
              <span style={{ fontFamily: DISPLAY }} className="text-2xl font-bold text-white">
                {ini}
              </span>
            </div>

            {/* Eixos */}
            {EIXOS_4D.map((e, i) => {
              const ativo = sel === e.key;
              return (
                <button
                  key={e.key}
                  onClick={() => setSel(e.key)}
                  className="absolute flex cursor-pointer flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition"
                  style={{
                    left: pos[i].x,
                    top: pos[i].y,
                    width: 116,
                    transform: "translate(-50%,-50%)",
                    borderColor: e.color,
                    background: ativo ? `${e.color}26` : "rgba(255,255,255,.04)",
                    boxShadow: ativo ? `0 0 22px ${e.color}66` : "none",
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: e.color }}>
                    {e.label}
                  </span>
                  <span className="text-[11px] text-[#9a9ab4]">{e.sub}</span>
                  <span className="mt-0.5 text-[11px] text-[#cfcfe0]">
                    {nucleo[e.key]?.itens?.length ?? 0} pontos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel do eixo selecionado */}
        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: `${eixo.color}55`, background: `${eixo.color}12` }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: DISPLAY }} className="text-lg font-bold">
              {eixo.label}
            </span>
            <span className="text-sm text-[#9a9ab4]">· {eixo.sub}</span>
          </div>
          <ul className="ml-4 mt-3 list-disc space-y-1.5 text-sm text-[#cfcfe0]">
            {(dados?.itens ?? []).map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
          {dados?.saas && (
            <div
              className="mt-4 rounded-xl p-3 text-sm text-[#ECECF4]"
              style={{ background: "rgba(255,255,255,.05)" }}
            >
              <b style={{ color: eixo.color }}>Como o micro SaaS resolve:</b> {dados.saas}
            </div>
          )}
        </div>
      </div>

      {nucleo.sintese && (
        <div
          className="mt-5 flex gap-2 rounded-xl p-4 text-sm text-[#ECECF4]"
          style={{ background: "rgba(139,92,246,.1)" }}
        >
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#c4b5fd]" />
          <span>
            <b>Construindo o micro SaaS sobre essa persona:</b> {nucleo.sintese}
          </span>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Results */
function ResultsView({ results, onReset }: { results: Analise[]; onReset: () => void }) {
  const validos = results.filter((r) => !r.erro);
  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-end gap-2">
        <ExportarBtn />
        <button
          onClick={onReset}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#ECECF4] transition hover:bg-white/[0.08]"
        >
          <RotateCcw size={15} /> Nova pesquisa
        </button>
      </div>

      {validos.length > 1 && (
        <>
          <h2
            style={{ fontFamily: DISPLAY }}
            className="mb-4 flex items-center gap-2 text-2xl font-bold"
          >
            <BarChart3 size={22} className="text-[#c4b5fd]" /> Ranking comparativo
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.05] text-left text-[#9a9ab4]">
                  <th className="p-3">#</th>
                  <th className="p-3">Nicho</th>
                  <th className="p-3 text-center">Paga?</th>
                  <th className="p-3 text-center">Baixa conc.</th>
                  <th className="p-3 text-center">Venda fácil</th>
                  <th className="p-3 text-center">Escala</th>
                  <th className="p-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {validos.map((r, i) => (
                  <tr key={r.nicho} className="border-t border-white/5">
                    <td className="p-3 text-[#9a9ab4]">{i + 1}º</td>
                    <td className="p-3 font-medium">{r.nicho}</td>
                    <td className="p-3 text-center">{r.notas?.disposicao_pagar ?? "-"}</td>
                    <td className="p-3 text-center">{r.notas?.baixa_concorrencia ?? "-"}</td>
                    <td className="p-3 text-center">{r.notas?.facilidade_venda ?? "-"}</td>
                    <td className="p-3 text-center">{r.notas?.potencial_escala ?? "-"}</td>
                    <td className="p-3 text-center font-semibold text-[#c4b5fd]">
                      {soma(r.notas)}/40
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="space-y-6">
        {results.map((r) => (
          <NichoCard key={r.nicho} a={r} />
        ))}
      </div>
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{ fontFamily: DISPLAY }}
      className="mb-1.5 mt-5 text-[15px] font-semibold text-[#ECECF4]"
    >
      {children}
    </h4>
  );
}

function Demo({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[11px] uppercase tracking-wide text-[#9a9ab4]">{label}</div>
      <div className="mt-0.5 text-sm text-[#ECECF4]">{value}</div>
    </div>
  );
}

function NichoCard({ a }: { a: Analise }) {
  if (a.erro) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h3 style={{ fontFamily: DISPLAY }} className="text-xl font-bold">
          {a.nicho}
        </h3>
        <p className="mt-2 text-sm text-[#9a9ab4]">Não foi possível analisar este nicho.</p>
        {a.mensagem && (
          <p className="mt-2 break-words rounded-lg bg-red-500/10 p-3 text-xs text-red-200">
            {a.mensagem}
          </p>
        )}
      </section>
    );
  }

  const d = a.dados_demograficos;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 style={{ fontFamily: DISPLAY }} className="text-xl font-bold capitalize">
          {a.nicho}
        </h3>
        <span className="rounded-full bg-[#6366f1] px-2.5 py-0.5 text-[13px] font-medium text-white">
          {soma(a.notas)}/40
        </span>
      </div>
      {a.visao_geral && <p className="mt-2 text-sm text-[#cfcfe0]">{a.visao_geral}</p>}

      {d && (
        <>
          <H3>Dados demográficos &amp; mercado</H3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Demo label="Tamanho do mercado" value={d.tamanho_mercado} />
            <Demo label="Nº de empresas" value={d.numero_de_empresas} />
            <Demo label="Crescimento" value={d.crescimento} />
            <Demo label="Regiões" value={d.regioes} />
            <Demo label="Perfil dos clientes" value={d.perfil_clientes} />
            <Demo label="Ticket médio" value={d.ticket_medio} />
          </div>
        </>
      )}

      {a.publico_alvo && (
        <>
          <H3>Público-alvo (quem compra)</H3>
          <p className="text-sm text-[#cfcfe0]">{a.publico_alvo}</p>
        </>
      )}

      {a.sub_nichos?.length ? (
        <>
          <H3>Sub-nichos</H3>
          <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
            {a.sub_nichos.map((s, i) => (
              <li key={i}>
                <b>{s.nome}</b> — {s.descricao}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {a.dores?.length ? (
        <>
          <H3>Dores / Problemas</H3>
          <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
            {a.dores.map((x, i) => (
              <li key={i}>
                <b>{x.problema}</b> — <i className="text-[#9a9ab4]">{x.custo}</i>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {a.concorrentes?.length ? (
        <>
          <H3>Concorrentes</H3>
          <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
            {a.concorrentes.map((c, i) => (
              <li key={i}>
                <b>{c.nome}</b> ({c.preco}) — {c.obs}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {a.brecha && (
        <p className="mt-4 flex gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-[#cfcfe0]">
          <Target size={16} className="mt-0.5 shrink-0 text-emerald-300" />
          <span>
            <b>Brecha:</b> {a.brecha}
          </span>
        </p>
      )}

      {a.personas?.length ? (
        <>
          <H3>
            <span className="inline-flex items-center gap-2">
              <Users size={16} className="text-amber-300" /> Estudo de personas
            </span>
          </H3>
          <div className="space-y-3">
            {a.personas.map((p, i) => (
              <div key={i} className="rounded-xl border-l-2 border-amber-400 bg-amber-400/5 p-4">
                <p
                  style={{ fontFamily: DISPLAY }}
                  className="text-[15px] font-semibold text-[#ECECF4]"
                >
                  {p.nome_ficticio}
                  {p.idade ? <span className="text-[#9a9ab4]"> · {p.idade}</span> : null}
                </p>
                <p className="mt-1 text-sm text-[#cfcfe0]">
                  <b>Perfil:</b> {p.perfil}
                </p>
                <p className="mt-1 text-sm text-[#cfcfe0]">
                  <b>Dia a dia:</b> {p.dia_a_dia}
                </p>
                <p className="mb-1 mt-2 text-sm font-semibold text-[#ECECF4]">Dores principais</p>
                <List items={p.dores_principais} />
                <p className="mb-1 mt-2 text-sm font-semibold text-[#ECECF4]">Objeções</p>
                <List items={p.objecoes} />
                <p className="mb-1 mt-2 text-sm font-semibold text-[#ECECF4]">Gatilhos de compra</p>
                <List items={p.gatilhos_de_compra} />
                <p className="mb-1 mt-2 text-sm font-semibold text-[#ECECF4]">
                  Onde encontrar / canais
                </p>
                <List items={p.canais} />
                <p className="mt-2 text-sm text-[#cfcfe0]">
                  <b>Disposição a pagar:</b> {p.disposicao_a_pagar}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {a.ideias_saas?.length ? (
        <>
          <H3>
            <span className="inline-flex items-center gap-2">
              <Lightbulb size={16} className="text-[#c4b5fd]" /> Ideias de micro SaaS
            </span>
          </H3>
          <div className="grid gap-3">
            {a.ideias_saas.map((idea, i) => (
              <div key={i} className="rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 p-4">
                <p
                  style={{ fontFamily: DISPLAY }}
                  className="text-[15px] font-semibold text-[#ECECF4]"
                >
                  {idea.nome}
                </p>
                <p className="mt-1 text-sm text-[#cfcfe0]">{idea.descricao}</p>
                <div className="mt-2 grid gap-1.5 text-sm text-[#cfcfe0]">
                  <p>
                    <b>Resolve:</b> {idea.problema_que_resolve}
                  </p>
                  <p>
                    <b>Resultado:</b> {idea.resultado}
                  </p>
                  <p>
                    <b>Público:</b> {idea.publico}
                  </p>
                  <p>
                    <b>Cobrança:</b> {idea.modelo_cobranca}
                  </p>
                  <p>
                    <b>Diferencial:</b> {idea.diferencial}
                  </p>
                </div>
                {idea.mvp?.length ? (
                  <>
                    <p className="mb-1 mt-2 text-sm font-semibold text-[#ECECF4]">
                      MVP (primeiras features)
                    </p>
                    <List items={idea.mvp} />
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {a.validacao?.length ? (
        <>
          <H3>Como validar (sem código)</H3>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-[#cfcfe0]">
            {a.validacao.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ol>
        </>
      ) : null}

      {a.veredito && (
        <p className="mt-4 flex gap-2 rounded-xl bg-indigo-500/10 p-3 text-sm text-[#ECECF4]">
          <CircleCheck size={16} className="mt-0.5 shrink-0 text-indigo-300" />
          <span>
            <b>Veredito:</b> {a.veredito}
          </span>
        </p>
      )}

      {a.fontes?.length ? (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#9a9ab4]">
          {a.fontes.map((f, i) => (
            <a
              key={i}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#c4b5fd]"
            >
              <ExternalLink size={12} /> {f.titulo}
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* --------------------------------------------------------------- System */
function SistemaView({
  form,
  setForm,
  onSubmit,
  loading,
}: {
  form: SistemaForm;
  setForm: (f: SistemaForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  const [mais, setMais] = useState(false);
  const set = (k: keyof SistemaForm) => (v: string) => setForm({ ...form, [k]: v });
  const pronto =
    form.projeto.trim() !== "" &&
    form.publico.trim() !== "" &&
    form.promessa.trim() !== "" &&
    form.transformacao.trim() !== "";
  return (
    <div className="mx-auto max-w-2xl">
      <Hero
        eyebrow="Construtor da página de vendas com IA"
        titulo="Monte o"
        destaque="System do seu projeto"
        sub="Responda sobre o projeto e a promessa. A IA entrega a estrutura completa da sua página de vendas — 22 seções preenchidas, fórmula psicológica e melhorias — pronta pra virar página real."
      />
      <form
        onSubmit={onSubmit}
        className="mt-9 space-y-5 rounded-[22px] border border-white/10 p-5 backdrop-blur-xl"
        style={CARD_STYLE}
      >
        <div className="space-y-4">
          <Campo
            label="O que é o projeto/produto?"
            value={form.projeto}
            onChange={set("projeto")}
            placeholder="Ex.: plataforma de pagamentos para infoprodutores"
            textarea
          />
          <Campo
            label="Para quem, exatamente?"
            hint="público-alvo"
            value={form.publico}
            onChange={set("publico")}
            placeholder="Ex.: infoprodutores e criadores de conteúdo no Brasil"
          />
          <Campo
            label="Qual a promessa principal?"
            hint="o que a pessoa ganha"
            value={form.promessa}
            onChange={set("promessa")}
            placeholder="Ex.: tudo pra vender online em uma só plataforma, do zero aos 7 dígitos"
            textarea
          />
          <Campo
            label="Qual a transformação? (antes → depois)"
            value={form.transformacao}
            onChange={set("transformacao")}
            placeholder="Ex.: de 6 ferramentas separadas e caras → uma operação integrada e barata"
            textarea
          />
        </div>

        <button
          type="button"
          onClick={() => setMais(!mais)}
          className="cursor-pointer text-sm text-[#c4b5fd] hover:underline"
        >
          {mais
            ? "− Ocultar detalhes"
            : "+ Adicionar detalhes (opcional — a IA preenche o que faltar)"}
        </button>

        {mais && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <Campo
              label="Problema / dores atuais"
              value={form.problema}
              onChange={set("problema")}
              textarea
            />
            <Campo
              label="Como a solução resolve"
              value={form.solucao}
              onChange={set("solucao")}
              textarea
            />
            <Campo
              label="Principais benefícios"
              value={form.beneficios}
              onChange={set("beneficios")}
              textarea
            />
            <Campo
              label="Funcionalidades / módulos"
              value={form.funcionalidades}
              onChange={set("funcionalidades")}
              textarea
            />
            <Campo
              label="Provas / números / casos"
              hint="métricas, resultados, depoimentos"
              value={form.provas}
              onChange={set("provas")}
              textarea
            />
            <Campo
              label="Diferenciais vs. concorrentes"
              value={form.diferenciais}
              onChange={set("diferenciais")}
              textarea
            />
            <Campo
              label="Casos de uso (pra quem serve)"
              value={form.casos_uso}
              onChange={set("casos_uso")}
            />
            <Campo label="Oferta / bônus" value={form.oferta} onChange={set("oferta")} textarea />
            <Campo label="Garantia" value={form.garantia} onChange={set("garantia")} />
            <Campo label="Preço / ticket" value={form.preco} onChange={set("preco")} />
            <Campo
              label="CTA desejado"
              value={form.cta}
              onChange={set("cta")}
              placeholder="Ex.: Criar conta grátis"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nome da marca" value={form.marca_nome} onChange={set("marca_nome")} />
              <Campo
                label="Cor de acento (hex)"
                hint="opcional"
                value={form.marca_cor}
                onChange={set("marca_cor")}
                placeholder="#141414"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !pronto}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            fontFamily: BODY,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 12px 30px -8px rgba(99,102,241,.6)",
          }}
        >
          Gerar o System
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
        <p className="text-center text-[13px] text-[#9a9ab4]">
          Gera em ~30–60s · documento completo
        </p>
      </form>
    </div>
  );
}

// Documento branco/preto (limpo) no modelo da estrutura de página de vendas.
const DOC = {
  ink: "#141414",
  soft: "#3d3d3d",
  muted: "#7a7a7a",
  line: "#e6e6e6",
  frame: "#dddddd",
  card2: "#f7f7f6",
};

function SistemaDoc({ dados, onReset }: { dados: Sistema; onReset: () => void }) {
  return (
    <div>
      <style>{`@media print{body,main{background:#fff !important}.no-print{display:none !important}}`}</style>
      <div className="no-print mb-6 flex items-center justify-end gap-2">
        <ExportarBtn />
        <button
          onClick={onReset}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#ECECF4] transition hover:bg-white/[0.08]"
        >
          <RotateCcw size={15} /> Novo System
        </button>
      </div>

      {dados.erro ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h3 style={{ fontFamily: DISPLAY }} className="text-xl font-bold">
            Não foi possível montar o System.
          </h3>
          {dados.mensagem && (
            <p className="mt-2 break-words rounded-lg bg-red-500/10 p-3 text-xs text-red-200">
              {dados.mensagem}
            </p>
          )}
        </section>
      ) : (
        <article
          className="mx-auto max-w-[1000px] overflow-hidden rounded-2xl"
          style={{ background: "#ffffff", color: DOC.ink, fontFamily: BODY, lineHeight: 1.6 }}
        >
          {/* Hero */}
          <header style={{ padding: "44px 40px 34px", borderBottom: `1px solid ${DOC.line}` }}>
            {dados.eyebrow && (
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: DOC.ink,
                  borderRadius: 999,
                  padding: "5px 13px",
                  marginBottom: 18,
                }}
              >
                {dados.eyebrow}
              </span>
            )}
            <h1
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(26px,4.4vw,42px)",
                fontWeight: 800,
                letterSpacing: "-.02em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {dados.titulo ?? "Página de Vendas"}
            </h1>
            {dados.resumo && (
              <p style={{ color: DOC.soft, fontSize: 16, maxWidth: 680, margin: "16px 0 0" }}>
                {dados.resumo}
              </p>
            )}
            {dados.tags?.length ? (
              <div style={{ marginTop: 22, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {dados.tags.map((t, i) => (
                  <span key={i} style={docTag}>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          <div style={{ padding: "8px 40px 40px" }}>
            {/* Intro: 3 perguntas */}
            {dados.intro?.length ? (
              <DocSection num="00" titulo="O que é e por que importa">
                <div className="grid gap-4 sm:grid-cols-3" style={{ marginTop: 4 }}>
                  {dados.intro.map((p, i) => (
                    <div key={i} style={docCard}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>
                        {i + 1}. “{p.pergunta}”
                      </h3>
                      <p style={{ color: DOC.muted, fontSize: 13.5, margin: 0 }}>{p.resposta}</p>
                    </div>
                  ))}
                </div>
              </DocSection>
            ) : null}

            {/* Identidade */}
            {dados.identidade && (
              <DocSection num="01" titulo="Identidade & Branding" k="a base visual">
                {dados.identidade.resumo && (
                  <p style={{ color: DOC.soft, maxWidth: 780, margin: "0 0 16px", fontSize: 15 }}>
                    {dados.identidade.resumo}
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                  {dados.identidade.cor_acento && (
                    <div style={docCard}>
                      <h3 style={docCardH}>Cor de acento</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            border: `1px solid ${DOC.line}`,
                            background: dados.identidade.cor_acento,
                          }}
                        />
                        <code style={{ fontSize: 12.5, color: DOC.muted }}>
                          {dados.identidade.cor_acento}
                        </code>
                      </div>
                    </div>
                  )}
                  {dados.identidade.tipografia && (
                    <div style={docCard}>
                      <h3 style={docCardH}>Tipografia</h3>
                      <p style={docCardP}>{dados.identidade.tipografia}</p>
                    </div>
                  )}
                  {dados.identidade.principio && (
                    <div style={docCard}>
                      <h3 style={docCardH}>Princípio</h3>
                      <p style={docCardP}>{dados.identidade.principio}</p>
                    </div>
                  )}
                </div>
              </DocSection>
            )}

            {/* As 22 seções */}
            {dados.secoes?.length ? (
              <DocSection num="22" titulo="A Estrutura Completa" k="seção por seção">
                <div style={{ marginTop: 4 }}>
                  {dados.secoes.map((s, i) => (
                    <DocBlock key={i} s={s} />
                  ))}
                </div>
              </DocSection>
            ) : null}

            {/* Fórmula */}
            {dados.formula?.length ? (
              <DocSection num="★" titulo="A Fórmula Psicológica" k="a ordem ideal">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  {dados.formula.map((f, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={f.destaque ? docChainHi : docChain}>{f.etapa}</span>
                      {i < dados.formula!.length - 1 && (
                        <span style={{ color: DOC.ink, fontWeight: 800 }}>→</span>
                      )}
                    </span>
                  ))}
                </div>
              </DocSection>
            ) : null}

            {/* Melhorias */}
            {dados.melhorias?.length ? (
              <DocSection num="➕" titulo="Melhorias sugeridas" k="para converter mais">
                <div className="grid gap-4 sm:grid-cols-3" style={{ marginTop: 4 }}>
                  {dados.melhorias.map((m, i) => (
                    <div key={i} style={docCard}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>
                        {m.titulo}
                      </h3>
                      <p style={docCardP}>{m.descricao}</p>
                    </div>
                  ))}
                </div>
                {dados.bloco_final && (
                  <div
                    style={{
                      marginTop: 18,
                      background: DOC.card2,
                      border: `1px solid ${DOC.line}`,
                      borderRadius: 14,
                      padding: 22,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 16, color: DOC.ink, fontWeight: 600 }}>
                      “{dados.bloco_final}”
                    </p>
                  </div>
                )}
              </DocSection>
            ) : null}
          </div>
        </article>
      )}
    </div>
  );
}

const docTag: React.CSSProperties = {
  fontSize: 12.5,
  color: DOC.soft,
  background: "#fff",
  border: `1px solid ${DOC.line}`,
  borderRadius: 999,
  padding: "6px 13px",
};
const docCard: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${DOC.line}`,
  borderRadius: 14,
  padding: 18,
};
const docCardH: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: 0 };
const docCardP: React.CSSProperties = { color: DOC.muted, fontSize: 13.5, margin: "6px 0 0" };
const docChain: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${DOC.frame}`,
  borderRadius: 999,
  padding: "7px 14px",
  fontSize: 13,
  fontWeight: 600,
  color: DOC.ink,
};
const docChainHi: React.CSSProperties = {
  ...docChain,
  background: DOC.ink,
  color: "#fff",
  border: `1px solid ${DOC.ink}`,
};

function DocSection({
  num,
  titulo,
  k,
  children,
}: {
  num: string;
  titulo: string;
  k?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ padding: "34px 0", borderBottom: `1px solid ${DOC.line}` }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 800,
            color: "#fff",
            background: DOC.ink,
            borderRadius: 8,
            padding: "3px 10px",
          }}
        >
          {num}
        </span>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(20px,3vw,28px)",
            fontWeight: 800,
            margin: 0,
          }}
        >
          {titulo}
        </h2>
        {k && <span style={{ color: DOC.muted, fontSize: 14 }}>{k}</span>}
      </div>
      {children}
    </section>
  );
}

function DocChips({ itens }: { itens?: string[] }) {
  if (!itens?.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {itens.map((c, i) => (
        <span
          key={i}
          style={{
            fontSize: 12.5,
            border: `1px solid ${DOC.frame}`,
            borderRadius: 8,
            padding: "5px 11px",
            color: DOC.soft,
            background: "#fff",
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function DocBlock({ s }: { s: NonNullable<Sistema["secoes"]>[number] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr",
        gap: 16,
        background: s.destaque ? DOC.card2 : "#fff",
        border: `1px solid ${s.destaque ? DOC.frame : DOC.line}`,
        borderRadius: 16,
        padding: "18px 20px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: DOC.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 15,
          color: "#fff",
        }}
      >
        {s.n}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, margin: 0 }}>
            {s.titulo}
          </h3>
          {s.chave && <span style={{ fontSize: 12.5, color: DOC.muted }}>{s.chave}</span>}
        </div>
        {s.proposito && (
          <p style={{ color: DOC.soft, fontSize: 14, margin: "6px 0 0" }}>{s.proposito}</p>
        )}

        {s.tipo === "hero" && s.hero && (
          <div
            style={{
              background: DOC.ink,
              borderRadius: 14,
              padding: "22px 20px",
              marginTop: 12,
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              {s.hero.eyebrow}
            </div>
            <h4
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(19px,3vw,26px)",
                fontWeight: 800,
                margin: "10px 0",
              }}
            >
              {s.hero.headline}
            </h4>
            <p
              style={{
                color: "rgba(255,255,255,.65)",
                maxWidth: 540,
                margin: "0 0 14px",
                fontSize: 14,
              }}
            >
              {s.hero.subheadline}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  borderRadius: 10,
                  padding: "9px 16px",
                  fontWeight: 700,
                  fontSize: 13,
                  background: "#fff",
                  color: DOC.ink,
                }}
              >
                {s.hero.cta_primario}
              </span>
              {s.hero.cta_secundario && (
                <span
                  style={{
                    borderRadius: 10,
                    padding: "9px 16px",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "1px solid rgba(255,255,255,.25)",
                    color: "#fff",
                  }}
                >
                  {s.hero.cta_secundario}
                </span>
              )}
            </div>
            {s.hero.bullets?.length ? (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  fontSize: 12.5,
                  color: "rgba(255,255,255,.7)",
                }}
              >
                {s.hero.bullets.map((b, i) => (
                  <span key={i}>{b}</span>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {s.tipo === "antes_depois" && s.antes_depois?.length ? (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {s.antes_depois.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: 12,
                  alignItems: "center",
                  background: "#fff",
                  border: `1px solid ${DOC.line}`,
                  borderRadius: 12,
                  padding: "11px 14px",
                }}
              >
                <span style={{ color: DOC.muted, fontSize: 13.5, textDecoration: "line-through" }}>
                  {r.antes}
                </span>
                <span style={{ fontWeight: 800 }}>→</span>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{r.depois}</span>
              </div>
            ))}
          </div>
        ) : null}

        {s.tipo === "comparativo" && s.comparativo?.length ? (
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 13.7 }}
          >
            <thead>
              <tr>
                <th style={{ ...docTh, color: DOC.muted }}>Mercado</th>
                <th style={{ ...docTh, color: DOC.ink }}>Este projeto</th>
              </tr>
            </thead>
            <tbody>
              {s.comparativo.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...docTd, color: DOC.muted }}>{r.de}</td>
                  <td style={{ ...docTd, color: DOC.ink, fontWeight: 700 }}>{r.para}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {s.tipo === "passos" && s.itens?.length ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            {s.itens.map((p, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "#fff",
                    border: `1px solid ${DOC.line}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    fontSize: 14,
                    minWidth: 120,
                    textAlign: "center",
                  }}
                >
                  {p}
                </span>
                {i < s.itens!.length - 1 && <span style={{ fontWeight: 800 }}>→</span>}
              </span>
            ))}
          </div>
        ) : null}

        {s.tipo === "faq" && s.itens?.length ? (
          <div style={{ marginTop: 12 }}>
            {s.itens.map((q, i) => (
              <div
                key={i}
                style={{
                  background: DOC.card2,
                  border: `1px solid ${DOC.line}`,
                  borderRadius: 10,
                  padding: "11px 14px",
                  marginTop: 8,
                  fontSize: 13.7,
                  fontWeight: 600,
                }}
              >
                ? {q}
              </div>
            ))}
          </div>
        ) : null}

        {(s.tipo === "chips" || s.tipo === "bons" || s.tipo === "ruins" || !s.tipo) &&
        s.itens?.length ? (
          <DocChips itens={s.itens} />
        ) : null}

        {s.tipo === "lista" && s.itens?.length ? (
          <ul style={{ margin: "11px 0 0", paddingLeft: 18 }}>
            {s.itens.map((x, i) => (
              <li key={i} style={{ margin: "3px 0", fontSize: 13.7, color: DOC.soft }}>
                {x}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

const docTh: React.CSSProperties = {
  padding: "11px 14px",
  textAlign: "left",
  borderBottom: `1px solid ${DOC.line}`,
  background: DOC.card2,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: ".05em",
};
const docTd: React.CSSProperties = {
  padding: "11px 14px",
  textAlign: "left",
  borderBottom: `1px solid ${DOC.line}`,
};

/* --------------------------------------------------------------- Overlay */
const SISTEMA_STEPS = [
  "Analisando o projeto e o público…",
  "Definindo promessa e headline…",
  "Montando o hero e a prova social…",
  "Escrevendo as 22 seções…",
  "Comparativos, passos e FAQ…",
  "Fórmula psicológica e melhorias…",
  "Finalizando o documento…",
];

function Overlay({
  status,
  steps,
  dur = 75000,
}: {
  status: string;
  steps?: string[];
  dur?: number;
}) {
  const [pct, setPct] = useState(4);
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / dur);
      const eased = 1 - Math.pow(1 - t, 2); // desacelera perto do fim
      setPct(4 + eased * 88); // vai até ~92% e espera o resultado real
    }, 250);
    return () => clearInterval(id);
  }, [dur]);

  const passo =
    steps && steps.length
      ? steps[Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length))]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center backdrop-blur-md"
      style={{ background: "rgba(7,7,12,.72)" }}
    >
      <div className="w-full max-w-sm px-6 text-center">
        <Loader2 size={44} className="mx-auto mb-5 animate-spin text-[#8b5cf6]" />
        <h2 style={{ fontFamily: DISPLAY }} className="mb-4 text-xl font-semibold">
          {status}
        </h2>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[#9a9ab4]">
          <span>{passo ?? "Pesquisando na web…"}</span>
          <span className="text-[#c4b5fd]">{Math.round(pct)}%</span>
        </div>
        <p className="mt-3 text-xs text-[#6b6b86]">Não feche a aba.</p>
      </div>
    </div>
  );
}
