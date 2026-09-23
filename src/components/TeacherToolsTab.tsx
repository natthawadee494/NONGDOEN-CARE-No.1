import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  Sparkles,
  Users,
  Award,
  Shuffle,
  VolumeX,
  Bell,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { Student } from '../types';
import {
  playAlarm,
  playBell,
  playDing,
  playFanfare,
  playSuccess,
  playClick,
  triggerConfetti,
} from '../utils/audio';

interface TeacherToolsTabProps {
  currentRoom: string;
  students: Student[];
  onRewardExp: (studentId: string, points: number) => void;
}

export const TeacherToolsTab: React.FC<TeacherToolsTabProps> = ({
  currentRoom,
  students,
  onRewardExp,
}) => {
  const roomStudents = students
    .filter((s) => s.room === currentRoom)
    .sort((a, b) => a.number - b.number);

  // 1. Timer State
  const [timerSeconds, setTimerSeconds] = useState(300); // default 5 mins
  const [timerInitial, setTimerInitial] = useState(300);
  const [customMinutes, setCustomMinutes] = useState('5');
  const [customSeconds, setCustomSeconds] = useState('0');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playAlarm();
            triggerConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds]);

  const handleApplyCustomTime = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = Math.max(0, parseInt(customMinutes, 10) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(customSeconds, 10) || 0));
    const total = mins * 60 + secs;
    if (total > 0) {
      playClick();
      setIsRunning(false);
      setTimerInitial(total);
      setTimerSeconds(total);
    }
  };

  const setPresetTime = (totalSecs: number) => {
    playClick();
    setIsRunning(false);
    setTimerInitial(totalSecs);
    setTimerSeconds(totalSecs);
    setCustomMinutes(String(Math.floor(totalSecs / 60)));
    setCustomSeconds(String(totalSecs % 60));
  };

  const addTime = (secs: number) => {
    playClick();
    setTimerSeconds((prev) => {
      const next = Math.max(0, prev + secs);
      setTimerInitial((initial) => Math.max(next, initial));
      return next;
    });
  };

  const resetTimer = () => {
    playClick();
    setIsRunning(false);
    setTimerSeconds(timerInitial);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      timerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // 2. Wheel of Fortune State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Student | null>(null);
  const currentRotationRef = useRef(0);

  const colors = [
    '#f43f5e',
    '#ec4899',
    '#8b5cf6',
    '#3b82f6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#6366f1',
    '#14b8a6',
    '#e11d48',
  ];

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 15;

    ctx.clearRect(0, 0, width, height);

    if (roomStudents.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ไม่มีนักเรียนในห้องนี้', centerX, centerY);
      return;
    }

    const sliceAngle = (Math.PI * 2) / roomStudents.length;

    roomStudents.forEach((std, i) => {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Prompt, sans-serif';
      const label = std.nickname ? `น้อง${std.nickname} (#${std.number})` : `${std.firstName} (#${std.number})`;
      ctx.fillText(label, radius - 20, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center icon/dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [roomStudents]);

  const spinWheel = () => {
    if (isSpinning || roomStudents.length === 0) return;
    setIsSpinning(true);
    setSelectedWinner(null);
    playClick();

    const spinRotations = 5 + Math.random() * 5; // 5 to 10 full turns
    const targetRotation = currentRotationRef.current + spinRotations * Math.PI * 2;
    const duration = 4000;
    const startTime = performance.now();
    const initialRotation = currentRotationRef.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = initialRotation + (targetRotation - initialRotation) * easeOut;
      currentRotationRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate winner
        // The pointer is at the right side (angle 0)
        const sliceAngle = (Math.PI * 2) / roomStudents.length;
        const normalizedAngle = (Math.PI * 2 - (currentAngle % (Math.PI * 2))) % (Math.PI * 2);
        const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % roomStudents.length;
        const winner = roomStudents[winnerIndex];
        setSelectedWinner(winner);
        playFanfare();
        triggerConfetti();
      }
    };

    requestAnimationFrame(animate);
  };

  // 3. Team Randomizer State
  const [teamCount, setTeamCount] = useState(3);
  const [teams, setTeams] = useState<Student[][]>([]);

  const randomizeTeams = () => {
    playSuccess();
    triggerConfetti();
    const shuffled = [...roomStudents].sort(() => Math.random() - 0.5);
    const newTeams: Student[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((std, idx) => {
      newTeams[idx % teamCount].push(std);
    });
    setTeams(newTeams);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            เครื่องมือครูในห้องเรียน
          </span>
          <span className="text-xs font-bold text-slate-500">ห้อง {currentRoom}</span>
        </div>
        <h2 className="text-xl font-black text-slate-800 mt-1">
          นาฬิกาจับเวลา วงล้อสุ่มนักเรียน และกระดานเสียง
        </h2>
        <p className="text-xs text-slate-500">
          อุปกรณ์สำหรับจัดกิจกรรมการเรียนรู้แบบมีส่วนร่วม สร้างความสนุกสนานในห้องเรียน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Classroom Timer & Stopwatch */}
        <div
          ref={timerContainerRef}
          className={`bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-xs flex flex-col justify-between space-y-5 ${
            isFullscreen ? 'fixed inset-0 z-50 p-12 flex flex-col justify-center items-center bg-slate-950 text-white border-0' : ''
          }`}
        >
          <div className="flex items-center justify-between w-full border-b border-pink-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Timer className="w-4 h-4" />
              </div>
              <h3 className={`font-black ${isFullscreen ? 'text-xl text-white' : 'text-slate-800 text-base'}`}>
                นาฬิกาจับเวลาในห้องเรียน
              </h3>
            </div>

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFullscreen
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title="เต็มจอ / ย่อขนาด"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Big Clock Display */}
          <div className="text-center py-6">
            <div
              className={`font-black font-mono tracking-wider tabular-nums ${
                isFullscreen ? 'text-8xl sm:text-9xl text-pink-400' : 'text-6xl sm:text-7xl text-slate-900'
              } drop-shadow-sm`}
            >
              {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
              {String(timerSeconds % 60).padStart(2, '0')}
            </div>
            {timerSeconds === 0 && (
              <span className="inline-block mt-3 px-4 py-1 rounded-full bg-rose-600 text-white font-black text-sm animate-bounce shadow-md">
                หมดเวลาแล้ว! ⏰
              </span>
            )}
          </div>

          {/* Teacher Custom Time Setup Form */}
          <form
            onSubmit={handleApplyCustomTime}
            className={`p-3 rounded-2xl border flex flex-wrap items-center justify-center gap-2 ${
              isFullscreen ? 'bg-slate-900 border-slate-700' : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <span className={`text-xs font-bold ${isFullscreen ? 'text-slate-300' : 'text-slate-700'}`}>
              ตั้งเวลาเอง:
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className={`w-14 px-2 py-1 text-center font-black rounded-lg border text-xs ${
                  isFullscreen
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-white text-slate-800 border-rose-300'
                }`}
                placeholder="นาที"
              />
              <span className={`text-xs font-bold ${isFullscreen ? 'text-slate-300' : 'text-slate-600'}`}>นาที</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(e.target.value)}
                className={`w-14 px-2 py-1 text-center font-black rounded-lg border text-xs ${
                  isFullscreen
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-white text-slate-800 border-rose-300'
                }`}
                placeholder="วินาที"
              />
              <span className={`text-xs font-bold ${isFullscreen ? 'text-slate-300' : 'text-slate-600'}`}>วินาที</span>
            </div>

            <button
              type="submit"
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              ตั้งเวลา
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              onClick={() => setPresetTime(30)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
            >
              30 วิ
            </button>
            <button
              onClick={() => setPresetTime(60)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
            >
              1 นาที
            </button>
            <button
              onClick={() => setPresetTime(120)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
            >
              2 นาที
            </button>
            <button
              onClick={() => setPresetTime(180)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
            >
              3 นาที
            </button>
            <button
              onClick={() => setPresetTime(300)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
            >
              5 นาที
            </button>
            <button
              onClick={() => setPresetTime(600)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
            >
              10 นาที
            </button>
            <button
              onClick={() => addTime(60)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 cursor-pointer"
            >
              +1 นาที
            </button>
            <button
              onClick={() => addTime(30)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 cursor-pointer"
            >
              +30 วิ
            </button>
            <button
              onClick={resetTimer}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold border border-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ต</span>
            </button>
          </div>

          {/* Play / Pause main button */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => {
                playClick();
                setIsRunning(!isRunning);
              }}
              className={`px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isRunning ? 'หยุดชั่วคราว' : 'เริ่มจับเวลา'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Wheel of Fortune / Random Student Picker */}
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-800 text-base">วงล้อสุ่มนักเรียน (Wheel)</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              ผู้ร่วมสุ่ม {roomStudents.length} คน
            </span>
          </div>

          {/* Canvas Wheel with Pointer */}
          <div className="relative flex items-center justify-center py-2">
            {/* Pointer Indicator on Right */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-16 border-r-rose-600 drop-shadow-md" />

            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="rounded-full shadow-md bg-white"
            />
          </div>

          {/* Winner Display */}
          {selectedWinner && (
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 text-white text-center shadow-md animate-in zoom-in-95 space-y-2">
              <span className="text-[11px] font-bold text-pink-200 uppercase tracking-wider block">
                🎉 ยินดีด้วย ผู้โชคดีคือ:
              </span>
              <div className="text-xl font-black">
                {selectedWinner.prefix} {selectedWinner.firstName} {selectedWinner.lastName}{' '}
                {selectedWinner.nickname && `(น้อง${selectedWinner.nickname})`} เลขที่ {selectedWinner.number}
              </div>
              <button
                onClick={() => {
                  playSuccess();
                  triggerConfetti();
                  onRewardExp(selectedWinner.id, 10);
                }}
                className="mt-1 px-4 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-black shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>มอบรางวัลความดี +10 EXP</span>
              </button>
            </div>
          )}

          {/* Spin Button */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={spinWheel}
              disabled={isSpinning || roomStudents.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSpinning ? 'กำลังหมุนวงล้อ...' : 'หมุนวงล้อสุ่มนักเรียน!'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Group / Team Randomizer */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">ระบบสุ่มจัดกลุ่มการเรียนรู้</h3>
              <p className="text-xs text-slate-500">แบ่งนักเรียนในห้อง {currentRoom} ออกเป็นกลุ่มอย่างยุติธรรม</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">จำนวนกลุ่ม:</span>
            <select
              value={teamCount}
              onChange={(e) => setTeamCount(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} กลุ่ม
                </option>
              ))}
            </select>

            <button
              onClick={randomizeTeams}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>สุ่มจัดกลุ่มทันที</span>
            </button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            กดปุ่ม "สุ่มจัดกลุ่มทันที" เพื่อแบ่งกลุ่มนักเรียน {roomStudents.length} คน
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {teams.map((group, idx) => (
              <div
                key={idx}
                className="bg-purple-50/40 border border-purple-200 rounded-2xl p-4 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="font-black text-purple-900 text-sm">
                    กลุ่มที่ {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {group.length} คน
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {group.map((std) => (
                    <div
                      key={std.id}
                      className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-purple-100 shadow-2xs"
                    >
                      <span className="font-bold text-slate-800">
                        #{std.number} {std.prefix} {std.firstName}
                      </span>
                      {std.nickname && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          น้อง{std.nickname}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Soundboard */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">กระดานเสียงประกอบการสอน (Soundboard)</h3>
            <p className="text-xs text-slate-500">คลิกเพื่อเล่นเสียงเอฟเฟกต์สร้างบรรยากาศสนุกสนานในห้องเรียน</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <button
            onClick={() => {
              playBell();
              triggerConfetti();
            }}
            className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs block">🔔 ระฆังเริ่มเรียน</span>
              <span className="text-[10px] text-amber-700">เรียกสมาธินักเรียน</span>
            </div>
          </button>

          <button
            onClick={() => {
              playDing();
              triggerConfetti();
            }}
            className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs block">✅ เสียงถูกต้อง (Ding)</span>
              <span className="text-[10px] text-emerald-700">ตอบคำถามถูกต้อง</span>
            </div>
          </button>

          <button
            onClick={() => {
              playFanfare();
              triggerConfetti();
            }}
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-pink-900 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs block">🎺 ชัยชนะ (Fanfare)</span>
              <span className="text-[10px] text-rose-700">ฉลองชัยชนะกลุ่ม</span>
            </div>
          </button>

          <button
            onClick={() => {
              playAlarm();
            }}
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs block">⏰ เสียงเตือนเวลา</span>
              <span className="text-[10px] text-rose-700">หมดเวลาทำใบงาน</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
