import React from 'react';
import { 
  TrendingUp, 
  BadgePercent, 
  Truck, 
  Phone, 
  ShieldCheck, 
  Scale, 
  Zap, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface HeroSectionProps {
  onNavigate: (tab: 'home' | 'prices' | 'sell' | 'pickup' | 'contact' | 'admin') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative bg-gradient-to-b from-brand-deep via-brand-forest to-brand-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-brand-800">
      {/* Subtle background glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-24 right-0 w-96 h-96 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Trust Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-800/80 border border-harvest-500/30 shadow-inner text-xs sm:text-sm text-harvest-300">
            <Sparkles className="w-4 h-4 text-harvest-400" />
            <span className="font-medium">දිවයිනේ විශ්වාසනීය ධාන්‍ය මිලදී ගැනීමේ සේවාව</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>

        {/* Main Heading & Tagline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-tight">
            <span className="block text-stone-100 drop-shadow-md">අනගි ස්ටෝර්ස්</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-harvest-300 via-harvest-400 to-harvest-500">
              “{BUSINESS_INFO.taglineSinhala}”
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            වී, කුරක්කන්, මුං ඇට, කව්පි, තල, බඩඉරිඟු ඇතුළු සියලුම ධාන්‍ය වර්ග සඳහා ඉහළම වෙළෙඳපොළ මිලක්, නිවැරදි කිරුම් සහ එසැනින් මුදල් ගෙවීම්.
          </p>
        </div>

        {/* 4 Primary Action Buttons */}
        <div className="mt-10 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Action 1: Today's Grain Prices */}
          <button
            onClick={() => onNavigate('prices')}
            className="group flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-800/60 hover:bg-brand-700/80 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              අද ධාන්‍ය මිල ගණන්
            </span>
            <span className="text-xs text-stone-300 mt-1 flex items-center space-x-1">
              <span>මිල පුවරුව බලන්න</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Action 2: Sell Your Grain */}
          <button
            onClick={() => onNavigate('sell')}
            className="group flex flex-col items-center sm:items-start p-4 rounded-2xl bg-gradient-to-br from-harvest-600/90 to-harvest-700 hover:from-harvest-500 hover:to-harvest-600 border border-harvest-400/50 text-left transition-all duration-300 shadow-gold transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-deep/80 border border-harvest-400 p-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BadgePercent className="w-5 h-5 text-harvest-400" />
            </div>
            <span className="text-base font-bold text-brand-950">
              ඔබේ ධාන්‍ය අපට අලෙවි කරන්න
            </span>
            <span className="text-xs text-brand-950/90 font-medium mt-1 flex items-center space-x-1">
              <span>ඉල්ලීම යොමු කරන්න</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Action 3: Home Pickup */}
          <button
            onClick={() => onNavigate('pickup')}
            className="group flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-800/60 hover:bg-brand-700/80 border border-harvest-500/30 hover:border-harvest-400 text-left transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-harvest-500/20 border border-harvest-500/40 p-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5 text-harvest-400" />
            </div>
            <span className="text-base font-bold text-white group-hover:text-harvest-300 transition-colors">
              නිවසටම පැමිණ රැගෙන යාම
            </span>
            <span className="text-xs text-stone-300 mt-1 flex items-center space-x-1">
              <span>විශාල තොග සඳහා</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Action 4: Contact Us */}
          <button
            onClick={() => onNavigate('contact')}
            className="group flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-800/60 hover:bg-brand-700/80 border border-stone-600/40 hover:border-stone-400 text-left transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-700/40 border border-stone-500/40 p-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5 text-stone-300" />
            </div>
            <span className="text-base font-bold text-white group-hover:text-stone-200 transition-colors">
              අපව අමතන්න
            </span>
            <span className="text-xs text-stone-300 mt-1 flex items-center space-x-1">
              <span>ස්ථානය සහ අංක</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 pt-10 border-t border-brand-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          
          <div className="flex flex-col items-center p-3 rounded-xl bg-brand-950/40 border border-brand-800/50">
            <Scale className="w-6 h-6 text-harvest-400 mb-2" />
            <span className="text-sm font-bold text-white">100% නිවැරදි කිරුම්</span>
            <span className="text-xs text-stone-400 mt-0.5">ප්‍රමිතිගත ඩිජිටල් තරාදි</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-brand-950/40 border border-brand-800/50">
            <Zap className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-sm font-bold text-white">ක්ෂණික මුදල් ගෙවීම</span>
            <span className="text-xs text-stone-400 mt-0.5">අතේ මුදලින් හෝ බැංකු ගිණුමට</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-brand-950/40 border border-brand-800/50">
            <Truck className="w-6 h-6 text-harvest-400 mb-2" />
            <span className="text-sm font-bold text-white">ප්‍රවාහන පහසුකම්</span>
            <span className="text-xs text-stone-400 mt-0.5">ලොරි රථ මඟින් නිවසටම පැමිණීම</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-brand-950/40 border border-brand-800/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-sm font-bold text-white">විශ්වාසනීය සේවාව</span>
            <span className="text-xs text-stone-400 mt-0.5">වසර ගණනාවක ගොවි විශ්වාසය</span>
          </div>

        </div>

      </div>
    </section>
  );
};
