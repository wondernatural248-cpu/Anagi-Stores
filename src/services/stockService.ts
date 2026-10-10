import { GrainItem, StockSummaryStats, StockMovement } from './types';
import { billingService } from './billingService';

export type StockStatusType = 'ADEQUATE' | 'LOW' | 'OUT';

export interface GrainStockInfo {
  status: StockStatusType;
  labelSinhala: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  stockKg: number;
  stockTons: number;
  minLevelKg: number;
}

class StockService {
  // Compute summary stats across all grains
  calculateStockSummary(grains: GrainItem[]): StockSummaryStats {
    let totalStockKg = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let adequateStockCount = 0;

    for (const g of grains) {
      const stock = Number(g.currentStockKg) || 0;
      const minLevel = Number(g.minStockLevelKg) || 100;
      totalStockKg += stock;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock < minLevel) {
        lowStockCount++;
      } else {
        adequateStockCount++;
      }
    }

    return {
      totalStockKg,
      totalStockTons: Math.round((totalStockKg / 1000) * 100) / 100,
      lowStockCount,
      outOfStockCount,
      adequateStockCount
    };
  }

  // Determine individual grain stock status
  getGrainStockInfo(grain: GrainItem): GrainStockInfo {
    const stockKg = Number(grain.currentStockKg) || 0;
    const minLevelKg = Number(grain.minStockLevelKg) || 100;
    const stockTons = Math.round((stockKg / 1000) * 100) / 100;

    if (stockKg <= 0) {
      return {
        status: 'OUT',
        labelSinhala: 'තොග අවසන්',
        colorClass: 'text-rose-400',
        badgeBg: 'bg-rose-950/80',
        badgeBorder: 'border-rose-800',
        badgeText: 'text-rose-300',
        stockKg,
        stockTons,
        minLevelKg
      };
    }

    if (stockKg < minLevelKg) {
      return {
        status: 'LOW',
        labelSinhala: 'අඩු තොග',
        colorClass: 'text-amber-400',
        badgeBg: 'bg-amber-950/80',
        badgeBorder: 'border-amber-800',
        badgeText: 'text-amber-300',
        stockKg,
        stockTons,
        minLevelKg
      };
    }

    return {
      status: 'ADEQUATE',
      labelSinhala: 'ප්‍රමාණවත්',
      colorClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-800',
      badgeText: 'text-emerald-300',
      stockKg,
      stockTons,
      minLevelKg
    };
  }

  // Get movement audit logs
  async getMovements(grainId?: string): Promise<StockMovement[]> {
    return billingService.getStockMovements(grainId);
  }
}

export const stockService = new StockService();
