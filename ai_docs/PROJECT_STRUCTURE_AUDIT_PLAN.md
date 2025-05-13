# Plan für PROJECT-STRUCTURE-AUDIT.md

## Gliederung

```mermaid
graph TD
    A[PROJECT-STRUCTURE-AUDIT.md] --> B[1. Optimierungsziele]
    A --> C[2. Durchgeführte Änderungen]
    A --> D[3. Neue Verzeichnisstruktur]
    A --> E[4. Entscheidungsdokumentation]
    A --> F[5. Wartungsempfehlungen]
    
    B --> B1[Modulare Organisation]
    B --> B2[Verbesserte Übersichtlichkeit]
    B --> B3[Reduzierte Redundanz]
    
    C --> C1[Dokumentations-Migration]
    C --> C2[Skript-Reorganisation] 
    C --> C3[Verzeichnisbereinigung]
    
    D --> D1[Root-Level]
    D --> D2[Hauptverzeichnisse]
    D --> D3[Unterverzeichnisse basierend auf Ihrer Liste]
    
    E --> E1[Begründungen]
    E --> E2[Vorteile]
    E --> E3[Risikominimierung]
    
    F --> F1[Best Practices]
    F --> F2[Wartungsrichtlinien]
    F --> F3[Zukünftige Optimierungen]
```

## Kontext der bisherigen Änderungen:
1. Dokumentations-Migration:
   - 76 Dateien von docs/ nach ai_docs/ verschoben
   - docs/ Verzeichnis entfernt

2. Skript-Reorganisation:
   - 5 Root-Skripte in entsprechende Module verschoben
   - Nur saar.sh verbleibt im Root

3. Verzeichnisbereinigung:
   - mcp_servers/ aufgelöst und in libs/mcp integriert
   - projects/ nach apps/ und configs/ migriert
   - logs/ in .gitignore/.claudeignore aufgenommen
   - tools/ neu strukturiert (scripts/, generators/)

## Dokumentationsanforderungen:
1. Überblick der Optimierungsziele
2. Detaillierte Auflistung aller Änderungen
3. Neue Verzeichnisstruktur (basierend auf der vom Benutzer bereitgestellten Liste)
4. Begründungen für Entscheidungen
5. Empfehlungen für zukünftige Wartung

## Wichtig:
- Dokumentiere NUR die Strukturoptimierungen
- Verwende klare Markdown-Formatierung
- Die Dokumentation soll als Referenz für zukünftige Entwickler dienen