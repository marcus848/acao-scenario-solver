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
