# agentland.saarland Dashboard

Dieses Dashboard ist die zentrale Oberfläche für die agentland.saarland Plattform und bietet eine modulare, anpassbare Benutzeroberfläche mit Fokus auf "Real-Life Agent" Missionen und regionale Identität des Saarlandes.

## Schnellstart (EMPFOHLEN)

Verwende das verbesserte Startup-Skript für einen zuverlässigen Start des Dashboards:

```bash
# Ins Verzeichnis wechseln
cd /home/jan/Dokumente/agentland.saarland/apps/web

# Dashboard mit einem Befehl starten
./start-dashboard.sh
```

Das Dashboard wird automatisch auf http://localhost:5000 geöffnet.

## Funktionen

- **Modular Dashboard** mit konfigurierbaren Widgets
- **Real-Life Agent Cockpit** mit Missionsautorisierung
- **KI-Workspace** Zugang mit Statusanzeige
- **A2A Sicherheitssystem** für Missionsautorisierung
- **Regionale Identität** mit Saarland-Elementen
- **Mehrsprachige Unterstützung** (Deutsch, Englisch, Französisch)
- **Responsives Design** für alle Geräte
- **Themen-Unterstützung** mit Hell-/Dunkel-Modus

## Manuelle Installation

Falls du das Dashboard manuell starten möchtest:

```bash
# Ins Verzeichnis wechseln
cd /home/jan/Dokumente/agentland.saarland/apps/web

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Der Entwicklungsserver wird auf http://localhost:5000 gestartet.

## Fehlerbehebung

Falls du eine Fehlermeldung "Seite nicht gefunden" oder andere Probleme erhältst:

1. Stelle sicher, dass Port 5000 nicht von einem anderen Dienst verwendet wird
2. Verwende `./start-dashboard.sh`, das alle bekannten Probleme automatisch behebt
3. Überprüfe, dass Node.js v18+ und alle Abhängigkeiten korrekt installiert sind
4. Falls Probleme bestehen bleiben, starte den Server mit: `npm run dev -- --host 0.0.0.0 --port 5000`

## Architektur

Das Dashboard basiert auf einem modernen React-Stack mit folgenden Komponenten:

- **React** für die UI-Komponenten
- **styled-jsx** für Component-Styling
- **Vite** als Build-Tool
- **i18n** System für Mehrsprachigkeit
- **ThemeProvider** für Theming-Unterstützung
- **A2A Security** für Agent-zu-Agent Kommunikation

## Widget System

Das Dashboard unterstützt ein flexibles Widget-System, das es Benutzern ermöglicht, ihre eigene Ansicht zu konfigurieren:

- Drag & Drop von Widgets
- Hinzufügen/Entfernen von Widgets
- Persistentes Layout (in localStorage)
- Anpassbare Widget-Größen

## Regionale Identität

Das Dashboard integriert regionale Identitätselemente des Saarlandes:

- Stilisierte Silhouette des Saarlandes im Logo
- Regionale Highlights und Landmarken
- Integration der "KI-Schmiede Saar"
- Lokale Tech-Initiativen

## Sicherheit

Das Dashboard integriert das A2A (Agent-to-Agent) Sicherheitssystem mit:

- Missionsautorisierung auf verschiedenen Zugriffsebenen
- Zugriffskontrollen (öffentlich, geschützt, privat, eingeschränkt)
- Operations-Protokollierung
- Domain-Verifizierung