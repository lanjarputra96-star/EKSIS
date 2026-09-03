import React, { useState, useEffect } from 'react';
import {
  getStoredEkskuls,
  saveEkskuls,
  getStoredPhotos,
  savePhotos,
  getStoredMembers,
  saveMembers,
  getStoredAnnouncements,
  saveAnnouncements,
  getLikedPhotoIds,
  toggleLikePhoto,
  getStoredSettings,
  saveSettings,
  getAdminSession,
  logoutAdmin,
  DEFAULT_SETTINGS,
  syncWithCloudflare,
} from './utils/storage';
import {
  Extracurricular,
  ActivityPhoto,
  Member,
  ExtracurricularCategory,
  MemberStatus,
  MemberRole,
  SiteSettings,
  AdminUser,
  SchoolAnnouncement,
} from './types';
import { Navbar } from './components/Navbar';
import { EkskulGrid } from './components/EkskulGrid';
import { EkskulDetailModal } from './components/EkskulDetailModal';
import { GalleryView } from './components/GalleryView';
import { RegistrationView } from './components/RegistrationView';
import { MemberDirectory } from './components/MemberDirectory';
import { ScheduleView } from './components/ScheduleView';
import { StatsView } from './components/StatsView';
import { AddPhotoModal } from './components/AddPhotoModal';
import { AddEkskulModal } from './components/AddEkskulModal';
import { EditEkskulModal } from './components/EditEkskulModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { EkskulPdfReportModal } from './components/EkskulPdfReportModal';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  LogOut,
  Lock,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('ekskul');
  const [ekskuls, setEkskuls] = useState<Extracurricular[]>([]);
  const [photos, setPhotos] = useState<ActivityPhoto[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [likedPhotoIds, setLikedPhotoIds] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Admin state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Filters & selections
  const [selectedCategory, setSelectedCategory] = useState<ExtracurricularCategory>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEkskulDetail, setSelectedEkskulDetail] = useState<Extracurricular | null>(null);
  const [selectedEkskulDetailTab, setSelectedEkskulDetailTab] = useState<'tentang' | 'jadwal' | 'galeri' | 'anggota' | 'prestasi'>('tentang');
  const [selectedPhotoLightbox, setSelectedPhotoLightbox] = useState<ActivityPhoto | null>(null);
  const [preselectedEkskulForRegister, setPreselectedEkskulForRegister] = useState<string | undefined>();

  // Modals
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showAddEkskulModal, setShowAddEkskulModal] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<Extracurricular | null>(null);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [selectedPdfEkskulId, setSelectedPdfEkskulId] = useState<string>('all');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data
  const reloadAllData = () => {
    setEkskuls(getStoredEkskuls());
    setPhotos(getStoredPhotos());
    setMembers(getStoredMembers());
    setAnnouncements(getStoredAnnouncements());
    setLikedPhotoIds(getLikedPhotoIds());
    setSiteSettings(getStoredSettings());
    setAdminUser(getAdminSession());
  };

  useEffect(() => {
    reloadAllData();
  }, []);

  // Handlers for Registration
  const handleOpenRegister = (ekskulId?: string) => {
    setPreselectedEkskulForRegister(ekskulId);
    setActiveTab('pendaftaran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (newMember: Member) => {
    const updated = [newMember, ...members];
    setMembers(updated);
    saveMembers(updated);
    showToast(`Pendaftaran ${newMember.fullName} berhasil dikirim!`);
  };

  // Handlers for Members
  const handleUpdateMemberStatus = (memberId: string, status: MemberStatus) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          status,
          role: status === 'active' && m.role === 'Calon Anggota' ? ('Anggota Aktif' as MemberRole) : m.role,
        };
      }
      return m;
    });
    setMembers(updated);
    saveMembers(updated);
    showToast(`Status anggota berhasil diperbarui menjadi ${status}`);
  };

  const handleUpdateMemberRole = (memberId: string, role: MemberRole) => {
    const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m));
    setMembers(updated);
    saveMembers(updated);
    showToast(`Jabatan berhasil diubah menjadi ${role}`);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) {
      const updated = members.filter((m) => m.id !== memberId);
      setMembers(updated);
      saveMembers(updated);
      showToast('Data anggota berhasil dihapus');
    }
  };

  const handleAddManualMember = (newMember: Member) => {
    const updated = [newMember, ...members];
    setMembers(updated);
    saveMembers(updated);
    showToast(`Anggota ${newMember.fullName} berhasil ditambahkan manual`);
  };

  const handleEditMember = (editedMember: Member) => {
    const updated = members.map((m) => (m.id === editedMember.id ? editedMember : m));
    setMembers(updated);
    saveMembers(updated);
    showToast('Perubahan data anggota berhasil disimpan');
  };

  const handleImportMembers = (newMembers: Member[]) => {
    const updated = [...members, ...newMembers];
    setMembers(updated);
    saveMembers(updated);
    showToast(`Berhasil mengimpor ${newMembers.length} data siswa ke dalam sistem!`);
  };

  // Photo handlers
  const handleLikePhoto = (photoId: string) => {
    const result = toggleLikePhoto(photoId);
    setLikedPhotoIds(getLikedPhotoIds());
    setPhotos(getStoredPhotos());
    if (selectedPhotoLightbox && selectedPhotoLightbox.id === photoId) {
      setSelectedPhotoLightbox((prev) =>
        prev ? { ...prev, likesCount: result.newCount } : null
      );
    }
  };

  const handleAddPhoto = (newPhoto: ActivityPhoto) => {
    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    savePhotos(updated);
    showToast('Foto dokumentasi berhasil ditambahkan ke galeri!');
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto dokumentasi ini?')) {
      const updated = photos.filter((p) => p.id !== photoId);
      setPhotos(updated);
      savePhotos(updated);
      if (selectedPhotoLightbox?.id === photoId) {
        setSelectedPhotoLightbox(null);
      }
      showToast('Foto dokumentasi berhasil dihapus');
    }
  };

  // Ekskul handlers
  const handleAddEkskul = (newEkskul: Extracurricular) => {
    if (!newEkskul || typeof newEkskul !== 'object' || !newEkskul.name || typeof newEkskul.name !== 'string') {
      console.warn('Invalid ekskul object in handleAddEkskul:', newEkskul);
      return;
    }
    const cleanCurrent = ekskuls.filter((e) => Boolean(e && typeof e === 'object' && e.id && e.name));
    const updated = [newEkskul, ...cleanCurrent];
    setEkskuls(updated);
    saveEkskuls(updated);
    syncWithCloudflare().catch(() => {});
    setShowAddEkskulModal(false);
    showToast(`Cabang ${newEkskul.name} berhasil ditambahkan & disinkronkan ke Cloudflare!`);
  };

  const handleSaveEditedEkskul = (updatedEkskul: Extracurricular) => {
    const updated = ekskuls.map((e) => (e.id === updatedEkskul.id ? updatedEkskul : e));
    setEkskuls(updated);
    saveEkskuls(updated);
    if (selectedEkskulDetail?.id === updatedEkskul.id) {
      setSelectedEkskulDetail(updatedEkskul);
    }
    syncWithCloudflare().catch(() => {});
    showToast(`Data ekskul ${updatedEkskul.name} (prestasi & syarat) berhasil diperbarui & tersinkron ke Cloudflare!`);
  };

  const handleDeleteEkskul = (id: string) => {
    const target = ekskuls.find((e) => e.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus cabang ekskul "${target?.name || id}" beserta seluruh datanya?`)) {
      const updated = ekskuls.filter((e) => e.id !== id);
      setEkskuls(updated);
      saveEkskuls(updated);
      syncWithCloudflare().catch(() => {});
      if (selectedEkskulDetail?.id === id) {
        setSelectedEkskulDetail(null);
      }
      showToast('Cabang ekskul berhasil dihapus & data Cloudflare disinkronkan');
    }
  };

  const handleToggleEkskulStatus = (id: string) => {
    const updated = ekskuls.map((e) => {
      if (e.id === id) {
        const nextStatus = e.registrationStatus === 'open' ? 'closed' : 'open';
        return { ...e, registrationStatus: nextStatus as 'open' | 'closed' };
      }
      return e;
    });
    setEkskuls(updated);
    saveEkskuls(updated);
    const target = updated.find((e) => e.id === id);
    showToast(`Status pendaftaran ${target?.shortName} diubah menjadi ${target?.registrationStatus === 'open' ? 'DIBUKA' : 'DITUTUP'}`);
  };

  // Settings & Announcements
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    saveSettings(newSettings);
    showToast('Pengaturan portal & tampilan berhasil disimpan!');
  };

  const handleUpdateAnnouncements = (newAnnouncements: SchoolAnnouncement[]) => {
    setAnnouncements(newAnnouncements);
    saveAnnouncements(newAnnouncements);
    showToast('Daftar pengumuman berhasil diperbarui!');
  };

  const handleAddAnnouncement = (newAnnouncement: SchoolAnnouncement) => {
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    saveAnnouncements(updated);
    showToast('Pengumuman baru berhasil diterbitkan!');
  };

  const handleUpdateAnnouncement = (updatedAnnouncement: SchoolAnnouncement) => {
    const updated = announcements.map((a) =>
      a.id === updatedAnnouncement.id ? updatedAnnouncement : a
    );
    setAnnouncements(updated);
    saveAnnouncements(updated);
    showToast('Pengumuman berhasil diperbarui!');
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      const updated = announcements.filter((a) => a.id !== announcementId);
      setAnnouncements(updated);
      saveAnnouncements(updated);
      showToast('Pengumuman berhasil dihapus');
    }
  };

  const handleOpenPdfReport = (ekskulId: string = 'all') => {
    setSelectedPdfEkskulId(ekskulId);
    setShowPdfReportModal(true);
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setShowAdminLogin(false);
    setShowAdminPanel(true);
    showToast(`Selamat datang Admin, ${user.name}!`);
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    setAdminUser(null);
    setShowAdminPanel(false);
    showToast('Anda telah keluar dari akun admin.');
  };

  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const isAdmin = !!adminUser;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-50/50 to-slate-100/60 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-slate-700/60 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar with Admin controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        totalMembersCount={members.length}
        announcements={announcements}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenRegister={() => handleOpenRegister()}
        siteSettings={siteSettings}
        isAdmin={isAdmin}
        adminUser={adminUser}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'ekskul' && (
          <EkskulGrid
            ekskuls={ekskuls}
            members={members}
            photos={photos}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSelectEkskul={(ekskul) => {
              setSelectedEkskulDetail(ekskul);
              setSelectedEkskulDetailTab('tentang');
            }}
            onSelectEkskulWithTab={(ekskul, tab) => {
              setSelectedEkskulDetail(ekskul);
              setSelectedEkskulDetailTab(tab);
            }}
            onRegisterEkskul={(ekskulId) => handleOpenRegister(ekskulId)}
            onOpenAddModal={() => setShowAddEkskulModal(true)}
            siteSettings={siteSettings}
            isAdmin={isAdmin}
            onOpenAdminPanel={() => setShowAdminPanel(true)}
            onEditEkskul={(ekskul) => setEditingEkskul(ekskul)}
            onDeleteEkskul={handleDeleteEkskul}
            onToggleEkskulStatus={handleToggleEkskulStatus}
          />
        )}

        {activeTab === 'galeri' && (
          <GalleryView
            photos={photos}
            ekskuls={ekskuls}
            selectedPhoto={selectedPhotoLightbox}
            setSelectedPhoto={setSelectedPhotoLightbox}
            onLikePhoto={handleLikePhoto}
            likedPhotoIds={likedPhotoIds}
            onOpenUploadModal={() => setShowAddPhotoModal(true)}
            isAdmin={isAdmin}
            onDeletePhoto={handleDeletePhoto}
          />
        )}

        {activeTab === 'pendaftaran' && (
          <RegistrationView
            ekskuls={ekskuls}
            defaultEkskulId={preselectedEkskulForRegister}
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToMembers={() => {
              setActiveTab('ekskul');
            }}
            availableClasses={siteSettings.availableClasses}
            siteSettings={siteSettings}
          />
        )}

        {activeTab === 'anggota' && (
          <MemberDirectory
            members={members}
            ekskuls={ekskuls}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            onUpdateMemberRole={handleUpdateMemberRole}
            onDeleteMember={handleDeleteMember}
            onAddManualMember={handleAddManualMember}
            onEditMember={handleEditMember}
          />
        )}

        {activeTab === 'jadwal' && (
          <ScheduleView
            ekskuls={ekskuls}
            members={members}
            onOpenRegister={(ekskulId) => handleOpenRegister(ekskulId)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'statistik' && (
          <StatsView ekskuls={ekskuls} members={members} photos={photos} />
        )}
      </main>

      {/* Global Modals */}
      {selectedEkskulDetail && (
        <EkskulDetailModal
          ekskul={selectedEkskulDetail}
          initialTab={selectedEkskulDetailTab}
          onClose={() => setSelectedEkskulDetail(null)}
          onRegister={(ekskulId) => handleOpenRegister(ekskulId)}
          photos={photos}
          members={members}
          onSelectPhoto={(photo) => {
            setSelectedEkskulDetail(null);
            setSelectedPhotoLightbox(photo);
          }}
          isAdmin={isAdmin}
          onEditEkskul={(ekskul) => {
            setSelectedEkskulDetail(null);
            setEditingEkskul(ekskul);
          }}
        />
      )}

      {showAddPhotoModal && (
        <AddPhotoModal
          ekskuls={ekskuls}
          onClose={() => setShowAddPhotoModal(false)}
          onAddPhoto={handleAddPhoto}
        />
      )}

      {showAddEkskulModal && (
        <AddEkskulModal
          onClose={() => setShowAddEkskulModal(false)}
          onAddEkskul={handleAddEkskul}
        />
      )}

      {editingEkskul && (
        <EditEkskulModal
          isOpen={true}
          initialData={editingEkskul}
          ekskul={editingEkskul}
          onClose={() => setEditingEkskul(null)}
          onSave={handleSaveEditedEkskul}
        />
      )}

      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {showAdminPanel && (
        <AdminPanelModal
          onClose={() => setShowAdminPanel(false)}
          siteSettings={siteSettings}
          onUpdateSettings={handleUpdateSettings}
          ekskuls={ekskuls}
          members={members}
          photos={photos}
          announcements={announcements}
          onAddEkskul={() => setShowAddEkskulModal(true)}
          onAddEkskulDirect={handleAddEkskul}
          onEditEkskul={(ekskul) => setEditingEkskul(ekskul)}
          onSaveEditedEkskul={handleSaveEditedEkskul}
          onDeleteEkskul={handleDeleteEkskul}
          onToggleEkskulStatus={handleToggleEkskulStatus}
          onUpdateMemberStatus={handleUpdateMemberStatus}
          onDeleteMember={handleDeleteMember}
          onImportMembers={handleImportMembers}
          onDeletePhoto={handleDeletePhoto}
          onAddPhoto={handleAddPhoto}
          onAddAnnouncement={handleAddAnnouncement}
          onUpdateAnnouncement={handleUpdateAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
          onUpdateAnnouncements={handleUpdateAnnouncements}
          onOpenPdfReport={handleOpenPdfReport}
          onReloadAllData={reloadAllData}
          onLogout={handleLogoutAdmin}
          adminUser={adminUser}
        />
      )}

      {showPdfReportModal && (
        <EkskulPdfReportModal
          isOpen={showPdfReportModal}
          onClose={() => setShowPdfReportModal(false)}
          ekskuls={ekskuls}
          members={members}
          siteSettings={siteSettings}
          initialEkskulId={selectedPdfEkskulId}
        />
      )}

      {/* Modern Sleek Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 mt-14 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center font-black text-white text-sm shadow-sm ring-1 ring-slate-700/50">
                {siteSettings.portalTitle.charAt(0) || 'E'}
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  {siteSettings.portalTitle} • {siteSettings.portalTagline}
                </span>
                <p className="text-xs text-slate-500">
                  {siteSettings.schoolName} • {siteSettings.schoolTagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <button
                onClick={() => {
                  setActiveTab('ekskul');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Katalog Ekskul
              </button>
              <button
                onClick={() => {
                  setActiveTab('galeri');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Galeri Foto
              </button>
              <button
                onClick={() => {
                  setActiveTab('pendaftaran');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-slate-900 transition-colors font-semibold text-slate-700 cursor-pointer"
              >
                Daftar Online
              </button>
              <button
                onClick={() => {
                  setActiveTab('anggota');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Data Anggota
              </button>

              {isAdmin ? (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Login Admin</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} {siteSettings.portalTitle}. {siteSettings.schoolName}.</p>
            <p className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Tahun Ajaran {siteSettings.academicYear} • Sistem Terverifikasi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
