# Instruções para Instalação do Nexus Desktop

Este é o aplicativo desktop do Nexus Video Generator desenvolvido com Electron, React e Tailwind CSS.

## Estrutura do Projeto
- `client/`: Código fonte do frontend React.
- `main.cjs`: Arquivo principal do Electron.
- `preload.cjs`: Script de preload para segurança do Electron.
- `dist/`: Arquivo de build (gerado após `pnpm build`).

## Como rodar localmente
1. Certifique-se de ter o **Node.js** e o **pnpm** instalados.
2. Extraia o arquivo `.zip` enviado.
3. Abra o terminal na pasta do projeto.
4. Instale as dependências:
   ```bash
   pnpm install
   ```
5. Inicie o aplicativo em modo de desenvolvimento:
   ```bash
   pnpm electron:dev
   ```

## Funcionalidades Incluídas
- **Visualizador de Roteiro**: Interface cyberpunk para leitura de cenas.
- **Editor de Cenas**: Edição individual de diálogos, visuais e duração.
- **Melhorador de Roteiro**: Sugestões automáticas para engajamento e ritmo.
- **Gerador de Roteiro**: Fluxo integrado para criação de novos conteúdos.

---
Desenvolvido por Manus para Nexus-HUB57.
