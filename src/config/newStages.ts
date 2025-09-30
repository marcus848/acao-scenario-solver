import { QuestionConfig } from "@/types/questions";

export const NEW_STAGES: QuestionConfig[] = [
  // Q1: Multiple Choice simples - centralizado
  {
    type: "multiple-choice",
    question: "Comunicar plano ao time e pares?",
    options: [
      { 
        id: "a", 
        label: "Transparência radical (dash + premissas)", 
        note: "Alinhamento e aderência.",
        effect: { produtividade: 2, confianca: 10, visao: 4, sustentabilidade: 2 }
      },
      { 
        id: "b", 
        label: "Mensagem vaga e otimista", 
        note: "Evita pânico, piora conformidade.",
        effect: { produtividade: 0, confianca: -10, visao: -2, sustentabilidade: -2 },
        justification: "A confiança caiu devido à falta de transparência, comprometendo o alinhamento da equipe."
      }
    ]
  },
  // Q2: Word Picker - modo select (sem vídeo)
  {
    type: "word-picker",
    layout: "center",
    prompt: "Selecione as práticas recomendadas para melhoria contínua",
    mode: "select",
    items: [
      { id: "s1", text: "Gemba (ir e ver)", correct: true },
      { id: "s2", text: "5S", correct: true },
      { id: "s3", text: "Ignorar padrões", correct: false },
      { id: "s4", text: "Kaizen diário", correct: true },
      { id: "s5", text: "Focar só em volume", correct: false }
    ],
    scoring: {
      correctEffect: { produtividade: 3, confianca: 2, visao: 3, sustentabilidade: 2 },
      wrongEffect: { produtividade: -2, confianca: -2, visao: -1, sustentabilidade: -1 }
    }
  },
  // Q3: Word Picker - modo rank
  {
    type: "word-picker",
    layout: "center",
    prompt: "Ordene as ações de mais adequada para menos adequada",
    mode: "rank",
    items: [
      { id: "i1", text: "Eliminar desperdícios" },
      { id: "i2", text: "Padronizar 5S" },
      { id: "i3", text: "Focar só em volume" },
      { id: "i4", text: "Auditar causa-raiz" }
    ],
    scoring: {
      rankWeights: [4, 3, 2, 1],
      correctEffect: { produtividade: 4, visao: 4, sustentabilidade: 4, confianca: 2 },
      wrongEffect: { produtividade: -2, visao: -2, sustentabilidade: -2, confianca: -1 }
    }
  }
];
