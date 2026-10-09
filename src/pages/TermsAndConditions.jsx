import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

// ===========================
// PAPER / INK PALETTE — matches Orders/Dashboard/Login
// ===========================
const PAPER = "#F1EAD8";
const CARD = "#FBF8EF";
const INK = "#2B2A25";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3" style={{ color: INK }}>{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${INK}CC` }}>
        {children}
      </div>
    </section>
  );
}

function TermsAndConditions() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: PAPER,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 hover:underline" style={{ color: "#35548C" }}>
          <ArrowLeft size={14} /> Back to DryMe
        </Link>

        <div className="relative rounded-sm border overflow-hidden" style={{ background: CARD, borderColor: `${INK}1F`, boxShadow: `0 1px 0 ${INK}0A` }}>
          <div className="absolute -top-2.5 left-8 w-4 h-4 rounded-full border" style={{ background: PAPER, borderColor: `${INK}25` }} />

          <div className="px-8 pt-9 pb-6 border-b border-dashed" style={{ borderColor: `${INK}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} style={{ color: "#35548C" }} />
              <p className="text-[10px] tracking-[0.25em]" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
                LEGAL · TERMS
              </p>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: INK }}>Terms &amp; Conditions</h1>
            <p className="text-sm mt-1" style={{ color: `${INK}80` }}>
              Last updated: <strong>October 9, 2026</strong> · Governs all use of DryMe
            </p>
          </div>

          <div className="px-8 py-8">

            <p className="text-sm leading-relaxed mb-8" style={{ color: `${INK}CC` }}>
              These Terms &amp; Conditions ("Terms") govern your access to and use of DryMe
              (the "Platform"). By creating an account or using DryMe, you agree to these Terms.
              If you don't agree, please don't use the Platform.
            </p>

            <Section title="1. What DryMe is">
              <p>
                DryMe is a marketplace that connects customers with independent, third-party laundry
                shops ("Shops") for pickup, washing, and delivery services. <strong>DryMe does not
                itself wash, handle, or deliver laundry</strong> — Shops are independent businesses
                responsible for the services they provide. DryMe's role is to facilitate bookings,
                payments, and communication between Customers and Shops.
              </p>
            </Section>

            <Section title="2. Accounts">
              <p>
                You must provide accurate information when registering, and keep your login details
                secure. You're responsible for all activity that happens under your account. You must
                be legally capable of entering into a binding contract to use DryMe.
              </p>
            </Section>

            <Section title="3. Placing an order">
              <p>
                When you book a pickup, you're entering into an agreement directly with the Shop you
                selected, facilitated through DryMe. You agree to provide accurate pickup location and
                contact details — inaccurate information may delay or prevent your order from being
                fulfilled. Pricing shown at booking is an estimate based on the information you
                provide (e.g. estimated weight or item count); the final price may be confirmed by
                the Shop once your items are actually received.
              </p>
            </Section>

            <Section title="4. Payments">
              <p>
                Payments are processed via M-Pesa. By paying through DryMe, you authorise us to
                initiate the relevant M-Pesa transaction on your behalf for the order amount. All
                payments are subject to Safaricom's own terms for M-Pesa. DryMe is not responsible for
                delays or failures caused by M-Pesa, your mobile network, or incorrect phone number
                entry.
              </p>
            </Section>

            <Section title="5. Cancellations, declines, and refunds">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You may cancel an order before a Shop has started washing it.</li>
                <li>A Shop may decline an order it cannot fulfil, with a reason shown to you.</li>
                <li>
                  If an order that was already paid for is cancelled or declined, a refund is owed to
                  you. Refunds are processed securely to your original paying M-Pesa account lines. Please contact us if a
                  refund doesn't arrive within a reasonable time.
                </li>
              </ul>
            </Section>

            <Section title="6. Shop owner obligations">
              <p>If you register as a Shop owner on DryMe, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Provide accurate information about your business, services, and pricing</li>
                <li>Fulfil accepted orders professionally and within a reasonable timeframe</li>
                <li>Handle customers' belongings with reasonable care</li>
                <li>Comply with all applicable Kenyan laws governing your business, including any required licences, permits, and tax obligations</li>
              </ul>
              <p>
                DryMe does not employ Shop owners or their staff and is not responsible for the
                quality of laundry services provided. Disputes about service quality should first be
                raised directly with the Shop.
              </p>
            </Section>

            <Section title="7. Reviews">
              <p>
                You may leave a rating and review after a completed order. Reviews must be honest and
                based on your own experience. We may remove reviews that are abusive, fraudulent, or
                violate these Terms.
              </p>
            </Section>

            <Section title="8. Prohibited conduct">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Provide false information when booking or registering a Shop</li>
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to interfere with or disrupt DryMe's systems</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Post fake reviews or manipulate ratings</li>
              </ul>
            </Section>

            <Section title="9. Limitation of liability">
              <p>
                To the fullest extent permitted by Kenyan law, DryMe is provided on an "as is" basis.
                We do our best to keep the Platform running reliably, but we don't guarantee
                uninterrupted or error-free service. As a facilitator rather than the service
                provider, DryMe is not liable for loss, damage, or dissatisfaction arising from a
                Shop's handling of your laundry — such claims should be directed to the Shop in the
                first instance. Nothing in these Terms excludes liability that cannot be excluded
                under Kenyan law.
              </p>
            </Section>

            <Section title="10. Termination">
              <p>
                We may suspend or terminate your account if you violate these Terms, engage in
                fraudulent activity, or misuse the platform in a way that harms other users, independent shops, 
                or DryMe's operational infrastructure. You may also close your account at any time by contacting our 
                support team.
              </p>
            </Section>

            <Section title="11. Governing Law &amp; Dispute Resolution">
              <p>
                These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. 
                Any dispute, controversy, or claim arising out of or relating to these Terms or the use of the 
                Platform shall first be subjected to an amicable negotiation between the parties. If amicable 
                resolution fails, the dispute shall be referred to the exclusive jurisdiction of the competent 
                courts in Nairobi, Kenya.
              </p>
              <p className="mt-3">
                For questions regarding these Terms, contact us at <strong>support@dryme.co.ke</strong>.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
