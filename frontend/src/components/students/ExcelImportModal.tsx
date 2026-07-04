import React, { useRef, useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, ArrowRight } from 'lucide-react';
import { House } from '../../types/festival';
import { downloadCSV } from '../../utils/festivalUtils';

interface ExcelImportModalProps {
  houses: House[];
  onClose: () => void;
  onImport: (students: any[]) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ houses, onClose, onImport, onShowToast }) => {
  const [step, setStep] = useState<'upload' | 'validate'>('upload');
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    downloadCSV('student_import_template.csv', [
      ['Admission Number', 'Student Name', 'Gender', 'Class', 'Division', 'House'],
      ['HS-2024-201', 'Sample Student', 'Male', '9', 'A', 'Blue House'],
    ]);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setRows([{ valid: true, admissionNo: 'Ready for upload', name: file.name, className: '', division: '', house: '', reason: '' }]);
    setStep('validate');
    fileRef.current = null;
  };

  const handleConfirmImport = () => {
    const fileInput = fileRef.current;
    const file = fileInput?.files?.[0];
    if (!file) {
      onShowToast('Import Failed', 'Please select a file to upload.', 'error');
      return;
    }
    setUploading(true);
    setBackendErrors([]);
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/v1/students/import/');
    xhr.setRequestHeader('Accept', 'application/json');
    const token = localStorage.getItem('hidaya_sems_auth');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        xhr.setRequestHeader('Authorization', `Bearer ${parsed.accessToken}`);
      } catch {}
    }
    xhr.upload.onprogress = () => {};
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        onShowToast('Import Success', 'Students imported successfully.');
        onImport([]);
        onClose();
      } else {
        const data = JSON.parse(xhr.responseText || '{}');
        const errors = data?.errors ? [JSON.stringify(data.errors)] : [data?.message || 'Import failed.'];
        setBackendErrors(errors);
        onShowToast('Import Failed', errors[0], 'error');
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setBackendErrors(['Network error while importing students.']);
      onShowToast('Import Failed', 'Network error while importing students.', 'error');
    };
    xhr.send(formData);
  };

  const validRows = rows;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Bulk Import Students</h3>
            <p className="text-xs text-slate-500">Upload → Validate → Import</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 text-[11px] font-bold shrink-0">
          <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${step === 'upload' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>1. Upload</span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${step === 'validate' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>2. Validate & Import</span>
        </div>
        <div className="p-6 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-300 hover:bg-slate-50'}`}>
                <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-emerald-500' : 'text-slate-400'}`} />
                <p className="text-sm font-bold text-slate-700">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Excel imports use the backend importer directly.</p>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              </div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-xs text-slate-600"><p className="font-bold text-slate-800">Need the format?</p><p className="text-slate-500">Download a ready-to-fill CSV template.</p></div>
                <button onClick={downloadTemplate} className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"><Download className="w-4 h-4" /> Template</button>
              </div>
            </div>
          )}
          {step === 'validate' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">{fileName}</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
              </div>
              {backendErrors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {backendErrors.map((err, index) => <div key={index}>{err}</div>)}
                </div>
              )}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-72">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0">
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Status</th><th className="py-2.5 px-3">Admission</th><th className="py-2.5 px-3">Name</th><th className="py-2.5 px-3">Class</th><th className="py-2.5 px-3">House</th><th className="py-2.5 px-3">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validRows.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{r.admissionNo || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name || '—'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.className || '—'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.house || houses[0]?.name || '—'}</td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500">Backend validation will run on import</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          {step === 'validate' ? <button onClick={() => setStep('upload')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer">Back</button> : <span />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer">Cancel</button>
            {step === 'validate' && (
              <button onClick={handleConfirmImport} disabled={uploading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {uploading ? 'Importing...' : 'Import Students'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
