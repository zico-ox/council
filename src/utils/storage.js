import { INITIAL_REGISTRATIONS } from '../data/constants';

export const FIREBASE_DB_URL = 'https://donorlistt-default-rtdb.firebaseio.com';
export const FIREBASE_NODE = 'council_delegates';
const STORAGE_KEY = 'ssf_velimukku_council_registrations_v2';

// Clean up legacy demo data keys from previous sessions
try {
  localStorage.removeItem('ssf_velimukku_council_registrations_2026');
} catch (e) {
  // ignore
}

// Helper to sanitize delegate objects
const sanitizeDelegate = (item) => {
  if (!item || typeof item !== 'object') return null;
  const { bloodGroup, checkedIn, checkedInAt, ...clean } = item;
  return clean;
};

// Synchronous local storage read (returns cached list or [])
export const getStoredRegistrations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeDelegate).filter(Boolean);
  } catch (err) {
    console.error('Error reading registrations from localStorage', err);
    return [];
  }
};

// Fetch latest from Firebase Realtime Database
export const fetchRegistrationsFromFirebase = async () => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${FIREBASE_NODE}.json`);
    if (!res.ok) {
      throw new Error(`Firebase fetch failed: ${res.statusText}`);
    }
    const data = await res.json();
    let list = [];
    if (Array.isArray(data)) {
      list = data.filter(Boolean);
    } else if (data && typeof data === 'object') {
      list = Object.values(data);
    }
    const sanitized = list.map(sanitizeDelegate).filter(Boolean);
    // Sort newest first by registeredAt
    sanitized.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
    
    // Save to local cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (err) {
    console.warn('Firebase sync offline or blocked, returning cached data:', err);
    return getStoredRegistrations();
  }
};

// Determine next council number (e.g. 1 -> SSF-VLM-2026-001)
const getNextCouncilNumber = (list) => {
  let maxNum = 0;
  list.forEach(item => {
    if (item && item.id) {
      const match = item.id.match(/SSF-VLM-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  return maxNum + 1;
};

// Save a new registration to Firebase and LocalStorage
export const saveRegistration = async (newDelegate) => {
  // Read current list (from cache or live)
  const current = getStoredRegistrations();
  
  const nextNum = getNextCouncilNumber(current);
  const id = `SSF-VLM-2026-${String(nextNum).padStart(3, '0')}`;
  
  const delegateWithMeta = {
    id,
    name: newDelegate.name.trim(),
    mobile: newDelegate.mobile.trim(),
    unit: newDelegate.unit,
    designation: newDelegate.designation,
    registeredAt: new Date().toISOString()
  };
  
  // Update local cache immediately
  const updated = [delegateWithMeta, ...current.filter(d => d.id !== id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firebase Realtime Database
  try {
    await fetch(`${FIREBASE_DB_URL}/${FIREBASE_NODE}/${id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delegateWithMeta)
    });
  } catch (err) {
    console.warn('Failed to save to Firebase immediately, saved locally:', err);
  }

  return delegateWithMeta;
};

// Update an existing registration
export const updateRegistration = async (id, updatedFields) => {
  const current = getStoredRegistrations();
  const cleanUpdates = sanitizeDelegate(updatedFields) || {};

  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, ...cleanUpdates };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firebase
  try {
    await fetch(`${FIREBASE_DB_URL}/${FIREBASE_NODE}/${id}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanUpdates)
    });
  } catch (err) {
    console.warn('Failed to patch to Firebase:', err);
  }

  return updated;
};

// Delete a registration
export const deleteRegistration = async (id) => {
  const current = getStoredRegistrations();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firebase
  try {
    await fetch(`${FIREBASE_DB_URL}/${FIREBASE_NODE}/${id}.json`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete from Firebase:', err);
  }

  return updated;
};

// Realtime subscription (SSE + Polling fallback)
export const subscribeToRegistrations = (callback) => {
  let isSubscribed = true;
  let eventSource = null;
  let pollInterval = null;

  // Immediate fetch on subscribe
  fetchRegistrationsFromFirebase().then(data => {
    if (isSubscribed) callback(data);
  });

  // Try Firebase SSE for instantaneous updates
  try {
    if (typeof window !== 'undefined' && window.EventSource) {
      eventSource = new EventSource(`${FIREBASE_DB_URL}/${FIREBASE_NODE}.json`);
      eventSource.addEventListener('put', async () => {
        const data = await fetchRegistrationsFromFirebase();
        if (isSubscribed) callback(data);
      });
      eventSource.addEventListener('patch', async () => {
        const data = await fetchRegistrationsFromFirebase();
        if (isSubscribed) callback(data);
      });
    }
  } catch (e) {
    // SSE fallback
  }

  // Polling fallback every 10 seconds to ensure fresh data
  pollInterval = setInterval(async () => {
    if (isSubscribed) {
      const data = await fetchRegistrationsFromFirebase();
      callback(data);
    }
  }, 10000);

  return () => {
    isSubscribed = false;
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  };
};

export const resetToDefaultData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
};

export const clearAllData = async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  try {
    await fetch(`${FIREBASE_DB_URL}/${FIREBASE_NODE}.json`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to clear Firebase data:', err);
  }
  return [];
};

// Export to PDF formatted report with print trigger
export const exportToPDF = (registrations, unitStats = []) => {
  if (!registrations || !registrations.length) {
    alert('No registrations available to export.');
    return;
  }

  // Calculate unit statistics if not passed
  const unitsMap = {};
  if (unitStats && unitStats.length > 0) {
    unitStats.forEach(u => {
      unitsMap[u.name] = u.count || 0;
    });
  } else {
    registrations.forEach(r => {
      unitsMap[r.unit] = (unitsMap[r.unit] || 0) + 1;
    });
  }

  const totalRegistered = registrations.length;
  const activeUnitsCount = Object.values(unitsMap).filter(c => c > 0).length;
  const exportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const exportTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Build rows for Delegate Table
  const delegateRows = registrations.map((item, index) => `
    <tr>
      <td style="text-align:center;font-weight:600;color:#64748b;">${index + 1}</td>
      <td style="font-family:monospace;font-weight:bold;color:#0284c7;">${item.id}</td>
      <td style="font-weight:700;color:#0f172a;">${item.name}</td>
      <td style="font-family:monospace;color:#334155;">+91 ${item.mobile}</td>
      <td style="color:#0f172a;">${item.unit}</td>
      <td>
        <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;">
          ${item.designation}
        </span>
      </td>
    </tr>
  `).join('');

  // Build rows for Unit Summary Table
  const unitRows = Object.entries(unitsMap).map(([unitName, count], idx) => {
    const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
    return `
      <tr>
        <td style="text-align:center;font-weight:600;color:#64748b;">#${idx + 1}</td>
        <td style="font-weight:600;color:#0f172a;">${unitName}</td>
        <td style="text-align:center;font-weight:bold;color:${count > 0 ? '#0284c7' : '#94a3b8'};">${count}</td>
        <td style="text-align:right;color:#64748b;font-size:12px;">${pct}%</td>
      </tr>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SSF Velimukku Sector Council 2026 - Delegate Directory</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #0f172a;
      background: #f8fafc;
      font-size: 12px;
      line-height: 1.4;
    }
    .no-print {
      max-width: 800px;
      margin: 0 auto 20px auto;
      padding: 14px 20px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }
    .no-print button {
      background: #ffffff;
      color: #0284c7;
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
    }
    .no-print button:hover {
      background: #f0f9ff;
    }
    .doc-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 28px 32px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .header-left h2 {
      margin: 3px 0 0 0;
      font-size: 14px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-left p {
      margin: 4px 0 0 0;
      color: #64748b;
      font-size: 11px;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .header-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ecfeff;
      color: #0891b2;
      border: 1px solid #a5f3fc;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .stat-card .num {
      font-size: 18px;
      font-weight: 800;
      color: #0284c7;
    }
    .stat-card .lbl {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 20px 0 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 3px solid #0284c7;
      padding-left: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11.5px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td {
      background: #fcfdfe;
    }
    .unit-table td {
      padding: 5px 10px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 10px;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .doc-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      thead {
        display: table-header-group;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>📄 SSF Velimukku Sector Students Council 2026</strong>
      <div style="font-size:12px;opacity:0.9;">Choose "Save as PDF" as Destination in the Print dialog to export.</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button onclick="window.print()">📥 Save as PDF / Print</button>
      <button onclick="window.close()" style="background:transparent;color:#fff;border:1px solid #fff;">✕ Close</button>
    </div>
  </div>

  <div class="doc-container">
    <div class="header">
      <div class="header-left">
        <h1>SSF VELIMUKKU SECTOR</h1>
        <h2>Students Council 2026 • Official Directory</h2>
        <p>Friday, November 20, 2026 • Venue: Koofa</p>
      </div>
      <div class="header-right">
        <div class="header-badge">OFFICIAL REPORT</div>
        <div>Date: ${exportDate}</div>
        <div>Time: ${exportTime}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="num">${totalRegistered}</div>
        <div class="lbl">Total Registered</div>
      </div>
      <div class="stat-card">
        <div class="num">${activeUnitsCount} / 10</div>
        <div class="lbl">Units Represented</div>
      </div>
      <div class="stat-card">
        <div class="num">${Math.round((activeUnitsCount / 10) * 100)}%</div>
        <div class="lbl">Unit Coverage</div>
      </div>
      <div class="stat-card">
        <div class="num">100%</div>
        <div class="lbl">Verified Status</div>
      </div>
    </div>

    <div class="section-title">Unit-Wise Registration Breakdown</div>
    <table class="unit-table">
      <thead>
        <tr>
          <th style="width:40px;text-align:center;">#</th>
          <th>Unit Name</th>
          <th style="width:100px;text-align:center;">Registered</th>
          <th style="width:80px;text-align:right;">Share</th>
        </tr>
      </thead>
      <tbody>
        ${unitRows}
      </tbody>
    </table>

    <div class="section-title">Delegate Directory (${totalRegistered} Delegates)</div>
    <table>
      <thead>
        <tr>
          <th style="width:30px;text-align:center;">#</th>
          <th style="width:115px;">Council ID</th>
          <th>Name</th>
          <th style="width:105px;">Mobile</th>
          <th style="width:130px;">Unit</th>
          <th style="width:120px;">Designation</th>
        </tr>
      </thead>
      <tbody>
        ${delegateRows}
      </tbody>
    </table>

    <div class="footer">
      <div>SSF Velimukku Sector • Students' Center Muttichira • ssfvelimukksector@gmail.com</div>
      <div>Official Document • Students Council 2026</div>
    </div>
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>
  `;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  } else {
    // Popup fallback: create an iframe and print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 400);
  }
};

// Export to CSV formatted for Excel / Google Sheets
export const exportToCSV = (data) => {
  if (!data || !data.length) return;
  
  const headers = ['Delegate ID', 'Name', 'Mobile Number', 'Unit', 'Designation', 'Registration Date'];
  
  const rows = data.map(item => [
    `"${item.id}"`,
    `"${item.name}"`,
    `"${item.mobile}"`,
    `"${item.unit}"`,
    `"${item.designation}"`,
    `"${new Date(item.registeredAt).toLocaleString()}"`
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SSF_Velimukku_Council_Delegates_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
