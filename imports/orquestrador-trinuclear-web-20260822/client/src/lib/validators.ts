/**
 * Validadores para códigos de bind (lado do cliente)
 */

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
 * Valida se um código segue o formato correto (:bind XXXX)
 * @param code - Código a validar
 * @returns true se válido, false caso contrário
 */
export function isValidBindCodeFormat(code: string): boolean {
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
