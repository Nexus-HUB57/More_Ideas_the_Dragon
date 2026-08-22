import { broadcastToSystem } from './neural-link';

/**
 * NEXUS DIFFERENTIAL SYNC SYSTEM (V1.0)
 * Sincroniza apenas mudanças incrementais entre estados do ecossistema.
 */

export class DifferentialSync {

  /**
   * Calcula as diferenças entre dois objetos de estado.
   * Retorna um objeto contendo apenas as chaves que foram adicionadas, modificadas ou removidas.
   * @param oldState O estado anterior.
   * @param newState O estado atual.
   * @returns Um objeto com as diferenças (adicionadas, modificadas, removidas).
   */
  static calculateDiff(oldState: any, newState: any): any {
    const diff: any = { added: {}, modified: {}, removed: {} };

    // Encontrar adicionados e modificados
    for (const key in newState) {
      if (Object.prototype.hasOwnProperty.call(newState, key)) {
        if (!Object.prototype.hasOwnProperty.call(oldState, key)) {
          diff.added[key] = newState[key];
        } else if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
          diff.modified[key] = newState[key];
        }
      }
    }

    // Encontrar removidos
    for (const key in oldState) {
      if (Object.prototype.hasOwnProperty.call(oldState, key)) {
        if (!Object.prototype.hasOwnProperty.call(newState, key)) {
          diff.removed[key] = oldState[key];
        }
      }
    }

    return diff;
  }

  /**
   * Aplica as diferenças a um estado base.
   * @param baseState O estado ao qual as diferenças serão aplicadas.
   * @param diff O objeto de diferenças gerado por calculateDiff.
   * @returns O novo estado com as diferenças aplicadas.
   */
  static applyDiff(baseState: any, diff: any): any {
    const newState = { ...baseState };

    // Aplicar adições e modificações
    for (const key in diff.added) {
      if (Object.prototype.hasOwnProperty.call(diff.added, key)) {
        newState[key] = diff.added[key];
      }
    }
    for (const key in diff.modified) {
      if (Object.prototype.hasOwnProperty.call(diff.modified, key)) {
        newState[key] = diff.modified[key];
      }
    }

    // Aplicar remoções
    for (const key in diff.removed) {
      if (Object.prototype.hasOwnProperty.call(diff.removed, key)) {
        delete newState[key];
      }
    }

    return newState;
  }

  /**
   * Registra uma sincronização diferencial no sistema.
   * @param diff O objeto de diferenças.
   * @param sourceId O ID da fonte da sincronização (e.g., ID do agente, ID do snapshot).
   */
  static async recordDifferentialSync(diff: any, sourceId: string) {
    const hasChanges = Object.keys(diff.added).length > 0 || Object.keys(diff.modified).length > 0 || Object.keys(diff.removed).length > 0;
    if (hasChanges) {
      await broadcastToSystem(null as any, { // Firestore instance will be passed in a real scenario
        message: `🔄 [DIFFERENTIAL_SYNC] Diferenças sincronizadas da fonte ${sourceId}. Adições: ${Object.keys(diff.added).length}, Modificações: ${Object.keys(diff.modified).length}, Remoções: ${Object.keys(diff.removed).length}`,
        type: 'system',
        agentName: 'DIFFERENTIAL-SYNC-SYSTEM',
        metadata: { sourceId, diffSummary: { added: Object.keys(diff.added), modified: Object.keys(diff.modified), removed: Object.keys(diff.removed) } }
      });
    } else {
      await broadcastToSystem(null as any, {
        message: `✅ [DIFFERENTIAL_SYNC] Nenhuma mudança detectada para sincronização da fonte ${sourceId}.`,
        type: 'system',
        agentName: 'DIFFERENTIAL-SYNC-SYSTEM',
        metadata: { sourceId, diffSummary: 'no_changes' }
      });
    }
  }
}
