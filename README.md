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

### Portfólio (`app/`)

Rode `npm test` dentro de `app/`. Todos os arquivos `src/**/*.{ts,tsx}` entram na cobertura, sem exclusões. Os arquivos `.astro` ficam de fora, porque são só marcação, sem lógica.

Alguns branches ficam descobertos porque não dá para chegar neles usando a tela. Não usamos `c8 ignore`, então eles continuam contando contra a porcentagem:

| Arquivo | Branch descoberto | Motivo |
|---|---|---|
| `LikeButton.tsx` | `if (liked \|\| loading) return` e `prev ?? 0`, `prev ?? 1` | O botão já fica `disabled` nesses estados, então o clique não dispara |
| `LetterGlitch.tsx` | Canvas ou elemento pai ausentes; letra inexistente no sorteio | Proteções: o canvas sempre existe enquanto o componente está montado, e o índice sorteado é sempre válido |
| `Navbar.tsx` | `typeof window === "undefined"` | Só acontece em renderização no servidor, e o jsdom sempre tem `window` |
