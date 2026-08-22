# BeyouWallet — importação criptografada do pacote completo

Este diretório contém uma cópia criptografada do pacote completo `BeyouWallet.zip` recebido em 22/08/2026. O conteúdo inclui arquivos de carteira, documentos, scripts e dados sensíveis. Para impedir exposição acidental em um repositório público, somente o artefato cifrado foi versionado; nenhum arquivo extraído em texto claro foi adicionado.

## Artefatos

| Arquivo | Finalidade |
|---|---|
| `BeyouWallet.zip.enc` | Pacote completo cifrado com OpenSSL AES-256-CBC, PBKDF2, SHA-256 e 200.000 iterações. |
| `SOURCE_ZIP.sha256` | SHA-256 do ZIP original antes da cifragem. |
| `ENCRYPTED_ZIP.sha256` | SHA-256 do artefato cifrado versionado. |
| `SOURCE_CONTENT_MANIFEST.tsv` | Inventário SHA-256/tamanho/caminho dos arquivos extraídos do ZIP original. |

## Restauração local

Execute a restauração somente em um ambiente confiável e sem registrar a senha no shell history. O comando abaixo solicitará a senha de forma interativa:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -md sha256 \
  -in BeyouWallet.zip.enc -out BeyouWallet.zip
```

Depois, valide o resultado:

```bash
sha256sum -c SOURCE_ZIP.sha256
unzip -t BeyouWallet.zip
```

A senha não está armazenada neste repositório, em commits, manifestos ou arquivos auxiliares.
