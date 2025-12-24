export type AspectKey = "pessoas" | "atitudes" | "negocio";
export type Score = Record<AspectKey, number>;
import VideoQ1 from "@/assets/videos/VideoQ1.mp4";
import VideoQ2 from "@/assets/videos/VideoQ2.mp4";
import VideoQ3 from "@/assets/videos/VideoQ3.mp4";
import VideoQ4 from "@/assets/videos/VideoQ4.mp4";
import VideoQ5 from "@/assets/videos/VideoQ5.mp4";

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
  | { component: "RatingQuestion"; props: Record<string, unknown> }
  | { component: "CuidarQuestion"; props: Record<string, unknown> }
  | { component: "ProcedimentosQuestion"; props: Record<string, unknown> };

export type Stage = {
  id: number;
  title: string;
  text: string;
  choices: Choice[];
  type?: "default" | "split" | "word-selection-1" | "word-selection-2" | "cuidar" | "procedimentos";
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
      title: "Pergunta 1",
      text: "Se este evento se passasse aqui na empresa, quais ações, ferramentas e equipamentos poderiam e deveriam ser utilizadas para redução de perigos e riscos e termos assim, uma operação segura?",
      layout: "split",
      leftBlock: {
        component: "Video",
        props: {
          src: VideoQ1,
        }
      },
      rightBlock: {
        component: "WordSelection2",
        props: {
          // title: "Selecione até 5 opções",
          description: "Se este evento se passasse aqui na empresa, quais ações, ferramentas e equipamentos poderiam e deveriam ser utilizadas para redução de perigos e riscos e termos assim, uma operação segura?",
          maxSelections: 10,
          words: [
            { id: "p1_01", text: "ATC – Autorização para Trabalho Crítico", effectByAspect: { pessoas: +1, atitudes: +3, negocio: +2 } },
            { id: "p1_02", text: "Direito de Recusa", effectByAspect: { pessoas: +4, atitudes: +2, negocio: -1 } },
            { id: "p1_03", text: "Uso de Perneira", effectByAspect: { pessoas: +3, atitudes: +1, negocio: +1 } },
            { id: "p1_04", text: "Identificação como Área Classificada", effectByAspect: { pessoas: +2, atitudes: +3, negocio: +2 } },
            { id: "p1_05", text: "ATE – Autorização de Trabalho Especial", effectByAspect: { pessoas: +1, atitudes: +3, negocio: +2 } },
            { id: "p1_06", text: "OPS Comportamental", effectByAspect: { pessoas: +3, atitudes: +2, negocio: +1 } },
            { id: "p1_07", text: "OPS Condição", effectByAspect: { pessoas: +2, atitudes: +3, negocio: +2 } },
            { id: "p1_08", text: "Isolamento de Área", effectByAspect: { pessoas: +2, atitudes: +3, negocio: +2 } },
            { id: "p1_09", text: "Bloqueio de Energia", effectByAspect: { pessoas: +2, atitudes: +4, negocio: +3 } },
            { id: "p1_10", text: "Implementação de guarda-corpo", effectByAspect: { pessoas: +3, atitudes: +2, negocio: +1 } }
          ],
          onComplete: "useIndexHandleWordSel2"
        }
      },
      choices: []
    },
    {
      id: 2,
      title: "Pergunta 2",
      text: "Felizmente algo pior não aconteceu, pois ele estava com o ponto de segurança, ainda assim, o incidente aconteceu e precisará ser devidamente comunicado, para que não aconteça mais.\nO que deve ser feito para garantir a máxima segurança do trabalhador daqui pra frente? Assinale todas que julgar correta:",
      layout: "split",
      leftBlock: {
        component: "Video",
        props: {
          src: VideoQ2,
        }
      },
      rightBlock: {
        component: "WordSelection2",
        props: {
          // title: "Selecione até 5 opções",
          description: "Felizmente algo pior não aconteceu, pois ele estava com o ponto de segurança, ainda assim, o incidente aconteceu e precisará ser devidamente comunicado, para que não aconteça mais.\nO que deve ser feito para garantir a máxima segurança do trabalhador daqui pra frente? Assinale todas que julgar correta:",
          maxSelections: 13,
          words: [
            { id: "p2_01", text: "Treinamento em Saúde e Segurança Ocupacional", effectByAspect: { pessoas: +4, atitudes: +3, negocio: +1 } },
            { id: "p2_02", text: "Treinamento e autorização para desempenhar sua função", effectByAspect: { pessoas: +4, atitudes: +3, negocio: +2 } },
            { id: "p2_03", text: "Uso adequado de todos os EPIs", effectByAspect: { pessoas: +3, atitudes: +2, negocio: +1 } },
            { id: "p2_04", text: "ATC – Autorização para Trabalho Crítico", effectByAspect: { pessoas: +1, atitudes: +3, negocio: +2 } },
            { id: "p2_05", text: "Direito de Recusa", effectByAspect: { pessoas: +4, atitudes: +2, negocio: -1 } },
            { id: "p2_06", text: "Uso de Perneira", effectByAspect: { pessoas: +2, atitudes: +1, negocio: +1 } },
            { id: "p2_07", text: "Identificação como Área Classificada", effectByAspect: { pessoas: +2, atitudes: +3, negocio: +2 } },
            { id: "p2_08", text: "ATE – Autorização de Trabalho Especial", effectByAspect: { pessoas: +1, atitudes: +3, negocio: +2 } },
            { id: "p2_09", text: "OPS Comportamental para os amigos", effectByAspect: { pessoas: +3, atitudes: +2, negocio: +1 } },
            { id: "p2_10", text: "OPS Condição pelos amigos", effectByAspect: { pessoas: +2, atitudes: +3, negocio: +1 } },
            { id: "p2_11", text: "Isolamento de Área", effectByAspect: { pessoas: +2, atitudes: +3, negocio: +2 } },
            { id: "p2_12", text: "Bloqueio de Energia", effectByAspect: { pessoas: +2, atitudes: +4, negocio: +3 } },
            { id: "p2_13", text: "Implementação de guarda-corpo", effectByAspect: { pessoas: +3, atitudes: +2, negocio: +1 } }
          ],
          onComplete: "useIndexHandleWordSel2"
        }
      },
      choices: []
    },
    {
      id: 3,
      title: "Pergunta 3",
      text: `Consciência: Estar presente, atento, perceber riscos e consequências.
União: Operação Segura é coletiva: eu protejo você, você me protege.
Integridade: Fazer sempre o certo, mesmo quando ninguém está olhando.
Disciplina: Cumprir o combinado, seguir procedimentos.
Atenção: Não ficar no automático: pausar, processar e prosseguir.
Responsabilidade: Com as Pessoas, com as Atitudes e com o Negócio.`,
      layout: "split",
      leftBlock: {
        component: "Video",
        props: {
          src: VideoQ3,
        }
      },
      rightBlock: {
        component: "CuidarQuestion",
        props: {
          title: "Pergunta 3",
          description: `Para cada aspecto do CUIDAR, indique se ele foi praticado ou não na cena apresentada:`,
          onComplete: "useIndexHandleCuidar"
        }
      },
      choices: []
    },
    {
      id: 4,
      title: "Pergunta 4",
      text: "Avalie os procedimentos em relação ao vídeo apresentado.",
      layout: "split",
      leftBlock: {
        component: "Video",
        props: {
          src: VideoQ4,
        }
      },
      rightBlock: {
        component: "ProcedimentosQuestion",
        props: {
          title: "Procedimentos",
          onComplete: "useIndexHandleProcedimentos"
        }
      },
      choices: []
    },
    {
      id: 5,
      title: "Pergunta 5",
      text: "O Nosso Jeito Seguro de Ser, apresenta 10 situações de riscos que precisam ser observadas para termos uma operação segura. Quais delas não foram seguidas nesta cena?",
      layout: "split",
      leftBlock: {
        component: "Video",
        props: {
          src: VideoQ5,
        }
      },
      rightBlock: {
        component: "WordSelection2",
        props: {
          // title: "Selecione até 3 opções",
          description: "O Nosso Jeito Seguro de Ser, apresenta 10 situações de riscos que precisam ser observadas para termos uma operação segura. Quais delas não foram seguidas nesta cena?",
          maxSelections: 10,
          words: [
            { id: "p5_01", text: "1. Utilizamos os Equipamentos de Proteção Individual (EPI) recomendados e as ferramentas requeridas e adequadas para cada atividade", effectByAspect: { pessoas: +3, atitudes: +3, negocio: +2 } },
            { id: "p5_02", text: "2. Só realizamos trabalhos de risco com a Autorização para Trabalhos Críticos ou Especiais (ATC/ATE) liberada no local e com implantação das medidas preventivas necessárias", effectByAspect: { pessoas: +2, atitudes: +4, negocio: +3 } },
            { id: "p5_03", text: "3. Sempre trabalhamos com máquinas ou equipamentos com as devidas proteções de partes que podem gerar acidentes", effectByAspect: { pessoas: +2, atitudes: +4, negocio: +3 } },
            { id: "p5_04", text: "4. Comunicamos imediatamente todo acidente à liderança, à Saúde Ocupacional ou à Segurança do Trabalho", effectByAspect: { pessoas: +4, atitudes: +3, negocio: +2 } },
            { id: "p5_05", text: "5. Sempre trabalhamos sem fazer o uso de bebidas alcoólicas ou drogas", effectByAspect: { pessoas: +4, atitudes: +3, negocio: +1 } },
            { id: "p5_06", text: "6. Respeitamos os limites de velocidade, conduzimos veículos sem utilizar aparelhos celulares simultaneamente e usamos o cinto de segurança, mesmo quando somos passageiros", effectByAspect: { pessoas: +3, atitudes: +2, negocio: +2 } },
            { id: "p5_07", text: "7. Respeitamos as áreas restritas, classificadas e isoladas e não entramos sem autorização", effectByAspect: { pessoas: +2, atitudes: +4, negocio: +3 } },
            { id: "p5_08", text: "8. Realizamos toda e qualquer atividade em condição segura e temos conhecimento do direito de recusar a execução de uma atividade se considerá-la insegura", effectByAspect: { pessoas: +4, atitudes: +3, negocio: +2 } },
            { id: "p5_09", text: "9. Somente executamos atividades em equipamentos e instalações após certificar que todas as fontes de energia foram isoladas de forma segura", effectByAspect: { pessoas: +2, atitudes: +4, negocio: +3 } },
            { id: "p5_10", text: "10. Somente operamos equipamentos de força motriz própria se tivermos habilitação, capacitação e autorização", effectByAspect: { pessoas: +3, atitudes: +3, negocio: +3 } }
          ],
          onComplete: "useIndexHandleWordSel2"
        }
      },
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
