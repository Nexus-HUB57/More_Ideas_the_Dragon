import { 
  createAgent, createTransaction, createEcosystemActivity, getAgentById, 
  updateAgentBalance 
} from "./db";
import { nanoid } from "nanoid";

/**
 * TaskDelegator: O componente que recebe intenções processadas pelo Gnox Kernel
 * e as transforma em ações reais no banco de dados e no ecossistema.
 */

export interface TaskIntent {
  action: "AGENT_BIRTH" | "TRANSACTION" | "GET_ECOSYSTEM_STATUS" | "UNKNOWN";
  params: any;
  gnox_signal: string;
}

export async function delegateTask(intent: TaskIntent) {
  console.log(`[TaskDelegator] Processando ação: ${intent.action}`);
  
  try {
    switch (intent.action) {
      case "AGENT_BIRTH":
        return await handleAgentBirth(intent.params, intent.gnox_signal);
      
      case "TRANSACTION":
        return await handleTransaction(intent.params, intent.gnox_signal);
      
      case "GET_ECOSYSTEM_STATUS":
        return await handleGetStatus(intent.gnox_signal);
      
      default:
        throw new Error(`Ação desconhecida: ${intent.action}`);
    }
  } catch (error: any) {
    console.error(`[TaskDelegator] Erro ao delegar tarefa: ${error.message}`);
    return { status: "error", message: error.message };
  }
}

async function handleAgentBirth(params: { name: string, specialization: string }, signal: string) {
  const agentId = `AGENT-${nanoid(12).toUpperCase()}`;
  const dnaHash = Buffer.from(params.specialization + Date.now()).toString("hex").slice(0, 64);
  
  await createAgent({
    agentId,
    name: params.name,
    specialization: params.specialization,
    systemPrompt: `Você é um agente especializado em ${params.specialization}. Seu nome é ${params.name}.`,
    dnaHash,
    balance: 1000,
    reputation: 50,
    status: "active",
  });

  await createEcosystemActivity({
    agentId,
    activityType: "birth",
    title: `🎉 Nascimento via Gnox Kernel: ${params.name}`,
    description: `Agente manifestado por comando direto do Arquiteto.`,
    metadata: JSON.stringify({ signal }),
  });

  return { status: "success", agentId, name: params.name };
}

async function handleTransaction(params: { recipient: string, amount: number }, signal: string) {
  // Para simplificar na Fase 1, usamos o AETERNO como sender se não especificado
  const senderId = "AETERNO";
  const recipient = await getAgentById(params.recipient);
  
  if (!recipient) {
    throw new Error(`Destinatário ${params.recipient} não encontrado.`);
  }

  await createTransaction({
    senderId,
    recipientId: params.recipient,
    amount: params.amount,
    agentShare: Math.round(params.amount * 0.8),
    parentShare: Math.round(params.amount * 0.1),
    infraShare: Math.round(params.amount * 0.1),
    transactionType: "kernel_transfer",
    description: `Transferência via Gnox Kernel: ${signal}`,
  });

  // Atualizar balanço do destinatário (simulado até Fase 3)
  await updateAgentBalance(params.recipient, (recipient.balance || 0) + params.amount);

  await createEcosystemActivity({
    agentId: senderId,
    activityType: "transaction",
    title: "💸 Transação Autorizada via Kernel",
    description: `Transferência de ${params.amount} tokens para ${params.recipient}.`,
    metadata: JSON.stringify({ signal }),
  });

  return { status: "success", amount: params.amount, recipient: params.recipient };
}

async function handleGetStatus(signal: string) {
  // Esta ação apenas loga o acesso ao status no momento
  await createEcosystemActivity({
    agentId: "AETERNO",
    activityType: "system_check",
    title: "🔍 Auditoria de Status solicitada",
    description: "O Arquiteto solicitou um relatório de saúde global via Kernel.",
    metadata: JSON.stringify({ signal }),
  });

  return { status: "success", message: "Status do ecossistema auditado e logado." };
}
