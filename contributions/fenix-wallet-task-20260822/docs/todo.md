## Tarefas para a criação da FênixWallet

### Fase 1: Análise do conteúdo anexado e requisitos iniciais
- [x] Ler o conteúdo do arquivo `pasted_content.txt`.
- [x] Analisar os requisitos explícitos e implícitos do projeto.
- [x] Resumir as funcionalidades desejadas para a wallet.

### Fase 2: Pesquisa e análise da tecnologia Electrum
- [x] Pesquisar a arquitetura e os protocolos da Electrum.
- [x] Identificar as APIs ou bibliotecas necessárias para interagir com a rede Electrum.
- [x] Entender o formato `wallet.dat` da Electrum e como ele é gerado/manipulado.
- [x] Pesquisar o formato `wallet.dat` do Bitcoin Core e métodos para extrair chaves privadas.

### Fase 3: Design da arquitetura e especificações técnicas
- [x] Definir a arquitetura geral do aplicativo (frontend, backend, comunicação).
- [x] Especificar as tecnologias a serem usadas para cada componente.
- [x] Detalhar o fluxo de dados e as interações entre os módulos.

### Fase 4: Implementação do backend da wallet
- [x] Configurar o ambiente de desenvolvimento.
- [x] Implementar a lógica de comunicação com a rede Electrum.
- [x] Desenvolver as funcionalidades de gerenciamento de chaves e endereços.
- [x] Implementar a lógica para carregar saldos e transações.

### Fase 5: Implementação da interface frontend
- [x] Adaptar o código HTML/CSS/JavaScript fornecido para ser um aplicativo funcional.
- [x] Conectar o frontend com o backend para exibir os dados da carteira.
- [x] Implementar as funcionalidades de importação de carteira e carregamento de saldos.

### Fase 6: Integração e testes do sist- [x] Realizar testes unitários e de integração para garantir o funcionamento correto.
- [x] Testar a importação de carteiras com os arquivos fornecidos.
- [x] Verificar a comunicação entre frontend e backend.s exibidos.

### Fase 7: Documentação final e entrega
- [ ] Elaborar a documentação técnica do projeto.
- [ ] Preparar um guia de uso para o usuário.
- [ ] Entregar o aplicativo e a documentação ao usuário.



### Análise de Requisitos e Funcionalidades Desejadas:

**Requisitos Explícitos (baseados no HTML fornecido):**
*   **Interface de Usuário:** Dashboard com saldos (confirmado, não confirmado), total de transações.
*   **Gerenciamento de Carteiras:** Abas para diferentes tipos de carteiras ("Fênix", "Gênesis", "Importadas").
*   **Integração com API Externa:** Campo para `Token BlockCypher` para acesso a dados da blockchain.
*   **Importação de Carteira:** Botão para importar arquivos de carteira (provavelmente `wallet.dat` ou chaves privadas).
*   **Carregamento de Saldos:** Funcionalidade para carregar e exibir saldos de chaves/endereços.
*   **Visualização Detalhada:** Tabela com WIF, Endereço Público, Saldos (confirmado/não confirmado) e Transações.
*   **Interatividade:** Botões para copiar endereços/WIFs e exportar dados para CSV.
*   **Feedback Visual:** Indicadores de carregamento, progresso e mensagens de erro/sucesso.

**Requisitos Implícitos (inferidos do contexto e do pedido):**
*   **Segurança:** Manuseio seguro de chaves privadas e dados sensíveis.
*   **Compatibilidade Electrum:** A wallet deve ser baseada na infraestrutura e tecnologia Electrum, o que implica compatibilidade com seus formatos de carteira e protocolos de comunicação.
*   **Geração de Chaves/Endereços:** Embora não explícito, uma wallet geralmente permite gerar novas chaves/endereços.
*   **Transações:** Envio de transações (embora o HTML não mostre a interface, é uma funcionalidade central de uma wallet).
*   **Persistência de Dados:** Salvar e carregar dados da carteira localmente (e.g., `wallet.dat`).
*   **Multi-moeda:** O termo "criptomoedas" no prompt inicial sugere suporte a mais de uma moeda, embora o HTML mostre apenas BTC.

**Funcionalidades Desejadas:**
1.  **Gerenciamento de Chaves e Endereços:** Geração, importação (WIF, chaves privadas, `wallet.dat`), armazenamento seguro.
2.  **Conectividade com a Rede Electrum:** Capacidade de se conectar a servidores Electrum para obter dados da blockchain.
3.  **Consulta de Saldos:** Obtenção e exibição de saldos confirmados e não confirmados para múltiplos endereços.
4.  **Histórico de Transações:** Visualização de transações associadas aos endereços da carteira.
5.  **Criação e Assinatura de Transações:** (Implícito) Capacidade de criar e assinar transações para envio de fundos.
6.  **Exportação de Dados:** Exportar informações da carteira (e.g., endereços, saldos) para formatos como CSV.
7.  **Interface Intuitiva:** Uma interface de usuário limpa e responsiva, conforme o design HTML/CSS fornecido.
8.  **Notificações:** Feedback visual para o usuário sobre o status das operações (carregamento, erros, sucesso).

**Próximos Passos:**
Com base nesta análise, o próximo passo será aprofundar a pesquisa sobre a tecnologia Electrum para entender como implementar essas funcionalidades, especialmente a interação com a rede e o formato `wallet.dat`.



### Pesquisa e Análise da Tecnologia Electrum:

**Arquitetura e Protocolo:**
*   Electrum opera em uma arquitetura cliente-servidor, onde o cliente (nossa wallet) se conecta a servidores ElectrumX.
*   A comunicação entre cliente e servidor utiliza o protocolo Electrum, que é baseado em JSON-RPC sobre transportes como TCP, SSL, WebSockets (WS) e WebSockets Seguros (WSS).
*   Este protocolo é também conhecido como "Stratum".

**Formato da Wallet:**
*   É importante notar que o formato `wallet.dat` é tradicionalmente associado ao Bitcoin Core e **não é o formato nativo das carteiras Electrum**.
*   As carteiras Electrum usam um formato diferente, geralmente um arquivo JSON criptografado que contém as chaves privadas, histórico de transações e outras configurações.
*   A importação de um `wallet.dat` do Bitcoin Core para o Electrum geralmente não é direta e pode exigir a varredura (sweep) das chaves privadas.

**Interação com a Rede Electrum:**
*   Para interagir com a rede Electrum, precisaremos implementar um cliente que se comunique com os servidores ElectrumX usando o protocolo Stratum.
*   Existem bibliotecas em várias linguagens que facilitam essa comunicação (ex: `python-electrum` para Python, ou implementações em Go como `nimiq/electrum-client`).

**Próximos Passos:**
*   Confirmar com o usuário se a intenção é realmente usar o formato de carteira nativo do Electrum ou se há um requisito específico para compatibilidade com `wallet.dat` do Bitcoin Core.
*   Aprofundar na especificação do protocolo Electrum para entender as chamadas RPC necessárias para obter saldos, histórico de transações e enviar transações.
*   Identificar uma biblioteca Python adequada para interagir com servidores ElectrumX, dado o perfil de "Ben" como PHD em Python.


- [x] Elaborar a documentação técnica do projeto.
- [x] Preparar um guia de uso para o usuário.
- [x] Entregar o aplicativo e a documentação ao usuário.
- [x] Criar README.md com instruções de instalação e uso.
- [x] Finalizar todos os componentes do projeto.

