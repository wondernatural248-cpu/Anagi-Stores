import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Scale,
  Layers
} from 'lucide-react';
import { GrainItem } from '../../services/types';
import { PriceCalculator } from '../common/PriceCalculator';

interface PriceListingProps {
  grains: GrainItem[];
  isLoading?: boolean;
  onSelectGrainForSell: (grainId: string, quantity?: number) => void;
  onRefreshPrices?: () => void;
}

export const PriceListing: React.FC<PriceListingProps> = ({
  grains,
  isLoading = false,
  onSelectGrainForSell,
  onRefreshPrices
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCalculator, setShowCalculator] = useState(false);

  const categories = [
    { id: 'ALL', label: 'සියලුම ධාන්‍ය' },
    { id: 'PADDY', label: 'වී වර්ග' },
    { id: 'CEREALS', label: 'ධාන්‍ය වර්ග' },
    { id: 'PULSES', label: 'පියලි / ඇට වර්ග' },
    { id: 'OILSEEDS', label: 'තෙල් බීජ' },
  ];

  const statuses = [
    { id: 'ALL', label: 'සියලු තත්ත්ව' },
    { id: 'BUYING', label: '🟢 දැනට මිලදී ගනී' },
    { id: 'LIMITED', label: '🟡 සීමිත ප්‍රමාණයක්' },
    { id: 'PAUSED', label: '🔴 තාවකාලිකව නවතා ඇත' },
  ];

  // Filtered grains
  const filteredGrains = useMemo(() => {
    return grains.filter((grain) => {
      const matchesSearch = 
        grain.nameSinhala.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grain.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grain.categorySinhala.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'ALL' || grain.category === selectedCategory;

      const matchesStatus = 
        selectedStatus === 'ALL' || grain.buyingStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [grains, searchQuery, selectedCategory, selectedStatus]);

  const buyingCount = grains.filter(g => g.buyingStatus === 'BUYING').length;

  return (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header Banner */}
        <div className="bg-gradient-to-br from-brand-forest via-brand-deep to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-premium border border-brand-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>දෛනික සජීවී මිල පුවරුව</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
                අද දින ධාන්‍ය මිල ගණන්
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                අනගි ස්ටෝර්ස් වෙතින් අද දින මිලදී ගනු ලබන සියලුම ධාන්‍ය වර්ග සඳහා වලංගු ඉහළම වෙළෙඳපොළ මිල ගණන් මෙතැනින් පරීක්ෂා කරගත හැක.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-brand-950 font-bold text-sm shadow-gold transition-all duration-200"
              >
                <Scale className="w-4 h-4" />
                <span>{showCalculator ? 'කැල්කියුලේටරය වසන්න' : 'මිල ගණනය කරන්න'}</span>
              </button>

              {onRefreshPrices && (
                <button
                  onClick={onRefreshPrices}
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-brand-900/80 hover:bg-brand-800 text-stone-200 border border-brand-700 text-sm font-medium transition-colors"
                  title="මිල ගණන් නැවත පූරණය කරන්න"
                >
                  <RefreshCw className="w-4 h-4 text-harvest-400" />
                  <span className="hidden sm:inline">නැවුම් කරන්න</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-brand-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-400 block">ලැයිස්තුගත ධාන්‍ය:</span>
              <strong className="text-lg text-white font-sans">{grains.length} වර්ගයක්</strong>
            </div>
            <div>
              <span className="text-stone-400 block">දැනට මිලදී ගන්නා:</span>
              <strong className="text-lg text-emerald-400 font-sans">{buyingCount} වර්ගයක්</strong>
            </div>
            <div>
              <span className="text-stone-400 block">අවසන් යාවත්කාලීනය:</span>
              <strong className="text-sm text-harvest-300 font-medium">අද පෙ.ව. 08:30</strong>
            </div>
            <div>
              <span className="text-stone-400 block">ගෙවීම් තත්ත්වය:</span>
              <strong className="text-sm text-emerald-300 font-medium">එසැනින් ක්ෂණික ගෙවීම්</strong>
            </div>
          </div>
        </div>

        {/* Interactive Calculator (Collapsible or directly shown) */}
        {showCalculator && (
          <div className="animate-fadeIn">
            <PriceCalculator
              grains={grains}
              onSelectGrainForSell={onSelectGrainForSell}
            />
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          
          {/* Top Row: Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ධාන්‍ය වර්ගයේ සිංහල හෝ ඉංග්‍රීසි නමින් සොයන්න... (උදා: සම්බා, කුරක්කන්, මුං ඇට)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 bg-stone-200 px-2 py-0.5 rounded"
              >
                මකන්න
              </button>
            )}
          </div>

          {/* Bottom Row: Category & Status Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-stone-100">
            
            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Layers className="w-4 h-4 text-stone-400 shrink-0 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-brand-forest text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status Dropdown / Filter */}
            <div className="flex items-center space-x-2 shrink-0">
              <Filter className="w-4 h-4 text-stone-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              >
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Advisory Banner (Sample Data Notification) */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">වැදගත් සටහන (ආදර්ශ දත්ත):</span>
            <p className="text-amber-800 leading-relaxed">
              මෙහි සඳහන් කර ඇත්තේ පද්ධතියේ ක්‍රියාකාරිත්වය සඳහා යොදන ලද ආදර්ශ මිල ගණන් (Sample Data) වේ. අනගි ස්ටෝර්ස් සැබෑ මිලදී ගැනීමේ මිල ගණන් දිනපතා ආයතනය මඟින් යාවත්කාලීන කරනු ඇත.
            </p>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse space-y-4">
                <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-20 bg-stone-100 rounded-xl"></div>
                <div className="h-10 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Grain Cards Grid */}
        {!isLoading && filteredGrains.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrains.map((grain) => {
              const isBuying = grain.buyingStatus === 'BUYING';
              const isLimited = grain.buyingStatus === 'LIMITED';
              const isPaused = grain.buyingStatus === 'PAUSED';

              return (
                <div
                  key={grain.id}
                  className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-premium-hover ${
                    isPaused ? 'border-stone-200 opacity-80 bg-stone-50/60' : 'border-stone-200 hover:-translate-y-1'
                  }`}
                >
                  <div>
                    {/* Category & Status Badges */}
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

                    {/* Price Card Block */}
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                          මිලදී ගැනීමේ මිල:
                        </span>
                        {grain.trend === 'UP' && (
                          <span className="inline-flex items-center space-x-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <TrendingUp className="w-3 h-3" />
                            <span>+රු.{grain.trendValue}</span>
                          </span>
                        )}
                        {grain.trend === 'DOWN' && (
                          <span className="inline-flex items-center space-x-0.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            <TrendingDown className="w-3 h-3" />
                            <span>-රු.{grain.trendValue}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-brand-900 font-sans">
                          රු. {grain.currentPricePerKg}
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          / {grain.unit}
                        </span>
                      </div>
                    </div>

                    {/* Quality Grade Requirements */}
                    <div className="space-y-2 text-xs text-stone-600 pb-2">
                      <div className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{grain.gradeDescriptionSinhala}</span>
                      </div>
                      {grain.notesSinhala && (
                        <p className="text-[11px] text-stone-500 italic pl-5">
                          *{grain.notesSinhala}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Timestamp & Sell Action */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-stone-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{grain.lastUpdated}</span>
                    </span>

                    {isPaused ? (
                      <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-lg">
                        තාවකාලිකව නවතා ඇත
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectGrainForSell(grain.id)}
                        className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 shadow-gold transition-all duration-200 transform hover:scale-105"
                      >
                        <span>අලෙවි කරන්න</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredGrains.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-heading">
              ධාන්‍ය වර්ගයක් හමු නොවීය
            </h3>
            <p className="text-xs text-stone-500">
              ඔබ සෙවූ &ldquo;{searchQuery}&rdquo; නමින් ධාන්‍ය වර්ගයක් ලැයිස්තුවේ නොමැත. කරුණාකර අක්ෂර වින්‍යාසය පරීක්ෂා කරන්න.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
            >
              සියලු පෙරහන් ඉවත් කරන්න
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
