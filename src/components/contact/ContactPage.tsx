import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Navigation, 
  ExternalLink
} from 'lucide-react';
import { BUSINESS_INFO } from '../../data/sampleGrains';
import { requestService } from '../../services/requestService';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      alert('කරුණාකර නම, දුරකථන අංකය සහ පණිවිඩය ඇතුළත් කරන්න.');
      return;
    }

    setSubmitting(true);
    try {
      await requestService.submitContactMessage(name, phone, subject || 'සාමාන්‍ය විමසීමක්', message);
      setSubmitting(false);
      setSent(true);
    } catch {
      setSubmitting(false);
      alert('පණිවිඩය යැවීමේදී ගැටලුවක් මතු විය.');
    }
  };

  return (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
            <Phone className="w-3.5 h-3.5" />
            <span>සම්බන්ධතා සහ සහාය</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-stone-900">
            අපව අමතන්න සහ පැමිණෙන්න
          </h1>

          <p className="text-sm sm:text-base text-stone-600">
            ඔබේ ධාන්‍ය අස්වැන්නට ඉහළම මිල ලබාගැනීමට ඕනෑම මොහොතක අප හා සම්බන්ධ වන්න.
          </p>
        </div>

        {/* 4 Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Hotline */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-premium-hover transition-all duration-300 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">ක්ෂණික දුරකථන ඇමතුම්</h3>
              <p className="text-xs text-stone-500">
                මිල ගණන් හෝ තොග විමසීම් සඳහා සෘජුවම අමතන්න.
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-1.5">
              <a
                href={`tel:${BUSINESS_INFO.hotline.replace(/\s+/g, '')}`}
                className="block text-sm font-black text-brand-900 hover:text-emerald-600 transition-colors"
              >
                {BUSINESS_INFO.hotline}
              </a>
              <span className="text-xs text-stone-500 block">
                ද්විතීයික: {BUSINESS_INFO.hotlineSecondary}
              </span>
            </div>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm hover:shadow-premium-hover transition-all duration-300 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">WhatsApp පණිවිඩ</h3>
              <p className="text-xs text-stone-500">
                ධාන්‍යවල ඡායාරූප හෝ විස්තර WhatsApp මඟින් එවන්න.
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  'ආයුබෝවන් අනගි ස්ටෝර්ස්, මට ධාන්‍ය අලෙවිය සම්බන්ධයෙන් විස්තර දැනගැනීමට අවශ්‍යයි.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors w-full justify-center"
              >
                <span>WhatsApp ආරම්භ කරන්න</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Opening Hours */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-premium-hover transition-all duration-300 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">විවෘත වේලාවන්</h3>
              <p className="text-xs text-stone-500">
                {BUSINESS_INFO.openingDaysSinhala}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <span className="block text-xs font-bold text-stone-800 bg-stone-50 p-2 rounded-lg border border-stone-100 text-center">
                {BUSINESS_INFO.openingHoursSinhala}
              </span>
            </div>
          </div>

          {/* Card 4: Location */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-premium-hover transition-all duration-300 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">ස්ථානය සහ ලිපිනය</h3>
              <p className="text-xs text-stone-500 leading-snug">
                {BUSINESS_INFO.addressSinhala}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <a
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors w-full justify-center"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-forest" />
                <span>Google Maps මඟින් බලන්න</span>
              </a>
            </div>
          </div>

        </div>

        {/* Map & Inquiry Form Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Map Styled Placeholder Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-heading">
                  අනගි ස්ටෝර්ස් පිහිටීම (Location Map)
                </h3>
                <span className="text-xs text-stone-500">ප්‍රධාන මාර්ගය අසල පහසුවෙන් ළඟාවිය හැකි ස්ථානය</span>
              </div>

              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                විවෘතයි
              </span>
            </div>

            {/* Visual Simulated Map Display */}
            <div className="relative rounded-2xl h-80 bg-gradient-to-br from-stone-200 via-stone-300 to-emerald-100/60 overflow-hidden border border-stone-300 flex items-center justify-center text-center p-6 shadow-inner">
              
              {/* Grid Lines simulation */}
              <div className="absolute inset-0 bg-grain-pattern opacity-30 pointer-events-none"></div>
              
              {/* Map Marker Pin */}
              <div className="relative z-10 flex flex-col items-center space-y-2 animate-bounce">
                <div className="w-14 h-14 rounded-2xl bg-brand-forest text-white p-3 shadow-2xl flex items-center justify-center border-2 border-harvest-400">
                  <MapPin className="w-8 h-8 text-harvest-400" />
                </div>
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg border border-stone-200 text-xs font-bold text-brand-950">
                  අනගි ස්ටෝර්ස් ප්‍රධාන ශාඛාව
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-stone-200 text-xs flex items-center justify-between text-left">
                <div className="truncate pr-2">
                  <span className="font-bold text-stone-900 block truncate">{BUSINESS_INFO.nameSinhala}</span>
                  <span className="text-stone-500 text-[11px] truncate block">{BUSINESS_INFO.addressSinhala}</span>
                </div>
                <a
                  href={BUSINESS_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-brand-forest hover:bg-brand-deep text-white font-bold text-xs shrink-0 flex items-center space-x-1"
                >
                  <span>පාර පෙන්වන්න</span>
                  <Navigation className="w-3 h-3 text-harvest-400" />
                </a>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              * ලොරි, ට්‍රැක්ටර් හෝ වෙනත් ඕනෑම ප්‍රවාහන වාහනයකින් පැමිණ පහසුවෙන් ධාන්‍ය බෑමට හැකි ඉඩකඩ සහිත ගබඩා සංකීර්ණයක් අප සතුව ඇත.
            </p>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-heading">
                පණිවිඩයක් යොමු කරන්න (Quick Message)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                මිල ගණන් හෝ වෙනත් කරුණු පිළිබඳ විමසීමට පහත පෝරමය පුරවන්න.
              </p>
            </div>

            {sent ? (
              <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">පණිවිඩය සාර්ථකව යොමු විය!</h4>
                <p className="text-xs text-emerald-800">
                  අපගේ කාර්ය මණ්ඩලය කඩිනමින් ඔබව සම්බන්ධ කරගනු ඇත.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setPhone('');
                    setSubject('');
                    setMessage('');
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 underline"
                >
                  තවත් පණිවිඩයක් යවන්න
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-700">ඔබගේ නම *</label>
                    <input
                      type="text"
                      placeholder="නම ඇතුළත් කරන්න"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-700">දුරකථන අංකය *</label>
                    <input
                      type="tel"
                      placeholder="07x xxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">විෂය (Subject)</label>
                  <input
                    type="text"
                    placeholder="උදා: වී තොග මිලදී ගැනීම් පිළිබඳ විමසීමක්"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">ඔබගේ පණිවිඩය *</label>
                  <textarea
                    rows={4}
                    placeholder="ඔබට දැනගැනීමට අවශ්‍ය විස්තර මෙහි සඳහන් කරන්න..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:bg-white text-stone-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-forest hover:bg-brand-deep text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  <span>{submitting ? 'යොමු වෙමින් පවතී...' : 'පණිවිඩය යොමු කරන්න'}</span>
                  <Send className="w-4 h-4 text-harvest-400" />
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
