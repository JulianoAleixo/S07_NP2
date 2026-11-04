# S07 NP2: contexto do projeto

Este arquivo é a fonte de contexto para qualquer sessão de IA neste repositório. Leia inteiro antes de agir e mantenha o **Estado atual** e o **Registro de uso de IA** atualizados ao concluir cada tarefa.

Projeto em grupo da disciplina S07 (Gerência de Configuração e Evolução de Software, Inatel, Prof. Christopher Lima). O sistema é um portfólio em Astro + React + TypeScript com API própria de likes. A nota vem principalmente da cadeia DevOps: testes, Docker, Jenkins, Docker Hub e Compose. Datas de entrega e defesa ainda serão enviadas ao grupo.

## 1. Regras inegociáveis

Violar qualquer item marcado como **[eliminatório]** pode zerar o grupo, mesmo com o sistema funcionando.

- **[eliminatório]** Etapas do pipeline ficam só no `Jenkinsfile`. A interface do Jenkins só pode ser usada para o checkout.
- **[eliminatório]** Não copiar configuração de IA sem entendimento. Todos precisam saber explicar cada linha de `Dockerfile`, `Jenkinsfile` e `docker-compose.yml`. Portanto, prefira o mais simples, sem nada "por garantia", e comente apenas o motivo do que não for óbvio.
- **[eliminatório]** Sem commits irrelevantes e sem discrepância clara de contribuição entre integrantes.
- **[eliminatório]** Todos comparecem à defesa.
- Jenkins roda **somente em container**, nunca instalado na máquina.
- **Proibido GitHub Actions.** Os slides da aula usam, mas o projeto não pode. Não criar `.github/workflows/`.
- O endereço de e-mail **nunca** fica no código, nem como valor padrão: vem de variável de ambiente (`NOTIFY_EMAIL`). Procure também em testes, scripts, compose e README.
- Todo software que o pipeline usa é instalado por script ou Dockerfile, nunca à mão no container.
- O sistema não pode ser o usado pelo professor (PokéAPI, GlobalSQA). O portfólio é de autoria própria e é permitido.
- O teste de contato nunca envia e-mail real pelo EmailJS.

### Como trabalhar com git

- **A IA nunca cria branch, faz commit nem faz push.** João Victor faz tudo isso manualmente (definido em 2026-11-03). A IA deixa as mudanças no disco e, ao fim de cada parte, recomenda branch, arquivos e mensagem.
- Mudanças pequenas e separadas por tarefa (B1, C1...), para cada integrante assumir, entender e commitar a própria parte.
- **Nunca falsificar autoria** (`--author`, `user.name` de outra pessoa) para equilibrar contribuições. Se tudo for gerado em uma só sessão, avise o usuário de que o histórico ficará concentrado.
- Antes de iniciar uma tarefa grande, pergunte de quem ela é, se a coluna "Responsável" estiver vazia.
- Convenção de mensagem, definida por João Victor em 2026-11-03: `tipo: descrição em inglês` (ex.: `test: add API route and store tests`). Tipos: `feat`, `fix`, `test`, `build`, `chore`, `docs` e afins. O commit inicial usa gitmoji e fica como está.
- Mudanças vão para uma branch própria e entram na `main` por PR.

## 2. Requisitos do PDF (`Projeto_S07_NP2.pdf`)

### Pipeline e Dockerfile (3.1)

- Etapas obrigatórias no `Jenkinsfile`: execução dos testes, build/empacotamento, notificação por e-mail.
- Pacote **e** relatório de testes arquivados como artefatos no Jenkins.
- Um **script** (linguagem livre) chamado pelo pipeline envia o e-mail com as informações da execução.

### Docker Hub (3.2)

- Criar imagem a partir do Dockerfile da etapa anterior, publicar em hub.docker.com e entregar o link.

### Docker Compose (3.3)

- Subir a imagem do Docker Hub e executar o pipeline completo.
- Mínimo de 4 containers, com comunicação entre pelo menos 2.
- Um container vindo de Dockerfile local e outro puxado do Docker Hub.
- Volumes usados corretamente para persistir dados relevantes.

### Geral

- Cobertura de testes ≥ 90% (unitários, integração ou interface) e real.
- Repositório **público no time da matéria** no GitHub.
- Grupo de 4 a 6 pessoas, com commits relevantes de todos.
- README com instalação, execução, uso, funcionalidades e seção **"Uso de IA"**.
- Entrega por tarefa no Teams: link do GitHub + link da imagem no Docker Hub.

### Seção "Uso de IA" do README (mínimo)

- Modelos utilizados e para quê.
- **Pelo menos 3 prompts reais**, dizendo o que foi aceito, ajustado ou descartado.
- Dinâmica de uso (individual, pair programming, revisão).
- O que **não** foi feito por IA.
- Honestidade acima de tudo: a avaliação pune esconder o uso e não entender o resultado, não o uso em si.

### Defesa e critérios de nota

Perguntas e respostas de até 20 min, sem apresentação roteirizada. Qualquer integrante responde sobre qualquer parte. O professor pode abrir commits e o Jenkinsfile, ou executar o pipeline ao vivo. Respostas concretas (arquivo, commit, log, artefato) somam; vagas são penalizadas.

Critérios (0 a 100 cada): aplicação com testes ≥ 90%; Dockerfile; Jenkinsfile; artefatos; variável de e-mail; Docker Hub; Compose 4+; comunicação entre containers; volumes; contribuições; README; uso transparente de IA; defesa; coerência DevOps geral.

**Consequência prática:** o pipeline precisa funcionar do zero, em máquina limpa, ao vivo. Trate `docker compose up` seguido de um build com sucesso como definição de pronto do projeto.

## 3. Estrutura do repositório

```
api/    API de likes (Express 5, TS). createApp(store) em src/app.ts, LikesStore em src/store.ts, bootstrap em src/server.ts
app/    Portfólio (Astro 6, React 19, Tailwind 4, framer-motion, three/@react-three/fiber, EmailJS)
tests/  Cypress 15 + Cucumber (BDD com Page Object em cypress/pages/MainPage.ts) e k6 (Performance/)
```

Cada pasta tem seu `package.json` (não é monorepo). Node ≥ 22.12 (engines); a máquina local usa Node 24 e o Jenkins deve usar Node 22. Rodar comandos dentro da pasta correta, usando caminhos absolutos no shell, pois o diretório de trabalho persiste entre chamadas.

API: `GET /api/health`, `GET /api/likes?deviceId=`, `POST /api/likes {deviceId}`. O `deviceId` é string de 1 a 100 caracteres; inválido retorna 400. Likes são idempotentes por dispositivo; não existe "descurtir".

## 4. Estado atual

Verificado em 2026-11-03. A `main` só tem o commit inicial. João Victor commitou os testes da API, o README e a remoção do `Features.tsx` na branch `test/coverage_adjustment`. Os testes do front e as correções estão no disco, sem commit, aguardando o commit manual dele.

| Item                                           | Situação                                                                                                                                                                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci` em api, app e tests                   | OK (`node_modules` locais, ignorados pelo git)                                                                                                                                                                              |
| `npm run build` em api e app                   | OK. No app há avisos não bloqueantes: imports `Mesh`/`ShaderMaterial` em `Silk.tsx` e chunk > 500 kB                                                                                                                        |
| `npm test` em api                              | **Passa** no Node 24 local (Node 22 não testado): 24 testes, 100% em linhas, funções, branches e statements. Thresholds de 90% em `api/vitest.config.ts`; `server.ts` é excluído da cobertura, com justificativa no README  |
| `api/tests/`                                   | `store.test.ts` (5 testes) e `app.test.ts` (19 testes), commitados. Cobre o código atual; rota de reset (B2) e Redis (B3) não existem                                                                             |
| Confiabilidade dos testes da API               | Verificada: 19 quebras propositais em `src/` (script fora do repositório), todas detectadas. `src/` restaurado, sem diff. Tipos dos testes conferidos com `tsc` em configuração temporária; o `tsc` do build só olha `src/` |
| Testes no app                                  | **`npm test` passa** no Node 24 local (Node 22 não testado): 12 arquivos, 122 testes, 100% em linhas, funções e statements, 95,78% em branches. Thresholds de 90% em `app/vitest.config.ts`. Sem commit. Em 62 quebras propositais, 60 foram detectadas; as 2 restantes não mudam o comportamento (o `<title>` do SVG já nomeia o link, e `count` nulo já aparece como "0 Likes")                                                                                                                                      |
| `app/src/components/Features.tsx`              | Removido e commitado. `npm run build` do app passa                                                                                                                                                           |
| Cypress                                        | Instalado. `cypress verify` foi executado, mas o resultado **não foi confirmado**. A suíte E2E **não foi executada**: adiada para a fase D, depois do intercept do EmailJS (D4), por decisão de João Victor em 2026-11-03   |
| App + API rodando juntos                       | **Não verificado** (a lista do grupo afirma que funciona). Verificação adiada junto com o Cypress                                                                                                                           |
| k6                                             | v2.2.0 instalado na máquina. Scripts não executados. `TARGET_URL` já é lido de variável                                                                                                                                     |
| Docker                                         | Cliente 29.7.2 instalado. Daemon não verificado                                                                                                                                                                             |
| Dockerfiles, compose, Jenkinsfile, `.env` raiz | Não existem                                                                                                                                                                                                                 |
| `README.md`                                    | Só título e seção "Escopo de cobertura" (API e app). Demais seções a fazer (G2)                                                                                                                                      |
| Remote                                         | `github.com/JulianoAleixo/S07_NP2`, conta pessoal. **O PDF exige o time da matéria**                                                                                                                                        |

Os 90% de cobertura, pedidos pelo usuário como preparação para a pipeline, foram atingidos em API e app. Próxima ação: João Victor commitar e abrir o PR; depois, definir responsáveis e seguir para B2 e a fase D. Trabalhar por partes e perguntar antes de qualquer decisão técnica ou fora do escopo; a mecânica de escrever os testes fica com a IA.

## 5. Arquitetura prevista (5 containers)

| Container | Origem                                                 | Papel                                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| jenkins   | Dockerfile local, **publicado e puxado do Docker Hub** | Roda o pipeline (Node, libs do Cypress, k6, script de e-mail) |
| app       | `build:` local (Astro + nginx)                         | Serve o site e repassa `/api` para a API                      |
| api       | `build:` local                                         | API de likes                                                  |
| db        | Hub (Redis oficial)                                    | Guarda os likes                                               |
| mailpit   | Hub (`axllent/mailpit`)                                | Recebe o e-mail do pipeline                                   |

Comunicação: app → api → db, jenkins → app, jenkins → mailpit. Volumes: `jenkins_home` e `redis_data`.

### Decisões do grupo

Ainda **não confirmadas**. Recomendações abaixo; se a tarefa depender de uma delas, pergunte antes de implementar.

| Decisão                    | Recomendação                                                                  | Motivo                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Banco                      | Redis com persistência (`appendonly yes`)                                     | `SADD` + `INCR` resolvem com pouco código e a interface `LikesStore` já existe                                  |
| Imagens no pipeline        | Não construir (sem Docker dentro do Jenkins)                                  | O pacote é um `.tar.gz` do build; atende o PDF e é fácil de explicar                                            |
| Script de e-mail           | Node com `nodemailer`                                                         | Node já está na imagem do Jenkins; evita instalar Python                                                        |
| Pastas de cobertura do app | **Decidido por João Victor (2026-11-03):** `src/**/*.{ts,tsx}`, sem exclusões | Mais defensável na defesa que a lista original (seção 6.2). Arquivos `.astro` ficam fora, por serem só marcação |
| `Features.tsx`             | **Removido por decisão de João Victor (2026-11-03)**                          | Código morto: nenhuma referência no app nem no Cypress. `npm run build` do app passa sem ele                    |

## 6. Testes e cobertura (prioridade atual)

### Padrão de qualidade

- Meta: **≥ 90% em linhas, funções, branches e statements**, por projeto (api e app), imposta por `thresholds` no `vitest.config.ts`, para a execução falhar se cair.
- **Cobertura real.** Não inflar com `/* c8 ignore */`, exclusões convenientes ou testes sem asserção. Toda exclusão precisa de justificativa escrita no README.
- Testar comportamento observável (texto, estado, chamada de rede), não detalhes internos.
- Cada teste precisa falhar se o comportamento quebrar. Em caso de dúvida, quebre o código temporariamente e confirme.
- Se um teste revelar bug, **relate ao usuário** em vez de escrever o teste para consagrar o bug.
- Cypress não entra na medição de cobertura.
- Código e nomes de testes em inglês, como no resto do repositório. Documentação em português.
- Testes em `api/tests/` e `app/tests/`.
- Para o Jenkins (F3), configurar também reporter `junit` e relatório HTML de cobertura.

### 6.1 API (B1, depois B2)

Vitest + supertest já instalados. Rodar com `npm test` em `api/`.

**Decisões de João Victor em 2026-11-03** (o grupo ainda não confirmou):

- B1 fica com João Victor.
- B2 fica separado do B1 e será feito na fase do Cypress. Método e caminho da rota ainda serão perguntados.
- A linha de base com Cypress e app + API foi adiada para a fase D, depois do D4.
- `server.ts` continua fora da cobertura, com justificativa no README desde já.

**Além da lista abaixo, os testes cobrem:** `deviceId` com exatamente 100 caracteres no POST, JSON malformado no POST (400) e falha do store no GET e no POST (500). O Express 5 repassa a rejeição assíncrona: confirmado pelos testes.

- `store`: inicial zerado; like conta e marca; segundo like do mesmo dispositivo não conta; total compartilhado e `liked` por dispositivo; stores isolados.
- `isValidDeviceId`: limites (1 e 100 válidos; vazio, 101, `undefined`, número, array inválidos).
- Rotas: health; GET válido; GET sem `deviceId`; GET com `deviceId` repetido (chega como array); POST válido visível depois no GET; POST idempotente; POST sem body; POST acima do limite; store falhando retorna 500 (conferir que o Express 5 repassa a rejeição assíncrona).
- B2: `POST`/`DELETE` de reset só existe com `ENABLE_TEST_RESET=true`. Desligado por padrão. Testar ligado e desligado (404). Exige `reset()` na `LikesStore`.
- B3: ao adicionar Redis, a escolha do store não deve engordar o `server.ts`, que está fora da cobertura; coloque-a em módulo testado. Testar com cliente falso ou `ioredis-mock`; os 90% continuam valendo.

### 6.2 App (C1 a C3)

Instalar em `app/` como devDependencies: `vitest@^3.2` e `@vitest/coverage-v8@^3.2` (mesma versão da API), `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`. Criar script `"test": "vitest run --coverage"`. Conferir a compatibilidade da versão do Vite trazida pelo Astro 6.

`vitest.config.ts`: ambiente `jsdom`, `esbuild: { jsx: "automatic" }`, setup com `cleanup` em `afterEach`, jest-dom, e stubs de `IntersectionObserver`, `ResizeObserver` e `scrollIntoView`, que o jsdom não tem. Arquivos `.astro` ficam fora por serem só marcação.

Plano por arquivo:

| Arquivo                                                                                               | O que testar                                                                                                                                                                                                  | Como                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/likesApi.ts`                                                                                     | URL com `encodeURIComponent`, POST com body, erro quando `!res.ok`                                                                                                                                            | `fetch` falso                                                                                                                                                                                                       |
| `LikeButton`                                                                                          | Carrega contagem; `liked` desabilita; clique incrementa e desabilita; contagem final vem do servidor; falha desfaz; falha ao carregar mostra 0; `deviceId` criado e reutilizado; animação após 600 ms em tela | `fetch` falso (usa o `likesApi` real), fake timers, `useInView` falso e espião em `controls.start`                                                                                                                  |
| `Contact`                                                                                             | Envio com sucesso limpa o form; erro mostra mensagem; "Sending..." e botão desabilitado durante o envio; variáveis passadas ao EmailJS                                                                        | `vi.mock("@emailjs/browser")`, `vi.stubEnv`                                                                                                                                                                         |
| `Accordion`                                                                                           | Abrir, trocar, fechar, `aria-expanded`                                                                                                                                                                        | `user-event`                                                                                                                                                                                                        |
| `Navbar`                                                                                              | Links; seção ativa muda via observer; clique faz scroll e `preventDefault`; resize; blur após rolar                                                                                                           | `IntersectionObserver` controlável; `useScroll` falso retornando `motionValue` para disparar `scrollY.set()`                                                                                                        |
| `ProjectMockup`                                                                                       | Botões só aparecem quando a URL é string                                                                                                                                                                      | Render                                                                                                                                                                                                              |
| `Slider`                                                                                              | Itens duplicados; `alt` com fallback (`alt` → `text` → vazio); `duration` e `className`                                                                                                                       | Render                                                                                                                                                                                                              |
| `Hero`                                                                                                | Conteúdo e carregamento lazy do `Silk`                                                                                                                                                                        | `vi.mock` do `Silk`, `findBy*`                                                                                                                                                                                      |
| `LetterGlitch`                                                                                        | Desenha ao montar; atualiza após `glitchSpeed`; `smooth` true/false; resize refaz o grid; cleanup cancela animação; vinhetas; hex curto e inválido                                                            | `getContext` falso em `HTMLCanvasElement.prototype`; `requestAnimationFrame` manual; fake timers                                                                                                                    |
| `Silk`                                                                                                | Escala do plano igual à viewport; `uTime` avança; uniforms derivadas das props; cor hex                                                                                                                       | Tentar `@react-three/test-renderer` (real, sem WebGL), capturando os filhos de um `Canvas` falso. **Não validado.** Conferir compatibilidade com fiber 9. Só excluir se ficar desproporcional, explicando no README |
| `Description`, `Footer`, `Projects`, `TechStack`, `SocialButton`, `Divider`, `icons/*`, `constants/*` | Renderizam o conteúdo esperado e os links; ano atual no rodapé                                                                                                                                                | Render; `LetterGlitch` falso em `Description`                                                                                                                                                                       |

**Decisões de João Victor em 2026-11-03** (o grupo ainda não confirmou):

- `LetterGlitch`: `colorToRgb` agora aceita `rgb(...)`, e a cor chega ao destino. **Muda o visual do site**, e o resultado ainda não foi visto no navegador. Também redesenha quase a cada quadro, o que deve aumentar um pouco o uso de CPU; não foi medido.
- `LetterGlitch`: o `resizeTimeout` é limpo ao desmontar.
- `SocialButton`: sem `aria-hidden`, com `ariaLabel` obrigatório. Nomes em `Hero` e `Footer`: `LinkedIn`, `GitHub` e `Send email`.
- O e-mail de contato do portfólio continua fixo no link do Gmail: é conteúdo público do site, não o destinatário do pipeline.
- Responsáveis por C1 a C3 ficam para depois.

**Dependências adicionadas além da lista acima:** `@testing-library/dom`, exigida pelo `@testing-library/react`, e `@react-three/test-renderer`, usada no `Silk`. O `Silk` ficou testado sem exclusão, mas o log mostra dois avisos inofensivos do Three.js (`Multiple instances` e `THREE.Clock`).

Armadilhas conhecidas:

- O `lazy` do `Hero` guarda o módulo depois de carregado, então o teste do carregamento precisa ser o primeiro do arquivo.
- Em testes com `requestAnimationFrame` falso e fake timers, desmonte com `cleanup()` antes de `useRealTimers()`: o jsdom não tem `cancelAnimationFrame`, e o erro na desmontagem contamina os testes seguintes.
- O `<title>` dos ícones entra no texto e no nome acessível. `toHaveTextContent("TailwindCSS")` pode passar com "Tailwind" + "CSS", e o `cy.contains("a", "LinkedIn")` do Cypress depende desse `<title>`.
- Um `<a>` sem `href` não tem o papel `link`. Para confirmar que um botão não aparece, use `queryByLabelText`, não `queryByRole("link")`.
- O guard `if (liked || loading) return` do `LikeButton` é inalcançável por clique, pois o botão fica `disabled`. É aceitável esse branch ficar descoberto; a lista completa está no README.

## 7. Demais tarefas

Preencher "Responsável" com o grupo. Integrantes conhecidos: Juliano Aleixo (dono do remote) e João Victor (`joaovictorgs`, usuário desta sessão). **Lista completa do grupo: perguntar.**

| #   | Tarefa                                                                                                             | Situação                                                   | Responsável |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------- |
| B1  | Testes da API (≥ 90%)                                                                                              | Commitado em `test/coverage_adjustment`, PR pendente       | João Victor |
| B2  | Rota de reset com `ENABLE_TEST_RESET`                                                                              | A fazer                                                    |             |
| B3  | Store Redis implementando `LikesStore`                                                                             | A fazer                                                    |             |
| C1  | Testes dos componentes                                                                                             | Escrito e verificado, aguardando commit manual             | A definir   |
| C2  | Escopo de cobertura documentado no README                                                                          | Escrito, aguardando commit manual                          | A definir   |
| C3  | Thresholds de 90% no app                                                                                           | Configurado, aguardando commit manual                      | A definir   |
| D1  | `baseUrl` do Cypress por variável (fixo em `tests/cypress.config.ts:9`)                                            | k6 pronto, Cypress não                                     |             |
| D2  | Reativar TC-019; trocar TC-020 por "botão desabilitado após curtir"                                                | A fazer                                                    |             |
| D3  | Reescrever o hook `After` de likes usando a rota de reset                                                          | A fazer, depende de B2                                     |             |
| D4  | `cy.intercept` no EmailJS                                                                                          | A fazer (nenhum intercept existe hoje)                     |             |
| E1  | `api/Dockerfile` (`tsc`, depois `node dist/server.js`) + `.dockerignore`                                           | A fazer                                                    |             |
| E2  | `app/Dockerfile` multi-stage + `nginx.conf` com proxy de `/api` + `.dockerignore` (com `.env`, `node_modules`)     | A fazer                                                    |             |
| E3  | `docker-compose.yml`: 5 serviços, rede interna, healthchecks, `depends_on` com `service_healthy`, volumes nomeados | A fazer                                                    |             |
| E4  | `.env.example` na raiz (`NOTIFY_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `ENABLE_TEST_RESET`...)                          | A fazer                                                    |             |
| F1  | `jenkins/Dockerfile` (Node 22, libs do Cypress, k6, plugins), `plugins.txt`, `casc.yaml`                           | A fazer                                                    |             |
| F2  | `Jenkinsfile`: checkout, instalação, testes com cobertura, Cypress contra o app, k6 (opcional), pacote `.tar.gz`   | A fazer                                                    |             |
| F3  | Arquivar pacote e relatórios                                                                                       | A fazer                                                    |             |
| F4  | Script de e-mail no bloco `post`, via `NOTIFY_EMAIL` e SMTP do Mailpit                                             | A fazer                                                    |             |
| G1  | Publicar imagem do Jenkins e o compose puxá-la                                                                     | A fazer                                                    |             |
| G2  | README completo com "Uso de IA"                                                                                    | A fazer                                                    |             |
| G3  | Entrega no Teams                                                                                                   | A fazer                                                    |             |
| G4  | Ensaio da defesa                                                                                                   | A fazer                                                    |             |

Ordem: B1, B2 e C → D → B3 e E → F → G.

### Orientações técnicas

**Docker e Compose**

- Fixar versões de imagens base; evitar `latest`.
- Sem montar código do host: o Jenkins obtém o código pelo checkout do repositório **público**, então o que não recebeu push não será testado.
- Variáveis `PUBLIC_EMAILJS_*` são embutidas no build do Astro; precisam ser build args, e o `.env` não entra na imagem.
- Não expor a API nem o Redis ao host. Portas sugeridas: jenkins 8080, app 4321→80 (mantém o padrão do Cypress), mailpit 8025. SMTP do Mailpit é 1025, só na rede interna.
- `api` depende de `db` saudável (`redis-cli ping`); `app` depende de `api` saudável (`/api/health`).
- O proxy `/api` de `astro.config.mjs` vale só para `astro dev`. Em container, quem repassa é o nginx.

**Jenkins**

- Configuration as Code + Job DSL criam um job que **só** aponta para o Jenkinsfile no repositório. Assim não há etapas pela interface.
- O e-mail fica em `post { always { ... } }`, para notificar também em falha, com status (`currentBuild.currentResult`), número do build e link. Falha no envio não deve mascarar o resultado real.
- Falha de teste ou de cobertura precisa deixar o build vermelho. Se o Cypress rodar mesmo com etapa anterior falhando, mantenha o status correto.
- O Cypress roda com `baseUrl=http://app` na rede interna. Precisa das libs de sistema e do Xvfb na imagem, e do binário instalado como usuário `jenkins`.
- Credenciais (admin do Jenkins, token do Docker Hub, chaves do EmailJS) nunca no repositório. `.gitignore` já ignora `.env` e `.env.*`, exceto `.env.example`.
- A rota de reset é ligada só no stack de teste. Lembrar que ela existe em qualquer ambiente com a variável ligada.
- A imagem do Jenkins precisa de Node **≥ 22.22.2**: é o que o `jsdom` instalado em `app/` exige (`^22.22.2 || ^24.15.0 || >=26.0.0`), acima dos 22.12 do `engines`.

**k6**

- `tests/Performance/config/report.ts` importa de URLs remotas: precisa de internet no pipeline, e o caminho dos relatórios é relativo a `tests/`. Rodar da pasta certa.
- No pipeline, rode só um script curto (load). Spike e stress são pesados e podem derrubar a demonstração de 20 minutos.

**Definição de pronto de cada tarefa**

1. Comando executado de verdade, com a saída observada. Nunca declare sucesso sem rodar.
2. Thresholds de cobertura continuam passando.
3. Nenhum segredo ou e-mail fixo no diff.
4. O integrante responsável consegue explicar a mudança.
5. Seção 4 e Registro de uso de IA atualizados.

## 8. Problemas encontrados no código (não corrigidos)

Pergunte antes de corrigir, para não misturar com a tarefa em andamento.

| Local                                              | Problema                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/cypress/e2e/likes/likes.steps.ts` (`After`) | Clica de novo em botão que fica desabilitado depois de curtir, tentando desfazer um like que a API não permite. Resolver com D3                                                                                                                            |
| `likes.feature` TC-020                             | Descreve "descurtir", que não existe. Resolver com D2                                                                                                                                                                                                      |
| Cypress + likes                                    | Sem reset, o store acumula likes entre testes. Cada teste pode ter novo `deviceId`, se o `localStorage` for limpo. Assertivas não devem depender de valor absoluto                                                                                         |
| `LetterGlitch.tsx` (`handleSmoothTransitions`)     | Após o primeiro passo, `letter.color` vira `rgb(...)` e `hexToRgb` retorna `null`. **Corrigido** (seção 6.2). Falta ver no navegador                                 |
| `LetterGlitch.tsx` (cleanup)                       | O `resizeTimeout` não é limpo ao desmontar; pode reiniciar a animação depois disso. **Corrigido** (seção 6.2)                                                                                                                                                   |
| `SocialButton.tsx`                                 | `aria-hidden="true"` em link focável com `aria-label` oculta o link de leitores de tela. `Hero` e `Footer` passam sem `ariaLabel`. **Corrigido** (seção 6.2)                                                                                                    |
| `Hero.tsx`, `Footer.tsx`                           | O endereço de e-mail de contato do portfólio está fixo no link do Gmail. É conteúdo público do site, não o destinatário do pipeline (`NOTIFY_EMAIL`), mas pode gerar pergunta na defesa. **Mantido por decisão de João Victor**                                              |
| `Footer.tsx`, `Silk.tsx`                           | `Heart` não é usado em `Footer`; `Mesh` e `ShaderMaterial` são usados só como tipo em `Silk`. Nenhum impede o build                                                                                                                                        |
| `api/src/server.ts`                                | Usa store em memória: likes somem ao reiniciar. Resolver com B3                                                                                                                                                                                            |
| `api/src/app.ts` (erro 500)                        | Sem `NODE_ENV=production`, o handler padrão do Express devolve o stack trace, com caminhos de arquivo, na resposta. Com `production`, devolve só "Internal Server Error". Observado em execução. Considerar definir a variável no container da API (E1/E3) |
| `app/` (`npm audit`)                               | 23 vulnerabilidades (15 em produção: 1 crítica no `astro` e 11 altas, como `vite`, `sharp` e `devalue`). `npm audit fix` não foi executado. **Decisão pendente** |
| `app/tests/Contact.test.tsx`                       | Usa o endereço fictício `ana@test.dev` para preencher o formulário, porque o campo valida o formato. Não é o destinatário do pipeline, mas aparece em uma busca por e-mails |
| `app/src/components/Slider.tsx`                    | A classe `[mask-image:...]mask-[...]` não tem espaço separador. Efeito visual a confirmar                                                                                                                                                                  |

## 9. Registro de uso de IA

Base para a seção do README. **Acrescente aqui cada prompt relevante, com o texto real e o desfecho.** Não reescreva os prompts.

Modelo usado até agora: Claude Opus 5.5 pelo Claude Code (extensão VS Code).

| Prompt real                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Uso                                               | Desfecho                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Envio dos PDFs da disciplina e da lista de pendências, com "infos importantes"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Comparar requisitos e repositório                 | Diagnóstico aceito pelo usuário como ponto de partida                                                                                                                                            |
| "ok antes de tudo, baixe todas as dependencias e veja se está rodando tudo certo, vamos primeiro de tudo fazer o coverage ficar em 90%"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Instalação, build e início dos testes             | Instalação e builds aproveitados. Primeira tentativa dos testes interrompida pelo usuário; nada escrito                                                                                          |
| "ok n faça nada por enxuanto, crie um contexto e com ele fale tudo oxue precisamos, e afins, se necessário crie um claude.md especificando todos os rexusitos, depois de criar esse claude vou dar sexuencia em outro terminal, então seja o mais especifico possivel e preze sempre pela xualidade maxima das coisas"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Criar este arquivo                                | Este `CLAUDE.md`; revisão do grupo pendente                                                                                                                                                      |
| "ok, você é um engenheiro de software focado em qa e cicd, você possui os conhecimentos contidos no claude.md e você sabe a matéria anexada que vou te mandar, antes de iniciarmos qualquer coisa, faremos os testes de forma que se tenha no minimo 90% de coverage no projeto todo, faremos em partes, então primeiro a API e depois o front, em toda parte que uma decisão tecnica ou q não está no seu escopo apareceu, questione a mim antes de tomar qualquer decisão, essa etapa vamos considerar ser a preparação de tudo, pois o 90% de coverage é o minimo para comerçar de fato a ter uma pipeline, então como fazer testes em si é trivial, essa mecanica ficara para IA(voce), me atualize de todas as coisas criadas sem excessão e de todas as decisões tomada, atualiza o claude.md conforme for fazendo as coisas também para mantes de evidência" | Testes da API (B1) e seção de cobertura do README | Testes gerados pela IA, sem edição manual até aqui, com 100% de cobertura e 19 quebras propositais detectadas. Quatro decisões tomadas por João Victor (seção 6.1). Commit manual e PR pendentes |
| "1- se realmente n impacta em nada, remova, 2- sim 3- indixue os prós e contras e como vamos resolver antes de tentar xualxuer coisa 4- mesma coisa da 3 5- vamos depois manténha"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Respostas às decisões do front                    | `Features.tsx` removido e escopo de cobertura definido. Análise dos bugs de `LetterGlitch` e `SocialButton` apresentada, sem correção. Responsáveis por C1 a C3 ficaram para depois              |
| "3a(a) 3b(a) 4A email mantém como está" | Correções e testes do front (C1 a C3) | Correções aplicadas e 122 testes gerados pela IA. Foram ajustados depois que quebras propositais revelaram 2 testes fracos. Nos primeiros testes, a IA errou a ordem de limpeza e corrompeu um arquivo com um script; ambos corrigidos. Commit manual pendente |

Falta preencher com o grupo: dinâmica de uso de cada integrante e o que foi feito sem IA. Até aqui, a arquitetura e a lista de tarefas chegaram prontas à IA; a autoria delas deve ser confirmada pelo grupo.
