import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { AspectCards } from "@/components/AspectCards";
import { Question as QuestionComponent } from "@/components/Question";
import { WordSelection1 } from "@/components/WordSelection1";
import { WordSelection2 } from "@/components/WordSelection2";
import { Split } from "@/components/layout/Split";
import { RenderBlock } from "@/components/blocks/RenderBlock";
import { CONFIG, Score, Choice } from "@/config/simulador";
import { sendAnswerToBackend, getGroupName, AnswerPayload } from "@/lib/api";
import { useScores } from "@/hooks/useScores";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Question = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { score, applyEffect } = useScores();
  const [pendingAnswer, setPendingAnswer] = useState<{
    type: "choice" | "rating" | "word-selection";
    value: string | Record<string, number> | string[];
    label?: string;
    effect: Partial<Score>;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const questionId = parseInt(id || "0", 10);
  const stageData = CONFIG.stages.find((s) => s.id === questionId);

  if (!stageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Pergunta não encontrada</h1>
          <Button onClick={() => navigate("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handleChoice = (choice: Choice) => {
    setPendingAnswer({
      type: "choice",
      value: choice.label,
      label: choice.label,
      effect: choice.effect,
    });
    setShowConfirm(true);
  };

  const handleRatingSubmit = (ratings: Record<string, number>) => {
    setPendingAnswer({
      type: "rating",
      value: ratings,
      label: `Avaliação: ${Object.entries(ratings).map(([k, v]) => `${k}=${v}`).join(", ")}`,
      effect: {}, // Ratings don't have direct effects
    });
    setShowConfirm(true);
  };

  const handleWordSelection = (selectedIds: string[], type: "word-selection-1" | "word-selection-2") => {
    const words = stageData.words || [];
    let effect: Partial<Score> = {};

    if (type === "word-selection-1") {
      const correctSelected = selectedIds.filter((id) =>
        words.find((w) => w.id === id && w.isCorrect)
      );
      const correctPercentage =
        selectedIds.length > 0 ? (correctSelected.length / selectedIds.length) * 100 : 0;

      if (correctPercentage >= 80) {
        effect = { pessoas: +5, atitudes: +5, negocio: +5 };
      } else if (correctPercentage >= 60) {
        effect = { pessoas: +3, atitudes: +3, negocio: +3 };
      } else {
        effect = { pessoas: +1, atitudes: +1, negocio: +1 };
      }
    } else {
      const aspectTotals: Partial<Score> = {};
      selectedIds.forEach((id) => {
        const word = words.find((w) => w.id === id);
        if (word) {
          if (word.effectByAspect) {
            Object.entries(word.effectByAspect).forEach(([key, value]) => {
              if (value !== undefined) {
                aspectTotals[key as keyof Score] = (aspectTotals[key as keyof Score] || 0) + value;
              }
            });
          } else if (word.points) {
            const pointsPerAspect = Math.round(word.points / 3);
            ["pessoas", "atitudes", "negocio"].forEach((key) => {
              aspectTotals[key as keyof Score] = (aspectTotals[key as keyof Score] || 0) + pointsPerAspect;
            });
          }
        }
      });
      effect = aspectTotals;
    }

    const selectedWords = selectedIds
      .map((id) => words.find((w) => w.id === id)?.text || id)
      .join(", ");

    setPendingAnswer({
      type: "word-selection",
      value: selectedIds,
      label: `Selecionou: ${selectedWords}`,
      effect,
    });
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!pendingAnswer) return;

    const groupName = getGroupName();
    if (!groupName) {
      toast.error("Nome do grupo não encontrado. Volte para a Home e salve o nome do grupo.");
      setShowConfirm(false);
      return;
    }

    setIsSending(true);

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    const payload: AnswerPayload = {
      group_name: groupName,
      question_id: questionId,
      answer: {
        type: pendingAnswer.type,
        value: pendingAnswer.value,
        label: pendingAnswer.label,
      },
      effect: pendingAnswer.effect,
      date,
      time,
    };

    const response = await sendAnswerToBackend(payload);

    if (response) {
      // Apply effect to scores after successful submission
      applyEffect(pendingAnswer.effect);
      toast.success("Resposta enviada com sucesso!");
      navigate("/");
    } else {
      toast.error("Erro ao enviar resposta. Verifique o console.");
    }

    setIsSending(false);
    setShowConfirm(false);
    setPendingAnswer(null);
  };

  const handleCancelSend = () => {
    setShowConfirm(false);
    setPendingAnswer(null);
  };

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
    if (injected.component === "RatingQuestion" && injected.props.onSubmit === "useIndexHandleRating") {
      injected.props.onSubmit = handleRatingSubmit;
    }

    return injected;
  };

  const renderQuestion = () => {
    if (stageData.layout === "split") {
      return (
        <Split
          left={<RenderBlock def={injectHandlers(stageData.leftBlock)} />}
          right={<RenderBlock def={injectHandlers(stageData.rightBlock)} />}
        />
      );
    }

    if (stageData.type === "word-selection-1") {
      return (
        <WordSelection1
          title={stageData.title}
          description={stageData.text}
          words={
            stageData.words?.map((w) => ({
              id: w.id,
              text: w.text,
              isCorrect: w.isCorrect,
            })) || []
          }
          maxSelections={stageData.maxSelections}
          onComplete={(ids) => handleWordSelection(ids, "word-selection-1")}
        />
      );
    }

    if (stageData.type === "word-selection-2") {
      return (
        <WordSelection2
          title={stageData.title}
          description={stageData.text}
          words={
            stageData.words?.map((w) => ({
              id: w.id,
              text: w.text,
              points: w.points,
              effectByAspect: w.effectByAspect,
            })) || []
          }
          maxSelections={stageData.maxSelections}
          onComplete={(ids) => handleWordSelection(ids, "word-selection-2")}
        />
      );
    }

    // Default question with choices
    return (
      <QuestionComponent
        title={stageData.title}
        text={stageData.text}
        choices={stageData.choices}
        onChoose={handleChoice}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header badges={CONFIG.badges} />

      {/* Aspect Cards - Always visible at top */}
      <div className="container mx-auto px-4 pt-6">
        <AspectCards score={score} />
      </div>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Button>

        {/* Question Content */}
        <div className="py-4">{renderQuestion()}</div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio desta resposta?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAnswer?.label && (
                <span className="block mt-2 text-foreground font-medium">
                  Resposta: {pendingAnswer.label}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSend} disabled={isSending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} disabled={isSending}>
              {isSending ? "Enviando..." : "Confirmar e Enviar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Question;
