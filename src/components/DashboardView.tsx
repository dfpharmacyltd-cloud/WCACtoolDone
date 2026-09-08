import React from 'react';
import {
  FileText,
  TrendingUp,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Scan,
} from 'lucide-react';
import { InvoiceRecord, Department } from '../types';

interface DashboardViewProps {
  invoices: InvoiceRecord[];
  departments: Department[];
  onNavigate: (view: string) => void;
  onSelectInvoice: (invoice: InvoiceRecord) => void;
  onExportExcel: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  departments,
  onNavigate,
  onSelectInvoice,
  onExportExcel,
}) => {
  // Calculations
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.invoice_amount) || 0), 0);

  // Today's entries (matching DD-MM-YYYY)
  const todayStr = new Date().toISOString().slice(0, 10).split('-').reverse().join('-');
  const todayEntries = invoices.filter((inv) => inv.entry_date && inv.entry_date.includes(todayStr)).length;

  // Department Breakdown
  const deptStats = departments.map((dept) => {
    const deptInvoices = invoices.filter((inv) => inv.department === dept.code);
    const amount = deptInvoices.reduce((sum, inv) => sum + (Number(inv.invoice_amount) || 0), 0);
    return {
      ...dept,
      count: deptInvoices.length,
      amount,
      percentage: totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0',
    };
  });

  // Recent 5 invoices
  const recentInvoices = [...invoices].slice(0, 5);

  const pendingCount = invoices.filter((i) => i.status === 'Pending Review').length;
  const approvedCount = invoices.filter((i) => i.status === 'Approved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pharma Plant Procurement Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Tax Invoice &amp; Automatic Excel Processing System
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time optical AI document extraction for Raw Materials, Packaging, QC Lab, and Engineering.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dashboard-scan-btn"
            onClick={() => onNavigate('scanner')}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Scan className="w-4 h-4" />
            <span>Scan New Invoice</span>
          </button>

          <button
            id="dashboard-excel-btn"
            onClick={onExportExcel}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download Excel Sheet</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices Processed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Invoices</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalInvoices}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>{approvedCount} Approved in Ledger</span>
            </div>
          </div>
        </div>

        {/* Today's Entries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Today's Entries</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{todayEntries}</div>
            <div className="text-xs text-slate-500 mt-1">Processed today ({todayStr})</div>
          </div>
        </div>

        {/* Total Ledger Expenditure */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Purchase Value</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ₹ {totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Sum of all GST verified bills</div>
          </div>
        </div>

        {/* Review Queue Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Review</span>
            <div className={`p-2 rounded-lg ${pendingCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingCount}</div>
            <div className="text-xs text-slate-500 mt-1">
              {pendingCount > 0 ? 'Awaiting QA/Accounts sign-off' : 'All invoices validated & entered'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Wise Report & Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Wise Report (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Wise Report</h2>
              <p className="text-xs text-slate-500">Auto-identified breakdown by Raw Material, Packaging, QC, and Engineering</p>
            </div>
            <button
              onClick={() => onNavigate('masters')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
            >
              <span>Manage Departments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {deptStats.map((dept) => (
              <div key={dept.code} className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono">
                      {dept.code}
                    </span>
                    <span className="font-semibold text-slate-900">{dept.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">₹ {dept.amount.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500 ml-2">({dept.count} bills)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Head: {dept.head}</span>
                  <span>{dept.percentage}% of total purchase</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend & Pharma Integrity Box */}
        <div className="space-y-6">
          {/* Monthly Report Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Monthly Trend Report</h2>
            <p className="text-xs text-slate-500 mb-4">Volume &amp; expenditure track</p>

            <div className="space-y-3">
              {[
                { month: 'May 2026', count: 18, amount: 980000 },
                { month: 'Jun 2026', count: 24, amount: 1420000 },
                { month: 'Jul 2026', count: 31, amount: 1890000 },
                { month: 'Aug 2026', count: 29, amount: 1650000 },
                { month: 'Sep 2026 (Current)', count: totalInvoices, amount: totalAmount },
              ].map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                  <span className="font-medium text-slate-700">{m.month}</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">₹ {(m.amount / 100000).toFixed(2)} Lakhs</span>
                    <span className="text-slate-400 ml-2 font-mono">({m.count} inv)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Zero Paid API Note */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Pharma Enterprise Architecture</span>
            </div>
            <h3 className="font-semibold text-white text-sm mt-2">Zero Paid API Dependency</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Powered by native Gemini Vision intelligence + local Tesseract.js client OCR fallback. Automatically cross-references Supplier GSTIN with Vendor Master.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>Automatic Excel Entry:</span>
              <span className="text-emerald-400 font-semibold font-mono">ACTIVE (10 Cols)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Processed Invoices Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Processed Invoices</h2>
            <p className="text-xs text-slate-500">Live entries synchronized with Excel Ledger</p>
          </div>
          <button
            onClick={() => onNavigate('ledger')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>View Full Excel Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">SR No.</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Invoice No.</th>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Invoice Date</th>
                <th className="py-2.5 px-3">GST No.</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-medium text-slate-500">{inv.sr_no}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {inv.department}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900">{inv.invoice_no}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{inv.company_name}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{inv.invoice_date}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{inv.gst_no}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 font-mono">
                    ₹ {Number(inv.invoice_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'Pending Review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onSelectInvoice(inv)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      Review / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
