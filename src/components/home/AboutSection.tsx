import React from 'react';
import { Sprout, CheckCircle2, HeartHandshake, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-stone-50 text-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual & Trust Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Visual Presentation Box */}
            <div className="relative rounded-3xl bg-gradient-to-br from-brand-forest via-brand-deep to-brand-950 p-8 text-white shadow-premium overflow-hidden border border-brand-800">
              
              {/* Decorative grain badge */}
              <div className="w-16 h-16 rounded-2xl bg-harvest-500/20 border border-harvest-500/40 p-3.5 flex items-center justify-center mb-6">
                <Sprout className="w-9 h-9 text-harvest-400" />
              </div>

              <span className="text-xs uppercase tracking-widest text-harvest-400 font-bold block mb-1">
                අපගේ අනන්‍යතාවය
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white leading-snug">
                ගොවිබිමේ සිට වෙළෙඳපොළට සෘජු විශ්වාසනීය පාලමක්
              </h3>

              <p className="text-sm text-stone-300 mt-4 leading-relaxed">
                අනගි ස්ටෝර්ස් යනු අතරමැදියන්ගෙන් තොරව ගොවි ජනතාවගේ අස්වැන්නට නියම සාධාරණ වටිනාකමක් ලබාදෙන ප්‍රමුඛ පෙළේ ධාන්‍ය මිලදී ගැනීමේ මධ්‍යස්ථානයකි.
              </p>

              <div className="mt-8 pt-6 border-t border-brand-800/80 grid grid-cols-2 gap-4">
                <div className="bg-brand-900/80 p-3.5 rounded-xl border border-brand-700/50">
                  <span className="text-2xl font-extrabold text-harvest-400 font-sans block">100%</span>
                  <span className="text-xs text-stone-300">සාධාරණ තක්සේරුව</span>
                </div>
                <div className="bg-brand-900/80 p-3.5 rounded-xl border border-brand-700/50">
                  <span className="text-2xl font-extrabold text-emerald-400 font-sans block">ක්ෂණික</span>
                  <span className="text-xs text-stone-300">මුදල් පියවීම්</span>
                </div>
              </div>
            </div>

            {/* Floating Trust Pill */}
            <div className="hidden sm:flex absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md text-brand-950 p-4 rounded-2xl shadow-xl border border-stone-200 items-center space-x-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="text-xs font-semibold leading-tight">
                <span className="block text-stone-900 font-bold">ප්‍රමිතිගත මිනුම් උපකරණ</span>
                <span className="text-stone-500 font-normal">රජයේ අනුමත ඩිජිටල් තරාදි මඟින් කිරුම්</span>
              </div>
            </div>

          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>අනගි ස්ටෝර්ස් පිළිබඳව</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900 leading-tight">
                ඔබේ මහන්සියට උපරිම මිලක් ලබාදීමට අපි කැපවී සිටිමු.
              </h2>
            </div>

            <p className="text-base text-stone-600 leading-relaxed">
              ශ්‍රී ලාංකික කෘෂිකර්මාන්තය නගාසිටුවීම සහ ගොවි ජනතාවට තම අස්වැන්න පහසුවෙන් සහ ආරක්ෂිතව අලෙවි කරගත හැකි පරිසරයක් නිර්මාණය කිරීම අනගි ස්ටෝර්ස් අපගේ ප්‍රධාන අරමුණයි.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-bold text-stone-900 text-sm">විනිවිදභාවය හා විශ්වාසය</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  කිරුම් කටයුතු සහ තත්ත්ව පරීක්ෂාව ඔබේ ඉදිරියේදීම විනිවිදභාවයෙන් යුතුව සිදු කෙරේ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-bold text-stone-900 text-sm">දිනපතා යාවත්කාලීන මිල</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  වෙළෙඳපොළේ පවතින ඉහළම තරඟකාරී මිල ගණන් දිනපතාම විවෘතව ප්‍රදර්ශනය කෙරේ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-bold text-stone-900 text-sm">ඕනෑම ධාන්‍ය ප්‍රමාණයක්</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  කුඩා පරිමාණයේ සිට ටොන් ගණනක මහා පරිමාණ තොග දක්වා එකලෙස පිළිගනු ලැබේ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-bold text-stone-900 text-sm">ක්ෂණික සහාය හා සේවය</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  දුරකථන ඇමතුමක් හෝ WhatsApp පණිවිඩයක් මඟින් ඕනෑම වේලාවක උපදෙස් ලබාගත හැක.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
