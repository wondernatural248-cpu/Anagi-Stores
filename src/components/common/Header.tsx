import React, { useState } from 'react';
import { 
  Sprout, 
  Phone, 
  Menu, 
  X, 
  TrendingUp, 
  Truck, 
  BadgePercent, 
  ShieldCheck, 
  Download, 
  UserCheck, 
  ChevronRight 
} from 'lucide-react';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface HeaderProps {
  currentTab: 'home' | 'prices' | 'sell' | 'pickup' | 'contact' | 'admin';
  setCurrentTab: (tab: 'home' | 'prices' | 'sell' | 'pickup' | 'contact' | 'admin') => void;
  selectedGrainForSell?: string;
  onOpenRoleModal?: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRoleModal,
  canInstallPwa,
  onInstallPwa
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'මුල් පිටුව', icon: Sprout },
    { id: 'prices', label: 'අද ධාන්‍ය මිල ගණන්', icon: TrendingUp, badge: 'Live' },
    { id: 'sell', label: 'ධාන්‍ය අලෙවිය', icon: BadgePercent },
    { id: 'pickup', label: 'නිවසටම පැමිණීම', icon: Truck, highlight: true },
    { id: 'contact', label: 'අපව අමතන්න', icon: Phone },
  ];

  const handleNavClick = (tabId: any) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-deep/95 backdrop-blur-md border-b border-brand-800 text-stone-100 shadow-md">
      {/* Top micro-announcement bar */}
      <div className="bg-brand-950/80 border-b border-brand-900/60 px-4 py-1.5 text-xs text-stone-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-emerald-300">අද දින මිලදී ගැනීම් විවෘතයි:</span>
            <span className="hidden sm:inline text-stone-400">උදෑසන 7:30 සිට සවස 7:00 දක්වා</span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href={`tel:${BUSINESS_INFO.hotline.replace(/\s+/g, '')}`} 
              className="flex items-center space-x-1 text-harvest-300 hover:text-harvest-200 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{BUSINESS_INFO.hotline}</span>
            </a>
            <button
              onClick={onOpenRoleModal}
              className="text-stone-400 hover:text-harvest-400 flex items-center space-x-1 text-[11px] bg-brand-900/90 px-2 py-0.5 rounded border border-brand-700/50 transition-colors"
              title="පරිපාලක / පාරිභෝගික මාරු වීම"
            >
              <UserCheck className="w-3 h-3 text-harvest-400" />
              <span className="hidden md:inline">අංශය:</span>
              <span className="text-harvest-300 font-medium">
                {currentTab === 'admin' ? 'පරිපාලක (Admin)' : 'පාරිභෝගික'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none py-2"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-harvest-500 via-harvest-600 to-harvest-700 p-0.5 shadow-gold flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-brand-deep rounded-[10px] flex items-center justify-center">
                <Sprout className="w-6 h-6 text-harvest-400 group-hover:rotate-6 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold tracking-tight text-white font-heading">
                  අනගි ස්ටෝර්ස්
                </span>
                <span className="text-[10px] tracking-wider uppercase text-harvest-400 font-semibold px-1.5 py-0.5 rounded bg-harvest-500/10 border border-harvest-500/20">
                  ANAGI STORES
                </span>
              </div>
              <span className="text-xs text-harvest-300/80 font-normal">
                {BUSINESS_INFO.taglineSinhala}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-emerald text-white shadow-sm ring-1 ring-emerald-400/30 font-semibold'
                      : link.highlight
                      ? 'text-harvest-300 hover:text-white hover:bg-brand-800/60 bg-harvest-500/10 border border-harvest-500/30'
                      : 'text-stone-300 hover:text-white hover:bg-brand-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-harvest-400' : link.highlight ? 'text-harvest-400' : 'text-stone-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-emerald-500 text-brand-950 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {canInstallPwa && onInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-harvest-500/20 hover:bg-harvest-500/30 text-harvest-300 border border-harvest-500/40 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-harvest-400" />
                <span>ඇප් එක Install කරන්න</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('sell')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 font-bold text-sm shadow-gold transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>ධාන්‍ය අලෙවි කරන්න</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu & Action Buttons */}
          <div className="flex items-center space-x-2 lg:hidden">
            {canInstallPwa && onInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="p-2 rounded-lg bg-harvest-500/20 text-harvest-300 border border-harvest-500/40 text-xs flex items-center space-x-1"
                aria-label="Install App"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-brand-800/80 text-stone-200 hover:text-white hover:bg-brand-700 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-950 border-b border-brand-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-2xl">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-emerald text-white font-semibold'
                      : link.highlight
                      ? 'bg-harvest-500/15 text-harvest-300 border border-harvest-500/30'
                      : 'text-stone-200 hover:bg-brand-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-harvest-400' : 'text-stone-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-500 text-brand-950 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-brand-900/80 space-y-2">
            <button
              onClick={() => handleNavClick('sell')}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 text-brand-950 font-bold text-base shadow-gold"
            >
              <span>ඔබේ ධාන්‍ය අපට අලෙවි කරන්න</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenRoleModal) onOpenRoleModal();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-900/60 text-stone-300 border border-brand-800 text-sm font-medium hover:bg-brand-900"
            >
              <ShieldCheck className="w-4 h-4 text-harvest-400" />
              <span>පරිපාලක / පාරිභෝගික මාරු වීම</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
