import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Sparkles,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Student, StudentStatus } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';
import { downloadCsvFile } from '../utils/googleSheets';

interface StudentsTabProps {
  currentRoom: string;
  students: Student[];
  onAddStudent: (std: Student) => void;
  onUpdateStudent: (std: Student) => void;
  onDeleteStudent: (id: string) => void;
  onClearRoomStudents: (room: string) => void;
  onOpenStudentDetail: (std: Student) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  currentRoom,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onClearRoomStudents,
  onOpenStudentDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // New student form state
  const [newPrefix, setNewPrefix] = useState('เด็กชาย');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newNumber, setNewNumber] = useState<number>(() => {
    const cur = students.filter((s) => s.room === currentRoom);
    return cur.length + 1;
  });
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState<StudentStatus>('normal');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const roomStudents = students
    .filter((s) => s.room === currentRoom)
    .sort((a, b) => a.number - b.number);

  const maleCount = roomStudents.filter((s) => s.prefix.includes('ชาย') || s.prefix.includes('นาย')).length;
  const femaleCount = roomStudents.filter((s) => s.prefix.includes('หญิง') || s.prefix.includes('นาง')).length;
  const riskCount = roomStudents.filter((s) => s.status === 'risk' || s.status === 'special_care').length;

  const filteredStudents = roomStudents.filter((std) => {
    if (statusFilter !== 'all' && std.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      std.firstName.toLowerCase().includes(q) ||
      std.lastName.toLowerCase().includes(q) ||
      std.nickname?.toLowerCase().includes(q) ||
      String(std.number).includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) return;

    const std: Student = {
      id: `std-${currentRoom.replace(/[^a-z0-9]/gi, '')}-${Date.now()}`,
      prefix: newPrefix,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      nickname: newNickname.trim(),
      room: currentRoom,
      number: Number(newNumber) || roomStudents.length + 1,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      status: newStatus,
      exp: 100,
      avatarUrl: newAvatarUrl.trim() || undefined,
    };

    onAddStudent(std);
    setIsAddModalOpen(false);
    playSuccess();
    triggerConfetti();

    // Reset
    setNewFirstName('');
    setNewLastName('');
    setNewNickname('');
    setNewPhone('');
    setNewEmail('');
    setNewAvatarUrl('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onUpdateStudent(editingStudent);
    setEditingStudent(null);
    playSuccess();
  };

  const handleExportCsv = () => {
    playClick();
    const headers = ['Number', 'Prefix', 'FirstName', 'LastName', 'Nickname', 'Room', 'Phone', 'Email', 'Status', 'EXP'];
    const rows = roomStudents.map((s) => [
      s.number,
      `"${s.prefix}"`,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      `"${s.nickname || ''}"`,
      `"${s.room}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.status}"`,
      s.exp || 100,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');
    downloadCsvFile(csv, `students-${currentRoom}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleClearRoom = () => {
    if (window.confirm(`ยืนยันการล้างข้อมูลนักเรียนทั้งหมดในห้อง ${currentRoom} หรือไม่?`)) {
      playClick();
      onClearRoomStudents(currentRoom);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                ทะเบียนนักเรียน (เพิ่ม/ลบ)
              </span>
              <span className="text-xs font-bold text-slate-500">ห้อง {currentRoom}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-1">
              ทำเนียบรายชื่อนักเรียนและข้อมูลการดูแลช่วยเหลือ
            </h2>
            <p className="text-xs text-slate-500">
              เพิ่มรายชื่อ แก้ไขข้อมูล จัดการกลุ่มเสี่ยง และดาวน์โหลดทะเบียนนักเรียน
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                playClick();
                setNewNumber(roomStudents.length + 1);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มนักเรียนใหม่</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>ส่งออก CSV</span>
            </button>

            <button
              onClick={handleClearRoom}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200"
              title="ล้างข้อมูลนักเรียนทั้งห้อง"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">ล้างห้อง</span>
            </button>
          </div>
        </div>

        {/* Stats and filter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-rose-700 block">นักเรียนทั้งหมด</span>
            <span className="text-2xl font-black text-rose-800">{roomStudents.length}</span>
            <span className="text-[10px] text-rose-600 block">คน</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-blue-700 block">นักเรียนชาย</span>
            <span className="text-2xl font-black text-blue-800">{maleCount}</span>
            <span className="text-[10px] text-blue-600 block">คน</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-rose-700 block">นักเรียนหญิง</span>
            <span className="text-2xl font-black text-rose-800">{femaleCount}</span>
            <span className="text-[10px] text-rose-600 block">คน</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-700 block">กลุ่มเฝ้าระวัง/พิเศษ</span>
            <span className="text-2xl font-black text-amber-800">{riskCount}</span>
            <span className="text-[10px] text-amber-600 block">คน</span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="font-bold text-slate-600">สถานะการดูแล:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setStatusFilter('normal')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'normal'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ทั่วไป
            </button>
            <button
              onClick={() => setStatusFilter('risk')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'risk'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              กลุ่มเสี่ยง
            </button>
            <button
              onClick={() => setStatusFilter('special_care')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'special_care'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              ดูแลพิเศษ
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, นามสกุล, หรือเลขที่..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Students List Table */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-rose-50/70 border-b border-pink-100 text-slate-700 font-black">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">เลขที่</th>
                <th className="py-3.5 px-4 min-w-[200px]">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-4 w-24 text-center">ชื่อเล่น</th>
                <th className="py-3.5 px-4 min-w-[140px]">เบอร์โทรติดต่อ</th>
                <th className="py-3.5 px-4 min-w-[160px]">อีเมล</th>
                <th className="py-3.5 px-4 w-28 text-center">สถานะดูแล</th>
                <th className="py-3.5 px-4 w-24 text-center">แต้ม EXP</th>
                <th className="py-3.5 px-4 w-28 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    ไม่พบข้อมูลนักเรียนตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-3 px-4 text-center font-black text-rose-600">
                      {std.number}
                    </td>

                    <td className="py-3 px-4">
                      <div
                        onClick={() => onOpenStudentDetail(std)}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-rose-200 group-hover:scale-105 transition-transform">
                          {std.avatarUrl ? (
                            <img src={std.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            std.firstName.slice(0, 1)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block group-hover:text-rose-600 transition-colors">
                            {std.prefix} {std.firstName} {std.lastName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {std.nickname ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                          น้อง{std.nickname}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {std.phone ? (
                        <a
                          href={`tel:${std.phone}`}
                          className="inline-flex items-center gap-1 hover:text-rose-600"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{std.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {std.email ? (
                        <a
                          href={`mailto:${std.email}`}
                          className="inline-flex items-center gap-1 hover:text-rose-600 truncate max-w-[150px]"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{std.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {std.status === 'risk' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                          กลุ่มเสี่ยง
                        </span>
                      ) : std.status === 'special_care' ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-300">
                          ดูแลพิเศษ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                          ทั่วไป
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-amber-600">
                      {std.exp || 100} ⭐
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingStudent(std)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขข้อมูลนักเรียน"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบนักเรียน ${std.prefix} ${std.firstName} ${std.lastName} ออกจากระบบ?`)) {
                              playClick();
                              onDeleteStudent(std.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบนักเรียน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">เพิ่มนักเรียนใหม่ (ชั้น {currentRoom})</h3>
                  <p className="text-xs text-slate-500">บันทึกข้อมูลเข้าสู่ระบบ NONGDOEN CARE</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">คำนำหน้า: *</label>
                  <select
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  >
                    <option value="เด็กชาย">เด็กชาย (ด.ช.)</option>
                    <option value="เด็กหญิง">เด็กหญิง (ด.ญ.)</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">ชื่อจริง: *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="เช่น ธนภัทร"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">นามสกุล: *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="เช่น บัวระพา"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">ชื่อเล่น:</label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="เช่น โฟกัส"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">เลขที่: *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newNumber}
                    onChange={(e) => setNewNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">สถานะการดูแล: *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StudentStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  >
                    <option value="normal">ทั่วไป (Normal)</option>
                    <option value="risk">กลุ่มเสี่ยง (Risk)</option>
                    <option value="special_care">ดูแลพิเศษ (Special Care)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">เบอร์โทรติดต่อผู้ปกครอง:</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">อีเมลนักเรียน/ผู้ปกครอง:</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="student@nsw.ac.th"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกนักเรียน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">แก้ไขข้อมูลนักเรียน</h3>
                  <p className="text-xs text-slate-500">
                    เลขที่ {editingStudent.number} - {editingStudent.firstName} {editingStudent.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">คำนำหน้า:</label>
                  <input
                    type="text"
                    value={editingStudent.prefix}
                    onChange={(e) => setEditingStudent({ ...editingStudent, prefix: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">ชื่อจริง: *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.firstName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">นามสกุล: *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.lastName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">ชื่อเล่น:</label>
                  <input
                    type="text"
                    value={editingStudent.nickname}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nickname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">เลขที่: *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingStudent.number}
                    onChange={(e) => setEditingStudent({ ...editingStudent, number: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">สถานะการดูแล: *</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as StudentStatus })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  >
                    <option value="normal">ทั่วไป (Normal)</option>
                    <option value="risk">กลุ่มเสี่ยง (Risk)</option>
                    <option value="special_care">ดูแลพิเศษ (Special Care)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">เบอร์โทรศัพท์:</label>
                  <input
                    type="tel"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">อีเมล:</label>
                  <input
                    type="email"
                    value={editingStudent.email || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
