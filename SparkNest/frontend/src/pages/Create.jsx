import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const createStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
    --spark-radius: 18px;
    --spark-shadow-hover: 0 12px 40px rgba(26,26,46,0.13);
  }

  .create-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .create-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--spark-coral);
    margin-bottom: 10px;
  }

  .create-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 8px;
    letter-spacing: -0.5px;
    text-align: center;
  }

  .create-subtitle {
    font-size: 14px;
    color: var(--spark-muted);
    margin: 0 0 48px;
    text-align: center;
  }

  .create-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;
    max-width: 540px;
  }

  @media (min-width: 640px) {
    .create-grid { grid-template-columns: repeat(4, 1fr); max-width: 780px; }
  }

  .create-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 32px 16px 28px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    text-decoration: none;
    color: var(--spark-ink);
    transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.2s;
    position: relative;
    overflow: hidden;
  }

  .create-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--card-accent, var(--spark-coral-soft));
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: var(--spark-radius);
  }

  .create-card:hover {
    box-shadow: var(--spark-shadow-hover);
    transform: translateY(-4px);
    border-color: transparent;
  }

  .create-card:hover::before { opacity: 1; }

  .create-card-icon-wrap {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    background: var(--icon-bg, var(--spark-coral-soft));
    transition: transform 0.2s;
    position: relative;
    z-index: 1;
  }
  .create-card:hover .create-card-icon-wrap { transform: scale(1.1); }

  .create-card-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
    position: relative;
    z-index: 1;
    margin: 0;
  }

  .create-card-desc {
    font-size: 12px;
    color: var(--spark-muted);
    text-align: center;
    line-height: 1.4;
    position: relative;
    z-index: 1;
    margin: 0;
  }

  .create-card-arrow {
    font-size: 16px;
    color: var(--spark-muted);
    position: relative;
    z-index: 1;
    transition: transform 0.15s, color 0.15s;
  }
  .create-card:hover .create-card-arrow {
    transform: translateX(3px);
    color: var(--spark-coral);
  }
`;

const CREATE_ITEMS = [
  {
    to: "/create/post",
    icon: "✏️",
    label: "Post",
    desc: "Share thoughts & captions",
    iconBg: "#FFE8E8",
    accent: "#FFF5F5",
  },
  {
    to: "/create/image",
    icon: "🖼️", 
    label: "Image",
    desc: "Upload a photo or artwork",
    iconBg: "#E1F5EE",
    accent: "#F0FAF5",
  },
  {
    to: "/create/reel",
    icon: "🎬",
    label: "Reel",
    desc: "Post a short video clip",
    iconBg: "#F0EDFE",
    accent: "#F8F6FF",
  },
  {
    to: "/create/board",
    icon: "📌",
    label: "Board",
    desc: "Curate a collection of posts",
    iconBg: "#E6F1FB",
    accent: "#F3F8FE",
  },
];

function Create() {
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <>
        <style>{createStyles}</style>
        <div className="create-page">
          <div className="create-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{createStyles}</style>
      <div className="create-page">
        <p className="create-eyebrow">What's on your mind?</p>
        <h1 className="create-title">Create something new</h1>
        <p className="create-subtitle">Choose a format to get started.</p>

        <div className="create-grid">
          {CREATE_ITEMS.map(({ to, icon, label, desc, iconBg, accent }) => (
            <Link
              key={to}
              to={to}
              className="create-card"
              style={{ 
                "--card-accent": accent, 
                "--icon-bg": iconBg 
              }}
            >
              <div className="create-card-icon-wrap" style={{ backgroundColor: iconBg }}>
                {icon}
              </div>
              <p className="create-card-label">{label}</p>
              <p className="create-card-desc">{desc}</p>
              <span className="create-card-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Create;