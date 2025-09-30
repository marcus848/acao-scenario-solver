import { Effect } from "@/types/questions";

interface MultipleChoiceProps {
  question: string;
  options: { id: string; label: string; note?: string; effect: Effect; justification?: string }[];
  onAnswer: (effect: Effect, detail: { optionId: string; justification?: string }) => void;
}

export const MultipleChoice = ({ question, options, onAnswer }: MultipleChoiceProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          {question}
        </h2>
      </div>

      <div className="grid gap-4 mt-8">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswer(option.effect, { 
              optionId: option.id,
              justification: option.justification 
            })}
            className="btn-choice group"
            role="button"
            aria-pressed="false"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {option.label}
              </span>
              {option.note && (
                <span className="text-sm text-muted-foreground mt-1">
                  {option.note}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
