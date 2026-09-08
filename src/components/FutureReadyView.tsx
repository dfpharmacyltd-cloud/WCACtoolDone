import React, { useState } from 'react';
import {
  QrCode,
  Barcode,
  Mail,
  MessageSquare,
  Network,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Download,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { InvoiceRecord } from '../types';

interface FutureReadyViewProps {
  invoices: InvoiceRecord[];
}

export const FutureReadyView: React.FC<FutureReadyViewProps> = ({ invoices }) => {
  const [activeModule, setActiveModule] = useState<'qr_barcode' | 'erp' | 'email_whatsapp' | 'workflow'>('qr_barcode');
  const [qrSimulationResult, setQrSimulationResult] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Sample e-Invoice QR Payload (Govt of India B2B IRN Standard)
  const sampleQrPayload = {
    IRN: '6c2f90a9e71b2d41a7b0518903c73491e0a29486c478a05c754d92a0139b4f0a',
    SupplierGSTIN: '24ABCDE1234F1Z5',
    BuyerGSTIN: '24AAACD4912K1Z9',
    DocNo: 'INV-2026-001',
    DocTyp: 'INV',
    DocDt: '08/09/2026',
    TotInvVal: 148500.0,
    ItemCnt: 2,
    MainHsnCode: '29222990',
    DigitalSignature: 'SHA256withRSA:MIIE...Verified',
  };

  const simulateQrScan = () => {
    setQrSimulationResult('Scanning e-Invoice QR Matrix...');
    setTimeout(() => {
      setQrSimulationResult(JSON.stringify(sampleQrPayload, null, 2));
    }, 500);
  };

  // Generate ERP Schemas
  const sapIdocXml = `<?xml version="1.0" encoding="UTF-8"?>
<INVOIC02>
  <IDOC BEGIN="1">
    <EDI_DC40>
      <MESTYP>INVOIC</MESTYP>
      <DOCTYP>INVOIC02</DOCTYP>
      <SNDPRT>LS</SNDPRT>
      <SNDPRN>DF_INVOICE_AI</SNDPRN>
      <RCVPRT>LS</RCVPRT>
      <RCVPRN>SAP_S4HANA</RCVPRN>
    </EDI_DC40>
    <E1EDK01>
      <BELNR>${invoices[0]?.invoice_no || 'INV-2026-001'}</BELNR>
      <CURCY>INR</CURCY>
      <REC_GSTIN>${invoices[0]?.gst_no || '24ABCDE1234F1Z5'}</REC_GSTIN>
      <REC_AMOUNT>${invoices[0]?.invoice_amount || 148500}</REC_AMOUNT>
      <DEPARTMENT_REF>${invoices[0]?.department || 'RM'}</DEPARTMENT_REF>
    </E1EDK01>
  </IDOC>
</INVOIC02>`;

  const tallyXml = `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create">
            <DATE>${(invoices[0]?.invoice_date || '08-09-2026').replace(/-/g, '')}</DATE>
            <VOUCHERNUMBER>${invoices[0]?.invoice_no || 'INV-2026-001'}</VOUCHERNUMBER>
            <PARTYNAME>${invoices[0]?.company_name || 'ABC Chemicals Pvt Ltd'}</PARTYNAME>
            <PARTYGSTIN>${invoices[0]?.gst_no || '24ABCDE1234F1Z5'}</PARTYGSTIN>
            <AMOUNT>-${invoices[0]?.invoice_amount || 148500}</AMOUNT>
            <DEPARTMENT>${invoices[0]?.department || 'RM'}</DEPARTMENT>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(type);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Title Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                Future-Ready Architecture Hub
              </span>
              <span className="text-xs text-slate-500 font-medium">Enterprise Pharma Integration Suite</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Automations, Omnichannel Ingestion &amp; ERP Connectors
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Architectural readiness for e-Invoice QR decoding, duplicate surveillance, email/WhatsApp bots, and SAP/Tally sync.
            </p>
          </div>

          {/* Module Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveModule('qr_barcode')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${
                activeModule === 'qr_barcode' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              QR &amp; Barcodes
            </button>
            <button
              onClick={() => setActiveModule('erp')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${
                activeModule === 'erp' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ERP Integration (SAP/Tally)
            </button>
            <button
              onClick={() => setActiveModule('email_whatsapp')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${
                activeModule === 'email_whatsapp' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email &amp; WhatsApp Bot
            </button>
            <button
              onClick={() => setActiveModule('workflow')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${
                activeModule === 'workflow' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pharma 3-Tier Approval
            </button>
          </div>
        </div>
      </div>

      {/* MODULE 1: QR & BARCODE E-INVOICE SCANNING */}
      {activeModule === 'qr_barcode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-purple-700 font-bold text-sm">
              <QrCode className="w-5 h-5" />
              <span>Govt e-Invoice B2B QR Code &amp; Barcode Decoder</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard Indian B2B pharma tax invoices mandate a signed QR code containing IRN (Invoice Reference Number), Supplier GSTIN, Recipient GSTIN, and gross taxable value.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-xs text-slate-800">Simulate Camera QR Detection:</div>
              <button
                onClick={simulateQrScan}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-lg transition shadow-xs flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Test Decode Sample E-Invoice QR Code</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">Supported Pharma Barcode Standards:</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>GS1-128 2D DataMatrix (Pharma API &amp; Batch Traceability)</li>
                <li>Govt NIC E-Invoice B2B QR Code (IRN &amp; Digital Signature)</li>
                <li>Code 128 / Code 39 Purchase Order Barcodes</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Decoded QR Metadata Stream</span>
              {qrSimulationResult && (
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Signature Verified
                </span>
              )}
            </div>

            <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl h-[340px] overflow-auto border border-slate-800">
              {qrSimulationResult || (
                <span className="text-slate-500">
                  Click 'Test Decode Sample E-Invoice QR Code' to simulate real-time hardware QR extraction...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: ERP INTEGRATION */}
      {activeModule === 'erp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
                <Network className="w-5 h-5" />
                <span>SAP S/4HANA IDoc XML Format</span>
              </div>
              <button
                onClick={() => copyToClipboard(sapIdocXml, 'sap')}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                {copiedFormat === 'sap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'sap' ? 'Copied' : 'Copy IDoc'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Generated XML compliant with SAP standard INVOIC02 IDoc structure for automated MIRO voucher entry.
            </p>
            <pre className="bg-slate-950 text-sky-400 font-mono text-xs p-4 rounded-xl h-[280px] overflow-auto border border-slate-800">
              {sapIdocXml}
            </pre>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <Network className="w-5 h-5" />
                <span>Tally Prime Purchase XML Format</span>
              </div>
              <button
                onClick={() => copyToClipboard(tallyXml, 'tally')}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                {copiedFormat === 'tally' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'tally' ? 'Copied' : 'Copy Tally XML'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Ready for direct import into Tally Prime via ODBC / Server XML HTTP connector.
            </p>
            <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl h-[280px] overflow-auto border border-slate-800">
              {tallyXml}
            </pre>
          </div>
        </div>
      )}

      {/* MODULE 3: EMAIL & WHATSAPP OMNICHANNEL INGESTION */}
      {activeModule === 'email_whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-teal-700 font-bold text-sm">
              <Mail className="w-5 h-5" />
              <span>Email Invoice Ingestion Webhook</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Suppliers email PDF invoices directly to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-teal-800">invoices@dfpharma.com</code>. The webhook triggers background vision extraction and queues into Draft status.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Inbox Address:</span>
                <span className="font-mono font-bold text-slate-900">invoices@dfpharma.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auto-Extractor:</span>
                <span className="text-emerald-700 font-bold">Enabled (Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duplicate Check:</span>
                <span className="text-teal-700 font-bold">Pre-ingestion filter</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <MessageSquare className="w-5 h-5" />
              <span>WhatsApp Business Invoice Upload Bot</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Security gate guards and storekeepers photograph invoices using WhatsApp. The Meta Cloud Webhook posts the photo to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-emerald-800">/api/scan-invoice</code>.
            </p>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
              <div className="font-bold text-emerald-950">Simulated WhatsApp Flow:</div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-slate-800 shadow-xs space-y-1">
                <div className="text-[11px] text-slate-400 font-mono">Store Officer (09:42 AM):</div>
                <div className="text-xs">📸 [Photo: ABC Chemicals Challan INV-2026-001.jpg]</div>
              </div>
              <div className="bg-emerald-600 text-white p-2.5 rounded-lg text-xs space-y-1">
                <div className="text-[11px] text-emerald-200 font-mono">Pharma AI Bot (09:43 AM):</div>
                <div>✅ Invoice INV-2026-001 verified! Matched to RM Department. Net ₹1,48,500 recorded in Excel Ledger.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: PHARMA 3-TIER APPROVAL WORKFLOW */}
      {activeModule === 'workflow' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pharma Good Manufacturing Practice (GMP) 3-Tier Approval</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Regulated compliance workflow ensuring raw materials and packaging materials undergo Certificate of Analysis (COA) signoff before financial posting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span className="font-bold text-xs text-slate-900">Store / Procurement</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invoice captured via camera or PDF. AI extracts GSTIN, Date, Amount, and routes to RM/PM/QC.
              </p>
              <div className="text-[11px] font-mono text-teal-700 font-bold bg-teal-50 p-2 rounded">
                Status: Pending Review
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span className="font-bold text-xs text-slate-900">QA / QC Technical Check</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                QA Officer verifies Certificate of Analysis (COA) batch number and vendor GMP approval.
              </p>
              <div className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 p-2 rounded">
                Status: QA Approved
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span className="font-bold text-xs text-slate-900">Finance &amp; Excel Posting</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accounts executive matches purchase order rates and generates final row in Excel Ledger.
              </p>
              <div className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 p-2 rounded">
                Status: Posted to Ledger
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
