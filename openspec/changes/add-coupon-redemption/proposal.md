# Proposal

## Why

As regras de produto mudaram: alugar é gratuito e os cupons de temporada são brindes que o aluno troca na biblioteca, uma única vez, até o fim da próxima temporada. O painel não tinha onde conferir um código e dar baixa na entrega, o histórico de cupons mostrava sempre "Vale-Brinde / Item Físico", jogos novos entravam sempre como Bronze e o preço ainda aparecia como cobrança por dia.

## What Changes

- Nova página **Brindes** (`/brindes`, no menu ao lado de Temporadas): o admin digita ou cola o código (maiúsculas, sem espaços), vê aluno (nome, e-mail, matrícula), temporada, brinde, situação e validade, e dá baixa com confirmação. Erros 404, `COUPON_ALREADY_USED` e `COUPON_EXPIRED` viram mensagens claras; depois da baixa aparece "Entregue em dd/mm às hh:mm".
- Aba **Histórico de Cupons** das temporadas mostra o tipo real da recompensa com a descrição, a validade e a situação Ativo / Usado (com a data) / Expirado, aceitando o formato atual da lista e o novo.
- **Adicionar jogo** exige escolher a categoria (Latão, Bronze, Prata, Ouro, Diamante) e envia `tier` na criação.
- O preço vira **"Valor de referência (interno)"** na edição e na tabela do acervo (continua editável); a prévia do app não mostra mais "R$ X / dia".

## Capabilities

### New Capabilities
- `coupon-redemption`: conferência e baixa de brindes pelo código, e histórico de cupons com situação real.
- `game-catalog-rules`: categoria obrigatória ao cadastrar jogo e preço tratado como valor interno.

### Modified Capabilities

## Impact

- Código: novo `services/couponsService.ts` e `pages/BrindesPage.tsx`; `App.tsx`, `Sidebar`, `SeasonsTabs` (aba de histórico), `AddGameModal`, `EditGameModal`, `GamesCatalogTable`, `GamePreviewModal` e o novo `collection/tiers.ts`.
- API: depende do backend com `GET /admin/coupons?code=`, `PATCH /admin/coupons/:code/redeem` (erros 404, 409 `COUPON_ALREADY_USED` e `COUPON_EXPIRED`) e `tier` aceito em `POST /games`. Enquanto `POST /games` exigir `price`, o painel continua mandando o valor de referência padrão (3).
