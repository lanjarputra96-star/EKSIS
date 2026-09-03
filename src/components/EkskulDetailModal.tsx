import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Trophy,
  Users,
  CheckCircle2,
  Sparkles,
  Shield,
  User,
  Heart,
  ExternalLink,
  ChevronRight,
  Clock,
  Award,
  Image as ImageIcon,
  BookOpen,
  Edit,
} from 'lucide-react';
import { Extracurricular, ActivityPhoto, Member } from '../types';

interface EkskulDetailModalProps {
  ekskul: Extracurricular | null;
  onClose: () => void;
  onRegister: (ekskulId: string) => void;
  photos: ActivityPhoto[];
  members: Member[];
  onSelectPhoto: (photo: ActivityPhoto) => void;
  isAdmin?: boolean;
  onEditEkskul?: (ekskul: Extracurricular) => void;
  initialTab?: 'tentang' | 'jadwal' | 'galeri' | 'anggota' | 'prestasi';
}

export const EkskulDetailModal: React.FC<EkskulDetailModalProps> = ({
  ekskul,
  onClose,
  onRegister,
  photos,
  members,
  onSelectPhoto,
  isAdmin,
  onEditEkskul,
  initialTab = 'tentang',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tentang' | 'jadwal' | 'galeri' | 'anggota' | 'prestasi'>(initialTab);
  const [memberSearch, setMemberSearch] = useState('');

  React.useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab, ekskul?.id]);

  if (!ekskul) return null;

  const ekskulPhotos = photos.filter((p) => p.ekskulId === ekskul.id);
  const ekskulMembers = members.filter((m) => m.ekskulId === ekskul.id && m.status === 'active');
  const pendingMembers = members.filter((m) => m.ekskulId === ekskul.id && m.status === 'pending');

  const filteredEkskulMembers = ekskulMembers.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.classGrade.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.studentId.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto">
        
        {/* Header with Cover Image */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={ekskul.coverImage}
            alt={ekskul.name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                  {ekskul.shortName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-md">
                  Kuota: {ekskulMembers.length} / {ekskul.quota} Siswa
                </span>
                {ekskul.registrationStatus === 'open' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    Pendaftaran Dibuka
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {ekskul.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 line-clamp-1">
                {ekskul.tagline}
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onRegister(ekskul.id);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Daftar Sekarang</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'tentang', label: 'Profil & Visi Misi', icon: BookOpen },
            { id: 'jadwal', label: 'Jadwal & Lokasi', icon: Calendar },
            { id: 'galeri', label: `Galeri Foto (${ekskulPhotos.length})`, icon: ImageIcon },
            { id: 'anggota', label: `Anggota Aktif (${ekskulMembers.length})`, icon: Users },
            { id: 'prestasi', label: 'Prestasi & Syarat', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white space-y-6">
          
          {/* TAB 1: Tentang */}
          {activeSubTab === 'tentang' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                  Deskripsi Kegiatan
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {ekskul.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-sm text-slate-900 mb-1.5 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Visi Ekstrakurikuler
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    "{ekskul.vision}"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-sm text-slate-900 mb-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Misi Utama
                  </h5>
                  <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                    {ekskul.mission.map((m, i) => (
                      <li key={i} className="leading-snug">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Fasilitas & Iuran */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-indigo-50/40">
                  <span className="text-[11px] font-semibold text-indigo-700 block">Ruang / Sanggar</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {ekskul.meetingRoom}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/40">
                  <span className="text-[11px] font-semibold text-emerald-700 block">Iuran Kas / Biaya</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {ekskul.monthlyFee || 'Gratis'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-blue-50/40">
                  <span className="text-[11px] font-semibold text-blue-700 block">Perlengkapan Sekolah</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {ekskul.equipmentProvided?.join(', ') || 'Disediakan sekolah'}
                  </p>
                </div>
              </div>

              {/* Pembina & Ketua */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Struktur Penanggung Jawab
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Coach */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                      {ekskul.coach.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                        Guru Pembina / Pelatih
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-1">
                        {ekskul.coach.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {ekskul.coach.title}
                      </p>
                      {ekskul.coach.phone && (
                        <p className="text-[11px] text-indigo-600 font-medium">
                          WA: {ekskul.coach.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Student Leader */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                      {ekskul.leader.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                        Ketua Ekskul Siswa
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-1">
                        {ekskul.leader.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Kelas: {ekskul.leader.classGrade}
                      </p>
                      {ekskul.leader.phone && (
                        <p className="text-[11px] text-emerald-600 font-medium">
                          Kontak: {ekskul.leader.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Jadwal */}
          {activeSubTab === 'jadwal' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Jadwal Rutin Latihan Mingguan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ekskul.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                        Hari {item.day}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {item.time}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-slate-700 pt-1">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{item.location}</span>
                        {item.notes && (
                          <span className="text-slate-500 text-[11px]">
                            Keterangan: {item.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed mt-4">
                <span className="font-bold block mb-1">Catatan Kehadiran & Tata Tertib:</span>
                Setiap anggota wajib hadir 10 menit sebelum jam latihan dimulai mengenakan seragam/pakaian olahraga sesuai ketentuan. Izin ketidakhadiran harus disampaikan ke Ketua Ekskul atau Pembina minimal H-1.
              </div>
            </div>
          )}

          {/* TAB 3: Galeri Foto */}
          {activeSubTab === 'galeri' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Dokumentasi Kegiatan ({ekskulPhotos.length} Foto)
                </h4>
              </div>

              {ekskulPhotos.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">
                    Belum ada foto dokumentasi untuk ekskul ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ekskulPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => onSelectPhoto(photo)}
                      className="group relative h-40 sm:h-48 rounded-xl overflow-hidden cursor-pointer bg-slate-900 shadow-2xs hover:shadow-md transition-all"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                        <span className="text-xs font-bold line-clamp-1">{photo.title}</span>
                        <span className="text-[10px] text-slate-300">{photo.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Anggota Aktif */}
          {activeSubTab === 'anggota' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Daftar Anggota Aktif ({ekskulMembers.length} Siswa)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Siswa-siswi yang terdaftar aktif dalam ekstrakurikuler {ekskul.name}
                  </p>
                </div>
                {pendingMembers.length > 0 && (
                  <span className="text-xs px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium shrink-0">
                    {pendingMembers.length} Calon Menunggu Verifikasi
                  </span>
                )}
              </div>

              {/* Member Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama anggota siswa, kelas, atau jabatan..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {filteredEkskulMembers.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-semibold">
                    {memberSearch ? 'Tidak ada anggota yang cocok dengan kata kunci pencarian.' : 'Belum ada anggota terdaftar untuk ekskul ini.'}
                  </p>
                  {ekskul.registrationStatus === 'open' && (
                    <button
                      onClick={() => {
                        onClose();
                        onRegister(ekskul.id);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Daftar Menjadi Anggota Pertama</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredEkskulMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/30 transition-colors"
                    >
                      <img
                        src={member.avatar}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {member.fullName}
                          </h5>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              member.role === 'Ketua'
                                ? 'bg-amber-100 text-amber-800'
                                : member.role === 'Wakil Ketua' || member.role === 'Sekretaris'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {member.classGrade} • NISN: {member.studentId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Prestasi & Syarat */}
          {activeSubTab === 'prestasi' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Rekam Jejak Prestasi & Penghargaan
                  </h4>
                  {isAdmin && onEditEkskul && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditEkskul(ekskul);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Edit Prestasi</span>
                    </button>
                  )}
                </div>

                {(!ekskul.achievements || ekskul.achievements.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/40 text-center space-y-1">
                    <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Belum ada catatan prestasi terdaftar</p>
                    <p className="text-[11px] text-slate-500">Cabang ekstrakurikuler ini belum mencantumkan riwayat kejuaraan.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {ekskul.achievements.map((ach, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-gradient-to-r from-amber-50/50 via-white to-slate-50 shadow-2xs"
                      >
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs shrink-0">
                          {ach.year || '2026'}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                            {ach.title}
                          </span>
                          <span className="text-xs font-semibold text-amber-700">
                            {ach.rank}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Syarat & Ketentuan Pendaftaran
                </h4>
                {(!ekskul.requirements || ekskul.requirements.length === 0) ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Syarat Umum Pendaftaran:</p>
                    <p>• Terdaftar sebagai siswa aktif di sekolah</p>
                    <p>• Mendapat izin tertulis dari orang tua atau wali murid</p>
                    <p>• Berkomitmen mengikuti jadwal latihan rutin secara disiplin</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    {ekskul.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2"></span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
            <span>Sistem EKSIS Portal</span>
            {isAdmin && onEditEkskul && (
              <button
                onClick={() => {
                  onClose();
                  onEditEkskul(ekskul);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Ekskul Ini</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onRegister(ekskul.id);
              }}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Daftar {ekskul.shortName}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
