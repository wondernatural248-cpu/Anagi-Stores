import React from 'react';
import { TrendingUp, Scale, Zap, Truck, Sparkles, Check } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: TrendingUp,
      badge: '01',
      title: 'ඉහළම වෙළෙඳපොළ මිල',
      subtitle: 'Highest Market Value',
      description: 'අතරමැදි තැරැව්කරුවන්ගෙන් තොරව, දිනපතා පවතින ඉහළම සාධාරණ තොග මිල අපගේ ගොවි මහතුන් වෙත සෘජුවම ලබාදෙමු.',
      color: 'from-amber-500/10 to-amber-500/5',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      borderColor: 'border-amber-200'
    },
    {
      icon: Scale,
      badge: '02',
      title: 'නිවැරදි ඩිජිටල් කිරුම්',
      subtitle: '100% Accurate Digital Scales',
      description: 'ප්‍රමිති කාර්යාංශයේ අනුමත, නිවැරදි ඉලෙක්ට්‍රොනික තරාදි මඟින් ඔබේ ඉදිරියේදීම විනිවිදභාවයෙන් යුතුව කිරුම් කටයුතු සිදුකෙරේ.',
      color: 'from-emerald-500/10 to-emerald-500/5',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      borderColor: 'border-emerald-200'
    },
    {
      icon: Zap,
      badge: '03',
      title: 'එසැනින් මුදල් ගෙවීම',
      subtitle: 'Instant Spot Cash / Bank Payment',
      description: 'කිරා බලා අවසන් වූ සැණින් අතේ මුදලින් හෝ ඔබට පහසු ඕනෑම ලංකාවේ බැංකු ගිණුමකට ක්ෂණිකව මුදල් බැර කරනු ලැබේ.',
      color: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      icon: Truck,
      badge: '04',
      title: 'නිවසටම පැමිණ රැගෙන යාම',
      subtitle: 'Farm Gate Collection Fleet',
      description: 'විශාල ධාන්‍ය තොග ඇති ගොවි මහතුන් සඳහා ප්‍රවාහන කරදරයකින් තොරව අපගේ ලොරි රථ මඟින් නිවසටම පැමිණ ලබාගැනීම.',
      color: 'from-harvest-500/10 to-harvest-500/5',
      iconColor: 'text-harvest-600',
      iconBg: 'bg-harvest-100',
      borderColor: 'border-harvest-200'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-100/70 border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-harvest-500/15 text-harvest-800 text-xs font-bold border border-harvest-500/30">
            <Sparkles className="w-3.5 h-3.5 text-harvest-600" />
            <span>අපගේ සුවිශේෂී ප්‍රතිලාභ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
            අනගි ස්ටෝර්ස් තෝරාගත යුත්තේ ඇයි?
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            අප සමඟ ගනුදෙනු කරන දහස් ගණනක් වූ ශ්‍රී ලාංකික ගොවි ජනතාවට අප ලබාදෙන ස්ථීර පොරොන්දු.
          </p>
        </div>

        {/* 4 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-6 border ${item.borderColor} shadow-sm hover:shadow-premium-hover transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group`}
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-2xl font-black text-stone-200 font-sans group-hover:text-stone-300 transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 font-heading mb-1">
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-stone-400 block mb-3 uppercase tracking-wider">
                    {item.subtitle}
                  </span>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center space-x-1 text-xs font-semibold text-stone-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% තහවුරු කළ සේවාව</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
