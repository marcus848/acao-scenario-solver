import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CONFIG, Score } from "@/config/simulador";
import { ArrowLeft, Download, FileJson, Trash2 } from "lucide-react";

interface DecisionTrail {
  etapa: number;
  titulo: string;
  escolha: string;
  nota?: string;
  efeito: Partial<Score>;
  justificativa?: string;
}

const Analise = () => {
  const navigate = useNavigate();
  const [trail, setTrail] = useState<DecisionTrail[]>([]);
  const [score, setScore] = useState<Score | null>(null);
  const [avgScore, setAvgScore] = useState<number>(0);

  useEffect(() => {
    try {
      const storedTrail = localStorage.getItem("acao_trail");
      const storedScore = localStorage.getItem("acao_score");
      const storedAvg = localStorage.getItem("acao_avg");

      if (storedTrail) setTrail(JSON.parse(storedTrail));
      if (storedScore) setScore(JSON.parse(storedScore));
      if (storedAvg) setAvgScore(JSON.parse(storedAvg));
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
      localStorage.removeItem("acao_trail");
      localStorage.removeItem("acao_score");
      localStorage.removeItem("acao_avg");
      setTrail([]);
      setScore(null);
      setAvgScore(0);
    }
  };

  const handleExportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      scoreFinal: score,
      media: avgScore,
      trilhaDeDecisoes: trail
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-decisoes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ["Etapa", "Título", "Escolha", "Nota", "Produtividade", "Confiança", "Visão", "Sustentabilidade", "Justificativa"];
    const rows = trail.map(t => [
      t.etapa,
      `"${t.titulo}"`,
      `"${t.escolha}"`,
      `"${t.nota || ''}"`,
      t.efeito.produtividade || 0,
      t.efeito.confianca || 0,
      t.efeito.visao || 0,
      t.efeito.sustentabilidade || 0,
      `"${t.justificativa || ''}"`
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-decisoes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              onClick={handleExportJSON}
              disabled={trail.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileJson className="h-4 w-4" />
              Exportar JSON
            </button>
            <button
              onClick={handleExportCSV}
              disabled={trail.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-accent/30 text-accent rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
            <button
              onClick={handleClearHistory}
              disabled={trail.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Histórico
            </button>
          </div>
        </div>

        {trail.length === 0 ? (
          <div className="card-question max-w-2xl mx-auto text-center p-8">
            <p className="text-muted-foreground text-lg">
              Nenhuma decisão registrada ainda. Complete o simulador para ver a análise.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            {score && (
              <div className="card-question max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Resumo por Aspecto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {CONFIG.aspects.map(({ key, label }) => (
                    <div
                      key={key}
                      className="p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm"
                    >
                      <p className="text-sm text-muted-foreground mb-1">{label}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {score[key]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">Média Geral</p>
                  <p className="text-3xl font-bold text-primary">{avgScore}</p>
                </div>
              </div>
            )}

            {/* Trail Table */}
            <div className="card-question">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Trilha de Decisões
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Etapa</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Título</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Escolha</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Nota</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Efeito</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trail.map((decision, index) => (
                      <tr
                        key={index}
                        className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-3 text-sm text-foreground">{decision.etapa}</td>
                        <td className="p-3 text-sm text-foreground">{decision.titulo}</td>
                        <td className="p-3 text-sm text-foreground">{decision.escolha}</td>
                        <td className="p-3 text-sm text-muted-foreground">{decision.nota || "-"}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatEffect(decision.efeito) || "-"}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {decision.justificativa || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analise;
