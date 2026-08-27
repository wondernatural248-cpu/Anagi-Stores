import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface InstallPwaBannerProps {
  canInstall: boolean;
  onInstall: () => void;
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ canInstall, onInstall }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-brand-900 via-brand-forest to-brand-deep text-white border-b border-harvest-500/30 px-4 py-3 shadow-lg relative overflow-hidden">
      {/* Decorative grain backdrop */}
      <div className="absolute right-0 top-0 w-64 h-full bg-harvest-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-harvest-500/20 border border-harvest-500/40 p-2 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-harvest-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-harvest-300">අනගි ස්ටෝර්ස් App එක ඔබගේ දුරකථනයට එක්කර ගන්න</span>
              <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>PWA Fast</span>
              </span>
            </div>
            <p className="text-xs text-stone-300">
              ඉක්මනින් අද දින ධාන්‍ය මිල බලාගැනීමට සහ ඉල්ලීම් යොමු කිරීමට Home Screen එකට එක්කර ගන්න.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {canInstall ? (
            <button
              onClick={onInstall}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-brand-950 font-bold text-xs shadow-gold transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ස්ථාපනය කරන්න (Install)</span>
            </button>
          ) : (
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-800/80 hover:bg-brand-700 text-harvest-300 border border-harvest-500/30 font-medium text-xs transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ස්ථාපනය කරන ආකාරය</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-brand-800/60 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-brand-800/80 text-xs text-stone-300 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-brand-950/70 p-3 rounded-lg border border-brand-800">
            <span className="font-bold text-harvest-300 block mb-1">Android / Chrome පරිශීලකයින් සඳහා:</span>
            <p>1. Browser මෙනුව (තිත් 3) ඔබන්න → 2. <strong>&ldquo;Install app&rdquo;</strong> හෝ <strong>&ldquo;Add to Home screen&rdquo;</strong> තෝරන්න.</p>
          </div>
          <div className="bg-brand-950/70 p-3 rounded-lg border border-brand-800">
            <span className="font-bold text-harvest-300 block mb-1">iPhone / Safari පරිශීලකයින් සඳහා:</span>
            <p>1. Share බොත්තම ඔබන්න → 2. පහළට scroll කර <strong>&ldquo;Add to Home Screen&rdquo;</strong> තෝරන්න.</p>
          </div>
        </div>
      )}
    </div>
  );
};
