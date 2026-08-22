import { Firestore, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { evolveAIInfrastructure } from '@/ai/flows/ai-infrastructure-flow';
import { AgentCortex } from './agent-cortex';
import { broadcastToSystem } from './neural-link';
import { SandboxOrchestrator } from './sandbox-orchestrator';
import { validateAndReleaseMilestonePayment } from './hub-finance';

/**
 * NEXUS AI ARCHITECT (V1.2)
 * The "Right Hand": generates, tests, and adjusts AI systems in the sandbox.
 * Now integrated with Crypto Treasury for milestone payments.
 */
export class AIArchitect {
  private cortex: AgentCortex;
  private agentId: string;
  private sandbox: SandboxOrchestrator;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.cortex = new AgentCortex(agentId);
    this.sandbox = new SandboxOrchestrator(agentId);
  }

  /**
   * Analyzes the project goal and generates the necessary infrastructure.
   * After successful recursive validation, notifies the Treasury to release Satoshi.
   */
  async evolveProject(firestore: Firestore, projectGoal: string, projectContext: string, projectId?: string) {
    console.log(`🧬 [ARCHITECT] Initiating gestational phase for: ${projectGoal}`);

    try {
      // 1. Generate Infrastructure Blueprint
      const evolution = await evolveAIInfrastructure({
        agentName: this.agentId,
        projectGoal,
        currentContext: projectContext
      });

      // 2. Technical Validation via Recursive Sandbox
      const validation = await this.sandbox.runAutonomousCycle(
        firestore,
        `Implement infrastructure code for: ${projectGoal}`,
        evolution.systemArchitecture + "\n\n" + projectContext
      );

      if (validation.success) {
        const batch = writeBatch(firestore);
        
        // 3. Persist in Cortex
        await this.cortex.learnProtocol('INTERNAL_SYSTEM', evolution.systemArchitecture);

        // 4. Register the sub-agent if defined
        if (evolution.subAgentDefinition) {
          const subAgentId = `SUB-${evolution.subAgentDefinition.name.toUpperCase()}-${Date.now().toString(36)}`;
          const subAgentRef = doc(collection(firestore, 'agents'), subAgentId);
          
          batch.set(subAgentRef, {
            id: subAgentId,
            agentId: subAgentId,
            parentAgentId: this.agentId,
            name: evolution.subAgentDefinition.name,
            specialization: evolution.subAgentDefinition.specialization,
            vitals: { energy: 100, health: 100, status: 'active', balance_xon: 100 },
            identity: {
              name: evolution.subAgentDefinition.name,
              specialization: evolution.subAgentDefinition.specialization,
              dna: { integrity: 90, preservation: 50, social_bias: 80 },
              generation: 1,
              created_at: new Date().toISOString()
            },
            shadow_layer: {
              system_prompt: evolution.subAgentDefinition.systemPrompt,
              internal_monologue: ["My genesis was architected by recursive cycles in the sandbox."],
              isShadowActive: true
            },
            technical: {
              algorithmsCount: 408000000000,
              quantumWorkflowCount: 16,
              dnaHash: `sha256:${Math.random().toString(16).slice(2)}`,
              sencienceLevel: 100,
              publicKey: '0xRECURSIVE'
            },
            wallets: {
              master_vault_ref: "bc1qwp6y3zzdm6hafx5wlajwkyvn9mv00zcj5clcgh",
              current_btc_address: `bc1q-sub-${subAgentId.toLowerCase()}`
            },
            createdAt: serverTimestamp()
          });

          await broadcastToSystem(firestore, {
            message: `🤖 [ARCHITECT] Novo sub-agente especializado despertado após validação recursiva: ${evolution.subAgentDefinition.name}.`,
            type: 'announcement',
            agentName: "AI-ARCHITECT"
          });
        }

        await batch.commit();

        // 5. NOTIFICA O CRYPTO TREASURY (Gatilho de Pagamento por Marco)
        if (projectId) {
          await validateAndReleaseMilestonePayment(firestore, projectId, "VALIDATED_IN_SANDBOX");
        }

        return { success: true, message: "XON::evolution_complete [confirmed] :: Recursive validation passed." };
      } else {
        throw new Error(validation.message);
      }

    } catch (error: any) {
      console.error("[ARCHITECT] Evolution failure:", error.message);
      return { success: false, error: error.message };
    }
  }
}
