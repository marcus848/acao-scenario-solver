import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProcedimentosQ1 = "sim" | "nao";
export type ProcedimentosQ2 = "sempre" | "quase_sempre" | "as_vezes" | "raramente" | "nunca";

export interface ProcedimentosAnswers {
  q1?: ProcedimentosQ1;
  q2?: ProcedimentosQ2;
}

interface ProcedimentosQuestionProps {
  title?: string;
  onComplete?: (answers: ProcedimentosAnswers) => void;
}

export const ProcedimentosQuestion = ({ title, onComplete }: ProcedimentosQuestionProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<ProcedimentosAnswers>({});

  const handleQ1Change = (value: ProcedimentosQ1) => {
    setAnswers((prev) => ({ ...prev, q1: value }));
  };

  const handleQ2Change = (value: ProcedimentosQ2) => {
    setAnswers((prev) => ({ ...prev, q2: value }));
  };

  const handleNext = () => {
    if (answers.q1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (answers.q1 && answers.q2 && onComplete) {
      onComplete(answers);
    }
  };

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            step >= 1 ? "bg-primary" : "bg-muted"
          )}
        />
        <div
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            step >= 2 ? "bg-primary" : "bg-muted"
          )}
        />
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
            <p className="text-lg font-medium text-foreground">
              1. O procedimento construído pelo seu grupo, teria evitado a fatalidade do vídeo?
            </p>
            <RadioGroup
              value={answers.q1}
              onValueChange={(v) => handleQ1Change(v as ProcedimentosQ1)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="sim" id="q1-sim" />
                <Label htmlFor="q1-sim" className="flex-1 cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="nao" id="q1-nao" />
                <Label htmlFor="q1-nao" className="flex-1 cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleNext}
            disabled={!answers.q1}
            className="w-full gap-2"
            size="lg"
          >
            Próxima
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
            <p className="text-lg font-medium text-foreground">
              2. Em nosso caso, os procedimentos são seguidos mesmo sob pressão?
            </p>
            <RadioGroup
              value={answers.q2}
              onValueChange={(v) => handleQ2Change(v as ProcedimentosQ2)}
              className="space-y-3"
            >
              {[
                { value: "sempre", label: "Sempre" },
                { value: "quase_sempre", label: "Quase Sempre" },
                { value: "as_vezes", label: "Às vezes" },
                { value: "raramente", label: "Raramente" },
                { value: "nunca", label: "Nunca" },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={`q2-${option.value}`} />
                  <Label htmlFor={`q2-${option.value}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!answers.q2}
              className="flex-1"
              size="lg"
            >
              Concluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
