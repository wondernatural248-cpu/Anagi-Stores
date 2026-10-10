import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, RefreshCw, AlertCircle, Calculator, CheckCircle2, User, Phone, Calendar, FileText } from 'lucide-react';
import { GrainItem, BillItem } from '../../services/types';
import { billingService } from '../../services/billingService';

interface CreateOutgoingBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  grains: GrainItem[];
  preselectedGrainId?: string;
  onBillCreated: (bill: BillItem) => void;
}

export const CreateOutgoingBillModal: React.FC<CreateOutgoingBillModalProps> = ({
  isOpen,
  onClose,
  grains,
  preselectedGrainId,
  onBillCreated
}) => {
  const [partyName, setPartyName] = useState('');
  const [phone, setPhone] = useState('');
  const [grainId, setGrainId] = useState(preselectedGrainId || (grains[0]?.id || ''));
  const [quantityKg, setQuantityKg] = useState<number | ''>('');
  const [pricePerKg, setPricePerKg] = useState<number | ''>('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update selected grain
  useEffect(() => {
    if (preselectedGrainId) {
      setGrainId(preselectedGrainId);
    } else if (grains.length > 0 && !grainId) {
      setGrainId(grains[0].id);
    }
  }, [preselectedGrainId, grains]);

  const selectedGrain = grains.find(g => g.id === grainId);

  useEffect(() => {
    if (selectedGrain && (pricePerKg === '' || pricePerKg === 0)) {
      // Default selling price can be buying price + e.g. 10-20% margin, or currentPrice
      const estSellingPrice = Math.round(selectedGrain.currentPricePerKg * 1.15);
      setPricePerKg(estSellingPrice);
    }
  }, [selectedGrain]);

  if (!isOpen) return null;

  const currentStock = selectedGrain ? (Number(selectedGrain.currentStockKg) || 0) : 0;
  const numQty = typeof quantityKg === 'number' ? quantityKg : 0;
  const numPrice = typeof pricePerKg === 'number' ? pricePerKg : 0;
  const totalAmount = Math.round(numQty * numPrice * 100) / 100;
  const isInsufficientStock = numQty > currentStock;
  const stockAfter = Math.max(0, currentStock - numQty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!partyName.trim()) {
      setErrorMessage('කරුණාකර පාරිභෝගිකයාගේ හෝ ගැනුම්කරුගේ නම ඇතුළත් කරන්න.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('කරුණාකර දුරකථන අංකය ඇතුළත් කරන්න.');
      return;
    }

    if (!grainId) {
      setErrorMessage('කරුණාකර ධාන්‍ය වර්ගයක් තෝරන්න.');
      return;
    }

    if (!numQty || numQty <= 0) {
      setErrorMessage('වලංගු ධාන්‍ය ප්‍රමාණයක් (Kg) ඇතුළත් කරන්න.');
      return;
    }

    if (numPrice < 0) {
      setErrorMessage('වලංගු විකුණුම් මිලක් ඇතුළත් කරන්න.');
      return;
    }

    // STRICT STOCK CHECK: Reject before submit if insufficient
    if (isInsufficientStock) {
      setErrorMessage(`ප්‍රමාණවත් තොගයක් නොමැත. (පවතින තොගය: ${currentStock} Kg, ඉල්ලූ ප්‍රමාණය: ${numQty} Kg)`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await billingService.createOutgoingBill({
        billType: 'OUTGOING',
        partyName: partyName.trim(),
        phone: phone.trim(),
        grainId,
        quantityKg: numQty,
        pricePerKg: numPrice,
        billDate,
        notes: notes.trim() || undefined
      }, selectedGrain?.nameSinhala);

      onBillCreated(result.bill);
      onClose();
    } catch (err: any) {
      console.error('Outgoing bill submit error:', err);
      setErrorMessage(err.message || 'විකිණුම් බිල්පත නිකුත් කිරීමේදී දෝෂයක් මතු විය.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full text-white shadow-2xl animate-scaleIn my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-heading">
                තොග විකිණීම (නිකුත් කිරීමේ බිල්පත)
              </h3>
              <p className="text-[11px] text-stone-400">
                ගැනුම්කරුවන්ට ධාන්‍ය විකිණීම සහ තොගයෙන් අඩු කිරීම
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-700 text-rose-200 rounded-xl flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Insufficient stock warning banner */}
          {isInsufficientStock && numQty > 0 && (
            <div className="p-3 bg-rose-950/90 border border-rose-600 text-rose-200 rounded-xl flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-rose-100">ප්‍රමාණවත් තොගයක් නොමැත!</span>
                <p className="text-[11px] text-rose-300">
                  පවතින තොගය: <strong className="text-white">{currentStock} Kg</strong> වන අතර ඔබ නිකුත් කිරීමට උත්සාහ කරන්නේ <strong className="text-rose-200">{numQty} Kg</strong> කි. කරුණාකර ප්‍රමාණය සංශෝධනය කරන්න.
                </p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-harvest-400" />
                <span>පාරිභෝගිකයා / ගැනුම්කරුගේ නම *</span>
              </label>
              <input
                type="text"
                placeholder="උදා: රත්නායක ට්‍රේඩර්ස්"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-harvest-400" />
                <span>දුරකථන අංකය *</span>
              </label>
              <input
                type="tel"
                placeholder="071-9876543"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                required
              />
            </div>
          </div>

          {/* Grain Selection */}
          <div className="space-y-1">
            <label className="text-stone-300 font-semibold">විකුණන ධාන්‍ය වර්ගය *</label>
            <select
              value={grainId}
              onChange={(e) => {
                const newId = e.target.value;
                setGrainId(newId);
                const g = grains.find(item => item.id === newId);
                if (g) setPricePerKg(Math.round(g.currentPricePerKg * 1.15));
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-harvest-500"
              required
            >
              {grains.map((g) => {
                const stk = Number(g.currentStockKg) || 0;
                return (
                  <option key={g.id} value={g.id} disabled={stk <= 0}>
                    {g.nameSinhala} — (පවතින තොගය: {stk} Kg {stk <= 0 ? '❌ තොග අවසන්' : '✅'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity & Price per Kg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">විකුණන ප්‍රමාණය (Kg) *</label>
              <input
                type="number"
                step="any"
                min="0.1"
                max={currentStock > 0 ? currentStock : undefined}
                placeholder={`උපරිම ${currentStock} Kg`}
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full bg-stone-950 border rounded-xl px-3.5 py-2.5 text-white font-sans text-sm font-bold focus:outline-none focus:ring-1 ${
                  isInsufficientStock && numQty > 0
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-stone-700 focus:ring-harvest-500'
                }`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">විකුණුම් මිල (රු. / 1 Kg) *</label>
              <input
                type="number"
                step="0.50"
                min="0"
                placeholder="උදා: 175"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white font-sans text-sm font-bold focus:outline-none focus:ring-1 focus:ring-harvest-500"
                required
              />
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>බිල්පත් දිනය</span>
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>විශේෂ සටහන් (Notes)</span>
              </label>
              <input
                type="text"
                placeholder="උදා: මුදල් ගෙවන ලදි, ලොරි අංකය WP-CA-1234"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
              />
            </div>
          </div>

          {/* Dynamic Summary Panel */}
          <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span>දැනට පවතින තොගය:</span>
              <span className="font-mono font-bold text-stone-200">{currentStock.toLocaleString()} Kg</span>
            </div>
            <div className={`flex items-center justify-between ${isInsufficientStock ? 'text-rose-400 font-bold' : 'text-amber-400'}`}>
              <span>අඩු වන තොගය:</span>
              <span className="font-mono font-bold">-{numQty.toLocaleString()} Kg</span>
            </div>
            <div className="flex items-center justify-between text-stone-300 border-t border-stone-800 pt-1.5">
              <span className="font-semibold">ඉතිරි වන තොගය (Remaining Stock):</span>
              <span className={`font-mono font-bold text-sm ${isInsufficientStock ? 'text-rose-400' : 'text-white'}`}>
                {stockAfter.toLocaleString()} Kg 
                {stockAfter >= 1000 && <span className="text-stone-400 text-[10px] ml-1">(ටොන් {(stockAfter / 1000).toFixed(2)})</span>}
              </span>
            </div>

            <div className="border-t border-dashed border-stone-700 pt-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                <Calculator className="w-4 h-4" />
                <span>මුළු විකුණුම් එකතුව:</span>
              </div>
              <span className="text-lg font-mono font-extrabold text-amber-400">
                රු. {totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition-colors"
            >
              අවලංගු කරන්න
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numQty <= 0 || isInsufficientStock || currentStock <= 0}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg transition-all flex items-center space-x-2 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>නිකුත් කරමින් පවතී...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>බිල්පත නිකුත් කර තොගයෙන් අඩු කරන්න</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
