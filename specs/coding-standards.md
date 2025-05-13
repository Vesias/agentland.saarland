# Coding-Standards

## Allgemeine Prinzipien
- DRY (Don't Repeat Yourself): Wiederholungen vermeiden
- KISS (Keep It Simple, Stupid): Einfachheit bevorzugen
- YAGNI (You Aren't Gonna Need It): Keine spekulativen Features
- Single Responsibility: Funktionen und Klassen sollten einen Zweck erfüllen
- Open/Closed Principle: Offen für Erweiterung, geschlossen für Modifikation

## JavaScript/TypeScript Standards
- ESLint mit AirBnB Styleguide als Basis verwenden
- TypeScript für alle neuen Komponenten
- Explicit Function Return Types
- Promise/async/await statt Callbacks
- Immutabilität bevorzugen (const, Object.freeze(), Immer.js)
- JSDoc für alle öffentlichen APIs

## Python Standards
- PEP 8 Styleguide
- Type Hints (PEP 484)
- Black als Formatter
- Docstrings im Google-Style
- Virtual Environments für Projekte
- Pylint/Flake8 für Linting

## Go Standards
- gofmt für Formatierung
- golint für Linting
- Fehlerbehandlung explizit (kein panic)
- Interfaces klein halten
- go.mod für Dependency Management

## Rust Standards
- rustfmt für Formatierung
- clippy für Linting
- ? Operator für Error Propagation
- Ownership-Regeln strikt befolgen
- Keine unsafe-Blöcke ohne Code Review

## Test-Standards
- Minimum 80% Test-Abdeckung
- Unit-Tests für alle Funktionen
- Integrationstests für API-Flows
- Mocks für externe Abhängigkeiten
- Testdaten von Produktionscode trennen
- Parameterisierte Tests für Edge Cases
