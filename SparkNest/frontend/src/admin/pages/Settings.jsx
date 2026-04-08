import { useState } from "react";

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

  .admin-settings-page {
    font-family: 'DM Sans', sans-serif;
    padding: 28px 28px 48px;
    background: var(--spark-surface);
    min-height: 100%;
  }

  .admin-settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 8px;
  }

  .admin-settings-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 4px;
    letter-spacing: -0.4px;
  }

  .admin-settings-subtitle {
    font-size: 13px;
    color: var(--spark-muted);
    margin: 0;
  }

  .section-divider {
    width: 36px; height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 24px;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 24px;
    max-width: 1000px;
  }

  .setting-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    padding: 28px;
  }

  .setting-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .setting-card-desc {
    font-size: 13px;
    color: var(--spark-muted);
    line-height: 1.55;
    margin: 0 0 24px;
  }

  .s-field { margin-bottom: 20px; }

  .s-label {
    display: block;
    font-size: 11.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--spark-muted);
    margin-bottom: 8px;
  }

  .s-input, .s-textarea, .s-select {
    width: 100%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .s-input:focus, .s-textarea:focus, .s-select:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .s-input::placeholder { color: #BEBDBA; }
  .s-textarea { resize: vertical; min-height: 100px; line-height: 1.55; }

  .toggle-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
    margin: 0;
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    background: var(--spark-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-switch.active {
    background: var(--spark-success-soft);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .toggle-switch.active .toggle-knob {
    transform: translateX(24px);
  }

  .logo-upload {
    border: 2px dashed var(--spark-border);
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    background: var(--spark-surface);
  }

  .logo-upload:hover,
  .logo-upload.dragover {
    border-color: var(--spark-coral);
    background: var(--spark-coral-soft);
  }

  .logo-upload-icon {
    font-size: 36px;
    color: var(--spark-muted);
    margin-bottom: 12px;
  }

  .logo-upload-text {
    font-size: 14px;
    color: var(--spark-ink);
    font-weight: 500;
    margin-bottom: 4px;
  }

  .logo-upload-sub {
    font-size: 13px;
    color: var(--spark-muted);
  }

  .logo-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding: 16px;
    background: var(--spark-surface);
    border-radius: 12px;
  }

  .logo-preview-img {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid var(--spark-border);
  }

  .save-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: var(--spark-ink);
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s;
  }
  .save-btn:hover:not(:disabled) { opacity: 0.9; }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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
    box-shadow: 0 8px 28px rgba(26,26,46,0.22);
    z-index: 300;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
  }
  .settings-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

  @media (max-width: 768px) {
    .admin-settings-page { margin-left: 0; padding: 20px 20px 40px; }
    .settings-grid { grid-template-columns: 1fr; }
  }
`;

export default function Settings() {
  const [siteName, setSiteName] = useState("SparkNest");
  const [logoPreview, setLogoPreview] = useState(null);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      showToast("✅ Logo uploaded successfully");
    }
  };

  const handleSaveSiteName = () => {
    showToast("✅ Site name updated");
  };

  const handleSavePrivacy = () => {
    showToast("✅ Privacy settings updated");
  };

  return (
    <>
      <style>{settingsStyles}</style>

      <div className="admin-settings-page">
        <div className="admin-settings-header">
          <div>
            <h1 className="admin-settings-title">Settings</h1>
            <p className="admin-settings-subtitle">Configure platform appearance and privacy.</p>
          </div>
        </div>
        <div className="section-divider" />

        <div className="settings-grid">
          <div className="setting-card">
            <h3 className="setting-card-title">
              🏷️ Site Identity
            </h3>
            <p className="setting-card-desc">
              Set your platform's name and logo that appears across the entire application.
            </p>

            <div className="s-field">
              <label className="s-label">Site Name</label>
              <input
                className="s-input"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Enter site name"
              />
            </div>

            <div className="s-field">
              <label className="s-label">Logo</label>
              <div className="logo-upload" onClick={() => document.getElementById('logo-upload').click()}>
                <div className="logo-upload-icon">🖼️</div>
                <div className="logo-upload-text">Click to upload logo</div>
                <div className="logo-upload-sub">
                  PNG, JPG or SVG (max 2MB)
                </div>
                {logoPreview && (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Logo preview" className="logo-preview-img" />
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--spark-ink)', marginBottom: '4px' }}>Preview</div>
                      <button 
                        className="save-btn" 
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                        onClick={(e) => { e.stopPropagation(); showToast("✅ Logo saved"); }}
                      >
                        Save Logo
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
            </div>

            <button className="save-btn" onClick={handleSaveSiteName}>
              💾 Save Site Identity
            </button>
          </div>

          <div className="setting-card">
            <h3 className="setting-card-title">
              🔒 Privacy & Moderation
            </h3>
            <p className="setting-card-desc">
              Control user privacy settings and content moderation preferences.
            </p>

            <div className="s-field">
              <label className="s-label">Privacy Mode</label>
              <div className="toggle-group">
                <span className="toggle-label">Enable user privacy controls</span>
                <div 
                  className={`toggle-switch ${privacyEnabled ? 'active' : ''}`}
                  onClick={() => setPrivacyEnabled(!privacyEnabled)}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>

            <div className="s-field">
              <label className="s-label">Auto-Moderation Level</label>
              <select className="s-select">
                <option>Strict</option>
                <option>Moderate</option>
                <option>Relaxed</option>
              </select>
            </div>

            <div className="s-field">
              <label className="s-label">Custom Moderation Rules</label>
              <textarea
                className="s-textarea"
                placeholder="Enter custom moderation keywords or rules..."
                defaultValue="• No hate speech
                - No spam links
                - No illegal content"
              />
            </div>

            <button className="save-btn" onClick={handleSavePrivacy}>
              💾 Save Privacy Settings
            </button>
          </div>
        </div>
      </div>
      <div className={`settings-toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}