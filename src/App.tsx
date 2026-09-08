import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScannerView } from './components/ScannerView';
import { ReviewView } from './components/ReviewView';
import { ExcelLedgerView } from './components/ExcelLedgerView';
import { MasterManagementView } from './components/MasterManagementView';
import { FutureReadyView } from './components/FutureReadyView';
import { LoginModal } from './components/LoginModal';
import { DocsManualModal } from './components/DocsManualModal';
import { GoogleSheetsUploadModal } from './components/GoogleSheetsUploadModal';
import { INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_VENDORS, INITIAL_INVOICES } from './data/initialData';
import { InvoiceRecord, Department, Vendor, User, ScanInvoiceResult } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { initAuth, getAccessToken, getGoogleUser } from './services/googleAuth';
import { appendSingleInvoiceToSheet } from './services/googleSheetsService';
import type { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // Navigation View: dashboard | scanner | review | ledger | masters | future_ready
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Application Data States
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Active Review State (from scanner)
  const [activeScanResult, setActiveScanResult] = useState<ScanInvoiceResult | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string>('');
  const [activeFileName, setActiveFileName] = useState<string>('');

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);

  // Google Sheets integration state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [linkedSpreadsheet, setLinkedSpreadsheet] = useState<{ id: string; url: string; title: string } | null>(() => {
    try {
      const saved = localStorage.getItem('df_pharma_linked_sheet');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(getGoogleUser());
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch initial data from server on startup
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [invRes, deptRes, venRes] = await Promise.all([
          fetch('/api/invoices').catch(() => null),
          fetch('/api/departments').catch(() => null),
          fetch('/api/vendors').catch(() => null),
        ]);

        if (invRes && invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData) && invData.length > 0) {
            setInvoices(invData);
          }
        }

        if (deptRes && deptRes.ok) {
          const deptData = await deptRes.json();
          if (Array.isArray(deptData) && deptData.length > 0) {
            setDepartments(deptData);
          }
        }

        if (venRes && venRes.ok) {
          const venData = await venRes.json();
          if (Array.isArray(venData) && venData.length > 0) {
            setVendors(venData);
          }
        }
      } catch (err) {
        console.warn('Initial server fetch skipped; utilizing local store.', err);
      }
    };

    fetchInitialData();
  }, []);

  // Handler: Scan Completed -> Move to Review
  const handleScanCompleted = (result: ScanInvoiceResult, previewImage: string, fileName: string) => {
    setActiveScanResult(result);
    setActivePreviewImage(previewImage);
    setActiveFileName(fileName);
    setCurrentView('review');
    showToast('Invoice extracted successfully! Please review details before saving.');
  };

  // Handler: Save Invoice to Ledger
  const handleSaveInvoice = async (newInvoice: InvoiceRecord, uploadToSheets: boolean = true) => {
    try {
      // Optimistic state update
      const existingIdx = invoices.findIndex((i) => i.id === newInvoice.id);
      let updatedList: InvoiceRecord[];

      if (existingIdx >= 0) {
        updatedList = [...invoices];
        updatedList[existingIdx] = newInvoice;
      } else {
        updatedList = [newInvoice, ...invoices];
      }

      setInvoices(updatedList);

      // Persist to server API
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      }).catch((e) => console.warn('Server sync error:', e));

      // Append to Google Sheets if connected
      let sheetsSuccess = false;
      if (uploadToSheets && linkedSpreadsheet) {
        const token = getAccessToken();
        if (token) {
          try {
            await appendSingleInvoiceToSheet(token, linkedSpreadsheet.id, newInvoice);
            sheetsSuccess = true;
          } catch (sheetsErr) {
            console.warn('Auto Google Sheets append error:', sheetsErr);
          }
        }
      }

      if (sheetsSuccess) {
        showToast(`Invoice #${newInvoice.invoice_no} saved and synced to Google Sheets (${linkedSpreadsheet?.title})!`);
      } else {
        showToast(`Invoice #${newInvoice.invoice_no} committed into Excel Ledger!`);
      }

      setCurrentView('ledger');
      setActiveScanResult(null);
    } catch (err) {
      console.error('Failed to save invoice:', err);
      showToast('Error saving invoice record', 'error');
    }
  };

  // Handler: Edit an existing invoice from ledger
  const handleEditInvoiceFromLedger = (invoice: InvoiceRecord) => {
    setActiveScanResult({
      invoice_no: invoice.invoice_no,
      company_name: invoice.company_name,
      invoice_date: invoice.invoice_date,
      gst_no: invoice.gst_no,
      amount: invoice.invoice_amount,
      department: invoice.department,
      purchase_category: invoice.purchase_category,
      engine_used: 'gemini-vision',
    });
    setActivePreviewImage(invoice.image_url || '');
    setActiveFileName(invoice.file_name || `Invoice_${invoice.invoice_no}`);
    setCurrentView('review');
  };

  // Handler: Delete Invoice
  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this invoice from the Excel ledger?')) {
      return;
    }

    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);

    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      showToast('Invoice record removed.');
    } catch (err) {
      console.warn('Server delete failed', err);
    }
  };

  // Handler: Export Excel via Server Stream
  const handleExportExcel = () => {
    window.location.href = '/api/export-excel';
  };

  // Vendor Master Handlers
  const handleAddVendor = async (vendorData: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: 'ven-' + Date.now(),
    };
    setVendors([newVendor, ...vendors]);
    try {
      await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor),
      });
      showToast(`Vendor ${newVendor.name} added to Master.`);
    } catch (e) {
      console.warn('Server sync vendor failed', e);
    }
  };

  const handleUpdateVendor = async (id: string, partial: Partial<Vendor>) => {
    setVendors(vendors.map((v) => (v.id === id ? { ...v, ...partial } : v)));
    try {
      await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      showToast('Vendor master record updated.');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!window.confirm('Delete this vendor from master?')) return;
    setVendors(vendors.filter((v) => v.id !== id));
    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      showToast('Vendor removed from master.');
    } catch (e) {
      console.warn(e);
    }
  };

  // Department Master Handlers
  const handleAddDepartment = async (newDept: Department) => {
    setDepartments([...departments, newDept]);
    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept),
      });
      showToast(`Department ${newDept.code} registered.`);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateDepartment = (code: string, partial: Partial<Department>) => {
    setDepartments(departments.map((d) => (d.code === code ? { ...d, ...partial } : d)));
    showToast(`Department ${code} updated.`);
  };

  const handleDeleteDepartment = (code: string) => {
    if (!window.confirm(`Delete department ${code}?`)) return;
    setDepartments(departments.filter((d) => d.code !== code));
    showToast(`Department ${code} deleted.`);
  };

  // Calculate next SR No.
  const nextSrNo = invoices.length > 0 ? Math.max(...invoices.map((i) => Number(i.sr_no) || 0)) + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 antialiased flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
        googleUserEmail={googleUser?.email}
        pendingReviewCount={invoices.filter((i) => i.status === 'Pending Review').length}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold ${
              toastMsg.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <DashboardView
            invoices={invoices}
            departments={departments}
            onNavigate={setCurrentView}
            onSelectInvoice={handleEditInvoiceFromLedger}
            onExportExcel={handleExportExcel}
          />
        )}

        {/* VIEW 2: INVOICE SCANNER (Mobile Camera & Scanned PDF) */}
        {currentView === 'scanner' && (
          <ScannerView currentUser={currentUser} onScanCompleted={handleScanCompleted} />
        )}

        {/* VIEW 3: REVIEW & CORRECTION */}
        {currentView === 'review' && activeScanResult && (
          <ReviewView
            scanResult={activeScanResult}
            previewImage={activePreviewImage}
            fileName={activeFileName}
            currentUser={currentUser}
            departments={departments}
            vendors={vendors}
            onSaveInvoice={handleSaveInvoice}
            onCancel={() => setCurrentView('scanner')}
            nextSrNo={nextSrNo}
            linkedSpreadsheet={linkedSpreadsheet}
          />
        )}

        {/* Fallback if user navigates to review without scanning */}
        {currentView === 'review' && !activeScanResult && (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-8">
            <h3 className="text-base font-bold text-slate-800">No Document Pending Review</h3>
            <p className="text-xs text-slate-500">
              Please capture a photo or upload an invoice from the scanner page to review extracted fields.
            </p>
            <button
              onClick={() => setCurrentView('scanner')}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
            >
              Go to Invoice Scanner
            </button>
          </div>
        )}

        {/* VIEW 4: EXCEL LEDGER TABLE */}
        {currentView === 'ledger' && (
          <ExcelLedgerView
            invoices={invoices}
            departments={departments}
            onEditInvoice={handleEditInvoiceFromLedger}
            onDeleteInvoice={handleDeleteInvoice}
            onExportExcel={handleExportExcel}
            onOpenGoogleSheetsUpload={() => setIsGoogleSheetsModalOpen(true)}
            linkedSpreadsheet={linkedSpreadsheet}
            googleUserEmail={googleUser?.email}
          />
        )}

        {/* VIEW 5: MASTER MANAGEMENT (Vendors & Departments) */}
        {currentView === 'masters' && (
          <MasterManagementView
            vendors={vendors}
            departments={departments}
            onAddVendor={handleAddVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}

        {/* VIEW 6: FUTURE READY ENTERPRISE HUB */}
        {currentView === 'future_ready' && <FutureReadyView invoices={invoices} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-[11px] text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Smart Tax Invoice Scanner &amp; Automatic Excel Entry System</strong> • Pharma Enterprise Edition
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-teal-700 underline font-semibold">
              Documentation &amp; User Manual
            </button>
            <span>•</span>
            <span className="font-mono text-slate-400">Zero Paid API • Gemini Vision + Tesseract OCR</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast(`Logged in as ${u.name} (${u.role})`);
        }}
      />

      <DocsManualModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      <GoogleSheetsUploadModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        invoices={invoices}
        onSpreadsheetLinked={(sheet) => {
          setLinkedSpreadsheet(sheet);
          try {
            localStorage.setItem('df_pharma_linked_sheet', JSON.stringify(sheet));
          } catch (e) {
            console.warn(e);
          }
          showToast(`Google Sheet linked: "${sheet.title}"`);
        }}
        linkedSpreadsheet={linkedSpreadsheet}
      />
    </div>
  );
}
