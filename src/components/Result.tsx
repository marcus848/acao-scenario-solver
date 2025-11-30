import { useEffect, useMemo, useState } from "react";
import { Score, AspectKey, verdict } from "@/config/simulador";
import { Download, Printer, FileJson, Send } from "lucide-react";
import { sendSessionToBackend, unitIdMap } from "@/lib/api";
import { toast } from "sonner";

interface DecisionTrail {
  etapa: number;
  titulo: string;
  escolha: string;
  nota?: string;
  efeito: Partial<Score>;
  justificativa?: string;
}

interface ResultProps {
  score: Score;
  trail: DecisionTrail[];
  aspects: { key: AspectKey; label: string }[];
  onRestart: () => void;
  selectedUnit: string; // Unidade selecionada no stage 1
}

export const Result = ({ score, trail, aspects, onRestart, selectedUnit }: ResultProps) => {
  const [isSending, setIsSending] = useState(false);
  const result = verdict(score);
  const labelByKey = useMemo(() => {
    const map: Record<AspectKey, string> = {
      seguranca: "",
      cpessoas: "",
      catitudes: "",
      cnegocios: ""
    };
    aspects.forEach(({ key, label }) => { map[key] = label; });
    return map;
  }, [aspects]);


  const saveToHistory = () => {
    try {
      const historyKey = "acao_historico";
      const existingHistory = localStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        scoreFinal: score,
        media: result.avg,
        faixa: result.faixa,
        trilhaDeDecisoes: trail
      };

      history.push(newEntry);
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save to history:", e);
    }
  };

  const getRecommendations = () => {
    const recs: string[] = [];

    if (score.cpessoas < 75) {
      recs.push("Implementar programa de feedback contínuo e reconhecimento da equipe");
    }
    if (score.catitudes < 80) {
      recs.push("Desenvolver plano estratégico com metas claras e comunicação efetiva");
    }
    if (score.seguranca < 80) {
      recs.push("Revisar processos operacionais e investir em automação");
    }
    if (score.cnegocios < 80) {
      recs.push("Criar programa de cnegocios com métricas ESG definidas");
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

  /**
   * Envia os dados da sessão para o backend PHP
   * 
   * ATENÇÃO: Certifique-se de que:
   * 1. O backend PHP está configurado em /api/save_session.php
   * 2. Os nomes das unidades no unitIdMap correspondem aos labels usados no stage 1
   * 3. As chaves do score (seguranca, cpessoas, catitudes, cnegocios) estão corretas
   */
  const handleSendToBackend = async () => {
    setIsSending(true);
    
    try {
      // Obter unit_id baseado na unidade selecionada
      const unit_id = unitIdMap[selectedUnit];
      
      if (!unit_id) {
        toast.error("Unidade não identificada. Verifique a seleção.");
        setIsSending(false);
        return;
      }

      // Gerar data e hora atuais
      const now = new Date();
      const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

      // Montar o payload
      // ATENÇÃO: Ajuste as chaves conforme seu banco de dados
      // O score usa cpessoas, catitudes, cnegocios
      // Mas o backend espera pessoas, atitudes, negocio (sem o 'c')
      const payload = {
        unit_id,
        date,
        time,
        seguranca: Math.round(score.seguranca),
        pessoas: Math.round(score.cpessoas),      // Remove o 'c' do nome
        atitudes: Math.round(score.catitudes),    // Remove o 'c' do nome
        negocio: Math.round(score.cnegocios),     // Remove o 'c' do nome e 's' do final
        band: result.faixa,                        // Faixa (Verde, Amarela, Vermelha)
        risk_level: result.faixa,                  // Pode usar a mesma faixa ou criar lógica diferente
        trail: trail.map(t => ({
          etapa: t.etapa,
          titulo: t.titulo,
          escolha: t.escolha,
          nota: t.nota,
          efeito: t.efeito,
          justificativa: t.justificativa
        }))
      };

      const response = await sendSessionToBackend(payload);

      if (response) {
        toast.success("Sessão enviada com sucesso para o backend!");
      } else {
        toast.error("Erro ao enviar sessão. Verifique o console.");
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast.error("Erro ao enviar sessão para o backend.");
    } finally {
      setIsSending(false);
    }
  };

  const recommendations = getRecommendations();

  // Save to history on component mount
  useEffect(() => {
    saveToHistory();
  }, []);

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
                  {decision.justificativa && (
                    <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-xs text-destructive font-medium mb-1">
                        💡 Análise do Impacto:
                      </p>
                      <p className="text-xs text-destructive/80 leading-relaxed">
                        {decision.justificativa}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-2">
                  {Object.entries(decision.efeito).map(([key, value]) => {
                    const lbl = labelByKey[key as AspectKey] ?? key;
                    const v = value ?? 0;
                    return (
                      <span
                        key={key}
                        className={`${v > 0 ? 'text-success' : 'text-destructive'} whitespace-nowrap`}
                      >
                        {lbl}: {v > 0 ? '+' : ''}{v}
                      </span>
                    );
                  })}

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 no-print">
        <button
          onClick={handleSendToBackend}
          disabled={isSending}
          className="flex items-center gap-2 px-6 py-3 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {isSending ? "Enviando..." : "Enviar para Backend"}
        </button>
        
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Reiniciar Simulação
        </button>
        {/* <button
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
        </button> */}
      </div>
    </div>
  );
};