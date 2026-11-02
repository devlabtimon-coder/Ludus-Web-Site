## Purpose

Mostrar à equipe todos os registros e números corretos, consultando a API com filtros e paginação em vez de filtrar uma página de 50 itens no navegador.

## ADDED Requirements

### Requirement: Fila de cadastros pendentes
A tela de cadastro pendente SHALL pedir à API apenas usuários com `registrationStatus=PENDING`, mostrar o total da fila vindo da resposta e oferecer "Carregar mais" enquanto houver mais itens que os carregados.

#### Scenario: Fila maior que uma página
- **WHEN** existem 70 cadastros pendentes e a página tem 50
- **THEN** a tela mostra 70 como total, lista 50 e oferece "Carregar mais (50 de 70)"

#### Scenario: Usuário pendente antigo
- **WHEN** o cadastro pendente mais antigo foi criado antes de outros 200 usuários
- **THEN** ele aparece no início da fila

### Requirement: Empréstimos filtrados no servidor
A tela de empréstimos MUST enviar o filtro de situação (`status` ou `overdue=true`), a busca `q` e a página à API, e SHALL mostrar controles de paginação com o total devolvido.

#### Scenario: Filtro de atraso
- **WHEN** o admin escolhe "Atrasado"
- **THEN** a requisição leva `overdue=true` e a lista mostra todos os atrasados, página a página

#### Scenario: Busca por aluno
- **WHEN** o admin digita "maria" na busca e para de digitar por 300 ms
- **THEN** a requisição leva `q=maria` e a lista volta para a página 1

### Requirement: Usuários com busca no servidor
A tela de usuários MUST enviar a busca `q` (nome, e-mail, matrícula ou telefone) e a página à API, com debounce de 300 ms e controles de paginação.

#### Scenario: Busca por matrícula
- **WHEN** o admin digita uma matrícula
- **THEN** a lista mostra os usuários devolvidos pela API para esse `q`

### Requirement: Números do dashboard
Os cartões do dashboard MUST usar o `total` de consultas filtradas (ex.: `status=ACTIVE&limit=1`, `registrationStatus=PENDING&limit=1`), nunca a contagem de uma página.

#### Scenario: Mais de 50 aluguéis ativos
- **WHEN** existem 80 aluguéis ativos
- **THEN** o cartão "Aluguéis Ativos" mostra 80

### Requirement: Estados de carregando, erro e vazio
As telas SHALL distinguir carregando, erro e lista vazia: falha da API MUST mostrar a mensagem de erro com "Tentar novamente", e o estado vazio só aparece quando a API respondeu com sucesso sem itens.

#### Scenario: API fora do ar na fila de cadastros
- **WHEN** a requisição da fila falha
- **THEN** a tela mostra o erro e "Tentar novamente", e não "Nenhum cadastro pendente no momento"

#### Scenario: Recarga depois de uma ação
- **WHEN** a lista já carregou e o admin conclui uma ação que recarrega os dados
- **THEN** a lista e os modais abertos continuam na tela enquanto a nova resposta chega
