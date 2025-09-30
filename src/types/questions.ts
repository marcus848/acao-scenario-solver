export type AspectKey = "produtividade" | "confianca" | "visao" | "sustentabilidade";
export type Score = Record<AspectKey, number>;
export type Effect = Partial<Score>;

export type MultipleChoiceConfig = {
  type: "multiple-choice";
  question: string;
  options: { id: string; label: string; note?: string; effect: Effect; justification?: string }[];
};

export type VideoChoiceConfig = {
  type: "video-choice";
  video: { src: string; poster?: string; autoPlay?: boolean; muted?: boolean; loop?: boolean; controls?: boolean };
  prompt?: string;
  options: { id: string; label: string; note?: string; effect: Effect; justification?: string }[];
  layout?: "split" | "center";
};

export type WordPickerMode = "select" | "rank";
export type WordPickerConfig = {
  type: "word-picker";
  prompt?: string;
  items: { id: string; text: string; correct?: boolean }[];
  mode: WordPickerMode;
  scoring?: {
    rankWeights?: number[];
    correctEffect?: Effect;
    wrongEffect?: Effect;
  };
  layout?: "split" | "center";
  video?: { src: string; poster?: string; autoPlay?: boolean; muted?: boolean; loop?: boolean; controls?: boolean };
};

export type QuestionConfig = MultipleChoiceConfig | VideoChoiceConfig | WordPickerConfig;

export type AnswerDetail = {
  optionId?: string;
  selectedIds?: string[];
  rankedIds?: string[];
};
