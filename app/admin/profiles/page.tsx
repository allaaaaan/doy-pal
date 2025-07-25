'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default function ProfilesAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: ''
  });

  // Load profiles
  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profiles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  // Create profile
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError('Profile name is required');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          avatar_url: formData.avatar_url.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const data = await response.json();
      setProfiles(prev => [...prev, data.profile]);
      setSuccess('Profile created successfully');
      setShowCreateForm(false);
      setFormData({ name: '', avatar_url: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating profile:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setFormLoading(false);
    }
  };

  // Update profile (only avatar_url as per requirements)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProfile) return;

    try {
      setFormLoading(true);
      setFormError(null);
      
      const response = await fetch(`/api/profiles/${editingProfile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_url: formData.avatar_url.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? data.profile : p));
      setSuccess('Profile updated successfully');
      setEditingProfile(null);
      setFormData({ name: '', avatar_url: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete profile
  const handleDeleteProfile = async (profile: Profile) => {
    if (!confirm(`Are you sure you want to delete the profile "${profile.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile');
      }

      setProfiles(prev => prev.filter(p => p.id !== profile.id));
      setSuccess('Profile deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete profile');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Start editing
  const startEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      avatar_url: profile.avatar_url || ''
    });
    setFormError(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingProfile(null);
    setShowCreateForm(false);
    setFormData({ name: '', avatar_url: '' });
    setFormError(null);
  };

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  // Render avatar
  const renderAvatar = (profile: Profile, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12', 
      lg: 'h-16 w-16'
    };
    
    if (profile.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      );
    }
    
    return <UserCircleIcon className={`${sizeClasses[size]} text-gray-400`} />;
  };

  const ProfileForm = ({ isEditing = false }: { isEditing?: boolean }) => (
    <form onSubmit={isEditing ? handleUpdateProfile : handleCreateProfile} className="space-y-4">
      {/* Name field (read-only for editing) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Profile Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter profile name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          required={!isEditing}
          disabled={isEditing} // Only allow editing avatar_url as per requirements
        />
        {isEditing && (
          <p className="text-xs text-gray-500 mt-1">
            Profile name cannot be changed
          </p>
        )}
      </div>

      {/* Avatar URL field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Avatar URL
        </label>
        <input
          type="url"
          value={formData.avatar_url}
          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Enter a URL to an image for the profile avatar
        </p>
      </div>

      {/* Form error */}
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {formError}
        </div>
      )}

      {/* Form buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={cancelEdit}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
        >
          {formLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Profile' : 'Create Profile')}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Management</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Management
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Profile
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Create New Profile
          </h2>
          <ProfileForm />
        </div>
      )}

      {/* Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Profile
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <ProfileForm isEditing={true} />
          </div>
        </div>
      )}

      {/* Profiles List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Profiles ({profiles.length})
          </h3>
          
          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No profiles yet. Create your first profile to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderAvatar(profile)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {profile.name}
                            </div>
                            {profile.avatar_url && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {profile.avatar_url}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEdit(profile)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 