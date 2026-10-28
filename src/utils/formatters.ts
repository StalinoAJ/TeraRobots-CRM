import { CrmRecord } from '../types/crm';

/**
 * Ensures an external URL has a protocol (https://) so it navigates
 * externally instead of resolving as a relative path within the app.
 */
export function formatExternalUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Safely opens an external link in the user's default browser.
 */
export function openExternalUrl(url: string, event?: React.MouseEvent) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const target = formatExternalUrl(url);
  if (!target) return;
  window.open(target, '_blank', 'noopener,noreferrer');
}

/**
 * Formats a number to Indian Rupee format with ₹ symbol (e.g., ₹45,00,000).
 */
export function formatInr(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Provides an Indian word denomination breakdown for financial values (e.g. 45 Lakhs, 1.50 Cr).
 */
export function formatIndianDenomination(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  if (num === 0) return '0 INR';

  const abs = Math.abs(num);
  if (abs >= 10000000) {
    return `${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Crore INR`;
  }
  if (abs >= 100000) {
    return `${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh INR`;
  }
  if (abs >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k INR`;
  }
  return `${num} INR`;
}

/**
 * Human-friendly date formatting (e.g. "Oct 28, 2026")
 */
export function formatHumanDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Resolves a human-friendly label for any CRM record
 */
export function getRecordDisplayName(record?: CrmRecord | null): string {
  if (!record) return 'Unknown Record';
  const v = record.values;
  if (v.name) return String(v.name);
  if (v.title) return String(v.title);
  const fullName = `${v.firstName || ''} ${v.lastName || ''}`.trim();
  if (fullName) return fullName;
  if (v.subject) return String(v.subject);
  return record.id;
}

/**
 * Resolves secondary context line for a record (e.g. company, email, or stage)
 */
export function getRecordSubtext(record?: CrmRecord | null, allRecords: CrmRecord[] = []): string {
  if (!record) return '';
  const v = record.values;
  if (v.jobTitle && v.companyId) {
    const comp = allRecords.find((r) => r.id === v.companyId);
    return `${v.jobTitle} • ${comp ? comp.values.name : v.companyId}`;
  }
  if (v.jobTitle) return String(v.jobTitle);
  if (v.domain) return String(v.domain);
  if (v.email) return String(v.email);
  if (v.stage) return `Stage: ${v.stage}`;
  if (v.amount) return formatInr(v.amount);
  if (v.status) return `Status: ${v.status}`;
  return record.objectId.toUpperCase();
}
