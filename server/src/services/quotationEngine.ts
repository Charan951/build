export interface LineItemInput {
  moduleName: string;
  description?: string;
  hours: number;
  rate: number;
}

export interface QuotationCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  calculatedItems: Array<LineItemInput & { lineTotal: number }>;
}

export class QuotationEngine {
  public static calculateQuotation(
    items: LineItemInput[],
    discountType: 'percentage' | 'fixed',
    discountValue: number,
    taxType: 'GST_18' | 'CGST_SGST_9' | 'NONE'
  ): QuotationCalculationResult {
    let subtotal = 0;
    const calculatedItems = items.map((item) => {
      const lineTotal = (item.hours || 0) * (item.rate || 0);
      subtotal += lineTotal;
      return { ...item, lineTotal };
    });

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * (discountValue || 0)) / 100;
    } else {
      discountAmount = discountValue || 0;
    }

    if (discountAmount > subtotal) discountAmount = subtotal;

    const taxableAmount = subtotal - discountAmount;

    let taxRate = 0;
    if (taxType === 'GST_18' || taxType === 'CGST_SGST_9') {
      taxRate = 0.18;
    }

    const taxAmount = taxableAmount * taxRate;
    const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      grandTotal,
      calculatedItems
    };
  }

  public static incrementVersion(currentVersion: string): string {
    const parts = currentVersion.replace('v', '').split('.');
    if (parts.length < 2) return 'v1.1';
    const major = parts[0];
    const minor = parseInt(parts[1], 10) + 1;
    return `v${major}.${minor}`;
  }
}
