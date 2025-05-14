/**
 * Session-Typdefinitionen für die Erweiterung der Express-Session
 * Diese Datei ermöglicht das Hinzufügen von benutzerdefinierten Eigenschaften zur Session.
 */

import 'express-session';

// Erweitere den Standard-SessionData-Typ von express-session
declare module 'express-session' {
  interface SessionData {
    // Füge hier benutzerdefinierte Eigenschaften hinzu
    csrfToken?: string;
    userId?: string;
    roles?: string[];
    permissions?: string[];
    lastActive?: Date;
    isAuthenticated?: boolean;
    // Weitere projektspezifische Sitzungsdaten können hier hinzugefügt werden
  }
}
