import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Check,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Extracurricular, Member } from '../types';

interface ScheduleViewProps {
  ekskuls: Extracurricular[];
  members: Member[];
  onOpenRegister: (ekskulId: string) => void;
  isAdmin?: boolean;
}

const DAYS_OF_WEEK = ['Semua Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  ekskuls,
  members,
  onOpenRegister,
  isAdmin = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Semua Hari');
  const [selectedEkskul, setSelectedEkskul] = useState<string>('all');
  const [activePresensiEkskul, setActivePresensiEkskul] = useState<string | null>(null);
  const [attendanceState, setAttendanceState] = useState<{ [memberId: string]: 'hadir' | 'izin' | 'sakit' | 'alpa' }>({});
  const [presensiSavedToast, setPresensiSavedToast] = useState(false);

  // Flatten schedules
  const allScheduleItems = ekskuls.flatMap((ekskul) =>
    ekskul.schedule.map((sch) => ({
      ...sch,
      ekskulId: ekskul.id,
      ekskulName: ekskul.name,
      shortName: ekskul.shortName,
      coach: ekskul.coach,
      leader: ekskul.leader,
      coverImage: ekskul.coverImage,
      monthlyFee: ekskul.monthlyFee,
      meetingRoom: ekskul.meetingRoom,
    }))
  );

  const filteredSchedules = allScheduleItems.filter((item) => {
    const matchesDay = selectedDay === 'Semua Hari' || item.day === selectedDay;
    const matchesEkskul = selectedEkskul === 'all' || item.ekskulId === selectedEkskul;
    return matchesDay && matchesEkskul;
  });

  const activePresensiMembers = activePresensiEkskul
    ? members.filter((m) => m.ekskulId === activePresensiEkskul && m.status === 'active')
    : [];

  const handleMarkAttendance = (memberId: string, status: 'hadir' | 'izin' | 'sakit' | 'alpa') => {
    setAttendanceState((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    setPresensiSavedToast(true);
    setTimeout(() => {
      setPresensiSavedToast(false);
      setActivePresensiEkskul(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender Latihan & Absensi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Jadwal Latihan & Presensi Kehadiran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Informasi waktu, lokasi ruangan, dan simulasi presensi keaktifan anggota ekskul.
          </p>
        </div>
      </div>

      {/* Filter by Day Pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedDay === day
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedEkskul}
              onChange={(e) => setSelectedEkskul(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Semua Cabang Ekskul</option>
              {ekskuls.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.map((sch, idx) => {
          const ekskulMemberCount = members.filter(
            (m) => m.ekskulId === sch.ekskulId && m.status === 'active'
          ).length;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs">
                    Hari {sch.day}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    {sch.shortName}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {sch.ekskulName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sch.time}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{sch.location}</span>
                  </div>
                  {sch.notes && (
                    <div className="text-[11px] text-slate-500 pl-5">
                      Fokus: {sch.notes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                  <p>
                    Pembina: <strong className="text-slate-800">{sch.coach.name.split(',')[0]}</strong>
                  </p>
                  <p>
                    Ketua Siswa: <strong className="text-slate-800">{sch.leader.name}</strong> ({sch.leader.classGrade})
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={() => setActivePresensiEkskul(sch.ekskulId)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Input Presensi Kehadiran Anggota (Admin)"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Presensi ({ekskulMemberCount})</span>
                  </button>
                ) : (
                  <div className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 font-semibold text-[11px] flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{ekskulMemberCount} Siswa Aktif</span>
                  </div>
                )}

                <button
                  onClick={() => onOpenRegister(sch.ekskulId)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Daftar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Check-in Modal (Admin Only) */}
      {isAdmin && activePresensiEkskul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Presensi Kehadiran Latihan Rutin</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {ekskuls.find((e) => e.id === activePresensiEkskul)?.name}
                </p>
              </div>
              <button
                onClick={() => setActivePresensiEkskul(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {presensiSavedToast ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Presensi Berhasil Disimpan!</h4>
                <p className="text-xs text-slate-500">Data rekap kehadiran latihan telah diperbarui.</p>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
                  {activePresensiMembers.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">
                      Belum ada anggota aktif terdaftar pada ekskul ini.
                    </p>
                  ) : (
                    activePresensiMembers.map((m) => {
                      const currentStatus = attendanceState[m.id] || 'hadir';
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/80 gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={m.avatar}
                              alt={m.fullName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border"
                            />
                            <div className="truncate">
                              <span className="font-bold text-xs text-slate-900 block truncate">
                                {m.fullName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {m.classGrade} • {m.role}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {(['hadir', 'izin', 'sakit', 'alpa'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleMarkAttendance(m.id, st)}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                  currentStatus === st
                                    ? st === 'hadir'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'izin'
                                      ? 'bg-blue-600 text-white'
                                      : st === 'sakit'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-rose-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Total: {activePresensiMembers.length} Anggota Terdaftar
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePresensiEkskul(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                    >
                      Simpan Rekap Presensi
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
