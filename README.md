# S07 NP2

Portfólio em Astro + React + TypeScript com API própria de likes.

> README em construção. As seções de instalação, execução, uso, funcionalidades e "Uso de IA" serão adicionadas ao longo do projeto.

## Escopo de cobertura

A meta é de pelo menos 90% em linhas, funções, branches e statements, por projeto. Ela é imposta pelos `thresholds` do `vitest.config.ts`, então a execução falha se a cobertura cair.

### API (`api/`)

Rode `npm test` dentro de `api/`.

| Arquivo | Na cobertura? | Motivo |
|---|---|---|
| `src/app.ts` | Sim | Rotas e validação |
| `src/store.ts` | Sim | Regras de contagem de likes |
| `src/server.ts` | Não | Só faz o bootstrap: lê `PORT`, cria o store e chama `listen`. Não tem regra de negócio, e testá-lo exigiria abrir uma porta real ou simular o `listen` |
