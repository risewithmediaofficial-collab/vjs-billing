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

export function calculateBillAmounts(product, quantity = 1, liveRate = null, chargeGst = true) {
  // Use the live rate (from Settings) when provided; fall back to the rate stored on the product.
  const rate = liveRate !== null ? liveRate : (product.goldRate || 7500);
  const grossWeight = (product.grossWeight || product.weight || 0) * quantity;
  const netWeight = (product.netWeight || product.weight || 0) * quantity;
  const goldValue = netWeight * rate;
  const makingCharge = (product.makingCharge || 0) * quantity;
  const stoneCharge = (product.stoneCharge || 0) * quantity;
  const taxableValue = goldValue + makingCharge + stoneCharge;
  const subtotal = taxableValue;

  // Determine GST rate: if chargeGst is false, GST is 0%; otherwise use product's gstPercent (defaults to 3%)
  const gstPercent = chargeGst ? (product.gstPercent !== undefined ? Number(product.gstPercent) : 3) : 0;
  const halfRate = (gstPercent / 2) / 100;

  // Split GST into CGST and SGST
  const cgstAmount = gstPercent > 0 ? Math.round((taxableValue * halfRate) * 100) / 100 : 0;
  const sgstAmount = gstPercent > 0 ? Math.round((taxableValue * halfRate) * 100) / 100 : 0;
  const gstAmount = cgstAmount + sgstAmount;

  const totalAmount = taxableValue + gstAmount;
  const netPayable = Math.round(totalAmount);
  const roundOff = Math.round((netPayable - totalAmount) * 100) / 100;

  // VA (Value Addition) for Rough Bill / Quotation calculations
  // VA per gram = total making charge / net weight
  const vaPerGram = netWeight > 0 ? Math.round((makingCharge / netWeight) * 100) / 100 : 0;
  // VA % = (making charge / gold value) * 100
  const vaPercent = goldValue > 0 ? Math.round((makingCharge / goldValue * 100) * 100) / 100 : 0;

  return {
    grossWeight,
    netWeight,
    goldValue,
    makingCharge,
    stoneCharge,
    taxableValue,
    subtotal,
    gstPercent,
    cgstAmount,
    sgstAmount,
    gstAmount,
    totalAmount,
    roundOff,
    netPayable,
    vaPerGram,
    vaPercent,
    rate,
    hsn: product.hsn || (product.purity === 'Silver' ? '7114' : '711319'),
  };
}

export function generateInvoiceNumber(existingBills, isQuotation = false) {
  const year = new Date().getFullYear();
  const prefix = isQuotation ? `EST-${year}-` : `INV-${year}-`;

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

// ─── Tamil Terms & Conditions for Backside of Jewel Loan Card Bill ────────────
export const JEWEL_LOAN_TAMIL_TERMS = [
  {
    num: 1,
    text: 'பங்குதாரர்கள் தங்களுக்கு சொந்தமான நகைகளை மட்டுமே அடகு வைக்க வேண்டும்.',
  },
  {
    num: 2,
    text: 'நகையை அடகு வைத்தவர்கள் நகைக் கடன் திட்டத்தில் குறிப்பிட்டுள்ள நிலுவைத் தேதிக்குள் முழுப்பணத்தை செலுத்தி நகையை மீட்டுக் கொள்ளவேண்டும் அல்லது புதுப்பித்துக் கொள்ளவேண்டும்.',
  },
  {
    num: 3,
    text: 'நகைக்கடன் பெற்ற 30 நாட்களுக்குள் பைசல் செய்தால், பகுதி அசல் செலுத்தியிருந்தாலும் கடன் பெற்ற தொகைக்கு 30 நாட்களுக்கு உண்டான வட்டி வசூலிக்கப்படும்.',
  },
  {
    num: 4,
    text: 'அடகுவைத்த நகை அடமானம் வைத்த நபரிடம் மட்டுமே திருப்பிக் கொடுக்கப்படும்.',
  },
  {
    num: 5,
    text: 'நகைகளின் பேரில் கடன் வாங்கும் நபர் மனுவில் எழுதிக் கொடுத்துள்ள குடியிருப்பை விட்டு வேறு இடம் மாறினாலோ அல்லது செல்போன் எண்ணை மாற்றினாலோ புதிய இடத்தின் முகவரி மற்றும் செல்போன் எண்ணை எழுத்து மூலமாய் மேலாளருக்கு தெரியப்படுத்த வேண்டும். அவ்வாறு தெரிவிக்கத் தவறினால் அதனால் ஏற்படும் விளைவுகளுக்கு நிர்வாகம் பொறுப்பு ஏற்காது.',
  },
  {
    num: 6,
    text: 'நகைக்கடன் தொடர்பான தகவல்கள் நோட்டீஸ் மூலமாகவும் அல்லது எங்களின் விண்ணப்பத்தில் பதிவு செய்யப்பட்டுள்ள தங்களின் எண்ணிற்கு குறுஞ்செய்தி SMS அல்லது Whatsapp மூலம் தெரிவிக்கப்படும்.',
  },
];

// ─── Office Hours & Schedule for Jewel Loan Card Backside ──────────────────────
export const JEWEL_LOAN_OFFICE_HOURS = {
  title: 'அலுவலக நேரம்',
  mainBranches: {
    title: 'சென்னை கிளைகள்',
    weekdays: 'திங்கள் முதல் சனிக்கிழமை வரை : காலை 9.00 மணி முதல் மாலை 4.00 மணி வரை',
    sunday: 'ஞாயிற்றுக்கிழமை : காலை 9.00 மணி முதல் 12.30 மணி வரை',
  },
  otherBranches: {
    title: 'மற்ற கிளைகள்',
    weekdays: 'திங்கள் முதல் சனிக்கிழமை வரை : காலை 9.30 மணி முதல் மாலை 4.30 மணி வரை',
    sunday: 'ஞாயிற்றுக்கிழமை : காலை 9.30 மணி முதல் 1.00 மணி வரை',
  },
  weeklyHoliday: 'வார விடுமுறை : Monday (திங்கட்கிழமை)',
  authority: 'நிர்வாக இயக்குநர்',
};

// ─── Jewel Loan Passbook Cover & Shop Details ──────────────────────────────────
export const JEWEL_LOAN_COMPANY_DETAILS = {
  badge: 'JEWEL LOAN PASS BOOK',
  companyName: 'Sriman Madhwa Sidhanta Onnahini Permanent Nidhi Limited',
  cin: 'CIN No. U65110TN1881PLC002799',
  regdOffice: 'New No.37, Old No.19, Car Street, Triplicane, Chennai - 600 005.',
  email: 'ho@smsonidhi.com',
  website: 'www.smsonidhi.com',
  branchBox: {
    title: 'BRANCH',
    name: 'SMSO PERMANENT NIDHI LTD.',
    building: 'Chelva Towers',
    street: 'No.189, PTV Colony,',
    city: 'KRISHNAGIRI - 635001.',
    phone: '04343-234114',
    email: 'kgiri@smsonidhi.com',
  },
  footerNotice: 'CHANGE OF ADDRESS / PHONE No. SHOULD BE PROMPTLY INTIMATED IN WRITING',
};

// Calculate loan due date: exactly 1 day before the tenure mark (e.g. 1 year from 28/07/2026 is 27/07/2027)
export function calculateDueDate(issueDate, tenureMonths = 12) {
  if (!issueDate) return null;
  const d = new Date(issueDate);
  if (isNaN(d.getTime())) return null;

  const originalDay = d.getDate();
  const originalHours = d.getHours();
  const originalMinutes = d.getMinutes();
  const originalSeconds = d.getSeconds();

  d.setDate(1);
  d.setMonth(d.getMonth() + Number(tenureMonths));
  const lastDayOfTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  // Subtract 1 day: due date is 1 day before the full tenure/year mark
  d.setDate(d.getDate() - 1);
  d.setHours(originalHours, originalMinutes, originalSeconds);

  return d;
}

// Safely get due date for any loan, auto-fixing legacy loans where dueDate was missing or saved without -1 day rule
export function getLoanDueDate(loan) {
  if (!loan) return null;
  const tenure = Number(loan.tenureMonths || 12);

  if (loan.dueDate) {
    const d = new Date(loan.dueDate);
    if (!isNaN(d.getTime())) {
      // Check if dueDate was stored with exact same day as issueDate (missing the -1 day rule)
      if (loan.issueDate) {
        const issue = new Date(loan.issueDate);
        if (!isNaN(issue.getTime()) && d.getDate() === issue.getDate()) {
          const adjusted = new Date(d);
          adjusted.setDate(adjusted.getDate() - 1);
          return adjusted;
        }
      }
      return d;
    }
  }

  if (loan.issueDate) {
    return calculateDueDate(loan.issueDate, tenure);
  }

  return null;
}

// Calculate simple & overdue interest based on monthly rate and due date
// If total duration < 1 month, defaults to 1 month minimum interest
export function calculateLoanInterest(principal, standardRatePerMonth, issueDateStr, settlementDateStr, overdueRatePerMonth = null, dueDateStr = null, tenureMonths = 12) {
  const issue = new Date(issueDateStr);
  const settle = new Date(settlementDateStr || new Date());
  
  let due = dueDateStr ? new Date(dueDateStr) : null;
  if (!due || isNaN(due.getTime())) {
    due = calculateDueDate(issue, tenureMonths);
  } else if (due && issueDateStr) {
    const issueDateObj = new Date(issueDateStr);
    if (!isNaN(issueDateObj.getTime()) && due.getDate() === issueDateObj.getDate()) {
      due = new Date(due);
      due.setDate(due.getDate() - 1);
    }
  }

  const overdueRate = overdueRatePerMonth !== null && overdueRatePerMonth !== undefined ? overdueRatePerMonth : standardRatePerMonth;

  // Calculate total days difference
  const totalMs = Math.max(0, settle - issue);
  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  let totalMonths = totalDays / 30;
  if (totalMonths < 1) totalMonths = 1;

  const isOverdue = due ? settle > due : false;

  let normalMonths = totalMonths;
  let overdueMonths = 0;

  if (isOverdue && due && due > issue) {
    const tenure = Number(tenureMonths || 12);
    normalMonths = Math.min(totalMonths, tenure);
    overdueMonths = Math.max(0, totalMonths - normalMonths);
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
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

