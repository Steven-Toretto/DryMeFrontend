import { useState } from "react";
import { Scale, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { weighOrder } from "../api";
import { kes, apiError } from "./walletFormat";
import { canWeigh, formatKg, isWeighed, needsApproval, previewWeighIn, priceChange } from "./orderPricing";

const INK = "#2B2A25";
const BLUE = "#35548C";
const GREEN = "#3F6B47";
const AMBER = "#B5811E";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// What happens next, once the shop has entered a weight.
function nextStep(order) {
  if (order.payment_status === "paid") {
    return { ink: GREEN, icon: <CheckCircle2 size={13} />, text: "Paid. You can start washing. The weight is now locked." };
  }
  if (order.payment_status === "pending_payment") {
    return { ink: AMBER, icon: <Clock size={13} />, text: "A payment prompt is on the customer's phone. The weight is locked until it finishes." };
  }
  if (needsApproval(order)) {
    const change = priceChange(order);
    const over = change ? ` (${kes(change.diff)}, +${change.pct}% on the estimate)` : "";
    return { ink: AMBER, icon: <AlertTriangle size={13} />, text: `The price is above the estimate${over}. Waiting for the customer to accept it.` };
  }
  return { ink: GREEN, icon: <CheckCircle2 size={13} />, text: "The customer can pay now. Start washing once they have." };
}

/**
 * The shop's side of a weigh-in, shown on a CONFIRMED per-kg order.
 *   not weighed yet  -> a weight field with a live preview of the price and whether the customer must approve it
 *   weighed          -> what was entered and what happens next, plus "Correct the weight" until the customer pays
 *
 * onWeighed(order): called with the whole updated order the server sends back.
 */
function WeighInPanel({ order, onWeighed }) {
  const weighed = isWeighed(order);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const preview = previewWeighIn(order, text);
  const showForm = canWeigh(order) && (!weighed || editing);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await weighOrder(order.id, text.trim());
      onWeighed(res.order);
      setEditing(false);
      setText("");
    } catch (err) {
      setError(apiError(err, "Couldn't save the weight. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const step = weighed ? nextStep(order) : null;

  return (
    <div className="mb-5 p-4 border rounded-sm" style={{ borderColor: `${BLUE}40`, background: `${BLUE}0D` }}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: BLUE }}>
        <Scale size={13} /> Weigh-in
      </p>

      {weighed && !editing && (
        <div>
          <p className="text-sm" style={{ color: INK }}>
            Weighed <strong>{formatKg(order.weight)}</strong> · <strong>{kes(order.total_price)}</strong>
            <span style={{ color: `${INK}80` }}> (estimate {formatKg(order.estimated_weight)}, {kes(order.estimated_total_price)})</span>
          </p>
          <p className="flex items-start gap-1.5 text-xs font-medium mt-2" style={{ color: step.ink }}>
            <span className="mt-0.5 shrink-0">{step.icon}</span>
            <span>{step.text}</span>
          </p>
          {canWeigh(order) && (
            <button
              type="button"
              onClick={() => { setEditing(true); setText(String(Number(order.weight))); }}
              className="mt-3 min-h-[40px] text-xs font-semibold hover:underline"
              style={{ color: BLUE }}
            >
              Correct the weight
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div>
          {!weighed && (
            <p className="text-sm mb-3" style={{ color: `${INK}CC` }}>
              Weigh the laundry when you collect it and enter the real weight. The customer booked about{" "}
              <strong>{formatKg(order.estimated_weight)}</strong> ({kes(order.estimated_total_price)}).
              They pay after you've entered it.
            </p>
          )}

          <label htmlFor={`weigh-${order.id}`} className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
            Weight (kg)
          </label>
          <input
            id={`weigh-${order.id}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 4.5"
            value={text}
            onChange={(e) => { setText(e.target.value.replace(/[^\d.]/g, "")); setError(""); }}
            className="w-full border rounded-sm px-4 py-3 text-lg font-bold min-h-[48px] bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: `${INK}25`, color: INK, fontFamily: TICKET_FONT }}
          />

          <div className="mt-2 min-h-[1.25rem] text-xs" aria-live="polite">
            {text.trim() && !preview && (
              <p style={{ color: "#9C3B2E" }}>Enter a weight from 0.1 to 999.99 kg, with up to 2 decimals.</p>
            )}
            {preview && (
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: INK, fontFamily: TICKET_FONT }}>
                  {preview.weight} kg × {kes(preview.rate)} = {kes(preview.total)}
                </p>
                {preview.needsApproval ? (
                  <p className="flex items-start gap-1.5 font-medium" style={{ color: AMBER }}>
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span>
                      That's {kes(preview.diff)} (+{preview.pct}%) above the estimate, so the customer has to accept
                      the new price before they can pay.
                    </span>
                  </p>
                ) : (
                  <p className="flex items-start gap-1.5 font-medium" style={{ color: GREEN }}>
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                    <span>
                      {preview.diff <= 0 ? "At or below the estimate." : "Within the margin of the estimate."}{" "}
                      The customer can pay straight away.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs mt-2" style={{ color: "#9C3B2E" }}>{error}</p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={submit}
              disabled={!preview || submitting}
              className="flex-1 min-h-[48px] px-4 py-2.5 rounded-sm text-white text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              style={{ background: BLUE }}
            >
              {submitting ? (<><Spinner /> Saving…</>) : weighed ? "Save corrected weight" : "Send final price"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(false); setError(""); }}
                disabled={submitting}
                className="min-h-[48px] px-4 rounded-sm border-2 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: `${INK}25`, color: `${INK}99` }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default WeighInPanel;