import React, { useState, useEffect } from 'react';
import { 
  FaRobot, 
  FaSearch, 
  FaBell, 
  FaUserCircle, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaGlobe 
} from 'react-icons/fa';
import { useTheme } from '../dashboard/ThemeProvider';

/**
 * DashboardNavbar Component
 * 
 * A responsive navbar for the AGENT_LAND.SAARLAND dashboard
 * with search, notifications, profile, and language options
 */
const DashboardNavbar = ({ onSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch notifications
  useEffect(() => {
    // This would be replaced with an actual API call in a real implementation
    const mockNotifications = [
      {
        id: 'notif-1',
        title: 'Neue Mission verfügbar',
        message: 'KI-Chatbot für Tourismus wurde freigeschaltet',
        type: 'mission',
        time: '10 min',
        read: false
      },
      {
        id: 'notif-2',
        title: 'Missionsfortschritt',
        message: 'Wanderweg-Digitalisierung: 50% abgeschlossen',
        type: 'progress',
        time: '2 std',
        read: true
      },
      {
        id: 'notif-3',
        title: 'Systembenachrichtigung',
        message: 'Llama 3.2 Update verfügbar',
        type: 'system',
        time: '1 tag',
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);
  
  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
    // Close other menus when mobile menu is toggled
    setShowNotifications(false);
    setShowProfileMenu(false);
    setShowLanguageSelector(false);
  };
  
  // Handle notification toggle
  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    // Close other menus
    setShowProfileMenu(false);
    setShowLanguageSelector(false);
  };
  
  // Handle profile menu toggle
  const toggleProfileMenu = (e) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
    // Close other menus
    setShowNotifications(false);
    setShowLanguageSelector(false);
  };
  
  // Handle language selector toggle
  const toggleLanguageSelector = (e) => {
    e.stopPropagation();
    setShowLanguageSelector(!showLanguageSelector);
    // Close other menus
    setShowNotifications(false);
    setShowProfileMenu(false);
  };
  
  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowProfileMenu(false);
      setShowLanguageSelector(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Get unread notification count
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  // Generate regional emblem - stylized Saarland silhouette
  const SaarlandEmblem = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 100 100" 
      className="saarland-emblem"
    >
      <path 
        d="M25,60 C20,50 15,45 20,40 C25,35 35,38 40,30 C45,22 55,20 60,15 C65,10 75,15 80,25 C85,35 82,45 85,55 C88,65 80,75 75,80 C70,85 60,82 50,85 C40,88 35,80 30,75 C25,70 30,65 25,60 Z" 
        fill="currentColor"
      />
    </svg>
  );
  
  // Function to navigate to a page
  const navigateTo = (path) => {
    // In a production app, this would use a router
    // For now, we'll just log the navigation
    console.log(`Navigating to: ${path}`);
    
    // For profile page, let's toggle a class on the body to show the profile form
    if (path === '/profile') {
      // Add a class to the body that the component can detect
      document.body.classList.add('show-profile-page');
      document.body.classList.remove('show-dashboard-page');
      
      // Close the profile menu
      setShowProfileMenu(false);
    } else if (path === '/') {
      document.body.classList.add('show-dashboard-page');
      document.body.classList.remove('show-profile-page');
    }
  };
  
  return (
    <nav className="dashboard-navbar">
      <div className="navbar-container">
        {/* Logo and brand */}
        <div className="navbar-brand" onClick={() => navigateTo('/')}>
          <div className="brand-logo">
            <SaarlandEmblem />
            <FaRobot className="robot-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">AGENT_LAND</span>
            <span className="brand-region">.SAARLAND</span>
          </div>
        </div>
        
        {/* Search bar - desktop */}
        <div className="search-container desktop-only">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
            />
          </div>
        </div>
        
        {/* Menu toggle - mobile only */}
        <div className="mobile-menu-toggle">
          <button onClick={toggleMobileMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        {/* Right side menu items */}
        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          {/* Search bar - mobile */}
          <div className="search-container mobile-only">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
              />
            </div>
          </div>
          
          {/* Notifications */}
          <div className="navbar-item notification-item" onClick={toggleNotifications}>
            <button className="icon-button" aria-label="Benachrichtigungen">
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {/* Notification dropdown */}
            {showNotifications && (
              <div className="dropdown-menu notification-menu">
                <div className="dropdown-header">
                  <h3>Benachrichtigungen</h3>
                  <button className="mark-all-read">Alle als gelesen markieren</button>
                </div>
                
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      >
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-notifications">
                      Keine Benachrichtigungen
                    </div>
                  )}
                </div>
                
                <div className="dropdown-footer">
                  <a href="#all-notifications">Alle Benachrichtigungen anzeigen</a>
                </div>
              </div>
            )}
          </div>
          
          {/* Language Selector */}
          <div className="navbar-item language-item" onClick={toggleLanguageSelector}>
            <button className="icon-button" aria-label="Sprache ändern">
              <FaGlobe />
            </button>
            
            {/* Language dropdown */}
            {showLanguageSelector && (
              <div className="dropdown-menu language-menu">
                <div className="dropdown-header">
                  <h3>Sprache wählen</h3>
                </div>
                
                <div className="language-list">
                  <button className="language-option active">
                    <span className="language-name">Deutsch</span>
                    <span className="language-code">DE</span>
                  </button>
                  <button className="language-option">
                    <span className="language-name">English</span>
                    <span className="language-code">EN</span>
                  </button>
                  <button className="language-option">
                    <span className="language-name">Français</span>
                    <span className="language-code">FR</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="navbar-item profile-item" onClick={toggleProfileMenu}>
            <button className="profile-button" aria-label="Benutzerprofil">
              <FaUserCircle className="profile-icon" />
              <span className="profile-name desktop-only">Max Mustermann</span>
            </button>
            
            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="dropdown-menu profile-menu">
                <div className="profile-header">
                  <div className="profile-picture">
                    <FaUserCircle />
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">Max Mustermann</div>
                    <div className="profile-email">max@example.com</div>
                  </div>
                </div>
                
                <div className="profile-options">
                  <button 
                    className="profile-option" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('/profile');
                    }}
                  >
                    <FaUserCircle className="option-icon" />
                    <span>Mein Profil</span>
                  </button>
                  <button 
                    className="profile-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('/settings');
                    }}
                  >
                    <FaCog className="option-icon" />
                    <span>Einstellungen</span>
                  </button>
                  <button 
                    className="profile-option theme-toggle" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTheme();
                    }}
                  >
                    <FaCog className="option-icon" />
                    <span>Theme umschalten</span>
                  </button>
                  <button 
                    className="profile-option logout"
                    onClick={(e) => {
                      e.stopPropagation();
                      // In a real app, this would trigger a logout action
                      alert('Abmelden wurde geklickt');
                    }}
                  >
                    <FaSignOutAlt className="option-icon" />
                    <span>Abmelden</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .dashboard-navbar {
          background-color: var(--surface-color, #fff);
          box-shadow: 0 2px 10px var(--shadow-color, rgba(0, 0, 0, 0.1));
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          position: relative;
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .brand-logo {
          position: relative;
          margin-right: 0.5rem;
          display: flex;
          align-items: center;
        }
        
        .saarland-emblem {
          color: var(--accent-color, #cf6679);
          opacity: 0.7;
          position: absolute;
          transform: scale(0.8);
        }
        
        .robot-icon {
          color: var(--primary-color, #3a6ea5);
          font-size: 1.5rem;
          position: relative;
          z-index: 2;
        }
        
        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        
        .brand-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--primary-color, #3a6ea5);
        }
        
        .brand-region {
          font-size: 0.7rem;
          color: var(--secondary-color, #7986cb);
          letter-spacing: 0.05em;
        }
        
        .search-container {
          flex: 1;
          max-width: 500px;
          margin: 0 1rem;
        }
        
        .search-box {
          display: flex;
          align-items: center;
          background-color: var(--background-color, #f8f9fa);
          border-radius: 4px;
          padding: 0.25rem 0.75rem;
          border: 1px solid var(--border-color, #eee);
        }
        
        .search-icon {
          color: var(--text-secondary-color, #666);
          margin-right: 0.5rem;
        }
        
        .search-box input {
          border: none;
          background: transparent;
          width: 100%;
          padding: 0.5rem 0;
          color: var(--text-color, #333);
          outline: none;
        }
        
        .search-box input::placeholder {
          color: var(--text-secondary-color, #666);
        }
        
        .navbar-menu {
          display: flex;
          align-items: center;
        }
        
        .navbar-item {
          position: relative;
        }
        
        .icon-button, .profile-button {
          background: none;
          border: none;
          color: var(--text-color, #333);
          font-size: 1.2rem;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .profile-button {
          gap: 0.5rem;
        }
        
        .profile-name {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .notification-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background-color: var(--danger-color, #f44336);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          width: 300px;
          background-color: var(--surface-color, #fff);
          border-radius: 4px;
          box-shadow: 0 3px 12px var(--shadow-color, rgba(0, 0, 0, 0.15));
          border: 1px solid var(--border-color, #eee);
          z-index: 1000;
          overflow: hidden;
          margin-top: 0.5rem;
        }
        
        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .dropdown-header h3 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-color, #333);
        }
        
        .mark-all-read {
          background: none;
          border: none;
          color: var(--primary-color, #3a6ea5);
          font-size: 0.8rem;
          cursor: pointer;
        }
        
        .notification-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .notification-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color, #eee);
          cursor: pointer;
        }
        
        .notification-item:last-child {
          border-bottom: none;
        }
        
        .notification-item.unread {
          background-color: rgba(58, 110, 165, 0.05);
        }
        
        .notification-title {
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: var(--text-color, #333);
        }
        
        .notification-message {
          font-size: 0.85rem;
          color: var(--text-secondary-color, #666);
          margin-bottom: 0.25rem;
        }
        
        .notification-time {
          font-size: 0.75rem;
          color: var(--text-secondary-color, #999);
        }
        
        .empty-notifications {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--text-secondary-color, #666);
          font-size: 0.9rem;
        }
        
        .dropdown-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-color, #eee);
          text-align: center;
        }
        
        .dropdown-footer a {
          color: var(--primary-color, #3a6ea5);
          text-decoration: none;
          font-size: 0.85rem;
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .profile-picture {
          font-size: 2.5rem;
          color: var(--primary-color, #3a6ea5);
        }
        
        .profile-info {
          display: flex;
          flex-direction: column;
        }
        
        .profile-email {
          font-size: 0.8rem;
          color: var(--text-secondary-color, #666);
        }
        
        .profile-options {
          padding: 0.5rem 0;
        }
        
        .profile-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-color, #333);
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.9rem;
        }
        
        .profile-option:hover {
          background-color: var(--background-color, #f5f5f5);
        }
        
        .option-icon {
          color: var(--primary-color, #3a6ea5);
        }
        
        .profile-option.logout {
          border-top: 1px solid var(--border-color, #eee);
          margin-top: 0.5rem;
        }
        
        .profile-option.logout .option-icon {
          color: var(--danger-color, #f44336);
        }
        
        .language-list {
          padding: 0.5rem 0;
        }
        
        .language-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }
        
        .language-option:hover {
          background-color: var(--background-color, #f5f5f5);
        }
        
        .language-option.active {
          font-weight: 500;
          color: var(--primary-color, #3a6ea5);
        }
        
        .language-code {
          color: var(--text-secondary-color, #999);
          font-size: 0.8rem;
        }
        
        .mobile-menu-toggle {
          display: none;
        }
        
        /* Utility classes */
        .desktop-only {
          display: block;
        }
        
        .mobile-only {
          display: none;
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          
          .mobile-only {
            display: block;
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .mobile-menu-toggle button {
            background: none;
            border: none;
            color: var(--text-color, #333);
            font-size: 1.2rem;
            padding: 0.5rem;
            cursor: pointer;
          }
          
          .navbar-menu {
            position: absolute;
            flex-direction: column;
            align-items: stretch;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--surface-color, #fff);
            box-shadow: 0 4px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
            padding: 1rem;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease-in-out;
            z-index: 990;
          }
          
          .navbar-menu.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          
          .search-container {
            margin: 0 0 1rem 0;
            max-width: none;
          }
          
          .navbar-item {
            margin: 0.5rem 0;
          }
          
          .dropdown-menu {
            position: static;
            width: 100%;
            box-shadow: none;
            border: 1px solid var(--border-color, #eee);
            margin-top: 0.5rem;
          }
          
          .icon-button, .profile-button {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </nav>
  );
};

export default DashboardNavbar;