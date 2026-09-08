import { InvoiceRecord } from '../types';

export const SHEET_HEADERS = [
  'SR No',
  'Department',
  'Invoice No',
  'Company Name',
  'Invoice Date',
  'GST No',
  'Invoice Amount',
  'Purchase Category',
  'Entry Date',
];

export interface GoogleSpreadsheetItem {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface GoogleSheetsSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowCount: number;
  updatedRange?: string;
}

// Convert InvoiceRecord to array of cell values matching user columns
export const invoiceToSheetRow = (inv: InvoiceRecord): (string | number)[] => {
  return [
    inv.sr_no,
    inv.department,
    inv.invoice_no,
    inv.company_name,
    inv.invoice_date,
    inv.gst_no,
    Number(inv.invoice_amount) || 0,
    inv.purchase_category,
    inv.entry_date,
  ];
};

// Extract spreadsheet ID from either full Google Sheets URL or bare ID
export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
};

/**
 * Creates a brand new Google Sheet in the authenticated user's Google Drive,
 * sets up the 'Tax Invoices' sheet tab, freezes the header, styles headers in teal,
 * and writes all invoice rows into it.
 */
export const createAndUploadTaxInvoicesSheet = async (
  token: string,
  invoices: InvoiceRecord[],
  customTitle?: string
): Promise<GoogleSheetsSyncResult> => {
  const today = new Date().toISOString().slice(0, 10);
  const title = customTitle?.trim() || `DF Pharmacy - Tax Invoices Register (${today})`;

  // Step 1: Create Spreadsheet with 'Tax Invoices' sheet tab
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Tax Invoices',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `Failed to create Google Sheet (Status ${createRes.status})`
    );
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetTabId = sheetData.sheets?.[0]?.properties?.sheetId || 0;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step 2: Insert Headers and Data Rows
  const rows = [SHEET_HEADERS, ...invoices.map(invoiceToSheetRow)];

  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tax%20Invoices!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Tax Invoices!A1',
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!valuesRes.ok) {
    const valErr = await valuesRes.json().catch(() => ({}));
    throw new Error(valErr?.error?.message || 'Failed to upload rows to Google Sheet.');
  }

  // Step 3: Format Header and Columns with batchUpdate
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Header styling: Background #0f766e (Pharma Deep Teal), bold white text
          {
            repeatCell: {
              range: {
                sheetId: sheetTabId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 10,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.058,
                    green: 0.462,
                    blue: 0.431,
                  },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
            },
          },
          // Currency format for Invoice Amount (Column G, index 6)
          {
            repeatCell: {
              range: {
                sheetId: sheetTabId,
                startRowIndex: 1,
                endRowIndex: rows.length,
                startColumnIndex: 6,
                endColumnIndex: 7,
              },
              cell: {
                userEnteredFormat: {
                  numberFormat: {
                    type: 'CURRENCY',
                    pattern: '₹#,##0.00',
                  },
                  horizontalAlignment: 'RIGHT',
                },
              },
              fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
            },
          },
          // Center align SR No, Department, Dates, GST
          {
            repeatCell: {
              range: {
                sheetId: sheetTabId,
                startRowIndex: 1,
                endRowIndex: rows.length,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(horizontalAlignment)',
            },
          },
          // Auto resize all 10 columns for optimal fit
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetTabId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 10,
              },
            },
          },
        ],
      }),
    });
  } catch (formatErr) {
    console.warn('Batch format update skipped or had non-critical issue:', formatErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    rowCount: invoices.length,
  };
};

/**
 * Appends or Overwrites records into an existing Google Sheet.
 */
export const syncInvoicesToExistingSheet = async (
  token: string,
  spreadsheetIdOrUrl: string,
  invoices: InvoiceRecord[],
  mode: 'overwrite' | 'append' = 'overwrite'
): Promise<GoogleSheetsSyncResult> => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  if (!spreadsheetId) {
    throw new Error('Please enter a valid Google Spreadsheet ID or URL.');
  }

  // Fetch spreadsheet metadata to determine title and sheets
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties(sheetId,title)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ||
        `Unable to access Google Sheet (${metaRes.status}). Please check permissions or Spreadsheet ID.`
    );
  }

  const metaData = await metaRes.json();
  const title = metaData.properties?.title || 'Tax Invoices Spreadsheet';
  const sheets = metaData.sheets || [];

  // Determine target sheet tab: Look for "Tax Invoices" or use first sheet
  const taxSheet = sheets.find((s: any) => s.properties?.title === 'Tax Invoices');
  const targetSheetTitle = taxSheet ? 'Tax Invoices' : sheets[0]?.properties?.title || 'Sheet1';

  let updatedRange = '';

  if (mode === 'overwrite') {
    const rows = [SHEET_HEADERS, ...invoices.map(invoiceToSheetRow)];
    const putRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        targetSheetTitle
      )}!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `${targetSheetTitle}!A1`,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!putRes.ok) {
      const pErr = await putRes.json().catch(() => ({}));
      throw new Error(pErr?.error?.message || 'Failed to update Google Sheet rows.');
    }

    const pData = await putRes.json();
    updatedRange = pData.updatedRange;
  } else {
    // Mode: Append rows
    const rowsToAppend = invoices.map(invoiceToSheetRow);
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        targetSheetTitle
      )}!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rowsToAppend,
        }),
      }
    );

    if (!appendRes.ok) {
      const aErr = await appendRes.json().catch(() => ({}));
      throw new Error(aErr?.error?.message || 'Failed to append rows to Google Sheet.');
    }

    const aData = await appendRes.json();
    updatedRange = aData.updates?.updatedRange || `${targetSheetTitle}!A1:J`;
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title,
    rowCount: invoices.length,
    updatedRange,
  };
};

/**
 * Appends a single newly scanned & approved invoice to an existing Google Sheet.
 */
export const appendSingleInvoiceToSheet = async (
  token: string,
  spreadsheetIdOrUrl: string,
  invoice: InvoiceRecord
): Promise<void> => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  if (!spreadsheetId) return;

  const row = invoiceToSheetRow(invoice);

  // Try appending to Tax Invoices or default sheet
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
};

/**
 * Lists user's recent Google Sheets from Google Drive (accessible via drive.file scope)
 */
export const fetchRecentGoogleSheets = async (token: string): Promise<GoogleSpreadsheetItem[]> => {
  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,webViewLink,modifiedTime)",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.warn('Could not fetch recent sheets from Drive:', err);
    return [];
  }
};
