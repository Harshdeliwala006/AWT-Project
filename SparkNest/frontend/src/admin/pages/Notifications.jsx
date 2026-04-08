// Notifications.jsx
import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import axios from "axios";
import './../Notifications.css';
import './../Admin.css';

const TYPE_OPTIONS = [
  { key: "announcement", icon: "📣", label: "Announcement", bg: "#E6F1FB", color: "#378ADD" },
  { key: "alert", icon: "⚠️", label: "Alert", bg: "#FAEEDA", color: "#EF9F27" },
  { key: "update", icon: "🔔", label: "Update", bg: "#E1F5EE", color: "#1D9E75" },
  { key: "promo", icon: "🎉", label: "Promotion", bg: "#FFE8E8", color: "#FF6B6B" },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "new", label: "New Users (< 7 days)" },
  { value: "active", label: "Active Users" },
  { value: "inactive", label: "Inactive Users (> 30 days)" },
];

const MSG_LIMIT = 200;

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [audience, setAudience] = useState("all");
  const [sentNotifications, setSentNotifications] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalReach: 0, unread: 0 });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [allNotificationsRes, unreadRes] = await Promise.all([
        axios.get(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1000 } // Get more for stats
        }),
        axios.get(`${API_BASE}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allNotifications = allNotificationsRes.data.notifications || [];
      const recentNotifications = allNotifications.slice(0, 10);
      
      setSentNotifications(recentNotifications);
      setStats({
        totalSent: allNotifications.length,
        totalReach: allNotifications.length,
        unread: unreadRes.data.count || 0
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setToast({ message: 'Failed to load notifications', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const selectedType = TYPE_OPTIONS.find(t => t.key === type);
  const canSend = title.trim() && message.trim() && message.length <= MSG_LIMIT;

  const handleSend = async () => {
    if (!canSend || !token) return;

    try {
      setFormLoading(true);
      
      await axios.post(`${API_BASE}/notifications`, {
        recipient: null,
        sender: null,
        type: 'admin-' + type,
        text: `${title}: ${message}`,
        isAdmin: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTitle("");
      setMessage("");
      
      await fetchNotifications();
      
      showToast('✅ Notification sent successfully!', 'success');
    } catch (error) {
      console.error('Send error:', error);
      showToast(error.response?.data?.error || 'Failed to send notification', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return 'Last month';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="admin-notif-page">
        <div className="admin-notif-header">
          <div>
            <div className="loading-skeleton" style={{ width: '220px', height: '28px' }}></div>
            <div className="loading-skeleton" style={{ width: '280px', height: '16px', marginTop: '8px' }}></div>
          </div>
        </div>
        <div className="section-divider"></div>
        
        <div className="notif-stats">
          {Array(3).fill().map((_, i) => (
            <div key={i} className="loading-skeleton notif-stat-item" style={{ height: '70px' }}></div>
          ))}
        </div>
        
        <div className="admin-notif-layout">
          <div className="admin-notif-card" style={{ height: '400px' }}>
            <div className="loading-skeleton" style={{ width: '150px', height: '20px' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="loading-skeleton admin-notif-card" style={{ height: '180px' }}></div>
            <div className="loading-skeleton admin-notif-card" style={{ height: '200px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notif-page">
      <div className="admin-notif-header">
        <div>
          <h1 className="admin-notif-title">Notifications</h1>
          <p className="admin-notif-subtitle">
            Manage system notifications • {stats.totalSent.toLocaleString()} sent
          </p>
        </div>
        <button 
          onClick={fetchNotifications}
          className="an-submit-btn"
          style={{ 
            width: 'auto', 
            padding: '10px 20px', 
            fontSize: '13px',
            background: 'var(--spark-surface)',
            color: 'var(--spark-ink)',
            border: '1px solid var(--spark-border)'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="section-divider" />
      <div className="notif-stats">
        {[
          { label: "Total Sent", value: stats.totalSent.toLocaleString() },
          { label: "Unread", value: stats.unread.toLocaleString() },
          { label: "Recent", value: sentNotifications.length.toString() },
        ].map(({ label, value }, i) => (
          <div className="notif-stat-item" key={label}>
            <p className="notif-stat-value">{value}</p>
            <p className="notif-stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="admin-notif-layout">
        <div className="admin-notif-card">
          <p className="admin-notif-card-title">Send New Notification</p>
          <p className="admin-notif-card-sub">
            Target specific user groups with custom messages
          </p>
          <div className="an-field">
            <label className="an-label">Type</label>
            <div className="an-type-grid">
              {TYPE_OPTIONS.map((t) => (
                <div
                  key={t.key}
                  className={`an-type-chip ${type === t.key ? "selected" : ""}`}
                  onClick={() => setType(t.key)}
                >
                  <div 
                    className="an-type-icon" 
                    style={{ 
                      background: type === t.key ? t.color + '20' : t.bg 
                    }}
                  >
                    {t.icon}
                  </div>
                  <span className="an-type-label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="an-field">
            <label className="an-label">Audience</label>
            <select
              className="an-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="an-field">
            <label className="an-label">Title</label>
            <input
              className="an-input"
              placeholder="e.g. New feature available!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
            <p className="an-char-count">{title.length}/80</p>
          </div>
          <div className="an-field">
            <label className="an-label">Message</label>
            <textarea
              className="an-textarea"
              placeholder="Enter your notification message (max 200 chars)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MSG_LIMIT}
            />
            <p className={`an-char-count ${message.length > MSG_LIMIT ? "over" : ""}`}>
              {message.length}/{MSG_LIMIT}
            </p>
          </div>

          <button
            className="an-submit-btn"
            onClick={handleSend}
            disabled={!canSend || formLoading}
          >
            {formLoading ? "⏳ Sending..." : `📤 Send to ${AUDIENCE_OPTIONS.find(a => a.value === audience)?.label}`}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="admin-notif-card">
            <p className="admin-notif-card-title">Live Preview</p>
            <p className="admin-notif-card-sub">How users will see it</p>
            <div className="an-preview">
              <p className="an-preview-label">Notification Preview</p>
              <div className="an-preview-notif">
                <div 
                  className="an-preview-icon" 
                  style={{ backgroundColor: selectedType?.bg }}
                >
                  {selectedType?.icon}
                </div>
                <div>
                  <p className="an-preview-title">
                    {title || "Notification Title"}
                  </p>
                  <p className="an-preview-body">
                    {message || "Your message appears here..."}
                  </p>
                  <p className="an-preview-time">
                    Just now • SparkNest Admin
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-notif-card">
            <p className="admin-notif-card-title">Recent Activity</p>
            <p className="admin-notif-card-sub">
              {sentNotifications.length} recent notifications
            </p>
            <div className="sent-log">
              {sentNotifications.length > 0 ? sentNotifications.map((notif, i) => (
                <div className="sent-item" key={notif._id || i}>
                  <div 
                    className="sent-item-icon" 
                    style={{ 
                      backgroundColor: TYPE_OPTIONS.find(t => 
                        notif.type?.includes(t.key)
                      )?.bg || '#E6F1FB' 
                    }}
                  >
                    {TYPE_OPTIONS.find(t => notif.type?.includes(t.key))?.icon || '🔔'}
                  </div>
                  <div className="sent-item-info">
                    <p className="sent-item-title">{notif.text || notif.title || 'Notification'}</p>
                    <div className="sent-item-meta">
                      <span className="sent-item-badge">
                        {notif.type?.split('-')[0]?.toUpperCase() || 'SYSTEM'}
                      </span>
                      <span>{formatDate(notif.createdAt)}</span>
                      {notif.recipient && (
                        <span>👤 {notif.recipient?.name || 'User'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <div style={{ fontSize: '32px', opacity: 0.5, marginBottom: '12px' }}>🔔</div>
                  <p style={{ fontSize: '13px', color: 'var(--spark-muted)', margin: 0 }}>
                    No recent notifications
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast.message && (
        <div className={`an-toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}