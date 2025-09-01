import React, { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, children }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Tabs;