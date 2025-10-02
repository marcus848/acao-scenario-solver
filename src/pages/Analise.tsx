import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CONFIG, Score } from "@/config/simulador";
import { ArrowLeft, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface DecisionTrail {
  etapa: number;
  titulo: string;
  escolha: string;
  nota?: string;
  efeito: Partial<Score>;
  justificativa?: string;
}

interface HistoryEntry {
  id: number;
  timestamp: string;
  scoreFinal: Score;
  media: number;
  faixa: string;
  trilhaDeDecisoes: DecisionTrail[];
}

const Analise = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("acao_historico");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico de respostas?")) {
      localStorage.removeItem("acao_historico");
      setHistory([]);
    }
  };

  const handleDeleteEntry = (id: number) => {
    if (confirm("Deseja excluir esta resposta do histórico?")) {
      const updated = history.filter(entry => entry.id !== id);
      setHistory(updated);
      localStorage.setItem("acao_historico", JSON.stringify(updated));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatEffect = (effect: Partial<Score>) => {
    return Object.entries(effect)
      .filter(([_, value]) => value !== undefined && value !== 0)
      .map(([key, value]) => {
        const sign = (value || 0) > 0 ? "+" : "";
        const label = CONFIG.aspects.find(a => a.key === key)?.label || key;
        return `${label}: ${sign}${value}`;
      })
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header badges={CONFIG.badges} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted/20 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Análise de Respostas
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleClearHistory}
              disabled={history.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Histórico
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="card-question max-w-2xl mx-auto text-center p-8">
            <p className="text-muted-foreground text-lg">
              Nenhuma resposta registrada ainda. Complete o simulador para registrar respostas.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="card-question max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Resumo Geral
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-1">Total de Respostas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {history.length}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-1">Média Geral</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(history.reduce((sum, h) => sum + h.media, 0) / history.length)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-1">Última Resposta</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(history[history.length - 1].timestamp)}
                  </p>
                </div>
              </div>
            </div>

            {/* Responses Table */}
            <div className="card-question">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Todas as Respostas ({history.length})
              </h2>
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry.id} className="border border-border rounded-lg overflow-hidden">
                    {/* Summary Row */}
                    <div 
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 transition-colors"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Data/Hora</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatDate(entry.timestamp)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Média</p>
                          <p className="text-sm font-bold text-primary">
                            {entry.media}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Faixa</p>
                          <p className="text-sm font-medium text-foreground">
                            {entry.faixa}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Excluir resposta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {expandedId === entry.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === entry.id && (
                      <div className="border-t border-border bg-muted/5 p-4 space-y-4">
                        {/* Aspect Scores */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Scores por Aspecto
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {CONFIG.aspects.map(({ key, label }) => (
                              <div
                                key={key}
                                className="p-3 rounded-lg border border-border bg-card/40"
                              >
                                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                <p className="text-lg font-bold text-foreground">
                                  {entry.scoreFinal[key]}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Decision Trail */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Trilha de Decisões ({entry.trilhaDeDecisoes.length} etapas)
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">Etapa</th>
                                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">Título</th>
                                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">Escolha</th>
                                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">Efeito</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.trilhaDeDecisoes.map((decision, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                                  >
                                    <td className="p-2 text-foreground">{decision.etapa}</td>
                                    <td className="p-2 text-foreground">{decision.titulo}</td>
                                    <td className="p-2 text-foreground">
                                      {decision.escolha}
                                      {decision.nota && (
                                        <span className="block text-xs text-muted-foreground italic mt-1">
                                          {decision.nota}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-xs text-muted-foreground">
                                      {formatEffect(decision.efeito) || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analise;
