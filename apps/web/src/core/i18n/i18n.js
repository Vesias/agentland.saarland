/**
 * Internationalization module for the web application
 */

const logger = require('../logging/logger').createLogger('i18n');

// Sample translations
const translations = {
  en: {
    'errors.schemaLoadFailed': 'Failed to load schema. Please try again.',
    'errors.validationFailed': 'Form validation failed. Please check your inputs.',
    'errors.submitFailed': 'Failed to submit form. Please try again.',
    'status.loading': 'Loading...',
    'status.saving': 'Saving...',
    'profile.editTitle': 'Edit Profile',
    'actions.retry': 'Retry',
    'actions.save': 'Save',
    'actions.cancel': 'Cancel'
  },
  de: {
    'errors.schemaLoadFailed': 'Schema konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
    'errors.validationFailed': 'Formularvalidierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
    'errors.submitFailed': 'Formular konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    'status.loading': 'Wird geladen...',
    'status.saving': 'Wird gespeichert...',
    'profile.editTitle': 'Profil bearbeiten',
    'actions.retry': 'Wiederholen',
    'actions.save': 'Speichern',
    'actions.cancel': 'Abbrechen'
  },
  fr: {
    'errors.schemaLoadFailed': 'Échec du chargement du schéma. Veuillez réessayer.',
    'errors.validationFailed': 'La validation du formulaire a échoué. Veuillez vérifier vos saisies.',
    'errors.submitFailed': 'Échec de l\'envoi du formulaire. Veuillez réessayer.',
    'status.loading': 'Chargement...',
    'status.saving': 'Enregistrement...',
    'profile.editTitle': 'Modifier le profil',
    'actions.retry': 'Réessayer',
    'actions.save': 'Enregistrer',
    'actions.cancel': 'Annuler'
  }
};

/**
 * I18n class for translations
 */
class I18n {
  constructor(locale = 'de') {
    this.locale = locale;
    logger.debug(`I18n initialized with locale: ${locale}`);
  }

  /**
   * Set the locale
   * @param {string} locale The locale to set
   */
  setLocale(locale) {
    this.locale = locale;
    logger.debug(`Locale set to: ${locale}`);
  }

  /**
   * Translate a key
   * @param {string} key The translation key
   * @param {Object} variables Variables to interpolate
   * @returns {string} The translated string
   */
  translate(key, variables = {}) {
    // Try to get the translation for the current locale
    let translation = translations[this.locale]?.[key];
    
    // Fallback to English if the translation is not found
    if (!translation && this.locale !== 'en') {
      translation = translations.en?.[key];
    }
    
    // Use the key as fallback if no translation is found
    if (!translation) {
      logger.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Interpolate variables
    for (const [varName, value] of Object.entries(variables)) {
      translation = translation.replace(new RegExp(`{{${varName}}}`, 'g'), value);
    }
    
    return translation;
  }
}

module.exports = { I18n };