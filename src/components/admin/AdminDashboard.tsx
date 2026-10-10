import React, { useState, useEffect } from 'react';
import { 
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
  EyeOff, 
  MessageSquare, 
  Phone,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Search,
  Printer,
  Edit3
} from 'lucide-react';
import { 
  GrainItem, 
  SellRequest, 
  PickupRequest, 
  ContactMessage, 
  SellRequestStatus, 
  PickupRequestStatus,
  BillItem,
  StockMovement
} from '../../services/types';
import { grainService } from '../../services/grainService';
import { requestService } from '../../services/requestService';
import { billingService } from '../../services/billingService';
import { stockService } from '../../services/stockService';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabase';
import { BillReceiptModal } from './BillReceiptModal';
import { CreateIncomingBillModal } from './CreateIncomingBillModal';
import { CreateOutgoingBillModal } from './CreateOutgoingBillModal';

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
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock' | 'incoming_bills' | 'outgoing_bills' | 'stock_history' | 'prices' | 'sell_requests' | 'pickup_requests' | 'messages'
  >('overview');

  // Data states
  const [grains, setGrains] = useState<GrainItem[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Stock & Bill Filter states
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('ALL');
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');
  const [billSearchQuery, setBillSearchQuery] = useState<string>('');
  const [historyGrainFilter, setHistoryGrainFilter] = useState<string>('ALL');

  // Modals state
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [showOutgoingModal, setShowOutgoingModal] = useState(false);
  const [selectedGrainForBill, setSelectedGrainForBill] = useState<string | undefined>(undefined);
  const [viewingReceipt, setViewingReceipt] = useState<BillItem | null>(null);

  // Edit Grain / Min Stock Modals
  const [editingGrain, setEditingGrain] = useState<GrainItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editIsBuying, setEditIsBuying] = useState<boolean>(true);
  const [editStatusLabel, setEditStatusLabel] = useState<string>('දැනට මිලදී ගනී');
  
  const [editingMinStockGrain, setEditingMinStockGrain] = useState<GrainItem | null>(null);
  const [newMinStockValue, setNewMinStockValue] = useState<number>(100);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGrainNameSi, setNewGrainNameSi] = useState('');
  const [newGrainNameEn, setNewGrainNameEn] = useState('');
  const [newCategory, setNewCategory] = useState<'PADDY' | 'CEREALS' | 'PULSES' | 'OILSEEDS'>('PADDY');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newInitialStock, setNewInitialStock] = useState<number>(0);
  const [newMinStock, setNewMinStock] = useState<number>(100);
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
      const [gList, sList, pList, mList, bList, movList] = await Promise.all([
        grainService.getGrains(),
        requestService.getSellRequests(),
        requestService.getPickupRequests(),
        requestService.getContactMessages(),
        billingService.getBills(),
        billingService.getStockMovements()
      ]);
      setGrains(gList);
      setSellRequests(sList);
      setPickupRequests(pList);
      setContactMessages(mList);
      setBills(bList);
      setStockMovements(movList);
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
    setTimeout(() => setActionSuccessMessage(''), 4500);
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
    } catch {
      alert('යාවත්කාලීන කිරීමේදී දෝෂයක් ඇති විය.');
    }
  };

  const handleOpenMinStockEdit = (grain: GrainItem) => {
    setEditingMinStockGrain(grain);
    setNewMinStockValue(grain.minStockLevelKg || 100);
  };

  const handleSaveMinStock = async () => {
    if (!editingMinStockGrain) return;
    try {
      await grainService.updateMinStockLevel(editingMinStockGrain.id, Number(newMinStockValue));
      setEditingMinStockGrain(null);
      showNotification(`"${editingMinStockGrain.nameSinhala}" අවම තොග සීමාව යාවත්කාලීන විය.`);
      loadAllData();
    } catch {
      alert('අවම තොග සීමාව යාවත්කාලීන කිරීමේදී දෝෂයක් ඇති විය.');
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
    } catch {
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
        currentStockKg: Number(newInitialStock) || 0,
        minStockLevelKg: Number(newMinStock) || 100,
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
      setNewInitialStock(0);
      setNewMinStock(100);
      setNewGradeSi('');
      showNotification(`නව ධාන්‍ය වර්ගය සාර්ථකව දත්ත ගබඩාවට එක් කරන ලදි.`);
      loadAllData();
    } catch {
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

  const handleBillCreated = (bill: BillItem) => {
    showNotification(`බිල්පත් අංක ${bill.billNumber} සාර්ථකව නිකුත් විය. තොගය යාවත්කාලීන විය.`);
    loadAllData();
    setViewingReceipt(bill);
  };

  const handleOpenIncomingModal = (grainId?: string) => {
    setSelectedGrainForBill(grainId);
    setShowIncomingModal(true);
  };

  const handleOpenOutgoingModal = (grainId?: string) => {
    setSelectedGrainForBill(grainId);
    setShowOutgoingModal(true);
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

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('මෙම පණිවිඩය මකා දැමීමට අවශ්‍යද?')) return;
    try {
      await requestService.deleteContactMessage(id);
      showNotification('පණිවිඩය සාර්ථකව මකා දමන ලදි.');
      loadAllData();
    } catch {
      alert('පණිවිඩය මකා දැමීමේදී දෝෂයක් ඇති විය.');
    }
  };

  const handleDeleteSellRequest = async (id: string) => {
    if (!confirm('මෙම අලෙවි ඉල්ලීම මකා දැමීමට අවශ්‍යද?')) return;
    try {
      await requestService.deleteSellRequest(id);
      showNotification('අලෙවි ඉල්ලීම සාර්ථකව මකා දමන ලදි.');
      loadAllData();
    } catch {
      alert('ඉල්ලීම මකා දැමීමේදී දෝෂයක් ඇති විය.');
    }
  };

  const handleDeletePickupRequest = async (id: string) => {
    if (!confirm('මෙම රැගෙන යාමේ ඉල්ලීම මකා දැමීමට අවශ්‍යද?')) return;
    try {
      await requestService.deletePickupRequest(id);
      showNotification('රැගෙන යාමේ ඉල්ලීම සාර්ථකව මකා දමන ලදි.');
      loadAllData();
    } catch {
      alert('ඉල්ලීම මකා දැමීමේදී දෝෂයක් ඇති විය.');
    }
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
          
          {/* Header with Real Logo */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-brand-deep/80 border border-harvest-500/40 p-1 mx-auto flex items-center justify-center overflow-hidden shadow-gold">
              <img 
                src="/6ecf88c0-2f28-4bec-98b0-d155c7965c98.png" 
                alt="Anagi-Stores" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-white">
                පරිපාලක ප්‍රවේශය
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Anagi-Stores Secure Admin Portal (Supabase Auth)
              </p>
            </div>
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

  // Computed metrics
  const newSellCount = sellRequests.filter(r => r.status === 'NEW').length;
  const newPickupCount = pickupRequests.filter(r => r.status === 'NEW').length;

  const stockSummary = stockService.calculateStockSummary(grains);
  const incomingBills = bills.filter(b => b.billType === 'INCOMING');
  const outgoingBills = bills.filter(b => b.billType === 'OUTGOING');

  const totalIncomingAmount = incomingBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalOutgoingAmount = outgoingBills.reduce((acc, b) => acc + b.totalAmount, 0);

  // Filtered Stock Items
  const filteredGrains = grains.filter(g => {
    // Category filter
    if (stockCategoryFilter !== 'ALL' && g.category !== stockCategoryFilter) {
      return false;
    }
    // Status filter
    const stockInfo = stockService.getGrainStockInfo(g);
    if (stockStatusFilter !== 'ALL' && stockInfo.status !== stockStatusFilter) {
      return false;
    }
    // Search filter
    if (stockSearchQuery.trim()) {
      const q = stockSearchQuery.toLowerCase();
      const matchSi = g.nameSinhala.toLowerCase().includes(q);
      const matchEn = g.nameEnglish.toLowerCase().includes(q);
      if (!matchSi && !matchEn) return false;
    }
    return true;
  });

  // Filtered Bills
  const filterBillsList = (list: BillItem[]) => {
    if (!billSearchQuery.trim()) return list;
    const q = billSearchQuery.toLowerCase();
    return list.filter(b => 
      b.billNumber.toLowerCase().includes(q) ||
      b.partyName.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      b.grainNameSinhala.toLowerCase().includes(q)
    );
  };

  const filteredIncomingBills = filterBillsList(incomingBills);
  const filteredOutgoingBills = filterBillsList(outgoingBills);

  // Filtered History
  const filteredHistory = historyGrainFilter === 'ALL'
    ? stockMovements
    : stockMovements.filter(m => m.grainId === historyGrainFilter);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      
      {/* Admin Topbar with Real Logo */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-brand-deep/80 border border-harvest-500/40 p-1 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="/6ecf88c0-2f28-4bec-98b0-d155c7965c98.png" 
                alt="Anagi-Stores" 
                className="w-full h-full object-contain" 
              />
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

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => handleOpenIncomingModal()}
              className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ මිලදී ගැනීමක්</span>
            </button>

            <button
              onClick={() => handleOpenOutgoingModal()}
              className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>- විකිණීමක්</span>
            </button>

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
              <span>නික්මෙන්න</span>
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
            දළ විශ්ලේෂණය
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'stock'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>තොග කළමනාකරණය ({grains.length})</span>
            {stockSummary.lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold">
                {stockSummary.lowStockCount} අඩුයි
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('incoming_bills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'incoming_bills'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>මිලදී ගත් බිල්පත් ({incomingBills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('outgoing_bills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'outgoing_bills'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>විකිණූ බිල්පත් ({outgoingBills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stock_history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'stock_history'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>තොග ඉතිහාසය</span>
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
            <span>මිල ගණන් ({grains.length})</span>
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

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'messages'
                ? 'bg-harvest-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>විමසීම් ({contactMessages.length})</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick Action Billing CTA Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 rounded-3xl p-6 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-white font-heading">
                  තොග සහ බිල්පත් කළමනාකරණය (Stock & Billing)
                </h3>
                <p className="text-xs text-stone-300">
                  ගොවීන්ගෙන් ධාන්‍ය මිලදී ගැනීමේ බිල්පත් සහ ගැනුම්කරුවන්ට විකිණීමේ බිල්පත් නිකුත් කර තොග ස්වයංක්‍රීයව යාවත්කාලීන කරන්න.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => handleOpenIncomingModal()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center space-x-1.5"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>+ තොග මිලදී ගැනීම</span>
                </button>

                <button
                  onClick={() => handleOpenOutgoingModal()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-gold transition-colors flex items-center space-x-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>- තොග විකිණීම</span>
                </button>
              </div>
            </div>

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Stock */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">මුළු ගබඩා තොගය</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
                    {stockSummary.totalStockKg.toLocaleString()} <span className="text-sm font-normal text-stone-400">Kg</span>
                  </span>
                  <span className="text-xs text-harvest-400 bg-harvest-950 px-2 py-0.5 rounded border border-harvest-800 font-mono font-bold">
                    ටොන් {stockSummary.totalStockTons}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span>ප්‍රමාණවත්: <strong className="text-emerald-400">{stockSummary.adequateStockCount}</strong></span>
                  <span>අඩු තොග: <strong className="text-amber-400">{stockSummary.lowStockCount}</strong></span>
                  <span>අවසන්: <strong className="text-rose-400">{stockSummary.outOfStockCount}</strong></span>
                </div>
              </div>

              {/* Purchase Bills Summary */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">මිලදී ගත් බිල්පත් එකතුව</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-sans">
                    {incomingBills.length}
                  </span>
                  <button
                    onClick={() => setActiveTab('incoming_bills')}
                    className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 hover:bg-emerald-900"
                  >
                    බලන්න →
                  </button>
                </div>
                <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800/80 font-sans">
                  මුදල: <strong className="text-emerald-300">රු. {totalIncomingAmount.toLocaleString()}</strong>
                </div>
              </div>

              {/* Sales Bills Summary */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">විකිණූ බිල්පත් එකතුව</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-sans">
                    {outgoingBills.length}
                  </span>
                  <button
                    onClick={() => setActiveTab('outgoing_bills')}
                    className="text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 hover:bg-amber-900"
                  >
                    බලන්න →
                  </button>
                </div>
                <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800/80 font-sans">
                  ආදායම: <strong className="text-amber-300">රු. {totalOutgoingAmount.toLocaleString()}</strong>
                </div>
              </div>

              {/* Customer Requests & Messages */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2 shadow-sm">
                <span className="text-xs text-stone-400 font-semibold uppercase">පාරිභෝගික ඉල්ලීම්</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-sans">
                    {sellRequests.length + pickupRequests.length}
                  </span>
                  <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    {newSellCount + newPickupCount} නව
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span>අලෙවි: <strong className="text-stone-200">{sellRequests.length}</strong></span>
                  <span>රැගෙන යාම්: <strong className="text-stone-200">{pickupRequests.length}</strong></span>
                  <span>විමසීම්: <strong className="text-stone-200">{contactMessages.length}</strong></span>
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
              
              {/* Recent Bills */}
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white font-heading">නවතම බිල්පත් ගනුදෙනු</h3>
                  <button
                    onClick={() => setActiveTab('incoming_bills')}
                    className="text-xs text-harvest-400 hover:underline"
                  >
                    සියලු බිල්පත් ({bills.length}) →
                  </button>
                </div>

                {bills.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4 text-center">දැනට බිල්පත් නිකුත් කර නොමැත.</p>
                ) : (
                  <div className="space-y-2.5">
                    {bills.slice(0, 5).map((b) => (
                      <div 
                        key={b.id} 
                        onClick={() => setViewingReceipt(b)}
                        className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between hover:border-stone-700 cursor-pointer transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              b.billType === 'INCOMING' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                            }`}>
                              {b.billType === 'INCOMING' ? 'මිලදී ගැනීම' : 'විකිණීම'}
                            </span>
                            <span className="font-mono text-stone-400 text-[11px] font-bold">{b.billNumber}</span>
                          </div>
                          <div className="text-stone-300 font-semibold">
                            {b.partyName} — <span className="text-stone-400">{b.grainNameSinhala} ({b.quantityKg} Kg)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-harvest-400 font-bold font-sans block text-sm">
                            රු. {b.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-500">{b.billDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Stock Movements */}
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white font-heading">නවතම තොග චලනයන් (Audit Log)</h3>
                  <button
                    onClick={() => setActiveTab('stock_history')}
                    className="text-xs text-harvest-400 hover:underline"
                  >
                    සම්පූර්ණ ඉතිහාසය ({stockMovements.length}) →
                  </button>
                </div>

                {stockMovements.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4 text-center">දැනට තොග චලනයන් වාර්තා වී නොමැත.</p>
                ) : (
                  <div className="space-y-2.5">
                    {stockMovements.slice(0, 5).map((mov) => (
                      <div key={mov.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <strong className="text-white">{mov.grainNameSinhala}</strong>
                            <span className="text-[10px] text-stone-500 font-mono">{mov.billNumber || 'ගනුදෙනුව'}</span>
                          </div>
                          <span className="text-stone-400 block mt-0.5 text-[11px]">
                            {mov.notes || (mov.movementType === 'INCOMING' ? 'තොග මිලදී ගැනීම' : 'තොග විකිණීම')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold block ${
                            mov.movementType === 'INCOMING' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {mov.movementType === 'INCOMING' ? '+' : '-'}{mov.quantityKg} Kg
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {mov.stockBeforeKg} → {mov.stockAfterKg} Kg
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

        {/* TAB 2: STOCK MANAGEMENT */}
        {activeTab === 'stock' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-heading flex items-center space-x-2">
                  <Boxes className="w-5 h-5 text-harvest-400" />
                  <span>තොග කළමනාකරණය (Stock Management)</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  ගබඩාවේ පවතින ධාන්‍ය තොග ප්‍රමාණ, අවම අනතුරු ඇඟවීමේ සීමාවන් සහ තොග චලනයන් මෙහෙයවන්න.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenIncomingModal()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>+ තොග මිලදී ගැනීම</span>
                </button>

                <button
                  onClick={() => handleOpenOutgoingModal()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-gold transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>- තොග විකිණීම</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ධාන්‍ය නමින් සොයන්න..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>

              {/* Category & Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-harvest-500"
                >
                  <option value="ALL">සියලු කාණ්ඩ (All)</option>
                  <option value="PADDY">වී වර්ග (Paddy)</option>
                  <option value="CEREALS">ධාන්‍ය වර්ග (Cereals)</option>
                  <option value="PULSES">පියලි / ඇට (Pulses)</option>
                  <option value="OILSEEDS">තෙල් බීජ (Oilseeds)</option>
                </select>

                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-harvest-500"
                >
                  <option value="ALL">සියලු තොග තත්ත්ව (All Status)</option>
                  <option value="ADEQUATE">🟢 ප්‍රමාණවත් (Adequate)</option>
                  <option value="LOW">🟡 අඩු තොග (Low Stock)</option>
                  <option value="OUT">🔴 තොග අවසන් (Out of Stock)</option>
                </select>
              </div>

            </div>

            {/* Stock Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">ධාන්‍ය වර්ගය</th>
                      <th className="p-4">කාණ්ඩය</th>
                      <th className="p-4">පවතින තොගය (Current Stock)</th>
                      <th className="p-4">අවම සීමාව (Alert Level)</th>
                      <th className="p-4">තත්ත්වය (Status)</th>
                      <th className="p-4">අවසන් වෙනස</th>
                      <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {filteredGrains.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">
                          සොයන ලද නිර්ණායකවලට අදාළ ධාන්‍ය වර්ග හමු නොවීය.
                        </td>
                      </tr>
                    ) : (
                      filteredGrains.map((g) => {
                        const info = stockService.getGrainStockInfo(g);
                        return (
                          <tr key={g.id} className="hover:bg-stone-800/50 transition-colors">
                            
                            <td className="p-4 font-bold text-white">
                              <div className="text-sm font-heading">{g.nameSinhala}</div>
                              <div className="text-[10px] text-stone-500 font-normal">{g.nameEnglish}</div>
                            </td>

                            <td className="p-4 text-stone-400 font-medium">
                              {g.categorySinhala}
                            </td>

                            <td className="p-4 font-mono">
                              <div className="text-base font-extrabold text-white">
                                {info.stockKg.toLocaleString()} <span className="text-xs font-normal text-stone-400">Kg</span>
                              </div>
                              {info.stockKg >= 1000 && (
                                <span className="text-[11px] text-harvest-400 font-semibold block">
                                  (ටොන් {info.stockTons})
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => handleOpenMinStockEdit(g)}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 hover:border-harvest-500/50 text-stone-300 font-mono text-xs transition-colors"
                                title="අවම අනතුරු ඇඟවීමේ සීමාව වෙනස් කරන්න"
                              >
                                <span>{info.minLevelKg} Kg</span>
                                <Edit3 className="w-3 h-3 text-stone-500" />
                              </button>
                            </td>

                            <td className="p-4">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${info.badgeBg} ${info.badgeBorder} ${info.badgeText}`}>
                                <span>{info.labelSinhala}</span>
                              </span>
                            </td>

                            <td className="p-4 text-stone-400 text-[11px]">
                              {g.lastUpdated}
                            </td>

                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenIncomingModal(g.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold transition-colors inline-flex items-center space-x-1"
                                title="තොග මිලදී ගෙන එකතු කරන්න"
                              >
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>+ මිලදී ගන්න</span>
                              </button>

                              <button
                                onClick={() => handleOpenOutgoingModal(g.id)}
                                disabled={info.stockKg <= 0}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[11px] font-bold transition-colors inline-flex items-center space-x-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="තොග විකුණා නිකුත් කරන්න"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                <span>- විකුණන්න</span>
                              </button>

                              <button
                                onClick={() => {
                                  setHistoryGrainFilter(g.id);
                                  setActiveTab('stock_history');
                                }}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors inline-block"
                                title="මෙම ධාන්‍යයේ තොග ඉතිහාසය බලන්න"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: INCOMING PURCHASE BILLS */}
        {activeTab === 'incoming_bills' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-heading flex items-center space-x-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  <span>ධාන්‍ය මිලදී ගැනීමේ බිල්පත් ({incomingBills.length})</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  ගොවීන්ගෙන් සහ සැපයුම්කරුවන්ගෙන් මිලදී ගත් සියලුම බිල්පත් වාර්තා.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenIncomingModal()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>නව මිලදී ගැනීමේ බිල්පතක්</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 flex items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="බිල්පත් අංකය, ගොවි නම, දුරකථනය..."
                  value={billSearchQuery}
                  onChange={(e) => setBillSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>
              <div className="text-xs font-mono text-stone-400 font-bold hidden sm:block">
                මුළු එකතුව: <span className="text-emerald-400">රු. {totalIncomingAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Bills Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">බිල්පත් අංකය</th>
                      <th className="p-4">දිනය</th>
                      <th className="p-4">ගොවි මහතා / සැපයුම්කරු</th>
                      <th className="p-4">ධාන්‍ය වර්ගය & ප්‍රමාණය</th>
                      <th className="p-4">ඒකක මිල</th>
                      <th className="p-4">මුළු මුදල</th>
                      <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {filteredIncomingBills.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">
                          දැනට මිලදී ගැනීමේ බිල්පත් කිසිවක් හමු නොවීය.
                        </td>
                      </tr>
                    ) : (
                      filteredIncomingBills.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-800/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-emerald-400">
                            {b.billNumber}
                          </td>
                          <td className="p-4 text-stone-300 whitespace-nowrap">
                            {b.billDate}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{b.partyName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{b.phone}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{b.grainNameSinhala}</span>
                            <span className="font-mono text-stone-300 font-semibold">{b.quantityKg} Kg</span>
                          </td>
                          <td className="p-4 font-mono text-stone-300">
                            රු. {b.pricePerKg.toFixed(2)}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                            රු. {b.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setViewingReceipt(b)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-harvest-300 border border-stone-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>බිල්පත / Print</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: OUTGOING SALES BILLS */}
        {activeTab === 'outgoing_bills' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-heading flex items-center space-x-2">
                  <ArrowUpRight className="w-5 h-5 text-amber-400" />
                  <span>ධාන්‍ය විකිණීමේ බිල්පත් ({outgoingBills.length})</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  පාරිභෝගිකයන්ට සහ ගැනුම්කරුවන්ට විකිණූ සියලුම බිල්පත් වාර්තා.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenOutgoingModal()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-gold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>නව විකුණුම් බිල්පතක්</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 flex items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="බිල්පත් අංකය, ගැනුම්කරු, දුරකථනය..."
                  value={billSearchQuery}
                  onChange={(e) => setBillSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>
              <div className="text-xs font-mono text-stone-400 font-bold hidden sm:block">
                මුළු ආදායම: <span className="text-amber-400">රු. {totalOutgoingAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Bills Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">බිල්පත් අංකය</th>
                      <th className="p-4">දිනය</th>
                      <th className="p-4">පාරිභෝගිකයා / ගැනුම්කරු</th>
                      <th className="p-4">ධාන්‍ය වර්ගය & ප්‍රමාණය</th>
                      <th className="p-4">විකුණුම් මිල</th>
                      <th className="p-4">මුළු මුදල</th>
                      <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {filteredOutgoingBills.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">
                          දැනට විකිණීමේ බිල්පත් කිසිවක් හමු නොවීය.
                        </td>
                      </tr>
                    ) : (
                      filteredOutgoingBills.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-800/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-400">
                            {b.billNumber}
                          </td>
                          <td className="p-4 text-stone-300 whitespace-nowrap">
                            {b.billDate}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{b.partyName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{b.phone}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{b.grainNameSinhala}</span>
                            <span className="font-mono text-stone-300 font-semibold">{b.quantityKg} Kg</span>
                          </td>
                          <td className="p-4 font-mono text-stone-300">
                            රු. {b.pricePerKg.toFixed(2)}
                          </td>
                          <td className="p-4 font-mono font-bold text-amber-400 text-sm">
                            රු. {b.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setViewingReceipt(b)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-harvest-300 border border-stone-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>බිල්පත / Print</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: STOCK HISTORY / AUDIT LOG */}
        {activeTab === 'stock_history' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-heading flex items-center space-x-2">
                  <History className="w-5 h-5 text-harvest-400" />
                  <span>තොග චලන ඉතිහාසය (Stock Movement Audit Trail)</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  සෑම මිලදී ගැනීමක් සහ විකිණීමක්ම සටහන් වන විගණන ලේඛනය.
                </p>
              </div>

              {/* Grain Filter Dropdown */}
              <div className="flex items-center space-x-2">
                <select
                  value={historyGrainFilter}
                  onChange={(e) => setHistoryGrainFilter(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                >
                  <option value="ALL">සියලුම ධාන්‍ය වර්ග (All Grains)</option>
                  {grains.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameSinhala}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">දිනය සහ වේලාව</th>
                      <th className="p-4">චලන වර්ගය</th>
                      <th className="p-4">ධාන්‍ය වර්ගය</th>
                      <th className="p-4">ප්‍රමාණයේ වෙනස</th>
                      <th className="p-4">පෙර තොගය → පසු තොගය</th>
                      <th className="p-4">බිල්පත් අංකය</th>
                      <th className="p-4">සටහන් / ගනුදෙනුකරු</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">
                          දැනට තොග චලන වාර්තා කිසිවක් හමු නොවීය.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((mov) => {
                        const isInc = mov.movementType === 'INCOMING';
                        return (
                          <tr key={mov.id} className="hover:bg-stone-800/50 transition-colors">
                            <td className="p-4 text-stone-400 whitespace-nowrap">
                              {new Date(mov.createdAt).toLocaleDateString('si-LK')}
                              <span className="block text-[10px] text-stone-500">
                                {new Date(mov.createdAt).toLocaleTimeString('si-LK', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isInc
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border-amber-800'
                              }`}>
                                {isInc ? (
                                  <>
                                    <ArrowDownLeft className="w-3 h-3" />
                                    <span>මිලදී ගැනීම (IN)</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpRight className="w-3 h-3" />
                                    <span>විකිණීම (OUT)</span>
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="p-4 font-bold text-white">
                              {mov.grainNameSinhala}
                            </td>

                            <td className="p-4 font-mono font-bold text-sm">
                              <span className={isInc ? 'text-emerald-400' : 'text-amber-400'}>
                                {isInc ? '+' : '-'}{mov.quantityKg.toLocaleString()} Kg
                              </span>
                            </td>

                            <td className="p-4 font-mono text-stone-300 text-[11px]">
                              {mov.stockBeforeKg.toLocaleString()} Kg → <strong className="text-white">{mov.stockAfterKg.toLocaleString()} Kg</strong>
                            </td>

                            <td className="p-4 font-mono text-stone-400 font-semibold">
                              {mov.billNumber ? (
                                <button
                                  onClick={() => {
                                    const matched = bills.find(b => b.billNumber === mov.billNumber);
                                    if (matched) setViewingReceipt(matched);
                                  }}
                                  className="text-harvest-400 hover:underline"
                                  title="බිල්පත විවෘත කරන්න"
                                >
                                  {mov.billNumber}
                                </button>
                              ) : (
                                '—'
                              )}
                            </td>

                            <td className="p-4 text-stone-400 max-w-xs truncate">
                              {mov.notes || '—'}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: PRICE & GRAIN MANAGEMENT */}
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

        {/* TAB 7: SELL REQUESTS */}
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
                      <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {sellRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-stone-800/50">
                        <td className="p-4 font-mono font-bold text-harvest-400">{req.referenceNo}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{req.customerName}</div>
                          <a href={`tel:${req.phoneNumber.replace(/[\s-]+/g, '')}`} className="text-emerald-400 hover:underline">
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
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <a
                            href={`https://wa.me/${req.phoneNumber.replace(/[\s-+]/g, '')}?text=${encodeURIComponent(
                              `ආයුබෝවන් ${req.customerName}, ඔබ අනගි ස්ටෝර්ස් වෙත යොමු කළ ධාන්‍ය අලෙවි ඉල්ලීම (${req.referenceNo}) සම්බන්ධයෙනි.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900 inline-block"
                          >
                            WhatsApp
                          </a>

                          <button
                            onClick={() => handleDeleteSellRequest(req.id)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-700 transition-colors inline-block"
                            title="මකන්න"
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

        {/* TAB 8: PICKUP REQUESTS */}
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
                      <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {pickupRequests.map((pck) => (
                      <tr key={pck.id} className="hover:bg-stone-800/50">
                        <td className="p-4 font-mono font-bold text-harvest-400">{pck.referenceNo}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{pck.customerName}</div>
                          <a href={`tel:${pck.phoneNumber.replace(/[\s-]+/g, '')}`} className="text-emerald-400 hover:underline">
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
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <a
                            href={`https://wa.me/${pck.phoneNumber.replace(/[\s-+]/g, '')}?text=${encodeURIComponent(
                              `ආයුබෝවන් ${pck.customerName}, ඔබ අනගි ස්ටෝර්ස් වෙත යොමු කළ තොග රැගෙන යාමේ ඉල්ලීම (${pck.referenceNo}) සම්බන්ධයෙනි.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900 inline-block"
                          >
                            WhatsApp
                          </a>

                          <button
                            onClick={() => handleDeletePickupRequest(pck.id)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-700 transition-colors inline-block"
                            title="මකන්න"
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

        {/* TAB 9: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  පාරිභෝගික විමසීම් සහ පණිවිඩ ({contactMessages.length})
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  වෙබ් අඩවියේ "අපව අමතන්න" පෝරමය හරහා පාරිභෝගිකයන් යොමු කළ පණිවිඩ.
                </p>
              </div>

              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>නැවුම් කරන්න</span>
              </button>
            </div>

            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
              {contactMessages.length === 0 ? (
                <div className="p-12 text-center text-stone-500 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-stone-600" />
                  <p className="text-sm">දැනට පාරිභෝගික පණිවිඩ කිසිවක් නොමැත.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase font-semibold">
                      <tr>
                        <th className="p-4">දිනය / වේලාව</th>
                        <th className="p-4">නම සහ දුරකථන අංකය</th>
                        <th className="p-4">විෂය (Subject)</th>
                        <th className="p-4">පණිවිඩය (Message)</th>
                        <th className="p-4 text-right">ක්‍රියාමාර්ග</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-200">
                      {contactMessages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-stone-800/50 transition-colors">
                          <td className="p-4 text-stone-400 whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString('si-LK')}
                            <span className="block text-[10px] text-stone-500">
                              {new Date(msg.createdAt).toLocaleTimeString('si-LK', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-bold text-white text-sm">{msg.name}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <a 
                                href={`tel:${msg.phone.replace(/[\s-]+/g, '')}`} 
                                className="text-emerald-400 hover:underline flex items-center space-x-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{msg.phone}</span>
                              </a>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-harvest-300">
                            {msg.subject || 'සාමාන්‍ය විමසීමක්'}
                          </td>
                          <td className="p-4 text-stone-300 max-w-md">
                            <p className="whitespace-pre-wrap leading-relaxed bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                              {msg.message}
                            </p>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap space-x-2">
                            <a
                              href={`https://wa.me/${msg.phone.replace(/[\s-+]/g, '')}?text=${encodeURIComponent(
                                `ආයුබෝවන් ${msg.name}, ඔබ අනගි ස්ටෝර්ස් වෙත යොමු කළ විමසීම (${msg.subject}) සම්බන්ධයෙනි.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900 inline-flex items-center space-x-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-bold transition-colors inline-flex items-center space-x-1"
                              title="පණිවිඩය මකා දමන්න"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>මකන්න</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: CREATE INCOMING PURCHASE BILL */}
      <CreateIncomingBillModal
        isOpen={showIncomingModal}
        onClose={() => setShowIncomingModal(false)}
        grains={grains}
        preselectedGrainId={selectedGrainForBill}
        onBillCreated={handleBillCreated}
      />

      {/* MODAL: CREATE OUTGOING SALES BILL */}
      <CreateOutgoingBillModal
        isOpen={showOutgoingModal}
        onClose={() => setShowOutgoingModal(false)}
        grains={grains}
        preselectedGrainId={selectedGrainForBill}
        onBillCreated={handleBillCreated}
      />

      {/* MODAL: VIEW / PRINT BILL RECEIPT */}
      <BillReceiptModal
        bill={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />

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

      {/* MODAL: EDIT MINIMUM STOCK ALERT LEVEL */}
      {editingMinStockGrain && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-700 max-w-sm w-full text-white space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base font-heading">අවම තොග සීමාව සංස්කරණය</h3>
              <button onClick={() => setEditingMinStockGrain(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block">ධාන්‍ය වර්ගය:</span>
                <strong className="text-sm text-white">{editingMinStockGrain.nameSinhala}</strong>
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">අවම අනතුරු ඇඟවීමේ තොග මට්ටම (Kg):</label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={newMinStockValue}
                  onChange={(e) => setNewMinStockValue(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white font-sans text-lg font-bold focus:outline-none focus:ring-2 focus:ring-harvest-500"
                />
                <p className="text-[11px] text-stone-400 pt-1">
                  තොගය මෙම ප්‍රමාණයට වඩා අඩු වූ විට පද්ධතිය "🟡 අඩු තොග" ලෙස අනතුරු අඟවයි.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => setEditingMinStockGrain(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
              >
                අවලංගු කරන්න
              </button>
              <button
                onClick={handleSaveMinStock}
                className="px-5 py-2 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-stone-950 font-bold text-xs shadow-gold"
              >
                සුරකින්න
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW GRAIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddGrain} className="bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-700 max-w-lg w-full text-white space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-lg font-heading">නව ධාන්‍ය වර්ගයක් එක් කිරීම</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">සිංහල නම *</label>
                <input
                  type="text"
                  placeholder="උදා: සුවඳැල් වී"
                  value={newGrainNameSi}
                  onChange={(e) => setNewGrainNameSi(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
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
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">කාණ්ඩය</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
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
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:ring-1 focus:ring-harvest-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">ආරම්භක තොගය (Kg)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={newInitialStock}
                  onChange={(e) => setNewInitialStock(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-semibold">අවම අනතුරු ඇඟවීමේ තොගය (Kg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="100"
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-stone-300 font-semibold">තත්ත්ව පිරිවිතර (Quality Grade description)</label>
                <input
                  type="text"
                  placeholder="උදා: තෙතමනය 14% ට අඩු, පිරිසිදු කළ තත්ත්වය"
                  value={newGradeSi}
                  onChange={(e) => setNewGradeSi(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-harvest-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
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
