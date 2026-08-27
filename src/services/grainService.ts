import { GrainItem, BuyingStatus } from './types';
import { SAMPLE_GRAINS } from '../data/sampleGrains';
import { supabase, isSupabaseConfigured } from './supabase';

const GRAINS_STORAGE_KEY = 'anagi_grains_data_v1';

// Helper to map Supabase database row to frontend GrainItem
export const mapDbRowToGrainItem = (row: any): GrainItem => {
  let buyingStatus: BuyingStatus = 'BUYING';
  if (!row.is_buying) {
    buyingStatus = 'PAUSED';
  } else if (row.status_label_sinhala === 'සීමිත ප්‍රමාණයක්') {
    buyingStatus = 'LIMITED';
  }

  return {
    id: row.id,
    nameSinhala: row.name_sinhala,
    nameEnglish: row.name_english,
    category: row.category,
    categorySinhala: row.category_sinhala,
    currentPricePerKg: Number(row.price),
    unit: row.unit || 'කි.ග්‍රෑ. 1ක් සඳහා',
    buyingStatus,
    statusLabelSinhala: row.status_label_sinhala || (row.is_buying ? 'දැනට මිලදී ගනී' : 'තාවකාලිකව නවතා ඇත'),
    lastUpdated: row.last_updated || 'අද යාවත්කාලීන විය',
    minQuantityKg: Number(row.min_quantity_kg) || 10,
    gradeDescriptionSinhala: row.grade_description_sinhala || '',
    trend: row.trend || 'STABLE',
    trendValue: Number(row.trend_value) || 0,
    isFeatured: !!row.is_featured,
    notesSinhala: row.notes_sinhala,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

class GrainService {
  private localGrains: GrainItem[] = [];

  constructor() {
    this.loadLocal();
  }

  private loadLocal(): void {
    try {
      const stored = localStorage.getItem(GRAINS_STORAGE_KEY);
      if (stored) {
        this.localGrains = JSON.parse(stored);
      } else {
        this.localGrains = [...SAMPLE_GRAINS];
        this.saveLocal();
      }
    } catch {
      this.localGrains = [...SAMPLE_GRAINS];
    }
  }

  private saveLocal(): void {
    try {
      localStorage.setItem(GRAINS_STORAGE_KEY, JSON.stringify(this.localGrains));
    } catch (e) {
      console.error('Error saving grains to localStorage', e);
    }
  }

  // Get all grains (from Supabase if configured, otherwise local fallback)
  async getGrains(): Promise<GrainItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('grains')
          .select('*')
          .order('name_sinhala', { ascending: true });

        if (error) {
          console.warn('Supabase getGrains error, using local fallback:', error.message);
          return [...this.localGrains];
        }

        if (data && data.length > 0) {
          return data.map(mapDbRowToGrainItem);
        } else {
          // Table exists but is empty -> return empty array so admin can seed or add
          return [];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local fallback:', err);
        return [...this.localGrains];
      }
    }

    return [...this.localGrains];
  }

  // Admin: Update price of a grain
  async updateGrainPrice(id: string, newPrice: number): Promise<GrainItem | null> {
    const now = new Date();
    const timeString = `අද ${now.toLocaleTimeString('si-LK', { hour: '2-digit', minute: '2-digit' })} ට`;

    if (isSupabaseConfigured()) {
      try {
        // Fetch current grain to compute price trend
        const { data: current } = await supabase
          .from('grains')
          .select('price')
          .eq('id', id)
          .single();

        const oldPrice = current ? Number(current.price) : newPrice;
        const diff = newPrice - oldPrice;
        const trend = diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'STABLE';
        const trendValue = Math.abs(diff);

        const { data, error } = await supabase
          .from('grains')
          .update({
            price: newPrice,
            trend,
            trend_value: trendValue,
            last_updated: timeString,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return mapDbRowToGrainItem(data);
      } catch (err) {
        console.error('Supabase updateGrainPrice error:', err);
      }
    }

    // Local fallback update
    const index = this.localGrains.findIndex((g) => g.id === id);
    if (index !== -1) {
      const oldPrice = this.localGrains[index].currentPricePerKg;
      const diff = newPrice - oldPrice;
      this.localGrains[index] = {
        ...this.localGrains[index],
        currentPricePerKg: newPrice,
        trend: diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'STABLE',
        trendValue: Math.abs(diff),
        lastUpdated: timeString
      };
      this.saveLocal();
      return this.localGrains[index];
    }
    return null;
  }

  // Admin: Toggle buying status
  async toggleBuyingStatus(id: string, isBuying: boolean, customLabel?: string): Promise<GrainItem | null> {
    const statusLabel = customLabel || (isBuying ? 'දැනට මිලදී ගනී' : 'තාවකාලිකව නවතා ඇත');

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('grains')
          .update({
            is_buying: isBuying,
            status_label_sinhala: statusLabel,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return mapDbRowToGrainItem(data);
      } catch (err) {
        console.error('Supabase toggleBuyingStatus error:', err);
      }
    }

    const index = this.localGrains.findIndex((g) => g.id === id);
    if (index !== -1) {
      this.localGrains[index] = {
        ...this.localGrains[index],
        buyingStatus: isBuying ? 'BUYING' : 'PAUSED',
        statusLabelSinhala: statusLabel
      };
      this.saveLocal();
      return this.localGrains[index];
    }
    return null;
  }

  // Admin: Add new grain
  async addGrain(grain: Omit<GrainItem, 'id' | 'lastUpdated' | 'trend' | 'statusLabelSinhala'>): Promise<GrainItem> {
    const isBuying = grain.buyingStatus !== 'PAUSED';
    const statusLabel = isBuying ? 'දැනට මිලදී ගනී' : 'තාවකාලිකව නවතා ඇත';
    const now = new Date();
    const timeString = `අද ${now.toLocaleTimeString('si-LK', { hour: '2-digit', minute: '2-digit' })} ට`;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('grains')
          .insert({
            name_sinhala: grain.nameSinhala,
            name_english: grain.nameEnglish,
            category: grain.category,
            category_sinhala: grain.categorySinhala,
            price: grain.currentPricePerKg,
            unit: grain.unit || 'කි.ග්‍රෑ. 1ක් සඳහා',
            is_buying: isBuying,
            status_label_sinhala: statusLabel,
            last_updated: timeString,
            min_quantity_kg: grain.minQuantityKg || 10,
            grade_description_sinhala: grain.gradeDescriptionSinhala || '',
            trend: 'STABLE',
            trend_value: 0,
            is_featured: grain.isFeatured || false,
            notes_sinhala: grain.notesSinhala
          })
          .select()
          .single();

        if (error) throw error;
        return mapDbRowToGrainItem(data);
      } catch (err) {
        console.error('Supabase addGrain error:', err);
        throw err;
      }
    }

    // Local fallback
    const created: GrainItem = {
      ...grain,
      id: `grain-${Date.now()}`,
      statusLabelSinhala: statusLabel,
      lastUpdated: timeString,
      trend: 'STABLE',
      trendValue: 0
    };
    this.localGrains.unshift(created);
    this.saveLocal();
    return created;
  }

  // Admin: Delete grain
  async deleteGrain(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('grains')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteGrain error:', err);
        throw err;
      }
    }

    this.localGrains = this.localGrains.filter(g => g.id !== id);
    this.saveLocal();
    return true;
  }

  // Admin: Seed sample grains to Supabase database
  async seedSampleGrainsToDatabase(): Promise<{ count: number; error?: string }> {
    if (!isSupabaseConfigured()) {
      this.localGrains = [...SAMPLE_GRAINS];
      this.saveLocal();
      return { count: SAMPLE_GRAINS.length };
    }

    try {
      const rowsToInsert = SAMPLE_GRAINS.map((g) => ({
        name_sinhala: g.nameSinhala,
        name_english: g.nameEnglish,
        category: g.category,
        category_sinhala: g.categorySinhala,
        price: g.currentPricePerKg,
        unit: g.unit,
        is_buying: g.buyingStatus !== 'PAUSED',
        status_label_sinhala: g.statusLabelSinhala,
        last_updated: g.lastUpdated,
        min_quantity_kg: g.minQuantityKg,
        grade_description_sinhala: g.gradeDescriptionSinhala,
        trend: g.trend,
        trend_value: g.trendValue || 0,
        is_featured: g.isFeatured,
        notes_sinhala: g.notesSinhala
      }));

      const { data, error } = await supabase
        .from('grains')
        .insert(rowsToInsert)
        .select();

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.length || rowsToInsert.length };
    } catch (err: any) {
      return { count: 0, error: err.message || 'Seeding failed' };
    }
  }
}

export const grainService = new GrainService();
