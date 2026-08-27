import React, { useEffect, useState } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Receipt, CreditCard } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormField';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatMoney } from '../../utils/format';

export const InvoiceManagerPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentError, setPaymentError] = useState('');

  const token = localStorage.getItem('adminToken');

  const fetchInvoices = () => {
    setLoading(true);
    setLoadError(false);
    apiFetch('/crm/invoices', { token })
      .then((res) => {
        if (!res.success) {
          setLoadError(true);
          return;
        }
        setInvoices(res.data || []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaymentError('');

    apiFetch(`/crm/invoices/${selectedInvoice._id}/payments`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        amount: paymentAmount,
        paymentMode,
        transactionRef
      })
    })
      .then((res) => {
        if (res.success) {
          setSelectedInvoice(null);
          setPaymentAmount(0);
          setTransactionRef('');
          fetchInvoices();
        } else {
          setPaymentError(res.error || res.message || 'Failed to record payment.');
        }
      })
      .catch((err) => setPaymentError('Error recording payment: ' + err.message));
  };

  return (
    <div className="pb-4 space-y-8">
      <SEOHead title="Invoice & Payment Manager | Admin Dashboard" />

      {loading ? (
        <Spinner.Skeleton lines={4} />
      ) : loadError ? (
        <EmptyState
          icon={Receipt}
          title="Couldn't load invoices"
          description="Check your connection and try again."
          action={
            <button
              onClick={fetchInvoices}
              className="focus-ring px-4 py-2 rounded-operateMd bg-dark text-white text-xs font-bold hover:bg-dark/90"
            >
              Retry
            </button>
          }
          className="border-rose-200 bg-rose-50/40"
        />
      ) : invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="No tax invoices generated yet" description="Invoices created from client projects will appear here." />
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <Card key={inv._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-dark font-display text-lg">{inv.invoiceNumber}</span>
                  <Badge variant={inv.status === 'paid' ? 'lime' : inv.status === 'partially_paid' ? 'dark' : 'dark'}>
                    {inv.status}
                  </Badge>
                  <Badge variant="outline">{inv.type} invoice</Badge>
                </div>
                <p className="text-xs text-slateText">
                  Client: <strong className="text-dark">{inv.clientId?.companyName || 'Corporate Client'}</strong> • Due Date:{' '}
                  {new Date(inv.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slateText uppercase font-bold block">Total Amount (Inc. GST)</span>
                  <span className="font-display text-xl font-bold text-dark">{formatMoney(inv.totalAmount || 0, inv.clientId?.currency)}</span>
                  <span className="block text-[11px] text-rose-600 font-bold">Due: {formatMoney(inv.balanceDue || 0, inv.clientId?.currency)}</span>
                </div>

                {inv.balanceDue > 0 && (
                  <Button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setPaymentAmount(inv.balanceDue);
                    }}
                    className="gap-2 text-xs"
                  >
                    <CreditCard className="w-4 h-4" /> Record Payment
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => {
          setSelectedInvoice(null);
          setPaymentError('');
        }}
        title="Record Payment Transaction"
        subtitle={selectedInvoice ? `Invoice: ${selectedInvoice.invoiceNumber}` : undefined}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {paymentError && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-operateMd px-3 py-2">
              {paymentError}
            </p>
          )}
          <Input
            label={`Payment Amount (${selectedInvoice?.clientId?.currency || 'INR'})`}
            type="number"
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Payment Mode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="UPI">UPI / QR</option>
              <option value="NetBanking">NetBanking / NEFT</option>
              <option value="Wire">Wire Transfer</option>
              <option value="Cheque">Cheque</option>
            </Select>
            <Input
              label="Txn Ref / UTR #"
              required
              placeholder="e.g. UTR98237482"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark/10">
            <Button type="button" variant="ghost" onClick={() => setSelectedInvoice(null)}>
              Cancel
            </Button>
            <Button type="submit">Submit Payment Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
