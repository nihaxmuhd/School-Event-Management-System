import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, ArrowRight } from 'lucide-react';
import { Student, House, GenderType } from '../../types/festival';
import { parseCSV, downloadCSV } from '../../utils/festivalUtils';

interface ExcelImportModalProps {
  existingStudents: Student[];
  houses: House[];
  onClose: () => void;
  onImport: (students: Omit<Student, 'id' | 'registeredEventIds'>[]) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

interface ParsedRow {
  admissionNo: string;
  name: string;
  gender: string;
  className: string;
  division: string;
  house: string;
  valid: boolean;
  reason?: string;
}

type Step = 'upload' | 'validate';

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  existingStudents,
  houses,
  onClose,
  onImport,
  onShowToast
}) => {
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resolveHouse = (val: string): House | undefined => {
    const v = val.trim().toLowerCase();
    return houses.find(h =>
      h.id.toLowerCase() === v ||
      h.name.toLowerCase() === v ||
      h.name.toLowerCase().replace(' house', '') === v.replace(' house', '')
    );
  };

  const processText = (text: string, name: string) => {
    setFileName(name);
    const parsed = parseCSV(text);
    if (parsed.length < 2) {
      onShowToast('Empty File', 'No data rows found in the file.', 'error');
      return;
    }

    // Detect header, map columns flexibly
    const header = parsed[0].map(c => c.toLowerCase().trim());
    const idx = {
      adm: header.findIndex(h => h.includes('admission') || h === 'adm' || h.includes('adm no')),
      name: header.findIndex(h => h.includes('name')),
      gender: header.findIndex(h => h.includes('gender') || h.includes('sex')),
      className: header.findIndex(h => h === 'class' || h.includes('class') || h.includes('grade')),
      division: header.findIndex(h => h.includes('division') || h.includes('div') || h.includes('section')),
      house: header.findIndex(h => h.includes('house'))
    };

    const seenInFile = new Set<string>();
    const dataRows = parsed.slice(1);
    const result: ParsedRow[] = dataRows.map(cells => {
      const admissionNo = (idx.adm >= 0 ? cells[idx.adm] : cells[0] || '').trim();
      const name = (idx.name >= 0 ? cells[idx.name] : cells[1] || '').trim();
      const gender = (idx.gender >= 0 ? cells[idx.gender] : cells[2] || '').trim();
      const className = (idx.className >= 0 ? cells[idx.className] : cells[3] || '').trim();
      const division = (idx.division >= 0 ? cells[idx.division] : cells[4] || '').trim();
      const house = (idx.house >= 0 ? cells[idx.house] : cells[5] || '').trim();

      let valid = true;
      let reason = '';

      if (!admissionNo || !name) { valid = false; reason = 'Missing admission no / name'; }
      else if (existingStudents.some(s => s.admissionNo.toLowerCase() === admissionNo.toLowerCase())) { valid = false; reason = 'Duplicate — already exists'; }
      else if (seenInFile.has(admissionNo.toLowerCase())) { valid = false; reason = 'Duplicate within file'; }
      else if (!resolveHouse(house)) { valid = false; reason = `Unknown house "${house}"`; }

      if (valid) seenInFile.add(admissionNo.toLowerCase());

      return { admissionNo, name, gender, className, division, house, valid, reason };
    });

    setRows(result);
    setStep('validate');
  };

  const handleFile = (file: File) => {
    const nameLower = file.name.toLowerCase();
    if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls')) {
      onShowToast(
        'Convert to CSV',
        'Native .xlsx parsing needs a converter. Please export your sheet as CSV (File → Save As → CSV) and re-upload. Column order: Admission, Name, Gender, Class, Division, House.',
        'info'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => processText(String(e.target?.result || ''), file.name);
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    downloadCSV('student_import_template.csv', [
      ['Admission Number', 'Student Name', 'Gender', 'Class', 'Division', 'House'],
      ['HS-2024-201', 'Sample Student', 'Male', '9', 'A', 'Blue House'],
      ['HS-2024-202', 'Another Student', 'Female', '10', 'B', 'Green House']
    ]);
  };

  const validRows = rows.filter(r => r.valid);
  const invalidRows = rows.filter(r => !r.valid);

  const handleConfirmImport = () => {
    if (validRows.length === 0) {
      onShowToast('Nothing to Import', 'No valid rows available.', 'error');
      return;
    }
    const toImport = validRows.map(r => {
      const house = resolveHouse(r.house)!;
      const gender: GenderType = r.gender.toLowerCase().startsWith('f') ? 'Female' : 'Male';
      return {
        admissionNo: r.admissionNo,
        name: r.name,
        className: r.className || '8',
        division: r.division || 'A',
        gender,
        houseId: house.id,
        status: 'Active' as const
      };
    });
    onImport(toImport);
    onShowToast('Import Complete', `${toImport.length} students imported. ${invalidRows.length} skipped.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Bulk Import Students
            </h3>
            <p className="text-xs text-slate-500">Upload → Validate → Import • Duplicates are auto-reported</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 text-[11px] font-bold shrink-0">
          <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${step === 'upload' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            1. Upload
          </span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${step === 'validate' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            2. Validate & Import
          </span>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-300 hover:bg-slate-50'}`}
              >
                <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-emerald-500' : 'text-slate-400'}`} />
                <p className="text-sm font-bold text-slate-700">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Columns: Admission Number, Student Name, Gender, Class, Division, House</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,text/csv"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-slate-800">Need the format?</p>
                  <p className="text-slate-500">Download a ready-to-fill CSV template.</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" /> Template
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                Excel (.xlsx) files should be saved as CSV first (File → Save As → CSV UTF-8). The importer reads standard comma-separated values.
              </p>
            </div>
          )}

          {step === 'validate' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">{fileName}</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {validRows.length} Valid</span>
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {invalidRows.length} Skipped</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-72">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0">
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Admission</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3">House</th>
                        <th className="py-2.5 px-3">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r, i) => (
                        <tr key={i} className={r.valid ? '' : 'bg-red-50/40'}>
                          <td className="py-2.5 px-3">
                            {r.valid
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              : <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{r.admissionNo || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name || '—'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.className}-{r.division}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.house || '—'}</td>
                          <td className="py-2.5 px-3 text-[11px] text-red-600">{r.reason || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          {step === 'validate' ? (
            <button onClick={() => setStep('upload')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer">
              Back
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer">Cancel</button>
            {step === 'validate' && (
              <button
                onClick={handleConfirmImport}
                disabled={validRows.length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Import {validRows.length} Students
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
