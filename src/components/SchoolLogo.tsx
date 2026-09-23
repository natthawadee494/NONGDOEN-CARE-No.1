import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'badge' | 'full';
  showSubtitle?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const textSizeMap = {
    sm: 'text-[11px]',
    md: 'text-xs sm:text-sm',
    lg: 'text-base sm:text-lg',
    xl: 'text-xl sm:text-2xl',
  };

  if (variant === 'emblem') {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
        <img
          src="/assets/thai_boy_notie.jpg"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }}
          alt="มาสคอตเด็กชายน้องเดิ่น ชุดนักเรียนไทย"
          className={`${sizeMap[size]} object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 rounded-xl`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center p-1 rounded-2xl bg-white border-2 border-rose-300 shadow-sm overflow-hidden">
        <img
          src="/assets/thai_boy_notie.jpg"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }}
          alt="มาสคอตเด็กชายน้องเดิ่น ชุดนักเรียนไทย"
          className={`${sizeMap[size]} object-contain hover:scale-105 transition-transform duration-300`}
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-black tracking-tight text-slate-800 ${textSizeMap[size]}`}>
            NONGDOEN <span className="text-rose-600">CARE</span>
          </span>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200">
            สพป.หนองคาย เขต 1
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
            โรงเรียนหนองเดิ่นศรีเจริญวิทยา
          </p>
        )}
      </div>
    </div>
  );
};
