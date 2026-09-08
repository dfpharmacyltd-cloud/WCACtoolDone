export interface SampleInvoice {
  id: string;
  name: string;
  department: string;
  vendorName: string;
  invoiceNo: string;
  amount: number;
  dataUrl: string;
  description: string;
}

// Function to generate an authentic-looking tax invoice image on an HTML5 canvas and return as data URL
export function generateSampleInvoiceDataUrl(
  companyName: string,
  gstin: string,
  invoiceNo: string,
  dateStr: string,
  department: string,
  items: Array<{ desc: string; hsn: string; qty: number; rate: number; amount: number }>,
  totalAmount: number
): string {
  // If we are in node or canvas not available, we can produce an SVG data URL which is fully valid as an image for preview and Vision!
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <rect width="800" height="1050" fill="#ffffff"/>
  <rect x="25" y="25" width="750" height="1000" fill="none" stroke="#2b3945" stroke-width="2"/>
  
  <!-- Header Bar -->
  <rect x="25" y="25" width="750" height="40" fill="#0f766e"/>
  <text x="400" y="52" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="bold" letter-spacing="2">TAX INVOICE</text>
  
  <!-- Company / Supplier Info -->
  <text x="45" y="95" fill="#0f766e" font-size="22" font-weight="bold">${companyName}</text>
  <text x="45" y="118" fill="#475569" font-size="13">Plot No. 42-B, Industrial Estate, Phase-II, GIDC Vatva</text>
  <text x="45" y="136" fill="#475569" font-size="13">Phone: +91 22 2847 9000 | Email: accounts@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com</text>
  <text x="45" y="158" fill="#0f172a" font-size="14" font-weight="bold">GSTIN: <tspan fill="#0f766e">${gstin}</tspan></text>
  <text x="45" y="178" fill="#475569" font-size="12">State: Gujarat (Code: 24) | PAN: ${gstin.substring(2, 12)}</text>
  
  <!-- Right Box: Invoice Details -->
  <rect x="480" y="80" width="280" height="110" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
  <text x="495" y="105" fill="#64748b" font-size="12">Invoice Number:</text>
  <text x="610" y="105" fill="#0f172a" font-size="14" font-weight="bold">${invoiceNo}</text>
  <text x="495" y="132" fill="#64748b" font-size="12">Invoice Date:</text>
  <text x="610" y="132" fill="#0f172a" font-size="13" font-weight="600">${dateStr}</text>
  <text x="495" y="158" fill="#64748b" font-size="12">Department Ref:</text>
  <text x="610" y="158" fill="#0f766e" font-size="13" font-weight="bold">${department} Department</text>
  <text x="495" y="180" fill="#64748b" font-size="12">Payment Terms:</text>
  <text x="610" y="180" fill="#0f172a" font-size="12">30 Days Net</text>

  <!-- Divider -->
  <line x1="25" y1="205" x2="775" y2="205" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Buyer Details (Pharmaceutical Company) -->
  <rect x="35" y="215" width="730" height="95" fill="#f1f5f9" rx="4"/>
  <text x="50" y="235" fill="#0f766e" font-size="12" font-weight="bold" letter-spacing="1">BILLED TO / BUYER DETAILS:</text>
  <text x="50" y="258" fill="#0f172a" font-size="16" font-weight="bold">DF PHARMACEUTICALS LABORATORIES LTD</text>
  <text x="50" y="278" fill="#475569" font-size="12">Unit 4, Formulation Plant, Survey No. 118/A, Kadi-Chhatral Highway</text>
  <text x="50" y="296" fill="#0f172a" font-size="12" font-weight="600">GSTIN: 24AAACD4912K1Z9 | Drug License No: G/25/1842 &amp; G/28/1410</text>

  <!-- Line Items Table Header -->
  <rect x="35" y="325" width="730" height="32" fill="#334155"/>
  <text x="50" y="346" fill="#ffffff" font-size="12" font-weight="bold">SR.</text>
  <text x="90" y="346" fill="#ffffff" font-size="12" font-weight="bold">ITEM DESCRIPTION &amp; GRADE</text>
  <text x="430" y="346" fill="#ffffff" font-size="12" font-weight="bold">HSN CODE</text>
  <text x="530" y="346" fill="#ffffff" font-size="12" font-weight="bold">QTY</text>
  <text x="600" y="346" fill="#ffffff" font-size="12" font-weight="bold">RATE (₹)</text>
  <text x="700" y="346" fill="#ffffff" font-size="12" font-weight="bold">AMOUNT (₹)</text>

  <!-- Line Items Rows -->
  ${items
    .map(
      (item, idx) => `
    <g transform="translate(0, ${365 + idx * 45})">
      <rect x="35" y="0" width="730" height="40" fill="${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}"/>
      <text x="50" y="25" fill="#64748b" font-size="12">${idx + 1}</text>
      <text x="90" y="25" fill="#0f172a" font-size="13" font-weight="600">${item.desc}</text>
      <text x="430" y="25" fill="#475569" font-size="12">${item.hsn}</text>
      <text x="530" y="25" fill="#0f172a" font-size="13">${item.qty}</text>
      <text x="600" y="25" fill="#0f172a" font-size="13">${item.rate.toLocaleString('en-IN')}</text>
      <text x="700" y="25" fill="#0f172a" font-size="13" font-weight="bold">${item.amount.toLocaleString('en-IN')}</text>
      <line x1="35" y1="40" x2="765" y2="40" stroke="#e2e8f0" stroke-width="1"/>
    </g>
  `
    )
    .join('')}

  <!-- Calculation Summary Box -->
  <rect x="420" y="580" width="345" height="170" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
  
  <text x="440" y="608" fill="#64748b" font-size="13">Taxable Subtotal:</text>
  <text x="740" y="608" text-anchor="end" fill="#0f172a" font-size="13" font-weight="600">₹ ${(totalAmount / 1.18).toFixed(2)}</text>
  
  <text x="440" y="635" fill="#64748b" font-size="13">CGST @ 9.0%:</text>
  <text x="740" y="635" text-anchor="end" fill="#0f172a" font-size="13">₹ ${((totalAmount / 1.18) * 0.09).toFixed(2)}</text>
  
  <text x="440" y="662" fill="#64748b" font-size="13">SGST @ 9.0%:</text>
  <text x="740" y="662" text-anchor="end" fill="#0f172a" font-size="13">₹ ${((totalAmount / 1.18) * 0.09).toFixed(2)}</text>

  <line x1="435" y1="680" x2="750" y2="680" stroke="#cbd5e1" stroke-width="1"/>
  
  <rect x="430" y="692" width="325" height="42" fill="#0f766e" rx="4"/>
  <text x="445" y="718" fill="#ffffff" font-size="15" font-weight="bold">GRAND TOTAL (NET AMOUNT):</text>
  <text x="740" y="718" text-anchor="end" fill="#ffffff" font-size="16" font-weight="bold">₹ ${totalAmount.toLocaleString('en-IN')}</text>

  <!-- QR Code & Barcode Placeholder for modern e-invoice compliance -->
  <rect x="45" y="580" width="120" height="120" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <rect x="55" y="590" width="30" height="30" fill="#0f172a"/>
  <rect x="62" y="597" width="16" height="16" fill="#ffffff"/>
  <rect x="67" y="602" width="6" height="6" fill="#0f172a"/>
  
  <rect x="125" y="590" width="30" height="30" fill="#0f172a"/>
  <rect x="132" y="597" width="16" height="16" fill="#ffffff"/>
  <rect x="137" y="602" width="6" height="6" fill="#0f172a"/>
  
  <rect x="55" y="660" width="30" height="30" fill="#0f172a"/>
  <rect x="62" y="667" width="16" height="16" fill="#ffffff"/>
  <rect x="67" y="672" width="6" height="6" fill="#0f172a"/>
  
  <!-- Random QR dots -->
  <rect x="95" y="600" width="8" height="8" fill="#0f172a"/>
  <rect x="105" y="615" width="12" height="6" fill="#0f172a"/>
  <rect x="95" y="630" width="6" height="14" fill="#0f172a"/>
  <rect x="110" y="645" width="14" height="8" fill="#0f172a"/>
  <rect x="130" y="650" width="10" height="10" fill="#0f172a"/>
  
  <text x="105" y="720" text-anchor="middle" fill="#64748b" font-size="10">Govt IRN / e-Invoice QR</text>

  <!-- Declaration & Terms -->
  <text x="45" y="760" fill="#0f172a" font-size="12" font-weight="bold">DECLARATION:</text>
  <text x="45" y="780" fill="#64748b" font-size="11">1. Material supplied conforms to GMP and approved Certificate of Analysis (COA) enclosed.</text>
  <text x="45" y="798" fill="#64748b" font-size="11">2. Goods once inspected and accepted at pharma formulation site cannot be returned without QA clearance.</text>
  <text x="45" y="816" fill="#64748b" font-size="11">3. Interest @ 18% p.a. will be charged for delays exceeding the payment term.</text>

  <!-- Footer Signatures -->
  <line x1="25" y1="860" x2="775" y2="860" stroke="#cbd5e1" stroke-width="1"/>
  <text x="80" y="930" fill="#475569" font-size="12">Receiver's Signature &amp; Stamp</text>
  <text x="560" y="930" fill="#475569" font-size="12">For ${companyName}</text>
  <line x1="530" y1="915" x2="720" y2="915" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4"/>
  <text x="575" y="950" fill="#0f766e" font-size="13" font-weight="bold">Authorised Signatory</text>
  
  <!-- Security stamp -->
  <rect x="600" y="870" width="90" height="35" fill="none" stroke="#059669" stroke-width="2" rx="4" transform="rotate(-5 645 885)"/>
  <text x="645" y="892" text-anchor="middle" fill="#059669" font-size="12" font-weight="bold" transform="rotate(-5 645 885)">VERIFIED</text>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_INVOICES: SampleInvoice[] = [
  {
    id: 'sample-1',
    name: 'Sample 1: Raw Material (ABC Chemicals Pvt Ltd)',
    department: 'RM',
    vendorName: 'ABC Chemicals Pvt Ltd',
    invoiceNo: 'INV-2026-001',
    amount: 148500,
    description: 'Active Pharmaceutical Ingredients (Paracetamol IP & Microcrystalline Cellulose)',
    dataUrl: generateSampleInvoiceDataUrl(
      'ABC Chemicals Pvt Ltd',
      '24ABCDE1234F1Z5',
      'INV-2026-001',
      '08-09-2026',
      'RM',
      [
        { desc: 'Paracetamol Micronized IP Grade (Batch #PC-26-88)', hsn: '29222990', qty: 250, rate: 420, amount: 105000 },
        { desc: 'Microcrystalline Cellulose PH-102 IP/USP', hsn: '39129090', qty: 100, rate: 208.47, amount: 20847.46 },
      ],
      148500
    ),
  },
  {
    id: 'sample-2',
    name: 'Sample 2: Packaging Material (XYZ Packaging Solutions)',
    department: 'PM',
    vendorName: 'XYZ Packaging Solutions',
    invoiceNo: 'XYZ/2026/894',
    amount: 62400,
    description: 'Blister Packaging Foil Alu-Alu (150 Rolls, Pin-hole tested)',
    dataUrl: generateSampleInvoiceDataUrl(
      'XYZ Packaging Solutions',
      '27XYZPA5678G2Z1',
      'XYZ/2026/894',
      '04-09-2026',
      'PM',
      [
        { desc: 'Alu-Alu Cold Form Blister Laminate (Width 140mm)', hsn: '76071994', qty: 80, rate: 450, amount: 36000 },
        { desc: 'Hard Temper Push-Through Blister Foil 20 Micron', hsn: '76072090', qty: 50, rate: 337.63, amount: 16881.36 },
      ],
      62400
    ),
  },
  {
    id: 'sample-3',
    name: 'Sample 3: Quality Control Lab (Apex Bio-Tech)',
    department: 'QC',
    vendorName: 'Apex Bio-Tech Lab Supplies',
    invoiceNo: 'ABT-9921',
    amount: 38900,
    description: 'HPLC Gradient Grade Solvents & Certified Reference Standards',
    dataUrl: generateSampleInvoiceDataUrl(
      'Apex Bio-Tech Lab Supplies',
      '29APEXB3456J4Z7',
      'ABT-9921',
      '05-09-2026',
      'QC',
      [
        { desc: 'Acetonitrile HPLC Isocratic Grade (4 x 2.5 Liters)', hsn: '29269000', qty: 6, rate: 3800, amount: 22800 },
        { desc: 'Methanol LC-MS HyperGrade 1L Glass Bottle', hsn: '29051100', qty: 10, rate: 1016.95, amount: 10169.50 },
      ],
      38900
    ),
  },
  {
    id: 'sample-4',
    name: 'Sample 4: Engineering Spares (PharmaEquip Spares)',
    department: 'Engineering',
    vendorName: 'PharmaEquip Machinery Spares Ltd',
    invoiceNo: 'PE-IND-4081',
    amount: 85200,
    description: 'Rotary Tablet Press D-Tooling Seals & HEPA Filter Replacement Kits',
    dataUrl: generateSampleInvoiceDataUrl(
      'PharmaEquip Machinery Spares Ltd',
      '06PHARM7890K5Z3',
      'PE-IND-4081',
      '07-09-2026',
      'Engineering',
      [
        { desc: '36-Station Rotary Press Upper Punch Dust Cups (Pack of 100)', hsn: '84779000', qty: 4, rate: 6500, amount: 26000 },
        { desc: 'Terminal Gel-Seal HEPA Filters 0.3 Micron Cleanroom Grade', hsn: '84213920', qty: 6, rate: 7700.56, amount: 46203.40 },
      ],
      85200
    ),
  },
];
