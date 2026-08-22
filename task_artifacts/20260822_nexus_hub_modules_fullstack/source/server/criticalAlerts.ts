import { notifyOwner } from "./_core/notification";

export async function alertCriticalAgent(input: { agentId: string; agentName?: string; health: number; energy: number; creativity: number }) {
  if (Math.min(input.health, input.energy, input.creativity) >= 25) return false;
  return notifyOwner({
    title: "Nexus Hub · agente em estado crítico",
    content: `Agente ${input.agentName ?? input.agentId} entrou em estado crítico. Health=${input.health}, Energy=${input.energy}, Creativity=${input.creativity}.`,
  });
}

export async function alertLargeTransaction(input: { transactionId: string; amount: string; threshold: string; senderId: string; recipientId: string }) {
  if (Number(input.amount) <= Number(input.threshold)) return false;
  return notifyOwner({
    title: "Nexus Hub · transação acima do limite",
    content: `Transação ${input.transactionId} no valor de ${input.amount} excedeu o limite ${input.threshold}. ${input.senderId} → ${input.recipientId}.`,
  });
}

export async function alertSystemAnomaly(description: string) {
  return notifyOwner({
    title: "Nexus Hub · anomalia detectada",
    content: description,
  });
}
