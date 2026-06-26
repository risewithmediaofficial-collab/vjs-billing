import React, { useRef } from 'react';
import { X, Printer, Download, MessageCircle, Mail, Share2 } from 'lucide-react';
import { formatCurrency, formatDate, SHOP_INFO } from '../data.js';

function BillContent({ bill }) {
  return (
    <div className="font-mono text-sm bg-white text-gray-900 p-8 max-w-[400px] mx-auto">
      {/* Header */}
      <div className="text-center mb-4 border-b-2 border-gray-800 pb-4">
        <div className="font-bold text-xl mb-1">{SHOP_INFO.name}</div>
        <div className="text-xs text-gray-600">{SHOP_INFO.address}</div>
        <div className="text-xs text-gray-600">Ph: {SHOP_INFO.phone}</div>
        <div className="text-xs text-gray-600">GSTIN: {SHOP_INFO.gstNumber}</div>
      </div>

      {/* Invoice Info */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Invoice No:</span>
          <span>{bill.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Date:</span>
          <span>{formatDate(bill.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Customer:</span>
          <span>{bill.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Mobile:</span>
          <span>{bill.customerMobile}</span>
        </div>
        {bill.customerAddress && (
          <div className="flex justify-between">
            <span className="font-semibold">Address:</span>
            <span className="text-right max-w-[200px]">{bill.customerAddress}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-semibold">Staff:</span>
          <span>{bill.staffName}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-b border-gray-400 py-3 mb-3">
        <div className="flex text-xs font-bold mb-2 border-b border-gray-300 pb-1">
          <span className="flex-1">Item</span>
          <span className="w-16 text-right">Wt.</span>
          <span className="w-24 text-right">Amount</span>
        </div>
        {bill.items.map((item, i) => (
          <div key={i} className="mb-3 text-xs">
            <div className="flex">
              <span className="flex-1 font-medium">{item.name} ({item.purity})</span>
              <span className="w-16 text-right">{item.weight * item.quantity}g</span>
              <span className="w-24 text-right">{formatCurrency(item.goldValue)}</span>
            </div>
            {item.makingCharge > 0 && (
              <div className="flex text-gray-600 pl-2">
                <span className="flex-1">Making Charge</span>
                <span className="w-24 text-right">{formatCurrency(item.makingCharge)}</span>
              </div>
            )}
            {item.stoneCharge > 0 && (
              <div className="flex text-gray-600 pl-2">
                <span className="flex-1">Stone Charge</span>
                <span className="w-24 text-right">{formatCurrency(item.stoneCharge)}</span>
              </div>
            )}
            <div className="flex text-gray-600 pl-2">
              <span className="flex-1">GST (3%)</span>
              <span className="w-24 text-right">{formatCurrency(item.gstAmount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="text-xs space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Gold Value</span>
          <span>{formatCurrency(bill.totalGoldValue)}</span>
        </div>
        {bill.totalMaking > 0 && (
          <div className="flex justify-between">
            <span>Making Charges</span>
            <span>{formatCurrency(bill.totalMaking)}</span>
          </div>
        )}
        {bill.totalStone > 0 && (
          <div className="flex justify-between">
            <span>Stone Charges</span>
            <span>{formatCurrency(bill.totalStone)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST (3%)</span>
          <span>{formatCurrency(bill.totalGST)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>- {formatCurrency(bill.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t border-gray-800 pt-2 mt-2">
          <span>TOTAL AMOUNT</span>
          <span>{formatCurrency(bill.finalTotal)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="border-t border-gray-400 pt-3 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Payment Mode:</span>
          <span className="font-bold">{bill.paymentMethod}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-gray-500 border-t border-gray-300 pt-4">
        <p className="font-semibold text-gray-700">Thank You For Visiting</p>
        <p>{SHOP_INFO.name}</p>
        <p className="mt-1">All goods sold are non-returnable.</p>
        <p>Disputes subject to local jurisdiction.</p>
      </div>
    </div>
  );
}

export default function BillPreview({ bill, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>${bill.invoiceNumber} - ${SHOP_INFO.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; }
        @media print { @page { margin: 1cm; } }
      </style>
      </head><body>${printContents}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const handleDownloadPDF = () => {
    handlePrint(); // Opens print dialog where user can save as PDF
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `*${SHOP_INFO.name}*\n` +
      `Invoice: ${bill.invoiceNumber}\n` +
      `Date: ${formatDate(bill.createdAt)}\n` +
      `Customer: ${bill.customerName}\n` +
      `Items: ${bill.items.map(i => i.name).join(', ')}\n` +
      `Total: ${formatCurrency(bill.finalTotal)}\n` +
      `Payment: ${bill.paymentMethod}\n\n` +
      `Thank you for shopping with us!`
    );
    window.open(`https://wa.me/${bill.customerMobile}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Invoice ${bill.invoiceNumber} - ${SHOP_INFO.name}`);
    const body = encodeURIComponent(
      `Dear ${bill.customerName},\n\nThank you for shopping at ${SHOP_INFO.name}.\n\nInvoice: ${bill.invoiceNumber}\nDate: ${formatDate(bill.createdAt)}\nTotal: ${formatCurrency(bill.finalTotal)}\nPayment: ${bill.paymentMethod}\n\nRegards,\n${SHOP_INFO.name}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Bill Preview</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
          >
            <Download size={16} />
            Save PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg"
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold text-sm hover:from-orange-500 hover:to-red-500 transition-all shadow-lg"
          >
            <Mail size={16} />
            Email
          </button>
        </div>

        {/* Bill Preview */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
          <div ref={printRef} id="bill-print-area">
            <BillContent bill={bill} />
          </div>
        </div>

        {/* Thermal print note */}
        <p className="text-center text-purple-500 text-xs mt-3">
          For thermal (58mm/80mm) printing, use browser print and select your thermal printer
        </p>
      </div>
    </div>
  );
}
