# Code-Modernisierung

Analysiere und modernisiere Legacy-Code oder verbessere bestehenden Code nach aktuellen Best Practices.

## Verwendung
/modernize-code $ARGUMENTE

## Parameter
- path: Dateipfad für die Modernisierung
- level: Modernisierungsgrad (default: conservative)
- target: Zielversion/Standard (z.B. ES2022, Python 3.10)

## Beispiel
/modernize-code src/legacy/ --level=aggressive --target=ES2022

Der Befehl wird:
1. Veraltete Syntax und Patterns identifizieren
2. Moderne Sprachfeatures vorschlagen
3. Code für bessere Lesbarkeit umstrukturieren
4. Performance-Optimierungen durch moderne APIs vorschlagen
5. Typ-Annotationen hinzufügen (wo anwendbar)

Modernisierungsvorschläge werden mit klaren Vorher-Nachher-Vergleichen präsentiert, um Entscheidungen zu erleichtern.
