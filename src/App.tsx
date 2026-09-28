import React, { useState, useEffect, useRef } from 'react';
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
  fetchServerData,
  syncAllDataToServer,
  registerMemberToServer,
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
  Phone,
  Mail,
  MapPin,
  Instagram,
  Youtube,
  ExternalLink,
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

  // Refs to prevent background polling or focus events from wiping out admin typing in progress
  const showAdminPanelRef = useRef(showAdminPanel);
  showAdminPanelRef.current = showAdminPanel;
  const editingEkskulRef = useRef(editingEkskul);
  editingEkskulRef.current = editingEkskul;

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

    // Fetch latest cloud database from server (persisted across devices & Cloudflare D1)
    fetchServerData().then((res) => {
      if (res.success && res.data) {
        if (res.data.ekskuls && res.data.ekskuls.length > 0) setEkskuls(res.data.ekskuls);
        if (res.data.members && res.data.members.length > 0) setMembers(res.data.members);
        if (res.data.photos && res.data.photos.length > 0) setPhotos(res.data.photos);
        if (res.data.announcements && res.data.announcements.length > 0) setAnnouncements(res.data.announcements);
        if (res.data.settings) setSiteSettings(res.data.settings);
      } else {
        // Initial seed to server
        syncAllDataToServer().catch(() => {});
      }
    }).catch(() => {});

    // Auto-poll to receive updates from other devices (guards against overwriting active admin edits)
    const interval = setInterval(() => {
      fetchServerData().then((res) => {
        if (res.success && res.data) {
          if (!editingEkskulRef.current && res.data.ekskuls) setEkskuls(res.data.ekskuls);
          if (res.data.members) setMembers(res.data.members);
          if (res.data.photos) setPhotos(res.data.photos);
          if (res.data.announcements) setAnnouncements(res.data.announcements);
          // Only update siteSettings from background polling if admin panel is NOT currently open
          if (!showAdminPanelRef.current && res.data.settings) setSiteSettings(res.data.settings);
        }
      }).catch(() => {});
    }, 20000);

    const onFocus = () => {
      fetchServerData().then((res) => {
        if (res.success && res.data) {
          if (!editingEkskulRef.current && res.data.ekskuls) setEkskuls(res.data.ekskuls);
          if (res.data.members) setMembers(res.data.members);
          if (res.data.photos) setPhotos(res.data.photos);
          if (res.data.announcements) setAnnouncements(res.data.announcements);
          // Only update siteSettings on focus if admin panel is NOT currently open
          if (!showAdminPanelRef.current && res.data.settings) setSiteSettings(res.data.settings);
        }
      }).catch(() => {});
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
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
    registerMemberToServer(newMember).catch(() => {});
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Pendaftaran ${newMember.fullName} berhasil dikirim & tersimpan ke Cloudflare D1!`);
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
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Status anggota berhasil diperbarui menjadi ${status}`);
  };

  const handleUpdateMemberRole = (memberId: string, role: MemberRole) => {
    const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m));
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Jabatan berhasil diubah menjadi ${role}`);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) {
      const updated = members.filter((m) => m.id !== memberId);
      setMembers(updated);
      saveMembers(updated);
      syncAllDataToServer({ members: updated }).catch(() => {});
      syncWithCloudflare().catch(() => {});
      showToast('Data anggota berhasil dihapus & disinkronkan ke Cloudflare');
    }
  };

  const handleDeleteMultipleMembers = (memberIds: string[]) => {
    if (!memberIds || memberIds.length === 0) return;
    const idSet = new Set(memberIds);
    const updated = members.filter((m) => !idSet.has(m.id));
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`${memberIds.length} data anggota berhasil dihapus & disinkronkan ke Cloudflare`);
  };

  const handleDeleteMembersByEkskul = (ekskulId: string) => {
    const targetEkskul = ekskuls.find((e) => e.id === ekskulId);
    const count = members.filter((m) => m.ekskulId === ekskulId).length;
    if (count === 0) {
      showToast(`Tidak ada data anggota di cabang ${targetEkskul?.name || 'terpilih'}`);
      return;
    }
    const updated = members.filter((m) => m.ekskulId !== ekskulId);
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Seluruh anggota cabang ${targetEkskul?.shortName || targetEkskul?.name || 'ekskul'} (${count} siswa) berhasil dihapus & disinkronkan`);
  };

  const handleDeleteAllMembers = () => {
    if (members.length === 0) {
      showToast('Belum ada data anggota untuk dihapus');
      return;
    }
    const count = members.length;
    const updated: Member[] = [];
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Seluruh data anggota (${count} siswa) berhasil dihapus & disinkronkan ke Cloudflare`);
  };

  const handleAddManualMember = (newMember: Member) => {
    const updated = [newMember, ...members];
    setMembers(updated);
    saveMembers(updated);
    registerMemberToServer(newMember).catch(() => {});
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Anggota ${newMember.fullName} berhasil ditambahkan & tersimpan ke Cloudflare D1`);
  };

  const handleEditMember = (editedMember: Member) => {
    const updated = members.map((m) => (m.id === editedMember.id ? editedMember : m));
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Perubahan data anggota berhasil disimpan & disinkronkan');
  };

  const handleImportMembers = (newMembers: Member[]) => {
    const updated = [...members, ...newMembers];
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Berhasil mengimpor ${newMembers.length} data siswa & tersimpan ke Cloudflare D1!`);
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
    syncAllDataToServer({ photos: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Foto dokumentasi berhasil ditambahkan ke galeri & Cloudflare!');
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto dokumentasi ini?')) {
      const updated = photos.filter((p) => p.id !== photoId);
      setPhotos(updated);
      savePhotos(updated);
      syncAllDataToServer({ photos: updated }).catch(() => {});
      syncWithCloudflare().catch(() => {});
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
    syncAllDataToServer({ ekskuls: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    setShowAddEkskulModal(false);
    showToast(`Cabang ${newEkskul.name} berhasil ditambahkan & disinkronkan ke Cloudflare D1!`);
  };

  const handleSaveEditedEkskul = (updatedEkskul: Extracurricular) => {
    const updated = ekskuls.map((e) => (e.id === updatedEkskul.id ? updatedEkskul : e));
    setEkskuls(updated);
    saveEkskuls(updated);
    if (selectedEkskulDetail?.id === updatedEkskul.id) {
      setSelectedEkskulDetail(updatedEkskul);
    }
    syncAllDataToServer({ ekskuls: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast(`Data ekskul ${updatedEkskul.name} (prestasi & syarat) berhasil diperbarui & tersinkron ke Cloudflare!`);
  };

  const handleUpdateEkskulLogo = (id: string, newLogoUrl: string) => {
    const target = ekskuls.find((e) => e.id === id);
    if (!target) return;
    const updated = { ...target, logo: newLogoUrl };
    handleSaveEditedEkskul(updated);
  };

  const handleDeleteEkskul = (id: string) => {
    const target = ekskuls.find((e) => e.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus cabang ekskul "${target?.name || id}" beserta seluruh datanya?`)) {
      const updated = ekskuls.filter((e) => e.id !== id);
      setEkskuls(updated);
      saveEkskuls(updated);
      syncAllDataToServer({ ekskuls: updated }).catch(() => {});
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
    syncAllDataToServer({ ekskuls: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    const target = updated.find((e) => e.id === id);
    showToast(`Status pendaftaran ${target?.shortName} diubah menjadi ${target?.registrationStatus === 'open' ? 'DIBUKA' : 'DITUTUP'}`);
  };

  const handleSaveAttendance = (
    ekskulId: string,
    attendanceMap: { [memberId: string]: 'hadir' | 'izin' | 'sakit' | 'alpa' }
  ) => {
    const updated = members.map((m) => {
      if (m.ekskulId === ekskulId && attendanceMap[m.id]) {
        const attStatus = attendanceMap[m.id];
        let delta = 0;
        if (attStatus === 'hadir') delta = 2;
        else if (attStatus === 'alpa') delta = -5;
        const currentScore = m.attendanceScore ?? 90;
        const newScore = Math.min(100, Math.max(50, currentScore + delta));
        return {
          ...m,
          attendanceScore: newScore,
        };
      }
      return m;
    });
    setMembers(updated);
    saveMembers(updated);
    syncAllDataToServer({ members: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Rekap presensi berhasil disimpan & disinkronkan ke Cloudflare D1!');
  };

  // Settings & Announcements
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    saveSettings(newSettings);
    syncAllDataToServer({ settings: newSettings }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Pengaturan portal & Cloudflare berhasil disimpan!');
  };

  const handleUpdateAnnouncements = (newAnnouncements: SchoolAnnouncement[]) => {
    setAnnouncements(newAnnouncements);
    saveAnnouncements(newAnnouncements);
    syncAllDataToServer({ announcements: newAnnouncements }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Daftar pengumuman berhasil diperbarui!');
  };

  const handleAddAnnouncement = (newAnnouncement: SchoolAnnouncement) => {
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    saveAnnouncements(updated);
    syncAllDataToServer({ announcements: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Pengumuman baru berhasil diterbitkan & disinkronkan!');
  };

  const handleUpdateAnnouncement = (updatedAnnouncement: SchoolAnnouncement) => {
    const updated = announcements.map((a) =>
      a.id === updatedAnnouncement.id ? updatedAnnouncement : a
    );
    setAnnouncements(updated);
    saveAnnouncements(updated);
    syncAllDataToServer({ announcements: updated }).catch(() => {});
    syncWithCloudflare().catch(() => {});
    showToast('Pengumuman berhasil diperbarui & disinkronkan!');
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      const updated = announcements.filter((a) => a.id !== announcementId);
      setAnnouncements(updated);
      saveAnnouncements(updated);
      syncAllDataToServer({ announcements: updated }).catch(() => {});
      syncWithCloudflare().catch(() => {});
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
            onUpdateEkskulLogo={handleUpdateEkskulLogo}
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
            siteSettings={siteSettings}
            isAdmin={isAdmin}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            onUpdateMemberRole={handleUpdateMemberRole}
            onDeleteMember={handleDeleteMember}
            onDeleteMultipleMembers={handleDeleteMultipleMembers}
            onDeleteMembersByEkskul={handleDeleteMembersByEkskul}
            onDeleteAllMembers={handleDeleteAllMembers}
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
            onSaveAttendance={handleSaveAttendance}
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
          onDeleteMultipleMembers={handleDeleteMultipleMembers}
          onDeleteMembersByEkskul={handleDeleteMembersByEkskul}
          onDeleteAllMembers={handleDeleteAllMembers}
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
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200/80 mt-14 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* School & Portal Brand */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                {siteSettings.logoUrl ? (
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm p-1 flex items-center justify-center shrink-0">
                    <img
                      src={siteSettings.logoUrl}
                      alt={siteSettings.portalTitle}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center font-black text-white text-base shadow-sm ring-1 ring-slate-700/50">
                    {siteSettings.portalTitle.charAt(0) || 'E'}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 tracking-tight font-display">
                    {siteSettings.portalTitle}
                  </h4>
                  <p className="text-xs text-indigo-600 font-semibold">
                    {siteSettings.portalTagline}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                <strong>{siteSettings.schoolName}</strong> — {siteSettings.schoolTagline || 'Pusat Kreativitas, Karakter, dan Minat Bakat Siswa.'}
              </p>

              {siteSettings.footerNote && (
                <div className="inline-block px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 font-medium">
                  {siteSettings.footerNote}
                </div>
              )}
            </div>

            {/* School Contact & Address Info */}
            <div className="md:col-span-4 space-y-2.5">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Kontak & Alamat Sekolah
              </h5>

              <ul className="space-y-2 text-xs text-slate-600">
                {siteSettings.schoolAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{siteSettings.schoolAddress}</span>
                  </li>
                )}

                {siteSettings.contactPhone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <a
                      href={`tel:${siteSettings.contactPhone.replace(/[^0-9+]/g, '')}`}
                      className="hover:text-indigo-600 font-semibold transition-colors"
                    >
                      {siteSettings.contactPhone}
                    </a>
                  </li>
                )}

                {siteSettings.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <a
                      href={`mailto:${siteSettings.contactEmail}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {siteSettings.contactEmail}
                    </a>
                  </li>
                )}
              </ul>

              {/* Social links if configured */}
              <div className="flex items-center gap-2 pt-1">
                {siteSettings.instagramUrl && (
                  <a
                    href={siteSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Instagram Resmi"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                )}

                {siteSettings.youtubeUrl && (
                  <a
                    href={siteSettings.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="YouTube Resmi"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="md:col-span-3 space-y-2.5">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Menu Cepat
              </h5>
              <div className="flex flex-col space-y-2 text-xs font-medium text-slate-600">
                <button
                  onClick={() => {
                    setActiveTab('ekskul');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Katalog Cabang Ekskul
                </button>
                <button
                  onClick={() => {
                    setActiveTab('galeri');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Galeri Dokumentasi Foto
                </button>
                <button
                  onClick={() => {
                    setActiveTab('pendaftaran');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Form Pendaftaran Online</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('anggota');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Data Anggota & Cetak KTA
                </button>

                <div className="pt-2">
                  {isAdmin ? (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 shadow-sm"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Buka Panel Admin</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAdminLogin(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Login Admin Pengelola</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} {siteSettings.portalTitle}. {siteSettings.schoolName}. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Tahun Ajaran {siteSettings.academicYear} • Terhubung Database Cloudflare
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
