import React, { useState } from 'react';
import { 
  Truck, 
  Send, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageSquare,
  ShieldCheck,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GrainItem, PickupRequest } from '../../services/types';
import { requestService } from '../../services/requestService';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface PickupFormProps {
  grains: GrainItem[];
}

export const PickupForm: React.FC<PickupFormProps> = ({ grains }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [selectedGrainId, setSelectedGrainId] = useState(grains[0]?.id || '');
  const [quantityKg, setQuantityKg] = useState<number | string>(1000);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('පෙ.ව. 09:00 - 12:00');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPickup, setSubmittedPickup] = useState<PickupRequest | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const selectedGrain = grains.find((g) => g.id === selectedGrainId) || grains[0];
  const numQuantity = Number(quantityKg) || 0;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errs.customerName = 'කරුණාකර ඔබගේ නම ඇතුළත් කරන්න.';
    }

    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phoneNumber = 'කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.';
    } else if (!/^(?:0|94|\+94)?[0-9]{9,10}$/.test(cleanPhone)) {
      errs.phoneNumber = 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.';
    }

    if (!address.trim()) {
      errs.address = 'කරුණාකර නිවස/ගොවිපළ පිහිටි ලිපිනය ඇතුළත් කරන්න.';
    }

    if (!area.trim()) {
      errs.area = 'කරුණාකර ප්‍රදේශය හෝ දිස්ත්‍රික්කය සඳහන් කරන්න.';
    }

    if (!numQuantity || numQuantity < 100) {
      errs.quantityKg = 'නිවසටම පැමිණීමේ සේවාව සඳහා අවම ප්‍රමාණය කි.ග්‍රෑ. 100කි.';
    }

    if (!preferredDate) {
      errs.preferredDate = 'කරුණාකර පැමිණීමට කැමති දිනයක් තෝරන්න.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const created = await requestService.submitPickupRequest({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        area: area.trim(),
        grainId: selectedGrainId,
        grainNameSinhala: selectedGrain ? selectedGrain.nameSinhala : 'ධාන්‍ය වර්ගය',
        quantityKg: numQuantity,
        preferredDate,
        preferredTime,
        additionalNotes: additionalNotes.trim() || undefined,
      });

      setSubmittedPickup(created);
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#16A34A', '#D97706', '#14532D']
        });
      } catch {
        // Confetti fallback
      }
    } catch {
      setIsSubmitting(false);
      alert('ඉල්ලීම යොමු කිරීමේදී ගැටලුවක් මතු විය. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
  };

  const handleCopyRef = () => {
    if (submittedPickup) {
      navigator.clipboard.writeText(submittedPickup.referenceNo);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const resetForm = () => {
    setSubmittedPickup(null);
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
    setArea('');
    setQuantityKg(1000);
    setPreferredDate('');
    setAdditionalNotes('');
    setErrors({});
  };

  return (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-brand-forest via-brand-deep to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-premium border border-harvest-500/30 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-harvest-500/20 text-harvest-300 border border-harvest-500/30 text-xs font-bold">
              <Truck className="w-3.5 h-3.5 text-harvest-400" />
              <span>නිවසටම / ගොවිපළටම පැමිණීමේ සේවාව</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight">
              ඔබ සතුව විශාල ධාන්‍ය ප්‍රමාණයක් තිබේද?
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              ඔබගේ නිවසට හෝ ගබඩාවටම අපගේ ලොරි රථ සහ ඩිජිටල් තරාදි සමඟින් පැමිණ, සියලු ධාන්‍ය කිරා බලා ක්ෂණිකව මුදල් ගෙවා රැගෙන යාමට අපගේ ප්‍රවාහන සේවාව සූදානම්ය.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="mt-8 pt-6 border-t border-brand-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center space-x-2 bg-brand-900/60 p-2.5 rounded-xl border border-brand-700/50">
              <Scale className="w-4 h-4 text-harvest-400 shrink-0" />
              <span>ස්ථානයේදීම නිවැරදි ඩිජිටල් කිරුම්</span>
            </div>
            <div className="flex items-center space-x-2 bg-brand-900/60 p-2.5 rounded-xl border border-brand-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>එසැනින් මුදල් හෝ බැංකු ගිණුමට</span>
            </div>
            <div className="flex items-center space-x-2 bg-brand-900/60 p-2.5 rounded-xl border border-brand-700/50">
              <Truck className="w-4 h-4 text-harvest-400 shrink-0" />
              <span>ප්‍රවාහන වියදම් සම්පූර්ණයෙන්ම නොමිලේ</span>
            </div>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {submittedPickup ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-premium space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900">
                රැගෙන යාමේ ඉල්ලීම සාර්ථකව යොමු විය!
              </h2>
              <p className="text-sm text-stone-600">
                ස්තූතියි <strong>{submittedPickup.customerName}</strong>, ඔබගේ තොග රැගෙන යාමේ ඉල්ලීම අපගේ ප්‍රවාහන අංශය වෙත ලැබී ඇත.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 max-w-md mx-auto space-y-3">
              <span className="text-xs text-stone-500 font-semibold block uppercase">
                ප්‍රවාහන ඉල්ලුම් යොමු අංකය (Reference No):
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl font-black text-brand-900 font-mono tracking-wider">
                  {submittedPickup.referenceNo}
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

            {/* Pickup Details Table */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 max-w-md mx-auto text-xs text-stone-700 space-y-2 text-left">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">ධාන්‍ය වර්ගය:</span>
                <span className="font-bold text-stone-900">{submittedPickup.grainNameSinhala}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">ආසන්න ප්‍රමාණය:</span>
                <span className="font-bold text-stone-900">{submittedPickup.quantityKg} Kg (ටොන් {(submittedPickup.quantityKg / 1000).toFixed(2)})</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">දිනය සහ වේලාව:</span>
                <span className="font-semibold text-stone-900">{submittedPickup.preferredDate} | {submittedPickup.preferredTime}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-500">ලිපිනය:</span>
                <span className="font-semibold text-stone-900 text-right">{submittedPickup.address}, {submittedPickup.area}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  `ආයුබෝවන් අනගි ස්ටෝර්ස්, මගේ තොග රැගෙන යාමේ ඉල්ලුම් අංකය ${submittedPickup.referenceNo} (${submittedPickup.grainNameSinhala}, ${submittedPickup.quantityKg}kg, ${submittedPickup.area}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp මඟින් දැනුම් දෙන්න</span>
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
          /* Pickup Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-premium space-y-6"
          >
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-lg font-bold text-stone-900 font-heading">
                ප්‍රවාහන ඉල්ලුම් පත්‍රය (Bulk Pickup Request)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                පහත විස්තර නිවැරදිව පුරවන්න. අපගේ ප්‍රවාහන සැලසුම් අංශය ඔබව අමතා වේලාව තහවුරු කරගනු ඇත.
              </p>
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
                  placeholder="උදා: කේ. ජයතිලක"
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

              {/* Field: Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-forest" />
                  <span>දුරකථන අංකය *</span>
                </label>
                <input
                  type="tel"
                  placeholder="උදා: 071 234 5678"
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
                <label className="block text-xs font-bold text-stone-700">
                  ධාන්‍ය වර්ගය *
                </label>
                <select
                  value={selectedGrainId}
                  onChange={(e) => setSelectedGrainId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900 font-medium"
                >
                  {grains.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameSinhala} (රු. {g.currentPricePerKg}/=)
                    </option>
                  ))}
                </select>
              </div>

              {/* Field: Approximate Quantity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  ආසන්න ප්‍රමාණය (කි.ග්‍රෑ. වලින්) *
                </label>
                <input
                  type="number"
                  min="100"
                  placeholder="උදා: 1500 (කි.ග්‍රෑ.)"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 font-bold ${
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

              {/* Field: Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-forest" />
                  <span>සම්පූර්ණ ලිපිනය (වාහනය පැමිණිය යුතු ස්ථානය) *</span>
                </label>
                <input
                  type="text"
                  placeholder="උදා: නො. 45, ගොවිපළ පාර, ඇපලවත්ත"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 ${
                    errors.address ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* Field: Area / District */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  ප්‍රදේශය / දිස්ත්‍රික්කය *
                </label>
                <input
                  type="text"
                  placeholder="උදා: අනුරාධපුරය / පොලොන්නරුව / කුරුණෑගල"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 ${
                    errors.area ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.area && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.area}</span>
                  </p>
                )}
              </div>

              {/* Field: Preferred Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-forest" />
                  <span>කැමති දිනය *</span>
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-white text-stone-900 ${
                    errors.preferredDate ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-200 focus:ring-brand-emerald'
                  }`}
                />
                {errors.preferredDate && (
                  <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.preferredDate}</span>
                  </p>
                )}
              </div>

              {/* Field: Preferred Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-forest" />
                  <span>කැමති වේලාව</span>
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900"
                >
                  <option value="පෙ.ව. 08:00 - 11:00">පෙ.ව. 08:00 - 11:00 (උදෑසන)</option>
                  <option value="පෙ.ව. 11:00 - ප.ව. 02:00">පෙ.ව. 11:00 - ප.ව. 02:00 (දහවල්)</option>
                  <option value="ප.ව. 02:00 - ප.ව. 05:00">ප.ව. 02:00 - ප.ව. 05:00 (සවස)</option>
                  <option value="ඕනෑම වේලාවක">ඕනෑම වේලාවක (Any time)</option>
                </select>
              </div>

              {/* Field: Additional Information */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-stone-700">
                  අමතර විස්තර (පැටවීමේ පහසුකම්, පාරේ තත්ත්වය ආදිය)
                </label>
                <textarea
                  rows={3}
                  placeholder="ලොරි රථයකට ගමන් කළ හැකි මාර්ගයක්ද, මිටි කීයක් තිබේද ආදී විස්තර..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900"
                />
              </div>

            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500">
                * ඉල්ලීම යොමු කළ පසු අපගේ ප්‍රවාහන අංශය පැය කිහිපයක් තුළ ඔබ අමතනු ඇත.
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 font-bold text-base shadow-gold transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>ඉල්ලීම යොමු වෙමින් පවතී...</span>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    <span>රැගෙන යාමේ ඉල්ලීම යොමු කරන්න</span>
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
