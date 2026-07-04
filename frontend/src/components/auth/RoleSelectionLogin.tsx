import React from 'react';
import { ShieldCheck, Award, Users, GraduationCap, ArrowRight, Sparkles, Crown } from 'lucide-react';
import { UserRole } from '../../types/festival';

interface RoleSelectionLoginProps {
  onSelectRole: (role: UserRole) => void;
  schoolName: string;
  festName: string;
}

export const RoleSelectionLogin: React.FC<RoleSelectionLoginProps> = ({
  onSelectRole,
  schoolName,
  festName
}) => {
  const roleCards = [
    {
      role: 'Super Admin' as UserRole,
      title: 'Super Admin',
      badge: 'Root Access',
      badgeColor: 'bg-slate-900 text-white border-slate-900',
      icon: Crown,
      iconBg: 'bg-slate-900 text-amber-300',
      description: 'System-level root access. Exclusive control over configurable point settings and core system configuration.',
      features: ['Everything Admin can do', 'Point System Configuration', 'System Settings & Backups', 'Root-level Overrides']
    },
    {
      role: 'Admin' as UserRole,
      title: 'Administrator',
      badge: 'Full Access',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: ShieldCheck,
      iconBg: 'bg-purple-50 text-purple-600',
      description: 'Manage students, houses, registrations, events, results, leaderboard and users. Settings reserved for Super Admin.',
      features: ['Students, Houses & Users', 'Excel Import & Exports', 'Pending & House-wise Registration', 'Events & Marks Entry']
    },
    {
      role: 'Manager' as UserRole,
      title: 'Event Manager',
      badge: 'Marks & Events',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600',
      description: 'Manage festival timetable, update event statuses, enter participant marks, and calculate house points.',
      features: ['Dashboard Overview', 'Event Schedule Management', 'Marks Entry Desk', 'Automatic Rank Computation']
    },
    {
      role: 'Team Leader' as UserRole,
      title: 'House Team Leader',
      badge: 'Assignments',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      description: 'Assign existing students from your own House to festival events. Students are managed centrally by the Admin.',
      features: ['Dashboard Overview', 'Assign House Students', 'Event Team Selection', 'House Participant Tracking']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 py-10 text-slate-900 font-sans antialiased">
      {/* Background Subtle Elements */}
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Brand Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 shadow-2xs mb-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>{schoolName} Internal SEMS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {festName} Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Select your authorized staff role to enter the internal event management dashboard.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.role}
                onClick={() => onSelectRole(card.role)}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permitted Modules:</p>
                    {card.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-800">
                  <span>Enter as {card.role}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Hidaya School Event Management System • Internal MVP 2026</span>
        </div>
      </div>
    </div>
  );
};
