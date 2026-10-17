import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  nameEn: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverGlow: string;
  icon: React.ReactNode;
  action: (url: string, title: string) => void;
}

interface SocialShareProps {
  theme?: 'dark' | 'light';
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ theme = 'dark', className = '' }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname;
    }
    return 'https://games-children.com/';
  };

  const getShareTitle = () => {
    return 'لعبة سباق سيارات المدينة السريعة للأبطال 🏎️ - العب الآن مجاناً عبر المتصفح!';
  };

  const openSharePopup = (url: string) => {
    if (typeof window !== 'undefined') {
      const width = 600;
      const height = 550;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      window.open(url, '_blank', `toolbar=0,status=0,width=${width},height=${height},top=${top},left=${left}`);
    }
  };

  const copyToClipboard = async (platformName?: string) => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / iframe restrictions
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(platformName || 'general');
      showToast(
        platformName
          ? `تم نسخ رابط اللعبة بنجاح! شاركه الآن على ${platformName} 🚀`
          : 'تم نسخ رابط اللعبة إلى الحافظة بنجاح! 🎉'
      );
      setTimeout(() => setCopied(null), 3000);
    } catch {
      showToast('تعذر النسخ التلقائي، يمكنك نسخ الرابط من شريط العنوان.');
    }
  };

  const platforms: SocialPlatform[] = [
    {
      id: 'facebook',
      name: 'فيسبوك',
      nameEn: 'Facebook',
      bgColor: 'bg-[#1877F2]',
      textColor: 'text-white',
      borderColor: 'border-[#1877F2]/40',
      hoverGlow: 'hover:shadow-[#1877F2]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      action: (url, title) => {
        openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`);
      },
    },
    {
      id: 'twitter',
      name: 'تويتر (X)',
      nameEn: 'Twitter / X',
      bgColor: 'bg-black',
      textColor: 'text-white',
      borderColor: 'border-slate-700',
      hoverGlow: 'hover:shadow-white/20 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      action: (url, title) => {
        openSharePopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=ألعاب_أطفال,سباق_سيارات`);
      },
    },
    {
      id: 'whatsapp',
      name: 'واتساب',
      nameEn: 'WhatsApp',
      bgColor: 'bg-[#25D366]',
      textColor: 'text-white',
      borderColor: 'border-[#25D366]/40',
      hoverGlow: 'hover:shadow-[#25D366]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 2c-5.502 0-9.982 4.477-9.982 9.977 0 1.76.46 3.483 1.332 5.006L2 22l5.163-1.349a9.923 9.923 0 004.868 1.272c5.502 0 9.981-4.477 9.981-9.978 0-2.665-1.038-5.17-2.924-7.056A9.925 9.925 0 0012.031 2zm0 18.252a8.23 8.23 0 01-4.201-1.147l-.302-.18-3.123.816.833-3.037-.197-.314a8.243 8.243 0 01-1.264-4.413c0-4.55 3.703-8.252 8.254-8.252 2.204 0 4.277.86 5.836 2.42 1.56 1.56 2.418 3.632 2.418 5.836 0 4.55-3.703 8.254-8.251 8.254zm4.521-6.173c-.248-.124-1.468-.724-1.696-.807-.228-.083-.394-.124-.56.124-.166.248-.642.807-.787.973-.145.166-.29.186-.538.062a6.793 6.793 0 01-1.996-1.231 7.487 7.487 0 01-1.38-1.719c-.145-.248-.016-.382.108-.506.112-.112.248-.29.373-.435.124-.145.166-.248.249-.414.083-.166.041-.311-.021-.435-.062-.124-.56-1.349-.767-1.847-.202-.486-.407-.42-.56-.428l-.477-.008c-.166 0-.435.062-.663.311-.228.248-.871.85-.871 2.073 0 1.223.892 2.405 1.016 2.571.124.166 1.755 2.68 4.251 3.757.594.256 1.058.409 1.42.524.597.19 1.14.163 1.569.099.479-.071 1.468-.6 1.675-1.18.207-.58.207-1.077.145-1.18-.062-.104-.228-.166-.476-.29z"/>
        </svg>
      ),
      action: (url, title) => {
        const fullMsg = `${title}\n${url}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullMsg)}`, '_blank');
      },
    },
    {
      id: 'messenger',
      name: 'ماسنجر',
      nameEn: 'Messenger',
      bgColor: 'bg-gradient-to-r from-[#00B2FF] via-[#006AFF] to-[#9B30FF]',
      textColor: 'text-white',
      borderColor: 'border-[#0084FF]/40',
      hoverGlow: 'hover:shadow-[#0084FF]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.909 1.455 5.516 3.737 7.218v3.614l3.473-1.905c.895.248 1.84.381 2.79.381 5.523 0 10-4.145 10-9.308S17.523 2 12 2zm1.072 12.518l-2.738-2.92-5.344 2.92 5.877-6.236 2.802 2.92 5.28-2.92-5.877 6.236z"/>
        </svg>
      ),
      action: (url) => {
        // Support fb-messenger protocol or fallback dialog
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `fb-messenger://share/?link=${encodeURIComponent(url)}`;
        } else {
          openSharePopup(`https://www.facebook.com/dialog/share?app_id=291494419107518&display=popup&href=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`);
        }
      },
    },
    {
      id: 'telegram',
      name: 'تلجرام',
      nameEn: 'Telegram',
      bgColor: 'bg-[#229ED9]',
      textColor: 'text-white',
      borderColor: 'border-[#229ED9]/40',
      hoverGlow: 'hover:shadow-[#229ED9]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      ),
      action: (url, title) => {
        openSharePopup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
      },
    },
    {
      id: 'instagram',
      name: 'انستجرام',
      nameEn: 'Instagram',
      bgColor: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      textColor: 'text-white',
      borderColor: 'border-[#dc2743]/40',
      hoverGlow: 'hover:shadow-[#dc2743]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      action: () => {
        copyToClipboard('انستجرام');
        window.open('https://www.instagram.com/p/Dej81fEjA0J/?utm_source=ig_web_copy_link&rpxt=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA==', '_blank');
      },
    },
    {
      id: 'pinterest',
      name: 'بينترست',
      nameEn: 'Pinterest',
      bgColor: 'bg-[#E60023]',
      textColor: 'text-white',
      borderColor: 'border-[#E60023]/40',
      hoverGlow: 'hover:shadow-[#E60023]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.94-.12-2.39.02-3.42.14-.98.92-3.9 1.9-3.9s.75 1.49 1.83 1.49c1.44 0 2.54-1.32 2.54-3.08 0-2.07-1.48-3.62-3.72-3.62-2.72 0-4.31 1.84-4.31 4.14 0 1.05.4 2.18.91 2.8.1.12.11.23.08.36-.08.35-.28 1.13-.32 1.29-.05.21-.17.26-.39.16-1.45-.67-2.36-2.79-2.36-4.5 0-3.66 2.66-7.02 7.68-7.02 4.03 0 7.16 2.87 7.16 6.71 0 4.01-2.53 7.23-6.04 7.23-1.18 0-2.29-.61-2.67-1.33l-.73 2.77c-.26 1.01-.97 2.28-1.45 3.05A12 12 0 1 0 12 0z"/>
        </svg>
      ),
      action: (url, title) => {
        openSharePopup(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`);
      },
    },
    {
      id: 'snapchat',
      name: 'سناب شات',
      nameEn: 'Snapchat',
      bgColor: 'bg-[#FFFC00]',
      textColor: 'text-slate-950 font-bold',
      borderColor: 'border-[#E6E300]',
      hoverGlow: 'hover:shadow-[#FFFC00]/50 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.03 2c-3.94 0-6.72 2.83-6.72 6.57 0 .84.22 2.05.5 2.76.12.31.06.49-.15.63-.44.29-1.28.84-1.65 1.4-.29.43-.16.8.31.96 1.01.35 2.07.27 2.37.79.17.3.06.63-.3 1.09-.58.74-1.35 1.25-2.26 1.5-.47.13-.67.43-.52.79.19.46.85.73 1.76.73.49 0 1.03-.08 1.6-.23.63-.17 1.15.1 1.34.69.4 1.23 1.57 1.77 3.72 1.77 2.15 0 3.32-.54 3.72-1.77.19-.59.71-.86 1.34-.69.57.15 1.11.23 1.6.23.91 0 1.57-.27 1.76-.73.15-.36-.05-.66-.52-.79-.91-.25-1.68-.76-2.26-1.5-.36-.46-.47-.79-.3-1.09.3-.52 1.36-.44 2.37-.79.47-.16.6-.53.31-.96-.37-.56-1.21-1.11-1.65-1.4-.21-.14-.27-.32-.15-.63.28-.71.5-1.92.5-2.76 0-3.74-2.78-6.57-6.72-6.57z"/>
        </svg>
      ),
      action: (url) => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `snapchat://creativekit?attachmentUrl=${encodeURIComponent(url)}`;
        } else {
          openSharePopup(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`);
        }
      },
    },
    {
      id: 'tiktok',
      name: 'تيك توك',
      nameEn: 'TikTok',
      bgColor: 'bg-black',
      textColor: 'text-white',
      borderColor: 'border-slate-800',
      hoverGlow: 'hover:shadow-cyan-500/30 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 00-.86-.06 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.08a8.28 8.28 0 004.87 1.56V7.19a4.84 4.84 0 01-1.1-.5z"/>
        </svg>
      ),
      action: () => {
        copyToClipboard('تيك توك');
        window.open('https://www.tiktok.com/', '_blank');
      },
    },
    {
      id: 'linkedin',
      name: 'لينكد إن',
      nameEn: 'LinkedIn',
      bgColor: 'bg-[#0A66C2]',
      textColor: 'text-white',
      borderColor: 'border-[#0A66C2]/40',
      hoverGlow: 'hover:shadow-[#0A66C2]/40 hover:scale-105',
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      ),
      action: (url) => {
        openSharePopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
      },
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 text-emerald-400 border border-emerald-500/50 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Share Header & Callout */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/80 border-slate-800 shadow-lg'
          : 'bg-gradient-to-b from-slate-50 to-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 text-center sm:text-start">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-700'
            }`}>
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-black font-game text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                شارك اللعبة مع أصدقائك
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                تحدَّ أصدقاءك في سباق سيارات المدينة السريعة بنقرة واحدة!
              </p>
            </div>
          </div>

          {/* Quick Copy Link Button */}
          <button
            onClick={() => copyToClipboard()}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer active:scale-95 ${
              copied === 'general'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="نسخ رابط اللعبة"
          >
            {copied === 'general' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم نسخ الرابط!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>

        {/* 10 Social Media Sharing Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {platforms.map((platform) => {
            const isItemCopied = copied === platform.name;

            return (
              <button
                key={platform.id}
                onClick={() => platform.action(getShareUrl(), getShareTitle())}
                className={`group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-200 shadow-sm cursor-pointer ${platform.hoverGlow} ${
                  isDark
                    ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title={`مشاركة عبر ${platform.name}`}
                aria-label={`مشاركة على ${platform.name}`}
              >
                {/* Platform Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-110 shadow-xs ${platform.bgColor} ${platform.textColor}`}
                >
                  {isItemCopied ? <Check className="w-4 h-4 text-white" /> : platform.icon}
                </div>

                {/* Platform Label */}
                <span className="text-[11px] font-bold tracking-tight text-center truncate max-w-full">
                  {platform.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* منشور انستغرام الرسمي لزيادة الزيارات والأرشفة */}
        <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 border border-[#dc2743]/30 rounded-xl p-3">
          <div className="flex items-center gap-2.5 text-center sm:text-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5 justify-center sm:justify-start">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>منشور اللعبة الرسمي على إنستغرام</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#dc2743]/20 text-[#f43f5e] font-semibold border border-[#dc2743]/30">Instagram</span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                شاهد أحدث التحديات ومقاطع ألعاب سباق سيارات المدينة السريعة للأبطال
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/p/Dej81fEjA0J/?utm_source=ig_web_copy_link&rpxt=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA=="
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-[#dc2743]/25 transition-all cursor-pointer"
          >
            <span>مشاهدة المنشور على إنستغرام</span>
            <span className="text-sm">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};
