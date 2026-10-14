# Design

## Context

O painel já gera o relatório gerencial com pdfmake (download direto). O relatório do acervo foi pedido no layout HTML da identidade Ludus (cabeçalho em gradiente, cartões de indicadores e selos de tier), que o navegador imprime com fidelidade.

## Goals / Non-Goals

**Goals:**
- Relatório do acervo fiel ao layout HTML, sem dependência nova.
- Exportar a lista filtrada (Acervo) ou completa (Relatórios).

**Non-Goals:**
- Gerar o arquivo PDF no servidor ou salvar o arquivo sem diálogo de impressão.
- Migrar o relatório gerencial existente de pdfmake para HTML.

## Decisions

- **Janela de impressão em vez de pdfmake.** O HTML reproduz o layout pedido (gradientes, grid, selos) sem reescrever tudo em definição pdfmake. Alternativa: pdfmake com download direto; descartada pelo custo de recriar o layout e perder fidelidade visual.
- **Escapar todo texto vindo da API.** A janela aberta com `window.open('')` herda a origem do painel; título ou mecânica com HTML (ex.: dados importados da Ludopedia) executaria script com a sessão do admin. Título e mecânicas passam por escape antes de entrar no HTML.
- **Abrir a janela no clique.** Navegadores bloqueiam pop-ups abertos depois de um `await`. Em Relatórios, a janela abre no clique com "Gerando relatório…" e recebe o conteúdo quando `GET /games` responde; se a busca falhar, a janela fecha.
- **Indicadores calculados da própria lista.** Títulos disponíveis, alugados e em manutenção e o total de exemplares saem dos jogos listados, para os cartões baterem com a tabela.

## Risks / Trade-offs

- [Pop-up bloqueado pelo navegador] → a função retorna falso e a tela mostra aviso pedindo para liberar pop-ups.
- [Saída depende do diálogo de impressão do navegador] → `@page` em A4 paisagem, cabeçalho da tabela repetido por página e cores forçadas na impressão.
