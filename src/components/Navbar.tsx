import React, { useState } from 'react';
import {
  Compass,
  Image as ImageIcon,
  UserPlus,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Search,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Sliders,
  LogOut,
  Lock,
} from 'lucide-react';
import { SchoolAnnouncement, SiteSettings, AdminUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  totalMembersCount: number;
  announcements: SchoolAnnouncement[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenRegister: (ekskulId?: string) => void;
  siteSettings: SiteSettings;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel: () => void;
  onLogoutAdmin: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  announcements,
  searchQuery,
  setSearchQuery,
  onOpenRegister,
  siteSettings,
  isAdmin,
  adminUser,
  onOpenAdminLogin,
  onOpenAdminPanel,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  const navItems: NavItem[] = [
    { id: 'ekskul', label: 'Jelajah Ekskul', icon: Compass },
    { id: 'galeri', label: 'Galeri Foto', icon: ImageIcon },
    { id: 'pendaftaran', label: 'Pendaftaran Online', icon: UserPlus, highlight: true },
    { id: 'jadwal', label: 'Jadwal & Presensi', icon: Calendar },
    { id: 'statistik', label: 'Statistik', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top school bar */}
        <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {siteSettings.academicYear}
              </span>
              <span className="font-medium text-slate-300 hidden sm:inline text-[11px]">
                {siteSettings.schoolTagline || 'Portal Resmi Ekstrakurikuler Siswa'}
              </span>
              <span className="text-slate-400 hidden md:inline text-[11px]">• {siteSettings.schoolName}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <button
                onClick={() => setShowAnnouncementsModal(true)}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] font-medium"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Pengumuman & Prestasi</span>
                {announcements.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>

              {/* Admin status indicator in topbar */}
              {isAdmin && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Admin: {adminUser?.name || 'Aktif'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo Brand */}
            <div
              onClick={() => setActiveTab('ekskul')}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform border border-slate-700/50">
                {siteSettings.portalTitle.charAt(0) || 'E'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 font-display">
                    {siteSettings.portalTitle}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 tracking-wider">
                    {siteSettings.academicYear.replace('TA ', '')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight font-medium line-clamp-1 max-w-[170px] sm:max-w-none">
                  {siteSettings.portalTagline} • {siteSettings.schoolName}
                </p>
              </div>
            </div>

            {/* Global Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari ekskul, anggota, prestasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/70 rounded-xl border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions: Register + Admin Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenRegister()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Daftar Ekskul</span>
              </button>

              {/* Admin Button */}
              {isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onOpenAdminPanel}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    title="Buka Pusat Kontrol Admin untuk mengubah semua isi tampilan"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                  <button
                    onClick={onLogoutAdmin}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Keluar dari Akun Admin"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200/90 text-slate-700 bg-slate-50 hover:bg-white hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
                  title="Login Pengelola / Pembina Ekskul"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Login Admin</span>
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer border border-slate-200/80"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-fadeIn">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ekskul, anggota, foto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenRegister();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Formulir Pendaftaran Online</span>
              </button>

              {isAdmin ? (
                <button
                  onClick={() => {
                    onOpenAdminPanel();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-xs"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Buka Panel Kontrol Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAdminLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 bg-slate-50"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Login Pengelola / Admin Portal</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pengumuman & Agenda Ekskul
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Informasi resmi dari {siteSettings.schoolName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:bg-indigo-50/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowAnnouncementsModal(false);
                    onOpenAdminPanel();
                  }}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Kelola di Panel Admin</span>
                </button>
              )}
              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="ml-auto px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
