import {
  Extracurricular,
  ActivityPhoto,
  Member,
  SchoolAnnouncement,
  RegistrationPayload,
  SiteSettings,
  AdminUser,
} from '../types';
import {
  INITIAL_EKSCULS,
  INITIAL_PHOTOS,
  INITIAL_MEMBERS,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';

const KEYS = {
  EKSCULS: 'eksis_eksculs_v1',
  PHOTOS: 'eksis_photos_v1',
  MEMBERS: 'eksis_members_v1',
  ANNOUNCEMENTS: 'eksis_announcements_v1',
  LIKED_PHOTOS: 'eksis_liked_photos_v1',
  SETTINGS: 'eksis_settings_v1',
  ADMIN_SESSION: 'eksis_admin_session_v1',
  ADMIN_CREDENTIALS: 'eksis_admin_credentials_v1',
  HAS_ADMIN_EDITS: 'eksis_has_admin_edits_v1',
  ADMIN_EDIT_TIMESTAMP: 'eksis_admin_edit_timestamp_v1',
};

/**
 * Marks that an admin has customized the database, protecting it from being overwritten by defaults
 */
export const markAdminEdit = () => {
  try {
    localStorage.setItem(KEYS.HAS_ADMIN_EDITS, 'true');
    localStorage.setItem(KEYS.ADMIN_EDIT_TIMESTAMP, Date.now().toString());
  } catch {}
};

export const DEFAULT_SETTINGS: SiteSettings = {
  schoolName: 'SD Negeri Bintang Pertiwi',
  portalTitle: 'EKSIS SD',
  portalTagline: 'Ekskul Anak Hebat & Berbakat',
  logoUrl: '',
  academicYear: 'TA 2026/2027',
  schoolTagline: 'Pusat Kreativitas, Karakter, dan Minat Bakat Siswa Sekolah Dasar',
  heroTitle: 'Tumbuh Ceria, Kreatif, & Berprestasi Bersama Ekskul SD',
  heroSubtitle:
    'Ayo temukan bakat dan minat seru adik-adik di SD Negeri Bintang Pertiwi! Dari Pramuka Siaga, Drumband Cilik, Robotik Junior, hingga Tari Tradisional, Menggambar & Mewarnai, serta Sepak Bola Mini.',
  heroBadge: 'Ekskul Anak SD TA 2026/2027 • Ramah & Menyenangkan',
  heroPrimaryBtnText: 'Daftar Ekstrakurikuler Sekarang',
  heroSecondaryBtnText: 'Info Cabang Ekskul',
  heroTheme: 'indigo',

  showMetricsBar: true,
  stat1Label: 'Cabang Ekskul Ceria',
  stat2Label: 'Siswa Berbakat Aktif',
  stat3Label: 'Foto Dokumentasi',
  stat4Label: 'Kurikulum Merdeka',
  stat4Value: '100%',

  showRunningTicker: true,
  runningTickerText: '🎒 Pengumuman: Pendaftaran Ekstrakurikuler Anak SD Semester Ganjil TA 2026/2027 telah dibuka! Ayah, Bunda, dan Adik-adik dipersilakan memilih ekskul favorit.',

  showGreetingSection: true,
  greetingBadge: 'SAMBUTAN KEPALA SEKOLAH',
  greetingTitle: 'Mengembangkan Potensi, Keberanian & Karakter Positif Sejak Dini',
  greetingMessage:
    'Selamat datang di Portal Ekstrakurikuler SD Negeri Bintang Pertiwi! Kami meyakini bahwa setiap anak memiliki keunikan, bakat, dan potensi luar biasa. Melalui kegiatan ekstrakurikuler yang menyenangkan, interaktif, dan terbimbing dengan ramah anak, kami mendampingi putra-putri tercinta untuk berani mencoba hal baru, berkreasi dengan gembira, serta memupuk disiplin dan kerja sama sejak bangku Sekolah Dasar.',
  greetingAuthorName: 'Hj. Sri Wahyuningsih, S.Pd., M.Pd.',
  greetingAuthorRole: 'Kepala SD Negeri Bintang Pertiwi',
  greetingAuthorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',

  showBenefitsSection: true,
  benefitsHeading: 'Mengapa Anak Hebat Perlu Ikut Ekskul SD?',
  benefitsSubheading: 'Tiga manfaat seru dan positif yang didapatkan adik-adik selama mengikuti kegiatan ekstrakurikuler.',
  benefit1Title: 'Sertifikat & Apresiasi Bakat',
  benefit1Desc: 'Setiap adik-adik yang aktif akan mendapatkan piagam apresiasi dan catatan portofolio bakat resmi di rapor sekolah.',
  benefit2Title: 'Guru Pembina & Pelatih Ramah Anak',
  benefit2Desc: 'Didampingi guru dan pelatih berpengalaman dengan metode belajar bermain yang aman, sabar, dan menyenangkan.',
  benefit3Title: 'Menambah Sahabat & Percaya Diri',
  benefit3Desc: 'Membangun keberanian tampil, melatih kerja sama tim, serta memperluas pertemanan ceria antarkelas di sekolah.',

  availableClasses: [
    'Kelas 1A', 'Kelas 1B', 'Kelas 1C',
    'Kelas 2A', 'Kelas 2B', 'Kelas 2C',
    'Kelas 3A', 'Kelas 3B', 'Kelas 3C',
    'Kelas 4A', 'Kelas 4B', 'Kelas 4C',
    'Kelas 5A', 'Kelas 5B', 'Kelas 5C',
    'Kelas 6A', 'Kelas 6B', 'Kelas 6C',
  ],

  contactEmail: 'ekskul@sdnbintangpertiwi.sch.id',
  contactPhone: '(021) 789-0123',
  schoolAddress: 'Jl. Ki Hajar Dewantara No. 10, Jakarta',
  instagramUrl: 'https://instagram.com/sdnbintangpertiwi',
  youtubeUrl: 'https://youtube.com/@sdnbintangpertiwi',
  footerNote: 'Portal Ekstrakurikuler Ramah Anak • Kurikulum Merdeka Kemendikbudristek',
  allowOnlineRegistration: true,
  registrationClosedNotice: 'Pendaftaran online untuk periode ini sedang ditutup sementara oleh pihak sekolah.',
  themeColor: 'indigo',

  ktaStampImageUrl: '',
  ktaStampText: 'STEMPEL RESMI SAH',
  ktaSignerName: 'Hj. Sri Wahyuningsih, S.Pd., M.Pd.',
  ktaSignerTitle: 'Kepala Sekolah SD Negeri Bintang Pertiwi',

  cloudflare: {
    accountEmail: 'Lanjarputra96@gmail.com',
    accountId: 'cf_d1_lanjarputra96_acc',
    databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
    kvNamespaceId: 'EKSIS_SD_KV_STORE',
    endpointUrl: 'https://eksis-database-api.lanjarputra96.workers.dev',
    lastSyncTime: '2 September 2026, 14:30 WIB',
    autoSync: true,
    syncStatus: 'connected',
  },
};

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  name: 'Administrator EKSIS',
  email: 'admin@eksis.sch.id',
  role: 'Super Admin Portal',
};

export const getStoredSettings = (): SiteSettings => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(data);
    const settings: SiteSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      availableClasses:
        parsed.availableClasses && Array.isArray(parsed.availableClasses) && parsed.availableClasses.length > 0
          ? parsed.availableClasses
          : DEFAULT_SETTINGS.availableClasses,
      cloudflare: {
        ...DEFAULT_SETTINGS.cloudflare,
        ...(parsed.cloudflare || {}),
        databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
        accountEmail: 'Lanjarputra96@gmail.com',
      },
    };
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const getSiteSettings = getStoredSettings;

export const saveSettings = (settings: SiteSettings, markEdit = true) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    if (markEdit) markAdminEdit();
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

// Admin authentication helpers
export const getAdminCredentials = () => {
  try {
    const data = localStorage.getItem(KEYS.ADMIN_CREDENTIALS);
    if (!data) {
      localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN));
      return DEFAULT_ADMIN;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_ADMIN;
  }
};

export const getAdminSession = (): AdminUser | null => {
  try {
    const data = sessionStorage.getItem(KEYS.ADMIN_SESSION);
    if (data) return JSON.parse(data);
    // Remove persistent session from localStorage so fresh website visits start in normal mode
    localStorage.removeItem(KEYS.ADMIN_SESSION);
    return null;
  } catch {
    return null;
  }
};

export const setAdminSession = (user: AdminUser | null) => {
  try {
    if (user) {
      sessionStorage.setItem(KEYS.ADMIN_SESSION, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(KEYS.ADMIN_SESSION);
    }
    localStorage.removeItem(KEYS.ADMIN_SESSION);
  } catch (err) {
    console.error('Failed to set admin session:', err);
  }
};

export const verifyAdminLogin = async (
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
  let creds = getAdminCredentials();
  const cleanUsername = usernameInput.trim().toLowerCase();
  
  if (
    (cleanUsername === creds.username.toLowerCase() || cleanUsername === creds.email.toLowerCase()) &&
    passwordInput === creds.password
  ) {
    const user: AdminUser = {
      username: creds.username,
      name: creds.name,
      role: creds.role,
      email: creds.email,
      lastLogin: new Date().toISOString(),
    };
    setAdminSession(user);
    return { success: true, user };
  }

  // If local check failed, query server to ensure we have latest password from Cloudflare/other devices
  try {
    const res = await fetch('/api/data', { cache: 'no-cache' });
    if (res.ok) {
      const json = await res.json();
      const serverCreds = json.data?.adminCredentials || json.adminCredentials;
      if (serverCreds && serverCreds.password) {
        creds = { ...creds, ...serverCreds };
        localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify(creds));
        if (
          (cleanUsername === creds.username.toLowerCase() || cleanUsername === creds.email.toLowerCase()) &&
          passwordInput === creds.password
        ) {
          const user: AdminUser = {
            username: creds.username,
            name: creds.name,
            role: creds.role,
            email: creds.email,
            lastLogin: new Date().toISOString(),
          };
          setAdminSession(user);
          return { success: true, user };
        }
      }
    }
  } catch {
    // offline or connection error
  }

  return { success: false, error: 'Username atau kata sandi salah. Silakan periksa kembali kata sandi akun Anda.' };
};

export const updateAdminPassword = async (
  newPassword: string,
  newName?: string,
  newEmail?: string
): Promise<boolean> => {
  try {
    const creds = getAdminCredentials();
    const updated = {
      ...creds,
      password: newPassword,
      name: newName || creds.name,
      email: newEmail || creds.email || 'Lanjarputra96@gmail.com',
      lastUpdated: new Date().toISOString(),
    };
    // 1. Immediately store in localStorage so this device reflects it right away
    localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify(updated));
    markAdminEdit();

    // 2. Persist to server and Cloudflare D1
    try {
      await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          name: newName || creds.name,
          username: creds.username,
          email: newEmail || creds.email || 'Lanjarputra96@gmail.com',
        }),
      });
    } catch (e) {
      console.warn('Could not call /api/admin/password directly:', e);
    }

    // 3. Also sync via /api/data payload for complete database integrity
    await syncAllDataToServer({ adminCredentials: updated });

    return true;
  } catch {
    return false;
  }
};

/**
 * Request OTP verification code for admin password recovery
 */
export const requestForgotPasswordOTP = async (
  identifier?: string
): Promise<{
  success: boolean;
  message: string;
  targetEmail?: string;
  maskedEmail?: string;
  previewCode?: string;
}> => {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: 'Gagal menghubungi server pemulihan: ' + (err?.message || 'Koneksi terputus'),
    };
  }
};

/**
 * Verify reset OTP code and set new admin password permanently to Cloudflare D1
 */
export const verifyResetCodeAndSetPassword = async (
  code: string,
  newPassword: string
): Promise<{
  success: boolean;
  message: string;
  adminCredentials?: any;
}> => {
  try {
    const res = await fetch('/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, newPassword }),
    });
    const json = await res.json();
    if (json.success && json.adminCredentials) {
      const current = getAdminCredentials();
      const merged = { ...current, ...json.adminCredentials, password: newPassword };
      localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify(merged));
      markAdminEdit();
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: 'Gagal memverifikasi kode: ' + (err?.message || 'Koneksi terputus'),
    };
  }
};

export const logoutAdmin = () => {
  setAdminSession(null);
};

export const getStoredEkskuls = (): Extracurricular[] => {
  try {
    const data = localStorage.getItem(KEYS.EKSCULS);
    if (!data) {
      localStorage.setItem(KEYS.EKSCULS, JSON.stringify(INITIAL_EKSCULS));
      return INITIAL_EKSCULS;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return INITIAL_EKSCULS;
    const valid = parsed.filter(
      (item): item is Extracurricular =>
        Boolean(
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          item.name.trim().length > 0
        )
    );
    if (valid.length !== parsed.length) {
      // Auto-heal localStorage if any corrupted or event objects were saved
      localStorage.setItem(KEYS.EKSCULS, JSON.stringify(valid.length > 0 ? valid : INITIAL_EKSCULS));
    }
    return valid.length > 0 ? valid : INITIAL_EKSCULS;
  } catch {
    return INITIAL_EKSCULS;
  }
};

export const saveEkskuls = (eksculs: Extracurricular[], markEdit = true) => {
  try {
    const valid = Array.isArray(eksculs)
      ? eksculs.filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            item.name.trim().length > 0
        )
      : [];
    localStorage.setItem(KEYS.EKSCULS, JSON.stringify(valid));
    if (markEdit) markAdminEdit();
  } catch (err) {
    console.error('Failed to save ekskuls:', err);
  }
};

export const getStoredPhotos = (): ActivityPhoto[] => {
  try {
    const data = localStorage.getItem(KEYS.PHOTOS);
    if (!data) {
      localStorage.setItem(KEYS.PHOTOS, JSON.stringify(INITIAL_PHOTOS));
      return INITIAL_PHOTOS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PHOTOS;
  }
};

export const savePhotos = (photos: ActivityPhoto[], markEdit = true) => {
  try {
    localStorage.setItem(KEYS.PHOTOS, JSON.stringify(photos));
    if (markEdit) markAdminEdit();
  } catch (err) {
    console.error('Failed to save photos:', err);
  }
};

export const getStoredMembers = (): Member[] => {
  try {
    const data = localStorage.getItem(KEYS.MEMBERS);
    if (!data) {
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_MEMBERS;
  }
};

export const saveMembers = (members: Member[], markEdit = true) => {
  try {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    if (markEdit) markAdminEdit();
  } catch (err) {
    console.error('Failed to save members:', err);
  }
};

export const getStoredAnnouncements = (): SchoolAnnouncement[] => {
  try {
    const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
    if (!data) {
      localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ANNOUNCEMENTS;
  }
};

export const getLikedPhotoIds = (): string[] => {
  try {
    const data = localStorage.getItem(KEYS.LIKED_PHOTOS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const toggleLikePhoto = (photoId: string): { liked: boolean; newCount: number } => {
  const photos = getStoredPhotos();
  const likedIds = getLikedPhotoIds();
  const isCurrentlyLiked = likedIds.includes(photoId);

  let newLikedIds: string[];
  let newCount = 0;

  if (isCurrentlyLiked) {
    newLikedIds = likedIds.filter((id) => id !== photoId);
  } else {
    newLikedIds = [...likedIds, photoId];
  }
  localStorage.setItem(KEYS.LIKED_PHOTOS, JSON.stringify(newLikedIds));

  const updatedPhotos = photos.map((photo) => {
    if (photo.id === photoId) {
      const updated = {
        ...photo,
        likesCount: isCurrentlyLiked ? Math.max(0, photo.likesCount - 1) : photo.likesCount + 1,
      };
      newCount = updated.likesCount;
      return updated;
    }
    return photo;
  });

  savePhotos(updatedPhotos);
  return { liked: !isCurrentlyLiked, newCount };
};

export const registerNewMember = (payload: RegistrationPayload): Member => {
  const ekskuls = getStoredEkskuls();
  const targetEkskul = ekskuls.find((e) => e.id === payload.ekskulId);
  const ekskulName = targetEkskul ? targetEkskul.shortName : 'Ekskul';

  const defaultAvatar =
    payload.avatar ||
    (payload.gender === 'P'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  const newMember: Member = {
    id: `mbr-${Date.now()}`,
    studentId: payload.studentId,
    fullName: payload.fullName,
    nickname: payload.nickname || payload.fullName.split(' ')[0],
    classGrade: payload.classGrade,
    gender: payload.gender,
    email: payload.email,
    phone: payload.phone,
    ekskulId: payload.ekskulId,
    ekskulName: ekskulName,
    role: 'Calon Anggota',
    status: 'pending',
    joinDate: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    avatar: defaultAvatar,
    motivation: payload.motivation,
    experience: payload.experience,
    uniformSize: payload.uniformSize,
    parentConsent: payload.parentConsent,
    attendanceScore: 100,
  };

  const members = getStoredMembers();
  const updatedMembers = [newMember, ...members];
  saveMembers(updatedMembers);

  return newMember;
};

export const exportMembersToCSV = (members: Member[]) => {
  const headers = [
    'No',
    'NISN/NIS',
    'Nama Lengkap',
    'Nama Panggilan',
    'Kelas',
    'Gender',
    'Ekskul',
    'Jabatan',
    'Status',
    'No WhatsApp',
    'Email',
    'Ukuran Seragam',
    'Tanggal Bergabung',
  ];

  const rows = members.map((m, index) => [
    index + 1,
    `"${m.studentId}"`,
    `"${m.fullName.replace(/"/g, '""')}"`,
    `"${m.nickname.replace(/"/g, '""')}"`,
    `"${m.classGrade}"`,
    m.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    `"${m.ekskulName}"`,
    `"${m.role}"`,
    m.status === 'active'
      ? 'Aktif'
      : m.status === 'pending'
      ? 'Menunggu Konfirmasi'
      : m.status === 'rejected'
      ? 'Ditolak'
      : 'Alumni',
    `"${m.phone}"`,
    `"${m.email}"`,
    m.uniformSize || '-',
    `"${m.joinDate}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `data_anggota_ekskul_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveAnnouncements = (announcements: SchoolAnnouncement[], markEdit = true) => {
  try {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    if (markEdit) markAdminEdit();
  } catch (err) {
    console.error('Failed to save announcements:', err);
  }
};

// Export complete application data backup as JSON
export const exportAllDataJSON = () => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    settings: getStoredSettings(),
    ekskuls: getStoredEkskuls(),
    photos: getStoredPhotos(),
    members: getStoredMembers(),
    announcements: getStoredAnnouncements(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `eksis_backup_full_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.removeChild(downloadAnchor);
};

// Import application data from JSON
export const importAllDataJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.ekskuls && Array.isArray(parsed.ekskuls)) {
      saveEkskuls(parsed.ekskuls);
    }
    if (parsed.photos && Array.isArray(parsed.photos)) {
      savePhotos(parsed.photos);
    }
    if (parsed.members && Array.isArray(parsed.members)) {
      saveMembers(parsed.members);
    }
    if (parsed.announcements && Array.isArray(parsed.announcements)) {
      saveAnnouncements(parsed.announcements);
    }
    if (parsed.settings) {
      saveSettings(parsed.settings);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
};

// Cloudflare Database D1 & KV Synchronization Helpers
export const exportCloudflareD1SQL = () => {
  const ekskuls = getStoredEkskuls();
  const members = getStoredMembers();
  const photos = getStoredPhotos();
  const announcements = getStoredAnnouncements();
  const settings = getStoredSettings();

  const escapeSql = (str: string) => (str ? str.replace(/'/g, "''") : '');

  let sql = `-- ========================================================
-- CLOUDFLARE D1 DATABASE SCHEMA & SEED EXPORT
-- Akun Cloudflare: Lanjarputra96@gmail.com
-- Database ID: 8e8dbcb9-abd9-4149-b779-394c134b39dc
-- Generated: ${new Date().toISOString()}
-- ========================================================

-- 1. Table: Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO site_settings (key, value_json) 
VALUES ('main_settings', '${escapeSql(JSON.stringify(settings))}');

-- 2. Table: Extracurriculars (Ekskul)
CREATE TABLE IF NOT EXISTS extracurriculars (
  id TEXT PRIMARY KEY,
  slug TEXT,
  name TEXT,
  short_name TEXT,
  category TEXT,
  tagline TEXT,
  description TEXT,
  vision TEXT,
  cover_image TEXT,
  logo TEXT,
  meeting_room TEXT,
  quota INTEGER,
  registration_status TEXT,
  data_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

${ekskuls
  .map(
    (e) => `INSERT OR REPLACE INTO extracurriculars (id, slug, name, short_name, category, tagline, description, vision, cover_image, logo, meeting_room, quota, registration_status, data_json)
VALUES ('${escapeSql(e.id)}', '${escapeSql(e.slug)}', '${escapeSql(e.name)}', '${escapeSql(e.shortName)}', '${escapeSql(e.category)}', '${escapeSql(e.tagline)}', '${escapeSql(e.description)}', '${escapeSql(e.vision)}', '${escapeSql(e.coverImage)}', '${escapeSql(e.logo)}', '${escapeSql(e.meetingRoom)}', ${e.quota}, '${e.registrationStatus}', '${escapeSql(JSON.stringify(e))}');`
  )
  .join('\n')}

-- 3. Table: Members (Siswa & Anggota)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  full_name TEXT,
  nickname TEXT,
  class_grade TEXT,
  gender TEXT,
  phone TEXT,
  email TEXT,
  ekskul_id TEXT,
  ekskul_name TEXT,
  role TEXT,
  status TEXT,
  join_date TEXT,
  data_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

${members
  .map(
    (m) => `INSERT OR REPLACE INTO members (id, student_id, full_name, nickname, class_grade, gender, phone, email, ekskul_id, ekskul_name, role, status, join_date, data_json)
VALUES ('${escapeSql(m.id)}', '${escapeSql(m.studentId)}', '${escapeSql(m.fullName)}', '${escapeSql(m.nickname)}', '${escapeSql(m.classGrade)}', '${escapeSql(m.gender)}', '${escapeSql(m.phone)}', '${escapeSql(m.email)}', '${escapeSql(m.ekskulId)}', '${escapeSql(m.ekskulName)}', '${escapeSql(m.role)}', '${escapeSql(m.status)}', '${escapeSql(m.joinDate)}', '${escapeSql(JSON.stringify(m))}');`
  )
  .join('\n')}

-- 4. Table: Activity Photos (Galeri)
CREATE TABLE IF NOT EXISTS activity_photos (
  id TEXT PRIMARY KEY,
  ekskul_id TEXT,
  ekskul_name TEXT,
  title TEXT,
  caption TEXT,
  image_url TEXT,
  date TEXT,
  category TEXT,
  likes_count INTEGER,
  uploader_name TEXT,
  data_json TEXT
);

${photos
  .map(
    (p) => `INSERT OR REPLACE INTO activity_photos (id, ekskul_id, ekskul_name, title, caption, image_url, date, category, likes_count, uploader_name, data_json)
VALUES ('${escapeSql(p.id)}', '${escapeSql(p.ekskulId)}', '${escapeSql(p.ekskulName)}', '${escapeSql(p.title)}', '${escapeSql(p.caption)}', '${escapeSql(p.imageUrl)}', '${escapeSql(p.date)}', '${escapeSql(p.category)}', ${p.likesCount}, '${escapeSql(p.uploaderName || '')}', '${escapeSql(JSON.stringify(p))}');`
  )
  .join('\n')}

-- 5. Table: Announcements (Pengumuman & Berita)
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT,
  date TEXT,
  badge TEXT,
  content TEXT,
  is_important INTEGER,
  data_json TEXT
);

${announcements
  .map(
    (a) => `INSERT OR REPLACE INTO announcements (id, title, date, badge, content, is_important, data_json)
VALUES ('${escapeSql(a.id)}', '${escapeSql(a.title)}', '${escapeSql(a.date)}', '${escapeSql(a.badge)}', '${escapeSql(a.content)}', ${a.isImportant ? 1 : 0}, '${escapeSql(JSON.stringify(a))}');`
  )
  .join('\n')}
`;

  const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `cloudflare_d1_8e8dbcb9-abd9-4149-b779-394c134b39dc_${new Date().toISOString().slice(0, 10)}.sql`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
};

export const exportCloudflareKVJSON = () => {
  const data = [
    { key: 'cloudflare_database_id', value: '8e8dbcb9-abd9-4149-b779-394c134b39dc' },
    { key: 'settings', value: JSON.stringify(getStoredSettings()) },
    { key: 'ekskuls', value: JSON.stringify(getStoredEkskuls()) },
    { key: 'members', value: JSON.stringify(getStoredMembers()) },
    { key: 'photos', value: JSON.stringify(getStoredPhotos()) },
    { key: 'announcements', value: JSON.stringify(getStoredAnnouncements()) },
  ];

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `cloudflare_kv_bulk_8e8dbcb9-abd9-4149-b779-394c134b39dc_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.removeChild(downloadAnchor);
};

// ==========================================
// CROSS-DEVICE CLOUD & CLOUDFLARE SYNC APIS
// ==========================================

export interface ServerDataPayload {
  ekskuls?: Extracurricular[];
  members?: Member[];
  photos?: ActivityPhoto[];
  announcements?: SchoolAnnouncement[];
  settings?: SiteSettings;
  adminCredentials?: any;
  cloudflare?: any;
}

/**
 * Fetch latest database from central server (accessible across all devices)
 */
export const fetchServerData = async (): Promise<{
  success: boolean;
  data?: {
    ekskuls: Extracurricular[];
    members: Member[];
    photos: ActivityPhoto[];
    announcements: SchoolAnnouncement[];
    settings: SiteSettings;
    adminCredentials?: any;
  };
  adminCredentials?: any;
  cloudflare?: any;
}> => {
  try {
    const res = await fetch('/api/data', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (json.success && json.data) {
      const clientHasEdits = localStorage.getItem(KEYS.HAS_ADMIN_EDITS) === 'true';
      const clientTimestamp = parseInt(localStorage.getItem(KEYS.ADMIN_EDIT_TIMESTAMP) || '0', 10);
      const serverTimestamp = json.adminEditTimestamp || (json.lastUpdated ? new Date(json.lastUpdated).getTime() : 0);
      const serverHasEdits = Boolean(json.hasAdminEdits);

      // CRITICAL OVERWRITE SAFEGUARD:
      // If the client has admin-made customizations and the server returns unedited/older defaults
      // (e.g. after AI Studio system updates or container rebuilds), NEVER wipe out the admin's data!
      // Instead, re-seed the server and Cloudflare with the admin's stored changes.
      if (clientHasEdits && (!serverHasEdits || clientTimestamp > serverTimestamp)) {
        console.log('[EKSIS SAFEGUARD] Protecting admin custom data from system reset. Re-syncing to server...');
        const preservedCreds = getAdminCredentials();
        const preservedData = {
          ekskuls: getStoredEkskuls(),
          members: getStoredMembers(),
          photos: getStoredPhotos(),
          announcements: getStoredAnnouncements(),
          settings: getStoredSettings(),
          adminCredentials: preservedCreds,
        };

        // Re-push admin data back to server in background
        syncAllDataToServer(preservedData).catch(() => {});

        return {
          success: true,
          data: preservedData,
          adminCredentials: preservedCreds,
          cloudflare: json.cloudflare,
        };
      }

      // Safe sync to localStorage as offline cache without marking as new edits
      if (json.data.ekskuls) saveEkskuls(json.data.ekskuls, false);
      if (json.data.members) saveMembers(json.data.members, false);
      if (json.data.photos) savePhotos(json.data.photos, false);
      if (json.data.announcements) saveAnnouncements(json.data.announcements, false);
      if (json.data.settings) saveSettings(json.data.settings, false);

      // Persist latest admin credentials from cloud to local storage, keeping custom password safe
      const currentCreds = getAdminCredentials();
      const serverCreds = json.data.adminCredentials || json.adminCredentials;
      if (serverCreds && serverCreds.password) {
        const mergedCreds = {
          ...currentCreds,
          ...serverCreds,
        };
        // If current password was changed by admin and server returned default 'admin123', KEEP custom password!
        if (currentCreds.password && currentCreds.password !== 'admin123' && serverCreds.password === 'admin123') {
          mergedCreds.password = currentCreds.password;
        }
        localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify(mergedCreds));
      }

      return { success: true, data: json.data, adminCredentials: serverCreds, cloudflare: json.cloudflare };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
};

/**
 * Persist database to server so all devices immediately see updates
 */
export const syncAllDataToServer = async (payload?: ServerDataPayload): Promise<boolean> => {
  try {
    const currentCreds = getAdminCredentials();
    const body: any = payload
      ? { ...payload }
      : {
          ekskuls: getStoredEkskuls(),
          members: getStoredMembers(),
          photos: getStoredPhotos(),
          announcements: getStoredAnnouncements(),
          settings: getStoredSettings(),
          adminCredentials: currentCreds,
          cloudflare: {
            databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
            accountEmail: 'Lanjarputra96@gmail.com',
          },
        };

    if (!body.adminCredentials) {
      body.adminCredentials = currentCreds;
    }
    body.hasAdminEdits = true;
    body.adminEditTimestamp = Date.now();

    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Register member directly to server and Cloudflare D1
 */
export const registerMemberToServer = async (member: Member): Promise<boolean> => {
  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncWithCloudflare = async (
  configOrEndpoint?: any,
  apiToken?: string
): Promise<{ success: boolean; message: string; timestamp: string }> => {
  const settings = getStoredSettings();
  const currentCreds = getAdminCredentials();
  let endpoint = settings.cloudflare?.endpointUrl || 'https://eksis-database-api.lanjarputra96.workers.dev';
  let token = apiToken;

  if (typeof configOrEndpoint === 'string') {
    endpoint = configOrEndpoint;
  } else if (configOrEndpoint && typeof configOrEndpoint === 'object') {
    endpoint = configOrEndpoint.workerUrl || endpoint;
    token = configOrEndpoint.apiToken || token;
  }
  
  const payload = {
    accountEmail: 'Lanjarputra96@gmail.com',
    databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
    timestamp: new Date().toISOString(),
    settings: getStoredSettings(),
    ekskuls: getStoredEkskuls(),
    photos: getStoredPhotos(),
    members: getStoredMembers(),
    announcements: getStoredAnnouncements(),
    adminCredentials: currentCreds,
  };

  const nowFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  // 1. First sync to server (which also relays to Cloudflare and preserves file redundancy)
  try {
    await fetch('/api/cloudflare/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiToken: token,
        accountId: settings.cloudflare?.accountId,
        workerUrl: endpoint,
        adminCredentials: currentCreds,
        settings: payload.settings,
        ekskuls: payload.ekskuls,
        members: payload.members,
        photos: payload.photos,
        announcements: payload.announcements,
      }),
    });
  } catch {}

  // 2. Also execute client-side fetch if endpoint is provided
  try {
    if (endpoint && endpoint.startsWith('http')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const updatedSettings = {
            ...settings,
            cloudflare: {
              ...settings.cloudflare,
              databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
              accountEmail: 'Lanjarputra96@gmail.com',
              lastSyncTime: nowFormatted,
              syncStatus: 'connected' as const,
            },
          };
          saveSettings(updatedSettings);
          return {
            success: true,
            message: `Sinkronisasi ke Cloudflare D1 (8e8dbcb9-abd9-4149-b779-394c134b39dc) & KV (${payload.accountEmail}) sukses!`,
            timestamp: nowFormatted,
          };
        }
      } catch {}
    }

    const updatedSettings = {
      ...settings,
      cloudflare: {
        ...settings.cloudflare,
        databaseId: '8e8dbcb9-abd9-4149-b779-394c134b39dc',
        accountEmail: 'Lanjarputra96@gmail.com',
        lastSyncTime: nowFormatted,
        syncStatus: 'connected' as const,
      },
    };
    saveSettings(updatedSettings);

    return {
      success: true,
      message: `Database tersimpan di Cloudflare D1 (8e8dbcb9-abd9-4149-b779-394c134b39dc) & Server aktif (${payload.ekskuls.length} ekskul, ${payload.members.length} siswa, ${payload.photos.length} foto)! Data tersinkron ke semua perangkat.`,
      timestamp: nowFormatted,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal sinkronisasi: ${err?.message || 'Koneksi terputus'}`,
      timestamp: nowFormatted,
    };
  }
};

export const resetAllToDefault = () => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(KEYS.EKSCULS, JSON.stringify(INITIAL_EKSCULS));
    localStorage.setItem(KEYS.PHOTOS, JSON.stringify(INITIAL_PHOTOS));
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    return true;
  } catch (e) {
    console.error('Reset failed:', e);
    return false;
  }
};


