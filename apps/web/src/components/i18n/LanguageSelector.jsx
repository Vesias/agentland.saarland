import React, { useState, useEffect, useRef } from 'react';
import { FaGlobe, FaCheck } from 'react-icons/fa';

/**
 * LanguageSelector Component
 * 
 * A dropdown component for selecting the interface language
 * with support for German, English, and French
 */
const LanguageSelector = ({ 
  currentLanguage = 'de', 
  onLanguageChange = () => {},
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);
  
  // Available languages
  const languages = [
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' }
  ];
  
  // Get current language object
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle language selection
  const handleSelect = (language) => {
    onLanguageChange(language.code);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Render different layouts based on compact mode
  return (
    <div className={`language-selector ${compact ? 'compact' : ''}`} ref={selectorRef}>
      <button 
        className="language-button" 
        onClick={toggleDropdown}
        aria-label="Sprache ändern"
        title="Sprache ändern"
      >
        {compact ? (
          <FaGlobe className="globe-icon" />
        ) : (
          <>
            <span className="language-flag">{getCurrentLanguage().flag}</span>
            <span className="language-name">{getCurrentLanguage().nativeName}</span>
            <FaGlobe className="globe-icon" />
          </>
        )}
      </button>
      
      {isOpen && (
        <ul className="language-dropdown">
          {languages.map((language) => (
            <li 
              key={language.code}
              className={`language-option ${language.code === currentLanguage ? 'active' : ''}`}
              onClick={() => handleSelect(language)}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-option-name">{language.nativeName}</span>
              {language.code === currentLanguage && (
                <FaCheck className="active-check" />
              )}
            </li>
          ))}
        </ul>
      )}
      
      <style jsx>{`
        .language-selector {
          position: relative;
          z-index: 100;
        }
        
        .language-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          color: var(--text-color, #333);
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .language-button:hover {
          background-color: var(--background-color, #f5f5f5);
        }
        
        .language-flag {
          font-size: 1.2rem;
        }
        
        .language-name {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .globe-icon {
          color: var(--primary-color, #3a6ea5);
          font-size: 1rem;
        }
        
        .language-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 180px;
          background-color: var(--surface-color, #fff);
          border-radius: 8px;
          box-shadow: 0 4px 15px var(--shadow-color, rgba(0, 0, 0, 0.1));
          list-style: none;
          padding: 0.5rem 0;
          margin: 0;
          z-index: 100;
          border: 1px solid var(--border-color, #eee);
        }
        
        .language-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .language-option:hover {
          background-color: var(--background-color, #f5f5f5);
        }
        
        .language-option.active {
          background-color: rgba(58, 110, 165, 0.1);
          font-weight: 500;
        }
        
        .language-option-name {
          flex: 1;
          font-size: 0.875rem;
        }
        
        .active-check {
          color: var(--success-color, #4caf50);
          font-size: 0.875rem;
        }
        
        /* Compact mode */
        .compact .language-button {
          padding: 0.5rem;
          width: 36px;
          height: 36px;
          justify-content: center;
        }
        
        .compact .language-name,
        .compact .language-flag {
          display: none;
        }
        
        .compact .globe-icon {
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .language-dropdown {
            position: fixed;
            width: 100%;
            max-width: 300px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          
          .language-option {
            padding: 1rem;
          }
          
          .language-flag,
          .language-option-name {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;