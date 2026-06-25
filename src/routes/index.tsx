import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  ArrowRight,
  BarChart3,
  Network,
  UserRound,
  Loader2,
  RotateCcw,
  ExternalLink,
  Target,
  CircleCheck,
} from "lucide-react";
import { analisarNicho, type Analise } from "@/lib/analisarNicho";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent SaaS Skill — Pesquisa de Micro SaaS" },
      {
        name: "description",
        content:
          "Pesquise oportunidades de micro SaaS com o Agent SaaS Skill: ranking, dores, soluções, concorrentes e personas — com IA e dados da web.",
      },
    ],
  }),
  component: Index,
});

const DISPLAY = '"Space Grotesk", system-ui, sans-serif';
const BODY = '"DM Sans", system-ui, sans-serif';

const NICHOS_PADRAO =
  "pet shop, estética e salão, odontologia, academia, pequenos restaurantes, advocacia, imobiliária, contabilidade";
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

function soma(n?: Analise["notas"]): number {
  if (!n) return 0;
  return (
    (n.disposicao_pagar ?? 0) +
    (n.baixa_concorrencia ?? 0) +
    (n.facilidade_venda ?? 0) +
    (n.potencial_escala ?? 0)
  );
}

function Index() {
  const [input, setInput] = useState(NICHOS_PADRAO);
  const [results, setResults] = useState<Analise[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nichos = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!nichos.length) return;

    setLoading(true);
    setResults(null);
    const acc: Analise[] = [];
    for (const n of nichos) {
      setStatus(`Pesquisando "${n}"…`);
      try {
        const r = await analisarNicho({ data: n });
        acc.push(r);
      } catch (err) {
        acc.push({ nicho: n, erro: true });
      }
    }
    setResults(acc.sort((a, b) => soma(b.notas) - soma(a.notas)));
    setLoading(false);
  }

  function addChip(v: string) {
    const atual = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!atual.includes(v)) atual.push(v);
    setInput(atual.join(", "));
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden px-5 py-10 text-[#ECECF4]"
      style={{ fontFamily: BODY, background: "#07070c" }}
    >
      {/* Glows de fundo */}
      <div
        aria-hidden
        className="pointer-events-none fixed -left-32 -top-40 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "#4338ca" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-44 -right-36 h-[480px] w-[480px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "#7c3aed" }}
      />

      {!results ? (
        <SearchView
          input={input}
          setInput={setInput}
          onSubmit={onSubmit}
          addChip={addChip}
          loading={loading}
        />
      ) : (
        <ResultsView results={results} onReset={() => setResults(null)} />
      )}

      {loading && <Overlay status={status} />}
    </main>
  );
}

/* ---------------------------------------------------------------- Search */
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
    <div className="relative z-10 mx-auto w-full max-w-3xl">
      <header className="mb-12 flex items-center gap-3">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 6px 20px rgba(99,102,241,.45)",
          }}
        >
          <Search size={18} color="#fff" strokeWidth={2.4} />
        </div>
        <div style={{ fontFamily: DISPLAY }} className="text-lg font-semibold">
          Agent SaaS Skill{" "}
          <span className="font-medium text-[#9a9ab4]">· pesquisa de micro SaaS</span>
        </div>
      </header>

      <div className="text-center">
        <span className="mb-5 inline-block rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] text-[#9a9ab4]">
          Pesquisa de oportunidades com IA + dados da web
        </span>
        <h1
          style={{ fontFamily: DISPLAY, letterSpacing: "-0.03em" }}
          className="mx-auto max-w-2xl text-[clamp(30px,5vw,46px)] font-bold leading-[1.08]"
        >
          Descubra o seu próximo{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(120deg,#a5b4fc,#c4b5fd 55%,#f0abfc)",
            }}
          >
            micro SaaS
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[#9a9ab4]">
          Informe um ou mais nichos. A IA pesquisa o mercado e devolve ranking,
          dores, soluções, concorrentes e personas — em um relatório só.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-9 rounded-[22px] border border-white/10 p-5 backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,.045)",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,.6)",
        }}
      >
        <div className="relative">
          <Search size={18} className="absolute left-4 top-4 text-[#9a9ab4]" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex.: pet shop, estética, academia…"
            className="min-h-[88px] w-full resize-y rounded-2xl border border-white/10 bg-black/25 py-4 pl-12 pr-4 text-base leading-relaxed text-[#ECECF4] outline-none transition placeholder:text-[#6b6b86] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/40"
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
          Analisar nichos
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
        <p className="mt-3.5 text-center text-[13px] text-[#9a9ab4]">
          Separe vários nichos por vírgula · cada análise leva ~1–2 min
        </p>
      </form>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-3">
        <Feature icon={<BarChart3 size={20} />} titulo="Ranking">
          Notas de fit comparando todos os nichos.
        </Feature>
        <Feature icon={<Network size={20} />} titulo="Soluções">
          Dores, ideias de SaaS e brechas de mercado.
        </Feature>
        <Feature icon={<UserRound size={20} />} titulo="Personas">
          Quem compra, objeções e gatilhos de compra.
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-[18px] text-center">
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

/* --------------------------------------------------------------- Results */
function ResultsView({
  results,
  onReset,
}: {
  results: Analise[];
  onReset: () => void;
}) {
  const validos = results.filter((r) => !r.erro);
  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div style={{ fontFamily: DISPLAY }} className="text-lg font-semibold">
          Agent SaaS Skill
        </div>
        <button
          onClick={onReset}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#ECECF4] transition hover:bg-white/[0.08]"
        >
          <RotateCcw size={15} /> Nova pesquisa
        </button>
      </div>

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

      <div className="mt-8 space-y-6">
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
      className="mb-1.5 mt-4 text-[15px] font-semibold text-[#ECECF4]"
    >
      {children}
    </h4>
  );
}

function NichoCard({ a }: { a: Analise }) {
  if (a.erro) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h3 style={{ fontFamily: DISPLAY }} className="text-xl font-bold">
          {a.nicho}
        </h3>
        <p className="mt-2 text-sm text-[#9a9ab4]">
          Não foi possível analisar este nicho. Tente novamente.
        </p>
      </section>
    );
  }
  const p = a.persona;
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
            {a.dores.map((d, i) => (
              <li key={i}>
                <b>{d.problema}</b> — <i className="text-[#9a9ab4]">{d.custo}</i>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {a.solucoes?.length ? (
        <>
          <H3>Soluções / Ideias de SaaS</H3>
          <ul className="ml-4 list-disc space-y-1 text-sm text-[#cfcfe0]">
            {a.solucoes.map((s, i) => (
              <li key={i}>
                <b>{s.ideia}</b> — resolve: {s.dor} → {s.resultado}
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

      {p && (
        <div className="mt-4 rounded-xl border-l-2 border-amber-400 bg-amber-400/5 p-4">
          <H3>
            <span className="inline-flex items-center gap-2">
              <UserRound size={16} className="text-amber-300" /> Persona —{" "}
              {p.nome_ficticio}
            </span>
          </H3>
          <p className="text-sm text-[#cfcfe0]">
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
          <p className="mb-1 mt-2 text-sm font-semibold text-[#ECECF4]">Onde encontrar</p>
          <List items={p.onde_encontrar} />
          <p className="mt-2 text-sm text-[#cfcfe0]">
            <b>Disposição a pagar:</b> {p.disposicao_a_pagar}
          </p>
        </div>
      )}

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

/* --------------------------------------------------------------- Overlay */
function Overlay({ status }: { status: string }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center backdrop-blur-md"
      style={{ background: "rgba(7,7,12,.72)" }}
    >
      <div className="max-w-sm px-6 text-center">
        <Loader2 size={48} className="mx-auto mb-5 animate-spin text-[#8b5cf6]" />
        <h2 style={{ fontFamily: DISPLAY }} className="mb-2 text-xl font-semibold">
          Pesquisando o mercado…
        </h2>
        <p className="text-sm text-[#9a9ab4]">{status}</p>
        <p className="mt-2 text-xs text-[#6b6b86]">
          Não feche a aba. Cada nicho leva ~1–2 minutos.
        </p>
      </div>
    </div>
  );
}
