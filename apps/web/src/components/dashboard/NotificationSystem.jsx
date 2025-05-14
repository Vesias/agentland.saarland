import React, { useState, useEffect, useCallback } from 'react';
import { FaBell, FaCheck, FaTimes, FaRobot, FaShieldAlt, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

/**
 * NotificationSystem Component
 * 
 * A comprehensive notification system for the AGENT_LAND.SAARLAND dashboard
 * with support for different notification types and real-time updates
 */
const NotificationSystem = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an API call
      // Example: const response = await fetch('/api/notifications');
      // const data = await response.json();
      
      // For demo, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockNotifications = [
        {
          id: 'notif-1',
          title: 'Neue Mission verfügbar',
          message: 'KI-Chatbot für Tourismus wurde freigeschaltet',
          type: 'mission',
          time: '10 min',
          read: false,
          action: '/missions/new'
        },
        {
          id: 'notif-2',
          title: 'Missionsfortschritt',
          message: 'Wanderweg-Digitalisierung: 50% abgeschlossen',
          type: 'progress',
          time: '2 std',
          read: true,
          action: '/missions/in-progress'
        },
        {
          id: 'notif-3',
          title: 'Systembenachrichtigung',
          message: 'Llama 3.2 Update verfügbar',
          type: 'system',
          time: '1 tag',
          read: true,
          action: '/updates'
        },
        {
          id: 'notif-4',
          title: 'Sicherheitswarnung',
          message: 'A2A Missionsautorisierung erfordert erneute Authentifizierung',
          type: 'security',
          time: '30 min',
          read: false,
          action: '/security/auth'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // In a real app, we'd show an error message here
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchNotifications, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);
  
  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // In a real implementation, this would be an API call
      // Example: await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
      
      // For demo, we'll update the local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // In a real implementation, this would be an API call
      // Example: await fetch('/api/notifications/read-all', { method: 'POST' });
      
      // For demo, we'll update the local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);
  
  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      // In a real implementation, this would be an API call
      // Example: await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      
      // For demo, we'll update the local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }, []);
  
  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Close dropdown
    setShowDropdown(false);
    
    // Call the callback if provided
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Navigate to the action URL if needed
    // In a real app, this would use a router like React Router
    // Example: history.push(notification.action);
  }, [markAsRead, onNotificationClick]);
  
  // Toggle notification dropdown
  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);
  
  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.querySelector('.notification-system');
      
      if (container && !container.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mission':
        return <FaClipboardList className="notification-icon mission" />;
      case 'progress':
        return <FaCheck className="notification-icon progress" />;
      case 'system':
        return <FaRobot className="notification-icon system" />;
      case 'security':
        return <FaShieldAlt className="notification-icon security" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };
  
  return (
    <div className="notification-system">
      {/* Notification bell with counter */}
      <button 
        className="notification-button" 
        onClick={toggleDropdown}
        aria-label="Benachrichtigungen"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {/* Notification dropdown */}
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Benachrichtigungen</h3>
            {notifications.length > 0 && (
              <button 
                className="mark-all-read-button"
                onClick={markAllAsRead}
              >
                Alle gelesen
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {isLoading ? (
              <div className="notification-loading">
                Benachrichtigungen werden geladen...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  
                  <button 
                    className="notification-dismiss"
                    onClick={(e) => dismissNotification(notification.id, e)}
                    aria-label="Benachrichtigung entfernen"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <FaBell className="empty-icon" />
                <p>Keine Benachrichtigungen</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/notifications" className="view-all-link">
                Alle Benachrichtigungen anzeigen
              </a>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .notification-system {
          position: relative;
        }
        
        .notification-button {
          background: none;
          border: none;
          color: var(--text-color, #333);
          font-size: 1.2rem;
          padding: 0.5rem;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        
        .notification-button:hover {
          color: var(--primary-color, #3a6ea5);
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--danger-color, #f44336);
          color: white;
          border-radius: 50%;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          font-size: 0.7rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          width: 320px;
          max-width: 95vw;
          background-color: var(--surface-color, #fff);
          box-shadow: 0 4px 15px var(--shadow-color, rgba(0, 0, 0, 0.1));
          border-radius: 8px;
          z-index: 1000;
          overflow: hidden;
          margin-top: 0.5rem;
          border: 1px solid var(--border-color, #eee);
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .notification-header h3 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-color, #333);
        }
        
        .mark-all-read-button {
          background: none;
          border: none;
          color: var(--primary-color, #3a6ea5);
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0;
        }
        
        .notification-list {
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .notification-loading,
        .notification-empty {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--text-secondary-color, #666);
        }
        
        .empty-icon {
          font-size: 2rem;
          color: var(--border-color, #eee);
          margin-bottom: 0.5rem;
        }
        
        .notification-item {
          display: flex;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color, #eee);
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }
        
        .notification-item:hover {
          background-color: var(--background-color, #f8f9fa);
        }
        
        .notification-item.unread {
          background-color: rgba(58, 110, 165, 0.05);
        }
        
        .notification-item.unread:hover {
          background-color: rgba(58, 110, 165, 0.1);
        }
        
        .notification-icon-wrapper {
          margin-right: 0.75rem;
          font-size: 1.2rem;
          padding-top: 0.25rem;
        }
        
        .notification-icon {
          color: var(--primary-color, #3a6ea5);
        }
        
        .notification-icon.mission {
          color: var(--primary-color, #3a6ea5);
        }
        
        .notification-icon.progress {
          color: var(--success-color, #4caf50);
        }
        
        .notification-icon.system {
          color: var(--info-color, #2196f3);
        }
        
        .notification-icon.security {
          color: var(--warning-color, #ff9800);
        }
        
        .notification-content {
          flex: 1;
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
        
        .notification-dismiss {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          color: var(--text-secondary-color, #999);
          font-size: 0.8rem;
          padding: 0.25rem;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s, color 0.2s;
          border-radius: 50%;
        }
        
        .notification-item:hover .notification-dismiss {
          opacity: 1;
        }
        
        .notification-dismiss:hover {
          color: var(--danger-color, #f44336);
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .notification-footer {
          padding: 0.75rem;
          text-align: center;
          border-top: 1px solid var(--border-color, #eee);
        }
        
        .view-all-link {
          color: var(--primary-color, #3a6ea5);
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .view-all-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .notification-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            margin-top: 0;
            border-radius: 16px 16px 0 0;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
          }
          
          .notification-list {
            flex: 1;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;