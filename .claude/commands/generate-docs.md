# Dokumentationsgenerator

Generiere umfassende Dokumentation für den Code oder die spezifizierten Komponenten.

## Verwendung
/generate-docs $ARGUMENTE

## Parameter
- path: Dateipfad oder Verzeichnis für die Dokumentationsgenerierung
- format: Ausgabeformat (default: markdown)
- level: Detaillierungsgrad (default: standard)

## Beispiel
/generate-docs src/core/ --format=html --level=detailed

Der Befehl wird:
1. Codestrukturen und Abhängigkeiten analysieren
2. Funktionen, Klassen und Module dokumentieren
3. API-Endpunkte beschreiben
4. Architekturdiagramme generieren
5. Beispiele und Nutzungsszenarien erstellen

Die Dokumentation wird entsprechend dem gewählten Format in einem strukturierten, navigierbaren Format zurückgegeben.
