# Abhängigkeitsanalyse

Analysiere die Abhängigkeiten des Projekts und identifiziere Optimierungspotenziale.

## Verwendung
/analyze-dependencies $ARGUMENTE

## Parameter
- path: Pfad zur package.json oder requirements.txt
- depth: Analysetiefe (default: direct)
- focus: Analysefokus (default: all)

## Beispiel
/analyze-dependencies package.json --depth=transitive --focus=security

Der Befehl wird:
1. Direkte und transitive Abhängigkeiten identifizieren
2. Veraltete Pakete markieren
3. Sicherheitslücken in Abhängigkeiten aufdecken
4. Lizenzkompatibilität prüfen
5. Abhängigkeitsgraph visualisieren
6. Duplizierte/konfliktreiche Abhängigkeiten aufzeigen

Ergebnisse beinhalten actionable Empfehlungen für Aktualisierungen, Ersetzungen oder Konsolidierungen.
