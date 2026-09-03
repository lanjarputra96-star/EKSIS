import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Building2,
  Users,
  Calendar,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Extracurricular, Member, SiteSettings } from '../types';

interface EkskulPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ekskuls: Extracurricular[];
  members: Member[];
  siteSettings: SiteSettings;
  initialSelectedEkskulId?: string;
}

export const EkskulPdfReportModal: React.FC<EkskulPdfReportModalProps> = ({
  isOpen,
  onClose,
  ekskuls,
  members,
  siteSettings,
  initialSelectedEkskulId = 'all',
}) => {
  const [selectedEkskulId, setSelectedEkskulId] = useState<string>(initialSelectedEkskulId);
  const [includeMemberList, setIncludeMemberList] = useState(true);
  const [includeSchedule, setIncludeSchedule] = useState(true);
  const [includeAchievements, setIncludeAchievements] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isAll = selectedEkskulId === 'all';
  const selectedEkskul = !isAll ? ekskuls.find((e) => e.id === selectedEkskulId) : null;
  const targetEkskuls = isAll ? ekskuls : selectedEkskul ? [selectedEkskul] : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header (No Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Cetak & Unduh Laporan PDF Data Ekstrakurikuler
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pilih cabang ekskul tertentu atau unduh rekapitulasi seluruh data sekolah dalam format cetak PDF resmi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar (No Print) */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pilih Cabang Ekskul:
              </label>
              <select
                value={selectedEkskulId}
                onChange={(e) => setSelectedEkskulId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">📑 Rekapitulasi Semua Cabang ({ekskuls.length} Ekskul)</option>
                <optgroup label="Pilih Per Cabang">
                  {ekskuls.map((ekskul) => (
                    <option key={ekskul.id} value={ekskul.id}>
                      {ekskul.name} ({ekskul.shortName})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tanggal Laporan:
              </label>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium w-44"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                checked={includeMemberList}
                onChange={(e) => setIncludeMemberList(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Daftar Anggota</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                checked={includeSchedule}
                onChange={(e) => setIncludeSchedule(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Jadwal & Tempat</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Kolom Pengesahan</span>
            </label>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/70 print:bg-white print:p-0 print:overflow-visible">
          <div
            ref={printAreaRef}
            id="printable-ekskul-report"
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12 max-w-4xl mx-auto text-slate-900 text-xs print:shadow-none print:border-none print:p-6 print:max-w-none"
          >
            {/* Kop Surat / Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <Building2 className="w-9 h-9 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-900">
                  {siteSettings.schoolName}
                </h1>
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  PORTAL PENGEMBANGAN DIRI & EKSTRAKURIKULER SISWA
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {siteSettings.schoolAddress} • Telp: {siteSettings.contactPhone} • Email: {siteSettings.contactEmail}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Tahun Ajaran: {siteSettings.academicYear}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline decoration-indigo-500 underline-offset-4">
                {isAll
                  ? 'LAPORAN REKAPITULASI SELURUH CABANG EKSTRAKURIKULER'
                  : `LAPORAN DATA EKSTRAKURIKULER: ${selectedEkskul?.name.toUpperCase()}`}
              </h2>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Dokumen Resmi Periode Semester {siteSettings.academicYear} • Dicetak per tanggal: {reportDate}
              </p>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Ekskul
                </span>
                <span className="text-base font-black text-slate-900">
                  {targetEkskuls.length} Cabang
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Anggota Terdaftar
                </span>
                <span className="text-base font-black text-indigo-600">
                  {isAll
                    ? members.length
                    : members.filter((m) => m.ekskulId === selectedEkskul?.id).length}{' '}
                  Siswa
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Anggota Aktif
                </span>
                <span className="text-base font-black text-emerald-600">
                  {isAll
                    ? members.filter((m) => m.status === 'active').length
                    : members.filter(
                        (m) => m.ekskulId === selectedEkskul?.id && m.status === 'active'
                      ).length}{' '}
                  Siswa
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Menunggu Verifikasi
                </span>
                <span className="text-base font-black text-amber-600">
                  {isAll
                    ? members.filter((m) => m.status === 'pending').length
                    : members.filter(
                        (m) => m.ekskulId === selectedEkskul?.id && m.status === 'pending'
                      ).length}{' '}
                  Siswa
                </span>
              </div>
            </div>

            {/* Content: List of Ekskuls and Members */}
            <div className="space-y-8">
              {targetEkskuls.map((ekskul, index) => {
                const ekskulMembers = members.filter((m) => m.ekskulId === ekskul.id);
                return (
                  <div
                    key={ekskul.id}
                    className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 break-inside-avoid"
                  >
                    {/* Ekskul Profile Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {ekskul.name} ({ekskul.shortName})
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Kategori: <span className="capitalize">{ekskul.category}</span> • Kuota: {ekskul.quota} Siswa
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:text-right text-[11px]">
                        <span className="font-semibold text-slate-700 block">
                          Pembina: {ekskul.coach.name}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          Ketua: {ekskul.leader.name} ({ekskul.leader.classGrade})
                        </span>
                      </div>
                    </div>

                    {/* Schedule & Location */}
                    {includeSchedule && ekskul.schedule && (
                      <div className="bg-slate-50 p-3 rounded-lg text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="font-bold text-slate-700">Jadwal Latihan: </span>
                          <span className="text-slate-600">
                            {ekskul.schedule.map((s) => `${s.day} (${s.time})`).join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Tempat Latihan: </span>
                          <span className="text-slate-600">{ekskul.meetingRoom}</span>
                        </div>
                      </div>
                    )}

                    {/* Member Roster Table */}
                    {includeMemberList && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-800">
                            Daftar Siswa & Anggota ({ekskulMembers.length} Orang):
                          </h4>
                        </div>

                        {ekskulMembers.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-2">
                            Belum ada siswa terdaftar pada cabang ini.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-slate-200 text-[10px]">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                  <th className="p-1.5 border-r border-slate-200 text-center w-8">No</th>
                                  <th className="p-1.5 border-r border-slate-200">NIS / NISN</th>
                                  <th className="p-1.5 border-r border-slate-200">Nama Lengkap Siswa</th>
                                  <th className="p-1.5 border-r border-slate-200 text-center">Kelas</th>
                                  <th className="p-1.5 border-r border-slate-200 text-center">L/P</th>
                                  <th className="p-1.5 border-r border-slate-200">Jabatan</th>
                                  <th className="p-1.5 border-r border-slate-200 text-center">Status</th>
                                  <th className="p-1.5">No. WhatsApp Wali</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ekskulMembers.map((member, mIdx) => (
                                  <tr
                                    key={member.id}
                                    className={`border-b border-slate-200 hover:bg-slate-50 ${
                                      mIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                                    }`}
                                  >
                                    <td className="p-1.5 border-r border-slate-200 text-center font-semibold text-slate-500">
                                      {mIdx + 1}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-200 font-mono font-medium">
                                      {member.studentId}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">
                                      {member.fullName}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-200 text-center font-semibold">
                                      {member.classGrade}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                                      {member.gender}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-200 font-medium text-slate-700">
                                      {member.role}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                                      <span
                                        className={
                                          member.status === 'active'
                                            ? 'text-emerald-700'
                                            : member.status === 'pending'
                                            ? 'text-amber-700'
                                            : 'text-slate-500'
                                        }
                                      >
                                        {member.status === 'active'
                                          ? 'Aktif'
                                          : member.status === 'pending'
                                          ? 'Menunggu'
                                          : member.status}
                                      </span>
                                    </td>
                                    <td className="p-1.5 font-mono text-slate-600">
                                      {member.phone || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Official Signature Blocks */}
            {includeSignatures && (
              <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                <div>
                  <p className="text-slate-500 text-[11px] mb-1">Mengetahui / Mengesahkan,</p>
                  <p className="font-bold text-slate-800">
                    {isAll ? 'Koordinator Pembina Ekstrakurikuler' : `Guru Pembina ${selectedEkskul?.shortName}`}
                  </p>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                    (Tanda Tangan & Cap)
                  </div>
                  <p className="font-black text-slate-900 underline uppercase">
                    {isAll ? 'Drs. Koordinator Ekskul' : selectedEkskul?.coach.name || 'Guru Pembina'}
                  </p>
                  <p className="text-[10px] text-slate-500">NIP. 19850315 201001 1 012</p>
                </div>

                <div>
                  <p className="text-slate-500 text-[11px] mb-1">
                    {siteSettings.schoolAddress.split(',')[0] || 'Jakarta'}, {reportDate}
                  </p>
                  <p className="font-bold text-slate-800">
                    Kepala {siteSettings.schoolName}
                  </p>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                    (Tanda Tangan & Stempel Resmi)
                  </div>
                  <p className="font-black text-slate-900 underline uppercase">
                    {siteSettings.greetingAuthorName || 'Hj. Sri Wahyuningsih, S.Pd., M.Pd.'}
                  </p>
                  <p className="text-[10px] text-slate-500">NIP. 19740620 199803 2 004</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info (No Print) */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
          <span>💡 Tip: Pada jendela browser cetak, pilih printer "Save as PDF" / "Simpan sebagai PDF" untuk mengunduh dokumen.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
