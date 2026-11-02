## Purpose

Tratar as datas de temporada como dias do calendário de São Paulo, sem deslocamento de fuso.

## ADDED Requirements

### Requirement: Datas de temporada no fuso de São Paulo
Ao criar ou editar uma temporada, o painel MUST enviar início e fim como `AAAA-MM-DD`, SHALL pré-preencher a edição convertendo as datas salvas para o dia de São Paulo e SHALL exibir as datas das listas no fuso de São Paulo.

#### Scenario: Editar temporada que termina em 31/12
- **WHEN** a temporada salva termina em 31/12 às 23:59:59 de São Paulo
- **THEN** o campo de encerramento mostra 31/12, não 01/01

#### Scenario: Salvar temporada
- **WHEN** o admin escolhe de 01/02 a 30/06 e salva
- **THEN** a requisição leva `dataInicio: "AAAA-02-01"` e `dataFim: "AAAA-06-30"`

### Requirement: Fim não anterior ao início
O formulário MUST impedir salvar quando a data de encerramento é anterior à de início, mostrando o erro junto ao campo.

#### Scenario: Datas invertidas
- **WHEN** o encerramento é anterior ao início
- **THEN** aparece a mensagem de erro no campo e o botão de salvar fica desabilitado
