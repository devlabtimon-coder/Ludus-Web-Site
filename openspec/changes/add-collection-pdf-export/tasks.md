# Tasks

## 1. Geração do relatório

- [x] 1.1 Implementar `generateCollectionPDF` e `openReportWindow` em `src/services/pdf.service.ts` com escape de texto e indicadores calculados da lista; verificar com `vite build` sem erros
- [ ] 1.2 Conferir na tela que um título com `<b>` aparece literal no relatório e que a impressão sai em A4 paisagem com o cabeçalho da tabela repetido

## 2. Pontos de entrada no painel

- [x] 2.1 Adicionar o botão "Exportar PDF (n)" em `GamesCatalogTable.tsx`, desativado com lista vazia; verificar com `vite build`
- [x] 2.2 Ligar o botão "Exportar" de `CollectionStats.tsx` a `GET /games` com estado "Gerando..." e avisos de erro e de pop-up bloqueado; verificar com `vite build`
- [ ] 2.3 Testar na tela: exportar com filtro no Acervo, exportar o acervo completo em Relatórios e bloquear pop-ups para ver o aviso

## Workflow follow-up

- Arquivar a change (`openspec archive add-collection-pdf-export`) depois do merge.
