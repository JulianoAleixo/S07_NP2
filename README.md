# S07 NP2: Aplicando DevOps na prática

Projeto em grupo da disciplina **S07 — Gerência de Configuração e Evolução de Software** (Inatel). Um portfólio em Astro + React + TypeScript, com API própria de likes, testes automatizados, pipeline no Jenkins e orquestração com Docker Compose. Toda a infraestrutura é definida como código.

|                      |                                                         |
| -------------------- | ------------------------------------------------------- |
| Repositório          | https://github.com/JulianoAleixo/S07_NP2                |
| Imagem no Docker Hub | https://hub.docker.com/r/julianomaleixo/s07-np2-jenkins |

## Sumário

1. [Visão geral e arquitetura](#1-visão-geral-e-arquitetura)
2. [Validação dos requisitos obrigatórios](#2-validação-dos-requisitos-obrigatórios)
3. [Funcionalidades](#3-funcionalidades)
4. [Estrutura do repositório](#4-estrutura-do-repositório)
5. [Pré-requisitos](#5-pré-requisitos)
6. [Instalação e execução](#6-instalação-e-execução)
7. [Uso](#7-uso)
8. [Testes e cobertura](#8-testes-e-cobertura)
9. [Pipeline (Jenkinsfile)](#9-pipeline-jenkinsfile)
10. [Docker Hub](#10-docker-hub)
11. [Uso de IA](#11-uso-de-ia)
12. [Limitações conhecidas](#12-limitações-conhecidas)
13. [Solução de problemas](#13-solução-de-problemas)

## 1. Visão geral e arquitetura

O sistema é um **portfólio pessoal** (site estático) com uma **API própria de likes**. O pipeline do Jenkins instala as dependências, roda os testes unitários e os testes de interface (Cypress), empacota o resultado, arquiva os artefatos e envia um e-mail de notificação.

```
navegador ──► app (nginx :80, publicado em localhost:4321)
                │  /api/*  (proxy_pass)
                ▼
              api (Express :3000) ──► db (Redis :6379, volume redis_data)

jenkins (localhost:8080, volume jenkins_home) ──► app      (Cypress e k6, pela rede interna)
        │
        └──► mailpit (SMTP :1025, interface localhost:8025, volume mailpit_data)
```

| Container | Origem                                                                                           | Papel                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `jenkins` | Dockerfile local (`jenkins/Dockerfile`), **publicado no Docker Hub** e puxado de lá pelo compose | Executa o pipeline: Node 22, libs do Cypress, k6 e plugins instalados na construção da imagem |
| `app`     | Dockerfile local (`app/Dockerfile`): build do Astro + nginx                                      | Serve o site e repassa `/api` para a API                                                      |
| `api`     | Dockerfile local (`api/Dockerfile`)                                                              | API de likes (Express + TypeScript)                                                           |
| `db`      | Docker Hub (`redis:7.4-alpine`)                                                                  | Guarda os likes, com persistência em disco                                                    |
| `mailpit` | Docker Hub (`axllent/mailpit`)                                                                   | Servidor SMTP de teste: recebe o e-mail do pipeline                                           |

### Decisões de arquitetura

- **Likes como conjunto no Redis** (`SADD`, `SCARD`, `SISMEMBER`): o total é o tamanho do conjunto, então não há contador separado que possa divergir da lista de devices, e o like é idempotente por device. A API acessa o armazenamento por uma interface (`LikesStore`): sem `REDIS_URL` ela usa memória, o que permite rodar sem Docker.
- **O pipeline não constrói imagens Docker.** O pacote gerado é um `.tar.gz` do build. Assim o Jenkins não precisa de acesso ao socket do Docker.
- **Cypress e k6 rodam dentro da imagem do Jenkins**, com versão definida no Dockerfile, e testam o `app` pela rede interna do compose (`http://app`).
- **Jenkins configurado como código** (Configuration as Code + Job DSL): o job só aponta para o `Jenkinsfile` do repositório. O Jenkins obtém o código por checkout do repositório público, então **só o que foi enviado ao GitHub é testado**.
- **Chaves do EmailJS nos testes são falsas.** O Cypress intercepta a chamada ao EmailJS, então nenhum e-mail real é enviado e nenhuma chave real entra no Jenkins ou nas imagens.
- **Ordem de subida garantida por healthcheck.** A `api` espera o `db`, o `app` espera a `api` e o `jenkins` só sobe quando o `app` está saudável (`depends_on` com `service_healthy`).
- **A API e o Redis não têm porta publicada no host.** Só os containers da mesma rede os alcançam. O site acessa a API pelo nginx.

## 2. Validação dos requisitos obrigatórios

Esta seção lista cada requisito do enunciado (`Projeto_S07_NP2.pdf`), **o que foi feito**, **quem implementou** e **como conferir**. A conferência pode ser:

- **Estática:** abrir o arquivo indicado ou buscar um trecho nele (os comandos usam `grep` e partem da raiz do repositório clonado; no PowerShell, use `Select-String`).
- **Reproduzível:** rodar o comando indicado. Os passos para subir tudo estão no [roteiro de reprodução](#roteiro-de-reprodução) logo depois da tabela.
- **Pública:** endereços acessíveis sem login (GitHub e Docker Hub).

### Sistema, repositório e equipe

| #   | Requisito do PDF                                                           | Quem implementou                                  | O que foi feito                                                                                                                                                                                                                                                                                                                                                                        | Como conferir                                                                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Sistema original, diferente do usado pelo professor                        | Juliano                                           | Portfólio autoral (`app/`) e API de likes própria (`api/`), trazidos no commit inicial. Não usa PokéAPI nem GlobalSQA                                                                                                                                                                                                                                                                  | Pastas `app/` e `api/`; `git show c10e283 --stat`. `grep -rniI -e pokeapi -e globalsqa app api tests --exclude-dir=node_modules` não retorna nada                                                                                                        |
| A2  | Repositório público no time da matéria no GitHub                           | Juliano                                           | Repositório público no GitHub.                                                                                                                                                                                                                                                                                                                                                         | `git ls-remote https://github.com/JulianoAleixo/S07_NP2.git` responde sem login, o que prova que é público                                                                                                                                               |
| A3  | Aplicação funcional                                                        | Juliano (app, API e Redis) e João Victor (testes) | `docker compose up --build -d` sobe site, API e Redis. O Cypress executou 30 cenários passando (2026-11-10), incluindo curtir e ler a contagem pela API                                                                                                                                                                                                                                | Suba a stack, depois `curl http://localhost:4321/api/health` (retorna `{"status":"ok"}`) e abra http://localhost:4321. Testes de interface: `cd tests && npm ci && CYPRESS_BASE_URL=http://localhost:4321 npx cypress run`                               |
| A4  | Cobertura de testes ≥ 90%                                                  | João Victor                                       | `npm test` falha se a cobertura ficar abaixo de 90% (`thresholds`). API e app estão acima de 90% nas quatro métricas (linhas, funções, branches e statements)                                                                                                                                                                                                                          | `grep -n -A6 thresholds api/vitest.config.ts app/vitest.config.ts` mostra 90 nas quatro métricas. `cd api && npm ci && npm test` e `cd app && npm ci && npm test` imprimem a tabela de cobertura. Escopo e exclusões na [seção 8](#8-testes-e-cobertura) |
| A5  | Commits relevantes de todos os membros                                     | Todos                                             | Em 2026-11-15 o Git registra 20 commits de João Victor, 10 de Eduardo Dias e 8 de Juliano (sem merges), cada um nas entregas listadas na tabela de Equipe                                                                                                                                                                                                                              | `git shortlog -sn --all --no-merges` (commits por autor) e `git log --no-merges --format="%an: %s"` (autor e mensagem de cada commit)                                                                                                                    |
| A6  | Todos participam de todas as entregas                                      | Todos                                             | Os três integrantes contribuíram para o projeto, mas as entregas foram divididas por responsabilidade: João Victor concentrou testes e ajustes de pipeline; Eduardo, container do app, e-mail e relatórios JUnit; Juliano, Jenkins, Redis e Docker Hub. O histórico comprova participação no conjunto do projeto, mas não que cada integrante implementou individualmente cada entrega | Tabelas de Equipe e de pull requests deste README e `git log --no-merges --format="%h %an %s"`                                                                                                                                                           |
| A7  | README completo (instalação, execução, uso, funcionalidades e "Uso de IA") | Todos                                             | Este arquivo tem instalação e execução (seção 6), uso (7), funcionalidades (3) e Uso de IA (11, que aponta para o registro no `CLAUDE.md`)                                                                                                                                                                                                                                             | Seções 3, 6, 7 e 11 deste README. `grep -n CONFIRMAR README.md` lista os poucos itens ainda em aberto                                                                                                                                                    |

### Jenkins e pipeline (item 3.1 do PDF)

| #   | Requisito do PDF                                                                                   | Quem implementou                                                                                                   | O que foi feito                                                                                                                                                                                                                                                                                                                                                                                                                                              | Como conferir                                                                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Jenkins em modo container, não instalado na máquina                                                | Juliano                                                                                                            | `jenkins/Dockerfile` (base `jenkins/jenkins:lts-jdk21`) e serviço `jenkins` no `docker-compose.yaml`. Nada é instalado no host                                                                                                                                                                                                                                                                                                                               | `git show 4ad4804 --stat` e `grep -n jenkins docker-compose.yaml`. Com a stack no ar, `docker compose ps` lista o container `jenkins`                                                                                                                    |
| B2  | Não usar GitHub Actions                                                                            | Todos                                                                                                              | Não existe a pasta `.github/workflows/`                                                                                                                                                                                                                                                                                                                                                                                                                      | `ls .github` retorna erro (a pasta não existe)                                                                                                                                                                                                           |
| B3  | Interface do Jenkins só para o checkout; etapas no Jenkinsfile (nunca criar etapas pela interface) | Juliano                                                                                                            | O job `s07-np2` é criado por código (Configuration as Code + Job DSL) e só aponta para o `Jenkinsfile` do repositório, inclusive o checkout. Todas as etapas estão no `Jenkinsfile`. A interface foi usada para login, disparar o build (_Build Now_) e consultar logs e artefatos. Uma vez foi usado o _Script Console_, **somente leitura**, para listar as versões dos plugins. Nenhuma etapa foi criada ou alterada pela interface                       | `grep -n -e pipelineJob -e scriptPath jenkins/casc.yaml` mostra o job e o caminho do `Jenkinsfile`. `grep -n "stage(" Jenkinsfile` lista as etapas                                                                                                       |
| B4  | Etapa de execução dos testes                                                                       | Juliano (pipeline), João Victor (testes unitários e Cypress) e Eduardo Dias (relatórios JUnit)                     | Estágios `Testes unitários` (API e App em paralelo) e `Testes E2E (Cypress)` no `Jenkinsfile`. O pipeline completo, incluindo o E2E contra `app`, `api` e `db`, já rodou com sucesso no Jenkins                                                                                                                                                                                                                                                              | `grep -n -e "Testes unitários" -e "Testes E2E" Jenkinsfile`. Em execução: [roteiro de reprodução](#roteiro-de-reprodução); o log do build mostra cada estágio                                                                                            |
| B5  | Etapa de build/empacotamento                                                                       | Juliano (etapa) e João Victor (limpeza do pacote antigo)                                                           | Estágio `Build e empacotamento`: `npm run build` em `api` e `app`, `rm -rf artifacts` e `tar -czf artifacts/s07-np2-${BUILD_NUMBER}.tar.gz` com `app/dist`, `api/dist` e o `package.json` e lock da API                                                                                                                                                                                                                                                      | `grep -n -A9 "Build e empacotamento" Jenkinsfile` e `git show e1d0e9a`. Em execução: o `.tar.gz` aparece nos artefatos do build                                                                                                                          |
| B6  | Etapa de notificação por e-mail                                                                    | Eduardo Dias (etapa) e João Victor (SMTP real e e-mail sem anexar o pacote)                                        | Bloco `post { always }` do `Jenkinsfile` chama `scripts/notify/send-email.js`, que entrega ao Mailpit (ou a um SMTP real, se configurado), e o e-mail de notificação já foi recebido no Mailpit. Falha no envio não muda o resultado do build (`returnStatus`)                                                                                                                                                                                               | `grep -n send-email Jenkinsfile` e `git show 559c2c4`. Em execução: após o build, o e-mail aparece em http://localhost:8025                                                                                                                              |
| B7  | Pacote e relatório de testes armazenados como artefatos no Jenkins                                 | Juliano (arquivamento), Eduardo Dias (relatórios JUnit) e João Victor (relatório HTML do Cypress que abre sozinho) | `archiveArtifacts` no `post { always }`: `artifacts/*.tar.gz` (pacote), `tests/cypress/reports/**` (relatório HTML do Cypress), `api/coverage/**` e `app/coverage/**` (cobertura), `api/reports/**` e `app/reports/**` (JUnit), além de screenshots e relatórios do k6. O relatório do Cypress e a cobertura aparecem nos artefatos do build. **[CONFIRMAR: pacote `.tar.gz` nos artefatos]**                                                                | `grep -n -A5 archiveArtifacts Jenkinsfile`, `git show 99d1894` e `git show 0ae3be6`. Em execução: página do build, seção _Artefatos_ (`http://localhost:8080/job/s07-np2/lastBuild/`)                                                                    |
| B8  | Script (linguagem livre) que envia o e-mail com as informações da execução                         | Eduardo Dias (script) e João Victor (SMTP real)                                                                    | `scripts/notify/send-email.js` (Node + nodemailer): envia status, job, número do build, commit e link, e anexa o relatório HTML do Cypress quando existe. O pacote não vai anexado, porque o Gmail bloqueia arquivos compactados com `.js`: ele fica nos artefatos, pelo link do e-mail. O e-mail enviado por ele chegou ao Mailpit                                                                                                                          | Abrir `scripts/notify/send-email.js` e `scripts/notify/package.json`; `git show 4e1d3ed` e `git show 71855e9`                                                                                                                                            |
| B9  | Endereço de e-mail não fixo no código (variável de ambiente)                                       | Eduardo Dias (script) e João Victor (SMTP real)                                                                    | O destinatário vem só de `NOTIFY_EMAIL`, lido de `process.env` **sem valor padrão**: o script aborta se faltar. O `docker-compose.yaml` a repassa a partir do `.env` (ignorado pelo Git) e o `.env.example` traz só o nome. O remetente padrão `jenkins@localhost` (`SMTP_FROM`) é só o remetente local, não o destinatário. Os demais e-mails do repositório são o contato público do portfólio (`Hero.tsx`, `Footer.tsx`) e endereços fictícios dos testes | `git show 4e1d3ed`; `grep -rn NOTIFY_EMAIL docker-compose.yaml scripts .env.example`. `grep -rnE "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}" Jenkinsfile docker-compose.yaml scripts jenkins .env.example --exclude-dir=node_modules` não retorna nada |
| B10 | Software do pipeline instalado por script ou Dockerfile                                            | Juliano                                                                                                            | `jenkins/Dockerfile` instala Node 22, as libs e o Xvfb do Cypress e o k6. Os plugins vêm de `jenkins/plugins.txt` e as dependências de cada projeto, de `npm ci` no `Jenkinsfile`. Nada é instalado à mão no container                                                                                                                                                                                                                                       | `grep -n -e "apt-get install" -e nodesource -e "COPY --from=k6" jenkins/Dockerfile`, `jenkins/plugins.txt` e `grep -n "npm ci" Jenkinsfile`                                                                                                              |

### Docker Hub (item 3.2 do PDF)

| #   | Requisito do PDF                                        | Quem implementou | O que foi feito                                                                                                                                      | Como conferir                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | Criar a imagem a partir do Dockerfile da etapa anterior | Juliano          | Imagem construída a partir de `jenkins/Dockerfile` (`docker build ./jenkins`) e executada (job criado por Configuration as Code e build rodado nela) | `jenkins/Dockerfile`. Para reconstruir: `docker build -t s07-np2-jenkins ./jenkins`                                                                                                                                                                                                  |
| C2  | Publicar a imagem no Docker Hub                         | Juliano          | Imagem `julianomaleixo/s07-np2-jenkins` (tag `latest`) publicada no Docker Hub, em repositório público                                               | `git show 0fed1ed` (compose usando a imagem). `curl -s https://hub.docker.com/v2/repositories/julianomaleixo/s07-np2-jenkins/` retorna os dados do repositório (só responde assim se for público), e `docker pull julianomaleixo/s07-np2-jenkins:latest` funciona sem `docker login` |
| C3  | Entregar o link da imagem junto ao repositório          | Todos            | O link está no topo deste README, e o README é entregue junto ao repositório                                                                         | Primeira tabela deste README                                                                                                                                                                                                                                                         |

### Docker Compose (item 3.3 do PDF)

| #   | Requisito do PDF                                               | Quem implementou                                                               | O que foi feito                                                                                                                                                                                                                                                                                                     | Como conferir                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Subir a imagem do Docker Hub e executar o pipeline completo    | Juliano                                                                        | O serviço `jenkins` do `docker-compose.yaml` usa a imagem do Docker Hub (`julianomaleixo/s07-np2-jenkins:latest`) e o pipeline completo rodou com sucesso a partir dela                                                                                                                                             | `grep -n -e "image:" -e "build:" docker-compose.yaml` mostra a origem de cada serviço, e `git show 0fed1ed` mostra a troca de `build:` por `image:`. Em execução: [roteiro de reprodução](#roteiro-de-reprodução)                                                                                    |
| D2  | Mínimo de 4 containers                                         | `jenkins` e `db`: Juliano. `api`: João Victor. `app` e `mailpit`: Eduardo Dias | 5 serviços no `docker-compose.yaml`: `jenkins`, `app`, `api`, `db` (Redis) e `mailpit`                                                                                                                                                                                                                              | `docker compose config --services` lista os cinco                                                                                                                                                                                                                                                    |
| D3  | Comunicação entre pelo menos 2 containers                      | Juliano, João Victor e Eduardo Dias                                            | `app` → `api` pelo nginx (`proxy_pass http://api:3000`), e o healthcheck do `app` passa por esse proxy. `api` → `db` (`REDIS_URL=redis://db:6379`). `jenkins` → `app` (Cypress e k6 em `http://app`), e o `jenkins` só sobe com o `app` saudável (`depends_on` com `service_healthy`). `jenkins` → `mailpit` (SMTP) | `grep -n proxy_pass app/nginx.conf` (`git show cb78a99`), `grep -rn REDIS_URL docker-compose.yaml api/src`, `grep -n CYPRESS_BASE_URL Jenkinsfile`. Em execução: curtir no site e `docker compose exec db redis-cli SCARD likes:devices` mostra a contagem (o clique passou por `app`, `api` e `db`) |
| D4  | Um container por Dockerfile local e outro puxado do Docker Hub | Juliano, João Victor e Eduardo Dias                                            | Dockerfile local: `app/Dockerfile` e `api/Dockerfile`. Docker Hub: `axllent/mailpit` e `redis:7.4-alpine` (e a imagem do Jenkins, ver D1)                                                                                                                                                                           | `grep -n build: docker-compose.yaml` e `grep -n image: docker-compose.yaml`                                                                                                                                                                                                                          |
| D5  | Uso correto de volumes para persistir dados relevantes         | Juliano (`jenkins_home` e `redis_data`) e Eduardo Dias (`mailpit_data`)        | `jenkins_home` (jobs, builds, artefatos e cache do Cypress), `redis_data` (likes, com `appendonly yes`) e `mailpit_data` (e-mails). A persistência dos likes foi testada: ao curtir e reiniciar a `api`, a contagem continua                                                                                        | `docker compose config --volumes` lista os três. Persistência: curtir, `docker compose restart api` e conferir que a contagem continua (comandos no roteiro de reprodução)                                                                                                                           |

### Uso de IA e defesa

| #   | Requisito do PDF                                                                          | Quem implementou | O que foi feito                                                                                                                                                                                                                                                                                                                                                                             | Como conferir                                                        |
| --- | ----------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| E1  | Seção "Uso de IA" no README (modelos, finalidades, dinâmica e o que não foi feito por IA) | Todos            | A [seção 11](#11-uso-de-ia) aponta para o registro no `CLAUDE.md` (seção 9), que traz os modelos usados (Claude Opus 5.5 pelo Claude Code e Claude Sonnet 5.5 pelo claude.ai), os prompts reais com o desfecho de cada um e, na subseção da parte do Eduardo, a dinâmica de uso e o que foi feito à mão. As subseções equivalentes das partes de João Victor e de Juliano ainda não existem | Seção 11 deste README e `grep -n "Registro de uso de IA" CLAUDE.md`  |
| E2  | Pelo menos 3 exemplos reais de prompts, com o que foi aceito, ajustado ou descartado      | Todos            | O registro tem 30 prompts reais, com o texto original e o desfecho de cada um (aceito, ajustado ou descartado)                                                                                                                                                                                                                                                                              | Tabela da seção 9 do `CLAUDE.md` (`grep -n "Prompt real" CLAUDE.md`) |
| F1  | Defesa em formato Q&A (até 20 minutos), com todos respondendo                             | Todos            | A defesa acontece na data definida pelo professor                                                                                                                                                                                                                                                                                                                                           | Não se aplica antes da defesa                                        |

### Roteiro de reprodução

Para conferir em execução (precisa de Docker e Git):

```bash
git clone https://github.com/JulianoAleixo/S07_NP2.git && cd S07_NP2
cp .env.example .env        # preencha JENKINS_ADMIN_PASSWORD, REPO_URL e NOTIFY_EMAIL
docker compose up --build -d
docker compose ps           # aguarde os serviços ficarem "healthy"
docker compose config --services    # os 5 serviços
docker compose config --volumes     # os 3 volumes
```

1. Abra http://localhost:8080, entre com o admin do `.env`, abra o job `s07-np2` e clique em **Build Now**.
2. Ao terminar, a página do build lista os artefatos (pacote `s07-np2-<número>.tar.gz`, relatório do Cypress e cobertura), e o e-mail de notificação aparece em http://localhost:8025.
3. Persistência dos likes (a API não tem porta no host, então a chamada passa pelo nginx do `app`):

```bash
curl -s -X POST http://localhost:4321/api/likes -H "Content-Type: application/json" -d '{"deviceId":"verificacao"}'
docker compose restart api
curl -s "http://localhost:4321/api/likes?deviceId=verificacao"     # deve retornar "liked":true
docker compose exec db redis-cli SCARD likes:devices               # contagem direto no Redis
```

### Mapa dos critérios de avaliação

| Critério do PDF                                                              | Linhas desta seção   |
| ---------------------------------------------------------------------------- | -------------------- |
| 1. Aplicação funcional com testes ≥ 90%                                      | A3, A4               |
| 2. Dockerfile (Jenkins em container, imagem correta e reproduzível)          | B1, B10, C1          |
| 3. Jenkinsfile com as etapas obrigatórias                                    | B4, B5, B6           |
| 4. Artefatos no Jenkins                                                      | B7                   |
| 5. Variável de ambiente para o e-mail                                        | B9                   |
| 6. Docker Hub                                                                | C2, C3               |
| 7. Docker Compose com 4+ containers                                          | D2, D4               |
| 8. Comunicação entre containers                                              | D3                   |
| 9. Volumes                                                                   | D5                   |
| 10. Versionamento e contribuições                                            | A5                   |
| 11. README completo                                                          | A7                   |
| 12. Uso transparente de IA                                                   | E1, E2               |
| 13. Defesa Q&A (todos respondem)                                             | F1                   |
| 14. DevOps geral (coerência entre código, infraestrutura, pipeline e testes) | B3, D1, seções 8 e 9 |

## 3. Funcionalidades

**Portfólio (`app/`)**

- Navegação por seções, com barra no desktop e _dock_ no celular.
- Apresentação com nome, função e carrossel das tecnologias.
- Áreas de atuação em formato de acordeão.
- Projetos em cartões, cada um com os links que possui.
- **Formulário de contato** (nome, e-mail e mensagem) enviado pelo EmailJS, com estados de envio, sucesso e erro.
- **Botão de like** que persiste a contagem pela API: um like por dispositivo, que continua marcado ao recarregar a página. O identificador do dispositivo usa `crypto.randomUUID` e, onde ele não existe (HTTP fora de `localhost`, como `http://app` no pipeline), cai em `crypto.getRandomValues`.
- Layout responsivo e fundos animados (shader com three.js e canvas).

**API de likes (`api/`)**

| Método e rota     | Corpo ou parâmetro                        | Resposta                                 |
| ----------------- | ----------------------------------------- | ---------------------------------------- |
| `GET /api/health` | —                                         | `{ "status": "ok" }`                     |
| `GET /api/likes`  | `?deviceId=<texto de 1 a 100 caracteres>` | `{ "count": n, "liked": true ou false }` |
| `POST /api/likes` | `{ "deviceId": "<texto>" }`               | `{ "count": n, "liked": true }`          |

`deviceId` inválido (ausente, vazio, lista ou com mais de 100 caracteres) retorna `400`. O like é idempotente por dispositivo e não existe "descurtir".

**Infraestrutura**

- Pipeline completo no Jenkins, definido em `Jenkinsfile`.
- Jenkins configurado por código (`jenkins/casc.yaml`).
- Notificação do resultado por e-mail, com anexos.
- Persistência dos likes em volume do Redis.

## 4. Estrutura do repositório

```
api/               API de likes (Express 5 + TypeScript), com Dockerfile e testes (Vitest)
app/               Portfólio (Astro, React, Tailwind), com Dockerfile, nginx.conf e testes (Vitest)
tests/             Testes de interface (Cypress 15 + Cucumber) e de carga (k6)
jenkins/           Dockerfile, plugins.txt e casc.yaml do Jenkins
scripts/notify/    Script de e-mail do pipeline (Node + nodemailer)
Jenkinsfile        Etapas do pipeline
docker-compose.yaml
.env.example       Variáveis do compose (o .env real fica fora do Git)
CLAUDE.md          Contexto do projeto e registro de uso de IA
```

Cada pasta com código tem seu próprio `package.json` (não é monorepo).

## 5. Pré-requisitos

- **Para rodar a stack completa:** Docker com Docker Compose v2 e Git. Nada mais precisa estar instalado.
- **Para desenvolver localmente:** Node.js 22.22.2 ou superior (ou 24). O `jsdom` do app exige essa versão mínima.
- **Opcional:** k6, para rodar os testes de carga fora do Jenkins.

## 6. Instalação e execução

### 6.1 Stack completa com Docker Compose

```bash
git clone https://github.com/JulianoAleixo/S07_NP2.git
cd S07_NP2
cp .env.example .env        # no PowerShell: Copy-Item .env.example .env
# edite o .env conforme a tabela abaixo
docker compose up --build -d
docker compose ps           # aguarde os serviços ficarem "healthy"
```

Endereços:

| Serviço                       | Endereço              |
| ----------------------------- | --------------------- |
| Site (`app`)                  | http://localhost:4321 |
| Jenkins                       | http://localhost:8080 |
| Mailpit (e-mails do pipeline) | http://localhost:8025 |

**Variáveis do `.env`**

| Variável                  | Obrigatória                      | Para quê                                                                                                     |
| ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `JENKINS_ADMIN_PASSWORD`  | Sim (defina sempre)              | Senha do admin do Jenkins. O `casc.yaml` tem um padrão fraco de desenvolvimento quando ela falta             |
| `JENKINS_ADMIN_ID`        | Não (padrão `admin`)             | Usuário admin do Jenkins                                                                                     |
| `REPO_URL`                | Sim                              | URL **pública** do repositório que o Jenkins vai clonar. Só o que foi enviado (push) para a branch é testado |
| `REPO_BRANCH`             | Recomendada (padrão `main`)      | Branch usada pelo job                                                                                        |
| `NOTIFY_EMAIL`            | Sim                              | Destinatário da notificação. Nunca fica no código                                                            |
| `SMTP_FROM`               | Não (padrão `jenkins@localhost`) | Remetente do e-mail                                                                                          |
| `SMTP_HOST` e `SMTP_PORT` | Não (padrão `mailpit` e `1025`)  | Servidor SMTP. Vazios, o e-mail vai para o Mailpit                                                           |
| `SMTP_USER` e `SMTP_PASS` | Só com servidor real             | Autenticação (por exemplo, Gmail). Com o Mailpit, ficam vazias                                               |

Para parar: `docker compose down` (mantém os volumes) ou `docker compose down -v` (apaga os volumes, inclusive os likes e o histórico do Jenkins).

### 6.2 Desenvolvimento local (sem Docker)

```bash
# terminal 1: API (http://localhost:3000, likes em memória sem REDIS_URL)
cd api
npm ci
npm run dev

# terminal 2: site (http://localhost:4321, com proxy de /api para a API)
cd app
npm ci
cp .env.example .env     # valores falsos bastam: o Cypress intercepta o EmailJS
npm run dev
```

Os valores de `PUBLIC_EMAILJS_*` só precisam ser reais para enviar e-mails de verdade pelo formulário de contato. Nos testes, nenhuma chave real é usada.

## 7. Uso

- **Site:** abra http://localhost:4321, navegue pelas seções e clique em curtir. A contagem sobrevive a recarregar a página e a `docker compose restart api`.
- **API pela stack:** a API não tem porta no host, então use o proxy do nginx:
    ```bash
    curl "http://localhost:4321/api/health"
    curl "http://localhost:4321/api/likes?deviceId=teste"
    ```
    No PowerShell: `Invoke-RestMethod "http://localhost:4321/api/likes?deviceId=teste"`.
- **Conferir o Redis:** `docker compose exec db redis-cli SCARD likes:devices` mostra quantos dispositivos já curtiram.
- **Rodar o pipeline:** em http://localhost:8080, entre com o admin do `.env`, abra o job `s07-np2` e clique em **Build Now**. O primeiro build demora mais (`npm ci` e download do Cypress); os seguintes usam o cache do volume `jenkins_home`.
- **Ver o resultado:** na página do build ficam o log, o pacote `s07-np2-<número>.tar.gz`, o relatório HTML do Cypress e as pastas de cobertura (**Artefatos**). O e-mail de notificação chega no Mailpit.

## 8. Testes e cobertura

| Tipo               | Ferramenta                               | Onde                 | Como rodar                                                     |
| ------------------ | ---------------------------------------- | -------------------- | -------------------------------------------------------------- |
| Unitários da API   | Vitest + Supertest                       | `api/tests/`         | `cd api && npm test`                                           |
| Unitários do front | Vitest + Testing Library                 | `app/tests/`         | `cd app && npm test`                                           |
| Interface (E2E)    | Cypress 15 + Cucumber (BDD, Page Object) | `tests/cypress/`     | `cd tests && npm run cy:run`                                   |
| Carga              | k6                                       | `tests/Performance/` | `cd tests && k6 run Performance/scripts/homepage-load.test.ts` |

Os testes unitários da API e do app também geram `reports/junit.xml` (reporter `junit` do Vitest), que o Jenkins publica e arquiva.

Os testes de interface usam `CYPRESS_BASE_URL` (padrão do projeto: o site local). Contra a stack do compose, use `http://localhost:4321`. No PowerShell, defina antes: `$env:CYPRESS_BASE_URL = "http://localhost:4321"`.

**Cenários de interface:** 34 cenários em 5 arquivos (contato, curtidas, navegação, projetos e responsividade). Na execução de 2026-11-10: **30 passando, 0 falhando e 4 com `@skip`**:

- **TC-020** (descurtir): requisito válido que o site não atende (a API não tem a rota e o botão trava após o like). Mantido pulado por decisão do grupo, para não derrubar o pipeline.
- **TC-012, TC-025 e TC-026**: cenários do formulário de contato (funcionalidade de e-mail) do portfólio, mantidos com `@skip`.

### Escopo de cobertura

A meta é de pelo menos 90% em linhas, funções, branches e statements, por projeto. Ela é imposta pelos `thresholds` do `vitest.config.ts`, então a execução falha se a cobertura cair.

**API (`api/`)**

| Arquivo              | Na cobertura? | Motivo                                                                                                                                                        |
| -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app.ts`         | Sim           | Rotas e validação                                                                                                                                             |
| `src/store.ts`       | Sim           | Regras de contagem de likes em memória                                                                                                                        |
| `src/redisStore.ts`  | Sim           | Regras de contagem de likes no Redis (testadas com um cliente Redis falso)                                                                                    |
| `src/createStore.ts` | Sim           | Escolha entre Redis e memória a partir de `REDIS_URL`                                                                                                         |
| `src/server.ts`      | Não           | Só faz o bootstrap: lê `PORT`, abre a conexão com o Redis e chama `listen`. Não tem regra de negócio, e testá-lo exigiria abrir uma porta e uma conexão reais |

**Portfólio (`app/`)**

Todos os arquivos `src/**/*.{ts,tsx}` entram na cobertura, sem exclusões. Os arquivos `.astro` ficam de fora, porque são só marcação, sem lógica.

Alguns branches ficam descobertos porque não dá para chegar neles usando a tela. Não usamos `c8 ignore`, então eles continuam contando contra a porcentagem:

| Arquivo            | Branch descoberto                                             | Motivo                                                                                                    |
| ------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `LikeButton.tsx`   | `if (liked \|\| loading) return` e `prev ?? 0`, `prev ?? 1`   | O botão já fica `disabled` nesses estados, então o clique não dispara                                     |
| `LetterGlitch.tsx` | Canvas ou elemento pai ausentes; letra inexistente no sorteio | Proteções: o canvas sempre existe enquanto o componente está montado, e o índice sorteado é sempre válido |
| `Navbar.tsx`       | `typeof window === "undefined"`                               | Só acontece em renderização no servidor, e o jsdom sempre tem `window`                                    |

**Os testes detectam falhas.** Para checar que não passam por acaso, quebramos o código de propósito e conferimos se os testes falhavam: 19 quebras na API (todas detectadas) e 62 no app (60 detectadas; as 2 restantes não mudam o comportamento observável).

## 9. Pipeline (Jenkinsfile)

| Etapa                        | O que faz                                                                                                                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validar ambiente             | Mostra as versões de `node`, `npm` e `k6`                                                                                                                                                                                                                               |
| Instalar dependências        | `npm ci` em `api`, `app` e `tests`                                                                                                                                                                                                                                      |
| Testes unitários             | `npm test` na API e no app, em paralelo, com cobertura. Falha se um teste falhar ou a cobertura ficar abaixo de 90%                                                                                                                                                     |
| Testes E2E (Cypress)         | Limpa relatórios antigos, espera `http://app/api/health` (até 5 tentativas) e roda `npx cypress run` contra `http://app`                                                                                                                                                |
| Performance (k6)             | Só com o parâmetro `RUN_K6` ligado: roda `homepage-load.test.ts`                                                                                                                                                                                                        |
| Build e empacotamento        | `npm run build` em `api` e `app` e geração de `artifacts/s07-np2-<build>.tar.gz`                                                                                                                                                                                        |
| Pós-execução (`post always`) | Arquiva o pacote, o relatório do Cypress, a cobertura, os relatórios JUnit (`api/reports` e `app/reports`) e o que existir de k6 e screenshots; publica os resultados JUnit; envia o e-mail de notificação (`scripts/notify/send-email.js`), mesmo quando o build falha |

O e-mail leva status, job, número do build, commit e link, e anexa o relatório HTML do Cypress quando existe. O pacote não vai anexado (o Gmail bloqueia arquivos compactados com `.js`): ele fica nos artefatos, e o link do e-mail leva até eles.

## 10. Docker Hub

Imagem publicada (repositório público): https://hub.docker.com/r/julianomaleixo/s07-np2-jenkins (tag `latest`).

```bash
docker pull julianomaleixo/s07-np2-jenkins:latest
```

A imagem traz o Jenkins LTS (JDK 21), Node 22, as bibliotecas do Cypress, o k6 e os plugins. **Não traz** o código do projeto (o Jenkins clona o repositório), senhas (vêm do ambiente) nem o binário do Cypress (baixado pelo `npm ci` no pipeline e guardado no volume `jenkins_home`).

Para reconstruir e publicar uma nova versão da imagem:

```bash
docker build -t julianomaleixo/s07-np2-jenkins:latest ./jenkins
docker push julianomaleixo/s07-np2-jenkins:latest
```

O compose já aponta para essa imagem. Depois de publicar, rode `docker compose pull jenkins` e `docker compose up -d`.

## 11. Uso de IA

O uso de IA está declarado no `CLAUDE.md`, na raiz do repositório:

- **Seção 9, "Registro de uso de IA":** os modelos utilizados (Claude Opus 5.5 pelo Claude Code e Claude Sonnet 5.5 pelo claude.ai), uma tabela com os prompts reais, no texto original, o uso de cada um e o desfecho (aceito, ajustado ou descartado), e a subseção sobre a dinâmica e o que foi feito à mão na parte do Eduardo.
- **Seção 1, "Regras inegociáveis":** como o grupo trabalha com a IA (por exemplo, a IA nunca faz commit nem push e não declara sucesso sem rodar).

Para conferir: `grep -n "Registro de uso de IA" CLAUDE.md`.

## 12. Limitações conhecidas

- **O E2E testa a stack do compose, não o checkout do Jenkins.** O Cypress roda contra os containers `app` e `api` construídos na máquina de quem subiu o compose, enquanto os testes unitários e o build usam o código clonado pelo Jenkins. É um trade-off de não usar Docker dentro do Jenkins.
- **O Jenkins só testa o que foi enviado ao GitHub**, porque faz checkout do repositório público.
- **Quatro cenários do Cypress estão com `@skip`** (veja a seção 8).
- **Versões parcialmente fixadas:** o `plugins.txt` fixa a versão dos plugins diretos, e as dependências deles são resolvidas na construção da imagem. A base `jenkins/jenkins:lts-jdk21` e o Node instalado pelo NodeSource (versão maior 22) não têm tag exata. O compose usa a tag `latest` da imagem publicada, então republicar a imagem muda o ambiente do pipeline.
- **Senha padrão do Jenkins:** sem `JENKINS_ADMIN_PASSWORD`, o `casc.yaml` cai em um valor de desenvolvimento. Como a imagem é pública, sempre defina a senha.
- **Vulnerabilidades no `npm audit` do app** (23 no último levantamento). `npm audit fix` ainda não foi executado; decisão pendente.
- **A rota de reset dos likes (`ENABLE_TEST_RESET`) não existe.** Os testes não dependem dela: cada teste usa um `deviceId` novo e confere valores relativos.

## 13. Solução de problemas

| Sintoma                                                     | Causa provável e solução                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Could not resolve host: app` no E2E do Jenkins             | A stack não está de pé. Rode `docker compose ps` e confira se `app` e `api` estão `healthy`                        |
| O Cypress trava ou fecha dentro do container                | Falta memória compartilhada: mantenha `shm_size: "2gb"` no serviço `jenkins`                                       |
| Porta ocupada (8080, 4321 ou 8025)                          | Troque o lado esquerdo do mapeamento em `ports:` no `docker-compose.yaml`                                          |
| `CYPRESS_BASE_URL=... npm run cy:run` dá erro no PowerShell | Essa sintaxe é do bash. No PowerShell: `$env:CYPRESS_BASE_URL = "http://localhost:4321"` e depois `npm run cy:run` |
| O primeiro build do Jenkins demora vários minutos           | Normal: `npm ci` nos três projetos e download do Cypress. Os próximos usam o cache do volume `jenkins_home`        |
| Os likes e o histórico do Jenkins sumiram                   | `docker compose down -v` apaga os volumes. Use `docker compose down` para manter os dados                          |
| O build não vê as mudanças que você fez                     | O Jenkins clona o repositório público: confirme que deu `push` na branch de `REPO_BRANCH`                          |
