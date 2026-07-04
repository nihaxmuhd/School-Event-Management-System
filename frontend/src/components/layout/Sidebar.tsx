import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  Award, 
  Trophy, 
  UserCheck, 
  Settings, 
  GraduationCap,
  Flame,
  LogOut,
  ClipboardList,
  Home,
  UserX
} from 'lucide-react';
import { UserRole } from '../../types/festival';
import { X } from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'students' 
  | 'pending'
  | 'registration' 
  | 'assignment'
  | 'events' 
  | 'results' 
  | 'leaderboard' 
  | 'houses'
  | 'users' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  onLogout: () => void;
  studentCount: number;
  registeredParticipantCount: number;
  pendingCount: number;
  eventCount: number;
  schoolName: string;
  festName: string;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

// Role Access Rules Matrix
export const ROLE_PERMISSIONS: Record<UserRole, NavTab[]> = {
  'Super Admin': ['dashboard', 'students', 'pending', 'registration', 'events', 'results', 'leaderboard', 'houses', 'users', 'settings'],
  Admin: ['dashboard', 'students', 'pending', 'registration', 'events', 'results', 'leaderboard', 'houses', 'users'],
  Manager: ['dashboard', 'events', 'results'],
  'Team Leader': ['dashboard', 'assignment']
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onLogout,
  studentCount,
  registeredParticipantCount,
  pendingCount,
  eventCount,
  schoolName,
  festName,
  isMobileOpen,
  onCloseMobile
}) => {
  const allowedTabs = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Admin'];

  const handleTabSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'FESTIVAL',
      items: [
        { id: 'students' as NavTab, label: 'Students', icon: Users, count: studentCount },
        { id: 'pending' as NavTab, label: 'Pending Students', icon: UserX, count: pendingCount },
        { id: 'registration' as NavTab, label: 'Registration', icon: UserPlus, count: registeredParticipantCount },
        { id: 'assignment' as NavTab, label: 'Team Assignment', icon: ClipboardList },
        { id: 'events' as NavTab, label: 'Events', icon: Calendar, count: eventCount },
        { id: 'results' as NavTab, label: 'Result Entry', icon: Award },
        { id: 'leaderboard' as NavTab, label: 'Leaderboard', icon: Trophy, badge: 'LIVE' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'houses' as NavTab, label: 'House Management', icon: Home },
        { id: 'users' as NavTab, label: 'Users', icon: UserCheck },
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside className={`w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen select-none z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:shrink-0 lg:z-30 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-900 text-sm tracking-tight truncate">{schoolName}</h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" /> SEMS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate">{festName}</p>
        </div>
        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => {
          const visibleItems = section.items.filter(item => allowedTabs.includes(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/80'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 uppercase tracking-wide">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Role Badge Widget */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Logged In Role
          </span>
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
            userRole === 'Super Admin' ? 'bg-slate-900 text-white' :
            userRole === 'Admin' ? 'bg-purple-100 text-purple-800' :
            userRole === 'Manager' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {userRole}
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          {userRole === 'Super Admin' && 'Root access incl. system settings.'}
          {userRole === 'Admin' && 'Full festival management access.'}
          {userRole === 'Manager' && 'Events & Marks entry desk active.'}
          {userRole === 'Team Leader' && 'House team assignment desk active.'}
        </p>
      </div>

      {/* User Profile & Switch Role Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {userRole === 'Super Admin' ? 'SA' : userRole === 'Admin' ? 'AD' : userRole === 'Manager' ? 'MG' : 'TL'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">Staff ({userRole})</p>
            <p className="text-[10px] text-slate-400 truncate">sems@hidayaschool.edu</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          title="Switch Role / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      </aside>
    </>
  );
};
