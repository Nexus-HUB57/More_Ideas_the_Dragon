# Source sanitization notice

O arquivo de metadados `source/.project-config.json` da cópia local continha credenciais temporárias da AWS. Para impedir a publicação de chaves, o arquivo sensível foi removido apenas da cópia de importação e substituído por `source/.project-config.sanitized.json`, que contém exclusivamente metadados não secretos.

A fonte local `/home/ubuntu/nexus-hub-v3` não foi alterada. O arquivo original não é incluído no commit nem no ZIP público. A diferença é intencional e está registrada para auditoria.
