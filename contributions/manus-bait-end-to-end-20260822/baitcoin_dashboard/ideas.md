# Direção de Design do Dashboard BAIT

## Abordagens consideradas

### Theme Name: Observatory Noir
Very Brief Intro: Um centro de comando escuro, técnico e silencioso, com laranja queimado como sinal de energia e verde para estados de consenso. A experiência comunica precisão operacional sem parecer um terminal genérico.
Probability: 0.03

### Theme Name: Ledger Editorial
Very Brief Intro: Uma interface clara, editorial e quase financeira, com tipografia contrastante e superfícies de papel digital. O foco estaria na leitura de dados, auditoria e documentação.
Probability: 0.02

### Theme Name: Signal Garden
Very Brief Intro: Um sistema mais leve e expressivo, com campos de dados em camadas, ciano e âmbar sobre fundos suaves. A linguagem visual trataria agentes e módulos como organismos observáveis.
Probability: 0.04

## Abordagem escolhida: Observatory Noir

### Design Movement
Neo-brutalismo operacional com influência de salas de controle, observatórios de dados e interfaces de instrumentação científica.

### Core Principles
1. A hierarquia nasce do contraste entre uma base quase preta e sinais de estado em laranja, verde e violeta.
2. A interface deve parecer auditável: cada métrica tem contexto, timestamp, estado e origem visíveis.
3. A densidade de informação é controlada por uma grade assimétrica, sidebar persistente e painéis com bastante respiro.
4. A estética técnica não deve sacrificar legibilidade, acessibilidade ou resposta móvel.

### Color Philosophy
O preto azulado funciona como uma sala de observação, reduzindo ruído visual. Laranja queimado marca atividade e intervenção; verde sinaliza consenso válido; violeta identifica agentes e camadas cognitivas; ciano é reservado para dados de infraestrutura. Nenhum gradiente roxo será usado como decoração genérica.

### Layout Paradigm
Sidebar vertical persistente com um canvas de observação em duas colunas: uma coluna larga para cadeia e feed operacional, e uma coluna estreita para saúde, agentes e integrações. Em telas menores, a sidebar se transforma em barra superior horizontal e os painéis passam a uma única coluna.

### Signature Elements
1. Marca BAIT em um monograma quadrado com núcleo laranja.
2. Barras de estado em formato de linha fina, combinadas com micro-labels monoespaçados.
3. Superfícies escuras com textura discreta de grade radial e halos de foco somente em estados ativos.

### Interaction Philosophy
Ações de alto impacto são explícitas e têm confirmação visual imediata. Hover expõe contexto sem deslocar layout; filtros e abas mudam o conteúdo sem recarregar a página; estados de erro e modo demo são honestos e sempre identificados.

### Animation
Usar transições de 160–240 ms com easing de saída forte. Atualizações live devem fazer apenas uma breve mudança de opacidade/transform, sem reflow. A atualização de bloco usa um pulso curto no indicador de status; em `prefers-reduced-motion`, todos os pulsos são desativados.

### Typography System
Display: Space Grotesk em pesos 600–700 para títulos e valores principais. Interface e corpo: IBM Plex Sans para leitura. Dados técnicos: IBM Plex Mono. A hierarquia usa títulos compactos, labels em 10–11 px com tracking positivo e números em 24–32 px.

### Brand Essence
A central de observação para a economia autônoma dos agentes BAIT: feita para operadores, desenvolvedores e agentes que precisam verificar o estado da rede sem abstrações. Personalidade: rigorosa, alerta, serena.

### Brand Voice
Headlines são diretas e orientadas a estado. CTAs descrevem a ação concreta. Microcopy informa origem e limites; não promete segurança ou produção quando os dados forem demonstrativos.

Exemplo de headline: “Consenso observado. Rede íntegra.”
Exemplo de CTA: “Inspecionar próximo bloco”

### Wordmark & Logo
Monograma sem texto formado por três barras orbitais em torno de um ponto central, sugerindo agente, rede e consenso. O símbolo deve funcionar em 24 px e 40 px, com versão laranja sobre fundo carvão.

### Signature Brand Color
BAIT Ember `#F26B38`, um laranja queimado de alta energia que permanece legível contra superfícies carvão sem cair no neon.

## Decisões técnicas

A aplicação é client-only e usa dados demonstrativos locais com atualização periódica para permitir visualização local sem credenciais. Qualquer futura conexão com a API deverá declarar o estado da fonte e usar BlockCypher como fallback de leitura quando aplicável; nenhuma ação financeira real será executada pelo dashboard.

## Checklist

- [ ] Integrar shell do dashboard com sidebar e navegação de views.
- [ ] Implementar overview com métricas live e gráfico de atividade.
- [ ] Implementar views de módulos, agentes, banco, AI Store e PQC.
- [ ] Adicionar modo demo e origem dos dados.
- [ ] Garantir responsividade e acessibilidade básica.
- [ ] Executar typecheck/build e validação visual.
- [ ] Salvar checkpoint estável.

## Style Decisions

A interface deve preservar a honestidade operacional: dados simulados devem ser identificados como demonstração local e nunca apresentados como saldo, preço ou estado real de mainnet.

## Registro de validação visual

A validação desktop confirmou que o observatório mantém uma rail lateral persistente, uma composição assimétrica de gráfico e payload, sinais cromáticos reservados e identidade BAIT dominante. A validação móvel confirmou a transformação da rail em menu, a passagem para coluna única, a leitura dos cartões e a preservação do rodapé de estado. O build de produção do frontend também concluiu; a checagem TypeScript completa do scaffold continua limitada pela instalação incompleta de tipos e dependência Express no ambiente local, embora o servidor Vite tenha compilado e servido a aplicação corretamente.

## Validação da expansão de agentes

O detalhe expansível preserva a malha como lista operacional: a linha principal permanece compacta, a seta indica o estado de abertura e o painel revela identidade do nó, região, última ação, latência, reputação, capacidades e histórico recente. A validação confirmou que a rail BAIT continua persistente no desktop e que o detalhe usa o mesmo código visual de fonte, estado e telemetria, com suporte a `prefers-reduced-motion`.

A checagem final desktop/mobile mostrou o painel aberto com boa hierarquia: o cabeçalho BAIT identifica a telemetria, os três campos operacionais permanecem legíveis, as capacidades funcionam como tags compactas e o histórico mantém marcadores de consenso, segurança e tarefa. Em mobile, o detalhe ocupa a largura disponível sem quebrar a sequência da malha ou o cartão de saúde do nó.

## Validação da pesquisa de agentes

O deep-link `?view=agents&q=obscura` confirmou a abertura direta da malha com o campo preenchido, contador `1 de 4` e apenas o agente ObscuraRunner-13 visível. A composição permanece alinhada ao observatório: o campo de pesquisa é técnico e discreto, o contador é evidência operacional e a linha filtrada mantém status, reputação e latência.

A validação mobile do estado vazio confirmou que o campo, o contador `0 de 4`, a mensagem de ausência e o CTA para limpar pesquisa permanecem legíveis e empilhados sem overflow. O comportamento segue somente leitura e não altera a malha original quando a consulta é removida.
