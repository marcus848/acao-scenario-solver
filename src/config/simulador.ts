export type AspectKey = "seguranca" | "cpessoas" | "catitudes" | "cnegocios";
export type Score = Record<AspectKey, number>;
import ImageQ from "@/assets/images/Q.jpeg";
import ImageQ3 from "@/assets/images/Q3.png";
import Video1 from "@/assets/videos/Video.mp4";
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
    { key: "seguranca", label: "Segurança" },
    { key: "cpessoas", label: "Cuidar das Pessoas" },
    { key: "catitudes", label: "Cuidar das Atitudes" },
    { key: "cnegocios", label: "Cuidar dos Negócios" },
  ],
  initial: { seguranca: 70, cpessoas: 70, catitudes: 70, cnegocios: 70 },
  badges: [
    { label: "Meta", value: "5 Anos sem acidentes com afastamento" },
    // { label: "Desafio", value: "ATR -5%" },
  ],
  stages: [
    {
      id: 0,
      title: "Pesquisa de Ação Transformadora",
      text: "Descubra como suas decisões impactam diferentes aspectos da sua organização",
      layout: "center",
      centerBlock: {
        component: "Text",
        props: {
          title: "5 Anos sem acidentes com afastamento",
          text: "Vamos começar nossa jornada de transformação. Clique em 'Começar' para iniciar a pesquisa."
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
      text: "Bombas críticas com vibração acima do normal; Preventiva prevista para 3 semanas.",
      choices: [
        {
          label: "Realizar uma manutenção agora com uma estimativa de parada de 12h e risco de não entregar a meta de produção",
          effect: { seguranca: +6, cpessoas: +4, catitudes: +8, cnegocios: +3 },
          note: "Parada planejada; controla risco de quebra."
        },
        {
          label: "Tornar a situação conhecida por toda a equipe e seguir analisando a situação até o momento. Se a situação piorar, chamar a manutenção. Do contrário, aguardar até o evento programado.",
          effect: { seguranca: -3, cpessoas: -6, catitudes: -8, cnegocios: -4 },
          note: "Mantém ritmo por ora; aceita risco monitorado.",
          justification:
            "A decisão privilegia o curto prazo e adota postura reativa frente a um risco conhecido. Isso fragiliza a percepção de planejamento e de cuidado com a operação, pode desgastar a credibilidade da liderança e expõe a equipe a uma possível parada não programada com custo e impacto maiores caso a condição se agrave."
        }
      ]
    },
    {
      id: 2,
      title: "Avaliação de Desempenho",
      text: "Avalie os aspectos abaixo de 0 a 10:",
      layout: "split",
      leftBlock: {
        component: "Video",
        props: {
          src: Video1,
          // alt: "Avaliação de desempenho"
        }
      },
      rightBlock: {
        component: "RatingQuestion",
        props: {
          title: "Reavaliem este trecho do vídeo e atribua uma nota de 0 – 10:",
          items: [
            { label: "Os procedimentos estão sendo seguidos corretamente?", key: "procedimentos" },
            { label: "Existem riscos visíveis que podem ser evitados?", key: "riscos" },
            { label: "Pausar, processar e prosseguir foi utilizado com eficiência?", key: "3Ps" },
            { label: "Estão cuidando uns dos outros?", key: "cuidado" }
          ],
          min: 0,
          max: 10,
          step: 1,
          onSubmit: "useIndexHandleRating"
        }
      },
      choices: []
    },
    /*{
      id: 2,
      title: "Problema de qualidade detectado",
      text: "ATR do caldo abaixo do padrão. Análise indica contaminação na moenda.",
      choices: [
        {
          label: "Parar para limpeza completa",
          effect: { seguranca: -3, cpessoas: +8, catitudes: +5, cnegocios: +6 },
          note: "Perda de 4h de produção, mas resolve o problema na raiz."
        },
        {
          label: "Continuar e ajustar na próxima parada",
          effect: { seguranca: +2, cpessoas: -5, catitudes: -7, cnegocios: -8 },
          note: "Mantém ritmo, mas compromete qualidade e meio ambiente.",
          justification: "A confiança da equipe diminuiu (-5) ao perceber que qualidade foi sacrificada. A visão estratégica (-7) foi afetada pela decisão reativa, e a cnegocios (-8) sofreu gravemente devido ao impacto ambiental da contaminação não tratada adequadamente."
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
              effect: { seguranca: -2, cpessoas: +6, catitudes: +7, cnegocios: +2 },
              note: "Para produção 1h, mas alinha expectativas e melhora clima."
            },
            {
              label: "Conversa individual com envolvidos",
              effect: { seguranca: +1, cpessoas: +2, catitudes: +3, cnegocios: +1 },
              note: "Menos impacto, mas pode não resolver completamente."
            },
            {
              label: "Ignorar e focar na produção",
              effect: { seguranca: +3, cpessoas: -8, catitudes: -6, cnegocios: -3 },
              note: "Mantém ritmo, mas tensão pode escalar.",
              justification: "A confiança despencou (-8) pois a equipe percebeu que você não se importa com o bem-estar deles. A visão estratégica (-6) foi comprometida por ignorar problemas de liderança, e a cnegocios (-3) sofreu devido ao clima organizacional tóxico que pode gerar mais conflitos."
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
          effect: { seguranca: +5, cpessoas: +3, catitudes: +8, cnegocios: +2 },
          note: "Risco calculado com potencial de ganho significativo."
        },
        {
          label: "Agendar para próxima safra",
          effect: { seguranca: 0, cpessoas: +1, catitudes: -2, cnegocios: +1 },
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
          effect: { seguranca: +2, cpessoas: +8, catitudes: +6, cnegocios: +4 },
          note: "Protege equipe e estabelece expectativas viáveis."
        },
        {
          label: "Aceitar meta e forçar ritmo",
          effect: { seguranca: +8, cpessoas: -6, catitudes: -4, cnegocios: -7 },
          note: "Ganho imediato, mas risco de burnout e acidentes.",
          justification: "A confiança caiu (-6) porque a equipe se sentiu sobrecarregada e desvalorizada. A visão estratégica (-4) foi prejudicada pela pressão de curto prazo, e a cnegocios (-7) sofreu devido ao risco de burnout, acidentes e rotatividade de pessoal."
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
          effect: { seguranca: +4, cpessoas: +5, catitudes: +9, cnegocios: +6 },
          note: "Cuidar das Atitudes de longo prazo com benefícios sustentáveis."
        },
        {
          label: "Rejeitar por falta de verba",
          effect: { seguranca: +1, cpessoas: -2, catitudes: -5, cnegocios: -2 },
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
          effect: { seguranca: -1, cpessoas: +7, catitudes: +5, cnegocios: +9 },
          note: "Transparência total, demonstra compromisso com cnegocios."
        },
        {
          label: "Aguardar possível fiscalização",
          effect: { seguranca: +2, cpessoas: -4, catitudes: -3, cnegocios: -8 },
          note: "Economiza recursos, mas compromete credibilidade.",
          justification: "A confiança diminuiu (-4) pois a equipe questionou sua integridade ética. A visão estratégica (-3) foi afetada pela postura reativa, e a cnegocios (-8) sofreu severamente devido à falta de transparência e compromisso ambiental genuíno."
        }
      ]
    },*/
    {
      id: 3,
      title: "Decisão final da safra",
      text: "Últimas semanas. Opção de acelerar para bater meta ou manter ritmo sustentável.",
      choices: [
        {
          label: "Sprint final controlado",
          effect: { seguranca: +6, cpessoas: +4, catitudes: +7, cnegocios: +3 },
          note: "Empurra limites com responsabilidade e planejamento."
        },
        {
          label: "Manter ritmo atual",
          effect: { seguranca: +2, cpessoas: +6, catitudes: +3, cnegocios: +5 },
          note: "Prioriza bem-estar da equipe e equipamentos."
        },
        {
          label: "Acelerar ao máximo",
          effect: { seguranca: +10, cpessoas: -3, catitudes: -2, cnegocios: -5 },
          note: "Máximo resultado imediato, com riscos para o futuro.",
          justification: "A confiança caiu (-3) devido ao estresse excessivo imposto à equipe no final da safra. A visão estratégica (-2) foi comprometida pelo foco apenas no curto prazo, e a cnegocios (-5) sofreu pelo desgaste de equipamentos e pessoas, comprometendo resultados futuros."
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
      id: 4,
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
          title: "Quais das nossas práticas de segurança, poderiam ter evitado o acidente?",
          description: "Cada palavra possui efeitos por aspecto",
          maxSelections: 5,
          words: [
            { id: "p1", text: "Documentação precisa", effectByAspect: { cpessoas: +1, catitudes: +2 } },
            { id: "p2", text: "cnegocios", effectByAspect: { catitudes: +2, cnegocios: +3 } },
            { id: "p3", text: "EPI", effectByAspect: { cpessoas: +2, catitudes: +2 } },
            { id: "p4", text: "Desrespeito às normas", effectByAspect: { cpessoas: -3, cnegocios: -3 } },
            { id: "p5", text: "Falta de supervisão", effectByAspect: { seguranca: -2, cpessoas: -2 } },
            { id: "p6", text: "Proteção em Máquinas e Equipamentos", effectByAspect: { seguranca: +2, catitudes: +3 } },
            { id: "p7", text: "3Ps. Pausar, Processar e Prosseguir", effectByAspect: { cpessoas: +3, cnegocios: +3, catitudes: +3, seguranca: +3 } },
            { id: "p8", text: "Limites de Velocidade", effectByAspect: { seguranca: -3, catitudes: -3, cnegocios: -2 } },
            { id: "p9", text: "Isolamento de Área", effectByAspect: { seguranca: +1, cpessoas: -3, cnegocios: -2 } },
            { id: "p10", text: "Direito de recusa", effectByAspect: { seguranca: +2, cpessoas: +2, cnegocios: +2 } },
            { id: "p11", text: "ATE. Autorização para trabalhos especiais", effectByAspect: { seguranca: +3, catitudes: +2 } },
            { id: "p12", text: "Foco no cliente", effectByAspect: { seguranca: +1, catitudes: +2 } },
            { id: "p13", text: "Comunicação de Acidentes", effectByAspect: { seguranca: -2, cpessoas: -2, catitudes: -3 } },
            { id: "p14", text: "Atropelos no processo", effectByAspect: { seguranca: -1, cpessoas: -2, catitudes: -2 } },
            { id: "p15", text: "ATC. Autorização para trabalhos críticos", effectByAspect: { seguranca: +2, cpessoas: +1, catitudes: +2 } },
            { id: "p16", text: "Bloqueio", effectByAspect: { seguranca: +2, cpessoas: +2 } },
            { id: "p17", text: "Resistência à mudança", effectByAspect: { seguranca: -2, catitudes: -3 } },
            { id: "p18", text: "Treinamento constante", effectByAspect: { seguranca: +1, cpessoas: +2, catitudes: +1 } },
            { id: "p19", text: "Análise de causa-raiz", effectByAspect: { confiança: +2, catitudes: +2 } },
            { id: "p20", text: "Pressão excessiva", effectByAspect: { cpessoas: -5, cnegocios: -4 } }
          ],
          onComplete: "useIndexHandleWordSel2"
        }
      },
      choices: []
    },
    {
      id: 5,
      title: "Avaliação de Práticas",
      text: "Selecione até 5 práticas que você considera mais relevantes. Algumas agregam valor, outras podem prejudicar:",
      type: "word-selection-2",
      maxSelections: 5,
      words: [
        { id: "p15", text: "Foco no cliente", points: 4 },
        { id: "p19", text: "cnegocios", points: 4 },
        { id: "p2", text: "Melhoria contínua", points: 5 },
        { id: "p13", text: "Inovação responsável", points: 3 },
        { id: "p18", text: "Decisões impulsivas", points: -4 },
        { id: "p8", text: "Comunicação clara", points: 4 },
        { id: "p1", text: "Padronização", points: 5 },
        { id: "p16", text: "Pressão excessiva", points: -3 },
        { id: "p4", text: "Segurança primeiro", points: 5 },
        { id: "p10", text: "Documentação precisa", points: 3 },
        { id: "p11", text: "Falta de supervisão", points: -3 },
        { id: "p7", text: "Atropelos no processo", points: -4 },
        { id: "p14", text: "Resistência à mudança", points: -4 },
        { id: "p12", text: "Trabalho em equipe", points: 4 },
        { id: "p20", text: "Desrespeito às normas", points: -5 },
        { id: "p3", text: "Qualidade total", points: 5 },
        { id: "p17", text: "Análise de causa-raiz", points: 4 },
        { id: "p9", text: "Treinamento constante", points: 4 },
        { id: "p5", text: "Ignorar dados", points: -5 },
        { id: "p6", text: "Postergar manutenção", points: -5 }
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
    //         { label: "Opção A - Abordagem conservadora", effect: { seguranca: +2, cpessoas: +3, catitudes: +1, cnegocios: +2 } },
    //         { label: "Opção B - Abordagem inovadora", effect: { seguranca: +4, cpessoas: +2, catitudes: +5, cnegocios: +3 } },
    //         { label: "Opção C - Abordagem reativa", effect: { seguranca: +1, cpessoas: -2, catitudes: -3, cnegocios: -1 } }
    //       ],
    //       onChoose: "useIndexHandleChoice"
    //     }
    //   },
    //   choices: [
    //     {
    //       label: "Opção A - Abordagem conservadora",
    //       effect: { seguranca: +2, cpessoas: +3, catitudes: +1, cnegocios: +2 },
    //       note: "Mantém estabilidade mas limita inovação."
    //     },
    //     {
    //       label: "Opção B - Abordagem inovadora",
    //       effect: { seguranca: +4, cpessoas: +2, catitudes: +5, cnegocios: +3 },
    //       note: "Maior potencial de ganho com risco calculado."
    //     },
    //     {
    //       label: "Opção C - Abordagem reativa",
    //       effect: { seguranca: +1, cpessoas: -2, catitudes: -3, cnegocios: -1 },
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
    //           effect: { seguranca: -2, cpessoas: +5, catitudes: +4, cnegocios: +3 },
    //           note: "Prioriza segurança e qualidade."
    //         },
    //         {
    //           label: "Manter operação",
    //           effect: { seguranca: +3, cpessoas: -2, catitudes: -3, cnegocios: -2 },
    //           note: "Mantém produção mas aumenta riscos.",
    //           justification: "Equipe percebeu que segurança foi comprometida."
    //         },
    //       ],
    //       onChoose: "useIndexHandleChoice"
    //     }
    //   },
    //   choices: []
    // },
  ],
};

// Utility functions
export const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const average = (s: Score) =>
  (s.seguranca + s.cpessoas + s.catitudes + s.cnegocios) / 4;

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