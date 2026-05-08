import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ATTACHED_CSV_URL = 'https://media.base44.com/files/public/687ed6bea54c832b17eb40bc/22903f689_recipients_ace.csv';

function escapeCsv(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function parseCsv(text) {
    const rows = [];
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const fields = [];
        let cur = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const c = line[j];
            if (c === '"') {
                if (inQuotes && line[j + 1] === '"') { cur += '"'; j++; }
                else inQuotes = !inQuotes;
            } else if (c === ',' && !inQuotes) {
                fields.push(cur); cur = '';
            } else {
                cur += c;
            }
        }
        fields.push(cur);
        rows.push({ name: (fields[0] || '').trim(), email: (fields[1] || '').trim() });
    }
    return rows;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // 1. Fetch attached CSV
        const csvResp = await fetch(ATTACHED_CSV_URL);
        const csvText = await csvResp.text();
        const attachedRows = parseCsv(csvText);

        // 2. Fetch all SchoolACE users via service role (paginate)
        const allUsers = [];
        const PAGE = 500;
        let offset = 0;
        while (true) {
            const batch = await base44.asServiceRole.entities.User.list('-created_date', PAGE, offset);
            if (!batch || batch.length === 0) break;
            allUsers.push(...batch);
            if (batch.length < PAGE) break;
            offset += PAGE;
        }

        // 3. Merge with dedup by lowercased email
        const merged = new Map();

        for (const row of attachedRows) {
            if (!row.email) continue;
            const key = row.email.toLowerCase();
            if (!merged.has(key)) merged.set(key, { name: row.name, email: row.email });
            else if (!merged.get(key).name && row.name) merged.get(key).name = row.name;
        }

        for (const u of allUsers) {
            if (!u.email) continue;
            const key = u.email.toLowerCase();
            const name = u.full_name || '';
            if (!merged.has(key)) merged.set(key, { name, email: u.email });
            else if (!merged.get(key).name && name) merged.get(key).name = name;
        }

        // 4. Build CSV (sorted)
        const list = Array.from(merged.values()).sort((a, b) => {
            const an = (a.name || '').toLowerCase();
            const bn = (b.name || '').toLowerCase();
            if (an !== bn) return an < bn ? -1 : 1;
            return a.email.toLowerCase() < b.email.toLowerCase() ? -1 : 1;
        });

        const lines = ['name,email'];
        for (const r of list) lines.push(`${escapeCsv(r.name)},${escapeCsv(r.email)}`);
        const output = lines.join('\n');

        // 5. Upload to public storage
        const blob = new Blob([output], { type: 'text/csv' });
        const file = new File([blob], 'schoolace_recipients_unified.csv', { type: 'text/csv' });
        const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        return Response.json({
            file_url: uploaded.file_url,
            total_rows: list.length,
            attached_rows: attachedRows.length,
            schoolace_users: allUsers.length
        });
    } catch (error) {
        console.error('uploadUnifiedRecipients error:', error);
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});