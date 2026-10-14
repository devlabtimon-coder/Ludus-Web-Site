# Proposal

## Why

O conteúdo da tela "Sobre o Ludus" do app só muda com uma nova versão do aplicativo. O protótipo do painel ("Gerenciar página Sobre") prevê que a gestão edite esse conteúdo direto pelo painel.

## What Changes

- Nova página "Sobre o App" (`/sobre-app`) no menu lateral, com as abas do protótipo: identidade e descrição, o que o app oferece, propósito, responsáveis, versão e atualizações, APIs e integrações.
- Itens de lista podem ser adicionados, removidos, reordenados (setas) e ocultados sem apagar.
- Pré-visualização do celular atualizada a cada edição (fixa ao lado em telas largas, em janela nas menores).
- "Salvar e publicar" envia ao backend; "Descartar" volta à última versão publicada; aviso de alterações não publicadas e ao sair da página.

## Capabilities

### New Capabilities
- `about-page-editor`: edição e publicação, pelo painel, do conteúdo da tela Sobre do app.

### Modified Capabilities

## Impact

- Código: `src/app/pages/AboutPage.tsx`, `src/services/aboutService.ts`, rota em `App.tsx`, item no `Sidebar.tsx`.
- API: depende de `GET /about/admin` e `PUT /about` (Ludus-Backend-IFMA, change `add-editable-about-page`).
