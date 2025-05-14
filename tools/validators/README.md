# Clauderules Validator

Dieses Skript validiert eine `.clauderules` Datei anhand eines Satzes vordefinierter Regeln.

## Installation

Bevor der Validator verwendet werden kann, stellen Sie sicher, dass die Projektabhängigkeiten installiert sind. Führen Sie im Hauptverzeichnis des Projekts aus:

```bash
npm install
# oder
# yarn install
```

## Verwendung

Das Skript kann direkt über die Kommandozeile ausgeführt werden.

```bash
node tools/validators/clauderules-validator.js [PFAD_ZUR_CLAUDERULES_DATEI]
```

- `[PFAD_ZUR_CLAUDERULES_DATEI]` (optional): Der Pfad zur `.clauderules` Datei. Wenn nicht angegeben, wird standardmäßig `./.clauderules` im aktuellen Arbeitsverzeichnis verwendet.

### Beispiel:

Validierung der Standarddatei:
```bash
node tools/validators/clauderules-validator.js
```

Validierung einer spezifischen Datei:
```bash
node tools/validators/clauderules-validator.js /pfad/zu/meiner/.clauderules
```
Alternativ können Sie den Validator über das npm-Skript ausführen:

```bash
npm run validate:clauderules
# oder
# yarn validate:clauderules
```

## Ausführbar machen (Optional)

Um das Skript direkt ohne `node` davor auszuführen (z.B. `./tools/validators/clauderules-validator.js`), machen Sie es ausführbar:

```bash
chmod +x tools/validators/clauderules-validator.js
```

Stellen Sie sicher, dass der Shebang (`#!/usr/bin/env node`) am Anfang des Skripts korrekt ist.

## Validierungsprüfungen

Der Validator führt folgende grundlegende Prüfungen durch:

1.  **Existenz der Datei:** Stellt sicher, dass die angegebene `.clauderules` Datei existiert.
2.  **TOML-Format:** Überprüft, ob die Datei valides TOML ist.
3.  **Sektion `[project]`:**
    *   Prüft, ob die Sektion `[project]` vorhanden ist.
    *   Prüft, ob die Pflichtschlüssel `name` und `docs_base` in `[project]` vorhanden sind.
4.  **Sektion `[folders.enforce_structure.ai_docs]`:**
    *   Wenn `must_have` definiert ist, prüft es, ob alle dort gelisteten Verzeichnisse unter dem in `project.docs_base` (oder standardmäßig `ai_docs/`) definierten Pfad existieren.
5.  **Sektion `[enforce.scripts]`:**
    *   Wenn `only_root_script` definiert ist, prüft es, ob die dort genannten Skripte im Root-Verzeichnis des Projekts existieren.
    *   Wenn zusätzlich `disallow_other_root_scripts` auf `true` gesetzt ist, prüft es, ob andere potenziell ausführbare Skripte im Root-Verzeichnis vorhanden sind.

Das Skript gibt eine Erfolgsmeldung aus, wenn keine Probleme gefunden wurden, oder eine Fehlermeldung mit einer Liste der gefundenen Probleme.