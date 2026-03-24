"use client";
import { useState, useEffect } from "react";
import {
  executarEncadeamento,
  type Regra,
  type ResultadoInferencia,
} from "@/lib/inference";

export default function Home() {
  // estado para fatos ativos
  const [fatosAtivos, setFatosAtivos] = useState<string[]>([]);
  const [novoFato, setNovoFato] = useState("");
  const [fatosCustomizados, setFatosCustomizados] = useState<string[]>([]);
  const [resultado, setResultado] = useState<ResultadoInferencia | null>(null);
  const [regras, setRegras] = useState<Regra[]>([]); // regras da api
  const [passoVisivel, setPassoVisivel] = useState(0);
  const [animando, setAnimando] = useState(false);

  // sintomas padrão para nao vir vazio
  const sintomasPredefinidos = [
    "Computador está lento",
    "Internet caindo constantemente",
    "Wi-Fi não conecta",
    "Ocorreu uma tela azul (BSOD)",
    "Aviso de pouco espaço em disco",
    "Computador não liga",
    "LED da placa-mãe apagado",
    "Velocidade muito abaixo do contratado",
  ];

  // // regras trazidas do json
  useEffect(() => {
    fetch("/api/regras")
      .then((res) => res.json())
      .then((data) => setRegras(data))
      .catch(() => { });
  }, []);

  // selecao de fato
  const handleCheckbox = (label: string) => {
    setFatosAtivos((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  // adiciona fato customizado
  const adicionarFato = () => {
    const fato = novoFato.trim();
    if (fato && !fatosCustomizados.includes(fato) && !sintomasPredefinidos.includes(fato)) {
      setFatosCustomizados((prev) => [...prev, fato]);
      setFatosAtivos((prev) => [...prev, fato]);
      setNovoFato("");
    }
  };

  // remover fayo customizado
  const removerFatoCustomizado = (fato: string) => {
    setFatosCustomizados((prev) => prev.filter((f) => f !== fato));
    setFatosAtivos((prev) => prev.filter((f) => f !== fato));
  };

  // encadeamento para frente
  const analisar = () => {
    if (fatosAtivos.length === 0) return;
    const res = executarEncadeamento(fatosAtivos, regras);
    setResultado(res);
    setPassoVisivel(0);

    // animação
    if (res.cadeia.length > 0) {
      setAnimando(true);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setPassoVisivel(step);
        if (step >= res.cadeia.length) {
          clearInterval(interval);
          setAnimando(false);
        }
      }, 800);
    }
  };

  const limpar = () => {
    setFatosAtivos([]);
    setFatosCustomizados([]);
    setResultado(null);
    setPassoVisivel(0);
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-white">
      <header className="border-b border-gray-800/50 bg-[#0a1128]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r text-blue-400">
                Sistema Especialista
              </h1>
            </div>
          </div>
          <a
            href="/admin"
            className="px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm text-gray-300 hover:text-white hover:border-blue-500/50 hover:bg-gray-700/60 transition-all duration-300"
          >
            Gerenciar Regras
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-gray-800/60 bg-[#0d1525]/80 backdrop-blur p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Base de Fatos — Sintomas
              </h2>

              <div className="space-y-2 mb-4">
                {sintomasPredefinidos.map((sintoma) => (
                  <label
                    key={sintoma}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${fatosAtivos.includes(sintoma)
                      ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                      : "bg-gray-900/30 border-gray-800/40 text-gray-400 hover:bg-gray-800/40 hover:text-gray-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={fatosAtivos.includes(sintoma)}
                      onChange={() => handleCheckbox(sintoma)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${fatosAtivos.includes(sintoma)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-600"
                        }`}
                    >
                      {fatosAtivos.includes(sintoma) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{sintoma}</span>
                  </label>
                ))}
              </div>

              {fatosCustomizados.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Fatos adicionados:
                  </p>
                  {fatosCustomizados.map((fato) => (
                    <div
                      key={fato}
                      className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    >
                      <span className="text-sm">{fato}</span>
                      <button
                        onClick={() => removerFatoCustomizado(fato)}
                        className="text-emerald-400 hover:text-red-400 transition-colors ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoFato}
                  onChange={(e) => setNovoFato(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarFato()}
                  placeholder="Inserir fato personalizado..."
                  className="flex-1 bg-[#0b1120] border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={adicionarFato}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/80 text-sm font-medium transition-all"
                  title="Adicionar fato"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800/60 bg-[#0d1525]/80 backdrop-blur p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Fatos Ativos ({fatosAtivos.length})
              </h2>
              {fatosAtivos.length === 0 ? (
                <p className="text-sm text-gray-600 italic">
                  Nenhum fato selecionado ainda.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {fatosAtivos.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={analisar}
                disabled={fatosAtivos.length === 0 || animando}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r bg-blue-400 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {animando
                  ? "Executando Inferência..."
                  : "Executar Encadeamento para Frente"}
              </button>
              {resultado && (
                <button
                  onClick={limpar}
                  className="w-full py-3 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/60 text-sm font-medium transition-all"
                >
                  Nova Consulta
                </button>
              )}
            </div>
          </div>


          <div className="lg:col-span-2 space-y-6">
            {!resultado ? (
              <div className="rounded-2xl border border-gray-800/40 bg-[#0d1525]/40 p-16 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Motor de Inferência
                </h3>
                <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                  Selecione os sintomas na base de fatos à esquerda e clique em{" "}
                  <strong className="text-blue-400">Executar Encadeamento</strong>{" "}
                  para o sistema analisar e gerar conclusões automaticamente.
                </p>
              </div>
            ) : resultado.conclusoes.length === 0 ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-12 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-amber-300 mb-2">
                  Nenhuma conclusão encontrada
                </h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Os fatos selecionados não ativaram nenhuma regra da base de
                  conhecimento. Tente selecionar outros sintomas ou adicione
                  novas regras no painel de administração.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                  <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Conclusões Geradas ({resultado.conclusoes.length})
                  </h2>
                  <div className="space-y-3">
                    {resultado.conclusoes.map((c, i) => (
                      <div
                        key={c}
                        className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
                        }}
                      >
                        <span className="text-emerald-400 font-bold text-lg mt-0.5">
                          ➜
                        </span>
                        <span className="text-emerald-200 font-medium">
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
                  <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Cadeia de Inferência — Passo a Passo
                  </h2>
                  <p className="text-xs text-gray-500 mb-6">
                    Total de iterações: {resultado.totalIteracoes} | Regras
                    disparadas: {resultado.regrasDisparadas.length}
                  </p>

                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/40 to-transparent"></div>

                    <div className="space-y-6">
                      {resultado.cadeia.map((passo, i) => (
                        <div
                          key={passo.passo}
                          className={`relative pl-14 transition-all duration-500 ${i < passoVisivel
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                            }`}
                        >
                          <div className="absolute left-3 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/30 z-10">
                            {passo.passo}
                          </div>

                          <div className="rounded-xl border border-gray-800/60 bg-[#0d1525]/80 p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold">
                                {passo.regraId}
                              </span>
                              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <span className="text-sm font-medium text-white">
                                {passo.conclusaoGerada}
                              </span>
                            </div>

                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1.5">
                                Condições satisfeitas:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {passo.condicoesUsadas.map((cond) => (
                                  <span
                                    key={cond}
                                    className="px-2.5 py-1 rounded-md bg-gray-800/60 border border-gray-700/40 text-xs text-gray-300"
                                  >
                                    {cond}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-[#080e1c]/80 border border-gray-800/40">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Explicação:
                              </p>
                              <p className="text-sm text-gray-300 leading-relaxed italic">
                                &quot;{passo.explicacao}&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* falando a lingua do usuario */}
                <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6">
                  <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Explicação
                  </h2>
                  <div className="space-y-4">
                    {resultado.cadeia.map((passo) => (
                      <p
                        key={passo.passo}
                        className="text-sm text-gray-300 leading-relaxed pl-4 border-l-2 border-purple-500/30"
                      >
                        {passo.explicacaoNatural}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-800/60 bg-[#0d1525]/80 p-6">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Base de Fatos Final
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resultado.fatosFinais.map((f) => (
                      <span
                        key={f}
                        className={`px-3 py-1.5 rounded-lg text-xs border ${fatosAtivos.includes(f)
                          ? "bg-gray-800/40 border-gray-700/40 text-gray-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-medium"
                          }`}
                      >
                        {fatosAtivos.includes(f) ? "" : ""}
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Fatos iniciais em <b>cinza</b> • Fatos derivados em{" "}
                    <span className="text-emerald-400">verde</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>


    </div>
  );
}