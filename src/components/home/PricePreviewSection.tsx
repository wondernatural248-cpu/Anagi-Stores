import React from 'react';
import { TrendingUp, ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import { GrainItem } from '../../services/types';

interface PricePreviewSectionProps {
  grains: GrainItem[];
  onViewAllPrices: () => void;
  onSelectGrainForSell: (grainId: string) => void;
}

export const PricePreviewSection: React.FC<PricePreviewSectionProps> = ({
  grains,
  onViewAllPrices,
  onSelectGrainForSell,
}) => {
  // Pick featured or top 6 grains
  const featuredGrains = grains.filter((g) => g.isFeatured).slice(0, 6);
  const displayGrains = featuredGrains.length > 0 ? featuredGrains : grains.slice(0, 6);

  return (
    <section className="py-16 sm:py-20 bg-stone-50 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>දිනපතා යාවත්කාලීන වන මිල ගණන්</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
              ජනප්‍රිය ධාන්‍ය මිල ගණන්
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              අද දින අප විසින් මිලදී ගනු ලබන ප්‍රධාන ධාන්‍ය වර්ග සහ වලංගු මිල ගණන් මෙසේය.
            </p>
          </div>

          <button
            onClick={onViewAllPrices}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-deep text-white font-semibold text-sm transition-colors shadow-sm self-start md:self-auto"
          >
            <span>සියලුම ධාන්‍ය මිල බලන්න</span>
            <ArrowUpRight className="w-4 h-4 text-harvest-400" />
          </button>
        </div>

        {/* Grain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGrains.map((grain) => {
            const isBuying = grain.buyingStatus === 'BUYING';
            const isLimited = grain.buyingStatus === 'LIMITED';

            return (
              <div
                key={grain.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-premium-hover transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {grain.categorySinhala}
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5 ${
                        isBuying
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isLimited
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isBuying ? 'bg-emerald-500' : isLimited ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      <span>{grain.statusLabelSinhala}</span>
                    </span>
                  </div>

                  {/* Grain Name */}
                  <h3 className="text-xl font-bold text-stone-900 font-heading group-hover:text-brand-800 transition-colors">
                    {grain.nameSinhala}
                  </h3>
                  <span className="text-xs text-stone-400 block font-normal mb-4">
                    {grain.nameEnglish}
                  </span>

                  {/* Price Tag */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 mb-4">
                    <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block">
                      මිලදී ගැනීමේ මිල:
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-3xl font-extrabold text-brand-900 font-sans">
                        රු. {grain.currentPricePerKg}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        / {grain.unit}
                      </span>
                    </div>

                    {grain.trend === 'UP' && (
                      <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold mt-1.5">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>මිල ඉහළ ගොස් ඇත (+රු. {grain.trendValue})</span>
                      </span>
                    )}
                  </div>

                  {/* Quality note */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {grain.gradeDescriptionSinhala}
                  </p>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{grain.lastUpdated}</span>
                  </span>

                  <button
                    onClick={() => onSelectGrainForSell(grain.id)}
                    className="flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-harvest-500/15 hover:bg-harvest-500/25 text-harvest-800 border border-harvest-500/40 transition-colors"
                  >
                    <span>අලෙවි කරන්න</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Data Notice */}
        <div className="mt-8 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span>
              <strong>දැනුම්දීම:</strong> ඉහත දැක්වෙන්නේ ආදර්ශ දත්ත (Sample Data) වන අතර, අනගි ස්ටෝර්ස් සැබෑ මිල ගණන් පරිපාලක පද්ධතිය මඟින් ඉදිරියේදී යාවත්කාලීන කරනු ලැබේ.
            </span>
          </div>
          <button
            onClick={onViewAllPrices}
            className="text-xs font-bold text-amber-800 underline hover:text-amber-950 shrink-0"
          >
            සම්පූර්ණ මිල ලැයිස්තුව →
          </button>
        </div>

      </div>
    </section>
  );
};
