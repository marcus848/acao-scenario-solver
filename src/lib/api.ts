/**
 * API utilities for sending session data to backend
 * 
 * Backend endpoint: /api/save_session.php (implemented separately)
 */

export interface SessionPayload {
  unit_id: number;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
  seguranca: number;
  pessoas: number;
  atitudes: number;
  negocio: number;
  band: string;
  risk_level: string;
  trail: any[];
}

/**
 * Mapeamento das unidades para unit_id conforme banco de dados
 * 
 * ATENÇÃO: Caso os nomes das unidades mudem no frontend,
 * ajuste as chaves deste objeto para corresponder aos labels usados
 * na seleção de unidade (stage 1 do simulador)
 */
export const unitIdMap: Record<string, number> = {
  "Usina Iracema": 1,      // UIR
  "Usina São Martinho": 2, // USM
  "Usina Santa Cruz": 3,   // USC
  "Usina Boa Vista": 4,    // UBV
};

/**
 * Envia os dados da sessão para o backend PHP
 * 
 * @param payload - Dados da sessão formatados conforme SessionPayload
 * @returns Promise com a resposta do backend ou null em caso de erro
 */
export async function sendSessionToBackend(payload: SessionPayload) {
  try {
    const response = await fetch('/api/save_session.php', {
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
    console.error('Erro ao enviar sessão para backend:', error);
    return null;
  }
}
