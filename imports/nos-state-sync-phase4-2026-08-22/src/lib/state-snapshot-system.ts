import { Firestore, collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { CONSENSUS_PROTOCOL } from './consensus';
import { XON_FUND_CONFIG } from './nexus-configs';
import { broadcastToSystem } from './neural-link';

/**
 * NEXUS STATE SNAPSHOT SYSTEM (V1.0)
 * Cria snapshots periódicos do estado crítico do ecossistema para auditoria e recuperação.
 */

export class StateSnapshotSystem {
  /**
   * Gera um snapshot do estado atual do ecossistema.
   * Inclui regras de consenso, configurações financeiras e estados de ledger.
   */
  static async createSnapshot(): Promise<{ success: boolean; snapshotId?: string; error?: string; snapshotData?: any }> {
    const { firestore } = initializeFirebase();
    try {
      // Coletar dados críticos do sistema
      const consensusRules = CONSENSUS_PROTOCOL.rules;
      const xonFundConfig = XON_FUND_CONFIG;

      // Exemplo: Coletar estado do ledger e da forge
      const ledgerRef = doc(firestore, 'system_state', 'the_ledger');
      const forgeRef = doc(firestore, 'system_state', 'the_forge');
      const financeRef = doc(firestore, 'system_state', 'finance');

      const ledgerSnap = await getDoc(ledgerRef);
      const forgeSnap = await getDoc(forgeRef);
      const financeSnap = await getDoc(financeRef);

      const snapshotData = {
        timestamp: serverTimestamp(),
        consensusRules,
        xonFundConfig,
        systemState: {
          the_ledger: ledgerSnap.exists() ? ledgerSnap.data() : null,
          the_forge: forgeSnap.exists() ? forgeSnap.data() : null,
          finance: financeSnap.exists() ? financeSnap.data() : null,
        },
        // Adicionar outros estados críticos conforme necessário
      };

      const docRef = await addDoc(collection(firestore, 'state_snapshots'), snapshotData);

      await broadcastToSystem(firestore, {
        message: `📸 [STATE_SNAPSHOT] Snapshot do estado do ecossistema criado: ${docRef.id}`,
        type: 'system',
        agentName: 'STATE-SNAPSHOT-SYSTEM',
        metadata: { snapshotId: docRef.id }
      });

      console.log(`✅ [STATE_SNAPSHOT] Snapshot criado com sucesso: ${docRef.id}`);
      return { success: true, snapshotId: docRef.id, snapshotData };
    } catch (error: any) {
      console.error(`❌ [STATE_SNAPSHOT] Erro ao criar snapshot:`, error.message);
      await broadcastToSystem(firestore, {
        message: `❌ [STATE_SNAPSHOT] Erro crítico ao criar snapshot: ${error.message}`,
        type: 'error',
        agentName: 'STATE-SNAPSHOT-SYSTEM'
      });
      return { success: false, error: error.message };
    }
  }
}
