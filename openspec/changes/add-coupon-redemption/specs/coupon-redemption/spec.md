## Purpose

Permitir que a equipe da biblioteca confira o código de brinde que o aluno mostra no app e registre a entrega uma única vez.

## ADDED Requirements

### Requirement: Buscar brinde pelo código
A página Brindes SHALL aceitar um código digitado ou colado, MUST convertê-lo para maiúsculas e remover espaços antes de consultar `GET /admin/coupons?code=`, e SHALL mostrar aluno (nome, e-mail, matrícula), temporada, tipo e descrição do brinde, situação (Ativo, Usado ou Expirado) e validade ("Válido até dd/mm/aaaa" ou "Válido até o fim da próxima temporada" quando não há data).

#### Scenario: Código colado com espaços e minúsculas
- **WHEN** o admin cola " nvl3-s2-ab12cd " e clica em "Buscar"
- **THEN** a consulta leva `code=NVL3-S2-AB12CD`

#### Scenario: Código inexistente
- **WHEN** a API responde 404
- **THEN** a página mostra que nenhum brinde foi encontrado com esse código

### Requirement: Dar baixa no brinde
Para brinde Ativo, a página SHALL oferecer "Dar baixa", que MUST pedir confirmação nomeando o aluno e o brinde antes de chamar `PATCH /admin/coupons/:code/redeem`. Depois do sucesso SHALL mostrar "Entregue em dd/mm às hh:mm" no fuso de São Paulo. Brindes Usados ou Expirados MUST NOT oferecer a baixa.

#### Scenario: Baixa confirmada
- **WHEN** o admin confirma a baixa de um brinde ativo
- **THEN** a situação passa a Usado e aparece "Entregue em" com dia e hora

#### Scenario: Brinde já entregue
- **WHEN** a API responde 409 `COUPON_ALREADY_USED`
- **THEN** o diálogo mostra que o brinde já foi entregue e a situação na tela passa a Usado

#### Scenario: Brinde expirado
- **WHEN** a API responde 409 `COUPON_EXPIRED`
- **THEN** o diálogo mostra que o código expirou e a situação na tela passa a Expirado

### Requirement: Histórico de cupons com situação real
A aba Histórico de Cupons das temporadas SHALL mostrar o tipo da recompensa (Brinde ou desconto) com a descrição, a validade e a situação Ativo, Usado (com a data da baixa quando informada) ou Expirado, aceitando tanto `status` em minúsculas (`ativo`, `utilizado`, `expirado`) quanto em maiúsculas (`ATIVO`, `USADO`, `EXPIRADO`).

#### Scenario: Cupom utilizado no formato atual
- **WHEN** a lista traz um cupom com `status: "utilizado"`
- **THEN** a linha mostra a situação "Usado"

#### Scenario: Cupom sem validade
- **WHEN** a lista traz um cupom com `expiresAt: null`
- **THEN** a coluna Validade mostra "Fim da próxima temporada"
