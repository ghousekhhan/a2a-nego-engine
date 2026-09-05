/**
 * Candidate Deal Generator (Single Product & Multi-Product Basket)
 * Reference: Section 17 PRODUCT_SPEC.md & Section 21-23, 51-57 DECISION_ENGINE_SPEC.md
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  DealItem,
  SupplierFacts,
} from '../types/index.ts';
import { calculateSellerEconomics } from './economics.ts';

export interface MultiSupplierCatalog {
  supplierId: string;
  sellerPolicy: SellerPolicy;
  supplierFacts: SupplierFacts;
}

/**
 * Generates discrete candidate deals for a single seller & buyer policy context
 */
export function generateSingleSupplierCandidates(
  buyerPolicy: BuyerPolicy,
  sellerPolicy: SellerPolicy,
  supplierFacts: SupplierFacts,
  baseItem: DealItem
): CanonicalDeal[] {
  const candidates: CanonicalDeal[] = [];
  const prodConfig = sellerPolicy.products[baseItem.productId];
  if (!prodConfig) return candidates;

  // 1. Quantity options
  const quantities: number[] = Array.from(
    new Set([
      baseItem.quantity,
      buyerPolicy.requiredQuantity,
      buyerPolicy.minQuantity ?? buyerPolicy.requiredQuantity,
      buyerPolicy.preferredQuantity ?? buyerPolicy.requiredQuantity,
      Math.round(buyerPolicy.requiredQuantity * 1.2),
      Math.round(buyerPolicy.requiredQuantity * 1.5),
      Math.round(buyerPolicy.requiredQuantity * 2.0),
    ].filter((q) => q > 0 && q <= prodConfig.availableInventory))
  );

  // 2. Delivery options
  const deliveryOptions: { days: number; expedited: boolean }[] = [
    { days: buyerPolicy.requiredDeliveryDays, expedited: false },
  ];
  if (buyerPolicy.preferredDeliveryDays && buyerPolicy.preferredDeliveryDays !== buyerPolicy.requiredDeliveryDays) {
    deliveryOptions.push({ days: buyerPolicy.preferredDeliveryDays, expedited: true });
  }
  if (sellerPolicy.expediteCostPerOrder) {
    deliveryOptions.push({ days: Math.max(1, buyerPolicy.requiredDeliveryDays - 2), expedited: true });
  }

  // 3. Payment options
  const paymentOptions: string[] = sellerPolicy.paymentTerms ?? ['upfront', '15_days', '30_days'];

  // 4. Contract months
  const contractOptions: number[] = [1, 6, 12];

  // 5. Price discretization per quantity
  for (const qty of quantities) {
    const mockDeal: CanonicalDeal = {
      supplierId: sellerPolicy.supplierId,
      items: [{ productId: baseItem.productId, quantity: qty, unitPrice: prodConfig.basePrice }],
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      paymentTerms: '30_days',
    };
    const sellerEcon = calculateSellerEconomics(mockDeal, sellerPolicy);

    const minPricePerUnit = Math.ceil(sellerEcon.minRequiredRevenue / qty);
    const basePricePerUnit = prodConfig.basePrice;
    const initialOfferPrice = baseItem.unitPrice;

    const prices: number[] = Array.from(
      new Set(
        [
          initialOfferPrice,
          basePricePerUnit,
          minPricePerUnit,
          minPricePerUnit + 1,
          Math.round((basePricePerUnit + minPricePerUnit) / 2),
          Math.round(basePricePerUnit * 0.95),
          Math.round(basePricePerUnit * 0.90),
        ].filter((p) => p >= minPricePerUnit - 10)
      )
    );

    for (const price of prices) {
      for (const del of deliveryOptions) {
        for (const payment of paymentOptions) {
          for (const contract of contractOptions) {
            candidates.appendDealIfUnique(candidates, {
              supplierId: sellerPolicy.supplierId,
              items: [
                {
                  productId: baseItem.productId,
                  quantity: qty,
                  unitPrice: price,
                  productCost: prodConfig.productCost,
                },
              ],
              deliveryDays: del.days,
              paymentTerms: payment,
              contractMonths: contract,
              expeditedDelivery: del.expedited,
            });
          }
        }
      }
    }
  }

  return candidates;
}

// Extension helper for unique deal pushes
declare global {
  interface Array<T> {
    appendDealIfUnique(list: CanonicalDeal[], deal: CanonicalDeal): void;
  }
}

if (!Array.prototype.appendDealIfUnique) {
  Array.prototype.appendDealIfUnique = function (list: CanonicalDeal[], deal: CanonicalDeal) {
    const exists = list.some(
      (d) =>
        d.supplierId === deal.supplierId &&
        d.items[0]?.productId === deal.items[0]?.productId &&
        d.items[0]?.quantity === deal.items[0]?.quantity &&
        d.items[0]?.unitPrice === deal.items[0]?.unitPrice &&
        d.deliveryDays === deal.deliveryDays &&
        d.paymentTerms === deal.paymentTerms &&
        d.contractMonths === deal.contractMonths &&
        d.expeditedDelivery === deal.expeditedDelivery
    );
    if (!exists) {
      list.push(deal);
    }
  };
}

/**
 * Multi-Supplier Basket Candidate Generator
 * Generates options for single supplier fulfillment vs split supplier fulfillment
 */
export function generateBasketCandidates(
  requirements: { productId: string; quantity: number }[],
  suppliers: MultiSupplierCatalog[],
  buyerPolicy: BuyerPolicy
): { singleSupplierOptions: CanonicalDeal[]; splitSupplierOptions: CanonicalDeal[] } {
  const singleSupplierOptions: CanonicalDeal[] = [];
  const splitSupplierOptions: CanonicalDeal[] = [];

  // 1. Single supplier options (all items from same supplier)
  for (const sup of suppliers) {
    const canFulfillAll = requirements.every((req) => {
      const prod = sup.sellerPolicy.products[req.productId];
      return prod && prod.availableInventory >= req.quantity;
    });

    if (canFulfillAll) {
      const items: DealItem[] = requirements.map((req) => {
        const prod = sup.sellerPolicy.products[req.productId];
        return {
          productId: req.productId,
          quantity: req.quantity,
          unitPrice: prod.basePrice,
          productCost: prod.productCost,
        };
      });

      singleSupplierOptions.push({
        supplierId: sup.supplierId,
        items,
        deliveryDays: buyerPolicy.requiredDeliveryDays,
        paymentTerms: sup.sellerPolicy.paymentTerms[0] ?? '30_days',
      });
    }
  }

  return {
    singleSupplierOptions,
    splitSupplierOptions,
  };
}
