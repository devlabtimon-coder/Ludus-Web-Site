## Purpose

Evitar ações destrutivas ou irreversíveis por engano e deixar claro quando uma ação falhou.

## ADDED Requirements

### Requirement: Diálogo de confirmação
Ações destrutivas (excluir jogo, exemplar, componente, mecânica e temporada; bloquear e desbloquear usuário; rejeitar retirada; rejeitar cadastro; resolver manutenção) SHALL pedir confirmação num diálogo próprio do painel, nunca em `window.confirm` ou `window.prompt`. O diálogo MUST ficar aberto enquanto a ação roda e, se a API falhar, mostrar o erro e permitir tentar de novo.

#### Scenario: Excluir componente
- **WHEN** o admin clica na lixeira de um componente
- **THEN** o diálogo pede confirmação com o nome do componente antes de chamar a API

#### Scenario: Falha na exclusão
- **WHEN** a API recusa a exclusão de um exemplar com histórico
- **THEN** o diálogo continua aberto mostrando a mensagem de erro

### Requirement: Motivo obrigatório ao bloquear
Bloquear usuário MUST exigir um motivo (botão de confirmar desabilitado enquanto vazio) e enviá-lo como `reason` em `PATCH /admin/users/:id/block`; desbloquear não pede motivo. O `blockReason` devolvido pela API SHALL aparecer na linha e nos detalhes do usuário bloqueado.

#### Scenario: Bloqueio sem motivo
- **WHEN** o admin abre o bloqueio e não escreve o motivo
- **THEN** o botão "Bloquear" fica desabilitado

#### Scenario: Bloqueio com motivo
- **WHEN** o admin escreve o motivo e confirma
- **THEN** a requisição leva `{ isBlocked: true, reason }`

### Requirement: Aprovação de cadastro com documentos
Aprovar cadastro, pelo ✓ do cartão ou pelo painel de detalhes, MUST exigir todos os documentos obrigatórios do modo (IFMA ou geral) e SHALL pedir confirmação nomeando a pessoa.

#### Scenario: Cadastro sem documento
- **WHEN** falta um documento obrigatório
- **THEN** o ✓ do cartão fica desabilitado

#### Scenario: Cadastro completo
- **WHEN** o admin clica no ✓ de um cadastro completo
- **THEN** o diálogo pergunta se aprova o cadastro daquela pessoa antes de chamar a API

### Requirement: Checklist de devolução
O checklist de devolução MUST começar do zero a cada empréstimo aberto, não pode ficar carregando quando o jogo não existe mais, e SHALL fechar só depois que a API confirmar a devolução; se falhar, mostra o erro no próprio modal e reabilita o botão.

#### Scenario: Falha ao devolver
- **WHEN** a API responde erro ao registrar a devolução
- **THEN** o modal continua aberto com a mensagem de erro e o botão de confirmar habilitado
