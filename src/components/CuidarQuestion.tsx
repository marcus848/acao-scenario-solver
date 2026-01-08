import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CuidarKey = "consciencia" | "uniao" | "integridade" | "disciplina" | "atencao" | "responsabilidade";
export type CuidarValue = "praticado" | "nao_praticado";
export type CuidarAnswers = Record<CuidarKey, CuidarValue>;

export const CUIDAR_ITEMS: { key: CuidarKey; itemKey: string; name: string; description: string }[] = [
  { key: "consciencia", itemKey: "cuidar_consciencia", name: "Consciência", description: "Estar presente, atento, perceber riscos e consequências." },
  { key: "uniao", itemKey: "cuidar_uniao", name: "União", description: "Operação Segura é coletiva: eu protejo você, você me protege." },
  { key: "integridade", itemKey: "cuidar_integridade", name: "Integridade", description: "Fazer sempre o certo, mesmo quando ninguém está olhando." },
  { key: "disciplina", itemKey: "cuidar_disciplina", name: "Disciplina", description: "Cumprir o combinado, seguir procedimentos." },
  { key: "atencao", itemKey: "cuidar_atencao", name: "Atenção", description: "Não ficar no automático: pausar, processar e prosseguir." },
  { key: "responsabilidade", itemKey: "cuidar_responsabilidade", name: "Responsabilidade", description: "Com as Pessoas, com as Atitudes e com o Negócio." },
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
                variant="outline"
                size="sm"
                onClick={() => handleSelect(item.key, "praticado")}
                className={cn(
                  "flex-1 border border-border hover:border-primary hover:bg-transparent transition-all",
                  answers[item.key] === "praticado" && "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                Praticado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect(item.key, "nao_praticado")}
                className={cn(
                  "flex-1 border border-border hover:border-primary hover:bg-transparent transition-all",
                  answers[item.key] === "nao_praticado" && "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground"
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
