import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api"; // Your API service

const settingsStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
    --spark-radius: 18px;
  }

  .settings-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 660px;
    margin: 0 auto;
    padding: 36px 24px;
  }

  /* Header */
  .settings-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 8px;
    letter-spacing: -0.4px;
  }

  .section-divider {
    width: 36px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 28px;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .settings-save-all {
    padding: 10px 18px;
    border-radius: 30px;
    border: none;
    background: var(--spark-ink);
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .settings-save-all:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  .settings-save-all:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .settings-edit-btn,
  .settings-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--spark-coral);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    margin-top: 12px;
  }
  .settings-edit-btn:hover,
  .settings-link:hover {
    text-decoration: underline;
  }

  .settings-empty {
    text-align: center;
    padding: 60px 24px;
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    background: var(--spark-white);
  }

  .settings-empty-icon {
    font-size: 36px;
    margin-bottom: 14px;
  }

  .settings-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: var(--spark-ink);
    margin-bottom: 8px;
  }

  .settings-login-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 18px;
    padding: 10px 18px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    background: transparent;
    color: var(--spark-ink);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
  }
  .settings-login-btn:hover {
    background: var(--spark-surface);
    border-color: #d5d5d5;
  }

  .password-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .blocked-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .blocked-empty {
    color: var(--spark-muted);
    margin: 0;
  }

  .danger-description {
    color: #5F2120;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .danger-subtext {
    color: #7A2E2E;
  }

  .settings-row-icon {
    min-width: 36px;
  }

  .settings-card {
    box-shadow: 0 8px 24px rgba(26,26,46,0.05);
  }

  .settings-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .settings-toast {
    opacity: 0;
    pointer-events: none;
  }

  /* Group label */
  .settings-group-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--spark-muted);
    margin: 0 0 8px 4px;
  }

  /* Card */
  .settings-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    overflow: hidden;
    margin-bottom: 12px;
  }

  /* Accordion row */
  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid var(--spark-border);
    gap: 12px;
    user-select: none;
  }
  .settings-row:last-child { border-bottom: none; }
  .settings-row:hover { background: var(--spark-surface); }
  .settings-row.open { background: var(--spark-surface); }

  .settings-row-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .settings-row-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    flex-shrink: 0;
  }

  .settings-row-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
  }

  .settings-row-sub {
    font-size: 12px;
    color: var(--spark-muted);
    margin-top: 1px;
  }

  .settings-chevron {
    font-size: 12px;
    color: var(--spark-muted);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .settings-chevron.open { transform: rotate(180deg); }

  /* Panel */
  .settings-panel {
    border-top: 1px solid var(--spark-border);
    padding: 20px;
    background: var(--spark-surface);
  }

  /* Input */
  .settings-label {
    display: block;
    font-size: 11.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--spark-muted);
    margin-bottom: 6px;
    margin-top: 14px;
  }
  .settings-label:first-child { margin-top: 0; }

  .settings-input {
    width: 100%;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .settings-input:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .settings-input::placeholder { color: #BEBDBA; }

  /* Save button */
  .settings-save-btn {
    margin-top: 16px;
    padding: 10px 20px;
    border-radius: 30px;
    border: none;
    background: var(--spark-ink);
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .settings-save-btn:hover { opacity: 0.82; }

  /* Toggle row */
  .settings-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--spark-border);
  }
  .settings-toggle-row:last-child { border-bottom: none; }

  .settings-toggle-label { font-size: 13.5px; color: var(--spark-ink); font-weight: 500; }
  .settings-toggle-desc  { font-size: 12px; color: var(--spark-muted); margin-top: 2px; }

  .s-toggle {
    width: 42px; height: 24px;
    border-radius: 30px;
    background: var(--spark-border);
    position: relative;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .s-toggle.on { background: var(--spark-ink); }
  .s-toggle-thumb {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px; left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  }
  .s-toggle.on .s-toggle-thumb { transform: translateX(18px); }

  /* Help links */
  .help-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 0;
    text-decoration: none;
    color: var(--spark-ink);
    font-size: 13.5px;
    border-bottom: 1px solid var(--spark-border);
    transition: color 0.15s;
  }
  .help-link:last-child { border-bottom: none; }
  .help-link:hover { color: var(--spark-coral); }
  .help-link-arrow { font-size: 12px; color: var(--spark-muted); transition: transform 0.15s; }
  .help-link:hover .help-link-arrow { transform: translateX(3px); color: var(--spark-coral); }

  /* Info row */
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--spark-border);
    font-size: 13.5px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: var(--spark-muted); }
  .info-value { color: var(--spark-ink); font-weight: 500; }
  .info-edit  { color: var(--spark-coral); font-size: 12.5px; font-weight: 500; text-decoration: none; cursor: pointer; }
  .info-edit:hover { text-decoration: underline; }

  /* Danger zone */
  .settings-danger-btn {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #F7C1C1;
    background: #FCEBEB;
    color: #A32D2D;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .settings-danger-btn:hover { background: #F7C1C1; border-color: #E24B4A; }

  /* Toast */
  .settings-toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--spark-ink);
    color: white;
    padding: 11px 20px;
    border-radius: 30px;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 28px rgba(26,26,46,0.22);
    z-index: 300;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
    opacity: 0;
    pointer-events: none;
  }
  .settings-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
`;

function Toggle({ on, onToggle }) {
  return (
    <button 
      className={`s-toggle${on ? " on" : ""}`} 
      onClick={onToggle} 
      type="button"
      aria-label={on ? "Turn off" : "Turn on"}
    >
      <div className="s-toggle-thumb" />
    </button>
  );
}

function Accordion({ id, open, icon, iconBg, label, sub, onToggle, children, danger }) {
  const isOpen = open === id;
  return (
    <div>
      <div
        className={`settings-row${isOpen ? " open" : ""}`}
        onClick={() => onToggle(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle(id)}
      >
        <div className="settings-row-left">
          <div className="settings-row-icon" style={{ background: iconBg || "var(--spark-surface)" }}>
            {icon}
          </div>
          <div>
            <p className="settings-row-label" style={danger ? { color: "#A32D2D" } : {}}>
              {label}
            </p>
            {sub && <p className="settings-row-sub">{sub}</p>}
          </div>
        </div>
        <span className={`settings-chevron${isOpen ? " open" : ""}`} aria-hidden="true">▼</span>
      </div>
      {isOpen && <div className="settings-panel">{children}</div>}
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  
  // User preferences from backend
  const [notifs, setNotifs] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true
  });
  const [privacy, setPrivacy] = useState({
    privateAccount: false,
    showActivity: true,
    allowDirectMessages: true
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user preferences on mount
  useEffect(() => {
    if (user?.preferences) {
      setNotifs(user.preferences.notifications || notifs);
      setPrivacy(user.preferences.privacy || privacy);
    }
  }, [user]);

  const toggle = (section) => setOpen(open === section ? null : section);

  const showToast = (msg, type = "success") => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Save preferences
  const savePreferences = async () => {
    try {
      setSaving(true);
      
      const preferences = {
        notifications: notifs,
        privacy: privacy
      };
      
      await usersAPI.updatePreferences(preferences);
      
      // Update context
      updateUser({ ...user, preferences });
      
      showToast("✓ Preferences saved!");
    } catch (error) {
      console.error('Save preferences failed:', error);
      showToast("Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleSavePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      showToast("⚠ Passwords don't match or are empty", "error");
      return;
    }
    
    if (newPassword.length < 6) {
      showToast("⚠ Password must be at least 6 characters", "error");
      return;
    }

    try {
      await usersAPI.changePassword(newPassword);
      showToast("✓ Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Password change failed:', error);
      showToast(error.message || "Failed to update password", "error");
    }
  };

  if (!user) {
    return (
      <>
        <style>{settingsStyles}</style>
        <div className="settings-page">
          <div className="settings-empty">
            <div className="settings-empty-icon">🔧</div>
            <p className="settings-empty-title">Log in to access settings</p>
            <Link to="/login" className="settings-login-btn">Go to Login</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{settingsStyles}</style>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <button 
            className="settings-save-all" 
            onClick={savePreferences}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save all changes"}
          </button>
        </div>
        <div className="section-divider" />

        {/* Account group */}
        <p className="settings-group-label">Account</p>
        <div className="settings-card">
          <Accordion
            id="account"
            open={open}
            onToggle={toggle}
            icon="👤"
            iconBg="#E1F5EE"
            label="Profile Information"
            sub={`${user.name} · ${user.email}`}
          >
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member since</span>
              <span className="info-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Username</span>
              <span className="info-value">
                @{user.username || user.name.toLowerCase().replace(/\s+/g, '')}
              </span>
            </div>
            <Link to="/profile" className="settings-edit-btn">
              Edit Profile →
            </Link>
          </Accordion>

          <Accordion
            id="security"
            open={open}
            onToggle={toggle}
            icon="🔒"
            iconBg="#F0EDFE"
            label="Change Password"
            sub="Update your account password"
          >
            <div className="password-section">
              <label className="settings-label">New password</label>
              <input
                className="settings-input"
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              
              <label className="settings-label">Confirm password</label>
              <input
                className="settings-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <button 
                className="settings-save-btn" 
                onClick={handleSavePassword}
                disabled={!newPassword || newPassword !== confirmPassword}
              >
                Update Password
              </button>
            </div>
          </Accordion>
        </div>

        {/* Preferences group */}
        <p className="settings-group-label" style={{ marginTop: 32 }}>Preferences</p>
        <div className="settings-card">
          <Accordion
            id="notifications"
            open={open}
            onToggle={toggle}
            icon="🔔"
            iconBg="#E6F1FB"
            label="Push Notifications"
            sub="Choose notification preferences"
          >
            {[
              { key: "likes", label: "Post likes", desc: "When someone likes your post" },
              { key: "comments", label: "Post comments", desc: "When someone comments on your post" },
              { key: "follows", label: "New followers", desc: "When someone follows you" },
              { key: "messages", label: "Direct messages", desc: "New messages in chat" },
              { key: "reels", label: "Reel interactions", desc: "Likes/comments on your reels" },
              { key: "boards", label: "Board saves", desc: "When someone saves your board" }
            ].map(({ key, label, desc }) => (
              <div className="settings-toggle-row" key={key}>
                <div>
                  <p className="settings-toggle-label">{label}</p>
                  <p className="settings-toggle-desc">{desc}</p>
                </div>
                <Toggle 
                  on={notifs[key]} 
                  onToggle={() => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))} 
                />
              </div>
            ))}
          </Accordion>

          <Accordion
            id="privacy"
            open={open}
            onToggle={toggle}
            icon="🛡️"
            iconBg="#E1F5EE"
            label="Privacy & Safety"
            sub="Control your account visibility"
          >
            {[
              { 
                key: "privateAccount", 
                label: "Private account", 
                desc: "Only approved followers can see your posts and reels" 
              },
              { 
                key: "showActivity", 
                label: "Show activity publicly", 
                desc: "Display when you're online" 
              },
              { 
                key: "allowDirectMessages", 
                label: "Allow direct messages", 
                desc: "Receive DMs from everyone (not just followers)" 
              },
              { 
                key: "profileDiscoverable", 
                label: "Profile discoverable", 
                desc: "Allow your profile to appear in search results" 
              }
            ].map(({ key, label, desc }) => (
              <div className="settings-toggle-row" key={key}>
                <div>
                  <p className="settings-toggle-label">{label}</p>
                  <p className="settings-toggle-desc">{desc}</p>
                </div>
                <Toggle 
                  on={privacy[key]} 
                  onToggle={() => setPrivacy(prev => ({ ...prev, [key]: !prev[key] }))} 
                />
              </div>
            ))}
          </Accordion>

          <Accordion
            id="blocked"
            open={open}
            onToggle={toggle}
            icon="🚫"
            iconBg="#FFE8E8"
            label="Blocked & Restricted"
            sub="Manage blocked accounts"
          >
            <div className="blocked-section">
              <p className="blocked-empty">
                You haven't blocked anyone yet.
              </p>
              <Link to="/blocked" className="settings-link">
                Manage blocked accounts →
              </Link>
            </div>
          </Accordion>
        </div>

        {/* Support group */}
        <p className="settings-group-label" style={{ marginTop: 32 }}>Support</p>
        <div className="settings-card">
          <Accordion
            id="help"
            open={open}
            onToggle={toggle}
            icon="💬"
            iconBg="#FAEEDA"
            label="Help & Support"
            sub="Get assistance and report issues"
          >
            <div className="help-links">
              <Link to="/help" className="help-link">
                FAQs → 
              </Link>
              <Link to="/contact" className="help-link">
                Contact Support →
              </Link>
              <Link to="/report" className="help-link">
                Report a Problem →
              </Link>
            </div>
          </Accordion>
        </div>

        {/* Danger zone */}
        <p className="settings-group-label danger" style={{ marginTop: 32 }}>
          Danger zone
        </p>
        <div className="settings-card">
          <Accordion
            id="logout"
            open={open}
            onToggle={toggle}
            icon="🚪"
            iconBg="#FCEBEB"
            label="Log out"
            sub="Sign out of your SparkNest account"
            danger
          >
            <div className="danger-section">
              <p className="danger-description">
                You will need to log back in to access SparkNest. Your data will remain safe.
              </p>
              <button className="settings-danger-btn" onClick={logout}>
                🚪 Log out @{(user.name || "").toLowerCase().replace(/\s+/g, '')}
              </button>
            </div>
          </Accordion>

          <Accordion
            id="delete"
            open={open}
            onToggle={toggle}
            icon="🗑️"
            iconBg="#F8D7DA"
            label="Delete account"
            sub="Permanently delete your account"
            danger
          >
            <div className="danger-section">
              <p className="danger-description">
                This action cannot be undone. All your posts, reels, boards, and data will be permanently removed.
              </p>
              <button className="settings-danger-btn delete" disabled>
                ⚠️ Permanently delete account
              </button>
              <p className="danger-subtext" style={{ fontSize: 12, marginTop: 8 }}>
                <Link to="/delete-account" style={{ color: "#A32D2D" }}>Learn more</Link>
              </p>
            </div>
          </Accordion>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`settings-toast${toast ? " show" : ""}`}>
          {toast}
        </div>
      )}
    </>
  );
}