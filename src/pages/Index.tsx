import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { AspectCard } from "@/components/AspectCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Question } from "@/components/Question";
import { Result } from "@/components/Result";
import { 
  CONFIG, 
  Score, 
  Choice, 
  clamp, 
  average, 
  riskLabel, 
  riskClass 
} from "@/config/simulador";
import { renderQuestion } from "@/utils/renderQuestion";
import { Effect, AnswerDetail } from "@/types/questions";
import { RotateCcw, FileJson, Printer } from "lucide-react";

interface DecisionTrail {
  etapa: number;
  titulo: string;
  escolha: string;
  nota?: string;
  efeito: Partial<Score>;
  justificativa?: string;
}

const Index = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState<Score>(CONFIG.initial);
  const [trail, setTrail] = useState<DecisionTrail[]>([]);

  // Combinar stages antigos com newStages (modulares)
  const allStages = [...CONFIG.stages, ...(CONFIG.newStages || [])];
  const isFinished = currentStage >= allStages.length;
  const currentStageData = currentStage < CONFIG.stages.length 
    ? CONFIG.stages[currentStage] 
    : null;
  const currentNewStageData = currentStage >= CONFIG.stages.length && CONFIG.newStages
    ? CONFIG.newStages[currentStage - CONFIG.stages.length]
    : null;
  
  const avgScore = useMemo(() => average(score), [score]);
  const risk = useMemo(() => riskLabel(avgScore), [avgScore]);
  const riskStyle = useMemo(() => riskClass(avgScore), [avgScore]);

  const handleChoice = (choice: Choice) => {
    // Update score with clamping
    const newScore = { ...score };
    Object.entries(choice.effect).forEach(([key, value]) => {
      if (value !== undefined) {
        newScore[key as keyof Score] = clamp(newScore[key as keyof Score] + value);
      }
    });

    // Add to trail
    const decision: DecisionTrail = {
      etapa: currentStage + 1,
      titulo: currentStageData?.title || "Pergunta modular",
      escolha: choice.label,
      nota: choice.note,
      efeito: choice.effect,
      justificativa: choice.justification,
    };

    setScore(newScore);
    setTrail(prev => [...prev, decision]);
    setCurrentStage(prev => prev + 1);
  };

  const handleModularAnswer = (effect: Effect, detail: AnswerDetail) => {
    // Update score with clamping
    const newScore = { ...score };
    Object.entries(effect).forEach(([key, value]) => {
      if (value !== undefined) {
        newScore[key as keyof Score] = clamp(newScore[key as keyof Score] + value);
      }
    });

    // Add to trail
    const decision: DecisionTrail = {
      etapa: currentStage + 1,
      titulo: currentNewStageData?.type === "multiple-choice" 
        ? currentNewStageData.question 
        : currentNewStageData?.prompt || "Pergunta interativa",
      escolha: detail.optionId 
        ? `Opção ${detail.optionId}` 
        : detail.selectedIds 
          ? `Selecionadas: ${detail.selectedIds.join(", ")}` 
          : detail.rankedIds 
            ? `Ranking: ${detail.rankedIds.join(" > ")}` 
            : "Resposta",
      efeito: effect,
      justificativa: detail.optionId && currentNewStageData?.type !== "word-picker"
        ? (currentNewStageData as any).options?.find((o: any) => o.id === detail.optionId)?.justification
        : undefined,
    };

    setScore(newScore);
    setTrail(prev => [...prev, decision]);
    setCurrentStage(prev => prev + 1);
  };

  const handleRestart = () => {
    setCurrentStage(0);
    setScore(CONFIG.initial);
    setTrail([]);
  };

  const exportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      scoreFinal: score,
      media: Math.round(avgScore),
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header badges={CONFIG.badges} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Aspect Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONFIG.aspects.map(({ key, label }) => (
            <AspectCard
              key={key}
              label={label}
              value={score[key]}
              aspectKey={key}
            />
          ))}
        </div>

        {/* Status and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="badge-status bg-muted/30 text-foreground border-border">
              Etapa {currentStage + 1} / {allStages.length}
            </div>
            <div className={`badge-status ${riskStyle}`}>
              Risco: {risk}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap no-print">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 border border-muted-foreground/30 text-muted-foreground rounded-lg hover:bg-muted/20 transition-colors text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm"
            >
              <FileJson className="h-4 w-4" />
              Exportar JSON
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 border border-accent/30 text-accent rounded-lg hover:bg-accent/10 transition-colors text-sm"
            >
              <Printer className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          current={currentStage} 
          total={allStages.length}
          className="max-w-2xl mx-auto"
        />

        {/* Main Content */}
        <div className="py-8">
          {isFinished ? (
            <Result 
              score={score}
              trail={trail}
              aspects={CONFIG.aspects}
              onRestart={handleRestart}
            />
          ) : currentStageData ? (
            <Question
              title={currentStageData.title}
              text={currentStageData.text}
              choices={currentStageData.choices}
              onChoose={handleChoice}
            />
          ) : currentNewStageData ? (
            renderQuestion(currentNewStageData, handleModularAnswer)
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Index;
