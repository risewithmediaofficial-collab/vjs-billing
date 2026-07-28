export const STORES = [
  { id: 'store-1', name: 'Main Store', location: 'Hyderabad' },
  { id: 'store-2', name: 'Branch 2', location: 'Secunderabad' }
];

// Initial product data for VJS Jewellery
export const initialProducts = [
  {
    id: 'PRD-001',
    barcode: 'HUID-8901234567890',
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
    barcode: 'HUID-8901234567891',
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
    barcode: 'HUID-8901234567892',
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
    barcode: 'HUID-8901234567893',
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

export const JEWEL_LOAN_TERMS = [
  '1. The pledged article is held in safe custody as security for the loan amount.',
  '2. Interest is payable monthly/yearly at the agreed standard rate during the 1-year (or agreed) tenure.',
  '3. OVERDUE CLAUSE: If the loan amount is not paid or renewed on or before the due date, an increased overdue interest rate will apply as set by management.',
  '4. In case of non-repayment after due date & notice period, management reserves the right to auction the pledged item to recover dues.',
  '5. Original Jewel Loan Card Bill / Receipt must be presented at the time of settlement or renewal.',
];

// Calculate simple & overdue interest based on monthly rate and due date
// If total duration < 1 month, defaults to 1 month minimum interest
export function calculateLoanInterest(principal, standardRatePerMonth, issueDateStr, settlementDateStr, overdueRatePerMonth = null, dueDateStr = null) {
  const issue = new Date(issueDateStr);
  const settle = new Date(settlementDateStr || new Date());
  
  let due = dueDateStr ? new Date(dueDateStr) : null;
  if (!due) {
    due = new Date(issue);
    due.setFullYear(due.getFullYear() + 1); // default 1 year
  }

  const overdueRate = overdueRatePerMonth !== null && overdueRatePerMonth !== undefined ? overdueRatePerMonth : standardRatePerMonth;

  // Calculate total days difference
  const totalMs = Math.max(0, settle - issue);
  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  let totalMonths = totalDays / 30;
  if (totalMonths < 1) totalMonths = 1;

  const isOverdue = settle > due;

  let normalMonths = totalMonths;
  let overdueMonths = 0;

  if (isOverdue && due > issue) {
    const normalDays = Math.max(0, Math.ceil((due - issue) / (1000 * 60 * 60 * 24)));
    normalMonths = normalDays / 30;
    const overdueDays = Math.max(0, Math.ceil((settle - due) / (1000 * 60 * 60 * 24)));
    overdueMonths = overdueDays / 30;
  }

  const normalInterest = (principal * standardRatePerMonth * normalMonths) / 100;
  const overdueInterest = (principal * overdueRate * overdueMonths) / 100;
  const totalInterest = normalInterest + overdueInterest;

  return {
    months: totalMonths.toFixed(1),
    normalMonths: normalMonths.toFixed(1),
    overdueMonths: overdueMonths.toFixed(1),
    normalInterest: Math.round(normalInterest),
    overdueInterest: Math.round(overdueInterest),
    interestAmount: Math.round(totalInterest),
    totalRepayment: Math.round(principal + totalInterest),
    isOverdue,
    dueDate: due,
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
