# Colônia Espacial: API

API RESTful em **Node.js + Express + MongoDB (Mongoose)** que guarda os pilotos (jogadores) e o progresso do jogo.
Faz parte da Sprint 3 do projeto.

## Como rodar

Requisitos: **Node.js 20.19 ou superior** e um **MongoDB** (local ou no Atlas).

```bash
cd server
npm install
cp .env.example .env     # ajuste MONGODB_URI se necessário
npm run dev              # API em http://localhost:3000
```

Documentação interativa (Swagger): **http://localhost:3000/api-docs**

### Opções para ter um MongoDB

- **MongoDB Atlas (grátis, sem instalar nada):** crie um cluster gratuito em mongodb.com/atlas, libere seu IP em
  *Network Access*, crie um usuário em *Database Access* e copie a string de conexão (`mongodb+srv://...`) para
  `MONGODB_URI` no `.env`.
- **Docker:** `docker run -d -p 27017:27017 --name mongo mongo:7` e use `mongodb://127.0.0.1:27017/colonia-espacial`.
- **Instalado na máquina:** baixe o MongoDB Community em mongodb.com/try/download/community.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Inicia a API |
| `npm run dev` | Inicia a API reiniciando a cada alteração |
| `npm run lint` | Análise estática com **ESLint** |
| `npm test` | Roda os testes com **Jest** |
| `npm run test:coverage` | Testes + relatório de cobertura (texto no terminal e HTML em `coverage/lcov-report/index.html`) |

O Jest está configurado com **limite mínimo de 80%** de cobertura (statements, branches, functions e lines): se cair
abaixo disso, `npm run test:coverage` falha.

## Endpoints

Base: `/api`

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | `/players` | Lista pilotos (`page`, `limit`, `sort`, `order`). Use `sort=lifetimeEarned&order=desc` para o ranking | 200 |
| POST | `/players` | Cria um piloto | 201 |
| GET | `/players/:id` | Consulta um piloto | 200 |
| PUT | `/players/:id` | Substitui `name`, `emblem` e `game` | 200 |
| PATCH | `/players/:id` | Altera só os campos enviados (usado pelo autosave do jogo) | 200 |
| DELETE | `/players/:id` | Remove um piloto | 204 |
| GET | `/health` | Estado da API e do banco | 200 / 503 |

### Erros

Todos os erros seguem o mesmo formato:

```json
{ "error": { "status": 400, "message": "Dados inválidos.", "details": [{ "field": "name", "message": "..." }] } }
```

| Status | Quando |
|---|---|
| 400 | Dados inválidos, id mal formado, JSON malformado |
| 404 | Piloto ou rota inexistente |
| 409 | Já existe um piloto com esse nome (ignora maiúsculas e acentos) |
| 413 | Corpo da requisição grande demais (limite de 100 kb) |
| 503 | Banco de dados indisponível |
| 500 | Erro inesperado (a mensagem real vai só para o log, nunca para o cliente) |

## Arquitetura

```
src/
├── config/        # variáveis de ambiente e conexão com o MongoDB
├── controllers/   # camada HTTP (req/res), sem regra de negócio
├── docs/          # especificação OpenAPI usada pelo Swagger
├── middlewares/   # tratamento central de erros e rota não encontrada
├── models/        # schema do Mongoose (Player)
├── repositories/  # única camada que fala com o banco
├── routes/        # mapa das rotas
├── services/      # regras de negócio
├── utils/         # classes de erro
├── validators/    # validação dos dados de entrada
├── app.js         # monta o Express (sem ligar servidor nem banco)
└── server.js      # ponto de partida: conecta ao banco e escuta a porta
tests/             # espelha a estrutura de src/
```

Fluxo de uma requisição: **rota → controller → serviço (valida) → repositório → MongoDB**. Qualquer erro cai no
`errorHandler`, que converte em uma resposta JSON padronizada.

## Decisões técnicas

- **MongoDB (NoSQL):** o progresso do jogo é um documento aninhado, que se encaixa naturalmente em um banco de
  documentos e permite evoluir o jogo sem migrações.
- **Camadas separadas:** o repositório isola o Mongoose, então os testes unitários rodam sem banco.
- **Validação própria nos pontos de entrada:** `validators/` confere o formato antes de qualquer acesso ao banco.
- **Nome único com índice de collation:** garante unicidade mesmo sob requisições simultâneas.
- **Express 5:** erros de funções assíncronas vão sozinhos para o middleware de erros.

## Limitações conhecidas

- Não há autenticação: qualquer cliente pode editar ou apagar qualquer piloto. Para o projeto acadêmico é
  suficiente; em produção seria preciso login e permissões.
- O servidor confia no progresso enviado pelo jogo (só valida o formato), então um cliente adulterado poderia
  inflar o ranking.
