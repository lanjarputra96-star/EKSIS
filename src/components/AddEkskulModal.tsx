import React, { useState, useRef } from 'react';
import {
  Plus,
  X,
  Compass,
  Trophy,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  User,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Extracurricular, ExtracurricularCategory } from '../types';
import { CATEGORIES } from '../data/mockData';

interface AddEkskulModalProps {
  onClose: () => void;
  onAddEkskul: (ekskul: Extracurricular) => void;
}

export const AddEkskulModal: React.FC<AddEkskulModalProps> = ({
  onClose,
  onAddEkskul,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    category: 'olahraga' as ExtracurricularCategory,
    tagline: '',
    description: '',
    vision: '',
    missionString: 'Menyelenggarakan latihan rutin berkualitas, Mempersiapkan siswa mengikuti turnamen',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    meetingRoom: 'Lapangan Olahraga Utama',
    coachName: '',
    coachTitle: 'Guru Pembina',
    leaderName: '',
    leaderClass: 'Kelas 5A',
    quota: 30,
    day1: 'Selasa',
    time1: '15.30 - 17.00 WIB',
    loc1: 'Lapangan Utama',
    achievementTitle: '',
    achievementRank: 'Tingkat Kota',
    achievementYear: new Date().getFullYear().toString(),
    requirementsString: 'Siswa aktif sekolah\nMemiliki komitmen tinggi untuk hadir latihan rutin\nSurat persetujuan orang tua/wali',
  });

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, logo: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, coverImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.shortName) return;

    const slug = formData.shortName.toLowerCase().replace(/\s+/g, '-');
    const missions = formData.missionString
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const newEkskul: Extracurricular = {
      id: `ekskul-${Date.now()}`,
      slug,
      name: formData.name,
      shortName: formData.shortName.toUpperCase(),
      category: formData.category,
      tagline: formData.tagline || 'Mengembangkan bakat dan prestasi siswa',
      description: formData.description || 'Ekstrakurikuler pembinaan minat dan bakat siswa.',
      vision: formData.vision || 'Membentuk generasi berprestasi dan berkarakter.',
      mission: missions.length > 0 ? missions : ['Melaksanakan latihan terprogram secara rutin.'],
      logo: formData.logo || formData.coverImage,
      coverImage: formData.coverImage,
      meetingRoom: formData.meetingRoom,
      monthlyFee: 'Gratis (Didanai Sekolah)',
      equipmentProvided: ['Peralatan standar sekolah'],
      schedule: [
        {
          day: formData.day1,
          time: formData.time1,
          location: formData.loc1,
          notes: 'Latihan Rutin',
        },
      ],
      coach: {
        name: formData.coachName || 'Drs. Pembina Sekolah',
        title: formData.coachTitle,
        phone: '0812-3456-7890',
      },
      leader: {
        name: formData.leaderName || 'Ketua Terpilih',
        classGrade: formData.leaderClass,
        phone: '0813-9988-7766',
      },
      achievements: formData.achievementTitle.trim()
        ? [
            {
              year: formData.achievementYear || new Date().getFullYear().toString(),
              title: formData.achievementTitle.trim(),
              rank: formData.achievementRank || 'Tingkat Kota',
            },
          ]
        : [
            {
              year: new Date().getFullYear().toString(),
              title: 'Partisipasi Kejuaraan & Pentas Siswa Tingkat Kota',
              rank: 'Peserta Unggulan',
            },
          ],
      requirements: formData.requirementsString.trim()
        ? formData.requirementsString
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean)
        : [
            'Siswa aktif sekolah',
            'Memiliki komitmen tinggi untuk hadir latihan rutin',
            'Surat persetujuan orang tua/wali',
          ],
      quota: Number(formData.quota) || 30,
      registrationStatus: 'open',
      tags: [formData.shortName, 'Ekskul', 'Prestasi'],
    };

    onAddEkskul(newEkskul);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Tambah Cabang Ekstrakurikuler Baru
              </h3>
              <p className="text-xs text-slate-500">
                Daftarkan cabang ekstrakurikuler baru untuk siswa sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Lengkap Ekskul *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Panahan & Archery Club"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Singkat / Akronim *
              </label>
              <input
                type="text"
                required
                placeholder="PANAHAN"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kategori Kegiatan *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as ExtracurricularCategory,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.filter((c) => c.id !== 'semua').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kapasitas Kuota Siswa
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.quota}
                onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Slogan / Tagline
            </label>
            <input
              type="text"
              placeholder="Contoh: Fokus, Tenang, Tepat Sasaran"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Deskripsi Lengkap Kegiatan
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan fokus kegiatan ekskul ini..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hari Latihan</label>
              <select
                value={formData.day1}
                onChange={(e) => setFormData({ ...formData, day1: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Latihan</label>
              <input
                type="text"
                placeholder="15.30 - 17.30 WIB"
                value={formData.time1}
                onChange={(e) => setFormData({ ...formData, time1: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lokasi Latihan</label>
              <input
                type="text"
                placeholder="Lapangan Olahraga"
                value={formData.loc1}
                onChange={(e) => setFormData({ ...formData, loc1: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            {/* Logo / Identitas Upload */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Foto Logo / Identitas Ekskul
              </label>
              <p className="text-[10px] text-slate-500 mb-2">
                Upload file foto/logo atau masukkan URL
              </p>

              <div className="flex items-center gap-2 mb-2">
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Logo Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File Logo</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Atau tempel URL gambar..."
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-white border border-slate-200 font-mono text-slate-700"
              />
            </div>

            {/* Cover / Banner Upload */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Foto Sampul / Banner Kegiatan
              </label>
              <p className="text-[10px] text-slate-500 mb-2">
                Upload foto kegiatan atau masukkan URL
              </p>

              <div className="flex items-center gap-2 mb-2">
                {formData.coverImage ? (
                  <img
                    src={formData.coverImage}
                    alt="Cover Preview"
                    className="w-16 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={handleCoverUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Sampul</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Atau tempel URL cover..."
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-white border border-slate-200 font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Guru Pembina
              </label>
              <input
                type="text"
                placeholder="Contoh: Drs. Surya Pratama, M.Pd."
                value={formData.coachName}
                onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Ketua Siswa
              </label>
              <input
                type="text"
                placeholder="Contoh: Satria Bagas (XI MIPA 2)"
                value={formData.leaderName}
                onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Prestasi Awal Ekskul */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <label className="font-bold text-slate-800 text-xs">
                Catatan Prestasi / Kejuaraan Awal (Opsional)
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Tahun (2026)"
                  value={formData.achievementYear}
                  onChange={(e) => setFormData({ ...formData, achievementYear: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-amber-200 text-slate-800 font-bold"
                />
              </div>
              <div className="sm:col-span-6">
                <input
                  type="text"
                  placeholder="Nama Prestasi (Contoh: Juara 1 Turnamen Pelajar)"
                  value={formData.achievementTitle}
                  onChange={(e) => setFormData({ ...formData, achievementTitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-amber-200 text-slate-800"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Tingkat / Peringkat"
                  value={formData.achievementRank}
                  onChange={(e) => setFormData({ ...formData, achievementRank: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-amber-200 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Syarat Pendaftaran */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <label className="font-bold text-slate-800 text-xs">
                  Syarat & Ketentuan Pendaftaran Anggota
                </label>
              </div>
              <span className="text-[10px] text-slate-500">1 baris = 1 syarat</span>
            </div>
            <textarea
              rows={3}
              placeholder="Masukkan syarat pendaftaran, satu per baris..."
              value={formData.requirementsString}
              onChange={(e) => setFormData({ ...formData, requirementsString: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-emerald-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simpan Ekstrakurikuler</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
