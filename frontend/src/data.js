export const STORES = [
  { id: 'store-1', name: 'Main Store', location: 'Hyderabad' },
  { id: 'store-2', name: 'Branch 2', location: 'Secunderabad' }
];

// Initial product data for VJS Jewellery
export const initialProducts = [
  {
    id: 'PRD-001',
    barcode: '8901234567890',
    name: 'Gold Ring 22K',
    category: 'Rings',
    weight: 5.5,
    purity: '22K',
    makingCharge: 2500,
    stoneCharge: 0,
    goldRate: 7500,
    stock: 10,
    storeId: 'store-1',
    image: null,
  },
  {
    id: 'PRD-002',
    barcode: '8901234567891',
    name: 'Gold Necklace 22K',
    category: 'Necklaces',
    weight: 18.2,
    purity: '22K',
    makingCharge: 8500,
    stoneCharge: 2000,
    goldRate: 7500,
    stock: 5,
    storeId: 'store-1',
    image: null,
  },
  {
    id: 'PRD-003',
    barcode: '8901234567892',
    name: 'Diamond Earrings',
    category: 'Earrings',
    weight: 2.1,
    purity: '18K',
    makingCharge: 3200,
    stoneCharge: 15000,
    goldRate: 7200,
    stock: 8,
    storeId: 'store-1',
    image: null,
  },
  {
    id: 'PRD-004',
    barcode: '8901234567893',
    name: 'Gold Bracelet 22K',
    category: 'Bracelets',
    weight: 12.5,
    purity: '22K',
    makingCharge: 5500,
    stoneCharge: 0,
    goldRate: 7500,
    stock: 6,
    storeId: 'store-2',
    image: null,
  },
  {
    id: 'PRD-005',
    barcode: '8901234567894',
    name: 'Gold Bangle Set 22K',
    category: 'Bangles',
    weight: 35.0,
    purity: '22K',
    makingCharge: 12000,
    stoneCharge: 0,
    goldRate: 7500,
    stock: 4,
    storeId: 'store-2',
    image: null,
  },
  {
    id: 'PRD-006',
    barcode: '8901234567895',
    name: 'Platinum Ring',
    category: 'Rings',
    weight: 4.2,
    purity: 'Platinum',
    makingCharge: 4000,
    stoneCharge: 8000,
    goldRate: 9500,
    stock: 3,
    storeId: 'store-1',
    image: null,
  },
  {
    id: 'PRD-007',
    barcode: '8901234567896',
    name: 'Gold Chain 22K',
    category: 'Chains',
    weight: 8.8,
    purity: '22K',
    makingCharge: 3500,
    stoneCharge: 0,
    goldRate: 7500,
    stock: 12,
    storeId: 'store-1',
    image: null,
  },
  {
    id: 'PRD-008',
    barcode: '8901234567897',
    name: 'Ruby Pendant 18K',
    category: 'Pendants',
    weight: 3.3,
    purity: '18K',
    makingCharge: 2800,
    stoneCharge: 5500,
    goldRate: 7200,
    stock: 7,
    storeId: 'store-2',
    image: null,
  },
];

export const initialStaff = [
  { id: 'STF-001', name: 'Rajesh Kumar', role: 'Senior Staff', pin: '1234', storeId: 'store-1' },
  { id: 'STF-002', name: 'Priya Sharma', role: 'Staff', pin: '5678', storeId: 'store-1' },
  { id: 'STF-003', name: 'Anil Verma', role: 'Manager', pin: '9012', storeId: 'store-2' },
  { id: 'STF-004', name: 'Sunita Devi', role: 'Staff', pin: '3456', storeId: 'store-2' },
  { id: 'STF-005', name: 'System Admin', role: 'Admin', pin: '0000', storeId: 'store-1' },
];

export const SHOP_INFO = {
  name: 'VJS Jewellery',
  address: '123, Gold Market Street, Hyderabad - 500001',
  phone: '+91 98765 43210',
  email: 'vjsjewellery@gmail.com',
  gstNumber: '36AABCV1234M1Z5',
  logo: null,
};

export const GST_RATE = 0.03; // 3%

export function calculateBillAmounts(product, quantity = 1, liveRate = null) {
  // Use the live rate (from Settings) when provided; fall back to the rate stored on the product.
  const rate = liveRate !== null ? liveRate : product.goldRate;
  const goldValue = product.weight * rate * quantity;
  const makingCharge = product.makingCharge * quantity;
  const stoneCharge = product.stoneCharge * quantity;
  const subtotal = goldValue + makingCharge + stoneCharge;
  const gstAmount = subtotal * GST_RATE;
  const totalAmount = subtotal + gstAmount;

  return {
    goldValue,
    makingCharge,
    stoneCharge,
    subtotal,
    gstAmount,
    totalAmount,
  };
}

export function generateInvoiceNumber(existingBills) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Find the highest sequence number already used this year (across ALL stores)
  let maxSeq = 0;
  (existingBills || []).forEach(b => {
    const inv = b.invoiceNumber || '';
    if (inv.startsWith(prefix)) {
      const seq = parseInt(inv.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

export function generateLoanNumber(existingLoans) {
  const year = new Date().getFullYear();
  const count = existingLoans.length + 1;
  return `GL-${year}-${String(count).padStart(4, '0')}`;
}

// Calculate simple interest based on monthly rate
// If months < 1, defaults to 1 month minimum interest
export function calculateLoanInterest(principal, ratePerMonth, issueDateStr, settlementDateStr) {
  const issue = new Date(issueDateStr);
  const settle = new Date(settlementDateStr);
  
  // Calculate months difference
  const diffTime = Math.abs(settle - issue);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let months = diffDays / 30; // Approx month calculation
  
  // Minimum 1 month interest
  if (months < 1) months = 1;

  const interestAmount = (principal * ratePerMonth * months) / 100;
  return {
    months: months.toFixed(1),
    interestAmount: Math.round(interestAmount),
    totalRepayment: Math.round(principal + interestAmount)
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
