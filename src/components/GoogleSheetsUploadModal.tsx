import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Link as LinkIcon,
  LogOut,
  FolderOpen,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { InvoiceRecord } from '../types';
import {
  googleSignIn,
  googleSignOut,
  getAccessToken,
  getGoogleUser,
  hasGoogleToken,
} from '../services/googleAuth';
import {
  createAndUploadTaxInvoicesSheet,
  syncInvoicesToExistingSheet,
  fetchRecentGoogleSheets,
  extractSpreadsheetId,
  GoogleSheetsSyncResult,
  GoogleSpreadsheetItem,
} from '../services/googleSheetsService';
import { User as FirebaseUser } from 'firebase/auth';

interface GoogleSheetsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceRecord[];
  activeSpreadsheetId?: string;
  onSpreadsheetLinked?: (id: string, url: string, title: string) => void;
  autoSyncEnabled?: boolean;
  onToggleAutoSync?: (enabled: boolean) => void;
}

export const GoogleSheetsUploadModal: React.FC<GoogleSheetsUploadModalProps> = ({
  isOpen,
  onClose,
  invoices,
  activeSpreadsheetId = '',
  onSpreadsheetLinked,
  autoSyncEnabled = false,
  onToggleAutoSync,
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(getGoogleUser());
  const [hasToken, setHasToken] = useState<boolean>(hasGoogleToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Upload Mode: 'create_new' | 'sync_existing'
  const [mode, setMode] = useState<'create_new' | 'sync_existing'>(
    activeSpreadsheetId ? 'sync_existing' : 'create_new'
  );

  // Form states
  const [customTitle, setCustomTitle] = useState(
    `DF Pharmacy - Tax Invoices Ledger (${new Date().toLocaleDateString('en-GB')})`
  );
  const [existingSheetInput, setExistingSheetInput] = useState(activeSpreadsheetId);
  const [syncMode, setSyncMode] = useState<'overwrite' | 'append'>('overwrite');

  // Recent sheets from Drive
  const [recentSheets, setRecentSheets] = useState<GoogleSpreadsheetItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Execution states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [uploadResult, setUploadResult] = useState<GoogleSheetsSyncResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Update auth state on mount/open
  useEffect(() => {
    if (isOpen) {
      const user = getGoogleUser();
      setGoogleUser(user);
      const token = getAccessToken();
      setHasToken(Boolean(token));
      setAuthError(null);
      setUploadError(null);

      if (token) {
        loadRecentSheets(token);
      }
    }
  }, [isOpen]);

  const loadRecentSheets = async (token: string) => {
    setLoadingRecent(true);
    try {
      const sheets = await fetchRecentGoogleSheets(token);
      setRecentSheets(sheets);
    } catch (err) {
      console.warn('Recent sheets fetch failed:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user, accessToken } = await googleSignIn();
      setGoogleUser(user);
      setHasToken(true);
      loadRecentSheets(accessToken);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setHasToken(false);
      setUploadResult(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const handleStartUpload = async () => {
    const token = getAccessToken();
    if (!token) {
      setAuthError('Please sign in with your Google account first.');
      return;
    }

    if (invoices.length === 0) {
      setUploadError('No invoices found in ledger to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      let result: GoogleSheetsSyncResult;

      if (mode === 'create_new') {
        setUploadProgressMsg('Creating new Google Sheet in your Google Drive...');
        result = await createAndUploadTaxInvoicesSheet(token, invoices, customTitle);
      } else {
        const cleanId = extractSpreadsheetId(existingSheetInput);
        if (!cleanId) {
          throw new Error('Please provide a valid Google Spreadsheet URL or ID.');
        }
        setUploadProgressMsg(
          syncMode === 'overwrite'
            ? 'Updating columns and rows in existing spreadsheet...'
            : 'Appending rows to existing spreadsheet...'
        );
        result = await syncInvoicesToExistingSheet(token, cleanId, invoices, syncMode);
      }

      setUploadResult(result);
      if (onSpreadsheetLinked) {
        onSpreadsheetLinked(result.spreadsheetId, result.spreadsheetUrl, result.title);
      }
    } catch (err: any) {
      console.error('Upload to Google Sheets failed:', err);
      setUploadError(
        err.message ||
          'Failed to upload to Google Sheets. Check that your Google account has permission.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  const copySheetUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Upload to Google Sheets
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/30">
                  Google Drive &amp; Sheets API
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Google Sheet par invoice records aur Excel register upload karein
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Auth Section: If Not Authenticated or Token Expired */}
          {!hasToken ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6 text-teal-700" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-800">
                  Connect Google Account to Upload Sheets
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Apne Google Account se connect karein taaki DF Pharmacy ke invoices direct aapke
                  Google Sheets spreadsheet me upload aur synchronize ho sakein.
                </p>
              </div>

              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center space-x-2 text-left max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official Google Material Button */}
              <div className="flex justify-center pt-1">
                <button
                  id="google-sheets-signin-btn"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="gsi-material-button inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-300 shadow-sm transition disabled:opacity-60 cursor-pointer"
                >
                  <div className="gsi-material-button-icon mr-3">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-5 h-5 block"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Grants permission to create and manage spreadsheets in your Google Drive.
              </p>
            </div>
          ) : (
            /* Authenticated User Status Pill */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {googleUser?.displayName ? googleUser.displayName.charAt(0) : 'G'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <span>Connected with Google:</span>
                    <span className="text-emerald-700 font-semibold">{googleUser?.email}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Google Sheets &amp; Drive access active
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 text-xs font-medium self-start sm:self-auto px-2.5 py-1 rounded hover:bg-white/80 transition"
                title="Disconnect Google Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          {/* Success State if Upload just succeeded */}
          {uploadResult && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-5 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Successfully Uploaded to Google Sheets!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {uploadResult.rowCount} rows uploaded with all 10 standard columns formatted.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                  Live &amp; Synced
                </span>
              </div>

              <div className="bg-white border border-emerald-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-slate-500 font-medium">Spreadsheet Title: </span>
                  <strong className="text-slate-900 font-semibold">{uploadResult.title}</strong>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => copySheetUrl(uploadResult.spreadsheetUrl)}
                    className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium transition"
                  >
                    {copiedUrl ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={uploadResult.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded shadow-xs transition"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Upload Settings / Mode Selection */}
          {hasToken && (
            <div className="space-y-4">
              {/* Tabs: Create New vs Existing Sheet */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('create_new')}
                  className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
                    mode === 'create_new'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Google Sheet (नया Sheet बनाएं)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('sync_existing')}
                  className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
                    mode === 'sync_existing'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Update Existing Sheet (मौजूदा Sheet)</span>
                </button>
              </div>

              {/* Mode A: Create New Sheet */}
              {mode === 'create_new' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Spreadsheet Name / Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. DF Pharmacy - Tax Invoices Register"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Automatic Google Sheets Formatting Included:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-slate-500 text-[11px]">
                      <li>Frozen top header row with Pharma Teal theme &amp; bold headers</li>
                      <li>
                        10 standard columns: SR No., Department, Invoice No., Company Name, Invoice
                        Date, GST No., Invoice Amount, Purchase Category, Entry Date, Entered By
                      </li>
                      <li>Currency formatted amounts (₹) and center-aligned identifiers</li>
                      <li>Automatically saved inside your personal Google Drive</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Mode B: Sync into Existing Sheet */}
              {mode === 'sync_existing' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Sheet URL or Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={existingSheetInput}
                      onChange={(e) => setExistingSheetInput(e.target.value)}
                      placeholder="Paste link: https://docs.google.com/spreadsheets/d/.../edit"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Recent Sheets Selector if available */}
                  {recentSheets.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center space-x-1">
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Or select a recent spreadsheet from Google Drive:</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {recentSheets.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setExistingSheetInput(s.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition ${
                              existingSheetInput === s.id
                                ? 'bg-teal-100 text-teal-900 font-bold'
                                : 'hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="truncate max-w-[340px]">{s.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {s.modifiedTime ? new Date(s.modifiedTime).toLocaleDateString() : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sync Strategy Radio */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Upload Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`border rounded-lg p-2.5 cursor-pointer text-xs transition ${
                          syncMode === 'overwrite'
                            ? 'border-teal-600 bg-teal-50/70 text-teal-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="syncMode"
                          checked={syncMode === 'overwrite'}
                          onChange={() => setSyncMode('overwrite')}
                          className="mr-2"
                        />
                        Replace / Overwrite Table
                      </label>

                      <label
                        className={`border rounded-lg p-2.5 cursor-pointer text-xs transition ${
                          syncMode === 'append'
                            ? 'border-teal-600 bg-teal-50/70 text-teal-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="syncMode"
                          checked={syncMode === 'append'}
                          onChange={() => setSyncMode('append')}
                          className="mr-2"
                        />
                        Append as New Rows
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto Sync Toggle Option */}
              {onToggleAutoSync && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Auto-Upload on Invoice Scan &amp; Approval
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Jab bhi koi naya tax invoice scan ho, wo turant Google Sheet me upload ho jaye
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="font-bold">Upload Error: </strong>
                <span>{uploadError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Records to upload:{' '}
            <strong className="text-slate-800 font-semibold">{invoices.length} invoices</strong>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
            >
              Close
            </button>

            {hasToken && (
              <button
                id="execute-sheets-upload-btn"
                onClick={handleStartUpload}
                disabled={isUploading || invoices.length === 0}
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{uploadProgressMsg || 'Uploading to Google Sheets...'}</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Upload to Google Sheets (अपलोड करें)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
