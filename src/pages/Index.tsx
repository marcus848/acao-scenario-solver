import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { AspectCard } from "@/components/AspectCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Question } from "@/components/Question";
import { SplitQuestion } from "@/components/SplitQuestion";
import { WordSelection1 } from "@/components/WordSelection1";
import { WordSelection2 } from "@/components/WordSelection2";
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

  const isFinished = currentStage >= CONFIG.stages.length;
  const currentStageData = CONFIG.stages[currentStage];
  
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
      titulo: currentStageData.title,
      escolha: choice.label,
      nota: choice.note,
      efeito: choice.effect,
      justificativa: choice.justification,
    };

    setScore(newScore);
    setTrail(prev => [...prev, decision]);
    setCurrentStage(prev => prev + 1);
  };

  const handleWordSelection = (selectedIds: string[], type: "word-selection-1" | "word-selection-2") => {
    const words = currentStageData.words || [];
    let effect: Partial<Score> = {};
    let resultText = "";

    if (type === "word-selection-1") {
      // Type 1: Only correct words give points
      const correctSelected = selectedIds.filter(id => 
        words.find(w => w.id === id && w.isCorrect)
      );
      const correctPercentage = (correctSelected.length / selectedIds.length) * 100;
      
      if (correctPercentage >= 80) {
        effect = { produtividade: +5, confianca: +5, visao: +5, sustentabilidade: +5 };
        resultText = "Excelente seleção!";
      } else if (correctPercentage >= 60) {
        effect = { produtividade: +3, confianca: +3, visao: +3, sustentabilidade: +3 };
        resultText = "Boa seleção!";
      } else {
        effect = { produtividade: +1, confianca: +1, visao: +1, sustentabilidade: +1 };
        resultText = "Seleção regular.";
      }
    } else {
      // Type 2: Words have positive or negative points
      let totalPoints = 0;
      selectedIds.forEach(id => {
        const word = words.find(w => w.id === id);
        if (word && word.points) {
          totalPoints += word.points;
        }
      });

      const pointsPerAspect = Math.round(totalPoints / 4);
      effect = {
        produtividade: pointsPerAspect,
        confianca: pointsPerAspect,
        visao: pointsPerAspect,
        sustentabilidade: pointsPerAspect
      };
      resultText = totalPoints > 0 ? "Boas escolhas!" : "Escolhas questionáveis.";
    }

    // Update score
    const newScore = { ...score };
    Object.entries(effect).forEach(([key, value]) => {
      if (value !== undefined) {
        newScore[key as keyof Score] = clamp(newScore[key as keyof Score] + value);
      }
    });

    // Add to trail
    const selectedWords = selectedIds.map(id => 
      words.find(w => w.id === id)?.text || id
    ).join(", ");

    const decision: DecisionTrail = {
      etapa: currentStage + 1,
      titulo: currentStageData.title,
      escolha: `${resultText} Selecionou: ${selectedWords}`,
      efeito: effect,
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
              Etapa {currentStage + 1} / {CONFIG.stages.length}
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
          total={CONFIG.stages.length}
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
          ) : currentStageData.type === "split" ? (
            <SplitQuestion
              title={currentStageData.title}
              text={currentStageData.text}
              choices={currentStageData.choices}
              onChoose={handleChoice}
            />
          ) : currentStageData.type === "word-selection-1" ? (
            <WordSelection1
              title={currentStageData.title}
              description={currentStageData.text}
              words={currentStageData.words?.map(w => ({
                id: w.id,
                text: w.text,
                isCorrect: w.isCorrect || false
              })) || []}
              maxSelections={currentStageData.maxSelections}
              onComplete={(ids) => handleWordSelection(ids, "word-selection-1")}
            />
          ) : currentStageData.type === "word-selection-2" ? (
            <WordSelection2
              title={currentStageData.title}
              description={currentStageData.text}
              words={currentStageData.words?.map(w => ({
                id: w.id,
                text: w.text,
                points: w.points || 0
              })) || []}
              maxSelections={currentStageData.maxSelections}
              onComplete={(ids) => handleWordSelection(ids, "word-selection-2")}
            />
          ) : (
            <Question
              title={currentStageData.title}
              text={currentStageData.text}
              choices={currentStageData.choices}
              onChoose={handleChoice}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
