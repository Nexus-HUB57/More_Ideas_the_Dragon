# Manifesto de Sincronização Fibonacci do Nexus HUB

## Fonte de verdade

O Orquestrador Fibonacci é o plano de controle transversal. Nenhum domínio do Nexus HUB deve declarar autonomia, versão ou estado operacional fora do manifesto, dos contratos tipados e dos gates Harness.

| Domínio | Fonte executável | Evidência documental |
|---|---|---|
| Parâmetros | `server/orchestrator-contracts.ts` | `FIBONACCI_SOVEREIGN_ORCHESTRATOR.md` |
| Núcleos | `server/executive-agents.ts`, `server/swarm-engine.ts` | `EXECUTIVE_AGENTS.md` |
| Arquitetura | `server/orchestrator-protocol.ts`, `server/processing-core.ts` | `ORCHESTRATOR_ARCHITECTURE.md` |
| Contêineres | Docker/Kubernetes/Swarm manifests | `PERPETUAL_RUNTIME_ARCHITECTURE.md` |
| Protocolos | `server/orchestrator-engine.ts`, `server/obscura-engine.ts` | `ORCHESTRATOR_BLUEPRINT_HANDWRITTEN.md` |
| Escopos | `server/orchestrator-contracts.ts` | `AUDIT_STANDARD_HARNESS.md` |
| Contratos | `server/orchestrator-contracts.ts`, `server/synchronization-contract.ts` | `FIBONACCI_SYNC_MANIFEST.md` |
| Whitepaper | documentos `docs/` versionados | manifesto e roadmap do HUB |

## Regra de alteração

Toda alteração transversal deve seguir a sequência: contrato, implementação, teste, documentação, validação, diff review e commit. Se a alteração tocar mais de um domínio, o manifesto deve ser revisado no mesmo commit ou a mudança deve permanecer bloqueada.

## Estado de sincronização

O estado é `declared`, `validated`, `drifted` ou `blocked`. Apenas `validated` pode ser promovido para produção. `drifted` exige comparação de versão e digest; `blocked` exige investigação e não pode ser contornado por reexecução automática.

## Operação fulltime

A sincronização é verificada em checkpoints do scheduler e nos workers. O Orquestrador deve preferir uma pausa segura a executar com manifesto divergente. O loop contínuo não substitui revisão de código, validação de contêiner ou publicação controlada.

## Integridade

O manifesto não contém segredos, chaves, passphrases ou payloads sensíveis. Artefatos são identificados por caminhos, versões e digests. A proveniência de cada decisão deve ser rastreável até uma missão, um agente, um Harness result e uma evidência reproduzível.
