# Proposal

## Why

O painel é a ferramenta diária da equipe da biblioteca, e vários problemas atrapalhavam a operação: as listas só mostravam os 50 primeiros registros (cadastros pendentes, empréstimos, usuários e os números do dashboard), não havia busca, falhas da API apareciam como lista vazia ("Nenhum cadastro pendente 🎉"), ações destrutivas não pediam confirmação ou usavam `window.confirm`/`prompt`, o ✓ rápido aprovava cadastro sem documentos, o checklist de devolução travava, cada recarga desmontava a tela e os modais, um login de aluno deixava sessão salva, as datas de temporada saíam com um dia de diferença e a auditoria mostrava desbloqueio como "Bloqueio".

## What Changes

- Listas filtradas e paginadas no servidor: fila de cadastros com `registrationStatus=PENDING` e "Carregar mais"; empréstimos com `status`, `overdue`, `q` e paginação; usuários com `q` e paginação; números do dashboard pelo `total` de consultas filtradas (`limit=1`).
- Busca com debounce de 300 ms em Empréstimos e Usuários.
- Sessão só para `ADMIN`: o papel é conferido antes de salvar token e usuário, e a rota protegida exige usuário `ADMIN` salvo. Sai o `getCurrentUser` que chamava `/auth/me`.
- `ConfirmDialog` reutilizável (AlertDialog do shadcn) com motivo opcional, usado em todas as ações destrutivas no lugar de `window.confirm`/`prompt`; `alert()` vira toast.
- Bloquear usuário exige motivo (enviado como `reason`) e o `blockReason` aparece na linha e nos detalhes.
- Aprovar cadastro (✓ do cartão e painel) exige os documentos obrigatórios e confirmação com o nome da pessoa.
- Carregando, erro com "Tentar novamente" e vazio separados na fila de cadastros, auditoria e temporadas.
- Checklist de devolução zera ao abrir, não trava sem jogo, e só fecha depois que a API confirma.
- Carregando de tela cheia só na primeira carga; recargas mantêm os dados e os modais na tela.
- Datas de temporada enviadas como `AAAA-MM-DD`, pré-preenchidas e exibidas no fuso de São Paulo, com validação fim >= início.
- Auditoria com mapa exato código → rótulo, novos códigos do backend e fallback legível.
- Remoção de botões que não faziam nada; o ⋮ dos empréstimos recentes abre Empréstimos filtrado pelo aluno.
- Higiene: `node_modules` e `.env` fora do índice, `.env.example`, sem IP fixo de reserva na API, mocks sem uso apagados.

## Capabilities

### New Capabilities
- `admin-lists`: listas e números do painel vindos de consultas filtradas e paginadas, com busca, carregando, erro e vazio distintos.
- `admin-session`: acesso ao painel restrito a sessões de administrador.
- `admin-confirmations`: confirmação de ações destrutivas, motivo de bloqueio, aprovação de cadastro e checklist de devolução.
- `season-dates`: datas de temporada como dias do calendário de São Paulo.
- `audit-log`: rótulos da auditoria por código exato.

### Modified Capabilities

## Impact

- Código: serviços (`rentalsService`, `usersService`, `dashboardService`, `authService`, `api`), hooks (`useRentals`, `useUsers`, `useDashboard`, `useGames`, `useMechanics`), páginas de Empréstimos, Usuários, Cadastro, Dashboard, Auditoria, Temporadas, Acervo e Mecânicas, e o novo `ConfirmDialog`.
- API: depende do backend com `q`, `registrationStatus` e `blocked` em `GET /admin/users`, `reason` obrigatório ao bloquear (`PATCH /admin/users/:id/block`) com `blockReason` na listagem, datas de temporada `AAAA-MM-DD` interpretadas em São Paulo e os novos códigos de auditoria. Os filtros de `GET /admin/rentals` já existem.
- Repositório: `node_modules` e `.env` deixam de ser versionados; quem clonar precisa criar o `.env` a partir do `.env.example`.
