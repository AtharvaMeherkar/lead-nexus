import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface Props {
  variant?: "landing" | "app";
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

const TopNav = ({ variant = "app", onLoginClick, onRegisterClick }: Props) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header
      className={`flex items-center justify-between px-6 py-5 md:px-10 ${
        variant === "landing" ? "absolute inset-x-0 z-10" : ""
      }`}
    >
      <Link to="/" className="text-2xl font-semibold tracking-wide text-cyan">
        Lead <span className="text-white">Nexus</span>
      </Link>
      {variant === "landing" && (
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#live-data" className="text-sm text-gray-200 hover:text-cyan transition-colors">
            Live Data
          </a>
          <a href="#pricing" className="text-sm text-gray-200 hover:text-cyan transition-colors">
            Plans
          </a>
          <a href="#platform" className="text-sm text-gray-200 hover:text-cyan transition-colors">
            Platform
          </a>
        </nav>
      )}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="hidden text-xs uppercase tracking-widest text-gray-500 md:inline">{user?.email}</span>
            <button
              onClick={() => navigate(isDashboard ? "/profile" : "/dashboard")}
              className="rounded-full border border-cyan/30 px-4 py-2 text-sm font-medium text-cyan hover:bg-cyan/10 transition"
            >
              {isDashboard ? "Profile" : "Dashboard"}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-gradient-to-r from-cyan/80 to-magenta/80 px-5 py-2 text-sm font-semibold text-night shadow-lg shadow-magenta/20"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {variant === "landing" && onLoginClick ? (
              <button
                onClick={onLoginClick}
                className="text-sm text-gray-300 hover:text-cyan transition-colors"
              >
                Login
              </button>
            ) : (
              <Link to="/login" className="text-sm text-gray-300 hover:text-cyan transition-colors">
                Login
              </Link>
            )}
            {variant === "landing" && onRegisterClick ? (
              <button
                onClick={onRegisterClick}
                className="rounded-full bg-gradient-to-r from-cyan to-magenta px-5 py-2 text-sm font-semibold text-night shadow-lg shadow-magenta/20"
              >
                Get Started
              </button>
            ) : (
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-cyan to-magenta px-5 py-2 text-sm font-semibold text-night shadow-lg shadow-magenta/20"
              >
                Get Started
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default TopNav;


