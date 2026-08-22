# End-to-End Bundle — Composição

Os arquivos `archives/JhonRiffs-safe-import-end-to-end-20260822.zip` e `archives/JhonRiffs-safe-import-end-to-end-20260822-v2.zip` são exportações compactadas do namespace desta operação. O primeiro é preservado como snapshot histórico; o segundo será gerado após a consolidação dos documentos de auditoria e representa a versão final desta incorporação.

Cada bundle contém as camadas de origem, os arquivos ZIP preservados, o projeto moderno e as evidências disponíveis no momento de sua geração. Por segurança estrutural, cada bundle não contém a si próprio e não contém o manifesto externo `audit/FILES_MANIFEST_SHA256.tsv`, pois incluir o próprio arquivo dentro do hash criaria uma referência circular. O manifesto permanece versionado no namespace e cobre os arquivos externos, incluindo os bundles.

Nenhum artefato da fonte é descartado por causa dessa exclusão técnica: os ZIPs de origem permanecem em `archives/`, e as extrações completas permanecem nos diretórios `source/`. A integridade de ambos os bundles deve ser confirmada com `unzip -tqq` e seus hashes devem ser registrados em `audit/BUNDLE_HASHES.tsv`.
