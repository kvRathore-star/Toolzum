import Link from 'next/link';
import { CheckCircle, ArrowLeft, ExternalLink, Mail } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[640px] mx-auto pt-24 pb-24 px-4 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <h1 className="font-[family-name:var(--font-serif)] text-4xl mb-2">Billing & Subscriptions</h1>
        <p className="text-[var(--text-secondary)] mb-10">Manage your payment methods, invoices, and subscription.</p>

        <div className="space-y-6">
          {/* Active Subscriptions */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
            <h2 className="text-lg font-bold mb-4">Active Plans</h2>
            <div className="p-4 bg-[var(--bg-overlay)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">No active subscriptions</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">All features are available on the Free plan.</p>
              </div>
              <Link href="/pricing" className="text-xs font-medium text-[var(--accent)] hover:underline">View plans</Link>
            </div>
          </div>

          {/* Manage Payment Methods */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
            <h2 className="text-lg font-bold mb-4">Payment Methods</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">No payment methods saved.</p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" />
              PCI-DSS compliant — we never store card details.
            </div>
          </div>

          {/* Cancel / Pause */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
            <h2 className="text-lg font-bold mb-4">Cancel or Pause Subscription</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                You can cancel anytime by email below. Subscriptions auto-cancel after the paid period — no questions asked.
              </p>
            <div className="space-y-3">
              <a
                href="mailto:support@toolzum.com?subject=Cancel%20Subscription"
                className="flex items-center gap-2 w-full py-3 px-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-[var(--radius-lg)] text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
              >
                <Mail className="w-4 h-4" /> Request cancellation via email
              </a>
              <p className="text-xs text-[var(--text-muted)]">
                We process all cancellation requests within 1 business hour. For Project Pass holders — your pass auto-cancels after 7 days.
              </p>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
            <h2 className="text-lg font-bold mb-4">Invoices</h2>
            <p className="text-sm text-[var(--text-secondary)]">No invoices yet. Receipts are emailed after each payment.</p>
          </div>

          {/* Trust */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-xl)] text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              <strong>No lock-in.</strong> Cancel anytime. All your data stays local — nothing to export.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
