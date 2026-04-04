import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Quote, User } from '@/types/database';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { formatPhoneNumber } from '@/lib/format-phone';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 44,
    backgroundColor: '#ffffff',
  },

  // -- Header --
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  businessName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
  },
  businessSub: {
    fontSize: 8.5,
    color: '#6b7280',
    marginTop: 2,
  },
  invoiceLabel: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'right',
  },
  invoiceMeta: {
    fontSize: 8.5,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },

  // -- Paid stamp --
  paidBadge: {
    marginTop: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-end',
  },
  paidText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#15803d',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  unpaidBadge: {
    marginTop: 6,
    backgroundColor: '#fff7ed',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-end',
  },
  unpaidText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#c2410c',
    textAlign: 'center',
    letterSpacing: 1.5,
  },

  // -- Parties --
  parties: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  partyBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    padding: 10,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  partyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  partyDetail: {
    fontSize: 8.5,
    color: '#374151',
  },

  // -- Section --
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  bodyText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },

  // -- Line Items Table --
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#166534',
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colDesc: { flex: 1 },
  colQty: { width: 36, textAlign: 'right' },
  colUnit: { width: 36, textAlign: 'right' },
  colPrice: { width: 54, textAlign: 'right' },
  colTotal: { width: 60, textAlign: 'right' },
  headerCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cell: {
    fontSize: 8.5,
    color: '#374151',
  },
  cellBold: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },

  // -- Totals --
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 16,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  totalLabel: {
    fontSize: 8.5,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderRadius: 3,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  depositRowPaid: {
    backgroundColor: '#dcfce7',
  },
  depositRowUnpaid: {
    backgroundColor: '#fff7ed',
  },
  depositLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  depositLabelPaid: {
    color: '#15803d',
  },
  depositLabelUnpaid: {
    color: '#c2410c',
  },
  depositValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  depositValuePaid: {
    color: '#15803d',
  },
  depositValueUnpaid: {
    color: '#c2410c',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 8.5,
    color: '#6b7280',
  },
  balanceValue: {
    fontSize: 8.5,
    color: '#374151',
  },

  // -- Footer --
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: '#9ca3af',
  },
});

interface InvoicePDFProps {
  quote: Quote;
  profile: User;
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatInvoiceNumber(n: number | null | undefined): string {
  if (n == null) return '';
  return `INV-${String(n).padStart(3, '0')}`;
}

export function InvoicePDF({ quote, profile }: InvoicePDFProps) {
  const subtotal = Number(quote.subtotal);
  const quoteTotal = Number(quote.total ?? quote.subtotal);
  const deposit = Number(quote.deposit_amount);
  const balance = quoteTotal - deposit;

  const hasDiscount = (quote.discount_amount != null && quote.discount_amount > 0) ||
    (quote.discount_percent != null && quote.discount_percent > 0);
  const discountDisplay = quote.discount_amount != null && quote.discount_amount > 0
    ? Number(quote.discount_amount)
    : quote.discount_percent != null && quote.discount_percent > 0
      ? Math.round(subtotal * (Number(quote.discount_percent) / 100) * 100) / 100
      : 0;
  const hasTax = quote.tax_rate != null && Number(quote.tax_rate) > 0;
  const afterDiscount = Math.round((subtotal - discountDisplay) * 100) / 100;
  const taxAmount = hasTax ? Math.round(afterDiscount * (Number(quote.tax_rate) / 100) * 100) / 100 : 0;

  const invoiceNumber = quote.quote_number
    ? formatInvoiceNumber(quote.quote_number)
    : `INV-${quote.id.slice(-6).toUpperCase()}`;

  const issueDate = quote.sent_at
    ? formatDate(quote.sent_at)
    : quote.paid_at
      ? formatDate(quote.paid_at)
      : formatDate(quote.created_at);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {profile.logo_url ? (
              <Image
                src={profile.logo_url}
                style={{ height: 60, maxWidth: 120, objectFit: 'contain' }}
              />
            ) : null}
            <View>
              <Text style={styles.businessName}>
                {profile.business_name || profile.full_name || 'Contractor'}
              </Text>
              {profile.full_name && profile.business_name && (
                <Text style={styles.businessSub}>{profile.full_name}</Text>
              )}
            </View>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>{invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>Issued: {issueDate}</Text>
            {quote.quote_number && (
              <Text style={styles.invoiceMeta}>
                Ref: Quote {formatQuoteNumber(quote.quote_number)}
              </Text>
            )}
            {quote.status === 'deposit_paid' ? (
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>PAID</Text>
              </View>
            ) : (
              <View style={styles.unpaidBadge}>
                <Text style={styles.unpaidText}>UNPAID</Text>
              </View>
            )}
          </View>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{quote.customer_name}</Text>
            {quote.customer_phone && (
              <Text style={styles.partyDetail}>{formatPhoneNumber(quote.customer_phone)}</Text>
            )}
            {quote.customer_email && (
              <Text style={styles.partyDetail}>{quote.customer_email}</Text>
            )}
            {quote.job_address && (
              <Text style={styles.partyDetail}>{quote.job_address}</Text>
            )}
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>
              {profile.business_name || profile.full_name || 'Contractor'}
            </Text>
            {profile.full_name && profile.business_name && (
              <Text style={styles.partyDetail}>{profile.full_name}</Text>
            )}
            {(profile.business_email || profile.email) && (
              <Text style={styles.partyDetail}>{profile.business_email || profile.email}</Text>
            )}
          </View>
        </View>

        {/* Scope of Work */}
        {(quote.scope_of_work || quote.ai_description) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description of Work</Text>
            <Text style={styles.bodyText}>
              {quote.scope_of_work || quote.ai_description}
            </Text>
          </View>
        )}

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colUnit]}>Unit</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
          </View>

          {quote.line_items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.cell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.cell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cell, styles.colUnit]}>{item.unit}</Text>
              <Text style={[styles.cell, styles.colPrice]}>{fmt(item.unit_price)}</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
            </View>
            {hasDiscount && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount{quote.discount_percent != null && quote.discount_percent > 0 ? ` (${quote.discount_percent}%)` : ''}
                </Text>
                <Text style={[styles.totalValue, { color: '#dc2626' }]}>-{fmt(discountDisplay)}</Text>
              </View>
            )}
            {hasTax && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({quote.tax_rate}%)</Text>
                <Text style={styles.totalValue}>{fmt(taxAmount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmt(quoteTotal)}</Text>
            </View>
            <View style={[styles.depositRow, quote.status === 'deposit_paid' ? styles.depositRowPaid : styles.depositRowUnpaid]}>
              <Text style={[styles.depositLabel, quote.status === 'deposit_paid' ? styles.depositLabelPaid : styles.depositLabelUnpaid]}>
                {quote.status === 'deposit_paid' ? 'Deposit Paid' : 'Deposit Required'} ({quote.deposit_percent}%)
              </Text>
              <Text style={[styles.depositValue, quote.status === 'deposit_paid' ? styles.depositValuePaid : styles.depositValueUnpaid]}>
                {fmt(deposit)}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Balance Remaining</Text>
              <Text style={styles.balanceValue}>{fmt(balance)}</Text>
            </View>
          </View>
        </View>

        {/* Payment details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          {quote.status === 'deposit_paid' ? (
            <>
              <Text style={styles.bodyText}>
                Status: Deposit paid{quote.paid_at ? ` on ${formatDate(quote.paid_at)}` : ''}
              </Text>
              <Text style={styles.bodyText}>
                Deposit amount: {fmt(deposit)} ({quote.deposit_percent}% of total)
              </Text>
              {balance > 0 && (
                <Text style={styles.bodyText}>
                  Balance of {fmt(balance)} due upon completion of work.
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.bodyText}>Status: Payment pending</Text>
              <Text style={styles.bodyText}>
                Deposit required: {fmt(deposit)} ({quote.deposit_percent}% of total)
              </Text>
              {balance > 0 && (
                <Text style={styles.bodyText}>
                  Balance of {fmt(balance)} due upon completion of work.
                </Text>
              )}
            </>
          )}
        </View>

        {/* Terms */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.bodyText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {profile.business_name || profile.full_name} — {invoiceNumber}
          </Text>
          <Text style={styles.footerText}>Generated by SnapQuote</Text>
        </View>

      </Page>
    </Document>
  );
}
