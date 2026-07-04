import React from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Trophy, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { House, FestEvent, Student, StudentRegistration, EventResultRecord } from '../../types/festival';
import { NavTab } from '../layout/Sidebar';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

type DashboardApiHouse = {
  rank: number | null;
  house_id: string;
  house_name: string;
  house_code: string;
  house_color: string;
  total_house_points: number;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
  participation_count?: number;
};

type DashboardApiResponse = {
  total_students: number;
  total_houses: number;
  total_events: number;
  total_registrations: number;
  pending_registrations: number;
  completed_events: number;
  active_events: number;
  total_house_points: number;
  house_rankings: DashboardApiHouse[];
  top_performing_houses: DashboardApiHouse[];
  recent_results: Array<Record<string, any>>;
  participation_statistics: Record<string, number>;
};

interface DashboardViewProps {
  houses: House[];
  events: FestEvent[];
  students: Student[];
  registrations: StudentRegistration[];
  results: EventResultRecord[];
  onSelectTab: (tab: NavTab) => void;
  onSelectEventForResults: (eventId: string) => void;
  totalSchoolStudentsCount: number;
  dashboardData?: DashboardApiResponse | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  houses,
  events,
  students,
  registrations,
  results,
  onSelectTab,
  onSelectEventForResults,
  totalSchoolStudentsCount,
  dashboardData,
  loading = false,
  error = null,
  onRetry
}) => {
  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  const totalHousePoints = dashboardData?.total_house_points ?? houses.reduce((acc, h) => acc + h.points, 0);
  const totalStudents = dashboardData?.total_students ?? totalSchoolStudentsCount;
  const totalEvents = dashboardData?.total_events ?? events.length;
  const totalRegistrations = dashboardData?.total_registrations ?? registrations.length;
  const pendingRegistrations = dashboardData?.pending_registrations ?? students.filter(s => s.registeredEventIds.length === 0).length;
  const completedEvents = dashboardData?.completed_events ?? events.filter(e => e.status === 'Completed').length;
  const activeEvents = dashboardData?.active_events ?? events.filter(e => e.status === 'In Progress').length;
  const houseRankingRows = dashboardData?.house_rankings ?? sortedHouses.map((house, index) => ({
    rank: index + 1,
    house_id: house.id,
    house_name: house.name,
    house_code: house.id,
    house_color: house.color,
    total_house_points: house.points,
    gold_count: house.gold,
    silver_count: house.silver,
    bronze_count: house.bronze,
  }));
  const topHouses = dashboardData?.top_performing_houses ?? houseRankingRows.slice(0, 3);

  const registeredParticipantCount = dashboardData?.participation_statistics?.registrations ?? registrations.length;
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').length;

  // Chart data for house points
  const houseChartData = sortedHouses.map(h => ({
    name: h.name,
    points: h.points,
    color: h.color
  }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-6 text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Dashboard unavailable</h3>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if ((dashboardData && totalStudents === 0 && totalEvents === 0 && totalRegistrations === 0) || (!dashboardData && houses.length === 0 && events.length === 0 && students.length === 0 && registrations.length === 0)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
          <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No dashboard data yet</h3>
          <p className="text-sm text-slate-500 mt-2">Once events, registrations, and results are available, the dashboard will populate automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
              Enrolled
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hidaya School Primary & Secondary</span>
          </div>
        </div>

        {/* Card 2: Registered Participants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Participants</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{registeredParticipantCount}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> {Math.round((registeredParticipantCount / (totalStudents || 1)) * 100)}%
              </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across Junior & Senior literary disciplines
          </div>
        </div>

        {/* Card 3: Total Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Events</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalEvents}</span>
            <span className="text-xs text-slate-500">English Fest 2026</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="text-amber-600 font-semibold">{activeEvents} Live</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600 font-semibold">{upcomingEvents} Upcoming</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-600 font-semibold">{completedEvents} Done</span>
          </div>
        </div>

        {/* Card 4: House Points */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total House Points</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalHousePoints}</span>
            <span className="text-xs text-slate-500">pts total</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across 5 internal school house teams
          </div>
        </div>
      </div>

      {/* Main Grid: House Rankings & Event Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* House Rankings Section (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> House Rankings & Championship Points
              </h3>
              <p className="text-xs text-slate-500">Points computed automatically from official event marks entry</p>
            </div>

            <button
              onClick={() => onSelectTab('leaderboard')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Full Leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {houseRankingRows.map((house, idx) => {
              const maxPoints = Math.max(...houseRankingRows.map(h => h.total_house_points), 1);
              const percentage = Math.round((house.total_house_points / maxPoints) * 100);

              return (
                <div key={house.house_id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 transition-all hover:bg-white hover:shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        idx === 0 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-800/10 text-amber-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{house.house_name}</h4>
                        <p className="text-[11px] text-slate-500">House Code: {house.house_code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Medals */}
                      <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-200">🥇 {house.gold_count}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">🥈 {house.silver_count}</span>
                        <span className="px-2 py-0.5 bg-amber-800/10 text-amber-900 rounded-md">🥉 {house.bronze_count}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">{house.total_house_points}</span>
                        <span className="text-xs font-semibold text-slate-500 ml-1">pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: house.house_color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Widget */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">House Point Bar Chart</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={houseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="points" radius={[8, 8, 0, 0]} barSize={36}>
                    {houseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column Stack: Event Progress & Recent Registrations */}
        <div className="space-y-6">
          {/* Event Progress Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Event Progress
              </h3>
              <button
                onClick={() => onSelectTab('events')}
                className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                View Events
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-4">
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Festival Completion Status</span>
                <span>{Math.round((completedEvents / (events.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completedEvents / (events.length || 1)) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {completedEvents} of {events.length} events completed & evaluated.
              </p>
            </div>

            {/* List of In-Progress & Next Events */}
            <div className="space-y-2.5">
            {events.slice(0, 4).map(ev => {
                const isCompleted = ev.status === 'Completed';
                const isInProgress = ev.status === 'In Progress';

                return (
                  <div key={ev.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ev.name}</p>
                      <p className="text-[10px] text-slate-500">{ev.level} • {ev.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      isInProgress ? 'bg-red-100 text-red-700 animate-pulse' :
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Registrations Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Student Registrations</h3>
              <button
                onClick={() => onSelectTab('registration')}
                className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                Register
              </button>
            </div>

            <div className="space-y-2.5">
              {students.slice(0, 5).map(st => {
                const house = houses.find(h => h.id === st.houseId);

                return (
                  <div key={st.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{st.name}</p>
                      <p className="text-[10px] text-slate-500">{st.admissionNo} • Class {st.className}-{st.division}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${house?.badgeBg}`}>
                      {house?.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Bottom Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Upcoming English Fest Events
            </h3>
            <p className="text-xs text-slate-500">Upcoming competitions ready for marks entry</p>
          </div>
          <button
            onClick={() => onSelectTab('results')}
            className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
          >
            Result Entry Desk
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {events.filter(e => e.status === 'Upcoming' || e.status === 'In Progress').slice(0, 4).map(ev => {
            const resultObj = results.find(r => r.eventId === ev.id);
            const isPublished = resultObj?.isPublished;

            return (
              <div
                key={ev.id}
                onClick={() => {
                  onSelectEventForResults(ev.id);
                  onSelectTab('results');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/60 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{ev.name}</span>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {ev.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{ev.category} • {ev.duration}</p>

                <div className="pt-1 flex items-center justify-between">
                  {isPublished ? (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Results Published
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Enter Marks
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
