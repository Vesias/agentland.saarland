import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const I18nContext = createContext(null);

/**
 * I18nProvider Component
 * 
 * Provides internationalization (i18n) context for the application
 * with support for language switching and translation lookups
 */
export const I18nProvider = ({ children, defaultLanguage = 'de' }) => {
  const [language, setLanguage] = useState(() => {
    // Try to get from localStorage first
    const savedLanguage = localStorage.getItem('agentland_language');
    return savedLanguage || defaultLanguage;
  });
  
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be a fetch call to load translation files
        // For demo, we'll use a mock implementation
        
        // Mock translation data for demonstration
        const mockTranslations = {
          de: {
            common: {
              dashboard: 'Dashboard',
              profile: 'Profil',
              settings: 'Einstellungen',
              logout: 'Abmelden',
              search: 'Suchen...',
              notifications: 'Benachrichtigungen',
              noNotifications: 'Keine Benachrichtigungen',
              viewAll: 'Alle anzeigen',
              markAllRead: 'Alle als gelesen markieren',
              darkMode: 'Dunkler Modus',
              lightMode: 'Heller Modus',
              save: 'Speichern',
              cancel: 'Abbrechen',
              edit: 'Bearbeiten',
              delete: 'Löschen',
              welcome: 'Willkommen',
              errorOccurred: 'Ein Fehler ist aufgetreten'
            },
            agent: {
              level: 'Level',
              experience: 'Erfahrung',
              missions: 'Missionen',
              activeMission: 'Aktive Mission',
              completedMissions: 'Abgeschlossene Missionen',
              achievements: 'Errungenschaften',
              nextStep: 'Nächster Schritt',
              progress: 'Fortschritt',
              startMission: 'Mission starten',
              completeMission: 'Mission abschließen',
              viewDetails: 'Details anzeigen'
            },
            saarland: {
              discover: 'Saarland entdecken',
              factTitle: 'Wussten Sie?',
              aiResearch: 'KI-Forschung',
              borderRegion: 'Grenzregion',
              industrialHistory: 'Industriegeschichte',
              discoverMore: 'Mehr entdecken',
              localInitiatives: 'Lokale Initiativen'
            },
            security: {
              authorization: 'Autorisierung',
              authentication: 'Authentifizierung',
              securityStatus: 'Sicherheitsstatus',
              accessLevels: 'Zugriffsebenen',
              public: 'Öffentlich',
              protected: 'Geschützt',
              private: 'Privat',
              restricted: 'Eingeschränkt',
              operationsLog: 'Operationsprotokoll'
            }
          },
          en: {
            common: {
              dashboard: 'Dashboard',
              profile: 'Profile',
              settings: 'Settings',
              logout: 'Logout',
              search: 'Search...',
              notifications: 'Notifications',
              noNotifications: 'No notifications',
              viewAll: 'View all',
              markAllRead: 'Mark all as read',
              darkMode: 'Dark Mode',
              lightMode: 'Light Mode',
              save: 'Save',
              cancel: 'Cancel',
              edit: 'Edit',
              delete: 'Delete',
              welcome: 'Welcome',
              errorOccurred: 'An error occurred'
            },
            agent: {
              level: 'Level',
              experience: 'Experience',
              missions: 'Missions',
              activeMission: 'Active Mission',
              completedMissions: 'Completed Missions',
              achievements: 'Achievements',
              nextStep: 'Next Step',
              progress: 'Progress',
              startMission: 'Start Mission',
              completeMission: 'Complete Mission',
              viewDetails: 'View Details'
            },
            saarland: {
              discover: 'Discover Saarland',
              factTitle: 'Did you know?',
              aiResearch: 'AI Research',
              borderRegion: 'Border Region',
              industrialHistory: 'Industrial History',
              discoverMore: 'Discover More',
              localInitiatives: 'Local Initiatives'
            },
            security: {
              authorization: 'Authorization',
              authentication: 'Authentication',
              securityStatus: 'Security Status',
              accessLevels: 'Access Levels',
              public: 'Public',
              protected: 'Protected',
              private: 'Private',
              restricted: 'Restricted',
              operationsLog: 'Operations Log'
            }
          },
          fr: {
            common: {
              dashboard: 'Tableau de bord',
              profile: 'Profil',
              settings: 'Paramètres',
              logout: 'Déconnexion',
              search: 'Rechercher...',
              notifications: 'Notifications',
              noNotifications: 'Aucune notification',
              viewAll: 'Voir tout',
              markAllRead: 'Marquer tout comme lu',
              darkMode: 'Mode sombre',
              lightMode: 'Mode clair',
              save: 'Enregistrer',
              cancel: 'Annuler',
              edit: 'Modifier',
              delete: 'Supprimer',
              welcome: 'Bienvenue',
              errorOccurred: 'Une erreur est survenue'
            },
            agent: {
              level: 'Niveau',
              experience: 'Expérience',
              missions: 'Missions',
              activeMission: 'Mission active',
              completedMissions: 'Missions terminées',
              achievements: 'Réussites',
              nextStep: 'Prochaine étape',
              progress: 'Progression',
              startMission: 'Démarrer la mission',
              completeMission: 'Terminer la mission',
              viewDetails: 'Voir les détails'
            },
            saarland: {
              discover: 'Découvrir la Sarre',
              factTitle: 'Le saviez-vous ?',
              aiResearch: 'Recherche en IA',
              borderRegion: 'Région frontalière',
              industrialHistory: 'Histoire industrielle',
              discoverMore: 'Découvrir plus',
              localInitiatives: 'Initiatives locales'
            },
            security: {
              authorization: 'Autorisation',
              authentication: 'Authentification',
              securityStatus: 'État de sécurité',
              accessLevels: 'Niveaux d\'accès',
              public: 'Public',
              protected: 'Protégé',
              private: 'Privé',
              restricted: 'Restreint',
              operationsLog: 'Journal des opérations'
            }
          }
        };
        
        // In a real app, we'd fetch the translations
        // await fetch(`/api/i18n/${language}.json`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setTranslations(mockTranslations[language] || mockTranslations.de);
      } catch (error) {
        console.error(`Could not load translations for ${language}:`, error);
        // Fallback to existing translations or empty object
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTranslations();
    
    // Save selected language to localStorage
    localStorage.setItem('agentland_language', language);
    
    // Update document lang attribute for accessibility
    document.documentElement.setAttribute('lang', language);
  }, [language]);
  
  // Change language
  const changeLanguage = (newLanguage) => {
    if (newLanguage && newLanguage !== language) {
      setLanguage(newLanguage);
    }
  };
  
  // Translate a key
  const t = (key, replacements = {}) => {
    if (!key) return '';
    
    // Split key by dot notation (e.g., "common.welcome")
    const keys = key.split('.');
    
    // Try to find the translation
    let translation = translations;
    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) break;
    }
    
    // If no translation found, return the key as fallback
    if (typeof translation !== 'string') return key;
    
    // Apply replacements if any
    let result = translation;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    });
    
    return result;
  };
  
  // Format date according to current language
  const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString(language, options);
  };
  
  // Format number according to current language
  const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return '';
    
    return number.toLocaleString(language, options);
  };
  
  return (
    <I18nContext.Provider 
      value={{
        language,
        changeLanguage,
        t,
        formatDate,
        formatNumber,
        isLoading
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use i18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nProvider;