import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { AspectCard } from "@/components/AspectCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Question } from "@/components/Question";
import { SplitQuestion } from "@/components/SplitQuestion";
import { WordSelection1 } from "@/components/WordSelection1";
import { WordSelection2 } from "@/components/WordSelection2";
import { Result } from "@/components/Result";
import { Center } from "@/components/layout/Center";
import { Split } from "@/components/layout/Split";
import { RenderBlock, BlockDef } from "@/components/blocks/RenderBlock";

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

    const nextTrail = [...trail, decision];
    setScore(newScore);
    setTrail(nextTrail);
    setCurrentStage(prev => prev + 1);

    // Persist current session to localStorage
    try {
      localStorage.setItem("acao_trail", JSON.stringify(nextTrail));
      localStorage.setItem("acao_score", JSON.stringify(newScore));
      localStorage.setItem("acao_avg", JSON.stringify(Math.round(average(newScore))));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
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
      const correctPercentage = selectedIds.length > 0
        ? (correctSelected.length / selectedIds.length) * 100
        : 0;

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
      // Type 2: Words can have effectByAspect (preferred) or points (legacy)
      const aspectTotals: Partial<Score> = {};

      selectedIds.forEach(id => {
        const word = words.find(w => w.id === id);
        if (word) {
          if (word.effectByAspect) {
            // Use per-aspect effects directly
            Object.entries(word.effectByAspect).forEach(([key, value]) => {
              if (value !== undefined) {
                aspectTotals[key as keyof Score] = (aspectTotals[key as keyof Score] || 0) + value;
              }
            });
          } else if (word.points) {
            // Legacy: distribute points equally
            const pointsPerAspect = Math.round(word.points / 4);
            ["produtividade", "confianca", "visao", "sustentabilidade"].forEach(key => {
              aspectTotals[key as keyof Score] = (aspectTotals[key as keyof Score] || 0) + pointsPerAspect;
            });
          }
        }
      });

      effect = aspectTotals;
      const totalEffect = Object.values(aspectTotals).reduce((sum, v) => sum + (v || 0), 0);
      resultText = totalEffect > 0 ? "Boas escolhas!" : totalEffect < 0 ? "Escolhas questionáveis." : "Seleção neutra.";
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

    const nextTrail = [...trail, decision];
    setScore(newScore);
    setTrail(nextTrail);
    setCurrentStage(prev => prev + 1);

    // Persist current session to localStorage
    try {
      localStorage.setItem("acao_trail", JSON.stringify(nextTrail));
      localStorage.setItem("acao_score", JSON.stringify(newScore));
      localStorage.setItem("acao_avg", JSON.stringify(Math.round(average(newScore))));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
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
            {/* <button
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
            </button> */}
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
          ) : (() => {
            // Inject handlers into block definitions
            const injectHandlers = (blockDef?: any): any => {
              if (!blockDef) return blockDef;

              const injected = { ...blockDef, props: { ...blockDef.props } };

              if (injected.component === "Question" && injected.props.onChoose === "useIndexHandleChoice") {
                injected.props.onChoose = handleChoice;
              }
              if (injected.component === "WordSelection1" && injected.props.onComplete === "useIndexHandleWordSel1") {
                injected.props.onComplete = (ids: string[]) => handleWordSelection(ids, "word-selection-1");
              }
              if (injected.component === "WordSelection2" && injected.props.onComplete === "useIndexHandleWordSel2") {
                injected.props.onComplete = (ids: string[]) => handleWordSelection(ids, "word-selection-2");
              }
              // dentro de injectHandlers(blockDef)
              if (
                injected.component === "RatingQuestion" &&
                injected.props.onSubmit === "useIndexHandleRating"
              ) {
                injected.props.onSubmit = (ratings: Record<string, number>) => {
                  // (opcional) se quiser usar ratings p/ afetar score, faça aqui

                  // registra no trail para auditoria
                  const decision: DecisionTrail = {
                    etapa: currentStage + 1,
                    titulo: currentStageData.title,
                    escolha: `Avaliação: ${Object.entries(ratings)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(", ")}`,
                    efeito: {}, // sem efeito por enquanto
                  };

                  const nextTrail = [...trail, decision];
                  setTrail(nextTrail);
                  setCurrentStage((prev) => prev + 1);

                  // persistência
                  try {
                    localStorage.setItem("acao_trail", JSON.stringify(nextTrail));
                    localStorage.setItem("acao_score", JSON.stringify(score));
                    localStorage.setItem("acao_avg", JSON.stringify(Math.round(average(score))));
                  } catch (e) {
                    console.error("Failed to save to localStorage:", e);
                  }
                };
              }

              return injected;
            };

            // Render with new modular system if layout is defined
            if (currentStageData.layout === "split") {
              return (
                <Split
                  left={<RenderBlock def={injectHandlers(currentStageData.leftBlock)} />}
                  right={<RenderBlock def={injectHandlers(currentStageData.rightBlock)} />}
                />
              );
            }

            if (currentStageData.layout === "center") {
              return (
                <Center>
                  <div className="space-y-6 text-center">
                    <RenderBlock def={injectHandlers(currentStageData.centerBlock)} />
                    {currentStageData.choices && currentStageData.choices.length > 0 && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={() => handleChoice(currentStageData.choices[0])}
                          className="btn-choice px-8 py-4 text-lg"
                        >
                          {currentStageData.choices[0].label}
                        </button>
                      </div>
                    )}
                  </div>
                </Center>
              );
            }

            // Fallback to old system for backward compatibility
            if (currentStageData.type === "split") {
              return (
                <SplitQuestion
                  title={currentStageData.title}
                  text={currentStageData.text}
                  choices={currentStageData.choices}
                  onChoose={handleChoice}
                />
              );
            }

            if (currentStageData.type === "word-selection-1") {
              return (
                <WordSelection1
                  title={currentStageData.title}
                  description={currentStageData.text}
                  words={currentStageData.words?.map(w => ({
                    id: w.id,
                    text: w.text,
                    isCorrect: w.isCorrect
                  })) || []}
                  maxSelections={currentStageData.maxSelections}
                  onComplete={(ids) => handleWordSelection(ids, "word-selection-1")}
                />
              );
            }

            if (currentStageData.type === "word-selection-2") {
              return (
                <WordSelection2
                  title={currentStageData.title}
                  description={currentStageData.text}
                  words={currentStageData.words?.map(w => ({
                    id: w.id,
                    text: w.text,
                    points: w.points,
                    effectByAspect: w.effectByAspect
                  })) || []}
                  maxSelections={currentStageData.maxSelections}
                  onComplete={(ids) => handleWordSelection(ids, "word-selection-2")}
                />
              );
            }

            return (
              <Question
                title={currentStageData.title}
                text={currentStageData.text}
                choices={currentStageData.choices}
                onChoose={handleChoice}
              />
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default Index;
