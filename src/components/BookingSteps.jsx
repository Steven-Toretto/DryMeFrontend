import { CheckCircle2, Info, MapPin } from "lucide-react";
import { card, field, fieldLabel } from "./ui";
import { kes } from "./walletFormat";
import { LOAD_SIZES } from "./bookingFormat";

const STEP_COUNT = 4;
const STEP_TITLES = ["What needs cleaning?", "Collection details", "Pick a time", "Review and confirm"];

const OPTION = "text-left p-4 rounded-xl border-2 transition min-h-[64px]";
const optionClass = (selected) =>
  `${OPTION} ${selected ? "border-blue-600 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300"}`;

// ---------- the frame every step shares ----------
export function StepHeader({ step, shopName, headingRef }) {
  return (
    <div className="text-center mb-8">
      <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" /> Book a pickup
      </p>
      {shopName && <p className="text-sm text-slate-500 mt-1">at {shopName}</p>}

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-tight text-slate-900 outline-none"
      >
        {STEP_TITLES[step - 1]}
      </h1>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6" role="progressbar" aria-valuemin={1} aria-valuemax={STEP_COUNT} aria-valuenow={step} aria-label={`Step ${step} of ${STEP_COUNT}`}>
        {STEP_TITLES.map((title, i) => (
          <span key={title} className={`h-1 rounded-full ${i < step ? "bg-blue-500" : "bg-blue-100"}`} />
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-500">Step {step} of {STEP_COUNT}</p>
    </div>
  );
}

export function StepCard({ title, subtitle, children }) {
  return (
    <div className={`${card} p-6 sm:p-8`}>
      <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Callout({ title, children }) {
  return (
    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 mt-5">
      <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

const Hint = ({ children }) => (
  <p role="alert" className="text-sm font-medium text-red-600 mt-3">{children}</p>
);

// ===========================
// STEP 1 — what needs cleaning
// ===========================
export function ServiceStep({ services, service, onService, loadSize, onLoadSize, quantity, onQuantity, total, showErrors }) {
  const perItem = service?.pricing_type === "per_item";

  return (
    <StepCard title="What do you need cleaned?" subtitle="Pick one to start. The shop confirms the final weight when it collects.">
      <div role="radiogroup" aria-label="Service" className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={service?.id === s.id}
            onClick={() => onService(s.id)}
            className={optionClass(service?.id === s.id)}
          >
            <span className="block text-[15px] font-bold text-slate-900">{s.name}</span>
            <span className="block text-sm text-slate-500 mt-0.5">
              {kes(s.price)} / {s.pricing_type === "per_item" ? "item" : "kg"}
            </span>
          </button>
        ))}
      </div>

      {service && (
        <div className="mt-6">
          {perItem ? (
            <>
              <span className={fieldLabel}>How many?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onQuantity(Math.max(1, Number(quantity) - 1))}
                  aria-label="One fewer"
                  className="w-12 h-12 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => onQuantity(Math.max(1, Number(e.target.value) || 1))}
                  aria-label="Quantity"
                  className={`${field} w-20 text-center text-lg font-bold px-2`}
                />
                <button
                  type="button"
                  onClick={() => onQuantity(Number(quantity) + 1)}
                  aria-label="One more"
                  className="w-12 h-12 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700"
                >
                  +
                </button>
              </div>
            </>
          ) : (
            <>
              <span className={fieldLabel}>How much laundry?</span>
              <div role="radiogroup" aria-label="Load size" className="grid grid-cols-2 gap-3">
                {LOAD_SIZES.map((size) => (
                  <button
                    key={size.key}
                    type="button"
                    role="radio"
                    aria-checked={loadSize === size.key}
                    onClick={() => onLoadSize(size.key)}
                    className={optionClass(loadSize === size.key)}
                  >
                    <span className="block text-sm font-bold text-slate-900">{size.label}</span>
                    <span className="block text-xs text-slate-500 mt-0.5 leading-snug">about {size.kg} kg · {size.desc}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Just an estimate. The shop weighs your laundry at pickup and you pay the final price.
              </p>
            </>
          )}

          {total != null && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3.5 mt-5">
              <span className="text-sm font-semibold text-slate-600">Estimated total</span>
              <span className="text-xl font-extrabold text-slate-900">{kes(total)}</span>
            </div>
          )}
        </div>
      )}

      {showErrors && (!service || total == null) && (
        <Hint>{service ? "Choose how much laundry there is." : "Choose a service to continue."}</Hint>
      )}
    </StepCard>
  );
}

// ===========================
// STEP 2 — where to collect
// ===========================
export function DetailsStep({
  address, phone, notes, onChange, errors, showErrors,
  pinned, locating, onUseLocation, gpsError, addressFromPin,
}) {
  return (
    <StepCard title="Where should the shop collect?" subtitle="The shop sees this, and uses it to find you.">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label htmlFor="bk-address" className="text-sm font-semibold text-slate-700">Street address</label>
        <button
          type="button"
          onClick={onUseLocation}
          disabled={locating}
          className="inline-flex items-center gap-1 min-h-[36px] text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
        >
          <MapPin size={14} />
          {locating ? "Locating…" : pinned ? "Update pin" : "Use my location"}
        </button>
      </div>
      <input
        id="bk-address"
        type="text"
        autoComplete="street-address"
        value={address}
        onChange={(e) => onChange("address", e.target.value)}
        placeholder="e.g. Rhapta Road, Apt 4B"
        aria-invalid={showErrors && Boolean(errors.address)}
        className={field}
      />
      <div className="mt-1.5 text-xs space-y-1">
        {showErrors && errors.address && <p role="alert" className="font-medium text-red-600">{errors.address}</p>}
        {pinned && (
          <p className="flex items-center gap-1 font-semibold text-emerald-700">
            <CheckCircle2 size={12} /> Exact pin saved. The shop gets precise directions.
          </p>
        )}
        {addressFromPin && (
          <p className="text-slate-500">
            Filled in from your pin. Add a landmark in the notes (gate colour, building name, floor) so the shop finds you faster.
          </p>
        )}
        {gpsError && <p className="text-amber-700">{gpsError}</p>}
      </div>

      <label htmlFor="bk-phone" className={`${fieldLabel} mt-5`}>Phone number</label>
      <input
        id="bk-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => onChange("phone", e.target.value)}
        placeholder="0712 345 678"
        aria-invalid={showErrors && Boolean(errors.phone)}
        className={field}
      />
      {showErrors && errors.phone && <p role="alert" className="text-xs font-medium text-red-600 mt-1.5">{errors.phone}</p>}

      <label htmlFor="bk-notes" className={`${fieldLabel} mt-5`}>
        Notes for the shop <span className="font-normal text-slate-400">(optional)</span>
      </label>
      <textarea
        id="bk-notes"
        rows={3}
        maxLength={500}
        value={notes}
        onChange={(e) => onChange("notes", e.target.value)}
        placeholder="Gate code, landmark, stains to watch for, who to ask for"
        className={`${field} py-3 resize-none`}
      />
    </StepCard>
  );
}

// ===========================
// STEP 3 — pick a time
// ===========================
export function TimeStep({ slots, date, slotKey, onPick, onReload, expired, showErrors, perItem }) {
  const chosenDay = slots.days.find((d) => d.date === date) || slots.days[0];

  return (
    <StepCard title="When suits you?" subtitle="Two-hour windows. The shop will collect your laundry within the one you pick.">
      {slots.status === "loading" && <p className="text-sm text-slate-500" aria-busy="true">Loading times…</p>}

      {slots.status === "error" && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">We couldn't load the available times.</p>
          <button type="button" onClick={onReload} className="mt-2 min-h-[44px] text-sm font-bold text-blue-700 hover:underline">
            Try again
          </button>
        </div>
      )}

      {slots.status === "ready" && slots.days.length === 0 && (
        <p className="text-sm text-slate-600">No pickup times are open right now. Please check back in the morning.</p>
      )}

      {slots.status === "ready" && slots.days.length > 0 && (
        <>
          <div role="tablist" aria-label="Day" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {slots.days.map((d) => (
              <button
                key={d.date}
                type="button"
                role="tab"
                aria-selected={chosenDay.date === d.date}
                onClick={() => onPick(d.date, d.date === date ? slotKey : "")}
                className={`shrink-0 min-h-[44px] px-4 rounded-full border-2 text-sm font-bold transition ${
                  chosenDay.date === d.date ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div role="radiogroup" aria-label="Time window" className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {chosenDay.slots.map((s) => {
              const selected = date === chosenDay.date && slotKey === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onPick(chosenDay.date, s.key)}
                  className={`${optionClass(selected)} text-center`}
                >
                  <span className="block text-sm font-bold text-slate-900">{s.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {expired && <Hint>The time you picked is no longer available. Please choose another.</Hint>}
      {showErrors && !expired && slots.status === "ready" && !slotKey && <Hint>Choose a time window to continue.</Hint>}

      <Callout title={perItem ? "Pay after booking" : "You pay after the weigh-in"}>
        {perItem
          ? "Nothing is charged now. You pay with M-Pesa from My Orders."
          : "The shop weighs your laundry when it collects it. You pay the final price afterwards, from My Orders."}
      </Callout>
    </StepCard>
  );
}

// ===========================
// STEP 4 — review and confirm
// ===========================
export function ReviewStep({ rows, totalText, totalNote, onEdit, onConfirm, submitting, error, timeProblem, onChangeTime, payNote }) {
  return (
    <StepCard title="Confirm your pickup" subtitle="Nothing is charged now.">
      <dl className="rounded-xl border border-slate-200 overflow-hidden">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3.5 border-b border-slate-200 last:border-b-0">
            <dt className="text-sm text-slate-500 shrink-0 pt-0.5">{row.label}</dt>
            <dd className="text-sm font-bold text-slate-900 text-right min-w-0">
              <span className="break-words">{row.value}</span>
              {row.step && (
                <button
                  type="button"
                  onClick={() => onEdit(row.step)}
                  className="ml-2 text-xs font-semibold text-blue-700 hover:underline align-baseline"
                >
                  Change
                </button>
              )}
              {row.sub && <span className="block text-xs font-medium text-slate-500 mt-0.5 break-words">{row.sub}</span>}
            </dd>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4 px-4 py-4 bg-blue-50">
          <dt className="text-sm text-slate-600 shrink-0 pt-1">Estimated total</dt>
          <dd className="text-right">
            <span className="block text-xl font-extrabold text-slate-900">{totalText}</span>
            {totalNote && <span className="block text-xs font-medium text-slate-500 mt-0.5">{totalNote}</span>}
          </dd>
        </div>
      </dl>

      {error && (
        <div role="alert" className="mt-5 p-3.5 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
          {error}
          {timeProblem && (
            <button type="button" onClick={onChangeTime} className="block mt-2 min-h-[44px] font-bold text-blue-700 hover:underline">
              Choose another time
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={submitting}
        className="inline-flex items-center justify-center w-full min-h-[52px] mt-5 px-6 rounded-xl text-base font-bold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Booking your pickup…" : "Confirm pickup"}
      </button>
      <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">{payNote}</p>
    </StepCard>
  );
}