import { QuestionConfig } from "@/types/questions";

export type AspectKey = "produtividade" | "confianca" | "visao" | "sustentabilidade";
export type Score = Record<AspectKey, number>;

export type Choice = {
  id?: string;
  label: string;
  note?: string;
  effect: Partial<Score>;
  justification?: string; // Justificativa para escolhas que causam impacto negativo
};

export type Stage = {
  id: number;
  title: string;
  text: string;
  choices: Choice[];
};

export type Theme = {
  name: string;
  primary: string;
  accent: string;
  textOnPrimary: string;
};

export type SimulatorConfig = {
  theme: Theme;
  aspects: { key: AspectKey; label: string }[];
  initial: Score;
  stages: Stage[];
  newStages?: QuestionConfig[]; // Novos tipos modulares de perguntas
  badges?: { label: string; value: string }[];
};

export const CONFIG: SimulatorConfig = {
  theme: {
    name: "Ação Consultoria",
    primary: "#0097A7",
    accent: "#FFD600",
    textOnPrimary: "#0b1220",
  },
  aspects: [
    { key: "produtividade", label: "Produtividade" },
    { key: "confianca", label: "Confiança" },
    { key: "visao", label: "Visão" },
    { key: "sustentabilidade", label: "Sustentabilidade/ESG" },
  ],
  initial: { produtividade: 70, confianca: 70, visao: 70, sustentabilidade: 70 },
  badges: [
    { label: "Meta", value: "13 TPH" },
    { label: "Desafio", value: "ATR -5%" },
  ],
  stages: [
    {
      id: 1,
      title: "Manutenção agora ou depois?",
      text: "Bombas críticas com vibração acima do normal; parada geral só em 3 semanas.",
      choices: [
        {
          label: "Manutenção preventiva agora (parada curta)",
          effect: { produtividade: +6, confianca: +4, visao: +8, sustentabilidade: +3 },
          note: "Perde 6h hoje; reduz chance de quebra (72h) e passivo."
        },
        {
          label: "Postergar até a parada geral",
          effect: { produtividade: +3, confianca: -6, visao: -8, sustentabilidade: -4 },
          note: "Ganha fôlego imediato; risco de falha catastrófica.",
          justification: "A equipe perdeu confiança (-6) pois percebeu que você priorizou ganhos imediatos sobre a segurança. A visão estratégica (-8) foi comprometida pela falta de planejamento preventivo, e a sustentabilidade (-4) sofreu devido ao risco ambiental de uma possível falha catastrófica."
        }
      ]
    },
    {
      id: 2,
      title: "Problema de qualidade detectado",
      text: "ATR do caldo abaixo do padrão. Análise indica contaminação na moenda.",
      choices: [
        {
          label: "Parar para limpeza completa",
          effect: { produtividade: -3, confianca: +8, visao: +5, sustentabilidade: +6 },
          note: "Perda de 4h de produção, mas resolve o problema na raiz."
        },
        {
          label: "Continuar e ajustar na próxima parada",
          effect: { produtividade: +2, confianca: -5, visao: -7, sustentabilidade: -8 },
          note: "Mantém ritmo, mas compromete qualidade e meio ambiente.",
          justification: "A confiança da equipe diminuiu (-5) ao perceber que qualidade foi sacrificada. A visão estratégica (-7) foi afetada pela decisão reativa, e a sustentabilidade (-8) sofreu gravemente devido ao impacto ambiental da contaminação não tratada adequadamente."
        }
      ]
    },
    {
      id: 3,
      title: "Conflito na equipe de campo",
      text: "Desentendimento entre operadores sobre procedimento de segurança.",
      choices: [
        {
          label: "Reunião imediata com toda equipe",
          effect: { produtividade: -2, confianca: +6, visao: +7, sustentabilidade: +2 },
          note: "Para produção 1h, mas alinha expectativas e melhora clima."
        },
        {
          label: "Conversa individual com envolvidos",
          effect: { produtividade: +1, confianca: +2, visao: +3, sustentabilidade: +1 },
          note: "Menos impacto, mas pode não resolver completamente."
        },
        {
          label: "Ignorar e focar na produção",
          effect: { produtividade: +3, confianca: -8, visao: -6, sustentabilidade: -3 },
          note: "Mantém ritmo, mas tensão pode escalar.",
          justification: "A confiança despencou (-8) pois a equipe percebeu que você não se importa com o bem-estar deles. A visão estratégica (-6) foi comprometida por ignorar problemas de liderança, e a sustentabilidade (-3) sofreu devido ao clima organizacional tóxico que pode gerar mais conflitos."
        }
      ]
    },
    {
      id: 4,
      title: "Oportunidade de melhoria",
      text: "Técnico sugere ajuste que pode aumentar eficiência em 3%, mas requer teste.",
      choices: [
        {
          label: "Implementar teste controlado",
          effect: { produtividade: +5, confianca: +3, visao: +8, sustentabilidade: +2 },
          note: "Risco calculado com potencial de ganho significativo."
        },
        {
          label: "Agendar para próxima safra",
          effect: { produtividade: 0, confianca: +1, visao: -2, sustentabilidade: +1 },
          note: "Conservador, mas perde oportunidade de ganho imediato."
        }
      ]
    },
    {
      id: 5,
      title: "Pressão por resultados",
      text: "Direção cobra aumento de 5% na produção. Equipe já no limite.",
      choices: [
        {
          label: "Negociar meta realista",
          effect: { produtividade: +2, confianca: +8, visao: +6, sustentabilidade: +4 },
          note: "Protege equipe e estabelece expectativas viáveis."
        },
        {
          label: "Aceitar meta e forçar ritmo",
          effect: { produtividade: +8, confianca: -6, visao: -4, sustentabilidade: -7 },
          note: "Ganho imediato, mas risco de burnout e acidentes.",
          justification: "A confiança caiu (-6) porque a equipe se sentiu sobrecarregada e desvalorizada. A visão estratégica (-4) foi prejudicada pela pressão de curto prazo, e a sustentabilidade (-7) sofreu devido ao risco de burnout, acidentes e rotatividade de pessoal."
        }
      ]
    },
    {
      id: 6,
      title: "Investimento em tecnologia",
      text: "Proposta de automação custará R$ 200k, com payback em 8 meses.",
      choices: [
        {
          label: "Aprovar investimento",
          effect: { produtividade: +4, confianca: +5, visao: +9, sustentabilidade: +6 },
          note: "Visão de longo prazo com benefícios sustentáveis."
        },
        {
          label: "Rejeitar por falta de verba",
          effect: { produtividade: +1, confianca: -2, visao: -5, sustentabilidade: -2 },
          note: "Mantém caixa, mas perde vantagem competitiva."
        }
      ]
    },
    {
      id: 7,
      title: "Incidente ambiental menor",
      text: "Pequeno vazamento contido. Órgão ambiental pode ou não fiscalizar.",
      choices: [
        {
          label: "Reportar proativamente",
          effect: { produtividade: -1, confianca: +7, visao: +5, sustentabilidade: +9 },
          note: "Transparência total, demonstra compromisso com sustentabilidade."
        },
        {
          label: "Aguardar possível fiscalização",
          effect: { produtividade: +2, confianca: -4, visao: -3, sustentabilidade: -8 },
          note: "Economiza recursos, mas compromete credibilidade.",
          justification: "A confiança diminuiu (-4) pois a equipe questionou sua integridade ética. A visão estratégica (-3) foi afetada pela postura reativa, e a sustentabilidade (-8) sofreu severamente devido à falta de transparência e compromisso ambiental genuíno."
        }
      ]
    },
    {
      id: 8,
      title: "Decisão final da safra",
      text: "Últimas semanas. Opção de acelerar para bater meta ou manter ritmo sustentável.",
      choices: [
        {
          label: "Sprint final controlado",
          effect: { produtividade: +6, confianca: +4, visao: +7, sustentabilidade: +3 },
          note: "Empurra limites com responsabilidade e planejamento."
        },
        {
          label: "Manter ritmo atual",
          effect: { produtividade: +2, confianca: +6, visao: +3, sustentabilidade: +5 },
          note: "Prioriza bem-estar da equipe e equipamentos."
        },
        {
          label: "Acelerar ao máximo",
          effect: { produtividade: +10, confianca: -3, visao: -2, sustentabilidade: -5 },
          note: "Máximo resultado imediato, com riscos para o futuro.",
          justification: "A confiança caiu (-3) devido ao estresse excessivo imposto à equipe no final da safra. A visão estratégica (-2) foi comprometida pelo foco apenas no curto prazo, e a sustentabilidade (-5) sofreu pelo desgaste de equipamentos e pessoas, comprometendo resultados futuros."
        }
      ]
    }
  ],
  newStages: [
    // Q1: Multiple Choice simples - centralizado
    {
      type: "multiple-choice",
      question: "Comunicar plano ao time e pares?",
      options: [
        { 
          id: "a", 
          label: "Transparência radical (dash + premissas)", 
          note: "Alinhamento e aderência.",
          effect: { produtividade: +2, confianca: +10, visao: +4, sustentabilidade: +2 }
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
        correctEffect: { produtividade: +3, confianca: +2, visao: +3, sustentabilidade: +2 },
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
        correctEffect: { produtividade: +4, visao: +4, sustentabilidade: +4, confianca: +2 },
        wrongEffect: { produtividade: -2, visao: -2, sustentabilidade: -2, confianca: -1 }
      }
    }
  ]
};

// Utility functions
export const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const average = (s: Score) =>
  (s.produtividade + s.confianca + s.visao + s.sustentabilidade) / 4;

export const riskLabel = (avg: number) =>
  avg >= 80 ? "Baixo" : avg >= 60 ? "Médio" : "Alto";

export const riskClass = (avg: number) =>
  avg >= 80 ? "badge-risk-baixo" : avg >= 60 ? "badge-risk-medio" : "badge-risk-alto";

export const verdict = (s: Score) => {
  const avgRound = Math.round(average(s));
  if (avgRound >= 85) return { avg: avgRound, faixa: "Líder Visionário", classe: "text-success" } as const;
  if (avgRound >= 70) return { avg: avgRound, faixa: "Gestor Consistente", classe: "text-success" } as const;
  if (avgRound >= 55) return { avg: avgRound, faixa: "Tático em Evolução", classe: "text-warning" } as const;
  return { avg: avgRound, faixa: "Reativo em Risco", classe: "text-destructive" } as const;
};