import React, { useState, useEffect } from 'react';
import { feesApi, InvoiceRecord } from '@/features/fees/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/app/providers/AuthProvider';
import { MockBanner } from '@/components/ui/MockBanner';
import {
  CreditCard,
  Download,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  RotateCcw,
} from 'lucide-react';

export const FeesPage: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'CARD'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Refund Modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const [pendingTxAlert, setPendingTxAlert] = useState<{ txId: string; status: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadFees = async () => {
      try {
        const data = await feesApi.getStudentFees();
        if (isMounted) setInvoices(data);

        // Check for pending transaction ID in localStorage (never trust URL params!)
        const savedTxId = localStorage.getItem('cms_pending_payment_tx');
        if (savedTxId) {
          const verifyRes = await feesApi.verifyPaymentStatus(savedTxId);
          if (isMounted) {
            if (verifyRes.status === 'SUCCESS') {
              localStorage.removeItem('cms_pending_payment_tx');
              setPaymentSuccess(`Verified payment complete! Ref ID: ${savedTxId}`);
            } else if (verifyRes.status === 'FAILED') {
              localStorage.removeItem('cms_pending_payment_tx');
              setPaymentError(`Payment transaction ${savedTxId} failed.`);
            } else {
              setPendingTxAlert({ txId: savedTxId, status: verifyRes.status });
            }
          }
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFees();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (confirmName.trim().toLowerCase() !== (user?.fullName || '').trim().toLowerCase()) {
      setPaymentError(`Name confirmation mismatch. Please type exact full name: "${user?.fullName}"`);
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // Single-flight payment initiation
      const res = await feesApi.initiatePayment({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.dueAmount,
        paymentMethod,
        studentId: user?.id,
      });

      // Store only the transaction ID
      if (res.transactionId) {
        localStorage.setItem('cms_pending_payment_tx', res.transactionId);
      }

      // Always re-read payment status from backend
      const verifyRes = await feesApi.verifyPaymentStatus(res.transactionId || 'tx_demo');

      if (verifyRes.status === 'SUCCESS') {
        localStorage.removeItem('cms_pending_payment_tx');
        setPaymentSuccess(`Payment authorized and verified! Ref ID: ${res.transactionId || 'TXN_' + Date.now()}`);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === selectedInvoice.id
              ? { ...inv, status: 'PAID', dueAmount: 0, paidAmount: inv.totalAmount }
              : inv
          )
        );
        setTimeout(() => {
          setSelectedInvoice(null);
          setPaymentSuccess(null);
        }, 1500);
      } else {
        setPendingTxAlert({ txId: res.transactionId, status: verifyRes.status });
      }
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingRefund(true);
      await feesApi.requestRefund({
        reason: refundReason,
        bankAccount,
        ifsc,
        studentId: user?.id,
      });
      setShowRefundModal(false);
      setRefundReason('');
      setBankAccount('');
      setIfsc('');
    } catch {
      // ignore
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      <MockBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <span>Fees, Payments & Invoices</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Review term fee breakdowns, execute secure online fee payments, and download official receipts.
          </p>
        </div>

        <Button onClick={() => setShowRefundModal(true)} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Request Fee Refund</span>
        </Button>
      </div>

      {pendingTxAlert && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Pending Payment Transaction Detected: {pendingTxAlert.txId} (Status: {pendingTxAlert.status})</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500 text-amber-500 text-xs h-7"
            onClick={async () => {
              const check = await feesApi.verifyPaymentStatus(pendingTxAlert.txId);
              if (check.status === 'SUCCESS') {
                localStorage.removeItem('cms_pending_payment_tx');
                setPendingTxAlert(null);
                setPaymentSuccess(`Payment verified! Ref: ${pendingTxAlert.txId}`);
              }
            }}
          >
            Re-check Status
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm animate-pulse">
          Loading fee invoices...
        </div>
      ) : (
        <div className="space-y-6">
          {invoices.map((inv) => (
            <div key={inv.id} className="border rounded-xl p-6 bg-card space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-mono font-bold text-foreground">{inv.invoiceNumber}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Due Date: {inv.dueDate}</p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  {inv.status === 'PAID' && inv.paymentReceiptUrl && (
                    <a
                      href={inv.paymentReceiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Receipt</span>
                    </a>
                  )}
                  {inv.dueAmount > 0 && (
                    <Button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setConfirmName('');
                        setPaymentError(null);
                        setPaymentSuccess(null);
                      }}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Pay ₹{inv.dueAmount.toLocaleString()}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-2 px-3">Fee Head</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inv.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-foreground">{item.headName}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{item.dueDate}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-bold bg-muted/20 text-foreground">
                      <td colSpan={2} className="py-3 px-3">Total Amount</td>
                      <td className="py-3 px-3 text-right font-mono text-sm">
                        ₹{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {inv.dueAmount === 0 ? (
                          <span className="text-emerald-500 text-xs">Fully Paid</span>
                        ) : (
                          <span className="text-amber-500 text-xs">Due: ₹{inv.dueAmount.toLocaleString()}</span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pay Invoice Modal with Name Confirmation */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-bold text-foreground">Secure Fee Payment Execution</h2>
                <p className="text-xs text-muted-foreground">{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            {paymentSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-md flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{paymentSuccess}</span>
              </div>
            )}

            {paymentError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-md flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handlePayInvoice} className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student Name:</span>
                  <span className="font-bold text-foreground">{user?.fullName || 'Student'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Payable:</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    ₹{selectedInvoice.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Payment Method</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['UPI', 'NET_BANKING', 'CARD'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 border rounded-md text-xs font-bold text-center transition-colors ${
                        paymentMethod === method
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Confirm Student Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={`Type "${user?.fullName || 'Full Name'}" to authorize`}
                  required
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Required safety step to prevent accidental cross-student fee payments.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setSelectedInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessingPayment}>
                  {isProcessingPayment ? 'Processing Payment...' : `Authorize ₹${selectedInvoice.dueAmount}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Request Fee Refund</h2>
            <form onSubmit={handleRefundSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Reason for Refund</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Explain reason (e.g. duplicate payment, scholarship adjustment)..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Bank Account Number</label>
                <Input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 918237461928"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Bank IFSC Code</label>
                <Input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowRefundModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingRefund}>
                  {isSubmittingRefund ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: InvoiceRecord['status'] }> = ({ status }) => {
  switch (status) {
    case 'PAID':
      return <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">PAID</span>;
    case 'PENDING':
      return <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">PENDING</span>;
    case 'OVERDUE':
      return <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">OVERDUE</span>;
    case 'PARTIAL':
      return <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20">PARTIAL</span>;
  }
};
