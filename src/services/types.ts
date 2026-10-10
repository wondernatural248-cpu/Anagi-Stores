// Type definitions for Anagi Stores (අනගි ස්ටෝර්ස්)

export type BuyingStatus = 'BUYING' | 'LIMITED' | 'PAUSED';

export type GrainCategory = 'PADDY' | 'PULSES' | 'CEREALS' | 'OILSEEDS' | 'SPICES' | 'OTHER';

export interface GrainItem {
  id: string;
  nameSinhala: string;
  nameEnglish: string;
  category: GrainCategory;
  categorySinhala: string;
  currentPricePerKg: number;
  unit: string; // e.g. "කි.ග්‍රෑ. 1ක් සඳහා" (Per 1 kg)
  buyingStatus: BuyingStatus;
  statusLabelSinhala: string;
  lastUpdated: string;
  minQuantityKg: number;
  maxDailyCapacityKg?: number;
  gradeDescriptionSinhala: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendValue?: number;
  isFeatured: boolean;
  notesSinhala?: string;
  currentStockKg?: number;
  minStockLevelKg?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BillType = 'INCOMING' | 'OUTGOING';
export type BillStatus = 'COMPLETED' | 'CANCELLED';
export type MovementType = 'INCOMING' | 'OUTGOING' | 'ADJUSTMENT';

export interface BillItem {
  id: string;
  billNumber: string;
  billType: BillType;
  partyName: string;
  phone: string;
  grainId: string;
  grainNameSinhala: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  billDate: string;
  notes?: string;
  status: BillStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  grainId: string;
  grainNameSinhala: string;
  movementType: MovementType;
  billId?: string;
  billNumber?: string;
  quantityKg: number;
  stockBeforeKg: number;
  stockAfterKg: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface StockSummaryStats {
  totalStockKg: number;
  totalStockTons: number;
  lowStockCount: number;
  outOfStockCount: number;
  adequateStockCount: number;
}

export interface CreateBillInput {
  billType: BillType;
  partyName: string;
  phone: string;
  grainId: string;
  quantityKg: number;
  pricePerKg: number;
  billDate?: string;
  notes?: string;
  billNumber?: string;
}

export type SellRequestStatus = 'NEW' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';

export interface SellRequest {
  id: string;
  referenceNo: string;
  customerName: string;
  phoneNumber: string;
  grainId?: string;
  grainNameSinhala: string;
  quantityKg: number;
  unitPrice: number;
  estimatedTotal: number;
  location: string;
  additionalMessage?: string;
  status: SellRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export type PickupRequestStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface PickupRequest {
  id: string;
  referenceNo: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  area: string; // District/Town e.g. "අනුරාධපුරය"
  grainId?: string;
  grainNameSinhala: string;
  quantityKg: number;
  preferredDate: string;
  preferredTime: string;
  additionalNotes?: string;
  status: PickupRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export interface BusinessInfo {
  nameSinhala: string;
  nameEnglish: string;
  taglineSinhala: string;
  taglineEnglish: string;
  hotline: string;
  hotlineSecondary: string;
  whatsappNumber: string;
  addressSinhala: string;
  addressEnglish: string;
  districtSinhala: string;
  email: string;
  openingHoursSinhala: string;
  openingDaysSinhala: string;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
}

export interface AdminStats {
  totalGrains: number;
  buyingGrainsCount: number;
  newSellRequestsCount: number;
  newPickupRequestsCount: number;
  isLiveDatabase: boolean;
}
