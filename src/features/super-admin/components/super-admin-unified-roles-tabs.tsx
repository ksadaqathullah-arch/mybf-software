'use client';

import * as React from 'react';
import { SuperAdminSystemRolesView } from './super-admin-system-roles-view';
import { SuperAdminOfficersView } from '@/features/chapters/components/super-admin-officers-view';
import { Key, Users } from 'lucide-react';

interface SuperAdminUnifiedRolesTabsProps {
  initialUsers: any[];
  availableRoles: any[];
  currentAdminId: string;
  officers: any[];
  chapters: any[];
  eligibleUsers: any[];
}

export function SuperAdminUnifiedRolesTabs({
  initialUsers,
  availableRoles,
  currentAdminId,
  officers,
  chapters,
  eligibleUsers,
}: SuperAdminUnifiedRolesTabsProps) {
  const [activeTab, setActiveTab] = React.useState<'system' | 'chapter'>('system');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'system'
              ? 'border-[#035AFC] text-[#035AFC]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Key className="h-4 w-4" />
          System Roles & RBAC (Global)
        </button>

        <button
          onClick={() => setActiveTab('chapter')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'chapter'
              ? 'border-[#035AFC] text-[#035AFC]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Chapter Executive Leadership (16 Constituencies)
        </button>
      </div>

      {activeTab === 'system' ? (
        <SuperAdminSystemRolesView
          initialUsers={initialUsers}
          availableRoles={availableRoles}
          currentAdminId={currentAdminId}
        />
      ) : (
        <SuperAdminOfficersView
          initialOfficers={officers}
          chapters={chapters}
          users={eligibleUsers}
        />
      )}
    </div>
  );
}
