# StarForgers

Jogo incremental (estilo *Cookie Clicker*) feito em **React + Vite + Bootstrap**.
Você minera cristais clicando em um planeta, compra frotas que mineram sozinhas, coloniza novos planetas (cada um com
sua própria frota e melhorias) e pode renascer em um **Novo Universo** com bônus permanente.

> Projeto da faculdade: Sprint 1 (Pré-Projeto), Sprint 2 (Mini Aplicativo React) e, futuramente, Sprint 3 (Sistema Integrado).

## Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a versão de produção em /dist
```

Requer Node.js 18 ou superior.

## Funcionalidades

- **Pilotos (jogadores):** cadastro com nome e emblema, listagem, troca e exclusão. Cada piloto tem o próprio progresso.
- **Jogo:** escolha o planeta ativo, clique nele para minerar e acompanhe produção, estatísticas e a frota do planeta.
- **Loja:** cada planeta tem 3 geradores automáticos (custo crescente) e 2 melhorias de clique próprias.
- **Galáxia:** 6 planetas para colonizar com cristais. Quanto mais distante o planeta, maior o rendimento.
- **Ranking:** pilotos ordenados pelo total coletado.
- **Novo Universo (prestígio):** reinicia a colônia em troca de matéria escura (+10% em tudo por ponto).
- **Ganho offline:** ao voltar, a colônia entrega o que produziu enquanto você estava fora (máximo de 8 horas).
- **Autosave:** o progresso é salvo a cada 5 s, após cada compra e ao fechar a aba.

## Modo desenvolvedor

Serve para testar o jogo sem esperar. Para ligar ou desligar, **digite `devmode`** em qualquer página (fora de campos
de texto). Aparece um botão **DEV** no canto da tela com atalhos: adicionar cristais, avançar o tempo, colonizar todos
os planetas, encher a frota, comprar melhorias, ganhar matéria escura e zerar o progresso.

Os comandos ficam em `src/utils/devTools.js` e o painel em `src/components/DevPanel.jsx`.

## Mapa dos critérios da avaliação

| Critério | Onde está |
|---|---|
| Vite + componentes + navegação entre páginas | `src/App.jsx` (React Router), `src/components/`, `src/pages/` |
| Componentes, estados e eventos | `ClickButton`, `PlanetPicker`, `UpgradeCard`, `GameContext` (useReducer, useState, useEffect) |
| Formulários e estado controlado | `src/components/PlayerForm.jsx` |
| Armazenamento local (localStorage) | `src/services/playerService.js` |
| Listagem e renderização dinâmica | `Home` (pilotos), `Shop`, `Galaxy`, `Ranking` (todos com `.map()`) |
| Estilo e usabilidade | Bootstrap 5 (tema escuro), Bootstrap Icons e `src/index.css` |

## Estrutura

```
src/
├── components/   # peças reutilizáveis (NavBar, ClickButton, PlanetOrb, PlanetPicker, UpgradeCard, DevPanel...)
├── context/      # GameContext: estado global do jogo, loop, autosave
├── data/         # gameData.js: planetas, frotas e melhorias (balanceamento)
├── pages/        # Home, Game, Shop, Galaxy, Ranking
├── services/     # playerService.js: camada de dados (localStorage hoje, API na Sprint 3)
└── utils/        # gameLogic.js (regras puras), devTools.js (modo dev) e format.js
```

## Decisões técnicas

- **Reducer para o jogo:** todas as mudanças (clique, tick, compra, colonização, prestígio) passam por um único `gameReducer`.
- **Regras puras separadas:** `gameLogic.js` não depende do React, então é simples de testar e explicar.
- **Planetas gerados a partir de um molde:** `gameData.js` define a frota e as melhorias uma vez e multiplica pela escala
  de cada planeta, então equilibrar o jogo é mexer em poucos números.
- **Planetas desenhados em CSS:** a aparência de cada planeta é um gradiente (`PlanetOrb`), sem imagens.
- **Saves versionados:** `migrateGameState` converte saves antigos para o formato atual.
- **Camada de serviço assíncrona:** as funções de `playerService.js` já retornam Promises e seguem o formato de um
  CRUD (create, read, update, delete). Na Sprint 3, basta trocar o corpo delas por `fetch()` para uma API REST.
- **Loop com tempo real:** o tick usa a diferença entre horários, então o jogo não "atrasa" com a aba em segundo plano.

## Próximos passos (Sprint 3)

- Trocar o localStorage por uma API RESTful (CRUD de jogadores) e tornar o ranking global.

## Autor

Gabriel
