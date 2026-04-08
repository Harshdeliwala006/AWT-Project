import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { useAuth } from "../../context/AuthContext";

const sidebarStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
  }

  .admin-sidebar {
    font-family: 'DM Sans', sans-serif;
    width: 240px;
    flex-shrink: 0;
    background: var(--spark-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0;
  }

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-logo-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--spark-coral);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .sidebar-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    letter-spacing: -0.3px;
  }
  .sidebar-logo-text span { color: var(--spark-coral); }

  .sidebar-admin-pill {
    font-size: 10px;
    font-weight: 600;
    background: rgba(255,107,107,0.2);
    color: var(--spark-coral);
    border-radius: 30px;
    padding: 2px 8px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-left: auto;
  }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.3);
    padding: 12px 10px 6px;
    margin-top: 4px;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 12px;
    text-decoration: none;
    color: rgba(255,255,255,0.55);
    font-size: 13.5px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    position: relative;
  }
  .sidebar-link:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.9);
  }
  .sidebar-link.active {
    background: rgba(255,107,107,0.15);
    color: var(--spark-coral);
  }

  .sidebar-link-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    background: rgba(255,255,255,0.06);
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .sidebar-link:hover .sidebar-link-icon { background: rgba(255,255,255,0.1); }
  .sidebar-link.active .sidebar-link-icon { background: rgba(255,107,107,0.2); }

  .sidebar-badge {
    margin-left: auto;
    min-width: 18px;
    height: 18px;
    border-radius: 30px;
    background: var(--spark-coral);
    color: white;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }

  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255,107,107,0.25);
    color: var(--spark-coral);
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-user-info { flex: 1; min-width: 0; }
  .sidebar-user-name {
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sidebar-user-role {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
  }

  .sidebar-logout-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.35);
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sidebar-logout-btn:hover { color: #E24B4A; background: rgba(226,75,74,0.12); }
`;

const NAV_ITEMS = [
  {
    group: "Overview",
    links: [
      { to: "/admin/",          icon: "📊", label: "Dashboard" },
      { to: "/admin/analytics", icon: "📈", label: "Analytics" },
    ],
  },
  {
    group: "Content",
    links: [
      { to: "/admin/posts",  icon: "📝", label: "Posts" },
      { to: "/admin/reels",  icon: "🎬", label: "Reels" },
    ],
  },
  {
    group: "Community",
    links: [
      { to: "/admin/users",         icon: "👥", label: "Users" },
      { to: "/admin/reports",       icon: "🚩", label: "Reports",       badge: 3 },
      { to: "/admin/notifications", icon: "🔔", label: "Notifications", badge: 12 },
    ],
  },
  {
    group: "System",
    links: [
      { to: "/admin/settings", icon: "⚙", label: "Settings" },
    ],
  },
];

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (to) => {
    if (to === "/admin/") return location.pathname === "/admin" || location.pathname === "/admin/";
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <style>{sidebarStyles}</style>

      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-badge">✦</div>
          <Link to="/" className="sidebar-logo-text">
            Spark<span>Nest</span>
          </Link>
          <span className="sidebar-admin-pill">Admin</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ group, links }) => (
            <div key={group}>
              <p className="sidebar-section-label">{group}</p>
              {links.map(({ to, icon, label, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={`sidebar-link${isActive(to) ? " active" : ""}`}
                >
                  <div className="sidebar-link-icon">{icon}</div>
                  {label}
                  {badge && <span className="sidebar-badge">{badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name || "Admin")}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || "Admin"}</p>
            <p className="sidebar-user-role">Administrator</p>
          </div>
          <button className="sidebar-logout-btn" onClick={logout} title="Log out">
            ⏻
          </button>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;