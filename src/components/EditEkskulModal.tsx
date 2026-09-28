import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Plus,
  Compass,
  Upload,
} from 'lucide-react';
import { Extracurricular, ExtracurricularCategory, ScheduleItem } from '../types';
import { CATEGORIES } from '../data/mockData';

interface EditEkskulModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (ekskul: Extracurricular) => void;
  initialData?: Extracurricular | null;
  ekskul?: Extracurricular | null;
}

export const EditEkskulModal: React.FC<EditEkskulModalProps> = ({
  isOpen = true,
  onClose,
  onSave,
  initialData,
  ekskul,
}) => {
  const activeData = ekskul || initialData;
  const isEditing = Boolean(activeData);

  const [formData, setFormData] = useState<Partial<Extracurricular>>({
    name: '',
    shortName: '',
    category: 'olahraga',
    tagline: '',
    description: '',
    vision: '',
    mission: [''],
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    meetingRoom: 'Lapangan Utama & Ruang Serbaguna',
    monthlyFee: 'Gratis (Didanai Sekolah)',
    equipmentProvided: ['Peralatan standar sekolah'],
    quota: 30,
    registrationStatus: 'open',
    tags: ['Prestasi', 'Siswa Aktif'],
    coach: {
      name: '',
      title: 'Guru Pembina',
      phone: '0812-3456-7890',
    },
    leader: {
      name: '',
      classGrade: 'XI MIPA 1',
      phone: '0813-9988-7766',
    },
    schedule: [
      {
        day: 'Selasa',
        time: '15.30 - 17.30 WIB',
        location: 'Lapangan Utama',
        notes: 'Latihan Rutin',
      },
    ],
    requirements: [
      'Siswa aktif sekolah',
      'Memiliki komitmen tinggi untuk hadir latihan rutin',
      'Mendapat izin dari orang tua / wali murid',
    ],
    achievements: [
      {
        year: '2025',
        title: 'Juara & Partisipasi Ajang Pelajar',
        rank: 'Tingkat Kota / Wilayah',
      },
    ],
  });

  const [activeTab, setActiveTab] = useState<'profil' | 'jadwal' | 'pengurus' | 'misi' | 'prestasi'>('profil');
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

  const wasOpenRef = useRef(false);
  const loadedTargetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const isJustOpened = Boolean(isOpen && !wasOpenRef.current);
    const currentId = activeData?.id || (isEditing ? 'editing' : 'new');
    const isTargetChanged = currentId !== loadedTargetIdRef.current;

    // Only load initial form data when the modal first opens or the target ID explicitly changes
    if (isOpen && (isJustOpened || isTargetChanged)) {
      loadedTargetIdRef.current = currentId;
      if (activeData) {
        setFormData({
          ...activeData,
          mission: activeData.mission && activeData.mission.length > 0 ? activeData.mission : [''],
          requirements: activeData.requirements && activeData.requirements.length > 0 ? activeData.requirements : [
            'Siswa aktif sekolah',
            'Mendapat izin tertulis dari orang tua / wali murid',
          ],
          achievements: activeData.achievements && activeData.achievements.length > 0 ? activeData.achievements : [
            { year: '2026', title: 'Partisipasi Prestasi & Kejuaraan Pelajar', rank: 'Tingkat Kota / Wilayah' },
          ],
          equipmentProvided: activeData.equipmentProvided && activeData.equipmentProvided.length > 0 ? activeData.equipmentProvided : [''],
          schedule: activeData.schedule && activeData.schedule.length > 0 ? activeData.schedule : [
            { day: 'Senin', time: '15.30 - 17.00 WIB', location: 'Sekolah' },
          ],
        });
      } else {
        setFormData({
          name: '',
          shortName: '',
          category: 'olahraga',
          tagline: '',
          description: '',
          vision: '',
          mission: ['Melaksanakan latihan terprogram secara rutin.'],
          coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
          logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
          meetingRoom: 'Lapangan Utama',
          monthlyFee: 'Gratis',
          equipmentProvided: ['Peralatan standar sekolah'],
          quota: 30,
          registrationStatus: 'open',
          tags: ['Ekstrakurikuler'],
          coach: { name: '', title: 'Guru Pembina', phone: '' },
          leader: { name: '', classGrade: 'XI MIPA 1', phone: '' },
          schedule: [{ day: 'Selasa', time: '15.30 - 17.30 WIB', location: 'Lapangan Utama', notes: 'Latihan Rutin' }],
          requirements: ['Siswa aktif sekolah', 'Izin orang tua'],
          achievements: [{ year: '2025', title: 'Prestasi Siswa', rank: 'Tingkat Kota' }],
        });
      }
    }
    if (!isOpen) {
      loadedTargetIdRef.current = null;
    }
    wasOpenRef.current = Boolean(isOpen);
  }, [activeData?.id, isEditing, isOpen]);

  if (isOpen === false) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.shortName) return;

    const slug = formData.slug || formData.shortName.toLowerCase().replace(/\s+/g, '-');
    const ekskulData: Extracurricular = {
      id: activeData?.id || `ekskul-${Date.now()}`,
      slug,
      name: formData.name || '',
      shortName: formData.shortName.toUpperCase(),
      category: formData.category || 'olahraga',
      tagline: formData.tagline || 'Mengembangkan minat, bakat, dan karakter unggul siswa',
      description: formData.description || 'Ekstrakurikuler pilihan siswa berprestasi.',
      vision: formData.vision || 'Mencetak generasi muda berkarakter dan berprestasi.',
      mission: formData.mission?.filter(Boolean) || ['Menyelenggarakan pembinaan teratur.'],
      coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
      logo: formData.logo || formData.coverImage || '',
      meetingRoom: formData.meetingRoom || 'Ruang Serbaguna',
      monthlyFee: formData.monthlyFee || 'Gratis',
      equipmentProvided: formData.equipmentProvided?.filter(Boolean) || ['Peralatan Sekolah'],
      quota: Number(formData.quota) || 30,
      registrationStatus: formData.registrationStatus || 'open',
      tags: formData.tags || ['Ekskul'],
      coach: {
        name: formData.coach?.name || 'Pembina Sekolah',
        title: formData.coach?.title || 'Guru Pembina',
        phone: formData.coach?.phone || '0812-3456-7890',
      },
      leader: {
        name: formData.leader?.name || 'Ketua Pengurus',
        classGrade: formData.leader?.classGrade || 'XI',
        phone: formData.leader?.phone || '0813-9988-7766',
      },
      schedule: formData.schedule || [],
      requirements: (formData.requirements || []).map((r) => r.trim()).filter(Boolean),
      achievements: (formData.achievements || []).filter(
        (a) => a && typeof a.title === 'string' && a.title.trim().length > 0
      ),
      socialMedia: formData.socialMedia || {},
    };

    onSave(ekskulData);
    onClose();
  };

  // Helper functions for dynamic lists
  const handleAddMission = () => {
    setFormData({ ...formData, mission: [...(formData.mission || []), ''] });
  };

  const handleUpdateMission = (index: number, val: string) => {
    const updated = [...(formData.mission || [])];
    updated[index] = val;
    setFormData({ ...formData, mission: updated });
  };

  const handleRemoveMission = (index: number) => {
    setFormData({
      ...formData,
      mission: formData.mission?.filter((_, i) => i !== index),
    });
  };

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedule: [
        ...(formData.schedule || []),
        { day: 'Kamis', time: '15.30 - 17.00 WIB', location: 'Sekolah' },
      ],
    });
  };

  const handleUpdateSchedule = (index: number, field: keyof ScheduleItem, val: string) => {
    const updated = [...(formData.schedule || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, schedule: updated });
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule?.filter((_, i) => i !== index),
    });
  };

  // Helper functions for Prestasi (Achievements)
  const handleAddAchievement = () => {
    setFormData({
      ...formData,
      achievements: [
        ...(formData.achievements || []),
        { year: new Date().getFullYear().toString(), title: '', rank: 'Tingkat Kota' },
      ],
    });
  };

  const handleUpdateAchievement = (index: number, field: 'year' | 'title' | 'rank', val: string) => {
    const updated = [...(formData.achievements || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, achievements: updated });
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: (formData.achievements || []).filter((_, i) => i !== index),
    });
  };

  // Helper functions for Syarat (Requirements)
  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...(formData.requirements || []), ''],
    });
  };

  const handleUpdateRequirement = (index: number, val: string) => {
    const updated = [...(formData.requirements || [])];
    updated[index] = val;
    setFormData({ ...formData, requirements: updated });
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: (formData.requirements || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 mb-1 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{isEditing ? 'Mode Edit Data Ekskul' : 'Tambah Cabang Baru'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {isEditing ? `Ubah Data: ${activeData?.name}` : 'Buat Ekstrakurikuler Baru'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profil'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Profil & Informasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jadwal')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'jadwal'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Jadwal & Lokasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pengurus')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pengurus'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Pembina & Pengurus
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('misi')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'misi'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Visi, Misi & Detail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prestasi')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'prestasi'
                ? 'bg-white text-amber-950 border-t-2 border-t-amber-500 border-x border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-amber-800/80 hover:text-amber-950 hover:bg-amber-50/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>5. Prestasi & Syarat</span>
            {((formData.achievements?.length || 0) > 0 || (formData.requirements?.length || 0) > 0) && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold ml-0.5">
                {(formData.achievements?.length || 0) + (formData.requirements?.length || 0)}
              </span>
            )}
          </button>
        </div>

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
          
          {/* TAB 1: PROFIL & INFORMASI UTAMA */}
          {activeTab === 'profil' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Lengkap Ekstrakurikuler *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paskibra - Pasukan Pengibar Bendera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Singkat / Kode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PASKIBRA, BASKET"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kategori Minat & Bakat
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExtracurricularCategory })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'semua').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Slogan / Tagline Singkat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tegas, Tangkas, Berjiwa Kesatria untuk Sang Saka"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan gambaran umum kegiatan, tujuan, dan materi latihan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Status Pendaftaran
                  </label>
                  <select
                    value={formData.registrationStatus}
                    onChange={(e) => setFormData({ ...formData, registrationStatus: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-semibold"
                  >
                    <option value="open">🟢 Buka Pendaftaran</option>
                    <option value="closed">🔴 Pendaftaran Ditutup</option>
                    <option value="coming_soon">🟡 Segera Dibuka</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kuota Siswa
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Iuran / Biaya
                  </label>
                  <input
                    type="text"
                    placeholder="Gratis / Rp 20.000 / bln"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                {/* Logo / Identitas Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Foto Logo / Lambang Ekskul
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
                        className="w-full px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center gap-1.5 border border-indigo-200 text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Logo</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar logo..."
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-white border border-slate-200 font-mono text-slate-700"
                  />
                </div>

                {/* Cover / Banner Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
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
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center gap-1.5 border border-slate-300 text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Foto Sampul</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Atau tempel URL cover banner..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-white border border-slate-200 font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JADWAL & LOKASI */}
          {activeTab === 'jadwal' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ruang Pertemuan / Tempat Latihan Utama
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lapangan Utama & Ruang Paskibra Lt. 1"
                  value={formData.meetingRoom}
                  onChange={(e) => setFormData({ ...formData, meetingRoom: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Jadwal Latihan Mingguan
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Hari Latihan</span>
                  </button>
                </div>

                {formData.schedule?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Hari</label>
                      <input
                        type="text"
                        placeholder="Contoh: Selasa & Jumat"
                        value={item.day}
                        onChange={(e) => handleUpdateSchedule(idx, 'day', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Waktu</label>
                      <input
                        type="text"
                        placeholder="15.30 - 17.30 WIB"
                        value={item.time}
                        onChange={(e) => handleUpdateSchedule(idx, 'time', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Lokasi</label>
                      <input
                        type="text"
                        placeholder="Lapangan Basket"
                        value={item.location}
                        onChange={(e) => handleUpdateSchedule(idx, 'location', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus baris jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PEMBINA & PENGURUS */}
          {activeTab === 'pengurus' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Pembina */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-indigo-900 block flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Data Guru Pembina / Pelatih</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Pembina</label>
                    <input
                      type="text"
                      placeholder="Contoh: Drs. H. Bambang Sudirman, M.Pd"
                      value={formData.coach?.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coach: { ...formData.coach!, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jabatan / Gelar</label>
                    <input
                      type="text"
                      placeholder="Guru Pembina & Pelatih Utama"
                      value={formData.coach?.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coach: { ...formData.coach!, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">No. Kontak / WhatsApp Pembina</label>
                    <input
                      type="text"
                      placeholder="0812-3456-7890"
                      value={formData.coach?.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coach: { ...formData.coach!, phone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Ketua Siswa */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Ketua Ekstrakurikuler (Siswa)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Ketua Siswa</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bima Arya Putra"
                      value={formData.leader?.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leader: { ...formData.leader!, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kelas</label>
                    <input
                      type="text"
                      placeholder="Contoh: XI MIPA 1"
                      value={formData.leader?.classGrade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leader: { ...formData.leader!, classGrade: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VISI, MISI & DETAIL */}
          {activeTab === 'misi' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Visi Ekskul</label>
                <textarea
                  rows={2}
                  placeholder="Visi jangka panjang organisasi..."
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Misi Ekskul</label>
                  <button
                    type="button"
                    onClick={handleAddMission}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Butir Misi</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.mission?.map((m, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="w-5 text-center text-xs font-bold text-slate-400 pt-2">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Butir misi kegiatan..."
                        value={m}
                        onChange={(e) => handleUpdateMission(idx, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMission(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRESTASI & SYARAT */}
          {activeTab === 'prestasi' && (
            <div className="space-y-6 animate-fadeIn">
              {/* BAGIAN 1: INPUT PRESTASI & PENGHARGAAN */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Rekam Prestasi & Kejuaraan Ekskul</h4>
                      <p className="text-[11px] text-slate-500">
                        Catatan pencapaian kejuaraan, medali, atau gelar juara siswa
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Prestasi Baru</span>
                  </button>
                </div>

                {(!formData.achievements || formData.achievements.length === 0) ? (
                  <div className="text-center py-6 border-2 border-dashed border-amber-200 rounded-xl bg-white/60">
                    <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-600">Belum ada daftar prestasi</p>
                    <p className="text-[11px] text-slate-400 mb-3">Klik tombol di atas untuk menambahkan prestasi ekskul ini</p>
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Prestasi Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.achievements.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tahun</label>
                          <input
                            type="text"
                            placeholder="2026"
                            value={item.year}
                            onChange={(e) => handleUpdateAchievement(idx, 'year', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                          />
                        </div>

                        <div className="sm:col-span-6">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Kejuaraan / Prestasi</label>
                          <input
                            type="text"
                            placeholder="Contoh: Juara 1 Turnamen Futsal Pelajar Tingkat SD"
                            value={item.title}
                            onChange={(e) => handleUpdateAchievement(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tingkat / Peringkat</label>
                          <input
                            type="text"
                            placeholder="Contoh: Tingkat Kota / Provinsi"
                            value={item.rank}
                            onChange={(e) => handleUpdateAchievement(idx, 'rank', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end pt-1 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveAchievement(idx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus baris prestasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BAGIAN 2: INPUT SYARAT & KETENTUAN PENDAFTARAN */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Syarat & Ketentuan Pendaftaran Siswa</h4>
                      <p className="text-[11px] text-slate-500">
                        Persyaratan yang harus dipenuhi calon anggota saat mendaftar ekskul ini
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Butir Syarat</span>
                  </button>
                </div>

                {(!formData.requirements || formData.requirements.length === 0) ? (
                  <div className="text-center py-6 border-2 border-dashed border-emerald-200 rounded-xl bg-white/60">
                    <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-600">Belum ada syarat pendaftaran khusus</p>
                    <p className="text-[11px] text-slate-400 mb-3">Klik tombol di atas untuk menambahkan syarat</p>
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Syarat Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-bold text-emerald-700 shrink-0">{idx + 1}.</span>
                        <input
                          type="text"
                          placeholder="Contoh: Siswa aktif sekolah, berbadan sehat, memiliki komitmen latihan"
                          value={req}
                          onChange={(e) => handleUpdateRequirement(idx, e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-emerald-200 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0"
                          title="Hapus syarat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isEditing ? 'Simpan Perubahan Ekskul' : 'Publikasikan Ekskul Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
