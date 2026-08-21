/** Shared currency options for CRM billing forms — previously duplicated
 * verbatim between ClientDetailPage.tsx and ManageClientsPage.tsx. */
export const CURRENCY_OPTIONS = [
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
];

const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AUD: 'en-AU',
};

/** Formats a money amount in the given client's actual currency instead of
 * hardcoding ₹ — the invoice/client forms collect a per-client `currency`
 * field, but several admin screens previously ignored it and always
 * rendered rupees regardless of what the client was billed in. */
export const formatMoney = (amount: number, currencyCode = 'INR'): string => {
  const code = CURRENCY_OPTIONS.some((c) => c.code === currencyCode) ? currencyCode : 'INR';
  return new Intl.NumberFormat(CURRENCY_LOCALE[code] || 'en-IN', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/** Relative "time ago" formatter — previously duplicated (with slightly
 * different wording) between ClientDetailPage.tsx and ManageClientsPage.tsx. */
export const timeAgo = (dateStr?: string): string => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};
