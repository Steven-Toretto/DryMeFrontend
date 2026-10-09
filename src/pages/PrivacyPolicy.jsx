import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

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

function PrivacyPolicy() {
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
              <Shield size={18} style={{ color: "#35548C" }} />
              <p className="text-[10px] tracking-[0.25em]" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
                LEGAL · PRIVACY
              </p>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: INK }}>Privacy Policy</h1>
            <p className="text-sm mt-1" style={{ color: `${INK}80` }}>
              Last updated: <strong>October 9, 2026</strong> · Effective for all DryMe users
            </p>
          </div>

          <div className="px-8 py-8">

            <p className="text-sm leading-relaxed mb-8" style={{ color: `${INK}CC` }}>
              DryMe ("we", "us", "our") operates a platform connecting customers with independent
              laundry shops in Kenya for pickup, washing, and delivery services. This policy explains
              what personal data we collect, why we collect it, and the rights you have over it, in
              line with Kenya's Data Protection Act, 2019.
            </p>

            <Section title="1. Who we are">
              <p>
                DryMe is operated by <strong>DryMe Marketplace</strong>, registered in
                Kenya. For any privacy-related question or request, contact us at{" "}
                <strong>support@dryme.co.ke</strong>.
              </p>
            </Section>

            <Section title="2. What we collect">
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account information</strong> — username, email address, phone number, and role (customer or shop owner).</li>
                <li><strong>Location data</strong> — your pickup location, and, if you grant permission, your precise GPS coordinates captured at the moment you book, so shops and drivers can find you accurately.</li>
                <li><strong>Order information</strong> — items/weight booked, service selected, pricing, special instructions, and order status history.</li>
                <li><strong>Payment information</strong> — your M-Pesa phone number and transaction confirmation codes. We do not store your M-Pesa PIN or full payment credentials; these are handled directly by Safaricom's Daraja platform.</li>
                <li><strong>Reviews and ratings</strong> — any rating or comment you leave about a completed order.</li>
                <li><strong>Shop information</strong> (for shop owners) — business name, location, description, and photos you upload.</li>
                <li><strong>Usage data</strong> — basic technical data such as device type and general app activity, used to keep the service working and secure.</li>
              </ul>
            </Section>

            <Section title="3. Why we collect it">
              <p>We use your personal data to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Create and manage your account</li>
                <li>Connect you with laundry shops and process your bookings</li>
                <li>Share your pickup location and contact details with the shop fulfilling your order, so they can collect and return your laundry</li>
                <li>Process payments via M-Pesa and confirm successful transactions</li>
                <li>Send you notifications about your order status</li>
                <li>Display shop ratings and reviews to help other customers choose a shop</li>
                <li>Investigate disputes, prevent fraud, and keep the platform safe</li>
                <li>Meet our legal and regulatory obligations</li>
              </ul>
              <p>
                If you don't provide certain information — such as a phone number or pickup location —
                we may be unable to process your order, since shops need this to complete a pickup.
              </p>
            </Section>

            <Section title="4. Who we share your data with">
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Shop owners</strong> — when you place an order, the relevant shop sees your name, phone number, pickup location, and order details, so they can fulfil it.</li>
                <li><strong>Safaricom (M-Pesa / Daraja)</strong> — to process your payment.</li>
                <li><strong>Service providers</strong> who help us run the platform (including cloud infrastructure providers such as Vercel, Render, and Supabase), under strict obligations to protect your data. Data may be hosted securely on cloud infrastructure located outside of Kenya.</li>
                <li><strong>Authorities</strong>, where required by law or to protect our rights, users, or the public.</li>
              </ul>
              <p>We do not sell your personal data to third parties.</p>
            </Section>

            <Section title="5. Cookies and similar technologies">
              <p>
                We use essential cookies and similar local storage to keep you logged in and remember
                basic preferences. If we introduce analytics or marketing tools in the future, this
                policy will be updated to describe exactly what they collect. You can control cookies
                through your browser settings at any time.
              </p>
            </Section>

            <Section title="6. How long we keep your data">
              <p>
                We retain account data for as long as your account is active. To satisfy statutory tax, accounting, and anti-money laundering regulations in Kenya, transaction and order history records are securely archived for up to 7 years following a completed booking or account closure. You can request deletion of your account at any time — see Section 8.
              </p>
            </Section>

            <Section title="7. Security">
              <p>
                We use reasonable technical and organisational measures — including encrypted
                connections and access controls — to protect your data. No system is completely
                secure, and we encourage you to use a strong, unique password.
              </p>
            </Section>

            <Section title="8. Your rights">
              <p>Under Kenya's Data Protection Act, 2019, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Be informed how your data is used (this policy)</li>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate or outdated data</li>
                <li>Request deletion of your data, subject to statutory retention requirements</li>
                <li>Object to or restrict the processing of your personal data</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact our team at <strong>support@dryme.co.ke</strong>. 
                If you feel your concerns have not been addressed adequately, you retain the legal right 
                to lodge a formal complaint directly with the Office of the Data Protection Commissioner (ODPC) of Kenya.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
