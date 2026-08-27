import { useState, useEffect } from 'react';
import { GrainItem } from './services/types';
import { grainService } from './services/grainService';

// Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { InstallPwaBanner } from './components/common/InstallPwaBanner';
import { PriceCalculator } from './components/common/PriceCalculator';
import { RoleSelectionModal } from './components/portal/RoleSelectionModal';

// Customer Pages & Sections
import { HeroSection } from './components/home/HeroSection';
import { PricePreviewSection } from './components/home/PricePreviewSection';
import { AboutSection } from './components/home/AboutSection';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { HomePickupSpotlight } from './components/home/HomePickupSpotlight';
import { PriceListing } from './components/prices/PriceListing';
import { SellForm } from './components/sell/SellForm';
import { PickupForm } from './components/pickup/PickupForm';
import { ContactPage } from './components/contact/ContactPage';

// Admin View
import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'prices' | 'sell' | 'pickup' | 'contact' | 'admin'>('home');
  const [grains, setGrains] = useState<GrainItem[]>([]);
  const [isLoadingGrains, setIsLoadingGrains] = useState(true);

  // Pre-selected grain for Sell Form
  const [sellGrainId, setSellGrainId] = useState<string | undefined>(undefined);
  const [sellQuantity, setSellQuantity] = useState<number | undefined>(100);

  // Role Selection Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // Load grains
  const fetchGrains = async () => {
    setIsLoadingGrains(true);
    const data = await grainService.getGrains();
    setGrains(data);
    setIsLoadingGrains(false);
  };

  useEffect(() => {
    fetchGrains();

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  const handleSelectGrainForSell = (grainId: string, quantity?: number) => {
    setSellGrainId(grainId);
    if (quantity) {
      setSellQuantity(quantity);
    }
    setCurrentTab('sell');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on Admin View, render Admin Component
  if (currentTab === 'admin') {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          setCurrentTab('home');
          fetchGrains();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sinhala">
      
      {/* PWA Prompt Banner */}
      <InstallPwaBanner
        canInstall={canInstallPwa}
        onInstall={handleInstallPwa}
      />

      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedGrainForSell={sellGrainId}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        
        {/* TAB 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-0 animate-fadeIn">
            <HeroSection
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Price Preview */}
            <PricePreviewSection
              grains={grains}
              onViewAllPrices={() => {
                setCurrentTab('prices');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGrainForSell={handleSelectGrainForSell}
            />

            {/* Quick Interactive Calculator on Home */}
            <section className="py-12 bg-stone-100/80 border-t border-stone-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PriceCalculator
                  grains={grains}
                  onSelectGrainForSell={handleSelectGrainForSell}
                />
              </div>
            </section>

            {/* About Narrative */}
            <AboutSection />

            {/* 4 Pillars Why Choose Us */}
            <WhyChooseUs />

            {/* Home Pickup Feature Spotlight */}
            <HomePickupSpotlight
              onNavigateToPickup={() => {
                setCurrentTab('pickup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* TAB 2: GRAIN PRICES PAGE */}
        {currentTab === 'prices' && (
          <div className="animate-fadeIn">
            <PriceListing
              grains={grains}
              isLoading={isLoadingGrains}
              onSelectGrainForSell={handleSelectGrainForSell}
              onRefreshPrices={fetchGrains}
            />
          </div>
        )}

        {/* TAB 3: SELL GRAIN PAGE */}
        {currentTab === 'sell' && (
          <div className="animate-fadeIn">
            <SellForm
              grains={grains}
              preSelectedGrainId={sellGrainId}
              initialQuantity={sellQuantity}
            />
          </div>
        )}

        {/* TAB 4: HOME PICKUP PAGE */}
        {currentTab === 'pickup' && (
          <div className="animate-fadeIn">
            <PickupForm
              grains={grains}
            />
          </div>
        )}

        {/* TAB 5: CONTACT PAGE */}
        {currentTab === 'contact' && (
          <div className="animate-fadeIn">
            <ContactPage />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        setCurrentTab={setCurrentTab}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectCustomer={() => setCurrentTab('home')}
        onSelectAdmin={() => setCurrentTab('admin')}
      />

    </div>
  );
}

export default App;
