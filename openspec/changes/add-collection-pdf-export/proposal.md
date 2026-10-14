# Proposal

## Why

A gestão do acervo não tinha como tirar uma lista impressa ou em PDF dos jogos: o botão "Exportar" da tela de Relatórios não fazia nada e o Acervo não tinha exportação. Conferências de inventário e prestações de contas ao IFMA dependiam de copiar dados à mão.

## What Changes

- Novo relatório "Catálogo e Inventário do Acervo", aberto numa janela de impressão para salvar como PDF, com totais do acervo e uma linha por jogo (tier, jogadores, exemplares livres/total, aluguéis, nota, preço e status).
- Botão "Exportar PDF" na tabela do Acervo, que exporta exatamente a lista filtrada na tela.
- O botão "Exportar" do card "Uso do Acervo" em Relatórios passa a exportar o acervo inteiro.
- Aviso ao usuário quando o navegador bloqueia a janela do relatório ou quando a busca dos jogos falha.

## Capabilities

### New Capabilities
- `collection-report`: exportação do catálogo e inventário do acervo para impressão/PDF a partir do painel admin.

### Modified Capabilities

## Impact

- Código: `src/services/pdf.service.ts`, `src/app/components/collection/GamesCatalogTable.tsx`, `src/app/components/reports/CollectionStats.tsx`.
- API: usa `GET /games` já existente (com token de admin, inclui jogos ocultos); nenhuma mudança de contrato.
- Dependências: nenhuma nova; a impressão usa o diálogo do navegador.
