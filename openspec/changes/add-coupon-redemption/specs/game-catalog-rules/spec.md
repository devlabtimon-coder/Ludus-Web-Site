## Purpose

Cadastrar jogos já na categoria certa e não apresentar preço como cobrança, já que o aluguel é gratuito.

## ADDED Requirements

### Requirement: Categoria obrigatória ao adicionar jogo
O modal de adicionar jogo MUST exigir a escolha de uma categoria (Latão, Bronze, Prata, Ouro ou Diamante, com os mesmos rótulos e cores da edição) antes de liberar "Adicionar", e SHALL enviar `tier` em `POST /games`.

#### Scenario: Sem categoria escolhida
- **WHEN** o admin abre o modal e ainda não escolheu a categoria
- **THEN** os botões "Adicionar" ficam desabilitados

#### Scenario: Jogo adicionado como Ouro
- **WHEN** o admin escolhe Ouro e adiciona um jogo
- **THEN** a requisição leva `tier: "OURO"`

### Requirement: Preço como valor de referência interno
O painel SHALL rotular o preço do jogo como "Valor de referência (interno)" na edição e na tabela do acervo, mantendo-o editável, e a prévia do app MUST NOT mostrar preço por dia.

#### Scenario: Prévia do app
- **WHEN** o admin abre a prévia de um jogo
- **THEN** a barra inferior não mostra "R$ X / dia"
