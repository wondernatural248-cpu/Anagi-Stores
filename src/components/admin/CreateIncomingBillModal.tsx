import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, RefreshCw, AlertCircle, Calculator, CheckCircle2, User, Phone, Calendar, FileText } from 'lucide-react';
import { GrainItem, BillItem } from '../../services/types';
import { billingService } from '../../services/billingService';

interface CreateIncomingBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  grains: GrainItem[];
  preselectedGrainId?: string;
  onBillCreated: (bill: BillItem) => void;
}

export const CreateIncomingBillModal: React.FC<CreateIncomingBillModalProps> = ({
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

  // Update selected grain and default price
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
      setPricePerKg(selectedGrain.currentPricePerKg);
    }
  }, [selectedGrain]);

  if (!isOpen) return null;

  const currentStock = selectedGrain ? (Number(selectedGrain.currentStockKg) || 0) : 0;
  const numQty = typeof quantityKg === 'number' ? quantityKg : 0;
  const numPrice = typeof pricePerKg === 'number' ? pricePerKg : 0;
  const totalAmount = Math.round(numQty * numPrice * 100) / 100;
  const stockAfter = currentStock + numQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!partyName.trim()) {
      setErrorMessage('කරුණාකර ගොවි මහතාගේ හෝ සැපයුම්කරුගේ නම ඇතුළත් කරන්න.');
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
      setErrorMessage('වලංගු මිලදී ගැනීමේ මිලක් ඇතුළත් කරන්න.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await billingService.createIncomingBill({
        billType: 'INCOMING',
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
      console.error('Incoming bill submit error:', err);
      setErrorMessage(err.message || 'බිල්පත ඇතුළත් කිරීමේදී දෝෂයක් මතු විය.');
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
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-heading">
                තොග මිලදී ගැනීම (ඇතුළත් කිරීමේ බිල්පත)
              </h3>
              <p className="text-[11px] text-stone-400">
                ගොවීන්ගෙන් ධාන්‍ය මිලදී ගෙන තොගයට එකතු කිරීම
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
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Supplier Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-harvest-400" />
                <span>ගොවි මහතා / සැපයුම්කරුගේ නම *</span>
              </label>
              <input
                type="text"
                placeholder="උදා: එම්. කේ. සෝමපාල මහතා"
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
                placeholder="077-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                required
              />
            </div>
          </div>

          {/* Grain Selection */}
          <div className="space-y-1">
            <label className="text-stone-300 font-semibold">මිලදී ගන්නා ධාන්‍ය වර්ගය *</label>
            <select
              value={grainId}
              onChange={(e) => {
                const newId = e.target.value;
                setGrainId(newId);
                const g = grains.find(item => item.id === newId);
                if (g) setPricePerKg(g.currentPricePerKg);
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-harvest-500"
              required
            >
              {grains.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameSinhala} — (දැනට තොගය: {g.currentStockKg || 0} Kg | මිල: රු. {g.currentPricePerKg}/Kg)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Price per Kg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">මිලදී ගන්නා ප්‍රමාණය (Kg) *</label>
              <input
                type="number"
                step="any"
                min="0.1"
                placeholder="උදා: 500"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white font-sans text-sm font-bold focus:outline-none focus:ring-1 focus:ring-harvest-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-semibold">ඒකක මිල (රු. / 1 Kg) *</label>
              <input
                type="number"
                step="0.50"
                min="0"
                placeholder="උදා: 145"
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
                placeholder="උදා: තෙතමනය 13.5%, ගෝනි 10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
              />
            </div>
          </div>

          {/* Dynamic Summary Panel */}
          <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span>පවතින තොගය:</span>
              <span className="font-mono font-bold text-stone-200">{currentStock.toLocaleString()} Kg</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>එකතු වන තොගය:</span>
              <span className="font-mono font-bold">+{numQty.toLocaleString()} Kg</span>
            </div>
            <div className="flex items-center justify-between text-stone-300 border-t border-stone-800 pt-1.5">
              <span className="font-semibold">නව තොග ශේෂය (New Stock):</span>
              <span className="font-mono font-bold text-white text-sm">
                {stockAfter.toLocaleString()} Kg 
                {stockAfter >= 1000 && <span className="text-stone-400 text-[10px] ml-1">(ටොන් {(stockAfter / 1000).toFixed(2)})</span>}
              </span>
            </div>

            <div className="border-t border-dashed border-stone-700 pt-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-harvest-400 font-bold">
                <Calculator className="w-4 h-4" />
                <span>ගෙවිය යුතු මුළු මුදල:</span>
              </div>
              <span className="text-lg font-mono font-extrabold text-harvest-400">
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
              disabled={isSubmitting || numQty <= 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ඇතුළත් වෙමින් පවතී...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>බිල්පත නිකුත් කර තොගයට එක් කරන්න</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
