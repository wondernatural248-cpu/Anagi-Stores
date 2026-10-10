import { BillItem, BillType, CreateBillInput, StockMovement, GrainItem } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const BILLS_STORAGE_KEY = 'anagi_bills_data_v1';
const MOVEMENTS_STORAGE_KEY = 'anagi_stock_movements_data_v1';
const GRAINS_STORAGE_KEY = 'anagi_grains_data_v1';

export const mapDbRowToBillItem = (row: any): BillItem => {
  return {
    id: row.id,
    billNumber: row.bill_number,
    billType: row.bill_type as BillType,
    partyName: row.party_name,
    phone: row.phone,
    grainId: row.grain_id,
    grainNameSinhala: row.grain_name_sinhala,
    quantityKg: Number(row.quantity_kg),
    pricePerKg: Number(row.price_per_kg),
    totalAmount: Number(row.total_amount),
    billDate: row.bill_date,
    notes: row.notes,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const mapDbRowToStockMovement = (row: any): StockMovement => {
  return {
    id: row.id,
    grainId: row.grain_id,
    grainNameSinhala: row.grain_name_sinhala,
    movementType: row.movement_type,
    billId: row.bill_id,
    billNumber: row.bill_number,
    quantityKg: Number(row.quantity_kg),
    stockBeforeKg: Number(row.stock_before_kg),
    stockAfterKg: Number(row.stock_after_kg),
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
};

class BillingService {
  private localBills: BillItem[] = [];
  private localMovements: StockMovement[] = [];

  constructor() {
    this.loadLocal();
  }

  private loadLocal(): void {
    try {
      const storedBills = localStorage.getItem(BILLS_STORAGE_KEY);
      if (storedBills) {
        this.localBills = JSON.parse(storedBills);
      } else {
        this.localBills = [];
      }

      const storedMovements = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
      if (storedMovements) {
        this.localMovements = JSON.parse(storedMovements);
      } else {
        this.localMovements = [];
      }
    } catch {
      this.localBills = [];
      this.localMovements = [];
    }
  }

  private saveLocal(): void {
    try {
      localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(this.localBills));
      localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(this.localMovements));
    } catch (e) {
      console.error('Error saving billing data to localStorage', e);
    }
  }

  // Get all bills or filter by type
  async getBills(type?: BillType): Promise<BillItem[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });

        if (type) {
          query = query.eq('bill_type', type);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase getBills error, using local fallback:', error.message);
          return type ? this.localBills.filter(b => b.billType === type) : [...this.localBills];
        }

        return (data || []).map(mapDbRowToBillItem);
      } catch (err) {
        console.warn('Supabase getBills fetch failed, using local fallback:', err);
      }
    }

    return type ? this.localBills.filter(b => b.billType === type) : [...this.localBills];
  }

  // Atomic Incoming Purchase Bill Transaction
  async createIncomingBill(input: CreateBillInput, grainNameSinhala?: string): Promise<{ bill: BillItem; success: boolean }> {
    if (input.quantityKg <= 0) {
      throw new Error('වලංගු ධාන්‍ය ප්‍රමාණයක් ඇතුළත් කරන්න (0 ට වඩා වැඩි විය යුතුය).');
    }
    if (input.pricePerKg < 0) {
      throw new Error('වලංගු මිලක් ඇතුළත් කරන්න.');
    }

    const totalAmount = Math.round(input.quantityKg * input.pricePerKg * 100) / 100;
    const todayStr = input.billDate || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('create_incoming_bill', {
          p_party_name: input.partyName.trim(),
          p_phone: input.phone.trim(),
          p_grain_id: input.grainId,
          p_quantity_kg: input.quantityKg,
          p_price_per_kg: input.pricePerKg,
          p_bill_date: todayStr,
          p_notes: input.notes?.trim() || null,
          p_created_by: 'Admin',
          p_bill_number: input.billNumber || null
        });

        if (error) {
          console.error('Supabase RPC create_incoming_bill error:', error);
          throw new Error(error.message || 'බිල්පත ඇතුළත් කිරීමේදී දෝෂයක් මතු විය.');
        }

        // Fetch newly created bill
        const { data: billData, error: billError } = await supabase
          .from('bills')
          .select('*')
          .eq('id', data.bill_id)
          .single();

        if (billError || !billData) {
          const fallbackCreated: BillItem = {
            id: data.bill_id,
            billNumber: data.bill_number,
            billType: 'INCOMING',
            partyName: input.partyName,
            phone: input.phone,
            grainId: input.grainId,
            grainNameSinhala: data.grain_name_sinhala || grainNameSinhala || 'ධාන්‍ය',
            quantityKg: input.quantityKg,
            pricePerKg: input.pricePerKg,
            totalAmount: totalAmount,
            billDate: todayStr,
            notes: input.notes,
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          };
          return { bill: fallbackCreated, success: true };
        }

        return { bill: mapDbRowToBillItem(billData), success: true };
      } catch (err: any) {
        console.error('Incoming bill RPC execution error:', err);
        throw new Error(err.message || 'බිල්පත ඇතුළත් කිරීමේදී දෝෂයක් මතු විය.');
      }
    }

    // Local Storage Fallback Implementation
    let grainsList: GrainItem[] = [];
    try {
      const stored = localStorage.getItem(GRAINS_STORAGE_KEY);
      if (stored) grainsList = JSON.parse(stored);
    } catch {
      // ignore
    }

    const grainIndex = grainsList.findIndex(g => g.id === input.grainId);
    const grain = grainIndex !== -1 ? grainsList[grainIndex] : null;
    const resolvedName = grain ? grain.nameSinhala : (grainNameSinhala || 'ධාන්‍ය');
    const stockBefore = grain ? (grain.currentStockKg || 0) : 0;
    const stockAfter = stockBefore + input.quantityKg;

    if (grainIndex !== -1) {
      grainsList[grainIndex].currentStockKg = stockAfter;
      localStorage.setItem(GRAINS_STORAGE_KEY, JSON.stringify(grainsList));
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCode = todayStr.replace(/-/g, '');
    const billNumber = input.billNumber || `IN-${dateCode}-${randomSuffix}`;
    const billId = `bill-${Date.now()}`;

    const newBill: BillItem = {
      id: billId,
      billNumber,
      billType: 'INCOMING',
      partyName: input.partyName.trim(),
      phone: input.phone.trim(),
      grainId: input.grainId,
      grainNameSinhala: resolvedName,
      quantityKg: input.quantityKg,
      pricePerKg: input.pricePerKg,
      totalAmount,
      billDate: todayStr,
      notes: input.notes,
      status: 'COMPLETED',
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      grainId: input.grainId,
      grainNameSinhala: resolvedName,
      movementType: 'INCOMING',
      billId,
      billNumber,
      quantityKg: input.quantityKg,
      stockBeforeKg: stockBefore,
      stockAfterKg: stockAfter,
      notes: input.notes || `තොග මිලදී ගැනීම (${input.partyName})`,
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    this.localBills.unshift(newBill);
    this.localMovements.unshift(newMovement);
    this.saveLocal();

    return { bill: newBill, success: true };
  }

  // Atomic Outgoing Sales Bill Transaction (Strict Stock Validation)
  async createOutgoingBill(input: CreateBillInput, grainNameSinhala?: string): Promise<{ bill: BillItem; success: boolean }> {
    if (input.quantityKg <= 0) {
      throw new Error('වලංගු ධාන්‍ය ප්‍රමාණයක් ඇතුළත් කරන්න (0 ට වඩා වැඩි විය යුතුය).');
    }
    if (input.pricePerKg < 0) {
      throw new Error('වලංගු විකුණුම් මිලක් ඇතුළත් කරන්න.');
    }

    const totalAmount = Math.round(input.quantityKg * input.pricePerKg * 100) / 100;
    const todayStr = input.billDate || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('create_outgoing_bill', {
          p_party_name: input.partyName.trim(),
          p_phone: input.phone.trim(),
          p_grain_id: input.grainId,
          p_quantity_kg: input.quantityKg,
          p_price_per_kg: input.pricePerKg,
          p_bill_date: todayStr,
          p_notes: input.notes?.trim() || null,
          p_created_by: 'Admin',
          p_bill_number: input.billNumber || null
        });

        if (error) {
          console.error('Supabase RPC create_outgoing_bill error:', error);
          if (error.message && error.message.includes('ප්‍රමාණවත් තොගයක් නොමැත')) {
            throw new Error(error.message);
          }
          throw new Error(error.message || 'විකිණුම් බිල්පත නිකුත් කිරීමේදී දෝෂයක් මතු විය.');
        }

        // Fetch newly created bill
        const { data: billData, error: billError } = await supabase
          .from('bills')
          .select('*')
          .eq('id', data.bill_id)
          .single();

        if (billError || !billData) {
          const fallbackCreated: BillItem = {
            id: data.bill_id,
            billNumber: data.bill_number,
            billType: 'OUTGOING',
            partyName: input.partyName,
            phone: input.phone,
            grainId: input.grainId,
            grainNameSinhala: data.grain_name_sinhala || grainNameSinhala || 'ධාන්‍ය',
            quantityKg: input.quantityKg,
            pricePerKg: input.pricePerKg,
            totalAmount: totalAmount,
            billDate: todayStr,
            notes: input.notes,
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          };
          return { bill: fallbackCreated, success: true };
        }

        return { bill: mapDbRowToBillItem(billData), success: true };
      } catch (err: any) {
        console.error('Outgoing bill RPC execution error:', err);
        throw new Error(err.message || 'විකිණුම් බිල්පත නිකුත් කිරීමේදී දෝෂයක් මතු විය.');
      }
    }

    // Local Storage Fallback Implementation
    let grainsList: GrainItem[] = [];
    try {
      const stored = localStorage.getItem(GRAINS_STORAGE_KEY);
      if (stored) grainsList = JSON.parse(stored);
    } catch {
      // ignore
    }

    const grainIndex = grainsList.findIndex(g => g.id === input.grainId);
    const grain = grainIndex !== -1 ? grainsList[grainIndex] : null;
    const resolvedName = grain ? grain.nameSinhala : (grainNameSinhala || 'ධාන්‍ය');
    const stockBefore = grain ? (grain.currentStockKg || 0) : 0;

    // STRICT STOCK CHECK: Reject if insufficient stock!
    if (stockBefore < input.quantityKg) {
      throw new Error(`ප්‍රමාණවත් තොගයක් නොමැත. (පවතින තොගය: ${stockBefore} Kg, ඉල්ලූ ප්‍රමාණය: ${input.quantityKg} Kg)`);
    }

    const stockAfter = stockBefore - input.quantityKg;

    if (grainIndex !== -1) {
      grainsList[grainIndex].currentStockKg = stockAfter;
      localStorage.setItem(GRAINS_STORAGE_KEY, JSON.stringify(grainsList));
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCode = todayStr.replace(/-/g, '');
    const billNumber = input.billNumber || `OUT-${dateCode}-${randomSuffix}`;
    const billId = `bill-${Date.now()}`;

    const newBill: BillItem = {
      id: billId,
      billNumber,
      billType: 'OUTGOING',
      partyName: input.partyName.trim(),
      phone: input.phone.trim(),
      grainId: input.grainId,
      grainNameSinhala: resolvedName,
      quantityKg: input.quantityKg,
      pricePerKg: input.pricePerKg,
      totalAmount,
      billDate: todayStr,
      notes: input.notes,
      status: 'COMPLETED',
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      grainId: input.grainId,
      grainNameSinhala: resolvedName,
      movementType: 'OUTGOING',
      billId,
      billNumber,
      quantityKg: input.quantityKg,
      stockBeforeKg: stockBefore,
      stockAfterKg: stockAfter,
      notes: input.notes || `තොග විකිණීම (${input.partyName})`,
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    this.localBills.unshift(newBill);
    this.localMovements.unshift(newMovement);
    this.saveLocal();

    return { bill: newBill, success: true };
  }

  // Get Stock Movements audit history
  async getStockMovements(grainId?: string): Promise<StockMovement[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('stock_movements')
          .select('*')
          .order('created_at', { ascending: false });

        if (grainId) {
          query = query.eq('grain_id', grainId);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase getStockMovements error, using local fallback:', error.message);
          return grainId ? this.localMovements.filter(m => m.grainId === grainId) : [...this.localMovements];
        }

        return (data || []).map(mapDbRowToStockMovement);
      } catch (err) {
        console.warn('Supabase getStockMovements fetch failed, using local fallback:', err);
      }
    }

    return grainId ? this.localMovements.filter(m => m.grainId === grainId) : [...this.localMovements];
  }
}

export const billingService = new BillingService();
