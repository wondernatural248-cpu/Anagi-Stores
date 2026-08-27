import React from 'react';
import { Truck, CheckCircle2, Phone, Clock, ArrowRight } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface HomePickupSpotlightProps {
  onNavigateToPickup: () => void;
}

export const HomePickupSpotlight: React.FC<HomePickupSpotlightProps> = ({ onNavigateToPickup }) => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-stone-50 to-stone-100/90 text-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-brand-deep via-brand-forest to-brand-950 rounded-3xl p-8 sm:p-12 text-white shadow-premium relative overflow-hidden border border-harvest-500/30">
          
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Col: Main Pitch */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-harvest-500/20 text-harvest-300 text-xs font-bold border border-harvest-500/30">
                <Truck className="w-3.5 h-3.5 text-harvest-400" />
                <span>විශාල තොග සඳහා විශේෂ සේවාව</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight">
                ඔබ සතුව විශාල ධාන්‍ය ප්‍රමාණයක් තිබේද?
              </h2>

              <p className="text-base text-stone-300 leading-relaxed max-w-xl">
                ප්‍රවාහන පහසුකම් සොයා කරදර විය යුතු නැත. ඔබගේ නිවසට හෝ ගොවිපළටම අපගේ ලොරි රථ සහ ප්‍රමිතිගත ඩිජිටල් කිරුම් උපකරණ සමඟින් පැමිණ, සියලු ධාන්‍ය කිරා බලා එසැනින් මුදල් ගෙවා රැගෙන යාමට අප සූදානම්.
              </p>

              {/* 3 Step Process */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="bg-brand-900/80 p-3.5 rounded-xl border border-brand-700/50">
                  <div className="flex items-center space-x-2 text-harvest-400 font-bold text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-harvest-500/20 flex items-center justify-center text-[10px]">1</span>
                    <span>ඉල්ලීම යොමු කරන්න</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-normal">
                    වර්ගය, ප්‍රමාණය සහ ඔබගේ ලිපිනය අප වෙත එවන්න.
                  </p>
                </div>

                <div className="bg-brand-900/80 p-3.5 rounded-xl border border-brand-700/50">
                  <div className="flex items-center space-x-2 text-harvest-400 font-bold text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-harvest-500/20 flex items-center justify-center text-[10px]">2</span>
                    <span>වේලාව තහවුරු කිරීම</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-normal">
                    අපගේ නියෝජිතයෙකු අමතා පැමිණෙන දිනය සහ වේලාව තහවුරු කරනු ඇත.
                  </p>
                </div>

                <div className="bg-brand-900/80 p-3.5 rounded-xl border border-brand-700/50">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                    <span>කිරුම් හා ක්ෂණික මුදල්</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-normal">
                    වාහනය පැමිණ කිරා බලා ක්ෂණිකව මුදල් පියවනු ලැබේ.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onNavigateToPickup}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 font-bold text-sm shadow-gold transition-all duration-200"
                >
                  <Truck className="w-4 h-4" />
                  <span>රැගෙන යාමේ ඉල්ලීම යොමු කරන්න</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`tel:${BUSINESS_INFO.hotline.replace(/\s+/g, '')}`}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-brand-900/90 hover:bg-brand-800 text-white font-semibold text-sm border border-brand-700/80 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>ක්ෂණිකව අමතන්න: {BUSINESS_INFO.hotline}</span>
                </a>
              </div>

            </div>

            {/* Right Col: Visual Card Summary */}
            <div className="lg:col-span-5 bg-brand-950/80 rounded-2xl p-6 border border-harvest-500/30 space-y-4">
              <h4 className="text-lg font-bold text-white font-heading flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-harvest-400"></span>
                <span>ප්‍රවාහන සේවාවේ වාසි</span>
              </h4>

              <div className="space-y-3 text-xs text-stone-300">
                <div className="flex items-start space-x-3 p-3 bg-brand-900/60 rounded-xl border border-brand-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">ප්‍රවාහන වියදම් ඉතිරිය</strong>
                    <span>ලොරි කුලී හෝ පැටවුම් ගාස්තු ගෙවීමට අවශ්‍ය නොවේ.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-brand-900/60 rounded-xl border border-brand-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">තැනදීම කිරා බැලීම</strong>
                    <span>ඔබගේ ගෙවත්තේ හෝ ගබඩාවේ සිටම නිවැරදි ඩිජිටල් කිරුම්.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-brand-900/60 rounded-xl border border-brand-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">ඕනෑම විශාල ප්‍රමාණයක්</strong>
                    <span>කිලෝ 500 සිට ටොන් 50+ දක්වා විශාල තොග ලබාගැනීමේ හැකියාව.</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
                <Clock className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>ඉල්ලීම යොමු කළ පැය 24-48ක් ඇතුළත පැමිණීමේ පහසුකම.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
