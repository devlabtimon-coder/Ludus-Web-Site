# Tasks

## 1. Listas no servidor

- [x] 1.1 Serviços com `page`, `limit`, `q`, `status`, `overdue`, `registrationStatus`, `blocked` e contagem por `total` (`limit=1`)
- [x] 1.2 Fila de cadastros com `registrationStatus=PENDING` e "Carregar mais"
- [x] 1.3 Empréstimos com filtros, busca (debounce 300 ms) e paginação no servidor
- [x] 1.4 Usuários com busca (debounce 300 ms) e paginação no servidor
- [x] 1.5 Números do dashboard pelo `total` das consultas filtradas

## 2. Sessão

- [x] 2.1 Conferir o papel antes de salvar a sessão no login (e-mail e Google)
- [x] 2.2 Rota protegida exige usuário `ADMIN` salvo; senão limpa e volta ao login
- [x] 2.3 Remover `getCurrentUser` (`/auth/me`)

## 3. Confirmações

- [x] 3.1 `ConfirmDialog` com motivo opcional, que mostra o erro da API sem fechar
- [x] 3.2 Trocar `window.confirm`/`prompt` e `alert()` em todas as telas
- [x] 3.3 Confirmar rejeição de retirada e exclusão de componente
- [x] 3.4 Motivo obrigatório ao bloquear usuário e exibição do `blockReason`
- [x] 3.5 ✓ do cartão de cadastro com a regra de documentos e confirmação com o nome
- [x] 3.6 Checklist de devolução que zera, não trava e só fecha após a API confirmar

## 4. Estados de tela

- [x] 4.1 Carregando, erro e vazio separados em Cadastro, Auditoria e Temporadas
- [x] 4.2 Carregando de tela cheia só na primeira carga (empréstimos, usuários, dashboard, acervo, mecânicas)

## 5. Temporadas e auditoria

- [x] 5.1 Datas `AAAA-MM-DD`, pré-preenchimento e exibição no fuso de São Paulo, validação fim >= início
- [x] 5.2 Mapa exato de códigos da auditoria, novos códigos e fallback legível; busca pelo rótulo

## 6. Limpeza

- [x] 6.1 Remover botões sem ação; ⋮ dos recentes abre Empréstimos filtrado
- [x] 6.2 Tirar `node_modules` e `.env` do índice e criar `.env.example`
- [x] 6.3 Remover o IP fixo de reserva da API e os mocks sem uso
- [x] 6.4 `npm run build` sem erros

## Workflow follow-up

- Testar no ambiente de homologação depois do deploy do backend com os novos filtros e o motivo de bloqueio.
- Arquivar a change depois do merge.
