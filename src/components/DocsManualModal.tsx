import React, { useState } from 'react';
import { X, BookOpen, Database, Terminal, FileCode, Users, CheckCircle2, Copy, Check } from 'lucide-react';

interface DocsManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsManualModal: React.FC<DocsManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'install' | 'manual' | 'testdata'>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              Rx
            </div>
            <div>
              <h2 className="text-base font-bold">System Documentation &amp; Technical Manual</h2>
              <p className="text-xs text-slate-400">Production AI Tax Invoice &amp; Automatic Excel Processing System</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center space-x-2 shrink-0 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: '1. Architecture & Folders' },
            { id: 'schema', label: '2. Database Schema' },
            { id: 'install', label: '3. Installation & Deployment' },
            { id: 'manual', label: '4. User Manual' },
            { id: 'testdata', label: '5. Pharma Testing Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed">
          {/* TAB 1: ARCHITECTURE & FOLDERS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Project Architecture</h3>
              <p>
                The <strong>Smart Tax Invoice Scanner &amp; Automatic Excel Entry System</strong> is structured as an enterprise-grade full-stack web application designed for zero paid API dependencies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-xs">Core Technology Stack:</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-600">
                    <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, Lucide Icons</li>
                    <li><strong>Backend:</strong> Express.js &amp; TSX (with Python FastAPI architecture guide included)</li>
                    <li><strong>Vision OCR:</strong> Gemini Vision (Primary) + Local Tesseract.js (Offline Fallback)</li>
                    <li><strong>Excel Generator:</strong> XLSX &amp; OpenPyXL compliant workbook engine</li>
                    <li><strong>Database:</strong> Persistent JSON / SQLite / PostgreSQL schema</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-xs">Folder Structure:</div>
                  <pre className="font-mono text-[11px] text-slate-700 leading-tight">
{`/
├── server.ts                  # Express API, Gemini Vision, Excel streaming
├── data/                      # Persistent storage (pharma_store.json)
├── src/
│   ├── App.tsx                # Main App Controller & State
│   ├── types.ts               # Shared TypeScript schemas & interfaces
│   ├── data/
│   │   ├── initialData.ts     # Initial Pharma users, depts, vendors
│   │   └── sampleInvoices.ts  # Pre-loaded authentic test invoices
│   ├── utils/
│   │   └── ocrService.ts      # Dual OCR coordinator & GSTIN validation
│   └── components/
│       ├── Navbar.tsx         # Responsive header with user profiles
│       ├── DashboardView.tsx  # Analytics, metrics, dept breakdown
│       ├── ScannerView.tsx    # Camera capture, file drop, sample picker
│       ├── ReviewView.tsx     # Side-by-side inspection & correction
│       ├── ExcelLedgerView.tsx# Live 10-column Excel table & downloads
│       ├── MasterManagementView.tsx # Vendor & Dept masters
│       ├── FutureReadyView.tsx# QR, ERP, Email/WhatsApp simulations
│       └── DocsManualModal.tsx # System docs & user manual`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Database Schema (SQL &amp; Relational DDL)</h3>
              <p>
                The system stores records in normalized relational tables. Below is the production-ready SQLite / PostgreSQL schema:
              </p>

              <div className="relative">
                <button
                  onClick={() =>
                    copySnippet(
                      `-- Tax Invoices Table
CREATE TABLE invoices (
    id VARCHAR(64) PRIMARY KEY,
    sr_no INTEGER NOT NULL,
    department VARCHAR(20) NOT NULL, -- RM, PM, QC, QA, Engineering, Admin
    invoice_no VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    invoice_date VARCHAR(20) NOT NULL, -- DD-MM-YYYY
    gst_no VARCHAR(15) NOT NULL,
    invoice_amount DECIMAL(14, 2) NOT NULL,
    purchase_category VARCHAR(150) NOT NULL,
    entry_date VARCHAR(30) NOT NULL,
    entered_by VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Approved',
    file_name VARCHAR(255),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Master Table (Intelligence Mapping)
CREATE TABLE vendors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(20) NOT NULL,
    default_category VARCHAR(150),
    gstin VARCHAR(15) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    payment_terms VARCHAR(50) DEFAULT 'Net 30 Days'
);

-- Department Master Table
CREATE TABLE departments (
    code VARCHAR(20) PRIMARY KEY, -- RM, PM, QC, QA, ENG, ADM
    name VARCHAR(150) NOT NULL,
    head VARCHAR(100),
    description TEXT,
    budget_code VARCHAR(50)
);`,
                      'sql'
                    )
                  }
                  className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                >
                  {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'sql' ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
{`-- Tax Invoices Table
CREATE TABLE invoices (
    id VARCHAR(64) PRIMARY KEY,
    sr_no INTEGER NOT NULL,
    department VARCHAR(20) NOT NULL, -- RM, PM, QC, QA, Engineering, Admin
    invoice_no VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    invoice_date VARCHAR(20) NOT NULL, -- DD-MM-YYYY
    gst_no VARCHAR(15) NOT NULL,
    invoice_amount DECIMAL(14, 2) NOT NULL,
    purchase_category VARCHAR(150) NOT NULL,
    entry_date VARCHAR(30) NOT NULL,
    entered_by VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Approved',
    file_name VARCHAR(255),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Master Table (Intelligence Mapping)
CREATE TABLE vendors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(20) NOT NULL,
    default_category VARCHAR(150),
    gstin VARCHAR(15) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    payment_terms VARCHAR(50) DEFAULT 'Net 30 Days'
);

-- Department Master Table
CREATE TABLE departments (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    head VARCHAR(100),
    description TEXT,
    budget_code VARCHAR(50)
);`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALLATION & DEPLOYMENT */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Installation &amp; Deployment Guide</h3>

              <div className="space-y-2">
                <div className="font-bold text-slate-800">Option A: Node.js &amp; Express (Current Production Environment)</div>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px]">
                  # 1. Clone repository and install dependencies<br />
                  npm install<br /><br />
                  # 2. Configure Environment Secrets<br />
                  cp .env.example .env<br />
                  # Edit GEMINI_API_KEY="your_gemini_key"<br /><br />
                  # 3. Start Development Server<br />
                  npm run dev<br /><br />
                  # 4. Production Build &amp; Start<br />
                  npm run build<br />
                  npm run start
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-800">Option B: Python FastAPI &amp; OpenPyXL Alternative Architecture</div>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px]">
                  # Requirements: Python 3.10+<br />
                  pip install fastapi uvicorn openpyxl pytesseract pillow google-genai<br /><br />
                  # Start FastAPI server on port 8000<br />
                  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USER MANUAL */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Standard Operating Procedure (SOP) User Manual</h3>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Step 1: Capture or Upload Tax Invoice</div>
                  <p className="text-slate-600">
                    Click <strong>📷 Capture Invoice</strong> to activate mobile/webcam camera. Position the tax invoice header and line items within the frame guide and click <strong>Take Photo</strong>. Alternatively, drag and drop scanned PDF, JPG, or PNG files into the upload box.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Step 2: AI Optical Extraction &amp; Vendor Intelligence</div>
                  <p className="text-slate-600">
                    Click <strong>🔍 Scan &amp; Extract</strong>. The AI analyzes visual tokens, extracts Supplier Name, GSTIN, Invoice Number, Date, and Amount. It automatically queries the <strong>Vendor Master</strong>: if the supplier is registered (e.g. ABC Chemicals), it assigns the <strong>RM (Raw Material)</strong> department without manual data entry.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Step 3: Side-by-Side Review &amp; Correction</div>
                  <p className="text-slate-600">
                    Inspect the original invoice on the left (zoom/rotate tools available) against editable form fields on the right. System highlights GSTIN checksum validity and alerts if a duplicate invoice number is detected.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Step 4: Automatic Excel Entry &amp; Export</div>
                  <p className="text-slate-600">
                    Click <strong>Confirm &amp; Save into Excel Ledger</strong>. A new row is instantly added to the master Excel table with all 10 required columns. Export to <code>.xlsx</code> anytime via the <strong>Download Excel</strong> button or copy TSV directly into Google Sheets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PHARMA TESTING DATA */}
          {activeTab === 'testdata' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Pharmaceutical Vendor &amp; Invoice Testing Dataset</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5">Vendor Name</th>
                      <th className="p-2.5">Dept</th>
                      <th className="p-2.5">GSTIN</th>
                      <th className="p-2.5">Sample Item Description</th>
                      <th className="p-2.5">Typical Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">ABC Chemicals Pvt Ltd</td>
                      <td className="p-2.5 font-mono font-bold text-teal-700">RM</td>
                      <td className="p-2.5 font-mono">24ABCDE1234F1Z5</td>
                      <td className="p-2.5">Paracetamol IP Grade &amp; MCC PH-102</td>
                      <td className="p-2.5 font-mono">₹ 1,48,500</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">XYZ Packaging Solutions</td>
                      <td className="p-2.5 font-mono font-bold text-teal-700">PM</td>
                      <td className="p-2.5 font-mono">27XYZPA5678G2Z1</td>
                      <td className="p-2.5">Alu-Alu Cold Form Blister Foil</td>
                      <td className="p-2.5 font-mono">₹ 62,400</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Sunrise Printing &amp; Labels</td>
                      <td className="p-2.5 font-mono font-bold text-teal-700">PM</td>
                      <td className="p-2.5 font-mono">07SUNPR9012H3Z9</td>
                      <td className="p-2.5">Printed Duplex Cartons &amp; Pack Inserts</td>
                      <td className="p-2.5 font-mono">₹ 27,500</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Apex Bio-Tech Lab Supplies</td>
                      <td className="p-2.5 font-mono font-bold text-teal-700">QC</td>
                      <td className="p-2.5 font-mono">29APEXB3456J4Z7</td>
                      <td className="p-2.5">HPLC Acetonitrile &amp; Reference Stds</td>
                      <td className="p-2.5 font-mono">₹ 38,900</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">PharmaEquip Machinery Spares</td>
                      <td className="p-2.5 font-mono font-bold text-teal-700">Engineering</td>
                      <td className="p-2.5 font-mono">06PHARM7890K5Z3</td>
                      <td className="p-2.5">Rotary Tablet Press D-Tooling Punch Seals</td>
                      <td className="p-2.5 font-mono">₹ 85,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
