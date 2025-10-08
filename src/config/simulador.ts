export type AspectKey = "produtividade" | "confianca" | "visao" | "sustentabilidade";
export type Score = Record<AspectKey, number>;
import ImageQ from "@/assets/images/Q.jpeg";
import ImageQ3 from "@/assets/images/Q3.png";
import { on } from "events";

export type Choice = {
  id?: string;
  label: string;
  note?: string;
  effect: Partial<Score>;
  justification?: string;
};

// Block definitions for modular rendering
export type BlockDef =
  | { component: "Text"; props: { title?: string; text?: string } }
  | { component: "Image"; props: { src: string; alt?: string; width?: number; height?: number } }
  | { component: "Video"; props: { src: string; ratio?: "16/9" | "4/3" | "1/1" | "21/9" } }
  | { component: "Question"; props: Record<string, unknown> }
  | { component: "WordSelection1"; props: Record<string, unknown> }
  | { component: "WordSelection2"; props: Record<string, unknown> }
  | { component: "RatingQuestion"; props: Record<string, unknown> };

export type Stage = {
  id: number;
  title: string;
  text: string;
  choices: Choice[];
  type?: "default" | "split" | "word-selection-1" | "word-selection-2";
  words?: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
    points?: number;
    effectByAspect?: Partial<Score>;
  }>;
  maxSelections?: number;
  // New modular layout system
  layout?: "center" | "split";
  centerBlock?: BlockDef;
  leftBlock?: BlockDef;
  rightBlock?: BlockDef;
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
    { key: "produtividade", label: "Segurança" },
    { key: "confianca", label: "Cuidar das Pessoas" },
    { key: "visao", label: "Cuidar das Atitudes" },
    { key: "sustentabilidade", label: "Cuidar do Negócio" },
  ],
  initial: { produtividade: 70, confianca: 70, visao: 70, sustentabilidade: 70 },
  badges: [
    { label: "Meta", value: "13 TPH" },
    { label: "Desafio", value: "ATR -5%" },
  ],
  stages: [
    {
      id: 0,
      title: "Bem-vindo à Pesquisa de Ação Transformadora",
      text: "Descubra como suas decisões impactam diferentes aspectos da sua organização",
      layout: "center",
      centerBlock: {
        component: "Text",
        props: {
          title: "Meta",
          text: "Vamos começar nossa jornada de transformação. Clique em 'Começar' para iniciar."
        }
      },
      choices: [
        {
          label: "Começar",
          effect: {},
          note: "Iniciar pesquisa"
        }
      ]
    },
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
      layout: "split",
      leftBlock: {
        component: "Image",
        props: {
          src: ImageQ3,
          alt: "Operadores em discussão na usina"
        }
      },
      rightBlock: {
        component: "Question",
        props: {
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
            },
          ],
          onChoose: "useIndexHandleChoice",
        }
      },
      choices: []
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
          note: "Cuidar das Atitudes de longo prazo com benefícios sustentáveis."
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
    },
    // {
    //   id: 9,
    //   title: "Prioridades Estratégicas",
    //   text: "Analise o cenário atual e identifique as 5 práticas mais importantes para o sucesso da operação:",
    //   type: "word-selection-1",
    //   maxSelections: 5,
    //   words: [
    //     { id: "w1", text: "Gemba Walk", isCorrect: true },
    //     { id: "w2", text: "5S Disciplina", isCorrect: true },
    //     { id: "w3", text: "Kaizen Contínuo", isCorrect: true },
    //     { id: "w4", text: "Poka-Yoke", isCorrect: true },
    //     { id: "w5", text: "OEE Tracking", isCorrect: true },
    //     { id: "w6", text: "Ignorar métricas", isCorrect: false },
    //     { id: "w7", text: "Processos soltos", isCorrect: false },
    //     { id: "w8", text: "Retrabalho constante", isCorrect: false },
    //     { id: "w9", text: "Falta de padrão", isCorrect: false },
    //     { id: "w10", text: "PDCA", isCorrect: false },
    //     { id: "w11", text: "TPM", isCorrect: false },
    //     { id: "w12", text: "Six Sigma", isCorrect: false },
    //     { id: "w13", text: "Lean Manufacturing", isCorrect: false },
    //     { id: "w14", text: "Just in Time", isCorrect: false },
    //     { id: "w15", text: "Kanban", isCorrect: false },
    //     { id: "w16", text: "Andon", isCorrect: false },
    //     { id: "w17", text: "Jidoka", isCorrect: false },
    //     { id: "w18", text: "Heijunka", isCorrect: false },
    //     { id: "w19", text: "Muda", isCorrect: false },
    //     { id: "w20", text: "Hoshin Kanri", isCorrect: false }
    //   ],
    //   choices: [] // Used by word selection logic
    // },
    {
      id: 10,
      title: "Avaliação de Práticas",
      text: "Selecione até 5 práticas que você considera mais relevantes. Algumas agregam valor, outras podem prejudicar:",
      type: "word-selection-2",
      maxSelections: 5,
      words: [
        { id: "p1", text: "Padronização", points: 5 },
        { id: "p2", text: "Melhoria contínua", points: 5 },
        { id: "p3", text: "Qualidade total", points: 5 },
        { id: "p4", text: "Segurança primeiro", points: 5 },
        { id: "p5", text: "Ignorar dados", points: -5 },
        { id: "p6", text: "Postergar manutenção", points: -5 },
        { id: "p7", text: "Atropelos no processo", points: -4 },
        { id: "p8", text: "Comunicação clara", points: 4 },
        { id: "p9", text: "Treinamento constante", points: 4 },
        { id: "p10", text: "Documentação precisa", points: 3 },
        { id: "p11", text: "Falta de supervisão", points: -3 },
        { id: "p12", text: "Trabalho em equipe", points: 4 },
        { id: "p13", text: "Inovação responsável", points: 3 },
        { id: "p14", text: "Resistência à mudança", points: -4 },
        { id: "p15", text: "Foco no cliente", points: 4 },
        { id: "p16", text: "Pressão excessiva", points: -3 },
        { id: "p17", text: "Análise de causa-raiz", points: 4 },
        { id: "p18", text: "Decisões impulsivas", points: -4 },
        { id: "p19", text: "Sustentabilidade", points: 4 },
        { id: "p20", text: "Desrespeito às normas", points: -5 }
      ],
      choices: []
    },
    // {
    //   id: 11,
    //   title: "Layout de Pergunta Dividido",
    //   text: "Teste do container de duas colunas. Esta é a pergunta à esquerda, enquanto as alternativas ficam à direita.",
    //   layout: "split",
    //   leftBlock: {
    //     component: "Text",
    //     props: {
    //       title: "Pergunta Exemplo",
    //       text: "Esta é a área de texto à esquerda. Pode conter qualquer conteúdo relevante para a pergunta."
    //     }
    //   },
    //   rightBlock: {
    //     component: "Question",
    //     props: {
    //       title: "Escolha uma alternativa",
    //       text: "Opções a seguir:",
    //       choices: [
    //         { label: "Opção A - Abordagem conservadora", effect: { produtividade: +2, confianca: +3, visao: +1, sustentabilidade: +2 } },
    //         { label: "Opção B - Abordagem inovadora", effect: { produtividade: +4, confianca: +2, visao: +5, sustentabilidade: +3 } },
    //         { label: "Opção C - Abordagem reativa", effect: { produtividade: +1, confianca: -2, visao: -3, sustentabilidade: -1 } }
    //       ],
    //       onChoose: "useIndexHandleChoice"
    //     }
    //   },
    //   choices: [
    //     {
    //       label: "Opção A - Abordagem conservadora",
    //       effect: { produtividade: +2, confianca: +3, visao: +1, sustentabilidade: +2 },
    //       note: "Mantém estabilidade mas limita inovação."
    //     },
    //     {
    //       label: "Opção B - Abordagem inovadora",
    //       effect: { produtividade: +4, confianca: +2, visao: +5, sustentabilidade: +3 },
    //       note: "Maior potencial de ganho com risco calculado."
    //     },
    //     {
    //       label: "Opção C - Abordagem reativa",
    //       effect: { produtividade: +1, confianca: -2, visao: -3, sustentabilidade: -1 },
    //       note: "Ação imediata sem planejamento.",
    //       justification: "Decisão reativa compromete visão estratégica e confiança da equipe."
    //     }
    //   ]
    // },
    // Novos exemplos com sistema modular
    // {
    //   id: 202,
    //   title: "Avalie a situação",
    //   text: "Imagem ilustra o cenário.",
    //   layout: "split",
    //   leftBlock: {
    //     component: "Image",
    //     props: {
    //       src: Image,
    //       alt: "Cenário operação industrial"
    //     }
    //   },
    //   rightBlock: {
    //     component: "Question",
    //     props: {
    //       title: "Com base na imagem, o que fazer?",
    //       text: "Selecione uma opção:",
    //       choices: [
    //         {
    //           label: "Parada controlada",
    //           effect: { produtividade: -2, confianca: +5, visao: +4, sustentabilidade: +3 },
    //           note: "Prioriza segurança e qualidade."
    //         },
    //         {
    //           label: "Manter operação",
    //           effect: { produtividade: +3, confianca: -2, visao: -3, sustentabilidade: -2 },
    //           note: "Mantém produção mas aumenta riscos.",
    //           justification: "Equipe percebeu que segurança foi comprometida."
    //         },
    //       ],
    //       onChoose: "useIndexHandleChoice"
    //     }
    //   },
    //   choices: []
    // },
    {
      id: 11,
      title: "Avaliação de Desempenho",
      text: "Avalie os aspectos abaixo de 0 a 10:",
      layout: "split",
      leftBlock: {
        component: "Image",
        props: {
          src: ImageQ,
          alt: "Avaliação de desempenho"
        }
      },
      rightBlock: {
        component: "RatingQuestion",
        props: {
          title: "Avalie de 0 a 10",
          items: [
            { label: "Produtividade da equipe", key: "prod" },
            { label: "Qualidade dos processos", key: "qual" },
            { label: "Segurança no trabalho", key: "seg" }
          ],
          min: 0,
          max: 10,
          step: 1,
          onSubmit: "useIndexHandleRating"
        }
      },
      choices: []
    },
    {
      id: 203,
      title: "Práticas após observar o cenário",
      text: "Escolha até 5 (algumas positivas e outras negativas).",
      layout: "split",
      leftBlock: {
        component: "Image",
        props: {
          src: ImageQ,
          alt: "Gemba 5S workplace"
        }
      },
      rightBlock: {
        component: "WordSelection2",
        props: {
          title: "Selecione até 5 práticas",
          description: "Cada palavra possui efeitos por aspecto",
          maxSelections: 5,
          words: [
            { id: "p1", text: "Padronização", effectByAspect: { produtividade: +3, visao: +2 } },
            { id: "p2", text: "Melhoria contínua", effectByAspect: { produtividade: +2, confianca: +1, visao: +2 } },
            { id: "p3", text: "Ignorar dados", effectByAspect: { produtividade: -3, visao: -3, sustentabilidade: -2 } },
            { id: "p4", text: "Qualidade total", effectByAspect: { produtividade: +2, confianca: +2, sustentabilidade: +2 } },
            { id: "p5", text: "Segurança primeiro", effectByAspect: { confianca: +3, sustentabilidade: +3 } },
            { id: "p6", text: "Postergar manutenção", effectByAspect: { produtividade: +1, confianca: -3, sustentabilidade: -2 } },
            { id: "p7", text: "Comunicação clara", effectByAspect: { confianca: +2, visao: +2 } },
            { id: "p8", text: "Trabalho em equipe", effectByAspect: { produtividade: +2, confianca: +2 } },
            { id: "p9", text: "Decisões impulsivas", effectByAspect: { produtividade: -2, confianca: -2, visao: -3 } },
            { id: "p10", text: "Inovação responsável", effectByAspect: { produtividade: +2, visao: +3 } },
            { id: "p11", text: "Treinamento constante", effectByAspect: { produtividade: +1, confianca: +2, visao: +1 } },
            { id: "p12", text: "Falta de supervisão", effectByAspect: { produtividade: -2, confianca: -2 } },
            { id: "p13", text: "Documentação precisa", effectByAspect: { confianca: +1, visao: +2 } },
            { id: "p14", text: "Resistência à mudança", effectByAspect: { produtividade: -2, visao: -3 } },
            { id: "p15", text: "Análise de causa-raiz", effectByAspect: { produtividade: +2, visao: +2 } },
            { id: "p16", text: "Pressão excessiva", effectByAspect: { produtividade: +1, confianca: -3, sustentabilidade: -2 } },
            { id: "p17", text: "Foco no cliente", effectByAspect: { produtividade: +1, visao: +2 } },
            { id: "p18", text: "Sustentabilidade", effectByAspect: { visao: +2, sustentabilidade: +3 } },
            { id: "p19", text: "Atropelos no processo", effectByAspect: { produtividade: -1, confianca: -2, visao: -2 } },
            { id: "p20", text: "Desrespeito às normas", effectByAspect: { confianca: -3, sustentabilidade: -3 } }
          ],
          onComplete: "useIndexHandleWordSel2"
        }
      },
      choices: []
    }
  ],
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