import React from 'react';
import { 
  Sprout, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Lock, 
  ArrowUpRight 
} from 'lucide-react';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface FooterProps {
  setCurrentTab: (tab: 'home' | 'prices' | 'sell' | 'pickup' | 'contact' | 'admin') => void;
  onOpenRoleModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onOpenRoleModal }) => {
  const currentYear = new Date().getFullYear();

  const handleNav = (tab: any) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-deep text-stone-300 border-t border-brand-800/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-brand-900">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('home')}>
              <div className="w-10 h-10 rounded-xl bg-harvest-500/20 border border-harvest-500/40 p-2 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-harvest-400" />
              </div>
              <div>
                <span className="text-xl font-bold text-white font-heading">අනගි ස්ටෝර්ස්</span>
                <span className="block text-[11px] text-harvest-400 uppercase tracking-widest font-semibold">
                  ANAGI STORES
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-300/90 leading-relaxed">
              ශ්‍රී ලාංකික ගොවි ජනතාවගේ දහඩිය මහන්සියට උපරිම සාධාරණ මිලක් ලබාදෙන විශ්වාසනීය ධාන්‍ය එකතු කිරීමේ ආයතනයයි.
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-stone-400">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% නිවැරදි ඩිජිටල් කිරුම්</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>එසැනින් ක්ෂණික මුදල් / බැංකු ගෙවීම්</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>විශාල තොග නිවසටම පැමිණ ලබාගැනීම</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 flex items-center space-x-2 font-heading">
              <span className="w-2 h-2 rounded bg-harvest-500"></span>
              <span>ප්‍රධාන සේවා</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => handleNav('prices')} 
                  className="hover:text-harvest-400 transition-colors flex items-center space-x-1.5 text-left"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-harvest-500" />
                  <span>අද දින ධාන්‍ය මිල ගණන්</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('sell')} 
                  className="hover:text-harvest-400 transition-colors flex items-center space-x-1.5 text-left"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-harvest-500" />
                  <span>ධාන්‍ය අලෙවි කිරීමේ ඉල්ලීම</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('pickup')} 
                  className="hover:text-harvest-400 transition-colors flex items-center space-x-1.5 text-left text-harvest-300 font-medium"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-harvest-500" />
                  <span>විශාල තොග නිවසටම පැමිණ රැගෙන යාම</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('contact')} 
                  className="hover:text-harvest-400 transition-colors flex items-center space-x-1.5 text-left"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-harvest-500" />
                  <span>අපගේ ස්ථානය සහ විස්තර</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Opening Hours & Service */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 flex items-center space-x-2 font-heading">
              <span className="w-2 h-2 rounded bg-harvest-500"></span>
              <span>විවෘත වේලාවන්</span>
            </h4>
            <div className="space-y-3 text-sm text-stone-300">
              <div className="flex items-start space-x-3 bg-brand-900/60 p-3 rounded-xl border border-brand-800/60">
                <Clock className="w-5 h-5 text-harvest-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">{BUSINESS_INFO.openingDaysSinhala}</span>
                  <span className="text-harvest-300 font-medium text-xs mt-0.5 block">{BUSINESS_INFO.openingHoursSinhala}</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                * විශේෂ නිවාඩු දිනවලද තොග මිලදී ගැනීම් සඳහා පූර්ව දැනුම්දීමෙන් පහසුකම් සලසා දිය හැක.
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 flex items-center space-x-2 font-heading">
              <span className="w-2 h-2 rounded bg-harvest-500"></span>
              <span>සම්බන්ධ කරගන්න</span>
            </h4>
            <div className="space-y-3 text-sm">
              <a 
                href={`tel:${BUSINESS_INFO.hotline.replace(/\s+/g, '')}`} 
                className="flex items-center space-x-3 p-2.5 rounded-xl bg-brand-900/60 hover:bg-brand-800 transition-colors border border-brand-800"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[11px] text-stone-400 block">ක්ෂණික ඇමතුම්:</span>
                  <span className="font-bold text-white tracking-wide">{BUSINESS_INFO.hotline}</span>
                </div>
              </a>

              <a 
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent('ආයුබෝවන් අනගි ස්ටෝර්ස්, මට ධාන්‍ය අලෙවි කිරීම පිළිබඳ තොරතුරු දැනගැනීමට අවශ්‍යයි.')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 transition-colors border border-emerald-800/60 text-emerald-300"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[11px] text-emerald-400 block">WhatsApp පණිවිඩ:</span>
                  <span className="font-bold tracking-wide">WhatsApp මඟින් විමසන්න</span>
                </div>
              </a>

              <div className="flex items-start space-x-2.5 text-xs text-stone-300 pt-1">
                <MapPin className="w-4 h-4 text-harvest-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.addressSinhala}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center space-x-2">
            <span>© {currentYear} <strong>අනගි ස්ටෝර්ස් (Anagi Stores)</strong>. සියලුම හිමිකම් ඇවිරිණි.</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (onOpenRoleModal) {
                  onOpenRoleModal();
                } else {
                  handleNav('admin');
                }
              }}
              className="flex items-center space-x-1.5 text-stone-400 hover:text-harvest-400 transition-colors bg-brand-900/60 px-3 py-1.5 rounded-lg border border-brand-800"
            >
              <Lock className="w-3 h-3 text-harvest-400" />
              <span>පරිපාලක පිවිසුම (Admin Area)</span>
            </button>

            <span className="text-[11px] text-stone-300 bg-brand-900 px-2.5 py-1 rounded-full border border-brand-700">
              Phase 1 | PWA Sinhala Release
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
