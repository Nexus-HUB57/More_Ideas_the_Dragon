export type ObscuraAutonomy = "recommend" | "execute_reversible" | "execute_guarded";
export type ObscuraPhase = "discover" | "plan" | "execute" | "verify" | "recover" | "learn";
export type ObscuraRisk = "low" | "medium" | "high" | "critical";

export type ObscuraPolicy = {
  autonomy: ObscuraAutonomy;
  risk: ObscuraRisk;
  maxSteps: number;
  budgetUnits: number;
  approvalRef?: string;
  rollbackPlan?: string;
};

export type ObscuraStep<TContext> = {
  id: string;
  phase: Exclude<ObscuraPhase, "discover" | "plan" | "recover" | "learn">;
  estimatedCost?: number;
  run: (context: Readonly<TContext>) => TContext | Promise<TContext>;
  verify?: (context: Readonly<TContext>) => boolean | Promise<boolean>;
};

export type ObscuraEvent = {
  phase: ObscuraPhase;
  status: "started" | "completed" | "failed" | "skipped";
  detail: string;
  at: string;
};

export type ObscuraResult<TContext> = {
  status: "completed" | "recommended" | "blocked" | "failed";
  context: TContext;
  events: ObscuraEvent[];
  completedSteps: string[];
  consumedBudgetUnits: number;
  rollbackRequired: boolean;
};

function emit(events: ObscuraEvent[], phase: ObscuraPhase, status: ObscuraEvent["status"], detail: string) {
  events.push({ phase, status, detail, at: new Date().toISOString() });
}

function assertPolicy(policy: ObscuraPolicy, steps: ObscuraStep<unknown>[]) {
  if (policy.maxSteps < 1) throw new Error("Obscura exige maxSteps positivo.");
  if (policy.budgetUnits < 0) throw new Error("Obscura exige budget não negativo.");
  if (steps.length > policy.maxSteps) throw new Error(`Processo Obscura excede maxSteps: ${steps.length}/${policy.maxSteps}.`);
  if (policy.autonomy === "execute_guarded" && ["high", "critical"].includes(policy.risk) && (!policy.approvalRef || !policy.rollbackPlan)) {
    throw new Error("Processo execute_guarded de alto risco exige approvalRef e rollbackPlan.");
  }
}

export async function runObscuraProcess<TContext>(
  initialContext: TContext,
  steps: ObscuraStep<TContext>[],
  policy: ObscuraPolicy,
): Promise<ObscuraResult<TContext>> {
  assertPolicy(policy, steps as ObscuraStep<unknown>[]);
  const events: ObscuraEvent[] = [];
  const completedSteps: string[] = [];
  let context = initialContext;
  let consumedBudgetUnits = 0;
  let rollbackRequired = false;

  emit(events, "discover", "started", "Contexto e política carregados.");
  emit(events, "discover", "completed", `${steps.length} steps descobertos.`);
  emit(events, "plan", "started", `Plano com ${steps.length} steps e budget ${policy.budgetUnits}.`);
  emit(events, "plan", "completed", "Plano validado.");

  if (policy.autonomy === "recommend") {
    emit(events, "execute", "skipped", "Autonomia recommend: nenhuma mutação executada.");
    emit(events, "learn", "completed", "Recomendação pronta para aprovação.");
    return { status: "recommended", context, events, completedSteps, consumedBudgetUnits, rollbackRequired };
  }

  for (const step of steps) {
    const cost = step.estimatedCost ?? 1;
    if (consumedBudgetUnits + cost > policy.budgetUnits) {
      emit(events, "execute", "failed", `Budget excedido antes do step ${step.id}.`);
      rollbackRequired = completedSteps.length > 0;
      if (rollbackRequired) emit(events, "recover", "started", "Rollback requerido pelo budget.");
      return { status: "blocked", context, events, completedSteps, consumedBudgetUnits, rollbackRequired };
    }
    consumedBudgetUnits += cost;
    emit(events, "execute", "started", step.id);
    try {
      context = await step.run(context);
      if (step.verify && !(await step.verify(context))) {
        rollbackRequired = true;
        emit(events, "verify", "failed", `Verificação falhou no step ${step.id}.`);
        emit(events, "recover", "started", "Rollback requerido por verificação falha.");
        return { status: "failed", context, events, completedSteps, consumedBudgetUnits, rollbackRequired };
      }
      completedSteps.push(step.id);
      emit(events, "execute", "completed", step.id);
    } catch (error) {
      rollbackRequired = completedSteps.length > 0;
      emit(events, "execute", "failed", error instanceof Error ? error.message : `Falha no step ${step.id}.`);
      if (rollbackRequired) emit(events, "recover", "started", "Rollback requerido por erro de execução.");
      return { status: "failed", context, events, completedSteps, consumedBudgetUnits, rollbackRequired };
    }
  }

  emit(events, "verify", "completed", `${completedSteps.length} steps verificados.`);
  emit(events, "learn", "completed", "Resultado pronto para persistência como memória procedural.");
  return { status: "completed", context, events, completedSteps, consumedBudgetUnits, rollbackRequired };
}
