## Purpose

Permitir que a gestão exporte o catálogo e o inventário do acervo de jogos para impressão ou PDF direto do painel administrativo.

## ADDED Requirements

### Requirement: Relatório de catálogo e inventário do acervo
O painel SHALL gerar um relatório do acervo com cabeçalho Ludus, data e hora de emissão, indicadores de totais (títulos, exemplares, títulos disponíveis, alugados e em manutenção) e uma linha por jogo com tier, jogadores, exemplares livres/total, aluguéis, nota, preço e status, aberto para impressão ou salvamento em PDF.

#### Scenario: Gerar o relatório com jogos
- **WHEN** o admin exporta uma lista com jogos
- **THEN** abre o relatório com uma linha por jogo, os indicadores calculados a partir dessa lista e o diálogo de impressão do navegador

#### Scenario: Jogo inativo aparece em manutenção
- **WHEN** a lista exportada contém um jogo inativo
- **THEN** o jogo aparece com status "Manutenção" e entra no total "Em Manutenção"

### Requirement: Exportar a lista filtrada do Acervo
A tela Acervo SHALL oferecer o botão "Exportar PDF", com a quantidade de jogos, que exporta exatamente os jogos exibidos na tabela com os filtros aplicados.

#### Scenario: Exportar com filtro aplicado
- **WHEN** o admin filtra o catálogo e clica em "Exportar PDF"
- **THEN** o relatório lista apenas os jogos visíveis na tabela

#### Scenario: Lista vazia
- **WHEN** nenhum jogo corresponde aos filtros
- **THEN** o botão "Exportar PDF" fica desativado

### Requirement: Exportar o acervo completo em Relatórios
O botão "Exportar" do card "Uso do Acervo" SHALL buscar todos os jogos do acervo, incluindo os ocultos, e gerar o mesmo relatório.

#### Scenario: Exportação completa
- **WHEN** o admin clica em "Exportar" no card "Uso do Acervo"
- **THEN** o botão mostra "Gerando..." e o relatório abre com todos os jogos do acervo

#### Scenario: Falha ao buscar os jogos
- **WHEN** a busca dos jogos falha
- **THEN** a janela do relatório fecha e a tela mostra uma mensagem de erro

### Requirement: Aviso de janela bloqueada
O painel MUST avisar o admin quando o navegador bloquear a janela do relatório, orientando a liberar pop-ups para o site.

#### Scenario: Pop-up bloqueado
- **WHEN** o navegador bloqueia a abertura da janela do relatório
- **THEN** a tela mostra um aviso pedindo para permitir pop-ups e tentar de novo

### Requirement: Texto da API exibido como texto
O relatório MUST exibir títulos e mecânicas vindos da API como texto literal, sem interpretar HTML ou script contido neles.

#### Scenario: Título com marcação HTML
- **WHEN** um jogo tem título contendo marcação HTML ou script
- **THEN** o relatório mostra os caracteres literalmente e nenhum script é executado
