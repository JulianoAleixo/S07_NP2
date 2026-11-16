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
api/                     API de likes (Express 5, TS). createApp(store) em src/app.ts; LikesStore em src/store.ts (memória)
                         e src/redisStore.ts (Redis); src/createStore.ts escolhe pelo REDIS_URL; bootstrap em src/server.ts
app/                     Portfólio (Astro 6, React 19, Tailwind 4, framer-motion, three/@react-three/fiber, EmailJS), com Dockerfile e nginx.conf
tests/                   Cypress 15 + Cucumber (BDD com Page Object em cypress/pages/MainPage.ts) e k6 (Performance/)
jenkins/                 Dockerfile, plugins.txt (versões fixas) e casc.yaml (job multibranch)
scripts/notify/          Script de e-mail do pipeline (Node + nodemailer)
Jenkinsfile              Etapas do pipeline
docker-compose.yaml      Stack local: jenkins, app, api, db e mailpit
docker-compose.test.yaml Stack de teste que o pipeline sobe a cada build: app, api e db, sem portas no host
```

Cada pasta tem seu `package.json` (não é monorepo). Node ≥ 22.12 (engines); a máquina local usa Node 24 e o Jenkins usa Node 22. Rodar comandos dentro da pasta correta, usando caminhos absolutos no shell, pois o diretório de trabalho persiste entre chamadas.

API: `GET /api/health`, `GET /api/likes?deviceId=`, `POST /api/likes {deviceId}`. O `deviceId` é string de 1 a 100 caracteres; inválido retorna 400. Likes são idempotentes por dispositivo; não existe "descurtir".

## 4. Estado atual

Verificado em 2026-11-16. Na `main`: testes da API e do app (PR #1), container da API (PR #2), Cypress (PR #3), container do app e e-mail (PRs #4 e #5), Docker Hub (PR #7), JUnit (PR #8), README (PR #9) e Docker no Jenkins com stack de teste (PR #10). A branch `build/jenkins-multibranch` (multibranch e disparo automático) tem PR aberto; a imagem `1.0.2`, de que ela depende, já está publicada.

| Item | Situação |
| --- | --- |
| Testes da API | 35 testes, 100% em linhas, funções, branches e statements (verificado em 2026-11-16). `server.ts` fora da cobertura, com justificativa no README. Inclui o `redisStore` (cliente Redis falso) e o `createStore` |
| Testes do app | 123 testes, 100% em linhas, funções e statements e 95,87% em branches (verificado em 2026-11-16). Inclui o teste do `deviceId` sem `crypto.randomUUID` |
| Confiabilidade dos testes | Quebras propositais: 19 de 19 na API, 60 de 62 no app (as 2 restantes não mudam o comportamento), o TC-034 do Cypress e a alternativa ao `randomUUID` |
| Cypress | 34 cenários: 30 passando e 4 com `@skip` (TC-012, TC-020, TC-025 e TC-026). Passa no Jenkins contra o stack de teste. Relatório em arquivo único (`inlineAssets`) |
| Pipeline | Verde na `main` e nas branches, com disparo automático (`Branch indexing`). Etapas: validar ambiente, instalar, testes unitários, subir stack de teste, Cypress, k6 (opcional), build e pacote; no `post`, artefatos, JUnit, e-mail e limpeza do stack |
| Jenkins | Imagem `julianomaleixo/s07-np2-jenkins` com tags `1.0.0`, `1.0.1` e `1.0.2` no Docker Hub (não existe `latest`). Job multibranch criado por CasC, com varredura a cada 5 minutos |
| Stack de teste | `docker-compose.test.yaml`, subido pelo pipeline pelo socket do Docker do host, com nome `s07-test-<executor>`. O Cypress acessa `http://s07-test-<executor>-app-1`. Removido no fim de cada build |
| E-mail | `scripts/notify/send-email.js`, destinatário em `NOTIFY_EMAIL`. Padrão: Mailpit. Com `SMTP_HOST`, `SMTP_USER` e `SMTP_PASS` no `.env`, envia por SMTP real (testado com Gmail e senha de app). Anexa só o relatório do Cypress: o Gmail bloqueia o `.tar.gz` |
| Compose | 5 serviços (`jenkins`, `app`, `api`, `db` e `mailpit`) e 3 volumes (`jenkins_home`, `redis_data` e `mailpit_data`). Likes persistidos no Redis |
| README | Completo (instalação, execução, uso, funcionalidades, requisitos e "Uso de IA"). Um marcador `[CONFIRMAR: pacote .tar.gz nos artefatos]` na linha B7 pode ser removido: o pacote aparece nos artefatos |
| k6 | Nunca executado no pipeline. `report.ts` importa de URLs remotas |

Próximas ações: merge do PR do multibranch, atualizar o Overview do Docker Hub, apagar as branches mergeadas e tratar as pendências da seção 7. Trabalhar por partes, parando a cada parte para relatar e perguntar. Perguntar antes de qualquer decisão técnica ou fora do escopo.

## 5. Arquitetura (5 containers no stack local, 3 no stack de teste)

| Container | Origem | Papel |
| --- | --- | --- |
| jenkins | Docker Hub (`julianomaleixo/s07-np2-jenkins:1.0.2`), construída de `jenkins/Dockerfile` | Roda o pipeline (Node, libs do Cypress, k6, cliente Docker e script de e-mail) |
| app | `build:` local (Astro + nginx) | Serve o site e repassa `/api` para a API |
| api | `build:` local | API de likes |
| db | Docker Hub (`redis:7.4-alpine`) | Guarda os likes (`appendonly yes`) |
| mailpit | Docker Hub (`axllent/mailpit:v1.29.6`) | Recebe o e-mail do pipeline quando não há SMTP real |

Comunicação: app → api → db, jenkins → mailpit, jenkins → Docker do host (socket) e jenkins → app do stack de teste. Volumes: `jenkins_home`, `redis_data` e `mailpit_data`.

### Decisões do grupo

| Decisão | Escolha | Motivo |
| --- | --- | --- |
| Banco | Redis com persistência (`appendonly yes`), como conjunto (`SADD`, `SCARD`, `SISMEMBER`) | Pouco código; a interface `LikesStore` já existia |
| Script de e-mail | Node com `nodemailer` | Node já está na imagem do Jenkins |
| Pastas de cobertura do app | **João Victor (2026-11-03):** `src/**/*.{ts,tsx}`, sem exclusões | Mais defensável; `.astro` fica fora por ser só marcação |
| `Features.tsx` | **Removido por João Victor (2026-11-03)** | Código morto |
| Chaves do EmailJS nos testes | **João Victor (2026-11-10):** valores falsos (`test_service`, `test_template`, `test_public_key`) | O intercept do Cypress responde no lugar do EmailJS; nenhuma chave real no Jenkins ou nas imagens |
| Cypress e k6 | **João Victor (2026-11-05):** dentro da imagem do Jenkins | Versão fixa no Dockerfile |
| E-mail real | **João Victor (2026-11-15):** SMTP configurável pelo `.env`, Mailpit como padrão | Funciona sem internet e mantém o Mailpit como 4º container; o Gmail funciona com senha de app |
| Pacote no e-mail | **João Victor (2026-11-15):** não anexar | O Gmail bloqueia compactados com `.js`; o pacote fica nos artefatos, pelo link |
| Docker no Jenkins | **João Victor e Juliano (2026-11-16):** socket do host, com `group_add` (`DOCKER_GID`, padrão 0) | O Cypress passa a testar o código do commit. O Jenkins não roda como root. Risco aceito: o Jenkins controla o Docker da máquina |
| Stack de teste | **João Victor e Juliano (2026-11-16):** arquivo separado (`docker-compose.test.yaml`) | Evita o conflito na porta 4321 com o stack local |
| Endereço do app de teste | Nome do container, não `http://app` | O Jenkins está nas duas redes; na simulação, `http://app` respondeu pelo stack errado |
| Disparo automático | **João Victor e Juliano (2026-11-16):** multibranch com varredura a cada 5 minutos | Webhook não alcança `localhost`; o multibranch testa cada branch antes do merge |
| Nome do stack de teste | **João Victor e Juliano (2026-11-16):** pelo executor (`s07-test-<executor>`) | No multibranch, cada branch tem a própria numeração de builds; dois `#3` colidiriam |
| Branches mergeadas | Apagadas no GitHub (2026-11-16) | A primeira varredura rodaria os `Jenkinsfile` antigos delas |
| Versões da imagem do Jenkins | Uma tag por versão, nunca sobrescrita, sem `latest` | O compose sempre aponta para uma versão que existe |

## 6. Testes e cobertura

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

**Decisões de João Victor em 2026-11-03**:

- `LetterGlitch`: `colorToRgb` agora aceita `rgb(...)`, e a cor chega ao destino. **Muda o visual do site**, mas, no navegador (2026-11-10), João Victor não percebeu mudança de cor: o `Description` usa três roxos muito próximos (`#7c3aed`, `#6d28d9`, `#5b21b6`), então a transição é sutil. A correção é garantida pelos testes unitários, não pela inspeção visual. João Victor decidiu não mexer mais no visual: é questão do site, fora do escopo DevOps. Também redesenha quase a cada quadro, o que deve aumentar um pouco o uso de CPU; não foi medido.
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

## 7. Pendências

| # | Pendência | Risco | Responsável |
| --- | --- | --- | --- |
| P1 | Merge do PR do multibranch (`build/jenkins-multibranch`); a imagem `1.0.2` já está publicada | — | João Victor e Juliano |
| P2 | Atualizar o Overview da imagem no Docker Hub (texto pronto, sem `latest` e com as tags `1.0.x`) | Baixo | Juliano |
| P3 | Apagar as branches mergeadas (`build/docker-in-jenkins` e, após o merge, `build/jenkins-multibranch`) | Baixo | Juliano |
| P4 | Remover o marcador `[CONFIRMAR: ...]` do README (linhas A7 e B7) | Baixo | Todos |
| P5 | **Grupo de 3 integrantes**, quando o PDF pede de 4 a 6: confirmar com o professor por escrito | Alto | Todos |
| P6 | **Repositório no time da matéria** (hoje na conta pessoal de Juliano) | Alto | Juliano |
| P7 | Entrega no Teams: link do GitHub e do Docker Hub | Alto | Todos |
| P8 | Fixar a versão exata da base `jenkins/jenkins:lts-jdk21` e do Node (`setup_22.x`) para a imagem ser reproduzível (critério 2); exige a tag `1.0.3` | Médio | Juliano |
| P9 | Tirar o valor padrão `jenkins@localhost` do `SMTP_FROM` no compose (regra deste arquivo: nenhum e-mail como valor padrão) | Médio | Grupo decide |
| P10 | Relatório do Cypress em branco dentro do Jenkins (CSP bloqueia scripts nos artefatos). Opções: liberar com `-Dhudson.model.DirectoryBrowserSupport.CSP=` no `JAVA_OPTS` ou orientar a baixar o arquivo | Médio | Juliano |
| P11 | `npm audit`: 23 vulnerabilidades no app e 7 na API (2 críticas). Decidir entre corrigir e documentar | Médio | Grupo decide |
| P12 | k6 nunca executado no pipeline; o professor pode marcar `RUN_K6` ao vivo | Médio | João Victor |
| P13 | Teste em máquina limpa: clone, `.env` e `docker compose up` num computador sem nada antigo | Alto | Todos |
| P14 | Ensaio da defesa: revisar juntos `Jenkinsfile`, `docker-compose.yaml`, `docker-compose.test.yaml` e `casc.yaml` | Alto | Todos |

### Orientações técnicas

**Docker e Compose**

- Fixar versões de imagens; nunca `latest`. Uma tag publicada no Docker Hub nunca é sobrescrita: cada mudança em `jenkins/` gera uma versão nova (`1.0.3`...), publicada antes do merge do PR que a usa.
- O Jenkins obtém o código por checkout do repositório **público**: o que não recebeu push não é testado.
- Variáveis `PUBLIC_EMAILJS_*` são embutidas no build do Astro; entram como build args com valores falsos, e o `.env` não entra na imagem.
- Não expor a API nem o Redis ao host. Portas: jenkins 8080, app 4321→80, mailpit 8025.
- O `docker-compose.test.yaml` repete a configuração de build do `app` e da `api`: mudou uma, mude a outra.
- O proxy `/api` de `astro.config.mjs` vale só para `astro dev`. Em container, quem repassa é o nginx.

**Jenkins**

- Configuration as Code + Job DSL criam o job multibranch, que só aponta para o `Jenkinsfile` de cada branch. Nenhuma etapa pela interface.
- Mudar o tipo do job exige recriar o volume `jenkins_home` (perde o histórico).
- O pipeline usa o Docker do host pelo socket. No Linux, `DOCKER_GID` no `.env` recebe o grupo do socket (`stat -c %g /var/run/docker.sock`).
- O Cypress e o k6 acessam o app de teste pelo nome do container (`s07-test-<executor>-app-1`), nunca por `http://app`.
- O e-mail fica em `post { always }`, com `returnStatus` para a falha no envio não mudar o resultado. A limpeza do stack de teste roda por último, com `|| true`.
- Falha de teste ou de cobertura precisa deixar o build vermelho.
- Credenciais (admin do Jenkins, senha de app do Gmail, token do Docker Hub) nunca no repositório. O `.env` usa quebras de linha do Windows: ao ler valores por script, remova o `\r`.
- A imagem do Jenkins precisa de Node **≥ 22.22.2**, exigido pelo `jsdom` do app.
- O `npm ci` no pipeline depende da rede: com a rede lenta, um build pode passar de 10 minutos. Rodar um build de aquecimento antes da defesa enche o cache do volume.

**k6**

- `tests/Performance/config/report.ts` importa de URLs remotas: precisa de internet, e o caminho dos relatórios é relativo a `tests/`.
- No pipeline, só o script curto (load). Spike e stress podem derrubar a demonstração.

**Definição de pronto de cada tarefa**

1. Comando executado de verdade, com a saída observada. Nunca declare sucesso sem rodar.
2. Thresholds de cobertura continuam passando.
3. Nenhum segredo ou e-mail fixo no diff.
4. O integrante responsável consegue explicar a mudança.
5. Seção 4 e Registro de uso de IA atualizados.

## 8. Problemas conhecidos no código

Pergunte antes de corrigir, para não misturar com a tarefa em andamento.

| Local | Problema |
| --- | --- |
| `likes.feature` TC-020 e o `After` de `likes.steps.ts` | "Descurtir" não existe. Mantidos com `@skip` e restritos ao TC-020, como requisito não atendido |
| `contact.feature` TC-012, TC-025 e TC-026 | O navegador aceita e-mail sem TLD e campos só com espaços; mantidos com `@skip` |
| `Hero.tsx`, `Footer.tsx` | E-mail público de contato do portfólio fixo no link do Gmail. Não é o destinatário do pipeline. **Mantido por decisão de João Victor** |
| `docker-compose.yaml` | `SMTP_FROM: ${SMTP_FROM:-jenkins@localhost}`: endereço fixo como valor padrão (P9) |
| `jenkins/Dockerfile` | Base `lts-jdk21` e Node `setup_22.x` sem versão exata (P8) |
| `Footer.tsx`, `Silk.tsx` | `Heart` não é usado em `Footer`; `Mesh` e `ShaderMaterial` só como tipo em `Silk`. Não impedem o build |
| `api/src/app.ts` (erro 500) | Sem `NODE_ENV=production`, o Express devolve o stack trace. **Resolvido no container** (`NODE_ENV=production` no `api/Dockerfile`) |
| `app/` e `api/` (`npm audit`) | 23 e 7 vulnerabilidades (P11) |
| `app/tests/Contact.test.tsx`, `tests/cypress/fixtures/contact.json` | Endereços fictícios (`test.dev`, `example.com`) para preencher o formulário. Aparecem numa busca por e-mails |
| `app/src/components/Slider.tsx` | A classe `[mask-image:...]mask-[...]` não tem espaço separador. Efeito visual a confirmar |
| `tests/tsconfig.json` | `resolveJsonModule` com `moduleResolution` `classic` dá erro no `tsc`. Não impede o Cypress, que compila com esbuild |
| Cypress 15 (aviso `allowCypressEnv`) | Aviso de depreciação a cada execução. Não vem do nosso código |
| `LetterGlitch.tsx` | Transição de cor corrigida; no navegador, a diferença é imperceptível (três roxos próximos) |

## 9. Registro de uso de IA

Base para a seção do README. **Acrescente aqui cada prompt relevante, com o texto real e o desfecho.** Não reescreva os prompts.

Modelos usados até agora:

- Claude Opus 5.5 pelo Claude Code (extensão VS Code): João Victor;
- Claude Sonnet 5.5 pelo claude.ai (navegador): Juliano e Eduardo;
- ChatGPT pelo chatgpt.com: Juliano.

| Integrante | Prompt real | Uso | Desfecho |
| --- | --- | --- | --- |
| João Victor | Envio dos PDFs da disciplina e da lista de pendências, com "infos importantes" | Comparar requisitos e repositório | Diagnóstico aceito pelo usuário como ponto de partida |
| João Victor | "ok antes de tudo, baixe todas as dependencias e veja se está rodando tudo certo, vamos primeiro de tudo fazer o coverage ficar em 90%" | Instalação, build e início dos testes | Instalação e builds aproveitados. Primeira tentativa dos testes interrompida pelo usuário; nada escrito |
| João Victor | "ok n faça nada por enxuanto, crie um contexto e com ele fale tudo oxue precisamos, e afins, se necessário crie um claude.md especificando todos os rexusitos, depois de criar esse claude vou dar sexuencia em outro terminal, então seja o mais especifico possivel e preze sempre pela xualidade maxima das coisas" | Criar este arquivo | Este `CLAUDE.md`; revisão do grupo pendente |
| João Victor | "ok, você é um engenheiro de software focado em qa e cicd, você possui os conhecimentos contidos no claude.md e você sabe a matéria anexada que vou te mandar, antes de iniciarmos qualquer coisa, faremos os testes de forma que se tenha no minimo 90% de coverage no projeto todo, faremos em partes, então primeiro a API e depois o front, em toda parte que uma decisão tecnica ou q não está no seu escopo apareceu, questione a mim antes de tomar qualquer decisão, essa etapa vamos considerar ser a preparação de tudo, pois o 90% de coverage é o minimo para comerçar de fato a ter uma pipeline, então como fazer testes em si é trivial, essa mecanica ficara para IA(voce), me atualize de todas as coisas criadas sem excessão e de todas as decisões tomada, atualiza o claude.md conforme for fazendo as coisas também para mantes de evidência" | Testes da API (B1) e seção de cobertura do README | Testes gerados pela IA, sem edição manual até aqui, com 100% de cobertura e 19 quebras propositais detectadas. Quatro decisões tomadas por João Victor (seção 6.1). Commit manual e PR pendentes |
| João Victor | "1- se realmente n impacta em nada, remova, 2- sim 3- indixue os prós e contras e como vamos resolver antes de tentar xualxuer coisa 4- mesma coisa da 3 5- vamos depois manténha" | Respostas às decisões do front | `Features.tsx` removido e escopo de cobertura definido. Análise dos bugs de `LetterGlitch` e `SocialButton` apresentada, sem correção. Responsáveis por C1 a C3 ficaram para depois |
| João Victor | "3a(a) 3b(a) 4A email mantém como está" | Correções e testes do front (C1 a C3) | Correções aplicadas e 122 testes gerados pela IA. Foram ajustados depois que quebras propositais revelaram 2 testes fracos. Nos primeiros testes, a IA errou a ordem de limpeza e corrompeu um arquivo com um script; ambos corrigidos. Commitados por João Victor (PR #1) |
| João Victor | "ok vamos por partes ent, faça a primeira parte sempre parando e me perguntando e afins pra me manter o mais atualizado possivel" | Container da API (E1) | `api/Dockerfile`, `.dockerignore` e serviço `api` escritos pela IA e aceitos após validação. João Victor interrompeu a IA para validar antes o que já existia, o que evitou construir sobre uma base não testada |
| João Victor | "quer rodar priemiro oq foi feito antes de qlqr coisa pra validar se funciona?" | Validar o Jenkins de Juliano antes de continuar | A IA subiu o Jenkins com autorização de João Victor. A imagem construiu, o job foi criado por CasC e o build #1 passou nos testes de API e app no Linux, falhando só no Cypress pela falta do container `app`, como esperado |
| João Victor | "1-A 2- so, siga de acordo com o recomendado" | Intercept do EmailJS e TC-033 (D4) | Intercept global e cenário de envio com sucesso escritos pela IA. João Victor executou a linha de base por conta própria, seguindo instruções da IA: 27 de 28 cenários passaram |
| João Victor | "pode fazer o A ENT" | Falha do TC-033 | A IA diagnosticou, pelo relatório e pela captura de tela, a falta das variáveis do EmailJS. João Victor escolheu valores falsos em vez das chaves reais |
| João Victor | "pode ser, mas n apague pois querendo ou n esses testes são validos sabe? o after faz sentido, ams pra ter cobertura maior msm, mas n deixe os artefatos importantes pois eles validam um comportamento claramente erroneo do site" | Likes no Cypress (D2 e D3) | **Ajustado:** a IA propôs apagar o `After` e o TC-020; João Victor decidiu mantê-los pulados, como requisito não atendido. Na primeira versão do TC-034, a IA não percebeu que o botão já começa travado enquanto carrega, o que faria o teste passar sempre; ela corrigiu antes da execução. João Victor rodou a suíte (30 passando) e a quebra proposital que fez o TC-034 falhar |
| João Victor | "reescreva o teste por favor e vamos testar tudo pra ver se funciona dai" | Bug do `crypto.randomUUID` relatado por Eduardo | A IA confirmou o diagnóstico, escreveu a alternativa com `getRandomValues` e um teste unitário (123 testes, cobertura mantida) e fez a quebra proposital que derrubou o teste novo. João Victor rodou o pipeline: build verde, com o Cypress passando contra `http://app` (`530a3c2`) |
| João Victor | "vamos arrumar o relatório em branco primeiro" | Relatório do Cypress em branco no e-mail | A IA achou a causa (o HTML dependia da pasta `assets/`) e ativou `inlineAssets` e `embeddedScreenshots`. A IA não conseguiu rodar o Cypress no ambiente dela; João Victor rodou e confirmou o arquivo único. A IA também mostrou que o Mailpit e o Jenkins bloqueiam scripts por CSP, então o relatório é aberto baixando o arquivo (`0ae3be6`) |
| João Victor | "deu dois tar n sei pq" | Pacote antigo no e-mail e nos artefatos | A IA explicou que o workspace é reaproveitado e o `mkdir -p` mantinha os pacotes anteriores. João Victor aplicou o `rm -rf artifacts` (`e1d0e9a`) |
| João Victor | "caixa de email real" | E-mail por servidor SMTP real | A IA tornou `SMTP_HOST` e `SMTP_PORT` configuráveis pelo `.env` (Mailpit como padrão) e adicionou login opcional no script. João Victor criou a conta Gmail do grupo e a senha de app e testou: o e-mail do build #6 foi enviado (`88c0291`) |
| João Victor | "n apareceu na minha conta só na q enviou" | E-mail barrado pelo Gmail | A IA identificou que o Gmail bloqueia o `.tar.gz` por conter `.js` e tirou o pacote do anexo; ele continua arquivado no Jenkins. João Victor recolocou a linha, avaliou as alternativas e decidiu tirá-la de novo |
| João Victor | "ok quero q vc analise com calma e defenda todos os aspectos aq, vou te enviar o pdf de prereq, e vc compara tudo um por um ok?" | Auditoria do projeto contra o PDF | A IA comparou cada requisito e critério com o repositório e listou as pendências por risco, incluindo as seções do README que tinham sido descartadas sem commit |
| João Victor | "como atualizo a imagem do docker nosso ta certo?" | Conferir a imagem do Jenkins no Docker Hub | A IA consultou o Docker Hub e encontrou que o compose usava `:latest`, tag inexistente (404): numa máquina limpa, o `docker compose up` falharia. Só a `1.0.0` existia. Recomendou versões fixas e explicou como publicar |
| João Victor | "ta uma coisa esse pipeline é automatizado?" | Disparo automático | A IA confirmou que as etapas eram automáticas, mas o disparo era manual (nenhum gatilho no `Jenkinsfile` nem no `casc.yaml`), e comparou polling, multibranch, webhook com túnel e build agendado |
| João Victor e Juliano (pair programming) | "pra adicionar o docker pode fazer isso, oxue mudaria?" e depois "sem problemas, faça isso por agora ent, passo a passo, divida em etapas" | Docker no Jenkins e stack de teste (PR #10) | A IA dividiu em etapas e testou cada uma: o socket pertencia ao grupo 0 (`permission denied` sem `group_add`), a imagem `1.0.1` com o cliente Docker funcionou, e a simulação do stack de teste mostrou que `http://app` respondia pelo stack errado, o que levou a usar o nome do container. João Victor e Juliano escolheram o socket com `group_add` e o `docker-compose.test.yaml` separado e rodaram o pipeline verde na branch. Juliano publicou a `1.0.1` |
| João Victor e Juliano (pair programming) | "ta mas e o multibranch xue conversarmos oxue falta?" e "e o trigger" | Multibranch e disparo automático | A IA apontou que o nome do stack por número de build colidiria entre branches e que a primeira varredura rodaria as branches antigas. João Victor e Juliano escolheram o nome pelo executor, a varredura a cada 5 minutos e apagar o histórico, e apagaram as 9 branches mergeadas. A IA construiu a `1.0.2` localmente e conferiu pela API do Jenkins: job `WorkflowMultiBranchProject`, builds disparados sozinhos (`Branch indexing`) e verdes, com o stack `s07-test-1`. Juliano publicou a `1.0.2` |
| João Victor e Juliano (pair programming) | "ok, poderia agr por favor criar o readme, toda essa etapa nossa foi feita em pair programming com o juliano" | README do stack de teste e do multibranch | A IA atualizou o README do Juliano (arquitetura, requisitos, variáveis, pipeline, tags e limitações), sem reescrever o resto. Também redigiu o texto dos PRs e o Overview novo do Docker Hub |
| Juliano | "preciso fazer um projeto de devops. mas não sei como vou containerizar o projeto direito. nessa primeira etapa quero que me ajude com ideias. vou te mandar meu projeto aqui e você me guia no que preciso acrescentar. basicamente esse projeto de devops é um segundo trabalho, que o professor permitiu continuar o primeiro conteúdo (testes de interface). vou lhe mandar o projeto aqui e o pdf com a descrição do que precisa ser feito. me retorne um roteiro do que posso fazer." | Roteiro inicial (chat do claude.ai), com o PDF do projeto e o zip | A IA leu o PDF e o repositório e apontou que os testes só rodavam contra o site em produção, sem código da aplicação para medir cobertura. Propôs trazer o portfólio para o repositório, 5 containers (jenkins, app, api, db, mailpit) e uma ordem de tarefas. Aceito como ponto de partida. |
| Juliano | "vou trazer meu portifólio para o projeto. mas já adiantando... ele não tem API." | Adaptar a arquitetura | A IA propôs criar uma API própria no lugar de um mock, com o armazenamento atrás de uma interface, mantendo o EmailJS interceptado nos testes. |
| Juliano | "meu repo é feito em react usando ts e astro. como você acha ideal deixar no meu trabalho? dois node modules ou considero só um node modules e adapto a pasta app?" | Estrutura de pastas | A IA recomendou um package.json por pasta (app, api, tests) em vez de um só, com justificativa. Aceito. |
| Juliano | "esse meu projeto com o app. preciso editar alguma coisa para faze-los funcionar? preciso dar o npm i em cada diretório (global e app). dê uma olhada na aplicação e me ajude com o novo planejamento desse projeto" | Revisão do código do app e novo planejamento | A IA descobriu que o backend dos likes era o Firestore e o contato usava o EmailJS, ambos externos. Listou ajustes (repositório git aninhado em app/, falta de .env, URLs de produção fixas nos testes) e comparou API própria com o emulador do Firestore. Escolha final: API própria, recomendada pela IA e aceita pelo usuário. |
| Juliano | "vamos por parte. primeiro antes de criar os containers e começar com docker e jenkins quero ajeitar o APP para isso. o que preciso mudar para usar uma api própria e deixar de usar o firestore?" | Migração dos likes para uma API própria | A IA escreveu a API (Express, armazenamento em memória), o likesApi.ts e as mudanças no LikeButton, com proxy de /api no astro.config. Aplicado pelo usuário e funcionando localmente. |
| Juliano | "fiz aqui as mudanças. acho que está ok. revise tudo se está certo e se falta limpar algo do código original. além disso, monte um gitignore global para gitignorar corretamente os arquivos." | Revisão da migração, .gitignore e .gitattributes | A IA apontou restos do Firebase (firebase.ts, variáveis `PUBLIC_FIREBASE_*`), .env vazios em tests/ e URLs de produção na configuração dos testes. Entregou o .gitignore da raiz e o .gitattributes com eol=lf. Limpeza feita pelo usuário. |
| Juliano | "e essa melhoria pequena na API. o que exatamente preciso fazer? passe a API para ts" | Validação do deviceId e conversão da API para TypeScript | A IA entregou a validação (string de 1 a 100 caracteres), os arquivos em TypeScript, tsconfig e vitest.config. A API do repositório está em TypeScript. |
| Juliano | "a limpeza eu já fiz. gere um markdown com as demais pendências para eu mandar para meu grupo." | Lista de pendências para o grupo | A IA gerou pendencias-S07-NP2.md, com tarefas por item (B a G), decisões em aberto e uma coluna de responsável em branco. Usado pelo grupo para dividir o trabalho. |
| Juliano | "me ajude a fazer o item F" | Jenkins (F1 a F4) | A IA gerou jenkins/Dockerfile, plugins.txt, casc.yaml, o Jenkinsfile e um script de e-mail em Python. A IA só validou a sintaxe do Python e do YAML; o Docker e o pipeline não foram executados por ela. O usuário rodou o build #1: passou checkout, instalação e testes de API e app, e falhou no Cypress (Could not resolve host: app), como esperado sem o container app. A IA errou ao estimar o tempo: a espera pelo app inexistente consumiu cerca de 3 minutos de tentativas do curl. |
| Juliano | "não quero a notificação por email por agora... o que preciso mudar?" e depois "retire tudo que for do email.. outro dev vai implementar isso e preciso deixar essa atividade para ele" | Tirar o e-mail do item F | A IA removeu do Jenkinsfile e do Dockerfile do Jenkins a checagem de NOTIFY_EMAIL, o passo de envio e o python3, e apagou o script em Python. O e-mail ficou como tarefa do outro integrante (F4). |
| Juliano | "reedite meu Jenkinsfile para que tenha um "TODO" nessas etapas que necessitam de outros containers. no caso a unica coisa que fizemos foi ajustar os testes." | Marcar dependências do Jenkinsfile | Três comentários TODO (item E) no bloco environment, na etapa de Cypress e na etapa do k6. Sem mudança de lógica. |
| Juliano | "com base no projeto, como posso usar o Redis para substituir o banco local? deixando o Redis em um container específico" | Redis como banco dos likes (B3) | A IA escreveu redisStore.ts (conjunto Redis: SADD, SCARD, SISMEMBER), createStore.ts (Redis com REDIS_URL, memória sem ela, fora do server.ts para ser testado), o novo server.ts, 11 testes com cliente falso e o serviço db no compose (redis:7.4-alpine, appendonly, volume redis_data, healthcheck, sem porta no host). Validação feita pela IA: typecheck dos módulos novos, YAML do compose e 11 testes com um executor próprio, mais 6 quebras propositais detectadas. Não validados pela IA: npm install redis, o Vitest com o limite de 90% e o docker compose up. |
| Juliano | "como posso verificar se o redis está rodando em um container individual? monte uma consulta para verificar a quantidade de likes" | Entender a arquitetura do Redis | Explicação do fluxo app, api e db, da comunicação pela rede do Compose (redis://db:6379), do volume e do healthcheck. Não gerou código. |
| Eduardo | "claude, preciso começar a desenvolver minha parte de um projeto e preciso de sua ajuda pra ver o que fazer, e como fazer. [...] Preciso que veja o repo, analise o que falta seguindo o que o PDF fala e o que foi dito no grupo. Em seguida, preciso que me ajude a desenvolver isso." (enviados junto o PDF do projeto, o link do repositório e parte da conversa do grupo) | Análise do que faltava no repositório e geração da parte do Eduardo (container do app e e-mail) | A IA clonou o repositório, leu `CLAUDE.md`, Jenkinsfile, compose e Dockerfiles, comparou com o PDF e com a conversa do grupo e listou o que faltava. Gerou `app/Dockerfile` (build em dois estágios com Node e nginx), `app/nginx.conf` (proxy de `/api/` para `api:3000`), `app/.dockerignore`, `scripts/notify/send-email.js` (nodemailer, destinatário em `NOTIFY_EMAIL`), os serviços `app` e `mailpit` com o volume `mailpit_data` no compose e a chamada do script no `post` do Jenkinsfile. A tag do Mailpit foi conferida no Docker Hub por busca na web. Testes feitos pela IA: o script contra um servidor SMTP falso e o build do app, confirmando que as variáveis `PUBLIC_EMAILJS_*` entram no JavaScript. Não validados pela IA (sem Docker no ambiente dela): o build das imagens, o nginx e o Jenkinsfile no Jenkins. Eduardo aplicou os arquivos e validou no Docker Compose e no Jenkins. |
| Eduardo | "oq eu preciso fazer agora? Me fala passo a passo. Preciso fazer alguns commits, pelo menos. Como disse, tem vários e vários commits do João, mas nenhum meu ainda. Preciso dividir esses afazeres em alguns commits." e depois "ok calma, me dê TODOS OS PROXIMOS PASSOS, até o ultimo commit, em que eu vou chegar e falar pro JUliano e pro Joao "pronto galera, olhem la"" | Plano de commits e branches para a parte do Eduardo | A IA propôs duas branches (`build/app-container` e `feat/email-notification`) e cinco commits, com os comandos de git, o teste no Docker Compose e no Jenkins e a mensagem para o grupo. Eduardo executou todos os comandos de git no próprio computador, e os commits `cb78a99`, `1f1f5b1`, `4e1d3ed`, `7d69233`, `559c2c4` e `614c3bd` são dele. |
| Eduardo | "assim que fiz esse primeiro commit, todos os indicativos de modified e de new adition sumiram." | Corrigir um erro do passo a passo da IA | O passo a passo da IA estava errado: ela não avisou que `git apply --3way` já coloca tudo na área de staging, então o primeiro commit saiu com 9 arquivos em vez de 3. A IA explicou a causa e orientou `git reset HEAD~1`, sem perder as alterações. Eduardo refez o commit só com os 3 arquivos do app. |
| Eduardo | "agr eu dou o n, certo??" (com a tela do `git add -p` colada) | Separar o compose em dois commits | A IA corrigiu a própria orientação: o `git add -p` não conseguia separar as partes do app e do e-mail, porque os trechos vinham misturados. Descartou esse caminho e propôs editar o `docker-compose.yaml` à mão, commitar só a parte do app, restaurar o arquivo completo e guardar o resto com `git stash -u`. Eduardo fez isso e gerou o commit `1f1f5b1`. |
| Eduardo | "o .env estava fora da pasta. era esse o erro ate o momento, oq eu faço? paro o run e volto pr testar?" | Diagnóstico do Jenkins que subiu pedindo para criar o primeiro usuário | A partir da saída do `docker compose config` (variáveis vazias), a IA apontou que o compose não estava lendo o `.env`. Eduardo achou o arquivo na pasta de fora, moveu para a pasta do compose, e seguiram `docker compose down -v` e `docker compose up --build`. O Jenkins subiu com o login normal. |
| Eduardo | "eu estou no passo 8 agora. Ja fiz o resto com êxito e agora buildei o job e deu failure, nao chegou email nenhum no email que coloquei tb. Oq te mando pra vc conferir?" | Diagnóstico do build vermelho e do e-mail | A IA explicou que o e-mail vai para o Mailpit (`localhost:8025`) e não para a caixa de entrada real. Pelo console do build, mostrou que só falharam 2 cenários de likes do Cypress, por `crypto.randomUUID is not a function`: o app em `http://app` não é contexto seguro, bug do app e não do container. Foi reportado ao João e corrigido por ele (`530a3c2`). A IA também reconheceu um erro dela: o relatório do Cypress estava anexado pelo caminho errado, e Eduardo corrigiu para `tests/cypress/reports/index.html` (`614c3bd`). |
| Eduardo | "claude, analisando o Jenkinsfile, la no final, tem alguma coisa de junit. Mas não usamos java, certo? Não faz sentido usar algo do junit ne? Ou to viajando? Explica aí pfv" | Entender o `junit` do Jenkinsfile | Só explicação, sem código: JUnit também é um formato XML de resultados de teste, independente de linguagem. O step `junit` lê o XML, e o vitest consegue gerá-lo. Os arquivos ainda não existiam (`No test report files were found`), e o `allowEmptyResults` evitava a falha. |
| Eduardo | "vou precisar implementar essa questão aí, me ajuda entao, queria mais uns commits" | Relatório JUnit dos testes unitários (F3) | A IA propôs o reporter `junit` do vitest nos dois `vitest.config.ts` e a inclusão de `api/reports` e `app/reports` no `archiveArtifacts`, dividido em três commits. Testou numa cópia do repositório: os dois projetos geram o `junit.xml` e a cobertura segue acima de 90%. Não validado pela IA: a execução no Jenkins. Eduardo aplicou as alterações e validou no Jenkins: o build passou a exibir o Test Result com 158 testes e a arquivar os dois junit.xml como artefatos. |
| Eduardo | "preciso que voce confira exatamente como se encontra o codigo atualmente, muita coisa foi adicionada por mim e pelos outros integrantes. Faça essa verificação rápida aí e me dê o PASSO A PASSO de como implementar isso que foi citado, incluindo os codigos e os comandos de terminal. TUDINHO no passo a passo." | Conferir o estado atual da `main` e montar o passo a passo do JUnit | A IA clonou a `main` de novo e viu que os PRs de Eduardo estavam mergeados, que o João havia corrigido o `randomUUID` e mudado o e-mail, que o Juliano havia adicionado o Redis e que o JUnit ainda não existia. Refez o teste na `main` atual (API com 35 testes e app com 123 geram o `junit.xml`, cobertura mantida) e entregou os trechos de código e os comandos. |

### Uso de IA na parte do João Victor (testes, container da API, Cypress e ajustes do pipeline)

- **Dinâmica:** uso individual, com o Claude Code dentro do VS Code. A IA lia o repositório, propunha a mudança com prós e contras e só aplicava depois da decisão de João Victor. O `CLAUDE.md` guardava o contexto e as decisões entre sessões.
- **Feito pela IA:** o texto dos testes unitários da API e do app, as quebras propositais dos testes unitários, o `api/Dockerfile`, o `api/.dockerignore` e o serviço `api` do compose, o intercept do EmailJS e os cenários TC-033 e TC-034, a correção do `crypto.randomUUID` com o teste, a configuração do relatório do Cypress, o SMTP configurável no script e no compose, os textos de PR e a documentação.
- **Feito à mão por João Victor:** todas as decisões técnicas (escopo de cobertura, remoção do `Features.tsx`, correções do `LetterGlitch` e do `SocialButton`, chaves falsas do EmailJS, manter o TC-020 e o `After`, e-mail real e anexos), todos os comandos de git (branches, commits, push, PRs e merges), todas as execuções do Cypress, incluindo a quebra proposital do TC-034, os builds no Jenkins, a conferência dos e-mails, a criação da conta Gmail e da senha de app, o `.env`, e a correção do `rm -rf artifacts` no `Jenkinsfile`.
- **Erros da IA que foram corrigidos:** no início, a IA fez commit e push sem autorização; João Victor mandou apagar a branch remota e proibiu a IA de commitar. Também errou a ordem de limpeza num teste, corrompeu um arquivo com um script e escreveu a primeira versão do TC-034 de um jeito que passaria sempre. Todos foram corrigidos antes de entrar na `main`.

### Uso de IA em pair programming (João Victor e Juliano: Docker no Jenkins, stack de teste e multibranch)

- **Dinâmica:** João Victor e Juliano trabalharam juntos com o Claude Code. A IA dividia o trabalho em etapas, propunha cada uma com prós e contras, testava (permissões do socket, simulação do stack de teste, consultas à API do Jenkins) e parava para a decisão dos dois.
- **Feito pela IA:** as alterações do `jenkins/Dockerfile`, do `docker-compose.yaml`, do `docker-compose.test.yaml`, do `Jenkinsfile` e do `jenkins/casc.yaml`, os testes locais, o README e os textos dos PRs e do Docker Hub.
- **Feito à mão:** as decisões (socket com `group_add`, arquivo de compose separado, nome pelo executor, varredura a cada 5 minutos e apagar o histórico), a remoção das branches mergeadas, os builds no Jenkins, os commits e PRs (João Victor) e a publicação das imagens `1.0.1` e `1.0.2` no Docker Hub (Juliano).
- **Riscos que a IA levantou antes de quebrar:** o conflito na porta 4321, o `http://app` ambíguo entre as duas redes, a colisão de nomes do stack entre branches e os builds das branches antigas na primeira varredura.

### Uso de IA na parte do Eduardo (app, e-mail e JUnit)

- **Dinâmica:** uso individual, em conversa no claude.ai. A IA lia o repositório, gerava os arquivos e dava o passo a passo. Eduardo executava tudo no próprio computador e devolvia erros e logs para diagnóstico.
- **Feito pela IA:** o texto dos arquivos do container do app, do script de e-mail, do serviço Mailpit, das alterações do compose e do Jenkinsfile, e das configurações do JUnit, mais o plano de commits.
- **Feito à mão por Eduardo:** aplicar os arquivos, todos os comandos de git (branches, commits, push e PRs), a edição manual do compose para separar os commits, subir o Docker Compose e o Jenkins, achar o `.env` na pasta errada, conferir o e-mail no Mailpit, reportar o bug dos likes e avisar o grupo.
- **Erros da IA que foram corrigidos:** o `git apply --3way` que juntou tudo no primeiro commit, o `git add -p` que não separava o compose e o caminho errado do relatório do Cypress no e-mail.

### Uso de IA na parte do Juliano (Docker Hub, Jenkins e adaptação do projeto)

- **Dinâmica:** uso individual, em conversa no claude.ai e chatgpt.com. A IA sugeria um roteiro e plano de ação e ajudava a pensar em como validar o que o Juliano desenvolvia.
- **Feito pela IA:** plano de ação na adaptação do projeto original para esse projeto, validação do jenkins e dockerhub.
- **Feito à mão por Juliano:** implementação em código, validação manual da implementação seguindo o plano de ação, versionamento e comandos git.
