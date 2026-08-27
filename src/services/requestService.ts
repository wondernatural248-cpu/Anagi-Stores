import { SellRequest, PickupRequest, ContactMessage, SellRequestStatus, PickupRequestStatus } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const SELL_REQUESTS_KEY = 'anagi_sell_requests_v1';
const PICKUP_REQUESTS_KEY = 'anagi_pickup_requests_v1';
const MESSAGES_KEY = 'anagi_contact_messages_v1';

const INITIAL_SELL_REQUESTS: SellRequest[] = [
  {
    id: 'sell-1',
    referenceNo: 'AN-SEL-7821',
    customerName: 'එස්. පී. කරුණාරත්න',
    phoneNumber: '071 456 7890',
    grainId: 'grain-1',
    grainNameSinhala: 'කීරී සම්බා වී (Keeri Samba)',
    quantityKg: 850,
    unitPrice: 145,
    estimatedTotal: 123250,
    location: 'තඹුත්තේගම',
    additionalMessage: 'මිටි 17ක් ඇත. අද දින භාරදීමට හැකිය.',
    status: 'CONTACTED',
    createdAt: '2026-08-26 09:15'
  },
  {
    id: 'sell-2',
    referenceNo: 'AN-SEL-7822',
    customerName: 'ඩබ්. එම්. බණ්ඩාර',
    phoneNumber: '077 890 1234',
    grainId: 'grain-4',
    grainNameSinhala: 'කුරක්කන් (Kurakkan)',
    quantityKg: 120,
    unitPrice: 320,
    estimatedTotal: 38400,
    location: 'ගල්ගමුව',
    additionalMessage: 'දේශීය කුරක්කන්. හොඳින් පිරිසිදු කර ඇත.',
    status: 'NEW',
    createdAt: '2026-08-26 10:30'
  }
];

const INITIAL_PICKUP_REQUESTS: PickupRequest[] = [
  {
    id: 'pck-1',
    referenceNo: 'AN-PCK-4410',
    customerName: 'කේ. ජයතිලක',
    phoneNumber: '076 123 9988',
    address: 'නො. 45, ගොවිපළ පාර, ඇපලවත්ත',
    area: 'පොලොන්නරුව / මැදිරිගිරිය',
    grainId: 'grain-2',
    grainNameSinhala: 'නාඩු වී (Nadu Paddy)',
    quantityKg: 6500,
    preferredDate: '2026-08-28',
    preferredTime: 'පෙ.ව. 09:00 - 11:00',
    additionalNotes: 'ලොරි රථයකින් පැමිණ රැගෙන යාමට අවශ්‍යයි. මිටි 130ක් ඇත.',
    status: 'SCHEDULED',
    createdAt: '2026-08-26 08:20'
  },
  {
    id: 'pck-2',
    referenceNo: 'AN-PCK-4411',
    customerName: 'සුනිල් ප්‍රනාන්දු',
    phoneNumber: '070 334 5566',
    address: 'මහවැලි ‘එච්’ කලාපය, නොච්චියාගම',
    area: 'අනුරාධපුරය',
    grainId: 'grain-7',
    grainNameSinhala: 'බඩඉරිඟු (Maize / Corn)',
    quantityKg: 12000,
    preferredDate: '2026-08-29',
    preferredTime: 'පෙ.ව. 10:00',
    additionalNotes: 'ට්‍රැක්ටර් හෝ ලොරි රථ පහසුවෙන් පැමිණිය හැක.',
    status: 'NEW',
    createdAt: '2026-08-26 10:45'
  }
];

// Helper to map DB row to SellRequest
const mapDbToSellRequest = (row: any): SellRequest => ({
  id: row.id,
  referenceNo: row.reference_no,
  customerName: row.customer_name,
  phoneNumber: row.phone,
  grainId: row.grain_id,
  grainNameSinhala: row.grain_name_sinhala,
  quantityKg: Number(row.quantity_kg),
  unitPrice: Number(row.unit_price) || 0,
  estimatedTotal: Number(row.estimated_total) || 0,
  location: row.area,
  additionalMessage: row.message,
  status: row.status as SellRequestStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Helper to map DB row to PickupRequest
const mapDbToPickupRequest = (row: any): PickupRequest => ({
  id: row.id,
  referenceNo: row.reference_no,
  customerName: row.customer_name,
  phoneNumber: row.phone,
  address: row.address,
  area: row.area,
  grainId: row.grain_id,
  grainNameSinhala: row.grain_name_sinhala,
  quantityKg: Number(row.quantity_kg),
  preferredDate: row.preferred_date,
  preferredTime: row.preferred_time,
  additionalNotes: row.message,
  status: row.status as PickupRequestStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

class RequestService {
  private localSellRequests: SellRequest[] = [];
  private localPickupRequests: PickupRequest[] = [];
  private localMessages: ContactMessage[] = [];

  constructor() {
    this.loadLocal();
  }

  private loadLocal(): void {
    try {
      const storedSell = localStorage.getItem(SELL_REQUESTS_KEY);
      this.localSellRequests = storedSell ? JSON.parse(storedSell) : INITIAL_SELL_REQUESTS;

      const storedPickup = localStorage.getItem(PICKUP_REQUESTS_KEY);
      this.localPickupRequests = storedPickup ? JSON.parse(storedPickup) : INITIAL_PICKUP_REQUESTS;

      const storedMsg = localStorage.getItem(MESSAGES_KEY);
      this.localMessages = storedMsg ? JSON.parse(storedMsg) : [];
    } catch {
      this.localSellRequests = INITIAL_SELL_REQUESTS;
      this.localPickupRequests = INITIAL_PICKUP_REQUESTS;
      this.localMessages = [];
    }
  }

  private persistSell(): void {
    try {
      localStorage.setItem(SELL_REQUESTS_KEY, JSON.stringify(this.localSellRequests));
    } catch (e) {
      console.error(e);
    }
  }

  private persistPickup(): void {
    try {
      localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(this.localPickupRequests));
    } catch (e) {
      console.error(e);
    }
  }

  private persistMessages(): void {
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(this.localMessages));
    } catch (e) {
      console.error(e);
    }
  }

  // Submit Sell Request
  async submitSellRequest(data: Omit<SellRequest, 'id' | 'referenceNo' | 'status' | 'createdAt'>): Promise<SellRequest> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `AN-SEL-${randomCode}`;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data: dbData, error } = await supabase
          .from('sell_requests')
          .insert({
            reference_no: referenceNo,
            customer_name: data.customerName,
            phone: data.phoneNumber,
            grain_id: data.grainId && data.grainId.length > 20 ? data.grainId : null,
            grain_name_sinhala: data.grainNameSinhala,
            quantity_kg: data.quantityKg,
            unit_price: data.unitPrice,
            estimated_total: data.estimatedTotal,
            area: data.location,
            message: data.additionalMessage || null,
            status: 'NEW'
          })
          .select()
          .single();

        if (error) throw error;
        return mapDbToSellRequest(dbData);
      } catch (err) {
        console.error('Supabase submitSellRequest failed, saving to local store:', err);
      }
    }

    // Local fallback
    const newRequest: SellRequest = {
      ...data,
      id: `sell-${Date.now()}`,
      referenceNo,
      status: 'NEW',
      createdAt: now
    };
    this.localSellRequests.unshift(newRequest);
    this.persistSell();
    return newRequest;
  }

  // Submit Pickup Request
  async submitPickupRequest(data: Omit<PickupRequest, 'id' | 'referenceNo' | 'status' | 'createdAt'>): Promise<PickupRequest> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `AN-PCK-${randomCode}`;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data: dbData, error } = await supabase
          .from('pickup_requests')
          .insert({
            reference_no: referenceNo,
            customer_name: data.customerName,
            phone: data.phoneNumber,
            address: data.address,
            area: data.area,
            grain_id: data.grainId && data.grainId.length > 20 ? data.grainId : null,
            grain_name_sinhala: data.grainNameSinhala,
            quantity_kg: data.quantityKg,
            preferred_date: data.preferredDate,
            preferred_time: data.preferredTime,
            message: data.additionalNotes || null,
            status: 'NEW'
          })
          .select()
          .single();

        if (error) throw error;
        return mapDbToPickupRequest(dbData);
      } catch (err) {
        console.error('Supabase submitPickupRequest failed, saving to local store:', err);
      }
    }

    // Local fallback
    const newPickup: PickupRequest = {
      ...data,
      id: `pck-${Date.now()}`,
      referenceNo,
      status: 'NEW',
      createdAt: now
    };
    this.localPickupRequests.unshift(newPickup);
    this.persistPickup();
    return newPickup;
  }

  // Submit Contact Message
  async submitContactMessage(name: string, phone: string, subject: string, message: string): Promise<ContactMessage> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .insert({
            name,
            phone,
            subject,
            message
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
            isRead: data.is_read,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        console.error('Supabase submitContactMessage error:', err);
      }
    }

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      phone,
      subject,
      message,
      createdAt: now
    };
    this.localMessages.unshift(newMsg);
    this.persistMessages();
    return newMsg;
  }

  // Admin: Get all sell requests
  async getSellRequests(): Promise<SellRequest[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('sell_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) return data.map(mapDbToSellRequest);
      } catch (err) {
        console.warn('Supabase getSellRequests failed, using local store:', err);
      }
    }

    return [...this.localSellRequests];
  }

  // Admin: Get all pickup requests
  async getPickupRequests(): Promise<PickupRequest[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('pickup_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) return data.map(mapDbToPickupRequest);
      } catch (err) {
        console.warn('Supabase getPickupRequests failed, using local store:', err);
      }
    }

    return [...this.localPickupRequests];
  }

  // Admin: Update Sell request status
  async updateSellStatus(id: string, status: SellRequestStatus): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('sell_requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Supabase updateSellStatus error:', err);
      }
    }

    const item = this.localSellRequests.find((r) => r.id === id);
    if (item) {
      item.status = status;
      this.persistSell();
    }
  }

  // Admin: Update Pickup request status
  async updatePickupStatus(id: string, status: PickupRequestStatus): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('pickup_requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Supabase updatePickupStatus error:', err);
      }
    }

    const item = this.localPickupRequests.find((r) => r.id === id);
    if (item) {
      item.status = status;
      this.persistPickup();
    }
  }
}

export const requestService = new RequestService();
