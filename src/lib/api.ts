/**
 * API utilities for sending data to backend
 * 
 * Backend endpoints:
 * - /api/save_answer.php - Salva resposta individual de pergunta
 * - /api/save_group.php - Registra grupo
 * - /api/list_groups.php - Lista grupos de um evento/usina
 * - /api/get_active_event.php - Busca evento ativo
 */

// ============ API BASE URL ============
// URL do Apache (PHP backend) - ajustar conforme ambiente
import { Score, clamp } from "@/config/simulador";

const API_BASE_URL = "http://localhost/sensibilizacao_2026/api";

// ============ ANSWER PAYLOAD (novo formato) ============

export interface AnswerItemPayload {
  item_key: string;
  item_label: string;
  value_text?: string | null;
  value_num?: number | null;
  is_correct?: number; // -1 incorreto | 0 neutro | 1 correto
  delta_pessoas?: number;
  delta_atitudes?: number;
  delta_negocio?: number;
}

export interface SaveAnswerPayload {
  event_id: number;
  unit_id: number;
  group_id: number;
  group_name: string;
  question_id: number;
  delta: {
    pessoas: number;
    atitudes: number;
    negocio: number;
  };
  items: AnswerItemPayload[];
}

export interface SaveAnswerResponse {
  ok: boolean;
  message?: string;
}

/**
 * Envia a resposta de uma pergunta para o backend PHP (novo formato)
 */
export async function sendAnswerToBackend(payload: SaveAnswerPayload): Promise<SaveAnswerResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/save_answer.php`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar resposta para backend:', error);
    return { ok: false, message: "Erro de conexão com o servidor" };
  }
}

/**
 * Obtém dados necessários para envio de resposta do localStorage
 */
export function getAnswerContext(): { 
  eventId: number | null; 
  unitId: number | null; 
  groupId: number | null; 
  groupName: string | null;
  missingFields: string[];
} {
  const eventId = localStorage.getItem("acao_event_id");
  const unitId = localStorage.getItem("acao_unit_id");
  const groupId = localStorage.getItem("acao_group_id");
  const groupName = localStorage.getItem("acao_group_name");

  const missingFields: string[] = [];
  if (!eventId) missingFields.push("evento");
  if (!unitId) missingFields.push("usina");
  if (!groupId) missingFields.push("grupo (ID)");
  if (!groupName) missingFields.push("grupo (nome)");

  return {
    eventId: eventId ? parseInt(eventId, 10) : null,
    unitId: unitId ? parseInt(unitId, 10) : null,
    groupId: groupId ? parseInt(groupId, 10) : null,
    groupName,
    missingFields,
  };
}

/**
 * Obtém o nome do grupo salvo no localStorage
 */
export function getGroupName(): string | null {
  try {
    return localStorage.getItem("acao_group_name");
  } catch (e) {
    console.error("Erro ao ler nome do grupo:", e);
    return null;
  }
}

/**
 * Salva o nome do grupo no localStorage
 */
export function saveGroupName(name: string): boolean {
  try {
    localStorage.setItem("acao_group_name", name);
    return true;
  } catch (e) {
    console.error("Erro ao salvar nome do grupo:", e);
    return false;
  }
}

/**
 * Interface para payload de registro de grupo
 */
export interface SaveGroupPayload {
  event_id: number;
  unit_id: number;
  group_name: string;
}

export interface SaveGroupResponse {
  ok: boolean;
  group_id?: number;
  message?: string;
}

/**
 * Registra o grupo no backend
 */
export async function saveGroupToBackend(payload: SaveGroupPayload): Promise<SaveGroupResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/save_group.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao registrar grupo:', error);
    return { ok: false, message: "Erro de conexão com o servidor" };
  }
}

/**
 * Salva dados do grupo no localStorage
 */
export function saveGroupData(groupId: number, groupName: string): boolean {
  try {
    localStorage.setItem("acao_group_id", String(groupId));
    localStorage.setItem("acao_group_name", groupName);
    return true;
  } catch (e) {
    console.error("Erro ao salvar dados do grupo:", e);
    return false;
  }
}

/**
 * Obtém dados do grupo salvos no localStorage
 */
export function getGroupData(): { groupId: string | null; groupName: string | null } {
  try {
    return {
      groupId: localStorage.getItem("acao_group_id"),
      groupName: localStorage.getItem("acao_group_name"),
    };
  } catch (e) {
    console.error("Erro ao ler dados do grupo:", e);
    return { groupId: null, groupName: null };
  }
}

/**
 * Interface para grupo retornado pelo backend
 */
export interface GroupItem {
  id: number;
  name: string;
}

export interface ListGroupsResponse {
  ok: boolean;
  groups?: GroupItem[];
  message?: string;
}

/**
 * Busca lista de grupos para um evento/usina
 */
export async function listGroups(eventId: number, unitId: number): Promise<ListGroupsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/list_groups.php?event_id=${eventId}&unit_id=${unitId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return { ok: false, message: "Erro de conexão com o servidor" };
  }
}

/**
 * Mapeamento de códigos de usina para unit_id
 */
export const UNIT_MAP: Record<string, number> = {
  USM: 2,
  UIR: 1,
  USC: 3,
  UBV: 4,
};

export interface ActiveEventResponse {
  ok: boolean;
  event_id?: number;
  message?: string;
}

/**
 * Busca evento ativo para uma usina
 */
export async function getActiveEvent(unitCode: string): Promise<ActiveEventResponse> {
  const unitId = UNIT_MAP[unitCode];
  if (!unitId) {
    console.error("Código de usina inválido:", unitCode);
    return { ok: false, message: "Código de usina inválido" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/get_active_event.php?unit_id=${unitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar evento ativo:', error);
    return { ok: false, message: "Erro de conexão com o servidor" };
  }
}

/**
 * Salva dados da usina e evento no localStorage
 */
export function saveUnitEventData(unitCode: string, unitId: number, eventId: number): boolean {
  try {
    localStorage.setItem("acao_unit_code", unitCode);
    localStorage.setItem("acao_unit_id", String(unitId));
    localStorage.setItem("acao_event_id", String(eventId));
    return true;
  } catch (e) {
    console.error("Erro ao salvar dados da usina:", e);
    return false;
  }
}

/**
 * Obtém dados da usina salvos no localStorage
 */
export function getUnitEventData(): { unitCode: string | null; unitId: string | null; eventId: string | null } {
  try {
    return {
      unitCode: localStorage.getItem("acao_unit_code"),
      unitId: localStorage.getItem("acao_unit_id"),
      eventId: localStorage.getItem("acao_event_id"),
    };
  } catch (e) {
    console.error("Erro ao ler dados da usina:", e);
    return { unitCode: null, unitId: null, eventId: null };
  }
}

// ============ CHECK ANSWERED ============

export interface CheckAnsweredResponse {
  ok: boolean;
  answered: boolean;
  message?: string;
}

/**
 * Verifica se o grupo já respondeu uma pergunta na rodada ativa
 */
export async function checkAnswered(
  eventId: number,
  groupId: number,
  questionId: number
): Promise<CheckAnsweredResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check_answered.php?event_id=${eventId}&group_id=${groupId}&question_id=${questionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar resposta:', error);
    return { ok: false, answered: false, message: "Erro de conexão com o servidor" };
  }
}

// ============ GET GROUP SCORE ============

export interface ScoreTotals {
  pessoas: number;
  atitudes: number;
  negocio: number;
}

export interface GetGroupScoreResponse {
  ok: boolean;
  totals?: ScoreTotals;
  message?: string;
}

/**
 * Busca os deltas acumulados do grupo no backend
 * GET /api/get_group_score.php?event_id=...&unit_id=...&group_id=...
 */
export async function getGroupScore(
  eventId: number,
  unitId: number,
  groupId: number
): Promise<GetGroupScoreResponse> {
  try {
    const params = new URLSearchParams({
      event_id: String(eventId),
      unit_id: String(unitId),
      group_id: String(groupId),
    });

    const response = await fetch(`${API_BASE_URL}/get_group_score.php?${params}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Erro ao buscar score do grupo:", response.status);
      return { ok: false, message: "Erro ao buscar score" };
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar score do grupo:", error);
    return { ok: false, message: "Erro de conexão com o servidor" };
  }
}

const BASE_SCORE = 70;

/**
 * Calcula o score atual do grupo: base (70) + deltas do backend, clampado 0-100
 */
export function calculateScoreFromTotals(totals: ScoreTotals): Score {
  return {
    pessoas: clamp(BASE_SCORE + (totals.pessoas || 0)),
    atitudes: clamp(BASE_SCORE + (totals.atitudes || 0)),
    negocio: clamp(BASE_SCORE + (totals.negocio || 0)),
  };
}

/**
 * Busca e calcula o score atual do grupo
 * Retorna { pessoas: 70, atitudes: 70, negocio: 70 } se falhar
 */
export async function fetchAndCalculateGroupScore(
  eventId: number,
  unitId: number,
  groupId: number
): Promise<Score> {
  const defaultScore: Score = { pessoas: BASE_SCORE, atitudes: BASE_SCORE, negocio: BASE_SCORE };
  
  try {
    const response = await getGroupScore(eventId, unitId, groupId);
    
    if (response.ok && response.totals) {
      return calculateScoreFromTotals(response.totals);
    }
    
    console.warn("Score não encontrado, usando valores padrão (70)");
    return defaultScore;
  } catch (error) {
    console.error("Erro ao calcular score do grupo:", error);
    return defaultScore;
  }
}
