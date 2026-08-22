# MMN AI-to-AI Mobile App - TODO

## Milestone 1: Estrutura Base e Autenticação (M1)

### Design System
- [x] Criar design.md com especificações de interface
- [x] Configurar paleta de cores em theme.config.js
- [x] Implementar componentes base (Button, Card, Input)
- [x] Criar ScreenContainer com SafeArea

### Navegação
- [x] Configurar Tab Bar com 6 abas principais
- [x] Implementar roteamento com Expo Router
- [x] Adicionar ícones para cada aba
- [ ] Implementar deep linking

### Autenticação
- [x] Criar tela de Login
- [x] Implementar validação de email/senha (básica)
- [ ] Criar tela de Logout com confirmação
- [ ] Integrar OAuth Manus (placeholder)
- [ ] Implementar useAuth hook

### tRPC Client
- [x] Configurar cliente tRPC
- [x] Implementar tipagem de ponta a ponta
- [ ] Criar hooks para chamadas de API

### Branding
- [x] Gerar logo/ícone do app
- [x] Atualizar app.config.ts com nome e logo
- [x] Configurar splash screen

---

## Milestone 2: Telas Essenciais (M2)

### Home / Dashboard
- [x] Implementar layout principal
- [x] Exibir saldo total de comissões (mockado)
- [x] Exibir status do agente IA (mockado)
- [x] Implementar pull-to-refresh
- [x] Criar mini-gráfico de ganhos
- [x] Adicionar botões de ação rápida

### Perfil / Configurações
- [x] Implementar tela de perfil
- [x] Exibir informações do usuário (mockadas)
- [x] Adicionar botão copiar link de indicação
- [x] Implementar toggle de tema claro/escuro
- [x] Adicionar botão logout

---

## Milestone 3: Telas de Rede e Agente (M3)

### Rede (Network)
- [x] Implementar tela de rede
- [x] Criar componente de árvore hierárquica
- [x] Implementar expansão/colapso de nós
- [ ] Adicionar busca/filtro
- [ ] Implementar tap para detalhes do afiliado
- [x] Adicionar botão compartilhar link

### Agente IA
- [x] Implementar tela de agente
- [x] Exibir status do agente (mockado)
- [x] Exibir métricas (energia, saúde, criatividade, reputação)
- [x] Implementar dropdown de estratégia
- [x] Adicionar lista de últimas ações
- [x] Implementar botões ativar/desativar

---

## Milestone 4: Telas de Comissões e Marketplace (M4)

### Comissões
- [x] Implementar tela de comissões
- [x] Adicionar filtro por período
- [x] Exibir lista de comissões (mockada)
- [x] Implementar tap para detalhes
- [x] Adicionar botão solicitar saque
- [x] Exibir total acumulado

### Marketplace
- [x] Implementar tela de marketplace
- [x] Criar cards de produtos (mockados)
- [x] Adicionar filtro por marketplace
- [x] Implementar tap para detalhes do produto
- [x] Adicionar botão compartilhar
- [x] Implementar botão salvar favoritos

---

## Milestone 5: Integração Backend (M5+)

### Autenticação Backend
- [ ] Integrar OAuth Manus real
- [ ] Implementar persistência de token
- [ ] Configurar refresh token

### Dados Dinâmicos
- [ ] Conectar Home com backend (tRPC)
- [ ] Conectar Perfil com backend (tRPC)
- [ ] Conectar Rede com backend (tRPC)
- [ ] Conectar Agente com backend (tRPC)
- [ ] Conectar Comissões com backend (tRPC)
- [ ] Conectar Marketplace com backend (tRPC)

### Funcionalidades Avançadas
- [ ] Implementar compartilhamento de link
- [ ] Implementar solicitação de saque
- [ ] Implementar gráficos de ganhos
- [ ] Implementar notificações push
- [ ] Implementar cache local com AsyncStorage

---

## Bugs e Correções

- [ ] (Nenhum registrado no momento)

---

## Notas Gerais

- Usar NativeWind (Tailwind CSS) para estilização
- Manter componentes reutilizáveis
- Testar em iOS e Android
- Validar acessibilidade (VoiceOver, TalkBack)
- Implementar dark mode desde o início


## Integração segura com GitHub — tarefa atual
- [ ] Auditar e contar todos os arquivos-fonte da tarefa, incluindo o ZIP
- [ ] Clonar e auditar Nexus-HUB57/More_Ideas_the_Dragon sem alterar branches existentes
- [ ] Criar branch isolada para a integração
- [ ] Integrar arquivos somente em caminhos novos ou em namespace sem conflito; preservar arquivos existentes
- [ ] Incluir o ZIP original como artefato versionado
- [ ] Validar cobertura, integridade, histórico e status do repositório
- [ ] Criar commit completo e publicar a branch no GitHub
- [ ] Entregar relatório com branch, commit, contagens e conflitos evitados

## Registro de cautela
- Não executar reset, rebase destrutivo, force-push, exclusão de branch, exclusão de arquivo ou sobrescrita silenciosa.
- Conflitos de caminho devem ser preservados em cópias versionadas com sufixo de integração e registrados no relatório.
- O branch padrão e todas as branches remotas existentes devem permanecer intocados.

## Critério de encerramento
- [ ] Todos os arquivos rastreados pela tarefa foram incorporados ou tiveram uma exceção documentada.
- [ ] O commit da branch de integração foi validado com árvore limpa e contagem reproduzível.
- [ ] O ZIP original foi preservado com hash SHA-256 registrado.
- [ ] A branch e o commit publicados foram confirmados via GitHub CLI.

## Notas operacionais
- O destino é Nexus-HUB57/More_Ideas_the_Dragon.
- A integração deve ser aditiva e reversível, sem tocar no branch padrão.
- Arquivos locais sensíveis, credenciais, node_modules, .git e artefatos temporários não devem ser versionados.
