import { Choice } from "@/config/simulador";

interface SplitQuestionProps {
  title: string;
  text: string;
  choices: Choice[];
  onChoose: (choice: Choice) => void;
}

export const SplitQuestion = ({ title, text, choices, onChoose }: SplitQuestionProps) => {
  return (
    <div className="card-question max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left side - Question */}
        <div className="space-y-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {text}
          </p>
        </div>

        {/* Right side - Choices */}
        <div className="grid gap-4">
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