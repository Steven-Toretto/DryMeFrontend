import { Link } from "react-router-dom";
import { MapPin, Shirt, Star } from "lucide-react";
import { Pill, card } from "./ui";

// Cloudinary / absolute URLs pass through; local media gets the API origin in front.
export const shopImageUrl = (shop) => {
  if (!shop?.image) return null;
  return shop.image.startsWith("http") ? shop.image : `${import.meta.env.VITE_API_URL}${shop.image}`;
};

/**
 * One laundry. The whole card is clickable through the title link (stretched with ::after), so anything
 * interactive inside it (map link, owner controls) sits above with `relative z-10`.
 *
 * controls: optional node, rendered top-right over the photo (owner edit / delete)
 */
function ShopCard({ shop, controls = null, showMap = false }) {
  const image = shopImageUrl(shop);
  const rated = Number(shop.review_count) > 0;

  return (
    <article className={`${card} relative flex flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-20px_rgb(23_59_96/0.4)] transition`}>
      <div className="relative h-44 bg-gradient-to-br from-blue-100 to-blue-200">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-400">
            <Shirt size={42} strokeWidth={1.5} />
          </div>
        )}
        {controls && <div className="absolute top-3 right-3 z-10 flex gap-1.5">{controls}</div>}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
          <Link to={`/shop/${shop.id}`} className="after:absolute after:inset-0">
            {shop.name}
          </Link>
        </h3>

        <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{shop.location}</span>
        </p>

        <div className="mt-3">
          {rated ? (
            <Pill className="bg-amber-50 text-amber-700 gap-1">
              <Star size={12} fill="currentColor" /> {shop.average_rating}
              <span className="font-medium text-amber-700/80">
                · {shop.review_count} {shop.review_count === 1 ? "review" : "reviews"}
              </span>
            </Pill>
          ) : (
            <Pill>New on DryMe</Pill>
          )}
        </div>

        {shop.description && (
          <p className="text-sm text-slate-600 mt-3 line-clamp-2">{shop.description}</p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-blue-100 pt-4 text-sm">
            {showMap && shop.lat && shop.lng ? (
              <a
                href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 font-semibold text-slate-500 hover:text-blue-700"
              >
                View on map
              </a>
            ) : (
              <span className="text-slate-500">Book a pickup</span>
            )}
            <span className="font-bold text-blue-700">View shop →</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ShopCard;