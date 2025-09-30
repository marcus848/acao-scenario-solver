import { QuestionConfig, Effect, AnswerDetail } from "@/types/questions";
import { QuestionContainer } from "@/components/questions/QuestionContainer";
import { MultipleChoice } from "@/components/questions/MultipleChoice";
import { VideoBlock } from "@/components/questions/VideoBlock";
import { WordPicker } from "@/components/questions/WordPicker";

export function renderQuestion(
  config: QuestionConfig,
  onAnswer: (effect: Effect, detail: AnswerDetail) => void
) {
  switch (config.type) {
    case "multiple-choice":
      return (
        <QuestionContainer layout="center">
          <MultipleChoice
            question={config.question}
            options={config.options}
            onAnswer={(effect, detail) => onAnswer(effect, detail)}
          />
        </QuestionContainer>
      );

    case "video-choice":
      if (config.layout === "split") {
        return (
          <QuestionContainer
            layout="split"
            left={<VideoBlock {...config.video} />}
            right={
              <MultipleChoice
                question={config.prompt || "Escolha uma opção"}
                options={config.options}
                onAnswer={(effect, detail) => onAnswer(effect, detail)}
              />
            }
          />
        );
      }
      return (
        <QuestionContainer layout="center">
          <div className="space-y-6">
            <VideoBlock {...config.video} />
            <MultipleChoice
              question={config.prompt || "Escolha uma opção"}
              options={config.options}
              onAnswer={(effect, detail) => onAnswer(effect, detail)}
            />
          </div>
        </QuestionContainer>
      );

    case "word-picker":
      if (config.layout === "split" && config.video) {
        return (
          <QuestionContainer
            layout="split"
            left={<VideoBlock {...config.video} />}
            right={
              <WordPicker
                prompt={config.prompt}
                items={config.items}
                mode={config.mode}
                scoring={config.scoring}
                onAnswer={(effect, detail) => onAnswer(effect, detail)}
              />
            }
          />
        );
      }
      return (
        <QuestionContainer layout="center">
          <WordPicker
            prompt={config.prompt}
            items={config.items}
            mode={config.mode}
            scoring={config.scoring}
            onAnswer={(effect, detail) => onAnswer(effect, detail)}
          />
        </QuestionContainer>
      );

    default:
      return null;
  }
}
