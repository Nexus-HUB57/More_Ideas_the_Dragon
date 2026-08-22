import { Streamdown } from 'streamdown';
import { Code2, Zap, BookOpen, GitBranch, Layers } from 'lucide-react';

const guideContent = `# Guia de Integração para Modelos de IA Proprietários no MMN AI-to-AI

**Autor:** Manus AI | **Data:** 08 de Maio de 2026

Este guia técnico detalha o processo de integração e gerenciamento de modelos de Inteligência Artificial proprietários no sistema MMN AI-to-AI, com foco no arquivo \`llm-v2.ts\` e nas melhores práticas para expansão das capacidades de IA.

## 1. Visão Geral do Serviço LLM (\`llm-v2.ts\`)

O arquivo \`backend/src/services/llm-v2.ts\` é o coração da orquestração de modelos de Linguagem Grande (LLM) no sistema MMN AI-to-AI. Ele implementa um mecanismo de roteamento dinâmico que permite ao sistema utilizar diferentes provedores e modelos de IA, sejam eles externos (como OpenAI) ou proprietários (desenvolvidos internamente ou hospedados localmente).

### 1.1. Arquitetura de Roteamento

A função \`invokeLLM\` atua como um proxy, recebendo requisições e direcionando-as para o modelo de IA apropriado com base no \`modelType\` especificado. Caso um modelo proprietário não esteja disponível ou seja desconhecido, o sistema pode fazer um fallback para um modelo genérico da OpenAI, garantindo a continuidade do serviço.

## 2. Registro e Configuração de Modelos

O \`llm-v2.ts\` mantém um \`modelRegistry\`, um objeto que mapeia \`ModelType\` (identificadores únicos para cada modelo) para suas respectivas \`ModelConfig\` (configurações). Esta configuração define o provedor, o ID do modelo, parâmetros como \`maxTokens\` e \`temperature\`, e o status de \`isAvailable\`.

### 2.1. \`ModelType\` e \`ModelProvider\`

| Tipo | Descrição | Exemplos | Provider |
|------|-----------|----------|----------|
| **OpenAI** | Modelos fornecidos pela API da OpenAI | \`gpt-4.1-mini\` | openai |
| **Proprietário** | Modelos desenvolvidos internamente | \`mmn-copywriting-v1\`, \`mmn-strategy-v1\` | proprietary |
| **Fallback** | Modelo genérico para fallback | \`gpt-4.1-mini\` | fallback |

## 3. Ativação de Modelos Proprietários Existentes

Os modelos proprietários \`mmn-copywriting-v1\` e \`mmn-strategy-v1\` já estão definidos no \`modelRegistry\`, mas com \`isAvailable: false\`. Para ativá-los após a conclusão do fine-tuning:

1. **Localize o arquivo:** Abra \`backend/src/services/llm-v2.ts\`
2. **Altere isAvailable:** Localize a entrada do modelo e altere de \`false\` para \`true\`
3. **Reimplante o Backend:** A nova configuração será carregada automaticamente

## 4. Integração de Novos Modelos Proprietários

Para integrar um novo modelo de IA proprietário (ex: Llama-2 hospedado localmente), o processo envolve três etapas:

### 4.1. Adicionar ao \`modelRegistry\`

\`\`\`typescript
const modelRegistry: Record<ModelType, ModelConfig> = {
  // ... modelos existentes
  "novo-modelo-proprietario-v1": {
    provider: "proprietary",
    modelId: "novo-modelo-proprietario-v1",
    maxTokens: 8192,
    temperature: 0.7,
    isAvailable: false,
  },
};
\`\`\`

### 4.2. Estender \`invokeProprietaryModel\`

A função \`invokeProprietaryModel\` é o ponto de extensão para lidar com a lógica de invocação de modelos proprietários. Você precisará modificar esta função para incluir a lógica de chamada para o seu novo modelo.

### 4.3. Atualizar \`isAvailable\` e Reimplantar

Após implementar a lógica de invocação e testá-la, altere \`isAvailable: false\` para \`true\` e reimplante o backend.

## 5. Utilização no Sistema

Outras partes do backend, como \`contentGenerationRouter.ts\`, invocam o serviço LLM através da função \`invokeLLM\`. Para utilizar um modelo proprietário, basta especificar o \`modelType\` desejado.

## 6. Gerenciamento de Status e Fallback

O \`llm-v2.ts\` inclui funções para gerenciar o status de disponibilidade dos modelos:

- \`getModelStatus()\`: Retorna o status atual de todos os modelos
- \`activateProprietaryModel(modelType)\`: Ativa um modelo proprietário
- \`deactivateModel(modelType)\`: Desativa um modelo

Essas funções podem ser úteis para ferramentas de monitoramento ou para desativar modelos temporariamente em caso de problemas.`;

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Guia de Integração de IA</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-11">Modelos de IA Proprietários no MMN AI-to-AI</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Visão Geral</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Entenda a arquitetura de roteamento dinâmico do LLM</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Layers className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Configuração</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Aprenda como registrar e ativar modelos</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <GitBranch className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Integração</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Integre novos modelos proprietários</p>
          </div>
        </div>

        {/* Guide Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Documentação Completa</h2>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none p-8">
            <Streamdown>{guideContent}</Streamdown>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-600 dark:text-slate-400">
          <p className="text-sm">Última atualização: 08 de Maio de 2026 | Autor: Manus AI</p>
        </div>
      </main>
    </div>
  );
}
