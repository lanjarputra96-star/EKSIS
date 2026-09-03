import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  UserPlus,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  GraduationCap,
  Heart,
  Shirt,
  RefreshCw,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Extracurricular, RegistrationPayload, Member, SiteSettings } from '../types';
import { DigitalIdCard } from './DigitalIdCard';

interface RegistrationViewProps {
  ekskuls: Extracurricular[];
  defaultEkskulId?: string;
  onRegisterSuccess: (member: Member) => void;
  onNavigateToMembers: () => void;
  availableClasses?: string[];
  siteSettings?: SiteSettings;
}

// Koleksi Karakter & Foto Anak SD (Siswa Sekolah Dasar Putra & Putri Ceria)
export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80', // Anak SD berkacamata & tas
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80', // Siswi cilik tersenyum
  'https://images.unsplash.com/photo-1595454223600-91fbdd77e233?w=200&auto=format&fit=crop&q=80', // Siswa cilik ceria
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80', // Siswa SD bersahabat
  'https://api.dicebear.com/7.x/micah/svg?seed=BintangSD&backgroundColor=b6e3f4,c0aede', // Ilustrasi Siswa Putra
  'https://api.dicebear.com/7.x/micah/svg?seed=AisyahSD&backgroundColor=ffd5dc,ffdfbf', // Ilustrasi Siswi Putri
  'https://api.dicebear.com/7.x/micah/svg?seed=FarhanSD&backgroundColor=c0aede,d1d4f9', // Ilustrasi Siswa Cilik
  'https://api.dicebear.com/7.x/micah/svg?seed=ZahraSD&backgroundColor=ffd5dc,b6e3f4', // Ilustrasi Siswi Berbakat
  'https://api.dicebear.com/7.x/bottts/svg?seed=RobotCilikSD', // Avatar Maskot Robotik Cilik
];

export const DEFAULT_CLASS_OPTIONS = [
  'Kelas 1A', 'Kelas 1B', 'Kelas 1C',
  'Kelas 2A', 'Kelas 2B', 'Kelas 2C',
  'Kelas 3A', 'Kelas 3B', 'Kelas 3C',
  'Kelas 4A', 'Kelas 4B', 'Kelas 4C',
  'Kelas 5A', 'Kelas 5B', 'Kelas 5C',
  'Kelas 6A', 'Kelas 6B', 'Kelas 6C',
];

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  ekskuls,
  defaultEkskulId,
  onRegisterSuccess,
  onNavigateToMembers,
  availableClasses,
  siteSettings,
}) => {
  const classOptions =
    availableClasses && availableClasses.length > 0
      ? availableClasses
      : siteSettings?.availableClasses && siteSettings.availableClasses.length > 0
      ? siteSettings.availableClasses
      : DEFAULT_CLASS_OPTIONS;

  const [formData, setFormData] = useState<RegistrationPayload>({
    studentId: '',
    fullName: '',
    nickname: '',
    classGrade: classOptions[0] || 'Kelas 1A',
    gender: 'L',
    email: '',
    phone: '',
    ekskulId: defaultEkskulId || ekskuls[0]?.id || '',
    motivation: '',
    experience: '',
    uniformSize: 'M',
    parentConsent: true,
    avatar: AVATAR_PRESETS[0],
  });

  const [submittedMember, setSubmittedMember] = useState<Member | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const selectedEkskul = ekskuls.find((e) => e.id === formData.ekskulId);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errs.fullName = 'Nama lengkap siswa wajib diisi';
    if (!formData.phone.trim()) errs.phone = 'No. WhatsApp orang tua / siswa wajib diisi';
    if (!formData.parentConsent) errs.parentConsent = 'Persetujuan orang tua wajib dicentang';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const autoStudentId = `SD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMember: Member = {
      id: `mbr-${Date.now()}`,
      studentId: autoStudentId,
      fullName: formData.fullName.trim(),
      nickname: formData.nickname.trim() || formData.fullName.trim().split(' ')[0],
      classGrade: formData.classGrade,
      gender: formData.gender,
      email: '',
      phone: formData.phone.trim(),
      ekskulId: formData.ekskulId,
      ekskulName: selectedEkskul ? selectedEkskul.shortName : 'Ekskul SD',
      role: 'Calon Anggota',
      status: 'pending',
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      avatar: formData.avatar || AVATAR_PRESETS[0],
      parentConsent: formData.parentConsent,
      attendanceScore: 100,
    };

    onRegisterSuccess(newMember);
    setSubmittedMember(newMember);
  };

  const handleReset = () => {
    setSubmittedMember(null);
    setFormData({
      studentId: '',
      fullName: '',
      nickname: '',
      classGrade: classOptions[0] || 'Kelas 1A',
      gender: 'L',
      email: '',
      phone: '',
      ekskulId: ekskuls[0]?.id || '',
      motivation: '',
      experience: '',
      uniformSize: 'M',
      parentConsent: true,
      avatar: AVATAR_PRESETS[0],
    });
  };

  // Live preview member object
  const previewMember: Member = {
    id: 'preview',
    studentId: 'SD-2026',
    fullName: formData.fullName.trim() || 'Nama Calon Siswa',
    nickname: formData.nickname.trim() || 'Siswa',
    classGrade: formData.classGrade,
    gender: formData.gender,
    email: '',
    phone: formData.phone.trim() || '0812-xxxx-xxxx',
    ekskulId: formData.ekskulId,
    ekskulName: selectedEkskul ? selectedEkskul.shortName : 'EKSKUL SD',
    role: 'Calon Anggota',
    status: 'pending',
    joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    avatar: formData.avatar || AVATAR_PRESETS[0],
    parentConsent: formData.parentConsent,
  };

  if (submittedMember) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200/60 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pendaftaran Berhasil Dikirim!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed font-medium">
            Selamat, data pendaftaran adik <strong>{submittedMember.fullName}</strong> telah tersimpan dan siap diverifikasi oleh Pembina <strong>{submittedMember.ekskulName}</strong>.
          </p>

          <div className="my-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Kartu Tanda Anggota Digital Siswa:
            </h3>
            <DigitalIdCard
              member={submittedMember}
              ekskul={selectedEkskul}
              schoolName={siteSettings?.schoolName}
              portalTitle={siteSettings?.portalTitle}
              academicYear={siteSettings?.academicYear}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Daftar Ekskul Lain</span>
            </button>

            <button
              onClick={onNavigateToMembers}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-slate-300" />
              <span>Kembali ke Jelajah Ekskul</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-2.5 border border-white/15">
            <UserPlus className="w-3.5 h-3.5 text-indigo-300" />
            <span>Formulir Pendaftaran Online Siswa SD</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            Pendaftaran Ekstrakurikuler Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
            Lengkapi nama siswa, kelas, dan nomor WhatsApp orang tua untuk mendapatkan Kartu Tanda Anggota (KTA) Digital resmi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration Form Left Side */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Data Identitas Siswa */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-indigo-600" />
                <span>1. Identitas Lengkap Siswa</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Muhammad Bintang Pratama"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                  {errors.fullName && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bintang"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilihan Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'L' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        formData.gender === 'L'
                          ? 'bg-indigo-50/80 border-indigo-400 text-indigo-700 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Laki-laki (Putra)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'P' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        formData.gender === 'P'
                          ? 'bg-rose-50/80 border-rose-400 text-rose-700 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Perempuan (Putri)
                    </button>
                  </div>
                </div>

                {/* Avatar & Pas Foto Siswa SD */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-900">
                        Foto Profil / Pas Foto Siswa SD
                      </label>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Pilih karakter cilik anak SD atau upload pas foto siswa langsung dari HP/Laptop.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-xs cursor-pointer flex items-center gap-1.5 transition-all">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Pas Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setFormData({ ...formData, avatar: reader.result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Current Selected Avatar Preview */}
                    <div className="relative shrink-0">
                      <img
                        src={formData.avatar || AVATAR_PRESETS[0]}
                        alt="Pas Foto Siswa"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-600 shadow-md bg-white"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-xs">
                        Aktif
                      </span>
                    </div>

                    {/* Presets List */}
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Atau pilih karakter siswa cilik:
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {AVATAR_PRESETS.map((avatar, idx) => (
                          <img
                            key={idx}
                            src={avatar}
                            alt={`Avatar ${idx + 1}`}
                            onClick={() => setFormData({ ...formData, avatar })}
                            className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-all shrink-0 bg-white ${
                              formData.avatar === avatar
                                ? 'border-indigo-600 scale-105 shadow-xs ring-2 ring-indigo-300'
                                : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                            }`}
                            title="Klik untuk memilih karakter ini"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: Pilihan Cabang Ekskul & Kontak Orang Tua */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>2. Pilihan Cabang Ekskul & Kontak</span>
              </h3>

              <div className="space-y-3.5 mt-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Cabang Ekstrakurikuler <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.ekskulId}
                    onChange={(e) => setFormData({ ...formData, ekskulId: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-indigo-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {ekskuls.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.shortName} - {e.name} ({e.schedule[0]?.day || 'Jadwal Rutin'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP Orang Tua / Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 0812-3456-7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.phone}</span>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Digunakan untuk informasi jadwal kegiatan dan konfirmasi dari guru pembina ekskul.
                  </p>
                </div>

                {/* Consent checkbox */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.parentConsent}
                      onChange={(e) => setFormData({ ...formData, parentConsent: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="text-xs text-slate-700 leading-snug">
                      <strong className="text-slate-900 block mb-0.5 font-bold">
                        Persetujuan Orang Tua / Wali
                      </strong>
                      Saya menyatakan bahwa pendaftaran ini telah disetujui orang tua/wali dan siswa bersedia mengikuti kegiatan ekstrakurikuler sekolah dengan ceria dan tertib.
                    </div>
                  </label>
                  {errors.parentConsent && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{errors.parentConsent}</span>
                  )}
                </div>

              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Kirim Pendaftaran Siswa</span>
              </button>
            </div>

          </form>
        </div>

        {/* Live ID Card Preview Right Side */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Pratinjau KTA Digital Real-time
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Otomatis Terbentuk</span>
            </div>

            <DigitalIdCard
              member={previewMember}
              ekskul={selectedEkskul}
              schoolName={siteSettings?.schoolName}
              portalTitle={siteSettings?.portalTitle}
              academicYear={siteSettings?.academicYear}
            />

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Informasi Setelah Mendaftar:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Kartu anggota digital ini akan otomatis tercatat dan siap diverifikasi oleh guru pembina ekskul SD. KTA dapat dicetak kapan saja.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
