import React, { useState } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Tag,
  Link,
  Calendar,
} from 'lucide-react';
import { ActivityPhoto, Extracurricular } from '../types';

interface AddPhotoModalProps {
  ekskuls: Extracurricular[];
  onClose: () => void;
  onAddPhoto: (photo: ActivityPhoto) => void;
}

const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&auto=format&fit=crop&q=80', // Kids drawing/art
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&auto=format&fit=crop&q=80', // Kids robotic/lego
  'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=900&auto=format&fit=crop&q=80', // Kids soccer/futsal
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80', // Kids music/drumband
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&auto=format&fit=crop&q=80', // Kids dance/stage
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=900&auto=format&fit=crop&q=80', // Kids scouting/pramuka
];

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  ekskuls,
  onClose,
  onAddPhoto,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    ekskulId: ekskuls[0]?.id || '',
    imageUrl: PHOTO_PRESETS[0],
    uploaderName: '',
    date: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    tagsString: 'Dokumentasi, Latihan, Prestasi',
  });

  const [previewError, setPreviewError] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
          setPreviewError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) return;

    const targetEkskul = ekskuls.find((e) => e.id === formData.ekskulId);
    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPhoto: ActivityPhoto = {
      id: `photo-${Date.now()}`,
      ekskulId: formData.ekskulId,
      ekskulName: targetEkskul ? targetEkskul.shortName : 'Ekskul',
      title: formData.title,
      caption: formData.caption,
      imageUrl: formData.imageUrl,
      date: formData.date,
      category: targetEkskul ? targetEkskul.category : 'olahraga',
      likesCount: 1,
      uploaderName: formData.uploaderName || 'Pengurus Ekskul',
      tags,
    };

    onAddPhoto(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Upload Foto Dokumentasi Ekskul
              </h3>
              <p className="text-xs text-slate-500">
                Bagikan momen keseruan latihan, pentas seni, dan kejuaraan
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
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Judul Foto / Momen Kegiatan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Juara 1 Turnamen Futsal Antar Pelajar 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Cabang Ekstrakurikuler *
              </label>
              <select
                value={formData.ekskulId}
                onChange={(e) => setFormData({ ...formData, ekskulId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
              >
                {ekskuls.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.shortName} - {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Pengunggah / Fotografer
              </label>
              <input
                type="text"
                placeholder="Contoh: Tim Jurnalistik / Nama Siswa"
                value={formData.uploaderName}
                onChange={(e) => setFormData({ ...formData, uploaderName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
              />
            </div>
          </div>

          {/* Image URL or File Upload */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Foto Kegiatan (Pilih File atau Masukkan URL) *
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <input
                type="url"
                placeholder="Atau tempel URL Gambar (https://...)"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setPreviewError(false);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            {/* Quick Image Presets */}
            <div className="mt-2">
              <span className="text-[10px] text-slate-400 block mb-1">
                Atau pilih contoh foto cepat:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {PHOTO_PRESETS.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt="Preset"
                    onClick={() => {
                      setFormData({ ...formData, imageUrl: p });
                      setPreviewError(false);
                    }}
                    className={`w-12 h-10 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                      formData.imageUrl === p
                        ? 'border-indigo-600 scale-105 shadow-sm'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Image Preview */}
            {formData.imageUrl && !previewError && (
              <div className="mt-2 relative h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-xs">
                  Pratinjau Foto
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Keterangan / Caption Cerita
            </label>
            <textarea
              rows={2}
              placeholder="Ceritakan momen yang terjadi pada foto ini..."
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Label / Tags (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Juara, Pementasan, Latihan, HUT RI"
              value={formData.tagsString}
              onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
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
              <Upload className="w-3.5 h-3.5" />
              <span>Simpan Foto ke Galeri</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
