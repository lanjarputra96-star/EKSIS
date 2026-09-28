import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  CreditCard,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  AlertCircle,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Member, Extracurricular, MemberRole, MemberStatus, SiteSettings } from '../types';
import { exportMembersToCSV } from '../utils/storage';
import { DigitalIdCard } from './DigitalIdCard';

interface MemberDirectoryProps {
  members: Member[];
  ekskuls: Extracurricular[];
  siteSettings?: SiteSettings;
  isAdmin?: boolean;
  onUpdateMemberStatus: (memberId: string, status: MemberStatus) => void;
  onUpdateMemberRole: (memberId: string, role: MemberRole) => void;
  onDeleteMember: (memberId: string) => void;
  onDeleteMultipleMembers?: (memberIds: string[]) => void;
  onDeleteMembersByEkskul?: (ekskulId: string) => void;
  onDeleteAllMembers?: () => void;
  onAddManualMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
}

const ROLES: MemberRole[] = [
  'Ketua',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Koordinator Divisi',
  'Anggota Aktif',
  'Calon Anggota',
  'Alumni',
];

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  ekskuls,
  siteSettings,
  isAdmin = false,
  onUpdateMemberStatus,
  onUpdateMemberRole,
  onDeleteMember,
  onDeleteMultipleMembers,
  onDeleteMembersByEkskul,
  onDeleteAllMembers,
  onAddManualMember,
  onEditMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEkskul, setSelectedEkskul] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Bulk selection state (Admin)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeleteByEkskulModal, setShowDeleteByEkskulModal] = useState(false);
  const [selectedEkskulForBulkDelete, setSelectedEkskulForBulkDelete] = useState<string>(ekskuls[0]?.id || '');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [memberToDeleteSingle, setMemberToDeleteSingle] = useState<Member | null>(null);

  // New manual member state
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    nickname: '',
    studentId: '',
    classGrade: 'X MIPA 1',
    gender: 'L' as 'L' | 'P',
    phone: '',
    email: '',
    ekskulId: ekskuls[0]?.id || '',
    role: 'Anggota Aktif' as MemberRole,
    status: 'active' as MemberStatus,
    uniformSize: 'M' as const,
  });

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.studentId.includes(searchQuery) ||
      m.phone.includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEkskul = selectedEkskul === 'all' || m.ekskulId === selectedEkskul;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || m.role === selectedRole;
    const matchesClass =
      selectedClass === 'all' || m.classGrade.startsWith(selectedClass);

    return matchesSearch && matchesEkskul && matchesStatus && matchesRole && matchesClass;
  });

  const allVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.includes(m.id));

  const someVisibleSelected =
    filteredMembers.some((m) => selectedMemberIds.includes(m.id)) && !allVisibleSelected;

  const handleToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIdSet = new Set(filteredMembers.map((m) => m.id));
      setSelectedMemberIds(selectedMemberIds.filter((id) => !visibleIdSet.has(id)));
    } else {
      const visibleIds = filteredMembers.map((m) => m.id);
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

  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const activeCount = members.filter((m) => m.status === 'active').length;

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.fullName || !newMemberForm.studentId) return;

    const targetEkskul = ekskuls.find((e) => e.id === newMemberForm.ekskulId);

    const created: Member = {
      id: `mbr-${Date.now()}`,
      studentId: newMemberForm.studentId,
      fullName: newMemberForm.fullName,
      nickname: newMemberForm.nickname || newMemberForm.fullName.split(' ')[0],
      classGrade: newMemberForm.classGrade,
      gender: newMemberForm.gender,
      email: newMemberForm.email || 'siswa@sekolah.sch.id',
      phone: newMemberForm.phone || '0812-3456-7890',
      ekskulId: newMemberForm.ekskulId,
      ekskulName: targetEkskul ? targetEkskul.shortName : 'Ekskul',
      role: newMemberForm.role,
      status: newMemberForm.status,
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      avatar:
        newMemberForm.gender === 'P'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      uniformSize: newMemberForm.uniformSize,
      parentConsent: true,
      attendanceScore: 100,
    };

    onAddManualMember(created);
    setShowAddModal(false);
    setNewMemberForm({
      fullName: '',
      nickname: '',
      studentId: '',
      classGrade: 'X MIPA 1',
      gender: 'L',
      phone: '',
      email: '',
      ekskulId: ekskuls[0]?.id || '',
      role: 'Anggota Aktif',
      status: 'active',
      uniformSize: 'M',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onEditMember(editingMember);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Database Siswa & Pengurus</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Data Anggota Ekstrakurikuler
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Kelola verifikasi pendaftar baru, penugasan jabatan, dan cetak Kartu Tanda Anggota (KTA).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportMembersToCSV(filteredMembers)}
            className="px-3.5 py-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV / Excel</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'all'
              ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 block">Total Seluruh Anggota</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{members.length}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('active')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'active'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-700 block">Anggota Aktif & Pengurus</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{activeCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
            selectedStatus === 'pending'
              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-700 block flex items-center gap-1">
            Pendaftar Baru
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{pendingCount}</span>
        </div>

        <div
          onClick={() => setSelectedRole('Ketua')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedRole === 'Ketua'
              ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-semibold text-purple-700 block">Ketua & Koordinator</span>
          <span className="text-2xl font-black text-purple-800 mt-1 block">
            {members.filter((m) => m.role.includes('Ketua') || m.role.includes('Koordinator')).length}
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NISN, WhatsApp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Ekskul */}
          <div>
            <select
              value={selectedEkskul}
              onChange={(e) => setSelectedEkskul(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            >
              <option value="all">Semua Cabang Ekskul</option>
              {ekskuls.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="pending">Menunggu Konfirmasi (Pending)</option>
              <option value="rejected">Ditolak</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                viewMode === 'table' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                viewMode === 'grid' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
              title="Tampilan Kartu Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Bulk Management Bar */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <span>Pilih Semua ({filteredMembers.length} Siswa Tampil)</span>
            </label>

            {selectedMemberIds.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {selectedMemberIds.length} Siswa Terpilih
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedMemberIds.length > 0 && (
              <>
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
                  className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal Pilih
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                if (ekskuls.length > 0 && !selectedEkskulForBulkDelete) {
                  setSelectedEkskulForBulkDelete(ekskuls[0].id);
                }
                setShowDeleteByEkskulModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Hapus seluruh anggota pada cabang ekskul tertentu"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Hapus Per Ekskul</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteAllModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Hapus seluruh data anggota siswa di sekolah"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Seluruhnya</span>
            </button>
          </div>
        </div>
      )}

      {/* Members List Table or Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Tidak ada data anggota yang sesuai
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Coba sesuaikan kata kunci pencarian atau filter status untuk melihat data anggota lainnya.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedEkskul('all');
              setSelectedStatus('all');
              setSelectedRole('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  {isAdmin && (
                    <th className="w-10 px-3 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someVisibleSelected;
                        }}
                        onChange={handleToggleSelectAllVisible}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        aria-label="Pilih Semua"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3.5">Anggota</th>
                  <th className="px-4 py-3.5">NISN & Kelas</th>
                  <th className="px-4 py-3.5">Ekskul</th>
                  <th className="px-4 py-3.5">Jabatan / Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Kontak</th>
                  <th className="px-4 py-3.5 text-right">Aksi & KTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      {isAdmin && (
                        <td className="w-10 px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectMember(member.id)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            aria-label={`Pilih ${member.fullName}`}
                          />
                        </td>
                      )}
                      {/* Member profile */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">
                              {member.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Panggilan: {member.nickname} ({member.gender === 'L' ? 'L' : 'P'})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NISN & Class */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 block">
                          {member.classGrade}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {member.studentId}
                        </span>
                      </td>

                      {/* Ekskul */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {member.ekskulName}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <select
                            value={member.role}
                            onChange={(e) =>
                              onUpdateMemberRole(member.id, e.target.value as MemberRole)
                            }
                            className="py-1 px-2 text-[11px] font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {member.role}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {member.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        ) : member.status === 'pending' ? (
                          isAdmin ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onUpdateMemberStatus(member.id, 'active')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Terima Siswa"
                              >
                                <Check className="w-3 h-3" />
                                <span>Terima</span>
                              </button>
                              <button
                                onClick={() => onUpdateMemberStatus(member.id, 'rejected')}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Tolak"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              <span>Menunggu</span>
                            </span>
                          )
                        ) : member.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <X className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            {member.status}
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-700 block font-medium">
                          {member.phone}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                          {member.email}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedMemberForCard(member)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Lihat & Cetak KTA Digital"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Data"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteMember(member.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isSelected = selectedMemberIds.includes(member.id);
            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                  isSelected ? 'border-indigo-400 ring-1 ring-indigo-300 bg-indigo-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectMember(member.id)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0 mt-1"
                      aria-label={`Pilih ${member.fullName}`}
                    />
                  )}
                  <img
                    src={member.avatar}
                    alt={member.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {member.ekskulName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : member.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {member.status === 'active'
                        ? 'Aktif'
                        : member.status === 'pending'
                        ? 'Pending'
                        : 'Ditolak'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-1">
                    {member.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {member.classGrade} • NISN: {member.studentId}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Jabatan:</span>
                  <span className="font-bold text-slate-800">{member.role}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-medium text-slate-700">{member.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedMemberForCard(member)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>KTA Digital</span>
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {member.status === 'pending' && (
                      <button
                        onClick={() => onUpdateMemberStatus(member.id, 'active')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        Terima
                      </button>
                    )}
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal Digital ID Card View */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Kartu Tanda Anggota Resmi</span>
              </h3>
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DigitalIdCard
              member={selectedMemberForCard}
              siteSettings={siteSettings}
              onClose={() => setSelectedMemberForCard(null)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Member */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Edit Data Anggota Ekskul
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editingMember.fullName}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={editingMember.classGrade}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, classGrade: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jabatan / Role
                  </label>
                  <select
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value as MemberRole })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Status Keanggotaan
                </label>
                <select
                  value={editingMember.status}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      status: e.target.value as MemberStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Ditolak</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  value={editingMember.phone}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Manual Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Tambah Anggota Ekskul Manual</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap siswa"
                  value={newMemberForm.fullName}
                  onChange={(e) =>
                    setNewMemberForm({ ...newMemberForm, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NISN / NIS *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="20261100"
                    value={newMemberForm.studentId}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    placeholder="X MIPA 1"
                    value={newMemberForm.classGrade}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, classGrade: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Cabang Ekskul *
                  </label>
                  <select
                    value={newMemberForm.ekskulId}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, ekskulId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {ekskuls.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jabatan
                  </label>
                  <select
                    value={newMemberForm.role}
                    onChange={(e) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        role: e.target.value as MemberRole,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newMemberForm.phone}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Gender
                  </label>
                  <select
                    value={newMemberForm.gender}
                    onChange={(e) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        gender: e.target.value as 'L' | 'P',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
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
              <strong>PERHATIAN:</strong> Tindakan ini akan menghapus <strong>seluruh data siswa ({members.length} siswa)</strong> dari seluruh cabang ekstrakurikuler di sistem. Data yang dihapus akan segera disinkronkan ke Cloudflare.
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
    </div>
  );
};
