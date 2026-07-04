import React, { useState, useEffect } from 'react';
import { CheckCircle2, Send, Calculator, Lock, Unlock, Save } from 'lucide-react';
import { FestEvent, Student, House, EventResultRecord, StudentRegistration, ParticipantMarkScore } from '../../types/festival';

interface ResultEntryViewProps {
  events: FestEvent[];
  students: Student[];
  houses: House[];
  registrations: StudentRegistration[];
  results: EventResultRecord[];
  selectedEventId?: string;
  onSaveResult: (result: EventResultRecord) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const ResultEntryView: React.FC<ResultEntryViewProps> = ({
  events,
  students,
  houses,
  registrations,
  results,
  selectedEventId,
  onSaveResult,
  onShowToast,
  loading,
  error,
  onRetry,
}) => {
  const [currentEventId, setCurrentEventId] = useState<string>(selectedEventId || events[0]?.id || '');
  const [isPublished, setIsPublished] = useState(false);
  const [marksState, setMarksState] = useState<Record<string, number>>({});

  const activeEvent = events.find((e) => e.id === currentEventId) || events[0];
  const existingResult = results.find((r) => r.eventId === activeEvent?.id);

  useEffect(() => {
    if (selectedEventId) setCurrentEventId(selectedEventId);
  }, [selectedEventId]);

  useEffect(() => {
    if (!activeEvent) return;
    if (existingResult) {
      setIsPublished(existingResult.isPublished);
      const initialMarks: Record<string, number> = {};
      existingResult.scores.forEach((s) => {
        initialMarks[s.studentId] = s.marks;
      });
      setMarksState(initialMarks);
      return;
    }

    setIsPublished(false);
    const registeredStudentIds = registrations.filter((r) => r.eventId === activeEvent.id).map((r) => r.studentId);
    const participantStudents = students.filter((s) => registeredStudentIds.includes(s.id) || s.registeredEventIds.includes(activeEvent.id));
    const initialMarks: Record<string, number> = {};
    const fallbackList = participantStudents.length > 0 ? participantStudents : students.slice(0, 4);
    fallbackList.forEach((st) => {
      initialMarks[st.id] = 0;
    });
    setMarksState(initialMarks);
  }, [activeEvent, existingResult, registrations, students]);

  const registeredStudentIds = registrations.filter((r) => r.eventId === activeEvent?.id).map((r) => r.studentId);
  const participantStudents = students.filter((s) => registeredStudentIds.includes(s.id) || (activeEvent && s.registeredEventIds.includes(activeEvent.id)));
  const activeParticipantList = participantStudents.length > 0 ? participantStudents : students.slice(0, 4);

  const displayScoresList: ParticipantMarkScore[] = (existingResult?.scores.length ? existingResult.scores : activeParticipantList.map((st) => ({
    studentId: st.id,
    studentName: st.name,
    admissionNo: st.admissionNo,
    houseId: st.houseId,
    marks: marksState[st.id] ?? 0,
    grade: 'A',
    position: 0,
    housePoints: 0,
  }))).map((score) => ({ ...score }));

  const handleMarkChange = (studentId: string, val: number) => {
    const num = Math.min(100, Math.max(0, val));
    setMarksState((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSaveResult = (publishStatus: boolean) => {
    if (!activeEvent) return;
    const newResultRecord: EventResultRecord = {
      eventId: activeEvent.id,
      publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isPublished: publishStatus,
      scores: activeParticipantList.map((st) => ({
        studentId: st.id,
        studentName: st.name,
        admissionNo: st.admissionNo,
        houseId: st.houseId,
        marks: marksState[st.id] ?? 0,
        grade: 'A',
        position: 0,
        housePoints: 0,
      })),
    };
    onSaveResult(newResultRecord);
    setIsPublished(publishStatus);
    onShowToast(publishStatus ? 'Results Published to Leaderboard!' : 'Draft Saved', publishStatus ? `Official scores for "${activeEvent.name}" published.` : `Saved scorecard draft for ${activeEvent.name}`);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={onRetry} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold">
            Retry
          </button>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Event to Enter Marks</label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {events.map((ev) => {
            const hasResult = results.some((r) => r.eventId === ev.id && r.isPublished);
            const isSelected = ev.id === activeEvent?.id;
            return (
              <button key={ev.id} onClick={() => setCurrentEventId(ev.id)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80'}`}>
                <span>{ev.name}</span>
                <span className="text-[10px] font-mono opacity-70">({ev.category})</span>
                {hasResult ? <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-500'}`} /> : <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-300'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {activeEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{activeEvent.name}</h3>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{activeEvent.level}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Category: {activeEvent.category} • Duration: {activeEvent.duration}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 border ${isPublished ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                  {isPublished ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {isPublished ? 'PUBLISHED' : 'DRAFT MODE'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <Calculator className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Manager Instructions:</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Enter participant marks below. Rankings and house points are resolved by the backend.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Admission No</th>
                    <th className="py-3 px-3">House</th>
                    <th className="py-3 px-3 w-28">Enter Marks (100)</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Calculated Position</th>
                    <th className="py-3 px-3 text-right">House Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading results...</td></tr>
                  ) : displayScoresList.map((sc) => {
                    const house = houses.find((h) => h.id === sc.houseId);
                    return (
                      <tr key={sc.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{sc.studentName}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-600">{sc.admissionNo}</td>
                        <td className="py-3 px-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${house?.badgeBg}`}>{house?.name}</span></td>
                        <td className="py-3 px-3">
                          <input type="number" min={0} max={100} value={marksState[sc.studentId] ?? sc.marks} onChange={(e) => handleMarkChange(sc.studentId, Number(e.target.value))} className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </td>
                        <td className="py-3 px-3 text-center font-black text-sm">—</td>
                        <td className="py-3 px-3 text-center font-bold">—</td>
                        <td className="py-3 px-3 text-right"><span className="text-base font-black text-slate-900">—</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button type="button" onClick={() => handleSaveResult(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5">
                <Save className="w-4 h-4" /><span>Save Draft Marks</span>
              </button>
              <button type="button" onClick={() => handleSaveResult(true)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2">
                <Send className="w-4 h-4" /><span>Publish Official Results to Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
