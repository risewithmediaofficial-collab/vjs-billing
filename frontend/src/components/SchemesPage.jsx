import {
  Plus, Search, X, Calendar, User, Phone, MapPin,
  CreditCard, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, Loader2, Printer, ChevronDown,
  Sparkles, Gift, ShieldCheck, Award, BookOpen, Layers
} from 'lucide-react';
import { formatCurrency, formatDate, SHOP_INFO } from '../data.js';
import useScrollLock from '../useScrollLock.js';

/* ── Passbook Front: Card Cover, Customer Info & Sealed Payment Ledger ── */
function PassbookFront({ scheme, totalPaid, bonusAmt, estimatedMaturityValue, shopInfo, goldRate }) {
  const totalMonths = scheme.totalMonths || 12;
  const planNameTamil = scheme.schemeType === 'classic_5_1'
    ? '5+1 போனஸ் திட்டம் (5+1 Bonus Plan)'
    : scheme.schemeType === 'classic_11_1'
      ? '11+1 போனஸ் திட்டம் (11+1 Bonus Plan)'
      : `வட்டி சேமிப்பு திட்டம் (${scheme.interestRate || 0}% Interest Plan)`;

  return (
    <div className="bg-[#FFFDF4] border-2 border-amber-700 outline outline-1 outline-amber-400 outline-offset-[-3px] rounded-2xl p-5 sm:p-7 text-amber-950 shadow-sm max-w-[620px] mx-auto space-y-4">
      {/* ── Traditional Auspicious Header ── */}
      <div className="text-center pb-3 border-b-2 border-amber-700/80">
        <div className="text-[10px] sm:text-xs font-bold text-amber-800 tracking-widest uppercase mb-1">
          ॥ ஸ்ரீ மஹாலக்ஷ்மி துணை ॥ &nbsp; 卐 VJS 卐 &nbsp; ॥ ஸ்ரீ குருபியோ நமஹ ॥
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-wider font-serif">
          {shopInfo.name || 'VJS JEWELLERY'}
        </h1>
        <p className="text-xs sm:text-sm font-bold text-amber-800 font-['Noto_Sans_Tamil',sans-serif] mt-0.5">
          தங்க சேமிப்பு சிறுசேமிப்பு திட்டம் — பாஸ்புக் அட்டை
        </p>
        <p className="text-[10.5px] text-amber-800/80 mt-0.5 font-medium">
          {shopInfo.address} • Ph: {shopInfo.phone}
        </p>
        <div className="text-[10px] text-amber-700 tracking-widest mt-1 font-mono">
          ༺ ═══════════════════════════════ ༻
        </div>
      </div>

      {/* ── Scheme Plan Banner ── */}
      <div className="bg-amber-100/90 border border-amber-400 rounded-xl p-2.5 text-center shadow-xs">
        <p className="text-xs sm:text-sm font-extrabold text-amber-900">
          மாதம் = <span className="font-mono text-base">{formatCurrency(scheme.monthlyAmount)}</span> /- ({totalMonths} மாத தவணை)
        </p>
        <p className="text-[10px] sm:text-[11px] font-semibold text-amber-800 mt-0.5 font-['Noto_Sans_Tamil',sans-serif]">
          {planNameTamil}
        </p>
      </div>

      {/* ── Customer & Account Details ── */}
      <div className="border border-amber-300 bg-white/80 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-amber-900 whitespace-nowrap">பெயர் (Name):</span>
            <span className="font-semibold text-gray-900 border-b border-dotted border-amber-400 flex-1 truncate px-1">
              {scheme.customerName}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-amber-900 whitespace-nowrap">அலைபேசி (Phone):</span>
            <span className="font-mono font-semibold text-gray-900 border-b border-dotted border-amber-400 flex-1 px-1">
              {scheme.customerPhone}
            </span>
          </div>

          <div className="flex items-baseline gap-1 sm:col-span-2">
            <span className="font-bold text-amber-900 whitespace-nowrap">முகவரி (Address):</span>
            <span className="font-medium text-gray-800 border-b border-dotted border-amber-400 flex-1 truncate px-1">
              {scheme.customerAddress || 'Local Customer, Krishnagiri'}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-amber-900 whitespace-nowrap">அட்டை எண் (Passbook A/C):</span>
            <span className="font-mono font-bold text-amber-800 border-b border-dotted border-amber-400 flex-1 px-1">
              VJS-SCH-{(scheme._id || '001').slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-amber-900 whitespace-nowrap">சேர்ந்த தேதி (Joined):</span>
            <span className="font-semibold text-gray-800 border-b border-dotted border-amber-400 flex-1 px-1">
              {formatDate(scheme.createdAt || scheme.enrolledAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Payment Ledger Table with Sealing / Marking ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <h4 className="text-xs font-bold text-amber-900 font-['Noto_Sans_Tamil',sans-serif]">
            மாதாந்திர வரவு பதிவேடு (Monthly Payment & Seal Ledger)
          </h4>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            {scheme.payments?.length || 0} / {totalMonths} தவணைகள் செலுத்தப்பட்டது
          </span>
        </div>

        <div className="border-2 border-amber-600 rounded-xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-amber-600 text-white font-bold text-[11px]">
                <th className="py-2 px-2.5 border-r border-amber-500 text-center w-12">எண்<br/><span className="text-[9px] font-normal">Month</span></th>
                <th className="py-2 px-3 border-r border-amber-500 text-center">தேதி<br/><span className="text-[9px] font-normal">Date</span></th>
                <th className="py-2 px-3 border-r border-amber-500 text-right">ரூபாய்<br/><span className="text-[9px] font-normal">Amount</span></th>
                <th className="py-2 px-3 text-center">கையொப்பம் & முத்திரை<br/><span className="text-[9px] font-normal">Signature & Cashier Seal</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200">
              {Array.from({ length: totalMonths }, (_, idx) => {
                const monthNum = idx + 1;
                const payment = scheme.payments?.find(p => (p.monthIndex === idx) || (p.monthIndex === monthNum)) || scheme.payments?.[idx];
                const isPaid = !!payment;

                return (
                  <tr key={monthNum} className={isPaid ? 'bg-amber-50/50' : 'bg-white hover:bg-gray-50/60'}>
                    {/* Month Number */}
                    <td className="py-2 px-2.5 border-r border-amber-200 text-center font-bold text-amber-950">
                      {monthNum}
                    </td>

                    {/* Date */}
                    <td className="py-2 px-3 border-r border-amber-200 text-center font-mono">
                      {isPaid ? (
                        <span className="font-semibold text-gray-900">{formatDate(payment.date)}</span>
                      ) : (
                        <span className="text-gray-300 tracking-widest text-[10px]">················</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-3 border-r border-amber-200 text-right font-mono">
                      {isPaid ? (
                        <span className="font-extrabold text-gray-950">{formatCurrency(payment.amount)}</span>
                      ) : (
                        <span className="text-gray-300 tracking-wider text-[10px]">₹············</span>
                      )}
                    </td>

                    {/* Cashier Seal / Signature Marking */}
                    <td className="py-1.5 px-3 text-center">
                      {isPaid ? (
                        /* Official Cashier Rubber Stamp / Seal Graphic */
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-indigo-700 bg-indigo-50/90 text-indigo-900 font-bold text-[9px] transform -rotate-1 shadow-xs">
                          <span className="w-3.5 h-3.5 rounded-full border border-indigo-700 flex items-center justify-center text-[8px] font-black shrink-0">✓</span>
                          <div className="leading-tight text-left">
                            <span className="block font-black text-[8px] tracking-wider text-indigo-950 uppercase">VJS JEWELLERY</span>
                            <span className="block text-[7.5px] text-indigo-800 font-bold">PAID & SEALED</span>
                          </div>
                        </div>
                      ) : (
                        /* Unpaid Seal Marking Area for In-Store Stamping */
                        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-dashed border-amber-300 bg-amber-50/40 text-amber-700/60 text-[8.5px] font-medium tracking-tight">
                          <span>[ முத்திரை / CASHIER SEAL ]</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-amber-300 rounded-xl p-2 shadow-xs">
          <span className="text-[9.5px] font-bold text-amber-800 block uppercase">செலுத்தியது (Paid)</span>
          <span className="font-mono font-black text-xs sm:text-sm text-gray-900">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2 shadow-xs">
          <span className="text-[9.5px] font-bold text-emerald-800 block uppercase">போனஸ் (Bonus)</span>
          <span className="font-mono font-black text-xs sm:text-sm text-emerald-700">+{formatCurrency(bonusAmt)}</span>
        </div>
        <div className="bg-amber-100 border border-amber-400 rounded-xl p-2 shadow-xs">
          <span className="text-[9.5px] font-bold text-amber-900 block uppercase">முதிர்வு மதிப்பு (Est. Total)</span>
          <span className="font-mono font-black text-xs sm:text-sm text-amber-950">{formatCurrency(estimatedMaturityValue)}</span>
        </div>
      </div>

      {/* ── Signatures & Official Store Seal ── */}
      <div className="pt-3 border-t border-amber-300/80 flex items-center justify-between gap-4">
        {/* Customer Sign */}
        <div className="flex-1 text-center">
          <div className="h-10 border-b border-dotted border-amber-400 flex items-end justify-center pb-1">
            <span className="text-xs text-amber-800/60 font-mono italic">{scheme.customerName}</span>
          </div>
          <p className="text-[10px] font-bold text-amber-950 mt-1">வாடிக்கையாளர் கையொப்பம்</p>
          <p className="text-[8.5px] text-amber-700">Customer Signature</p>
        </div>

        {/* Store Cashier Official Rubber Stamp */}
        <div className="text-center flex flex-col items-center">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-red-700 p-1 flex flex-col items-center justify-center text-center text-red-800 transform -rotate-3 bg-red-50/50 shadow-xs mb-1">
            <span className="text-[6.5px] font-black uppercase tracking-wider">VJS JEWELLERY</span>
            <span className="text-[8px] font-black text-red-700 my-0.5">★ OFFICIAL SEAL ★</span>
            <span className="text-[6.5px] font-bold uppercase">GOLD SAVINGS</span>
            <span className="text-[6px] text-red-600 font-mono">AUTH SIGNATORY</span>
          </div>
          <p className="text-[10px] font-bold text-amber-950">அங்கீகரிக்கப்பட்ட முத்திரை & கையொப்பம்</p>
          <p className="text-[8.5px] text-amber-700">Authorized Signatory & Seal</p>
        </div>
      </div>
    </div>
  );
}

/* ── Passbook Back: Jewellery Scheme Content, Rules & Benefits ── */
function PassbookBack({ scheme, shopInfo }) {
  const totalMonths = scheme.totalMonths || 12;

  return (
    <div className="bg-[#FFFDF4] border-2 border-amber-700 outline outline-1 outline-amber-400 outline-offset-[-3px] rounded-2xl p-5 sm:p-7 text-amber-950 shadow-sm max-w-[620px] mx-auto space-y-4 font-sans">
      {/* ── Top Auspicious Header ── */}
      <div className="text-center pb-3 border-b-2 border-amber-700/80">
        <div className="text-[10px] sm:text-xs font-bold text-amber-800 tracking-widest uppercase mb-1">
          ॥ ஸ்ரீ சுபமஸ்து ॥ &nbsp; 卐 VJS JEWELLERY 卐 &nbsp; ॥ நலம் பெருகுக ॥
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-amber-900 tracking-wider font-serif">
          தங்க சேமிப்பு திட்டம் — விதிமுறைகள் & நன்மைகள்
        </h2>
        <p className="text-xs text-amber-800 font-semibold mt-0.5">
          Jewellery Savings Scheme Rules, Regulations & Benefits
        </p>
        <div className="text-[10px] text-amber-700 tracking-widest mt-1 font-mono">
          ༺ ═══════════════════════════════ ༻
        </div>
      </div>

      {/* ── Split Panel: Rules (Left) & Benefits / Gifts (Right) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Left Column: விதிமுறைகள் (Rules & Conditions) ── */}
        <div className="border border-amber-400 bg-white/90 rounded-xl p-3.5 space-y-2.5 shadow-xs">
          <div className="border-b border-amber-300 pb-1.5 flex items-center gap-1.5">
            <BookOpen size={14} className="text-amber-700 shrink-0" />
            <h3 className="font-extrabold text-amber-900 text-xs sm:text-sm font-['Noto_Sans_Tamil',sans-serif]">
              விதிமுறைகள் (Terms & Conditions)
            </h3>
          </div>

          <ol className="space-y-1.5 text-[10px] sm:text-[10.5px] leading-relaxed text-gray-800 list-none pl-0">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">1.</span>
              <span><strong>மொத்த மாதங்கள்:</strong> இத்திட்டம் {totalMonths} மாத தவணைகளைக் கொண்டது. ஒவ்வொரு மாதமும் குறிப்பிட்ட தவணை தவறாமல் செலுத்தப்பட வேண்டும்.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">2.</span>
              <span><strong>தவணை செலுத்தும் நாள்:</strong> பிரதி மாதம் 1 முதல் 10-ஆம் தேதிக்குள் தவணைத் தொகை கட்டாயம் செலுத்த வேண்டும்.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">3.</span>
              <span><strong>அட்டை கொண்டுவருதல்:</strong> ஒவ்வொரு முறை தவணை செலுத்தும்போதும், முதிர்வில் நகை எடுக்கும்போதும் இந்த சேமிப்பு திட்ட அட்டையை கட்டாயம் கொண்டுவர வேண்டும்.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">4.</span>
              <span><strong>சேதாரம் & செய்கூலி சலுகை:</strong> திட்டம் முடிவில் முதிர்வு தொகையில் 100% BIS 916 ஹால்மார்க் தங்க நகைகள் சிறப்பு சேதாரம் & செய்கூலி சலுகையுடன் வழங்கப்படும்.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">5.</span>
              <span><strong>போனஸ் சலுகை:</strong> அனைத்து தவணைகளையும் குறித்த காலத்தில் செலுத்தும் வாடிக்கையாளர்களுக்கு முதிர்வு நாளில் 1 மாத போனஸ் தொகை அல்லது வட்டி சலுகை வழங்கப்படும்.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">6.</span>
              <span><strong>தங்க விலை பாதுகாப்பு:</strong> தவணை செலுத்தும் தேதியில் உள்ள அன்றைய தங்க விலை கணக்கில் கொள்ளப்பட்டு வாடிக்கையாளருக்கு பாதுகாப்பு அளிக்கப்படுகிறது.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">7.</span>
              <span><strong>திட்ட விலகல்:</strong> தவிர்க்க முடியாத காரணத்தால் திட்டத்தை பாதியில் நிறுத்தினால், போனஸ் சலுகை இன்றி செலுத்திய தொகைக்கு மட்டும் அன்றைய மார்க்கெட் விலையில் நகைகள் தரப்படும்.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">8.</span>
              <span><strong>நிர்வாக முடிவு:</strong> திட்டத்தின் விதிமுறைகள் குறித்த நிர்வாகத்தின் முடிவே இறுதியானது.</span>
            </li>
          </ol>
        </div>

        {/* ── Right Column: வழங்கப்படும் நன்மைகள் & பரிசுப் பொருட்கள் (Benefits & Privileges) ── */}
        <div className="border border-amber-400 bg-white/90 rounded-xl p-3.5 space-y-2.5 shadow-xs">
          <div className="border-b border-amber-300 pb-1.5 flex items-center gap-1.5">
            <Gift size={14} className="text-amber-700 shrink-0" />
            <h3 className="font-extrabold text-amber-900 text-xs sm:text-sm font-['Noto_Sans_Tamil',sans-serif]">
              வழங்கப்படும் நன்மைகள் (Scheme Benefits)
            </h3>
          </div>

          <div className="space-y-2 text-[10px] sm:text-[10.5px]">
            {/* Benefit 1 */}
            <div className="flex items-start gap-2 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
              <Award size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block font-bold">தங்க நாணயம் அல்லது ரொக்கப் போனஸ்</strong>
                <span className="text-gray-700 leading-snug">முதிர்வு தொகையுடன் திட்ட விதிமுறைப்படி தூய 916 தங்க நாணயம் அல்லது கூடுதல் பண போனஸ் வழங்கப்படும்.</span>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-2 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block font-bold">100% BIS ஹால்மார்க் 916 தங்க நகைகள்</strong>
                <span className="text-gray-700 leading-snug">அரசு அங்கீகாரம் பெற்ற உயர்தர HUID 916 ஹால்மார்க் நகைகள் மட்டுமே முழு உத்தரவாதத்துடன் வழங்கப்படும்.</span>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-2 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
              <Sparkles size={16} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block font-bold">0% செய்கூலி & சேதாரம் சிறப்பு சலுகை</strong>
                <span className="text-gray-700 leading-snug">திட்ட வாடிக்கையாளர்களுக்கு பிரத்யேகமாக செய்கூலி மற்றும் சேதாரத்தில் உச்சபட்ச தள்ளுபடி சலுகை உண்டு.</span>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start gap-2 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
              <Gift size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block font-bold">தீபாவளி & பண்டிகை சிறப்பு பரிசுகள்</strong>
                <span className="text-gray-700 leading-snug">தீபாவளி மற்றும் விசேஷ பண்டிகைகளில் இனிப்பு பெட்டி மற்றும் சிறப்பு வீட்டு உபயோக பரிசுப் பொருட்கள்.</span>
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="flex items-start gap-2 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
              <Phone size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block font-bold">டிஜிட்டல் ரசீது & வாட்ஸ்அப் பதிவு</strong>
                <span className="text-gray-700 leading-snug">ஒவ்வொரு தவணைக்கும் உடனடி கணினி ரசீது மற்றும் வாட்ஸ்அப் பதிவு வாடிக்கையாளருக்கு அனுப்பி வைக்கப்படும்.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Motto & Contact Info ── */}
      <div className="pt-3 border-t-2 border-amber-700/80 text-center space-y-1.5">
        <p className="font-extrabold text-xs sm:text-sm text-amber-900 font-['Noto_Sans_Tamil',sans-serif]">
          “எங்கள் தங்க சேமிப்புத் திட்டத்தில் இணைந்து உங்கள் எதிர்காலத்தை பொன்னாக்குங்கள்!”
        </p>

        <div className="border border-amber-300 bg-amber-100/70 rounded-xl p-2.5 text-xs text-amber-950 font-medium">
          <p className="font-bold text-amber-900">{shopInfo.name} — தொடர்புக்கு (Helpline Numbers):</p>
          <p className="font-mono font-bold text-sm tracking-wider text-amber-900 mt-0.5">
            {shopInfo.phone} &nbsp;•&nbsp; 96590 38311 &nbsp;•&nbsp; 70106 04001
          </p>
          <p className="text-[10.5px] text-amber-800 mt-0.5">
            {shopInfo.address}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Scheme Passbook / Receipt Modal Container ── */
function SchemeReceipt({ scheme, onClose, goldRate }) {
  const [viewSide, setViewSide] = useState('both'); // 'front', 'back', 'both'
  const shopInfo = SHOP_INFO || {};

  const totalPaid = scheme.payments ? scheme.payments.reduce((s, p) => s + (p.amount || 0), 0) : 0;
  const totalTarget = (scheme.monthlyAmount || 0) * (scheme.totalMonths || 12);
  const bonusAmt = (scheme.schemeType === 'classic_11_1' || scheme.schemeType === 'classic_5_1')
    ? (scheme.monthlyAmount * (scheme.bonusMonths || 1))
    : (scheme.schemeType === 'interest_plan'
        ? (totalTarget * ((scheme.interestRate || 0) / 100))
        : (scheme.monthlyAmount || 0));
  const estimatedMaturityValue = totalTarget + bonusAmt;

  const handlePrint = () => {
    const printContent = document.getElementById('scheme-passbook-print-area').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Scheme Passbook - ${scheme.customerName} - ${shopInfo.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Noto Sans Tamil', 'Inter', -apple-system, sans-serif;
            background: #fff;
            color: #451a03;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="p-2">
          ${printContent}
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-3 sm:px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200 animate-fade-in my-auto">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 gap-3">
          <div>
            <h2 className="text-gray-900 font-bold text-lg sm:text-xl">
              Scheme Passbook & Receipt (திட்ட அட்டை)
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Traditional Indian Jewellery Savings Scheme Passbook & Rules
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── View Switchers & Print Action ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 my-4">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewSide('front')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                viewSide === 'front' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              முன் பக்கம் (Front - Passbook & Seal)
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                viewSide === 'back' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              பின் பக்கம் (Back - Rules & Benefits)
            </button>
            <button
              onClick={() => setViewSide('both')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                viewSide === 'both' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              இரு பக்கமும் (Both Sides)
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95"
          >
            <Printer size={15} /> Print Passbook
          </button>
        </div>

        {/* ── Printable & Scrollable Card Preview Container ── */}
        <div className="rounded-xl overflow-hidden border border-amber-200/80 bg-amber-50/30 p-2 sm:p-4 max-h-[75vh] overflow-y-auto">
          <div id="scheme-passbook-print-area" className="space-y-6">
            {/* Front Side */}
            {(viewSide === 'front' || viewSide === 'both') && (
              <PassbookFront
                scheme={scheme}
                totalPaid={totalPaid}
                bonusAmt={bonusAmt}
                estimatedMaturityValue={estimatedMaturityValue}
                shopInfo={shopInfo}
                goldRate={goldRate}
              />
            )}

            {/* Page Break for Print when both sides are selected */}
            {viewSide === 'both' && (
              <div className="page-break my-4 border-t-2 border-dashed border-amber-300 relative text-center">
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full absolute -top-2.5 left-1/2 -translate-x-1/2 shadow-xs print:hidden">
                  மடி அல்லது அடுத்த பக்கம் (Page 2 - Back Side)
                </span>
              </div>
            )}

            {/* Back Side */}
            {(viewSide === 'back' || viewSide === 'both') && (
              <PassbookBack
                scheme={scheme}
                shopInfo={shopInfo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchemesPage({
  schemes = [],
  onEnrollScheme,
  onPayScheme,
  onRedeemScheme,
  onCancelScheme,
  currentStore,
  goldRate,
  silverRate,
  currentStaff
}) {
  const [activeTab, setActiveTab] = useState('active'); // active, redeemable, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [previewScheme, setPreviewScheme] = useState(null);
  const [expandedSchemes, setExpandedSchemes] = useState({});

  const toggleExpand = (id) => {
    setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  
  // Enroll Form State
  const [enrollForm, setEnrollForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    schemeName: 'VJS Gold Savings Scheme',
    schemeType: 'classic_11_1', // classic_11_1, interest_plan
    monthlyAmount: '',
    totalMonths: 11,
    bonusMonths: 1,
    interestRate: 0,
    goldRateAtEnrollment: goldRate,
  });

  // Pay Form State
  const [payForm, setPayForm] = useState({
    amount: '',
    monthIndex: 0,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Lock screen scroll when any scheme popup / modal / form is active
  useScrollLock(showEnrollModal || showPayModal || !!confirmAction || !!previewScheme);

  // Filtering enrollments
  const filteredSchemes = schemes.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.customerName.toLowerCase().includes(q) ||
      s.customerPhone.includes(q) ||
      s.schemeName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'active') return s.status === 'active';
    if (activeTab === 'redeemable') return s.status === 'redeemable';
    if (activeTab === 'completed') return s.status === 'completed' || s.status === 'cancelled';
    if (activeTab === 'pending') return s.status === 'redeem_pending' || s.status === 'cancel_pending';
    return true;
  });

  const handleOpenPay = (scheme) => {
    // Find next unpaid month index
    const paidMonths = scheme.payments.map(p => p.monthIndex);
    let nextIndex = 0;
    for (let i = 0; i < scheme.totalMonths; i++) {
      if (!paidMonths.includes(i)) {
        nextIndex = i;
        break;
      }
    }
    
    setSelectedScheme(scheme);
    setPayForm({
      amount: scheme.monthlyAmount,
      monthIndex: nextIndex,
    });
    setShowPayModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!enrollForm.customerName.trim() || !enrollForm.customerPhone.trim()) {
      setError('Please fill in: Customer Name and Phone Number');
      return;
    }

    const amt = parseFloat(enrollForm.monthlyAmount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid monthly installment amount');
      return;
    }

    try {
      setEnrollLoading(true);
      const is5Plus1 = enrollForm.schemeType === 'classic_5_1';
      const data = {
        ...enrollForm,
        monthlyAmount: amt,
        totalMonths: is5Plus1 ? 5 : 11,
        bonusMonths: 1,
        interestRate: 0,
        goldRateAtEnrollment: goldRate, // lock today's gold rate
        storeId: currentStore,
        payments: [],
      };

      await onEnrollScheme(data);

      setSuccess('Scheme enrollment successful!');
      setShowEnrollModal(false);
      setPreviewScheme(data);
      setEnrollForm({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        schemeName: 'VJS Gold Savings Scheme',
        schemeType: 'classic_11_1',
        monthlyAmount: '',
        totalMonths: 11,
        bonusMonths: 1,
        interestRate: 0,
        goldRateAtEnrollment: goldRate,
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to enroll scheme.');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setPayLoading(true);
      const payAmt = parseFloat(payForm.amount);
      await onPayScheme(selectedScheme._id || selectedScheme.id, {
        amount: payAmt,
        monthIndex: payForm.monthIndex,
      });

      const updatedPayments = [...(selectedScheme.payments || []), { monthIndex: payForm.monthIndex, amount: payAmt, date: new Date().toISOString() }];
      const updatedScheme = { ...selectedScheme, payments: updatedPayments };

      setSuccess('Payment recorded successfully!');
      setShowPayModal(false);
      setPreviewScheme(updatedScheme);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleRedeem = (scheme) => {
    setConfirmAction({ type: 'redeem', scheme });
  };

  const handleCancel = (scheme) => {
    setConfirmAction({ type: 'cancel', scheme });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, scheme } = confirmAction;
    setError('');
    setSuccess('');

    try {
      if (type === 'redeem') {
        await onRedeemScheme(scheme._id || scheme.id);
        setSuccess('Scheme successfully redeemed!');
        setPreviewScheme({ ...scheme, status: 'completed' });
      } else if (type === 'cancel') {
        await onCancelScheme(scheme._id || scheme.id);
        setSuccess('Scheme successfully cancelled.');
      }
      setConfirmAction(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${type} scheme.`);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gold Savings Schemes</h1>
          <p className="text-gray-400 text-sm mt-1">Manage monthly gold saving plans for customers</p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
        >
          <Plus size={16} />
          New Enrollment
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        {[
          { key: 'active', label: 'Active Schemes' },
          { key: 'redeemable', label: 'Ready to Redeem' },
          { key: 'completed', label: 'Completed / Cancelled' },
          ...(currentStaff?.role === 'Admin' || (schemes || []).some(s => s.status?.includes('pending'))
            ? [{ key: 'pending', label: `Pending Approvals (${(schemes || []).filter(s => s.status?.includes('pending')).length})` }]
            : []),
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, or scheme name..."
          className="w-full border border-gray-200 bg-white rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm
            placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
        />
      </div>

      {/* Schemes List View */}
      <div className="space-y-3">
        {filteredSchemes.map(scheme => {
          const totalPaid = scheme.payments.reduce((sum, p) => sum + p.amount, 0);
          const totalTarget = scheme.monthlyAmount * scheme.totalMonths;
          const progressPercent = Math.min((scheme.payments.length / scheme.totalMonths) * 100, 100);
          const nextDueMonth = scheme.payments.length + 1;
          const isFullyPaid = scheme.payments.length >= scheme.totalMonths;

          // Bonus is earned ONLY when fully paid (redeemable or completed)
          const bonusAmt = (scheme.schemeType === 'classic_11_1' || scheme.schemeType === 'classic_5_1') 
            ? (scheme.monthlyAmount * (scheme.bonusMonths || 1))
            : (scheme.schemeType === 'interest_plan' 
                ? (totalTarget * ((scheme.interestRate || 0) / 100))
                : scheme.monthlyAmount);

          const currentBonusEarned = (scheme.status === 'redeemable' || scheme.status === 'completed') ? bonusAmt : 0;
          const totalRedeemValue = totalPaid + currentBonusEarned;
          const estimatedMaturityValue = totalTarget + bonusAmt;
          const isExpanded = !!expandedSchemes[scheme._id];

          return (
            <div
              key={scheme._id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all space-y-4"
            >
              {/* ── Top Main Row (List View) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(160px,1.2fr)_auto] items-center gap-4">
                
                {/* 1. Customer Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
                    {(scheme.customerName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{scheme.customerName}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        scheme.status === 'active' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        scheme.status === 'redeemable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' :
                        scheme.status === 'completed' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                        scheme.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                        scheme.status === 'redeem_pending' ? 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse' :
                        scheme.status === 'cancel_pending' ? 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse' :
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {scheme.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1 font-mono">
                      <Phone size={11} className="text-gray-400" /> {scheme.customerPhone}
                    </p>
                    <p className="text-amber-800/80 text-[11px] font-medium truncate mt-0.5">
                      {scheme.schemeType === 'classic_5_1'
                        ? `5+1 Bonus Plan (${scheme.totalMonths} mos)`
                        : scheme.schemeType === 'classic_11_1'
                          ? `11+1 Bonus Plan (${scheme.totalMonths} mos)` 
                          : `Interest Plan (${scheme.interestRate || 0}%, ${scheme.totalMonths} mos)`}
                    </p>
                  </div>
                </div>

                {/* 2. Progress */}
                <div className="min-w-0 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Installment Progress</span>
                    <span className="font-bold text-amber-800">{scheme.payments.length} / {scheme.totalMonths} paid</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/60">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Monthly: <strong className="text-gray-700">{formatCurrency(scheme.monthlyAmount)}</strong>
                  </p>
                </div>

                {/* 3. Financials */}
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Paid</span>
                      <p className="text-gray-900 font-extrabold text-sm sm:text-base font-mono">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Bonus (at maturity)</span>
                      <p className="text-emerald-600 font-extrabold text-sm sm:text-base font-mono">+{formatCurrency(bonusAmt)}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Action Buttons & Show More Toggle */}
                <div className="flex items-center justify-start lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex-wrap">
                  {scheme.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleOpenPay(scheme)}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap"
                      >
                        Record Pay (M{nextDueMonth})
                      </button>
                      <button
                        onClick={() => setPreviewScheme(scheme)}
                        className="py-2 px-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold whitespace-nowrap shadow-xs"
                        title="View Passbook / Receipt"
                      >
                        <Printer size={13} /> Receipt
                      </button>
                      <button
                        onClick={() => handleCancel(scheme)}
                        className="py-2 px-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all text-xs font-semibold whitespace-nowrap"
                        title="Cancel scheme"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {scheme.status === 'redeemable' && (
                    <button
                      onClick={() => handleRedeem(scheme)}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap"
                    >
                      Redeem (₹{totalRedeemValue.toLocaleString('en-IN')})
                    </button>
                  )}
                  {scheme.status === 'redeem_pending' && (
                    currentStaff?.role === 'Admin' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onRedeemScheme(scheme._id, { status: 'completed' })}
                          className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRedeemScheme(scheme._id, { status: 'active' })}
                          className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="py-1.5 px-2.5 text-xs bg-purple-50 text-purple-700 rounded-xl font-medium border border-purple-200 animate-pulse">
                        Waiting Admin...
                      </span>
                    )
                  )}
                  {scheme.status === 'cancel_pending' && (
                    currentStaff?.role === 'Admin' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onCancelScheme(scheme._id, { status: 'cancelled' })}
                          className="py-2 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition-all shadow-xs"
                        >
                          Approve Cancel
                        </button>
                        <button
                          onClick={() => onCancelScheme(scheme._id, { status: 'active' })}
                          className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="py-1.5 px-2.5 text-xs bg-orange-50 text-orange-700 rounded-xl font-medium border border-orange-200 animate-pulse">
                        Cancel Pending...
                      </span>
                    )
                  )}
                  {scheme.status === 'completed' && (
                    <span className="py-1.5 px-2.5 text-xs bg-gray-50 text-gray-400 rounded-xl font-medium border border-gray-200">
                      Redeemed
                    </span>
                  )}
                  {scheme.status === 'cancelled' && (
                    <span className="py-1.5 px-2.5 text-xs bg-red-50 text-red-500 rounded-xl font-medium border border-red-100">
                      Cancelled
                    </span>
                  )}

                  {/* Show More / Show Less Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(scheme._id)}
                    className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs whitespace-nowrap ml-auto lg:ml-0"
                  >
                    <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* ── Collapsible Details (Show More / Show Less) ── */}
              {isExpanded && (
                <div className="pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scheme Model</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1">
                        {scheme.schemeType === 'classic_5_1'
                          ? `5+1 Bonus (${scheme.totalMonths} mos)`
                          : scheme.schemeType === 'classic_11_1'
                            ? `11+1 Bonus (${scheme.totalMonths} mos)` 
                            : `Interest (${scheme.interestRate || 0}%, ${scheme.totalMonths} mos)`}
                      </p>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Enrollment Gold Rate</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">₹{scheme.goldRateAtEnrollment}/g</p>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Monthly Installment</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">{formatCurrency(scheme.monthlyAmount)}</p>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Est. Maturity Value</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">{formatCurrency(estimatedMaturityValue)}</p>
                    </div>

                    <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Current Redeem Value</span>
                      <p className="text-xs font-bold text-amber-800 mt-1 font-mono">{formatCurrency(totalRedeemValue)}</p>
                    </div>
                  </div>

                  {/* Customer Address & Enrollment Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-gray-500">
                    {scheme.customerAddress && (
                      <p className="flex items-center gap-1 text-gray-500">
                        <MapPin size={12} className="text-amber-500 shrink-0" />
                        <span>Address: {scheme.customerAddress}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400">
                      Enrolled: {formatDate(scheme.createdAt || scheme.enrolledAt)}
                    </p>
                  </div>

                  {/* Installments Payment History Table */}
                  {scheme.payments && scheme.payments.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                      <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700">
                        <span>Paid Installments History</span>
                        <span className="text-[11px] font-semibold text-gray-500">{scheme.payments.length} installment{scheme.payments.length !== 1 ? 's' : ''} paid</span>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                        {scheme.payments.map((p, idx) => (
                          <div key={idx} className="px-3.5 py-2 text-xs flex justify-between items-center hover:bg-gray-50/50">
                            <span className="font-semibold text-gray-700">Month {p.monthIndex || (idx + 1)}</span>
                            <span className="text-gray-400 text-[11px]">{formatDate(p.date)}</span>
                            <span className="font-mono font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                            <span className="text-emerald-600 font-semibold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Paid ✓</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No scheme enrollments found</p>
        </div>
      )}

      {/* ── Enrollment Modal ─────────────────────────────────────────────────── */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleEnrollSubmit} className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in text-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-gray-800 font-bold text-lg">New Scheme Enrollment</h2>
                <p className="text-gray-400 text-xs mt-0.5">Start a new monthly savings installment plan</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.customerName}
                    onChange={e => setEnrollForm(p => ({ ...p, customerName: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Customer Phone */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={enrollForm.customerPhone}
                    onChange={e => setEnrollForm(p => ({ ...p, customerPhone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Monthly Amount */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Monthly Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={enrollForm.monthlyAmount}
                    onChange={e => setEnrollForm(p => ({ ...p, monthlyAmount: e.target.value }))}
                    placeholder="e.g. 3000"
                    min={1}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Locked Gold Rate */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Locked Gold Rate (₹/g)</label>
                  <input
                    type="text"
                    value={`₹${goldRate}/g (Live)`}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>

                {/* Scheme Type */}
                <div className="col-span-2 space-y-3">
                  <label className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">Scheme Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    {/* Classic 11+1 */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                      enrollForm.schemeType === 'classic_11_1' ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-white border-gray-200 hover:border-amber-200'
                    }`}>
                      <input
                        type="radio"
                        name="schemeType"
                        value="classic_11_1"
                        checked={enrollForm.schemeType === 'classic_11_1'}
                        onChange={() => setEnrollForm(p => ({ ...p, schemeType: 'classic_11_1', totalMonths: 11, bonusMonths: 1, interestRate: 0 }))}
                        className="accent-amber-500 mt-1"
                      />
                      <div>
                        <span className="text-gray-800 text-sm font-bold block">11+1 Bonus Plan</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pay 11 months, owner pays 12th month free ({enrollForm.monthlyAmount ? `₹${parseFloat(enrollForm.monthlyAmount).toLocaleString('en-IN')}` : '₹0'} bonus)</p>
                      </div>
                    </label>

                    {/* 5+1 Bonus Plan */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                      enrollForm.schemeType === 'classic_5_1' ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-white border-gray-200 hover:border-amber-200'
                    }`}>
                      <input
                        type="radio"
                        name="schemeType"
                        value="classic_5_1"
                        checked={enrollForm.schemeType === 'classic_5_1'}
                        onChange={() => setEnrollForm(p => ({ ...p, schemeType: 'classic_5_1', totalMonths: 5, bonusMonths: 1, interestRate: 0 }))}
                        className="accent-amber-500 mt-1"
                      />
                      <div>
                        <span className="text-gray-800 text-sm font-bold block">5+1 Bonus Plan</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pay 5 months, owner pays 6th month free ({enrollForm.monthlyAmount ? `₹${parseFloat(enrollForm.monthlyAmount).toLocaleString('en-IN')}` : '₹0'} bonus)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                disabled={enrollLoading}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={enrollLoading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {enrollLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {enrollLoading ? 'Enrolling...' : 'Save & Enroll'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Record Payment Modal ────────────────────────────────────────────── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handlePaySubmit} className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl animate-fade-in text-gray-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-gray-800 font-bold text-base">Record Installment Payment</h2>
                <p className="text-xs text-gray-400 mt-0.5">Recording Month {payForm.monthIndex + 1} payment</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Installment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Staff Recorder</label>
                <input
                  type="text"
                  readOnly
                  value="Logged-in Staff"
                  className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-450 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                disabled={payLoading}
                className="flex-1 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payLoading}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {payLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                {payLoading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Scheme Action Confirmation Modal ─── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${confirmAction.type === 'cancel' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                {confirmAction.type === 'cancel' ? (
                  <AlertCircle size={20} className="text-red-600" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  {confirmAction.type === 'cancel' ? 'Cancel Savings Scheme' : 'Redeem Savings Scheme'}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">Please confirm your action</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {confirmAction.type === 'cancel' ? (
                <>Are you sure you want to cancel the scheme for <span className="font-bold text-gray-800">"{confirmAction.scheme.customerName}"</span>? All recorded payments will be archived as cancelled.</>
              ) : (
                <>Are you sure you want to redeem the savings scheme for <span className="font-bold text-gray-800">"{confirmAction.scheme.customerName}"</span>? This will close the scheme and mark it as completed.</>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-650 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={executeConfirmAction}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors shadow-sm ${confirmAction.type === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {confirmAction.type === 'cancel' ? 'Cancel Scheme' : 'Redeem Scheme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheme Receipt / Passbook Modal */}
      {previewScheme && (
        <SchemeReceipt
          scheme={previewScheme}
          onClose={() => setPreviewScheme(null)}
          goldRate={goldRate}
        />
      )}
    </div>
  );
}
