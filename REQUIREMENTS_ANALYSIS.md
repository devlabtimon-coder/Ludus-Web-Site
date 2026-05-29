# Análise de Requisitos Funcionais - Sistema Ludus

## ✅ Status de Implementação

### [RF009] Manter Acervo
**Status: ✅ IMPLEMENTADO (Backend) | ⚠️ PARCIAL (Frontend)**

#### Backend (/games):
- ✅ GET `/games` - Listar jogos com filtros
- ✅ GET `/games/:id` - Buscar jogo específico
- ✅ POST `/games` - Cadastrar jogo (admin)
- ✅ PUT `/games/:id` - Editar jogo (admin)
- ✅ DELETE `/games/:id` - Deletar/Inativar jogo (admin)
- ✅ PATCH `/categories/games/:id/tier` - Classificar por tier (Latão, Bronze, Prata, Ouro, Diamante)

#### Frontend:
- ✅ Tela de Acervo Digital existe
- ✅ Visualização de jogos com categorias
- ❌ Formulário de cadastro de jogo
- ❌ Formulário de edição de jogo
- ❌ Botão de inativar jogo funcional
- ❌ Integração com API (ainda usa dados mock)

---

### [RF010] Gerenciar Empréstimos
**Status: ✅ IMPLEMENTADO (Backend) | ⚠️ PARCIAL (Frontend)**

#### Backend (/admin/rentals):
- ✅ GET `/admin/rentals` - Listar aluguéis com filtros (status, busca, atrasados)
- ✅ PATCH `/admin/rentals/:id/status` - Alterar status (PENDING → ACTIVE, ACTIVE → RETURNED, etc.)
- ✅ Controle de prazo de devolução (3 dias padrão)
- ✅ Liberação automática de cópia ao devolver
- ✅ Sistema de pontos ao devolver

#### Frontend:
- ✅ Tela de Empréstimos existe
- ✅ Visualização de aluguéis com status
- ❌ Botão "Aprovar" funcional (mudar PENDING → ACTIVE)
- ❌ Botão "Devolver" funcional (mudar ACTIVE → RETURNED)
- ❌ Botão "Notificar" usuário em atraso
- ❌ Integração com API (ainda usa dados mock)

**Observação**: Backend não possui renovação explícita nem sistema de penalidades por atraso. Seria necessário implementar.

---

### [RF011] Gerenciar Usuários
**Status: ⚠️ PARCIAL (Backend) | ❌ NÃO IMPLEMENTADO (Frontend)**

#### Backend (/categories/users):
- ✅ GET `/categories/users` - Listar usuários com filtros
- ✅ PATCH `/categories/users/:id/category` - Alterar categoria de cliente (admin)
- ❌ Aprovar cadastros pendentes
- ❌ Rejeitar cadastros pendentes
- ❌ Bloquear/Desbloquear usuários

#### Frontend:
- ✅ Tela de Gestão de Usuários existe
- ✅ Visualização de usuários com categorias
- ❌ Interface de aprovação/rejeição de cadastros
- ❌ Botão de alterar categoria funcional
- ❌ Botão de bloquear usuário
- ❌ Integração com API (ainda usa dados mock)

**Necessário Implementar**:
1. Endpoint para aprovar cadastro pendente: `POST /admin/users/:id/approve`
2. Endpoint para rejeitar cadastro: `POST /admin/users/:id/reject`
3. Endpoint para bloquear usuário: `PATCH /admin/users/:id/block`
4. Campo `blocked` ou `status` no modelo User

---

### [RF012] Gerar Relatórios
**Status: ⚠️ PARCIAL (Backend e Frontend)**

#### Backend:
- ❌ Endpoint específico para relatórios
- ⚠️ Dados disponíveis mas precisam ser agregados:
  - GET `/games` + `/admin/rentals` = Jogos mais alugados (calculado no frontend)
  - GET `/admin/rentals` = Evolução de empréstimos
  - GET `/categories/users` = Indicadores de engajamento

#### Frontend:
- ✅ Dashboard com gráfico "Jogos Mais Alugados" (mock)
- ✅ Cards de métricas (mock)
- ❌ Tela dedicada de Relatórios
- ❌ Exportação de relatórios (PDF, Excel)
- ❌ Filtros por período
- ❌ Gráficos de evolução temporal

**Recomendação**: Criar tela de Relatórios e endpoints dedicados:
- `GET /reports/top-games?startDate&endDate`
- `GET /reports/rentals-evolution?startDate&endDate`
- `GET /reports/engagement?startDate&endDate`

---

### [RF021] Aprovar/Rejeitar Cadastro
**Status: ❌ NÃO IMPLEMENTADO (Backend e Frontend)**

#### Backend:
- ✅ Modelo `PendingRegistration` existe no Prisma
- ✅ Criação de pending registration em `/auth/register`
- ❌ Endpoint para listar cadastros pendentes
- ❌ Endpoint para aprovar (converter PendingRegistration → User)
- ❌ Endpoint para rejeitar com motivo

#### Frontend:
- ✅ Card "Aprovações Pendentes" no Dashboard (mock)
- ❌ Tela dedicada "Cadastro Pendente"
- ❌ Visualização de documentos enviados
- ❌ Botões de aprovar/rejeitar funcionais
- ❌ Campo para motivo de rejeição

**Necessário Implementar**:
1. `GET /admin/pending-registrations` - Listar cadastros pendentes
2. `POST /admin/pending-registrations/:id/approve` - Aprovar e criar User
3. `POST /admin/pending-registrations/:id/reject` - Rejeitar com motivo
4. Adicionar campos no PendingRegistration: `reviewedAt`, `reviewedBy`, `rejectionReason`

---

## 📊 Resumo Geral

| Requisito | Backend | Frontend | Prioridade |
|-----------|---------|----------|------------|
| RF009 - Manter Acervo | ✅ 90% | ⚠️ 50% | Alta |
| RF010 - Gerenciar Empréstimos | ✅ 85% | ⚠️ 50% | Alta |
| RF011 - Gerenciar Usuários | ⚠️ 40% | ❌ 30% | Crítica |
| RF012 - Gerar Relatórios | ⚠️ 30% | ⚠️ 40% | Média |
| RF021 - Aprovar/Rejeitar Cadastro | ❌ 20% | ❌ 20% | Crítica |

---

## 🚨 Funcionalidades Críticas Faltantes

### 1. Sistema de Aprovação de Cadastros (RF021)
**Prioridade: CRÍTICA**
- [ ] Criar rotas de admin para pending registrations
- [ ] Implementar tela de análise de cadastros
- [ ] Adicionar fluxo de aprovação/rejeição

### 2. Bloqueio de Usuários (RF011)
**Prioridade: CRÍTICA**
- [ ] Adicionar campo `blocked` ou enum `status` no User
- [ ] Criar endpoint PATCH `/admin/users/:id/block`
- [ ] Implementar middleware para bloquear acesso de usuários bloqueados
- [ ] Adicionar botão de bloquear na interface

### 3. Sistema de Penalidades por Atraso (RF010)
**Prioridade: ALTA**
- [ ] Definir regras de penalidade (bloqueio temporário, multa, etc.)
- [ ] Implementar cálculo de dias de atraso
- [ ] Criar sistema de notificações automáticas
- [ ] Adicionar indicador de penalidade no perfil do usuário

### 4. Renovação de Empréstimos (RF010)
**Prioridade: MÉDIA**
- [ ] Criar endpoint PATCH `/rentals/:id/renew`
- [ ] Definir regras de renovação (quantas vezes, prazo)
- [ ] Implementar na interface de empréstimos

### 5. Tela de Relatórios Completa (RF012)
**Prioridade: MÉDIA**
- [ ] Criar página dedicada de Relatórios
- [ ] Implementar endpoints de agregação
- [ ] Adicionar gráficos de evolução temporal
- [ ] Implementar exportação (PDF/Excel)

---

## 🔧 Recomendações de Implementação

### Fase 1: Funcionalidades Críticas (1-2 semanas)
1. Implementar sistema de aprovação/rejeição de cadastros
2. Adicionar funcionalidade de bloqueio de usuários
3. Conectar frontend com API (substituir mocks por hooks)

### Fase 2: Funcionalidades de Gestão (1 semana)
4. Implementar formulários de cadastro/edição de jogos
5. Tornar botões de ação funcionais (aprovar, devolver, notificar)
6. Implementar sistema de penalidades por atraso

### Fase 3: Relatórios e Otimizações (1 semana)
7. Criar tela completa de Relatórios
8. Implementar exportação de dados
9. Adicionar renovação de empréstimos
10. Melhorias de UX e performance

---

## 📝 Notas Técnicas

### Estrutura Atual do Backend:
```
/auth          - Autenticação (login, register, verify)
/games         - CRUD de jogos (com filtros)
/admin/rentals - Gestão de aluguéis (admin)
/rentals       - Aluguéis do usuário
/categories    - Gestão de categorias (users e games)
/users         - Perfil do usuário
```

### Rotas a Criar:
```
POST   /admin/pending-registrations
GET    /admin/pending-registrations
POST   /admin/pending-registrations/:id/approve
POST   /admin/pending-registrations/:id/reject
PATCH  /admin/users/:id/block
PATCH  /admin/users/:id/unblock
GET    /reports/top-games
GET    /reports/rentals-evolution
GET    /reports/engagement
PATCH  /rentals/:id/renew
```

### Hooks do Frontend a Atualizar:
- `useDashboard` - Já criado, precisa ser integrado
- `useGames` - Já criado, precisa ser integrado
- `useRentals` - Já criado, precisa ser integrado
- `useUsers` - Já criado, precisa ser integrado
- `usePendingRegistrations` - **Criar**
- `useReports` - **Criar**
