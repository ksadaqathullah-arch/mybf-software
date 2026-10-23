'use client';

import * as React from 'react';
import { SuperAdminSystemRolesView } from './super-admin-system-roles-view';
import { SuperAdminOfficersView } from './super-admin-officers-view';
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
      {/* Editorial Tab Switcher */}
      <div className="flex border-b-2 border-ink gap-2">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 pb-3 px-4 font-display text-xs font-bold uppercase tracking-wider border-b-2 -mb-0.5 transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'border-ink text-ink bg-yellow px-4 py-2 border-2 shadow-[2px_2px_0px_#14161c]'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Key className="h-4 w-4" />
          System Roles & RBAC (Global)
        </button>

        <button
          onClick={() => setActiveTab('chapter')}
          className={`flex items-center gap-2 pb-3 px-4 font-display text-xs font-bold uppercase tracking-wider border-b-2 -mb-0.5 transition-all cursor-pointer ${
            activeTab === 'chapter'
              ? 'border-ink text-ink bg-yellow px-4 py-2 border-2 shadow-[2px_2px_0px_#14161c]'
              : 'border-transparent text-muted hover:text-ink'
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
