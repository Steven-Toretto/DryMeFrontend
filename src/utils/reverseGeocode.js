// Turns GPS coordinates into a short, human-readable address using
// OpenStreetMap's Nominatim service (free, no API key).
//
// Usage policy: max ~1 request/second and a real Referer (browsers send one).
// Fine for pin-button clicks. If volume grows, swap ENDPOINT/parsing for a paid
// geocoder (Google, Mapbox, Geoapify) — nothing else in the app needs to change.

const ENDPOINT = "https://nominatim.openstreetmap.org/reverse";
const TIMEOUT_MS = 6000;

// "Ngong Road, Kilimani, Nairobi" — street, neighbourhood, city; no duplicates.
function formatAddress(data) {
  const a = data?.address || {};

  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const area = a.neighbourhood || a.suburb || a.city_district || a.quarter;
  const city = a.city || a.town || a.village || a.municipality || a.county;

  const parts = [street, area, city].filter(Boolean);
  const unique = parts.filter((part, i) => parts.indexOf(part) === i);

  if (unique.length > 0) return unique.join(", ");

  // Fallback: the first few chunks of Nominatim's long display name.
  const display = typeof data?.display_name === "string" ? data.display_name : "";
  return display.split(",").slice(0, 3).map((s) => s.trim()).filter(Boolean).join(", ");
}

// Resolves to an address string ("" if nothing useful was found).
// Rejects on network failure, timeout or a non-2xx response.
export async function reverseGeocode(lat, lng) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      zoom: "18",
      addressdetails: "1",
      "accept-language": "en",
    });

    const res = await fetch(`${ENDPOINT}?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Geocoder responded ${res.status}`);

    return formatAddress(await res.json());
  } finally {
    clearTimeout(timer);
  }
}