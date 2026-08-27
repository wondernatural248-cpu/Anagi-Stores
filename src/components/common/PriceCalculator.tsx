import React, { useState } from 'react';
import { Calculator, ArrowRight, Check } from 'lucide-react';
import { GrainItem } from '../../services/types';

interface PriceCalculatorProps {
  grains: GrainItem[];
  onSelectGrainForSell: (grainId: string, quantity: number) => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  grains,
  onSelectGrainForSell,
}) => {
  const buyingGrains = grains.filter((g) => g.buyingStatus !== 'PAUSED');
  const [selectedGrainId, setSelectedGrainId] = useState<string>(
    buyingGrains[0]?.id || grains[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(100);
  const [unitType, setUnitType] = useState<'KG' | 'BAG'>('KG'); // 50kg bag

  const selectedGrain = grains.find((g) => g.id === selectedGrainId) || buyingGrains[0];
  const effectiveKg = unitType === 'BAG' ? quantity * 50 : quantity;
  const unitPrice = selectedGrain ? selectedGrain.currentPricePerKg : 0;
  const estimatedTotal = effectiveKg * unitPrice;

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount).replace('LKR', 'රු.');
  };

  return (
    <div className="bg-gradient-to-br from-brand-forest via-brand-deep to-brand-950 rounded-2xl p-6 sm:p-8 text-white shadow-premium border border-harvest-500/30 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-harvest-500/20 border border-harvest-500/40 p-2.5 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-harvest-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading flex items-center space-x-2">
                <span>ධාන්‍ය වටිනාකම ගණනය කර බලන්න</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-harvest-500/20 text-harvest-300 border border-harvest-500/30 font-sans">
                  ක්ෂණික ඇස්තමේන්තුව
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                ඔබ සතු ධාන්‍ය ප්‍රමාණය ඇතුළත් කර ඔබට ලැබෙන ආසන්න මුදල ගණනය කරගන්න.
              </p>
            </div>
          </div>

          <div className="inline-flex p-1 bg-brand-900/90 rounded-xl border border-brand-700/60 self-start sm:self-auto">
            <button
              onClick={() => setUnitType('KG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                unitType === 'KG'
                  ? 'bg-harvest-500 text-brand-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              කිලෝග්‍රෑම් (Kg)
            </button>
            <button
              onClick={() => setUnitType('BAG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                unitType === 'BAG'
                  ? 'bg-harvest-500 text-brand-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              මිටි (50kg බෑග්)
            </button>
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
          
          {/* Select Grain */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-semibold text-harvest-300">
              1. ධාන්‍ය වර්ගය තෝරන්න:
            </label>
            <select
              value={selectedGrainId}
              onChange={(e) => setSelectedGrainId(e.target.value)}
              className="w-full bg-brand-900/90 border border-brand-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-harvest-400 font-medium"
            >
              {grains.map((g) => (
                <option key={g.id} value={g.id} className="bg-brand-950 text-white">
                  {g.nameSinhala} - රු. {g.currentPricePerKg}/=
                </option>
              ))}
            </select>
            {selectedGrain && (
              <span className="text-[11px] text-emerald-300 flex items-center space-x-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>අද දින මිල: <strong>රු. {selectedGrain.currentPricePerKg}.00 / 1kg</strong></span>
              </span>
            )}
          </div>

          {/* Quantity Slider & Input */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-harvest-300">
                2. ප්‍රමාණය ({unitType === 'KG' ? 'කි.ග්‍රෑ.' : 'මිටි'}):
              </label>
              <span className="text-xs font-bold text-white bg-brand-900 px-2 py-0.5 rounded border border-brand-700">
                {quantity} {unitType === 'KG' ? 'Kg' : 'මිටි (Bags)'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="100000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 0))}
                className="w-full bg-brand-900/90 border border-brand-700 rounded-xl px-4 py-2.5 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-harvest-400"
              />
            </div>
            <input
              type="range"
              min="10"
              max={unitType === 'KG' ? 2000 : 50}
              step={unitType === 'KG' ? 10 : 1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-800 rounded-lg appearance-none cursor-pointer accent-harvest-400"
            />
          </div>

          {/* Calculated Output Box */}
          <div className="md:col-span-4 bg-brand-950/90 rounded-xl p-4 border border-harvest-500/40 flex flex-col justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">
                ලබාගත හැකි ඇස්තමේන්තු මුදල:
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-harvest-400 font-sans mt-1">
                {formatLKR(estimatedTotal)}
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                ({effectiveKg.toLocaleString()} kg × රු. {unitPrice}.00)
              </span>
            </div>

            <button
              onClick={() => onSelectGrainForSell(selectedGrainId, effectiveKg)}
              className="mt-3 w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 font-bold text-xs shadow-gold transition-all duration-200"
            >
              <span>මෙම මිලට අලෙවි කරන්න</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
