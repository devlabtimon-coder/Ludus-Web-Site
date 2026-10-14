# Design

## Context

O protótipo (`SobreAppPage`) guardava tudo em estado local e simulava o salvamento. O painel atual usa react-router, `Sidebar`/`Header` próprios e lucide.

## Goals / Non-Goals

**Goals:**
- Editar o documento inteiro e publicá-lo de uma vez, com a mensagem de validação do backend.

**Non-Goals:**
- Arrastar para reordenar (substituído por setas, acessíveis por teclado).
- Upload de logo e edição do número da versão (vem do app instalado).

## Decisions

- **Estado local + comparação com a última publicação.** Botão de publicar só ativo com mudanças; "Descartar" restaura o JSON publicado; `beforeunload` avisa ao sair com mudanças.
- **Validação no backend.** O painel limita tamanhos com `maxLength` e mostra em toast a mensagem do campo devolvida pela API, sem duplicar o schema.
- **Pré-visualização espelhando o app.** Mesma ordem de seções, cores e regras de visibilidade da tela do app, com a logo do dado.

## Risks / Trade-offs

- [Conteúdo público] → aviso fixo na aba de integrações para não colocar credenciais.
