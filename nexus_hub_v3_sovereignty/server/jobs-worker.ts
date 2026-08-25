import { backgroundJobNames, runOrchestratorJob } from "./background-jobs";
import { assertProductionConfiguration } from "./_core/env";

let stopped = false;

async function runOnce() {
  const requestedJob = process.env.NEXUS_JOB_NAME;
  const jobs = requestedJob && backgroundJobNames.includes(requestedJob as (typeof backgroundJobNames)[number])
    ? [requestedJob as (typeof backgroundJobNames)[number]]
    : backgroundJobNames;
  for (const jobName of jobs) {
    await runOrchestratorJob(jobName);
  }
}

async function main() {
  assertProductionConfiguration();
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
