# Colônia Espacial

Jogo incremental (estilo *Cookie Clicker*) feito em **React + Vite + Bootstrap**.
Você minera cristais clicando em um planeta, compra frotas que mineram sozinhas, coloniza novos planetas (cada um com
sua própria frota e melhorias) e pode renascer em um **Novo Universo** com bônus permanente.

> Projeto da faculdade: Sprint 1 (Pré-Projeto), Sprint 2 (Mini Aplicativo React) e Sprint 3 (Sistema Integrado, com API própria).

## Como rodar

O projeto tem duas partes: o **front-end** (React, nesta pasta) e a **API** (pasta [`server/`](server/README.md)).
Rode as duas, cada uma em um terminal.

```bash
# 1) API (precisa de um MongoDB: veja server/README.md)
cd server
npm install
cp .env.example .env
npm run dev          # http://localhost:3000  (Swagger em /api-docs)

# 2) Front-end (na pasta raiz)
npm install
npm run dev          # http://localhost:5173
```

Se a API estiver em outro endereço, copie `.env.example` para `.env` na raiz e ajuste `VITE_API_URL`.
Para gerar a versão de produção do front: `npm run build`. Requer Node.js 20.19 ou superior.

## Funcionalidades

- **Pilotos (jogadores):** CRUD completo pela API: criar, listar, editar (nome e emblema) e excluir. Cada piloto tem o próprio progresso, guardado no MongoDB.
- **Jogo:** escolha o planeta ativo, clique nele para minerar e acompanhe produção, estatísticas e a frota do planeta.
- **Loja:** cada planeta tem 3 geradores automáticos (custo crescente) e 2 melhorias de clique próprias.
- **Galáxia:** 6 planetas para colonizar com cristais. Quanto mais distante o planeta, maior o rendimento.
- **Ranking global:** todos os pilotos do servidor, ordenados pelo total coletado.
- **Novo Universo (prestígio):** reinicia a colônia em troca de matéria escura (+10% em tudo por ponto).
- **Ganho offline:** ao voltar, a colônia entrega o que produziu enquanto você estava fora (máximo de 8 horas).
- **Autosave:** o progresso é enviado à API a cada 5 s, após cada compra e ao fechar a aba.
- **Falhas da API na tela:** um aviso vermelho aparece quando algo falha (servidor fora do ar, nome repetido, tempo esgotado), e as telas oferecem "Tentar de novo".

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
| Consumo da API REST com CRUD completo | `src/services/apiClient.js` e `src/services/playerService.js` |
| Erros da API na tela | `src/context/ErrorContext.jsx`, `src/components/ErrorBanner.jsx`, `RequirePlayer.jsx` |
| API, banco, testes, ESLint e Swagger | pasta `server/` (veja `server/README.md`) |
| Listagem e renderização dinâmica | `Home` (pilotos), `Shop`, `Galaxy`, `Ranking` (todos com `.map()`) |
| Estilo e usabilidade | Bootstrap 5 (tema escuro), Bootstrap Icons e `src/index.css` |

## Estrutura

```
src/
├── components/   # peças reutilizáveis (NavBar, ClickButton, PlanetOrb, PlanetPicker, UpgradeCard, DevPanel...)
├── context/      # GameContext: estado global do jogo, loop, autosave
├── data/         # gameData.js: planetas, frotas e melhorias (balanceamento)
├── pages/        # Home, Game, Shop, Galaxy, Ranking
├── services/     # apiClient.js (fetch, erros, tempo limite) e playerService.js (CRUD na API)
└── utils/        # gameLogic.js (regras puras), devTools.js (modo dev) e format.js
```

## Decisões técnicas

- **Reducer para o jogo:** todas as mudanças (clique, tick, compra, colonização, prestígio) passam por um único `gameReducer`.
- **Regras puras separadas:** `gameLogic.js` não depende do React, então é simples de testar e explicar.
- **Planetas gerados a partir de um molde:** `gameData.js` define a frota e as melhorias uma vez e multiplica pela escala
  de cada planeta, então equilibrar o jogo é mexer em poucos números.
- **Planetas desenhados em CSS:** a aparência de cada planeta é um gradiente (`PlanetOrb`), sem imagens.
- **Saves versionados:** `migrateGameState` converte saves antigos para o formato atual.
- **Camada de serviço:** `playerService.js` expõe o CRUD (create, read, update, delete) e é o único arquivo que conhece
  as rotas da API. Na Sprint 3 só o corpo dessas funções mudou (de localStorage para `fetch()`); as páginas continuaram iguais.
- **Erros em um só lugar:** `apiClient.js` traduz qualquer falha (rede, tempo esgotado, resposta de erro) em uma mensagem
  legível, e o `ErrorContext` a mostra na tela.
- **Salvamento sem corrida:** o autosave envia um pedido por vez; se chegar outro durante o envio, ele roda logo depois.
- **Loop com tempo real:** o tick usa a diferença entre horários, então o jogo não "atrasa" com a aba em segundo plano.

## Próximos passos

- Login de jogadores (hoje qualquer cliente pode editar qualquer piloto).

## Autor

Gabriel
