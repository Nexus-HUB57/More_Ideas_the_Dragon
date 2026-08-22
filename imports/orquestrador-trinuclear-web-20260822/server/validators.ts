/**
 * Validadores para códigos de bind e dados relacionados
 */

/**
 * Valida se um código segue o formato correto (:bind XXXX)
 * @param code - Código a validar
 * @returns true se válido, false caso contrário
 */
export function isValidBindCodeFormat(code: string): boolean {
  // Formato esperado: :bind seguido de alfanuméricos (maiúsculas, minúsculas, números)
  const bindCodeRegex = /^:bind\s+[a-zA-Z0-9]+$/;
  return bindCodeRegex.test(code.trim());
}

/**
 * Extrai o código da string de formato (:bind CODE)
 * @param formattedCode - String formatada como ":bind CODE"
 * @returns O código extraído ou null se inválido
 */
export function extractCodeFromFormat(formattedCode: string): string | null {
  const match = formattedCode.trim().match(/^:bind\s+([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

/**
 * Gera um novo código de bind aleatório
 * @param length - Comprimento do código (padrão: 24)
 * @returns Código gerado
 */
export function generateBindCode(length: number = 24): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Formata um código para o padrão ":bind CODE"
 * @param code - Código a formatar
 * @returns String formatada
 */
export function formatBindCode(code: string): string {
  return `:bind ${code}`;
}

/**
 * Valida se um código de bind é único (sem duplicatas)
 * @param code - Código a validar
 * @param existingCodes - Lista de códigos existentes
 * @returns true se único, false se duplicado
 */
export function isUniqueBindCode(code: string, existingCodes: string[]): boolean {
  return !existingCodes.includes(code);
}

/**
 * Valida se um código expirou
 * @param expiresAt - Data de expiração
 * @returns true se expirado, false caso contrário
 */
export function isBindCodeExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Valida se um ID de núcleo é válido
 * @param nucleusId - ID do núcleo
 * @returns true se válido, false caso contrário
 */
export function isValidNucleusId(nucleusId: string): boolean {
  // Aceita strings alfanuméricas com hífens e underscores
  const nucleusIdRegex = /^[a-zA-Z0-9_-]+$/;
  return nucleusIdRegex.test(nucleusId) && nucleusId.length > 0 && nucleusId.length <= 255;
}

/**
 * Valida se um nome de núcleo é válido
 * @param name - Nome do núcleo
 * @returns true se válido, false caso contrário
 */
export function isValidNucleusName(name: string): boolean {
  return name.length > 0 && name.length <= 255;
}
