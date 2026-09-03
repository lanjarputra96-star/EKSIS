import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Users,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Member, Extracurricular } from '../types';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ekskuls: Extracurricular[];
  availableClasses?: string[];
  onImportMembers: (newMembers: Member[]) => void;
}

interface ParsedRow {
  id: string;
  fullName: string;
  studentId: string;
  classGrade: string;
  gender: 'L' | 'P';
  phone: string;
  email: string;
  ekskulId: string;
  ekskulName: string;
  role: string;
  status: 'active' | 'pending';
  motivation?: string;
  isValid: boolean;
  validationError?: string;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  ekskuls,
  availableClasses = [],
  onImportMembers,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [defaultEkskulId, setDefaultEkskulId] = useState<string>(ekskuls[0]?.id || '');
  const [defaultStatus, setDefaultStatus] = useState<'active' | 'pending'>('active');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Generate & Download Excel Template
  const handleDownloadTemplate = () => {
    const sampleEkskul = ekskuls[0]?.name || 'PMR Wira';
    const sampleClass = availableClasses[0] || 'X MIPA 1';

    const templateData = [
      {
        'No': 1,
        'Nama Lengkap': 'Ahmad Fauzi Pratama',
        'NISN / NIS': '20261011',
        'Kelas': sampleClass,
        'Jenis Kelamin (L/P)': 'L',
        'No WhatsApp': '081234567891',
        'Email': 'ahmad.fauzi@sekolah.sch.id',
        'Cabang Ekskul': sampleEkskul,
        'Jabatan': 'Anggota',
        'Status (Aktif/Pending)': 'Aktif',
        'Motivasi': 'Ingin mengembangkan bakat dan berprestasi',
      },
      {
        'No': 2,
        'Nama Lengkap': 'Siti Nurhaliza Putri',
        'NISN / NIS': '20261012',
        'Kelas': availableClasses[1] || 'X MIPA 2',
        'Jenis Kelamin (L/P)': 'P',
        'No WhatsApp': '081298765432',
        'Email': 'siti.nurhaliza@sekolah.sch.id',
        'Cabang Ekskul': ekskuls[1]?.name || sampleEkskul,
        'Jabatan': 'Sekretaris',
        'Status (Aktif/Pending)': 'Aktif',
        'Motivasi': 'Menambah pengalaman kepemimpinan dan relasi',
      },
      {
        'No': 3,
        'Nama Lengkap': 'Rian Aditya Nugroho',
        'NISN / NIS': '20261013',
        'Kelas': availableClasses[2] || 'XI MIPA 1',
        'Jenis Kelamin (L/P)': 'L',
        'No WhatsApp': '085712345678',
        'Email': 'rian.aditya@sekolah.sch.id',
        'Cabang Ekskul': ekskuls[2]?.name || sampleEkskul,
        'Jabatan': 'Anggota',
        'Status (Aktif/Pending)': 'Pending',
        'Motivasi': 'Mengasah keterampilan fisik dan kerja sama tim',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama Lengkap
      { wch: 14 }, // NISN
      { wch: 12 }, // Kelas
      { wch: 18 }, // JK
      { wch: 16 }, // WA
      { wch: 26 }, // Email
      { wch: 20 }, // Ekskul
      { wch: 14 }, // Jabatan
      { wch: 18 }, // Status
      { wch: 30 }, // Motivasi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa Ekskul');

    XLSX.writeFile(workbook, 'Template_Import_Siswa_Ekskul.xlsx');
  };

  // 2. Parse uploaded file
  const processUploadedFile = (uploadFile: File) => {
    setFile(uploadFile);
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessCount(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMessage('File spreadsheet kosong atau tidak memiliki baris data.');
          setIsProcessing(false);
          return;
        }

        const rows: ParsedRow[] = rawJson.map((row, index) => {
          // Flexible key finder (handling case-insensitivity & variations)
          const findVal = (keys: string[]): string => {
            for (const key of Object.keys(row)) {
              const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const target of keys) {
                if (cleanKey.includes(target.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
                  return String(row[key]).trim();
                }
              }
            }
            return '';
          };

          const fullName = findVal(['nama', 'lengkap', 'fullname', 'name']) || `Siswa Baru ${index + 1}`;
          const studentId = findVal(['nisn', 'nis', 'id', 'nomorinduk']) || `2026${1000 + index + 1}`;
          const classGrade = findVal(['kelas', 'grade', 'jurusan', 'tingkat']) || availableClasses[0] || 'X MIPA 1';
          
          let genderRaw = findVal(['jeniskelamin', 'gender', 'jk', 'sex']).toUpperCase();
          const gender: 'L' | 'P' = genderRaw.startsWith('P') || genderRaw.includes('PEREMPUAN') || genderRaw.includes('F') ? 'P' : 'L';

          const phone = findVal(['whatsapp', 'wa', 'telepon', 'phone', 'hp', 'kontak']) || '0812-0000-0000';
          const email = findVal(['email', 'surel', 'mail']) || `${studentId}@sekolah.sch.id`;
          
          const rawEkskul = findVal(['ekskul', 'cabang', 'kegiatan', 'organisasi']);
          
          // Match ekskul
          let matchedEkskul = ekskuls.find((ek) => {
            if (!rawEkskul) return false;
            const r = rawEkskul.toLowerCase();
            return (
              ek.name.toLowerCase().includes(r) ||
              ek.shortName.toLowerCase().includes(r) ||
              r.includes(ek.name.toLowerCase()) ||
              r.includes(ek.shortName.toLowerCase())
            );
          });

          if (!matchedEkskul) {
            matchedEkskul = ekskuls.find((e) => e.id === defaultEkskulId) || ekskuls[0];
          }

          const role = findVal(['jabatan', 'role', 'posisi']) || 'Anggota';
          const rawStatus = findVal(['status', 'keterangan']).toLowerCase();
          const status: 'active' | 'pending' =
            rawStatus.includes('aktif') || rawStatus.includes('active') || rawStatus.includes('terima')
              ? 'active'
              : rawStatus.includes('pending') || rawStatus.includes('tunggu')
              ? 'pending'
              : defaultStatus;

          const motivation = findVal(['motivasi', 'alasan', 'catatan', 'keterangan']) || 'Terdaftar melalui impor massal Excel';

          const isValid = Boolean(fullName && studentId);
          const validationError = !fullName ? 'Nama wajib diisi' : !studentId ? 'NISN wajib diisi' : undefined;

          return {
            id: `excel-row-${Date.now()}-${index}`,
            fullName,
            studentId,
            classGrade,
            gender,
            phone,
            email,
            ekskulId: matchedEkskul?.id || defaultEkskulId,
            ekskulName: matchedEkskul?.shortName || 'Ekskul',
            role,
            status,
            motivation,
            isValid,
            validationError,
          };
        });

        setParsedRows(rows);
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        setErrorMessage(`Gagal membaca file: ${err.message || 'Format tidak valid'}`);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(uploadFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpdateRowEkskul = (index: number, newEkskulId: string) => {
    const ekskulObj = ekskuls.find((e) => e.id === newEkskulId);
    const updated = [...parsedRows];
    updated[index] = {
      ...updated[index],
      ekskulId: newEkskulId,
      ekskulName: ekskulObj?.shortName || 'Ekskul',
    };
    setParsedRows(updated);
  };

  const handleUpdateRowStatus = (index: number, newStatus: 'active' | 'pending') => {
    const updated = [...parsedRows];
    updated[index] = { ...updated[index], status: newStatus };
    setParsedRows(updated);
  };

  const handleDeleteRow = (index: number) => {
    setParsedRows(parsedRows.filter((_, i) => i !== index));
  };

  // Apply default Ekskul to all parsed rows
  const handleApplyDefaultEkskulToAll = (ekskulId: string) => {
    setDefaultEkskulId(ekskulId);
    const ekskulObj = ekskuls.find((e) => e.id === ekskulId);
    if (!ekskulObj) return;

    setParsedRows(
      parsedRows.map((row) => ({
        ...row,
        ekskulId: ekskulId,
        ekskulName: ekskulObj.shortName,
      }))
    );
  };

  // 3. Commit Import
  const handleCommitImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada data siswa yang valid untuk diimpor.');
      return;
    }

    const newMembers: Member[] = validRows.map((row, idx) => ({
      id: `mbr-${Date.now()}-${idx}`,
      studentId: row.studentId,
      fullName: row.fullName,
      nickname: row.fullName.split(' ')[0],
      classGrade: row.classGrade,
      gender: row.gender,
      email: row.email,
      phone: row.phone,
      ekskulId: row.ekskulId,
      ekskulName: row.ekskulName,
      role: row.role || 'Anggota',
      status: row.status,
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      avatar: AVATAR_PRESETS[idx % AVATAR_PRESETS.length],
      motivation: row.motivation || 'Diimpor via Excel oleh Administrator',
      parentConsent: true,
      uniformSize: 'M',
      attendanceScore: 100,
    }));

    onImportMembers(newMembers);
    setSuccessCount(newMembers.length);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Impor Massal Spreadsheet</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Upload & Tambah Siswa via File Excel (.xlsx / .csv)
            </h2>
            <p className="text-xs text-emerald-200/80 font-medium">
              Tambahkan puluhan atau ratusan data siswa ekstrakurikuler sekaligus secara instan.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Top action cards: Download Template & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Panduan & Format Kolom Excel</span>
                </strong>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Pastikan baris pertama berisi judul kolom seperti: <strong>Nama Lengkap, NISN, Kelas, Jenis Kelamin (L/P), No WhatsApp, Cabang Ekskul, Jabatan, Status</strong>.
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Excel Resmi (.xlsx)</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-950 block">Atur Default Ekskul</span>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Terapkan jika kolom ekskul di file tidak diisi.
                </p>
              </div>

              <select
                value={defaultEkskulId}
                onChange={(e) => handleApplyDefaultEkskulToAll(e.target.value)}
                className="mt-2 w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-900 font-semibold"
              >
                {ekskuls.map((ek) => (
                  <option key={ek.id} value={ek.id}>
                    {ek.shortName} - {ek.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : file
                ? 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
                : 'border-slate-300 bg-slate-50 hover:bg-emerald-50/30 hover:border-emerald-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <strong className="text-xs sm:text-sm font-bold text-slate-800 block">
                {file ? `File Terpilih: ${file.name}` : 'Tarik & Letakkan File Excel di Sini, atau Klik untuk Memilih'}
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
              </p>
            </div>

            {file && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Ukuran: {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} Baris Terdeteksi</span>
              </span>
            )}
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success notice */}
          {successCount !== null && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Berhasil mengimpor {successCount} data siswa ke dalam database ekstrakurikuler!</span>
            </div>
          )}

          {/* Table Preview of Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Pratinjau Data yang Akan Diimpor ({parsedRows.length} Siswa)
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-500">Status Awal Semua:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDefaultStatus('active');
                      setParsedRows(parsedRows.map((r) => ({ ...r, status: 'active' })));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                      defaultStatus === 'active'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Langsung Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDefaultStatus('pending');
                      setParsedRows(parsedRows.map((r) => ({ ...r, status: 'pending' })));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                      defaultStatus === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Menunggu Verifikasi (Pending)
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">NISN / NIS</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">JK</th>
                      <th className="py-2.5 px-3">Cabang Ekskul</th>
                      <th className="py-2.5 px-3">Jabatan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={!row.isValid ? 'bg-rose-50/60' : 'hover:bg-slate-50/80'}
                      >
                        <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {row.fullName}
                          {row.validationError && (
                            <span className="block text-[10px] text-rose-500 font-normal">
                              {row.validationError}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">{row.studentId}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 text-[11px]">
                            {row.classGrade}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold">{row.gender}</td>
                        <td className="py-2 px-3">
                          <select
                            value={row.ekskulId}
                            onChange={(e) => handleUpdateRowEkskul(idx, e.target.value)}
                            className="px-2 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-semibold"
                          >
                            {ekskuls.map((ek) => (
                              <option key={ek.id} value={ek.id}>
                                {ek.shortName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{row.role}</td>
                        <td className="py-2 px-3">
                          <select
                            value={row.status}
                            onChange={(e) => handleUpdateRowStatus(idx, e.target.value as any)}
                            className={`px-2 py-1 text-[11px] rounded-lg border font-bold ${
                              row.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            <option value="active">Aktif</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {parsedRows.length > 0 ? (
              <span>
                Total <strong className="text-slate-900">{parsedRows.length} siswa</strong> siap disimpan ke sistem.
              </span>
            ) : (
              <span>Pilih atau unggah file spreadsheet untuk memulai impor massal.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={parsedRows.length === 0 || isProcessing || successCount !== null}
              onClick={handleCommitImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Memproses File...'
                  : successCount !== null
                  ? 'Berhasil Diimpor!'
                  : `Impor ${parsedRows.length} Siswa Sekarang`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
