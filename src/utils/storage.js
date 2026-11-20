import { EVENTS, CPB_BLOCKS, UNITS, DESIGNATIONS } from '../data/constants';

export const FIREBASE_DB_URL = 'https://donorlistt-default-rtdb.firebaseio.com';

export const getEventMeta = (eventKey = 'vlm') => {
  const evt = EVENTS[eventKey] || EVENTS.vlm;
  return {
    node: evt.firebaseNode || 'council_delegates',
    storageKey: evt.storageKey || 'ssf_velimukku_council_registrations_v2',
    passPrefix: evt.passPrefix || 'SSF-VLM-2026',
    eventConfig: evt
  };
};

// Clean up legacy keys
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

// Synchronous local storage read
export const getStoredRegistrations = (eventKey = 'vlm') => {
  const { storageKey } = getEventMeta(eventKey);
  try {
    const data = localStorage.getItem(storageKey);
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
export const fetchRegistrationsFromFirebase = async (eventKey = 'vlm') => {
  const { node, storageKey } = getEventMeta(eventKey);
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${node}.json`);
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
    localStorage.setItem(storageKey, JSON.stringify(sanitized));
    return sanitized;
  } catch (err) {
    console.warn(`Firebase sync offline for ${node}, returning cached data:`, err);
    return getStoredRegistrations(eventKey);
  }
};

// Determine next council number (e.g. SSF-CPB-2026-001 or SSF-VLM-2026-001)
const getNextCouncilNumber = (list, passPrefix) => {
  let maxNum = 0;
  const regex = new RegExp(`${passPrefix}-(\\d+)`);
  list.forEach(item => {
    if (item && item.id) {
      const match = item.id.match(regex);
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

// Save a new registration
export const saveRegistration = async (newDelegate, eventKey = 'vlm') => {
  const { node, storageKey, passPrefix, eventConfig } = getEventMeta(eventKey);
  const current = getStoredRegistrations(eventKey);
  
  const nextNum = getNextCouncilNumber(current, passPrefix);
  const id = `${passPrefix}-${String(nextNum).padStart(3, '0')}`;
  
  const delegateWithMeta = {
    id,
    name: newDelegate.name.trim(),
    mobile: newDelegate.mobile.trim(),
    registeredAt: new Date().toISOString(),
    event: eventKey
  };

  if (eventConfig.hasBlocks) {
    delegateWithMeta.block = newDelegate.block || 'Block Qadisiyya';
  }
  if (eventConfig.hasUnits) {
    delegateWithMeta.unit = newDelegate.unit;
  }
  if (eventConfig.hasDesignation) {
    delegateWithMeta.designation = newDelegate.designation;
  }
  
  // Update local cache immediately
  const updated = [delegateWithMeta, ...current.filter(d => d.id !== id)];
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // Sync to Firebase Realtime Database
  try {
    await fetch(`${FIREBASE_DB_URL}/${node}/${id}.json`, {
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
export const updateRegistration = async (id, updatedFields, eventKey = 'vlm') => {
  const { node, storageKey } = getEventMeta(eventKey);
  const current = getStoredRegistrations(eventKey);
  const cleanUpdates = sanitizeDelegate(updatedFields) || {};

  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, ...cleanUpdates };
    }
    return item;
  });
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // Sync to Firebase
  try {
    await fetch(`${FIREBASE_DB_URL}/${node}/${id}.json`, {
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
export const deleteRegistration = async (id, eventKey = 'vlm') => {
  const { node, storageKey } = getEventMeta(eventKey);
  const current = getStoredRegistrations(eventKey);
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // Sync to Firebase
  try {
    await fetch(`${FIREBASE_DB_URL}/${node}/${id}.json`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete from Firebase:', err);
  }

  return updated;
};

// Realtime subscription (SSE + Polling fallback)
export const subscribeToRegistrations = (callback, eventKey = 'vlm') => {
  const { node } = getEventMeta(eventKey);
  let isSubscribed = true;
  let eventSource = null;
  let pollInterval = null;

  // Immediate fetch on subscribe
  fetchRegistrationsFromFirebase(eventKey).then(data => {
    if (isSubscribed) callback(data);
  });

  // Try Firebase SSE for instantaneous updates
  try {
    if (typeof window !== 'undefined' && window.EventSource) {
      eventSource = new EventSource(`${FIREBASE_DB_URL}/${node}.json`);
      eventSource.addEventListener('put', async () => {
        const data = await fetchRegistrationsFromFirebase(eventKey);
        if (isSubscribed) callback(data);
      });
      eventSource.addEventListener('patch', async () => {
        const data = await fetchRegistrationsFromFirebase(eventKey);
        if (isSubscribed) callback(data);
      });
    }
  } catch (e) {
    // SSE fallback
  }

  // Polling fallback every 10 seconds
  pollInterval = setInterval(async () => {
    if (isSubscribed) {
      const data = await fetchRegistrationsFromFirebase(eventKey);
      callback(data);
    }
  }, 10000);

  return () => {
    isSubscribed = false;
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  };
};

export const resetToDefaultData = (eventKey = 'vlm') => {
  const { storageKey } = getEventMeta(eventKey);
  localStorage.setItem(storageKey, JSON.stringify([]));
  return [];
};

export const clearAllData = async (eventKey = 'vlm') => {
  const { node, storageKey } = getEventMeta(eventKey);
  localStorage.setItem(storageKey, JSON.stringify([]));
  try {
    await fetch(`${FIREBASE_DB_URL}/${node}.json`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to clear Firebase data:', err);
  }
  return [];
};

// Export to PDF formatted report with print trigger
export const exportToPDF = (registrations, stats = [], eventKey = 'vlm') => {
  if (!registrations || !registrations.length) {
    alert('No registrations available to export.');
    return;
  }

  const { eventConfig } = getEventMeta(eventKey);
  const isCpb = eventConfig.hasBlocks;

  const totalRegistered = registrations.length;
  const exportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const exportTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const accentColorHex = isCpb ? '#059669' : '#0284c7'; // Emerald vs Cyan/Sky

  let breakdownHtml = '';
  let delegateRows = '';

  if (isCpb) {
    // CPB Block Breakdown
    const blockRows = CPB_BLOCKS.map((b, idx) => {
      const count = registrations.filter(r => r.block === b.name || r.block === b.id).length;
      const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
      return `
        <tr>
          <td style="text-align:center;font-weight:600;color:#64748b;">#${idx + 1}</td>
          <td style="font-weight:700;color:#0f172a;">
            ${b.name} <span style="font-weight:normal;color:#059669;font-size:11px;">(${b.subtext})</span>
          </td>
          <td style="text-align:center;font-weight:bold;color:${count > 0 ? accentColorHex : '#94a3b8'};">${count}</td>
          <td style="text-align:right;color:#64748b;font-size:12px;">${pct}%</td>
        </tr>
      `;
    }).join('');

    breakdownHtml = `
      <div class="section-title" style="border-left-color:${accentColorHex};">Block-Wise Registration Breakdown</div>
      <table class="unit-table">
        <thead>
          <tr>
            <th style="width:40px;text-align:center;">#</th>
            <th>Block Name</th>
            <th style="width:100px;text-align:center;">Registered</th>
            <th style="width:80px;text-align:right;">Share</th>
          </tr>
        </thead>
        <tbody>
          ${blockRows}
        </tbody>
      </table>
    `;

    delegateRows = registrations.map((item, index) => `
      <tr>
        <td style="text-align:center;font-weight:600;color:#64748b;">${index + 1}</td>
        <td style="font-family:monospace;font-weight:bold;color:${accentColorHex};">${item.id}</td>
        <td style="font-weight:700;color:#0f172a;">${item.name}</td>
        <td style="font-family:monospace;color:#334155;">+91 ${item.mobile}</td>
        <td>
          <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;">
            ${item.block || 'Block Qadisiyya'}
          </span>
        </td>
      </tr>
    `).join('');

  } else {
    // VLM Unit breakdown
    const unitsMap = {};
    if (stats && stats.length > 0) {
      stats.forEach(u => {
        unitsMap[u.name] = u.count || 0;
      });
    } else {
      registrations.forEach(r => {
        unitsMap[r.unit] = (unitsMap[r.unit] || 0) + 1;
      });
    }

    const unitRows = Object.entries(unitsMap).map(([unitName, count], idx) => {
      const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
      return `
        <tr>
          <td style="text-align:center;font-weight:600;color:#64748b;">#${idx + 1}</td>
          <td style="font-weight:600;color:#0f172a;">${unitName}</td>
          <td style="text-align:center;font-weight:bold;color:${count > 0 ? accentColorHex : '#94a3b8'};">${count}</td>
          <td style="text-align:right;color:#64748b;font-size:12px;">${pct}%</td>
        </tr>
      `;
    }).join('');

    breakdownHtml = `
      <div class="section-title" style="border-left-color:${accentColorHex};">Unit-Wise Registration Breakdown</div>
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
    `;

    delegateRows = registrations.map((item, index) => `
      <tr>
        <td style="text-align:center;font-weight:600;color:#64748b;">${index + 1}</td>
        <td style="font-family:monospace;font-weight:bold;color:${accentColorHex};">${item.id}</td>
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
  }

  const tableHeaderCols = isCpb ? `
    <th style="width:30px;text-align:center;">#</th>
    <th style="width:140px;">Council ID</th>
    <th>Name</th>
    <th style="width:130px;">Mobile</th>
    <th style="width:120px;">Block</th>
  ` : `
    <th style="width:30px;text-align:center;">#</th>
    <th style="width:115px;">Council ID</th>
    <th>Name</th>
    <th style="width:105px;">Mobile</th>
    <th style="width:130px;">Unit</th>
    <th style="width:120px;">Designation</th>
  `;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${eventConfig.organization} - Delegate Directory</title>
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
      background: ${accentColorHex};
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .no-print button {
      background: #ffffff;
      color: ${accentColorHex};
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
    }
    .no-print button:hover {
      background: #f0fdf4;
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
      border-bottom: 2px solid ${accentColorHex};
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
      color: ${accentColorHex};
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
      background: #f0fdf4;
      color: ${accentColorHex};
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(${isCpb ? 3 : 4}, 1fr);
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
      color: ${accentColorHex};
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
      border-left: 3px solid ${accentColorHex};
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
      <strong>📄 ${eventConfig.organization} - Students Council 2026</strong>
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
        <h1>${eventConfig.organization.toUpperCase()}</h1>
        <h2>Students Council 2026 • Official Directory</h2>
        <p>${eventConfig.day}, ${eventConfig.date} ${eventConfig.time ? `• ${eventConfig.time}` : ''} • Venue: ${eventConfig.venue}</p>
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
      ${isCpb ? `
        <div class="stat-card">
          <div class="num">3 Blocks</div>
          <div class="lbl">Block A • B • C</div>
        </div>
      ` : `
        <div class="stat-card">
          <div class="num">${stats.filter(u => u.count > 0).length} / 10</div>
          <div class="lbl">Units Represented</div>
        </div>
      `}
      <div class="stat-card">
        <div class="num">100%</div>
        <div class="lbl">Verified Status</div>
      </div>
    </div>

    ${breakdownHtml}

    <div class="section-title" style="border-left-color:${accentColorHex};">Delegate Directory (${totalRegistered} Delegates)</div>
    <table>
      <thead>
        <tr>
          ${tableHeaderCols}
        </tr>
      </thead>
      <tbody>
        ${delegateRows}
      </tbody>
    </table>

    <div class="footer">
      <div>${eventConfig.organization} • ${eventConfig.office}</div>
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

// Export to CSV
export const exportToCSV = (data, eventKey = 'vlm') => {
  if (!data || !data.length) return;
  const { eventConfig } = getEventMeta(eventKey);
  const isCpb = eventConfig.hasBlocks;

  let headers = [];
  let rows = [];

  if (isCpb) {
    headers = ['Delegate ID', 'Name', 'Mobile Number', 'Block', 'Registration Date'];
    rows = data.map(item => [
      `"${item.id}"`,
      `"${item.name}"`,
      `"${item.mobile}"`,
      `"${item.block || 'Block A'}"`,
      `"${new Date(item.registeredAt).toLocaleString()}"`
    ]);
  } else {
    headers = ['Delegate ID', 'Name', 'Mobile Number', 'Unit', 'Designation', 'Registration Date'];
    rows = data.map(item => [
      `"${item.id}"`,
      `"${item.name}"`,
      `"${item.mobile}"`,
      `"${item.unit}"`,
      `"${item.designation}"`,
      `"${new Date(item.registeredAt).toLocaleString()}"`
    ]);
  }

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${isCpb ? 'SSF_CPB' : 'SSF_VLM'}_Council_Delegates_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
