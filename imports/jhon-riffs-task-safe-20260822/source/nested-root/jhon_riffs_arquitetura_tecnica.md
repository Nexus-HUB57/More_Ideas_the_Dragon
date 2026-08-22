# Arquitetura de Scripts e Protocolos Técnicos do Sistema Jhon Riff's (Referência)

**Mestre Lucas Thomaz,**

Esta documentação técnica é baseada na análise do código-fonte de referência fornecido e do manual operacional. Ela estabelece a arquitetura de scripts e os protocolos técnicos que o novo projeto Jhon Riff's deve replicar e modernizar.

## 1. Arquitetura de Scripts (Referência)

A arquitetura de scripts do sistema de Multinível de referência é caracterizada por uma pilha de tecnologia **legada** e um modelo de desenvolvimento **semi-automático**.

| Componente | Tecnologia Principal | Função | Observações |
| :--- | :--- | :--- | :--- |
| **Backend** | **PHP** (Altamente Obfuscado) | Lógica de negócios, cálculo de comissões, gerenciamento de usuários e pagamentos. | O código principal está ofuscado, indicando uma arquitetura proprietária e fechada. |
| **Frontend/Interatividade** | **xajax** (Biblioteca AJAX para PHP) | Permite a comunicação assíncrona entre o cliente (navegador) e o servidor (PHP) sem recarregar a página. | Tecnologia legada, que deve ser substituída por frameworks modernos (e.g., React, Vue, ou um framework Full-Stack moderno). |
| **Banco de Dados** | **Não especificado** (Provavelmente MySQL/MariaDB) | Armazenamento de dados de usuários, rede, pagamentos e comissões. | A estrutura de arquivos sugere um banco de dados relacional. |
| **Editor de Conteúdo** | **TinyMCE** (Versão Antiga) | Utilizado para edição de conteúdo (e.g., e-books, mensagens de e-mail marketing). | Presente no diretório `inc123/tiny_mce`. |

## 2. Protocolos e Processos de Negócio (Lógica Central)

O sistema de scripts deve ser construído em torno dos seguintes protocolos de negócio, conforme detalhado no `manual_marketing_de_rede.txt`:

### 2.1. Protocolo de Pagamento (Semi-Automático)

O processo de pagamento é o protocolo central que dispara o cálculo de comissões.

| Etapa | Ação | Gatilho | Efeito no Sistema |
| :--- | :--- | :--- | :--- |
| **1. Inserir Receita** | O administrador insere os dados do pagamento efetuado pelo cliente. | Pagamento realizado pelo cliente. | Cria um registro de **RECEITA** no sistema. |
| **2. Identificar** | O administrador associa a **RECEITA** ao **NÚMERO/BOLETO** do cliente. | Receita inserida sem identificação automática. | Associa a receita ao cliente correto, preparando para a confirmação. |
| **3. Conferir (Protocolo de Comissionamento)** | O administrador confirma o pagamento. | Ação manual de **[Conferir]**. | **1. Cálculo Automático de Comissões.** 2. Alteração do status e data de validade do cliente. 3. Geração do recibo. |

### 2.2. Protocolo de Comissionamento Linear (Unilevel)

O sistema de scripts deve implementar a lógica de comissionamento Unilevel, que é acionada na etapa de **[Conferir]** do pagamento.

*   **Comissão Linear:** O sistema deve calcular e inserir as comissões para os associados na rede de indicação do cliente que pagou.
*   **Estrutura de Rede:** O sistema gerencia a hierarquia de indicações (`Indicação em Rede`).
*   **Remuneração:** O sistema mantém um registro dos valores a serem pagos (`Remuneração`).

### 2.3. Protocolo de Gestão de Conteúdo (E-books e Divulgação)

O sistema deve gerenciar os infoprodutos e materiais de divulgação:

*   **Arquivos/E-books:** Gerenciamento de categorias e arquivos, com estatísticas de downloads e votos.
*   **Divulgação:** Geração de **Banners** e **Links** de afiliação exclusivos para cada cliente.
*   **E-mail Marketing:** Edição de mensagens de convite para associação.

## 3. Implicações para o Novo Desenvolvimento

**Mestre,** o código de referência é baseado em PHP e tecnologias legadas. Para o novo projeto Jhon Riff's, sugiro uma arquitetura moderna e robusta para garantir escalabilidade e segurança, especialmente para o cálculo de comissões e o futuro **JR Bank**.

**Proposta de Nova Arquitetura de Scripts (Full-Stack):**

| Camada | Tecnologia Sugerida | Justificativa |
| :--- | :--- | :--- |
| **Backend/API** | **Python (Django/FastAPI)** ou **Node.js (Express)** | Linguagens modernas, seguras e ideais para a lógica complexa de cálculo de comissões e integração com serviços financeiros (JR Bank). |
| **Frontend** | **React** ou **Vue.js** | Criação de uma interface de usuário (Back Office) rápida, responsiva e moderna, substituindo o uso do xajax. |
| **Banco de Dados** | **PostgreSQL** | Mais robusto e escalável para lidar com a complexidade de dados de rede e transações financeiras. |

**Próxima Ação:** Inicializar o ambiente de desenvolvimento com uma arquitetura Full-Stack moderna para começar a construir a base do sistema Multinível.

**Confirma a inicialização do projeto Full-Stack para o desenvolvimento?**
