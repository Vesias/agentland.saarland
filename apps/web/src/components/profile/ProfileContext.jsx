import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const ProfileContext = createContext(null);

/**
 * ProfileProvider - Context provider for about profile data
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 */
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock profile data
        const mockProfileData = {
          userId: 'user123',
          personal: {
            name: 'Max Mustermann',
            email: 'max@example.com',
            location: 'Saarland, Germany',
            bio: 'Ein Beispielbenutzer für das agentland.saarland Dashboard',
            skills: ['JavaScript', 'React']
          },
          preferences: {
            uiTheme: 'dark',
            language: 'de',
            notifications: true
          },
          agentSettings: {
            isActive: true,
            missionPreferences: ['local', 'regional'],
            skillLevel: 'beginner'
          }
        };
        
        setProfile(mockProfileData);
        setError(null);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  // Save profile data
  const saveProfile = async (profileData) => {
    try {
      setLoading(true);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state with the latest data
      setProfile(profileData);
      setError(null);
      
      // Log the saved profile data
      console.log('Profile saved:', profileData);
      
      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    profile,
    loading,
    error,
    saveProfile,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook for using the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === null) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;