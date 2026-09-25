import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { StudentProfile } from '../types.ts';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const SAMPLE_BATCH: Partial<StudentProfile>[] = [
  { name: 'Aarav Malhotra', email: 'aarav.m@campus.edu', rollNo: '22CS1102', cgpa: 8.75, branch: 'Computer Science', batch: 2026, backlogs: 0, skills: ['Python', 'Django', 'React', 'Docker'] },
  { name: 'Bhavna Kulkarni', email: 'bhavna.k@campus.edu', rollNo: '22IT1088', cgpa: 7.60, branch: 'Information Technology', batch: 2026, backlogs: 0, skills: ['Java', 'Spring Boot', 'MySQL'] },
  { name: 'Chetan Rao', email: 'chetan.r@campus.edu', rollNo: '22EC1095', cgpa: 6.90, branch: 'Electronics & Communication', batch: 2026, backlogs: 1, skills: ['Embedded C', 'MATLAB', 'VLSI'] },
  { name: 'Deepa Sen', email: 'deepa.s@campus.edu', rollNo: '22CS1115', cgpa: 9.10, branch: 'Computer Science', batch: 2026, backlogs: 0, skills: ['Go', 'Kubernetes', 'Distributed Systems'] },
  { name: 'Eshwar Murthy', email: 'eshwar.m@campus.edu', rollNo: '22ME1045', cgpa: 7.20, branch: 'Mechanical Engineering', batch: 2026, backlogs: 0, skills: ['Python', 'SolidWorks', 'Data Analysis'] },
  { name: 'Farhan Zaidi', email: 'farhan.z@campus.edu', rollNo: '22EE1032', cgpa: 7.80, branch: 'Electrical Engineering', batch: 2026, backlogs: 0, skills: ['Power BI', 'SQL', 'Python'] },
  { name: 'Gauri Joshi', email: 'gauri.j@campus.edu', rollNo: '22CS1120', cgpa: 8.35, branch: 'Computer Science', batch: 2026, backlogs: 0, skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'] },
  { name: 'Harsh Vardhan', email: 'harsh.v@campus.edu', rollNo: '22IT1092', cgpa: 7.15, branch: 'Information Technology', batch: 2026, backlogs: 0, skills: ['JavaScript', 'Node.js', 'MongoDB'] },
];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { token } = useAuth();
  const [csvText, setCsvText] = useState(
    'Name,Email,RollNo,CGPA,Branch,Batch,Backlogs,Skills\n' +
      SAMPLE_BATCH.map(
        (s) =>
          `${s.name},${s.email},${s.rollNo},${s.cgpa},${s.branch},${s.batch},${s.backlogs},"${s.skills?.join(';')}"`
      ).join('\n')
  );
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async (studentsToUpload: Partial<StudentProfile>[]) => {
    setLoading(true);
    setError(null);
    setResultMsg(null);

    try {
      const res = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students: studentsToUpload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import students');
      }

      setResultMsg(data.message || `Successfully processed ${studentsToUpload.length} students.`);
      onImportComplete();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error importing students');
    } finally {
      setLoading(false);
    }
  };

  const parseCsvAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        throw new Error('CSV text must contain headers and at least one student row.');
      }

      const parsed: Partial<StudentProfile>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 5) {
          parsed.push({
            name: parts[0]?.trim(),
            email: parts[1]?.trim(),
            rollNo: parts[2]?.trim(),
            cgpa: parseFloat(parts[3]?.trim()) || 7.0,
            branch: parts[4]?.trim() || 'Computer Science',
            batch: parseInt(parts[5]?.trim(), 10) || 2026,
            backlogs: parseInt(parts[6]?.trim(), 10) || 0,
            skills: parts[7] ? parts[7].replace(/"/g, '').split(';').map((s) => s.trim()) : ['Python', 'SQL'],
          });
        }
      }

      if (parsed.length === 0) {
        throw new Error('Could not parse any valid student records from CSV.');
      }

      handleImport(parsed);
    } catch (err: any) {
      setError(err.message || 'CSV format error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bulk Import Students</h2>
              <p className="text-xs text-slate-500">
                Enroll student batches in bulk via CSV format or one-click preset
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={parseCsvAndSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {resultMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{resultMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">CSV Data Format</label>
            <button
              type="button"
              onClick={() => handleImport(SAMPLE_BATCH)}
              className="text-xs text-purple-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Quick Import Demo Batch (8 Students)
            </button>
          </div>

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
          />

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500">
            <strong>Columns format:</strong> Name, Email, RollNo, CGPA, Branch, Batch, Backlogs, Skills (semicolon separated).
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Import Student Records</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
