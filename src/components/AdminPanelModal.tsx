import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Settings,
  School,
  Trophy,
  Users,
  ImageIcon,
  Bell,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Save,
  Check,
  ShieldAlert,
  Sliders,
  Eye,
  LogOut,
  FolderSync,
  GraduationCap,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Cloud,
  FileText,
  Database,
  Server,
  HardDrive,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import {
  SiteSettings,
  Extracurricular,
  Member,
  ActivityPhoto,
  SchoolAnnouncement,
  AdminUser,
} from '../types';
import {
  getAdminCredentials,
  updateAdminPassword,
  exportAllDataJSON,
  importAllDataJSON,
  resetAllToDefault,
  syncWithCloudflare,
  exportCloudflareD1SQL,
  exportCloudflareKVJSON,
} from '../utils/storage';
import { ExcelUploadModal } from './ExcelUploadModal';
import { EditEkskulModal } from './EditEkskulModal';
import { AddPhotoModal } from './AddPhotoModal';
import { AddEkskulModal } from './AddEkskulModal';
import { DEFAULT_CLASS_OPTIONS } from './RegistrationView';

interface AdminPanelModalProps {
  isOpen?: boolean;
  onClose: () => void;
  adminUser: AdminUser | null;
  siteSettings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  ekskuls: Extracurricular[];
  onAddEkskul?: () => void;
  onAddEkskulDirect?: (ekskul: Extracurricular) => void;
  onEditEkskul: (ekskul: Extracurricular) => void;
  onSaveEditedEkskul?: (ekskul: Extracurricular) => void;
  onDeleteEkskul: (id: string) => void;
  onToggleEkskulStatus: (id: string) => void;
  members: Member[];
  onUpdateMemberStatus: (memberId: string, status: any) => void;
  onDeleteMember: (memberId: string) => void;
  onDeleteMultipleMembers?: (memberIds: string[]) => void;
  onDeleteMembersByEkskul?: (ekskulId: string) => void;
  onDeleteAllMembers?: () => void;
  onImportMembers?: (newMembers: Member[]) => void;
  photos: ActivityPhoto[];
  onOpenAddPhoto?: () => void;
  onDeletePhoto: (photoId: string) => void;
  announcements: SchoolAnnouncement[];
  onAddAnnouncement?: (announcement: SchoolAnnouncement) => void;
  onUpdateAnnouncement?: (announcement: SchoolAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onLogout: () => void;
  onReloadAllData: () => void;
  onAddPhoto?: (newPhoto: ActivityPhoto) => void;
  onUpdateAnnouncements?: (announcements: SchoolAnnouncement[]) => void;
  onOpenPdfReport?: (ekskulId?: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen = true,
  onClose,
  adminUser,
  siteSettings,
  onUpdateSettings,
  ekskuls,
  onAddEkskul,
  onAddEkskulDirect,
  onEditEkskul,
  onSaveEditedEkskul,
  onDeleteEkskul,
  onToggleEkskulStatus,
  members,
  onUpdateMemberStatus,
  onDeleteMember,
  onDeleteMultipleMembers,
  onDeleteMembersByEkskul,
  onDeleteAllMembers,
  onImportMembers,
  photos,
  onOpenAddPhoto,
  onDeletePhoto,
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onLogout,
  onReloadAllData,
  onAddPhoto,
  onUpdateAnnouncements,
  onOpenPdfReport,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'ekskuls' | 'classes' | 'members' | 'announcements' | 'photos' | 'cloudflare' | 'security'>('settings');
  
  // Settings Form state
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);
  const [settingsSubSection, setSettingsSubSection] = useState<'all' | 'identity' | 'hero' | 'metrics' | 'ticker' | 'greeting' | 'benefits' | 'contacts' | 'registration' | 'kta'>('all');

  const schoolLogoInputRef = useRef<HTMLInputElement>(null);
  const ktaStampInputRef = useRef<HTMLInputElement>(null);
  const authorAvatarInputRef = useRef<HTMLInputElement>(null);

  const wasOpenRef = useRef(false);
  const [isDraggingAuthorAvatar, setIsDraggingAuthorAvatar] = useState(false);
  const [showAuthorAvatarUrlInput, setShowAuthorAvatarUrlInput] = useState(false);

  // Initialize localSettings only when modal first opens, never during active typing
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setLocalSettings(siteSettings);
      setClassList(
        siteSettings.availableClasses && siteSettings.availableClasses.length > 0
          ? siteSettings.availableClasses
          : DEFAULT_CLASS_OPTIONS
      );
    }
    wasOpenRef.current = Boolean(isOpen);
  }, [isOpen]);

  const handleSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLocalSettings((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleKtaStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLocalSettings((prev) => ({ ...prev, ktaStampImageUrl: base64 }));
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const processAuthorAvatarFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLocalSettings((prev) => ({ ...prev, greetingAuthorAvatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleAuthorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAuthorAvatarFile(file);
    }
    if (e.target) e.target.value = '';
  };

  // Cloudflare Sync state
  const [cfSyncing, setCfSyncing] = useState(false);
  const [cfSyncResult, setCfSyncResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [cfConfig, setCfConfig] = useState(
    localSettings.cloudflareConfig || {
      userEmail: 'Lanjarputra96@gmail.com',
      databaseName: 'ekskul_school_db',
      databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
      workerUrl: 'https://ekskul-api.lanjarputra96.workers.dev',
      apiToken: '',
      accountId: '',
      autoSync: true,
      lastSyncTime: '',
      syncStatus: 'idle' as const,
    }
  );

  // Excel bulk upload & delete dialog state
  const [showExcelUploadModal, setShowExcelUploadModal] = useState(false);
  const [showAddPhotoModalInternal, setShowAddPhotoModalInternal] = useState(false);
  const [showAddEkskulModalInternal, setShowAddEkskulModalInternal] = useState(false);
  const [ekskulToDelete, setEkskulToDelete] = useState<Extracurricular | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberFilterEkskul, setMemberFilterEkskul] = useState<string>('all');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>('all');
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [showDeleteByEkskulModal, setShowDeleteByEkskulModal] = useState<boolean>(false);
  const [selectedEkskulForBulkDelete, setSelectedEkskulForBulkDelete] = useState<string>('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [editingEkskulDirectly, setEditingEkskulDirectly] = useState<Extracurricular | null>(null);

  // Class Management state
  const [classList, setClassList] = useState<string[]>(
    localSettings.availableClasses && localSettings.availableClasses.length > 0
      ? localSettings.availableClasses
      : DEFAULT_CLASS_OPTIONS
  );
  const [newClassInput, setNewClassInput] = useState('');
  const [bulkClassText, setBulkClassText] = useState(classList.join('\n'));
  const [isBulkClassMode, setIsBulkClassMode] = useState(false);
  const [classSavedMessage, setClassSavedMessage] = useState(false);

  // Security / Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState(adminUser?.name || 'Administrator EKSIS');
  const [adminEmail, setAdminEmail] = useState(
    adminUser?.email || getAdminCredentials().email || 'Lanjarputra96@gmail.com'
  );
  const [securityMessage, setSecurityMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Announcements form state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SchoolAnnouncement | null>(null);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    badge: 'PENGUMUMAN',
    content: '',
    isImportant: true,
  });

  // Ekskul search in admin
  const [ekskulSearch, setEkskulSearch] = useState('');

  if (isOpen === false) return null;

  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCreds = getAdminCredentials();
    const targetPassword = newPassword ? newPassword.trim() : currentCreds.password;

    if (newPassword && newPassword.length < 6) {
      setSecurityMessage({ text: 'Kata sandi minimal 6 karakter.', type: 'error' });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setSecurityMessage({ text: 'Konfirmasi kata sandi tidak cocok.', type: 'error' });
      return;
    }

    setIsSavingSecurity(true);
    setSecurityMessage({ text: 'Menyimpan & menyinkronkan kata sandi baru ke database Cloudflare...', type: 'success' });
    
    const success = await updateAdminPassword(targetPassword, adminDisplayName, adminEmail);
    setIsSavingSecurity(false);
    
    if (success) {
      setSecurityMessage({
        text: 'Kata sandi baru berhasil disimpan ke Database Cloudflare D1! Sandi ini sekarang aktif dan dapat langsung digunakan di semua perangkat (laptop & HP).',
        type: 'success',
      });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecurityMessage(null), 6000);
    } else {
      setSecurityMessage({ text: 'Gagal memperbarui kata sandi.', type: 'error' });
    }
  };

  const handleOpenAnnouncementEditor = (item?: SchoolAnnouncement) => {
    if (item) {
      setEditingAnnouncement(item);
      setAnnouncementFormData({
        title: item.title,
        badge: item.badge,
        content: item.content,
        isImportant: Boolean(item.isImportant),
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementFormData({
        title: '',
        badge: 'INFO PENTING',
        content: '',
        isImportant: true,
      });
    }
    setAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementFormData.title || !announcementFormData.content) return;

    if (editingAnnouncement) {
      const updated = {
        ...editingAnnouncement,
        title: announcementFormData.title,
        badge: announcementFormData.badge,
        content: announcementFormData.content,
        isImportant: announcementFormData.isImportant,
      };
      if (onUpdateAnnouncement) {
        onUpdateAnnouncement(updated);
      } else if (onUpdateAnnouncements) {
        onUpdateAnnouncements(announcements.map((a) => (a.id === updated.id ? updated : a)));
      }
    } else {
      const newAnn: SchoolAnnouncement = {
        id: `ann-${Date.now()}`,
        title: announcementFormData.title,
        badge: announcementFormData.badge,
        content: announcementFormData.content,
        isImportant: announcementFormData.isImportant,
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };
      if (onAddAnnouncement) {
        onAddAnnouncement(newAnn);
      } else if (onUpdateAnnouncements) {
        onUpdateAnnouncements([newAnn, ...announcements]);
      }
    }
    setAnnouncementModalOpen(false);
  };

  const handleSyncCloudflare = async () => {
    setCfSyncing(true);
    setCfSyncResult(null);
    try {
      const res = await syncWithCloudflare(cfConfig);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCfSyncResult({
        success: res.success,
        message: res.message,
        timestamp: timeStr,
      });
      if (res.success) {
        const updatedConfig = {
          ...cfConfig,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced' as const,
        };
        setCfConfig(updatedConfig);
        onUpdateSettings({
          ...localSettings,
          cloudflareConfig: updatedConfig,
        });
      }
    } catch (err: any) {
      setCfSyncResult({
        success: false,
        message: err?.message || 'Gagal menyambungkan ke Cloudflare',
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setCfSyncing(false);
    }
  };

  const handleSaveCfConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...localSettings,
      cloudflareConfig: cfConfig,
    };
    setLocalSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
    setCfSyncResult({
      success: true,
      message: 'Konfigurasi Cloudflare akun Lanjarputra96@gmail.com berhasil disimpan!',
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllDataJSON(content);
        if (success) {
          onReloadAllData();
          alert('Data berhasil diimpor dan diperbarui!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetFactory = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi default awal pabrik? Data yang dibuat akan digantikan.')) {
      resetAllToDefault();
      onReloadAllData();
      alert('Data sistem telah direset ke setelan awal.');
    }
  };

  const pendingMembers = members.filter((m) => m && m.status === 'pending');
  const filteredEkskuls = ekskuls
    .filter((e) => Boolean(e && typeof e === 'object' && e.id && e.name))
    .filter((e) => {
      const q = ekskulSearch.toLowerCase().trim();
      if (!q) return true;
      const nameMatch = typeof e.name === 'string' && e.name.toLowerCase().includes(q);
      const shortMatch = typeof e.shortName === 'string' && e.shortName.toLowerCase().includes(q);
      return nameMatch || shortMatch;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 my-4 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Sliders className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Mode Admin Aktif ({adminUser?.name || 'Administrator'})</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Pusat Kontrol & Manajemen Konten Portal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Keluar dari mode admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Tabs & Content Grid */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200/80 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4 text-indigo-400" />
              <span>Info Sekolah & Tampilan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ekskuls')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'ekskuls'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Kelola Cabang Ekskul</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'ekskuls' ? 'bg-white/20' : 'bg-slate-200'}`}>
                {ekskuls.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>Kelola Pilihan Kelas</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'classes' ? 'bg-white/20' : 'bg-slate-200'}`}>
                {classList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Kelola Anggota</span>
              </div>
              {pendingMembers.length > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                  {pendingMembers.length} Baru
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-rose-400" />
                <span>Pengumuman & Berita</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'announcements' ? 'bg-white/20' : 'bg-slate-200'}`}>
                {announcements.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Galeri Foto Kegiatan</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'photos' ? 'bg-white/20' : 'bg-slate-200'}`}>
                {photos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cloudflare')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'cloudflare'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>Database Cloudflare</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'cloudflare' ? 'bg-sky-500/30 text-sky-200' : 'bg-sky-100 text-sky-700 font-bold'}`}>
                D1/KV
              </span>
            </button>

            <div className="my-2 border-t border-slate-200 hidden md:block" />

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Backup, Restore & Sandi</span>
            </button>
          </div>

          {/* Main Tab Panel Body */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-[calc(94vh-80px)]">
            
            {/* TAB 1: SITE SETTINGS & APPEARANCE (CMS) */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSiteSettings} className="space-y-6 animate-fadeIn pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Pusat Kustomisasi Landing Page & Konten Sekolah
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Semua elemen teks, banner, sambutan, metrik, manfaat, dan kontak di landing page dapat diubah langsung di sini.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Semua Perubahan</span>
                  </button>
                </div>

                {settingsSavedMessage && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Perubahan konten landing page & pengaturan portal berhasil disimpan dan langsung diterapkan!</span>
                  </div>
                )}

                {/* Sub-section Category Navigation Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
                  {[
                    { id: 'all', label: 'Semua Bagian' },
                    { id: 'identity', label: '1. Identitas & Header' },
                    { id: 'hero', label: '2. Banner Utama (Hero)' },
                    { id: 'metrics', label: '3. Bar Metrik' },
                    { id: 'ticker', label: '4. Ticker Berita' },
                    { id: 'greeting', label: '5. Sambutan Pimpinan' },
                    { id: 'benefits', label: '6. Manfaat Ekskul' },
                    { id: 'contacts', label: '7. Kontak & Footer' },
                    { id: 'registration', label: '8. Status Registrasi' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSettingsSubSection(sub.id as any)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                        settingsSubSection === sub.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* 1. IDENTITAS SEKOLAH & BRANDING */}
                {(settingsSubSection === 'all' || settingsSubSection === 'identity') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <School className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        1. Identitas Sekolah & Branding Portal
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nama Sekolah / Lembaga
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.schoolName}
                          onChange={(e) => setLocalSettings({ ...localSettings, schoolName: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Tahun Ajaran Aktif
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="TA 2026/2027"
                          value={localSettings.academicYear}
                          onChange={(e) => setLocalSettings({ ...localSettings, academicYear: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nama Singkat Portal (Brand Logo)
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.portalTitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, portalTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Tagline Sub-portal
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.portalTagline}
                          onChange={(e) => setLocalSettings({ ...localSettings, portalTagline: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Slogan / Keterangan Resmi di Topbar
                        </label>
                        <input
                          type="text"
                          value={localSettings.schoolTagline}
                          onChange={(e) => setLocalSettings({ ...localSettings, schoolTagline: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. HERO BANNER UTAMA */}
                {(settingsSubSection === 'all' || settingsSubSection === 'hero') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/70 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                          2. Konten & Desain Banner Utama (Hero Section)
                        </h4>
                      </div>

                      {/* Theme selection */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Tema Warna:</span>
                        {(['indigo', 'emerald', 'blue', 'purple', 'slate', 'amber'] as const).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setLocalSettings({ ...localSettings, heroTheme: color })}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                              localSettings.heroTheme === color ? 'scale-125 border-slate-900 shadow-xs' : 'border-white opacity-80 hover:opacity-100'
                            }`}
                            style={{
                              backgroundColor:
                                color === 'indigo'
                                  ? '#4f46e5'
                                  : color === 'emerald'
                                  ? '#059669'
                                  : color === 'blue'
                                  ? '#2563eb'
                                  : color === 'purple'
                                  ? '#9333ea'
                                  : color === 'slate'
                                  ? '#1e293b'
                                  : '#d97706',
                            }}
                            title={`Pilih tema ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Pill Badge Banner
                        </label>
                        <input
                          type="text"
                          value={localSettings.heroBadge}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroBadge: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-medium"
                          placeholder="Contoh: Tahun Pelajaran 2026/2027 • Pendaftaran Dibuka"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Headline / Judul Utama Banner
                        </label>
                        <input
                          type="text"
                          value={localSettings.heroTitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-black"
                          placeholder="Contoh: Wadah Minat, Bakat, & Prestasi Siswa Terdepan"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Deskripsi / Sub-judul Banner
                        </label>
                        <textarea
                          rows={2}
                          value={localSettings.heroSubtitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Teks Tombol CTA Utama (Daftar)
                          </label>
                          <input
                            type="text"
                            value={localSettings.heroPrimaryBtnText || 'Daftar Ekstrakurikuler Sekarang'}
                            onChange={(e) => setLocalSettings({ ...localSettings, heroPrimaryBtnText: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Teks Tombol CTA Kedua (Tambah Ekskul)
                          </label>
                          <input
                            type="text"
                            value={localSettings.heroSecondaryBtnText || 'Tambah Cabang Ekskul'}
                            onChange={(e) => setLocalSettings({ ...localSettings, heroSecondaryBtnText: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BAR METRIK & STATISTIK */}
                {(settingsSubSection === 'all' || settingsSubSection === 'metrics') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          3. Bar Statistik Cepat di Banner
                        </h4>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.showMetricsBar !== false}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, showMetricsBar: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-bold text-slate-700">Tampilkan Bar</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Label Stat 1 (Otomatis: {ekskuls.length})
                        </label>
                        <input
                          type="text"
                          value={localSettings.stat1Label || 'Cabang Ekskul Aktif'}
                          onChange={(e) => setLocalSettings({ ...localSettings, stat1Label: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Label Stat 2 (Otomatis: {members.filter(m => m.status === 'active').length})
                        </label>
                        <input
                          type="text"
                          value={localSettings.stat2Label || 'Anggota Siswa Aktif'}
                          onChange={(e) => setLocalSettings({ ...localSettings, stat2Label: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Label Stat 3 (Otomatis: {photos.length})
                        </label>
                        <input
                          type="text"
                          value={localSettings.stat3Label || 'Foto Dokumentasi'}
                          onChange={(e) => setLocalSettings({ ...localSettings, stat3Label: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Nilai Stat 4
                            </label>
                            <input
                              type="text"
                              value={localSettings.stat4Value || '100%'}
                              onChange={(e) => setLocalSettings({ ...localSettings, stat4Value: e.target.value })}
                              className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1 truncate">
                              Label Stat 4
                            </label>
                            <input
                              type="text"
                              value={localSettings.stat4Label || 'Kurikulum Merdeka'}
                              onChange={(e) => setLocalSettings({ ...localSettings, stat4Label: e.target.value })}
                              className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. RUNNING ANNOUNCEMENT TICKER */}
                {(settingsSubSection === 'all' || settingsSubSection === 'ticker') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-500" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          4. Pita Berita & Pengumuman Berjalan (Ticker Bar)
                        </h4>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.showRunningTicker !== false}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, showRunningTicker: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-bold text-slate-700">Aktifkan Ticker</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Isi Teks Pengumuman Berjalan
                      </label>
                      <textarea
                        rows={2}
                        value={localSettings.runningTickerText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, runningTickerText: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                        placeholder="Masukkan teks pengumuman penting yang akan berjalan di bawah bilah navigasi..."
                      />
                    </div>
                  </div>
                )}

                {/* 5. SAMBUTAN KEPALA SEKOLAH / PEMBINA */}
                {(settingsSubSection === 'all' || settingsSubSection === 'greeting') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          5. Bagian Sambutan Kepala Sekolah / Pembina di Landing Page
                        </h4>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.showGreetingSection !== false}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, showGreetingSection: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-bold text-slate-700">Tampilkan Sambutan</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Badge Sambutan
                        </label>
                        <input
                          type="text"
                          value={localSettings.greetingBadge || 'SAMBUTAN RESMI'}
                          onChange={(e) => setLocalSettings({ ...localSettings, greetingBadge: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Judul Sambutan
                        </label>
                        <input
                          type="text"
                          value={localSettings.greetingTitle || 'Membangun Generasi Emas yang Berkarakter & Berprestasi'}
                          onChange={(e) => setLocalSettings({ ...localSettings, greetingTitle: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Isi Pesan / Sambutan
                        </label>
                        <textarea
                          rows={3}
                          value={localSettings.greetingMessage || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, greetingMessage: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nama Pimpinan / Kepala Sekolah
                        </label>
                        <input
                          type="text"
                          value={localSettings.greetingAuthorName || 'Drs. H. Bambang Sudirman, M.Pd.'}
                          onChange={(e) => setLocalSettings({ ...localSettings, greetingAuthorName: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Jabatan Resmi
                        </label>
                        <input
                          type="text"
                          value={localSettings.greetingAuthorRole || 'Kepala SMAN 1 Harapan Bangsa'}
                          onChange={(e) => setLocalSettings({ ...localSettings, greetingAuthorRole: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                        />
                      </div>

                      {/* Upload Foto Kepala Sekolah langsung dari komputer */}
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Foto Kepala Sekolah / Pimpinan</span>
                          <span className="text-[10px] text-slate-400 font-normal">Format JPG, PNG, WEBP (maks. 5MB)</span>
                        </label>

                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={authorAvatarInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleAuthorAvatarUpload}
                          className="hidden"
                        />

                        {localSettings.greetingAuthorAvatar ? (
                          /* Current Photo Preview Card */
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                            <div className="flex items-center gap-3.5">
                              <div className="relative shrink-0">
                                <img
                                  src={localSettings.greetingAuthorAvatar}
                                  alt={localSettings.greetingAuthorName || 'Kepala Sekolah'}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-200 shadow-xs ring-2 ring-indigo-50"
                                />
                                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
                                  <CheckCircle2 className="w-3 h-3" />
                                </div>
                              </div>
                              <div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold mb-1">
                                  <span>Foto Terpasang</span>
                                </div>
                                <h6 className="text-xs font-bold text-slate-800">
                                  {localSettings.greetingAuthorName || 'Foto Kepala Sekolah'}
                                </h6>
                                <p className="text-[11px] text-slate-500">
                                  Ditampilkan di kartu sambutan resmi halaman depan
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => authorAvatarInputRef.current?.click()}
                                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Ganti dari Komputer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setLocalSettings((prev) => ({ ...prev, greetingAuthorAvatar: '' }))}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200"
                                title="Hapus Foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Dropzone & Browse Button when empty */
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingAuthorAvatar(true);
                            }}
                            onDragLeave={() => setIsDraggingAuthorAvatar(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingAuthorAvatar(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) processAuthorAvatarFile(file);
                            }}
                            onClick={() => authorAvatarInputRef.current?.click()}
                            className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                              isDraggingAuthorAvatar
                                ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
                                : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-white'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Klik untuk Upload Foto Kepala Sekolah dari Komputer
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                atau tarik dan lepas (drag & drop) file foto ke area ini
                              </p>
                            </div>
                            <span className="mt-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs">
                              Pilih File Foto (.jpg / .png)
                            </span>
                          </div>
                        )}

                        {/* Optional URL toggle for external link users */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAuthorAvatarUrlInput((prev) => !prev)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                          >
                            {showAuthorAvatarUrlInput ? 'Tutup input URL web' : 'Atau gunakan URL tautan gambar eksternal'}
                          </button>
                          {showAuthorAvatarUrlInput && (
                            <div className="mt-2">
                              <input
                                type="url"
                                value={localSettings.greetingAuthorAvatar || ''}
                                onChange={(e) => setLocalSettings({ ...localSettings, greetingAuthorAvatar: e.target.value })}
                                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                                placeholder="https://..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. MANFAAT DAN KEUNGGULAN EKSKUL */}
                {(settingsSubSection === 'all' || settingsSubSection === 'benefits') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          6. Kartu Keunggulan & Manfaat Mengikuti Ekskul (3 Poin)
                        </h4>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.showBenefitsSection !== false}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, showBenefitsSection: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-bold text-slate-700">Tampilkan Manfaat</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Judul Bagian Manfaat
                        </label>
                        <input
                          type="text"
                          value={localSettings.benefitsHeading || 'Kenapa Harus Bergabung di Ekstrakurikuler?'}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefitsHeading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Sub-judul Bagian Manfaat
                        </label>
                        <input
                          type="text"
                          value={localSettings.benefitsSubheading || 'Tiga nilai utama yang akan kamu dapatkan selama aktif di sekolah.'}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefitsSubheading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Benefit 1, 2, 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-700 block">Poin 1</span>
                        <input
                          type="text"
                          placeholder="Judul Poin 1"
                          value={localSettings.benefit1Title || 'Sertifikat Resmi & Portofolio Prestasi'}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefit1Title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-bold"
                        />
                        <textarea
                          rows={2}
                          placeholder="Deskripsi Poin 1"
                          value={localSettings.benefit1Desc || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefit1Desc: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-700 block">Poin 2</span>
                        <input
                          type="text"
                          placeholder="Judul Poin 2"
                          value={localSettings.benefit2Title || 'Bimbingan Pembina & Pelatih Bersertifikat'}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefit2Title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-bold"
                        />
                        <textarea
                          rows={2}
                          placeholder="Deskripsi Poin 2"
                          value={localSettings.benefit2Desc || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefit2Desc: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-purple-700 block">Poin 3</span>
                        <input
                          type="text"
                          placeholder="Judul Poin 3"
                          value={localSettings.benefit3Title || 'Pengembangan Karakter & Soft Skills'}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefit3Title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-bold"
                        />
                        <textarea
                          rows={2}
                          placeholder="Deskripsi Poin 3"
                          value={localSettings.benefit3Desc || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, benefit3Desc: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. KONTAK, ALAMAT & FOOTER */}
                {(settingsSubSection === 'all' || settingsSubSection === 'contacts') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <School className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        7. Kontak Resmi, Alamat Sekolah & Footer
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          No. Telepon / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={localSettings.contactPhone}
                          onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Email Resmi Ekstrakurikuler
                        </label>
                        <input
                          type="email"
                          value={localSettings.contactEmail}
                          onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Alamat Lengkap Sekolah
                        </label>
                        <input
                          type="text"
                          value={localSettings.schoolAddress}
                          onChange={(e) => setLocalSettings({ ...localSettings, schoolAddress: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Tautan Instagram Resmi
                        </label>
                        <input
                          type="url"
                          value={localSettings.instagramUrl}
                          onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Tautan YouTube Resmi
                        </label>
                        <input
                          type="url"
                          value={localSettings.youtubeUrl}
                          onChange={(e) => setLocalSettings({ ...localSettings, youtubeUrl: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Catatan Kaki / Lisensi di Footer
                        </label>
                        <input
                          type="text"
                          value={localSettings.footerNote}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerNote: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. STATUS PENDAFTARAN ONLINE */}
                {(settingsSubSection === 'all' || settingsSubSection === 'registration') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          8. Atur Akses Formulir Pendaftaran Siswa Online
                        </strong>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Buka atau kunci pendaftaran siswa baru untuk seluruh cabang secara terpusat.
                        </span>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.allowOnlineRegistration}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, allowOnlineRegistration: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {!localSettings.allowOnlineRegistration && (
                      <div className="pt-2 animate-fadeIn">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Pesan Saat Pendaftaran Ditutup
                        </label>
                        <input
                          type="text"
                          value={localSettings.registrationClosedNotice || 'Pendaftaran online untuk periode ini sedang ditutup sementara oleh pengelola.'}
                          onChange={(e) => setLocalSettings({ ...localSettings, registrationClosedNotice: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-medium"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Save bar */}
                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Simpan Pengaturan & Perbarui Landing Page</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MANAJEMEN EKSKUL */}
            {activeTab === 'ekskuls' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Kelola Daftar Ekstrakurikuler ({ekskuls.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Ubah data cabang, atur kuota, ganti pembina, atau buka/tutup pendaftaran.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onOpenPdfReport && (
                      <button
                        type="button"
                        onClick={() => onOpenPdfReport('all')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Download Dokumen PDF Seluruh Cabang Ekskul"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Download PDF (Semua Cabang)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowAddEkskulModalInternal(true);
                        if (onAddEkskul) {
                          onAddEkskul();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Ekskul Baru</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari ekskul..."
                    value={ekskulSearch}
                    onChange={(e) => setEkskulSearch(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredEkskuls.map((item) => {
                    const itemMembers = members.filter((m) => m.ekskulId === item.id);
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.logo || item.coverImage}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                {item.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                                {item.shortName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.tagline} • Pembina: {item.coach?.name || '-'}
                            </p>
                            <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                              <span>Anggota: <strong>{itemMembers.length} / {item.quota}</strong></span>
                              <span>•</span>
                              <span>Ruang: {item.meetingRoom}</span>
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60 text-[10px]">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                <span>{item.achievements?.length || 0} Prestasi</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200/60 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>{item.requirements?.length || 0} Syarat</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Quick Toggle Status */}
                          <button
                            onClick={() => onToggleEkskulStatus(item.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border ${
                              item.registrationStatus === 'open'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                            title="Klik untuk ubah status pendaftaran"
                          >
                            {item.registrationStatus === 'open' ? '🟢 Buka' : '🔴 Tutup'}
                          </button>

                          {/* PDF Export for this branch */}
                          {onOpenPdfReport && (
                            <button
                              onClick={() => onOpenPdfReport(item.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors cursor-pointer"
                              title={`Download PDF Laporan Khusus ${item.shortName}`}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingEkskulDirectly(item);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Data Ekskul, Prestasi & Syarat"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEkskulToDelete(item)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors cursor-pointer"
                            title="Hapus Cabang Ekskul"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: KELOLA PILIHAN KELAS */}
            {activeTab === 'classes' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-sky-600" />
                      <span>Kelola Pilihan Kelas Siswa ({classList.length} Kelas)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Atur daftar kelas yang akan muncul saat siswa mengisi formulir pendaftaran online.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkClassMode(!isBulkClassMode);
                        setBulkClassText(classList.join('\n'));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {isBulkClassMode ? 'Mode Visual (Pill)' : 'Mode Teks Massal'}
                    </button>
                  </div>
                </div>

                {classSavedMessage && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Daftar pilihan kelas berhasil disimpan dan diterapkan pada formulir pendaftaran!</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Pilih Template Cepat Format Kelas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const preset = [
                          'X.1', 'X.2', 'X.3', 'X.4', 'X.5', 'X.6', 'X.7', 'X.8', 'X.9', 'X.10', 'X.11', 'X.12',
                          'XI.1', 'XI.2', 'XI.3', 'XI.4', 'XI.5', 'XI.6', 'XI.7', 'XI.8', 'XI.9', 'XI.10', 'XI.11', 'XI.12',
                          'XII.1', 'XII.2', 'XII.3', 'XII.4', 'XII.5', 'XII.6', 'XII.7', 'XII.8', 'XII.9', 'XII.10',
                        ];
                        setClassList(preset);
                        setBulkClassText(preset.join('\n'));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
                    >
                      Kurikulum Merdeka (X.1 s/d XII.10)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const preset = [
                          'X MIPA 1', 'X MIPA 2', 'X MIPA 3', 'X IPS 1', 'X IPS 2', 'X IPS 3', 'X Bahasa',
                          'XI MIPA 1', 'XI MIPA 2', 'XI MIPA 3', 'XI IPS 1', 'XI IPS 2', 'XI IPS 3', 'XI Bahasa',
                          'XII MIPA 1', 'XII MIPA 2', 'XII IPS 1', 'XII IPS 2',
                        ];
                        setClassList(preset);
                        setBulkClassText(preset.join('\n'));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
                    >
                      SMA K-13 (MIPA / IPS / Bahasa)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const preset = [
                          'X RPL 1', 'X RPL 2', 'X TKJ 1', 'X TKJ 2', 'X DKV 1', 'X DKV 2', 'X AKL 1', 'X AKL 2',
                          'XI RPL 1', 'XI RPL 2', 'XI TKJ 1', 'XI TKJ 2', 'XI DKV 1', 'XI DKV 2', 'XI AKL 1', 'XI AKL 2',
                          'XII RPL 1', 'XII RPL 2', 'XII TKJ 1', 'XII TKJ 2', 'XII DKV 1', 'XII DKV 2', 'XII AKL 1', 'XII AKL 2',
                        ];
                        setClassList(preset);
                        setBulkClassText(preset.join('\n'));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
                    >
                      SMK Kejuruan (RPL, TKJ, DKV, AKL)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const preset = [
                          'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F', 'VII G', 'VII H',
                          'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII F', 'VIII G', 'VIII H',
                          'IX A', 'IX B', 'IX C', 'IX D', 'IX E', 'IX F', 'IX G', 'IX H',
                        ];
                        setClassList(preset);
                        setBulkClassText(preset.join('\n'));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
                    >
                      SMP (VII, VIII, IX A-H)
                    </button>
                  </div>
                </div>

                {isBulkClassMode ? (
                  /* Bulk Textarea Edit */
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">
                      Edit Daftar Kelas (Satu baris untuk satu nama kelas):
                    </label>
                    <textarea
                      rows={10}
                      value={bulkClassText}
                      onChange={(e) => {
                        setBulkClassText(e.target.value);
                        const lines = e.target.value
                          .split('\n')
                          .map((l) => l.trim())
                          .filter(Boolean);
                        setClassList(lines);
                      }}
                      placeholder="Tuliskan nama kelas, satu per baris..."
                      className="w-full p-4 text-xs font-mono rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                ) : (
                  /* Visual Add & Pills List */
                  <div className="space-y-4">
                    {/* Add Single Class */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik nama kelas baru (Contoh: X MIPA 4, X-E, XI RPL 3)..."
                        value={newClassInput}
                        onChange={(e) => setNewClassInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newClassInput.trim() && !classList.includes(newClassInput.trim())) {
                              const updated = [...classList, newClassInput.trim()];
                              setClassList(updated);
                              setBulkClassText(updated.join('\n'));
                              setNewClassInput('');
                            }
                          }
                        }}
                        className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newClassInput.trim() && !classList.includes(newClassInput.trim())) {
                            const updated = [...classList, newClassInput.trim()];
                            setClassList(updated);
                            setBulkClassText(updated.join('\n'));
                            setNewClassInput('');
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kelas</span>
                      </button>
                    </div>

                    {/* Class Badges Grid */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 max-h-[340px] overflow-y-auto space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Daftar Pilihan Aktif ({classList.length} Kelas):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {classList.map((cls, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold border border-slate-200/80 transition-all group"
                          >
                            <span>{cls}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = classList.filter((_, i) => i !== idx);
                                setClassList(updated);
                                setBulkClassText(updated.join('\n'));
                              }}
                              className="w-4 h-4 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                              title={`Hapus kelas ${cls}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Siswa hanya bisa memilih kelas yang terdaftar di atas saat mendaftar.
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedSettings = {
                        ...localSettings,
                        availableClasses: classList,
                      };
                      setLocalSettings(updatedSettings);
                      onUpdateSettings(updatedSettings);
                      setClassSavedMessage(true);
                      setTimeout(() => setClassSavedMessage(false), 3000);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-sky-400" />
                    <span>Simpan & Terapkan Pilihan Kelas</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: KELOLA ANGGOTA & VERIFIKASI */}
            {activeTab === 'members' && (() => {
              const filteredAdminMembers = members.filter((m) => {
                if (!m) return false;
                const matchesEkskul = memberFilterEkskul === 'all' || m.ekskulId === memberFilterEkskul;
                const matchesStatus = memberStatusFilter === 'all' || m.status === memberStatusFilter;
                const matchesQuery =
                  !memberSearchQuery.trim() ||
                  m.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                  m.studentId.includes(memberSearchQuery) ||
                  (m.classGrade && m.classGrade.toLowerCase().includes(memberSearchQuery.toLowerCase())) ||
                  (m.phone && m.phone.includes(memberSearchQuery)) ||
                  (m.ekskulName && m.ekskulName.toLowerCase().includes(memberSearchQuery.toLowerCase()));
                return matchesEkskul && matchesStatus && matchesQuery;
              });

              const allVisibleSelected =
                filteredAdminMembers.length > 0 &&
                filteredAdminMembers.every((m) => selectedMemberIds.includes(m.id));

              const someVisibleSelected =
                filteredAdminMembers.some((m) => selectedMemberIds.includes(m.id)) && !allVisibleSelected;

              const handleToggleSelectAllVisible = () => {
                if (allVisibleSelected) {
                  const visibleIdSet = new Set(filteredAdminMembers.map((m) => m.id));
                  setSelectedMemberIds(selectedMemberIds.filter((id) => !visibleIdSet.has(id)));
                } else {
                  const visibleIds = filteredAdminMembers.map((m) => m.id);
                  const newSet = new Set([...selectedMemberIds, ...visibleIds]);
                  setSelectedMemberIds(Array.from(newSet));
                }
              };

              const handleToggleSelectMember = (id: string) => {
                if (selectedMemberIds.includes(id)) {
                  setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
                } else {
                  setSelectedMemberIds([...selectedMemberIds, id]);
                }
              };

              return (
                <div className="space-y-4 animate-fadeIn">
                  {/* Header & Quick Action Buttons */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">
                          Kelola & Verifikasi Data Anggota ({members.length})
                        </h3>
                        {pendingMembers.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {pendingMembers.length} Menunggu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Hapus anggota via ceklis massal, hapus per cabang ekskul, atau hapus seluruh data siswa.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Upload Excel Button */}
                      <button
                        type="button"
                        onClick={() => setShowExcelUploadModal(true)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Upload Excel (.xlsx)</span>
                      </button>

                      {/* Export Excel Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (members.length === 0) {
                            alert('Belum ada data anggota siswa untuk diekspor.');
                            return;
                          }
                          const data = members.map((m, idx) => ({
                            'No': idx + 1,
                            'Nama Lengkap': m.fullName,
                            'NISN / NIS': m.studentId,
                            'Kelas': m.classGrade,
                            'Jenis Kelamin': m.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                            'No WhatsApp': m.phone,
                            'Email': m.email,
                            'Cabang Ekskul': m.ekskulName,
                            'Jabatan': m.role,
                            'Status': m.status === 'active' ? 'Aktif' : m.status === 'pending' ? 'Pending (Menunggu)' : m.status,
                            'Tanggal Bergabung': m.joinDate || '-',
                            'Motivasi': m.motivation || '-',
                          }));

                          const ws = XLSX.utils.json_to_sheet(data);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, 'Data Anggota Siswa');
                          XLSX.writeFile(wb, `Data_Siswa_Ekskul_${siteSettings.schoolName.replace(/\s+/g, '_')}.xlsx`);
                        }}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ekspor Excel</span>
                      </button>

                      {pendingMembers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            pendingMembers.forEach((m) => onUpdateMemberStatus(m.id, 'active'));
                          }}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui Semua ({pendingMembers.length})</span>
                        </button>
                      )}

                      {/* Special Bulk Delete Buttons: Per Ekskul & Seluruhnya */}
                      <button
                        type="button"
                        onClick={() => {
                          if (ekskuls.length > 0 && !selectedEkskulForBulkDelete) {
                            setSelectedEkskulForBulkDelete(ekskuls[0].id);
                          }
                          setShowDeleteByEkskulModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Hapus seluruh anggota pada salah satu cabang ekskul tertentu"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>Hapus Per Ekskul</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteAllModal(true)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Hapus seluruh database anggota siswa sekolah"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus Seluruhnya</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Controls */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      {/* Search Bar */}
                      <div className="sm:col-span-6 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Cari nama siswa, NISN, kelas, atau ekskul..."
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>

                      {/* Filter by Ekskul */}
                      <div className="sm:col-span-3">
                        <select
                          value={memberFilterEkskul}
                          onChange={(e) => setMemberFilterEkskul(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="all">Semua Cabang Ekskul ({members.length})</option>
                          {ekskuls.map((ek) => {
                            const count = members.filter((m) => m.ekskulId === ek.id).length;
                            return (
                              <option key={ek.id} value={ek.id}>
                                {ek.shortName} ({count} siswa)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Filter by Status */}
                      <div className="sm:col-span-3">
                        <select
                          value={memberStatusFilter}
                          onChange={(e) => setMemberStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="all">Semua Status Pendaftaran</option>
                          <option value="active">Aktif</option>
                          <option value="pending">Menunggu Persetujuan</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                      </div>
                    </div>

                    {/* Checkbox Select All & Selection Status Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someVisibleSelected;
                            }}
                            onChange={handleToggleSelectAllVisible}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>
                            Pilih Semua ({filteredAdminMembers.length} siswa tampil)
                          </span>
                        </label>

                        {selectedMemberIds.length > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {selectedMemberIds.length} Siswa Terpilih
                          </span>
                        )}
                      </div>

                      {selectedMemberIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-fadeIn">
                          <button
                            type="button"
                            onClick={() => setShowBulkDeleteModal(true)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus yang Diceklis ({selectedMemberIds.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMemberIds([])}
                            className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Batal Pilih
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member List */}
                  {filteredAdminMembers.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">Tidak ada data anggota yang cocok</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Coba sesuaikan kata kunci pencarian atau filter cabang ekskul di atas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredAdminMembers.map((member) => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                          <div
                            key={member.id}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-400 shadow-xs'
                                : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Checkbox per member */}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectMember(member.id)}
                                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                                aria-label={`Pilih ${member.fullName}`}
                              />

                              <img
                                src={member.avatar}
                                alt={member.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              />

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-xs sm:text-sm text-slate-900">
                                    {member.fullName}
                                  </strong>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    ({member.studentId} • {member.classGrade})
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    {member.ekskulName}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  WA: {member.phone} • Jabatan: <span className="font-semibold text-slate-700">{member.role}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {member.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateMemberStatus(member.id, 'active')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Terima</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateMemberStatus(member.id, 'rejected')}
                                    className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <span
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                    member.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {member.status === 'active' ? 'Aktif' : member.status}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => setMemberToDelete(member)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Hapus Data Anggota Ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB 4: PENGUMUMAN & BERITA */}
            {activeTab === 'announcements' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Kelola Pengumuman & Berita ({announcements.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Publikasikan informasi kejuaraan, jadwal seleksi, dan agenda sekolah.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenAnnouncementEditor()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Pengumuman</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.content}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenAnnouncementEditor(item)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Pengumuman"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus pengumuman "${item.title}"?`)) {
                              if (onDeleteAnnouncement) {
                                onDeleteAnnouncement(item.id);
                              } else if (onUpdateAnnouncements) {
                                onUpdateAnnouncements(announcements.filter((a) => a.id !== item.id));
                              }
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: GALERI FOTO */}
            {activeTab === 'photos' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Kelola Dokumentasi Foto Kegiatan ({photos.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Upload foto kegiatan baru atau kelola koleksi foto dokumentasi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddPhoto) onOpenAddPhoto();
                      setShowAddPhotoModalInternal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Foto Baru</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square shadow-xs"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2.5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus foto dokumentasi "${photo.title}"?`)) {
                                onDeletePhoto(photo.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-300 block">{photo.ekskulName}</span>
                          <h5 className="text-xs font-bold text-white line-clamp-1">{photo.title}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: DATABASE CLOUDFLARE */}
            {activeTab === 'cloudflare' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-sky-500" />
                      <span>Database Cloudflare (D1 & Workers KV)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Sinkronisasi cloud otomatis dan ekspor data database ke akun Cloudflare <span className="font-bold text-sky-700 font-mono">Lanjarputra96@gmail.com</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Akun Terhubung: Lanjarputra96@gmail.com</span>
                    </span>
                  </div>
                </div>

                {cfSyncResult && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-fadeIn ${
                      cfSyncResult.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {cfSyncResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-extrabold">{cfSyncResult.message}</p>
                      <p className="text-[11px] opacity-80 font-normal mt-0.5">Waktu: {cfSyncResult.timestamp}</p>
                    </div>
                  </div>
                )}

                {/* Active Cloudflare D1 Database & Multi-Device Persistent Cloud Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-white tracking-wide">
                            Database Cloudflare D1 Terhubung
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                            Aktif & Tersimpan
                          </span>
                        </div>
                        <p className="text-xs text-sky-100 font-mono mt-0.5">
                          ID: <span className="font-bold underline text-white">8e8dbcb9-abd9-4149-b779-394c134b39dc</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 text-white border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Sinkronisasi Lintas Perangkat Aktif</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-sky-100/90 leading-relaxed pt-1 border-t border-white/15">
                    ✅ <strong>Penyimpanan Cloud Terpusat Aktif:</strong> Seluruh data ekstrakurikuler, pendaftaran anggota baru, dokumentasi foto, dan pengumuman kini tersimpan secara permanen di database cloud. Saat Anda atau pengguna lain membuka aplikasi melalui <strong>perangkat lain (smartphone, laptop lain, tablet)</strong>, semua data tetap tersimpan dan langsung sinkron otomatis.
                  </p>
                </div>

                {/* Status & Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* D1 SQL Database Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/40 border border-sky-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Cloudflare D1 Database</h4>
                          <span className="text-[10px] text-sky-700 font-mono font-medium">Serverless SQL (SQLite at Edge)</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        {cfConfig.databaseName || 'ekskul_school_db'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Menyimpan tabel relasional terstruktur: Data Sekolah, Ekstrakurikuler, Anggota Siswa ({members.length} data), Pengumuman ({announcements.length} data), dan Dokumentasi Foto.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={exportCloudflareD1SQL}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-600" />
                        <span>Unduh File Skrip D1 SQL (.sql)</span>
                      </button>
                    </div>
                  </div>

                  {/* Workers KV Storage Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/40 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Cloudflare Workers KV</h4>
                          <span className="text-[10px] text-indigo-700 font-mono font-medium">Low-Latency Global Key-Value</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        KV Namespace
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Format JSON Key-Value ultra-cepat untuk konfigurasi tema, cache pengumuman, dan data registrasi publik berkecepatan tinggi di jaringan 300+ kota Cloudflare.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={exportCloudflareKVJSON}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-300 text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Unduh Format Workers KV (.json)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Sync Action Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-sky-400" />
                        <h4 className="text-sm font-bold text-white">Sinkronisasi Cloudflare Live</h4>
                      </div>
                      <p className="text-xs text-slate-300">
                        Sinkronkan seluruh data aplikasi web (Anggota, Ekskul, Pengaturan) langsung ke backend endpoint Cloudflare.
                      </p>
                      {cfConfig.lastSyncTime && (
                        <p className="text-[11px] text-sky-300 font-mono">
                          Terakhir sinkron: {new Date(cfConfig.lastSyncTime).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={cfSyncing}
                      onClick={handleSyncCloudflare}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${cfSyncing ? 'animate-spin' : ''}`} />
                      <span>{cfSyncing ? 'Menyinkronkan...' : '🚀 Sinkronisasi Sekarang ke Cloudflare'}</span>
                    </button>
                  </div>
                </div>

                {/* Cloudflare Connection Form */}
                <form onSubmit={handleSaveCfConfig} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-sky-600" />
                    <span>Konfigurasi API & Akun Cloudflare</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Akun Cloudflare
                      </label>
                      <input
                        type="email"
                        value={cfConfig.userEmail}
                        onChange={(e) => setCfConfig({ ...cfConfig, userEmail: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-medium font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nama Database D1
                      </label>
                      <input
                        type="text"
                        value={cfConfig.databaseName}
                        onChange={(e) => setCfConfig({ ...cfConfig, databaseName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-medium font-mono"
                        placeholder="ekskul_school_db"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Cloudflare Database ID (D1)
                      </label>
                      <input
                        type="text"
                        value={cfConfig.databaseId}
                        onChange={(e) => setCfConfig({ ...cfConfig, databaseId: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                        placeholder="Contoh: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Cloudflare Worker API Endpoint URL
                      </label>
                      <input
                        type="url"
                        value={cfConfig.workerUrl}
                        onChange={(e) => setCfConfig({ ...cfConfig, workerUrl: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                        placeholder="https://ekskul-api.lanjarputra96.workers.dev"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Cloudflare API Token / Global Key (Opsional)
                      </label>
                      <input
                        type="password"
                        value={cfConfig.apiToken || ''}
                        onChange={(e) => setCfConfig({ ...cfConfig, apiToken: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                        placeholder="Token API dari dashboard Cloudflare..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Cloudflare Account ID (Opsional)
                      </label>
                      <input
                        type="text"
                        value={cfConfig.accountId || ''}
                        onChange={(e) => setCfConfig({ ...cfConfig, accountId: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                        placeholder="ID Akun dari dashboard Cloudflare..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 flex-wrap gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfConfig.autoSync}
                        onChange={(e) => setCfConfig({ ...cfConfig, autoSync: e.target.checked })}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Otomatis sinkronisasi setiap kali ada perubahan data ekskul / anggota
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Simpan Konfigurasi Cloudflare</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 7: BACKUP, RESTORE & SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Backup Data, Restore, & Keamanan Akun Admin
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Simpan cadangan database aplikasi ke file JSON atau ganti kata sandi akses admin.
                  </p>
                </div>

                {/* Backup & Restore Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <FolderSync className="w-4 h-4 text-indigo-600" />
                    <span>Cadangan & Pemulihan Data (Backup & Restore)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={exportAllDataJSON}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800 transition-all text-left flex items-start gap-3 cursor-pointer shadow-xs"
                    >
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold block text-slate-900">Unduh Backup JSON</strong>
                        <span className="text-[11px] text-slate-500">Ekspor seluruh data ekskul, anggota, foto, dan pengaturan.</span>
                      </div>
                    </button>

                    <label className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800 transition-all text-left flex items-start gap-3 cursor-pointer shadow-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold block text-slate-900">Pulihkan dari JSON</strong>
                        <span className="text-[11px] text-slate-500">Unggah file backup untuk menimpa/memulihkan data.</span>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSONFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-500">
                      Ingin menghapus semua perubahan dan mengembalikan ke data awal?
                    </span>
                    <button
                      type="button"
                      onClick={handleResetFactory}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset ke Data Default</span>
                    </button>
                  </div>
                </div>

                {/* Password change form */}
                <form onSubmit={handleSaveSecurity} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    <span>Ubah Nama & Kata Sandi Admin</span>
                  </span>

                  {securityMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        securityMessage.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {securityMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{securityMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nama Tampilan Pengelola / Pembina
                      </label>
                      <input
                        type="text"
                        value={adminDisplayName}
                        onChange={(e) => setAdminDisplayName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Pemulihan Kata Sandi (Untuk Verifikasi Lupa Password)
                      </label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Contoh: Lanjarputra96@gmail.com"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs font-medium"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Kode OTP 6 digit pemulihan akun akan dikirimkan ke email ini ketika Anda memilih menu "Lupa Password" di halaman login admin.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Kata Sandi Baru (Kosongkan jika tidak diubah)
                      </label>
                      <input
                        type="password"
                        placeholder="Minimal 6 karakter..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        placeholder="Ulangi kata sandi baru..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Simpan Perubahan Akun
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Announcement Editor Modal inside Admin */}
        {announcementModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h4>
                <button
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: INFO PENTING, PRESTASI, TURNAMEN"
                    value={announcementFormData.badge}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pendaftaran Ekskul Tahun Ajaran 2026/2027 Resmi Dibuka"
                    value={announcementFormData.title}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Isi Pesan Pengumuman</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan detail pengumuman untuk seluruh siswa..."
                    value={announcementFormData.content}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                  >
                    Simpan Pengumuman
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Ekskul Confirmation Modal */}
        {ekskulToDelete && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Hapus Cabang Ekstrakurikuler?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Apakah Anda yakin ingin menghapus cabang <strong>"{ekskulToDelete.name}"</strong>? Seluruh data kegiatan dan pembina cabang ini akan dihapus dari portal.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEkskulToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEkskul(ekskulToDelete.id);
                    setEkskulToDelete(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Ya, Hapus Cabang Ini
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Member Confirmation Modal */}
        {memberToDelete && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Hapus Data Anggota Siswa?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Apakah Anda yakin ingin menghapus data <strong>"{memberToDelete.fullName}"</strong> ({memberToDelete.studentId} • {memberToDelete.ekskulName})?
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteMember(memberToDelete.id);
                    setMemberToDelete(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Ya, Hapus Data Siswa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hapus Anggota Ceklis (Bulk Delete) */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Hapus {selectedMemberIds.length} Siswa yang Diceklis?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Apakah Anda yakin ingin menghapus <strong>{selectedMemberIds.length} data anggota siswa</strong> yang telah Anda pilih? Data akan dihapus permanen dari sistem dan disinkronkan ke Cloudflare.
              </p>

              {/* Preview Names of Selected Members */}
              <div className="max-h-36 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-5 space-y-1">
                {members
                  .filter((m) => selectedMemberIds.includes(m.id))
                  .map((m) => (
                    <div key={m.id} className="text-[11px] text-slate-700 flex items-center justify-between">
                      <span className="font-semibold truncate max-w-[200px]">{m.fullName}</span>
                      <span className="text-[10px] text-slate-500">{m.ekskulName}</span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteMultipleMembers) {
                      onDeleteMultipleMembers(selectedMemberIds);
                    } else {
                      selectedMemberIds.forEach((id) => onDeleteMember(id));
                    }
                    setSelectedMemberIds([]);
                    setShowBulkDeleteModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Ya, Hapus {selectedMemberIds.length} Siswa Terpilih
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hapus Anggota Per Ekskul */}
        {showDeleteByEkskulModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Hapus Anggota Per Cabang Ekskul
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pilih cabang ekstrakurikuler yang ingin Anda hapus seluruh data anggotanya:
              </p>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Cabang Ekskul:
                </label>
                <select
                  value={selectedEkskulForBulkDelete}
                  onChange={(e) => setSelectedEkskulForBulkDelete(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {ekskuls.map((ek) => {
                    const count = members.filter((m) => m.ekskulId === ek.id).length;
                    return (
                      <option key={ek.id} value={ek.id}>
                        {ek.name} ({count} Anggota)
                      </option>
                    );
                  })}
                </select>
              </div>

              {(() => {
                const targetEkskul = ekskuls.find((e) => e.id === selectedEkskulForBulkDelete);
                const count = members.filter((m) => m.ekskulId === selectedEkskulForBulkDelete).length;
                return (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-5 font-medium">
                    Akan menghapus <strong>{count} anggota</strong> dari ekstrakurikuler{' '}
                    <strong>{targetEkskul?.name || 'terpilih'}</strong>.
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteByEkskulModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!selectedEkskulForBulkDelete}
                  onClick={() => {
                    if (onDeleteMembersByEkskul && selectedEkskulForBulkDelete) {
                      onDeleteMembersByEkskul(selectedEkskulForBulkDelete);
                    }
                    setSelectedMemberIds((prev) =>
                      prev.filter((id) => {
                        const m = members.find((mem) => mem.id === id);
                        return m?.ekskulId !== selectedEkskulForBulkDelete;
                      })
                    );
                    setShowDeleteByEkskulModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  Hapus Anggota di Ekskul Ini
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hapus Seluruh Anggota */}
        {showDeleteAllModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Hapus Seluruh Data Anggota ({members.length} Siswa)?
              </h4>
              <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 leading-relaxed mb-4 font-medium">
                <strong>PERHATIAN:</strong> Tindakan ini akan menghapus <strong>seluruh data siswa ({members.length} siswa)</strong> dari seluruh cabang ekstrakurikuler di sistem. Data yang dihapus akan segera disinkronkan ke Cloudflare dan tidak dapat dipulihkan secara otomatis jika tidak memiliki cadangan Excel.
              </p>
              <p className="text-xs text-slate-600 mb-5">
                Pastikan Anda telah mengekspor cadangan file Excel sebelum melanjutkan jika sewaktu-waktu data dibutuhkan kembali.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteAllMembers) {
                      onDeleteAllMembers();
                    } else {
                      members.forEach((m) => onDeleteMember(m.id));
                    }
                    setSelectedMemberIds([]);
                    setShowDeleteAllModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Ya, Hapus Seluruh Anggota
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Direct Edit Ekskul Modal */}
        {editingEkskulDirectly && (
          <EditEkskulModal
            isOpen={true}
            initialData={editingEkskulDirectly}
            ekskul={editingEkskulDirectly}
            onClose={() => setEditingEkskulDirectly(null)}
            onSave={(saved) => {
              if (onSaveEditedEkskul) {
                onSaveEditedEkskul(saved);
              } else {
                onEditEkskul(saved);
              }
              setEditingEkskulDirectly(null);
            }}
          />
        )}

        {/* Excel Upload Modal */}
        <ExcelUploadModal
          isOpen={showExcelUploadModal}
          onClose={() => setShowExcelUploadModal(false)}
          ekskuls={ekskuls}
          availableClasses={classList}
          onImportMembers={(imported) => {
            if (onImportMembers) {
              onImportMembers(imported);
            }
          }}
        />

        {/* Add Photo Modal */}
        {showAddPhotoModalInternal && (
          <AddPhotoModal
            ekskuls={ekskuls}
            onClose={() => setShowAddPhotoModalInternal(false)}
            onAddPhoto={(newPhoto) => {
              if (onAddPhoto) {
                onAddPhoto(newPhoto);
              }
              setShowAddPhotoModalInternal(false);
            }}
          />
        )}

        {/* Add Ekskul Modal */}
        {showAddEkskulModalInternal && (
          <AddEkskulModal
            onClose={() => setShowAddEkskulModalInternal(false)}
            onAddEkskul={(newEkskul) => {
              if (onAddEkskulDirect) {
                onAddEkskulDirect(newEkskul);
              }
              setShowAddEkskulModalInternal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
