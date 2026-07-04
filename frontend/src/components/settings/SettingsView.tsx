import React, { useState } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  FileText,
  Trophy
} from 'lucide-react';
import { SchoolFestConfig, PointSettings } from '../../types/festival';

interface SettingsViewProps {
  config: SchoolFestConfig;
  onUpdateConfig: (newConfig: SchoolFestConfig) => void;
  onResetData: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onUpdateConfig,
  onResetData,
  onShowToast,
}) => {
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [festName, setFestName] = useState(config.festName);
  const [academicYear, setAcademicYear] = useState(config.academicYear);
  const [tagline, setTagline] = useState(config.tagline);
  const [totalStudentsCount, setTotalStudentsCount] = useState(config.totalStudentsCount);
  const [points, setPoints] = useState<PointSettings>(config.pointSettings);
  const [reportLoading, setReportLoading] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const setPointField = (field: keyof PointSettings, value: number) => {
    setPoints(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: SchoolFestConfig = {
      schoolName,
      festName,
      academicYear,
      tagline,
      totalStudentsCount: Number(totalStudentsCount),
      pointSettings: {
        first: Number(points.first),
        second: Number(points.second),
        third: Number(points.third),
        participation: Number(points.participation),
        gradeA: Number(points.gradeA),
        gradeB: Number(points.gradeB),
        gradeC: Number(points.gradeC)
      }
    };

    onUpdateConfig(updated);
    onShowToast('Settings Saved', 'System settings & point rules updated. House points recalculated.');
  };

  const handleDownloadReport = async (report: 'students' | 'houses' | 'events' | 'registrations' | 'results' | 'leaderboard', format: 'csv' | 'xlsx' | 'pdf') => {
    setReportLoading(`${report}-${format}`);
    setReportError(null);
    try {
      const response = await axios.get(`/api/v1/reports/${report}/?format=${format}`, {
        responseType: 'blob',
        onDownloadProgress: (event) => {
          if (event.total) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setReportLoading(`${report}-${format}-${pct}`);
          }
        },
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report}_report.${format === 'xlsx' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onShowToast('Report Downloaded', `${report} report exported as ${format.toUpperCase()}.`);
    } catch (error: any) {
      const message = error?.response?.data?.message || `Unable to download ${report} report.`;
      setReportError(message);
      onShowToast('Report Download Failed', message, 'error');
    } finally {
      setReportLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" /> SEMS System & Festival Parameters
          </h3>
          <p className="text-xs text-slate-500">
            Configure Hidaya School identity, event parameters, and system backups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form (2 Cols) */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">School & Festival Metadata</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Festival Name</label>
                <input
                  type="text"
                  required
                  value={festName}
                  onChange={(e) => setFestName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total School Enrollment</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={totalStudentsCount}
                  onChange={(e) => setTotalStudentsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">System Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

          </div>

          {/* Point System Configuration Card (Super Admin exclusive) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Point System Configuration</h4>
                <p className="text-[11px] text-slate-500">House points are calculated live from these values — no hardcoded points.</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Position Points</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {([
                  { key: 'first', label: '🥇 1st Place', ring: 'focus:ring-amber-500/20' },
                  { key: 'second', label: '🥈 2nd Place', ring: 'focus:ring-slate-500/20' },
                  { key: 'third', label: '🥉 3rd Place', ring: 'focus:ring-orange-500/20' },
                  { key: 'participation', label: 'Participation', ring: 'focus:ring-emerald-500/20' }
                ] as { key: keyof PointSettings; label: string; ring: string }[]).map(f => (
                  <div key={f.key}>
                    <label className="block font-bold text-slate-700 mb-1">{f.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={points[f.key]}
                      onChange={(e) => setPointField(f.key, Number(e.target.value))}
                      className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${f.ring}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Grade Bonus Points</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {([
                  { key: 'gradeA', label: 'Grade A' },
                  { key: 'gradeB', label: 'Grade B' },
                  { key: 'gradeC', label: 'Grade C' }
                ] as { key: keyof PointSettings; label: string }[]).map(f => (
                  <div key={f.key}>
                    <label className="block font-bold text-slate-700 mb-1">{f.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={points[f.key]}
                      onChange={(e) => setPointField(f.key, Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save System & Point Settings</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Data Maintenance Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Reports Download Center
            </h4>

            <p className="text-xs text-slate-500">
              Download backend-generated reports in PDF, Excel, or CSV format.
            </p>

            {reportError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-[11px]">
                {reportError}
              </div>
            )}

            {([
              ['students', 'Student Reports'],
              ['houses', 'House Reports'],
              ['events', 'Event Reports'],
              ['registrations', 'Registration Reports'],
              ['results', 'Result Reports'],
              ['leaderboard', 'Leaderboard Reports'],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                  <span className="text-[10px] text-slate-400">{reportLoading?.startsWith(key) ? 'Downloading...' : 'Ready'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => void handleDownloadReport(key, 'pdf')} className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => void handleDownloadReport(key, 'xlsx')} className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Excel
                  </button>
                  <button onClick={() => void handleDownloadReport(key, 'csv')} className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-red-600 mb-1">Reset School SEMS Data</h5>
              <p className="text-[11px] text-slate-400 mb-3">
                Restores original Hidaya School English Fest 2026 dataset.
              </p>

              <button
                onClick={onResetData}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Sample SEMS Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
