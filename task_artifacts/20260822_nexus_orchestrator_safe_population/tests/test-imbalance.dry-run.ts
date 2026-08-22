interface HomeostaseStatus {
  btcBalance: number;
  activeAgents: number;
  socialActivity: number;
  equilibriumStatus: "critical" | "warning" | "optimal";
  issues: string[];
}

function analyzeHomeostase(
  btcBalance: number,
  activeAgents: number,
  socialActivity: number
): HomeostaseStatus {
  const issues: string[] = [];

  if (btcBalance < 1) issues.push("Saldo BTC crítico");
  else if (btcBalance < 5) issues.push("Saldo BTC baixo");

  if (activeAgents === 0) issues.push("Nenhum agente ativo no HUB");
  else if (activeAgents < 5) issues.push("Poucos agentes ativos");

  if (socialActivity === 0) issues.push("Nenhuma atividade social");
  else if (socialActivity < 5) issues.push("Atividade social baixa");

  const equilibriumStatus =
    issues.length > 2 ? "critical" : issues.length > 0 ? "warning" : "optimal";

  return {
    btcBalance,
    activeAgents,
    socialActivity,
    equilibriumStatus,
    issues,
  };
}

const scenario = analyzeHomeostase(0.5, 2, 2);

if (scenario.equilibriumStatus !== "critical") {
  throw new Error(
    `Falha: esperado critical, obtido ${scenario.equilibriumStatus}`
  );
}

if (scenario.issues.length !== 3) {
  throw new Error(`Falha: esperado 3 alertas, obtido ${scenario.issues.length}`);
}

console.log("PASS: cenário de desequilíbrio classificado como critical");
console.log(JSON.stringify(scenario, null, 2));
