## Purpose

Permitir que a gestão edite e publique, pelo painel administrativo, o conteúdo da tela "Sobre o Ludus" do aplicativo.

## ADDED Requirements

### Requirement: Página de edição no painel
O painel SHALL oferecer a página "Sobre o App", acessível pelo menu lateral, carregando o conteúdo atual com as abas identidade, funcionalidades, propósito, responsáveis, versão e integrações.

#### Scenario: Abrir a página
- **WHEN** o admin clica em "Sobre o App" no menu
- **THEN** a página abre com o conteúdo publicado e a data da última publicação

#### Scenario: Falha ao carregar
- **WHEN** a API não responde
- **THEN** a página mostra uma mensagem de erro com a opção de tentar de novo

### Requirement: Editar listas
O admin SHALL poder adicionar, remover, reordenar e ocultar sem apagar as funcionalidades, os integrantes da equipe e as integrações, e adicionar, remover e reordenar as entradas do histórico de versões.

#### Scenario: Ocultar uma funcionalidade
- **WHEN** o admin oculta uma funcionalidade e publica
- **THEN** ela continua na lista do painel e deixa de aparecer no app

### Requirement: Publicar alterações
"Salvar e publicar" SHALL enviar o conteúdo ao backend e confirmar a publicação; o botão MUST ficar desativado quando não houver alterações.

#### Scenario: Publicação aceita
- **WHEN** o admin edita o texto de apresentação e publica
- **THEN** aparece "Página Sobre publicada. O app já mostra a nova versão." e o botão passa a "Publicado"

#### Scenario: Publicação recusada
- **WHEN** o admin apaga o nome do aplicativo e publica
- **THEN** aparece a mensagem "Nome do aplicativo é obrigatório." e nada é publicado

### Requirement: Descartar e aviso de alterações
O painel SHALL indicar alterações não publicadas, permitir descartá-las voltando à última publicação e avisar ao fechar a página com alterações pendentes.

#### Scenario: Descartar
- **WHEN** o admin altera campos e clica em "Descartar"
- **THEN** os campos voltam ao conteúdo publicado

### Requirement: Pré-visualização do app
O painel SHALL mostrar uma pré-visualização do celular que reflete cada edição com as mesmas regras de visibilidade do app.

#### Scenario: Edição refletida
- **WHEN** o admin adiciona um chip institucional
- **THEN** o chip aparece na pré-visualização antes de publicar
