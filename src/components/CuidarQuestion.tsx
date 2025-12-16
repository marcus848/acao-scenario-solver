import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CuidarKey = "consciencia" | "uniao" | "integridade" | "disciplina" | "atencao" | "responsabilidade";
export type CuidarValue = "praticado" | "nao_praticado";
export type CuidarAnswers = Record<CuidarKey, CuidarValue>;

const CUIDAR_ITEMS: { key: CuidarKey; name: string; description: string }[] = [
  { key: "consciencia", name: "Consciência", description: "Estar presente, atento, perceber riscos e consequências." },
  { key: "uniao", name: "União", description: "Operação Segura é coletiva: eu protejo você, você me protege." },
  { key: "integridade", name: "Integridade", description: "Fazer sempre o certo, mesmo quando ninguém está olhando." },
  { key: "disciplina", name: "Disciplina", description: "Cumprir o combinado, seguir procedimentos." },
  { key: "atencao", name: "Atenção", description: "Não ficar no automático: pausar, processar e prosseguir." },
  { key: "responsabilidade", name: "Responsabilidade", description: "Com as Pessoas, com as Atitudes e com o Negócio." },
];

interface CuidarQuestionProps {
  title?: string;
  description?: string;
  onComplete?: (answers: CuidarAnswers) => void;
}

export const CuidarQuestion = ({ title, description, onComplete }: CuidarQuestionProps) => {
  const [answers, setAnswers] = useState<Partial<CuidarAnswers>>({});

  const handleSelect = (key: CuidarKey, value: CuidarValue) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const allAnswered = CUIDAR_ITEMS.every((item) => answers[item.key] !== undefined);

  const handleSubmit = () => {
    if (allAnswered && onComplete) {
      onComplete(answers as CuidarAnswers);
    }
  };

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}
      {description && (
        <p className="text-muted-foreground whitespace-pre-line">{description}</p>
      )}

      <div className="space-y-4">
        {CUIDAR_ITEMS.map((item) => (
          <div
            key={item.key}
            className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-3"
          >
            <div>
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={answers[item.key] === "praticado" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelect(item.key, "praticado")}
                className={cn(
                  "flex-1",
                  answers[item.key] === "praticado" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                Praticado
              </Button>
              <Button
                variant={answers[item.key] === "nao_praticado" ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleSelect(item.key, "nao_praticado")}
                className={cn(
                  "flex-1",
                  answers[item.key] === "nao_praticado" && "ring-2 ring-destructive ring-offset-2 ring-offset-background"
                )}
              >
                Não praticado
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered}
        className="w-full"
        size="lg"
      >
        Confirmar e Enviar
      </Button>
    </div>
  );
};
