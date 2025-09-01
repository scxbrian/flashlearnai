import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Calendar, Crown, Settings, CreditCard, LogOut, Edit } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../api/client';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const { data: profileData } = useQuery({
    queryKey: ['user-profile-detailed'],
    queryFn: () => {
      // Mock detailed profile data for demo
      return Promise.resolve({
        data: {
          name: 'Demo User',
          email: 'demo@flashlearn.ai',
          joinDate: '2025-01-01',
          stats: {
            cardsStudied: 1247,
            quizzesTaken: 23,
            studyStreak: 12,
            avgScore: 87,
          },
        },
      });
    },
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => {
      // Mock subscription data for demo
      return Promise.resolve({
        data: {
          tier: 'Flash Core',
          status: 'active',
          nextBilling: '2025-02-15',
          usage: {
            cardsUsed: 347,
            cardsLimit: 1000,
          },
        },
      });
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSaveProfile = async () => {
    try {
      await apiCall('/api/user/profile', {
        method: 'PUT',
        data: editData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              />
            ) : (
              <p className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              />
            ) : (
              <p className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Member Since
            </label>
            <p className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Calendar className="h-4 w-4" />
              <span>January 2025</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Status
            </label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              Active
            </span>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex space-x-4">
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>

      {/* Learning Stats */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Learning Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Cards Studied</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">23</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Quizzes Taken</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Day Streak</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">87%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Avg Score</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Current Subscription
          </h2>
          <Button
            variant="outline"
            onClick={() => setIsPricingOpen(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.subscription?.tier || 'Flash Core'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Status: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Next billing: February 15, 2025
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Monthly limit</span>
              <span className="font-medium text-gray-900 dark:text-white">1,000 cards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Used this month</span>
              <span className="font-medium text-gray-900 dark:text-white">347 cards</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                style={{ width: '35%' }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Analytics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Usage Analytics
        </h2>
        <div className="h-48 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300">Usage analytics chart</p>
        </div>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Preferences
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get notified about your progress</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Voice Narration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Enable audio for flashcards</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Auto-generate Quizzes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create quizzes from uploaded content</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Account Actions
        </h2>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="danger" onClick={logout} className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account and preferences
          </p>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </Tabs>

        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
        />
      </div>
    </div>
  );
};

export default Profile;