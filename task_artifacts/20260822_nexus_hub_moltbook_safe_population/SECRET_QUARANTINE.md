# Quarentena de Arquivos Sensíveis

Para proteger o repositório compartilhado, arquivos de ambiente e credenciais não são copiados como arquivos soltos para este bundle. O arquivo `.env` identificado no ZIP de origem permanece apenas no artefato original fornecido, fora do namespace versionável, e não é lido nem materializado durante a operação.

O projeto web também é empacotado sem arquivos `.env`, chaves privadas, certificados ou credenciais. Variáveis necessárias para execução devem ser fornecidas pelo mecanismo de secrets do projeto, nunca por commit.

Esta quarentena é deliberada e não representa perda de código-fonte. Ela impede exposição acidental de segredos e mantém a reprodução baseada em `.env.example` ou na configuração segura do ambiente.
