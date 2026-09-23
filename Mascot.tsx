import React from 'react';

interface MascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'logo' | 'mascot' | 'app_profile';
}

export const Mascot: React.FC<MascotProps> = ({
  className = '',
  size = 'md',
  variant = 'mascot',
}) => {
  if (variant === 'logo' || variant === 'app_profile') {
    const minWidth =
      size === 'sm' ? '80px' : size === 'md' ? '125px' : size === 'lg' ? '170px' : '220px';
    const textSize =
      size === 'sm'
        ? 'text-[10px]'
        : size === 'md'
        ? 'text-xs'
        : size === 'lg'
        ? 'text-base'
        : 'text-xl';

    return (
      <div
        className={`relative shrink-0 flex items-center justify-center font-black rounded-2xl bg-white border-2 border-pink-400 shadow-xs select-none px-2 py-1 transition-all ${className}`}
        style={{ minWidth }}
      >
        <div className="flex flex-col items-center justify-center leading-none text-center">
          <span className={`font-black tracking-tight text-slate-700 ${textSize}`}>
            NONGDOEN <span className="text-pink-600">CARE</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[8px] text-slate-500 font-semibold mt-0.5 tracking-wider uppercase">
              หนองเดิ่นศรีเจริญวิทยา
            </span>
          )}
        </div>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-[9px]',
    md: 'w-12 h-12 text-[11px]',
    lg: 'w-20 h-20 text-[14px]',
    xl: 'w-32 h-32 text-[20px]',
  }[size];

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-pink-50 to-rose-50 border-2 border-pink-300 shadow-md ${sizeClasses} ${className}`}
    >
      <img
        src="/assets/thai_boy_notie.jpg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo.png';
        }}
        alt="มาสคอตเด็กชายน้องเดิ่น (ชุดนักเรียนไทย เสื้อขาว กางเกงดำ รองเท้าดำ ไม่ใส่เนคไท)"
        className="w-full h-full object-contain p-0.5 hover:scale-105 transition-transform duration-300"
        loading="eager"
      />
    </div>
  );
};
