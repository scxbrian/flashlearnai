import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, BookOpen, Award, Clock, Target, BarChart3, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { apiCall } from '../api/client';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Cards Studied', value: '1,247', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Quiz Score', value: '87%', icon: Award, color: 'text-emerald-600' },
    { label: 'Study Streak', value: '12 days', icon: Target, color: 'text-purple-600' },
    { label: 'Time Spent', value: '24h', icon: Clock, color: 'text-orange-600' },
  ];

  const recentActivity = [
    { title: 'Biology Chapter 5', type: 'Flashcards', progress: 85, time: '2 hours ago' },
    { title: 'Chemistry Quiz', type: 'Quiz', progress: 92, time: '1 day ago' },
    { title: 'Physics Notes', type: 'Upload', progress: 100, time: '2 days ago' },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'Learner'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your learning progress for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6" hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Learning Progress
              </h2>
            </div>
            
            <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <div className="h-full flex items-end justify-between space-x-2">
                {[65, 78, 82, 88, 92, 87, 94].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-md transition-all duration-1000 ease-out"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {activity.type}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.progress}% complete
                  </p>
                </div>
              ))}
            </div>

          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/flashcards'}>
              <BookOpen className="h-5 w-5" />
              <span>Study Flashcards</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/quiz'}>
              <TrendingUp className="h-5 w-5" />
              <span>Take Quiz</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/upload'}>
              <Target className="h-5 w-5" />
              <span>Upload Content</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/profile'}>
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;