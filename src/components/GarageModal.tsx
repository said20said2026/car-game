import React, { useState, useEffect } from 'react';
import { X, Check, Lock, Zap, Gauge, Wrench, Shield, Sparkles, Coins } from 'lucide-react';
import { CarConfig } from '../types/game';
import {
  CARS_DATA,
  loadPlayerStats,
  savePlayerStats,
  getCarEffectiveStats,
  UPGRADE_COSTS,
} from '../utils/storage';
import { soundManager } from '../utils/audio';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onCoinsChange: (newCoins: number) => void;
  selectedCarIdProp?: string;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  coins,
  onCoinsChange,
  selectedCarIdProp,
}) => {
  const [stats, setStats] = useState(loadPlayerStats);
  const [selectedCar, setSelectedCar] = useState<CarConfig>(() => {
    const s = loadPlayerStats();
    if (selectedCarIdProp) {
      const found = CARS_DATA.find((c) => c.id === selectedCarIdProp);
      if (found) return found;
    }
    return CARS_DATA.find((c) => c.id === s.selectedCarId) || CARS_DATA[0];
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentStats = loadPlayerStats();
      setStats(currentStats);
      if (selectedCarIdProp) {
        const found = CARS_DATA.find((c) => c.id === selectedCarIdProp);
        if (found) setSelectedCar(found);
      } else {
        const found = CARS_DATA.find((c) => c.id === currentStats.selectedCarId);
        if (found) setSelectedCar(found);
      }
    }
  }, [isOpen, selectedCarIdProp]);

  if (!isOpen) return null;

  const currentUpgrades = stats.upgrades[selectedCar.id] || {
    speedLevel: 1,
    accelLevel: 1,
    handlingLevel: 1,
    nitroLevel: 1,
  };

  const effectiveStats = getCarEffectiveStats(selectedCar, currentUpgrades);
  const isUnlocked = stats.unlockedCars.includes(selectedCar.id);
  const isCurrentActive = stats.selectedCarId === selectedCar.id;

  const handleSelectCar = (car: CarConfig) => {
    setSelectedCar(car);
    soundManager.playClick();
  };

  const handleActivateCar = () => {
    const updated = { ...stats, selectedCarId: selectedCar.id };
    savePlayerStats(updated);
    setStats(updated);
    soundManager.playClick();
    setStatusMessage('تم تفعيل هذه السيارة للسباق القادم!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleUnlockCar = () => {
    if (coins < selectedCar.price) {
      setStatusMessage('عفواً، لا تمتلك ما يكفي من العملات الذهبية!');
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    const newCoins = coins - selectedCar.price;
    const updated = {
      ...stats,
      coins: newCoins,
      unlockedCars: [...stats.unlockedCars, selectedCar.id],
      selectedCarId: selectedCar.id,
      upgrades: {
        ...stats.upgrades,
        [selectedCar.id]: {
          speedLevel: 1,
          accelLevel: 1,
          handlingLevel: 1,
          nitroLevel: 1,
        },
      },
    };
    savePlayerStats(updated);
    setStats(updated);
    onCoinsChange(newCoins);
    soundManager.playCoin();
    setStatusMessage('مبروك! تم فتح السيارة بنجاح وتجهيزها للسباق.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpgrade = (type: 'speedLevel' | 'accelLevel' | 'handlingLevel' | 'nitroLevel') => {
    const currentLevel = currentUpgrades[type];
    if (currentLevel >= 5) return;

    const cost = UPGRADE_COSTS[currentLevel];
    if (coins < cost) {
      setStatusMessage('تحتاج إلى المزيد من العملات لشراء هذه الترقية!');
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    const newCoins = coins - cost;
    const newCarUpgrades = {
      ...currentUpgrades,
      [type]: currentLevel + 1,
    };

    const updated = {
      ...stats,
      coins: newCoins,
      upgrades: {
        ...stats.upgrades,
        [selectedCar.id]: newCarUpgrades,
      },
    };

    savePlayerStats(updated);
    setStats(updated);
    onCoinsChange(newCoins);
    soundManager.playCoin();
    setStatusMessage('تمت ترقية الجزء بنجاح وزيادة قدرات السيارة!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-game">مرآب السباق وتطوير المحركات</h2>
              <p className="text-xs text-slate-400">
                اختر سيارتك المفضلة وقم بتعديل المحرك والنيترو لتحقيق أقصى سرعة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-amber-400 font-bold font-game">
              <Coins className="w-4 h-4" />
              <span className="tabular-nums text-sm">{coins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="px-4 py-2.5 bg-sky-950/80 border border-sky-600/50 rounded-xl text-sky-200 text-xs sm:text-sm font-medium animate-fade-in text-center">
            {statusMessage}
          </div>
        )}

        {/* Cars Showcase Grid (Horizontal selection) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CARS_DATA.map((car) => {
            const unlocked = stats.unlockedCars.includes(car.id);
            const isSelected = selectedCar.id === car.id;
            const isActive = stats.selectedCarId === car.id;

            return (
              <button
                key={car.id}
                onClick={() => handleSelectCar(car)}
                className={`relative p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: car.color }} />
                    {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{car.arabicName}</h4>
                  <div className="text-[10px] text-slate-400">{car.baseSpeed} كم/س</div>
                </div>

                <div className="pt-2 text-[11px] font-semibold">
                  {unlocked ? (
                    <span className="text-emerald-400 text-[10px]">مفتوحة</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 text-[10px]">
                      <Coins className="w-3 h-3" />
                      {car.price}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Car View & Upgrades */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-800">
          {/* Left / Car Showcase Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {selectedCar.type}
                </span>
                {isCurrentActive && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    السيارة الحالية
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black font-game text-white">{selectedCar.arabicName}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedCar.description}
              </p>
            </div>

            {/* Visual Preview Badge */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
              <div
                className="w-24 h-12 rounded-lg relative shadow-xl transition-all"
                style={{ backgroundColor: selectedCar.color }}
              >
                {/* Windshield */}
                <div className="absolute inset-x-3 top-2 bottom-4 bg-slate-950 rounded-sm" />
                {/* Lights */}
                <div className="absolute -left-1 bottom-1 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                <div className="absolute -right-1 bottom-1 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500" />
              </div>
              <div
                className="w-28 h-3 rounded-full blur-md mt-2 opacity-60"
                style={{ backgroundColor: selectedCar.accentColor }}
              />
            </div>

            {/* Unlock or Activate Button */}
            <div>
              {isUnlocked ? (
                <button
                  onClick={handleActivateCar}
                  disabled={isCurrentActive}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrentActive
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isCurrentActive ? 'مختارة حالياً للسباق' : 'قيادة هذه السيارة الآن'}
                </button>
              ) : (
                <button
                  onClick={handleUnlockCar}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>شراء وفتح السيارة ({selectedCar.price} عملة)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right / Performance Stats & Upgrades (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مواصفات الأداء وترقيات القطع</span>
            </h4>

            {/* Upgrade 1: Top Speed */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    السرعة القصوى
                  </span>
                  <span className="text-sky-400 font-game font-bold">{effectiveStats.topSpeed} كم/ساعة</span>
                </div>
                {/* 5-step Level pip indicators */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-sm ${
                        lvl <= currentUpgrades.speedLevel ? 'bg-sky-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {isUnlocked && currentUpgrades.speedLevel < 5 && (
                <button
                  onClick={() => handleUpgrade('speedLevel')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  ترقية ({UPGRADE_COSTS[currentUpgrades.speedLevel]})
                </button>
              )}
            </div>

            {/* Upgrade 2: Acceleration */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    التسارع وقوة الانطلاق
                  </span>
                  <span className="text-amber-400 font-game font-bold">{effectiveStats.acceleration}%</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-sm ${
                        lvl <= currentUpgrades.accelLevel ? 'bg-amber-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {isUnlocked && currentUpgrades.accelLevel < 5 && (
                <button
                  onClick={() => handleUpgrade('accelLevel')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  ترقية ({UPGRADE_COSTS[currentUpgrades.accelLevel]})
                </button>
              )}
            </div>

            {/* Upgrade 3: Handling & Drift */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    التحكم والانجراف (Drift)
                  </span>
                  <span className="text-emerald-400 font-game font-bold">{effectiveStats.handling}%</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-sm ${
                        lvl <= currentUpgrades.handlingLevel ? 'bg-emerald-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {isUnlocked && currentUpgrades.handlingLevel < 5 && (
                <button
                  onClick={() => handleUpgrade('handlingLevel')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  ترقية ({UPGRADE_COSTS[currentUpgrades.handlingLevel]})
                </button>
              )}
            </div>

            {/* Upgrade 4: Nitro Capacity */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    سعة خزان النيترو
                  </span>
                  <span className="text-purple-400 font-game font-bold">{effectiveStats.nitro}%</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-sm ${
                        lvl <= currentUpgrades.nitroLevel ? 'bg-purple-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {isUnlocked && currentUpgrades.nitroLevel < 5 && (
                <button
                  onClick={() => handleUpgrade('nitroLevel')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  ترقية ({UPGRADE_COSTS[currentUpgrades.nitroLevel]})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
