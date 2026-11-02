import { Link } from "react-router-dom";
import { btn, wrap } from "../components/ui";

function NotFound() {
  return (
    <div className="bg-blue-50">
      <div className={`${wrap} py-20 sm:py-28 text-center`}>
        <p className="text-7xl sm:text-8xl font-extrabold text-blue-200 leading-none">404</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          We can't find that page.
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-md mx-auto">
          The link may be old, or the page may have moved. Your orders are safe in My Orders.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to="/" className={btn.primary}>Back to home</Link>
          <Link to="/shops" className={btn.ghost}>Browse laundries</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;