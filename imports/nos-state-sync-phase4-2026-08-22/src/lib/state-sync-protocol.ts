import { StateSnapshotSystem } from './state-snapshot-system';
import { DifferentialSync } from './differential-sync';
import { ConsensusMechanism } from './consensus-mechanism';
import { BlockchainAnchoring } from './blockchain-anchoring';
import { broadcastToSystem } from './neural-link';
import { initializeFirebase } from '@/firebase';

/**
 * NEXUS STATE SYNC PROTOCOL (V1.0)
 * Orquestra a sincronização eficiente de estado entre agentes distribuídos,
 * garantindo consistência eventual, mecanismos de rollback e imutabilidade via blockchain.
 */
export class StateSyncProtocol {
  private static lastKnownState: any = null;

  /**
   * Inicializa o protocolo de sincronização de estado.
   * Carrega o último snapshot conhecido ou cria um novo se não existir.
   */
  static async initialize() {
    const { firestore } = initializeFirebase();
    try {
      // Em um cenário real, buscaríamos o último snapshot persistido.
      // Por simplicidade, vamos criar um snapshot inicial.
      const { success, snapshotData } = await StateSnapshotSystem.createSnapshot();
      if (success && snapshotData) {
        StateSyncProtocol.lastKnownState = snapshotData;
        await broadcastToSystem(firestore, {
          message: `✅ [STATE_SYNC_PROTOCOL] Protocolo inicializado. Snapshot inicial carregado.`,
          type: 'system',
          agentName: 'STATE-SYNC-PROTOCOL'
        });
      } else {
        throw new Error("Falha ao criar/carregar snapshot inicial.");
      }
    } catch (error: any) {
      console.error(`❌ [STATE_SYNC_PROTOCOL] Erro na inicialização:`, error.message);
      await broadcastToSystem(firestore, {
        message: `❌ [STATE_SYNC_PROTOCOL] Erro crítico na inicialização: ${error.message}`,
        type: 'error',
        agentName: 'STATE-SYNC-PROTOCOL'
      });
    }
  }

  /**
   * Executa um ciclo completo de sincronização de estado.
   * 1. Cria um novo snapshot.
   * 2. Calcula as diferenças incrementais.
   * 3. Tenta alcançar consenso para operações críticas (se houver).
   * 4. Ancorar o estado crítico na blockchain (se houver).
   * 5. Aplica as diferenças e atualiza o estado conhecido.
   */
  static async syncState(operationId: string, criticalOperation: boolean = false, participatingAgents: string[] = []) {
    const { firestore } = initializeFirebase();
    try {
      // 1. Criar um novo snapshot do estado atual
      const { success: snapshotSuccess, snapshotId, snapshotData } = await StateSnapshotSystem.createSnapshot();
      if (!snapshotSuccess || !snapshotData) {
        throw new Error("Falha ao criar novo snapshot durante a sincronização.");
      }

      // 2. Calcular as diferenças incrementais
      if (StateSyncProtocol.lastKnownState) {
        const diff = DifferentialSync.calculateDiff(StateSyncProtocol.lastKnownState, snapshotData);
        await DifferentialSync.recordDifferentialSync(diff, snapshotId || operationId);
        // Em um sistema real, essas diferenças seriam distribuídas e aplicadas.
      }

      // 3. Tentar alcançar consenso para operações críticas
      if (criticalOperation) {
        const consensusAchieved = await ConsensusMechanism.achieveConsensus(operationId, participatingAgents);
        if (!consensusAchieved) {
          await BlockchainAnchoring.rollbackFailedOperation(operationId, "Consenso não alcançado para operação crítica.");
          throw new Error("Consenso não alcançado para operação crítica.");
        }
      }

      // 4. Ancorar o estado crítico na blockchain
      if (criticalOperation) {
        const stateHash = JSON.stringify(snapshotData); // Hash do snapshot para ancoragem
        const anchorResult = await BlockchainAnchoring.anchorStateToBitcoin(stateHash, `Estado crítico de ${operationId}`);
        if (!anchorResult.success) {
          await BlockchainAnchoring.rollbackFailedOperation(operationId, `Falha na ancoragem de blockchain: ${anchorResult.error}`);
          throw new Error("Falha na ancoragem de blockchain.");
        }
      }

      // 5. Atualizar o último estado conhecido
      StateSyncProtocol.lastKnownState = snapshotData;

      await broadcastToSystem(firestore, {
        message: `✅ [STATE_SYNC_PROTOCOL] Ciclo de sincronização concluído para ${operationId}.`,
        type: 'system',
        agentName: 'STATE-SYNC-PROTOCOL',
        metadata: { operationId, snapshotId }
      });

      return { success: true, snapshotId };

    } catch (error: any) {
      console.error(`❌ [STATE_SYNC_PROTOCOL] Erro durante o ciclo de sincronização para ${operationId}:`, error.message);
      await broadcastToSystem(firestore, {
        message: `❌ [STATE_SYNC_PROTOCOL] Erro crítico durante o ciclo de sincronização para ${operationId}: ${error.message}`,
        type: 'error',
        agentName: 'STATE-SYNC-PROTOCOL',
        metadata: { operationId, error: error.message }
      });
      return { success: false, error: error.message };
    }
  }
}
