import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserCircle, 
  FaCog, 
  FaMedal, 
  FaSignOutAlt, 
  FaUserEdit, 
  FaMoon, 
  FaSun, 
  FaShieldAlt, 
  FaHistory,
  FaRobot
} from 'react-icons/fa';
import { useTheme } from '../dashboard/ThemeProvider';

/**
 * UserProfileMenu Component
 * 
 * A dropdown menu for user profile actions in the agentland.saarland dashboard
 */
const UserProfileMenu = ({ 
  user = null, 
  onLogout = () => {},
  onProfileEdit = () => {},
  onSettingsClick = () => {}
}) => {
  const { theme, toggleTheme, isDarkTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Default user data if none provided
  const userData = user || {
    displayName: 'Max Mustermann',
    email: 'agent@example.com',
    avatar: null,
    agentLevel: 3,
    experience: 450,
    nextLevelXp: 1000,
    role: 'Agent',
    achievements: [
      { id: 'ach1', name: 'Einsteiger', icon: <FaMedal style={{ color: '#CD7F32' }} /> },
      { id: 'ach2', name: 'KI-Enthusiast', icon: <FaMedal style={{ color: '#C0C0C0' }} /> }
    ]
  };
  
  // Toggle the dropdown
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    setIsOpen(false);
    onLogout();
  };
  
  // Handle profile edit
  const handleProfileEdit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    onProfileEdit();
  };
  
  // Handle settings
  const handleSettings = (e) => {
    e.preventDefault();
    setIsOpen(false);
    onSettingsClick();
  };
  
  // Experience percentage calculation
  const experiencePercentage = Math.min(100, Math.round((userData.experience / userData.nextLevelXp) * 100));
  
  return (
    <div className="user-profile-menu" ref={menuRef}>
      <button className="profile-button" onClick={toggleMenu}>
        {userData.avatar ? (
          <img 
            src={userData.avatar} 
            alt={userData.displayName} 
            className="avatar-image" 
          />
        ) : (
          <div className="avatar-placeholder">
            <FaUserCircle className="avatar-icon" />
          </div>
        )}
        <span className="profile-name">{userData.displayName}</span>
      </button>
      
      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-avatar">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.displayName} 
                  className="large-avatar" 
                />
              ) : (
                <div className="large-avatar-placeholder">
                  <FaUserCircle className="large-avatar-icon" />
                </div>
              )}
              <div className="agent-badge">
                <FaRobot className="agent-icon" />
                <span className="agent-level">{userData.agentLevel}</span>
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-name-full">{userData.displayName}</div>
              <div className="profile-email">{userData.email}</div>
              <div className="profile-role">{userData.role}</div>
              
              <div className="profile-experience">
                <div className="experience-bar">
                  <div 
                    className="experience-progress" 
                    style={{ width: `${experiencePercentage}%` }}
                  ></div>
                </div>
                <div className="experience-text">
                  {userData.experience} / {userData.nextLevelXp} XP
                </div>
              </div>
            </div>
          </div>
          
          {userData.achievements && userData.achievements.length > 0 && (
            <div className="achievements-section">
              <div className="section-title">Errungenschaften</div>
              <div className="achievements-list">
                {userData.achievements.map(achievement => (
                  <div key={achievement.id} className="achievement-item">
                    <div className="achievement-icon">
                      {achievement.icon || <FaMedal />}
                    </div>
                    <div className="achievement-name">{achievement.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="menu-items">
            <a href="#profile" className="menu-item" onClick={handleProfileEdit}>
              <FaUserEdit className="item-icon" />
              <span>Profil bearbeiten</span>
            </a>
            
            <a href="#security" className="menu-item">
              <FaShieldAlt className="item-icon" />
              <span>Sicherheitseinstellungen</span>
            </a>
            
            <a href="#activity" className="menu-item">
              <FaHistory className="item-icon" />
              <span>Aktivitätsverlauf</span>
            </a>
            
            <a href="#settings" className="menu-item" onClick={handleSettings}>
              <FaCog className="item-icon" />
              <span>Einstellungen</span>
            </a>
            
            <button className="menu-item theme-toggle" onClick={toggleTheme}>
              {isDarkTheme() ? (
                <>
                  <FaSun className="item-icon" />
                  <span>Zum hellen Modus wechseln</span>
                </>
              ) : (
                <>
                  <FaMoon className="item-icon" />
                  <span>Zum dunklen Modus wechseln</span>
                </>
              )}
            </button>
            
            <a href="#logout" className="menu-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="item-icon" />
              <span>Abmelden</span>
            </a>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .user-profile-menu {
          position: relative;
        }
        
        .profile-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-color, #333);
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .profile-button:hover {
          background-color: var(--background-color, #f5f5f5);
        }
        
        .avatar-placeholder, .avatar-image {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .avatar-placeholder {
          background-color: var(--background-color, #f0f0f0);
        }
        
        .avatar-icon {
          font-size: 24px;
          color: var(--primary-color, #3a6ea5);
        }
        
        .profile-name {
          font-weight: 500;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 300px;
          background-color: var(--surface-color, #fff);
          border-radius: 8px;
          box-shadow: 0 4px 15px var(--shadow-color, rgba(0, 0, 0, 0.1));
          z-index: 100;
          overflow: hidden;
          border: 1px solid var(--border-color, #eee);
        }
        
        .profile-header {
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .profile-avatar {
          position: relative;
        }
        
        .large-avatar, .large-avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .large-avatar-placeholder {
          background-color: var(--background-color, #f0f0f0);
        }
        
        .large-avatar-icon {
          font-size: 42px;
          color: var(--primary-color, #3a6ea5);
        }
        
        .agent-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--primary-color, #3a6ea5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          border: 2px solid var(--surface-color, #fff);
        }
        
        .agent-icon {
          font-size: 0.875rem;
        }
        
        .profile-info {
          flex: 1;
          min-width: 0;
        }
        
        .profile-name-full {
          font-weight: 600;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-color, #333);
        }
        
        .profile-email {
          font-size: 0.75rem;
          color: var(--text-secondary-color, #777);
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .profile-role {
          display: inline-block;
          font-size: 0.7rem;
          padding: 0.15rem 0.35rem;
          background-color: var(--background-color, #f0f0f0);
          color: var(--text-secondary-color, #666);
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        
        .profile-experience {
          margin-top: 0.5rem;
        }
        
        .experience-bar {
          height: 4px;
          background-color: var(--background-color, #f0f0f0);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }
        
        .experience-progress {
          height: 100%;
          background-color: var(--primary-color, #3a6ea5);
        }
        
        .experience-text {
          font-size: 0.7rem;
          color: var(--text-secondary-color, #777);
          text-align: right;
        }
        
        .achievements-section {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary-color, #777);
          margin-bottom: 0.75rem;
        }
        
        .achievements-list {
          display: flex;
          gap: 0.75rem;
        }
        
        .achievement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .achievement-icon {
          font-size: 1.25rem;
          color: var(--primary-color, #3a6ea5);
        }
        
        .achievement-name {
          font-size: 0.7rem;
          text-align: center;
          max-width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .menu-items {
          padding: 0.5rem 0;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          text-decoration: none;
          color: var(--text-color, #333);
          transition: background-color 0.2s;
          width: 100%;
          border: none;
          background: none;
          text-align: left;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .menu-item:hover {
          background-color: var(--background-color, #f5f5f5);
        }
        
        .item-icon {
          color: var(--primary-color, #3a6ea5);
          font-size: 1rem;
          flex-shrink: 0;
        }
        
        .menu-item.logout {
          border-top: 1px solid var(--border-color, #eee);
          margin-top: 0.25rem;
        }
        
        .menu-item.logout .item-icon {
          color: var(--danger-color, #f44336);
        }
        
        @media (max-width: 768px) {
          .profile-dropdown {
            position: fixed;
            width: 100%;
            max-width: 350px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-height: 85vh;
            overflow-y: auto;
          }
        }
        
        @media (max-width: 576px) {
          .profile-dropdown {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfileMenu;