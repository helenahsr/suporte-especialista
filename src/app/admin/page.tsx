"use client";
import { useState, useEffect } from "react";

type Regra = {
    id: string;
    condicoes: string[];
    conclusao: string;
    explicacao: string;
};

export default function AdminRegras() {
    // regras trazidas do json
    const [regras, setRegras] = useState<Regra[]>([]);
    // campos
    const [condicoes, setCondicoes] = useState("");
    const [conclusao, setConclusao] = useState("");
    const [explicacao, setExplicacao] = useState("");
    // status
    const [status, setStatus] = useState("");
    const [statusTipo, setStatusTipo] = useState<"success" | "error" | "">("");
    // edição
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    // exclusão
    const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);

    // carrega regras ao montar
    useEffect(() => {
        carregarRegras();
    }, []);

    // limpa mensagem de status
    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setStatus("");
                setStatusTipo("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const carregarRegras = async () => {
        setCarregando(true);
        try {
            const res = await fetch("/api/regras");
            const data = await res.json();
            setRegras(data);
        } catch {
            setStatus("❌ Erro ao carregar regras.");
            setStatusTipo("error");
        } finally {
            setCarregando(false);
        }
    };

    const limparFormulario = () => {
        setCondicoes("");
        setConclusao("");
        setExplicacao("");
        setEditandoId(null);
    };

    // cria ou atualiza regra
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const condicoesArray = condicoes
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== "");

        if (condicoesArray.length === 0) {
            setStatus("❌ Informe ao menos uma condição.");
            setStatusTipo("error");
            return;
        }

        const regra: any = {
            condicoes: condicoesArray,
            conclusao: conclusao.trim(),
            explicacao: explicacao.trim(),
        };

        try {
            let res: Response;

            if (editandoId) {
                // atualiza regra existente
                regra.id = editandoId;
                res = await fetch("/api/regras", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(regra),
                });
            } else {
                // cria nova regra
                res = await fetch("/api/regras", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(regra),
                });
            }

            if (res.ok) {
                setStatus(
                    editandoId
                        ? "✅ Regra atualizada com sucesso!"
                        : "✅ Regra cadastrada com sucesso!"
                );
                setStatusTipo("success");
                limparFormulario();
                carregarRegras();
            } else {
                setStatus("❌ Erro ao salvar regra.");
                setStatusTipo("error");
            }
        } catch {
            setStatus("❌ Erro de conexão.");
            setStatusTipo("error");
        }
    };

    // preenche formulário para edição
    const editarRegra = (regra: Regra) => {
        setCondicoes(regra.condicoes.join(", "));
        setConclusao(regra.conclusao);
        setExplicacao(regra.explicacao);
        setEditandoId(regra.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // remove regra
    const excluirRegra = async (id: string) => {
        try {
            const res = await fetch(`/api/regras?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setStatus(`✅ Regra ${id} removida com sucesso.`);
                setStatusTipo("success");
                setConfirmandoExclusao(null);
                carregarRegras();
            } else {
                setStatus("❌ Erro ao remover regra.");
                setStatusTipo("error");
            }
        } catch {
            setStatus("❌ Erro de conexão.");
            setStatusTipo("error");
        }
    };

    return (
        <div className="min-h-screen bg-[#060b18] text-white">
            <header className="border-b border-gray-800/50 bg-[#0a1128]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r text-purple-400">
                                Editor de Regras
                            </h1>
                        </div>
                    </div>
                    <a
                        href="/"
                        className="px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-gray-700/60 transition-all duration-300"
                    >
                        Voltar ao Sistema
                    </a>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {status && (
                    <div
                        className={`mb-6 p-4 rounded-xl border text-sm font-medium text-center transition-all ${statusTipo === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-red-500/10 border-red-500/30 text-red-300"
                            }`}
                    >
                        {status}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <div className="rounded-2xl border border-gray-800/60 bg-[#0d1525]/80 backdrop-blur p-8">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                {editandoId
                                    ? `Editando Regra ${editandoId}`
                                    : "Cadastrar Nova Regra"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        SE (Condições / Sintomas)
                                    </label>
                                    <input
                                        type="text"
                                        value={condicoes}
                                        onChange={(e) => setCondicoes(e.target.value)}
                                        placeholder="Ex: Wi-Fi não conecta, Roteador desligado"
                                        className="w-full bg-[#0b1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                                        required
                                    />
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        Separe múltiplas condições usando vírgulas.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        ENTÃO (Conclusão / Diagnóstico)
                                    </label>
                                    <input
                                        type="text"
                                        value={conclusao}
                                        onChange={(e) => setConclusao(e.target.value)}
                                        placeholder="Ex: Verificar fonte de energia"
                                        className="w-full bg-[#0b1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Explicação do Raciocínio
                                    </label>
                                    <textarea
                                        value={explicacao}
                                        onChange={(e) => setExplicacao(e.target.value)}
                                        placeholder="Ex: Como o Wi-Fi não conecta e o roteador está desligado, o problema é falta de energia."
                                        className="w-full bg-[#0b1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all h-28 resize-none"
                                        required
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-[#080e1c] border border-gray-800/40">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">
                                        Pré-visualização da regra:
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        <span className="text-purple-400 font-bold">SE</span>{" "}
                                        {condicoes || (
                                            <span className="text-gray-600">condições...</span>
                                        )}{" "}
                                        <span className="text-purple-400 font-bold">ENTÃO</span>{" "}
                                        {conclusao || (
                                            <span className="text-gray-600">conclusão...</span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 rounded-xl bg-purple-600 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-purple-500/20"
                                    >
                                        {editandoId
                                            ? "Salvar Alterações"
                                            : "Adicionar à Base de Conhecimento"}
                                    </button>
                                    {editandoId && (
                                        <button
                                            type="button"
                                            onClick={limparFormulario}
                                            className="px-6 py-3.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white text-sm font-medium transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div>
                        <div className="rounded-2xl border border-gray-800/60 bg-[#0d1525]/80 backdrop-blur p-8">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                Base de Regras ({regras.length} regras)
                            </h2>

                            {carregando ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                </div>
                            ) : regras.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className="text-gray-500 text-sm">
                                        Nenhuma regra cadastrada ainda.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {regras.map((regra) => (
                                        <div
                                            key={regra.id}
                                            className={`group rounded-xl border p-5 transition-all duration-200 ${editandoId === regra.id
                                                ? "border-purple-500/50 bg-purple-500/5"
                                                : "border-gray-800/40 bg-[#0b1120]/60 hover:border-gray-700/60"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 text-xs font-bold">
                                                    {regra.id}
                                                </span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => editarRegra(regra)}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition-all"
                                                    >
                                                        Editar
                                                    </button>
                                                    {confirmandoExclusao === regra.id ? (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => excluirRegra(regra.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-all"
                                                            >
                                                                Confirmar
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setConfirmandoExclusao(null)
                                                                }
                                                                className="px-3 py-1.5 rounded-lg bg-gray-700/40 text-gray-400 text-xs hover:bg-gray-700/60 transition-all"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                setConfirmandoExclusao(regra.id)
                                                            }
                                                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-all"
                                                        >
                                                            Excluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-sm text-gray-300">
                                                    <span className="text-purple-400 font-bold">
                                                        SE
                                                    </span>{" "}
                                                    {regra.condicoes.map((c, i) => (
                                                        <span key={c}>
                                                            <span className="px-2 py-0.5 rounded bg-gray-800/60 text-gray-300 text-xs mx-0.5">
                                                                {c}
                                                            </span>
                                                            {i < regra.condicoes.length - 1 && (
                                                                <span className="text-gray-500 text-xs mx-1">
                                                                    E
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </p>
                                                <p className="text-sm text-gray-300 mt-2">
                                                    <span className="text-emerald-400 font-bold">
                                                        ENTÃO
                                                    </span>{" "}
                                                    <span className="text-emerald-300">
                                                        {regra.conclusao}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* explicação */}
                                            <p className="text-xs text-gray-500 italic leading-relaxed">
                                                {regra.explicacao}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Scrollbar customizada */}

        </div>
    );
}