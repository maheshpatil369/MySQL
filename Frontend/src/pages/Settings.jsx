import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Download,
  Trash2,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  AlertCircle, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import defaultAvatar from '../components/images/default-avatar-icon-of-social-media-user-vector.jpg';

const API_PROFILE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/profile`;

const Settings = () => {
  const { user, token, setUser, setToken: setAuthToken } = useAuth(); 
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Tab State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState(null);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(null);

  const [showPassword, setShowPassword] = useState(false); 

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileUpdateError("Name cannot be empty.");
      return;
    }
    setIsUpdatingProfile(true);
    setProfileUpdateError(null);
    setProfileUpdateSuccess(null);

    try {
      const response = await fetch(API_PROFILE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: name.trim() }), 
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.msg || 'Failed to update profile.');
      }
      
      setUser(responseData.user);
      setAuthToken(responseData.token); 
      
      setProfileUpdateSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileUpdateError(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };


  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Globe },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'data', name: 'Data & Storage', icon: Download },
  ];

  const notificationSettings = [
    { id: 'trip_updates', label: 'Trip Updates', description: 'Get notified about changes to your trips', enabled: true },
    { id: 'team_messages', label: 'Team Messages', description: 'Receive notifications for team chat messages', enabled: true },
    { id: 'announcements', label: 'Announcements', description: 'Important team announcements and news', enabled: true },
    { id: 'reminders', label: 'Travel Reminders', description: 'Reminders about upcoming trips and deadlines', enabled: false },
    { id: 'marketing', label: 'Marketing Emails', description: 'Promotional content and travel deals', enabled: false },
  ];

  const privacySettings = [
    { id: 'profile_visibility', label: 'Profile Visibility', description: 'Who can see your profile information', value: 'team' },
    { id: 'trip_sharing', label: 'Trip Sharing', description: 'Default sharing settings for new trips', value: 'private' },
    { id: 'location_sharing', label: 'Location Sharing', description: 'Share your location during trips', value: 'team' },
    { id: 'activity_status', label: 'Activity Status', description: 'Show when you\'re online or away', value: 'enabled' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                  
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={user?.avatar || defaultAvatar}
                        alt={user?.name || 'User Avatar'}
                        className="w-24 h-24 rounded-full object-cover bg-gray-300 dark:bg-gray-600"
                      />
                      <motion.button
                        type="button" // Prevent form submission
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user?.name || 'User Name'}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
                      {/* <button type="button" className="mt-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                        Change Photo
                      </button> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          id="profileName"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          id="profileEmail"
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    {/* Placeholder for other fields - can be made editable similarly */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
                        Phone Number (Read-only)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input type="tel" placeholder="+1 (555) 123-4567" readOnly className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 cursor-not-allowed" />
                      </div>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
                        Location (Read-only)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="San Francisco, CA" readOnly className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Bio can be added here if needed */}

                  {profileUpdateError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" /> {profileUpdateError}
                    </div>
                  )}
                  {profileUpdateSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" /> {profileUpdateSuccess}
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      type="submit"
                      disabled={isUpdatingProfile || !name.trim()}
                      whileHover={{ scale: isUpdatingProfile ? 1 : 1.05 }}
                      whileTap={{ scale: isUpdatingProfile ? 1 : 0.95 }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {isUpdatingProfile ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                  <div className="space-y-4">
                    {notificationSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={setting.enabled}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy & Security</h2>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {privacySettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="public">Public</option>
                          <option value="team">Team Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">Dark Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDark}
                          onChange={toggleTheme}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data & Storage</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Download a copy of your travel data and trip information
                      </p>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </button>
                    </div>
                    
                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                      <h3 className="font-medium text-red-900 dark:text-red-400 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;