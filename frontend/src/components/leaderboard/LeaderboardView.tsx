import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Search, 
  PartyPopper
} from 'lucide-react';
import { House } from '../../types/festival';

interface LeaderboardViewProps {
  houses: House[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  houses
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  const top1 = sortedHouses[0];
  const top2 = sortedHouses[1];
  const top3 = sortedHouses[2];

  const handleCelebrateLeader = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const filteredHouses = sortedHouses.filter(h => 
    h.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.captainName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Celebration Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> HIDAYA SCHOOL HOUSE CHAMPIONSHIP
            </span>
            <span className="text-xs text-slate-400">• English Fest 2026</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Inter-House Championship Shield Standings
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Points are computed automatically from verified judge mark scorecards across 5 internal school houses.
          </p>
        </div>

        <button
          onClick={handleCelebrateLeader}
          className="relative z-10 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer shrink-0"
        >
          <PartyPopper className="w-4 h-4" />
          <span>Celebrate #1 House ({top1?.name})</span>
        </button>

        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Podium Cards (3 Top Houses) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* 2nd Place */}
        {top2 && (
          <div className="order-2 md:order-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative flex flex-col items-center text-center hover:border-slate-300 transition-all">
            <span className="absolute -top-3 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-full border border-slate-200">
              🥈 Rank #2
            </span>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold my-3" style={{ backgroundColor: top2.color }}>
              #{2}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{top2.name}</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Captain: {top2.captainName}</p>
            <div className="text-3xl font-black text-slate-900">{top2.points} <span className="text-xs text-slate-400 font-semibold">pts</span></div>
            
            <div className="flex items-center gap-2 mt-4 text-xs font-bold">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">🥇 {top2.gold} Gold</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">🥈 {top2.silver} Silver</span>
              <span className="px-2.5 py-1 bg-amber-900/10 text-amber-900 rounded-lg">🥉 {top2.bronze} Bronze</span>
            </div>
          </div>
        )}

        {/* 1st Place (Center Hero Podium) */}
        {top1 && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white rounded-2xl border-2 border-amber-400 p-6 shadow-xl relative flex flex-col items-center text-center transform -translate-y-2">
            <span className="absolute -top-4 px-4 py-1.5 bg-amber-400 text-slate-950 text-xs font-extrabold rounded-full shadow-md flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> 🥇 RANK #1 CHAMPION
            </span>
            <div className="w-14 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black my-3" style={{ backgroundColor: top1.color }}>
              #1
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">{top1.name}</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Captain: {top1.captainName}</p>
            <div className="text-4xl font-black text-slate-900">{top1.points} <span className="text-sm text-slate-400 font-semibold">pts</span></div>
            
            <div className="flex items-center gap-2 mt-4 text-xs font-bold">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">🥇 {top1.gold} Gold</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">🥈 {top1.silver} Silver</span>
              <span className="px-2.5 py-1 bg-amber-900/10 text-amber-900 rounded-lg">🥉 {top1.bronze} Bronze</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div className="order-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative flex flex-col items-center text-center hover:border-slate-300 transition-all">
            <span className="absolute -top-3 px-3 py-1 bg-amber-900/10 text-amber-900 text-xs font-black rounded-full border border-amber-900/20">
              🥉 Rank #3
            </span>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold my-3" style={{ backgroundColor: top3.color }}>
              #{3}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{top3.name}</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Captain: {top3.captainName}</p>
            <div className="text-3xl font-black text-slate-900">{top3.points} <span className="text-xs text-slate-400 font-semibold">pts</span></div>
            
            <div className="flex items-center gap-2 mt-4 text-xs font-bold">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">🥇 {top3.gold} Gold</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">🥈 {top3.silver} Silver</span>
              <span className="px-2.5 py-1 bg-amber-900/10 text-amber-900 rounded-lg">🥉 {top3.bronze} Bronze</span>
            </div>
          </div>
        )}
      </div>

      {/* House Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">5 School House Standings</h3>
            <p className="text-xs text-slate-500">Tally of total points, gold, silver, bronze counts and overall rank</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search house or captain..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">House Name</th>
                <th className="py-3 px-4">House Captain</th>
                <th className="py-3 px-4 text-center">Gold Count</th>
                <th className="py-3 px-4 text-center">Silver Count</th>
                <th className="py-3 px-4 text-center">Bronze Count</th>
                <th className="py-3 px-4 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHouses.map((house, idx) => {
                return (
                  <tr key={house.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                        idx === 1 ? 'bg-slate-200 text-slate-800' :
                        idx === 2 ? 'bg-amber-900/20 text-amber-950' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: house.color }} />
                        <span className="font-extrabold text-slate-900 text-sm">{house.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {house.captainName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                      🥇 {house.gold}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                      🥈 {house.silver}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-900">
                      🥉 {house.bronze}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-base font-black text-slate-900">{house.points}</span>
                      <span className="text-[11px] text-slate-400 ml-1">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
