import { backgroundJobNames, runOrchestratorJob } from "./background-jobs";

let stopped = false;

async function runOnce() {
  for (const jobName of backgroundJobNames) {
    await runOrchestratorJob(jobName);
  }
}

async function main() {
  await runOnce();
  console.log("[Nexus Jobs] ciclo concluído");
  if (!stopped) process.exit(0);
}

process.once("SIGTERM", () => { stopped = true; });
process.once("SIGINT", () => { stopped = true; });

main().catch((error) => {
  console.error("[Nexus Jobs] ciclo falhou", error);
  process.exitCode = 1;
});
