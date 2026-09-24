import React, { useEffect, useMemo, useState } from 'react';
import { Share2, Copy, Check, Send, MessageCircle, RefreshCw } from 'lucide-react';
import { Assignment, AttendanceRecord, Student, Submission, LineChat } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';
import { loadLineChats, sendLineMessage, loadLineTemplate, saveLineTemplate } from '../utils/cloudSync';

interface LineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: string;
  todayDate: string;
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: Submission[];
}

export const LineModal: React.FC<LineModalProps> = ({
  isOpen, onClose, currentRoom, todayDate, students, attendance, assignments, submissions,
}) => {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [templateType, setTemplateType] = useState<'attendance'|'homework'>('attendance');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<LineChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState('');

  const roomStudents = useMemo(() => students.filter(s => s.room === currentRoom).sort((a,b) => a.number-b.number), [students,currentRoom]);
  const getAttendanceStatus = (id:string) => attendance.find(a => a.studentId===id && a.room===currentRoom && a.date===todayDate)?.status || 'มา';
  const presentList = roomStudents.filter(s => getAttendanceStatus(s.id)==='มา');
  const lateList = roomStudents.filter(s => getAttendanceStatus(s.id)==='สาย');
  const leaveList = roomStudents.filter(s => getAttendanceStatus(s.id)==='ลา');
  const absentList = roomStudents.filter(s => getAttendanceStatus(s.id)==='ขาด');

  const attendanceText = `📢 [รายงานผลการเช็กชื่อประจำวัน]
🏫 โรงเรียนหนองเดิ่นศรีเจริญวิทยา
📅 ประจำวันที่ ${new Date(todayDate).toLocaleDateString('th-TH',{dateStyle:'long'})}
ชั้น ${currentRoom} (รวม ${roomStudents.length} คน)
------------------------------
✅ มาเรียน: ${presentList.length} คน
⏰ มาสาย: ${lateList.length} คน ${lateList.length ? `(${lateList.map(s=>s.nickname||s.firstName).join(', ')})` : ''}
🏥 ลา: ${leaveList.length} คน ${leaveList.length ? `(${leaveList.map(s=>s.nickname||s.firstName).join(', ')})` : ''}
❌ ขาดเรียน: ${absentList.length} คน ${absentList.length ? `(${absentList.map(s=>s.nickname||s.firstName).join(', ')})` : ''}
------------------------------
ผู้ปกครองสามารถตรวจสอบรายละเอียดได้ที่ระบบ NONGDOEN CARE`;

  const activeAsg = assignments.find(a => a.room===currentRoom || a.room==='ทุกห้อง');
  const pendingStudents = activeAsg ? roomStudents.filter(s => {
    const sub = submissions.find(x => x.assignmentId===activeAsg.id && x.studentId===s.id);
    return !sub || (sub.status!=='submitted' && sub.status!=='graded');
  }) : [];

  const homeworkText = `📚 [แจ้งเตือนการบ้านและภาระงาน]
🏫 โรงเรียนหนองเดิ่นศรีเจริญวิทยา ชั้น ${currentRoom}
📝 วิชา: ${activeAsg?.subject || 'การบ้าน'}
หัวข้อ: ${activeAsg?.title || 'แบบฝึกหัด'}
⏰ กำหนดส่ง: ${activeAsg?.dueDate || todayDate}
------------------------------
⚠️ นักเรียนที่ยังค้างส่ง (${pendingStudents.length} คน):
${pendingStudents.length===0 ? '✨ ยอดเยี่ยมมาก ส่งครบทุกคนแล้ว!' : pendingStudents.map(s=>`• เลขที่ ${s.number} ${s.prefix} ${s.firstName} (${s.nickname||''})`).join('\n')}
------------------------------
กรุณาส่งงานหรืออัปโหลดรูปภาพผ่านระบบ NONGDOEN CARE ครับ`;

  useEffect(() => {
    if (!isOpen) return;
    const generated = templateType==='attendance' ? attendanceText : homeworkText;
    setMessage(loadLineTemplate(templateType) || generated);
  }, [isOpen, templateType, attendanceText, homeworkText]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingChats(true);
    loadLineChats().then(list => {
      setChats(list);
      if (!selectedChatId && list[0]) setSelectedChatId(list[0].id);
    }).finally(() => setLoadingChats(false));
  }, [isOpen, selectedChatId]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true); playSuccess(); triggerConfetti();
    setTimeout(()=>setCopied(false),2500);
  };

  const handleSend = async () => {
    if (!selectedChatId) {
      alert('กรุณาเลือกห้องแชท LINE ก่อน');
      return;
    }
    if (!message.trim()) return;
    setSending(true);
    const ok = await sendLineMessage(selectedChatId, message);
    setSending(false);
    if (!ok) {
      alert('ส่ง LINE ไม่สำเร็จ กรุณาตรวจสอบ LINE OA / Messaging API / Webhook');
      return;
    }
    playSuccess();
    alert('ส่งข้อความเข้า LINE แล้ว');
  };

  const handleShareLine = () => {
    playClick();
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(message)}`, '_blank');
  };

  const handleSaveTemplate = async () => {
    await saveLineTemplate(templateType, message);
    playSuccess();
    alert('บันทึกข้อความแม่แบบนี้ไว้ในเครื่องแล้ว');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center"><Share2 className="w-5 h-5"/></div>
            <div><h3 className="font-black text-slate-800 text-base">แจ้งเตือนเข้า LINE</h3><p className="text-xs text-slate-500">เลือกแชท แก้ข้อความ แล้วส่งจาก NONGDOEN CARE ได้เลย</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button onClick={()=>{playClick();setTemplateType('attendance')}} className={`py-2 rounded-xl ${templateType==='attendance'?'bg-white text-emerald-700 shadow-xs':'text-slate-600'}`}>สรุปเช็กชื่อ</button>
          <button onClick={()=>{playClick();setTemplateType('homework')}} className={`py-2 rounded-xl ${templateType==='homework'?'bg-white text-emerald-700 shadow-xs':'text-slate-600'}`}>การบ้านค้างส่ง</button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">ส่งไปยังแชท LINE:</label>
            <button onClick={()=>{setLoadingChats(true);loadLineChats().then(setChats).finally(()=>setLoadingChats(false))}} className="text-xs text-emerald-700 font-bold flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5"/>รีเฟรช</button>
          </div>
          <select value={selectedChatId} onChange={e=>setSelectedChatId(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold">
            <option value="">{loadingChats ? 'กำลังโหลดแชท...' : chats.length ? 'เลือกห้องแชท' : 'ยังไม่มีแชทที่เชื่อมกับ LINE OA'}</option>
            {chats.map(chat=><option key={chat.id} value={chat.id}>{chat.name} ({chat.type})</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">ข้อความที่จะส่ง (แก้ได้):</label>
          <textarea rows={12} value={message} onChange={e=>setMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-mono leading-relaxed focus:outline-hidden resize-y shadow-inner"/>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button onClick={handleSaveTemplate} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs">บันทึกแม่แบบ</button>
          <button onClick={handleCopy} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5">{copied?<Check className="w-4 h-4 text-emerald-600"/>:<Copy className="w-4 h-4"/>}{copied?'คัดลอกแล้ว':'คัดลอก'}</button>
          <button onClick={handleShareLine} className="px-4 py-2.5 rounded-xl border border-emerald-500 text-emerald-700 font-bold text-xs flex items-center gap-1.5"><MessageCircle className="w-4 h-4"/>เปิด LINE</button>
          <button onClick={handleSend} disabled={sending || !selectedChatId} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-1.5"><Send className="w-4 h-4"/>{sending?'กำลังส่ง...':'ส่งเข้าแชทที่เลือก'}</button>
        </div>
      </div>
    </div>
  );
};
