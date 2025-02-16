import { Link } from "react-router-dom";

export function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-pink-600">
            Medina Esthetique
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pink-600 transition-colors">
              Services
            </Link>
            <Link to="/admin" className="text-gray-700 hover:text-pink-600 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 