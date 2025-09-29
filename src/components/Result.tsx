import { Score, AspectKey, verdict } from "@/config/simulador";
import { Download, Printer, FileJson } from "lucide-react";

interface DecisionTrail {
  etapa: number;
  titulo: string;
  escolha: string;
  nota?: string;
  efeito: Partial<Score>;
}

interface ResultProps {
  score: Score;
  trail: DecisionTrail[];
  aspects: { key: AspectKey; label: string }[];
  onRestart: () => void;
}

export const Result = ({ score, trail, aspects, onRestart }: ResultProps) => {
  const result = verdict(score);

  const getRecommendations = () => {
    const recs: string[] = [];
    
    if (score.confianca < 75) {
      recs.push("Implementar programa de feedback contínuo e reconhecimento da equipe");
    }
    if (score.visao < 80) {
      recs.push("Desenvolver plano estratégico com metas claras e comunicação efetiva");
    }
    if (score.produtividade < 80) {
      recs.push("Revisar processos operacionais e investir em automação");
    }
    if (score.sustentabilidade < 80) {
      recs.push("Criar programa de sustentabilidade com métricas ESG definidas");
    }
    
    // Item fixo
    recs.push("AAR de 15 minutos pós-parada para captura de lições aprendidas");
    
    return recs;
  };

  const exportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      scoreFinal: score,
      media: result.avg,
      faixa: result.faixa,
      trilhaDeDecisoes: trail
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulador-decisao-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Status Cards */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="badge-status bg-success/20 text-success border-success/30">
          Concluído
        </div>
        <div className="badge-status bg-primary/20 text-primary border-primary/30">
          Média: {result.avg}
        </div>
        <div className={`badge-status ${result.classe.includes('success') ? 'bg-success/20 text-success border-success/30' : 
          result.classe.includes('warning') ? 'bg-warning/20 text-warning border-warning/30' : 
          'bg-destructive/20 text-destructive border-destructive/30'}`}>
          Faixa: {result.faixa}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Resumo Executivo */}
        <div className="card-simulator p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Resumo Executivo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Aspecto</th>
                  <th className="text-right py-2 text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {aspects.map(({ key, label }) => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{label}</td>
                    <td className="py-2 text-right font-medium text-foreground">
                      {Math.round(score[key])}
                    </td>
                  </tr>
                ))}
                <tr className="border-b-2 border-border font-semibold">
                  <td className="py-2 text-foreground">Média</td>
                  <td className="py-2 text-right text-foreground">{result.avg}</td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">Faixa</td>
                  <td className={`py-2 text-right font-medium ${result.classe}`}>
                    {result.faixa}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recomendações */}
        <div className="card-simulator p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Recomendações</h3>
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trilha de Decisões */}
      <div className="card-simulator p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Trilha de Decisões</h3>
        <div className="space-y-4">
          {trail.map((decision, index) => (
            <div key={index} className="border-l-2 border-primary pl-4 py-2">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">
                    {decision.etapa}. {decision.titulo}
                  </h4>
                  <p className="text-sm text-primary mt-1">{decision.escolha}</p>
                  {decision.nota && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {decision.nota}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {Object.entries(decision.efeito).map(([key, value]) => (
                    <span key={key} className={`ml-2 ${value! > 0 ? 'text-success' : 'text-destructive'}`}>
                      {key}: {value! > 0 ? '+' : ''}{value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 no-print">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Reiniciar Simulação
        </button>
        <button
          onClick={exportJSON}
          className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
        >
          <FileJson className="h-4 w-4" />
          Exportar JSON
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>
    </div>
  );
};