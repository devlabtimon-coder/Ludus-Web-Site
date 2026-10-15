# Proposal

## Why

O preço de mercado dos jogos no app passou a vir do ComparaJogos, achado pelo id do jogo no BoardGameGeek. O backend preenche esse id sozinho pela busca no BGG, mas ela às vezes erra (ex.: Azul ligado ao "Azul Mini"). O admin precisa ver e corrigir o vínculo.

## What Changes

- Campo "ID no BoardGameGeek" no modal de edição do jogo, com links para conferir o jogo no BGG e buscar no ComparaJogos.
- Ao salvar, o id é enviado em `PATCH /games/:id` (`bggId`) só quando mudou; vazio envia `null`.
- `Game` ganha `bggId` no tipo da API.

## Capabilities

### New Capabilities
- `game-bgg-link`: ver e corrigir o vínculo do jogo com o BoardGameGeek no painel.

### Modified Capabilities

## Impact

- Código: `EditGameModal.tsx`, `src/types/api.ts`.
- API: depende do backend com `bggId` em `PATCH /games/:id` (change `switch-market-price-to-comparajogos` no Backend-Ludus).
