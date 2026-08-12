export interface InvoiceItemInput {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceTaxCalculation {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  calculatedItems: Array<InvoiceItemInput & { amount: number }>;
}

export class InvoiceEngine {
  public static calculateInvoiceTaxes(
    items: InvoiceItemInput[],
    clientState?: string,
    companyState: string = 'Maharashtra'
  ): InvoiceTaxCalculation {
    let subtotal = 0;
    const calculatedItems = items.map((item) => {
      const amount = (item.quantity || 1) * (item.price || 0);
      subtotal += amount;
      return { ...item, amount };
    });

    const isIntraState = clientState
      ? clientState.trim().toLowerCase() === companyState.trim().toLowerCase()
      : true;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIntraState) {
      cgst = Math.round(subtotal * 0.09 * 100) / 100;
      sgst = Math.round(subtotal * 0.09 * 100) / 100;
    } else {
      igst = Math.round(subtotal * 0.18 * 100) / 100;
    }

    const totalTax = cgst + sgst + igst;
    const totalAmount = Math.round((subtotal + totalTax) * 100) / 100;

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount,
      calculatedItems
    };
  }

  public static generateInvoiceNumber(prefix: string = 'INV', sequence: number = 1): string {
    const year = new Date().getFullYear().toString().substring(2);
    const formattedSeq = sequence.toString().padStart(4, '0');
    return `${prefix}-${year}-${formattedSeq}`;
  }
}
