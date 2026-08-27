import React from 'react';
import { Users, ShieldCheck, X, ArrowRight, Sprout, Lock } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: () => void;
  onSelectAdmin: () => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  onSelectAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 max-w-lg w-full text-stone-900 shadow-2xl space-y-6 animate-scaleIn relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-800 mx-auto flex items-center justify-center border border-brand-200">
            <Sprout className="w-8 h-8 text-brand-700" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900">
            ඔබට අවශ්‍ය සේවාව තෝරන්න
          </h2>

          <p className="text-xs sm:text-sm text-stone-600">
            අනගි ස්ටෝර්ස් පද්ධතිය තුළින් ඔබට අවශ්‍ය අංශය පහතින් තෝරාගන්න.
          </p>
        </div>

        {/* 2 Role Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Choice 1: Customer */}
          <button
            onClick={() => {
              onSelectCustomer();
              onClose();
            }}
            className="group p-5 rounded-2xl bg-stone-50 hover:bg-emerald-50/80 border-2 border-stone-200 hover:border-emerald-500 text-left transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 font-heading group-hover:text-emerald-900">
                පාරිභෝගිකයෙකු ලෙස
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-snug">
                ධාන්‍ය මිල බැලීම, අලෙවි ඉල්ලීම් යොමු කිරීම හා ප්‍රවාහන පහසුකම් ලබාගැනීම.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>පිවිසෙන්න</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Choice 2: Admin */}
          <button
            onClick={() => {
              onSelectAdmin();
              onClose();
            }}
            className="group p-5 rounded-2xl bg-stone-900 hover:bg-stone-950 border-2 border-stone-800 hover:border-harvest-500 text-left text-white transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-harvest-500/20 text-harvest-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white font-heading group-hover:text-harvest-300">
                පරිපාලකයෙකු ලෙස
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-snug">
                මිල ගණන් යාවත්කාලීන කිරීම, ඉල්ලීම් පරීක්ෂා කිරීම හා දත්ත කළමනාකරණය.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-bold text-harvest-400">
              <span className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Admin Login</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
