# Coding Assistant — Llama 4 Maverick

Este diretório contém a contribuição isolada do aplicativo de assistência de codificação criado nesta tarefa. O conteúdo foi importado em um namespace novo para evitar colisões com o ecossistema já existente do repositório.

A aplicação usa um frontend React e um backend Flask. O backend expõe operações de geração, explicação, depuração, refatoração e tradução de código, utilizando uma API compatível com OpenAI através do OpenRouter para o modelo `meta-llama/llama-4-maverick:free`.

A chave `OPENROUTER_API_KEY` nunca deve ser comitada. Configure-a somente no ambiente de execução. O arquivo `docs/llama_access_info.md` registra o método de acesso ao modelo e suas referências.

A implementação é uma contribuição independente: não substitui, remove ou altera arquivos de outros projetos presentes no repositório.
