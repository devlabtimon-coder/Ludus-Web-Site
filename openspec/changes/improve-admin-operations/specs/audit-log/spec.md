## Purpose

Mostrar cada ação da auditoria com o rótulo certo.

## ADDED Requirements

### Requirement: Rótulo por código exato
A auditoria MUST escolher rótulo e cor pelo código exato da ação (inclusive os de temporada, jogo, exemplar, componente e mecânica) e SHALL mostrar códigos desconhecidos como texto legível. A busca SHALL considerar também o rótulo.

#### Scenario: Desbloqueio
- **WHEN** o log tem a ação `UNBLOCK_USER`
- **THEN** o rótulo é "Desbloqueio de Usuário"

#### Scenario: Código novo
- **WHEN** o log tem uma ação sem rótulo cadastrado, como `ARCHIVE_SEASON`
- **THEN** o rótulo é "Archive season"

#### Scenario: Busca pelo rótulo
- **WHEN** o admin busca "desbloqueio"
- **THEN** os logs `UNBLOCK_USER` aparecem
