import React, { useRef } from 'react';
import {
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  QrCode,
  School,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Member, Extracurricular, SiteSettings } from '../types';
import { getSiteSettings } from '../utils/storage';

interface DigitalIdCardProps {
  member: Member;
  ekskul?: Extracurricular;
  siteSettings?: SiteSettings;
  schoolName?: string;
  portalTitle?: string;
  academicYear?: string;
  onClose?: () => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({
  member,
  ekskul,
  siteSettings,
  schoolName,
  portalTitle,
  academicYear,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Retrieve current settings as fallback
  const currentSettings = siteSettings || getSiteSettings();
  const effectiveSchoolName = schoolName || currentSettings.schoolName || 'SD NEGERI BINTANG PERTIWI';
  const effectivePortalTitle = portalTitle || currentSettings.portalTitle || 'EKSIS SD';
  const effectiveAcademicYear = academicYear || currentSettings.academicYear || 'TA 2026/2027';
  const effectiveLogoUrl = currentSettings.logoUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Physical-style ID Card Front */}
      <div
        ref={cardRef}
        id="printable-id-card"
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-300/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative p-5 select-none print:shadow-none print:border-slate-400"
      >
        {/* Holographic accent stripes */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-indigo-500/20 via-cyan-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-indigo-400/20 relative z-10">
          <div className="flex items-center gap-2.5">
            {effectiveLogoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-white/30 flex items-center justify-center shrink-0">
                <img
                  src={effectiveLogoUrl}
                  alt={effectivePortalTitle}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
                {effectivePortalTitle.charAt(0) || 'E'}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-cyan-300">
                {effectiveSchoolName}
              </h3>
              <p className="text-[10px] text-indigo-200 font-medium tracking-tight">
                KARTU TANDA ANGGOTA EKSTRAKURIKULER (KTA)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/90 text-white shadow-xs">
              {member.status === 'active' ? 'TERVERIFIKASI' : 'CALON ANGGOTA'}
            </span>
          </div>
        </div>

        {/* Card Main Info */}
        <div className="py-4 grid grid-cols-3 gap-3.5 items-center relative z-10">
          {/* Avatar Photo */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-cyan-400/60 shadow-lg bg-slate-800 relative">
              <img
                src={member.avatar}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-indigo-900/80 text-[8px] text-center font-bold py-0.5 text-cyan-200">
                {effectiveAcademicYear}
              </div>
            </div>
            <span className="text-[9px] text-slate-300 font-mono mt-1 font-bold">
              ID: {member.studentId}
            </span>
          </div>

          {/* Details */}
          <div className="col-span-2 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-indigo-300 block uppercase tracking-wider">
                Nama Lengkap
              </span>
              <p className="font-extrabold text-sm sm:text-base text-white tracking-tight line-clamp-1">
                {member.fullName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <span className="text-[9px] font-semibold text-indigo-300 block">Kelas</span>
                <p className="font-bold text-xs text-white">{member.classGrade}</p>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-indigo-300 block">Jabatan</span>
                <p className="font-bold text-xs text-amber-300">{member.role}</p>
              </div>
            </div>

            <div className="pt-0.5">
              <span className="text-[9px] font-semibold text-indigo-300 block">
                Cabang Ekstrakurikuler
              </span>
              <p className="font-extrabold text-xs text-cyan-300">
                {member.ekskulName}
              </p>
            </div>

            <div className="pt-0.5 flex items-center justify-between text-[9px] text-slate-300">
              <span>Tgl Daftar: {member.joinDate}</span>
              {member.uniformSize && <span>Size: {member.uniformSize}</span>}
            </div>
          </div>
        </div>

        {/* Card Footer with QR Code & Barcode */}
        <div className="pt-3 border-t border-indigo-400/20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white rounded-lg shadow-sm">
              {/* Clean decorative SVG QR Code */}
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 text-slate-900"
                fill="currentColor"
              >
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h5v3h-5v-3zm3-2h2v2h-2v-2zm-3-3h-3v3h3v-3zm-5 5h3v3h-3v-3zm3-8h2v3h-2V8zm-3 0h2v2h-2V8zm0 3h3v2h-3v-2z" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] text-indigo-300 font-mono block">E-VALIDATED AUTH</span>
              <span className="text-[10px] font-bold text-slate-200">
                KTA-{member.studentId}-{member.ekskulName.substring(0, 3)}
              </span>
            </div>
          </div>

          <div className="text-right">
            {currentSettings.ktaStampImageUrl ? (
              <div className="flex flex-col items-end">
                <div className="relative">
                  <img
                    src={currentSettings.ktaStampImageUrl}
                    alt="Stempel Resmi"
                    className="h-10 w-auto max-w-[100px] object-contain rotate-[-4deg] drop-shadow-md"
                  />
                </div>
                {currentSettings.ktaSignerName && (
                  <div className="text-right mt-0.5 leading-tight">
                    <span className="text-[8px] font-bold text-slate-100 block underline decoration-indigo-400">
                      {currentSettings.ktaSignerName}
                    </span>
                    <span className="text-[7px] text-indigo-300 block">
                      {currentSettings.ktaSignerTitle || 'Pengesah KTA'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="inline-block px-2.5 py-1 rounded-xl bg-indigo-900/70 border border-indigo-400/30 text-center shadow-xs">
                <span className="text-[7px] text-indigo-300 block uppercase font-semibold">
                  Stempel Resmi
                </span>
                <span className="text-[9px] font-black text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{currentSettings.ktaStampText || `${effectivePortalTitle} SAH`}</span>
                </span>
                {currentSettings.ktaSignerName && (
                  <span className="text-[7px] text-slate-300 block mt-0.5 pt-0.5 border-t border-indigo-700/60 font-medium">
                    {currentSettings.ktaSignerName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Cetak / Print KTA</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
};
