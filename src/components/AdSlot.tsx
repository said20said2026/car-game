import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSlotProps {
  slotId?: string;
  adSlotNumber?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = 'game-banner-main',
  adSlotNumber,
  format = 'horizontal',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch {
      // Ignore adsbygoogle push errors
    }
  }, []);

  return (
    <div
      className={`ad-slot-responsive my-6 flex flex-col items-center justify-center ${className}`}
      data-ad-slot-id={slotId}
    >
      <div className="w-full max-w-4xl min-h-[90px] sm:min-h-[100px] rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-all overflow-hidden">
        <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase mb-1">
          إعلان · ADVERTISEMENT
        </span>

        {/* Live AdSense element */}
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight: '60px' }}
          data-ad-client="ca-pub-9316249900269214"
          data-ad-slot={adSlotNumber || 'auto'}
          data-ad-format={format === 'rectangle' ? 'rectangle' : 'auto'}
          data-full-width-responsive="true"
        />

        {/* Fallback & compliance indicator */}
        <div className="text-[11px] text-slate-500 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-1">
          <span>Google AdSense (ca-pub-9316249900269214)</span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="font-mono text-[10px]">
            {format === 'horizontal' ? 'متجاوب تلقائياً · Responsive' : '300x250 مستطيل'}
          </span>
        </div>
      </div>
    </div>
  );
};

