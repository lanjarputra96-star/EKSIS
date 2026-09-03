import React from 'react';
import {
  BarChart3,
  Users,
  Trophy,
  Image as ImageIcon,
  Sparkles,
  Award,
  Compass,
  PieChart,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { Extracurricular, Member, ActivityPhoto } from '../types';
import { CATEGORIES } from '../data/mockData';

interface StatsViewProps {
  ekskuls: Extracurricular[];
  members: Member[];
  photos: ActivityPhoto[];
}

export const StatsView: React.FC<StatsViewProps> = ({
  ekskuls,
  members,
  photos,
}) => {
  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'pending');
  const maleCount = members.filter((m) => m.gender === 'L').length;
  const femaleCount = members.filter((m) => m.gender === 'P').length;

  // Grade distributions
  const classX = members.filter((m) => m.classGrade.startsWith('X ')).length;
  const classXI = members.filter((m) => m.classGrade.startsWith('XI ')).length;
  const classXII = members.filter((m) => m.classGrade.startsWith('XII ')).length;

  // Total achievements
  const totalAchievements = ekskuls.reduce((acc, curr) => acc + curr.achievements.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard Ekstrakurikuler</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Statistik & Analisis Kegiatan Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan data keanggotaan, capaian prestasi, dan keterisian kuota ekskul sekolah.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Cabang Ekskul</span>
            <span className="text-2xl font-black text-slate-900">{ekskuls.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold block">100% Aktif Berjalan</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Anggota Aktif</span>
            <span className="text-2xl font-black text-emerald-700">{activeMembers.length}</span>
            <span className="text-[10px] text-slate-400 font-medium block">
              +{pendingMembers.length} Calon Baru
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Prestasi</span>
            <span className="text-2xl font-black text-amber-700">{totalAchievements}</span>
            <span className="text-[10px] text-amber-600 font-bold block">Tingkat Kota - Nasional</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Dokumentasi Foto</span>
            <span className="text-2xl font-black text-rose-700">{photos.length}</span>
            <span className="text-[10px] text-rose-600 font-bold block">Dokumentasi HD</span>
          </div>
        </div>
      </div>

      {/* Main Stats Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ekskul Members Ranking */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Peringkat & Keterisian Anggota per Ekskul
              </h3>
              <p className="text-xs text-slate-500">
                Jumlah anggota aktif dibandingkan batas kuota maksimal masing-masing ekskul
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {ekskuls.map((e) => {
              const currentCount = members.filter(
                (m) => m.ekskulId === e.id && m.status === 'active'
              ).length;
              const percent = Math.min(100, Math.round((currentCount / e.quota) * 100));

              return (
                <div key={e.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {e.name}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {currentCount} / {e.quota} Siswa ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        percent > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Demographics & Class breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Class Grade Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Distribusi Tingkat Kelas
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-700">Kelas X (Fase E)</span>
                <span className="font-extrabold text-indigo-700">{classX} Siswa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-700">Kelas XI (Fase F1)</span>
                <span className="font-extrabold text-indigo-700">{classXI} Siswa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-700">Kelas XII (Fase F2)</span>
                <span className="font-extrabold text-indigo-700">{classXII} Siswa</span>
              </div>
            </div>
          </div>

          {/* Gender Ratio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Perbandingan Gender Siswa
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-700 block">Putra (L)</span>
                <span className="text-xl font-black text-blue-900 mt-0.5 block">{maleCount}</span>
                <span className="text-[10px] text-blue-600 font-medium">
                  {members.length > 0 ? Math.round((maleCount / members.length) * 100) : 0}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-700 block">Putri (P)</span>
                <span className="text-xl font-black text-rose-900 mt-0.5 block">{femaleCount}</span>
                <span className="text-[10px] text-rose-600 font-medium">
                  {members.length > 0 ? Math.round((femaleCount / members.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900">
              Ragam Kategori Kegiatan
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORIES.filter((c) => c.id !== 'semua').map((cat) => {
                const count = ekskuls.filter((e) => e.category === cat.id).length;
                return (
                  <span
                    key={cat.id}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700"
                  >
                    {cat.name}: <strong>{count}</strong>
                  </span>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
