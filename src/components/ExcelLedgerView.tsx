import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
  Edit,
  Building,
  Calendar,
  Layers,
  ArrowUpDown,
  FileCheck,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { InvoiceRecord, Department } from '../types';
import * as XLSX from 'xlsx';

interface ExcelLedgerViewProps {
  invoices: InvoiceRecord[];
  departments: Department[];
  onEditInvoice: (invoice: InvoiceRecord) => void;
  onDeleteInvoice: (id: string) => void;
  onExportExcel: () => void;
  onOpenGoogleSheetsUpload: () => void;
  linkedSpreadsheet?: { id: string; url: string; title: string } | null;
  googleUserEmail?: string | null;
}

export const ExcelLedgerView: React.FC<ExcelLedgerViewProps> = ({
  invoices,
  departments,
  onEditInvoice,
  onDeleteInvoice,
  onExportExcel,
  onOpenGoogleSheetsUpload,
  linkedSpreadsheet,
  googleUserEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Filter invoices
  const filtered = invoices.filter((inv) => {
    if (selectedDept !== 'ALL' && inv.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && inv.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoice_no.toLowerCase().includes(q) ||
        inv.company_name.toLowerCase().includes(q) ||
        inv.gst_no.toLowerCase().includes(q) ||
        inv.purchase_category.toLowerCase().includes(q) ||
        inv.entered_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFilteredAmount = filtered.reduce((sum, inv) => sum + (Number(inv.invoice_amount) || 0), 0);

  // Client-side Excel export fallback / direct download
  const handleDownloadExcel = () => {
    try {
      const rows = filtered.map((inv) => ({
        'SR No': inv.sr_no,
        'Department': inv.department,
        'Invoice No': inv.invoice_no,
        'Company Name': inv.company_name,
        'Invoice Date': inv.invoice_date,
        'GST No': inv.gst_no,
        'Invoice Amount': inv.invoice_amount,
        'Purchase Category': inv.purchase_category,
        'Entry Date': inv.entry_date,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      // Auto-size columns
      ws['!cols'] = [
        { wch: 8 },  // SR No
        { wch: 14 }, // Department
        { wch: 18 }, // Invoice No
        { wch: 32 }, // Company Name
        { wch: 14 }, // Invoice Date
        { wch: 18 }, // GST No
        { wch: 16 }, // Invoice Amount
        { wch: 30 }, // Purchase Category
        { wch: 22 }, // Entry Date
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Tax Invoices');
      XLSX.writeFile(wb, `Pharma_Tax_Invoices_Register_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.warn('Client-side excel download failed, falling back to server route:', err);
      onExportExcel();
    }
  };

  // Copy to clipboard for instant paste into Google Sheets
  const handleCopyToGoogleSheets = () => {
    const headers = [
      'SR No.',
      'Department',
      'Invoice No.',
      'Company Name',
      'Invoice Date',
      'GST No.',
      'Invoice Amount',
      'Purchase Category',
      'Entry Date',
      'Entered By',
    ];

    const tsvRows = [
      headers.join('\t'),
      ...filtered.map((inv) =>
        [
          inv.sr_no,
          inv.department,
          inv.invoice_no,
          inv.company_name,
          inv.invoice_date,
          inv.gst_no,
          inv.invoice_amount,
          inv.purchase_category,
          inv.entry_date,
          inv.entered_by,
        ].join('\t')
      ),
    ].join('\n');

    navigator.clipboard.writeText(tsvRows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner with Action Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Live Excel Ledger Synchronizer
              </span>
              <span className="text-xs text-slate-500 font-mono">10 Standard Columns</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Pharma Purchase Invoices Master Table
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Every scanned tax invoice automatically generates a new row formatted for Excel and Google Sheets.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="ledger-upload-sheets-btn"
              onClick={onOpenGoogleSheetsUpload}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
              title="Upload entire ledger to Google Sheets directly via Google API"
            >
              <UploadCloud className="w-4 h-4 text-emerald-200" />
              <span>Upload to Google Sheets</span>
            </button>

            <button
              id="ledger-download-excel-btn"
              onClick={handleDownloadExcel}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              id="ledger-copy-sheets-btn"
              onClick={handleCopyToGoogleSheets}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-300 transition"
              title="Copy table data as TSV to paste into Google Sheets"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy TSV'}</span>
            </button>
          </div>
        </div>

        {/* Google Sheets Live Sync Banner */}
        <div className="mt-5 p-3.5 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-white rounded-xl border border-teal-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800">
                  Google Sheets Cloud Upload
                </span>
                {googleUserEmail ? (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                    <span>Connected: {googleUserEmail}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    OAuth Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {linkedSpreadsheet ? (
                  <span>
                    Linked Sheet: <strong className="text-slate-800">{linkedSpreadsheet.title}</strong>
                  </span>
                ) : (
                  <span>
                    Google Sheets API se connect karke sabhi invoices direct apne Google account me upload karein.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
            {linkedSpreadsheet && (
              <a
                href={linkedSpreadsheet.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-300 shadow-2xs transition"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              </a>
            )}

            <button
              onClick={onOpenGoogleSheetsUpload}
              className="flex items-center space-x-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{linkedSpreadsheet ? 'Sync / Re-upload' : 'Upload Data to Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-5 border-t border-slate-100">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice No, Supplier Name, GSTIN, or Category..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Department filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Summary Statistics Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <span>
              Showing <strong className="text-slate-900">{filtered.length}</strong> of{' '}
              <strong className="text-slate-900">{invoices.length}</strong> rows
            </span>
            {selectedDept !== 'ALL' && (
              <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold">
                Filtered Dept: {selectedDept}
              </span>
            )}
          </div>
          <div>
            Total Value:{' '}
            <strong className="text-slate-900 font-mono text-sm">
              ₹ {totalFilteredAmount.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Excel Styled Table Component */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
        {/* Table Title Bar Styled like Excel Header */}
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-mono font-bold">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>EXCEL WORKSHEET: [Tax Invoices Register]</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Sheet 1 • 10 Columns Required Format
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">SR No.</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Department</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Invoice No.</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px]">Company Name</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Invoice Date</th>
                <th className="py-2.5 px-3 border-r border-slate-200">GST No.</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right">Invoice Amount (₹)</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px]">Purchase Category</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Entry Date</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Entered By</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No matching invoices found in Excel ledger.
                  </td>
                </tr>
              ) : (
                filtered.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-teal-50/40 transition font-sans ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">
                      {inv.sr_no}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-800">
                      <span className="inline-block bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                        {inv.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-900">
                      {inv.invoice_no}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900">
                      {inv.company_name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-700 whitespace-nowrap">
                      {inv.invoice_date}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">
                      {inv.gst_no}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      ₹ {Number(inv.invoice_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                      {inv.purchase_category}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap">
                      {inv.entry_date}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                      {inv.entered_by}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap space-x-1">
                      <button
                        onClick={() => onEditInvoice(inv)}
                        title="Edit Invoice"
                        className="p-1 rounded text-slate-600 hover:text-teal-700 hover:bg-slate-200"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteInvoice(inv.id)}
                        title="Delete Invoice"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
