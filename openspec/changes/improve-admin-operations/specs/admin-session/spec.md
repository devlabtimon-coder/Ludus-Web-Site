## Purpose

Garantir que só administradores fiquem com sessão no painel.

## ADDED Requirements

### Requirement: Login só salva sessão de administrador
O painel MUST conferir o papel do usuário devolvido pelo login (e-mail ou Google) antes de salvar token e usuário, e SHALL descartar qualquer sessão de outro papel.

#### Scenario: Aluno tenta entrar
- **WHEN** um usuário com papel `USER` faz login com credenciais válidas
- **THEN** a tela mostra "Acesso restrito" e nada fica salvo no armazenamento local

### Requirement: Rota protegida exige administrador
A rota protegida MUST exigir token e usuário salvo com papel `ADMIN`; caso contrário SHALL limpar o armazenamento e redirecionar para `/login`.

#### Scenario: Token sem usuário administrador
- **WHEN** existe token salvo mas o usuário salvo não é `ADMIN`
- **THEN** o painel limpa token e usuário e abre `/login`
