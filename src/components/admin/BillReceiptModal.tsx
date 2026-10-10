import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { BillItem } from '../../services/types';
import { BUSINESS_INFO } from '../../data/sampleGrains';

interface BillReceiptModalProps {
  bill: BillItem | null;
  onClose: () => void;
}

export const BillReceiptModal: React.FC<BillReceiptModalProps> = ({ bill, onClose }) => {
  if (!bill) return null;

  const isIncoming = bill.billType === 'INCOMING';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full text-white shadow-2xl animate-scaleIn my-auto overflow-hidden">
        
        {/* Modal Action Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70 print:hidden">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isIncoming 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {isIncoming ? 'මිලදී ගැනීමේ බිල්පත (Incoming)' : 'විකිණීමේ බිල්පත (Outgoing)'}
            </span>
            <span className="font-mono text-xs text-stone-400 font-semibold">{bill.billNumber}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-xs shadow-gold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>මුද්‍රණය කරන්න (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white text-stone-900 print:p-0 print:m-0 space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-stone-900 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="/6ecf88c0-2f28-4bec-98b0-d155c7965c98.png" 
                  alt="Anagi-Stores" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-heading text-emerald-950 leading-tight">
                  {BUSINESS_INFO.nameSinhala}
                </h1>
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  {BUSINESS_INFO.nameEnglish} • ගොවිපළ ධාන්‍ය එකතු කිරීම
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {BUSINESS_INFO.addressSinhala} | දුරකථන: {BUSINESS_INFO.hotline}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1 text-right">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">බිල්පත් වර්ගය</span>
                <span className={`text-xs font-black ${isIncoming ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {isIncoming ? 'මිලදී ගැනීම (PURCHASE)' : 'විකිණීම (SALES)'}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Title & Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="space-y-1">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">බිල්පත් අංකය:</span>
                <span className="font-mono font-black text-stone-900 text-sm">{bill.billNumber}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">දිනය:</span>
                <span className="font-bold text-stone-800">{bill.billDate}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">
                  {isIncoming ? 'ගොවි මහතා / සැපයුම්කරු:' : 'පාරිභෝගිකයා / ගැනුම්කරු:'}
                </span>
                <span className="font-bold text-stone-900 text-sm block">{bill.partyName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">දුරකථන අංකය:</span>
                <span className="font-mono font-bold text-stone-800">{bill.phone}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-stone-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900 text-white font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">ධාන්‍ය වර්ගය</th>
                  <th className="p-3 text-right">ප්‍රමාණය (Kg)</th>
                  <th className="p-3 text-right">ඒකක මිල (රු.)</th>
                  <th className="p-3 text-right">මුළු එකතුව (රු.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                <tr>
                  <td className="p-3.5 font-bold text-stone-900">
                    <div className="text-sm font-black">{bill.grainNameSinhala}</div>
                    {bill.notes && (
                      <div className="text-[11px] text-stone-500 italic mt-0.5 font-normal">
                        සටහන්: {bill.notes}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-stone-900 text-sm">
                    {bill.quantityKg.toLocaleString()} Kg
                    {bill.quantityKg >= 1000 && (
                      <span className="block text-[10px] text-stone-500 font-normal">
                        (ටොන් {(bill.quantityKg / 1000).toFixed(2)})
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-stone-900 text-sm">
                    {bill.pricePerKg.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-emerald-950 text-base">
                    {bill.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-900">
                <tr>
                  <td colSpan={3} className="p-3 text-right text-xs uppercase tracking-wider text-stone-700">
                    ගෙවිය යුතු මුළු ශුද්ධ මුදල (Net Total):
                  </td>
                  <td className="p-3 text-right font-mono font-black text-emerald-900 text-lg">
                    රු. {bill.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status & Verification */}
          <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ගෙවීම් තත්ත්වය: සම්පූර්ණ කරන ලදි (COMPLETED)</span>
            </div>
            <div className="text-stone-500 text-[10px] font-mono">
              නිකුත් කළ වේලාව: {new Date(bill.createdAt).toLocaleTimeString('si-LK')}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-stone-400 text-center text-xs">
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1"></div>
              <span className="text-stone-600 font-bold">ගනුදෙනුකරුගේ අත්සන</span>
            </div>
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1"></div>
              <span className="text-stone-600 font-bold">අනගි ස්ටෝර්ස් වෙනුවෙන්</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 text-[11px] text-stone-500 font-medium">
            ඔබේ විශ්වාසවන්ත ධාන්‍ය වෙළඳ සහකරුවා — අනගි ස්ටෝර්ස්. ස්තූතියි!
          </div>

        </div>

      </div>
    </div>
  );
};
