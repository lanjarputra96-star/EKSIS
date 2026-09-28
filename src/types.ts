export type ExtracurricularCategory =
  | 'semua'
  | 'olahraga'
  | 'seni'
  | 'sains_teknologi'
  | 'kepemimpinan'
  | 'kemanusiaan_sosial'
  | 'keagamaan'
  | 'bahasa_literasi';

export interface CategoryInfo {
  id: ExtracurricularCategory;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  description: string;
}

export interface ActivityPhoto {
  id: string;
  ekskulId: string;
  ekskulName: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  category: ExtracurricularCategory;
  likesCount: number;
  uploaderName?: string;
  tags?: string[];
}

export interface ScheduleItem {
  day: string;
  time: string;
  location: string;
  notes?: string;
}

export interface CoachInfo {
  name: string;
  title: string;
  avatar?: string;
  phone?: string;
  nip?: string;
}

export interface LeaderInfo {
  name: string;
  classGrade: string;
  avatar?: string;
  phone?: string;
}

export interface Extracurricular {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: ExtracurricularCategory;
  tagline: string;
  description: string;
  vision: string;
  mission: string[];
  logo: string;
  coverImage: string;
  schedule: ScheduleItem[];
  coach: CoachInfo;
  leader: LeaderInfo;
  achievements: { year: string; title: string; rank: string }[];
  requirements: string[];
  quota: number;
  registrationStatus: 'open' | 'closed' | 'coming_soon';
  tags: string[];
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  meetingRoom: string;
  monthlyFee?: string;
  equipmentProvided: string[];
}

export type MemberRole =
  | 'Ketua'
  | 'Wakil Ketua'
  | 'Sekretaris'
  | 'Bendahara'
  | 'Koordinator Divisi'
  | 'Anggota Aktif'
  | 'Calon Anggota'
  | 'Alumni';

export type MemberStatus = 'active' | 'pending' | 'rejected' | 'alumni' | 'inactive';

export interface Member {
  id: string;
  studentId: string; // NISN or NIS
  fullName: string;
  nickname: string;
  classGrade: string; // e.g. "X-MIPA-1", "XI-IPS-2"
  gender: 'L' | 'P';
  email: string;
  phone: string;
  ekskulId: string;
  ekskulName: string;
  role: MemberRole;
  status: MemberStatus;
  joinDate: string;
  avatar: string;
  motivation?: string;
  experience?: string;
  uniformSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  parentConsent?: boolean;
  attendanceScore?: number; // 0-100%
  awards?: string[];
  notes?: string;
}

export interface RegistrationPayload {
  studentId: string;
  fullName: string;
  nickname: string;
  classGrade: string;
  gender: 'L' | 'P';
  email: string;
  phone: string;
  ekskulId: string;
  motivation: string;
  experience: string;
  uniformSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  parentConsent: boolean;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  ekskulId: string;
  date: string;
  title: string;
  presentMemberIds: string[];
  absentMemberIds: string[];
  permissionMemberIds: string[];
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  date: string;
  badge: string;
  content: string;
  ekskulId?: string;
  isImportant?: boolean;
}

export interface CloudflareConfig {
  accountEmail: string;
  accountId?: string;
  apiToken?: string;
  databaseId?: string; // D1 Database name/id
  kvNamespaceId?: string; // KV Namespace
  endpointUrl?: string; // Cloudflare Worker / REST API URL
  lastSyncTime?: string;
  autoSync?: boolean;
  syncStatus?: 'connected' | 'syncing' | 'idle' | 'error';
}

export interface SiteSettings {
  schoolName: string;
  portalTitle: string;
  portalTagline: string;
  logoUrl?: string; // Logo sekolah / portal ekskul untuk landing page, navbar, footer & KTA
  academicYear: string;
  schoolTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroPrimaryBtnText?: string;
  heroSecondaryBtnText?: string;
  heroTheme?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'slate' | 'amber';
  
  // Quick Metrics
  showMetricsBar?: boolean;
  stat1Label?: string;
  stat2Label?: string;
  stat3Label?: string;
  stat4Label?: string;
  stat4Value?: string;

  // Running Announcement Ticker
  showRunningTicker?: boolean;
  runningTickerText?: string;

  // Greeting Section (Kepala Sekolah / Pembina)
  showGreetingSection?: boolean;
  greetingBadge?: string;
  greetingTitle?: string;
  greetingMessage?: string;
  greetingAuthorName?: string;
  greetingAuthorRole?: string;
  greetingAuthorAvatar?: string;

  // Benefits Section
  showBenefitsSection?: boolean;
  benefitsHeading?: string;
  benefitsSubheading?: string;
  benefit1Title?: string;
  benefit1Desc?: string;
  benefit2Title?: string;
  benefit2Desc?: string;
  benefit3Title?: string;
  benefit3Desc?: string;

  // Classes list for registration
  availableClasses?: string[];

  // Contacts & Footer
  contactEmail: string;
  contactPhone: string;
  schoolAddress: string;
  instagramUrl: string;
  youtubeUrl: string;
  footerNote: string;
  allowOnlineRegistration: boolean;
  registrationClosedNotice?: string;
  themeColor: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';

  // KTA (Kartu Tanda Anggota) & Stempel Resmi
  ktaStampImageUrl?: string; // Upload stempel resmi (PNG/JPG transparan)
  ktaStampText?: string;     // Teks stempel (contoh: STEMPEL RESMI SAH)
  ktaSignerName?: string;    // Nama penandatangan / Kepala Sekolah / Pembina
  ktaSignerTitle?: string;   // Jabatan pengesah KTA

  // Cloudflare Database Sync
  cloudflare?: CloudflareConfig;
}

export interface AdminUser {
  username: string;
  name: string;
  role: string;
  email: string;
  lastLogin?: string;
}
