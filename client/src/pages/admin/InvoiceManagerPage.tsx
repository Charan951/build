import React, { useEffect, useState } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Receipt, DollarSign, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const InvoiceManagerPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  const token = localStorage.getItem('adminToken');

  const fetchInvoices = () => {
    setLoading(true);
    apiFetch('/crm/invoices', { token })
      .then((res) => {
        if (res.success) setInvoices(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

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
        }
      })
      .catch((err) => alert('Error recording payment: ' + err.message));
  };

  return (
    <div className="pb-4 space-y-8">
      <SEOHead title="Invoice & Payment Manager | Admin Dashboard" />

      {loading ? (
        <div className="text-center py-12 text-slateText text-sm">Loading tax invoices...</div>
      ) : invoices.length === 0 ? (
        <Card className="p-12 text-center text-slateText text-sm">No tax invoices generated yet.</Card>
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
                  <span className="font-display text-xl font-bold text-dark">₹{inv.totalAmount?.toLocaleString('en-IN')}</span>
                  <span className="block text-[11px] text-rose-600 font-bold">Due: ₹{inv.balanceDue?.toLocaleString('en-IN')}</span>
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
      {selectedInvoice && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card p-8 max-w-md w-full space-y-6 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-dark">Record Payment Transaction</h2>
            <p className="text-xs text-slateText">Invoice: {selectedInvoice.invoiceNumber}</p>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm font-bold text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  >
                    <option value="UPI">UPI / QR</option>
                    <option value="NetBanking">NetBanking / NEFT</option>
                    <option value="Wire">Wire Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark mb-1">Txn Ref / UTR #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR98237482"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark/10">
                <Button type="button" variant="ghost" onClick={() => setSelectedInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Payment Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
