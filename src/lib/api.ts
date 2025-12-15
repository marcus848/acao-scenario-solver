/**
 * API utilities for sending data to backend
 * 
 * Backend endpoints:
 * - /api/save_answer.php - Salva resposta individual de pergunta
 */

import { Score } from "@/config/simulador";

export interface AnswerPayload {
  group_name: string;
  question_id: number;
  answer: {
    type: "choice" | "rating" | "word-selection";
    value: string | Record<string, number> | string[];
    label?: string;
  };
  effect: Partial<Score>;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
}

/**
 * Envia a resposta de uma pergunta para o backend PHP
 * 
 * @param payload - Dados da resposta formatados conforme AnswerPayload
 * @returns Promise com a resposta do backend ou null em caso de erro
 */
export async function sendAnswerToBackend(payload: AnswerPayload) {
  try {
    const response = await fetch('http://localhost/sensibilizacao_2026/api/save_answer.php', {
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
    return null;
  }
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
    const response = await fetch('http://localhost/sensibilizacao_2026/api/save_group.php', {
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
    const response = await fetch(`http://localhost/sensibilizacao_2026/api/get_active_event.php?unit_id=${unitId}`, {
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
