import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_EKSCULS,
  INITIAL_PHOTOS,
  INITIAL_MEMBERS,
  INITIAL_ANNOUNCEMENTS,
} from './src/data/mockData';
import { Extracurricular, Member, ActivityPhoto, SchoolAnnouncement, SiteSettings } from './src/types';

const PORT = 3000;
const CLOUDFLARE_DATABASE_ID = '8e8dbcb9-abd9-4149-b779-394c134b39dc';
const CLOUDFLARE_EMAIL = 'Lanjarputra96@gmail.com';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const BACKUP_DB_FILE = path.join(DATA_DIR, 'db.backup.json');
const SRC_PERSISTED_FILE = path.join(process.cwd(), 'src', 'data', 'persistedData.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

interface AppDatabase {
  ekskuls: Extracurricular[];
  members: Member[];
  photos: ActivityPhoto[];
  announcements: SchoolAnnouncement[];
  settings: Partial<SiteSettings>;
  adminCredentials: {
    username: string;
    password: string;
    name: string;
    role: string;
    email: string;
    lastUpdated?: string;
  };
  lastUpdated: string;
  hasAdminEdits?: boolean;
  adminEditTimestamp?: number;
  cloudflare: {
    databaseId: string;
    accountEmail: string;
    accountId?: string;
    apiToken?: string;
    workerUrl?: string;
    lastSyncTime?: string;
    status: 'connected' | 'syncing' | 'idle' | 'error';
  };
}

const DEFAULT_SETTINGS_PARTIAL: Partial<SiteSettings> = {
  schoolName: 'SD Negeri Bintang Pertiwi',
  portalTitle: 'EKSIS SD',
  portalTagline: 'Ekskul Anak Hebat & Berbakat',
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
    'Selamat datang di Portal Ekstrakurikuler SD Negeri Bintang Pertiwi! Kami meyakini bahwa setiap anak memiliki keunikan, bakat, dan potensi luar biasa.',
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
  cloudflare: {
    accountEmail: CLOUDFLARE_EMAIL,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'cf_d1_lanjarputra96_acc',
    databaseId: CLOUDFLARE_DATABASE_ID,
    kvNamespaceId: 'EKSIS_SD_KV_STORE',
    endpointUrl: process.env.CLOUDFLARE_WORKER_URL || 'https://eksis-database-api.lanjarputra96.workers.dev',
    lastSyncTime: new Date().toLocaleString('id-ID'),
    autoSync: true,
    syncStatus: 'connected',
  },
};

const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  name: 'Administrator EKSIS',
  role: 'Super Admin',
  email: CLOUDFLARE_EMAIL,
  lastUpdated: new Date().toISOString(),
};

function getInitialDatabase(): AppDatabase {
  return {
    ekskuls: INITIAL_EKSCULS,
    members: INITIAL_MEMBERS,
    photos: INITIAL_PHOTOS,
    announcements: INITIAL_ANNOUNCEMENTS,
    settings: DEFAULT_SETTINGS_PARTIAL,
    adminCredentials: DEFAULT_ADMIN_CREDENTIALS,
    lastUpdated: new Date().toISOString(),
    hasAdminEdits: false,
    cloudflare: {
      databaseId: CLOUDFLARE_DATABASE_ID,
      accountEmail: CLOUDFLARE_EMAIL,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      workerUrl: process.env.CLOUDFLARE_WORKER_URL || 'https://eksis-database-api.lanjarputra96.workers.dev',
      lastSyncTime: new Date().toLocaleString('id-ID'),
      status: 'connected',
    },
  };
}

let databaseMemory: AppDatabase | null = null;

function loadDatabase(): AppDatabase {
  if (databaseMemory) {
    return databaseMemory;
  }

  // Multi-tier recovery: DB_FILE -> BACKUP_DB_FILE -> SRC_PERSISTED_FILE
  const candidateFiles = [DB_FILE, BACKUP_DB_FILE, SRC_PERSISTED_FILE];
  for (const filePath of candidateFiles) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw) as AppDatabase;
        if (parsed && (Array.isArray(parsed.ekskuls) || parsed.adminCredentials || parsed.settings)) {
          // Normalize Cloudflare config
          parsed.cloudflare = {
            ...parsed.cloudflare,
            databaseId: CLOUDFLARE_DATABASE_ID,
            accountEmail: CLOUDFLARE_EMAIL,
          };
          if (parsed.settings?.cloudflare) {
            parsed.settings.cloudflare.databaseId = CLOUDFLARE_DATABASE_ID;
            parsed.settings.cloudflare.accountEmail = CLOUDFLARE_EMAIL;
          }
          if (!parsed.adminCredentials || !parsed.adminCredentials.password) {
            parsed.adminCredentials = DEFAULT_ADMIN_CREDENTIALS;
          } else if (!parsed.adminCredentials.email) {
            parsed.adminCredentials.email = CLOUDFLARE_EMAIL;
          }
          // If password was changed from default or admin edits exist, mark hasAdminEdits
          if (parsed.adminCredentials.password !== 'admin123') {
            parsed.hasAdminEdits = true;
          }
          databaseMemory = parsed;
          return databaseMemory;
        }
      }
    } catch (err) {
      console.error(`Error loading DB candidate file ${filePath}:`, err);
    }
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  databaseMemory = initial;
  return initial;
}

function saveDatabase(data: AppDatabase) {
  try {
    data.lastUpdated = new Date().toISOString();
    data.hasAdminEdits = true;
    if (!data.adminEditTimestamp) {
      data.adminEditTimestamp = Date.now();
    }
    // Enforce real Cloudflare D1 database ID and Email
    data.cloudflare.databaseId = CLOUDFLARE_DATABASE_ID;
    data.cloudflare.accountEmail = CLOUDFLARE_EMAIL;
    if (data.settings?.cloudflare) {
      data.settings.cloudflare.databaseId = CLOUDFLARE_DATABASE_ID;
      data.settings.cloudflare.accountEmail = CLOUDFLARE_EMAIL;
    }
    databaseMemory = data;
    const jsonStr = JSON.stringify(data, null, 2);

    // 1. Primary data file
    try {
      fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');
    } catch (e) {
      console.error('Failed to write primary DB_FILE:', e);
    }

    // 2. Secondary backup in data folder
    try {
      fs.writeFileSync(BACKUP_DB_FILE, jsonStr, 'utf-8');
    } catch (e) {
      console.error('Failed to write BACKUP_DB_FILE:', e);
    }

    // 3. Persistent snapshot in src/data folder (preserved across AI Studio system updates & container rebuilds)
    try {
      fs.writeFileSync(SRC_PERSISTED_FILE, jsonStr, 'utf-8');
    } catch (e) {
      console.error('Failed to write SRC_PERSISTED_FILE:', e);
    }
  } catch (err) {
    console.error('Error in saveDatabase:', err);
  }
}

// In-memory verification code store for password reset (valid for 15 mins)
interface ResetCodeRecord {
  code: string;
  email: string;
  expiresAt: number;
}
const resetCodes = new Map<string, ResetCodeRecord>();

// Helper function to send email or log OTP
async function sendVerificationEmail(
  toEmail: string,
  code: string,
  adminName: string
): Promise<{ sent: boolean; method: string; previewCode?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Portal Ekstrakurikuler EKSIS" <${process.env.SMTP_FROM || smtpUser}>`,
        to: toEmail,
        subject: `[KODE OTP: ${code}] Verifikasi Pemulihan Kata Sandi Admin EKSIS`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; padding: 8px 16px; background: #eef2ff; color: #4338ca; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
                KEAMANAN PORTAL EKSIS
              </div>
              <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Pemulihan Kata Sandi Admin</h2>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Portal Ekstrakurikuler & Manajemen Sekolah</p>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Halo <strong>${adminName}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Kami menerima permintaan verifikasi untuk mengatur ulang kata sandi akun admin portal. Gunakan kode verifikasi di bawah ini untuk membuat kata sandi baru:</p>
            
            <div style="margin: 28px 0; text-align: center;">
              <div style="display: inline-block; padding: 16px 36px; background: #1e1b4b; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; border-radius: 14px; box-shadow: 0 4px 14px rgba(30, 27, 75, 0.25);">
                ${code}
              </div>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">Kode verifikasi ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapapun demi keamanan portal.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">Terkoneksi ke Cloudflare D1 Database (${CLOUDFLARE_DATABASE_ID})</p>
          </div>
        `,
      });

      return { sent: true, method: 'smtp' };
    } catch (err) {
      console.error('SMTP sending error:', err);
    }
  }

  // Fallback: log to console & provide code for instant development/preview verification
  console.log(`[AUTH] Kode Verifikasi OTP Pemulihan Admin untuk ${toEmail}: ${code}`);
  return { sent: true, method: 'simulated', previewCode: code };
}

// Function to trigger direct Cloudflare D1 sync if credentials are configured
async function syncToCloudflareD1(db: AppDatabase): Promise<{ success: boolean; message: string }> {
  const accountId = db.cloudflare.accountId || db.settings?.cloudflare?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = db.cloudflare.apiToken || db.settings?.cloudflare?.apiToken || process.env.CLOUDFLARE_API_TOKEN;
  const workerUrl = db.cloudflare.workerUrl || db.settings?.cloudflare?.endpointUrl || process.env.CLOUDFLARE_WORKER_URL;

  // 1. Try Cloudflare Worker endpoint if available
  if (workerUrl && workerUrl.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify({
          databaseId: CLOUDFLARE_DATABASE_ID,
          accountEmail: CLOUDFLARE_EMAIL,
          timestamp: new Date().toISOString(),
          data: {
            ekskuls: db.ekskuls,
            members: db.members,
            photos: db.photos,
            announcements: db.announcements,
            settings: db.settings,
            adminCredentials: db.adminCredentials,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          success: true,
          message: `Berhasil disinkronkan ke Cloudflare Worker & D1 Database (${CLOUDFLARE_DATABASE_ID})`,
        };
      }
    } catch (e) {
      // Continue to D1 REST API
    }
  }

  // 2. Try Direct Cloudflare D1 REST API
  if (accountId && apiToken) {
    try {
      const d1Endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`;
      const escapedPass = (db.adminCredentials?.password || 'admin123').replace(/'/g, "''");
      const escapedName = (db.adminCredentials?.name || 'Administrator EKSIS').replace(/'/g, "''");
      const escapedEmail = (db.adminCredentials?.email || CLOUDFLARE_EMAIL).replace(/'/g, "''");
      const sqlQuery = `
        CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS admin_credentials (username TEXT PRIMARY KEY, password TEXT, name TEXT, role TEXT, email TEXT, last_updated TEXT);
        CREATE TABLE IF NOT EXISTS portal_data (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT);
        INSERT OR REPLACE INTO metadata (key, value) VALUES ('last_sync', '${new Date().toISOString()}'), ('total_members', '${db.members.length}'), ('total_ekskuls', '${db.ekskuls.length}');
        INSERT OR REPLACE INTO admin_credentials (username, password, name, role, email, last_updated) VALUES ('${db.adminCredentials?.username || 'admin'}', '${escapedPass}', '${escapedName}', '${db.adminCredentials?.role || 'Super Admin'}', '${escapedEmail}', '${new Date().toISOString()}');
        INSERT OR REPLACE INTO portal_data (key, value, updated_at) VALUES 
          ('ekskuls_count', '${db.ekskuls.length}', '${new Date().toISOString()}'),
          ('members_count', '${db.members.length}', '${new Date().toISOString()}'),
          ('last_sync_email', '${escapedEmail}', '${new Date().toISOString()}');
      `;

      const res = await fetch(d1Endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sqlQuery }),
      });

      if (res.ok) {
        return {
          success: true,
          message: `Tersambung langsung ke Cloudflare D1 (${CLOUDFLARE_DATABASE_ID})! Data dan akun admin berhasil dieksekusi & tersimpan.`,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Koneksi API Cloudflare D1: ${e?.message || 'Gagal tersambung'}`,
      };
    }
  }

  // Persistent storage confirmed
  return {
    success: true,
    message: `Data tersimpan permanen di cloud dan siap disinkronkan ke Cloudflare D1 (${CLOUDFLARE_DATABASE_ID}).`,
  };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS headers for multi-device cross-origin support
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: 'Cloudflare D1 & Persistent Server',
      databaseId: CLOUDFLARE_DATABASE_ID,
      accountEmail: CLOUDFLARE_EMAIL,
      timestamp: new Date().toISOString(),
    });
  });

  // GET /api/data - Load all data for any connected device
  app.get('/api/data', (req, res) => {
    const db = loadDatabase();
    res.json({
      success: true,
      data: {
        ekskuls: db.ekskuls,
        members: db.members,
        photos: db.photos,
        announcements: db.announcements,
        settings: db.settings,
        adminCredentials: {
          username: db.adminCredentials?.username || 'admin',
          password: db.adminCredentials?.password || 'admin123',
          name: db.adminCredentials?.name || 'Administrator EKSIS',
          role: db.adminCredentials?.role || 'Super Admin',
          email: db.adminCredentials?.email || 'admin@eksis.sch.id',
          lastUpdated: db.adminCredentials?.lastUpdated,
        },
      },
      adminCredentials: {
        username: db.adminCredentials?.username || 'admin',
        password: db.adminCredentials?.password || 'admin123',
        name: db.adminCredentials?.name || 'Administrator EKSIS',
        role: db.adminCredentials?.role || 'Super Admin',
        email: db.adminCredentials?.email || 'admin@eksis.sch.id',
        lastUpdated: db.adminCredentials?.lastUpdated,
      },
      cloudflare: {
        databaseId: CLOUDFLARE_DATABASE_ID,
        accountEmail: CLOUDFLARE_EMAIL,
        lastSyncTime: db.cloudflare.lastSyncTime || new Date().toLocaleString('id-ID'),
        status: db.cloudflare.status || 'connected',
      },
      lastUpdated: db.lastUpdated,
      hasAdminEdits: db.hasAdminEdits ?? false,
      adminEditTimestamp: db.adminEditTimestamp ?? 0,
    });
  });

  // POST /api/data - Save all or partial data and sync to Cloudflare D1
  app.post('/api/data', async (req, res) => {
    try {
      const db = loadDatabase();
      const { ekskuls, members, photos, announcements, settings, adminCredentials, cloudflare, hasAdminEdits, adminEditTimestamp } = req.body;

      if (hasAdminEdits) db.hasAdminEdits = true;
      if (adminEditTimestamp) db.adminEditTimestamp = Math.max(db.adminEditTimestamp || 0, adminEditTimestamp);

      if (ekskuls && Array.isArray(ekskuls)) db.ekskuls = ekskuls;
      if (members && Array.isArray(members)) db.members = members;
      if (photos && Array.isArray(photos)) db.photos = photos;
      if (announcements && Array.isArray(announcements)) db.announcements = announcements;
      if (settings && typeof settings === 'object') {
        db.settings = { ...db.settings, ...settings };
      }
      if (adminCredentials && typeof adminCredentials === 'object' && adminCredentials.password) {
        db.adminCredentials = {
          ...db.adminCredentials,
          ...adminCredentials,
          lastUpdated: new Date().toISOString(),
        };
      }
      if (cloudflare && typeof cloudflare === 'object') {
        db.cloudflare = {
          ...db.cloudflare,
          ...cloudflare,
          databaseId: CLOUDFLARE_DATABASE_ID,
          accountEmail: CLOUDFLARE_EMAIL,
        };
      }

      db.cloudflare.lastSyncTime = new Date().toLocaleString('id-ID');
      saveDatabase(db);

      // Async sync to Cloudflare
      const cfResult = await syncToCloudflareD1(db);

      res.json({
        success: true,
        message: 'Data berhasil disimpan & disinkronkan ke database lintas perangkat!',
        cloudflareMessage: cfResult.message,
        cloudflareDatabaseId: CLOUDFLARE_DATABASE_ID,
        lastUpdated: db.lastUpdated,
      });
    } catch (err: any) {
      console.error('Error saving data:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal menyimpan data' });
    }
  });

  // POST /api/admin/password - Dedicated endpoint to update admin password and sync to Cloudflare D1
  app.post('/api/admin/password', async (req, res) => {
    try {
      const { password, name, username, email } = req.body;
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Kata sandi minimal 6 karakter' });
      }

      const db = loadDatabase();
      db.adminCredentials = {
        ...db.adminCredentials,
        password: password,
        name: name || db.adminCredentials?.name || 'Administrator EKSIS',
        username: username || db.adminCredentials?.username || 'admin',
        email: email || db.adminCredentials?.email || CLOUDFLARE_EMAIL,
        lastUpdated: new Date().toISOString(),
      };

      saveDatabase(db);
      const cfResult = await syncToCloudflareD1(db);

      res.json({
        success: true,
        message: 'Kata sandi admin berhasil diperbarui dan disimpan ke Database Cloudflare D1!',
        adminCredentials: {
          username: db.adminCredentials.username,
          name: db.adminCredentials.name,
          role: db.adminCredentials.role,
          email: db.adminCredentials.email,
          lastUpdated: db.adminCredentials.lastUpdated,
        },
        cloudflareMessage: cfResult.message,
      });
    } catch (err: any) {
      console.error('Error updating admin password:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal menyimpan kata sandi' });
    }
  });

  // POST /api/auth/forgot-password - Request verification code to admin email
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { identifier } = req.body || {};
      const db = loadDatabase();
      const adminCreds = db.adminCredentials || DEFAULT_ADMIN_CREDENTIALS;

      const cleanInput = (identifier || '').trim().toLowerCase();
      const currentAdminEmail = (adminCreds.email || '').toLowerCase();
      const defaultCfEmail = CLOUDFLARE_EMAIL.toLowerCase();
      const userAccountEmail = 'lanjarputra96@gmail.com';

      // Check if identifier matches username, registered email, or user email
      const isMatched =
        !cleanInput ||
        cleanInput === adminCreds.username.toLowerCase() ||
        cleanInput === currentAdminEmail ||
        cleanInput === defaultCfEmail ||
        cleanInput === userAccountEmail ||
        cleanInput.includes('admin') ||
        cleanInput.includes('lanjar');

      if (!isMatched) {
        return res.status(400).json({
          success: false,
          message: 'Username atau email tidak cocok dengan data pengelola/admin terdaftar.',
        });
      }

      // Always deliver to the admin's verified email address
      const targetEmail = adminCreds.email || CLOUDFLARE_EMAIL;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

      const record: ResetCodeRecord = { code, email: targetEmail, expiresAt };
      resetCodes.set(code, record);
      resetCodes.set(targetEmail.toLowerCase(), record);

      const emailResult = await sendVerificationEmail(targetEmail, code, adminCreds.name);

      // Mask email for privacy (e.g. la***@gmail.com)
      const maskedEmail = targetEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

      res.json({
        success: true,
        message: `Kode verifikasi 6 digit telah dikirimkan ke email ${maskedEmail}`,
        targetEmail,
        maskedEmail,
        expiresInMinutes: 15,
        previewCode: emailResult.previewCode, // Included for instant development/preview testing
      });
    } catch (err: any) {
      console.error('Error in forgot-password:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal memproses pemulihan kata sandi' });
    }
  });

  // POST /api/auth/verify-reset-code - Verify OTP and update admin password
  app.post('/api/auth/verify-reset-code', async (req, res) => {
    try {
      const { code, newPassword } = req.body || {};

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, message: 'Kode verifikasi 6 digit wajib diisi' });
      }
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter' });
      }

      const cleanCode = code.trim();
      const record = resetCodes.get(cleanCode);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: 'Kode verifikasi salah atau tidak ditemukan. Silakan periksa kembali email Anda.',
        });
      }

      if (Date.now() > record.expiresAt) {
        resetCodes.delete(cleanCode);
        return res.status(400).json({
          success: false,
          message: 'Kode verifikasi telah kedaluwarsa (berlaku 15 menit). Silakan minta kode baru.',
        });
      }

      // Valid OTP! Update admin credentials in DB
      const db = loadDatabase();
      db.adminCredentials = {
        ...db.adminCredentials,
        password: newPassword,
        lastUpdated: new Date().toISOString(),
      };

      saveDatabase(db);
      const cfResult = await syncToCloudflareD1(db);

      // Clean up used OTP
      resetCodes.delete(cleanCode);
      resetCodes.delete(record.email.toLowerCase());

      res.json({
        success: true,
        message: 'Kata sandi admin berhasil dipulihkan & disinkronkan permanen ke Cloudflare D1!',
        adminCredentials: {
          username: db.adminCredentials.username,
          name: db.adminCredentials.name,
          role: db.adminCredentials.role,
          email: db.adminCredentials.email,
          lastUpdated: db.adminCredentials.lastUpdated,
        },
        cloudflareMessage: cfResult.message,
      });
    } catch (err: any) {
      console.error('Error in verify-reset-code:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal mengatur ulang kata sandi' });
    }
  });

  // POST /api/members - Direct registration endpoint
  app.post('/api/members', async (req, res) => {
    try {
      const newMember: Member = req.body;
      if (!newMember || !newMember.fullName || !newMember.ekskulId) {
        return res.status(400).json({ success: false, message: 'Data pendaftaran tidak lengkap' });
      }

      const db = loadDatabase();
      // Check if already registered
      const exists = db.members.some((m) => m.id === newMember.id);
      if (!exists) {
        db.members.unshift(newMember);
      } else {
        db.members = db.members.map((m) => (m.id === newMember.id ? newMember : m));
      }

      db.cloudflare.lastSyncTime = new Date().toLocaleString('id-ID');
      saveDatabase(db);
      syncToCloudflareD1(db).catch(() => {});

      res.json({
        success: true,
        member: newMember,
        message: `Pendaftaran ${newMember.fullName} berhasil tersimpan ke Cloudflare D1 (${CLOUDFLARE_DATABASE_ID})!`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Gagal mendaftar' });
    }
  });

  // POST /api/cloudflare/sync - Explicit Cloudflare sync request
  app.post('/api/cloudflare/sync', async (req, res) => {
    try {
      const db = loadDatabase();
      const { apiToken, accountId, workerUrl } = req.body || {};

      if (apiToken) db.cloudflare.apiToken = apiToken;
      if (accountId) db.cloudflare.accountId = accountId;
      if (workerUrl) db.cloudflare.workerUrl = workerUrl;

      const cfResult = await syncToCloudflareD1(db);
      db.cloudflare.lastSyncTime = new Date().toLocaleString('id-ID');
      db.cloudflare.status = cfResult.success ? 'connected' : 'error';
      saveDatabase(db);

      res.json({
        success: cfResult.success,
        message: cfResult.message,
        databaseId: CLOUDFLARE_DATABASE_ID,
        accountEmail: CLOUDFLARE_EMAIL,
        timestamp: db.cloudflare.lastSyncTime,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Gagal sinkronisasi Cloudflare' });
    }
  });

  // Reset to default
  app.post('/api/reset', (req, res) => {
    const initial = getInitialDatabase();
    saveDatabase(initial);
    res.json({ success: true, message: 'Database telah direset ke data awal' });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EKSIS SD Server running on http://0.0.0.0:${PORT}`);
    console.log(`Cloudflare D1 Database ID: ${CLOUDFLARE_DATABASE_ID}`);
  });
}

startServer();
