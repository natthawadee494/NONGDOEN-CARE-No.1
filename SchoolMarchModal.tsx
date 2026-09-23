import React, { useState } from 'react';
import { Music, Play, ExternalLink, Sparkles, Youtube, Volume2 } from 'lucide-react';
import { playClick, triggerConfetti } from '../utils/audio';

interface SchoolMarchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolMarchModal: React.FC<SchoolMarchModalProps> = ({ isOpen, onClose }) => {
  const [loadVideo, setLoadVideo] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border-2 border-rose-300 p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
              <img
                src="/assets/thai_boy_notie.jpg"
                alt="มาสคอตเด็กชายน้องเดิ่น"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-slate-800 text-base leading-tight">เพลงมาร์ชประจำโรงเรียน</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                  ต้นฉบับ
                </span>
              </div>
              <p className="text-[11px] text-rose-600 font-bold">โรงเรียนหนองเดิ่นศรีเจริญวิทยา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Embedded Official YouTube Player */}
        <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-rose-200 bg-slate-900 aspect-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/dIbxG5p1oD8?autoplay=1&rel=0"
            title="เพลงมาร์ชโรงเรียนหนองเดิ่นศรีเจริญวิทยา"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Action Buttons: Direct YouTube & School Channel */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://youtu.be/dIbxG5p1oD8?si=S3a5_xn4YgCNiILO"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              playClick();
              triggerConfetti();
            }}
            className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
          >
            <Youtube className="w-4 h-4 shrink-0" />
            <span className="truncate">ดูบน YouTube</span>
            <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
          </a>

          <a
            href="https://youtube.com/@nongdoen473?si=8eBwG6yslxnSZ2Mn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <Youtube className="w-4 h-4 text-red-600 shrink-0" />
            <span className="truncate">ช่อง @nongdoen473</span>
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
          </a>
        </div>

        {/* Lyrics */}
        <div className="space-y-2.5 bg-rose-50/40 p-4 rounded-2xl border border-rose-200 text-xs text-slate-700 leading-relaxed text-center font-medium">
          <div className="flex items-center justify-center gap-1.5 text-rose-700 font-black text-xs uppercase tracking-wider mb-1">
            <Music className="w-3.5 h-3.5" />
            <span>เนื้อร้องเพลงมาร์ชหนองเดิ่นศรีเจริญวิทยา</span>
          </div>

          <div className="space-y-1.5 text-slate-800 font-semibold">
            <p className="font-bold text-slate-900">
              หนองเดิ่นศรีเจริญวิทยา สถาบันเลิศล้ำนำวิชาการ
            </p>
            <p>สร้างศิษย์เชิดชูคุณธรรม ดั่งสายธารหล่อเลี้ยงชีวี</p>
            <p>สีชมพูดำสง่า เด่นตระการในดวงฤทัย</p>
            <p>มุ่งมั่นการศึกษา ก้าวไกล สู่สากลด้วยใจภักดี</p>
          </div>

          <div className="pt-2 border-t border-rose-200/80 space-y-1.5 text-rose-700 font-bold">
            <p>รักชาติ ศาสน์ กษัตริย์ เทิดทูนไว้ มั่นคงในวินัย ใฝ่เรียนรู้</p>
            <p>หนองเดิ่นศรีเจริญวิทยา อยู่คู่ แดนอีสานสืบไปชั่วกาลนาน</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>สีประจำโรงเรียน: ชมพู - ดำ</span>
          <span>สพป.หนองคาย เขต 1</span>
        </div>
      </div>
    </div>
  );
};
