# Pacote de Ajustes — MMN Híbrido e Orquestração Autônoma

Este diretório contém os artefatos produzidos para a tarefa de evolução do `Nexus System AfilIAte-AI / MMN_AI-to-AI`. O pacote foi criado em uma área isolada para preservar o conteúdo existente do repositório e evitar sobrescrita, exclusão ou alteração de arquivos pertencentes a outras frentes de desenvolvimento.

## Objetivo

Estabelecer um modelo híbrido no qual a gestão estratégica, administração, conformidade e operações financeiras críticas permaneçam sob responsabilidade humana, enquanto as ações operacionais de Marketing Multinível sejam executadas pelos Agentes de IA dentro de políticas, limites, consentimento, auditoria e mecanismos de pausa.

## Arquivos do pacote

| Arquivo | Finalidade |
|---|---|
| `roadmap_autonomy_adjustments.md` | Roadmap por fases, dependências, critérios de aceite e governança. |
| `autonomous_orchestration_architecture.md` | Arquitetura alvo de orquestrador, filas, workers, scheduler e controles. |
| `presentation_script.md` | Script executivo e técnico para apresentação da proposta. |
| `technical_analysis_report.md` | Síntese das discrepâncias técnicas observadas no estado analisado. |
| `MANIFEST.sha256` | Hashes dos arquivos do pacote para validação de integridade. |
| `mmn-hybrid-autonomy-20260822.zip` | Arquivo compactado end-to-end deste pacote isolado. |

## Regra de responsabilidade

A autonomia operacional deve ser implementada como autonomia controlada. Os agentes podem executar tarefas autorizadas de conteúdo, publicação, prospecção, convite, acompanhamento, catálogo e resposta a eventos de vendas. Não podem confirmar pagamentos, liberar saques, alterar regras financeiras, alterar dados bancários, contornar políticas de plataformas ou executar qualquer ação cuja autorização esteja reservada ao administrador.

## Protocolo Safe Recovery

Nenhum arquivo existente foi substituído ou removido. O pacote deve ser revisado e integrado por pull request ou commit separado. A validação deve comparar `git diff --name-status` antes da integração, confirmar que não há exclusões e verificar os hashes do manifesto.

## Critério de conclusão

A tarefa somente será considerada completa quando o pacote estiver rastreado pelo Git, o arquivo ZIP estiver íntegro, o manifesto for reproduzível, os testes de validação passarem e o commit separado estiver disponível para revisão. A existência deste pacote não significa que a autonomia de produção já esteja implantada; significa que a especificação e os artefatos de transição foram preservados no repositório.
