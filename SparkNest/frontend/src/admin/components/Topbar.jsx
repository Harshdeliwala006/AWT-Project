import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./../../context/AuthContext";

const topbarStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
  }

  .admin-topbar {
    font-family: 'DM Sans', sans-serif;
    height: 60px;
    background: var(--spark-white);
    border-bottom: 1px solid var(--spark-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: sticky;
    top: 0;
    left:240px;
    width: 84%;
    z-index: 50;
    gap: 16px;
  }

  .topbar-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }

  .topbar-breadcrumb-root {
    color: var(--spark-muted);
    text-decoration: none;
    transition: color 0.15s;
  }
  .topbar-breadcrumb-root:hover { color: var(--spark-ink); }

  .topbar-breadcrumb-sep { color: var(--spark-border); font-size: 14px; }

  .topbar-breadcrumb-current {
    font-weight: 500;
    color: var(--spark-ink);
    font-size: 13.5px;
  }

  .topbar-search-wrap {
    position: relative;
    flex: 1;
    max-width: 320px;
  }

  .topbar-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    color: var(--spark-muted);
    pointer-events: none;
  }

  .topbar-search {
    width: 100%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 7px 14px 7px 34px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  .topbar-search:focus { border-color: var(--spark-coral); }
  .topbar-search::placeholder { color: #C0BFBD; }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .topbar-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--spark-border);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    cursor: pointer;
    color: var(--spark-muted);
    transition: all 0.15s;
    position: relative;
    text-decoration: none;
  }
  .topbar-icon-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border-color: #d5d5d5;
  }

  .topbar-notif-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--spark-coral);
    border: 1.5px solid var(--spark-white);
  }

  .topbar-view-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-muted);
    padding: 7px 14px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    transition: all 0.15s;
    white-space: nowrap;
  }
  .topbar-view-btn:hover {
    color: var(--spark-ink);
    background: var(--spark-surface);
    border-color: #d5d5d5;
  }

  .topbar-divider {
    width: 1px;
    height: 24px;
    background: var(--spark-border);
    flex-shrink: 0;
  }

  .topbar-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px 5px 6px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }
  .topbar-user:hover { background: var(--spark-surface); border-color: #d5d5d5; }

  .topbar-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255,107,107,0.18);
    color: var(--spark-coral);
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .topbar-user-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--spark-ink);
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .topbar-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(26,26,46,0.13);
    min-width: 180px;
    overflow: hidden;
    animation: dropDown 0.15s ease;
    z-index: 100;
  }
  @keyframes dropDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .topbar-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 16px;
    font-size: 13.5px;
    color: var(--spark-ink);
    text-decoration: none;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    border-bottom: 1px solid var(--spark-border);
    transition: background 0.12s;
  }
  .topbar-dropdown-item:last-child { border-bottom: none; }
  .topbar-dropdown-item:hover { background: var(--spark-surface); }
  .topbar-dropdown-item.danger { color: #A32D2D; }
  .topbar-dropdown-item.danger:hover { background: #FCEBEB; }
`;

const ROUTE_LABELS = {
  "/admin":              "Dashboard",
  "/admin/":             "Dashboard",
  "/admin/users":        "Users",
  "/admin/posts":        "Posts",
  "/admin/reels":        "Reels",
  "/admin/reports":      "Reports",
  "/admin/notifications":"Notifications",
  "/admin/analytics":    "Analytics",
  "/admin/settings":     "Settings",
};

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);

  const currentPage = ROUTE_LABELS[location.pathname] || "Admin Panel";

  return (
    <>
      <style>{topbarStyles}</style>

      <header className="admin-topbar">
        <div className="topbar-breadcrumb">
          <Link to="/admin/" className="topbar-breadcrumb-root">Admin</Link>
          {currentPage !== "Dashboard" && (
            <>
              <span className="topbar-breadcrumb-sep">/</span>
              <span className="topbar-breadcrumb-current">{currentPage}</span>
            </>
          )}
        </div>

        <div className="topbar-search-wrap">
          <span className="topbar-search-icon">🔍</span>
          <input
            className="topbar-search"
            placeholder={`Search ${currentPage.toLowerCase()}…`}
            type="text"
          />
        </div>

        <div className="topbar-right">

          <Link to="/" className="topbar-view-btn" target="_blank" rel="noopener noreferrer">
            ↗ View site
          </Link>

          <div className="topbar-divider" />

          <Link to="/admin/notifications" className="topbar-icon-btn" title="Notifications">
            🔔
            <span className="topbar-notif-dot" />
          </Link>

          <Link to="/admin/settings" className="topbar-icon-btn" title="Settings">
            ⚙
          </Link>

          <div className="topbar-divider" />

          <div
            className="topbar-user"
            onClick={() => setDropOpen((v) => !v)}
          >
            <div className="topbar-avatar">{getInitials(user?.name || "A")}</div>
            <span className="topbar-user-name">{user?.name || "Admin"}</span>
            <span style={{ fontSize: 10, color: "var(--spark-muted)", marginLeft: 2 }}>▼</span>

            {dropOpen && (
              <div className="topbar-dropdown" onClick={(e) => e.stopPropagation()}>
                <Link to="/profile" className="topbar-dropdown-item" onClick={() => setDropOpen(false)}>
                  👤 My Profile
                </Link>
                <Link to="/admin/settings" className="topbar-dropdown-item" onClick={() => setDropOpen(false)}>
                  ⚙ Settings
                </Link>
                <button
                  className="topbar-dropdown-item danger"
                  onClick={() => { setDropOpen(false); logout(); }}
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
}

export default Topbar;