'use client';

import { useState, useRef, useEffect } from 'react';
import { useProfile } from '../app/contexts/ProfileContext';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function ProfileSwitcher() {
  const { currentProfile, profiles, setCurrentProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileSelect = (profile: any) => {
    setCurrentProfile(profile);
    setIsOpen(false);
  };

  const renderAvatar = (profile: any, size: 'sm' | 'md' = 'sm') => {
    const sizeClasses = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      );
    }
    
    return <UserCircleIcon className={`${sizeClasses} text-gray-400`} />;
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <UserCircleIcon className="h-6 w-6" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {renderAvatar(currentProfile)}
        <span className="text-sm font-medium text-gray-900 dark:text-white max-w-20 truncate">
          {currentProfile.name}
        </span>
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {/* Current Profile Header */}
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Current Profile
            </div>
            
            {/* Profile List */}
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  profile.id === currentProfile.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {renderAvatar(profile, 'md')}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {profile.name}
                  </div>
                  {profile.id === currentProfile.id && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Current
                    </div>
                  )}
                </div>
              </button>
            ))}
            

          </div>
        </div>
      )}
    </div>
  );
} 