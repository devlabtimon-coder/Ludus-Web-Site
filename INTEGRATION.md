# Integração Frontend Ludus com Backend

## ✅ Integração Completa com a API

A integração com o backend Ludus está completa! Todos os serviços e hooks foram ajustados para corresponder exatamente às rotas e tipos de dados da API.

## 📋 Estrutura da Integração

### Services (src/services/)
- **api.ts** - Configuração do Axios com interceptors
- **authService.ts** - Autenticação e login
- **dashboardService.ts** - Dados agregados do dashboard
- **gamesService.ts** - CRUD de jogos
- **rentalsService.ts** - Gestão de aluguéis
- **usersService.ts** - Gestão de usuários

### Hooks (src/hooks/)
- **useDashboard** - Dashboard com métricas calculadas
- **useGames** - Jogos com filtros
- **useRentals** - Aluguéis com status
- **useUsers** - Usuários e categorias

### Types (src/types/)
- **api.ts** - Tipos baseados no schema Prisma do backend

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
# URL da API - Local
VITE_API_URL=http://localhost:3000

# Para Railway (quando deployado)
# VITE_API_URL=https://seu-backend.up.railway.app
```

### 2. Backend Local

O backend deve estar rodando na porta **3000**. Certifique-se de que o backend está configurado e rodando:

```bash
cd ../ludus-backend
npm install
npm run dev
```

### 3. Frontend

```bash
# Instalar dependências (se ainda não instalou)
pnpm install

# Rodar o projeto
# O dev server já está rodando automaticamente no Figma Make
```

## 📡 Endpoints da API

### Autenticação
- `POST /auth/login` - Login
- `GET /auth/me` - Usuário atual

### Jogos
- `GET /games` - Listar jogos (com filtros)
- `GET /games/:id` - Buscar jogo específico
- `POST /games` - Criar jogo (admin)
- `PUT /games/:id` - Atualizar jogo (admin)
- `DELETE /games/:id` - Deletar jogo (admin)

### Aluguéis
- `GET /admin/rentals` - Listar aluguéis (admin)
- `PATCH /admin/rentals/:id/status` - Atualizar status (admin)
- `GET /rentals` - Meus aluguéis (usuário)
- `POST /rentals` - Criar aluguel (usuário)

### Usuários
- `GET /users` - Listar usuários
- `GET /users/profile` - Meu perfil
- `PATCH /users/profile` - Atualizar perfil

## 🎨 Mapeamento de Dados

### Status de Aluguel (RentalStatus)
- **PENDING** → Pendente de aprovação
- **ACTIVE** → Em andamento
- **RETURNED** → Devolvido
- **CANCELED** → Cancelado

### Categoria de Cliente (ClientCategory)
- **STARTER** → Iniciante
- **FAMILY** → Família
- **EXPERT** → Expert
- **ULTRAGAMER** → VIP Ultragamer

### Tier de Jogo (GameTier)
- **LATAO** → Latão
- **BRONZE** → Bronze
- **PRATA** → Prata
- **OURO** → Ouro
- **DIAMANTE** → Diamante

## 🔐 Autenticação

O sistema usa JWT Bearer Token:

1. Login via `/auth/login` retorna `token` e `user`
2. Token é salvo no `localStorage`
3. Interceptor adiciona automaticamente em todas as requisições
4. Se 401: redireciona para login
5. Se 403: verifica se email/telefone precisa verificação

## 📊 Métricas Calculadas

Como o backend não possui endpoints de métricas prontos, o frontend calcula as métricas baseado nos dados:

### Dashboard
- **Total de Jogos** - Contagem de todos os jogos
- **Aluguéis Ativos** - Filtro por status PENDING + ACTIVE
- **Aprovações Pendentes** - Filtro por status PENDING
- **Usuários Ativos** - Usuários com email e telefone verificados

### Acervo
- **Total de Títulos** - Contagem total
- **Disponíveis** - Jogos com `available: true` e `isActive: true`
- **Alugados** - Jogos com `available: false`
- **Manutenção** - Jogos com `isActive: false`

### Empréstimos
- **Ativos** - Status ACTIVE
- **Em Atraso** - PENDING/ACTIVE com data de devolução vencida
- **Pendentes** - Status PENDING
- **Devolvidos (Mês)** - Status RETURNED no mês atual

### Usuários
- **Total de Membros** - Todos os usuários
- **VIPs Ultragamer** - Categoria ULTRAGAMER
- **Novos Cadastros** - Criados nos últimos 7 dias

## 🚀 Deploy para Railway

Quando o backend for deployado no Railway:

1. Atualize o `.env`:
```env
VITE_API_URL=https://seu-backend.up.railway.app
```

2. Rebuild o frontend

## ⚠️ Notas Importantes

1. **CORS** - Certifique-se de que o backend permite CORS para o frontend
2. **Autenticação** - Login é necessário para a maioria das rotas
3. **Admin** - Algumas rotas requerem role de admin
4. **Arquivos Mock** - Os arquivos em `src/app/data/` agora são desnecessários e podem ser removidos

## 🐛 Debug

Se houver erros de conexão:

1. Verifique se o backend está rodando (`http://localhost:3000/health`)
2. Confira a variável `VITE_API_URL` no `.env`
3. Abra o DevTools e veja a aba Network para detalhes dos erros
4. Verifique logs do console para mensagens de erro da API
