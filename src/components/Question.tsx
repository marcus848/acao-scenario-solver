import { Choice } from "@/config/simulador";

interface QuestionProps {
  title: string;
  text: string;
  choices: Choice[];
  onChoose: (choice: Choice) => void;
}

export const Question = ({ title, text, choices, onChoose }: QuestionProps) => {
  return (
    <div className="card-simulator p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {text}
          </p>
        </div>

        <div className="grid gap-4 mt-8">
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoose(choice)}
              className="btn-choice group"
              role="button"
              aria-pressed="false"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {choice.label}
                </span>
                {choice.note && (
                  <span className="text-sm text-muted-foreground mt-1">
                    {choice.note}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};