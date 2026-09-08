import React, { useState } from 'react';
import {
  Check,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  ShieldCheck,
  Save,
  ArrowLeft,
  FileCheck2,
  Layers,
  Sparkles,
  Info,
  FileSpreadsheet,
} from 'lucide-react';
import { InvoiceRecord, ScanInvoiceResult, User, Department, Vendor } from '../types';
import { validateGstin, formatStandardEntryDate } from '../utils/ocrService';

interface ReviewViewProps {
  scanResult: ScanInvoiceResult;
  previewImage: string;
  fileName: string;
  currentUser: User;
  departments: Department[];
  vendors: Vendor[];
  onSaveInvoice: (invoice: InvoiceRecord, uploadToSheets?: boolean) => void;
  onCancel: () => void;
  nextSrNo: number;
  linkedSpreadsheet?: { id: string; url: string; title: string } | null;
}

const sanitizeCompany = (name?: string) => {
  if (!name) return '';
  let clean = name.trim();
  if (clean.startsWith('data:') || clean.includes('base64,') || clean.length > 120) return '';
  if (/\bLIMIT\b$/i.test(clean) && !/LIMITED$/i.test(clean)) clean = clean.replace(/\bLIMIT$/i, 'LIMITED');
  if (/\bPVT\s+LIMIT\b$/i.test(clean)) clean = clean.replace(/\bPVT\s+LIMIT$/i, 'PRIVATE LIMITED');
  return clean;
};

export const ReviewView: React.FC<ReviewViewProps> = ({
  scanResult,
  previewImage,
  fileName,
  currentUser,
  departments,
  vendors,
  onSaveInvoice,
  onCancel,
  nextSrNo,
  linkedSpreadsheet,
}) => {
  const [uploadToSheets, setUploadToSheets] = useState<boolean>(true);
  // Form state initialized with AI extracted values
  const [formData, setFormData] = useState({
    sr_no: nextSrNo,
    department: scanResult.department || 'RM',
    invoice_no: scanResult.invoice_no || '',
    company_name: sanitizeCompany(scanResult.company_name),
    invoice_date: scanResult.invoice_date || new Date().toISOString().slice(0, 10).split('-').reverse().join('-'),
    gst_no: scanResult.gst_no || '',
    invoice_amount: scanResult.amount || 0,
    purchase_category: scanResult.purchase_category || 'Raw Material (API / Excipient)',
    entry_date: formatStandardEntryDate(),
    entered_by: currentUser.name,
    notes: '',
    status: 'Approved' as 'Approved' | 'Pending Review' | 'Draft',
  });

  // Image zoom and rotation controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Field validations
  const isGstValid = validateGstin(formData.gst_no);
  const isDuplicate = Boolean(scanResult.duplicate_detected);

  // Vendor Master check
  const matchedVendor = vendors.find(
    (v) =>
      v.gstin.toUpperCase() === formData.gst_no.toUpperCase() ||
      v.name.toLowerCase() === formData.company_name.toLowerCase()
  );

  // Handle department change - auto update purchase category if default exists
  const handleDepartmentChange = (deptCode: string) => {
    let cat = formData.purchase_category;
    if (deptCode === 'RM') cat = 'Raw Material (API / Excipient)';
    else if (deptCode === 'PM') cat = 'Packaging Material (Blister & Foil)';
    else if (deptCode === 'QC') cat = 'Laboratory Reagents & Standards';
    else if (deptCode === 'QA') cat = 'Validation & Cleanroom Supplies';
    else if (deptCode === 'Engineering') cat = 'Machine Spares & Maintenance';
    else if (deptCode === 'Admin') cat = 'Stationery & Facility Supplies';

    setFormData({
      ...formData,
      department: deptCode,
      purchase_category: cat,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRecord: InvoiceRecord = {
      id: 'inv-' + Date.now(),
      sr_no: formData.sr_no,
      department: formData.department,
      invoice_no: formData.invoice_no.trim(),
      company_name: formData.company_name.trim(),
      invoice_date: formData.invoice_date.trim(),
      gst_no: formData.gst_no.trim().toUpperCase(),
      invoice_amount: Number(formData.invoice_amount) || 0,
      purchase_category: formData.purchase_category.trim(),
      entry_date: formData.entry_date,
      entered_by: formData.entered_by,
      status: formData.status,
      image_url: previewImage,
      file_name: fileName,
      notes: formData.notes,
      verification_flags: {
        gstValid: isGstValid,
        duplicateDetected: isDuplicate,
        vendorMatched: Boolean(matchedVendor),
      },
    };

    setSaveSuccess(true);
    setTimeout(() => {
      onSaveInvoice(finalRecord, uploadToSheets);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Navigation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Back to scanner"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                Verification &amp; Correction Stage
              </span>
              <span className="text-xs text-slate-500 font-mono">File: {fileName}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Review AI Extracted Invoice Data
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Cancel / Re-scan
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveSuccess}
            className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? 'Saved to Excel...' : 'Save & Enter into Excel'}</span>
          </button>
        </div>
      </div>

      {/* Duplicate detection warning if triggered */}
      {isDuplicate && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Duplicate Invoice Alert:</span> An invoice with number{' '}
            <span className="font-mono font-bold">{formData.invoice_no}</span> from this vendor already exists in the system.
            Please verify before saving to prevent double-payment.
          </div>
        </div>
      )}

      {/* Two-Column Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Original Invoice Document Inspector (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">Original Invoice Document</span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {scanResult.engine_used === 'gemini-vision' ? 'AI Vision 98.4%' : 'OCR Fallback'}
              </span>
            </div>

            {/* Zoom / Rotate Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1 rounded hover:bg-white text-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-600">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1 rounded hover:bg-white text-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1 rounded hover:bg-white text-slate-700 ml-1"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Inspection Canvas Container */}
          <div className="relative h-[640px] overflow-auto bg-slate-900 rounded-lg p-4 flex items-center justify-center border border-slate-800 shadow-inner">
            {previewImage.includes('pdf') ? (
              <div className="text-center text-slate-300 space-y-2 p-6">
                <FileCheck2 className="w-16 h-16 text-rose-400 mx-auto" />
                <p className="font-bold text-sm">PDF Scanned Document</p>
                <p className="text-xs text-slate-400 font-mono">{fileName}</p>
              </div>
            ) : (
              <img
                src={previewImage}
                alt="Invoice Document Preview"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-full max-w-full object-contain rounded shadow-lg"
              />
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Scroll inside image window to pan. Use zoom buttons for small print inspection.</span>
          </div>
        </div>

        {/* Right Column: AI Extracted Data Form with Editable Fields (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Extracted Data Fields</h2>
              <p className="text-xs text-slate-500">Edit or verify details before committing into Excel Ledger</p>
            </div>

            {matchedVendor && (
              <div className="flex items-center space-x-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vendor Master Match</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: SR No & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">SR No. (Auto Generated)</label>
                <input
                  type="number"
                  value={formData.sr_no}
                  onChange={(e) => setFormData({ ...formData, sr_no: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Department (Auto Identified)
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Invoice Number & Company Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Invoice Number (Detected Bill/Tax No)
                </label>
                <input
                  type="text"
                  value={formData.invoice_no}
                  onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                  placeholder="e.g. INV-2026-001"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Company Name (Supplier / Vendor)
                  </label>
                  {matchedVendor && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                      Matched Vendor ({matchedVendor.department})
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  list="vendor-datalist"
                  value={formData.company_name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const found = vendors.find(
                      (v) => v.name.toLowerCase() === newName.trim().toLowerCase()
                    );
                    if (found) {
                      setFormData({
                        ...formData,
                        company_name: found.name,
                        gst_no: found.gstin,
                        department: found.department,
                        purchase_category: found.defaultCategory,
                      });
                    } else {
                      setFormData({ ...formData, company_name: newName });
                    }
                  }}
                  onBlur={() => {
                    setFormData((prev) => ({
                      ...prev,
                      company_name: sanitizeCompany(prev.company_name),
                    }));
                  }}
                  placeholder="e.g. AGRIM PRINT AND PACK PRIVATE LIMITED"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
                <datalist id="vendor-datalist">
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.department} • {v.gstin}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Row 3: Invoice Date & GST Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Invoice Date (Format: DD-MM-YYYY)
                </label>
                <input
                  type="text"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  placeholder="DD-MM-YYYY"
                  pattern="\d{2}-\d{2}-\d{4}"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400">Strictly standardized DD-MM-YYYY</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">GST Number (GSTIN)</label>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isGstValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isGstValid ? 'Valid Format' : 'Check Format (15 chars)'}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.gst_no}
                  onChange={(e) => setFormData({ ...formData, gst_no: e.target.value.toUpperCase() })}
                  placeholder="e.g. 24ABCDE1234F1Z5"
                  maxLength={15}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 4: Invoice Amount & Purchase Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Invoice Amount / Grand Total (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.invoice_amount}
                  onChange={(e) => setFormData({ ...formData, invoice_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Purchase Category</label>
                <input
                  type="text"
                  value={formData.purchase_category}
                  onChange={(e) => setFormData({ ...formData, purchase_category: e.target.value })}
                  placeholder="e.g. Raw Material (API / Excipient)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 5: Entry Date & Entered By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Entry Date &amp; Time (Auto)</label>
                <div className="font-mono text-slate-800 font-semibold py-1">{formData.entry_date}</div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Entered By (Current User)</label>
                <div className="font-medium text-slate-800 py-1">{formData.entered_by}</div>
              </div>
            </div>

            {/* Row 6: Approval Status & Pharma Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Workflow Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Approved">Approved (Direct to Ledger)</option>
                  <option value="Pending Review">Pending Review (Awaiting QA Check)</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Batch / COA / Item Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Batch #PC-26-88, COA verified"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Google Sheets Sync Checkbox Option */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Upload to Google Sheets (Google Sheet me bhi add karein)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {linkedSpreadsheet
                      ? `New row will be automatically appended to "${linkedSpreadsheet.title}"`
                      : 'Invoice row will be saved and synchronized to Google Sheets'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={uploadToSheets}
                onChange={(e) => setUploadToSheets(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Discard
              </button>

              <button
                type="submit"
                disabled={saveSuccess}
                className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{saveSuccess ? 'Adding to Excel Table...' : 'Confirm & Save into Excel Ledger'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
