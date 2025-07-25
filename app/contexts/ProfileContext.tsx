'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  setCurrentProfile: (profile: Profile) => void;
  loadProfiles: () => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load profiles from API
  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      const data = await response.json();
      
      if (data.profiles && data.profiles.length > 0) {
        setProfiles(data.profiles);
        
        // If no current profile, check localStorage or use first profile
        if (!currentProfile) {
          const storedProfileId = localStorage.getItem('currentProfileId');
          let profileToSelect = data.profiles[0]; // Default to first profile
          
          if (storedProfileId) {
            const storedProfile = data.profiles.find((p: Profile) => p.id === storedProfileId);
            if (storedProfile) {
              profileToSelect = storedProfile;
            }
          }
          
          setCurrentProfileState(profileToSelect);
          localStorage.setItem('currentProfileId', profileToSelect.id);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set current profile and persist to localStorage
  const setCurrentProfile = (profile: Profile) => {
    setCurrentProfileState(profile);
    localStorage.setItem('currentProfileId', profile.id);
  };

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <ProfileContext.Provider value={{
      currentProfile,
      profiles,
      setCurrentProfile,
      loadProfiles,
      isLoading
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 