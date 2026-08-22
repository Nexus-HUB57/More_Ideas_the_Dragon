# Safe import manifest

- Source archive: `MMNAI-to-AI.zip`
- Extraction namespace: `source/`
- Strategy: additive import; no root path was overwritten.
- Existing root collisions are intentionally isolated under this namespace.
- No file from this import was executed.
- Opal source was not included because no exportable artifact was available from the supplied URL.
- Sensitive-looking legacy/payment files are preserved as source artifacts for review; secrets must not be activated or copied into runtime configuration.

## Counts
- Archive entries: 3164
- Extracted regular files: 3164
- Extracted directories: 348
- Archive SHA-256: 11bba8802acf5367d905f33dd06ddbe23c69cf04978ab1f8522d09c29b681e2d

## Potentially sensitive paths (not executed)
- `clientes/maxipago/authorization-with-token.php`
- `clientes/maxipago/create-card-token.php`
- `clientes/maxipago/sale-with-token.php`
- `inc123/cielo/src/Cielo/API30/Ecommerce/Request/TokenizeCardRequest.php`
- `inc123/gerencianet/gerencianet/gerencianet-sdk-php/examples/config.json`
- `inc123/gerencianet/gerencianet/gerencianet-sdk-php/src/Gerencianet/config.json`
- `inc123/js/jquery.validate.password.js`
- `inc123/mercadopago/lib/cacert.pem`
- `inc123/PagSeguroLibrary/domain/PagSeguroAccountCredentials.class.php`
- `inc123/PagSeguroLibrary/domain/PagSeguroApplicationCredentials.class.php`
- `inc123/PagSeguroLibrary/domain/PagSeguroCredentials.class.php`
