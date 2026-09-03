import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  ShieldCheck,
  Palette,
  Cpu,
  HeartHandshake,
  BookOpenCheck,
  Languages,
  Grid,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Extracurricular, ExtracurricularCategory, Member, ActivityPhoto, SiteSettings } from '../types';
import { CATEGORIES } from '../data/mockData';

interface EkskulGridProps {
  ekskuls: Extracurricular[];
  members: Member[];
  photos: ActivityPhoto[];
  selectedCategory: ExtracurricularCategory;
  setSelectedCategory: (cat: ExtracurricularCategory) => void;
  searchQuery: string;
  onSelectEkskul: (ekskul: Extracurricular) => void;
  onSelectEkskulWithTab?: (ekskul: Extracurricular, tab: 'tentang' | 'jadwal' | 'galeri' | 'anggota' | 'prestasi') => void;
  onRegisterEkskul: (ekskulId: string) => void;
  onOpenAddModal: () => void;
  siteSettings: SiteSettings;
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
  onEditEkskul: (ekskul: Extracurricular) => void;
  onDeleteEkskul: (id: string) => void;
  onToggleEkskulStatus: (id: string) => void;
}

export const EkskulGrid: React.FC<EkskulGridProps> = ({
  ekskuls,
  members,
  photos,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  onSelectEkskul,
  onSelectEkskulWithTab,
  onRegisterEkskul,
  onOpenAddModal,
  siteSettings,
  isAdmin,
  onOpenAdminPanel,
  onEditEkskul,
  onDeleteEkskul,
  onToggleEkskulStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open'>('all');

  // Filter logic
  const validEkskuls = ekskuls.filter((item) => Boolean(item && typeof item === 'object' && item.id && item.name));
  const filteredEkskuls = validEkskuls.filter((item) => {
    const matchesCategory =
      selectedCategory === 'semua' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      (typeof item.name === 'string' && item.name.toLowerCase().includes(q)) ||
      (typeof item.shortName === 'string' && item.shortName.toLowerCase().includes(q)) ||
      (typeof item.tagline === 'string' && item.tagline.toLowerCase().includes(q)) ||
      (Array.isArray(item.tags) && item.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q))) ||
      (item.coach?.name && typeof item.coach.name === 'string' && item.coach.name.toLowerCase().includes(q)) ||
      members.some(
        (m) =>
          m &&
          m.ekskulId === item.id &&
          ((m.fullName && m.fullName.toLowerCase().includes(q)) ||
            (m.classGrade && m.classGrade.toLowerCase().includes(q)))
      );
    const matchesStatus = filterStatus === 'all' || item.registrationStatus === 'open';

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return Trophy;
      case 'Palette':
        return Palette;
      case 'Cpu':
        return Cpu;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'HeartHandshake':
        return HeartHandshake;
      case 'BookOpenCheck':
        return BookOpenCheck;
      case 'Languages':
        return Languages;
      default:
        return Grid;
    }
  };

  return (
    <div className="space-y-7">
      {/* Admin Quick Action Banner when Logged In */}
      {isAdmin && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300">
              <Sliders className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  Mode Pengelola & Admin Aktif
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                Anda dapat mengubah semua isi teks sekolah, banner, jadwal, menambah atau mengedit ekskul.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAdminPanel}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Buka Pusat Kontrol (CMS)</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ekskul</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-slate-800/80">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{siteSettings.heroBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {siteSettings.heroTitle}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            {siteSettings.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Pilih kegiatan seru adik-adik di bawah, lalu klik tombol <strong>Daftar</strong> pada kartu ekskul!</span>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm border border-amber-400/30 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                title="Edit Teks & Tampilan Banner Ini"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Ubah Konten Banner (Admin)</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">{ekskuls.length}</span>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Cabang Ekskul Aktif</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {members.filter((m) => m.status === 'active').length}
              </span>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Anggota Siswa Aktif</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">{photos.length}</span>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Foto Dokumentasi</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">100%</span>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Kurikulum Merdeka</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Katalog Cabang Ekstrakurikuler
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredEkskuls.length} dari {ekskuls.length} pilihan kegiatan di {siteSettings.schoolName}
            </p>
          </div>

          {/* Open only filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'open' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                filterStatus === 'open'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {filterStatus === 'open' ? '✓ Pendaftaran Buka' : 'Semua Status'}
            </button>
          </div>
        </div>

        {/* Scrollable Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'semua'
                ? validEkskuls.length
                : validEkskuls.filter((e) => e && e.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-md font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredEkskuls.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
          <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Tidak ditemukan ekstrakurikuler
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Coba ubah kata kunci pencarian atau pilih kategori lain untuk melihat daftar ekskul.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('semua');
              setFilterStatus('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEkskuls.map((item) => {
            const itemMembers = members.filter(
              (m) => m.ekskulId === item.id && m.status === 'active'
            );
            const itemPhotos = photos.filter((p) => p.ekskulId === item.id);
            const quotaPercentage = Math.min(
              100,
              Math.round((itemMembers.length / item.quota) * 100)
            );

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col overflow-hidden"
              >
                {/* Image Header */}
                <div
                  onClick={() => onSelectEkskul(item)}
                  className="relative h-44 w-full bg-slate-900 overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md border border-white/10">
                      {item.shortName}
                    </span>

                    {item.registrationStatus === 'open' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Buka
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-600 text-white">
                        Tutup
                      </span>
                    )}
                  </div>

                  {/* Bottom Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base leading-snug drop-shadow-xs line-clamp-1 group-hover:text-indigo-200 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-200 line-clamp-1 opacity-90 font-medium">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Schedule & Location */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate font-medium">
                        {item.schedule.map((s) => s.day).join(' & ')} • {item.schedule[0]?.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate text-slate-500">
                        {item.meetingRoom || item.schedule[0]?.location}
                      </span>
                    </div>
                  </div>

                  {/* Quota Progress & Data Anggota Link */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Kapasitas Anggota</span>
                      <button
                        type="button"
                        onClick={() =>
                          onSelectEkskulWithTab
                            ? onSelectEkskulWithTab(item, 'anggota')
                            : onSelectEkskul(item)
                        }
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        title="Klik untuk melihat daftar nama siswa anggota"
                      >
                        <Users className="w-3 h-3" />
                        <span>{itemMembers.length} / {item.quota} Siswa</span>
                      </button>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quotaPercentage > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${quotaPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Button Lihat Data Anggota Ekskul */}
                  <button
                    type="button"
                    onClick={() =>
                      onSelectEkskulWithTab
                        ? onSelectEkskulWithTab(item, 'anggota')
                        : onSelectEkskul(item)
                    }
                    className="w-full py-1.5 px-3 rounded-xl border border-indigo-200/80 hover:border-indigo-300 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lihat Data Anggota ({itemMembers.length} Siswa)</span>
                  </button>

                  {/* Coach / Leader summary */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[170px]">
                      Pembina: <strong className="text-slate-700">{item.coach.name.split(',')[0]}</strong>
                    </span>
                    <span className="text-indigo-600 font-medium shrink-0">
                      {itemPhotos.length} Foto
                    </span>
                  </div>

                  {/* Admin Quick Action Controls on Card */}
                  {isAdmin && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Aksi Admin:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleEkskulStatus(item.id)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Ubah Status Buka/Tutup Pendaftaran"
                        >
                          {item.registrationStatus === 'open' ? '🔴 Tutup' : '🟢 Buka'}
                        </button>
                        <button
                          onClick={() => onEditEkskul(item)}
                          className="px-2 py-1 rounded-lg bg-indigo-600 text-[10px] font-bold text-white hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
                          title="Edit Lengkap Ekskul Ini"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteEkskul(item.id)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Hapus Ekskul Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Standard Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onSelectEkskul(item)}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-200/90 hover:border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onRegisterEkskul(item.id)}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Daftar</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
