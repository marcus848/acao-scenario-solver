import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { AspectCards } from "@/components/AspectCards";
import { Question as QuestionComponent } from "@/components/Question";
import { WordSelection1 } from "@/components/WordSelection1";
import { WordSelection2 } from "@/components/WordSelection2";
import { CuidarQuestion, CuidarAnswers, CUIDAR_ITEMS } from "@/components/CuidarQuestion";
import { ProcedimentosQuestion, ProcedimentosAnswers } from "@/components/ProcedimentosQuestion";
import { Split } from "@/components/layout/Split";
import { RenderBlock } from "@/components/blocks/RenderBlock";
import { CONFIG, Score, Choice } from "@/config/simulador";
import { 
  sendAnswerToBackend, 
  getAnswerContext,
  SaveAnswerPayload,
  AnswerItemPayload 
} from "@/lib/api";
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

interface PendingAnswer {
  items: AnswerItemPayload[];
  delta: { pessoas: number; atitudes: number; negocio: number };
}

const Question = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { score, refreshGroupScore } = useScores();
  const [pendingAnswer, setPendingAnswer] = useState<PendingAnswer | null>(null);
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
    const items: AnswerItemPayload[] = [{
      item_key: choice.id || choice.label,
      item_label: choice.label,
      value_text: "selected",
      is_correct: 0,
      delta_pessoas: choice.effect.pessoas || 0,
      delta_atitudes: choice.effect.atitudes || 0,
      delta_negocio: choice.effect.negocio || 0,
    }];

    const delta = {
      pessoas: choice.effect.pessoas || 0,
      atitudes: choice.effect.atitudes || 0,
      negocio: choice.effect.negocio || 0,
    };

    setPendingAnswer({ items, delta });
    setShowConfirm(true);
  };

  const handleRatingSubmit = (ratings: Record<string, number>) => {
    const items: AnswerItemPayload[] = Object.entries(ratings).map(([key, value]) => ({
      item_key: key,
      item_label: key,
      value_num: value,
      is_correct: 0,
      delta_pessoas: 0,
      delta_atitudes: 0,
      delta_negocio: 0,
    }));

    setPendingAnswer({ items, delta: { pessoas: 0, atitudes: 0, negocio: 0 } });
    setShowConfirm(true);
  };

  const handleWordSelection = (selectedIds: string[], type: "word-selection-1" | "word-selection-2") => {
    const words = stageData.words || [];
    const rightBlockProps = stageData.rightBlock?.props as Record<string, unknown> | undefined;
    const rightBlockWords = (rightBlockProps?.words as typeof words) || [];
    const allWords = words.length > 0 ? words : rightBlockWords;

    const items: AnswerItemPayload[] = [];
    let totalDelta = { pessoas: 0, atitudes: 0, negocio: 0 };

    if (type === "word-selection-1") {
      const correctSelected = selectedIds.filter((id) =>
        allWords.find((w) => w.id === id && w.isCorrect)
      );
      const correctPercentage =
        selectedIds.length > 0 ? (correctSelected.length / selectedIds.length) * 100 : 0;

      let effect: Partial<Score>;
      if (correctPercentage >= 80) {
        effect = { pessoas: +5, atitudes: +5, negocio: +5 };
      } else if (correctPercentage >= 60) {
        effect = { pessoas: +3, atitudes: +3, negocio: +3 };
      } else {
        effect = { pessoas: +1, atitudes: +1, negocio: +1 };
      }

      selectedIds.forEach((id) => {
        const word = allWords.find((w) => w.id === id);
        if (word) {
          items.push({
            item_key: word.id,
            item_label: word.text,
            value_text: "selected",
            is_correct: word.isCorrect ? 1 : -1,
            delta_pessoas: 0,
            delta_atitudes: 0,
            delta_negocio: 0,
          });
        }
      });

      totalDelta = {
        pessoas: effect.pessoas || 0,
        atitudes: effect.atitudes || 0,
        negocio: effect.negocio || 0,
      };
    } else {
      // word-selection-2: each word has its own effectByAspect
      selectedIds.forEach((id) => {
        const word = allWords.find((w) => w.id === id);
        if (word) {
          const dp = word.effectByAspect?.pessoas || 0;
          const da = word.effectByAspect?.atitudes || 0;
          const dn = word.effectByAspect?.negocio || 0;

          items.push({
            item_key: word.id,
            item_label: word.text,
            value_text: "selected",
            is_correct: 0,
            delta_pessoas: dp,
            delta_atitudes: da,
            delta_negocio: dn,
          });

          totalDelta.pessoas += dp;
          totalDelta.atitudes += da;
          totalDelta.negocio += dn;
        }
      });
    }

    setPendingAnswer({ items, delta: totalDelta });
    setShowConfirm(true);
  };

  const handleCuidarComplete = (answers: CuidarAnswers) => {
    const items: AnswerItemPayload[] = CUIDAR_ITEMS.map((item) => ({
      item_key: item.itemKey,
      item_label: item.name,
      value_text: answers[item.key],
      is_correct: answers[item.key] === "praticado" ? 1 : -1,
      delta_pessoas: 0,
      delta_atitudes: 0,
      delta_negocio: 0,
    }));

    // Calculate total delta based on praticado/nao_praticado
    const praticadoCount = Object.values(answers).filter((v) => v === "praticado").length;
    const naoPraticadoCount = Object.values(answers).filter((v) => v === "nao_praticado").length;

    const totalDelta = {
      pessoas: praticadoCount * 2 - naoPraticadoCount,
      atitudes: praticadoCount * 2 - naoPraticadoCount,
      negocio: praticadoCount - naoPraticadoCount,
    };

    setPendingAnswer({ items, delta: totalDelta });
    setShowConfirm(true);
  };

  const handleProcedimentosComplete = (answers: ProcedimentosAnswers) => {
    const q1Label = "O procedimento construído pelo seu grupo, teria evitado a fatalidade do vídeo?";
    const q2Label = "Em nosso caso, os procedimentos são seguidos mesmo sob pressão?";

    // Map answer values to exact item_keys from question_options table
    const q1ItemKey = answers.q1 === "sim" ? "q4_1_sim" : answers.q1 === "nao" ? "q4_1_nao" : null;
    
    const q2ItemKeyMap: Record<string, string> = {
      sempre: "q4_2_sempre",
      quase_sempre: "q4_2_quase_sempre",
      as_vezes: "q4_2_as_vezes",
      raramente: "q4_2_raramente",
      nunca: "q4_2_nunca",
    };
    const q2ItemKey = answers.q2 ? q2ItemKeyMap[answers.q2] : null;

    const items: AnswerItemPayload[] = [];

    if (q1ItemKey) {
      items.push({
        item_key: q1ItemKey,
        item_label: q1Label,
        value_text: answers.q1 || null,
        is_correct: 0,
        delta_pessoas: 0,
        delta_atitudes: 0,
        delta_negocio: 0,
      });
    }

    if (q2ItemKey) {
      items.push({
        item_key: q2ItemKey,
        item_label: q2Label,
        value_text: answers.q2 || null,
        is_correct: 0,
        delta_pessoas: 0,
        delta_atitudes: 0,
        delta_negocio: 0,
      });
    }

    // Calculate total delta
    let totalDelta = { pessoas: 0, atitudes: 0, negocio: 0 };

    if (answers.q1 === "sim") {
      totalDelta.pessoas += 2;
      totalDelta.atitudes += 2;
      totalDelta.negocio += 2;
    }

    const q2Effects: Record<string, { pessoas: number; atitudes: number; negocio: number }> = {
      sempre: { pessoas: 5, atitudes: 5, negocio: 5 },
      quase_sempre: { pessoas: 3, atitudes: 3, negocio: 3 },
      as_vezes: { pessoas: 1, atitudes: 1, negocio: 1 },
      raramente: { pessoas: -1, atitudes: -1, negocio: -1 },
      nunca: { pessoas: -3, atitudes: -3, negocio: -3 },
    };

    if (answers.q2 && q2Effects[answers.q2]) {
      const q2Effect = q2Effects[answers.q2];
      totalDelta.pessoas += q2Effect.pessoas;
      totalDelta.atitudes += q2Effect.atitudes;
      totalDelta.negocio += q2Effect.negocio;
    }

    setPendingAnswer({ items, delta: totalDelta });
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!pendingAnswer) return;

    const ctx = getAnswerContext();
    
    if (ctx.missingFields.length > 0) {
      toast.error(`Dados faltando: ${ctx.missingFields.join(", ")}. Volte para a Home e configure corretamente.`);
      setShowConfirm(false);
      return;
    }

    setIsSending(true);

    const payload: SaveAnswerPayload = {
      event_id: ctx.eventId!,
      unit_id: ctx.unitId!,
      group_id: ctx.groupId!,
      group_name: ctx.groupName!,
      question_id: questionId,
      delta: pendingAnswer.delta,
      items: pendingAnswer.items,
    };

    const response = await sendAnswerToBackend(payload);

    if (response.ok) {
      // Refresh score from backend after successful submission
      await refreshGroupScore();
      toast.success("Resposta enviada com sucesso!");
      navigate("/");
    } else {
      toast.error(response.message || "Erro ao enviar resposta. Tente novamente.");
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
    if (injected.component === "CuidarQuestion" && injected.props.onComplete === "useIndexHandleCuidar") {
      injected.props.onComplete = handleCuidarComplete;
    }
    if (injected.component === "ProcedimentosQuestion" && injected.props.onComplete === "useIndexHandleProcedimentos") {
      injected.props.onComplete = handleProcedimentosComplete;
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
            <AlertDialogTitle>Confirmar envio?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja confirmar e enviar sua resposta? Não será possível responder novamente.
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
