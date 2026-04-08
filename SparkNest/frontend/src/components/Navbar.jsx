import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI } from "../services/api"; // Your API service
import { useEffect, useState } from "react";

const navStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
  }

  .spark-navbar {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--spark-border);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0 28px;
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'DM Sans', sans-serif;
  }

  .spark-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--spark-ink);
    text-decoration: none;
    letter-spacing: -0.5px;
    flex-shrink: 0;
  }
  .spark-logo span { color: var(--spark-coral); }

  /* Center nav links */
  .spark-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .spark-nav-link {
    color: var(--spark-muted);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 30px;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
    position: relative;
  }
  .spark-nav-link:hover {
    color: var(--spark-ink);
    background: var(--spark-surface);
  }
  .spark-nav-link.active {
    color: var(--spark-coral);
    background: var(--spark-coral-soft);
  }

  /* Right side */
  .spark-nav-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .spark-search-form {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 999px;
    padding: 6px 10px;
    min-width: 220px;
    max-width: 320px;
  }

  .spark-search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13px;
    color: var(--spark-ink);
    font-family: 'DM Sans', sans-serif;
    background: transparent;
    min-width: 0;
  }

  .spark-search-input::placeholder {
    color: var(--spark-muted);
  }

  .spark-search-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--spark-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: color 0.15s, background 0.15s;
  }

  .spark-search-btn:hover {
    color: var(--spark-ink);
    background: var(--spark-surface);
  }

  .spark-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 16px;
    color: var(--spark-muted);
    background: transparent;
    border: 1px solid var(--spark-border);
    transition: all 0.15s;
    position: relative;
  }
  .spark-icon-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border-color: #d5d5d5;
  }

  /* Notification badge */
  .notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--spark-coral);
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .spark-create-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--spark-ink);
    color: white !important;
    border: none;
    border-radius: 30px;
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .spark-create-btn:hover { opacity: 0.82; color: white; }

  .spark-avatar-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--spark-coral), #FF8E8E);
    color: white;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    border: 2px solid transparent;
    transition: all 0.15s;
    position: relative;
    overflow: hidden;
  }
  .spark-avatar-btn:hover { 
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
  .spark-avatar-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }
  .spark-avatar-btn:hover::before { left: 100%; }

  .spark-login-btn {
    color: var(--spark-ink);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 16px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    transition: all 0.15s;
  }
  .spark-login-btn:hover {
    background: var(--spark-surface);
    border-color: #d5d5d5;
  }

  .spark-register-btn {
    color: white;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 16px;
    border-radius: 30px;
    background: var(--spark-coral);
    border: 1px solid var(--spark-coral);
    transition: all 0.15s;
  }
  .spark-register-btn:hover { 
    opacity: 0.88; 
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .spark-nav-links { display: none; }
    .spark-search-form { display: none; }
    .spark-navbar { padding: 0 16px; }
    .spark-nav-right { gap: 4px; }
  }

  @media (max-width: 480px) {
    .spark-create-btn { 
      padding: 6px 12px; 
      font-size: 12px;
      display: none;
    }
  }
`;

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/posts", label: "Posts" },
  { to: "/reels", label: "Reels" },
  { to: "/boards", label: "Boards" },
  { to: "/chat", label: "Messages" },
];

function Navbar() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationsAPI.getUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchTerm("");
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/");
    }
  };

  // Show loading spinner if auth is still checking
  if (loading) {
    return (
      <nav className="spark-navbar" style={{ justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid #f3f3f3', borderTop: '2px solid var(--spark-coral)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </nav>
    );
  }

  return (
    <>
      <style>{navStyles}</style>

      <nav className="spark-navbar">
        {/* Logo */}
        <Link to="/" className="spark-logo">
          Spark<span>Nest</span>
        </Link>

        {/* Center links */}
        <div className="spark-nav-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`spark-nav-link${location.pathname === to ? " active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="spark-nav-right">
          {isAuthenticated ? (
            <>
              <form className="spark-search-form" onSubmit={handleSearchSubmit} role="search">
                <input
                  className="spark-search-input"
                  type="search"
                  placeholder="Search SparkNest..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search"
                />
                <button type="submit" className="spark-search-btn" aria-label="Search">
                  🔍
                </button>
              </form>
              {/* Create Button */}
              <Link to="/create" className="spark-create-btn" title="Create post/reel">
                + Create
              </Link>

              {/* Notifications with badge */}
              <Link to="/notifications" className="spark-icon-btn" title="Notifications">
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>

              {/* Messages */}
              <Link to="/chat" className="spark-icon-btn" title="Messages">
                💬
              </Link>

              {/* Profile Avatar */}
              <Link 
                to={`/profile/${user?._id}`} 
                className="spark-avatar-btn" 
                title={`${user?.name || 'Profile'}`}
              >
                {initials}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="spark-login-btn">Log in</Link>
              <Link to="/register" className="spark-register-btn">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;