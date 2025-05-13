# Sicherheits-Scan

Führe einen umfassenden Sicherheitsscan des Codes oder der spezifizierten Dateien durch.

## Verwendung
/security-scan $ARGUMENTE

## Parameter
- path: Dateipfad oder Verzeichnis für den Scan
- depth: Tiefe der Analyse (default: medium)
- report: Reportformat (default: summary)

## Beispiel
/security-scan src/ --depth=high --report=detailed

Der Befehl wird:
1. Den Code auf bekannte Sicherheitslücken scannen
2. Verwendete Abhängigkeiten auf Vulnerabilitäten prüfen
3. Mögliche Injektionspunkte identifizieren
4. Kryptografische Praktiken bewerten
5. Einen detaillierten Sicherheitsbericht generieren

Ergebnisse werden in einem strukturierten Format mit CVSS-Scores und Mitigationsvorschlägen zurückgegeben.
