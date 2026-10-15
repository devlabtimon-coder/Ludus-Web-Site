## Purpose

Permitir ao admin conferir e corrigir o vínculo do jogo com o BoardGameGeek, usado para o preço de mercado do ComparaJogos.

## ADDED Requirements

### Requirement: Campo de id do BoardGameGeek
O modal de edição do jogo SHALL mostrar o id do jogo no BoardGameGeek, aceitar só dígitos e, com id preenchido, oferecer links para o jogo no BGG e para a busca do título no ComparaJogos.

#### Scenario: Jogo já vinculado
- **WHEN** o admin abre a edição de um jogo com `bggId` 13
- **THEN** o campo mostra 13 e os links "Ver no BGG" e "Ver no ComparaJogos"

#### Scenario: Jogo sem vínculo
- **WHEN** o jogo não tem `bggId`
- **THEN** o campo fica vazio e os links não aparecem

### Requirement: Salvar o vínculo
Ao salvar, o painel MUST enviar `bggId` em `PATCH /games/:id` apenas quando o valor mudou, como número inteiro positivo ou `null` quando o campo foi esvaziado.

#### Scenario: Correção do id
- **WHEN** o admin troca o id de 230802 para 230803 e salva
- **THEN** a requisição leva `bggId: 230803`

#### Scenario: Sem mudança
- **WHEN** o admin salva sem mexer no id
- **THEN** a requisição não leva `bggId`

#### Scenario: Campo esvaziado
- **WHEN** o admin apaga o id e salva
- **THEN** a requisição leva `bggId: null`
