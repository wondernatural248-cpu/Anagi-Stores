import React, { useState, useEffect } from 'react';
import { 
  BadgePercent, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  Phone, 
  User, 
  MapPin, 
  FileText, 
  Copy, 
  Check, 
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GrainItem, SellRequest } from '../../services/types';
import { requestService } from '../../services/requestService';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface SellFormProps {
  grains: GrainItem[];
  preSelectedGrainId?: string;
  initialQuantity?: number;
}

export const SellForm: React.FC<SellFormProps> = ({
  grains,
  preSelectedGrainId,
  initialQuantity = 100,
}) => {
  const buyingGrains = grains.filter((g) => g.buyingStatus !== 'PAUSED');

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGrainId, setSelectedGrainId] = useState(
    preSelectedGrainId || buyingGrains[0]?.id || grains[0]?.id || ''
  );
  const [quantityKg, setQuantityKg] = useState<number | string>(initialQuantity);
  const [location, setLocation] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<SellRequest | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    if (preSelectedGrainId) {
      setSelectedGrainId(preSelectedGrainId);
    }
  }, [preSelectedGrainId]);

  const selectedGrain = grains.find((g) => g.id === selectedGrainId) || buyingGrains[0];
  const numQuantity = Number(quantityKg) || 0;
  const unitPrice = selectedGrain ? selectedGrain.currentPricePerKg : 0;
  const estimatedTotal = numQuantity * unitPrice;

  // Validation
  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errs.customerName = 'කරුණාකර ඔබගේ නම ඇතුළත් කරන්න.';
    }

    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phoneNumber = 'කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.';
    } else if (!/^(?:0|94|\+94)?[0-9]{9,10}$/.test(cleanPhone)) {
      errs.phoneNumber = 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0771234567).';
    }

    if (!selectedGrainId) {
      errs.selectedGrainId = 'කරුණාකර ධාන්‍ය වර්ගය තෝරන්න.';
    }

    if (!numQuantity || numQuantity <= 0) {
      errs.quantityKg = 'කරුණාකර වලංගු ධාන්‍ය ප්‍රමාණයක් ඇතුළත් කරන්න.';
    } else if (selectedGrain && numQuantity < selectedGrain.minQuantityKg) {
      errs.quantityKg = `අවම මිලදී ගැනීමේ ප්‍රමාණය කි.ග්‍රෑ. ${selectedGrain.minQuantityKg} කි.`;
    }

    if (!location.trim()) {
      errs.location = 'කරුණාකර ඔබගේ ප්‍රදේශය හෝ නගරය ඇතුළත් කරන්න.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const created = await requestService.submitSellRequest({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        grainId: selectedGrainId,
        grainNameSinhala: selectedGrain ? selectedGrain.nameSinhala : 'ධාන්‍ය වර්ගය',
        quantityKg: numQuantity,
        unitPrice,
        estimatedTotal,
        location: location.trim(),
        additionalMessage: additionalMessage.trim() || undefined,
      });

      setSubmittedRequest(created);
      setIsSubmitting(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#16A34A', '#D97706', '#14532D']
        });
      } catch {
        // Confetti optional
      }
    } catch {
      setIsSubmitting(false);
      alert('ඉල්ලීම යොමු කිරීමේදී ගැටලුවක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
  };

  const handleCopyRef = () => {
    if (submittedRequest) {
      navigator.clipboard.writeText(submittedRequest.referenceNo);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const resetForm = () => {
    setSubmittedRequest(null);
    setCustomerName('');
    setPhoneNumber('');
    setQuantityKg(100);
    setLocation('');
    setAdditionalMessage('');
    setErrors({});
  };

  return (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-harvest-500/15 text-harvest-800 text-xs font-bold border border-harvest-500/30">
            <BadgePercent className="w-3.5 h-3.5 text-harvest-600" />
            <span>සෘජු මිලදී ගැනීමේ සේවාව</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-stone-900">
            ඔබේ ධාන්‍ය අපට අලෙවි කරන්න
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto">
            ඔබ සතු ධාන්‍ය තොග පිළිබඳ විස්තර පහත පෝරමයට ඇතුළත් කරන්න. අපගේ නියෝජිතයෙකු ඉතා කෙටි වේලාවකින් ඔබ හා සම්බන්ධ වනු ඇත.
          </p>
        </div>

        {/* Success Confirmation Card Modal */}
        {submittedRequest ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-premium space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900">
                ඔබගේ ඉල්ලීම සාර්ථකව යොමු විය!
              </h2>
              <p className="text-sm text-stone-600">
                ස්තූතියි <strong>{submittedRequest.customerName}</strong>, ඔබගේ ධාන්‍ය අලෙවි කිරීමේ ඉල්ලීම අනගි ස්ටෝර්ස් පද්ධතියට ලියාපදිංචි විය.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 max-w-md mx-auto space-y-3">
              <span className="text-xs text-stone-500 font-semibold block uppercase">
                ඔබේ යොමු අංකය (Reference No):
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl font-black text-brand-900 font-mono tracking-wider">
                  {submittedRequest.referenceNo}
                </span>
                <button
                  onClick={handleCopyRef}
                  className="p-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors"
                  title="Copy Reference"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Request Summary Details */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 max-w-md mx-auto text-xs text-stone-700 space-y-2 text-left">
              <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                <span className="text-stone-500">ධාන්‍ය වර්ගය:</span>
                <span className="font-bold text-stone-900">{submittedRequest.grainNameSinhala}</span>
              </div>
              <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                <span className="text-stone-500">ප්‍රමාණය:</span>
                <span className="font-bold text-stone-900">{submittedRequest.quantityKg} Kg</span>
              </div>
              <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                <span className="text-stone-500">ඇස්තමේන්තු වටිනාකම:</span>
                <span className="font-bold text-emerald-800 text-sm font-sans">
                  රු. {submittedRequest.estimatedTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-500">ප්‍රදේශය:</span>
                <span className="font-semibold text-stone-900">{submittedRequest.location}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  `ආයුබෝවන් අනගි ස්ටෝර්ස්, මගේ ධාන්‍ය අලෙවි ඉල්ලුම් යොමු අංකය ${submittedRequest.referenceNo} (${submittedRequest.grainNameSinhala}, ${submittedRequest.quantityKg}kg).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp මඟින් සම්බන්ධ වන්න</span>
              </a>

              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-colors"
              >
                තවත් ඉල්ලීමක් යොමු කරන්න
              </button>
            </div>
          </div>
        ) : (
          /* The Main Selling Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-premium space-y-8"
          >
            
            {/* Live Calculation Banner */}
            <div className="bg-gradient-to-br from-brand-forest via-brand-deep to-brand-950 rounded-2xl p-5 text-white border border-harvest-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-harvest-500/20 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5 text-harvest-400" />
                </div>
                <div>
                  <span className="text-xs text-stone-300 block">ලබාගත හැකි ආසන්න මුදල:</span>
                  <span className="text-2xl font-extrabold text-harvest-400 font-sans">
                    රු. {estimatedTotal.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {selectedGrain && (
                <div className="text-xs text-stone-300 bg-brand-900/80 px-3 py-1.5 rounded-lg border border-brand-700">
                  <span>අද දින මිල: </span>
                  <strong className="text-white">රු. {selectedGrain.currentPricePerKg} / 1kg</strong>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Field: Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-brand-forest" />
                  <span>ඔබගේ නම *</span>
                </label>
                <input
                  type="text"
                  placeholder="උදා: එස්. පී. කරුණාරත්න"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 transition-all ${
                    errors.customerName ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              {/* Field: Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-forest" />
                  <span>දුරකථන අංකය *</span>
                </label>
                <input
                  type="tel"
                  placeholder="උදා: 077 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 transition-all ${
                    errors.phoneNumber ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phoneNumber}</span>
                  </p>
                )}
              </div>

              {/* Field: Grain Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <BadgePercent className="w-3.5 h-3.5 text-brand-forest" />
                  <span>ධාන්‍ය වර්ගය *</span>
                </label>
                <select
                  value={selectedGrainId}
                  onChange={(e) => setSelectedGrainId(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 transition-all font-medium ${
                    errors.selectedGrainId ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                >
                  {grains.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameSinhala} (රු. {g.currentPricePerKg}/=) {g.buyingStatus === 'PAUSED' ? '- [තාවකාලිකව නවතා ඇත]' : ''}
                    </option>
                  ))}
                </select>
                {errors.selectedGrainId && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.selectedGrainId}</span>
                  </p>
                )}
              </div>

              {/* Field: Quantity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <Calculator className="w-3.5 h-3.5 text-brand-forest" />
                  <span>ආසන්න ප්‍රමාණය (කි.ග්‍රෑ. වලින්) *</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="උදා: 250"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 transition-all font-bold ${
                    errors.quantityKg ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.quantityKg && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.quantityKg}</span>
                  </p>
                )}
              </div>

              {/* Field: Location / Area */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-forest" />
                  <span>ඔබගේ ප්‍රදේශය / නගරය *</span>
                </label>
                <input
                  type="text"
                  placeholder="උදා: තඹුත්තේගම / ගල්ගමුව / අනුරාධපුරය"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 transition-all ${
                    errors.location ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.location && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>

              {/* Field: Additional Message */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-forest" />
                  <span>අමතර විස්තර / සටහන් (අවශ්‍ය නම් පමණක්)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="තෙතමනය, ඇසුරුම් කළ ආකාරය හෝ වෙනත් කරුණු මෙහි සටහන් කරන්න..."
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900 transition-all"
                />
              </div>

            </div>

            {/* Submission Button */}
            <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500 text-center sm:text-left">
                * ඔබගේ තොරතුරු රහස්‍යභාවයෙන් යුතුව සුරක්ෂිතව තබාගනු ලැබේ.
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 font-bold text-base shadow-gold transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>ඉල්ලීම යොමු වෙමින් පවතී...</span>
                ) : (
                  <>
                    <span>ඉල්ලීම යොමු කරන්න</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
