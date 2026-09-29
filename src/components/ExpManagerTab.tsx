import React, { useMemo, useState } from 'react';
import { Award, Plus, Minus, Search, Save, History } from 'lucide-react';
import { Student } from '../types';
import { playClick, playSuccess } from '../utils/audio';

interface ExpManagerTabProps {
  currentRoom: string;
  students: Student[];
  onAdjustExp: (studentId: string, amount: number, reason: string) => void;
}

export const ExpManagerTab: React.FC<ExpManagerTabProps> = ({ currentRoom, students, onAdjustExp }) => {
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('10');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');

  const roomStudents = useMemo(() => students.filter(s => s.room === currentRoom).sort((a,b) => a.number-b.number), [students,currentRoom]);
  const filtered = roomStudents.filter(s => {
    const q=search.trim().toLowerCase();
    return !q || s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.nickname?.toLowerCase().includes(q) || String(s.number).includes(q);
  });
  const selected = students.find(s=>s.id===selectedId) || filtered[0];

  const submit = (sign:number) => {
    const n=Math.abs(Number(amount));
    if (!selected || !Number.isFinite(n) || n<=0 || !reason.trim()) return;
    playClick();
    onAdjustExp(selected.id, sign*n, reason.trim());
    playSuccess();
    setReason('');
  };

  return <div className="space-y-5 max-w-5xl mx-auto">
    <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black"><Award className="w-4 h-4"/>ระบบคะแนน EXP</div><h2 className="text-xl font-black text-slate-800 mt-2">เพิ่ม / ลด EXP นักเรียน</h2><p className="text-xs text-slate-500 mt-1">กำหนดจำนวนแต้มเอง พร้อมบันทึกเหตุผลทุกครั้ง</p></div>
        <div className="text-sm font-black text-slate-600">ห้อง {currentRoom}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <label className="text-xs font-bold text-slate-600">ค้นหานักเรียน
          <div className="relative mt-1"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5" placeholder="ชื่อ / ชื่อเล่น / เลขที่"/></div>
        </label>
        <label className="text-xs font-bold text-slate-600">เลือกนักเรียน
          <select value={selected?.id || ''} onChange={e=>setSelectedId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">{filtered.map(s=><option key={s.id} value={s.id}>{s.number}. {s.firstName} {s.lastName} — {s.exp} EXP</option>)}</select>
        </label>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <div className="text-xs text-slate-500 font-bold">นักเรียนที่เลือก</div>
        <div className="flex items-center justify-between gap-3 mt-1"><div className="font-black text-slate-800">{selected ? `${selected.firstName} ${selected.lastName}` : 'ยังไม่ได้เลือกนักเรียน'}</div><div className="text-2xl font-black text-amber-600">{selected?.exp ?? 0} EXP</div></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <label className="text-xs font-bold text-slate-600">จำนวน EXP
          <input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-black" placeholder="เช่น 10, 25, 50"/>
        </label>
        <label className="text-xs font-bold text-slate-600">เหตุผล
          <input value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="เช่น ช่วยเพื่อน / ส่งงานตรงเวลา / ขาดความรับผิดชอบ"/>
        </label>
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button disabled={!selected || !reason.trim()} onClick={()=>submit(1)} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs disabled:opacity-40 flex items-center gap-2"><Plus className="w-4 h-4"/>เพิ่ม EXP</button>
        <button disabled={!selected || !reason.trim()} onClick={()=>submit(-1)} className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-xs disabled:opacity-40 flex items-center gap-2"><Minus className="w-4 h-4"/>ลด EXP</button>
      </div>
      <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-2"><History className="w-4 h-4"/>ทุกการเปลี่ยนแปลงจะถูกบันทึกลงระบบ Cloud ผ่าน AppState/ActivityLog</div>
    </div>
  </div>;
};