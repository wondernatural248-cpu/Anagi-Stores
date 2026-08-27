import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  Truck, 
  Plus, 
  X, 
  AlertCircle, 
  LogOut, 
  CheckCircle2, 
  Database, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';
import { GrainItem, SellRequest, PickupRequest, SellRequestStatus, PickupRequestStatus } from '../../services/types';
import { grainService } from '../../services/grainService';
import { requestService } from '../../services/requestService';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabase';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'overview' | 'prices' | 'sell_requests' | 'pickup_requests'>('overview');

  // Data states
  const [grains, setGrains] = useState<GrainItem[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Modal states
  const [editingGrain, setEditingGrain] = useState<GrainItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editIsBuying, setEditIsBuying] = useState<boolean>(true);
  const [editStatusLabel, setEditStatusLabel] = useState<string>('දැනට මිලදී ගනී');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGrainNameSi, setNewGrainNameSi] = useState('');
  const [newGrainNameEn, setNewGrainNameEn] = useState('');
  const [newCategory, setNewCategory] = useState<'PADDY' | 'CEREALS' | 'PULSES' | 'OILSEEDS'>('PADDY');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newGradeSi, setNewGradeSi] = useState('');
  const [isAddingGrain, setIsAddingGrain] = useState(false);

  const [isSeeding, setIsSeeding] = useState(false);

  const isCloudDbActive = isSupabaseConfigured();

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Subscribe to auth state changes
    const { data: authListener } = authService.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      const [gList, sList, pList] = await Promise.all([
        grainService.getGrains(),
        requestService.getSellRequests(),
        requestService.getPickupRequests(),
      ]);
      setGrains(gList);
      setSellRequests(sList);
      setPickupRequests(pList);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  // Real Supabase Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError('කරුණාකර ඔබගේ විද්‍යුත් තැපැල් ලිපිනය සහ මුරපදය ඇතුළත් කරන්න.');
      return;
    }

    setIsLoggingIn(true);
    const result = await authService.signIn(adminEmail, adminPassword);
    setIsLoggingIn(false);

    if (result.success) {
      setIsAuthenticated(true);
      setAdminPassword('');
    } else {
      setLoginError(result.error || 'පිවිසීමේදී දෝෂයක් ඇති විය.');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
  };

  const handleOpenEdit = (grain: GrainItem) => {
    setEditingGrain(grain);
    setEditPrice(grain.currentPricePerKg);
    setEditIsBuying(grain.buyingStatus !== 'PAUSED');
    setEditStatusLabel(grain.statusLabelSinhala);
  };

  const handleSaveEdit = async () => {
    if (!editingGrain) return;
    try {
      await grainService.updateGrainPrice(editingGrain.id, Number(editPrice));
      await grainService.toggleBuyingStatus(editingGrain.id, editIsBuying, editStatusLabel);
      setEditingGrain(null);
      showNotification(`"${editingGrain.nameSinhala}" මිල හා තත්ත්වය සාර්ථකව යාවත්කාලීන විය.`);
      loadAllData();
    } catch (err) {
      alert('යාවත්කාලීන කිරීමේදී දෝෂයක් ඇති විය.');
    }
  };

  const handleToggleBuying = async (grain: GrainItem) => {
    const nextIsBuying = grain.buyingStatus === 'PAUSED';
    const nextLabel = nextIsBuying ? 'දැනට මිලදී ගනී' : 'තාවකාලිකව නවතා ඇත';
    await grainService.toggleBuyingStatus(grain.id, nextIsBuying, nextLabel);
    showNotification(`"${grain.nameSinhala}" තත්ත්වය ${nextLabel} ලෙස වෙනස් විය.`);
    loadAllData();
  };

  const handleDeleteGrain = async (id: string, name: string) => {
    if (!confirm(`"${name}" ධාන්‍ය වර්ගය ලැයිස්තුවෙන් ඉවත් කිරීමට ඔබට සහතිකද?`)) return;
    try {
      await grainService.deleteGrain(id);
      showNotification(`"${name}" සාර්ථකව ඉවත් කරන ලදි.`);
      loadAllData();
    } catch (err) {
      alert('ඉවත් කිරීමේදී දෝෂයක් මතු විය.');
    }
  };

  const handleAddGrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrainNameSi.trim()) return;

    const categoryNames: Record<string, string> = {
      PADDY: 'වී වර්ග',
      CEREALS: 'ධාන්‍ය වර්ග',
      PULSES: 'පියලි / ඇට වර්ග',
      OILSEEDS: 'තෙල් බීජ',
    };

    setIsAddingGrain(true);
    try {
      await grainService.addGrain({
        nameSinhala: newGrainNameSi.trim(),
        nameEnglish: newGrainNameEn.trim() || newGrainNameSi.trim(),
        category: newCategory,
        categorySinhala: categoryNames[newCategory] || 'ධාන්‍ය',
        currentPricePerKg: Number(newPrice),
        unit: 'කි.ග්‍රෑ. 1ක් සඳහා',
        buyingStatus: 'BUYING',
        minQuantityKg: 20,
        gradeDescriptionSinhala: newGradeSi.trim() || 'හොඳින් වියලන ලද උසස් තත්ත්වයේ ධාන්‍ය',
        isFeatured: false,
      });

      setShowAddModal(false);
      setNewGrainNameSi('');
      setNewGrainNameEn('');
      setNewPrice(100);
      setNewGradeSi('');
      showNotification(`නව ධාන්‍ය වර්ගය සාර්ථකව දත්ත ගබඩාවට එක් කරන ලදි.`);
      loadAllData();
    } catch (err) {
      alert('ධාන්‍ය එක් කිරීමේදී දෝෂයක් මතු විය.');
    } finally {
      setIsAddingGrain(false);
    }
  };

  const handleSeedSampleData = async () => {
    if (!confirm('ආදර්ශ ධාන්‍ය වර්ග දත්ත ගබඩාවට ඇතුළත් කිරීමට අවශ්‍යද?')) return;
    setIsSeeding(true);
    const result = await grainService.seedSampleGrainsToDatabase();
    setIsSeeding(false);
    if (result.error) {
      alert(`දත්ත ඇතුළත් කිරීමේදී දෝෂය: ${result.error}`);
    } else {
      showNotification(`ධාන්‍ය වර්ග ${result.count}ක් සාර්ථකව දත්ත ගබඩාවට එක් විය.`);
      loadAllData();
    }
  };

  const handleUpdateSellStatus = async (id: string, newStatus: SellRequestStatus) => {
    await requestService.updateSellStatus(id, newStatus);
    showNotification('අලෙවි ඉල්ලීමේ තත්ත්වය යාවත්කාලීන විය.');
    loadAllData();
  };

  const handleUpdatePickupStatus = async (id: string, newStatus: PickupRequestStatus) => {
    await requestService.updatePickupStatus(id, newStatus);
    showNotification('තොග රැගෙන යාමේ ඉල්ලීමේ තත්ත්වය යාවත්කාලීන විය.');
    loadAllData();
  };

  // Auth checking screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-harvest-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-300">පරිපාලක පිවිසුම පරීක්ෂා කරමින් පවතී...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render real Supabase Admin Login UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-stone-800 rounded-3xl p-8 sm:p-10 border border-stone-700 max-w-md w-full text-white shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-harvest-500/20 border border-harvest-500/40 text-harvest-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-white">
              පරිපාලක ප්‍රවේශය
            </h2>
            <p className="text-xs text-stone-400">
              Anagi Stores Secure Admin Portal (Supabase Auth)
            </p>
          </div>

          {/* Database Connection Status Banner */}
          {isCloudDbActive ? (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Supabase Cloud PostgreSQL Database සක්‍රීයයි.</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Supabase Configuration Notice:</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Supabase credentials .env ගොනුවට එක් කරන තුරු සංවර්ධන අතුරුමුහුණත පරීක්ෂා කිරීමට ඕනෑම ඊමේල් ලිපිනයක් සහ මුරපදයක් ඇතුළත් කර පිවිසිය හැක.
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-harvest-400" />
                <span>විද්‍යුත් තැපැල් ලිපිනය (Email)</span>
              </label>
              <input
                type="email"
                placeholder="admin@anagistores.lk"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-harvest-500"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-harvest-400" />
                <span>මුරපදය (Password)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-harvest-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 flex items-center space-x-1 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-sm shadow-gold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>පිවිසෙමින් පවතී...</span>
                </>
              ) : (
                <span>පරිපාලක පුවරුවට පිවිසෙන්න</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-stone-700/80 text-center">
            <button
              onClick={onExitAdmin}
              className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
            >
              ← පාරිභෝගික මුල් පිටුවට ආපසු යන්න
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Computed overview metrics
  const buyingCount = grains.filter(g => g.buyingStatus === 'BUYING').length;
  const newSellCount = sellRequests.filter(r => r.status === 'NEW').length;
  const newPickupCount = pickupRequests.filter(r => r.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      
      {/* Admin Topbar */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-harvest-500/20 border border-harvest-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-harvest-400" />
            </div>
            <div>
              <span className="font-bold text-base text-white font-heading">
                අනගි ස්ටෝර්ස් | පරිපාලක කළමනාකරණය
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.2 rounded-full font-sans font-semibold ${
                  isCloudDbActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <Database className="w-2.5 h-2.5" />
                  <span>{isCloudDbActive ? 'Supabase Live DB' : 'Local Dev Storage'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAllData}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
              title="නැවුම් කරන්න (Refresh Data)"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-rose-300 border border-stone-700 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>නික්මෙන්න (Logout)</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold transition-colors"
            >
              <span>පාරිභෝගික අංශයට</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success Banner Notification */}
      {actionSuccessMessage && (
        <div className="bg-emerald-900/90 border-b border-emerald-700 px-4 py-2 text-xs text-white text-center font-semibold flex items-center justify-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Admin Subnav */}
      <div className="bg-stone-900/60 border-b border-stone-800/80 px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            දළ විශ්ලේෂණය (Overview)
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'prices'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>මිල ගණන් සහ ධාන්‍ය ({grains.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sell_requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'sell_requests'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>අලෙවි ඉල්ලීම් ({sellRequests.length})</span>
            {newSellCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pickup_requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'pickup_requests'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>තොග රැගෙන යාම් ({pickupRequests.length})</span>
            {newPickupCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">ලැයිස්තුගත ධාන්‍ය වර්ග</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white font-sans">{grains.length}</span>
                  <span className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {buyingCount} මිලදී ගනී
                  </span>
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">නව ධාන්‍ය අලෙවි ඉල්ලීම්</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-harvest-400 font-sans">{sellRequests.length}</span>
                  <span className="text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {newSellCount} නව ඉල්ලීම්
                  </span>
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">නව තොග රැගෙන යාම්</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-blue-400 font-sans">{pickupRequests.length}</span>
                  <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    {newPickupCount} නව ඉල්ලීම්
                  </span>
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">දත්ත ගබඩා තත්ත්වය</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-emerald-400 font-heading">
                    {isCloudDbActive ? 'Supabase Live' : 'Local Storage'}
                  </span>
                  <span className="text-xs text-stone-400">PostgreSQL</span>
                </div>
              </div>

            </div>

            {/* Quick action bar for seeding database if empty */}
            {grains.length === 0 && (
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-300 font-heading">
                    දත්ත ගබඩාවේ ධාන්‍ය වර්ග ඇතුළත් කර නොමැත
                  </h4>
                  <p className="text-xs text-stone-300">
                    ආරම්භක ආදර්ශ ධාන්‍ය වර්ග (Paddy, Kurakkan, Green Gram, etc.) එකවර දත්ත ගබඩාවට ඇතුළත් කිරීමට පහත බොත්තම ඔබන්න.
                  </p>
                </div>
                <button
                  onClick={handleSeedSampleData}
                  disabled={isSeeding}
                  className="px-4 py-2.5 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-xs shadow-gold shrink-0 transition-colors flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSeeding ? 'ඇතුළත් වෙමින් පවතී...' : 'ආදර්ශ දත්ත ඇතුළත් කරන්න (Seed)'}</span>
                </button>
              </div>
            )}

            {/* Recent Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Sell Requests */}
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white font-heading">නවතම ධාන්‍ය අලෙවි ඉල්ලීම්</h3>
                  <button
                    onClick={() => setActiveTab('sell_requests')}
                    className="text-xs text-harvest-400 hover:underline"
                  >
                    සියල්ල බලන්න ({sellRequests.length}) →
                  </button>
                </div>

                {sellRequests.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4 text-center">දැනට අලෙවි ඉල්ලීම් නොමැත.</p>
                ) : (
                  <div className="space-y-2.5">
                    {sellRequests.slice(0, 4).map((req) => (
                      <div key={req.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <strong className="text-white">{req.customerName}</strong>
                            <span className="text-stone-500 font-mono text-[10px]">{req.referenceNo}</span>
                          </div>
                          <span className="text-stone-400 block mt-0.5">
                            {req.grainNameSinhala} - {req.quantityKg} kg ({req.location})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-harvest-400 font-bold font-sans block">
                            රු. {req.estimatedTotal.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase font-semibold">
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Pickup Requests */}
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white font-heading">නවතම තොග රැගෙන යාමේ ඉල්ලීම්</h3>
                  <button
                    onClick={() => setActiveTab('pickup_requests')}
                    className="text-xs text-harvest-400 hover:underline"
                  >
                    සියල්ල බලන්න ({pickupRequests.length}) →
                  </button>
                </div>

                {pickupRequests.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4 text-center">දැනට රැගෙන යාමේ ඉල්ලීම් නොමැත.</p>
                ) : (
                  <div className="space-y-2.5">
                    {pickupRequests.slice(0, 4).map((pck) => (
                      <div key={pck.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <strong className="text-white">{pck.customerName}</strong>
                            <span className="text-stone-500 font-mono text-[10px]">{pck.referenceNo}</span>
                          </div>
                          <span className="text-stone-400 block mt-0.5">
                            {pck.grainNameSinhala} - {pck.quantityKg} kg ({pck.area})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-stone-300 font-medium block">
                            {pck.preferredDate}
                          </span>
                          <span className="text-[10px] text-blue-400 uppercase font-semibold">
                            {pck.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PRICE & GRAIN MANAGEMENT */}
        {activeTab === 'prices' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  ධාන්‍ය මිල ගණන් සහ නාමාවලි කළමනාකරණය
                </h2>
                <p className="text-xs text-stone-400">
                  මෙහිදී වෙනස් කරන මිල ගණන් Supabase දත්ත ගබඩාව හරහා පාරිභෝගික මිල පුවරුවේ එසැනින් යාවත්කාලීන වේ.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {grains.length === 0 && (
                  <button
                    onClick={handleSeedSampleData}
                    disabled={isSeeding}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-harvest-300 border border-harvest-500/30 text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ආදර්ශ දත්ත Seed කරන්න</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-xs shadow-gold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>නව ධාන්‍ය වර්ගයක් එක් කරන්න</span>
                </button>
              </div>
            </div>

            {/* Grain Items Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">ධාන්‍ය වර්ගය</th>
                      <th className="p-4">කාණ්ඩය</th>
                      <th className="p-4">මිලදී ගැනීමේ මිල</th>
                      <th className="p-4">තත්ත්වය</th>
                      <th className="p-4">අවසන් යාවත්කාලීනය</th>
                      <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {grains.map((g) => (
                      <tr key={g.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div>{g.nameSinhala}</div>
                          <div className="text-[10px] text-stone-500 font-normal">{g.nameEnglish}</div>
                        </td>
                        <td className="p-4 text-stone-400">{g.categorySinhala}</td>
                        <td className="p-4 font-sans font-bold text-harvest-400 text-sm">
                          රු. {g.currentPricePerKg.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleBuying(g)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              g.buyingStatus === 'BUYING'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                : g.buyingStatus === 'LIMITED'
                                ? 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
                                : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                            }`}
                            title="මිලදී ගැනීමේ තත්ත්වය වෙනස් කිරීමට ඔබන්න"
                          >
                            {g.statusLabelSinhala}
                          </button>
                        </td>
                        <td className="p-4 text-stone-400">{g.lastUpdated}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-harvest-400 border border-stone-700 font-bold transition-colors"
                          >
                            මිල සංස්කරණය
                          </button>

                          <button
                            onClick={() => handleDeleteGrain(g.id, g.nameSinhala)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-700 transition-colors"
                            title="ඉවත් කරන්න"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SELL REQUESTS */}
        {activeTab === 'sell_requests' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-white font-heading">
              පාරිභෝගික ධාන්‍ය අලෙවි ඉල්ලීම් ({sellRequests.length})
            </h2>

            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">යොමු අංකය</th>
                      <th className="p-4">ගොවි මහතා & දුරකථනය</th>
                      <th className="p-4">ධාන්‍ය වර්ගය & ප්‍රමාණය</th>
                      <th className="p-4">ඇස්තමේන්තු වටිනාකම</th>
                      <th className="p-4">ප්‍රදේශය & සටහන්</th>
                      <th className="p-4">තත්ත්වය (Status)</th>
                      <th className="p-4 text-right">සම්බන්ධවීම</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {sellRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-stone-800/50">
                        <td className="p-4 font-mono font-bold text-harvest-400">{req.referenceNo}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{req.customerName}</div>
                          <a href={`tel:${req.phoneNumber}`} className="text-emerald-400 hover:underline">
                            {req.phoneNumber}
                          </a>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white">{req.grainNameSinhala}</span>
                          <span className="block text-stone-400">{req.quantityKg} Kg</span>
                        </td>
                        <td className="p-4 font-sans font-bold text-harvest-400">
                          රු. {req.estimatedTotal.toLocaleString()}
                        </td>
                        <td className="p-4 text-stone-300 max-w-xs">
                          <div>{req.location}</div>
                          {req.additionalMessage && (
                            <div className="text-[10px] text-stone-400 italic mt-0.5 truncate">{req.additionalMessage}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateSellStatus(req.id, e.target.value as SellRequestStatus)}
                            className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-harvest-500 font-semibold"
                          >
                            <option value="NEW">නව ඉල්ලීම (NEW)</option>
                            <option value="CONTACTED">සම්බන්ධ විය (CONTACTED)</option>
                            <option value="COMPLETED">සම්පූර්ණයි (COMPLETED)</option>
                            <option value="CANCELLED">අවලංගුයි (CANCELLED)</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://wa.me/${req.phoneNumber.replace(/[\s-]/g, '')}?text=${encodeURIComponent(
                              `ආයුබෝවන් ${req.customerName}, ඔබ අනගි ස්ටෝර්ස් වෙත යොමු කළ ධාන්‍ය අලෙවි ඉල්ලීම (${req.referenceNo}) සම්බන්ධයෙනි.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900"
                          >
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PICKUP REQUESTS */}
        {activeTab === 'pickup_requests' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-white font-heading">
              විශාල තොග නිවසටම පැමිණ රැගෙන යාමේ ඉල්ලීම් ({pickupRequests.length})
            </h2>

            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">යොමු අංකය</th>
                      <th className="p-4">නම & දුරකථනය</th>
                      <th className="p-4">ලිපිනය & ප්‍රදේශය</th>
                      <th className="p-4">ධාන්‍ය & ප්‍රමාණය</th>
                      <th className="p-4">කැමති දිනය & වේලාව</th>
                      <th className="p-4">තත්ත්වය (Status)</th>
                      <th className="p-4 text-right">සම්බන්ධවීම</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {pickupRequests.map((pck) => (
                      <tr key={pck.id} className="hover:bg-stone-800/50">
                        <td className="p-4 font-mono font-bold text-harvest-400">{pck.referenceNo}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{pck.customerName}</div>
                          <a href={`tel:${pck.phoneNumber}`} className="text-emerald-400 hover:underline">
                            {pck.phoneNumber}
                          </a>
                        </td>
                        <td className="p-4 max-w-xs">
                          <span className="text-white block truncate">{pck.address}</span>
                          <span className="text-stone-400 font-semibold">{pck.area}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{pck.grainNameSinhala}</span>
                          <span className="text-harvest-400 font-sans font-bold">{pck.quantityKg} Kg (ටොන් {(pck.quantityKg / 1000).toFixed(2)})</span>
                        </td>
                        <td className="p-4 text-stone-300">
                          <div>{pck.preferredDate}</div>
                          <div className="text-[10px] text-stone-500">{pck.preferredTime}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={pck.status}
                            onChange={(e) => handleUpdatePickupStatus(pck.id, e.target.value as PickupRequestStatus)}
                            className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-harvest-500 font-semibold"
                          >
                            <option value="NEW">නව ඉල්ලීම (NEW)</option>
                            <option value="CONTACTED">සම්බන්ධ විය (CONTACTED)</option>
                            <option value="SCHEDULED">සැලසුම් කළා (SCHEDULED)</option>
                            <option value="COMPLETED">සම්පූර්ණයි (COMPLETED)</option>
                            <option value="CANCELLED">අවලංගුයි (CANCELLED)</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://wa.me/${pck.phoneNumber.replace(/[\s-]/g, '')}?text=${encodeURIComponent(
                              `ආයුබෝවන් ${pck.customerName}, ඔබ අනගි ස්ටෝර්ස් වෙත යොමු කළ තොග රැගෙන යාමේ ඉල්ලීම (${pck.referenceNo}) සම්බන්ධයෙනි.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900"
                          >
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: EDIT PRICE & STATUS */}
      {editingGrain && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-700 max-w-md w-full text-white space-y-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-lg font-heading">ධාන්‍ය මිල සහ තත්ත්වය සංස්කරණය</h3>
              <button onClick={() => setEditingGrain(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-stone-400 block">ධාන්‍ය වර්ගය:</span>
                <strong className="text-base text-white">{editingGrain.nameSinhala}</strong>
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">නව මිලදී ගැනීමේ මිල (රු. / 1kg):</label>
                <input
                  type="number"
                  step="0.50"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white font-sans text-lg font-bold focus:outline-none focus:ring-2 focus:ring-harvest-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">මිලදී ගැනීමේ තත්ත්වය:</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditIsBuying(true);
                      setEditStatusLabel('දැනට මිලදී ගනී');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      editIsBuying
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    🟢 දැනට මිලදී ගනී
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditIsBuying(false);
                      setEditStatusLabel('තාවකාලිකව නවතා ඇත');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !editIsBuying
                        ? 'bg-rose-950 text-rose-300 border-rose-500'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    🔴 නවතා ඇත
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
              <button
                onClick={() => setEditingGrain(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
              >
                අවලංගු කරන්න
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-xs shadow-gold"
              >
                මිල යාවත්කාලීන කරන්න
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD GRAIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddGrain} className="bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-700 max-w-lg w-full text-white space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-lg font-heading">නව ධාන්‍ය වර්ගයක් එක් කිරීම</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">සිංහල නම *</label>
                <input
                  type="text"
                  placeholder="උදා: සුවඳැල් වී"
                  value={newGrainNameSi}
                  onChange={(e) => setNewGrainNameSi(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">English Name</label>
                <input
                  type="text"
                  placeholder="e.g. Suwandel Paddy"
                  value={newGrainNameEn}
                  onChange={(e) => setNewGrainNameEn(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">කාණ්ඩය</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="PADDY">වී වර්ග (Paddy)</option>
                  <option value="CEREALS">ධාන්‍ය වර්ග (Cereals)</option>
                  <option value="PULSES">පියලි / ඇට වර්ග (Pulses)</option>
                  <option value="OILSEEDS">තෙල් බීජ (Oilseeds)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">මිලදී ගැනීමේ මිල (රු. / 1kg) *</label>
                <input
                  type="number"
                  step="0.50"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white font-bold"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-stone-300 font-semibold">තත්ත්ව පිරිවිතර (Quality Grade description)</label>
                <input
                  type="text"
                  placeholder="උදා: තෙතමනය 14% ට අඩු, පිරිසිදු කළ තත්ත්වය"
                  value={newGradeSi}
                  onChange={(e) => setNewGradeSi(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
              >
                අවලංගු කරන්න
              </button>
              <button
                type="submit"
                disabled={isAddingGrain}
                className="px-5 py-2 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-xs shadow-gold disabled:opacity-50"
              >
                {isAddingGrain ? 'එක් කරමින් පවතී...' : 'දත්ත ගබඩාවට එක් කරන්න'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
