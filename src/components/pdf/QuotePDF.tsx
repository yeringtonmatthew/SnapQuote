import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Quote, User } from '@/types/database';
import { formatQuoteNumber } from '@/lib/format-quote-number';
import { formatPhoneNumber } from '@/lib/format-phone';

// Register Helvetica (built into PDF spec — no download needed)
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

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  businessName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  businessSub: {
    fontSize: 8.5,
    color: '#6b7280',
    marginTop: 2,
  },
  quoteLabel: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'right',
  },
  quoteMeta: {
    fontSize: 8.5,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Parties ──────────────────────────────────────────────
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

  // ── Section ──────────────────────────────────────────────
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  bodyText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },

  // ── Line Items Table ─────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
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

  // ── Totals ───────────────────────────────────────────────
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 16,
  },
  totalsBox: {
    width: 200,
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
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    backgroundColor: '#eff6ff',
    borderRadius: 3,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  depositLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  depositValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
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

  // ── Signature ────────────────────────────────────────────
  signatureSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  signatureText: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 1.4,
  },
  signatureGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  signatureBlock: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 4,
    paddingBottom: 16,
  },
  signatureSubLabel: {
    fontSize: 7.5,
    color: '#9ca3af',
  },

  // ── Footer ───────────────────────────────────────────────
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

interface QuotePDFProps {
  quote: Quote;
  profile: User;
  brandColor?: string;
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Lighten a hex color for backgrounds (mix with white)
function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

// Darken a hex color (mix with black)
function darkenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export function QuotePDF({ quote, profile, brandColor: brandColorProp }: QuotePDFProps) {
  const bc = brandColorProp || profile.brand_color || '#4f46e5';
  const bcDark = darkenHex(bc, 0.3);
  const bcLight = lightenHex(bc, 0.85);
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
  const quoteNumber = quote.quote_number
    ? formatQuoteNumber(quote.quote_number)
    : quote.id.slice(-6).toUpperCase();

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: bc }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {profile.logo_url ? (
              <Image
                src={profile.logo_url}
                style={{ height: 60, maxWidth: 120, objectFit: 'contain' }}
              />
            ) : null}
            <View>
              <Text style={[styles.businessName, { color: bc }]}>
                {profile.business_name || profile.full_name || 'Contractor'}
              </Text>
              {profile.full_name && profile.business_name && (
                <Text style={styles.businessSub}>{profile.full_name}</Text>
              )}
            </View>
          </View>
          <View>
            <Text style={styles.quoteLabel}>QUOTE</Text>
            <Text style={styles.quoteMeta}>{quote.quote_number ? quoteNumber : `#${quoteNumber}`}</Text>
            <Text style={styles.quoteMeta}>Date: {formatDate(quote.created_at)}</Text>
            <Text style={styles.quoteMeta}>Valid for 30 days</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Prepared For</Text>
            <Text style={styles.partyName}>{quote.customer_name}</Text>
            {quote.customer_phone && (
              <Text style={styles.partyDetail}>{formatPhoneNumber(quote.customer_phone)}</Text>
            )}
            {quote.job_address && (
              <Text style={styles.partyDetail}>{quote.job_address}</Text>
            )}
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Prepared By</Text>
            <Text style={styles.partyName}>
              {profile.business_name || profile.full_name || 'Contractor'}
            </Text>
            {profile.full_name && profile.business_name && (
              <Text style={styles.partyDetail}>{profile.full_name}</Text>
            )}
          </View>
        </View>

        {/* Scope of Work */}
        {(quote.scope_of_work || quote.ai_description) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: bc, borderBottomColor: bcLight }]}>Scope of Work</Text>
            <Text style={styles.bodyText}>
              {quote.scope_of_work || quote.ai_description}
            </Text>
          </View>
        )}

        {/* Inspection Report */}
        {quote.inspection_findings && Array.isArray(quote.inspection_findings) && (quote.inspection_findings as Array<{ finding: string; severity: string; urgency_message: string }>).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: bc, borderBottomColor: bcLight }]}>
              Inspection Report — {(quote.inspection_findings as unknown[]).length} Finding{(quote.inspection_findings as unknown[]).length !== 1 ? 's' : ''}
            </Text>
            {(quote.inspection_findings as Array<{ finding: string; severity: string; urgency_message: string }>).map((f, i) => {
              const severityLabel = f.severity === 'critical' ? 'CRITICAL' : f.severity === 'moderate' ? 'MODERATE' : 'MINOR';
              const severityColor = f.severity === 'critical' ? '#dc2626' : f.severity === 'moderate' ? '#d97706' : '#2563eb';
              return (
                <View key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: severityColor }}>
                  <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: severityColor, marginBottom: 2 }}>
                    {severityLabel}
                  </Text>
                  <Text style={{ fontSize: 8.5, color: '#111827', marginBottom: f.urgency_message ? 2 : 0 }}>
                    {f.finding}
                  </Text>
                  {f.urgency_message ? (
                    <Text style={{ fontSize: 8, color: '#6b7280', fontStyle: 'italic' }}>
                      {f.urgency_message}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: bc, borderBottomColor: bcLight }]}>Line Items</Text>

          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: bcDark }]}>
            <Text style={[styles.headerCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colUnit]}>Unit</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
          </View>

          {/* Rows */}
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
            {(hasDiscount || hasTax) && (
              <View style={[styles.totalRow, { borderBottomWidth: 2, borderBottomColor: '#111827' }]}>
                <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold', color: '#111827' }]}>Total</Text>
                <Text style={styles.totalValue}>{fmt(quoteTotal)}</Text>
              </View>
            )}
            <View style={[styles.depositRow, { backgroundColor: bcLight }]}>
              <Text style={[styles.depositLabel, { color: bcDark }]}>Deposit Required ({quote.deposit_percent}%)</Text>
              <Text style={[styles.depositValue, { color: bcDark }]}>{fmt(deposit)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Balance Due on Completion</Text>
              <Text style={styles.balanceValue}>{fmt(balance)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: bc, borderBottomColor: bcLight }]}>Terms & Conditions</Text>
            <Text style={styles.bodyText}>{quote.notes}</Text>
          </View>
        )}

        {/* Acceptance / Signature */}
        <View style={styles.signatureSection}>
          <Text style={[styles.signatureTitle, { color: bc }]}>Acceptance of Quote</Text>
          <Text style={styles.signatureText}>
            By signing below, the customer acknowledges that they have read and agree to the scope of work,
            pricing, and terms outlined in this quote. A deposit of {fmt(deposit)} is required to schedule
            and begin work. The balance of {fmt(balance)} is due upon satisfactory completion.
          </Text>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureSubLabel}>Customer Signature</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureSubLabel}>Date</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureSubLabel}>Contractor Signature</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {profile.business_name || profile.full_name} — {quote.quote_number ? `Quote ${quoteNumber}` : `Quote #${quoteNumber}`}
          </Text>
          <Text style={styles.footerText}>Generated by SnapQuote</Text>
        </View>

      </Page>
    </Document>
  );
}
