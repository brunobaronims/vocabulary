# Vocabulary

Aplicação que permite praticar vocabulário em inglês, com gerenciamento de sessão e acompanhamento de progresso.

## Como rodar

Antes de rodar qualquer serviço, renomeie cada `.env.example` para `.env`. Os `.env` em `back` e `front` são necessários apenas para rodar os apps localmente, para facilitar mudanças no código.

### Local 

- Inicie uma instância do Postgres de sua maneira preferida (`docker compose up postgres -d`).

## Backend
- `npm run start:dev`

## Frontend
- `npm run dev`

### Container 

- Use `docker-compose up -d --build` na raiz do projeto para subir todos os serviços em container.


- Para acessar no navegador, navegue para http://localhost:{FRONTEND_PORT}, de acordo com a porta definida no .env.
- O usuário padrão é `admin`, com senha `admin`.
