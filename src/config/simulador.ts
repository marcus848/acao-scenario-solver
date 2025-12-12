export type AspectKey = "pessoas" | "atitudes" | "negocio";
export type Score = Record<AspectKey, number>;
import ImageQ from "@/assets/images/Q.jpeg";
import ImageQ3 from "@/assets/images/Q3.png";
import Video1 from "@/assets/videos/Video.mp4";

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
    { key: "pessoas", label: "Cuidar das Pessoas" },
    { key: "atitudes", label: "Cuidar das Atitudes" },
    { key: "negocio", label: "Cuidar dos Negócios" },
  ],
  initial: { pessoas: 70, atitudes: 70, negocio: 70 },
  badges: [
    { label: "Meta", value: "5 Anos sem acidentes com afastamento" },
  ],
  stages: [
    {
      id: 1,
      title: "Manutenção agora ou depois?",
      text: "Bombas críticas com vibração acima do normal; Preventiva prevista para 3 semanas.",
      choices: [
        {
          label: "Realizar uma manutenção agora com uma estimativa de parada de 12h e risco de não entregar a meta de produção",
          effect: { pessoas: +4, atitudes: +8, negocio: +3 },
          note: "Parada planejada; controla risco de quebra."
        },
        {
          label: "Tornar a situação conhecida por toda a equipe e seguir analisando a situação até o momento. Se a situação piorar, chamar a manutenção. Do contrário, aguardar até o evento programado.",
          effect: { pessoas: -6, atitudes: -8, negocio: -4 },
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
    {
      id: 3,
      title: "Decisão final da safra",
      text: "Últimas semanas. Opção de acelerar para bater meta ou manter ritmo sustentável.",
      choices: [
        {
          label: "Sprint final controlado",
          effect: { pessoas: +4, atitudes: +7, negocio: +3 },
          note: "Empurra limites com responsabilidade e planejamento."
        },
        {
          label: "Manter ritmo atual",
          effect: { pessoas: +6, atitudes: +3, negocio: +5 },
          note: "Prioriza bem-estar da equipe e equipamentos."
        },
        {
          label: "Acelerar ao máximo",
          effect: { pessoas: -3, atitudes: -2, negocio: -5 },
          note: "Máximo resultado imediato, com riscos para o futuro.",
          justification: "A confiança caiu devido ao estresse excessivo imposto à equipe no final da safra. A visão estratégica foi comprometida pelo foco apenas no curto prazo, e os negócios sofreram pelo desgaste de equipamentos e pessoas, comprometendo resultados futuros."
        }
      ]
    },
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
            { id: "p1", text: "Documentação precisa", effectByAspect: { pessoas: +1, atitudes: +2 } },
            { id: "p2", text: "Negócio", effectByAspect: { atitudes: +2, negocio: +3 } },
            { id: "p3", text: "EPI", effectByAspect: { pessoas: +2, atitudes: +2 } },
            { id: "p4", text: "Desrespeito às normas", effectByAspect: { pessoas: -3, negocio: -3 } },
            { id: "p5", text: "Falta de supervisão", effectByAspect: { pessoas: -2, atitudes: -2 } },
            { id: "p6", text: "Proteção em Máquinas e Equipamentos", effectByAspect: { atitudes: +3, negocio: +2 } },
            { id: "p7", text: "3Ps. Pausar, Processar e Prosseguir", effectByAspect: { pessoas: +3, negocio: +3, atitudes: +3 } },
            { id: "p8", text: "Limites de Velocidade", effectByAspect: { atitudes: -3, negocio: -2 } },
            { id: "p9", text: "Isolamento de Área", effectByAspect: { pessoas: -3, negocio: -2 } },
            { id: "p10", text: "Direito de recusa", effectByAspect: { pessoas: +2, negocio: +2, atitudes: +2 } },
            { id: "p11", text: "ATE. Autorização para trabalhos especiais", effectByAspect: { atitudes: +2, negocio: +3 } },
            { id: "p12", text: "Foco no cliente", effectByAspect: { atitudes: +2, negocio: +1 } },
            { id: "p13", text: "Comunicação de Acidentes", effectByAspect: { pessoas: -2, atitudes: -3 } },
            { id: "p14", text: "Atropelos no processo", effectByAspect: { pessoas: -2, atitudes: -2 } },
            { id: "p15", text: "ATC. Autorização para trabalhos críticos", effectByAspect: { pessoas: +1, atitudes: +2, negocio: +2 } },
            { id: "p16", text: "Bloqueio", effectByAspect: { pessoas: +2, atitudes: +2 } },
            { id: "p17", text: "Resistência à mudança", effectByAspect: { atitudes: -3, negocio: -2 } },
            { id: "p18", text: "Treinamento constante", effectByAspect: { pessoas: +2, atitudes: +1, negocio: +1 } },
            { id: "p19", text: "Análise de causa-raiz", effectByAspect: { atitudes: +2, negocio: +2 } },
            { id: "p20", text: "Pressão excessiva", effectByAspect: { pessoas: -5, negocio: -4 } }
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
        { id: "p19", text: "Negócio", points: 4 },
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
  ],
};

// Utility functions
export const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const average = (s: Score) =>
  (s.pessoas + s.atitudes + s.negocio) / 3;

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
