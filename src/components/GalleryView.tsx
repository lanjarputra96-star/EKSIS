import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Heart,
  Calendar,
  Share2,
  Tag,
  Upload,
  Plus,
  X,
  Search,
  CheckCircle2,
  Download,
  Filter,
  Trash2,
} from 'lucide-react';
import { ActivityPhoto, Extracurricular, ExtracurricularCategory } from '../types';
import { CATEGORIES } from '../data/mockData';

interface GalleryViewProps {
  photos: ActivityPhoto[];
  ekskuls: Extracurricular[];
  selectedPhoto: ActivityPhoto | null;
  setSelectedPhoto: (photo: ActivityPhoto | null) => void;
  onLikePhoto: (photoId: string) => void;
  likedPhotoIds: string[];
  onOpenUploadModal: () => void;
  isAdmin?: boolean;
  onDeletePhoto?: (photoId: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  ekskuls,
  selectedPhoto,
  setSelectedPhoto,
  onLikePhoto,
  likedPhotoIds,
  onOpenUploadModal,
  isAdmin,
  onDeletePhoto,
}) => {
  const [selectedEkskulFilter, setSelectedEkskulFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<ExtracurricularCategory>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Filtered photos
  const filteredPhotos = photos.filter((photo) => {
    const matchesEkskul =
      selectedEkskulFilter === 'all' || photo.ekskulId === selectedEkskulFilter;
    const matchesCategory =
      selectedCategory === 'semua' || photo.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.ekskulName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesEkskul && matchesCategory && matchesSearch;
  });

  const handleShare = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Dokumentasi Visual Kegiatan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Galeri Foto & Dokumentasi Ekstrakurikuler
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Koleksi foto aksi panggung, latihan mingguan, turnamen, dan prestasi siswa.
          </p>
        </div>

        {isAdmin && onOpenUploadModal && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-300" />
              <span>Upload Foto Dokumentasi (Admin)</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari foto judul, tag, atau momen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Ekskul Dropdown */}
          <div>
            <select
              value={selectedEkskulFilter}
              onChange={(e) => setSelectedEkskulFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="all">Semua Cabang Ekskul</option>
              {ekskuls.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.shortName} - {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExtracurricularCategory)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Filter Ekskul Cepat:</span>
          <button
            onClick={() => setSelectedEkskulFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
              selectedEkskulFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Semua ({photos.length})
          </button>
          {ekskuls.map((e) => {
            const count = photos.filter((p) => p.ekskulId === e.id).length;
            if (count === 0) return null;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedEkskulFilter(e.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  selectedEkskulFilter === e.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {e.shortName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Photos Masonry / Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Tidak ada foto yang cocok
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Belum ada dokumentasi untuk kriteria filter ini. Silakan coba filter lain atau unggah foto pertama!
          </p>
          <button
            onClick={() => {
              setSelectedEkskulFilter('all');
              setSelectedCategory('semua');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => {
            const isLiked = likedPhotoIds.includes(photo.id);
            return (
              <div
                key={photo.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative h-56 sm:h-60 w-full bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Ekskul tag on image */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md border border-white/10">
                    {photo.ekskulName}
                  </span>

                  {/* Date badge */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/50 text-white backdrop-blur-md">
                    {photo.date}
                  </span>

                  {/* Hover Overlay Details */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm sm:text-base leading-snug drop-shadow-xs line-clamp-1 group-hover:text-indigo-200 transition-colors">
                      {photo.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {photo.caption}
                  </p>

                  {/* Tags */}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      Oleh: {photo.uploaderName || 'Ekskul Team'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isAdmin && onDeletePhoto && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Hapus foto "${photo.title}"?`)) {
                              onDeletePhoto(photo.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Foto Dokumentasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikePhoto(photo.id);
                        }}
                        className={`p-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                          isLiked
                            ? 'text-rose-600 bg-rose-50'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title="Sukai Foto"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked ? 'fill-rose-500 text-rose-500 animate-bounce' : ''
                          }`}
                        />
                        <span className="font-bold text-xs">{photo.likesCount}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto(photo);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      >
                        Lihat Full
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row">
            
            {/* Full Photo */}
            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[65vh] md:max-h-[85vh] w-auto max-w-full object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Details */}
            <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between bg-slate-900 overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
                    {selectedPhoto.ekskulName}
                  </span>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="hidden md:block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold leading-snug text-white">
                    {selectedPhoto.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedPhoto.date}</span>
                    <span>•</span>
                    <span>{selectedPhoto.uploaderName || 'Siswa'}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedPhoto.caption}
                </p>

                {selectedPhoto.tags && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Label & Topik:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPhoto.tags.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onLikePhoto(selectedPhoto.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      likedPhotoIds.includes(selectedPhoto.id)
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedPhotoIds.includes(selectedPhoto.id)
                          ? 'fill-white text-white'
                          : 'text-rose-400'
                      }`}
                    />
                    <span>{selectedPhoto.likesCount} Suka</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && onDeletePhoto && (
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus foto "${selectedPhoto.title}"?`)) {
                            onDeletePhoto(selectedPhoto.id);
                            setSelectedPhoto(null);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer"
                        title="Hapus Foto Dokumentasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan</span>
                    </button>
                  </div>
                </div>

                {copiedToast && (
                  <div className="p-2 rounded-lg bg-emerald-900/80 border border-emerald-700 text-emerald-200 text-xs text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tautan foto berhasil disalin ke clipboard!</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
